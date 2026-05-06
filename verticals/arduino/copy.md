# verticals/arduino/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/arduino`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Arduino & Microcontroller Project Configurator
- **Subheadline:** Tell us what you're building. We pick a board, a sensor, a power source, and the carriers — and show you exactly which voltages, libraries, and addresses will work together before you place an order.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Buy via {merchant}
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Compatibility data sourced from open SparkFun and Adafruit product catalogs, the Arduino official store, and vendor datasheets. Ingest dates shown on each recommendation. crosspec earns an affiliate commission on qualifying purchases through SparkFun (Avantlink), Digi-Key and Mouser (Impact), and Amazon (Associates). Adafruit and the official Arduino store have no affiliate program — we route those at zero commission because their catalogs are the authoritative compatibility references for Feather/QT Py/MKR/Portenta and we'd rather you get the part that fits than a copy that doesn't. Affiliate status does not change product ranking; ranking is determined by logic-voltage match, I2C address availability, current budget, and library support against your stated goal.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "I want a battery-powered ESP32 with WiFi that reads soil moisture and triggers a 12V solenoid valve"
- "I'm building a small robot — what board + motor driver + ultrasonic sensor work together at 5V?"
- "I want to log temperature and humidity to an SD card for 6 months on a single 18650 cell"
- "What's the cheapest credible WiFi+BLE board in 2026 if I'm okay with 3.3V logic?"

## Error state

"Can't find a part set that meets your constraints. Try loosening one: [list of unsatisfied constraints from solver — voltage mismatch, current budget, I2C address collision, region-locked radio, etc.]."

## Populated in commit 2

Final headline / subheadline / CTA copy lands when the first end-to-end flow ships. This stub establishes the contract consumed by `engine/ui/`.
