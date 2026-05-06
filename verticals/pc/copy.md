# verticals/pc/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/pc`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** PC Build Configurator
- **Subheadline:** Tell us your workload, budget, and preferences. We'll pick a CPU, GPU, motherboard, RAM, storage, PSU, case, and cooler that all fit together — and explain exactly why each part is in the bill.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets (AMD, Intel, NVIDIA, ASUS, MSI, Gigabyte, ASRock, Corsair, Kingston, Samsung, G.Skill, Crucial, Seasonic, be quiet!), the PCPartPicker public component database, r/buildapc community wiki, Tom's Hardware spec articles, and benchmark data summaries from Hardware Unboxed and Gamers Nexus (public YouTube descriptions and written articles). Prices will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by compatibility (socket, form factor, power, thermal clearance) and fit to your stated workload and budget.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "Budget 1440p high-refresh gaming build under $1,500"
- "Blender + DaVinci Resolve workstation, no compromise"
- "Small-form-factor ITX for a TV room, quiet and compact"

## Error state

"Can't find a configuration that satisfies all your constraints. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end PC flow ships. This stub establishes the contract consumed by `engine/ui/`.
