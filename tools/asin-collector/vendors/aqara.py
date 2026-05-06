"""Aqara — walk product category pages and extract Amazon links.

Aqara category pages (e.g. /us/product/sensor/) are server-rendered Elementor
templates. Each product card has the structure:

    <h3>Product Name</h3>
    ...
    <a class="...product-cat-buy_btn..." href="https://amazon.com/dp/B0..."

So pulling (name, asin) pairs is just regex over the rendered HTML — no JS
needed. Lightweight backend works.
"""
from __future__ import annotations

import re
from typing import Iterator

from lib import (
    ASIN_RE,
    ProductHit,
    fetch,
)

BRAND = "aqara"
DOMAIN = "https://www.aqara.com"
CATEGORY_URLS = [
    "https://www.aqara.com/us/product/sensor/",
    "https://www.aqara.com/us/product/camera/",
    "https://www.aqara.com/us/product/door-lock/",
    "https://www.aqara.com/us/product/hub/",
    "https://www.aqara.com/us/product/controller/",
    "https://www.aqara.com/us/product/curtain-controller/",
    "https://www.aqara.com/us/product/light/",
]

H_RE = re.compile(r"<h[123][^>]*>([^<]{3,120})</h[123]>", re.IGNORECASE)


def discover(*, cache: bool = True) -> Iterator[ProductHit]:
    seen_asin: set[str] = set()
    for cat in CATEGORY_URLS:
        try:
            html = fetch(cat, backend="lightweight", cache=cache)
        except Exception as e:  # noqa: BLE001
            print(f"  aqara: fetch {cat} failed: {e}")
            continue
        for m in ASIN_RE.finditer(html):
            asin = m.group(1).upper()
            if asin in seen_asin:
                continue
            # Find the closest preceding <h3> / <h2> / <h1> for the product name
            preceding = html[max(0, m.start() - 4000) : m.start()]
            headers = H_RE.findall(preceding)
            name = headers[-1].strip() if headers else ""
            if not name:
                continue
            seen_asin.add(asin)
            yield ProductHit(
                brand=BRAND,
                vendor_url=cat,
                vendor_name=name,
                asin=asin,
            )
