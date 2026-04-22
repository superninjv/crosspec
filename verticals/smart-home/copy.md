# verticals/smart-home/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/smart-home`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Smart Home Compatibility Configurator
- **Subheadline:** Tell us your ecosystem and what you want to add. We'll pick compatible devices and show exactly why they work.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Buy via {merchant}
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Compatibility data sourced from Home Assistant integrations registry, Zigbee2MQTT supported devices list, and CSA Matter Certified Products database. Ingest dates shown on each recommendation. crosspec earns an affiliate commission on qualifying purchases — this does not change product ranking, which is determined by compatibility and fit to your stated goal.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "I'm on Apple HomeKit and want a motion sensor and a smart bulb"
- "I want Matter-over-Thread devices that work with Home Assistant"
- "What's the cheapest way into Zigbee without committing to Philips Hue"

## Error state

"Can't find a match for that set of constraints. Try loosening one: [list of constraints from solver]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end flow ships. This stub establishes the contract consumed by `engine/ui/`.
