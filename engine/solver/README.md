# engine/solver/

Constraint-satisfaction engine. Vertical-agnostic.

## Responsibility

Given (1) a vertical's `kb.json` and (2) a set of user inputs, return a ranked list of compatible product combinations with a human-readable reasoning chain.

The solver does NOT know what "smart home" or "solar" means. It knows: entities, attributes, constraints, user goals, and how to score combinations.

## `kb.json` schema (contract)

```json
{
  "version": "0.1",
  "vertical": "<slug>",
  "sources": [
    { "name": "Home Assistant integrations registry",
      "url": "https://...",
      "ingest_date": "2026-04-21" }
  ],
  "entities": [
    { "id": "<stable-id>",
      "type": "<vertical-defined-type>",
      "name": "human-readable",
      "attributes": { "<key>": "<value>" },
      "sku": "<optional, matches affiliates.json key>" }
  ],
  "constraints": [
    { "id": "<stable-id>",
      "kind": "requires | excludes | implies | one_of",
      "when": { "<attribute>": "<value>" },
      "then": { "<attribute>": "<value>" },
      "rationale": "human-readable WHY, cites sources[].name",
      "source_id": "<index into sources[]>" }
  ],
  "goals": [
    { "id": "<stable-id>",
      "prompt": "user-facing goal description",
      "objective": "maximize | minimize | match",
      "target": "<attribute or expression>" }
  ]
}
```

## Public interface (TypeScript, target)

```ts
solve(kb: KnowledgeBase, inputs: UserInputs): Solution[]
```

`Solution` includes: selected entities, per-constraint satisfaction status, reasoning chain (array of {constraint_id, rationale, source}), warnings, and a score.

## Non-goals

- Full CSP / SAT solver. v0.1 is rule-walking with explicit rationale emission. Upgrade later if a vertical demands it.
- Optimizer over continuous variables. If a vertical needs that (e.g. solar panel sizing), the vertical provides a pre-computed lookup table in `kb.json`; the solver does not run pvlib.

## Provenance (hard rule)

Every returned `reasoning_chain[]` entry MUST carry a `source` field citing `kb.sources[source_id].name + url + ingest_date`. No reasoning without attribution.
