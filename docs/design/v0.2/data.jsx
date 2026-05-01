// data.jsx — slice of the real KB shape, hand-shrunk for the prototype.
// Exposed on window so other Babel scripts can reach it.

const ECOSYSTEMS = [
  { id: "homekit",        name: "Apple HomeKit",   short: "homekit",        controllers: "HomePod / Apple TV 4K" },
  { id: "google_home",    name: "Google Home",     short: "google",         controllers: "Nest Hub / Nest Mini" },
  { id: "alexa",          name: "Amazon Alexa",    short: "alexa",          controllers: "Echo / Echo Hub" },
  { id: "home_assistant", name: "Home Assistant",  short: "home-asst",      controllers: "any HA instance" },
];

const DEVICE_TYPES = [
  { id: "smart_bulb",         label: "Smart bulb",          slug: "bulb" },
  { id: "smart_plug",         label: "Smart plug",          slug: "plug" },
  { id: "motion_sensor",      label: "Motion sensor",       slug: "motion" },
  { id: "contact_sensor",     label: "Door / window sensor",slug: "contact" },
  { id: "smart_switch",       label: "Wall switch / dimmer",slug: "switch" },
  { id: "smart_lock",         label: "Smart lock",          slug: "lock" },
  { id: "thermostat",         label: "Thermostat",          slug: "thermostat" },
  { id: "leak_sensor",        label: "Water leak sensor",   slug: "leak" },
  { id: "temperature_sensor", label: "Temp / humidity",     slug: "temp" },
  { id: "smart_shade",        label: "Motorized shade",     slug: "shade" },
];

const SOURCES = [
  { id: 0, name: "Home Assistant integrations registry", url: "https://www.home-assistant.io/integrations/", ingest: "2026-04-21" },
  { id: 1, name: "CSA Matter Certified Products DB",     url: "https://csa-iot.org/csa-iot_products/",         ingest: "2026-04-21" },
  { id: 2, name: "Zigbee2MQTT supported devices",        url: "https://www.zigbee2mqtt.io/supported-devices/", ingest: "2026-04-21" },
  { id: 3, name: "Manufacturer product documentation",   url: "",                                              ingest: "2026-04-21" },
];

