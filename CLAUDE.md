# crosspec — project-level guidance

Multi-vertical configurator hub under `crosspec.com`. Vertical 1 TBD (preliminary: mechanical keyboards). Authoritative north star: `direction.md`. Living plan + in-progress items: `plan.md`. Both are required reads before any code or doc edits in this project.

## Lessons carried forward from crossref (dead cousin project)

- **Check Google + AIO behavior early.** The single biggest failure mode in 2026 pSEO-adjacent work is committing to a niche that AIO has already absorbed. Any vertical we're considering gets an AIO-behavior check before any build.
- **Tools, not content.** Content-for-display-ads is AIO-food. Every page on crosspec.com is a working interactive tool or a configurator result.
- **Affiliate economics defined before build.** We don't build a vertical without a confirmed affiliate partner, rate, and clickout path. Post-hoc monetization is the top predictor of project death.
- **Don't scrape hostile ToS.** Vendor APIs, affiliate feeds, or community-maintained datasets only. No PCPartPicker-style adversarial games.
- **Vertical-first, not hub-first.** Six-month focused build on one vertical at specialist depth before the second vertical begins. Hub branding emerges after Vertical 3, not before.

## Infra notes specific to crosspec

- Domain: `crosspec.com` (Namecheap registrar, auto-renew on, expires 2027-04-20).
- DNS: Cloudflare zone `72048f516d550fc95de1b6a1181246bd` on nameservers `daniella/dave.ns.cloudflare.com`. DNSSEC signed (DS keytag 2371 ECDSAP256SHA256).
- Hosting target: Cloudflare Pages (static) + Cloudflare Workers (LLM backend, affiliate routing).
- LLM budget: <$0.15 per completed configurator session via tiered routing. Local on foundry-01 for bulk, Haiku 4.5 for chat turns, Sonnet 4.6 for edge cases, Opus 4.7 never in hot path.
- Lighthouse floor: ≥95 on every shipped page.
- Production deploys via GitHub Actions only. No manual SSH.

## Not in scope here

- LLM education / curriculum → Synoros product line. See `~/notes/projects/llm-education-research-brief.md`.
- LLM SEO / AIO-optimization advisory → Synoros product line. Same brief.
- Pneumatic cross-reference → killed. See `~/projects/crossref/plan.md` and `~/notes/daily/2026-04-20.md`.

## Tools carried from crossref

`tools/serp-check/` — headless-Firefox-via-Marionette SERP validation workflow. Use this for the Phase 0 AIO behavior check on Vertical 1. Run via `cli-anything-scrape search --backend marionette` + the analyzer at `tools/serp-check/analyze.py`. Promote from `/tmp/crossref-serps/` before running (next reboot kills the /tmp copy).
