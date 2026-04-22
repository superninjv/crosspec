# engine/ui/

UI shell components. Vertical-agnostic. Astro + interactive islands.

## What lives here

| Component | Responsibility |
|---|---|
| `Layout.astro` | Page shell — header, footer, EEAT author link, attribution strip. |
| `ConfiguratorShell.astro` | Wraps the chat + form + result panes. Accepts a vertical's `kb.json` path and `copy.md` as props. |
| `ChatIsland.tsx` (or similar framework) | Interactive chat component. Calls `engine/llm/` via a Worker endpoint. Streams responses. |
| `ProductCard.tsx` | Single-product render. Props: `{ entity, reasoning, affiliate_url }`. Attribution badge required. |
| `ReasoningChain.tsx` | Renders the solver's reasoning chain. Every step cites a source. |
| `SaveBuildButton.tsx` | v0.2 feature — stub only in v0.1. |

## What does NOT live here

- Vertical-specific copy (headlines, CTAs, disclaimers) — comes from `verticals/<name>/copy.md`.
- Vertical-specific form fields — rendered by the shell from `kb.goals[]`, not hardcoded per-vertical.
- Vertical-specific product imagery paths — comes from `verticals/<name>/` static assets.

## Attribution badge (hard rule)

Every rendered product card MUST show: source dataset name + ingest date. Every reasoning step MUST show: rationale + source. No silent claims. See direction.md "attribution + provenance" rule.

## Lighthouse floor

Every page must score ≥95 on perf / a11y / SEO / best-practices. Static-first, hydrate only the interactive islands, no client-side router, no megabyte JS bundles. Budget check runs in CI against Cloudflare Pages preview URLs.

## Public interface (target)

A vertical's page is ~15 lines of Astro:

```astro
---
import { ConfiguratorShell } from '@engine/ui';
import kb from '@verticals/smart-home/kb.json';
import copy from '@verticals/smart-home/copy.md';
---

<ConfiguratorShell vertical="smart-home" kb={kb} copy={copy} />
```

If a vertical's page needs more than this, the shell is too narrow — refactor.
