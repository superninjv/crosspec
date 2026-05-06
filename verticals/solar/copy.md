# verticals/solar/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/solar`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Solar + Battery Sizing Configurator
- **Subheadline:** Tell us your daily kWh, your location, and your loads. We'll size a panel array, charge controller, battery bank, and inverter that all work together — and explain exactly why each part is in the bill.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, NREL PVWatts public solar resource API, OpenEI public datasets, and community-maintained references (DIY Solar Forum, Will Prowse YouTube spec summaries). Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program and partner direct programs (Renogy, EcoFlow, Bluetti, Goal Zero, Jackery, Anker SOLIX, BougeRV) — this does not change product ranking, which is determined by electrical compatibility (Voc / Vmp / Imp / DC bus voltage / BMS limits) and fit to your stated daily-kWh + location + load profile.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "I need 2 kWh/day for a 24V camper van in Colorado"
- "Off-grid cabin in Vermont, 5 kWh/day, propane backup OK"
- "Cheapest reliable 12V 100Ah LFP setup for weekend RV trips"

## Error state

"Can't find a configuration that hits your daily-kWh target with the constraints you set. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end solar flow ships. This stub establishes the contract consumed by `engine/ui/`.
