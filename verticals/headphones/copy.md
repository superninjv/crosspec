# verticals/headphones/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/headphones`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Headphone Configurator
- **Subheadline:** Tell us how you listen — at a desk, commuting, or in a studio — and we'll match a headphone, DAC/amp, and cable that actually work together, with the measurements to back it up.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec sheets, Crinacle's measurement database, Audio Science Review public measurements, Reference Audio Analyzer, and community references (r/headphones, Head-Fi). Prices will drift — verify on the merchant page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not affect ranking, which is determined by electrical compatibility (impedance, sensitivity, connector fit, output power) and your stated listening use case.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "End-game open-back for desk listening"
- "Quiet portable IEM setup with Apple Music lossless"
- "Closed-back for studio work and noise isolation"

## Error state

"Can't find a configuration that satisfies all your constraints. Try loosening one: [list of binding constraints from solver]."
