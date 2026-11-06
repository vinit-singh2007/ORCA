# ORCA 3.0 — Integration Playbook: Exactly Where to Connect the New System to the Old Design

**Goal:** Add Research Studio, federation, ENSv2 and Arkiv to the original ORCA architecture without replacing its conversation, data, scientific, memory or alert systems. **Status:** concrete plan; paths are mapped to *proposed paths in the original master-architecture dossier*, not inspected code.

## 1. Architecture insertion points (old → new)

| Original path/module described in master dossier | Keep intact | V3 insertion point and new module |
|---|---|---|
| `backend/api/chat.py`, `/api/chat/message` | Conversation API, existing localization and map updates | `backend/api/research.py` and research-mode selection; existing chat may optionally refer to research investigation IDs |
| `backend/agents/supervisor.py`, `task_graph.py` | Intent, planner, bounded DAG, budget and replanning | `backend/federation/coordinator.py`: new `a2a_remote` executor; supervisor delegates through interface rather than speaking blockchain directly |
| `backend/agents/data_agent.py`, `ocean_agent.py`, `weather_agent.py`, `geo_agent.py`, `decision_agent.py` | Original internal agents and tool permissions | External A2A agent is *another provider capability*, not a replacement. Add separate provider registry and authorization |
| `backend/agents/evidence_gate.py` | Evidence sufficiency policy | `backend/science/claim_verifier.py`, `reproduction.py`, `challenge.py`, method version registry |
| `backend/data/connectors/*`, `ingestion/*` | ERDDAP/INCOIS/NOAA/IMD/MOSDAC/Copernicus, 10 stages | Add `dataset_snapshots`, `source_licenses`, `as_of_availability` and permissioned institutional source adapter |
| `backend/tools/{gateway,registry,permissions,...}` | Scoped tool access, cache, circuit breaker, tracing | `backend/tools/mcp_provider.py` for external institutional tools, sandbox and explicit ACL |
| `backend/engines/{sst_engine,chl_engine,...}` | Deterministic ocean, risk, routes, scenario, uncertainty | New method-version metadata and independent-run wrapper; no LLM-generated math |
| `backend/geoflow/*`, `backend/state/*` | GeoFlow and Marine State versioning | Research polygon/time/recipe and scientific artifact link, not new arbitrary spatial pipeline |
| `backend/memory/*`, `backend/context/*` | Seven planes and context budgets | Add organization scope and remote artifact references; never share raw chat with public chain |
| `backend/monitoring/*`, alerts | Official warnings and monitoring | Keep separate from chain, federation and agent consensus; optional read-only research monitoring |
| `backend/gateway/*` | JWT, rate limiting, validation, monitoring | Add organization-aware tenancy, signed remote service authentication, trust policy and permitted chain actions |
| Original `PostgreSQL + PostGIS + S3/MinIO + Redis + Parquet` | All preserved | `iam`, `federation`, `research`, `web3`, `audit` additive DB namespaces |
| Original React/Next UI components | Four synchronized surfaces | `apps/research-studio`, `apps/provider-portal`, `apps/verifier` plus shared UI components |

## 2. New service boundaries and request contracts

### Research API (Python)

Receives research question and location/time, invokes original supervisor with `research_mode=true`, returns durable investigation ID. `InvestigationRecipe` is reviewed and versioned. State/worker events are streamed to research workspace. All actual science is performed with the original scientific engines via a versioned method adapter.

### Federation API (Python)

`AgentDiscoveryService.find(capability, region, method, access_scope)`: eligible provider selection; `TrustService.verify(ens_name, agent_key, arkiv_wallet, scope)`; `RemoteTaskExecutor.send_a2a(task, provider)`; `ResultReceiver.validate_and_store_signed_artifact(...)`. Network coordinator does **not** own all provider wallets.

### ENS Adapter (TypeScript/viem)

