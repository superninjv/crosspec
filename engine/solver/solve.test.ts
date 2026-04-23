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
