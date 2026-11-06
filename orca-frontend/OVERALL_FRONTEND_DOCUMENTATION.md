<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
Overall Architectural Master Documentation
Primary Contract: api design.md (revision 3.1.0-proposal, 220 operations)
UX Specification: dashboard design.md (frontend-ux-3.2-proposal, 87 screen registry)
Truth Boundary: All mocks annotated fixture: true; zero fake blockchain/scientific claims
Visual System: Strict white #FFFFFF, monochrome neutrals #F8F9FA, #F3F4F6, #E5E7EB, #111827
================================================================================
-->

# ORCA 3.0 — Comprehensive Frontend Master Documentation

**Date:** 2026-11-06  
**Version:** `frontend-ux-3.2-release-docs`  
**Base Path:** `c:\ocra frontend\orca-frontend`  
**Primary Standards:**
- [`api design.md`](../../api%20design.md) (Revision `3.1.0-proposal`, 220 designed operations across 14 API families)
- [`dashboard design.md`](../../dashboard%20design.md) (Revision `frontend-ux-3.2-proposal`, 87 designed screen registry)

---

## 1. Executive Summary & Design System

The ORCA 3.0 frontend provides an institution-first scientific workspace for oceanographic research, distributed autonomous A2A agent coordination, Arkiv public task verification, and real-time marine safety advisories.

### 1.1 Strict Visual Language (No Neon / No Gradients)
In strict compliance with `dashboard design.md` §2, the colorful prototype aesthetic is completely discarded. The interface adheres to an accessible monochrome palette:
- **`bg-page` (`#FFFFFF`)**: Pure white base across all screens, drawers, and layouts.
- **`bg-muted` (`#F8F9FA`)**: Secondary detail panels, inspect drawers, and code blocks.
- **`bg-hover` (`#F3F4F6`)**: Row hover states, never gradients.
- **`border` (`#E5E7EB`)**: Structural dividers, card borders, and table grids.
- **`text-primary` (`#111827`)**: High-contrast scientific values, headings, and primary titles.
- **`text-secondary` (`#4B5563`)**: Scientific descriptions, subtitles, and input labels.
- **`text-muted` (`#6B7280`)**: Timestamps, unit denominators, and helper copy.

### 1.2 Five Distinct Status Indicators
Per `dashboard design.md` §2, five separate concepts are decoupled and never conflated:
1. **ENS Ownership**: Proves control of an on-chain `.eth` name on Sepolia.
2. **Institutional Accreditation**: Verifies trusted organizational standing with ORCA.
3. **A2A Reachability**: Confirms live agent card availability via HTTP/JSON.
4. **Arkiv Confirmation**: Proves immutable transaction inclusion on the decentralized ledger.
5. **Scientific Validity**: Indicates mathematical support (`supported`, `challenged`, `insufficient_evidence`).

---

## 2. Implemented Routes & Screen Crosswalk

The frontend application features **46 compiled static and dynamic routes**:

### 2.1 Foundation & Workspaces
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/` | `F01` | P02 | Entry screen showing dynamic release capabilities (`core-C`) and quick-launch portals. |
| `/workspaces` | `F03` | P02 | Multi-institution workspace directory with tenant switching and RLS notifications. |

### 2.2 Institutional Management
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/org/[orgId]/overview` | `I01` | P08 | Institutional command centre with project health, review queues, and freshness alerts. |
| `/org/[orgId]/projects` | `I02` | P02 | Research project index with data policy and access tier badges. |
| `/org/[orgId]/projects/[projectId]` | `I04` | P05 | Tabbed project details (Overview, Investigations, Files, Members). |
| `/org/[orgId]/projects/[projectId]/files` | `I06` | P02 | Immutable GeoJSON polygons and CSVs with presigned upload/download intents. |
| `/org/[orgId]/settings/members` | `I08` | P02 | Member roster and invitation modal with role-based access control. |
| `/org/[orgId]/settings/access` | `I09` | P02 | Cryptographically signed external access grants for partner institutes. |
| `/org/[orgId]/settings/usage` | `I10` | P08 | Compute Units (CU), storage GB, and egress meters with hard-cap fencing. |
| `/org/[orgId]/settings/audit` | `I11` | P08 | Tamper-evident security audit log with allow/deny decisions. |