Reads ENSv2 through correct resolver, validates name/controller, fetches endpoint records and checks scoped per-agent role state; writes only with authorized transaction signer, direct institutional wallet or delegated operator. Emits normalized identity snapshots with resolution block, resolver, service key binding and policy state. The ENSv2 agent endpoint text key is from draft ENSIP-26; accept general ENS records as fallback.

### Arkiv Adapter (TypeScript)

Own client reads filtered public entities, accepts authorized wallet-intent for writes, tracks `create`, `tx submitted`, `confirmed`, `visible to query`, expiry and reconciliation. External providers must be able to interact through **their own clients** for genuine independent ownership; ORCA gateway should not impersonate every organization.

### Scientific Reproducer (Python)

Checks actual source/method/QC/time compatibility and runs approved methods. Produces signed review with method version, independent output and discrepancy code. Arbiters may request a corrected method or report inconclusive; chain commitment is only an integrity check.

## 3. Suggested actual monorepo target

```text
apps/
  web/                     # old marine workspace preserved
  research-studio/         # institutional research projects and scientific panels
  provider-portal/         # institute onboarding, ENS, A2A capability, Arkiv task board
  verifier/                # chain/signature/scientific independent verifier
services/
  api/                     # old chat/alerts + research route
  agent-runtime/           # supervisor + original domain specialists
  data-catalog/            # original connectors, ingestion, rights
  scientific/              # existing 7 engines, versioned methods and QC
  research/                # projects, recipes, historical evaluation, research reports
  federation/              # discovery, A2A client, task dispatch, result and review
  identity/                # credentials and multi-chain bindings
  ens-adapter/             # ENSv2 resolution & scoped record management
  arkiv-adapter/           # Rabdi queries, writes, expiry & tx projector
  audit/                   # authorization, decision and versioned event logs
packages/
  contracts/               # JSON Schema / Pydantic / TypeScript shared DTOs
  scientific-methods/      # numerical and geospatial algorithms
  provenance/              # manifest canonicalization and signature methods
  agent-sdk/               # external institutional onboarding
infra/{docker,k8s,observability}
db/{migrations,seeds}
```

## 4. APIs, functions and data-write owners

| New function | Canonical entry | Writes to | Reads from |
|---|---|---|---|
| Create research project | `POST /v1/research/projects` | `research.projects` | Org membership and policy |
| Submit investigation | `POST /v1/research/investigations` | `research.investigations` + original `workflows` | Original intent/context service |
| Approve method/recipe | `POST /v1/research/investigations/{id}/plan` | `research.investigation_recipes` | `research.method_versions`, source catalog |
| Find external agent | `GET /v1/network/agents` | Discovery trace (not chain) | `iam`, `federation`, live ENS resolver, Agent Cards |
| Verify institutional agent | `POST /v1/identity/verify-ens` | `iam` authorization and event | ENS chain, org credential, binding |
| Publish public task | `POST /v1/network/tasks` | `federation.external_tasks`, `web3.arkiv_write_outbox` | Authenticated principal and scoped recipe |
| Independent claim | `POST /v1/network/tasks/{id}/claims` | Provider-controlled Arkiv wallet and local correlation | Live Arkiv task + org binding |
| Accept claim | `POST /v1/network/tasks/{id}/assign` | Assignment in DB and optional Arkiv ref | Task policy, all candidates, authorization |
| Execute external A2A work | A2A SDK task methods | `federation.a2a_sessions`, remote task state | Agent Card, signed scoped capability |
| Store scientific finding | `POST /v1/network/results` | `research.scientific_artifacts`, object storage; optional public Arkiv ref | Signed result, verified dataset/method/QC |
| Reproduce / challenge | `POST /v1/research/investigations/{id}/reproduce` | `research.independent_reviews` and `research.challenges` | Permitted original artifact and data |
| Finalize research report | `GET /v1/research/investigations/{id}` | Final report bundle | Evidence Gate, all review/correction states |

These are proposed ORCA endpoints, not official A2A or Arkiv API paths. Use generated OpenAPI and schema tests before exposing any route.

## 5. One explicit task object at every boundary

