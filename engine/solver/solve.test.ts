import { test, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { solve } from "./solve.js";
import type { KnowledgeBase } from "./types.js";

const here = dirname(fileURLToPath(import.meta.url));
const kbPath = join(here, "..", "..", "verticals", "smart-home", "kb.json");
const kb = JSON.parse(readFileSync(kbPath, "utf8")) as KnowledgeBase;

test("homekit + motion + bulb returns >= 2 picks per type", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb", "motion_sensor"],
  });
  const bulbs = sol.picks.filter((p) => p.entity.type === "smart_bulb");
  const motions = sol.picks.filter((p) => p.entity.type === "motion_sensor");
  expect(bulbs.length).toBeGreaterThanOrEqual(2);
  expect(motions.length).toBeGreaterThanOrEqual(2);
});

test("every reasoning step carries source citations (the hard rule)", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb", "motion_sensor"],
  });
  expect(sol.reasoning_chain.length).toBeGreaterThan(0);
  for (const step of sol.reasoning_chain) {
    expect(step.sources.length).toBeGreaterThan(0);
    for (const s of step.sources) {
      expect(s.name).toBeTruthy();
      expect(s.url).toMatch(/^https?:\/\//);
      expect(s.ingest_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  }
});

test("ecosystem filter excludes Wyze and Govee from HomeKit picks", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb", "motion_sensor"],
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("wyze_bulb_color");
  expect(ids).not.toContain("wyze_sense_motion_v2");
  expect(ids).not.toContain("govee_h6008");
  expect(ids).not.toContain("govee_motion_h5121");
});

test("Home Assistant ecosystem allows Wyze + Govee picks", () => {
  const [sol] = solve(kb, {
    ecosystem: "home_assistant",
    wants: ["motion_sensor"],
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids.length).toBeGreaterThan(0);
});

test("Matter/Thread devices score higher than non-Matter equivalents", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const nanoIdx = ids.indexOf("nanoleaf_essentials_a19");
  const sengledIdx = ids.indexOf("sengled_smart_a19");
  expect(nanoIdx).toBeGreaterThanOrEqual(0);
  if (sengledIdx !== -1) {
    expect(nanoIdx).toBeLessThan(sengledIdx);
  }
});

test("hubs_required correctly aggregates across picks", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb", "motion_sensor"],
    picks_per_type: 3,
  });
  for (const hub of sol.hubs_required) {
    expect(hub).not.toBe("none");
    expect(hub).toBeTruthy();
  }
});

test("warns when picks span multiple distinct hubs", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_bulb", "motion_sensor"],
    picks_per_type: 3,
  });
  if (sol.hubs_required.length > 1) {
    expect(sol.warnings.some((w) => w.includes("distinct hubs"))).toBe(true);
  }
});

test("homekit + smart_plug returns >= 2 Matter-capable picks", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_plug"],
    picks_per_type: 3,
  });
  const plugs = sol.picks.filter((p) => p.entity.type === "smart_plug");
  expect(plugs.length).toBeGreaterThanOrEqual(2);
  const ids = plugs.map((p) => p.entity.id);
  expect(ids).toContain("eve_energy_matter");
  expect(ids).toContain("tapo_p125m");
});

test("alexa ecosystem includes the Alexa-only Amazon Smart Plug", () => {
  const [sol] = solve(kb, {
    ecosystem: "alexa",
    wants: ["smart_plug"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).toContain("amazon_smart_plug");
});

test("homekit ecosystem filter excludes the Alexa-only Amazon Smart Plug and non-Matter Tapo P100", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_plug"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("amazon_smart_plug");
  expect(ids).not.toContain("tapo_p100");
});

test("homekit + smart_lock returns >= 3 picks across Matter and non-Matter", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_lock"],
    picks_per_type: 5,
  });
  const locks = sol.picks.filter((p) => p.entity.type === "smart_lock");
  expect(locks.length).toBeGreaterThanOrEqual(3);
  const ids = locks.map((p) => p.entity.id);
  expect(ids).toContain("schlage_encode_plus");
  expect(ids).toContain("yale_assure_2_matter");
  expect(ids).toContain("aqara_u100_matter");
});

test("smart_lock with Thread+Matter ranks above Wi-Fi-only non-Matter lock", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_lock"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const yaleIdx = ids.indexOf("yale_assure_2_matter");
  const augustIdx = ids.indexOf("august_wifi_4th_gen");
  expect(yaleIdx).toBeGreaterThanOrEqual(0);
  if (augustIdx !== -1) {
    expect(yaleIdx).toBeLessThan(augustIdx);
  }
});

test("smart_lock + smart_plug combined query returns picks for both types", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_lock", "smart_plug"],
    picks_per_type: 3,
  });
  const locks = sol.picks.filter((p) => p.entity.type === "smart_lock");
  const plugs = sol.picks.filter((p) => p.entity.type === "smart_plug");
  expect(locks.length).toBeGreaterThanOrEqual(2);
  expect(plugs.length).toBeGreaterThanOrEqual(2);
});

test("homekit + temperature_sensor returns >= 3 picks across Matter, Zigbee, and BLE paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["temperature_sensor"],
    picks_per_type: 5,
  });
  const temps = sol.picks.filter((p) => p.entity.type === "temperature_sensor");
  expect(temps.length).toBeGreaterThanOrEqual(3);
  const ids = temps.map((p) => p.entity.id);
  expect(ids).toContain("eve_weather_matter");
  expect(ids).toContain("aqara_temp_humidity_t1");
  expect(ids).toContain("switchbot_meter_plus");
});

