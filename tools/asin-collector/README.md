# asin-collector

Collects Amazon ASINs from vendor sites (Aqara, SwitchBot, Reolink, Govee, Tapo, ...) and writes them into `verticals/smart-home/affiliates.json` so the Cloudflare cart Worker (`functions/go/[vertical]/cart.ts`) can build Amazon bulk-cart URLs.

## Why vendor sites only

Amazon has hostile anti-bot infra and adversarial ToS for scraping. Vendor sites *want* affiliate clicks — walking aqara.com / reolink.com / etc. for "Buy on Amazon" links is what publishers do.

## Layout

- `collect.py` — driver. Loads KB, runs each vendor extractor, fuzzy-matches vendor product names to KB entities, writes affiliates.json.
- `lib.py` — shared helpers (sitemap fetch, scrape wrapper, ASIN regex, fuzzy match, JSON IO).
- `vendors/<brand>.py` — per-vendor extractor. Implements `discover_product_urls()` and (optionally) `parse_product_page(html, url)`.
- `cache/` — on-disk HTML cache so reruns are free.

## Run

    cd /home/jack/projects/crosspec/tools/asin-collector
    python3 collect.py                       # all default brands
    python3 collect.py --brands aqara,reolink
    python3 collect.py --brands aqara --no-cache
    python3 collect.py --dry-run             # no write to affiliates.json

Idempotent — second run is a no-op when nothing changed.

## Adding a vendor

Drop `vendors/<brand>.py` exporting:

    BRAND = "aqara"            # matches kb.json `attributes.brand`
    SITEMAP = "..."            # optional
    SEEDS = ["..."]            # optional category pages
    def discover_product_urls() -> Iterable[str]: ...

Default `parse_product_page` in `lib.py` works for most vendors (regex on the rendered HTML).
