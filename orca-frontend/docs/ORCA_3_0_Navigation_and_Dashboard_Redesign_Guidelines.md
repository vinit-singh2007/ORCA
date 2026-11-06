# ORCA 3.0 — Dashboard Navigation & Information Architecture Redesign

**Document type:** Frontend design and migration specification  
**Date:** 2026-11-06  
**Status:** Proposed UX and implementation guidelines; not an assertion that backend phases or integrations have passed  
**Intended readers:** Frontend engineer, product designer, backend API owner, QA lead, institutional research users  
**Decision:** Replace the present all-features-at-once sidebar with **workspace-specific navigation and contextual drill-downs**. Preserve the functionality, existing deep URLs, screen specifications, scientific boundaries and API contract.

## 0. One-page decision

**Do not delete features, API calls, routes, or source specifications merely because they disappear from the primary sidebar.** We are reducing *navigation choices*, not reducing the product. An institutional researcher should see roughly five primary choices; an external agent operator should see agent/network choices; a marine user should not navigate through scientific backend operations; only platform operators should see global health controls.

| Decision | Recommended result |
|---|---|
| Global shell | One thin top bar; four workspace modes: **Institution**, **Network**, **Marine**, **Platform Ops** (Ops permission-gated) |
| Institution sidebar | **Overview**, **Projects**, **Investigations**, **Data & Methods**, **Scientific Reviews**; **Settings** in footer; project subnavigation appears only in project context |
| Network sidebar | **Discover Agents**, **Research Tasks**, **My Agents** (if operator), **Activity / Verifications** (as applicable); **Arkiv Explorer** becomes an advanced task/result inspector, not permanent primary item |
| Marine sidebar | **Overview**, **Map & Conditions**, **Advisories**, **Assistant**; Fisheries/PFZ and Route Analysis are tools/tabs, still directly addressable by URLs |
| Ops sidebar | **System Health**, **Source & Job Operations**, **Federation Operations**, **Governance**; show deployment gate evidence only where supported |
| Research Studio | Preserve the three-pane scientific workstation; use local tabs for **Map / Chart / Table** and **Evidence / Activity / Review**, not more global navigation |
| A2A, ENSv2, Arkiv | A2A operational status in agent details, ENS under agent **Identity**, Arkiv in task **Ledger/Transactions** tab. Different technology states never share a single “verified” badge |
| Appearance | Pure white `#FFFFFF`, quiet gray `#F8F9FA`, border `#E5E7EB`, dark text `#111827`, muted text `#4B5563`; color only in scientifically meaningful maps/charts or essential accessibility semantics |
| Backwards compatibility | Retain current route paths and IDs, use tabs, contextual links, search, and redirects only when necessary; do not break copyable links |
| Release honesty | Backend **planned/unavailable/live** and fixture data must be distinguished. A proposal cannot be displayed as **CORE LIVE** or **VERIFIED** without gate evidence |

**Definition of success:** A researcher can go from Institution Overview → Project → Investigation → Scientific Evidence/Review in four understandable steps, without encountering agent/ENS/Arkiv administration unless needed. An agent operator can go from Network → My Agents → Onboard → Test → Publish without searching a 20-item sidebar.

---

## 1. Source-of-truth and implementation hierarchy

Read these *actual* sources before modifying code. This document replaces the **navigation/information architecture**, not the API and domain contracts.

| Source | Consult | Governs |
|---|---|---|
| [`dashboard design.md`](dashboard%20design.md) | §2 (visual language), §3 (personas/navigation), §4 (page anatomy), §5 (all screens), §8 (shared components), §10 (API mapping), §11–13 (tests, gaps, handoff) | Screen requirements and existing route registry; navigation layout here supersedes its overly broad sidebar |
| [`api design.md`](api%20design.md) | §3.1–3.14, §4 DTOs, §5 state/event contracts, §6 scenarios, §7 science, §13 non-REST interfaces | **Canonical designed HTTP method and path**, status, authorization and response contracts |
| [`design.md`](design.md) | Overall system/product modes, original four surfaces, identity/science boundaries | The original marine workspace and the Research Studio remain separate but connected |
| `docs/01_user_flows.md` | Original four surfaces; institutional and research journeys | User tasks, transitions, permissions and intended continuity |
| `docs/02_agentic_architecture.md` | Supervisor, internal specialists, remote A2A agents | Agent discovery and assignment; don't present internal tools as independent institutions |
| `docs/04_database.md` | Tenant/org/project/agent/evidence/chain projection boundaries | Tenant-safe data access and record ownership |
| `docs/06_memory_context.md` | Seven memory planes and institutional isolation | Don't present remembered chat context as live scientific observations |
| `docs/07_scientific_engine.md` | Provenance, methods, sufficiency, uncertainty and reproduction | Difference between completed compute, supported hypothesis and independently reproduced result |
| [`implementation plan.md`](implementation%20plan.md) | P00–P14 phase/gate sequencing, frontend handoff and test policy | Feature availability, mock-only states and phase verification |
| `docxzipocra.zip` | The 58 per-file frontend spec stubs in 10 groups | Existing target source file paths to update, not finished implementation |
| Current three screenshots | 2026-11-06 entry, command center, Arkiv Explorer | Observed visual/IA problems; see §2 |

**Precision note:** Some 58 stubs contain abbreviated or incorrect endpoints, e.g., `/runs`, `/v1/agents`, `/artifacts/{id}`, `/v1/review/queue`, `/files/upload-intents`. Follow the canonical paths from `api design.md`, not those stubs. If the API lacks a desired global aggregate, record a contract gap; do **not** invent a backend route or hardcode a production response.

### 1.1 Decision priority when documents disagree

1. Current designed API operation and typed schema (`api design.md`) for API integration.
2. Scientific, data-rights, tenancy and security rules from system design + implementation plan.
3. This document for *which navigation and layout shows the feature*.
4. Existing 58 page specs for file targets and screen-level intentions, after endpoint correction.
5. The screenshots for visual diagnosis only; sample figures, testnet indicators and names are **not evidence** of a deployed backend.

---

## 2. Specific critique of the three current screenshots

### Screenshot A — Arkiv State & Transaction Explorer

**What is already good:** white canvas, clear table/master-detail layout, readable row selection, search and inspectable entity/transaction fields.

**Problems to fix:**

- The top bar says **Network**, but the left navigation still lists the entire Institution and Marine systems. This duplicates navigation modes and is the principal clutter problem.
- **Arkiv Explorer** is a specialized diagnostic screen. It should not compete equally with **Discover Agents** and **Public Tasks** for every network user.
- The screenshot labels Arkiv as **Sepolia Testnet** and offers **View on Sepolia Etherscan**. That confuses networks: Arkiv Rabdi records and transaction hashes must use the actual Rabdi network explorer; Ethereum/Sepolia references belong in ENS identity details. Verify destination against the returned chain ID, never build explorer URLs from an untrusted arbitrary string.
- The text describes Arkiv as a “contract” commitment and labels everything “FINALIZED.” Prefer precise statuses: **submitted**, **confirmed**, **indexed**, **expired**, **reconciliation required**, and **failed**, only when supported by backend/chain evidence.
- A “Calculated value: +0.84°C” is an off-chain scientific result, not something blockchain validation certifies. Pair the on-chain result hash with its source-manifest/method/coverage and review status.
- A long raw entity key or full wallet address is useful **on the detailed inspector**, not as the dominant identity in the public task list.

**Replacement:** `Network > Tasks > Task Detail > Ledger` (or `Network > My Agents > Agent Detail > Transactions`), with an optional Advanced Explorer reached via Search/More. Explorer remains addressable at `/network/arkiv`.

### Screenshot B — Institution Command Centre

**What is good:** clear page title, project actions, research project table, recent investigations, and scientific boundary notice.

**Problems:**

- Sidebar has Institution + Network + Marine all at once; reduces focus and forces constant vertical scrolling.
- Four KPI cards are equal size even though **source freshness** and **failed jobs** may need actionable attention while “100% operational” is an unsubstantiated promotional metric.
- `Verified Core`, `100% Operational`, `0 Stale Fencing`, and `INCOIS Probed` require observed data, timestamp, scope and evidence; a frontend demo must not imply they are real.
- Huge whitespace below sparse content could be used for a practical **Action Required** table, **Research Activity** feed, and compact **Project List**.
- A subtle warning about scientific gate boundaries is valuable, but not as a permanent yellow block repeated on every page. Put it in result/evidence context, with a small help link from the overview.

**Replacement:** an action-first institution home: small heading with one primary CTA, a compact 3–4 metric strip, a two-column `Action required` + `Recent investigations`, and full-width `My projects`. Show clear empty/unknown states if aggregates are unavailable.

### Screenshot C — Entry / Release Profile

**What is good:** four understandable product modes and launch paths.

**Problems:**

