# verticals/3d-printer/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/3d-printer`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** 3D Printer Setup Configurator
- **Subheadline:** Tell us what you want to print — material, detail level, and budget. We'll match a printer, hotend, nozzle, filament, and build surface that all work together — and explain exactly why each part is in the build.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets (Bambu Lab, Prusa Research, E3D, Phaetus, Slice Engineering), Voron Design public build documentation, RepRap.org wiki, and Polymaker / Hatchbox public spec PDFs. Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by compatibility constraints (hotend temp, bed temp, enclosure, direct-drive, nozzle abrasion rating) and fit to your stated material and use case.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "hardened nozzle setup for carbon fiber nylon"
- "first FDM printer for miniatures and tabletop terrain"
- "enclosed printer for ABS automotive prototypes"

## Error state

"Can't find a configuration that satisfies all your constraints. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end 3D printer flow ships. This stub establishes the contract consumed by `engine/ui/`.
