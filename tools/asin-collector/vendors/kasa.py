"""Kasa (TP-Link Kasa) — sitemap → PDP → Amazon-search ASIN.

Kasa product pages link to amazon.com/s/?field-asin=B0...&keywords=...
("BUY NOW" buttons). Multi-pack variants get separate buttons; we take the
first one (typically the smallest/cheapest pack).
"""
from __future__ import annotations

import re
from typing import Iterator
from urllib.parse import urlparse

from lib import (
    ProductHit,
    extract_title,
    fetch,
    fetch_sitemap_urls,
)

BRAND = "kasa"
SITEMAP = "https://www.kasasmart.com/sitemap.xml"

KASA_ASIN_RE = re.compile(
    r"field-asin=(B0[A-Z0-9]{8})", re.IGNORECASE
)


def _is_pdp(url: str) -> bool:
    p = urlparse(url)
    if p.netloc != "www.kasasmart.com":
        return False
    parts = [s for s in p.path.split("/") if s]
    # /us/products/<category>/<sku>
    return len(parts) == 4 and parts[0] == "us" and parts[1] == "products"


def discover(*, cache: bool = True) -> Iterator[ProductHit]:
    urls = [u for u in fetch_sitemap_urls(SITEMAP, cache=cache) if _is_pdp(u)]
    print(f"  kasa: {len(urls)} PDPs from sitemap")
    seen_asin: set[str] = set()
    for url in urls:
        try:
            html = fetch(url, backend="lightweight", cache=cache)
        except Exception as e:  # noqa: BLE001
            print(f"  kasa: fetch {url} failed: {e}")
            continue
        m = KASA_ASIN_RE.search(html)
        if not m:
            continue
        asin = m.group(1).upper()
        if asin in seen_asin:
            continue
        seen_asin.add(asin)
        title = extract_title(html)
        name = re.sub(r"\s*\|\s*Kasa Smart\s*$", "", title).strip()
        yield ProductHit(brand=BRAND, vendor_url=url, vendor_name=name, asin=asin)
