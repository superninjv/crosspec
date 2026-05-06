# verticals/fpv-drone/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/fpv-drone`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** FPV Drone Build Configurator
- **Subheadline:** Tell us your build goal — freestyle, cinematic, long range, or whoop — and we'll spec a frame, motors, ESC, FC, camera/VTX, antenna, battery, props, and radio link that all fit together electrically and mechanically, with the reasoning shown in plain English.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets (iFlight, T-Motor, EMAX, Holybro, BetaFPV, Caddx, Walksnail, DJI, RadioMaster), retailer spec pages (Pyrodrone, GetFPV, RaceDayQuads), Oscar Liang's FPV blog, the Betaflight wiki, ExpressLRS / TBS Crossfire docs, BLHeli32 / AM32 / Bluejay firmware docs, and r/Multicopter / r/fpv community references. FPV component pricing and availability shift fast — verify current pricing on the merchant page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by mechanical and electrical compatibility (mount pattern, stack size, S-count, ESC current headroom, control-link protocol match) and fit to your stated build goal.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "First 5\" freestyle build with DJI O3"
- "Cinematic 7\" long range setup"
- "Whoop / 2\" indoor build for under $200"

## Error state

"Can't find a configuration that satisfies your goal under the constraints (mount pattern, stack size, S-count, ESC headroom, link protocol). Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end FPV flow ships. This stub establishes the contract consumed by `engine/ui/`.
