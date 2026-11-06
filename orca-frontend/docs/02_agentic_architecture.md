# ORCA Architecture Doc 2 (Revised) — Agentic System, Federation and Trust

**Version:** 3.0. Extends [original Doc 2](https://teampflresearch.vercel.app/doc2.html) and the [agentic engineering specification](https://teampflresearch.vercel.app/agentic-spec.html). **Status:** proposed implementation.

## 1. Preserve original ORCA agent logic

Original categories retained: supervisor/planner, data acquisition, ocean & ecosystem, weather/hazard, geospatial, decision/risk/operations, evidence validation and response synthesis. The old dossier catalogs **114 logical tool functions** across data, location, ocean, weather, geo, risk, route, visualization/evidence and alerts. They remain the baseline registry, **not 114 actual external APIs or 114 independently running agents**.

Important separation: every specialist is a tool-orchestrator; computation runs in typed scientific engines. The old **direct, sequential, concurrent and adaptive** modes remain. Agent-to-tool allow/deny matrix remains default-deny. Existing one-level delegation remains the default for *internal* agents; external A2A is an explicit trust boundary and may contain separately bounded subtasks.

## 2. New logical roles and responsibilities

| Role | Owns | Must never do |
|---|---|---|
| Internal Supervisor | Intent, scope, DAG, budget, retries, plan evaluation | Numerical measurements or authorize forbidden action |
| Data Agent | Catalog, connector selection, retrieval and provenance | Treat stale memory as current observation |
| Ocean Agent | SST/CHL/current/front/upwelling analysis via engine | Invent PFZ or imply direct catch certainty |
| Weather Agent | Wind/wave/swell/IMD official advisories | Override official bulletin |
| Geo Agent | GeoFlow graphs, raster/vector sampling, boundary tests | Assume bathymetry proves chart-quality navigability |
| Decision Agent | Risk and scenario comparisons with uncertainty | Make unreviewed high-impact operational decisions |
| Evidence Gate | Validate evidence availability, freshness, spatial/temporal match, method | Replace source evidence with fluent text |
| Synthesizer | Traceable, accessible final language | Output unsupported precise numbers |
| **Federation Coordinator** | External provider discovery, capability matching, A2A delegation, task lifecycle | Trust unverified Agent Cards or public entities |
| **Identity & Authorization Service** | ENS resolution, org credentials, binding, key rotation/revocation | Equate wallet ownership with scientific accreditation |
| **External Agent Gateway** | A2A protocol, transport, tracing, service auth, isolation | Proxy arbitrary SSRF endpoints |
| **Scientific Reproducer** | Independent calculation from cited inputs and approved method | Claim causal truth from numerical agreement alone |
| **Challenge Resolver** | Explain discrepancies, choose recalculation/abstain | Majority-vote scientific correctness |
| **Research Model Evaluator** | Frozen tests, model and tool-call assessments | Train on held-out future observations |

Provider modes: `orca_hosted` (ORCA runs tools/model; not independent institution), `institution_hosted_a2a` (real remote controlled endpoint), `tool_or_dataset_only` (MCP/scientific connector no LLM required). Model-independent control contracts.

## 3. Updated planning algorithm

```text
request -> authenticate -> resolve location, date/time and risk tier
        -> read constrained user/investigation memory, never substitute for science
        -> create typed data/method requirements
        -> select DIRECT | INTERNAL_MULTI | RESEARCH | FEDERATED | HIGH_IMPACT
        -> compile DAG with dependencies, budgets, deadlines, data-access scopes
        -> select approved local methods or signed external capability
        -> execute source retrieval + QC + deterministic computation
        -> optionally reproduce/compare external evidence
        -> evidence gate: source, method, quality, time, geometry, permissions
        -> if insufficient and within budget: replan via next-best-evidence
        -> otherwise explain supported results or abstain
        -> publish audit trail / private results; only approved public refs to Arkiv
```

The planner outputs a **task graph** and a versioned `InvestigationRecipe`; every task has a deterministic executor type (`scientific_method`, `data_retrieval`, `a2a_remote`, `reproduction`, `render`, `policy_check`) and a precise input/output schema. Do not implement free-form agents passing unchecked messages to arbitrary tools.

## 4. Internal tool registry vs network agent registry

- `tools` = ORCA's internal function/interface registry, including the existing ~114 logical tools. A tool may invoke an MCP server or native Python service.
- `agents` = internal logical roles and independent external services.
- `capability` = functional claim (`sst_anomaly_analysis`, `wave_assessment`, `independent_reproduction`, `protected_area_check`), region/time/variable/method constraints, I/O schemas and accepted method versions.
- **A2A Agent Card** = remote agent self-description, fetched and validated; not proof of verified institutional affiliation.
- **ENSv2** = portable discovery name and resolver records; delegate endpoint management by scoped resolver boundaries.
- **Arkiv** = public task/claim/result-reference/review coordination records; read alongside identity registry; not instruction channel.
- `iam.agent_authorizations` = ORCA's organization-approved key/service/scope binding. Authorizations are checked at both task acceptance and result verification.

### 4.1 Selection scoring (not scientific truth)

Eligible candidates must first satisfy policy, capability, I/O schema, dataset license, geographic/time coverage, organizational authority, endpoints and deadline. Then rank by measured reliability, method support, historical validation, latency, cost and diversity of data/method—not simply number of confirmations or token reputation. Failed checks are hard filters, not numeric penalties. Provider availability and reputation do **not** determine scientific accuracy.

## 5. Example A2A message data: application payload

```json
{
  "type":"orca.scientific_task/1.0",
  "task_id":"uuid",
  "investigation_id":"uuid",
  "required_capability":"sst_anomaly_analysis",
  "region_ref":"opaque-authorized-geometry",
  "time_window":{"start":"2025-06-01T00:00:00Z","end":"2025-08-31T23:59:59Z"},
  "method":{"id":"sst.seasonal_anomaly","version":"1.0"},
  "input_manifest_digest":"sha256:...",
  "deadline":"ISO-8601",
  "authorization_ref":"scoped-token-id",
  "budget":{"currency":"USD","max_amount":2.0},
  "required_outputs":["scientific_artifact","source_manifest","quality_report"]
}
```

This is ORCA application JSON **inside** an A2A message or artifact. Use official A2A 1.x SDK for actual Agent Cards, task lifecycle, cancellation, artifacts and streaming; don't invent A2A wire methods from these examples.

## 6. Task lifecycle and failure semantics

`CREATED → DISCOVERY → PUBLISHED (optional Arkiv) → CLAIMED (zero/many) → ASSIGNED (one permitted result provider unless explicitly multi-awarded) → A2A_ACCEPTED → RUNNING → RESULT_SUBMITTED → REVIEW_REQUIRED → ACCEPTED / CHALLENGED / INCONCLUSIVE / EXPIRED / FAILED / CANCELLED`.

Important:
- Claims are **not** exclusive locks. Requester issues assignment, with a unique assignment constraint in its authoritative database; downstream provider checks signed assignment scope.
- A2A returns remote status/artifact ID; Arkiv write may occur later. Track as separate independent states.
- On timeout, `unknown` is possible. Query idempotency/receipt before retry; don't generate second financial/payment/mutating action.
- A cancelled task must stop tools and revoke delegated access where supported; publication of a later artifact doesn't automatically make it accepted.
- If external findings disagree, a validator compares dataset, baseline, coordinate/depth/time, method, QC and uncertainty; record unresolved if not reconcilable.
- A2A endpoint or tool can be compromised. Signed artifacts + a registered key + scientific verification are all separate checks.

## 7. Identity resolution and cross-network authorization

Process:
1. Resolve ENSv2 agent name against verified chain and resolver.
2. Read `agent-context` and `agent-endpoint[a2a]` text record (ENSIP-26 **draft** convention), discover Agent Card.
3. Check organization credentials and namespace controller permissions, expected endpoint ownership and status.
4. Verify signed binding: `domain`, `chain_id_ens`, `ens_name`, `chain_id_arkiv=7794095`, `arkiv_wallet`, `service_key`, `capabilities/scopes`, `issued_at`, `expires_at`, `nonce`, `binding_version`, `revocation_epoch`.
5. Bind it to the A2A service using authenticated TLS and challenge-response if needed.
6. Read/verify Arkiv `$owner` and creator for each entity plus their signed scientific manifest. Recheck binding at assignment and artifact acceptance, account for key rotation.

**ENSv2 caveat:** PermissionedResolver role grants for a given text key are not scoped to one name across an entire resolver. Assign agent-specific resolver instances or registry isolation and test an unauthorized sibling update. An owned ENS child name also doesn't automatically imply child resolver write permission.

## 8. Capability and trust policy example

```yaml
capability_id: independent_sst_reproduction
providers_allowed: accredited_or_reviewed_institutions
requirements:
  scope: scientific:reproduce
  require_verified_ens_binding: true
  require_signed_artifact: true
  require_dataset_access_grant: true
  require_method_version: true
limits:
  max_runtime_sec: 600
  max_tool_calls: 24
  max_cost_usd: 2.0
  max_replans: 2
  max_parallel_providers: 3
outcomes: [reproduced, challenged, inconclusive, failed]
```

## 9. Event taxonomy and observability

Event log: `plan_approved`, `provider_discovered`, `identity_validated`, `a2a_task_started`, `tool_run_finished`, `source_invalid`, `method_failed`, `evidence_sufficient`, `arkiv_entity_confirmed`, `review_opened`, `challenge_recorded`, `reproduction_finished`, `analysis_abstained`, `workflow_cancelled`, `agent_binding_revoked`.

Schema requires `event_id`, `schema_version`, `trace_id`, `investigation_id`, `task_id`, `organization_id`, `event_type`, `timestamp`, `producer_service`, `security_classification`, redacted payload. Store durable events and use SSE from committed outbox/projection; never broadcast credentials or hidden model deliberation.

## 10. Tests: fail closed

- Official A2A client can read each Agent Card and send a real task to a separately started server.
- A2A tools cannot access other tenants or call forbidden external URLs.
- ENS endpoint record changes reflected after configured cache invalidation; revoked permissions reject updates.
- Forged ENS→Arkiv wallet binding rejected; wrong chain/nonce/audience/expiry rejected.
- Schema-matching fake Arkiv records from unknown wallet ignored.
- Multi-claim race yields one authorized assignment and separate loser/expired outcomes.
- Unit/baseline/forecast time mismatch causes scientific challenge or abstention.
- CPU-heavy jobs cannot starve chat or official alert delivery.
- Provider disappearance yields bounded partial result or explicit failure, never hallucinated success.

## 11. Dependencies and interfaces

Backend: Python/Pydantic/FastAPI and durable task engine (Temporal/Celery+recovery design); Node/TypeScript Arkiv adapter and ENS resolver; Postgres/PostGIS/Redis/S3; A2A 1.x SDK; MCP with auth; OpenTelemetry. Internal agent topology can still run in one process if interfaces/contracts remain stable. Reference: [A2A official](https://a2a-protocol.org/latest/), [MCP official](https://modelcontextprotocol.io/specification/2025-11-25), [ENSv2](https://docs.ens.domains/ensv2/overview/), [Arkiv Rabdi](https://docs.arkiv.network/networks/rabdi/).
