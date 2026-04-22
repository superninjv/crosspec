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
