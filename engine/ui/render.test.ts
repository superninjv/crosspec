import { describe, it, expect } from "vitest";
import {
  matchExample,
  renderSolutionHTML,
  encodeInputs,
  decodeInputs,
} from "./render.js";
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

  it("parses HomeKit + smart plug example", () => {
    const m = matchExample(
      "HomeKit household looking for a Matter smart plug",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("smart_plug");
  });

  it("treats 'outlet' as a smart_plug synonym", () => {
    const m = matchExample("Alexa user shopping for a smart outlet");
    expect(m?.ecosystem).toBe("alexa");
    expect(m?.wants).toContain("smart_plug");
  });

  it("parses HomeKit + smart lock example", () => {
    const m = matchExample(
      "I'm on Apple HomeKit and want a smart lock with Home Key",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("smart_lock");
  });

  it("treats 'deadbolt' as a smart_lock synonym", () => {
    const m = matchExample("Google Home user shopping for a Wi-Fi deadbolt");
    expect(m?.ecosystem).toBe("google_home");
    expect(m?.wants).toContain("smart_lock");
  });

  it("parses Home Assistant + temperature/humidity sensor example", () => {
    const m = matchExample(
      "Home Assistant user wants a temperature and humidity sensor in every room",
    );
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("temperature_sensor");
  });

  it("treats 'hygrometer' as a temperature_sensor synonym", () => {
    const m = matchExample("HomeKit household looking for a hygrometer");
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("temperature_sensor");
  });

  it("parses HomeKit + door and window sensor example", () => {
    const m = matchExample(
      "HomeKit household wants a Matter door and window sensor",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("contact_sensor");
  });

  it("treats 'contact sensor' as a contact_sensor synonym", () => {
    const m = matchExample("Home Assistant user adding a contact sensor");
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("contact_sensor");
  });

  it("parses HomeKit + smart switch / dimmer example", () => {
    const m = matchExample(
      "HomeKit no-neutral retrofit — smart dimmer that works with existing wiring",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("smart_switch");
  });

  it("treats 'wall switch' as a smart_switch synonym", () => {
    const m = matchExample("Home Assistant user wants a Zigbee wall switch");
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("smart_switch");
  });

  it("parses Home Assistant + water leak sensor example", () => {
    const m = matchExample(
      "Home Assistant user wants a water leak sensor under every sink",
    );
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("leak_sensor");
  });

  it("treats 'flood sensor' as a leak_sensor synonym", () => {
    const m = matchExample("HomeKit household shopping for a flood sensor");
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("leak_sensor");
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

  it("renders a Smart plugs section when plug picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_plug"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Smart plugs</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Smart locks section when lock picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_lock"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Smart locks</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Temperature & humidity section when temp picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["temperature_sensor"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Temperature &amp; humidity</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Door & window sensors section when contact picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["contact_sensor"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Door &amp; window sensors</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Smart switches & dimmers section when switch picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_switch"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Smart switches &amp; dimmers</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Water leak sensors section when leak picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "home_assistant",
      wants: ["leak_sensor"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Water leak sensors</h3>");
    expect(html).toContain('href="/go/smart-home/');
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

describe("encodeInputs / decodeInputs", () => {
  it("round-trips a typical config", () => {
    const inputs = {
      ecosystem: "homekit",
      wants: ["smart_bulb", "motion_sensor"],
      picks_per_type: 3,
    };
    const encoded = encodeInputs(inputs);
    const decoded = decodeInputs("#" + encoded);
    expect(decoded).toEqual(inputs);
  });

  it("produces a human-readable hash", () => {
    const encoded = encodeInputs({
      ecosystem: "alexa",
      wants: ["smart_bulb"],
      picks_per_type: 3,
    });
    expect(encoded).toBe("ecosystem=alexa&wants=smart_bulb");
  });

  it("returns null for empty or missing hash", () => {
    expect(decodeInputs("")).toBeNull();
    expect(decodeInputs("#")).toBeNull();
  });

  it("returns null when ecosystem is missing", () => {
    expect(decodeInputs("#wants=smart_bulb")).toBeNull();
  });

  it("returns null when wants is missing or empty", () => {
    expect(decodeInputs("#ecosystem=homekit")).toBeNull();
    expect(decodeInputs("#ecosystem=homekit&wants=")).toBeNull();
  });

  it("accepts a leading # or not", () => {
    const withHash = decodeInputs("#ecosystem=homekit&wants=smart_bulb");
    const without = decodeInputs("ecosystem=homekit&wants=smart_bulb");
    expect(withHash).toEqual(without);
  });
});