- The entry page repeats the header modes and left nav, then adds four huge clickable cards for the same destinations. It is three layers of navigation for one decision.
- The screen says `G00–G05 Core Gates Live & Verified`, `CORE-C LIVE`, and `P00–P14 Complete`. These are **not established** by a planning document or screenshot; the source specification explicitly says phases were not started.
- `v3.1-prop`, contract release ID and gate progress dominate normal user onboarding even though they are developer/admin concerns.
- It does not prioritize the user's role or last visited workspace.

**Replacement:** `/` acts as a quiet **entry router**: logged-out introduction; authenticated users with one org go to `org overview` (or last authorized place); users with multiple orgs see `/workspaces`; new users see org setup/invitation. Optional “Choose a workspace” panel only on first visit or deliberate switch. Capability/gate metadata appears under Ops and an unobtrusive support menu, never a fake welcome badge.

---

## 3. New mental model: four modes, one selected context, one sidebar

ORCA has four *different types of work*. Keep them as a compact horizontal **workspace switcher** in the global header. Only the **active workspace** owns the visible left navigation.

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ ORCA    Institution   Network   Marine   Platform Ops*     Search ⌘K   Org ▾  User ▾ │
├────────────────┬────────────────────────────────────────────────────────────────────┤
│                │ Breadcrumbs / Current project                                  │
│   ACTIVE       │ Page title                     [Context-specific primary action] │
│   WORKSPACE    │ ──────────────────────────────────────────────────────────────── │
│   NAV ONLY     │ Content                                                           │
│                │ Content-specific tabs, filters, tables, maps, evidence             │
│                │                                                                   │
│                │                                                                   │
│  ───────────   │                                                                   │
│  Settings*     │                                                                   │
└────────────────┴────────────────────────────────────────────────────────────────────┘
*Only if authorized.
```

### 3.1 Header — one purpose per control

**Left:** ORCA wordmark → four modes. **Center/right:** universal search (`⌘K`/`Ctrl+K`) → organization switcher (only permitted organizations) → `New` context action if relevant → notifications → user menu. Each control must have an accessible label and its data/permission source.

- **Institution** automatically requires a selected institution. On switch to a different organization, clear org-scoped query caches and re-authorize target routes.
- **Network** can contain public discovery and authenticated institution-contributor areas. It must not inherit the previous institution's protected data implicitly.
- **Marine** is accessible according to user permissions and P12 availability; advisory information must not depend on wallet status.
- **Platform Ops** appears only for actual platform-operator roles. An institutional principal investigator is not automatically a platform operator.
- Hide version/testnet badge from primary nav. Put environment/network indicators in the pages that use them and a small optional **About deployment** panel.
- Never put an `N` floating framework development badge into production layout (as seen at bottom-left of screenshots).

### 3.2 Sidebar — hard design limits

1. Display **3–6 primary links**, preferably 4–5, for the active mode.
2. One global left sidebar, not stacked mini-sidebars for every mode.
3. Primary links use **human tasks**, not internal technologies (`Arkiv`, `PostGIS`, `ERDDAP`) unless the primary user really works with that technology.
4. Group advanced tools as **tabs, contextual menus, detail views or Settings**.
5. Only show an item when its product capability is released and the user is authorized; optional disabled previews must say **Not available in this release**, not imitate a working screen.
6. Do not display `P02`, `P09`, `P11` badges beside every link. Phase IDs are engineering metadata shown in Ops, diagnostics or development builds.
7. Show the active navigation item through a restrained neutral background and left marker, not a large dark horizontal block on every section.
8. Collapse a sidebar manually to icon-only mode; collapsed tooltips and keyboard focus are required. Do **not** make tiny icon-only the only desktop default.
9. Sidebar must not scroll past 20 items because there should never be 20 global links.
10. Child pages inherit the active main item. A deep-linked artifact still highlights **Investigations**, while its breadcrumbs and page title show exact location.

### 3.3 Selection/URL state

URL is authoritative for `orgId`, `projectId`, `investigationId`, `taskId`, `agentId`, tab selection where deep linking matters, search parameters, and pagination cursor when meaningful. Use bounded, validated query parameters for `tab=map|chart|table`, filter/pagination, and timeline selection. Persist collapsed-sidebar preference per user, not in a route requiring a database.

When a user changes mode, navigate to that mode's **last valid, authorized route** if available; otherwise to its home. Do not restore a stale org route, inaccessible investigation, expired public task or wrong-tenant context.

---

## 4. Exact navigation trees and where features go

### 4.1 Institution workspace — the main researcher experience

```text
INSTITUTION  [Selected institute ▾]

  Overview                 I01       /org/:orgId/overview
  Projects                 I02       /org/:orgId/projects
  Investigations           R01       /org/:orgId/research/investigations
  Data & Methods           D02       /org/:orgId/data/products
  Scientific Reviews       V01       /org/:orgId/review/inbox

  ───────────────────────────────────────────────────────────
  Settings  [authorized members only]
    Members                I08       /org/:orgId/settings/members
    Access & Sharing       I09       /org/:orgId/settings/access
    Usage & Limits         I10       /org/:orgId/settings/usage
    Audit Log              I11       /org/:orgId/settings/audit
```

**Rules:**

- `Projects` owns project details and their **Overview | Investigations | Files | Members** tabs. Avoid adding four permanent side items for these subpages.
- `Investigations` owns the new investigation wizard, Research Studio, artifact inspector, reports and exports. These remain deep links.
- `Data & Methods` owns **Products | Providers | Snapshots | Compatibility | Methods | Recipes** as local tabs or an in-page toolbar; do not put six extra links in the global sidebar.
- `Scientific Reviews` owns the review inbox and review detail/replication/challenge screens.
- Agent operator tools do **not** belong in the Institution primary list: they live in **Network > My Agents**. An optional **Institution Agents** card on Overview can link there.

### 4.2 Network workspace — the federation layer

```text
NETWORK

  Discover Agents          N01       /network/agents
  Research Tasks           N02       /network/tasks
  My Agents                A01       /org/:orgId/agents          [agent operator]
  Network Activity         (view)    contextual task/result timeline

  ───────────────────────────────────────────────────────────
  Advanced / More
    Arkiv Explorer          N08       /network/arkiv              [advanced]
    Public Verifier         N10       /verify/:publicRef          [separate public route]
```

`Network Activity` can be a tab in `Research Tasks` rather than a fourth link if it has no independent supported API. **Do not create a new activity endpoint** just to populate a side item. It may be implemented from the existing task/detail timeline and result/review APIs.

**Agent detail tabs:** `Overview | Capabilities | Endpoint & Health | Identity (ENS) | Tasks | Activity`. The ENS identity management wizard is *inside* the selected agent, never a permanent sidebar item. Each tab appears only if its P09/P10/P11 backend capabilities exist and the actor is authorized.

**Task detail tabs:** `Overview | Claims | Assignment | Results | Reviews | Ledger`. Public page can display only public metadata; protected evidence requires separate entitlement.

**Arkiv Explorer** is accessible from `Task Detail > Ledger > Open advanced explorer`, from a universal search result, and from the advanced menu. Preserve direct `/network/arkiv` links.

**Public Verifier** is a stand-alone minimal chrome view at `/verify/:publicRef`. Its independent-verification promise must not secretly rely on a protected institutional API session, and a public record hash does not imply accessible private evidence.

### 4.3 Marine workspace — preserve original ORCA features

```text
MARINE COMPANION

  Marine Overview          M01       /marine
  Map & Conditions         M04       /marine/map
  Advisories               M08       /marine/alerts
  Assistant                M02       /marine/conversations

  Tools reachable from map / assistant / overview:
    Fisheries & PFZ         M05       /marine/fisheries
    Route Analysis          M07       /marine/routes
    Conversation Thread     M03       /marine/conversations/:conversationId
```

One map-focused experience should expose distinct layer/tool tabs instead of growing the sidebar every time another ocean feature is added. Keep official advisories prominent and source-labeled; do not show unsupported safety guarantees. P12 features unavailable in the selected deployment remain explicitly gated.

### 4.4 Platform Ops — restricted operational interface

```text
PLATFORM OPS   [operator authorization required]

  System Health            O01       /admin/system
  Sources & Jobs           O02/O03   /admin/sources , /admin/jobs
  Federation Operations    O05       /admin/arkiv
  Governance & Readiness   (view)    source rights, retention, gate evidence
