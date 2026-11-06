# ORCA 3.0 — Original Dossier Audit, Migration Matrix and Source Register

**Audit date:** 2026-11-05  
**Evidence base:** Public pages accessible at https://teampflresearch.vercel.app/, including seven core design documents and five supporting documents, plus official protocol and sponsor references. This is a **reconciled new design**, not a full reproduction of every line of the older, several-hundred-kilobyte dossier. Original specifications remain reference material for detailed legacy tool inventories and exact original SQL. **No code or production DB was available to compare against the design pages; implementation is unverified.**

## 1. Dossier inventory: all public architecture pages

| Original publication | URL | What it specifies | Updated destination |
|---|---|---|---|
| Doc 1 — Complete User Flow Architecture | https://teampflresearch.vercel.app/doc1.html | Six stakeholder classes, original eight example flows, four UI surfaces, map/evidence/agent activity, languages | `docs/01_user_flows.md` |
| Doc 2 — Core Agentic System Architecture | https://teampflresearch.vercel.app/doc2.html | Original supervisor, internal specialist roles, tool registry ~114, permissions, task graph, replanning | `docs/02_agentic_architecture.md` |
| Doc 3 — Data Processing Pipeline | https://teampflresearch.vercel.app/doc3.html | 10 scientific pipeline stages, source selection, normalization, ocean data state | `docs/03_data_processing.md` |
| Doc 4 — Database Design | https://teampflresearch.vercel.app/doc4.html | Four-store data architecture, 44+ proposed SQL tables, memory/scenario/event extensions | `docs/04_database.md`, `db/001_orca_v3_extensions.sql` |
| Doc 5 — Implementation & Requirements | https://teampflresearch.vercel.app/doc5.html | Original six-phase roadmap, original eight use cases, requirements, languages | `docs/05_implementation.md` |
| Doc 6 — Memory & Context | https://teampflresearch.vercel.app/doc6.html | Seven planes of memory and evidence vs user-memory distinction | `docs/06_memory_context.md` |
| System 7 — Scientific & Marine Intelligence | https://teampflresearch.vercel.app/scientific.html | Seven science engines, scientific method/structured-result contract | `docs/07_scientific_engine.md` |
| Fisher-Facing Product Research | https://teampflresearch.vercel.app/fisher.html | Trip companion, field research, mobile/low bandwidth, PFZ, fishing journey | `docs/10_fisher_companion_delta.md` |
| Data Acquisition Matrix | https://teampflresearch.vercel.app/data-sources.html | Providers INCOIS, MOSDAC, IMD, NOAA, Copernicus, GEBCO, credentials/access and QC | `docs/08_data_acquisition_delta.md` |
| Agentic Engineering Specification | https://teampflresearch.vercel.app/agentic-spec.html | Robust runtime, task graph, contract and deployment philosophy | `docs/09_agentic_engineering_delta.md` |
| Core Agentic Technical Architecture | https://teampflresearch.vercel.app/core-agentic-technical.html | LLM brain controls planning, scientific computation outside LLM | `docs/11_core_technical_delta.md` |
| Master Architecture | https://teampflresearch.vercel.app/master-arch.html | Consolidated system, original agents, data flows, storage, events, monitoring | `design.md` and `docs/12_master_mapping.md` |
| Full-size SVG architecture | https://teampflresearch.vercel.app/architecture.html | Legacy diagram/reference | New Mermaid diagrams in `design.md`, use as a visual reference, not the new authority |

## 2. Preserved core assumptions and how they evolve

| Legacy principle | Retain / update | Migration action |
|---|---|---|
| “ORCA is not a chatbot with a map” | Retain | Four synchronized surfaces plus project-oriented Research Studio |
| One supervisor and domain specialists | Retain | Add federation coordinator sidecar; distinguish internal tool use vs external A2A |
| Evidence Gate and “no evidence, no claim” | Strengthen | Claim-level scientific verification, methods, independent reproducibility |
| Source-first ingestion, ERDDAP, data catalog | Retain | Add licensing, dataset versions, original-availability timestamps |
| 10-step scientific pipeline | Retain | Add method registry, QC and source fitness on top, not replacement |
| Seven science engines | Retain | Add scientific challenge and historical replay as services across engines |
| 44+ DB tables planned | Retain conceptually | Add new namespaces/tables without clobbering `tasks`, `claims` or `evidence_records` |
| Seven memory planes | Retain | Add org/project scoped context, remote agent state and data minimization |
| Original 8 demos and regional language support | Retain | Add institutional demo, ENS/Arkiv identity and independent verification |
| `<8s` complex query (portal headline) | **Downgrade to unverified design goal** | Measure actual source/compute/LLM latencies; deep federation may be asynchronous |
| Government/official advisories | Retain authority hierarchy | ORCA never fabricates official issuer or replaces operational hazard service |
| Research institute collaboration | Extend substantially | Institution-managed agents and data gateways, A2A, ENSv2, Arkiv |

