"""Shared helpers for the ASIN collector.

Anti-Amazon-scrape policy: nothing in here may fetch amazon.com directly.
We only fetch vendor sites, then *parse* outbound Amazon links out of their
HTML.
"""
from __future__ import annotations

import hashlib
import json
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
CACHE_DIR = ROOT / "cache"
CACHE_DIR.mkdir(exist_ok=True)

KB_PATH = (
    ROOT.parents[1] / "verticals" / "smart-home" / "kb.json"
)
AFFILIATES_PATH = (
    ROOT.parents[1] / "verticals" / "smart-home" / "affiliates.json"
)

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0"
)

ASIN_RE = re.compile(
    r"""amazon\.[a-z.]+/                  # amazon TLD
        (?:[^\s"'<>]*?/)?                  # optional path noise
        (?:dp|gp/product|gp/aw/d|gp/offer-listing) /
        (B0[A-Z0-9]{8})                   # ASIN
    """,
    re.VERBOSE | re.IGNORECASE,
)

# Some vendors stash ASINs in JSON blobs as "asin": "B0..."
ASIN_JSON_RE = re.compile(r'"asin"\s*:\s*"(B0[A-Z0-9]{8})"', re.IGNORECASE)

# Title scraping
TITLE_RE = re.compile(r"<title[^>]*>([^<]+)</title>", re.IGNORECASE | re.DOTALL)
OG_TITLE_RE = re.compile(
    r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.IGNORECASE | re.DOTALL)


@dataclass
class ProductHit:
    """One vendor page → at most one ASIN + the visible product name."""

    brand: str
    vendor_url: str
    vendor_name: str
    asin: str

    def key(self) -> str:
        return f"{self.brand}::{self.asin}"


@dataclass
class MatchResult:
    """A ProductHit matched against a kb entity."""

    hit: ProductHit
    kb_sku: Optional[str]
    kb_id: Optional[str]
    kb_name: Optional[str]
    score: float
    status: str  # "matched" | "low_conf" | "no_match"


# -----------------------------
# HTTP / scrape
# -----------------------------


def _cache_path(url: str, suffix: str = ".html") -> Path:
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    safe_host = urlparse(url).netloc.replace(":", "_") or "local"
    return CACHE_DIR / f"{safe_host}-{h}{suffix}"


def fetch(
    url: str,
    *,
    backend: str = "lightweight",
    cache: bool = True,
    timeout: int = 30,
) -> str:
    """Fetch a URL and return HTML text. Caches to disk by default.

    backend:
      "raw"         — urllib (sitemaps, robots.txt, plain HTML)
      "lightweight" — cli-anything-scrape lightweight (urllib + trafilatura)
      "marionette"  — drive the persistent claude-browser-profile Firefox
                      directly via cli-anything-firefox driver (the
                      cli-anything-scrape marionette path is flaky / often
                      returns empty)
    """
    cp = _cache_path(url)
    if cache and cp.exists() and cp.stat().st_size > 0:
        return cp.read_text(encoding="utf-8", errors="replace")

    if backend == "raw":
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            html = resp.read().decode("utf-8", errors="replace")
    elif backend == "marionette":
        if shutil.which("cli-anything-firefox") is None:
            raise RuntimeError("cli-anything-firefox not on PATH")
        # Make sure the driver is up
        subprocess.run(
            ["cli-anything-firefox", "driver", "start"],
            capture_output=True, text=True, timeout=60,
        )
        op = subprocess.run(
            ["cli-anything-firefox", "driver", "open", url],
            capture_output=True, text=True, timeout=timeout * 2,
        )
        if op.returncode != 0:
            raise RuntimeError(
                f"firefox open failed {url}: rc={op.returncode} "
                f"stderr={op.stderr[:200]}"
            )
        # Allow JS to settle
        time.sleep(2.0)
        cp_proc = subprocess.run(
            ["cli-anything-firefox", "driver", "content", "--format", "html"],
            capture_output=True, text=True, timeout=timeout * 2,
        )
        if cp_proc.returncode != 0:
            raise RuntimeError(
                f"firefox content failed {url}: rc={cp_proc.returncode}"
            )
        html = cp_proc.stdout or ""
    else:
        if shutil.which("cli-anything-scrape") is None:
            raise RuntimeError(
                "cli-anything-scrape not on PATH; install or use backend=raw"
            )
        cmd = [
            "cli-anything-scrape",
            "scrape",
            url,
            "--backend",
            backend,
            "--format",
            "html",
            "--json",
        ]
        proc = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout * 4
        )
        if proc.returncode != 0:
            raise RuntimeError(
                f"scrape failed for {url}: rc={proc.returncode} "
                f"stderr={proc.stderr[:200]}"
            )
        try:
            payload = json.loads(proc.stdout)
        except json.JSONDecodeError as e:
            raise RuntimeError(
                f"scrape returned non-JSON for {url}: {e}"
            ) from e
        html = payload.get("html") or payload.get("content") or ""

    if cache:
        cp.write_text(html, encoding="utf-8")
    return html


