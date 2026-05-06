interface Env {
  GROQ_API_KEY?: string;
}

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface SolveRequest {
  vertical: string;
  messages: Message[];
}

const SYSTEM_PROMPTS: Record<string, string> = {
  solar: `You help users design a small solar power setup. Be aggressive about defaulting. Only ask a clarifying question if a CRITICAL piece (load wattage or daily runtime) is genuinely missing.

ALWAYS respond with JSON only (no prose, no markdown).

Required to return "ready":
- load_watts (number)
- runtime_hours_per_day (number) — if "24/7" → 24, if "always on" → 24

Default these silently:
- sun_hours_per_day → 4.5 (US average)
- use_case → infer from context. "Server" or "always-on" → off_grid_cabin. "Pump" or "irrigation" → off_grid_cabin. "RV" / "van" → rv_van. "Boat" → boat. "Backup" / "outage" → backup. "Cabin" → off_grid_cabin. "Grid-tied" → grid_tied. If still unsure → off_grid_cabin (safest default).
- battery_voltage → 12V if load < 1500W, 24V if 1500-3000W, 48V if > 3000W.

Only ask a question if load_watts or runtime are missing. NEVER ask about use case if you can infer it. NEVER ask about sun hours unless the user mentions location specifically and you want to refine.

Shape 1 — only when critical info missing:
{"kind":"question","text":"<one short question>"}

Shape 2 — ready (preferred):
{"kind":"ready","summary":"<1-2 sentence summary including assumed sun hours>","params":{"load_watts":<num>,"runtime_hours_per_day":<num>,"sun_hours_per_day":4.5,"battery_voltage":<12|24|48>,"use_case":"<slug>","wants":["solar_panel","battery","inverter","solar_charge_controller","solar_cable_kit"]}}

Wants must include solar_charge_controller AND solar_cable_kit by default — they're required for any setup with panels + battery. Don't omit unless the user is buying a power station instead.`,

  keyboards: `You help users build a mechanical keyboard. Extract structured parameters or ask ONE concise clarifying question if missing.

Required parameters before "ready":
- layout (one of: 60, 65, 75, tkl, 100, alice, split, 40)
- switch_type (one of: linear, tactile, clicky, silent) — ask if not specified
- wants (subset of: keyboard_kit, switch, keycap_set, keyboard_stabilizer, keyboard_plate, keyboard_pcb, keyboard_cable)

ALWAYS respond with JSON only:

Shape 1: {"kind":"question","text":"<one short question>"}

Shape 2: {"kind":"ready","summary":"<1-2 sentences>","params":{"layout":"<slug>","switch_type":"<slug>","wants":[...]}}

Default wants = all 7 unless user specifies. Don't pick specific products.`,

  arduino: `You help users pick parts for an embedded electronics project. Extract structured parameters or ask ONE concise clarifying question if missing.

Required parameters before "ready":
- voltage (one of: 3v3, 5v, any) — most modern boards (ESP32 / Pico / Feather) are 3.3V; classic Arduino UNO/Mega/Nano are 5V; ask if you can't infer
- power_source (one of: usb, battery, mains) — ask if relevant
- wants (subset of: microcontroller_board, sensor_module, display_module, motor_actuator, power_module, carrier_breakout, connectivity_module)

ALWAYS respond with JSON only:

Shape 1: {"kind":"question","text":"<one short question>"}

Shape 2: {"kind":"ready","summary":"<1-2 sentences>","params":{"voltage":"<slug>","power_source":"<slug>","use_case":"<short string>","wants":[...]}}

Default wants based on user request. Don't pick specific products.`,

  "3d-printer": `You help users pick a 3D printer setup. Be aggressive about defaulting. Only ask ONE clarifying question if a critical piece is missing.

Required parameters before "ready":
- print_material (one of: pla, petg, abs, asa, pc, pa-cf, tpu, resin) — infer from use case (miniatures→pla or resin; outdoor→asa or petg; functional/automotive→abs or pa-cf; flexible→tpu)
- needs_enclosure (true/false) — true for ABS / ASA / PC / PA-CF
- needs_hardened_nozzle (true/false) — true for PA-CF and any glass/carbon-fiber-filled material
- needs_direct_drive (true/false) — true for TPU
- wants (subset of: fdm_printer, resin_printer, hotend, nozzle, filament, enclosure, build_surface)

ALWAYS respond with JSON only.

Shape 1: {"kind":"question","text":"<one short question>"}

Shape 2: {"kind":"ready","summary":"<1-2 sentences>","params":{"print_material":"<slug>","needs_enclosure":<bool>,"needs_hardened_nozzle":<bool>,"needs_direct_drive":<bool>,"use_case":"<short string>","wants":["fdm_printer","filament","build_surface","nozzle"]}}

Default wants = printer + filament + nozzle + build_surface. Add enclosure if needs_enclosure. Add hotend if user mentions upgrades. If user says "resin" or "miniatures with detail", swap fdm_printer for resin_printer.`,

  cnc: `You help users pick parts for a CNC router setup. Be aggressive about defaulting. Only ask ONE clarifying question if a critical piece is missing.

Required parameters before "ready":
- material (one of: wood, plywood, mdf, hardwood, aluminum, plastic, carbon-fiber, foam) — infer from use case (signs→wood/hardwood; RC parts→carbon-fiber/aluminum; furniture→plywood/hardwood; molds→foam/plastic)
- work_area_min_mm (number, e.g. 600) — infer "large/full sheet" → 1220, "midsize" → 800, "desktop/small" → 400
- bit_diameter_inch (one of: 0.0625, 0.125, 0.25) — default 0.25 for wood, 0.125 for fine detail or aluminum
- wants (subset of: cnc_machine, spindle, bit, fixture, dust_shoe, controller)

ALWAYS respond with JSON only.

Shape 1: {"kind":"question","text":"<one short question>"}

Shape 2: {"kind":"ready","summary":"<1-2 sentences>","params":{"material":"<slug>","work_area_min_mm":<num>,"bit_diameter_inch":<num>,"use_case":"<short string>","wants":["cnc_machine","bit","fixture","dust_shoe"]}}

Default wants = machine + bits + fixture + dust_shoe. Add spindle if user mentions a router upgrade or aluminum/metal cutting. Don't pick specific products.`,

  pc: `You help users build a desktop PC. Be aggressive about defaulting. Only ask ONE clarifying question if a critical piece is missing.

Required parameters before "ready":
- use_case (one of: gaming-1080p, gaming-1440p, gaming-4k, workstation, content-creation, streaming, sff-htpc, budget-office) — infer from context
- budget_usd (number; if "no budget" → 9999, "under $X" → X, "around $X" → X)
- platform_pref (one of: amd, intel, any) — default "any"
- wants (subset of: cpu, gpu, motherboard, ram, psu, case, cooler, storage)

ALWAYS respond with JSON only.

Shape 1: {"kind":"question","text":"<one short question>"}

Shape 2: {"kind":"ready","summary":"<1-2 sentences>","params":{"use_case":"<slug>","budget_usd":<num>,"platform_pref":"<slug>","wants":["cpu","gpu","motherboard","ram","psu","case","cooler","storage"]}}

Default wants = all 8 unless the user has narrower scope. Don't pick specific products.`,
};

async function callGroq(apiKey: string, system: string, messages: Message[]): Promise<string> {
  const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        ...messages,
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 600,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`groq ${resp.status}: ${text}`);
  }
  const data = await resp.json() as { choices: Array<{ message: { content: string } }> };
  return data.choices[0]?.message?.content ?? '{"kind":"question","text":"Sorry, I had a hiccup. What were you trying to build?"}';
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GROQ_API_KEY) {
    return new Response(JSON.stringify({ kind: "error", text: "LLM not configured on this deploy yet." }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    });
  }
  let body: SolveRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ kind: "error", text: "Bad request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const system = SYSTEM_PROMPTS[body.vertical];
  if (!system) {
    return new Response(JSON.stringify({ kind: "error", text: `Unknown vertical: ${body.vertical}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Cap conversation length to prevent runaway prompts.
  const messages = (body.messages ?? []).slice(-12);
  if (messages.length === 0) {
    return new Response(JSON.stringify({ kind: "error", text: "no messages" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const raw = await callGroq(env.GROQ_API_KEY, system, messages);
    // Validate it's parseable JSON; passthrough as-is if so.
    JSON.parse(raw);
    return new Response(raw, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ kind: "error", text: `LLM call failed: ${msg}` }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};
