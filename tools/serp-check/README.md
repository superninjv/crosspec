# SERP-check tool

Headless-Firefox + Marionette SERP validation workflow, carried over from the killed crossref project. Use this for Phase 0 AIO-behavior checks on candidate verticals.

## Files
- `analyze.py` — targeted analyzer for the `cli-anything-scrape search --backend marionette --json` output format. Categorizes domains into FORUM / OEM / DIST / XREF / OTHER, flags demand signals, counts forum presence.
- `parse.py` — older Bing HTML parser (mostly obsolete since we moved to marionette/DDG). Kept for reference in case we need to crawl Bing directly again.

## Typical workflow (from crossref Phase 0, should carry over to crosspec)

```bash
# For each of ~15 representative queries:
cli-anything-scrape search --backend marionette --limit 10 --json "<query>" > /tmp/q01.json

# Then analyze:
python3 analyze.py
```

Adapt `QUERIES` in `analyze.py` for the current vertical. Re-categorize domain markers per vertical (keyboard distributors differ from pneumatic distributors).

## For the crosspec AIO check specifically

**Do not use DuckDuckGo for AIO check.** DDG doesn't render Google AI Overviews. The AIO check MUST use Google direct — via Firefox (manual or Marionette-driven against `google.com/search`) OR a SerpAPI-style service. This is the #1 crossref lesson: DDG is proxy data, Google is the actual battlefield.

Marionette driver via `cli-anything-firefox driver` can navigate Google, but Google's bot detection is aggressive. Expect to fall back to manual driving or a paid SerpAPI tier ($50/mo) for the 15-query check.
