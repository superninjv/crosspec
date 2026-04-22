# engine/llm/

Tiered LLM routing. Vertical-agnostic. Budget ceiling: **<$0.15 per completed configurator session** (direction.md constraint).

## Tiers

| Tier | Model | Use |
|---|---|---|
| 0 | Local (foundry-01, Ollama) | Bulk reformatting, summarization, synthetic example generation, anything non-user-facing. Free. |
| 1 | `claude-haiku-4-5` | Chat turns, clarifying questions, reasoning-chain narration. Default tier for hot-path user turns. |
| 2 | `claude-sonnet-4-6` | Edge cases Haiku can't resolve (ambiguous multi-constraint user goals, unusual compat questions). Routed explicitly, not by default. |
| — | `claude-opus-4-7` | **Never in hot path.** Reserved for offline content generation only. |

## Routing policy

Default: Tier 1. Escalate to Tier 2 only when (a) Tier 1 confidence low, (b) user follow-up indicates Tier 1 misread, or (c) constraint involves >N simultaneous user-provided axes. De-escalate to Tier 0 for anything that is pure mechanical transformation of solver output (not the chat turn itself).

## Per-session budget tracking

Every call records: `{ tier, input_tokens, output_tokens, cost_usd }`. Session total is stopped at $0.15; if the budget is hit mid-session, fall back to Tier 0 + cached templated responses.

## Public interface (target)

```ts
complete(prompt: Prompt, opts: { tier?: 'auto' | 0 | 1 | 2, session_id: string }): Promise<LlmResponse>
```

`Prompt` is a `verticals/<name>/prompts/*.md` file rendered against a context object. The engine does not write prompts — each vertical supplies its own.

## Caching

Cloudflare KV cache on `(vertical, prompt_template_id, normalized_inputs_hash)`. Sessions with identical starting inputs re-use cached Tier-1 draft responses. Invalidation: bump `vertical.version` in `kb.json`.

## Provenance

Responses that cite product facts MUST pull from `kb.json` via the solver, not the LLM's own knowledge. LLM's job is narration + disambiguation, not fact-source. See `solver/README.md` provenance rule.