## 3. Terms whose meaning must not drift

- **Agent:** logical internal role OR independently controlled external service. Type field required.
- **Tool:** an operation callable through the Tool Gateway, potentially delegated to MCP; may be one of the existing 114 logical functions, not an API count.
- **Claim (science):** proposition supported by evidence; old `claims` table.
- **Claim (work):** provider offer to execute a task; new `federation.task_claims`.
- **Evidence:** source-, time- and method-attached information; can be restricted.
- **Proof:** a cryptographic integrity/authentication check, **not proof of scientific truth**.
- **Validation:** scientific method/data matching and numerical reproduction; not identical to agent signature or institutional authorization.
- **Independent organization:** external operator with its own control of runtime and signing keys; multiple team-operated Docker containers are *simulations*.
- **ENS identity:** a name and records on Ethereum mainnet/Sepolia; institution authenticity is separately vetted.
- **Arkiv entity:** wallet-owned, public, queryable, expiring record on Rabdi testnet.

## 4. Dependencies and source-of-truth ordering

1. **Documented actual code/database/migrations** (once provided) overrides speculative labels in old portal docs when describing implemented state.
2. Official current protocol specification/SDK migration guide overrides older examples when integrating ENS/A2A/MCP/Arkiv.
3. Dossier's seven original docs define the *legacy requirements/behavior*; updated `design.md` defines intended new interfaces and how they map together.
4. Security/privacy and scientific safety checks override convenience and demo staging.
5. External partner prize catalogue defines category conditions, not this architecture's product requirements.

## 5. Important unresolved integration details

- No full old repository/DB migration history was supplied. Table names come from design docs; SQL must be reconciled before running.
- Some original docs describe components as “final architecture” while page metadata says “planning phase.” Treat both as designs, not proof of deployed code.
- Tool counts differ across original docs because they include visualization and monitoring utilities; preserve original inventory and scope count explicitly.
- `original research was allowed` is based on organizer's reply supplied by user, not a web-verifiable official ruling scoped to all sponsor requirements. Keep disclosure/commit history.
- Version-sensitive ENSv2 deployment addresses, Arkiv SDK APIs and A2A SDK classes must be validated against installed versions on the actual build machine.
- The requested “all docs” includes five companion pages beyond seven core docs. This package supplies focused update addenda for those pages; older detailed research tables should remain available as reference.

## 6. External primary sources

- A2A: https://a2a-protocol.org/latest/
- MCP: https://modelcontextprotocol.io/specification/2025-11-25
- ENSv2 overview: https://docs.ens.domains/ensv2/overview/
- ENSv2 subnames/ownership: https://docs.ens.domains/ensv2/subnames/
- ENSv2 resolver permissions: https://docs.ens.domains/ensv2/permissioned-resolver/
- ENSIP-26 **draft** agent text records: https://docs.ens.domains/ensip/26/
- Arkiv Rabdi: https://docs.arkiv.network/networks/rabdi/
- Arkiv limits: https://docs.arkiv.network/reference/limits/
- Arkiv first entity: https://docs.arkiv.network/start-here/first-entity/
- ETHGlobal sponsor categories: https://ethglobal.com/events/mumbai/prizes
- Copernicus Marine: https://data.marine.copernicus.eu/
- INCOIS data discovery: https://incois.gov.in/site/dataholdings.jsp
- CF standards: https://cfconventions.org/
- STAC: https://stacspec.org/
- W3C PROV: https://www.w3.org/TR/prov-o/

## 7. Update rule for coding agents

When modifying the actual implementation, coding assistants must compare change against all seven updated docs and ask for clarification only if a truly missing constraint blocks a critical action. Do not erase existing scientific, mobile, memory or authority behavior when adding federation. Version every new contract, generate migrations for durable changes, run the negative tests, and update docs/README with implemented vs proposed features.
