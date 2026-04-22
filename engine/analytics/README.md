# engine/analytics/

Event hook interface. Vertical-agnostic events only. No vertical-specific schema leaks into this module.

## Events (fixed set)

| Event | When | Payload |
|---|---|---|
| `configurator_started` | User lands on a vertical's configurator page | `{ vertical, session_id, entry_ref }` |
| `user_input_received` | Each user turn (chat or form) | `{ vertical, session_id, turn_idx, input_type }` |
| `recommendation_shown` | Solver returns a result set | `{ vertical, session_id, n_recommendations, reasoning_chain_length }` |
| `affiliate_click` | User clicks a product affiliate link | `{ vertical, session_id, sku, merchant, rate_pct }` |
| `session_completed` | User reaches a terminal state (recommendation accepted, form submitted, explicit "done") | `{ vertical, session_id, total_turns, llm_cost_usd, time_ms }` |
| `session_abandoned` | No activity for N minutes | `{ vertical, session_id, last_event, time_ms }` |

Adding an event requires updating this README first. No ad-hoc events.

## Transport

Cloudflare Analytics Engine (free tier, GDPR-friendly per direction.md). Client-side emit via a tiny shim; server-side emit from the affiliate Worker directly.

## Public interface (target)

```ts
emit(event: EventName, payload: EventPayload): void
```

## What this module does NOT do

- No user-identifying analytics (IP, email, account ID). v0.1 has no user accounts.
- No cross-vertical session linking.
- No third-party analytics (GA4, PostHog, Segment). Cloudflare only.

## Vertical events

A vertical that wants to track something vertical-specific (e.g. "user selected HomeKit ecosystem") emits a generic `user_input_received` with `input_type: "ecosystem_selected"`. The analytics engine does not enumerate vertical-specific input types; verticals agree on their own taxonomy inside the generic `input_type` field.