def fetch_sitemap_urls(sitemap_url: str, *, cache: bool = True) -> list[str]:
    """Walk a sitemap (or sitemap-index) and return all <loc> URLs."""
    out: list[str] = []
    seen: set[str] = set()
    queue = [sitemap_url]
    while queue:
        url = queue.pop()
        if url in seen:
            continue
        seen.add(url)
        try:
            xml = fetch(url, backend="raw", cache=cache, timeout=20)
        except (urllib.error.URLError, RuntimeError, TimeoutError) as e:
            print(f"  sitemap fetch failed {url}: {e}", file=sys.stderr)
            continue
        try:
            root = ET.fromstring(xml)
        except ET.ParseError as e:
            print(f"  sitemap parse failed {url}: {e}", file=sys.stderr)
            continue
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        for sm in root.findall("s:sitemap", ns):
            loc = sm.find("s:loc", ns)
            if loc is not None and loc.text:
                queue.append(loc.text.strip())
        for u in root.findall("s:url", ns):
            loc = u.find("s:loc", ns)
            if loc is not None and loc.text:
                out.append(loc.text.strip())
    return out


# -----------------------------
# ASIN extraction
# -----------------------------


def extract_asins(html: str) -> list[str]:
    """All distinct ASINs on the page, preserving first-seen order."""
    seen: list[str] = []
    for m in ASIN_RE.finditer(html):
        a = m.group(1).upper()
        if a not in seen:
            seen.append(a)
    for m in ASIN_JSON_RE.finditer(html):
        a = m.group(1).upper()
        if a not in seen:
            seen.append(a)
    return seen


def extract_title(html: str) -> str:
    """Best-effort visible product name."""
    for rx in (OG_TITLE_RE, H1_RE, TITLE_RE):
        m = rx.search(html)
        if m:
            return _strip_html(m.group(1)).strip()
    return ""


_TAG_RE = re.compile(r"<[^>]+>")


def _strip_html(s: str) -> str:
    s = _TAG_RE.sub("", s)
    return re.sub(r"\s+", " ", s).strip()


def parse_product_page(html: str, url: str) -> Optional[tuple[str, str]]:
    """Default extractor: (vendor_name, asin) or None.

    If the page has multiple ASINs, take the first (vendor product detail
    pages typically link only their own listing; bundle/related links go in
    sidebar widgets later in the DOM).
    """
    asins = extract_asins(html)
    if not asins:
        return None
    title = extract_title(html)
    return title, asins[0]


# -----------------------------
# Fuzzy match
# -----------------------------


_NORMALIZE_RE = re.compile(r"[^a-z0-9 ]+")

# Category nouns. We ask: does the vendor name and the KB entity name share
# the same top-level category word?  If they share AT LEAST ONE *and* don't
# DISAGREE on a category word that's exclusive (e.g. vendor says "motion
# sensor", KB says "door and window sensor"), allow the strong-token uplift.
CATEGORIES = [
    # tuple of equivalent forms
    # Cameras, doorbells, and "pan/tilt"-style codenames are siblings —
    # KB names sometimes lack the literal word "Camera".
    ("camera", "doorbell", "video", "pt"),
    ("hub", "bridge", "gateway", "centralhub"),
    ("lock",),
    ("plug", "outlet", "socket"),
    ("switch", "dimmer"),
    ("bulb", "light", "lamp", "led", "ceiling"),
    ("sensor",),  # generic; refined by qualifier below
    ("strip",),
    ("thermostat", "trv"),
    ("vacuum", "robot"),
    ("module", "relay"),
    ("curtain", "shade", "blind", "roller"),
]

