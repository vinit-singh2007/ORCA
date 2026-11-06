# ORCA 3.0 — Complete Backend API Endpoints Specification

This document provides a consolidated reference for all **14 backend endpoint domains** called by the ORCA 3.0 frontend (`OrcaApiClient`). Use this specification to implement, mock, or verify the backend service for Vercel deployment.

All endpoints are prefixed with the base API URL configured via `NEXT_PUBLIC_ORCA_API_URL` (defaults to `http://localhost:8000`).

---

## Table of Contents

1. [§3.1 System Health & Metadata](#1-system-health--metadata-31)
2. [§3.2 Identity, Organizations, Membership & Access Grants](#2-identity-organizations-membership--access-grants-32)
3. [§3.3 Research Projects, Memberships & Storage](#3-research-projects-memberships--storage-33)
4. [§3.4 Environmental Data Providers, Products & Snapshots](#4-environmental-data-providers-products--snapshots-34)
5. [§3.5 Scientific Method Registry & Calculation Recipes](#5-scientific-method-registry--calculation-recipes-35)
6. [§3.6 Research Investigations & Computations](#6-research-investigations--computations-36)
7. [§3.7 Scientific Artifacts, Lineage, Reports & Exports](#7-scientific-artifacts-lineage-reports--exports-37)
8. [§3.8 Reproductions, Peer Reviews & Disputes](#8-reproductions-peer-reviews--disputes-38)
9. [§3.9 External Agent Directory & Governance](#9-external-agent-directory--governance-39)
10. [§3.10 Public Verification Gateway](#10-public-verification-gateway-310)
11. [§3.11 ENSv2 Identity & Cross-Chain Binding](#11-ensv2-identity--cross-chain-binding-311)
12. [§3.12 Arkiv Task Coordination & Public Ledger](#12-arkiv-task-coordination--public-ledger-312)
13. [§3.13 Extended Marine Companion](#13-extended-marine-companion-313)
14. [§3.14 Platform Operations & Administration](#14-platform-operations--administration-314)

---

## 1. System Health & Metadata (§3.1)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/meta` | OpenAPI contract revision & capabilities | None | `{ name: string, version: string, revision: string, capabilities: string[] }` | Global Footer, Shell |
| `GET` | `/v1/health` | Service readiness & subsystem health | None | `{ status: "healthy" \| "degraded", timestamp: string, components: Record<string, any> }` | `/admin/system` |

---

## 2. Identity, Organizations, Membership & Access Grants (§3.2)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/me` | Current principal profile & memberships | None | `CurrentPrincipal` (id, user_id, display_name, organizations) | `/workspaces`, Header |
| `GET` | `/v1/organizations` | List all organizations | Query: `cursor`, `limit` | `Page<OrganizationSummary>` | `/workspaces`, `/` |
| `POST` | `/v1/organizations` | Create an institution | `{ name: string, display_name: string, description?: string }` | `Organization` | `/workspaces` |
| `GET` | `/v1/organizations/{org_id}` | Organization details & stats | Path: `org_id` | `Organization` | `/org/[orgId]/overview` |
| `PATCH` | `/v1/organizations/{org_id}` | Update organization metadata | `{ display_name?: string, description?: string }` | `Organization` | `/org/[orgId]/overview` |
| `GET` | `/v1/organizations/{org_id}/members` | Active member roster | Query: `cursor`, `limit`, `role` | `Page<Member>` | `/org/[orgId]/settings/members` |
| `POST` | `/v1/organizations/{org_id}/invitations` | Invite collaborator | `{ email: string, role: string, expires_at?: string }` | `{ id: string, email: string, role: string, token: string }` | `/org/[orgId]/settings/members` |
| `GET` | `/v1/organizations/{org_id}/access-grants` | Scoped data & compute grants | Query: `cursor`, `limit` | `Page<AccessGrant>` | `/org/[orgId]/settings/access` |
| `POST` | `/v1/organizations/{org_id}/access-grants` | Issue scoped grant | `{ principal_ref: { type: string, id: string }, resource_ref: { type: string, id: string }, scopes: string[] }` | `AccessGrant` | `/org/[orgId]/settings/access` |
| `DELETE` | `/v1/organizations/{org_id}/access-grants/{grant_id}` | Revoke grant | Path: `org_id`, `grant_id` | `204 No Content` | `/org/[orgId]/settings/access` |
| `GET` | `/v1/organizations/{org_id}/usage` | Quota & resource consumption | Path: `org_id` | `{ compute_hours_used: number, storage_gb_used: number, limits: Record<string, number> }` | `/org/[orgId]/settings/usage` |

---

## 3. Research Projects, Memberships & Storage (§3.3)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/research/projects` | List projects for active org | Query: `org_id`, `cursor`, `limit` | `Page<ResearchProject>` | `/org/[orgId]/projects` |
| `POST` | `/v1/research/projects` | Create a new research project | `{ org_id: string, name: string, description?: string, confidential: boolean }` | `ResearchProject` | `/org/[orgId]/projects` |
| `GET` | `/v1/research/projects/{id}` | Project summary & metadata | Path: `id` | `ResearchProject` | `/org/[orgId]/projects/[projectId]` |
| `PATCH` | `/v1/research/projects/{id}` | Update project metadata | `{ name?: string, description?: string, status?: string }` | `ResearchProject` | `/org/[orgId]/projects/[projectId]` |
| `GET` | `/v1/research/projects/{id}/members` | Project collaborator list | Path: `id` | `Page<Member>` | `/org/[orgId]/projects/[projectId]` |
| `POST` | `/v1/research/projects/{id}/members` | Add project collaborator | `{ principal_id: string, role: string }` | `Member` | `/org/[orgId]/projects/[projectId]` |
| `GET` | `/v1/research/projects/{id}/files` | Project artifact & file tree | Path: `id` | `Page<ProjectFile>` | `/org/[orgId]/projects/[projectId]/files` |
| `POST` | `/v1/research/projects/{id}/files` | Upload raw data/script file | `FormData` (file, metadata) | `ProjectFile` | `/org/[orgId]/projects/[projectId]/files` |

---

## 4. Environmental Data Providers, Products & Snapshots (§3.4)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/data/providers` | Ingested providers (CMEMS, NOAA, INCOIS) | Query: `cursor`, `limit` | `Page<DataProvider>` | `/org/[orgId]/data/providers` |
| `GET` | `/v1/data/products` | Scientific data catalog | Query: `provider_id`, `variable`, `cursor` | `Page<DataProduct>` | `/org/[orgId]/data/products` |
| `GET` | `/v1/data/products/{id}` | Product variables & spatial bounds | Path: `id` | `DataProduct` | `/org/[orgId]/data/products/[productId]` |
| `POST` | `/v1/data/compatibility-checks` | Grid & dimension compatibility | `{ product_ids: string[], target_grid?: string }` | `{ compatible: boolean, common_bounds?: any, diffs?: any[] }` | `/org/[orgId]/data/compatibility` |
| `GET` | `/v1/data/snapshots` | Immutable temporal-spatial snapshots | Query: `product_id`, `cursor`, `limit` | `Page<DataSnapshot>` | `/org/[orgId]/data/snapshots` |
| `POST` | `/v1/data/snapshots` | Freeze new reproducible snapshot | `{ product_id: string, spatial_bounds: any, time_range: any }` | `DataSnapshot` | `/org/[orgId]/data/snapshots` |

---

## 5. Scientific Method Registry & Calculation Recipes (§3.5)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/science/methods` | Registered algorithmic models | Query: `category`, `cursor`, `limit` | `Page<ScientificMethod>` | `/org/[orgId]/science/methods` |
| `GET` | `/v1/science/methods/{id}` | Mathematical formulas & digest | Path: `id` | `ScientificMethod` | `/org/[orgId]/science/methods` |
| `GET` | `/v1/science/recipe-templates` | Canonical analysis blueprints | Query: `method_id`, `cursor` | `Page<RecipeTemplate>` | `/org/[orgId]/science/recipes` |
| `POST` | `/v1/science/recipes/validate` | Dry-run validation of parameters | `{ recipe: Record<string, unknown> }` | `{ valid: boolean, plan_digest?: string, errors?: any[] }` | `/org/[orgId]/science/recipes` |

---

## 6. Research Investigations & Computations (§3.6)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/research/investigations` | Study investigations list | Query: `project_id`, `cursor`, `limit` | `Page<Investigation>` | `/org/[orgId]/research/investigations` |
| `POST` | `/v1/research/investigations` | Initialize new study | `{ project_id: string, title: string, description?: string, target_polygon?: any }` | `Investigation` | `/org/[orgId]/research/investigations/new` |
| `GET` | `/v1/research/investigations/{id}` | Research studio interactive state | Path: `id` | `InvestigationStudioState` | `/org/[orgId]/research/investigations/[investigationId]` |
| `POST` | `/v1/research/investigations/{id}/runs` | Dispatch scientific compute job | `{ recipe_id: string, snapshot_ids: string[], parameters: Record<string, any> }` | `{ run_id: string, status: "queued" }` | `/org/[orgId]/research/investigations/[investigationId]` |
| `GET` | `/v1/research/investigations/{id}/runs/{run_id}` | Compute run logs & progress | Path: `id`, `run_id` | `{ run_id: string, status: "running" \| "completed" \| "failed", progress_pct: number, logs: string[] }` | `/org/[orgId]/research/investigations/[investigationId]` |

---

## 7. Scientific Artifacts, Lineage, Reports & Exports (§3.7)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/research/investigations/{id}/artifacts` | Output artifacts with SHA-256 digests | Path: `id` | `Page<ScientificArtifact>` | `/org/[orgId]/research/artifacts/[artifactId]` |
| `GET` | `/v1/research/artifacts/{id}` | Artifact DAG & parent snapshot lineage | Path: `id` | `ScientificArtifact` | `/org/[orgId]/research/artifacts/[artifactId]` |
| `GET` | `/v1/research/investigations/{id}/reports` | Peer publication study reports | Path: `id` | `Page<StudyReport>` | `.../investigations/[investigationId]/reports` |
| `POST` | `/v1/research/investigations/{id}/reports/{report_id}/publish` | Sign & publish peer report | Path: `id`, `report_id` | `{ id: string, status: "published", published_at: string }` | `.../investigations/[investigationId]/reports` |
| `POST` | `/v1/research/investigations/{id}/exports` | Build reproducibility ZIP bundle | `{ format: "zip" \| "tar.gz", include_raw_snapshots: boolean }` | `{ export_id: string, status: "queued" }` | `.../investigations/[investigationId]/exports` |
| `GET` | `/v1/research/exports/{id}` | Poll export bundle download URL | Path: `id` | `{ export_id: string, status: "ready", download_url?: string }` | `.../investigations/[investigationId]/exports` |

---

## 8. Reproductions, Peer Reviews & Disputes (§3.8)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/research/reviews` | Multi-institutional review inbox | Query: `status`, `cursor`, `limit` | `Page<PeerReview>` | `/org/[orgId]/review/inbox` |
| `GET` | `/v1/research/reviews/{id}` | Side-by-side reproduction diffs | Path: `id` | `PeerReviewDetail` | `/org/[orgId]/review/[reviewId]` |
| `POST` | `/v1/research/reviews/{id}/verdicts` | Submit qualified review verdict | `{ verdict: "reproduced" \| "rejected", diff_metrics?: any, notes?: string }` | `PeerReview` | `/org/[orgId]/review/[reviewId]` |
| `POST` | `/v1/research/artifacts/{id}/challenges` | Submit formal methodology dispute | `{ reason: string, evidence_digest: string }` | `{ challenge_id: string, status: "registered" }` | `/org/[orgId]/review/[reviewId]` |

---

## 9. External Agent Directory & Governance (§3.9)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/agents` | Registered autonomous agents | Query: `status`, `cursor`, `limit` | `Page<AutonomousAgent>` | `/org/[orgId]/agents` |
| `POST` | `/v1/agents` | Register agent with public keys | `{ name: string, role: string, public_key: string, capabilities: string[] }` | `AutonomousAgent` | `/org/[orgId]/agents/new` |
| `GET` | `/v1/agents/{id}` | Agent capability & policy details | Path: `id` | `AutonomousAgent` | `/org/[orgId]/agents/[agentId]` |
| `PATCH` | `/v1/agents/{id}` | Suspend or activate agent | `{ status: "active" \| "suspended" }` | `AutonomousAgent` | `/org/[orgId]/agents/[agentId]` |
| `GET` | `/v1/agents/{id}/audit-logs` | Agent action execution log | Path: `id` | `Page<AgentAuditLog>` | `/org/[orgId]/agents/[agentId]` |

---

## 10. Public Verification Gateway (§3.10)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/verify/{public_ref}` | Independent proof verification | Path: `public_ref` | `{ artifact_id: string, title: string, digest: string, verified: boolean, executed_at: string, institution: string }` | `/verify/[publicRef]` |

---

## 11. ENSv2 Identity & Cross-Chain Binding (§3.11)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/v1/identity/ens/resolutions` | Resolve ENSv2 name & records | `{ ens_name: string, chain_id?: number }` | `{ ens_name: string, wallet_address: string, resolver: string }` | `/org/[orgId]/agents/[agentId]/identity` |
| `POST` | `/v1/identity/agent-bindings/challenges` | Multi-sig signing challenge | `{ agent_id: string, ens_name: string, arkiv_wallet: string }` | `{ challenge_id: string, nonce: string, message_to_sign: string }` | `/org/[orgId]/agents/[agentId]/identity` |
| `POST` | `/v1/identity/agent-bindings/confirmations` | Submit signed EIP-712 proof | `{ challenge_id: string, signature: string }` | `{ bound: boolean, binding_id: string }` | `/org/[orgId]/agents/[agentId]/identity` |
| `POST` | `/v1/identity/agent-bindings/revocations` | Revoke on-chain identity binding | `{ binding_id: string }` | `{ revoked: boolean }` | `/org/[orgId]/agents/[agentId]/identity` |

---

## 12. Arkiv Task Coordination & Public Ledger (§3.12)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/network/tasks` | Public task claims board | Query: `status`, `cursor`, `limit` | `Page<NetworkTask>` | `/network/tasks` |
| `POST` | `/v1/network/tasks` | Broadcast task to Arkiv network | `{ investigation_id: string, title: string, required_capability: string, assignment_policy: "single" \| "multi" }` | `NetworkTask` | `/network/tasks/new` |
| `GET` | `/v1/network/tasks/{id}` | Task state & agent claims | Path: `id` | `NetworkTask` | `/network/tasks/[taskId]` |
| `POST` | `/v1/network/tasks/{id}/claims` | Claim task for computation | `{ agent_id: string }` | `{ claim_id: string, status: "accepted" }` | `/network/tasks/[taskId]` |
| `POST` | `/v1/network/tasks/{id}/results` | Submit signed output digest | `{ claim_id: string, result_hash: string, execution_time_ms: number }` | `{ accepted: boolean, tx_hash: string }` | `/network/tasks/[taskId]` |
| `POST` | `/v1/arkiv/queries` | Query indexed Rabdi ledger events | `{ query?: string, entity_type?: string, chain_id?: number, limit?: number }` | `Array<{ entity_key: string, entity_type: string, block_number: number, tx_hash: string, sender_address: string, payload_summary: string, ledger_status: string }>` | `/network/arkiv` |
| `GET` | `/v1/arkiv/entities/{key}` | Inspect raw cryptographic state | Path: `key` | `{ entity_key: string, tx_hash: string, payload: Record<string, any> }` | `/network/arkiv` |

---

## 13. Extended Marine Companion (§3.13)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/marine/observations` | Coastal conditions (SST, waves, wind) | Query: `sector`, `lat`, `lon` | `MarineConditions` (sst, wave_height, wind_speed, current_knots) | `/marine/map` |
| `GET` | `/v1/marine/advisories` | Official INCOIS/IMD storm alerts | Query: `sector`, `severity`, `cursor` | `Page<OfficialWarning>` | `/marine/alerts`, `/marine/map` |
| `GET` | `/v1/marine/conversations` | Maritime chat thread history | Query: `cursor`, `limit` | `Page<MarineConversation>` | `/marine/conversations` |
| `POST` | `/v1/marine/conversations` | Start new marine query thread | `{ title: string, sector?: string }` | `MarineConversation` | `/marine/conversations` |
| `GET` | `/v1/marine/conversations/{id}` | Thread message history | Path: `id` | `{ id: string, title: string, messages: Array<{ id: string, role: string, content: string, created_at: string }> }` | `/marine/conversations/[conversationId]` |
| `POST` | `/v1/marine/conversations/{id}/messages` | Send question to marine AI companion | `{ content: string, language?: "en" \| "gu" \| "hi" }` | `{ message_id: string, response: string, sources?: string[] }` | `/marine/conversations/[conversationId]` |
| `GET` | `/v1/marine/fisheries/zones` | Potential Fishing Zones (PFZ) | Query: `coastal_sector` | `Page<FisheriesZone>` | `/marine/fisheries` |
| `POST` | `/v1/marine/routes/evaluations` | Voyage wave exposure evaluation | `{ origin: [lat, lon], destination: [lat, lon], speed_knots: number }` | `{ distance_nm: number, estimated_hours: number, max_wave_height: number, advisories_intersected: string[] }` | `/marine/routes` |
| `GET` | `/v1/marine/alert-subscriptions` | Coastal SMS/push subscriptions | None | `Array<{ id: string, sector: string, channel: "sms" \| "whatsapp" \| "push", active: boolean }>` | `/marine/alerts` |
| `POST` | `/v1/marine/alert-subscriptions` | Subscribe port/coastal sector | `{ sector: string, channel: string, target: string }` | `{ subscription_id: string, active: boolean }` | `/marine/alerts` |

---

## 14. Platform Operations & Administration (§3.14)

| Method | Endpoint | Description | Request Body / Query | Expected Response | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/v1/admin/sources` | Connector ingestion status | None | `Array<{ connector_id: string, status: "healthy" \| "degraded", last_synced_at: string, record_count: number }>` | `/admin/sources` |
| `GET` | `/v1/admin/jobs` | Background worker queue health | None | `{ active_workers: number, queued_jobs: number, failed_last_hour: number, jobs: any[] }` | `/admin/jobs` |
| `GET` | `/v1/admin/arkiv/indexer-status` | Arkiv Rabdi sync lag & block | None | `{ rabdi_block: number, indexed_events_count: number, sync_lag_seconds: number, reconciliation_needed: boolean }` | `/admin/arkiv`, `/network/arkiv` |
| `GET` | `/v1/admin/audit-events` | Tamper-evident operational audit logs | Query: `org_id`, `event_type`, `cursor` | `Page<AuditEvent>` | `/org/[orgId]/settings/audit` |

---

*Generated for ORCA 3.0 Web Application Deployment.*
