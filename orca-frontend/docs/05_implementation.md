# ORCA Architecture Doc 5 (Revised) — Implementation Plan, Integration and Verification

**Version 3.0.** Replaces the scope of [original implementation blueprint](https://teampflresearch.vercel.app/doc5.html) with a unified product roadmap. **Do not interpret phases as a time estimate or claim that services are deployed.** The original eight marine use cases and all stakeholder requirements remain in scope; new capabilities are added rather than trading them away.

## 1. Delivery principles

- **No arbitrary complexity cap**: design for complete scientific research, independent institutional agents, open agent identity and verifiable coordination; don't cut valuable functionality because it appears ambitious.
- **Dependency order still matters**: correctness and identity first, interactions next, chain receipts after actual work, institutional controls before sensitive data.
- Every capability must have a contract, implementation, happy-path test, adversarial test, reproducibility demonstration and observability.
- Never sacrifice scientific correctness, official warning integrity or user privacy to fit a sponsor track.
- Keep old marine assistant features working: PFZ, hazards, location-specific SST/CHL, weather, route context, geofences, proactive warnings, multilingual support, four UI surfaces.

## 2. Engineering workstreams and ownership

| Workstream | Primary tasks | Main outputs |
|---|---|---|
| A. Product/User | Preserve four surfaces; Research Studio; provider portal; verifier; access/error/empty states; multilingual mobile | Frontend, UX tests, user pilot |
| B. Core platform | Org auth, API gateway, metadata registry, typed contracts, feature flags, observability, budget/rate rules | `api`, `identity`, shared contracts |
| C. Data science | Connectors, 10-stage pipeline, source licensing, QC, normalization, history, geospatial and scientific methods | Reproducible numerical results |
| D. Internal agents | Supervisor, task graph, specialist agents, evidence validator, synthesis, bounded replanning | Internal workflow engine |
| E. Agent federation | Official A2A SDK, Agent Cards, provider discovery, scoped delegation, remote task lifecycle, cancellations | Independent service interoperability |
| F. Identity | ENSv2 namespace/subnames, per-agent resolver boundaries, org credential, signature binding, key rotation/revocation | Verified organizational identity chain |
| G. Shared coordination | Arkiv task/claim/assignment/ref/review, wallet ownership, SDK, indexer, outbox and independent verifier | Public collaboration layer |
| H. Research Studio | Method registry, project approvals, independent reproduction, challenge and as-of historical replay | Institutional research value |
| I. Operational security | Tenant RLS, secrets, event/audit log, source quotas, data privacy and retention, incident procedures | Safe deployment |
| J. Validation & operations | Integration tests, scientific benchmark, load, recovery, maintenance, backup/restore and pilot interviews | Measured reliability and adoption evidence |

## 3. Detailed phase gates

### Phase 0 — Audit and consistency

- Inventory source portal (docs 1–7 + companion specs), choose authoritative contracts and diagram versions.
- Inspect actual existing repository and DB migrations, if any; old portal documents are **designs**, not assumed code.
- Record source license/credential status; define simulated vs real organizations.
- Freeze `orca.*` schema naming, canonical serialization, identity trust and audit vocabulary.
- Gate: source crosswalk in `00_SOURCE_AUDIT_AND_MIGRATION.md`, passing schema lint, no old module silently dropped.

### Phase 1 — Core science and persistence

- Existing four-store design: Postgres/PostGIS, S3-compatible objects, Parquet and Redis.
- Add 35 new V3 tables additively, then tenant policies and migration tests.
- Build `ResearchRecipe`, `DatasetSnapshot`, `ScientificArtifact`, `Review` schemas.
- Implement source connector(s) for at least one accessible real product, product version and QC documented.
- Implement anomaly engine and baseline validation; independent worker repeat test.
- Gate: correct reference calculation and deliberate incorrect baseline flagged with original and corrected evidence preserved.

### Phase 2 — Internal ORCA investigation

- Keep original planner, Data/Ocean/Weather/Geo/Decision specialists and evidence gate.
- Native bounded execution, parallel independent tasks, downstream data validation, circuit breakers and retries.
- Retain map, chat, activity and evidence synchronization; events from durable commits.
- Gate: a real source-backed investigation yields a report, map, source/time/method/uncertainty and reproducible artifact without external agents.

### Phase 3 — Independent A2A transport

- Adopt official A2A 1.x SDK, publish Agent Cards and correct task/artifact lifecycle; no hand-rolled A2A wire protocol.
- Deploy two provider endpoints with separate identities and preferably separate control accounts.
- Add contextual authorization and safe outbound networking, typed scientific task inside A2A message.
- Gate: independent client discovers and invokes provider, retries/cancels appropriately, forged or modified response rejected.

### Phase 4 — ENSv2 name and institutional trust

- Register institution-controlled ENSv2 name on supported chain; allocate per-agent child names.
- Deploy or configure registry/resolver with appropriately isolated delegated roles.
- Publish actual endpoint text records and optional draft ENSIP-26 keys; resolve via Universal Resolver.
- Attach org credentials and explicit signed ENS↔Arkiv wallet↔A2A key scope binding with nonce/expiry.
- Gate: delegated endpoint update succeeds; unrelated sibling update and revoked update fail; ORCA refuses false institution attestation.

### Phase 5 — Arkiv coordination

- Use official `@arkiv-network/sdk` and Rabdi, funded separate wallets; access key/quotas.
- Add `orca.agent.v1`, `orca.task.v1`, `orca.claim.v1`, `orca.result.v1`, `orca.review.v1` with compact/indexed fields and appropriate expiries.
- Build real create and filtered query, outbox state tracking, receipt/indexer reconciliation, task-claim assignment policy and expiry sweeper.
- Gate: requester publishes, external wallet discovers and claims, provider publishes signed reference, independent verifier queries **without** ORCA API.

### Phase 6 — Research Studio full feature set

- Project/organization controls, recipe approval, data catalog, method library, source-quality inspector, offline and federated investigations.
- Independent scientific reproduction and challenge/correction; multiple independent contributions when useful.
- Historical as-of replay with no future-data leakage and documented inability to replay when original archive missing.
- RO-Crate/PROV-inspired export with deterministic code or method; policy-aware data inclusion.
- Gate: scientist can reproduce, inspect source methods and challenge findings through UI; no promises of scientific truth without benchmarks.

### Phase 7 — Full stakeholder / network expansion

- All original eight scenarios; language and poor connectivity; original monitoring/alerts; environmental/maritime decision support.
- Additional domain providers (conservation, research, independent forecast evaluator); institution-hosted and tool-only participant onboarding.
- Wider geographic dataset catalog and explicit unsupported regions. Official source and licensing checks remain mandatory.
- Gate: external operator onboarding without ORCA sharing private deployment keys; mobile direct queries work if network down.

### Phase 8 — Production and institutional evaluation

- Separate orgs, audit and privacy review, incident response, key revocation drill, liveness failure, backup restore and security exercises.
- Scientific benchmark against an existing Python/Jupyter workflow and a general tool-enabled agent using identical inputs.
- Pilot with volunteer scientists/teams; measure scientific correctness, reproducibility, total researcher time, repeat usage and cost.
- Gate: quantified metrics and limitations published. No institution adoption claimed without permission and evidence.

## 4. Official old demonstrations retained

| Original inquiry | New ORCA path |
|---|---|
| Nearest Potential Fishing Zone? | Official PFZ product lookup, source validity and distance; no fabricated zones |
| Safe to venture tomorrow morning? | Official advisories, wave/wind/current, vessel context, high-impact abstention |
| Tides, weather and sea conditions? | Aligned forecast/observation valid times, mobile map |
| Lightning/cyclone alerts? | Authoritative IMD / relevant official alert source, delivery/expiry |
| High chlorophyll + favorable SST? | QC-aware overlay, method-defined thresholds, known uncertainties |
| Safest route considering weather? | Route exposure comparison; not certified navigation guidance |
| Why did fish productivity decline? | Scientific investigation workflow, alternative hypotheses, independent review when appropriate |
| Restricted/hazardous fishing zones? | Versioned boundaries, warnings, geofence source and date |

New showcase: marine scientific anomaly investigation with independent source/method review and signed public collaboration references.

## 5. Full integration demo script

1. Show old ORCA map and live source-backed marine query working.
2. Switch to Research Studio; submit a bounded region/time/variable anomaly investigation; approve baseline and source.
3. Show real numerical calculation and source/QC manifest.
4. In provider portal, show ENSv2 agent identity, real endpoint record and organizational binding validation.
5. Publish a non-sensitive Arkiv research task from requester wallet; second wallet independently queries by capability and claims it.
6. Real external A2A provider executes method using permitted data; returns signed artifact and a verifiable content digest.
7. A second independent validator discovers result, finds wrong climatology baseline in seeded faulty case, reproduces and publishes signed challenge.
8. Recalculate using correct specified baseline; keep original/correction versions; show quantitative explanation and report.
9. Show Arkiv result/review records populated from real filtered queries; reveal tx hashes/owner/expiry and chain separation.
10. Demonstrate ENSv2 delegated endpoint update and revocation denial; independent verifier reads records with ORCA API offline.
11. Explain that the faulty fixture is **synthetic**, while actual marine data is authentic and subject to its quality limits.

## 6. Metrics and test matrix

| Area | Verification |
|---|---|
| Source quality | Wrong unit/depth/issue time, missing QC and licencing cause rejection |
| Scientific | Numeric reference match, baseline errors detected, causal claims appropriately qualified |
| Historic | Original as-of inputs available or explicitly `not_replayable`; no future leak |
| A2A | Third-party SDK interoperability, distinct endpoints, cancellation/timeout |
| ENS | Actual subname resolution, delegated control, sibling denial, revocation and cache purge |
| Arkiv | Real wallet-owned create/query, independent claim, expiry/query limits, fake schema-owner rejection |
| Trust | Forged key/binding, stolen expired credential and wrong-chain replay rejected |
| DB | Tenant isolation, append-only artifact relations, unique operation IDs, migrations |
| Cost | Per-provider query, model token, scientific compute, chain tx counts, retry rates |
| Reliability | Failure injection for source, RPC, indexer, external agent and storage restore |
| UX | Traceable claim clicks, error/empty/loading, no fake success states, accessible on mobile |

## 7. ETHGlobal partner integration and submission

Primary target: [Arkiv Build on Arkiv from scratch](https://ethglobal.com/events/mumbai/prizes) and [ENSv2 Best Use](https://ethglobal.com/events/mumbai/prizes), with actual SDK/deployment receipts, not hardcoded cards. Arkiv needs `/arkiv/schema.md`, `/arkiv/friction.md`, `/arkiv/reach.md`, `/arkiv/why-arkiv.md`, `/arkiv/how-you-use-arkiv.md`, public repo/license, writers and sample query. ENS requires actual meaningful ENSv2 functionality. Keep Swarm/0G/x402/CRE/World ID optional and subject to meaningful use and independently checked sponsor rules. **No partner integration guarantees a prize.** Prior research is disclosed; code written during event per organizer guidance and category rules.

## 8. Repository/deploy structure and acceptance definitions

Build as monorepo, not arbitrarily 40 deployed services. Package boundaries: `apps/{web,research-studio,provider,verifier}`, `services/{api,scientific,data-ingestion,agents,federation,identity,arkiv,ens,review,model,alerts}`, `packages/{contracts,provenance,client-sdk,agent-sdk,scientific}`, `db/migrations`, `infra/compose`, `infra/k8s`, `tests/{scientific,contract,a2a,arkiv,ens,e2e,security}`. CI: typecheck, lint, unit, schema, migrations, non-destructive compatibility, integration, container and security scans; do not require live testnet for all local tests—use network-specific nightly/e2e when available.

## 9. Decision on scope and honesty

There is no artificial maximum ambition, but a **working vertical slice** is the first hard integration test. The original portal's old fifteen-day roadmap and `<8s` complex-query target are not performance guarantees. Work proceeds through explicit verified gates, with partial capabilities honestly labeled. Foundation is complete only when real data, independent service, signed authorization, actual testnet read/write, reproducible numerical analysis and negative security tests all succeed.

**Source:** [Old Doc 5](https://teampflresearch.vercel.app/doc5.html) and [current sponsor catalogue](https://ethglobal.com/events/mumbai/prizes).
