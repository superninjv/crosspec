"""Tapo (TP-Link Tapo) — sitemap → PDP → Amazon.

Tapo PDPs include `<a href="https://amazon.com/dp/ASIN?tag=...">Buy on
Amazon</a>` near the price. Lightweight scrape is enough.
"""
from __future__ import annotations

import re
from typing import Iterator
from urllib.parse import urlparse

from lib import (
    ASIN_RE,
    ProductHit,
    extract_title,
    fetch,
    fetch_sitemap_urls,
)

BRAND = "tapo"
SITEMAP = "https://www.tapo.com/us/sitemap.xml"


def _is_pdp(url: str) -> bool:
    p = urlparse(url)
    if p.netloc != "www.tapo.com":
        return False
    parts = [s for s in p.path.split("/") if s]
    # /us/product/<category>/<sku>/
    return len(parts) >= 4 and parts[0] == "us" and parts[1] == "product"


def discover(*, cache: bool = True) -> Iterator[ProductHit]:
    urls = [u for u in fetch_sitemap_urls(SITEMAP, cache=cache) if _is_pdp(u)]
    print(f"  tapo: {len(urls)} PDPs from sitemap")
    seen_asin: set[str] = set()
    for url in urls:
        try:
            html = fetch(url, backend="lightweight", cache=cache)
        except Exception as e:  # noqa: BLE001
            print(f"  tapo: fetch {url} failed: {e}")
            continue
        m = ASIN_RE.search(html)
        if not m:
            continue
        asin = m.group(1).upper()
        if asin in seen_asin:
            continue
        seen_asin.add(asin)
        # Title typically: "Tapo C220 | Pan/Tilt ... | Tapo"
        title = extract_title(html)
        # Strip trailing " | Tapo"
        name = re.sub(r"\s*\|\s*Tapo\s*$", "", title).strip()
        yield ProductHit(brand=BRAND, vendor_url=url, vendor_name=name, asin=asin)
