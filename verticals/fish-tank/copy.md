# verticals/fish-tank/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/fish-tank`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Aquarium Build Configurator
- **Subheadline:** Tell us your tank size, stocking goal (community / planted / reef), and skill level. We'll size a filter, heater, light, substrate, and — for reef builds — a protein skimmer that all work together, and explain exactly why each part is in the bill.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets (Fluval, Eheim, Seachem, Hygger, NICREW, Inkbird, Hagen and others), Bulk Reef Supply public guides, Aquarium Co-Op video / blog content, ReefBuilders public spec PDFs, Practical Fishkeeping public articles, and community-maintained references (r/Aquariums, r/PlantedTank, r/ReefTank). Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by physical compatibility (filter turnover GPH, heater watts/gal, lighting PAR-at-depth, freshwater-vs-saltwater substrate, skimmer rated gallons) and fit to your stated tank size + stocking + experience profile.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "75gal planted tank with low-light plants"
- "Nano reef setup for soft corals"
- "Beginner 20gal community tank"

## Error state

"Can't find a configuration that fits your tank size and stocking goal with the constraints you set. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end fish-tank flow ships. This stub establishes the contract consumed by `engine/ui/`.
