# verticals/car-audio/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/car-audio`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Car Audio System Configurator
- **Subheadline:** Tell us your vehicle, your budget, and what you want to fix. We'll spec a head unit, speakers, amplifier, and wiring kit that all work together — and explain every compatibility decision.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, Crutchfield published specs, SoundDomain public spec PDFs, CarAudio.com public forums, and r/CarAV public threads. Prices will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by electrical compatibility (power matching, impedance, mounting depth, preout count) and fit to your stated vehicle, budget, and use case.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "Front-stage component upgrade for daily driver"
- "Trunk-mounted sub setup for an SUV"
- "Apple CarPlay head unit + amplifier rebuild"

## Error state

"Can't find a configuration that fits your constraints. Try loosening one: [list of binding constraints from solver]."
