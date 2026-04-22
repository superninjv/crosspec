export interface Source {
  id: number;
  name: string;
  url: string;
  ingest_date: string;
  scope?: string;
}

export interface EntityAttributes {
  brand?: string;
  model?: string;
  protocol?: string;
  requires_hub?: string;
  ecosystems?: string[];
  ecosystems_via_aqara_hub?: string[];
  ecosystems_via_gateway?: string[];
  ecosystems_via_sengled_hub?: string[];
  ecosystems_via_matter_firmware?: string[];
  ecosystems_unsupported?: string[];
  source_ids: number[];
  [k: string]: unknown;
}

export interface Entity {
  id: string;
  type: string;
  name: string;
  sku?: string;
  attributes: EntityAttributes;
}

export interface Constraint {
  id: string;
  kind: "requires" | "excludes" | "implies" | "one_of";
  when: Record<string, unknown>;
  then: Record<string, unknown>;
  rationale: string;
  source_id: number;
}

export interface Goal {
  id: string;
  prompt: string;
  objective: "maximize" | "minimize" | "match";
  target: string;
}

export interface KnowledgeBase {
  version: string;
  vertical: string;
  data_quality?: string;
  sources: Source[];
  ecosystems: string[];
  entities: Entity[];
  constraints: Constraint[];
  goals: Goal[];
}

export interface UserInputs {
  ecosystem: string;
  wants: string[];
  picks_per_type?: number;
}

export interface SourceCitation {
  source_id: number;
  name: string;
  url: string;
  ingest_date: string;
}

export interface ReasoningStep {
  step: string;
  entity_id?: string;
  constraint_id?: string;
  rationale: string;
  sources: SourceCitation[];
}

export interface PickedEntity {
  entity: Entity;
  fired_constraints: string[];
  hub_required: string;
  native_in_ecosystem: boolean;
}

export interface Solution {
  inputs: UserInputs;
  picks: PickedEntity[];
  reasoning_chain: ReasoningStep[];
  warnings: string[];
  score: number;
  hubs_required: string[];
}
