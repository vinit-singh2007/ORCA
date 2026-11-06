# ORCA Architecture Doc 6 (Revised) — Seven Memory Planes and Federated Context

**Version 3.0.** Extends the [original seven-plane memory architecture](https://teampflresearch.vercel.app/doc6.html). The crucial legacy insight remains: **memory about a conversation is not current scientific evidence**.

## 1. Seven original planes preserved

| Plane | Original purpose | V3 enhancement |
|---|---|---|
| A. Working | Active task graph, retrieved state and in-flight artifacts | Add remote A2A task IDs, network retry/deadline and wallet-signature *references*, never keys |
| B. Conversation | Chat history and summary | Tenant/project isolation, consent controls, no raw chat on public chains |
| C. User/Operational | Stable user preferences, vessel preferences and accessibility | Distinguish personal data from org policy; no tenant memory cross-injection |
| D. Investigation/Episodic | History of questions, plans and outcomes | Link to research project, approved recipe versions, review/correction events and provider IDs |
| E. Evidence Reference | Scientific evidence links and source metadata | Versioned signed artifacts, source availability, QC, independent review; always recheck freshness |
| F. Scenario | Options and simulations | Preserve assumptions, risk context and comparison methods; historical replay snapshots are separate |
| G. Relationship | Entities linked to datasets, investigations and claims | Org/agent relationships are permissioned; scientific findings remain evidence-based rather than social reputation |

The original memory services and `memory_items`, `memory_embeddings`, `memory_links`, `memory_events` stay. New `research.*` and `federation.*` tables hold authoritative investigation and external task state; memory stores **references/summaries**, not a second inconsistent copy of those records.

## 2. Trust classification

| Source | Trust treatment |
|---|---|
| Authenticated user's statements | Personal memory eligible with scoped consent; do not treat as source-confirmed ocean data |
| ORCA tool outcome | Structured observation/forecast evidence with source time and QC; freshness enforced |
| External agent response | Untrusted until identity, authorization, evidence and scientific method checks |
| Arkiv entity | Public owner/coordination metadata; anyone may publish under a schema name |
| ENS text record | Discovery metadata, not institutional authority or trustworthiness |
| Official advisory | Must be retrieved from authenticated source with issue/valid/expiry and region |
| LLM explanation | Presentation layer, not independently verified scientific fact |

A sentence from a previous answer like “SST was 28°C” may be recalled as conversation context but **must not be reused as a current fact**. It is a pointer to evidence with source/valid time. If expired or superseded, fetch current source or label historical.

## 3. Context packet design

A context packet should be deterministic, bounded, privacy-aware and annotated by trust:

```json
{
  "schema_version":"orca.context_packet/1.0",
  "principal":{"user_id":"...","organization_id":"...","project_id":"...","roles":["researcher"]},
  "request":{"intent":"sst_anomaly_research","region_ref":"private:geometry-uuid","time":"2025-06/2025-08","language":"en"},
  "workflow":{"investigation_id":"...","recipe_version":2,"budget_remaining_usd":3.0},
  "scientific_evidence":[{"evidence_id":"...","kind":"observation","valid_at":"...","source_id":"...","freshness":"historical"}],
  "network":{"provider_candidate_ids":["..."],"authorized_bindings":["..."],"remote_task_ids":["..."]},
  "memory":[{"summary":"User previously examined Gujarat SST","trust":"user_history","citation":"memory-id"}],
  "policy":{"allowed_tools":["data.search","ocean.sst_anomaly"],"restricted_data":true}
}
```

No raw institution credentials or secret keys. Model context must never contain privileged tools or data that the currently authenticated principal cannot access; source documents can contain malicious instructions and must be treated as *untrusted data*.

## 4. Retrieval strategy

Original hybrid retrieval remains: exact structured IDs; time; spatial relation via PostGIS; semantic retrieval only for authorized text; relationship queries with access checks. Order: authenticated principal → tenant/project filter → query intent → exact scientific evidence and current dataset state → bounded episodic notes → optional semantic matches → provenance checks. **Do not use semantic nearest-neighbor results to resolve scientific facts with exact timestamps**.

## 5. New federated session memory

A2A task interactions create a `federation.a2a_sessions` durable record with local task, remote task ID, status, provider agent and idempotency key; short-lived working memory contains only a cache of active remote statuses. Agent Card/ENS/Arkiv records are periodically reconciled with source and expiry. Old remote response content can be retained as signed research artifact but is not trusted merely because it was once in memory.

### Correctly handling corrections

- When an external result is challenged, append review/challenge events and a new corrected artifact.
- Mark previous artifact `challenged` or `superseded` in authoritative research model; never rewrite the original signed bytes.
- Invalidate cached summaries and derived claims that depended on the corrected result.
- Preserve relation graph: original → challenged-by → new artifact → independent reproduction.
- When asked “What did ORCA tell us yesterday?”, return the recorded original response **and clearly mark any later correction**, rather than rewriting history.

## 6. Multi-organization memory isolation

Organization A's raw prompts, results and files must not be injected into Org B's context simply because both claim the same Arkiv task. Use explicit project-sharing grants or authorized evidence disclosure and honor institutional data licenses. Tenant-aware memory read/write policies, encrypted storage, event access logs, key rotation, retention, deletion and consent apply. Public immutable chain commitments must not contain personal chat or sensitive geometry, to avoid irreversibility conflicts with privacy obligations.

## 7. Lifecycle and TTL policy

- Working tasks: minutes/hours, durable checkpoints until completion/cancellation; lease separate from authoritative state.
- Conversation memory: by user/org retention and consent policy, with export/delete pathway.
- Operational preferences: until edited/withdrawn, scoped to principal; do not store secret credentials.
- Investigation history and evidence: project and license-defined retention, append-only revision semantics and archival policy.
- Arkiv entities: externally configured and time-limited; store entity key/receipt/history, but live queries must check current expiry. Old snapshots in memory are **not** evidence an entity still exists.
- ENS: cached name and binding requires short TTL/refresh and revocation check before sensitive action.

## 8. Memory evaluation and security tests

- Follow-up “What about tomorrow?” inherits location but re-fetches forecast valid time.
- After source changes, no stale forecast appears as current even if mentioned in a previous chat.
- Researcher from a different org cannot retrieve protected investigation memory via embeddings.
- Fake external agent reply containing prompt injection doesn't change tool policy.
- Revoked provider role prevents new A2A delegation even if its Agent Card is cached.
- Multiple scientific versions remain queryable in order, and final summary properly cites the accepted version.
- After public Arkiv expiry, memory shows historical entity receipt with `expired`, not an open task.
- Language personalization does not alter numerical units or warnings.

**Source:** https://teampflresearch.vercel.app/doc6.html. The original document already has working, conversation, user/operational, investigation, evidence-reference, scenario and relationship memory. V3 adds tenant isolation and federation/task provenance.
