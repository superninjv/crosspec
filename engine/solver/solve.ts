import type {
  KnowledgeBase,
  UserInputs,
  Solution,
  Entity,
  ReasoningStep,
  SourceCitation,
  PickedEntity,
  Constraint,
} from "./types.js";

function citeSources(kb: KnowledgeBase, ids: number[]): SourceCitation[] {
  return ids
    .map((id) => kb.sources.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))
    .map((s) => ({
      source_id: s.id,
      name: s.name,
      url: s.url,
      ingest_date: s.ingest_date,
    }));
}

function entityNativelySupports(entity: Entity, ecosystem: string): boolean {
  const eco = entity.attributes.ecosystems ?? [];
  const unsupported = entity.attributes.ecosystems_unsupported ?? [];
  if (unsupported.includes(ecosystem)) return false;
  return eco.includes(ecosystem);
}

function firedConstraints(kb: KnowledgeBase, entity: Entity): Constraint[] {
  const protocol = entity.attributes.protocol;
  return kb.constraints.filter((c) => {
    if (c.id === "C6_ecosystem_filter") return true;
    const whenProtocol = (c.when as { protocol?: string }).protocol;
    return whenProtocol === protocol;
  });
}

function score(entity: Entity, ecosystem: string): number {
  const native = entityNativelySupports(entity, ecosystem) ? 1 : 0;
  const noHub = entity.attributes.requires_hub === "none" ? 1 : 0;
  const matter = entity.attributes.protocol === "thread_matter" ? 1 : 0;
  const matterViaFirmware =
    (entity.attributes.ecosystems_via_matter_firmware ?? []).length > 0 ? 1 : 0;
  return native * 4 + noHub * 2 + matter * 2 + matterViaFirmware;
}

export function solve(kb: KnowledgeBase, inputs: UserInputs): Solution[] {
  const reasoning: ReasoningStep[] = [];
  const warnings: string[] = [];
  const allPicks: PickedEntity[] = [];
  const picksPerType = inputs.picks_per_type ?? 3;

  const filterC = kb.constraints.find((c) => c.id === "C6_ecosystem_filter");
  if (!filterC) {
    warnings.push("kb missing C6_ecosystem_filter — provenance gap");
  } else {
    reasoning.push({
      step: `Filter all ${kb.entities.length} entities by user ecosystem '${inputs.ecosystem}'`,
      constraint_id: filterC.id,
      rationale: filterC.rationale,
      sources: citeSources(kb, [filterC.source_id]),
    });
  }

  for (const wantType of inputs.wants) {
    const ofType = kb.entities.filter((e) => e.type === wantType);
    reasoning.push({
      step: `Restrict to type '${wantType}' (${ofType.length} candidates)`,
      rationale: `User asked for a ${wantType}; ${ofType.length} entities in kb match that type.`,
      sources: citeSources(kb, [0]),
    });

    const compat = ofType.filter((e) => entityNativelySupports(e, inputs.ecosystem));
    reasoning.push({
      step: `Of ${ofType.length} ${wantType}s, ${compat.length} support '${inputs.ecosystem}'`,
      rationale: `Per C6_ecosystem_filter, an entity is only eligible if its supported-ecosystems list contains the user's chosen ecosystem.`,
      sources: citeSources(kb, [3]),
    });

    if (compat.length === 0) {
      warnings.push(`No ${wantType} compatible with ${inputs.ecosystem} in current kb`);
      continue;
    }

    const ranked = compat
      .map((e) => ({ e, s: score(e, inputs.ecosystem) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, picksPerType);

    for (const { e } of ranked) {
      const fired = firedConstraints(kb, e);
      const hub = e.attributes.requires_hub ?? "unknown";
      const native = entityNativelySupports(e, inputs.ecosystem);

      const pickedSources = citeSources(kb, e.attributes.source_ids);
      reasoning.push({
        step: `Pick: ${e.name} (${e.id})`,
        entity_id: e.id,
        rationale:
          `${e.name} (${e.attributes.brand ?? "?"} ${e.attributes.model ?? "?"}) speaks ${e.attributes.protocol ?? "?"}` +
          (hub === "none"
            ? ` and connects directly without a hub`
            : `, requires hub: ${hub}`) +
          `. Supported ecosystems per cited sources: ${(e.attributes.ecosystems ?? []).join(", ")}.`,
        sources: pickedSources,
      });

      for (const c of fired) {
        if (c.id === "C6_ecosystem_filter") continue;
        reasoning.push({
          step: `Constraint fired on ${e.id}: ${c.id}`,
          entity_id: e.id,
          constraint_id: c.id,
          rationale: c.rationale,
          sources: citeSources(kb, [c.source_id]),
        });
      }

      allPicks.push({
        entity: e,
        fired_constraints: fired.map((c) => c.id),
        hub_required: hub,
        native_in_ecosystem: native,
      });
    }
  }

  const hubs = Array.from(
    new Set(allPicks.map((p) => p.hub_required).filter((h) => h && h !== "none")),
  );
  if (hubs.length > 1) {
    warnings.push(
      `Selection requires ${hubs.length} distinct hubs: ${hubs.join(", ")}. Per goal G2_min_hub_count, consider swapping for entities sharing a hub.`,
    );
  }

  const totalScore = allPicks.reduce(
    (acc, p) => acc + score(p.entity, inputs.ecosystem),
    0,
  );

  return [
    {
      inputs,
      picks: allPicks,
      reasoning_chain: reasoning,
      warnings,
      score: totalScore,
      hubs_required: hubs,
    },
  ];
}
