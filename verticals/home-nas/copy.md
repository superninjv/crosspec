# verticals/home-nas/copy.md — page copy (stub)

## Page

- **URL:** `crosspec.com/home-nas`
- **Template:** `engine/ui/ConfiguratorShell.astro`

## Hero

- **Headline:** Home NAS + Storage Configurator
- **Subheadline:** Tell us your usable-TB target, your workload (Plex / Time Machine / photo library / VMs), and your budget. We'll spec a NAS unit (or a DIY TrueNAS / Unraid build), CMR drives, ECC RAM, an IT-mode HBA when needed, a 10GbE NIC if it pays off, and a UPS sized to ride out a power blip — and explain why each part is in the bill.

## CTA (primary)

- **Label:** Start
- **Action:** focus chat input

## CTA (secondary, post-recommendation)

- **Label:** Open on Amazon
- **Action:** `engine/affiliate/route()`

## Disclaimer (footer, always visible)

Component data sourced from manufacturer spec pages (Synology, QNAP, TerraMaster, UGREEN, Asustor, Western Digital, Seagate, Toshiba, Broadcom / LSI, CyberPower, APC), iXsystems TrueNAS docs, Unraid official docs, ServerBuilds.net DIY guides, and community-maintained references (r/homelab, r/DataHoarder). Prices are sampled at the date shown on each recommendation and will drift — verify on the merchant's page before purchase. crosspec earns an affiliate commission on qualifying purchases via the Amazon Associates program — this does not change ranking, which is determined by drive-bay fit, ECC / DDR-generation match, CMR-only for parity arrays, IT-mode HBA for ZFS, and UPS wattage margin against the build's draw.

## Empty state (chat hasn't started)

Example prompts shown as clickable chips:

- "4-bay Plex media server with 50TB usable"
- "DIY TrueNAS Scale build with ZFS"
- "Synology + Backblaze B2 backup setup"

## Error state

"Can't find a configuration that hits your usable-TB target with the constraints you set. Try loosening one: [list of binding constraints from solver]."