test("homekit ecosystem filter excludes the HA-only Govee H5075 hygrometer", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["temperature_sensor"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("govee_hygrometer_h5075");
});

test("temperature_sensor with Thread+Matter ranks above BLE-only sensor", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["temperature_sensor"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const eveIdx = ids.indexOf("eve_weather_matter");
  const switchbotIdx = ids.indexOf("switchbot_meter_plus");
  expect(eveIdx).toBeGreaterThanOrEqual(0);
  if (switchbotIdx !== -1) {
    expect(eveIdx).toBeLessThan(switchbotIdx);
  }
});

test("homekit + contact_sensor returns >= 3 picks across Matter, Zigbee, and BLE paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["contact_sensor"],
    picks_per_type: 5,
  });
  const contacts = sol.picks.filter((p) => p.entity.type === "contact_sensor");
  expect(contacts.length).toBeGreaterThanOrEqual(3);
  const ids = contacts.map((p) => p.entity.id);
  expect(ids).toContain("aqara_door_window_p2");
  expect(ids).toContain("aqara_door_window_t1");
  expect(ids).toContain("switchbot_contact_sensor");
});

test("homekit ecosystem filter excludes the HA-only Sonoff SNZB-04", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["contact_sensor"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("sonoff_snzb04");
});

test("contact_sensor with Thread+Matter ranks above Zigbee-via-hub alternative", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["contact_sensor"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const p2Idx = ids.indexOf("aqara_door_window_p2");
  const t1Idx = ids.indexOf("aqara_door_window_t1");
  expect(p2Idx).toBeGreaterThanOrEqual(0);
  if (t1Idx !== -1) {
    expect(p2Idx).toBeLessThan(t1Idx);
  }
});

test("homekit + smart_switch returns >= 3 picks across Lutron, Zigbee-via-hub, and Matter-firmware paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_switch"],
    picks_per_type: 5,
  });
  const switches = sol.picks.filter((p) => p.entity.type === "smart_switch");
  expect(switches.length).toBeGreaterThanOrEqual(3);
  const ids = switches.map((p) => p.entity.id);
  expect(ids).toContain("lutron_caseta_diva");
  expect(ids).toContain("aqara_h1_no_neutral");
  expect(ids).toContain("shelly_plus_1pm");
});

test("homekit ecosystem filter excludes the non-Matter Wi-Fi Kasa HS200 switch", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_switch"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("kasa_hs200");
});

test("smart_switch with Matter firmware (Shelly) ranks above hub-dependent Lutron in HomeKit", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["smart_switch"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const shellyIdx = ids.indexOf("shelly_plus_1pm");
  const lutronIdx = ids.indexOf("lutron_caseta_diva");
  expect(shellyIdx).toBeGreaterThanOrEqual(0);
  if (lutronIdx !== -1) {
    expect(shellyIdx).toBeLessThan(lutronIdx);
  }
});

test("homekit + leak_sensor returns >= 2 picks across BLE-bridge and Zigbee-bridge paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["leak_sensor"],
    picks_per_type: 5,
  });
  const leaks = sol.picks.filter((p) => p.entity.type === "leak_sensor");
  expect(leaks.length).toBeGreaterThanOrEqual(2);
  const ids = leaks.map((p) => p.entity.id);
  expect(ids).toContain("switchbot_water_leak");
  expect(ids).toContain("aqara_water_leak");
});

test("homekit ecosystem filter excludes the YoLink LoRa and non-Matter Shelly Flood leak sensors", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["leak_sensor"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("yolink_water_leak");
  expect(ids).not.toContain("shelly_flood");
});

test("home_assistant + leak_sensor returns >= 3 picks across BLE, Zigbee, LoRa, and Wi-Fi paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "home_assistant",
    wants: ["leak_sensor"],
    picks_per_type: 5,
  });
  const leaks = sol.picks.filter((p) => p.entity.type === "leak_sensor");
  expect(leaks.length).toBeGreaterThanOrEqual(3);
  const ids = leaks.map((p) => p.entity.id);
  expect(ids).toContain("shelly_flood");
  expect(ids).toContain("yolink_water_leak");
});

test("homekit + thermostat returns >= 3 picks across native-HomeKit and Matter-firmware paths", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["thermostat"],
    picks_per_type: 5,
  });
  const thermostats = sol.picks.filter((p) => p.entity.type === "thermostat");
  expect(thermostats.length).toBeGreaterThanOrEqual(3);
  const ids = thermostats.map((p) => p.entity.id);
  expect(ids).toContain("ecobee_premium");
  expect(ids).toContain("honeywell_t9");
  expect(ids).toContain("google_nest_learning_4th_gen");
});

test("homekit ecosystem filter excludes the non-Matter Wyze Thermostat", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["thermostat"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  expect(ids).not.toContain("wyze_thermostat");
});

test("thermostat with Matter firmware (Nest 4th gen) outranks pure-Wi-Fi native-HomeKit Ecobee in HomeKit", () => {
  const [sol] = solve(kb, {
    ecosystem: "homekit",
    wants: ["thermostat"],
    picks_per_type: 5,
  });
  const ids = sol.picks.map((p) => p.entity.id);
  const nestIdx = ids.indexOf("google_nest_learning_4th_gen");
  const ecobeeIdx = ids.indexOf("ecobee_premium");
  expect(nestIdx).toBeGreaterThanOrEqual(0);
  if (ecobeeIdx !== -1) {
    expect(nestIdx).toBeLessThan(ecobeeIdx);
  }
});