```

Implementation may use secondary tabs inside `System Health` to switch **Sources | Jobs | Federation | Retention | Gate Evidence** until a measured workflow demands separate permanent links. Never expose global tenant logs, secrets, private coordinates or protected source payloads on a general research account.

### 4.5 Where did the “removed” links go?

| Previously visible in permanent sidebar | New discovery path | Still exists? |
|---|---|---|
| Command Centre | Institution > Overview | **Yes** |
| Research Projects | Institution > Projects | **Yes** |
| Investigations | Institution > Investigations | **Yes** |
| Marine Products | Institution > Data & Methods > Products | **Yes** |
| Data Providers | Institution > Data & Methods > Providers | **Yes** |
| Source Snapshots | Institution > Data & Methods > Snapshots | **Yes** |
| Method Registry | Institution > Data & Methods > Methods | **Yes** |
| Agent Directory | Network > My Agents **or** Discover Agents, based on ownership | **Yes** |
| Discover Agents | Network > Discover Agents | **Yes** |
| Public Tasks (Arkiv) | Network > Research Tasks | **Yes** |
| Arkiv Explorer | Network > Task Detail > Ledger / Advanced | **Yes** |
| Scientific Review | Institution > Scientific Reviews | **Yes** |
| Public Verifier | Network advanced / result share link `/verify/:publicRef` | **Yes** |
| Conditions & Alerts | Marine > Map & Conditions + Advisories | **Yes** |
| Advisory Chats | Marine > Assistant | **Yes** |
| Environmental Map | Marine > Map & Conditions | **Yes** |
| Fisheries & PFZ | Marine Map > Fisheries tool | **Yes** |
| Route Exposures | Marine Map > Route tool | **Yes** |
| Alert Channels | Marine > Advisories > Subscriptions/Channels | **Yes** |
| Platform Admin | Platform Ops only | **Yes** |

---

## 5. Complete page templates and interaction design

### 5.1 Global page header, search and contextual action

Every page uses: **breadcrumbs**, one clear H1 title, one-line purpose, optional status with source/time, and at most **one prominent primary action**. Secondary actions belong in a compact action menu. Tabs sit below the title or above the content that they control.

**Correct:** Institution > Projects > Arabian Sea SST Study; H1 `Arabian Sea SST Study`; primary `New Investigation`; tabs `Overview | Investigations | Files | Members`.

**Incorrect:** giant cards for **Institution**, **Network**, **Marine**, **Platform Ops** plus the same four workspace modes in header and 20 links left.

Global search: categorize results by `Projects`, `Investigations`, `Datasets`, `Agents`, `Network tasks`, `Evidence`; respect visibility/authorization. If no cross-domain search backend contract exists, use a limited client-side search over already fetched permitted records and clearly label its scope. Never use one unrestricted SQL-like universal search query from the browser.

### 5.2 Institution Home / I01 — action-first overview

```text
Institution / Overview                                     [New investigation]
Research work for <selected organization>                 [Manage projects ···]
───────────────────────────────────────────────────────────────────────────────
[Active projects]   [Investigations requiring attention]   [Pending reviews]
(Sourced counts only; otherwise 'Not yet available')
───────────────────────────────────────────────────────────────────────────────
Action required                          Recent research
- one blocked dataset retrieval          - SST anomaly, awaiting review
- one scientific review request          - Wave study, completed compute
- access grant pending?                  (each row: state + science state)
───────────────────────────────────────────────────────────────────────────────
My projects [filter] [All projects]
Project | Owner | Access | Latest activity | Investigation state | Open
───────────────────────────────────────────────────────────────────────────────
Network participation  [only if federated release enabled]
1 institutional agent | N pending tasks | [Go to My Agents]
```

**Redesign rules:**

- Do not show `100% operational` unless a precise, meaningful, measured denominator and observation window exist. Display `Active projects: 2` and `Investigations awaiting review: 1` if derived from authorized API lists; otherwise `Not available`.
- Add a **needs attention** section only from real job/review/source states. Link each item to a specific investigation or artifact.
- Never treat an institute name as verified solely because a sample fixture says `NORI`. Use generic demo designation and `Demo data` label in prototype.
- A summary can be computed from paginated authorized collections only when scope and pagination completeness are known. If the backend does not offer aggregates, avoid inaccurate total counts.
- Use compact metric rows and tables; prefer primary workflow over large decorative cards.

**Canonical API:** `GET /v1/organizations/{org_id}` (§3.2); `GET /v1/research/projects` (§3.3); `GET /v1/research/investigations` (§3.6). Optional metrics need a **confirmed contract addition**, not an invented `/v1/dashboard` endpoint. For institution usage `GET /v1/organizations/{org_id}/usage` (§3.9; P08).

### 5.3 Projects / I02–I06 — fewer nav links, richer project context

`Projects` starts as a search/filterable table with title, visibility, collaborators, last meaningful activity, and one new-project dialog. Clicking a project enters a **project context**, not a new global left-sidebar section.

**Project context tabs** `Overview | Investigations | Files | Members` own the functions of I04, I06 and project membership. A project permission is not the same as an organization-wide role.

- `Overview`: summary and active investigations, dataset rights and recent activity.
- `Investigations`: scoped list; `New` pre-fills project context; keep same R02 validation.
- `Files`: upload lifecycle: intent → storage upload → completion/checksum verification → immutable source version. Show staging/rejected state; never show partially uploaded files as available evidence.
- `Members`: granted project users, role controls, safe removal and last-admin protection.

**Canonical API:** `GET/POST /v1/research/projects`; `GET/PATCH /v1/research/projects/{project_id}`; `GET/POST /v1/research/projects/{project_id}/members`; `GET /v1/research/projects/{project_id}/files`; `POST /v1/research/projects/{project_id}/uploads`; `POST /v1/research/uploads/{upload_id}/complete` (§3.3).

### 5.4 Investigations / R01–R12 — flagship path, not a scattered set of menu entries

`Institution > Investigations` opens R01 library. R02 wizard is a child `New Investigation` flow. R03 is the full workspace; R10 artifact inspector, R11 report and R12 export are detail actions/tabs.

**R01 library table:** `Question`, `Project`, `Method`, `State of workflow`, `State of scientific evidence`, `Review`, `Updated`. A run can be technically successful but scientifically insufficient; represent these separately.

**R02 wizard:** five clear steps — (1) Question and hypothesis, (2) Region/time/depth, (3) Product and baseline compatibility, (4) Method + QC + assumptions, (5) Plan review and approval. Show unknown metadata as unknown. No silently substituted product or synthetic baseline.

**R03 workstation:**

```text
Project / Investigation / Saurashtra SST anomaly                   [Run / Review]
Research question          Data window, sources, method/version, QC summary
───────────────────────────────────────────────────────────────────────────────
[Context 22%]       [SCIENCE WORKSPACE 52%]          [Evidence 26%]
Question/parameters [Map | Chart | Table]                [Sources | Claims]
Approved plan       Time slider, region polygon         [QC | Lineage]
Inputs, baseline    Computed field and legend          [Reviews]
Methods             Coverage & uncertainty             [Download]
───────────────────────────────────────────────────────────────────────────────
[Execution events / Tasks / Logs] — collapsible, resumable timeline
```

Keep the original four research concepts visible **within one task-based workstation**: question/conversation context (left), marine map (center), actual agent/job activity (bottom timeline), and scientific evidence (right). Do not expose internal model chain-of-thought; show reproducible operations, tools, provenance, and results instead.

For small monitors, collapse context/evidence into drawers; on mobile, use top `Overview | Data | Evidence | Activity` tabs. Never compress the map to a useless sliver.

**Subpages as contextual tabs:**

- `Evidence > Inspect artifact`: R10 at `/org/:orgId/research/artifacts/:artifactId`. Show digest, immutable input snapshot IDs, method/container version if actually recorded, lineage DAG, checksum verification **status**, linked scientific claim, and permissions. Do not promise a Merkle tree unless one is implemented.
- `Reports`: R11 at existing report path. Separate `draft`, `approved`, `published`; no automatic DOI or PI cryptographic signature without a real external integration and contract.
- `Exports`: R12 at existing path. Show requested bundle, job status, size/licensing, content manifest, generated URL expiration, checksum; available formats only as supported by API.

**Canonical API:** §3.6 for investigations, plans, runs, events and outcome; §3.7 for artifacts, lineages, evidence summary, map layers, reports and exports. Examples:

```text
GET  /v1/research/investigations/{investigation_id}
POST /v1/research/investigations/{investigation_id}/plans
POST /v1/research/investigations/{investigation_id}/plans/{plan_id}/approve
POST /v1/research/investigations/{investigation_id}/runs
GET  /v1/research/investigations/{investigation_id}/events/stream
GET  /v1/research/investigations/{investigation_id}/outcome
GET  /v1/research/investigations/{investigation_id}/artifacts
GET  /v1/research/artifacts/{artifact_id}/lineage
GET  /v1/research/investigations/{investigation_id}/map-layers
POST /v1/research/investigations/{investigation_id}/exports
GET  /v1/research/exports/{export_id}
```

Never use the abbreviated `POST /runs` or `GET /artifacts/{id}` in frontend service code.

### 5.5 Data & Methods — in-page secondary navigation

From the selected Institution sidebar item, show a `Data & Methods` header and compact secondary tabs:

`Products | Providers | Snapshots | Compatibility | Methods | Recipes`

The **Products** table is the default. Source/provider details may use their own nested URL; product detail has variable/unit/depth/coverage/rights, versions and a path to real available snapshot. Compatibility view must tell the user why an anomaly baseline matches or fails (sensor, variable, calendar, depth, climatology period, QC and time).

**Do not claim every source product is operational.** Separate `registered`, `metadata available`, `subset probe passed`, `compatible baseline verified`, `restricted`, `failed`, `unknown`, based on actual source evidence. Scientific readiness isn't implied by a catalog listing.

**Canonical API:** §3.4 source/provider/catalog/snapshot endpoints and §3.5 scientific methods/recipes. Consult actual API rows before binding each D01–D09 stub.

### 5.6 Scientific Reviews / V01–V04

`Institution > Scientific Reviews` has one inbox and one review workspace. Inbox filters `needs action`, `in reproduction`, `reproduced`, `challenged`, `insufficient`, `closed`. Do not assign a global review endpoint if the current API lacks one.

**Review detail** is a two-column comparison of original and independently reproduced inputs/results. Display sample size, method version, tolerance, differing datasets, raw evidence links when authorized, and an explicit verdict with rationale. `Reproduced` only after the numerical check; `Arkiv confirmed` never replaces it.

**Canonical API:** §3.8:

```text
POST /v1/research/artifacts/{artifact_id}/reproductions
GET  /v1/research/artifacts/{artifact_id}/reproductions
GET  /v1/research/reproductions/{reproduction_id}
POST /v1/research/artifacts/{artifact_id}/reviews
GET  /v1/research/artifacts/{artifact_id}/reviews
GET  /v1/research/reviews/{review_id}
POST /v1/research/artifacts/{artifact_id}/challenges
POST /v1/research/challenges/{challenge_id}/responses
POST /v1/research/challenges/{challenge_id}/resolve
```

**Contract gap:** a global `GET /v1/review/queue` route seen in one stub is **not** in §3.8. Either derive the inbox from authorized artifact/project lists within known bounds, or request a new formally approved contract and record it in the API design. Do not pretend it exists.

### 5.7 Network agent discovery and onboarding / A01–A08

The biggest new ORCA capability deserves a short, task-specific flow rather than numerous unrelated side links.

`Network > My Agents` shows owned/provider agents, capability status, trust/identity status, endpoint health, participation and an `Onboard agent` button. `Discover Agents` shows public permitted discoverable agents and filters by *scientific capability, coverage, availability and verified organizational claims* separately.

**Agent onboarding wizard (existing `/org/:orgId/agents/new`):**

1. **Institution:** authorized operator, legal organizational credential (if applicable), data handling policy.
2. **Provider type:** independent A2A, ORCA-hosted (only if supported), or dataset/MCP-only. The existing P09 registry must not be described as a hosted-runtime API without supporting backend operations.
3. **Agent profile & capabilities:** supported methods, regions, units, models, constraints, response envelope, service limits.
4. **Endpoint validation:** A2A Agent Card URI, TLS, authentication and non-SSRF endpoint policy; test results with timestamp and exact status. No self-reported “verified” success.
5. **Identity:** optional or release-dependent ENSv2 registration, resolver record management, delegated permissions, Arkiv wallet binding with signed authorization (P10).
6. **Federation participation:** disclosure/public metadata, opt-in task-board publication and chain costs (P11); clearly distinguish optional from required for a local institution.
7. **Review & publish:** checklist with `passed/failed/unavailable`, responsible org, audit event; cannot publish as trusted until required gates pass.

**Agent Detail** tabs: `Overview | Capabilities | Endpoints & Health | Identity | Tasks | Activity`. `Endpoint & Health` from P09, ENS from P10, task participation from P11. Frontend can show explanatory placeholders only in a development harness; production cannot fake passed checks.

**Canonical API:** §3.10 for registration, capabilities, endpoints, health, discovery and checklist; §3.11 for ENS and bindings.

### 5.8 ENS Identity — local to the agent, not global sidebar

On `Network > My Agents > [agent] > Identity` show:

- **ENS name** and chain (e.g., Ethereum Sepolia for test ENSv2 setup), resolution time, published endpoint records.
- **Resolver permissions**: who controls name and resolver records, delegated role, revocation state; sibling names isolation.
- **Cross-network bindings**: explicit identity-to-agent and ENS-to-Arkiv wallet authorizations; signing proof version/nonce/expiry.
- **Organization credential** status separately from ENS name existence; no automatic governmental/institutional affiliation inference.
- **Operations**: register/update/grant/revoke through correct P10 endpoints with operation state and failure recovery.

`ENSv2 name exists`, `institution validated`, `Arkiv wallet bound`, and `agent endpoint reachable` are **four different statuses**. Keep them independent in state and UI.

**Canonical API:** `POST /v1/identity/ens/resolutions`; `POST /v1/identity/ens/registrations`; `POST /v1/identity/ens/record-updates`; `POST /v1/identity/ens/permission-grants`; `POST /v1/identity/ens/permission-revocations`; `POST /v1/identity/agent-bindings/challenges`; `POST /v1/identity/agent-bindings`; `POST /v1/identity/agent-bindings/{binding_id}/verify`; `POST /v1/identity/agent-bindings/{binding_id}/revoke` (§3.11).

### 5.9 Arkiv tasks — task-centric instead of chain-centric

The ordinary user starts at `Network > Research Tasks`. Each row: task question/capability, region/time, requester identity (trust qualified), task status, availability/deadline, optional reward terms, method requirements and permitted disclosure. Click for detail.

**Task Detail** tabs:

- `Overview`: scientific task and input constraints; explicit disclosure and access needs.
- `Claims`: multiple independent agent applications/claims; signing wallet and confirmation; claiming a task is not winning it.
- `Assignment`: requester-approved selected agent; authorization and idempotency.
- `Results`: signed artifact reference and digest; scientific outcome clearly separated from ledger state.
- `Reviews`: reviewer claims and reproduction outcomes.
- `Ledger`: Arkiv Rabdi entity keys, owner addresses, receipt, indexer status, expiration; external link to **the correct Arkiv network explorer**.

**Key state vocabulary:**

| Dimension | Example valid states | What it proves |
|---|---|---|
| Chain submission | `queued`, `submitted`, `confirmed`, `failed` | Progress of chain transaction |
| Arkiv entity visibility | `indexed`, `indexer lag`, `expired`, `missing` | Read-model / availability conditions |
| Service identity | `unbound`, `binding verified`, `revoked` | Cryptographic authorization, subject to policy |
| A2A task | `offered`, `accepted`, `working`, `completed`, `failed` | Remote execution workflow, not accuracy |
| Scientific assessment | `supported`, `insufficient`, `challenged`, `reproduced`, `rejected` | Policy-bound scientific conclusion/review |

**Canonical API:** §3.12 for tasks/claims/assignments/results/reviews and Arkiv queries/transactions/indexer status. **Never hardcode Sepolia** on an Arkiv task page. Chain IDs and explorer hrefs must come from vetted deployment configuration. Never show guessed block numbers or transaction hashes as real.

### 5.10 Marine companion — a real marine app, not six global links

Main Marine Map contains `Layers`, `Conditions`, `Timeline`, `Fisheries`, `Routes` as controls/tabs near the map. Advisory list is prominent and source/date explicit. Assistant keeps conversations and citations near source-aware map results, rather than presenting model narration as official guidance.

Keep the existing `/marine/fisheries`, `/marine/routes`, `/marine/alerts`, and `/marine/conversations` URLs for deep links. The fact that a route isn't in the primary navigation does not make it unsupported.

### 5.11 Ops — real gate/evidence diagnostics, not promotional badges

Ops status should show *observed* checks: API readiness and revision, DB/PostGIS, object store, provider metadata/subset probe timestamp and evidence, job lease fencing/retry metrics, science test evidence, ENS identity write test, Arkiv write/read/indexer reconciliation, and P00–P14 gate manifests when available.

- `Planned`: feature described but implementation/gate absent.
- `Blocked`: required live test or access unavailable.
- `Failed`: a required test ran and failed.
- `Passed`: signed/reviewed gate manifest exists for the named commit, environment and checks.
- `Not applicable`: only for explicitly excluded release profile, not an excuse to skip promised features.

If gates are still planning-only, show **No verified release gates**. Never generate success from the plan's checklist.

---

## 6. New compact UI design system

### 6.1 Color and typography

```css
:root {
  --page: #ffffff;
  --canvas-subtle: #f8f9fa;
  --surface: #ffffff;
  --text: #111827;
  --text-muted: #4b5563;
  --border: #e5e7eb;
  --border-strong: #cbd5e1;
  --hover: #f3f4f6;
  --selected: #f3f4f6;
  --focus: #111827;
}
```

No neon purple/green gradients, saturated KPI backgrounds, decorative crypto glow, huge emoji logos or floating framework dev badges. Use consistent icon sizes (16–18px) and typography (body 13–14px, page title 22–26px). Statuses should rely on wording/icon as well as any semantic color, making monochrome output usable.

Data visualizations may use a documented, accessible, scientifically meaningful colormap *inside the plot*. E.g., SST must have legend, units and numeric color limits, not decorative teal/green simply to look modern.

### 6.2 Density, spacing and widths

| Element | Recommendation |
|---|---|
| Top bar | ~52–60px tall, fixed within page shell |
| Expanded sidebar | ~208–224px; text labels visible |
| Collapsed sidebar | ~60–64px; icons and tooltips; user-controlled |
| Content outer padding | 24px desktop, 16px tablet, 12–16px mobile |
| Standard table rows | 42–52px; sticky heading on long lists |
| Metric strip | 3–4 compact metrics maximum; no need for giant cards |
| Page max width | Use ~1280–1480px for administrative pages; Research Studio can be full-bleed |
| Breadcrumb | Short, single row with ellipsis on small screens |
| Local tabs | 4–6 visible; use overflow menu if many; do not cause horizontal page scroll |
| Search | Header command palette plus on-page filtering for tables |

These are recommended design tokens, not inflexible measurements. Test at 1280×800 and smaller laptop widths—the screenshots show excessive sidebar height even before the bottom of the page.

### 6.3 Interaction and information hierarchy

- Most important **user action** in primary button; technical diagnostics in overflow.
- A table row click navigates; `···` opens context actions with keyboard support.
- Filter/search controls persist in URL when users need shareable states.
- Empty pages show one plain-English explanation and a next action, not invented sample observations.
- Destructive actions require confirmation summarizing what changes; show optimistic updates only where safe and reversible.
- Show data provenance next to findings, not as a marketing banner.
- Load components incrementally; layout should not jump when scientific map tiles or plots arrive.
- Keep navigation labels predictable: **Data & Methods**, not six variants of the term Catalog/Data Products/Data Providers.

---

## 7. Frontend architecture and folder changes

**No massive route migration is necessary.** Keep existing Next.js `src/app` paths for all 58 planned files. Redesign the shell and navigation registry. You may use route groups like `(institution)` and `(network)` without changing public URLs, but avoid reorganizing physical paths until the developer validates deep-link behavior.

```text
src/
  app/
    layout.tsx                     # document root, global styles, providers only
    page.tsx                       # clean entry router / welcome
    workspaces/page.tsx
    org/[orgId]/                  # current institution-scoped pages retained
      overview/page.tsx
      projects/...                # project and files/members contextual pages
      research/investigations/... # library, wizard, Studio, reports, exports
      data/...                    # product/provider/snapshot/compatibility
      science/...                 # methods/recipes
      review/...                  # inbox and reviewer detail
      agents/...                  # owned agents, setup, ENS identity
      settings/...                # members, grants, usage, audit
    network/...                   # discovery, tasks, detail, advanced ledger
    marine/...                    # marine overview, map, chat, alerts, tools
    admin/...                     # operator-only health and diagnostics
    verify/[publicRef]/page.tsx   # independent minimal shell
  components/
    navigation/
      WorkspaceSwitcher.tsx
      ContextSidebar.tsx
      NavigationRegistry.ts
      Breadcrumbs.tsx
      CommandPalette.tsx
      ContextHeader.tsx
      MobileWorkspaceDrawer.tsx
    layout/
      Header.tsx                   # refactor existing
      Sidebar.tsx                  # refactor existing
      Shell.tsx                    # refactor existing
    research/
      InvestigationTabs.tsx
      EvidenceInspector.tsx
      RunTimeline.tsx
      ScientificStatus.tsx
    network/
      AgentIdentitySummary.tsx
      TaskStatusMatrix.tsx
      ArkivLedgerTab.tsx
    ui/
      Badge.tsx
      EmptyState.tsx
      StatusPill.tsx
  lib/
    api-client.ts                 # generated contract adapter, no fake prod data
    navigation.ts                 # role/capability-aware deterministic menu
    route-context.ts             # org/project/agent/task context validation
    feature-capabilities.ts      # planned vs available vs disabled status
    mock-data.ts                 # test harness only, never runtime fallback
  types/
    api.ts                        # generated API types
    navigation.ts                 # typed menu registry
    errors.ts                     # typed RFC 9457 errors
  tests/
    navigation/
    pages/
    responsive/
    accessibility/
    contracts/
