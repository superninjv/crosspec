# verticals/mechanical-keyboards/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/mechanical-keyboards`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Mechanical Keyboard Compatibility Configurator
- **Subheadline:** Pick a kit, switches, keycaps, plate, and stabs that actually fit together. We rule out the combos that don't — split spacebar with no Alice keycap kit, 5-pin switches in a 3-pin socket, ISO PCB with an ANSI keycap set — before you find out the hard way.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Buy via {merchant}
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Compatibility data sourced from keebfol.io (community-maintained mechanical keyboard database), the r/MechanicalKeyboards wiki, and manufacturer + retailer public product pages. Ingest dates shown on each recommendation. crosspec earns an affiliate commission on qualifying purchases — this does not change product ranking, which is determined by compatibility and fit to your stated goal.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "I'm a first-time builder, want a hotswap 75% under $250 with QMK"
- "Quietest possible TKL for a shared office, factory-lubed switches only"
- "I have a Keychron Q1 V2 — what keycap sets fit and look like GMK Olivia"
- "Cheapest way into a 60% custom build under $200 total"

## Error state

"Can't find a match for that set of constraints. Try loosening one: [list of constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end flow ships. This stub establishes the contract consumed by `engine/ui/`.
