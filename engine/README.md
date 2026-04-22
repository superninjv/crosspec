# engine/

Vertical-agnostic configurator engine. ZERO vertical-specific code lives here.

## The rule

If a change to this directory tree would make the engine work "better for smart home" or "better for solar," it's a vertical-specific assumption leaking into engine code. Stop. Move the smart-home-specific or solar-specific piece into the relevant `verticals/<name>/` directory, and keep the engine's interface generic.

Test: every module under `engine/` must be importable and runnable against **any** vertical, including verticals not yet conceived. If a module's unit tests would fail against a hypothetical `verticals/widget-factory/` that satisfies the contract in `/README.md`, the module has absorbed a vertical-specific assumption — refactor.

## Modules

| Module | Responsibility | Interface |
|---|---|---|
| `solver/` | Constraint-satisfaction. Takes a `kb.json` + user inputs, returns compatible products with reasoning chain. | See `solver/README.md` |
| `llm/` | Tiered LLM routing (Haiku chat / Sonnet edge-case / local bulk / never-Opus). Budget <$0.15/session. | See `llm/README.md` |
| `affiliate/` | Affiliate-link router. Takes a product SKU + current vertical, returns an affiliate URL with tracking params. | See `affiliate/README.md` |
| `analytics/` | Event hook interface — vertical-agnostic events (`configurator_started`, `recommendation_shown`, `affiliate_click`, `session_completed`). | See `analytics/README.md` |
| `ui/` | UI shell — layout, chat component, product card component, save-build component. Vertical-specific copy comes from the vertical's `copy.md`. | See `ui/README.md` |

## Dependency direction

- `engine/*` can import from `engine/*`.
- `engine/*` can import **schema types** for what verticals must provide (e.g. the shape of `kb.json`). It CANNOT import any concrete data from `verticals/*`.
- `verticals/*` can import from `engine/*`. (But typically doesn't — verticals are data + copy, not code.)
- The top-level Astro pages wire them together: page imports vertical data + engine UI shell, hydrates at runtime with user input.
