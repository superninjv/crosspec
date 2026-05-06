# verticals/speakers/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/speakers`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Home Audio Configurator
- **Subheadline:** Tell us your room size, listening habits, and budget. We'll match speakers, amplification, and cables that work together — and show exactly why each part belongs in the build.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, ASR Audio Science Review public measurements, Stereophile published reviews, Audioholics spec sheets, and community references (r/audiophile, What Hi-Fi). Prices are sampled at the date shown and will drift — verify current pricing on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change product ranking, which is determined by electrical compatibility (impedance, power, crossover overlap) and fit to your stated room, source, and budget.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "Stereo + sub for vinyl listening in a small room"
- "5.1 surround for movies under $3000"
- "Networked hi-fi streamer with classical-music focus"

## Error state

"Can't find a configuration that matches your constraints. Try loosening one: [list of binding constraints from solver — e.g. amp power range, impedance floor, cable run length]."