const ENTITIES = [
  // bulbs
  {
    id:"hue_color_a19", type:"smart_bulb",
    name:"Philips Hue White & Color A19", brand:"Philips Hue", model:"LCA001",
    protocol:"Zigbee", hub:"hue_bridge", price:49.99, srcs:[0,2,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Native to all four ecosystems via the Hue Bridge — most polished software stack on the market.",
    specs:[["Lumens","800 lm"],["Color","RGB + tunable white"],["Base","E26"],["Power","mains"]],
  },
  {
    id:"lifx_a19", type:"smart_bulb",
    name:"LIFX A19 1100lm", brand:"LIFX", model:"LBE32E26US",
    protocol:"Wi-Fi", hub:"none", price:34.99, srcs:[0,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Brightest pick at 1,100 lm and no hub, but Wi-Fi joins your AP client count.",
    specs:[["Lumens","1100 lm"],["Color","RGB + tunable"],["Base","E26"],["Power","mains"]],
  },
  {
    id:"nanoleaf_a19", type:"smart_bulb",
    name:"Nanoleaf Essentials A19", brand:"Nanoleaf", model:"NL45-0800",
    protocol:"Thread + Matter", hub:"thread_border_router", price:19.99, srcs:[0,1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    featured:true,
    summary:"Matter-over-Thread — survives ecosystem switches without re-buying. Cheapest commodity-priced color bulb that does.",
    specs:[["Lumens","800 lm"],["Color","RGBWW"],["Base","E26"],["Power","mains"]],
  },
  {
    id:"meross_msl120b", type:"smart_bulb",
    name:"Meross HomeKit Smart Bulb", brand:"Meross", model:"MSL120B",
    protocol:"Wi-Fi", hub:"none", price:12.99, srcs:[0,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Cheapest no-hub HomeKit-native bulb. No Matter — so locked to your current ecosystem if you switch later.",
    specs:[["Lumens","810 lm"],["Color","RGB"],["Base","E26"],["Power","mains"]],
  },
  // plugs
  {
    id:"tapo_p125m", type:"smart_plug",
    name:"TP-Link Tapo P125M (Matter)", brand:"Tapo", model:"P125M",
    protocol:"Wi-Fi + Matter", hub:"matter_controller", price:14.99, srcs:[0,1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    featured:true,
    summary:"Matter-over-Wi-Fi. Commissions directly into any Matter controller, no Tapo cloud after pairing.",
    specs:[["Form","plug-mini"],["Max load","1875W"],["Power","mains"],["Energy","yes"]],
  },
  {
    id:"eve_energy", type:"smart_plug",
    name:"Eve Energy (Matter)", brand:"Eve", model:"20EBP8201",
    protocol:"Thread + Matter", hub:"thread_border_router", price:39.95, srcs:[0,1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Thread + Matter, energy metering. Premium spec but the highest-quality data here.",
    specs:[["Form","plug"],["Max load","1800W"],["Power","mains"],["Energy","yes"]],
  },
  {
    id:"switchbot_plug_mini", type:"smart_plug",
    name:"SwitchBot Plug Mini", brand:"SwitchBot", model:"W1901400",
    protocol:"Wi-Fi", hub:"switchbot_hub_matter", price:12.99, srcs:[0,3],
    eco:["homekit","google_home","alexa","home_assistant"],
    native:["home_assistant"],
    bridge:["homekit","google_home","alexa"],
    summary:"HomeKit / Google / Alexa go through a SwitchBot Hub Mini bridging to Matter. Direct HA control without the bridge.",
    specs:[["Form","plug-mini"],["Max load","1875W"],["Power","mains"],["Energy","yes"]],
  },
  // motion
  {
    id:"hue_motion", type:"motion_sensor",
    name:"Philips Hue Motion Sensor", brand:"Philips Hue", model:"SML001",
    protocol:"Zigbee", hub:"hue_bridge", price:44.99, srcs:[0,2,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Lux + temp + motion in one battery sensor. Native via Hue Bridge across all four ecosystems.",
    specs:[["Power","2x AAA"],["Range","indoor"],["Lux","yes"],["Temp","yes"]],
  },
  {
    id:"eve_motion_matter", type:"motion_sensor",
    name:"Eve Motion (Matter)", brand:"Eve", model:"20EBR9901",
    protocol:"Thread + Matter", hub:"thread_border_router", price:49.95, srcs:[0,1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    featured:true,
    summary:"IPX3 weather-resistant — the only outdoor-rated Matter motion sensor at this price.",
    specs:[["Power","2x AA"],["Range","indoor + IPX3"],["Lux","yes"],["Temp","yes"]],
  },
  {
    id:"aqara_motion_p1", type:"motion_sensor",
    name:"Aqara Motion Sensor P1", brand:"Aqara", model:"RTCGQ14LM",
    protocol:"Zigbee 3.0", hub:"aqara_hub", price:24.99, srcs:[0,2,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["home_assistant"], bridge:["homekit","google_home","alexa"],
    summary:"Cheapest cross-ecosystem motion if you already have an Aqara hub. HA via Z2M without the hub.",
    specs:[["Power","CR2450"],["Range","indoor"],["Lux","yes"],["Sensitivity","tunable"]],
  },
  // locks
  {
    id:"aqara_u100", type:"smart_lock",
    name:"Aqara Smart Lock U100", brand:"Aqara", model:"AE-XM-JT0005U",
    protocol:"Wi-Fi + Matter", hub:"none", price:189.99, srcs:[1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    featured:true,
    summary:"Matter-over-Wi-Fi with Apple Home Key support. No hub, all four ecosystems, tap-to-unlock with a phone or watch.",
    specs:[["Form","retrofit + keypad"],["Power","4x AA"],["Home Key","yes"],["Fingerprint","yes"]],
  },
  {
    id:"yale_assure_2", type:"smart_lock",
    name:"Yale Assure 2 with Matter", brand:"Yale", model:"YRD450-MAT",
    protocol:"Thread + Matter", hub:"thread_border_router", price:259.99, srcs:[1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"Thread-based — better battery life than Wi-Fi locks. Needs a Thread border router (HomePod, Apple TV, Echo 4th gen, etc.).",
    specs:[["Form","deadbolt + keypad"],["Power","4x AA"],["Home Key","no"],["Fingerprint","no"]],
  },
  {
    id:"schlage_encode_plus", type:"smart_lock",
    name:"Schlage Encode Plus", brand:"Schlage", model:"BE499",
    protocol:"Wi-Fi", hub:"none", price:299.99, srcs:[1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"BHMA Grade 1 deadbolt with Apple Home Key. Premium build, premium price, no hub.",
    specs:[["Form","deadbolt + keypad"],["Power","4x AA"],["Home Key","yes"],["Grade","BHMA 1"]],
  },
  // thermostat
  {
    id:"ecobee_premium", type:"thermostat",
    name:"Ecobee Smart Thermostat Premium", brand:"Ecobee", model:"EB-STATE6P-01",
    protocol:"Wi-Fi", hub:"none", price:249.99, srcs:[0,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    featured:true,
    summary:"Built-in Alexa speaker + far-field mic, ships with one remote sensor, native to all four ecosystems.",
    specs:[["C-wire","required"],["Remote sensors","yes"],["Built-in voice","Alexa"],["Display","color touch"]],
  },
  {
    id:"nest_4th_gen", type:"thermostat",
    name:"Nest Learning Thermostat 4th gen", brand:"Google Nest", model:"GA03418-US",
    protocol:"Wi-Fi + Matter", hub:"matter_controller", price:279.99, srcs:[0,1,3],
    eco:["homekit","google_home","alexa","home_assistant"], native:["homekit","google_home","alexa","home_assistant"],
    bridge:[],
    summary:"First Nest Learning gen with Matter — finally gives Google's marquee line a HomeKit path.",
    specs:[["C-wire","not required"],["Remote sensors","yes"],["Learning","yes"],["Display","Soli + circular"]],
  },
];

const REASONING = [
  { step:"Filter to user's ecosystem", body:"Inputs: ecosystem={ECO}, wants={WANTS}. Drop entities whose ecosystems list does not include {ECO}, or which list it under ecosystems_unsupported.", srcs:[1,3], fired:true },
  { step:"Apply protocol → hub constraints", body:"Constraints C1, C2, C3, C5 fire on remaining entities. Each entity's required hub is annotated; protocol mismatches are dropped (none in this set).", srcs:[1,2], fired:true },
  { step:"Score for native vs. bridge path", body:"Goal G1 maximize: prefer entities where the chosen ecosystem appears in the native list, not just the bridged list. Bridged picks remain available with a 'via bridge' badge.", srcs:[3], fired:true },
  { step:"Prefer Matter when tied", body:"Goal G3 fires when two entities are equally compatible — Matter-certified ones survive ecosystem switches without re-buying. Featured picks come from this rule.", srcs:[1,3], fired:true },
  { step:"Minimize distinct hubs across picks", body:"Goal G2 minimize: across all selected entities, prefer combinations that share an existing required hub over ones that introduce a new one.", srcs:[3], fired:true },
  { step:"Top-N per device type", body:"Pick the top 3 per requested device type. Featured = top score in section. Sources cited per pick on every card.", srcs:[3], fired:false },
];

const PRESETS = [
  {
    id:"matter_first_apartment",
    label:"Matter-first apartment starter",
    tag:"new build",
    desc:"Smallest hub footprint. All-Matter where possible; Thread border router via existing HomePod or Apple TV 4K.",
    eco:"homekit",
    wants:["smart_bulb","smart_plug","motion_sensor"],
    meta:["3 device types","≤ 1 hub","Matter ≥ 80%"],
  },
  {
    id:"home_assistant_zigbee",
    label:"Home Assistant + Zigbee maximalist",
    tag:"power user",
    desc:"Direct local control via Z2M. Cheapest sensors, no cloud, no vendor hubs.",
    eco:"home_assistant",
    wants:["motion_sensor","contact_sensor","temperature_sensor"],
    meta:["3 device types","Z2M only","cloud=0"],
  },
  {
    id:"alexa_renter",
    label:"Alexa renter, no rewiring",
    tag:"renter-friendly",
    desc:"No-neutral, no-hub, no-rewire. Battery + Wi-Fi only. Good for rentals.",
    eco:"alexa",
    wants:["smart_bulb","smart_plug","leak_sensor"],
    meta:["3 device types","battery + Wi-Fi","no rewire"],
  },
  {
    id:"google_home_security",
    label:"Google Home — entry security",
    tag:"safety pack",
    desc:"Front door + window coverage. Smart lock with keypad, contact sensors on side entries, motion in hallway.",
    eco:"google_home",
    wants:["smart_lock","contact_sensor","motion_sensor"],
    meta:["3 device types","keypad lock","Matter preferred"],
  },
];

const HUB_LABELS = {
  none: "no extra hub",
  hue_bridge: "Hue Bridge",
  aqara_hub: "Aqara Hub M3",
  thread_border_router: "Thread border router",
  matter_controller: "Matter controller",
  switchbot_hub_matter: "SwitchBot Hub Mini",
  lutron_smart_bridge_pro_2: "Lutron Smart Bridge Pro 2",
};

const HUB_PRICES = {
  hue_bridge: 59,
  aqara_hub: 69,
  switchbot_hub_matter: 39,
  lutron_smart_bridge_pro_2: 159,
  thread_border_router: 0,   // typically already owned (HomePod / Apple TV / Echo)
  matter_controller: 0,
  none: 0,
};

Object.assign(window, {
  ECOSYSTEMS, DEVICE_TYPES, ENTITIES, REASONING,
  SOURCES, PRESETS, HUB_LABELS, HUB_PRICES,
});
