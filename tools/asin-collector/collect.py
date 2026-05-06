#!/usr/bin/env python3
"""ASIN collector driver.

Walks vendor sites for "Buy on Amazon" links, fuzzy-matches the vendor's
product name to a kb.json entity, and writes
verticals/smart-home/affiliates.json `products[<sku>] = {merchant, asin}`.

Idempotent. Won't touch entries it didn't change.

Hard rule: never fetch amazon.com directly — only vendor sites.
"""
from __future__ import annotations

import argparse
import importlib
import sys
from collections import defaultdict
from pathlib import Path

# Importable when running as a script.
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from lib import (  # noqa: E402
    AFFILIATES_PATH,
    MatchResult,
    ProductHit,
    best_kb_match,
    load_affiliates,
    load_kb,
    write_affiliates,
)

# Order matters: we run extractors in this order.
DEFAULT_VENDORS = ["aqara", "tapo", "kasa"]


def run_vendor(name: str, *, cache: bool) -> list[ProductHit]:
    mod = importlib.import_module(f"vendors.{name}")
    discover = getattr(mod, "discover", None)
    if discover is None:
        print(f"vendor {name}: no discover() — skipping")
        return []
    print(f"=== vendor: {name} ===")
    hits: list[ProductHit] = list(discover(cache=cache))
    print(f"  {name}: {len(hits)} hits")
    return hits


def match_hits(
    hits: list[ProductHit], kb_entities: list[dict], *, threshold: float
) -> list[MatchResult]:
    out: list[MatchResult] = []
    for h in hits:
        ent, score = best_kb_match(
            h.vendor_name,
            kb_entities,
            brand=h.brand,
            extra_text=h.vendor_url,
        )
        if ent is None:
            out.append(MatchResult(h, None, None, None, 0.0, "no_match"))
            continue
        status = "matched" if score >= threshold else "low_conf"
        out.append(
            MatchResult(
                h,
                ent.get("sku"),
                ent.get("id"),
                ent.get("name"),
                score,
                status,
            )
        )
    return out


def merge_into_affiliates(
    affiliates: dict, results: list[MatchResult]
) -> tuple[int, int, int]:
    """Mutates affiliates['products']. Returns (added, updated, skipped)."""
    products = affiliates.setdefault("products", {})
    added = updated = skipped = 0
    seen_sku: set[str] = set()
    # Sort matched hits by score desc so the best match wins SKU collisions
    matched = sorted(
        (r for r in results if r.status == "matched" and r.kb_sku),
        key=lambda r: -r.score,
    )
    for r in matched:
        sku = r.kb_sku
        if sku in seen_sku:
            continue
        seen_sku.add(sku)
        existing = products.get(sku)
        new_entry = {
            "merchant": "amazon_associates",
            "asin": r.hit.asin,
        }
        if existing == new_entry:
            skipped += 1
            continue
        if existing is None:
            products[sku] = new_entry
            added += 1
        else:
            # Preserve unrelated keys, but update merchant/asin.
            merged = dict(existing)
            merged.update(new_entry)
            if merged == existing:
                skipped += 1
            else:
                products[sku] = merged
                updated += 1
    return added, updated, skipped


def report_brand(name: str, results: list[MatchResult]) -> None:
    by = defaultdict(list)
    for r in results:
        by[r.status].append(r)
    n = len(results)
    print(
        f"  {name}: {len(by['matched'])}/{n} matched, "
        f"{len(by['low_conf'])} low-confidence, "
        f"{len(by['no_match'])} unmapped"
    )
    for r in by["low_conf"]:
        print(
            f"    low_conf {r.score:.2f} | {r.hit.asin} {r.hit.vendor_name!r}"
            f"  ~  {r.kb_sku} {r.kb_name!r}"
        )
    for r in by["no_match"]:
        print(
            f"    no_match | {r.hit.asin} {r.hit.vendor_name!r}"
        )


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--brands",
        default=",".join(DEFAULT_VENDORS),
        help="Comma-separated vendor module names",
    )
    ap.add_argument("--threshold", type=float, default=0.85)
    ap.add_argument("--no-cache", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args(argv)

    brands = [b.strip() for b in args.brands.split(",") if b.strip()]
    kb_entities = load_kb()
    print(f"kb entities: {len(kb_entities)}")

    all_results: list[tuple[str, list[MatchResult]]] = []
    total_hits = 0
    for b in brands:
        hits = run_vendor(b, cache=not args.no_cache)
        total_hits += len(hits)
        results = match_hits(hits, kb_entities, threshold=args.threshold)
        all_results.append((b, results))

    print()
    print("=== match summary ===")
    print(f"total hits: {total_hits}")
    for name, results in all_results:
        report_brand(name, results)

    affiliates, original_text = load_affiliates()
    flat_results = [r for _, results in all_results for r in results]
    added, updated, skipped = merge_into_affiliates(affiliates, flat_results)

    print()
    print(
        f"=== affiliates.json: +{added} added, ~{updated} updated, "
        f"={skipped} unchanged ==="
    )

    if args.dry_run:
        print("(dry-run — not writing)")
        return 0

    changed = write_affiliates(affiliates, original_text)
    print(
        f"wrote {AFFILIATES_PATH}: changed={changed}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
