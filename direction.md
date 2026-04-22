# Direction — crosspec

## North star
**crosspec.com is a multi-vertical configurator hub.** Each vertical is an LLM-assisted, constraint-aware tool that helps a buyer compose a working spec-matched setup across real products, with real-time pricing and affiliate-routed checkout. Destination: 4–6 vertical configurators live under one brand, each earning organic traffic in its own category, with a homepage that surfaces all of them as a coherent aggregator.

**The discipline that gets us there is vertical-first, not hub-first.** Ship Vertical 1 at specialist-dedicated depth before Vertical 2 begins. Don't build hub scaffolding before any single vertical earns traffic — that's the shed-building failure mode that kills solo multi-product sites.

Planned vertical expansion (order TBD in Phase 0, but candidate set):
1. Mechanical keyboards — hot-swap compat, switch types, layout (60/65/75/TKL), QMK firmware, plate + stabilizer matching, keycap profile compatibility
2. Smart home / Matter-Thread-Zigbee stack — hub + device + automation platform compatibility
3. Solar + battery + inverter sizing — load profile → panel array → inverter continuous rating → battery kWh
4. E-bike / e-mobility component configurator — motor Kv × wheel Ø × controller amp × battery V × regulatory class
5. Podcast / streaming / creator studio setup — mic + interface + cam + capture + OBS settings

Each vertical picked for the same mechanic: interactive constraint solving with real-time product data, affiliate-monetizable, AIO-resistant because the user must execute on their own numbers.

## Non-goals
- **Content-for-ads.** Articles, "best X of 2026" listicles, affiliate review content. AIO eats this. We learned that on crossref.
- **Generic tool hub.** A bag of random calculators (JSON formatter, color picker, etc.). The site's value is configurator depth, not calculator count.
- **Multi-vertical launch.** Shipping three half-configurators simultaneously is the most common failure mode. One deep > three shallow.
- **Scraping hostile sites.** If a data source's ToS prohibits automated access, find a different source (vendor APIs, affiliate catalogs, community-maintained datasets). hiQ v. LinkedIn kept scraping rights alive, but practical game is cat-and-mouse with anti-bot engineers. Not our battle.
- **SaaS pivot.** The product is a free configurator monetized by affiliate + premium tier, not a $20/mo subscription service.
- **Education / AIO advisory.** Those are Synoros product lines (see `~/notes/projects/llm-education-research-brief.md`). Crosspec is configurators only.
- **No social presence.** No TikTok, no YouTube Shorts, no creator-persona strategy. Organic search + community posts (niche subreddits, forum engagement) only.

## Constraints
- **Solo operator.** No employees, no co-founders, no contractors scaled beyond occasional design/copy freelance.
- **Six-month first-vertical commitment.** Phase 0 + Phase 1 + Phase 2 (scoping + build + launch + traffic) fit inside 6 months for Vertical 1 alone. Vertical 2 does not start before V1 is earning affiliate revenue.
- **Hosting cost ceiling: <$20/mo** at any traffic level under 100k PV/mo. Cloudflare Pages (free) + Cloudflare Workers (free tier 100k/day) + D1 or KV (free tier) for state. Domain is $15/yr.
- **LLM inference cost ceiling: <$0.15 per completed configurator session** as running cost baseline. Achieved via tiered routing: local on foundry-01 for draft/draft-like work, Haiku 4.5 for chat turns, Sonnet 4.6 only for edge cases. Opus 4.7 never in hot path.
- **foundry-01 is on-prem infrastructure already running.** Available as a backend option for bulk inference or private advisory mode. Not required for v1.
- **Production deploy: GitHub Actions only.** Never SSH directly to ship code.
- **All page metrics: Lighthouse ≥95 perf/a11y/SEO/best-practices** on every page that ships.

## Hard rules
- **AIO behavior check is required before any vertical is funded.** Before committing to Vertical N, run 10–15 representative target queries through Google. If AIO fires with a complete answer that eliminates click-through intent, that vertical is dead — pick another. This is the #1 lesson from crossref.
- **Affiliate revenue path defined before build.** If we can't name the affiliate partners, their rates, and the API/link-format for Vertical N, we don't build Vertical N. Monetization is not an afterthought.
- **Each vertical uses the shared engine.** Constraint solver, LLM orchestration, affiliate routing, analytics, auth (if any) live in one place. Vertical-specific code is UI + knowledge base + affiliate mappings + copy. If we find ourselves forking the engine per-vertical, that's a design failure — stop and refactor.
- **EEAT floor on day one.** One named author per vertical, with LinkedIn presence and real expertise in that domain. Anonymous configurator sites don't survive 2026 spam updates.
- **Attribution + provenance on every product reference.** Spec data sourced from vendor catalog? Name the catalog + version + ingest date. Compatibility rule? Cite the reasoning (mechanical standard, community-maintained database, first-hand testing). Users trust configurators that show their work.
- **Tools, not content.** Every page a user lands on must be a working interactive tool or a configurator result, not a blog post. If the page is a text wall with an embedded widget below the fold, we got it wrong.
- **No scraping sites with hostile ToS.** Especially PCPartPicker, vendor-portal sites that require login, any service with anti-bot infrastructure active. Use public APIs, affiliate data feeds, or community-maintained open datasets (e.g. the mechanical keyboard database at keebfol.io, Home Assistant integrations registry).
- **Don't launch the hub homepage before Vertical 3.** The index page stays vertical-focused until we have 3+ configurators earning traffic. "crosspec.com" the hub brand is a Phase 4 reveal, not a Phase 1 promise.

## Success signals
- **Phase 0 (Week 1–2) gate:** Vertical 1 selected; AIO check passed (< 5 of 15 representative queries show complete-answer AIO); demand signal confirmed; affiliate partners identified with rates; constraint engine scope fits 6-week build.
- **Phase 1 (v0.5, Weeks 3–8):** Vertical 1 configurator live on `crosspec.com/<vertical>`, Lighthouse ≥95, one author page live with LinkedIn link, at least 1 affiliate partner integrated with working clickout.
- **Phase 2 (Weeks 9–20):** Vertical 1 indexed (100+ pages in Google), organic traffic trending up, first affiliate revenue recorded, configurator-completion conversion rate ≥2%.
- **Phase 3 activation (Month 6+):** Vertical 1 at $200+/mo affiliate revenue run-rate and top-10 for primary query. Only then does Vertical 2 planning begin.
- **Phase 4 hub reveal:** 3+ verticals earning traffic independently. Homepage reworks to aggregator positioning. "crosspec.com" the hub becomes part of branding, not just the URL.
- **Long-run target:** 4–6 verticals live, $2–5k/mo combined affiliate revenue within 18–24 months. Not a lifestyle business replacement by itself — a compounding asset that stacks alongside Synoros income.
