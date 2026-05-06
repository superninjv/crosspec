# verticals/cnc/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/cnc`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** CNC Router Configurator
- **Subheadline:** Tell us your material, work size, and budget. We'll match a machine, spindle, bits, and workholding that are actually compatible with each other — and show exactly why each part is in the build.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, CNCzone.com public forums, V1 Engineering and OpenBuilds community docs, Harvey Tool and Destiny Tool public catalogs, and vendor product pages (Carbide 3D, Onefinity, Avid CNC, Genmitsu, Inventables, BobsCNC). Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by mechanical compatibility (spindle mount diameter, collet size, work envelope fit) and match to your stated material, size, and budget.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "I want to cut hardwood signs at 18x24 inches"
- "Carbon-fiber plate cutter for RC car parts, under $3000"
- "First CNC for hobby use under $2000, mostly plywood and MDF"

## Error state

"Can't find a compatible configuration for your constraints. Try adjusting one: [list of binding constraints from solver — e.g. no 80 mm spindle fits a 65 mm machine mount]."