```

### 7.1 One typed navigation registry

Define one declarative registry of active-workspace links, not hand-built arrays scattered across 58 route files. Example *conceptual* pseudocode:

```ts
type Mode = "institution" | "network" | "marine" | "ops";

type NavigationItem = {
  key: string;
  label: string;
  href: (context: { orgId?: string }) => string;
  mode: Mode;
  requiredCapability?: string;
  requiredPermission?: string;
  match: (pathname: string) => boolean;
};

// This registry controls presentation only.
// Server-side authorization and API enforcement still apply.
const institutionItems: NavigationItem[] = [
  { key: "overview", label: "Overview", mode: "institution",
    href: ({ orgId }) => `/org/${encodeURIComponent(orgId!)}/overview`,
    match: p => /\/org\/[^/]+\/overview(?:\/|$)/.test(p) },
  { key: "projects", label: "Projects", mode: "institution",
    href: ({ orgId }) => `/org/${encodeURIComponent(orgId!)}/projects`,
    match: p => /\/org\/[^/]+\/projects(?:\/|$)/.test(p) },
  { key: "investigations", label: "Investigations", mode: "institution",
    href: ({ orgId }) => `/org/${encodeURIComponent(orgId!)}/research/investigations`,
    match: p => /\/org\/[^/]+\/research\/(investigations|artifacts)(?:\/|$)/.test(p) },
];
```

The registry should validate `orgId` before generating links; `!` is shortened here for illustration, **not** a recommendation to bypass null checks in production. Separate platform feature availability from user authorization. Neither a hidden nav item nor disabled button replaces actual API authorization.

### 7.2 Page layout ownership

**Global root layout:** HTML, theme tokens, authenticated session provider. **Workspace layout:** top bar, active-mode sidebar, search and org switch. **Context layout:** optional project/agent/task tabs and breadcrumbs. **Public verify layout:** minimal public chrome, no institutional sidebar. No layout should fetch private organization state using unvalidated route params.

### 7.3 Data loading and caching

- Use generated typed API clients from OpenAPI; do not hand-copy DTOs into component files.
- Query keys include `orgId`, `projectId`, access/entitlement scope, scientific source version, snapshot, depth, cycle, region/time, baseline and as-of when applicable.
- On organization change, clear or invalidate tenant-scoped stores and SSE connections before starting new queries.
- `401` prompts reauthentication; `403` displays permission denied; `404` avoids revealing forbidden cross-tenant resource details; `409/412` stale edit/conflict shows refresh action; `422` highlights fields; `429` respects `Retry-After`; `503` indicates unavailable provider/dependency. The precise semantics follow API §2/§5, not guesses.
- SSE stream reconnect from last accepted event ID, deduplicate events, and recover with polling if replay cursor expired; do not lose durable stage history on page navigation.
- Separate chain transaction read model (P11) and OIDC/P02 private research data. Wallet connection is not generic institutional login.

---

## 8. Existing screens: keep route, reduce navigation prominence

The table below governs migration of the **page** files. The full ZIP also contains shared component and lib/type specs; those are addressed in §9 and Appendix A. Screens are grouped by ownership rather than alphabetically.

| File ID(s) | Existing path(s) | New presentation | Sidebar? |
|---|---|---|---|
| F01 | `/` | Entry router/welcome, not four giant launch cards | No |
| F03 | `/workspaces` | Organization chooser, only when necessary | No |
| I01 | `/org/:orgId/overview` | Institution landing | **Yes: Overview** |
| I02 | `/org/:orgId/projects` | Project list | **Yes: Projects** |
| I04 | `/org/:orgId/projects/:projectId` | Project context overview/tabs | Child |
| I06 | `/org/:orgId/projects/:projectId/files` | Project **Files** tab | Child |
| I08 | `/org/:orgId/settings/members` | Institution **Settings** | Footer |
| I09 | `/org/:orgId/settings/access` | Institution **Settings > Sharing** | Footer |
| I10 | `/org/:orgId/settings/usage` | Institution **Settings > Usage** | Footer |
| I11 | `/org/:orgId/settings/audit` | Institution **Settings > Audit** | Footer |
| R01 | `/org/:orgId/research/investigations` | Investigation library | **Yes: Investigations** |
| R02 | `/org/:orgId/research/investigations/new` | Wizard from `New` CTA | Child |
| R03 | `/org/:orgId/research/investigations/:investigationId` | Flagship Studio | Child |
| R10 | `/org/:orgId/research/artifacts/:artifactId` | Evidence inspector | Child |
| R11 | `/org/:orgId/research/investigations/:investigationId/reports` | Studio `Reports` | Child |
| R12 | `/org/:orgId/research/investigations/:investigationId/exports` | Studio `Exports` | Child |
| D01 | `/org/:orgId/data/providers` | Data & Methods `Providers` tab | Tab |
| D02 | `/org/:orgId/data/products` | Default Data & Methods `Products` | **Yes: Data & Methods** |
| D03 | `/org/:orgId/data/products/:productId` | Product detail | Child |
| D05 | `/org/:orgId/data/snapshots` | Data & Methods `Snapshots` tab | Tab |
| D06 | `/org/:orgId/data/compatibility` | Data & Methods `Compatibility` tab | Tab |
| D08 | `/org/:orgId/science/methods` | Data & Methods `Methods` tab | Tab |
| D09 | `/org/:orgId/science/recipes` | Data & Methods `Recipes` tab | Tab |
| V01 | `/org/:orgId/review/inbox` | Review inbox | **Yes: Reviews** |
| V02–V04 | `/org/:orgId/review/:reviewId` | Review detail, reproduction/challenge | Child |
| N01 | `/network/agents` | Network discovery | **Yes: Discover Agents** |
| A01 | `/org/:orgId/agents` | My Agents for authorized provider | **Yes: My Agents** |
| A02–A06 | `/org/:orgId/agents/new` | Onboarding wizard | Child |
| A07–A08 | `/org/:orgId/agents/:agentId` | Agent detail tabs | Child |
| E01–E05 | `/org/:orgId/agents/:agentId/identity` | Agent detail `Identity` tab | Child |
| N02 | `/network/tasks` | Public research task board | **Yes: Research Tasks** |
| N03 | `/network/tasks/new` | Publish task CTA | Child |
| N04–N05 | `/network/tasks/:taskId` | Task detail tabs | Child |
| N08 | `/network/arkiv` | Advanced Ledger Explorer | Advanced |
| N10 | `/verify/:publicRef` | Public verifier with independent minimal shell | Shared/deep link |
| M01/M06 | `/marine` | Marine Overview | **Yes: Overview** |
| M02 | `/marine/conversations` | Assistant directory | **Yes: Assistant** |
| M03 | `/marine/conversations/:conversationId` | Conversation context | Child |
| M04 | `/marine/map` | Map & Conditions | **Yes: Map & Conditions** |
| M05 | `/marine/fisheries` | Map/Marine `Fisheries` tool | Tab/tool |
| M07 | `/marine/routes` | Map/Marine `Routes` tool | Tab/tool |
| M08 | `/marine/alerts` | Marine `Advisories` | **Yes: Advisories** |
| O01 | `/admin/system` | System Health / release evidence | **Yes: Ops** |
| O02 | `/admin/sources` | Ops `Sources` tab | Tab |
| O03 | `/admin/jobs` | Ops `Jobs` tab | Tab |
| O05 | `/admin/arkiv` | Ops `Federation` tab | Tab |

No existing page should be deleted merely to simplify the nav. The `Sidebar`, `Header`, `Shell` and shared types are redesigned **in place**. A detailed route regression checklist appears in §11.

---

## 9. Migration checklist for the 58 per-file Markdown specs

The per-file docs supplied in `docxzipocra.zip` are about 50 lines each; most are concise stubs rather than full acceptance-ready screen designs. Update each *page* stub using the **same nine sections**:

1. **Purpose / persona / release profile:** what decision the user makes on this screen; which P phase/capability and actual permission controls it.
2. **Navigation placement:** mode, primary sidebar key, local tab/breadcrumb, parent/child route, mobile entry path.
3. **Screen anatomy:** title, CTA, table/map/chart/inspector, empty/loading/error/forbidden/unsupported states.
4. **Exact API bindings:** method + full versioned path from `api design.md`, request/response DTO, source, permission, event/channel.
5. **Actions/state transitions:** buttons/modal forms and their preconditions, concurrency, ETag, idempotency and confirmation.
6. **Scientific/trust truth rules:** live versus fixture, source/QC, claims, ENS/Arkiv proof status and expiries.
7. **Responsive/accessibility behavior:** small-laptop/sidebar, tablet drawers, mobile tab behavior, keyboard and screen-reader labels.
8. **Tests:** named UI, contract, navigation, role, accessibility, dark/no-data (white theme only), event/retry tests.
9. **Done when:** production readiness conditions and required backend gate evidence; explicit remaining contract gaps.

### 9.1 Existing shared specs to modify first

| Existing spec | Required change |
|---|---|
| `components/Header.md` | Implement workspace switcher and current-org switch; remove redundant global links/version badges from common research UX |
| `components/Sidebar.md` | Render just active workspace's 3–6 links with permission/feature gating and correct selected-state matching |
| `components/Shell.md` | Compose root header + contextual sidebar + breadcrumb + content; support no-sidebar public verifier |
| `components/Badge.md`, `StatusPill.md` | Multi-dimensional evidence and chain state without “verified = accurate” conflation |
| `components/EmptyState.md` | Explicit empty, permission denied, not-yet-enabled, unavailable provider and missing-reproducibility states |
| `foundation/globals_css.md` | White-neutral tokens, accessible focus and compact density; no decorative gradients |
| `foundation/layout.md` | One shell, no duplicated vertical/horizontal navigation, responsive layout |
| `lib_types/api_client.md` | Canonical versioned routes, typed error handling, OIDC, ETags, idempotency, tenant-scoped cache |
| `lib_types/api_types.md`, `errors_types.md` | Generated DTOs, stable scientific and chain status enums |
| `lib_types/mock_data.md` | Test harness only; fixture indicator on every record; remove from production import graph |

### 9.2 Reconcile incorrect endpoint examples *before* page coding

| Stub or UI behavior | Incorrect or undocumented form | Canonical contract or required action |
|---|---|---|
| R03 run execution | `POST /runs` | `POST /v1/research/investigations/{investigation_id}/runs` (§3.6) |
| R10 artifact inspection | `GET /artifacts/{id}` | `GET /v1/research/artifacts/{artifact_id}` (§3.7) |
| R11 report publish | `POST /reports/publish` | `POST /v1/research/reports/{report_id}/publish` (§3.7) |
| R12 export polling | `GET /exports/{id}` | `GET /v1/research/exports/{export_id}` (§3.7) |
| I06 uploads | `POST /files/upload-intents` | `POST /v1/research/projects/{project_id}/uploads`; complete via `/v1/research/uploads/{upload_id}/complete` (§3.3) |
| I08 invitation | `POST /v1/invitations` | `POST /v1/organizations/{org_id}/invitations` (§3.2) |
| I09 access grant | `GET /v1/access-grants` | `GET /v1/organizations/{org_id}/access-grants` (§3.2) |
| I11 audit events | `GET /v1/audit-events` | `GET /v1/organizations/{org_id}/audit-events` (§3.9) |
| V01 global review inbox | `GET /v1/review/queue` | No equivalent global route in §3.8; flag explicit contract gap; do not synthesize unauthenticated global queue |
| V02–V04 review verdict | `POST /v1/review/{id}/verdicts` | Use designed `POST /v1/research/artifacts/{artifact_id}/reviews` and challenge endpoints or propose contract update (§3.8) |
| Network agent register | `/v1/agents` | `POST /v1/network/agents` (§3.10) |
| N10 verification | `GET /v1/network/results/{ref}` | `GET /v1/network/results/{result_ref_id}` plus `POST /v1/network/verifications` (§3.12); access/auth policy must match contract |
| Arkiv Explorer network link | Sepolia Etherscan | Rabdi explorer for Arkiv; Sepolia ENS explorer only on ENS details |

### 9.3 Proposed UI improvements cannot silently create backend promises

Examples of potential approved API change requests: globally aggregated institution dashboard counts; cross-project review queue; agent fleet summary; network-wide activity feed; notification inbox; cross-domain search; hosted-agent provisioning; DOI registration. These are **not** assumed to exist in the 220-route API. Build with supported data only, request an ADR + API contract revision for anything new, and hide incomplete functionality in actual release mode.

---

## 10. Feature release and role visibility matrix

| Mode / screen family | Typical viewer | Backend release / phase | Missing capability behavior |
|---|---|---|---|
| Institution org/projects/members | Authenticated, authorized organization member | P02 | 401/403 or contextual invitation, never fabricated org |
| Data & Methods | Researcher/data steward with source rights | P03–P04 | Registration visible only if truthful, scientific compute disabled until live G03/G04 |
| Investigations / Research Studio | Authorized project participant | P05–P06 | Show draft and contract previews only in explicit dev/test mode before gate |
| Review & reproduction | Authorized reviewer with evidence access | P07 | Clear `Review not available` / no scientific claim of verification |
| Institution usage/audit + Ops | Scoped institution admin / platform operator | P08 | Hide cross-tenant/global controls from regular scientist |
| Network discovery and owned agents | Allowed network participant, agent provider operator | P09 | Explain federation unavailable; core research still works |
| ENS identity/binding | Authorized agent operator | P10 | Mark identity unregistered/unverified; never fake signatures |
| Arkiv task coordination/ledger | Network participant with appropriate rights | P11 | Show network explicitly unavailable; don't block local science flows |
| Marine companion | Authorized marine role as configured | P12 | Don't present official notices as tested if feeds unavailable |
| Institutional validation and production qualification | Operator and auditors | P13–P14 | Gates require real reports, not checklist tick boxes |

**Permission model:** feature available `AND` route authorized `AND` resource visible. All three are required. A valid ENS name or wallet is **not** equivalent to institutional project membership.

---

## 11. Frontend acceptance and regression test plan

Test all of the following with route fixtures and real release capability responses. For any mock, clearly mark `fixture: true`; live gate checks remain separate.

### 11.1 Navigation and responsive tests

| ID | Steps | Expected |
|---|---|---|
| NAV-01 | Open Institution Overview | Sidebar contains only Institution primary links and Settings footer; Network/Marine links absent |
| NAV-02 | Switch to Network | Sidebar replaces Institution items with Discover Agents, Tasks, My Agents when authorized |
| NAV-03 | Switch to Marine | Map, Advisories and Assistant visible; no Data Provider/Arkiv Explorer clutter |
| NAV-04 | Unprivileged researcher | Platform Ops hidden; direct `/admin/system` unauthorized at server/API, not merely hidden link |
| NAV-05 | Enter a Project from table | Projects highlighted; local `Overview/Investigations/Files/Members` tabs visible |
| NAV-06 | Deep-link to R03 | Investigations highlighted, full breadcrumbs; reload remains correct |
| NAV-07 | Deep-link to R10 artifact | Investigations highlighted; breadcrumb back to original investigation when authorized |
| NAV-08 | Deep-link to N08 Arkiv | Network active, navigation accessible from task ledger/advanced menu, not permanent sidebar item |
| NAV-09 | Deep-link to N10 verify | Minimal public shell; no institutional private workspace sidebar |
| NAV-10 | Switch organization | Old tenant search/cache/SSE invalidated; no cross-org flash of protected content |
| NAV-11 | Collapse / expand sidebar | Main content resizes; tooltips and keyboard navigation still work |
| NAV-12 | Browser back/forward after tab and filter changes | Correct active mode, selected entity/tab and no stale org data |
| NAV-13 | Refresh all 48 existing application page URLs | Every route resolves or returns proper authorized/unavailable state; none 404 due solely to nav simplification |
| NAV-14 | Open at 1280×800 | Primary navigation is visible without an overlong sidebar scroll; main table/map usable |
| NAV-15 | Open at 768px / 390px | Sidebar becomes accessible drawer; global header controls do not overlap or clip |
| NAV-16 | Keyboard-only operation | All top bar modes, local tabs, dropdowns, task rows, menus reachable with visible focus |
| NAV-17 | Screen reader | `nav` landmark labels and active `aria-current=page` correctly reflect workspace |
| NAV-18 | Search while switching org | Results never leak previous org; search scope is shown |

### 11.2 Scientific and trust-state tests

| ID | Scenario | Expected |
|---|---|---|
| TRUTH-01 | Investigation run completed but coverage insufficient | Shows `Completed execution` and `Insufficient evidence`, **not** `Scientifically verified` |
| TRUTH-02 | Result is challenged | Original scientific evidence retained; challenge/review link visible |
| TRUTH-03 | Product not probed | Catalog says unknown/not verified; no false `INCOIS Probed` |
| TRUTH-04 | ENS name resolves without institutional proof | Name exists; institution still `Not verified` |
| TRUTH-05 | Arkiv tx confirmed, indexer behind | Transaction `Confirmed`; entity `Indexing pending` |
| TRUTH-06 | Arkiv expired entity | Show `Expired`; don't treat local stale projection as currently queryable |
| TRUTH-07 | Provider endpoint down | Explicit `Unreachable`, with last check time and retry; no fabricated result |
| TRUTH-08 | Demo dataset record | `Demo data` / `fixture: true` visible in workspace, card and artifact details |
| TRUTH-09 | Missing gate record | UI states `Not verified`/`Not available`, never `G00–G05 live` |
| TRUTH-10 | No authoritative marine alert data | Display `Advisory unavailable` and source/time limitations; no invented all-clear |
| TRUTH-11 | User sees Rabdi Arkiv entity | Links point to configured Rabdi explorer and chain ID, never Sepolia Etherscan |
| TRUTH-12 | Published report lacks DOI integration | No DOI button/number; publication status limited to implemented workflow |

### 11.3 API integration and authorization tests

| ID | Scenario | Expected |
|---|---|---|
| API-01 | R03 submits run | Calls correct `/v1/research/investigations/{id}/runs`; ETag/idempotency policy followed |
| API-02 | I06 uploads and completion fails | File remains staged, not shown as verified immutable evidence |
| API-03 | V01 missing global review route | Graceful unavailable/derived list; client does not request nonexistent `/v1/review/queue` |
| API-04 | 403 project resource | No last-rendered protected data; actionable access-denied state |
| API-05 | 412 stale edit | User can refresh and compare; no silent overwrite |
| API-06 | 429 source/API throttling | Respect Retry-After and bounded retries |
| API-07 | SSE disconnect / reconnect | Last event ID resume and dedup; no duplicated task status |
| API-08 | Network discovery while logged out | Public-only fields shown; protected agent credentials never included |
| API-09 | Agent revoked ENS/Arkiv binding | Authorized actions disabled; past result history remains labeled and historically traceable |
| API-10 | Different tenant's org ID in URL | API rejects access; sidebar/org selector never shows unauthorized data |
| API-11 | Unknown backend operation | Frontend records contract gap instead of inventing a route |
| API-12 | Released core profile without federation | Core institution/research works; P09–P11 actions hidden or explicitly unavailable |

### 11.4 Visual and information-density tests

- Snapshot compare at desktop 1536×864, laptop 1280×800, tablet 768×1024 and mobile 390×844.
- 5 Institution primary links maximum (Settings footer excluded), 4 Network links maximum, 4 Marine links maximum, 4 Ops links maximum.
- All primary CTA buttons appear without vertical sidebar scroll on 1280×800.
- All pages have one H1, meaningful breadcrumbs and a visible active workspace.
- No decorative gradient, no floating debug badge, no arbitrary “verified”/“100% operational” text.
- Tables fit important columns; secondary data is available in detail panel, not squashed into mobile widths.
- Empty/error/loading/permission-restricted/unreleased states verified per screen.
- Semantic status text is understandable when screenshots are printed in grayscale.

---

## 12. Recommended implementation order (frontend only)

| Stage | Work | No-go condition | Deliverable |
|---|---|---|---|
| **UX-0** | Freeze current route inventory and screenshot baseline. Validate canonical API contract. | Route/permission owner unresolved for a page | Route registry; contract discrepancy ledger |
| **UX-1** | Refactor `Header`, `Sidebar`, `Shell`, global styles; add mode-aware navigation registry and org-scoped cache invalidation. | Cross-tenant cache or deep-link test fails | Unified shell, no old duplicated sidebar |
| **UX-2** | Institution IA: Overview, Projects, Investigation library/Studio, Data & Methods, Reviews and Settings tabs. | Scientific status conflated with job state | Researcher flow complete in test harness |
| **UX-3** | Network IA: Agents, owned-agent wizard/identity, Tasks, Task Detail/Ledger, public verifier. | Fake ENS/Arkiv live assertions or bad chain links | Federated UI wired to typed contracts; gated pending P09–P11 |
| **UX-4** | Marine IA: map/conditions, advisories, assistant, tools; Ops IA: status, sources/jobs, chain indexer. | Official advisory attribution or role gate fails | Cleanly separated Marine and Ops workspaces |
| **UX-5** | Accessibility, responsive, route regression, contract tests and walkthrough with scientific + operator personas. | Missing required test, blocked backend gate incorrectly shown as passed | QA report + screenshots + updated 58 docs |

**Frontend can start against contract-valid fixtures, but backend/live release claims remain gated.** P00–P14 implementation and scientific live checks are unaffected by nav simplification.

---

## 13. Handoff acceptance / definition of done

A frontend change implementing this design is acceptable only if:

1. The active sidebar changes with the **top-level workspace**, with no mixed Institution/Network/Marine/Platform Ops menu lists.
2. Every existing page URL still works or intentionally routes with a documented migration. Direct links to reports, artifacts and public verifications survive.
3. A user can find every prior feature using **primary navigation + local tabs + context actions + search**, without memorizing internal endpoint names.
4. Institution research flows remain accessible without an ENS name or an Arkiv wallet.
5. Provider onboarding remains complete and discoverable under Network, including ENS and Arkiv only when the corresponding release is available.
6. The scientific outcome, workflow status, institutional trust and blockchain status are never collapsed into one universal `VERIFIED` badge.
7. No `CORE LIVE`, successful gate, institutional certification, source freshness, real-time advisory, chain block, transaction hash, or scientific figure is fabricated from fixtures.
8. All frontend callers use the exact canonical versioned API routes and generated types; discrepancies identified in §9.2 are fixed.
9. Permission checks, 401/403/404/409/412/429/5xx handling, SSE reconnect and tenant switch are tested.
10. The product remains recognizably white, calm, professional and scientific, with significantly fewer visible sidebar links and fewer duplicated launch cards.

**Recommended first pull request:** refactor only the shell (`Header.tsx`, `Sidebar.tsx`, `Shell.tsx`, navigation registry, org switch behavior, tests) while preserving all existing pages/routes. Compare the same three screenshots before/after. Once the shell passes navigation/authorization tests, move to institution content density and then the network-task/Arkiv distinction.

---

## Appendix A — All 58 supplied Markdown files, their target modules, and review disposition

This is a preservation checklist: every source spec remains accounted for. The summary above describes the visible pages; this appendix also tracks shared components and libraries. **No file in this appendix is proof that its target source file has been implemented.**

**Source:** `docxzipocra.zip` (`docs/` tree). **Count:** 58 Markdown files.

| Existing specification | Target source path | New home / navigation treatment | Frontend stage |
|---|---|---|---|
| `docs/admin/O01_system_readiness.md` | `src/app/admin/system/page.tsx` | Operator context; diagnostics as tabs | UX-4 |
| `docs/admin/O02_source_operations.md` | `src/app/admin/sources/page.tsx` | Operator context; diagnostics as tabs | UX-4 |
| `docs/admin/O03_job_queues.md` | `src/app/admin/jobs/page.tsx` | Operator context; diagnostics as tabs | UX-4 |
| `docs/admin/O05_arkiv_indexer.md` | `src/app/admin/arkiv/page.tsx` | Operator context; diagnostics as tabs | UX-4 |
| `docs/components/Badge.md` | `src/components/ui/Badge.tsx` | Shared shell / foundation | UX-1 |
| `docs/components/EmptyState.md` | `src/components/ui/EmptyState.tsx` | Shared shell / foundation | UX-1 |
| `docs/components/Header.md` | `src/components/layout/Header.tsx` | Shared shell / foundation | UX-1 |
| `docs/components/Shell.md` | `src/components/layout/Shell.tsx` | Shared shell / foundation | UX-1 |
| `docs/components/Sidebar.md` | `src/components/layout/Sidebar.tsx` | Shared shell / foundation | UX-1 |
| `docs/components/StatusPill.md` | `src/components/ui/StatusPill.tsx` | Shared shell / foundation | UX-1 |
| `docs/data_methods/D01_providers.md` | `src/app/org/[orgId]/data/providers/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D02_products.md` | `src/app/org/[orgId]/data/products/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D03_product_detail.md` | `src/app/org/[orgId]/data/products/[productId]/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D05_snapshots.md` | `src/app/org/[orgId]/data/snapshots/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D06_compatibility.md` | `src/app/org/[orgId]/data/compatibility/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D08_methods.md` | `src/app/org/[orgId]/science/methods/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/data_methods/D09_recipes.md` | `src/app/org/[orgId]/science/recipes/page.tsx` | Data & Methods local tabs/details | UX-2 |
| `docs/federated_network/A01_agent_directory.md` | `src/app/org/[orgId]/agents/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/A02_A06_agent_onboarding.md` | `src/app/org/[orgId]/agents/new/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/A07_A08_agent_detail.md` | `src/app/org/[orgId]/agents/[agentId]/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/E01_E05_ens_identity.md` | `src/app/org/[orgId]/agents/[agentId]/identity/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/N01_external_agents.md` | `src/app/network/agents/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/N02_network_tasks.md` | `src/app/network/tasks/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/N03_publish_task.md` | `src/app/network/tasks/new/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/N04_N05_task_detail.md` | `src/app/network/tasks/[taskId]/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/federated_network/N08_arkiv_explorer.md` | `src/app/network/arkiv/page.tsx` | Network context; agent/task drill-down | UX-3 |
| `docs/foundation/F01_entry.md` | `src/app/page.tsx` | Shared shell / foundation | UX-1 |
| `docs/foundation/F03_workspaces.md` | `src/app/workspaces/page.tsx` | Shared shell / foundation | UX-1 |
| `docs/foundation/globals_css.md` | `src/app/globals.css` | Shared shell / foundation | UX-1 |
| `docs/foundation/layout.md` | `src/app/layout.tsx` | Shared shell / foundation | UX-1 |
| `docs/institution/I01_command_centre.md` | `src/app/org/[orgId]/overview/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I02_projects_index.md` | `src/app/org/[orgId]/projects/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I04_project_detail.md` | `src/app/org/[orgId]/projects/[projectId]/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I06_project_files.md` | `src/app/org/[orgId]/projects/[projectId]/files/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I08_members.md` | `src/app/org/[orgId]/settings/members/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I09_access_grants.md` | `src/app/org/[orgId]/settings/access/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I10_usage_quotas.md` | `src/app/org/[orgId]/settings/usage/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/institution/I11_audit_log.md` | `src/app/org/[orgId]/settings/audit/page.tsx` | Institution context; project / settings child | UX-2 |
| `docs/lib_types/api_client.md` | `src/lib/api-client.ts` | Typed client / fixture boundary | UX-1 |
| `docs/lib_types/api_types.md` | `src/types/api.ts` | Typed client / fixture boundary | UX-1 |
| `docs/lib_types/errors_types.md` | `src/types/errors.ts` | Typed client / fixture boundary | UX-1 |
| `docs/lib_types/mock_data.md` | `src/lib/mock-data.ts` | Typed client / fixture boundary | UX-1 |
| `docs/marine/M01_M06_marine_landing.md` | `src/app/marine/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M02_conversations.md` | `src/app/marine/conversations/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M03_conversation_stream.md` | `src/app/marine/conversations/[conversationId]/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M04_environmental_map.md` | `src/app/marine/map/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M05_fisheries_pfz.md` | `src/app/marine/fisheries/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M07_routes.md` | `src/app/marine/routes/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/marine/M08_alerts.md` | `src/app/marine/alerts/page.tsx` | Marine context; tools as local views | UX-4 |
| `docs/research/R01_investigations.md` | `src/app/org/[orgId]/research/investigations/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/research/R02_new_investigation.md` | `src/app/org/[orgId]/research/investigations/new/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/research/R03_research_studio.md` | `src/app/org/[orgId]/research/investigations/[investigationId]/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/research/R10_artifact_inspector.md` | `src/app/org/[orgId]/research/artifacts/[artifactId]/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/research/R11_reports.md` | `src/app/org/[orgId]/research/investigations/[investigationId]/reports/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/research/R12_exports.md` | `src/app/org/[orgId]/research/investigations/[investigationId]/exports/page.tsx` | Investigation context; evidence/report child | UX-2 |
| `docs/verification/N10_public_verifier.md` | `src/app/verify/[publicRef]/page.tsx` | Review workspace or minimal public verifier | UX-2/3 |
| `docs/verification/V01_review_inbox.md` | `src/app/org/[orgId]/review/inbox/page.tsx` | Review workspace or minimal public verifier | UX-2/3 |
| `docs/verification/V02_V04_review_detail.md` | `src/app/org/[orgId]/review/[reviewId]/page.tsx` | Review workspace or minimal public verifier | UX-2/3 |

## Appendix B — Quick before/after reference for design review

**Before:** four top-level modes *and* all four sets of links embedded together in the left sidebar; Arkiv Explorer as a primary section; entry page repeats mode choice with large cards; ambiguous verification badges.

**After:** one selected top-level mode and one task-based sidebar; five Institution links + settings footer; Network task/agent focus; chain explorer only as task diagnostic; concise entry routing; clearly sourced statuses; preserved 58 spec files and all deep routes.

### Two-minute stakeholder walkthrough

1. Sign in as an authorized institutional researcher. Show **Institution** sidebar and open an authorized project, then its Investigation tab.
2. Open Research Studio. Locate marine map, source metadata, scientific outcome, execution timeline, and artifact review without navigating to an unrelated global section.
3. Switch to **Network**. Show only federation routes, onboard an agent, open its ENS Identity tab, then navigate to a public task and its Rabdi Ledger tab.
4. Switch to **Marine**. Display only map/advisories/assistant navigation; demonstrate that official-data absence is not a safety all-clear.
5. Show that a non-operator cannot see Ops, the public verifier is isolated, and a fixture record is not labeled real.

**Implementation caution:** the current 58-file archive consists of **Markdown page specifications**. Upgrading these specs or a navigation design does not mean the corresponding `.tsx` files have been created, tested, or deployed.
