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

  it("parses HomeKit + thermostat example", () => {
    const m = matchExample(
      "HomeKit household replacing their thermostat — what plays nicely with Apple Home?",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("thermostat");
  });

  it("treats 'smart thermostat' as a thermostat synonym", () => {
    const m = matchExample("Google Home user shopping for a smart thermostat");
    expect(m?.ecosystem).toBe("google_home");
    expect(m?.wants).toContain("thermostat");
  });

  it("parses HomeKit + smart shade / curtain example", () => {
    const m = matchExample(
      "HomeKit apartment — smart curtain that clips onto the existing rod, no rewiring",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("smart_shade");
  });

  it("treats 'motorized blind' as a smart_shade synonym", () => {
    const m = matchExample("Home Assistant user wants a motorized blind in the bedroom");
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("smart_shade");
  });

  it("parses Home Assistant local-NVR camera example", () => {
    const m = matchExample(
      "Home Assistant only, local-NVR security camera with no cloud subscription",
    );
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("camera");
  });

  it("treats 'indoor camera' as a camera synonym", () => {
    const m = matchExample("HomeKit household: indoor pan-and-tilt camera with HomeKit Secure Video");
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("camera");
  });

  it("parses HomeKit + video doorbell example", () => {
    const m = matchExample(
      "Apple HomeKit household needs a video doorbell with HomeKit Secure Video",
    );
    expect(m?.ecosystem).toBe("homekit");
    expect(m?.wants).toContain("doorbell");
  });

  it("treats 'PoE doorbell' as a doorbell synonym", () => {
    const m = matchExample("Home Assistant only, PoE doorbell with no cloud and no battery to recharge");
    expect(m?.ecosystem).toBe("home_assistant");
    expect(m?.wants).toContain("doorbell");
  });
});

describe("renderSolutionHTML", () => {
  it("produces HTML with pcards, results head, meta strip, and reasoning", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb", "motion_sensor"],
      picks_per_type: 2,
    });
    const html = renderSolutionHTML(solution, "smart-home");

    expect(html).toContain('class="results-head"');
    expect(html).toContain('class="meta-strip"');
    expect(html).toContain('class="pcard');
    expect(html).toContain('<details class="reasoning"');
    expect(html).toContain('href="/go/smart-home/');
    // Meta strip cells include the user's ecosystem label
    expect(html).toContain("Apple HomeKit");
  });

  it("renders the empty-state when no picks match", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["nonexistent_type"],
      picks_per_type: 2,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain('class="empty"');
    expect(html).toContain("Pick a device type");
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

  it("renders a Thermostats section when thermostat picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["thermostat"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Thermostats</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Smart shades & blinds section when shade picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_shade"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Smart shades &amp; blinds</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Security cameras section when camera picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "home_assistant",
      wants: ["camera"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Security cameras</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders a Video doorbells section when doorbell picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["doorbell"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("<h3>Video doorbells</h3>");
    expect(html).toContain('href="/go/smart-home/');
  });

  it("renders the price line in the pcard footer for entities with price_usd", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb"],
      picks_per_type: 5,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    // Some priced bulb should appear in the top picks regardless of which
    // ranks first as the KB grows. Match the price-class shape, not a specific dollar value.
    expect(html).toMatch(/class="price">\$\d+(\.\d{1,2})?<\/span>/);
  });

  it("renders the meta-strip price-freshness cell when picks are present", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain("price freshness");
    expect(html).toContain("2026-05-05");
  });

  it("omits the meta-strip when there are no picks", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["unknown_device_type_xyz"],
      picks_per_type: 3,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).not.toContain("meta-strip");
  });

  it("renders the compat-strip with all four ecosystem cells per card", () => {
    const [solution] = solve(kb, {
      ecosystem: "homekit",
      wants: ["smart_bulb"],
      picks_per_type: 1,
    });
    const html = renderSolutionHTML(solution, "smart-home");
    expect(html).toContain('class="compat-strip"');
    expect(html).toMatch(/compat-cell s-(native|bridge|no)( s-active)?/);
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

  it("returns inputs with empty wants when wants param is missing or empty", () => {
    // The v0.2 configurator allows ecosystem-only state — the user can pick
    // an ecosystem first and the page shows an empty-state prompt to add devices.
    expect(decodeInputs("#ecosystem=homekit")).toEqual({
      ecosystem: "homekit",
      wants: [],
      picks_per_type: 3,
    });
    expect(decodeInputs("#ecosystem=homekit&wants=")).toEqual({
      ecosystem: "homekit",
      wants: [],
      picks_per_type: 3,
    });
  });

  it("accepts a leading # or not", () => {
    const withHash = decodeInputs("#ecosystem=homekit&wants=smart_bulb");
    const without = decodeInputs("ecosystem=homekit&wants=smart_bulb");
    expect(withHash).toEqual(without);
  });
});