### 2.3 Data Catalog & Scientific Methods
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/org/[orgId]/data/providers` | `D01` | P03 | External oceanographic source providers (INCOIS, Copernicus). |
| `/org/[orgId]/data/products` | `D02` | P03 | Gridded marine observation and reanalysis product catalogue. |
| `/org/[orgId]/data/products/[productId]` | `D03` | P03 | Pinned product versions and interactive spatial/temporal fitness checker (`POST /fitness-checks`). |
| `/org/[orgId]/data/snapshots` | `D05` | P03 | Immutable snapshot manifests with root Merkle SHA-256 digests. |
| `/org/[orgId]/data/compatibility` | `D06` | P03 | Pre-flight validation testing CRS alignment and regridding ratios. |
| `/org/[orgId]/science/methods` | `D08` | P04 | Algorithm registry with mathematical formulas and container code digests. |
| `/org/[orgId]/science/recipes` | `D09` | P04 | Declarative JSON recipe editor with live syntax verification and SHA-256 digest computation. |

### 2.4 Research Studio & Provenance
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/org/[orgId]/research/investigations` | `R01` | P05 | Investigation library with state and outcome filters. |
| `/org/[orgId]/research/investigations/new` | `R02` | P05 | Multi-step scientific formulation wizard with bounding coordinates. |
| `/org/[orgId]/research/investigations/[investigationId]` | `R03` | P06 | Unified 3-pane Research Studio with Map/Chart/Table outputs, agents roster, and evidence drawer. |
| `/org/[orgId]/research/artifacts/[artifactId]` | `R10` | P06 | Cryptographic DAG provenance inspector, snapshot inputs, and digital signatures. |
| `/org/[orgId]/research/investigations/[investigationId]/reports` | `R11` | P06 | Research monograph publication gate with DOI allocation and PI sign-off. |
| `/org/[orgId]/research/investigations/[investigationId]/exports` | `R12` | P06 | Reproducible scientific bundle (tar.gz) exporter with offline CLI verification script. |

### 2.5 Verification & Review
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/org/[orgId]/review/inbox` | `V01` | P07 | Categorized inbox for pending, reproduced, challenged, and insufficient evidence. |
| `/org/[orgId]/review/[reviewId]` | `V02–V04` | P07 | Side-by-side delta comparison, numerical diffs, challenge disputation, and verdict submission. |

### 2.6 Federated Agents & Arkiv Network
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/org/[orgId]/agents` | `A01` | P09 | Federated agent directory decoupling A2A capability from ENS ownership. |
| `/org/[orgId]/agents/new` | `A02–A06` | P09 | 5-step agent onboarding wizard (Mode, Identity, Capabilities, Endpoints, Delegation). |
| `/org/[orgId]/agents/[agentId]` | `A07/A08` | P09 | Agent operations, latency telemetry, and agent card references. |
| `/org/[orgId]/agents/[agentId]/identity` | `E01–E05` | P10 | ENS name bindings, Sepolia resolver records, wallet challenges, and revocation. |
| `/network/agents` | `N01` | P09 | Global discovery directory of autonomous scientific agents. |
| `/network/tasks` | `N02` | P11 | Public Arkiv coordination board displaying claims, assignments, and blockchain states. |
| `/network/tasks/new` | `N03` | P11 | Dispatch independent reproduction tasks to public agents. |
| `/network/tasks/[taskId]` | `N04/N05` | P11 | Single-award assignment details and live A2A session telemetry. |
| `/network/arkiv` | `N08` | P11 | Raw Arkiv entity and transaction commitment explorer on Sepolia. |
| `/verify/[publicRef]` | `N10` | P11 | Zero-trust public proof verifier with bitwise output matching. |

### 2.7 Marine Companion Expansion
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/marine` | `M01/M06` | P12 | Real-time coastal marine conditions and IMD/INCOIS hazard alerts. |
| `/marine/conversations` | `M02` | P12 | Natural language advisory chat library. |
| `/marine/conversations/[conversationId]` | `M03` | P12 | Conversational assistant with cited bulletins and hazard badges. |
| `/marine/map` | `M04` | P12 | GIS layer viewer (SST, Waves, Chlorophyll-a, Cyclone Tracks) with coordinate probe. |
| `/marine/fisheries` | `M05` | P12 | Potential Fishing Zone (PFZ) advisories and Marine National Park restrictions. |
| `/marine/routes` | `M07` | P12 | Voyage exposure calculator computing wave height and squall risk. |
| `/marine/alerts` | `M08` | P12 | Multi-lingual SMS, Voice, and Web Push emergency warning channels. |

### 2.8 Platform Operations
| Route | Screen ID | API Gate | Purpose |
|---|---|---|---|
| `/admin/system` | `O01` | P08 | Platform capability gate matrix from P00 through P14. |
| `/admin/sources` | `O02` | P08 | Connector latency and health probes for ERDDAP, CMEMS, and Buoy MQTT. |
| `/admin/jobs` | `O03` | P08 | Durable Celery worker pool telemetry and queue concurrency. |
| `/admin/arkiv` | `O05` | P11 | Sepolia block height tracking and indexer sync lag monitors. |

---

## 3. Directory Layout & Architecture

```text
orca-frontend/
├── docs/                           # Per-file detailed documentation with header comments
├── src/
│   ├── app/                        # Next.js App Router (46 routes)
│   ├── components/                 # Layout & UI component library
│   ├── lib/                        # API client & mock fixtures
│   └── types/                      # TypeScript definitions & RFC 9457 errors
├── postcss.config.mjs              # PostCSS configuration for Tailwind CSS v4
├── package.json                    # Scripts and dependencies
└── next.config.ts                  # Webpack compilation configuration
```

