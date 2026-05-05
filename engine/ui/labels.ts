// Human-readable labels for kb enum values. Smart-home flavoured for v0.1
// (only one vertical exists). When a second vertical lands, this map should
// move to `verticals/<vertical>/labels.ts` and the engine should accept a
// label-map dependency rather than carrying smart-home-specific strings.

const PROTOCOL_LABELS: Record<string, string> = {
  wifi_2_4ghz: "Wi-Fi",
  wifi: "Wi-Fi",
  wifi_5ghz: "Wi-Fi (5 GHz)",
  thread_matter: "Thread + Matter",
  matter_over_wifi: "Matter over Wi-Fi",
  zigbee: "Zigbee",
  zigbee_3_0: "Zigbee 3.0",
  bluetooth_le: "Bluetooth LE",
  bluetooth: "Bluetooth",
  lutron_clear_connect: "Lutron Clear Connect (RF)",
  yolink_lora: "YoLink LoRa",
  z_wave: "Z-Wave",
  ethernet_poe: "Ethernet (PoE)",
};

const HUB_LABELS: Record<string, string> = {
  none: "No extra hub needed",
  hue_bridge: "Needs Hue Bridge",
  aqara_hub_or_zigbee_coordinator: "Needs Aqara hub or Zigbee coordinator",
  any_zigbee_coordinator: "Needs any Zigbee coordinator",
  thread_border_router_plus_matter_controller: "Needs Thread border router + Matter controller",
  switchbot_hub_2_or_mini_with_matter: "Needs SwitchBot Hub 2 or Mini",
  matter_controller: "Needs a Matter controller",
  lutron_smart_bridge_pro_2: "Needs Lutron Smart Bridge Pro 2",
  yolink_hub: "Needs YoLink hub",
  ikea_dirigera_or_tradfri_gateway: "Needs IKEA DIRIGERA or TRÅDFRI gateway",
  thread_border_router_plus_matter_controller_or_aqara_hub: "Needs Thread border router + Matter controller, or Aqara hub",
  homebase_2: "Needs Eufy HomeBase 2",
};

const ECOSYSTEM_LABELS: Record<string, string> = {
  homekit: "Apple HomeKit",
  google_home: "Google Home",
  alexa: "Amazon Alexa",
  home_assistant: "Home Assistant",
};

export function protocolLabel(slug: string): string {
  return PROTOCOL_LABELS[slug] ?? slug.replace(/_/g, " ");
}

export function hubLabel(slug: string): string {
  return HUB_LABELS[slug] ?? `Needs ${slug.replace(/_/g, " ")}`;
}

export function ecosystemLabel(slug: string): string {
  return ECOSYSTEM_LABELS[slug] ?? slug.replace(/_/g, " ");
}

export function otherEcosystems(all: string[], userEcosystem: string): string[] {
  return all.filter((e) => e !== userEcosystem);
}
