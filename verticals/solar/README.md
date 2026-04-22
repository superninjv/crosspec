# verticals/solar/ — V2 stub

**Status: not started.** This directory exists to prove the engine/vertical boundary. V2 (solar + battery + inverter sizing) does not begin work until V1 (smart home) is earning affiliate revenue per direction.md Phase 3 gate.

## Why this stub exists

Every vertical plugged into the crosspec engine must provide exactly the files listed below. If adding a new vertical requires changing anything in `engine/`, the engine has leaked vertical-specific assumptions — that's a hard-rule violation from direction.md.

This stub documents the contract. When V2 starts, the first test is: can we populate these five files with real solar data and have the site render a working configurator page **without touching `engine/`**? If yes, the boundary holds. If no, engine needs a refactor before V2 begins.

## Contract — required files

| Path | Purpose | Schema |
|---|---|---|
| `kb.json` | Entities, constraints, goals (panels, inverters, batteries × compatibility rules × sizing goals). | `engine/solver/README.md` |
| `affiliates.json` | SKU → affiliate mapping (e.g. EnergySage referral, Project Solar direct, Amazon Associates fallback). | `engine/affiliate/README.md` |
| `prompts/system.md` | LLM system prompt for solar-specific chat tone. | `engine/llm/README.md` |
| `copy.md` | Page copy — headline, subheadline, CTAs, disclaimers. | `engine/ui/README.md` |
| `author.md` | Named author bio with LinkedIn link — EEAT floor (direction.md hard rule). | `engine/ui/README.md` |

## Solar-specific notes (preliminary, from triage 2026-04-21)

Carried forward so V2 startup is not re-research. Full details at `~/notes/projects/crosspec-vertical-triage.md`.

- **Data pipeline:** CEC (California Energy Commission) module + inverter CSV + pvlib + NREL PVWatts API. All permissive / public.
- **Affiliate anchor:** Project Solar $500/install (but conflicts with EnergySage's install-intent turf — revisit). Hardware affiliate rates thin at 5–8% on $1k AOV.
- **EEAT ramp:** YMYL-adjacent (financial + safety). 6–12 month author-credibility ramp. Pick author early.
- **Competitive:** multiple 2025 "AI solar sizer" entrants already positioning. Not greenfield.
- **Sizing objective:** load profile → panel array kW → inverter continuous rating → battery kWh. Discrete + continuous — needs the pre-computed lookup-table approach described in `engine/solver/README.md` non-goals.

## Not now

Do not populate this directory with real data in v0.1. The stub itself is the architectural artifact.