```text
User query (private)
 → investigation_id (private research project)
 → recipe_id + recipe_digest (typed scientific plan)
 → external_task_id + task_public_id (private job + public opaque identifier)
 → Arkiv entity key (public, temporary)
 → accepted_claim_id + binding_id (authorized provider)
 → A2A remote_task_id (transport/session)
 → signed artifact_id + digest + source refs (research result)
 → review_id/challenge_id (independent scientific evaluation)
 → report/export_id (user-visible, evidence-backed outcome)
```

The keys must be correlated but not collapsed into one free-form ID. Every boundary has idempotency, identity and privacy checks. The application must work without a public Arkiv task if the task is private by institutional policy.

## 6. Cross-chain identity binding protocol

Required typed fields: `domain`, `audience`, normalized ENS name + chain ID, ENS registry/resolver/controller snapshot, separate Arkiv wallet + chain ID, A2A agent/service signing key, institution credential reference, allowed capabilities/actions/data scopes, issue/expiry, nonce, binding version, revocation epoch. Two choices: (a) institution controller signs a canonical binding and ORCA validates it with current ENS authority state, or (b) institutional credential issuer also signs an authorization assertion, whose issuer is trusted by the receiving organization. Both are needed for stronger affiliation claims; ENS ownership by itself is not a scientific credential.

**Security:** Check current state at each privileged task assignment and before accepting signed result; on revoke, invalidate cached bindings and reject new tasks. It is not enough to show the `.eth` name next to a wallet.

## 7. Failure/consistency diagrams

```mermaid
sequenceDiagram
 participant U as Research User
 participant O as ORCA
 participant DB as Postgres Outbox
 participant A as Arkiv Rabdi
 participant P as Independent Provider
 U->>O: Start approved federated investigation
 O->>DB: Commit local task + outbox request
 O->>A: Submit task write
 alt Chain accepted + query visible
  A-->>O: Receipt and entity
  P->>A: Query tasks and publish claim
  P-->>O: A2A work request/accept
 else Timeout/unknown
  O->>DB: Mark chain state UNKNOWN
  O->>A: Reconcile tx/entity; do not duplicate blindly
 end
```

If ENS or Arkiv is down, research local mode remains operational; remote discovery or public coordination may be temporarily unavailable. If external agent fails, don't report unperformed calculations. If source data is unavailable, mark insufficiency and avoid unsupported scientific claim.

## 8. Implementation order without hard complexity limits

1. Convert old master tech dossier to actual inventory; inspect code and DB migrations if present.
2. Implement and test shared scientific contracts, source quality and versioned artifacts.
3. Integrate research investigation/project mode into existing supervisor and UI.
4. Introduce A2A external tasks with two independently started services and separate keys.
5. Connect ENSv2 name-resolution and scoped permissions, then organization credential/binding verification.
6. Connect Arkiv SDK tasks, claims and result/review references; independent wallets.
7. Add structured scientific reproduction/challenge and historical replay.
8. Build external verifier proving identity, chain ownership and actual numerical reproduction.
9. Implement institute-grade security, data rights, quotas, audit, backups and operational evaluation.
10. Expand all originally planned specialized tools and stakeholder experiences over the common scientific base.

## 9. Definition of done for integration

Existing fisherman query works unchanged; original agent executes real science; newly registered external A2A agent is genuinely reachable; ENSv2 endpoint/delegation/revocation is live; Arkiv tasks are written and queried by distinct wallets and power the UI; signed result and independent challenge are recorded; original/corrected calculation can be reproduced from permitted evidence; user receives report with sources and limitations; fails safely when data/agent/chain is unavailable; no simulated identity is passed off as actual institutional adoption.

**Source:** [Original Master](https://teampflresearch.vercel.app/master-arch.html), [Agentic Spec](https://teampflresearch.vercel.app/agentic-spec.html), [ENSv2](https://docs.ens.domains/ensv2/subnames/), [Arkiv](https://docs.arkiv.network/start-here/first-entity/), [A2A](https://a2a-protocol.org/latest/).
