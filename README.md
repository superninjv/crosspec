# crosspec

Multi-vertical configurator hub. An LLM-assisted, constraint-aware tool that helps a buyer compose a working spec-matched setup across real products, with affiliate-routed checkout.

Vertical 1 (active): smart home (Matter / Thread / Zigbee / ecosystem compatibility).
Vertical 2 (on deck): solar + battery + inverter sizing.

Authoritative north star: [`direction.md`](./direction.md). Living roadmap: [`plan.md`](./plan.md).

## Architecture — engine + verticals

**One engine. Many verticals. Never fork the engine per vertical.**

```
crosspec/
  engine/                     # vertical-agnostic — ZERO vertical-specific code
    solver/                   # constraint-solver interface + primitives
    llm/                      # tiered LLM routing (Haiku / Sonnet / local), <$0.15/session
    affiliate/                # affiliate link router
    analytics/                # event hooks
    ui/                       # shell components
  verticals/
    smart-home/               # V1 instance — thin wrapper over engine
      kb.json                 # compatibility rules (ecosystem × protocol × hub × device)
      affiliates.json         # SKU → affiliate URL map
      prompts/                # LLM prompts (system, examples, tone)
      copy.md                 # page copy (headlines, CTAs, disclaimers)
      author.md               # named author EEAT bio
    solar/                    # V2 stub — README documents the contract
```

### Contract — what a vertical must provide

Any directory under `verticals/` MUST provide exactly these files to be plugged into the engine:

1. `kb.json` — constraint / compatibility knowledge base. Schema defined in `engine/solver/README.md`.
2. `affiliates.json` — mapping from product SKU / canonical name to affiliate URL + metadata (merchant, rate, cookie window). Schema in `engine/affiliate/README.md`.
3. `prompts/` — LLM prompts used by `engine/llm/` when this vertical is active. Minimum: `system.md`. Optional: `examples/`, `tone.md`.
4. `copy.md` — page copy: headline, subheadline, CTA, disclaimer. Consumed by `engine/ui/`.
5. `author.md` — named author bio for the EEAT floor (direction.md hard rule).

That's the contract. A vertical that needs anything more from the engine than that is a design failure — the engine is too narrow. Refactor the engine, don't fork it.

### Contract test

Before shipping any engine change: add an empty `verticals/<new-name>/` with only the five contract files populated with stub data. If the site builds and renders a stub configurator page for that vertical **without any engine code changes**, the boundary is correct. If it doesn't, the engine has accidentally absorbed vertical-specific assumptions — refactor before shipping.

## Tech stack (committed)

- **Frontend:** Astro + interactive islands (Lighthouse ≥95 floor per direction.md).
- **Hosting:** Cloudflare Pages (static) + Cloudflare Workers (affiliate router, LLM proxy).
- **LLM routing:** tiered — local on foundry-01 for bulk, Haiku 4.5 for chat turns, Sonnet 4.6 for edge cases, Opus 4.7 never in the hot path. Budget: <$0.15 per completed configurator session.
- **Data storage:** Cloudflare KV or D1 for saved-configurator UGC. No user accounts in v0.1.
- **Analytics:** Cloudflare Analytics (free tier, GDPR-friendly).
- **Deploy:** GitHub Actions → Cloudflare Pages. No manual SSH.

## Status

Phase 1 — engine v0.1 scaffolding in progress. See `plan.md`.

## Hard rules (see direction.md for full text)

- Tools, not content. Every page is an interactive tool or configurator result.
- Each vertical uses the shared engine. Never fork.
- EEAT floor day one — one named author per vertical.
- Attribution + provenance on every product reference.
- No scraping hostile-ToS sites.
- Don't launch the hub homepage before Vertical 3 — `crosspec.com/` stays vertical-focused until then.
