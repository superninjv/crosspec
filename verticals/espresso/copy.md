# verticals/espresso/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/espresso`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Espresso Machine + Grinder Configurator
- **Subheadline:** Tell us your budget, drink mix, and counter space. We'll match a machine, grinder, portafilter, basket, tamper, and puck-prep workflow that all fit together — and explain why each part is on the list.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, public reviews from Whole Latte Love, Seattle Coffee Gear, Clive Coffee, James Hoffmann, and Barista Hustle, plus r/espresso community references. Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by group-head fit (58mm E61 vs 54mm Breville vs 53mm Bambino), basket-to-brew-pressure match, tamper clearance, and grinder dose consistency against your stated budget and drink mix.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "First espresso machine + grinder under $1500"
- "Lever-pull dual-boiler setup for milk drinks"
- "Single-dose grinder upgrade for an existing E61"

## Error state

"Can't find a configuration that hits your budget with the constraints you set. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end espresso flow ships. This stub establishes the contract consumed by `engine/ui/`.
