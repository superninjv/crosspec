# verticals/smart-home/ — V1

Multi-vendor smart-home ecosystem configurator. Matter / Thread / Zigbee / cloud-ecosystem compatibility with affiliate-routed product recommendations.

## Contract (inherited from `/README.md`)

This directory is a thin wrapper over `engine/`. It contains knowledge base + affiliate mappings + prompts + copy + author bio. No feature code — the engine does the work.

| File | Status |
|---|---|
| `kb.json` | stub (v0.1 commit 2) |
| `affiliates.json` | stub (v0.1 commit 2) |
| `prompts/system.md` | stub |
| `copy.md` | stub |
| `author.md` | stub (populated by separate plan.md item — EEAT author page) |

## Data sources (committed)

All permissive / non-hostile per `direction.md` hard rule on scraping.

| Source | Use | Ingest cadence |
|---|---|---|
| Home Assistant integrations registry (GitHub) | Hub + integration compatibility | Pull on demand via public GitHub raw |
| Zigbee2MQTT supported devices list (GitHub) | Zigbee device compatibility | Pull on demand via public GitHub raw |
| CSA Matter Certified Products DB | Matter + Thread compat + certification status | Pull via CSA public endpoints |

`kb.json` must cite each source in `kb.sources[]` with ingest date on every build.

## Affiliate partners (target — applications in flight, see plan.md)

| Merchant | Network | Rate | Cookie | Status |
|---|---|---|---|---|
| SwitchBot | Awin | 6–15% | 60d | pending |
| TP-Link Tapo | direct | 10% | — | pending |
| Govee | Impact | 5–10% | — | pending |
| Philips Hue / Signify | Awin / Partnerize | varies | — | pending |
| Aqara | Awin (UK) / Sovrn (US) | varies | — | pending |
| Amazon Associates | direct | 2.5% | 24h | fallback |

Approval state tracked at `~/notes/projects/crosspec-affiliate-status.md`.

## V1 end-to-end flow (v0.1 commit 2 goal)

User input: "I have Apple HomeKit. I want a motion sensor and a smart bulb." → solver reads `kb.json`, filters by `ecosystem: homekit`, picks 2–3 compat products → `affiliate/route()` issues clickout URLs → page renders product cards with reasoning chain (citing HA integrations + CSA Matter) + affiliate button.

Ship that one flow. Polish later.