# Within "sensor" we discriminate further:
SENSOR_QUALIFIERS = [
    ("motion", "presence", "occupancy"),
    ("door", "window", "contact"),
    ("temperature", "humidity", "thermometer", "hygrometer"),
    ("water", "leak"),
    ("vibration",),
    ("smoke",),
    ("air", "tvoc", "co2"),
    ("light",),  # ambient light sensor — distinct
]


def _category_words(text: str) -> set[str]:
    text = text.lower()
    out: set[str] = set()
    for group in CATEGORIES:
        for w in group:
            if re.search(rf"\b{w}\b", text):
                out.add(group[0])
                break
    return out


def _sensor_qualifiers(text: str) -> set[str]:
    text = text.lower()
    out: set[str] = set()
    for group in SENSOR_QUALIFIERS:
        for w in group:
            if re.search(rf"\b{w}\b", text):
                out.add(group[0])
                break
    return out


def normalize(text: str) -> str:
    text = text.lower()
    # drop common boilerplate
    for stop in (
        "buy on amazon",
        "buy now",
        "amazon",
        " - aqara",
        " | aqara",
        " | reolink",
        " - reolink",
        " | govee",
        " - govee",
        " | switchbot",
        " - switchbot",
        " | tp-link",
        " - tp-link",
        " | tapo",
        " - tapo",
        " | kasa",
        " - kasa",
        " | eufy",
        " - eufy",
        " | sonoff",
        " - sonoff",
        " | itead",
        " - itead",
    ):
        text = text.replace(stop, " ")
    text = _NORMALIZE_RE.sub(" ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


# Model-code = a token that mixes letters and digits, e.g.
#   p1, t1, g3, u100, u200, fp2, fp1e, c220, c530ws, hs105, kp125m, kp200,
#   p115m, kc400, kd110, c420s2, h200, ws-usc03 (the trailing usc03)
# We tokenize on letters-then-digits (with optional trailing letters) plus
# split on underscores/hyphens to capture each part.
MODEL_TOK_RE = re.compile(r"[a-z]{1,4}\d{1,4}[a-z]?\d?[a-z]?", re.IGNORECASE)
# "Strong" model codes — any token mixing letters and digits.
# We previously required \d{2,} but Aqara routinely uses single-digit codes
# (G3, M2, T1, E1, U100). The unique-within-brand filter below disambiguates.
# We exclude pure-letter and pure-digit tokens, plus a small stoplist.
STRONG_MODEL_RE = re.compile(
    r"\b(?:[a-z]{1,5}\d{1,4}[a-z]?\d?[a-z]?)\b",
    re.IGNORECASE,
)
# Generic version markers / common nouns that look like model codes.
TOKEN_STOPLIST = {
    "v1", "v2", "v3", "v4", "v5",
    "wi", "wi1", "wi2",
    "co2", "h2o",
    "us", "uk", "eu", "jp",
    "1080p", "4k", "8k",
    "a19", "a21", "br30", "br40",
    "e26", "e27", "e12",
    "5ghz", "2.4ghz",
}


def _tokens_for(text: str) -> set[str]:
    """Lowercased model tokens from `text` (split on _ - and whitespace)."""
    parts = re.split(r"[\s_\-/]+", text.lower())
    out: set[str] = set()
    for p in parts:
        for m in MODEL_TOK_RE.finditer(p):
            out.add(m.group(0))
    # Also catch tokens that span a single segment (e.g. "kp125m" appearing as a
    # whole part already)
    return out


def _strong_tokens(text: str) -> set[str]:
    # Replace separators that the \b regex doesn't treat as word boundaries
    # for our purposes (underscores/hyphens/slashes between alphanumerics
    # mask the codes inside URLs and SKU IDs).
    flat = re.sub(r"[_/\-]+", " ", text)
    out: set[str] = set()
    for m in STRONG_MODEL_RE.finditer(flat):
        tok = m.group(0).lower()
        if tok in TOKEN_STOPLIST:
            continue
        out.add(tok)
    return out


def best_kb_match(
    vendor_name: str,
    kb_entities: list[dict],
    *,
    brand: str,
    extra_text: str = "",
) -> tuple[Optional[dict], float]:
    """Return (best_entity, score) where score is 0..1.

    Strategy:
      1. Filter KB to candidates with the same brand.
      2. Compute string-similarity baseline.
      3. If the vendor name shares a *strong* model code (e.g. "P1", "C220",
         "HS105", "KP125M") with the KB entity's name OR sku, override with
         a high score. Strong-token agreement is a near-certain match for
         smart-home products where the model code is usually globally unique
         within a brand.
      4. Penalize collisions: if multiple KB entities share the same strong
         token, fall back to string similarity to disambiguate.
    """
    candidates = [
        e for e in kb_entities if e.get("attributes", {}).get("brand") == brand
    ]
    if not candidates:
        return None, 0.0

    vendor_strong = _strong_tokens(vendor_name + " " + extra_text)
    # For each candidate, build its strong-token set.
    cand_strong: list[set[str]] = []
    for ent in candidates:
        text = (
            ent.get("name", "")
            + " "
            + ent.get("sku", "").replace("_", " ")
            + " "
            + ent.get("attributes", {}).get("model", "")
        )
        cand_strong.append(_strong_tokens(text))

    best: Optional[dict] = None
    best_score = 0.0
    for ent, st in zip(candidates, cand_strong):
        name_score = similarity(vendor_name, ent.get("name", ""))
        sku_score = similarity(vendor_name, ent.get("sku", "").replace("_", " "))
        baseline = max(name_score, sku_score)
        score = baseline

        # Variant-mismatch guard: don't let a "G2H" vendor product win the
        # KB slot for "G2H Pro", or vice versa. Same for "Mini" / "v2" / etc.
        vendor_lc = vendor_name.lower()
        ent_text_lc = (
            ent.get("name", "").lower()
            + " "
            + ent.get("sku", "").lower()
        )
        variant_mismatch = False
        for marker in ("pro", "max", "mini", "lite", "kit", "plus", "ultra"):
            in_v = re.search(rf"\b{marker}\b", vendor_lc) is not None
            in_e = re.search(rf"\b{marker}\b", ent_text_lc) is not None
            if in_v != in_e:
                variant_mismatch = True
                break

        # Category-word guard: e.g. vendor "Motion Sensor P2" must not win
        # KB "Door and Window Sensor P2" just because they share token P2.
        v_cats = _category_words(vendor_name)
        e_cats = _category_words(
            ent.get("name", "") + " " + ent.get("sku", "").replace("_", " ")
        )
        category_conflict = False
        if v_cats and e_cats and v_cats.isdisjoint(e_cats):
            category_conflict = True
        # Sensor-qualifier guard (when both are 'sensor' category)
        if "sensor" in v_cats and "sensor" in e_cats:
            v_q = _sensor_qualifiers(vendor_name)
            e_q = _sensor_qualifiers(
                ent.get("name", "") + " " + ent.get("sku", "").replace("_", " ")
            )
            if v_q and e_q and v_q.isdisjoint(e_q):
                category_conflict = True

        shared = vendor_strong & st
        if shared and not variant_mismatch and not category_conflict:
            # How distinctive is each shared token within this brand?
            best_uplift = 0.0
            for tok in shared:
                hits_in_brand = sum(1 for cs in cand_strong if tok in cs)
                if hits_in_brand == 1:
                    best_uplift = max(best_uplift, 0.95)
                elif hits_in_brand <= 3:
                    best_uplift = max(best_uplift, 0.88)
                else:
                    best_uplift = max(best_uplift, 0.82)
            # Only apply the uplift if the names actually look alike — the
            # category-conflict and variant-mismatch guards above cover
            # the structural cases. Leave a baseline floor here as
            # belt-and-braces against pathological mismatches that share a
            # rare token but nothing else.
            if baseline >= 0.40:
                score = max(score, best_uplift)
            # else: leave score at the baseline (will fall under threshold)

        if score > best_score:
            best, best_score = ent, score
    return best, best_score


# -----------------------------
# JSON IO (preserves existing format)
# -----------------------------


def load_kb() -> list[dict]:
    return json.loads(KB_PATH.read_text(encoding="utf-8")).get("entities", [])


def load_affiliates() -> tuple[dict, str]:
    raw = AFFILIATES_PATH.read_text(encoding="utf-8")
    return json.loads(raw), raw


def write_affiliates(obj: dict, original_text: str) -> bool:
    """Write back. Use json.dumps with indent=2 — matches the existing file
    format. Returns True if file changed.
    """
    new_text = json.dumps(obj, indent=2, ensure_ascii=False) + "\n"
    if new_text == original_text:
        return False
    AFFILIATES_PATH.write_text(new_text, encoding="utf-8")
    return True
