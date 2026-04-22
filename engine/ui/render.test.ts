import { describe, it, expect } from "vitest";
import { matchExample, renderSolutionHTML } from "./render.js";
import { solve } from "../solver/index.js";
import type { KnowledgeBase } from "../solver/index.js";
import kbRaw from "../../verticals/smart-home/kb.json" with { type: "json" };

const kb = kbRaw as KnowledgeBase;

describe("matchExample", () => {
  it("parses HomeKit + motion + bulb example", () => {
    const m = matchExample(
      "I'm on Apple HomeKit and want a motion sensor and a smart bulb",
    );
    expect(m).toEqual({
      ecosystem: "homekit",
      wants: ["motion_sensor", "smart_bulb"],
      picks_per_type: 3,
    });
  });

  it("parses Alexa bulb-only example", () => {
    const m = matchExample("Alexa user adding a smart bulb — what plays nicely?");
    expect(m?.ecosystem).toBe("alexa");
    expect(m?.wants).toEqual(["smart_bulb"]);
  });

  it("parses Home Assistant motion sensor example", () => {
    const m = matchExample(
      "Home Assistant setup, show me motion sensors that don't need a hub",
    );
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("motion_sensor");
  });

  it("returns null when ecosystem keyword is missing", () => {
    expect(matchExample("Just show me a smart bulb")).toBeNull();
  });

  it("returns null when device-type keyword is missing", () => {
    expect(matchExample("I use Apple HomeKit, what should I buy")).toBeNull();
  });
});

describe("renderSolutionHTML", () => {
  it("produces HTML with product cards and reasoning for a real solver run", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb", "motion_sensor"],
      picks_per_type: 2,
    });
    const html = renderSolutionHTML(solution, "smart-home");

    expect(html).toContain('<h2>Ecosystem: <code>homekit</code>');
    expect(html).toContain('class="product-card"');
    expect(html).toContain('<details class="reasoning"');
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders an 'empty' note when no picks match", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["nonexistent_type"],
      picks_per_type: 2,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("No compatible devices");
  });

  it("escapes HTML special characters in inputs", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb"],
      picks_per_type: 1,
    });
    solution.inputs.ecosystem = '<script>alert(1)</script>';
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });
});
