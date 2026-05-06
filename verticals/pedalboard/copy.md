# verticals/pedalboard/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/pedalboard`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Guitar Pedalboard Configurator
- **Subheadline:** Tell us your pedals, your power budget, and your board size. We'll spec a power supply that covers every draw, a board that fits the footprint, and exactly enough patch cables — and explain why each call was made.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets (Boss, Strymon, EHX, Walrus Audio, JHS, Chase Bliss Audio, CIOKS, Truetone, Voodoo Lab, MXR, Pedaltrain), Reverb.com public listings, The Gear Page community forums, and pedalboard-layout guides (Sweetwater, Andertons). Prices are sampled at the date shown on each recommendation and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by electrical compatibility (current draw, voltage, isolated outputs) and fit to your stated pedal set and board size.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "Build my first ambient board with delay and reverb"
- "Power 8 pedals with proper current isolation"
- "Compact 12x18 board for fly gigs"

## Error state

"Can't find a power supply that covers your pedal set's total current draw within the constraints you set. Try loosening one: [list of binding constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end pedalboard flow ships. This stub establishes the contract consumed by `engine/ui/`.
