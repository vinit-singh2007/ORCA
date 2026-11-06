# ORCA 3.0 — Institutional Dashboard & Full Frontend Screen-by-Screen Design Specification
**Date:** 2026-11-06  \
**Version:** `frontend-ux-3.2-proposal`  \
**Status:** **DESIGN ONLY.** No screen or backend integration is represented as implemented, tested, deployed, scientifically validated or connected to a chain.  \
**Primary contract:** [`api design.md`](api%20design.md), revision `3.1.0-proposal`, 220 designed REST operations in 14 families.  \
**Backend implementation reference:** [`implementation plan.md`](implementation%20plan.md), P00–P14.  \
**Architecture reference:** [`design.md`](design.md), and `docs/01_user_flows.md` through `docs/07_scientific_engine.md`.  \
**Audience:** frontend engineers, designers, QA engineers, backend contract owners, institutional users and scientific reviewers.  \
**Deliverable:** screen layouts, pages/drawers, precise data bindings, API calls, personas, critical UI states, acceptance tests, reusable components and handoff dependencies. **The earlier HTML dashboard is not the design authority and should not be reused as the layout template.**

> **Truth boundary:** the 220 endpoints are *planned*. The frontend can use P01 isolated fixture transport or scenario mock server, but must not imply any actual source data, chain transaction, institution verification, scientific accuracy, or working production feature until its backend gate has passed. All values in design examples are synthetic and labeled. No route or UI below silently adds a server API.

## Contents
- 1. Scope, authority and feature-release rules
- 2. Visual language: strict white / neutral only
- 3. Personas, workspace navigation and role gates
- 4. Layout anatomy, navigation and page templates
- 5. Complete screen registry and screen-by-screen specifications
- 6. High-fidelity text wireframes
- 7. Interactive workflows and confirmation rules
- 8. Shared components, front-end folders and state ownership
- 9. Data fetching, streaming, caching, failure and security behavior
- 10. Complete 220-operation API-to-screen crosswalk
- 11. Test plan: screen and journey acceptance
- 12. Backend gaps, open ADRs and no-fabrication rules
- 13. Frontend delivery phases and definition of done
- 14. Source document and design linkage

---

## 1. Scope, authority and feature-release rules

The purpose is to add a **new institution-first product experience** on top of the original ORCA Marine Companion, without collapsing scientific claims, agent task claims, provider identity and blockchain ownership into one ambiguous status. It must provide end-to-end discoverability for every planned backend API family—even modules developed later. This specification is for **frontend UX design and build handoff**, not a request to build a decorative static HTML prototype.

**Source hierarchy:** (1) user-provided strict gate policy and current implementation plan; (2) current proposed API contract for exact URL/body/status semantics; (3) updated ORCA seven-doc architecture and source audit; (4) original research portal for retained use cases; (5) upstream A2A/MCP/ENSv2/Arkiv standards for wire protocols. If an API and the visual suggestion conflict, **API wins** until a versioned contract change is approved. Scientific source metadata wins over mock samples.

| Release profile | Gates | Screens available as real production functionality |
|---|---|---|
| `core-A` | G00–G02 | Session/org, project, grants, files, basic metadata. No marine computations yet. |
| `core-B` | G00–G05 | Source catalog, methods, bounded SST investigation, run history and event stream; no report/reproduction promise. |
| `core-C` | G00–G08 | Maps, reports, evidence, exports, independent reproduction, historical evaluation, institution operations. |
| `federation` | core-C + G09–G11 | Agent directory and onboarding, ENSv2 identity & authorization, Arkiv tasks and independent verifier. |
| `expanded` | explicit release selection + G12 and feature gates | Marine companion, voice/alerts/memory, advanced models, diagnostics and monitoring. |
| `institutional-scale` | G13–G14 | Measured pilot and production qualification; not an implied UI feature switch. |

**Visibility rule:** a route is only *production-available* if server `/v1/meta` advertises its capability as implemented (and live_verified for features requiring real source/chain evidence), and user authorization allows it. Planned screens may exist behind a deliberate preview/feature-flag build but are **not clickable dead links** in a production build.

## 2. Visual language: strict white / neutral only

The previous colorful dashboard concept is intentionally **discarded**. Use white as the base across institution, research, network, agent and audit experiences. Use restrained monochrome neutrals for hierarchy, **not random teal/navy/orange/neon accents**. A real scientific data layer may use a validated variable-specific color scale *inside the map/chart only*; that is data encoding, not UI decoration.

| Token | Value | Usage |
|---|---|---|
| `bg-page` | `#FFFFFF` | Every app page, sidebar and main canvas |
| `bg-muted` | `#F8F9FA` | Secondary selected detail panel only |
| `bg-hover` | `#F3F4F6` | Hover and selected rows, never gradients |
| `border` | `#E5E7EB` | Dividers, table lines and input bounds |
| `text-primary` | `#111827` | Titles and important scientific values |
| `text-secondary` | `#4B5563` | Descriptions and labels |
| `text-muted` | `#6B7280` | Timestamps and helper copy |
| `interactive` | `#111827` | Primary text buttons and focus outlines |
| `disabled` | `#9CA3AF` | Disabled controls with explicit reason |

**Typography:** system sans or a single licensed/open font, 14–15px UI body, 16px section headers, 20–24px main page headings, 12px metadata. Use tabular figures for timestamps, scientific quantities and costs. Keep scientific units explicit. No hero gradients, giant decorative statistic numerals, fake crypto trading charts, colored glass cards, unnecessary shadows, or oversized icons.

**Design geometry:** desktop left sidebar 232–248px; top header 56–64px; content max 1440px for tables and flexible full width for maps; 8px spacing base; 12–16px table rows; 1px borders; 6px radius. Forms 640–760px max width unless method/geometry editor. Modals 440–680px, confirmation not used for simple navigation. Science workspace map expands into available width with collapsible inspector.

**Status styling:** accessible neutral outline/text plus semantic words and icons: `Pending`, `Unavailable`, `Blocked`, `Supported`, `Insufficient evidence`, `Reproduced`, `Revoked`, `Submitted`, `Confirmed`, `Indexed`. For serious danger, a reserved accessible warning treatment may be used as *semantics only*, not a decorative palette. Never communicate only by color. ENS ownership, institutional accreditation, A2A reachability, Arkiv confirmation and scientific validity get **five separate indicators**.

**Accessibility:** WCAG 2.2 AA design target; logical tab order, visible focus, screen-reader labels, keyboard-accessible maps/geometry fallbacks, persistent table alternatives to charts, accessible date/time strings, reduced motion, responsive 320px viewport, full error summaries linked to invalid fields. Scientific visualization uses legends and a machine-readable table.

## 3. Personas, workspace navigation and role gates

| Persona | Default | High-value actions | Must not assume |
|---|---|---|---|
| Individual user/fisherman | Marine Companion | Conditions, warnings, chat, voice, personal alerts | Wallet or decentralized network required |
| Researcher | Research investigations | Data/recipe selection, bounded scientific run, evidence inspection | Can publish official warnings or bypass quality gates |
| PI/research lead | Institution Home | Approve project research, publication and cross-org review | Can self-certify scientific findings |
| Org admin | Institution Home / Settings | Members, grants, quotas, org policies | Can access every project secret without grants |
| Data steward | Catalogue / Rights | Product licenses, source rights and access | Can republish restricted source data |
| Agent operator | Agent Provider Studio | A2A endpoints, capabilities, identity bindings | Owns other agents or institution credentials |
| Independent reviewer | Review Centre | Reproduction, signed challenges and review | Hash match proves scientific truth |
| Auditor | Governance / Verify | Read allowed audit/chain/provenance | Public chain grants access to protected evidence |
| Platform operator | System operations | Queues, health, retention preview, incident response | Uses privileged platform token as research subject |

### 3.1 Navigation tree

```text
ORCA
├── Switcher: Marine Companion | Institution | Network | Verification
├── INSTITUTION (active org required)
│   ├── Overview
│   ├── Research
│   │   ├── Projects, Investigations, Study/Plan, Runs, Maps, Charts
│   │   ├── Evidence, Claims, Reports, Exports
│   │   └── Reproductions, Challenges, Historical Lab, Benchmarks
│   ├── Data & Methods
│   │   ├── Data Providers, Products, Versions, Snapshots, Compatibility
│   │   └── Method Registry, Recipe Templates, Source Probes
│   ├── Agents
│   │   ├── Directory, Register (stepper), Agent Detail, Health, Task Inbox
│   │   └── Institution Credentials, ENS Namespace, ENS Permissions, Wallet Bindings
│   ├── Administration
│   │   ├── Members, Access Grants, Project Sharing, Usage & Quotas
│   │   └── Policies, Audit, File Archive
├── FEDERATED NETWORK (P09–P11)
│   ├── Discover Agents, Open Tasks, Publish Task
│   ├── Claims / Assignments / Sessions, Results, Reviews
│   └── Arkiv Explorer, Cross-org Timeline, Independent Verifier
├── MARINE COMPANION (P12)
│   ├── Chats, Map, Fisheries, Warnings, Routes, Alerts
│   └── Voice / Language, Memory / Privacy
├── MODEL & MONITORING LAB (P12)
│   ├── Registry, Evaluation, Training, Diagnostics, Monitors
└── PLATFORM OPERATIONS (authorized only)
    ├── Readiness, Sources, Jobs, Retention Preview, Arkiv Indexer
```

### 3.2 Organization, project and investigation context

- The **header** contains a genuine organization switcher (`GET /v1/organizations`) and an optional project switcher (`GET /v1/research/projects?org_id=...`). An investigation route derives project/org from the authorized response, not from localStorage guesses.
- Each data request uses the correct path/query scope. A forged `X-Organization-ID` is never an authority.
- Context switch must clear query caches, SSE, layer signed links, unsubmitted mutation drafts, and protected project data before loading another organization.
- Breadcrumb: `Organization / Project / Investigation / Result or Task`, with stable URLs and back navigation.
- Default side navigation is role-filtered and capability-filtered; the app may explain *why a capability is unavailable* without presenting a fake functioning feature.

## 4. Layout anatomy, navigation and page templates

**A. Institution home:** thin global header; left navigation; single-column main content with a compact summary row, review queue, project table, recent activity. No pointless 6-stat-card collage.
**B. Scientific workstation:** project/plan list at left, large center map/chart/workflow view, right evidence/fitness inspector; bottom event history drawer. User can switch map ↔ chart ↔ table; data exists only when supported evidence artifact available.
**C. Dense network operator:** filter bar, full-width table, selected task detail drawer, independent chain status; separate identity, network and scientific states.
**D. Onboarding:** focused 8-step wizard on a 760px column, persistent progress navigation, prerequisites and connection diagnostics, no provider key displayed in cleartext.
**E. Review:** side-by-side original vs reproducer plus detailed variable/baseline/time differences, claims/lineage below; submit review only with access.
**F. Mobile:** collapse sidebar into labelled navigation, replace three-pane science view with tabs, simplify dense tasks into structured rows while keeping accessibility.

### 4.1 Shared page structure and mandatory states

Every screen must declare: `loading`, `true empty`, `filtered empty`, `partial`, `permission denied`, `network unavailable`, `stale data`, `retryable failure`, and `feature not released` when relevant. The frontend must not transform `null` or unknown scientific uncertainty into `0`, and must not silently substitute test fixtures for failed production data.

## 5. Complete screen registry and screen-by-screen specifications

**Total designed screens/route-level workspaces:** 87. Includes full pages and purpose-built multi-step onboarding screens. All are frontend proposals, not API endpoints. Dashboard pages may share templates to avoid unnecessarily duplicating components.

| ID | UI screen | Frontend route | Highest API gate referenced | Primary user |
|---|---|---|---|---|
| **F01** | [Entry & release-capabilities](#screen-f01) | `/` | P02 | All authenticated users |
| **F02** | [OIDC return & session guard](#screen-f02) | `/auth/callback` | P02 | All signed-in |
| **F03** | [Workspace selector / organization directory](#screen-f03) | `/workspaces` | P02 | Institution members |
| **F04** | [Invitation acceptance](#screen-f04) | `/invites/[token]` | P02 | Invited members |
| **F05** | [Profile, preferences & release status](#screen-f05) | `/account` | P12 | Any authenticated user |
| **I01** | [Institution command centre](#screen-i01) | `/org/[orgId]/overview` | P08 | PI |
| **I02** | [Research projects index](#screen-i02) | `/org/[orgId]/projects` | P02 | Researcher |
| **I03** | [Create / edit project](#screen-i03) | `/org/[orgId]/projects/new` | P02 | Researcher |
| **I04** | [Project overview & activity](#screen-i04) | `/org/[orgId]/projects/[projectId]` | P05 | Project member |
| **I05** | [Project members & sharing](#screen-i05) | `/org/[orgId]/projects/[projectId]/members` | P02 | PI |
| **I06** | [Project files & immutable scientific inputs](#screen-i06) | `/org/[orgId]/projects/[projectId]/files` | P02 | Project member with file grants |
| **I07** | [Organization details & policies](#screen-i07) | `/org/[orgId]/settings/profile` | P02 | Org admin |
| **I08** | [Members & invitations](#screen-i08) | `/org/[orgId]/settings/members` | P02 | Org owner/admin |
| **I09** | [External access grants](#screen-i09) | `/org/[orgId]/settings/access` | P02 | Org admin/data steward |
| **I10** | [Usage, quota and budgets](#screen-i10) | `/org/[orgId]/settings/usage` | P08 | Org admin |
| **I11** | [Audit & access decisions](#screen-i11) | `/org/[orgId]/settings/audit` | P08 | Auditor |
| **D01** | [Provider catalogue](#screen-d01) | `/org/[orgId]/data/providers` | P03 | Data steward |
| **D02** | [Marine product catalogue](#screen-d02) | `/org/[orgId]/data/products` | P03 | Researcher |
| **D03** | [Product detail & scientific suitability](#screen-d03) | `/org/[orgId]/data/products/[productId]` | P03 | Researcher |
| **D04** | [Product versions & distribution](#screen-d04) | `/org/[orgId]/data/products/[productId]/versions/[versionId]` | P03 | Researcher |
| **D05** | [Source snapshots & manifest explorer](#screen-d05) | `/org/[orgId]/data/snapshots` | P03 | Researcher/data steward |
| **D06** | [Dataset compatibility workbench](#screen-d06) | `/org/[orgId]/data/compatibility` | P03 | Researcher |
| **D07** | [Source probe console](#screen-d07) | `/org/[orgId]/data/probes` | P03 | Data steward/platform operator |
| **D08** | [Scientific method registry](#screen-d08) | `/org/[orgId]/science/methods` | P04 | Researcher |
| **D09** | [Recipe templates & validation](#screen-d09) | `/org/[orgId]/science/recipes` | P04 | Researcher |
| **R01** | [Investigation library](#screen-r01) | `/org/[orgId]/research/investigations` | P05 | Researcher |
| **R02** | [New scientific investigation](#screen-r02) | `/org/[orgId]/research/investigations/new` | P05 | Researcher |
| **R03** | [Investigation overview / Research Studio](#screen-r03) | `/org/[orgId]/research/investigations/[investigationId]` | P06 | Project researcher |
| **R04** | [Plan & recipe approvals](#screen-r04) | `/org/[orgId]/research/investigations/[investigationId]/plan` | P05 | Researcher with research:run |
| **R05** | [Durable run / job operations](#screen-r05) | `/org/[orgId]/research/investigations/[investigationId]/runs` | P05 | Researcher with run access |
| **R06** | [Live task graph / event timeline](#screen-r06) | `/org/[orgId]/research/investigations/[investigationId]/activity` | P05 | Investigation member |
| **R07** | [Scientific geospatial visualization](#screen-r07) | `/org/[orgId]/research/investigations/[investigationId]/map` | P06 | Researcher |
| **R08** | [Charts & statistical diagnostics](#screen-r08) | `/org/[orgId]/research/investigations/[investigationId]/charts` | P06 | Researcher |
| **R09** | [Evidence & scientific claims](#screen-r09) | `/org/[orgId]/research/investigations/[investigationId]/evidence` | P06 | Researcher |
| **R10** | [Artifact inspector & provenance](#screen-r10) | `/org/[orgId]/research/artifacts/[artifactId]` | P06 | Project member with evidence:read |
| **R11** | [Research reports & publication](#screen-r11) | `/org/[orgId]/research/investigations/[investigationId]/reports` | P06 | PI |
| **R12** | [Reproducible export center](#screen-r12) | `/org/[orgId]/research/investigations/[investigationId]/exports` | P06 | Researcher |
| **V01** | [Scientific review inbox](#screen-v01) | `/org/[orgId]/review/inbox` | P07 | Reviewer |
| **V02** | [Reproduction workspace](#screen-v02) | `/org/[orgId]/review/artifacts/[artifactId]/reproduce` | P07 | Independent reviewer |
| **V03** | [Review submission & history](#screen-v03) | `/org/[orgId]/review/artifacts/[artifactId]/reviews` | P07 | Reviewer with grant |
| **V04** | [Scientific challenges / discrepancy comparison](#screen-v04) | `/org/[orgId]/review/artifacts/[artifactId]/challenges` | P07 | Reviewer |
| **V05** | [Historical evaluation lab](#screen-v05) | `/org/[orgId]/research/investigations/[investigationId]/historical` | P07 | Researcher/PI |
| **V06** | [Scientific benchmark library](#screen-v06) | `/org/[orgId]/research/benchmarks` | P07 | Researcher |
| **A01** | [Agent directory](#screen-a01) | `/org/[orgId]/agents` | P09 | Agent operator |
| **A02** | [Agent registration: choose provider model](#screen-a02) | `/org/[orgId]/agents/new/mode` | P09 | Org admin/agent operator |
| **A03** | [Agent registration: identity and visibility](#screen-a03) | `/org/[orgId]/agents/new/identity` | P09 | Agent operator |
| **A04** | [Agent registration: capabilities & coverage](#screen-a04) | `/org/[orgId]/agents/new/capabilities` | P09 | Agent operator |
| **A05** | [Agent registration: endpoint & auth](#screen-a05) | `/org/[orgId]/agents/new/endpoint` | P09 | Agent operator |
| **A06** | [Agent registration: identity & federation checklist](#screen-a06) | `/org/[orgId]/agents/new/verification` | P10 | Agent operator |
| **A07** | [Agent detail & scientific capability](#screen-a07) | `/org/[orgId]/agents/[agentId]` | P09 | Agent operator/researcher |
| **A08** | [Agent health & operations](#screen-a08) | `/org/[orgId]/agents/[agentId]/health` | P09 | Agent operator |
| **A09** | [Provider task inbox & sessions](#screen-a09) | `/org/[orgId]/agents/[agentId]/tasks` | P11 | Agent operator |
| **E01** | [Institutional identity / credential register](#screen-e01) | `/org/[orgId]/identity/credentials` | P10 | Admin |
| **E02** | [ENS namespace overview](#screen-e02) | `/org/[orgId]/identity/ens` | P10 | Org admin/agent operator |
| **E03** | [ENS record and A2A endpoint management](#screen-e03) | `/org/[orgId]/identity/ens/[encodedName]` | P10 | Operator with delegated rights |
| **E04** | [ENS scoped delegation and revocation](#screen-e04) | `/org/[orgId]/identity/ens/[encodedName]/permissions` | P10 | Org owner/authorized identity admin |
| **E05** | [ENS-to-Arkiv agent wallet binding](#screen-e05) | `/org/[orgId]/identity/bindings` | P10 | Identity manager |
| **N01** | [External agent discovery](#screen-n01) | `/network/agents` | P09 | Researcher |
| **N02** | [Public task marketplace / Arkiv board](#screen-n02) | `/network/tasks` | P11 | Researcher |
| **N03** | [Publish public research task](#screen-n03) | `/network/tasks/new` | P11 | PI/research coordinator |
| **N04** | [Task detail, claims and assignment](#screen-n04) | `/network/tasks/[taskId]` | P11 | Task requester |
| **N05** | [Distributed execution and A2A session monitor](#screen-n05) | `/network/tasks/[taskId]/sessions` | P11 | Requester/provider with read grant |
| **N06** | [Signed result & public evidence references](#screen-n06) | `/network/results` | P11 | Provider |
| **N07** | [Independent public reviews / scientific challenges](#screen-n07) | `/network/reviews` | P11 | External validator |
| **N08** | [Arkiv entity & transaction explorer](#screen-n08) | `/network/arkiv` | P11 | Auditor |
| **N09** | [Federated investigation event timeline](#screen-n09) | `/network/investigations/[publicTaskId]` | P11 | Authorized network reader |
| **N10** | [Independent verifier (public-only mode)](#screen-n10) | `/verify/[publicRef]` | P11 | External auditor/public viewer |
| **M01** | [Marine companion landing](#screen-m01) | `/marine` | P12 | Fisherman |
| **M02** | [Conversations library](#screen-m02) | `/marine/conversations` | P12 | User |
| **M03** | [Conversation + response evidence](#screen-m03) | `/marine/conversations/[conversationId]` | P12 | User |
| **M04** | [Marine map & environmental conditions](#screen-m04) | `/marine/map` | P12 | User |
| **M05** | [Potential fishing zone & restrictions](#screen-m05) | `/marine/fisheries` | P12 | Fisherman |
| **M06** | [Official hazard and warning centre](#screen-m06) | `/marine/warnings` | P12 | All relevant users |
| **M07** | [Route exposure scenarios](#screen-m07) | `/marine/routes` | P12 | Maritime operator |
| **M08** | [Alert subscriptions and notification inbox](#screen-m08) | `/marine/alerts` | P12 | User |
| **M09** | [Voice, language & accessibility](#screen-m09) | `/marine/accessibility` | P12 | User |
| **M10** | [User memory & privacy controls](#screen-m10) | `/marine/privacy` | P12 | User |
| **L01** | [Model registry](#screen-l01) | `/org/[orgId]/models` | P12 | Authorized model operator |
| **L02** | [Model evaluation suite](#screen-l02) | `/org/[orgId]/models/evaluations` | P12 | Model operator |
| **L03** | [Training jobs](#screen-l03) | `/org/[orgId]/models/training` | P12 | Model operator |
| **L04** | [Scientific diagnostics and variable explorer](#screen-l04) | `/org/[orgId]/science/diagnostics` | P12 | Researcher |
| **L05** | [Research monitoring jobs](#screen-l05) | `/org/[orgId]/research/monitors` | P12 | Researcher/PI |
| **O01** | [System capability and readiness](#screen-o01) | `/admin/system` | P08 | Platform operator |
| **O02** | [Source and connector operations](#screen-o02) | `/admin/sources` | P08 | Platform operator/data steward |
| **O03** | [Durable queue and job health](#screen-o03) | `/admin/jobs` | P08 | Platform operator |
| **O04** | [Retention, archive & impact preview](#screen-o04) | `/admin/retention` | P08 | Platform operator |
| **O05** | [Arkiv indexer operations](#screen-o05) | `/admin/arkiv` | P11 | Platform operator |


### 5.1 Foundation & entry

<a id="screen-f01"></a>
#### F01 — Entry & release-capabilities

**UI URL:** `/`  \
**Personas:** All authenticated users.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Determine accessible ORCA workspaces without promising undeployed features.

**Visual layout:** Full-white welcome surface; organization switcher; existing Marine Companion shortcut; accessible workspace cards; explicitly marked planned/available capabilities.

**User interactions:** Choose organization; open permitted mode; inspect capability explanations.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/meta` — **P01**, `public`; request `—` → `APIMetadata{revision,release_profile,enabled_capabilities}` (200).
- `GET /v1/me` — **P02**, `authenticated`; request `—` → `CurrentPrincipal{user_id,orgs,roles,capabilities}` (200).
- `GET /v1/organizations` — **P02**, `org:read`; request `query cursor?,limit?` → `Page<OrganizationSummary>` (200).

**Loading, empty, invalid and recovery states:** OIDC signed-out, no organization, access denied, P03/P09/P12 not live, loading and full outage.

**Required screen acceptance test:** Only user-entitled workspaces are actionable; beta/planned feature never starts a dead route.

**Contract/implementation caution:** Login happens at external OIDC provider; no invented /v1/login.

**Frontend tests (implement, do not assume passed):** `F01-01` renders loading/true-empty correctly; `F01-02` denies restricted controls and direct-route access; `F01-03` binds valid server data without invented defaults; `F01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-f02"></a>
#### F02 — OIDC return & session guard

**UI URL:** `/auth/callback`  \
**Personas:** All signed-in.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Return from external identity provider; safely establish frontend session and refresh policy.

**Visual layout:** Minimal full-width confirmation; no application chrome before validated identity; recoverable authentication error message.

**User interactions:** Sign in; retry identity provider; return to start.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/me` — **P02**, `authenticated`; request `—` → `CurrentPrincipal{user_id,orgs,roles,capabilities}` (200).

**Loading, empty, invalid and recovery states:** Invalid audience/expired session/unknown org; network timeout; logout on revocation.

**Required screen acceptance test:** Never persist bearer tokens in localStorage, derive roles from verified /me response.

**Contract/implementation caution:** No ORCA password or token-mint endpoint.

**Frontend tests (implement, do not assume passed):** `F02-01` renders loading/true-empty correctly; `F02-02` denies restricted controls and direct-route access; `F02-03` binds valid server data without invented defaults; `F02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-f03"></a>
#### F03 — Workspace selector / organization directory

**UI URL:** `/workspaces`  \
**Personas:** Institution members.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Select the active organization and find authorized research workspaces.

**Visual layout:** Neutral list/table with institution identity, affiliation status, membership role and available modules.

**User interactions:** Switch organization; request creation if policy allows; open org overview.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/me` — **P02**, `authenticated`; request `—` → `CurrentPrincipal{user_id,orgs,roles,capabilities}` (200).
- `GET /v1/organizations` — **P02**, `org:read`; request `query cursor?,limit?` → `Page<OrganizationSummary>` (200).
- `POST /v1/organizations` — **P02**, `platform/invite-policy`; request `body CreateOrganization{name,slug,visibility}` → `Organization` (201).

**Loading, empty, invalid and recovery states:** No memberships; pending affiliation; private org hidden; create forbidden.

**Required screen acceptance test:** Switching org clears scoped queries, map tiles, cached evidence and pending requests.

**Frontend tests (implement, do not assume passed):** `F03-01` renders loading/true-empty correctly; `F03-02` denies restricted controls and direct-route access; `F03-03` binds valid server data without invented defaults; `F03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-f04"></a>
#### F04 — Invitation acceptance

**UI URL:** `/invites/[token]`  \
**Personas:** Invited members.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Accept a one-time invitation after authentication, showing recipient/org/role safely.

**Visual layout:** Single centered acceptance panel with organization and role and privacy explanation.

**User interactions:** Accept; decline locally; login first.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/me` — **P02**, `authenticated`; request `—` → `CurrentPrincipal{user_id,orgs,roles,capabilities}` (200).
- `POST /v1/invitations/{token}/accept` — **P02**, `authenticated`; request `path token; body {accept:true}` → `Membership` (200).

**Loading, empty, invalid and recovery states:** Expired, already used, mismatch authenticated user, revoked invitation.

**Required screen acceptance test:** Token never sent to analytics, referrer or network logs.

**Frontend tests (implement, do not assume passed):** `F04-01` renders loading/true-empty correctly; `F04-02` denies restricted controls and direct-route access; `F04-03` binds valid server data without invented defaults; `F04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-f05"></a>
#### F05 — Profile, preferences & release status

**UI URL:** `/account`  \
**Personas:** Any authenticated user.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show account context and explicitly implemented feature availability.

**Visual layout:** Profile summary; organization memberships; capability status list; preferences section for expanded release.

**User interactions:** Change language preferences when P12 live; switch org; inspect implemented module status.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/meta` — **P01**, `public`; request `—` → `APIMetadata{revision,release_profile,enabled_capabilities}` (200).
- `GET /v1/me` — **P02**, `authenticated`; request `—` → `CurrentPrincipal{user_id,orgs,roles,capabilities}` (200).
- `GET /v1/me/preferences` — **P12**, `user:read`; request `—` → `UserPreferences` (200).
- `PATCH /v1/me/preferences` — **P12**, `user:write`; request `If-Match; PatchPreferences` → `UserPreferences` (200).

**Loading, empty, invalid and recovery states:** Unknown preference, missing P12, stale capability metadata.

**Required screen acceptance test:** Do not render planned preferences as saved when API is unavailable.

**Frontend tests (implement, do not assume passed):** `F05-01` renders loading/true-empty correctly; `F05-02` denies restricted controls and direct-route access; `F05-03` binds valid server data without invented defaults; `F05-04` handles stated conflict/outage/expiry and accessible retry.

### 5.2 Institution & projects

<a id="screen-i01"></a>
#### I01 — Institution command centre

**UI URL:** `/org/[orgId]/overview`  \
**Personas:** PI, admin, researcher.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Provide actionable overview of research, reviews, agent network and source quality.

**Visual layout:** Page title plus org trust label; research KPIs (only from authorized countable data); project table; blocked-work panel; recent investigations; optional agent tasks section.

**User interactions:** New investigation; open research project; review evidence; inspect data access.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/meta` — **P01**, `public`; request `—` → `APIMetadata{revision,release_profile,enabled_capabilities}` (200).
- `GET /v1/organizations/{org_id}` — **P02**, `org:read`; request `path org_id` → `Organization` (200).
- `GET /v1/research/projects` — **P02**, `project:read`; request `org_id; cursor?,limit?,state?` → `Page<ResearchProject>` (200).
- `GET /v1/research/investigations` — **P05**, `project:read`; request `project_id, state?,cursor?,limit?` → `Page<InvestigationSummary>` (200).
- `GET /v1/organizations/{org_id}/usage` — **P08**, `org:read`; request `window,group_by?` → `UsageSummary` (200).

**Loading, empty, invalid and recovery states:** No projects, metadata-only core, planned federation, partial data unavailable.

**Required screen acceptance test:** No fabricated global totals from one page; partial counts labelled as page-limited or unavailable.

**Frontend tests (implement, do not assume passed):** `I01-01` renders loading/true-empty correctly; `I01-02` denies restricted controls and direct-route access; `I01-03` binds valid server data without invented defaults; `I01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i02"></a>
#### I02 — Research projects index

**UI URL:** `/org/[orgId]/projects`  \
**Personas:** Researcher, PI, project viewer.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Find authorized active/archived projects and create new research projects.

**Visual layout:** Search/filter bar with supported filters; stable table: project, role, last change, status, methods/data flags.

**User interactions:** Create project; view project; filter active/archived.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/projects` — **P02**, `project:read`; request `org_id; cursor?,limit?,state?` → `Page<ResearchProject>` (200).
- `POST /v1/research/projects` — **P02**, `project:write`; request `CreateProject{organization_id,name,description?,visibility,default_data_policy}` → `ResearchProject` (201).

**Loading, empty, invalid and recovery states:** Empty state; forbidden create; stale cursor; permission removed between pages.

**Required screen acceptance test:** No invented full-text search until API has corresponding filter.

**Frontend tests (implement, do not assume passed):** `I02-01` renders loading/true-empty correctly; `I02-02` denies restricted controls and direct-route access; `I02-03` binds valid server data without invented defaults; `I02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i03"></a>
#### I03 — Create / edit project

**UI URL:** `/org/[orgId]/projects/new`  \
**Personas:** Researcher, PI.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Configure project name, visibility, source usage policy and explicit organization.

**Visual layout:** Multi-section form with visibility and sharing warning; right-side summary; no unrelated analytics.

**User interactions:** Create; validate; save draft (client-only until POST).

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}/policies` — **P02**, `org:read`; request `—` → `OrgPolicy{version,retention,quotas}` (200).
- `POST /v1/research/projects` — **P02**, `project:write`; request `CreateProject{organization_id,name,description?,visibility,default_data_policy}` → `ResearchProject` (201).

**Loading, empty, invalid and recovery states:** 422 field validation, 409 idempotency conflict, 403 cannot create.

**Required screen acceptance test:** Generate Idempotency-Key once per user submission; do not silently open to other institutions.

**Frontend tests (implement, do not assume passed):** `I03-01` renders loading/true-empty correctly; `I03-02` denies restricted controls and direct-route access; `I03-03` binds valid server data without invented defaults; `I03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i04"></a>
#### I04 — Project overview & activity

**UI URL:** `/org/[orgId]/projects/[projectId]`  \
**Personas:** Project member.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Use project as durable home for investigations, collaborators, files and methods.

**Visual layout:** Project header; tabs Overview / Investigations / Files / Members; recent evidence list; method decisions.

**User interactions:** Rename project; archive project; open first investigation.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/projects/{project_id}` — **P02**, `project:read`; request `path project_id` → `ResearchProject` (200).
- `PATCH /v1/research/projects/{project_id}` — **P02**, `project:write`; request `If-Match; PatchProject` → `ResearchProject` (200).
- `POST /v1/research/projects/{project_id}/archive` — **P02**, `project:write`; request `If-Match; {reason}` → `ResearchProject` (200).
- `GET /v1/research/investigations` — **P05**, `project:read`; request `project_id, state?,cursor?,limit?` → `Page<InvestigationSummary>` (200).

**Loading, empty, invalid and recovery states:** No investigations; stale ETag; archived read-only; project revoked.

**Required screen acceptance test:** Keep project context in breadcrumbs and route, never only in client memory.

**Frontend tests (implement, do not assume passed):** `I04-01` renders loading/true-empty correctly; `I04-02` denies restricted controls and direct-route access; `I04-03` binds valid server data without invented defaults; `I04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i05"></a>
#### I05 — Project members & sharing

**UI URL:** `/org/[orgId]/projects/[projectId]/members`  \
**Personas:** PI, project owner, project member viewer.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Manage project-specific researcher roles and explicit cross-organization grants.

**Visual layout:** Dense table: principal, membership, role, effective rights, grant scope; edit drawer.

**User interactions:** Add member; change role; revoke; inspect effective access.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/projects/{project_id}/members` — **P02**, `project:read`; request `cursor?,limit?` → `Page<ProjectMember>` (200).
- `POST /v1/research/projects/{project_id}/members` — **P02**, `project:share`; request `AddProjectMember{principal_id,role}` → `ProjectMember` (201).
- `PATCH /v1/research/projects/{project_id}/members/{member_id}` — **P02**, `project:share`; request `If-Match; {role,status}` → `ProjectMember` (200).
- `DELETE /v1/research/projects/{project_id}/members/{member_id}` — **P02**, `project:share`; request `If-Match` → `—` (204).

**Loading, empty, invalid and recovery states:** Pending invite, last-owner safety, cross-org denial, stale ETag.

**Required screen acceptance test:** Permission is project-scoped; no silent sharing of protected source bytes.

**Frontend tests (implement, do not assume passed):** `I05-01` renders loading/true-empty correctly; `I05-02` denies restricted controls and direct-route access; `I05-03` binds valid server data without invented defaults; `I05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i06"></a>
#### I06 — Project files & immutable scientific inputs

**UI URL:** `/org/[orgId]/projects/[projectId]/files`  \
**Personas:** Project member with file grants.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Display scientific assets and provenance; keep upload/publish states explicit.

**Visual layout:** File list grouped by version, classification, status, MIME, digest; side inspector for integrity and rights.

**User interactions:** Upload intent; complete; abort; inspect and download granted file.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/projects/{project_id}/uploads` — **P02**, `project:write`; request `UploadIntent{filename,media_type,size_bytes,sha256,classification}` → `UploadSession{upload_id,parts,expires_at}` (201).
- `POST /v1/research/uploads/{upload_id}/complete` — **P02**, `project:write`; request `CompleteUpload{part_etags,sha256}` → `ArtifactUpload{status:"pending_validation"}` (202).
- `GET /v1/research/uploads/{upload_id}` — **P02**, `project:read`; request `path upload_id` → `UploadSessionStatus` (200).
- `DELETE /v1/research/uploads/{upload_id}` — **P02**, `project:write`; request `path upload_id` → `—` (204).
- `GET /v1/research/projects/{project_id}/files` — **P02**, `project:read`; request `query cursor?,classification?,media_type?` → `Page<ProjectFile>` (200).
- `GET /v1/research/files/{file_id}` — **P02**, `project:read`; request `path file_id` → `ProjectFile` (200).
- `POST /v1/research/files/{file_id}/download-intents` — **P02**, `project:read`; request `DownloadIntent{purpose}` → `EphemeralDownload{url,expires_at,sha256}` (200).

**Loading, empty, invalid and recovery states:** Incomplete multipart, checksum mismatch, quarantine, signed URL expired, download forbidden.

**Required screen acceptance test:** Upload binary via sanctioned storage session; never inline raw blobs in JSON.

**Frontend tests (implement, do not assume passed):** `I06-01` renders loading/true-empty correctly; `I06-02` denies restricted controls and direct-route access; `I06-03` binds valid server data without invented defaults; `I06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i07"></a>
#### I07 — Organization details & policies

**UI URL:** `/org/[orgId]/settings/profile`  \
**Personas:** Org admin.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Configure public organization display separately from verified institutional credentials.

**Visual layout:** Profile form; trust/credential summary; organization policies and privacy.

**User interactions:** Edit display; change retention/visibility policy where permitted.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}` — **P02**, `org:read`; request `path org_id` → `Organization` (200).
- `PATCH /v1/organizations/{org_id}` — **P02**, `org:write`; request `If-Match; PatchOrganization{display_name?,settings?}` → `Organization` (200).
- `GET /v1/organizations/{org_id}/policies` — **P02**, `org:read`; request `—` → `OrgPolicy{version,retention,quotas}` (200).
- `PATCH /v1/organizations/{org_id}/policies` — **P02**, `org:write`; request `If-Match; PatchOrgPolicy` → `OrgPolicy` (200).

**Loading, empty, invalid and recovery states:** Stale ETag, restricted policy, verified label cannot be self-asserted.

**Required screen acceptance test:** Do not show an ENS name as proof of government/research accreditation.

**Frontend tests (implement, do not assume passed):** `I07-01` renders loading/true-empty correctly; `I07-02` denies restricted controls and direct-route access; `I07-03` binds valid server data without invented defaults; `I07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i08"></a>
#### I08 — Members & invitations

**UI URL:** `/org/[orgId]/settings/members`  \
**Personas:** Org owner/admin.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Manage institution people and role assignments.

**Visual layout:** Table of members; pending invites; role compare; last-owner notice.

**User interactions:** Invite; edit role; remove member.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}/members` — **P02**, `org:members`; request `cursor?,limit?,role?` → `Page<Member>` (200).
- `POST /v1/organizations/{org_id}/invitations` — **P02**, `org:members`; request `CreateInvitation{email,role,expires_at}` → `Invitation` (201).
- `PATCH /v1/organizations/{org_id}/members/{member_id}` — **P02**, `org:members`; request `If-Match; PatchMember{role,status}` → `Member` (200).
- `DELETE /v1/organizations/{org_id}/members/{member_id}` — **P02**, `org:members`; request `If-Match` → `—` (204).

**Loading, empty, invalid and recovery states:** Invited email hidden from outsiders; last owner protection; expired/used invites.

**Required screen acceptance test:** Server determines permissions; never trust UI role dropdown values alone.

**Frontend tests (implement, do not assume passed):** `I08-01` renders loading/true-empty correctly; `I08-02` denies restricted controls and direct-route access; `I08-03` binds valid server data without invented defaults; `I08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i09"></a>
#### I09 — External access grants

**UI URL:** `/org/[orgId]/settings/access`  \
**Personas:** Org admin/data steward.  **Highest referenced API gate:** P02 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Grant bounded access to a resource and revoke it with a traceable decision.

**Visual layout:** Grant table with principal/resource/scope/expiry, create wizard, preview access.

**User interactions:** Create resource grant; revoke; inspect scope.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}/access-grants` — **P02**, `org:members`; request `query resource?,principal?,cursor?` → `Page<AccessGrant>` (200).
- `POST /v1/organizations/{org_id}/access-grants` — **P02**, `org:members`; request `GrantAccess{resource_ref,principal_ref,scopes,expires_at}` → `AccessGrant` (201).
- `DELETE /v1/organizations/{org_id}/access-grants/{grant_id}` — **P02**, `org:members`; request `If-Match` → `—` (204).

**Loading, empty, invalid and recovery states:** Cross-tenant requester forbidden, source-rights conflict, expiration.

**Required screen acceptance test:** Always show exact resource and time scope before grant.

**Frontend tests (implement, do not assume passed):** `I09-01` renders loading/true-empty correctly; `I09-02` denies restricted controls and direct-route access; `I09-03` binds valid server data without invented defaults; `I09-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i10"></a>
#### I10 — Usage, quota and budgets

**UI URL:** `/org/[orgId]/settings/usage`  \
**Personas:** Org admin, authorized viewer.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Help institutions control compute/storage/model costs without fictional estimates.

**Visual layout:** Summary only where measured; time-range table by product, queue, compute, model and storage; quota controls separated.

**User interactions:** Inspect usage; adjust permitted quotas.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}/usage` — **P08**, `org:read`; request `window,group_by?` → `UsageSummary` (200).
- `GET /v1/organizations/{org_id}/quotas` — **P08**, `org:read`; request `—` → `QuotaSet` (200).
- `PATCH /v1/organizations/{org_id}/quotas` — **P08**, `org:write`; request `If-Match; PatchQuotaSet` → `QuotaSet` (200).

**Loading, empty, invalid and recovery states:** No charge data; source cost unknown; quota 429; budget limit cannot exceed platform bounds.

**Required screen acceptance test:** Amounts formatted from decimal strings, never derive total from page size.

**Frontend tests (implement, do not assume passed):** `I10-01` renders loading/true-empty correctly; `I10-02` denies restricted controls and direct-route access; `I10-03` binds valid server data without invented defaults; `I10-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-i11"></a>
#### I11 — Audit & access decisions

**UI URL:** `/org/[orgId]/settings/audit`  \
**Personas:** Auditor, org admin.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Explain who changed methods, data rights, grants and reports while redacting secrets.

**Visual layout:** Filterable event timeline; resource changes; separate project access decision tab.

**User interactions:** Filter activity; drill event; inspect access decision.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}/audit-events` — **P08**, `audit:read`; request `start?,end?,actor?,event_type?,cursor?` → `Page<AuditEvent>` (200).
- `GET /v1/research/projects/{project_id}/access-decisions` — **P08**, `audit:read`; request `cursor?,since?` → `Page<AccessDecisionRecord>` (200).

**Loading, empty, invalid and recovery states:** Redacted events, legal hold, missing scopes, stale cursor.

**Required screen acceptance test:** Audit is not hidden model reasoning or raw private prompts.

**Frontend tests (implement, do not assume passed):** `I11-01` renders loading/true-empty correctly; `I11-02` denies restricted controls and direct-route access; `I11-03` binds valid server data without invented defaults; `I11-04` handles stated conflict/outage/expiry and accessible retry.

### 5.3 Data & methods

<a id="screen-d01"></a>
#### D01 — Provider catalogue

**UI URL:** `/org/[orgId]/data/providers`  \
**Personas:** Data steward, researcher.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Browse authoritative marine data providers and their product coverage.

**Visual layout:** White table with provider, source type, availability status, usage rights; source detail drawer.

**User interactions:** Open provider; inspect products.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/providers` — **P03**, `dataset:read`; request `cursor?,q?,source_class?` → `Page<SourceProvider>` (200).
- `GET /v1/catalog/providers/{provider_id}` — **P03**, `dataset:read`; request `path provider_id` → `SourceProvider` (200).

**Loading, empty, invalid and recovery states:** No providers yet, partial source health, restricted metadata.

**Required screen acceptance test:** Provider health is availability, not accuracy guarantee.

**Frontend tests (implement, do not assume passed):** `D01-01` renders loading/true-empty correctly; `D01-02` denies restricted controls and direct-route access; `D01-03` binds valid server data without invented defaults; `D01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d02"></a>
#### D02 — Marine product catalogue

**UI URL:** `/org/[orgId]/data/products`  \
**Personas:** Researcher, data steward.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Search permitted scientific products by variable, product kind, area and valid time.

**Visual layout:** Data table + compact filters + simple neutral mini coverage indicators; no default rainbow choropleth.

**User interactions:** View product; compare selected; inspect licensing.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/products` — **P03**, `dataset:read`; request `provider_id?,variable?,kind?,bbox?,start?,end?,cursor?` → `Page<ScientificProduct>` (200).
- `GET /v1/catalog/variable-definitions` — **P03**, `dataset:read`; request `q?,standard_name?,cursor?` → `Page<VariableDefinition>` (200).

**Loading, empty, invalid and recovery states:** No products, missing variable, unknown access, filter produces empty set.

**Required screen acceptance test:** Use only backend-supported filters; never guess product IDs.

**Frontend tests (implement, do not assume passed):** `D02-01` renders loading/true-empty correctly; `D02-02` denies restricted controls and direct-route access; `D02-03` binds valid server data without invented defaults; `D02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d03"></a>
#### D03 — Product detail & scientific suitability

**UI URL:** `/org/[orgId]/data/products/[productId]`  \
**Personas:** Researcher, data steward.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Determine whether a dataset is scientifically suitable for the planned analysis.

**Visual layout:** Tabs Overview / Variables / Versions / Distributions / Spatial Coverage / License / Fit Test; inspector for source clock/QC.

**User interactions:** Run fitness-check; open version; compare compatibility.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/products/{product_id}` — **P03**, `dataset:read`; request `path product_id` → `ScientificProduct` (200).
- `GET /v1/catalog/products/{product_id}/versions` — **P03**, `dataset:read`; request `cursor?,limit?` → `Page<ProductVersion>` (200).
- `GET /v1/catalog/products/{product_id}/distributions` — **P03**, `dataset:read`; request `cursor?` → `Page<Distribution>` (200).
- `GET /v1/catalog/products/{product_id}/variables` — **P03**, `dataset:read`; request `cursor?,kind?` → `Page<CanonicalVariableMapping>` (200).
- `GET /v1/catalog/products/{product_id}/coverage` — **P03**, `dataset:read`; request `query version?,geometry_ref?,period?` → `ProductCoverage` (200).
- `GET /v1/catalog/products/{product_id}/licenses` — **P03**, `dataset:read`; request `path product_id` → `LicenseProfile` (200).
- `POST /v1/catalog/products/{product_id}/fitness-checks` — **P03**, `research:plan`; request `FitnessRequest{method_id,version_ref,geo_scope,time_window,depth?,as_of?}` → `FitnessReport` (200).

**Loading, empty, invalid and recovery states:** No baseline, incompatible temporal resolution, restricted distribution, missing QC.

**Required screen acceptance test:** Scientific fit-to-purpose verdict != API reachability.

**Frontend tests (implement, do not assume passed):** `D03-01` renders loading/true-empty correctly; `D03-02` denies restricted controls and direct-route access; `D03-03` binds valid server data without invented defaults; `D03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d04"></a>
#### D04 — Product versions & distribution

**UI URL:** `/org/[orgId]/data/products/[productId]/versions/[versionId]`  \
**Personas:** Researcher.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect pinned product version, source availability and selected distribution.

**Visual layout:** Version metadata, variable/dimension inspector, hash and time provenance, external documentation link.

**User interactions:** Pin version to investigation plan; view source rights.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/products/{product_id}/versions/{version_id}` — **P03**, `dataset:read`; request `path IDs` → `ProductVersion` (200).
- `GET /v1/catalog/products/{product_id}/distributions` — **P03**, `dataset:read`; request `cursor?` → `Page<Distribution>` (200).

**Loading, empty, invalid and recovery states:** Version retired; no downloadable rights; missing historical availability.

**Required screen acceptance test:** Never substitute another product version without explicit user approval.

**Frontend tests (implement, do not assume passed):** `D04-01` renders loading/true-empty correctly; `D04-02` denies restricted controls and direct-route access; `D04-03` binds valid server data without invented defaults; `D04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d05"></a>
#### D05 — Source snapshots & manifest explorer

**UI URL:** `/org/[orgId]/data/snapshots`  \
**Personas:** Researcher/data steward.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect immutable scientific input snapshots, timing and reproducibility manifests.

**Visual layout:** Snapshot table; selected manifest panel with observed, valid, issued, available and retrieved clocks.

**User interactions:** Request bounded snapshot; inspect manifest; poll ingestion.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/snapshots` — **P03**, `dataset:read`; request `project_id?,product_id?,digest?,cursor?` → `Page<DatasetSnapshot>` (200).
- `GET /v1/catalog/snapshots/{snapshot_id}` — **P03**, `dataset:read`; request `path snapshot_id` → `DatasetSnapshot` (200).
- `GET /v1/catalog/snapshots/{snapshot_id}/manifest` — **P03**, `dataset:read`; request `path snapshot_id` → `DatasetSnapshotManifest` (200).
- `POST /v1/catalog/snapshot-requests` — **P03**, `research:plan`; request `SnapshotRequest{product_version_id,geo_scope,time_window,variables,depth?,as_of?}` → `Operation{kind:"snapshot"}` (202).
- `GET /v1/catalog/snapshot-requests/{request_id}` — **P03**, `dataset:read`; request `path request_id` → `SnapshotRequestStatus` (200).

**Loading, empty, invalid and recovery states:** Live source unavailable, pending retrieval, metadata invalid, license restricts retention.

**Required screen acceptance test:** No hardcoded fake fallback when an ERDDAP probe fails.

**Frontend tests (implement, do not assume passed):** `D05-01` renders loading/true-empty correctly; `D05-02` denies restricted controls and direct-route access; `D05-03` binds valid server data without invented defaults; `D05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d06"></a>
#### D06 — Dataset compatibility workbench

**UI URL:** `/org/[orgId]/data/compatibility`  \
**Personas:** Researcher, scientist.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Compare two source products or a historical baseline for units, space, time, depth and license.

**Visual layout:** Side-by-side dataset cards; incompatibility issue list; explicit block/warn decision with source references.

**User interactions:** Run compatibility check; change baseline or region; record selected input version.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/catalog/products/{product_id}/fitness-checks` — **P03**, `research:plan`; request `FitnessRequest{method_id,version_ref,geo_scope,time_window,depth?,as_of?}` → `FitnessReport` (200).
- `POST /v1/catalog/compatibility-checks` — **P03**, `research:plan`; request `DataCompatibilityRequest{products,method_id,baseline_ref,geo_scope,time_window}` → `CompatibilityReport` (200).

**Loading, empty, invalid and recovery states:** Unknown source quality, wrong baseline period, incomplete spatial overlap.

**Required screen acceptance test:** A cautionary result blocks unapproved unsafe recipe execution.

**Frontend tests (implement, do not assume passed):** `D06-01` renders loading/true-empty correctly; `D06-02` denies restricted controls and direct-route access; `D06-03` binds valid server data without invented defaults; `D06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d07"></a>
#### D07 — Source probe console

**UI URL:** `/org/[orgId]/data/probes`  \
**Personas:** Data steward/platform operator.  **Highest referenced API gate:** P03 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect actual provider connector probe evidence without exposing credentials.

**Visual layout:** Provider list; probe status; sanitized metadata snippets; timeout/401/429 markers.

**User interactions:** Start authorized probe; inspect result; see exact source/version.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/catalog/source-probes` — **P03**, `source:manage`; request `ProbeRequest{provider_id,distribution_id,region,time_window,limits}` → `Operation{kind:"source_probe"}` (202).
- `GET /v1/catalog/source-probes/{probe_id}` — **P03**, `source:manage`; request `path probe_id` → `SourceProbeEvidence` (200).

**Loading, empty, invalid and recovery states:** Missing credentials, SSRF blocked, malformed response, excessive bytes.

**Required screen acceptance test:** Never leak raw provider tokens or internal URLs to browser.

**Frontend tests (implement, do not assume passed):** `D07-01` renders loading/true-empty correctly; `D07-02` denies restricted controls and direct-route access; `D07-03` binds valid server data without invented defaults; `D07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d08"></a>
#### D08 — Scientific method registry

**UI URL:** `/org/[orgId]/science/methods`  \
**Personas:** Researcher, PI.  **Highest referenced API gate:** P04 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Browse versioned, approved calculation methods and supported variables.

**Visual layout:** Method directory with method name, version, deterministic status, required inputs, provenance constraints.

**User interactions:** Inspect method; choose research recipe.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/science/methods` — **P04**, `dataset:read`; request `kind?,status?,cursor?` → `Page<ScientificMethod>` (200).
- `GET /v1/science/methods/{method_id}` — **P04**, `dataset:read`; request `path method_id` → `ScientificMethod` (200).
- `GET /v1/science/methods/{method_id}/versions/{version}` — **P04**, `dataset:read`; request `path ID,version` → `MethodVersion` (200).

**Loading, empty, invalid and recovery states:** Method unavailable, version changed, insufficient scientific permissions.

**Required screen acceptance test:** No arbitrary Python-code editor under a method-run API.

**Frontend tests (implement, do not assume passed):** `D08-01` renders loading/true-empty correctly; `D08-02` denies restricted controls and direct-route access; `D08-03` binds valid server data without invented defaults; `D08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-d09"></a>
#### D09 — Recipe templates & validation

**UI URL:** `/org/[orgId]/science/recipes`  \
**Personas:** Researcher, PI.  **Highest referenced API gate:** P04 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Start from supported SST recipe, show all assumptions before execution.

**Visual layout:** Template list; structured parameter editor; validation findings; quality codebook shortcut.

**User interactions:** Choose template; validate recipe; inspect quality policies.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/science/recipe-templates` — **P04**, `research:plan`; request `variable?,method_id?,cursor?` → `Page<RecipeTemplate>` (200).
- `GET /v1/science/recipe-templates/{template_id}` — **P04**, `research:plan`; request `path template_id` → `RecipeTemplate` (200).
- `POST /v1/science/recipe-validations` — **P04**, `research:plan`; request `RecipeValidationRequest{recipe,selected_sources}` → `RecipeValidationReport` (200).
- `GET /v1/science/policies` — **P04**, `research:plan`; request `method_id?,version?` → `ScientificPolicySummary` (200).
- `GET /v1/science/quality-codebook` — **P04**, `dataset:read`; request `source_id?,variable?` → `QualityCodebook` (200).

**Loading, empty, invalid and recovery states:** Invalid geometry/baseline/time or method version; unknown uncertainty.

**Required screen acceptance test:** Only P04-validated method can pass into P05 planned run.

**Frontend tests (implement, do not assume passed):** `D09-01` renders loading/true-empty correctly; `D09-02` denies restricted controls and direct-route access; `D09-03` binds valid server data without invented defaults; `D09-04` handles stated conflict/outage/expiry and accessible retry.

### 5.4 Research & execution

<a id="screen-r01"></a>
#### R01 — Investigation library

**UI URL:** `/org/[orgId]/research/investigations`  \
**Personas:** Researcher, PI, reviewer.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Find historical/current investigations, sort and resume authorized work.

**Visual layout:** Filter bar + investigation table with project, method, run state, evidence sufficiency and latest update.

**User interactions:** New investigation; resume; view insufficient findings.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/projects` — **P02**, `project:read`; request `org_id; cursor?,limit?,state?` → `Page<ResearchProject>` (200).
- `GET /v1/research/investigations` — **P05**, `project:read`; request `project_id, state?,cursor?,limit?` → `Page<InvestigationSummary>` (200).

**Loading, empty, invalid and recovery states:** Empty, archived, no source entitlement, cursor expired.

**Required screen acceptance test:** Statuses scientific supported vs run completed must be separate.

**Frontend tests (implement, do not assume passed):** `R01-01` renders loading/true-empty correctly; `R01-02` denies restricted controls and direct-route access; `R01-03` binds valid server data without invented defaults; `R01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r02"></a>
#### R02 — New scientific investigation

**UI URL:** `/org/[orgId]/research/investigations/new`  \
**Personas:** Researcher, PI.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Capture question, study polygon, period, evidence requirements, and selected project.

**Visual layout:** Step form: question → region/time → method/source → assumptions → review. White map, simple outline geometry.

**User interactions:** Create draft; validate recipe; inspect source fitness.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/catalog/products` — **P03**, `dataset:read`; request `provider_id?,variable?,kind?,bbox?,start?,end?,cursor?` → `Page<ScientificProduct>` (200).
- `POST /v1/science/recipe-validations` — **P04**, `research:plan`; request `RecipeValidationRequest{recipe,selected_sources}` → `RecipeValidationReport` (200).
- `POST /v1/research/investigations` — **P05**, `research:plan`; request `CreateInvestigation{project_id,question,geo_scope,time_window,as_of?,risk_tier}` → `Investigation` (201).

**Loading, empty, invalid and recovery states:** Invalid polygon, no baseline, unknown source rights, insufficient coverage.

**Required screen acceptance test:** Never promise calculation before G03/G04 real evidence exists.

**Frontend tests (implement, do not assume passed):** `R02-01` renders loading/true-empty correctly; `R02-02` denies restricted controls and direct-route access; `R02-03` binds valid server data without invented defaults; `R02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r03"></a>
#### R03 — Investigation overview / Research Studio

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]`  \
**Personas:** Project researcher, reviewer.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Main scientist workstation maintaining original conversation/map/activity/evidence coherence.

**Visual layout:** Left study context+recipe (~280px); centre map/chart (~flex); right evidence/source inspector (~320px); bottom task graph/events drawer.

**User interactions:** Select input, view results, open plan, inspect provenance, request review when enabled.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations/{investigation_id}` — **P05**, `project:read`; request `path investigation_id` → `Investigation` (200).
- `GET /v1/research/investigations/{investigation_id}/activity` — **P05**, `project:read`; request `cursor?` → `Page<ActivityItem>` (200).
- `GET /v1/research/investigations/{investigation_id}/outcome` — **P05**, `project:read`; request `path investigation_id` → `ScientificOutcome` (200).
- `GET /v1/research/investigations/{investigation_id}/evidence-summary` — **P06**, `evidence:read`; request `path ID` → `EvidenceSummary{supported,uncertain,missing}` (200).

**Loading, empty, invalid and recovery states:** New draft, ready to approve, queued, in-progress, insufficient, failed, source blocked.

**Required screen acceptance test:** Never display source-independent synthetic chart as a real SST output.

**Frontend tests (implement, do not assume passed):** `R03-01` renders loading/true-empty correctly; `R03-02` denies restricted controls and direct-route access; `R03-03` binds valid server data without invented defaults; `R03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r04"></a>
#### R04 — Plan & recipe approvals

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/plan`  \
**Personas:** Researcher with research:run.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Approve the exact immutable recipe and assumptions prior to compute.

**Visual layout:** Structured plan with data version, method version, baseline, bounded region/time, expected resource usage and digest.

**User interactions:** Create plan; compare versions; approve exact digest; edit investigation via versioned PATCH.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `PATCH /v1/research/investigations/{investigation_id}` — **P05**, `research:plan`; request `If-Match; PatchInvestigation{question?,scope?,description?}` → `Investigation` (200).
- `POST /v1/research/investigations/{investigation_id}/plans` — **P05**, `research:plan`; request `PlanRequest{strategy:"typed",method_hint?,data_constraints,budget}` → `Operation{kind:"plan"}` (202).
- `GET /v1/research/investigations/{investigation_id}/plans` — **P05**, `project:read`; request `cursor?` → `Page<InvestigationPlan>` (200).
- `GET /v1/research/investigations/{investigation_id}/plans/{plan_id}` — **P05**, `project:read`; request `path IDs` → `InvestigationPlan` (200).
- `POST /v1/research/investigations/{investigation_id}/plans/{plan_id}/approve` — **P05**, `research:run`; request `If-Match; ApprovePlan{digest,accepted_assumptions,approver_comment?}` → `ApprovedPlan` (200).

**Loading, empty, invalid and recovery states:** Stale ETag, recipe digest mismatch, baseline unsuitable, changed after approval.

**Required screen acceptance test:** Approval binds exact plan digest; incompatible edits produce a new version, not silent rerun.

**Frontend tests (implement, do not assume passed):** `R04-01` renders loading/true-empty correctly; `R04-02` denies restricted controls and direct-route access; `R04-03` binds valid server data without invented defaults; `R04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r05"></a>
#### R05 — Durable run / job operations

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/runs`  \
**Personas:** Researcher with run access.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Monitor actual durable compute stages and attempts, retries and budget.

**Visual layout:** Run history table; selected run stage timeline; reason-coded failure panel; cancellation controls.

**User interactions:** Start approved run; cancel; retry allowed failure; inspect costs.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/investigations/{investigation_id}/runs` — **P05**, `research:run`; request `StartRun{approved_plan_id,approved_digest,execution_budget}` → `Operation{kind:"investigation_run"}` (202).
- `GET /v1/research/investigations/{investigation_id}/runs` — **P05**, `project:read`; request `cursor?,status?` → `Page<ComputeRun>` (200).
- `GET /v1/research/investigations/{investigation_id}/runs/{run_id}` — **P05**, `project:read`; request `path IDs` → `ComputeRun{stage,lease_status,scientific_outcome?}` (200).
- `POST /v1/research/investigations/{investigation_id}/runs/{run_id}/cancel` — **P05**, `research:run`; request `CancelRun{reason}` → `Operation{kind:"cancel"}` (202).
- `POST /v1/research/investigations/{investigation_id}/runs/{run_id}/retry` — **P05**, `research:run`; request `RetryRun{failed_stage?,reason}` → `Operation{kind:"retry"}` (202).
- `GET /v1/research/investigations/{investigation_id}/costs` — **P05**, `project:read`; request `path ID` → `CostSummary{reserved,actual,breakdown}` (200).

**Loading, empty, invalid and recovery states:** Worker death, lease recovery, cancelled-but-late-completion, quota exceeded, retry not safe.

**Required screen acceptance test:** Never report result supported until evidence is published, even when job done.

**Frontend tests (implement, do not assume passed):** `R05-01` renders loading/true-empty correctly; `R05-02` denies restricted controls and direct-route access; `R05-03` binds valid server data without invented defaults; `R05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r06"></a>
#### R06 — Live task graph / event timeline

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/activity`  \
**Personas:** Investigation member.  **Highest referenced API gate:** P05 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show factual task activity and reconnection state without revealing private chain-of-thought.

**Visual layout:** Graph or step list with stage, sources, elapsed, retries, redacted events; reconnect indicator.

**User interactions:** Expand step; reconnect SSE; load earlier activity.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations/{investigation_id}/events` — **P05**, `project:read`; request `cursor?,limit?,event_type?` → `Page<InvestigationEvent>` (200).
- `GET /v1/research/investigations/{investigation_id}/events/stream` — **P05**, `project:read`; request `Accept:text/event-stream; Last-Event-ID?` → `SSE<InvestigationEvent>` (200).
- `GET /v1/research/investigations/{investigation_id}/activity` — **P05**, `project:read`; request `cursor?` → `Page<ActivityItem>` (200).
- `GET /v1/research/investigations/{investigation_id}/task-graph` — **P05**, `project:read`; request `path ID` → `TaskGraph{nodes,edges,statuses}` (200).

**Loading, empty, invalid and recovery states:** Disconnect, token expiry, Last-Event-ID expired, missing event, duplicated replay.

**Required screen acceptance test:** Dedup by event ID; fallback to GET events and run state on SSE failure.

**Frontend tests (implement, do not assume passed):** `R06-01` renders loading/true-empty correctly; `R06-02` denies restricted controls and direct-route access; `R06-03` binds valid server data without invented defaults; `R06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r07"></a>
#### R07 — Scientific geospatial visualization

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/map`  \
**Personas:** Researcher, analyst.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Display true available map layers, coordinates, time/depth, QC and sample coverage.

**Visual layout:** White chrome around central map; source controls top; variable/time/depth controls; layer legend/metadata inspector.

**User interactions:** Toggle layers; retrieve authorized tile/data access; inspect source.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations/{investigation_id}/map-layers` — **P06**, `project:read`; request `cursor?,kind?` → `Page<MapLayerDescriptor>` (200).
- `GET /v1/research/map-layers/{layer_id}` — **P06**, `project:read`; request `path layer_id` → `MapLayerDescriptor` (200).
- `POST /v1/research/map-layers/{layer_id}/access` — **P06**, `project:read`; request `MapAccessIntent{render_type,viewport?,zoom?}` → `MapAccessDescriptor` (200).

**Loading, empty, invalid and recovery states:** No layers, restricted geometry, no valid time, expired signed access, missing tile.

**Required screen acceptance test:** Map is evidence visualization, not an implied safety forecast.

**Frontend tests (implement, do not assume passed):** `R07-01` renders loading/true-empty correctly; `R07-02` denies restricted controls and direct-route access; `R07-03` binds valid server data without invented defaults; `R07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r08"></a>
#### R08 — Charts & statistical diagnostics

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/charts`  \
**Personas:** Researcher.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect real available charts/time series, units, quality and uncertainty without invented points.

**Visual layout:** Chart central, source/series selector and observations tabular fallback; uncertainty band if defined.

**User interactions:** Change variable; inspect underlying sample/manifest; switch table view.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations/{investigation_id}/artifacts` — **P06**, `evidence:read`; request `type?,version?,cursor?` → `Page<ScientificArtifact>` (200).
- `GET /v1/research/artifacts/{artifact_id}` — **P06**, `evidence:read`; request `path artifact_id` → `ScientificArtifact` (200).
- `GET /v1/research/artifacts/{artifact_id}/manifest` — **P06**, `evidence:read`; request `path artifact_id` → `EvidenceManifest` (200).

**Loading, empty, invalid and recovery states:** No numerical output; all-masked; uncertainty unknown; unsupported historical period.

**Required screen acceptance test:** Do not invent a chart API: render authorized existing result artifact descriptors only.

**Frontend tests (implement, do not assume passed):** `R08-01` renders loading/true-empty correctly; `R08-02` denies restricted controls and direct-route access; `R08-03` binds valid server data without invented defaults; `R08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r09"></a>
#### R09 — Evidence & scientific claims

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/evidence`  \
**Personas:** Researcher, reviewer.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect evidence per claim and distinguish supported/insufficient/inconclusive/invalid.

**Visual layout:** Claims table + right provenance lineage; exact data/time/method/baseline IDs; availability and access classes.

**User interactions:** Inspect artifact, claim, manifest, lineage, source.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations/{investigation_id}/artifacts` — **P06**, `evidence:read`; request `type?,version?,cursor?` → `Page<ScientificArtifact>` (200).
- `GET /v1/research/artifacts/{artifact_id}/lineage` — **P06**, `evidence:read`; request `path artifact_id` → `LineageGraph{nodes,edges}` (200).
- `GET /v1/research/artifacts/{artifact_id}/claims` — **P06**, `evidence:read`; request `path artifact_id; cursor?` → `Page<ScientificClaim>` (200).
- `GET /v1/research/claims/{claim_id}` — **P06**, `evidence:read`; request `path claim_id` → `ScientificClaim{evidence_refs,status,uncertainty}` (200).
- `GET /v1/research/investigations/{investigation_id}/evidence-summary` — **P06**, `evidence:read`; request `path ID` → `EvidenceSummary{supported,uncertain,missing}` (200).

**Loading, empty, invalid and recovery states:** Claim unsupported, missing evidence, private source, stale manifest.

**Required screen acceptance test:** Hash matching is not scientific validation; show independent panels.

**Frontend tests (implement, do not assume passed):** `R09-01` renders loading/true-empty correctly; `R09-02` denies restricted controls and direct-route access; `R09-03` binds valid server data without invented defaults; `R09-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r10"></a>
#### R10 — Artifact inspector & provenance

**UI URL:** `/org/[orgId]/research/artifacts/[artifactId]`  \
**Personas:** Project member with evidence:read.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect one scientific artifact and reproducible lineage.

**Visual layout:** Full-width structured metadata view: inputs, outputs, method/code digest, environment, source clock, access, downloadable status.

**User interactions:** Open lineage; inspect claim; request authorized reproduction.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/artifacts/{artifact_id}` — **P06**, `evidence:read`; request `path artifact_id` → `ScientificArtifact` (200).
- `GET /v1/research/artifacts/{artifact_id}/manifest` — **P06**, `evidence:read`; request `path artifact_id` → `EvidenceManifest` (200).
- `GET /v1/research/artifacts/{artifact_id}/lineage` — **P06**, `evidence:read`; request `path artifact_id` → `LineageGraph{nodes,edges}` (200).
- `GET /v1/research/artifacts/{artifact_id}/claims` — **P06**, `evidence:read`; request `path artifact_id; cursor?` → `Page<ScientificClaim>` (200).

**Loading, empty, invalid and recovery states:** Referenced byte removed, source rights prohibit download, digest invalid.

**Required screen acceptance test:** Never reveal private artifact URL until a scoped download intent grants it.

**Frontend tests (implement, do not assume passed):** `R10-01` renders loading/true-empty correctly; `R10-02` denies restricted controls and direct-route access; `R10-03` binds valid server data without invented defaults; `R10-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r11"></a>
#### R11 — Research reports & publication

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/reports`  \
**Personas:** PI, researcher, report publisher.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Generate structured report and preserve draft/published status with review trace.

**Visual layout:** Report index/draft reader; evidence citations and omissions; publish confirmation dialog.

**User interactions:** Generate report; preview; publish versioned report.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/investigations/{investigation_id}/reports` — **P06**, `report:publish`; request `BuildReport{run_id,template,locale,review_policy}` → `Operation{kind:"report"}` (202).
- `GET /v1/research/investigations/{investigation_id}/reports` — **P06**, `project:read`; request `cursor?,status?` → `Page<ResearchReport>` (200).
- `GET /v1/research/reports/{report_id}` — **P06**, `project:read`; request `path report_id` → `ResearchReport{sections,citations,limitations}` (200).
- `POST /v1/research/reports/{report_id}/publish` — **P06**, `report:publish`; request `If-Match; PublishReport{access_level,signoff_refs}` → `ResearchReport` (200).

**Loading, empty, invalid and recovery states:** Source unsupported, permissions, report not ready, duplicate generation, stale review.

**Required screen acceptance test:** Publication must not upgrade scientific status or overwrite adverse limitations.

**Frontend tests (implement, do not assume passed):** `R11-01` renders loading/true-empty correctly; `R11-02` denies restricted controls and direct-route access; `R11-03` binds valid server data without invented defaults; `R11-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-r12"></a>
#### R12 — Reproducible export center

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/exports`  \
**Personas:** Researcher, PI.  **Highest referenced API gate:** P06 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Package permitted reproducible research content with method and input hashes.

**Visual layout:** Export job table, selectable formats, license-aware inclusions, async progress and verified digest.

**User interactions:** Request export; inspect status; download authorized package.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/investigations/{investigation_id}/exports` — **P06**, `project:read`; request `ExportRequest{format:ro_crate\|notebook\|zip\|json\|csv\|parquet,include_data?}` → `Operation{kind:"export"}` (202).
- `GET /v1/research/exports/{export_id}` — **P06**, `project:read`; request `path export_id` → `ExportRecord` (200).
- `POST /v1/research/exports/{export_id}/download-intents` — **P06**, `project:read`; request `DownloadIntent{purpose}` → `EphemeralDownload` (200).

**Loading, empty, invalid and recovery states:** Restricted data cannot export, incomplete package, expired URL, checksum mismatch.

**Required screen acceptance test:** Clearly distinguish references-only package from complete locally reproducible inputs.

**Frontend tests (implement, do not assume passed):** `R12-01` renders loading/true-empty correctly; `R12-02` denies restricted controls and direct-route access; `R12-03` binds valid server data without invented defaults; `R12-04` handles stated conflict/outage/expiry and accessible retry.

### 5.5 Scientific review & validation

<a id="screen-v01"></a>
#### V01 — Scientific review inbox

**UI URL:** `/org/[orgId]/review/inbox`  \
**Personas:** Reviewer, PI.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Find accessible artifacts needing independent review or challenges.

**Visual layout:** Artifact list with status, method, source and project; filtered by review scope and invitations.

**User interactions:** Open artifact and start reproduction; view related investigations.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/investigations` — **P05**, `project:read`; request `project_id, state?,cursor?,limit?` → `Page<InvestigationSummary>` (200).
- `GET /v1/research/investigations/{investigation_id}/artifacts` — **P06**, `evidence:read`; request `type?,version?,cursor?` → `Page<ScientificArtifact>` (200).
- `GET /v1/research/artifacts/{artifact_id}/reviews` — **P07**, `evidence:read`; request `cursor?,verdict?` → `Page<IndependentReview>` (200).

**Loading, empty, invalid and recovery states:** No direct global review-queue API, missing cross-org grants, no assignments.

**Required screen acceptance test:** API gap: global assigned-review inbox requires new endpoint or client-limited approved investigation queries, not invented universal GET.

**Frontend tests (implement, do not assume passed):** `V01-01` renders loading/true-empty correctly; `V01-02` denies restricted controls and direct-route access; `V01-03` binds valid server data without invented defaults; `V01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-v02"></a>
#### V02 — Reproduction workspace

**UI URL:** `/org/[orgId]/review/artifacts/[artifactId]/reproduce`  \
**Personas:** Independent reviewer.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Recompute scientific result from immutable inputs using permitted method/environment.

**Visual layout:** Left original artifact, central execution parameters, right reproduction delta/status with error taxonomy.

**User interactions:** Run reproduction; inspect result; compare tolerance and provenance.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/artifacts/{artifact_id}/manifest` — **P06**, `evidence:read`; request `path artifact_id` → `EvidenceManifest` (200).
- `POST /v1/research/artifacts/{artifact_id}/reproductions` — **P07**, `review:write`; request `ReproduceRequest{method_ref,input_snapshot_refs,execution_budget,independent_worker?}` → `Operation{kind:"reproduce"}` (202).
- `GET /v1/research/artifacts/{artifact_id}/reproductions` — **P07**, `evidence:read`; request `cursor?,status?` → `Page<ReproductionRun>` (200).
- `GET /v1/research/reproductions/{reproduction_id}` — **P07**, `evidence:read`; request `path ID` → `ReproductionResult{verdict,delta,tolerance}` (200).

**Loading, empty, invalid and recovery states:** Insufficient accessible data, environment unavailable, calculation mismatch, expired grant.

**Required screen acceptance test:** Reproduction verdict separated from academic peer-review approval.

**Frontend tests (implement, do not assume passed):** `V02-01` renders loading/true-empty correctly; `V02-02` denies restricted controls and direct-route access; `V02-03` binds valid server data without invented defaults; `V02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-v03"></a>
#### V03 — Review submission & history

**UI URL:** `/org/[orgId]/review/artifacts/[artifactId]/reviews`  \
**Personas:** Reviewer with grant.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Publish reviewer assessment with method, uncertainty and explicit limitations.

**Visual layout:** Review history, reviewer identity/affiliation, evidence-linked decision form, original findings side panel.

**User interactions:** Submit review; inspect prior review; open specific review.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/artifacts/{artifact_id}/reviews` — **P07**, `review:write`; request `CreateReview{reviewer_id,scope,criterion,statement,evidence_refs}` → `IndependentReview` (201).
- `GET /v1/research/artifacts/{artifact_id}/reviews` — **P07**, `evidence:read`; request `cursor?,verdict?` → `Page<IndependentReview>` (200).
- `GET /v1/research/reviews/{review_id}` — **P07**, `evidence:read`; request `path review_id` → `IndependentReview` (200).

**Loading, empty, invalid and recovery states:** Disallowed reviewer, conflict of interest, expired grant, review disagreement.

**Required screen acceptance test:** Do not represent signed review as institutional accreditation if credential not checked.

**Frontend tests (implement, do not assume passed):** `V03-01` renders loading/true-empty correctly; `V03-02` denies restricted controls and direct-route access; `V03-03` binds valid server data without invented defaults; `V03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-v04"></a>
#### V04 — Scientific challenges / discrepancy comparison

**UI URL:** `/org/[orgId]/review/artifacts/[artifactId]/challenges`  \
**Personas:** Reviewer, authorized researcher.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Let independent contributor challenge specific scientific claims or method assumptions.

**Visual layout:** Two-column original vs challenger, highlight baseline/time/unit/QC differences, comment and evidence picker.

**User interactions:** Submit challenge; view challenges; respond to challenged claim; resolve if authorized.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/artifacts/{artifact_id}/challenges` — **P07**, `review:write`; request `ChallengeRequest{discrepancy_type,claim_ids,source_refs,explanation}` → `ScientificChallenge` (201).
- `GET /v1/research/artifacts/{artifact_id}/challenges` — **P07**, `evidence:read`; request `cursor?,status?` → `Page<ScientificChallenge>` (200).
- `POST /v1/research/challenges/{challenge_id}/responses` — **P07**, `evidence:write`; request `ChallengeResponse{response_artifact_id,method_ref,comment}` → `ChallengeResponseRecord` (201).
- `POST /v1/research/challenges/{challenge_id}/resolve` — **P07**, `review:write`; request `If-Match; ResolveChallenge{verdict,arbitration_refs,limitations}` → `ScientificChallenge` (200).

**Loading, empty, invalid and recovery states:** Wrong version, no data access, challenge duplicates, unresolved disagreement.

**Required screen acceptance test:** Original record remains accessible and correction is new version, never rewritten.

**Frontend tests (implement, do not assume passed):** `V04-01` renders loading/true-empty correctly; `V04-02` denies restricted controls and direct-route access; `V04-03` binds valid server data without invented defaults; `V04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-v05"></a>
#### V05 — Historical evaluation lab

**UI URL:** `/org/[orgId]/research/investigations/[investigationId]/historical`  \
**Personas:** Researcher/PI.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Replay historical information available at a specified as-of time and compare later observations.

**Visual layout:** Timeline with as-of/valid/observed/published timestamps; historical benchmark metrics and evidence gaps.

**User interactions:** Create evaluation; inspect run history and metrics.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/investigations/{investigation_id}/historical-evaluations` — **P07**, `research:run`; request `HistoricalEvalRequest{decision_as_of,observation_window,benchmark_id,selection_policy}` → `Operation{kind:"historical_eval"}` (202).
- `GET /v1/research/investigations/{investigation_id}/historical-evaluations` — **P07**, `project:read`; request `cursor?` → `Page<HistoricalEvaluation>` (200).
- `GET /v1/research/historical-evaluations/{evaluation_id}` — **P07**, `project:read`; request `path evaluation_id` → `HistoricalEvaluation{metrics,limitations}` (200).

**Loading, empty, invalid and recovery states:** Snapshot missing, archive unavailable, future-data leakage flagged, unsupported method.

**Required screen acceptance test:** Never display retrospective reanalysis as original historical operational forecast.

**Frontend tests (implement, do not assume passed):** `V05-01` renders loading/true-empty correctly; `V05-02` denies restricted controls and direct-route access; `V05-03` binds valid server data without invented defaults; `V05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-v06"></a>
#### V06 — Scientific benchmark library

**UI URL:** `/org/[orgId]/research/benchmarks`  \
**Personas:** Researcher, validation lead.  **Highest referenced API gate:** P07 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Browse known benchmark definitions and compare method performance on bounded cases.

**Visual layout:** Benchmark table with source provenance, period, metrics, access and evaluation limitations.

**User interactions:** Inspect benchmark; link historical evaluation.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/benchmarks` — **P07**, `project:read`; request `domain?,method?,cursor?` → `Page<BenchmarkDefinition>` (200).
- `GET /v1/research/benchmarks/{benchmark_id}` — **P07**, `project:read`; request `path ID` → `BenchmarkDefinition` (200).

**Loading, empty, invalid and recovery states:** No results, benchmark not granted, unsupported model metrics.

**Required screen acceptance test:** No unmeasured accuracy percentage in marketing dashboard.

**Frontend tests (implement, do not assume passed):** `V06-01` renders loading/true-empty correctly; `V06-02` denies restricted controls and direct-route access; `V06-03` binds valid server data without invented defaults; `V06-04` handles stated conflict/outage/expiry and accessible retry.

### 5.6 Agent provider & onboarding

<a id="screen-a01"></a>
#### A01 — Agent directory

**UI URL:** `/org/[orgId]/agents`  \
**Personas:** Agent operator, PI, researcher.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Browse approved internal and external agent capabilities without conflating organization and wallet trust.

**Visual layout:** Dense directory with operator class, capability, endpoint type, last health, affiliation, ENS/Arkiv indicators separated.

**User interactions:** Register agent; inspect health; discover peer providers.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents` — **P09**, `network:read`; request `capability?,region?,method_id?,provider_mode?,verified_only?,cursor?` → `Page<AgentSummary>` (200).
- `POST /v1/network/discovery` — **P09**, `research:plan`; request `AgentDiscoveryRequest{capability,geo_scope,time_window,method_ref,trust_policy}` → `AgentDiscoveryResult` (200).

**Loading, empty, invalid and recovery states:** No agents, hidden private endpoint, pending trust, federation disabled.

**Required screen acceptance test:** Directory is unavailable until P09; no hardcoded production agent cards.

**Frontend tests (implement, do not assume passed):** `A01-01` renders loading/true-empty correctly; `A01-02` denies restricted controls and direct-route access; `A01-03` binds valid server data without invented defaults; `A01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a02"></a>
#### A02 — Agent registration: choose provider model

**UI URL:** `/org/[orgId]/agents/new/mode`  \
**Personas:** Org admin/agent operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Choose hosted, institution-operated A2A, or dataset/MCP provider with truthful support status.

**Visual layout:** Three white radio cards with responsibilities, infrastructure ownership, expected security/access and availability.

**User interactions:** Select mode; inspect prerequisites; proceed.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/meta` — **P01**, `public`; request `—` → `APIMetadata{revision,release_profile,enabled_capabilities}` (200).
- `GET /v1/network/provider-onboarding/{agent_id}/checklist` — **P09**, `agent:operate`; request `path agent_id` → `OnboardingChecklist` (200).

**Loading, empty, invalid and recovery states:** Mode not implemented, organization not authorized, cannot onboard.

**Required screen acceptance test:** API gap: provider mode model must be approved in P09 DTO; do not claim hosted inference already available.

**Frontend tests (implement, do not assume passed):** `A02-01` renders loading/true-empty correctly; `A02-02` denies restricted controls and direct-route access; `A02-03` binds valid server data without invented defaults; `A02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a03"></a>
#### A03 — Agent registration: identity and visibility

**UI URL:** `/org/[orgId]/agents/new/identity`  \
**Personas:** Agent operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Register technical agent metadata, organization ID and public/private visibility.

**Visual layout:** Identity form, preview Agent Card, trust model explanation, org affiliation status.

**User interactions:** Create agent; confirm ownership; set visibility.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/organizations/{org_id}` — **P02**, `org:read`; request `path org_id` → `Organization` (200).
- `POST /v1/network/agents` — **P09**, `agent:register`; request `RegisterAgent{organization_id,name,provider_mode,declared_capabilities,endpoint_ref}` → `Agent` (201).

**Loading, empty, invalid and recovery states:** Idempotency mismatch; unverified org; name collision; invalid operator scope.

**Required screen acceptance test:** Agent name is not institutional proof; registration and accreditation are separate.

**Frontend tests (implement, do not assume passed):** `A03-01` renders loading/true-empty correctly; `A03-02` denies restricted controls and direct-route access; `A03-03` binds valid server data without invented defaults; `A03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a04"></a>
#### A04 — Agent registration: capabilities & coverage

**UI URL:** `/org/[orgId]/agents/new/capabilities`  \
**Personas:** Agent operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Define method IDs, input/output schemas, regions, temporal coverage and scientific limitations.

**Visual layout:** Typed capability builder with version, bounds, artifacts, evidence requirements.

**User interactions:** Add capability; edit capability; validate against backend schema.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents/{agent_id}/capabilities` — **P09**, `network:read`; request `cursor?` → `Page<AgentCapability>` (200).
- `POST /v1/network/agents/{agent_id}/capabilities` — **P09**, `agent:operate`; request `DeclareCapability{capability_id,method_versions,regions,input_schema_ref,output_schema_ref}` → `AgentCapability` (201).
- `PATCH /v1/network/agents/{agent_id}/capabilities/{capability_id}` — **P09**, `agent:operate`; request `If-Match; PatchCapability` → `AgentCapability` (200).

**Loading, empty, invalid and recovery states:** Unsupported method, geographic overclaim, duplicated capability, stale ETag.

**Required screen acceptance test:** Prefer constrained enumerations from method registry; no invented model certifications.

**Frontend tests (implement, do not assume passed):** `A04-01` renders loading/true-empty correctly; `A04-02` denies restricted controls and direct-route access; `A04-03` binds valid server data without invented defaults; `A04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a05"></a>
#### A05 — Agent registration: endpoint & auth

**UI URL:** `/org/[orgId]/agents/new/endpoint`  \
**Personas:** Agent operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Set authorized A2A endpoint, publish discoverable service interface and test reachability.

**Visual layout:** Endpoint form with HTTPS validation; Agent Card result; auth model summary; handshake test results.

**User interactions:** Save endpoint; test connection; inspect failure.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents/{agent_id}/endpoints` — **P09**, `network:read`; request `cursor?` → `Page<AgentEndpoint>` (200).
- `POST /v1/network/agents/{agent_id}/endpoints` — **P09**, `agent:operate`; request `EndpointRegistration{transport,uri,auth_scheme,card_url}` → `AgentEndpoint` (201).
- `POST /v1/network/agents/{agent_id}/endpoint-checks` — **P09**, `agent:operate`; request `EndpointCheckRequest{endpoint_id}` → `Operation{kind:"endpoint_check"}` (202).

**Loading, empty, invalid and recovery states:** SSRF blocked, TLS failure, remote 401, unsuitable capability/transport, timeout.

**Required screen acceptance test:** Never show or persist provider secret after issuance; never blindly fetch arbitrary user URLs.

**Frontend tests (implement, do not assume passed):** `A05-01` renders loading/true-empty correctly; `A05-02` denies restricted controls and direct-route access; `A05-03` binds valid server data without invented defaults; `A05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a06"></a>
#### A06 — Agent registration: identity & federation checklist

**UI URL:** `/org/[orgId]/agents/new/verification`  \
**Personas:** Agent operator, org admin.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Check scientific scope, authorized credentials, A2A health and optional ENS/Arkiv readiness.

**Visual layout:** Checklist with separate technical, organizational, chain and science categories; links to missing tasks.

**User interactions:** Run checks; open ENS; bind wallet; publish if policy permits.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents/{agent_id}/health` — **P09**, `network:read`; request `—` → `AgentHealth{observed_at,availability}` (200).
- `GET /v1/network/provider-onboarding/{agent_id}/checklist` — **P09**, `agent:operate`; request `path agent_id` → `OnboardingChecklist` (200).
- `GET /v1/identity/agent-bindings` — **P10**, `identity:manage`; request `agent_id?,wallet?,cursor?` → `Page<AgentBinding>` (200).

**Loading, empty, invalid and recovery states:** Network P09 done but P10/11 not enabled; missing proof; revoked wallet.

**Required screen acceptance test:** Checklist must show clearly which blockers are required for chosen public/federated mode.

**Frontend tests (implement, do not assume passed):** `A06-01` renders loading/true-empty correctly; `A06-02` denies restricted controls and direct-route access; `A06-03` binds valid server data without invented defaults; `A06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a07"></a>
#### A07 — Agent detail & scientific capability

**UI URL:** `/org/[orgId]/agents/[agentId]`  \
**Personas:** Agent operator/researcher.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Display public metadata, owner affiliation, supported methods and source constraints.

**Visual layout:** Header identity; Overview / Capabilities / Endpoints / Health / Identity / Tasks tabs.

**User interactions:** Edit agent if operator; view capabilities; suspend if authorized.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents/{agent_id}` — **P09**, `network:read`; request `path agent_id` → `AgentDetail` (200).
- `PATCH /v1/network/agents/{agent_id}` — **P09**, `agent:operate`; request `If-Match; PatchAgent{display_name,status?,metadata?}` → `AgentDetail` (200).
- `POST /v1/network/agents/{agent_id}/suspend` — **P09**, `org:write`; request `If-Match; {reason}` → `AgentDetail` (200).
- `GET /v1/network/agents/{agent_id}/capabilities` — **P09**, `network:read`; request `cursor?` → `Page<AgentCapability>` (200).

**Loading, empty, invalid and recovery states:** Suspended, unverified, private scope, stale read model.

**Required screen acceptance test:** Suspension prevents new delegations; extant results remain provenance-linked.

**Frontend tests (implement, do not assume passed):** `A07-01` renders loading/true-empty correctly; `A07-02` denies restricted controls and direct-route access; `A07-03` binds valid server data without invented defaults; `A07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a08"></a>
#### A08 — Agent health & operations

**UI URL:** `/org/[orgId]/agents/[agentId]/health`  \
**Personas:** Agent operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect bounded reachability and throughput of separately hosted provider service.

**Visual layout:** Health timeline, last probe, latency/error reasons, endpoint status; technical vs scientific quality label.

**User interactions:** Recheck endpoint; inspect results and connection history.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents/{agent_id}/endpoints` — **P09**, `network:read`; request `cursor?` → `Page<AgentEndpoint>` (200).
- `POST /v1/network/agents/{agent_id}/endpoint-checks` — **P09**, `agent:operate`; request `EndpointCheckRequest{endpoint_id}` → `Operation{kind:"endpoint_check"}` (202).
- `GET /v1/network/agents/{agent_id}/health` — **P09**, `network:read`; request `—` → `AgentHealth{observed_at,availability}` (200).

**Loading, empty, invalid and recovery states:** No health checks yet; endpoint unreachable; stale last-known state.

**Required screen acceptance test:** Do not claim scientific quality from successful ping alone.

**Frontend tests (implement, do not assume passed):** `A08-01` renders loading/true-empty correctly; `A08-02` denies restricted controls and direct-route access; `A08-03` binds valid server data without invented defaults; `A08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-a09"></a>
#### A09 — Provider task inbox & sessions

**UI URL:** `/org/[orgId]/agents/[agentId]/tasks`  \
**Personas:** Agent operator.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Follow the tasks this provider legitimately claimed and its A2A execution sessions.

**Visual layout:** Tabs Discoverable / Claimed / Assigned / Running / Submitted; per-task A2A session inspector.

**User interactions:** Open task; accept by assignment workflow; inspect session.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/tasks` — **P11**, `network:read`; request `capability?,region?,state?,network?,cursor?` → `Page<ExternalTask>` (200).
- `GET /v1/network/tasks/{external_task_id}/assignments` — **P11**, `network:read`; request `cursor?` → `Page<TaskAssignment>` (200).
- `GET /v1/network/tasks/{external_task_id}/a2a-sessions` — **P11**, `network:read`; request `cursor?` → `Page<A2ASession>` (200).

**Loading, empty, invalid and recovery states:** Provider restricted to own claims, A2A disconnected, Arkiv unavailable, expiry.

**Required screen acceptance test:** Filter to current agent only if backend supports query or use indexed scoped relationships.

**Frontend tests (implement, do not assume passed):** `A09-01` renders loading/true-empty correctly; `A09-02` denies restricted controls and direct-route access; `A09-03` binds valid server data without invented defaults; `A09-04` handles stated conflict/outage/expiry and accessible retry.

### 5.7 ENS identity & institution trust

<a id="screen-e01"></a>
#### E01 — Institutional identity / credential register

**UI URL:** `/org/[orgId]/identity/credentials`  \
**Personas:** Admin, identity manager.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show organization affiliation evidence and credential decisions separately from ENS ownership.

**Visual layout:** Credential list with issuer, validity, pending state and disclosure policy; audit trail.

**User interactions:** Submit credential; authorized operator decision; review failures.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/identity/institution-credentials` — **P10**, `identity:manage`; request `org_id?,cursor?` → `Page<CredentialMetadata>` (200).
- `POST /v1/identity/institution-credentials` — **P10**, `identity:manage`; request `CredentialSubmission{org_id,issuer,credential_type,digest,encrypted_artifact_ref}` → `CredentialReview` (201).
- `POST /v1/identity/institution-credentials/{credential_id}/decisions` — **P10**, `platform_operator`; request `CredentialDecision{accepted,reason_code,evidence_refs}` → `CredentialReview` (200).

**Loading, empty, invalid and recovery states:** Unverified issuer, expired attestation, conflict of interest, decision forbidden.

**Required screen acceptance test:** Credential approval is controlled by authorized issuer/operator, not self-service claim.

**Frontend tests (implement, do not assume passed):** `E01-01` renders loading/true-empty correctly; `E01-02` denies restricted controls and direct-route access; `E01-03` binds valid server data without invented defaults; `E01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-e02"></a>
#### E02 — ENS namespace overview

**UI URL:** `/org/[orgId]/identity/ens`  \
**Personas:** Org admin/agent operator.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show institution-owned naming hierarchy, chain, resolver and active agent names.

**Visual layout:** Hierarchy tree and record table; owner/controller address; last confirmed chain state.

**User interactions:** Resolve name; register authorized name; inspect transaction.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/identity/ens/resolutions` — **P10**, `identity:manage`; request `ResolveENSRequest{name,ens_chain_id,record_keys,force_refresh?}` → `ENSResolutionSnapshot` (200).
- `GET /v1/identity/ens/names/{encoded_name}` — **P10**, `identity:manage`; request `query chain_id` → `ENSNameRecord` (200).
- `POST /v1/identity/ens/registrations` — **P10**, `identity:manage`; request `ENSRegistrationIntent{name,parent_name,registry_mode,expected_controller}` → `Operation{kind:"ens_registration"}` (202).

**Loading, empty, invalid and recovery states:** Name unavailable, unsupported chain, contract unavailable, transaction pending.

**Required screen acceptance test:** ENS is registry/discovery and does not grant organization recognition.

**Frontend tests (implement, do not assume passed):** `E02-01` renders loading/true-empty correctly; `E02-02` denies restricted controls and direct-route access; `E02-03` binds valid server data without invented defaults; `E02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-e03"></a>
#### E03 — ENS record and A2A endpoint management

**UI URL:** `/org/[orgId]/identity/ens/[encodedName]`  \
**Personas:** Operator with delegated rights.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect/modify ENS records for one agent with resolver-scoped isolation.

**Visual layout:** Current record table + change preview, resolver address, proof chain/tx.

**User interactions:** Update agent endpoint, re-resolve, inspect confirmation.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/identity/ens/names/{encoded_name}` — **P10**, `identity:manage`; request `query chain_id` → `ENSNameRecord` (200).
- `POST /v1/identity/ens/record-updates` — **P10**, `identity:manage`; request `ENSRecordIntent{name,key,value,controller_ref}` → `Operation{kind:"ens_record_update"}` (202).
- `GET /v1/identity/ens/transactions/{transaction_id}` — **P10**, `identity:manage`; request `path ID` → `ChainTransactionStatus` (200).

**Loading, empty, invalid and recovery states:** Unauthorized record change, stale cached resolver, delayed confirmation.

**Required screen acceptance test:** Do not permit sibling-name writes via shared resolver permissions.

**Frontend tests (implement, do not assume passed):** `E03-01` renders loading/true-empty correctly; `E03-02` denies restricted controls and direct-route access; `E03-03` binds valid server data without invented defaults; `E03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-e04"></a>
#### E04 — ENS scoped delegation and revocation

**UI URL:** `/org/[orgId]/identity/ens/[encodedName]/permissions`  \
**Personas:** Org owner/authorized identity admin.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Grant minimal resolver permission and demonstrate revocation.

**Visual layout:** Operator/role matrix; explicit resolver boundary; revoke confirmation and denial proof.

**User interactions:** Grant scoped update; revoke; verify newly denied action.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/identity/ens/permission-grants` — **P10**, `identity:manage`; request `ENSGrantIntent{name,role,delegate,scope,expires_at?}` → `Operation{kind:"ens_grant"}` (202).
- `POST /v1/identity/ens/permission-revocations` — **P10**, `identity:manage`; request `ENSRevokeIntent{name,role,delegate}` → `Operation{kind:"ens_revoke"}` (202).
- `GET /v1/identity/ens/transactions/{transaction_id}` — **P10**, `identity:manage`; request `path ID` → `ChainTransactionStatus` (200).

**Loading, empty, invalid and recovery states:** Failed on-chain permission change, operator granted sibling access, revoked cache stale.

**Required screen acceptance test:** Permission state is pending until chain confirms; UI not authoritative.

**Frontend tests (implement, do not assume passed):** `E04-01` renders loading/true-empty correctly; `E04-02` denies restricted controls and direct-route access; `E04-03` binds valid server data without invented defaults; `E04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-e05"></a>
#### E05 — ENS-to-Arkiv agent wallet binding

**UI URL:** `/org/[orgId]/identity/bindings`  \
**Personas:** Identity manager, agent operator.  **Highest referenced API gate:** P10 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Connect ENS agent, institutional credential, A2A service key and Arkiv wallet by signed, expiring proof.

**Visual layout:** Binding graph with ENS owner → service key → Arkiv wallet, proof status, nonce expiry and revocation.

**User interactions:** Issue challenge; submit signed binding; verify; revoke.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/identity/agent-bindings/challenges` — **P10**, `agent:operate`; request `BindingChallengeRequest{agent_id,ens_name,arkiv_wallet,a2a_key_id,scopes}` → `BindingChallenge{nonce,domain,audience,expires_at}` (201).
- `POST /v1/identity/agent-bindings` — **P10**, `agent:operate`; request `SubmitBinding{challenge_id,typed_manifest,controller_signature,service_signature?,credential_ref?}` → `AgentBinding` (201).
- `GET /v1/identity/agent-bindings` — **P10**, `identity:manage`; request `agent_id?,wallet?,cursor?` → `Page<AgentBinding>` (200).
- `GET /v1/identity/agent-bindings/{binding_id}` — **P10**, `identity:manage`; request `path ID` → `AgentBinding` (200).
- `POST /v1/identity/agent-bindings/{binding_id}/verify` — **P10**, `identity:manage`; request `{force_chain_read?:boolean}` → `BindingVerification` (200).
- `POST /v1/identity/agent-bindings/{binding_id}/revoke` — **P10**, `identity:manage`; request `RevokeBinding{reason,revocation_epoch}` → `AgentBinding` (200).

**Loading, empty, invalid and recovery states:** Replay nonce, wrong ENS controller, revoked service key, chain mismatch, expired proof.

**Required screen acceptance test:** Cross-chain wallet equivalence is never inferred from address string alone.

**Frontend tests (implement, do not assume passed):** `E05-01` renders loading/true-empty correctly; `E05-02` denies restricted controls and direct-route access; `E05-03` binds valid server data without invented defaults; `E05-04` handles stated conflict/outage/expiry and accessible retry.

### 5.8 Federated network & Arkiv

<a id="screen-n01"></a>
#### N01 — External agent discovery

**UI URL:** `/network/agents`  \
**Personas:** Researcher, provider operator.  **Highest referenced API gate:** P09 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Find independent agents by authorized capability and geographic scope.

**Visual layout:** Capabilities-first filter table, disclosure levels, ENS identity fields and reachability separated.

**User interactions:** Run discovery; open provider; request collaboration.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/agents` — **P09**, `network:read`; request `capability?,region?,method_id?,provider_mode?,verified_only?,cursor?` → `Page<AgentSummary>` (200).
- `GET /v1/network/agents/{agent_id}` — **P09**, `network:read`; request `path agent_id` → `AgentDetail` (200).
- `POST /v1/network/discovery` — **P09**, `research:plan`; request `AgentDiscoveryRequest{capability,geo_scope,time_window,method_ref,trust_policy}` → `AgentDiscoveryResult` (200).

**Loading, empty, invalid and recovery states:** No trusted provider; discovery partial; endpoint claims untrusted.

**Required screen acceptance test:** Trust rank is policy-derived, not raw popularity.

**Frontend tests (implement, do not assume passed):** `N01-01` renders loading/true-empty correctly; `N01-02` denies restricted controls and direct-route access; `N01-03` binds valid server data without invented defaults; `N01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n02"></a>
#### N02 — Public task marketplace / Arkiv board

**UI URL:** `/network/tasks`  \
**Personas:** Researcher, authorized provider.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Discover non-sensitive, still-active shared research tasks across institutions.

**Visual layout:** Tabular task board: capability, region band, deadline, owner, claim count if available, last indexed time.

**User interactions:** Publish task; open task; submit permitted claim.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/tasks` — **P11**, `network:read`; request `capability?,region?,state?,network?,cursor?` → `Page<ExternalTask>` (200).
- `POST /v1/network/arkiv/queries` — **P11**, `network:publish`; request `ArkivSafeQuery{schema_id,filters:{capability?,region?,status?,owner?},cursor?}` → `ArkivQueryPage` (200).

**Loading, empty, invalid and recovery states:** Testnet unavailable, public task expired, stale projection, untrusted owner.

**Required screen acceptance test:** No full private polygon or question on public Arkiv entity.

**Frontend tests (implement, do not assume passed):** `N02-01` renders loading/true-empty correctly; `N02-02` denies restricted controls and direct-route access; `N02-03` binds valid server data without invented defaults; `N02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n03"></a>
#### N03 — Publish public research task

**UI URL:** `/network/tasks/new`  \
**Personas:** PI/research coordinator.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Convert approved private investigation scope to minimum public capability request.

**Visual layout:** Preview published fields vs suppressed private fields, owner wallet, expiry, budget, grant policy.

**User interactions:** Publish task; inspect transaction; cancel draft locally.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/network/tasks` — **P11**, `network:publish`; request `PublishNetworkTask{investigation_id,public_summary,required_capability,deadline,visibility}` → `ExternalTask{arkiv_state}` (202).
- `POST /v1/network/arkiv/queries` — **P11**, `network:publish`; request `ArkivSafeQuery{schema_id,filters:{capability?,region?,status?,owner?},cursor?}` → `ArkivQueryPage` (200).

**Loading, empty, invalid and recovery states:** No wallet binding, license forbids public metadata, chain 503, double publish.

**Required screen acceptance test:** Request stays private until explicit confirm; no receipt means not published.

**Frontend tests (implement, do not assume passed):** `N03-01` renders loading/true-empty correctly; `N03-02` denies restricted controls and direct-route access; `N03-03` binds valid server data without invented defaults; `N03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n04"></a>
#### N04 — Task detail, claims and assignment

**UI URL:** `/network/tasks/[taskId]`  \
**Personas:** Task requester, provider.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect independently submitted claims and one authoritative assignment decision.

**Visual layout:** Task metadata top; claim table; allocation policy drawer; assignment and A2A session tabs.

**User interactions:** Claim task; list claims; assign provider; dispatch approved assignment.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/tasks/{external_task_id}` — **P11**, `network:read`; request `path ID` → `ExternalTask` (200).
- `POST /v1/network/tasks/{external_task_id}/claims` — **P11**, `network:claim`; request `SubmitTaskClaim{agent_id,binding_id,availability,budget_offer?}` → `TaskClaim{arkiv_state}` (202).
- `GET /v1/network/tasks/{external_task_id}/claims` — **P11**, `network:read`; request `cursor?` → `Page<TaskClaim>` (200).
- `POST /v1/network/tasks/{external_task_id}/assignments` — **P11**, `network:assign`; request `AssignProvider{accepted_claim_id,policy_digest,scope,budget}` → `TaskAssignment` (201).
- `GET /v1/network/tasks/{external_task_id}/assignments` — **P11**, `network:read`; request `cursor?` → `Page<TaskAssignment>` (200).
- `POST /v1/network/tasks/{external_task_id}/dispatch` — **P11**, `network:assign`; request `DispatchTask{assignment_id,a2a_message_digest,deadline}` → `Operation{kind:"a2a_dispatch"}` (202).

**Loading, empty, invalid and recovery states:** Multiple claims, expired task, revoked binding, unconfirmed assignment, duplicate dispatch.

**Required screen acceptance test:** Claim != accepted assignment; user sees separate states.

**Frontend tests (implement, do not assume passed):** `N04-01` renders loading/true-empty correctly; `N04-02` denies restricted controls and direct-route access; `N04-03` binds valid server data without invented defaults; `N04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n05"></a>
#### N05 — Distributed execution and A2A session monitor

**UI URL:** `/network/tasks/[taskId]/sessions`  \
**Personas:** Requester/provider with read grant.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Follow confirmed delegated task, A2A session state and bounded retry with identities.

**Visual layout:** Timeline linking registered identity, chosen claim, A2A messages (redacted), result reference.

**User interactions:** Inspect session, provider contact, cancellation outcome through A2A protocol.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/tasks/{external_task_id}/assignments` — **P11**, `network:read`; request `cursor?` → `Page<TaskAssignment>` (200).
- `GET /v1/network/tasks/{external_task_id}/a2a-sessions` — **P11**, `network:read`; request `cursor?` → `Page<A2ASession>` (200).

**Loading, empty, invalid and recovery states:** A2A disconnected; agent silently fails; stale provider response; expired identity.

**Required screen acceptance test:** A2A native task methods live outside ORCA REST; no invented /v1/a2a/send.

**Frontend tests (implement, do not assume passed):** `N05-01` renders loading/true-empty correctly; `N05-02` denies restricted controls and direct-route access; `N05-03` binds valid server data without invented defaults; `N05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n06"></a>
#### N06 — Signed result & public evidence references

**UI URL:** `/network/results`  \
**Personas:** Provider, reviewer, network reader.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Publish and browse public scientific artifact hashes/references while respecting licensing.

**Visual layout:** Result table and artifact availability, signer, content hash, method, access classification.

**User interactions:** Publish result ref; inspect result; open authorized evidence.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/network/results` — **P11**, `network:publish`; request `PublishNetworkResult{external_task_id,agent_id,artifact_id,binding_id,public_digest}` → `Operation{kind:"arkiv_result"}` (202).
- `GET /v1/network/results` — **P11**, `network:read`; request `task_id?,agent_id?,cursor?` → `Page<NetworkResultRef>` (200).
- `GET /v1/network/results/{result_ref_id}` — **P11**, `network:read`; request `path ID` → `NetworkResultRef` (200).

**Loading, empty, invalid and recovery states:** Hash exists but bytes restricted, wrong wallet owner, stale chain index.

**Required screen acceptance test:** No public publication of sensitive scientific data by default.

**Frontend tests (implement, do not assume passed):** `N06-01` renders loading/true-empty correctly; `N06-02` denies restricted controls and direct-route access; `N06-03` binds valid server data without invented defaults; `N06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n07"></a>
#### N07 — Independent public reviews / scientific challenges

**UI URL:** `/network/reviews`  \
**Personas:** External validator, network reader.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Display independently owned scientific review references for collaborative tasks.

**Visual layout:** Review table linked to result and scientific status; reviewer affiliation and underlying evidence access.

**User interactions:** Publish review reference; inspect original finding; verify independently.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/results/{result_ref_id}` — **P11**, `network:read`; request `path ID` → `NetworkResultRef` (200).
- `POST /v1/network/reviews` — **P11**, `network:review`; request `PublishNetworkReview{result_ref_id,review_id,binding_id,visibility}` → `Operation{kind:"arkiv_review"}` (202).
- `GET /v1/network/reviews` — **P11**, `network:read`; request `result_ref_id?,verdict?,cursor?` → `Page<NetworkReviewRef>` (200).

**Loading, empty, invalid and recovery states:** Unrecognized reviewer, review inconsistent, chain record deleted/expired.

**Required screen acceptance test:** Review signed by provider is distinct from scientific reproduction verdict.

**Frontend tests (implement, do not assume passed):** `N07-01` renders loading/true-empty correctly; `N07-02` denies restricted controls and direct-route access; `N07-03` binds valid server data without invented defaults; `N07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n08"></a>
#### N08 — Arkiv entity & transaction explorer

**UI URL:** `/network/arkiv`  \
**Personas:** Auditor, provider operator.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Allow filterable lookups of public entity owners, expiries, tx confirmation and chain indexing.

**Visual layout:** Entity query form; entity detail view; tx receipt; projection as-of time; testnet labels.

**User interactions:** Query; inspect entity; inspect transaction; reconcile if authorized.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/network/arkiv/queries` — **P11**, `network:publish`; request `ArkivSafeQuery{schema_id,filters:{capability?,region?,status?,owner?},cursor?}` → `ArkivQueryPage` (200).
- `GET /v1/network/arkiv/entities/{entity_key}` — **P11**, `network:read`; request `path key; query chain_id` → `ArkivEntityProjection` (200).
- `GET /v1/network/arkiv/transactions/{transaction_id}` — **P11**, `network:read`; request `path tx ID` → `ChainTransactionStatus` (200).
- `POST /v1/network/arkiv/reconciliation-requests` — **P11**, `ops:read`; request `ReconcileRequest{entity_key?,tx_hash?}` → `Operation{kind:"arkiv_reconcile"}` (202).
- `GET /v1/network/arkiv/indexer-status` — **P11**, `ops:read`; request `—` → `IndexerStatus{block,height,lag,last_error}` (200).

**Loading, empty, invalid and recovery states:** RPC outage, submitted vs confirmed vs indexed, expired/deleted entity, owner mismatch.

**Required screen acceptance test:** Do not imply Arkiv preserves permanent proof after TTL/deletion.

**Frontend tests (implement, do not assume passed):** `N08-01` renders loading/true-empty correctly; `N08-02` denies restricted controls and direct-route access; `N08-03` binds valid server data without invented defaults; `N08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n09"></a>
#### N09 — Federated investigation event timeline

**UI URL:** `/network/investigations/[publicTaskId]`  \
**Personas:** Authorized network reader.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Display cross-organization work contributions from independently owned task/claim/result/review entities.

**Visual layout:** Chronological row view with ENS identity, Arkiv owner, A2A dispatch, science summary (if allowed).

**User interactions:** Verify timeline; open claim; open scientific artifact when granted.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/tasks/{external_task_id}/claims` — **P11**, `network:read`; request `cursor?` → `Page<TaskClaim>` (200).
- `GET /v1/network/results` — **P11**, `network:read`; request `task_id?,agent_id?,cursor?` → `Page<NetworkResultRef>` (200).
- `GET /v1/network/investigations/{public_task_id}/timeline` — **P11**, `network:read`; request `cursor?` → `Page<NetworkTimelineEvent>` (200).

**Loading, empty, invalid and recovery states:** Timeline incomplete due to expiry; read model lag; ORCA API unavailable.

**Required screen acceptance test:** Support independent client verification beyond central ORCA API.

**Frontend tests (implement, do not assume passed):** `N09-01` renders loading/true-empty correctly; `N09-02` denies restricted controls and direct-route access; `N09-03` binds valid server data without invented defaults; `N09-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-n10"></a>
#### N10 — Independent verifier (public-only mode)

**UI URL:** `/verify/[publicRef]`  \
**Personas:** External auditor/public viewer.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Verify available chain state, signed artifact integrity, and separately indicate scientific reproducibility.

**Visual layout:** Three-column status: owner/signature, hash/content, scientific method; explicit unavailable reasons.

**User interactions:** Submit verification job; inspect result; open independent source references.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/arkiv/entities/{entity_key}` — **P11**, `network:read`; request `path key; query chain_id` → `ArkivEntityProjection` (200).
- `POST /v1/network/verifications` — **P11**, `network:review`; request `VerifyNetworkEvidence{task_id,result_ref_id,expected_digest,policy_version}` → `Operation{kind:"network_verify"}` (202).
- `GET /v1/network/verifications/{verification_id}` — **P11**, `network:review`; request `path ID` → `NetworkVerification{chain_status,cryptographic_status,science_status}` (200).

**Loading, empty, invalid and recovery states:** Public proof without bytes -> cannot verify science; chain unavailable -> unknown; invalid signer -> fail.

**Required screen acceptance test:** A verifier relying on ORCA REST alone is not an independence test; separate standalone client required.

**Frontend tests (implement, do not assume passed):** `N10-01` renders loading/true-empty correctly; `N10-02` denies restricted controls and direct-route access; `N10-03` binds valid server data without invented defaults; `N10-04` handles stated conflict/outage/expiry and accessible retry.

### 5.9 Marine companion & expanded features

<a id="screen-m01"></a>
#### M01 — Marine companion landing

**UI URL:** `/marine`  \
**Personas:** Fisherman, coastal public user.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Preserve original four surfaces and fast authoritative marine assistant entry.

**Visual layout:** White conversational starter left, geographic map centre, evidence/official warnings right, agent activity collapsed.

**User interactions:** Start conversation, check location conditions, open official warnings.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/conversations` — **P12**, `user:read`; request `cursor?,kind?` → `Page<Conversation>` (200).
- `GET /v1/marine/conditions` — **P12**, `marine:read`; request `lat,lon,valid_at?,source_policy?` → `MarineConditions` (200).
- `GET /v1/marine/warnings` — **P12**, `marine:read`; request `region?,kind?,valid_at?` → `Page<OfficialWarning>` (200).

**Loading, empty, invalid and recovery states:** P12 not released; user location absent; official warnings unavailable.

**Required screen acceptance test:** No wallet, ENS, Arkiv dependency for public marine queries.

**Frontend tests (implement, do not assume passed):** `M01-01` renders loading/true-empty correctly; `M01-02` denies restricted controls and direct-route access; `M01-03` binds valid server data without invented defaults; `M01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m02"></a>
#### M02 — Conversations library

**UI URL:** `/marine/conversations`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show resumable chats without mixing tenants or scientific observation memory.

**Visual layout:** Conversation list, new chat control, recent topics, user privacy access.

**User interactions:** Start chat; open; rename; feedback.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/conversations` — **P12**, `user:read`; request `cursor?,kind?` → `Page<Conversation>` (200).
- `POST /v1/conversations` — **P12**, `user:write`; request `CreateConversation{project_id?,mode,locale,retention_policy}` → `Conversation` (201).
- `GET /v1/conversations/{conversation_id}` — **P12**, `user:read`; request `path ID` → `Conversation` (200).
- `PATCH /v1/conversations/{conversation_id}` — **P12**, `user:write`; request `If-Match; PatchConversation{title?,archive?,locale?}` → `Conversation` (200).

**Loading, empty, invalid and recovery states:** Empty chats; unauthorized old chat; revoked user session.

**Required screen acceptance test:** Historical model messages are not scientific observations.

**Frontend tests (implement, do not assume passed):** `M02-01` renders loading/true-empty correctly; `M02-02` denies restricted controls and direct-route access; `M02-03` binds valid server data without invented defaults; `M02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m03"></a>
#### M03 — Conversation + response evidence

**UI URL:** `/marine/conversations/[conversationId]`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Render answer and map updates with source validity and explicit uncertainty.

**Visual layout:** Original four-pane responsive composition; visible evidence citations, official warning priority, activity stream.

**User interactions:** Send message; stream; open sources; submit feedback.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/conversations/{conversation_id}/messages` — **P12**, `user:write`; request `UserMessage{content,attachments?,geo_scope?,time_context?}` → `Operation{kind:"conversation_turn"}` (202).
- `GET /v1/conversations/{conversation_id}/messages` — **P12**, `user:read`; request `cursor?` → `Page<ConversationMessage>` (200).
- `GET /v1/conversations/{conversation_id}/events/stream` — **P12**, `user:read`; request `SSE cursor/Last-Event-ID` → `SSE<ConversationEvent>` (200).
- `POST /v1/conversations/{conversation_id}/feedback` — **P12**, `user:write`; request `ConversationFeedback{message_id,rating,category,comment?}` → `FeedbackReceipt` (201).

**Loading, empty, invalid and recovery states:** Partial streaming, unsupported source, stale warning, unsafe all-clear.

**Required screen acceptance test:** Agent activity shows tool actions, not hidden private chain-of-thought.

**Frontend tests (implement, do not assume passed):** `M03-01` renders loading/true-empty correctly; `M03-02` denies restricted controls and direct-route access; `M03-03` binds valid server data without invented defaults; `M03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m04"></a>
#### M04 — Marine map & environmental conditions

**UI URL:** `/marine/map`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** See authorized location-specific conditions with time and source.

**Visual layout:** Full map stage; context inspector with variable, valid-at, source, accuracy limitations; map/list alternatives.

**User interactions:** Change time/area, see wave/wind/current conditions.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/marine/conditions` — **P12**, `marine:read`; request `lat,lon,valid_at?,source_policy?` → `MarineConditions` (200).
- `GET /v1/marine/geofences` — **P12**, `marine:read`; request `bbox?,kind?,valid_at?` → `Page<MarineGeofence>` (200).

**Loading, empty, invalid and recovery states:** No source coverage, missing current location, model forecast mistaken for observation.

**Required screen acceptance test:** No unwarranted safe-to-fish recommendation.

**Frontend tests (implement, do not assume passed):** `M04-01` renders loading/true-empty correctly; `M04-02` denies restricted controls and direct-route access; `M04-03` binds valid server data without invented defaults; `M04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m05"></a>
#### M05 — Potential fishing zone & restrictions

**UI URL:** `/marine/fisheries`  \
**Personas:** Fisherman, fisheries analyst.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Show official PFZ products and applicable prohibited or restricted areas as separate evidence.

**Visual layout:** Zone/list map and advisory text with validity and source metadata.

**User interactions:** Show official PFZ; filter region; open geofence.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/marine/pfz` — **P12**, `marine:read`; request `region,bounds?,date?` → `PFZInformation` (200).
- `GET /v1/marine/warnings` — **P12**, `marine:read`; request `region?,kind?,valid_at?` → `Page<OfficialWarning>` (200).
- `GET /v1/marine/geofences` — **P12**, `marine:read`; request `bbox?,kind?,valid_at?` → `Page<MarineGeofence>` (200).

**Loading, empty, invalid and recovery states:** PFZ expired, zone not available, conflicting notices, incomplete region.

**Required screen acceptance test:** Do not invent PFZ polygons if official data inaccessible.

**Frontend tests (implement, do not assume passed):** `M05-01` renders loading/true-empty correctly; `M05-02` denies restricted controls and direct-route access; `M05-03` binds valid server data without invented defaults; `M05-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m06"></a>
#### M06 — Official hazard and warning centre

**UI URL:** `/marine/warnings`  \
**Personas:** All relevant users.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Aggregate authenticated official warnings with issuer, issue and valid times.

**Visual layout:** Warning list with strong readable severity text; region and source inspector; verified authority.

**User interactions:** Inspect warning; filter region; subscribe if permitted.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/marine/warnings` — **P12**, `marine:read`; request `region?,kind?,valid_at?` → `Page<OfficialWarning>` (200).
- `GET /v1/alerts/subscriptions` — **P12**, `alerts:subscribe`; request `cursor?` → `Page<AlertSubscription>` (200).

**Loading, empty, invalid and recovery states:** Warning source outage, expired notice, issuer unverified.

**Required screen acceptance test:** Never let AI output override an official active warning.

**Frontend tests (implement, do not assume passed):** `M06-01` renders loading/true-empty correctly; `M06-02` denies restricted controls and direct-route access; `M06-03` binds valid server data without invented defaults; `M06-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m07"></a>
#### M07 — Route exposure scenarios

**UI URL:** `/marine/routes`  \
**Personas:** Maritime operator, fisher user.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Compare environmental and geographic exposure on user route (advisory, non-certified navigation).

**Visual layout:** Route input/map, exposure overlay, assumptions/limitations and official warning strip.

**User interactions:** Submit route scenario; inspect restrictions.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/marine/geofences` — **P12**, `marine:read`; request `bbox?,kind?,valid_at?` → `Page<MarineGeofence>` (200).
- `POST /v1/marine/route-exposures` — **P12**, `marine:read`; request `RouteExposureRequest{waypoints,vessel_context,valid_window}` → `Operation{kind:"route_exposure"}` (202).

**Loading, empty, invalid and recovery states:** Route crosses restricted area; source missing; no safe route calculated.

**Required screen acceptance test:** No certification as navigation instructions.

**Frontend tests (implement, do not assume passed):** `M07-01` renders loading/true-empty correctly; `M07-02` denies restricted controls and direct-route access; `M07-03` binds valid server data without invented defaults; `M07-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m08"></a>
#### M08 — Alert subscriptions and notification inbox

**UI URL:** `/marine/alerts`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Manage opt-in official alerts separately from model research hypotheses.

**Visual layout:** Subscriptions table, scoped regions/channels, notification feed, acknowledgement.

**User interactions:** Subscribe; modify; delete; acknowledge notification.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/alerts/subscriptions` — **P12**, `alerts:subscribe`; request `cursor?` → `Page<AlertSubscription>` (200).
- `POST /v1/alerts/subscriptions` — **P12**, `alerts:subscribe`; request `CreateAlertSubscription{region,types,channel,quiet_hours?}` → `AlertSubscription` (201).
- `PATCH /v1/alerts/subscriptions/{subscription_id}` — **P12**, `alerts:subscribe`; request `If-Match; PatchAlertSubscription` → `AlertSubscription` (200).
- `DELETE /v1/alerts/subscriptions/{subscription_id}` — **P12**, `alerts:subscribe`; request `If-Match` → `—` (204).
- `GET /v1/alerts/notifications` — **P12**, `alerts:subscribe`; request `cursor?,unread?` → `Page<AlertNotification>` (200).
- `POST /v1/alerts/notifications/{notification_id}/ack` — **P12**, `alerts:subscribe`; request `AckNotification{ack_at}` → `AlertNotification` (200).

**Loading, empty, invalid and recovery states:** Delivery blocked, stale source, permission revoked, double ack.

**Required screen acceptance test:** Official warning delivery should not wait for chain transaction.

**Frontend tests (implement, do not assume passed):** `M08-01` renders loading/true-empty correctly; `M08-02` denies restricted controls and direct-route access; `M08-03` binds valid server data without invented defaults; `M08-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m09"></a>
#### M09 — Voice, language & accessibility

**UI URL:** `/marine/accessibility`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Provide multilingual input and accessible spoken results without changing scientific authority.

**Visual layout:** Language selector; record and playback controls; accessible textual equivalents.

**User interactions:** Transcribe; synthesize; change language preference.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `PATCH /v1/me/preferences` — **P12**, `user:write`; request `If-Match; PatchPreferences` → `UserPreferences` (200).
- `POST /v1/voice/transcriptions` — **P12**, `user:write`; request `AudioUploadRef{file_id,locale_hint,consent}` → `Operation{kind:"speech_to_text"}` (202).
- `POST /v1/voice/synthesis` — **P12**, `user:write`; request `TTSRequest{text,locale,voice_profile}` → `Operation{kind:"text_to_speech"}` (202).
- `GET /v1/localization/languages` — **P12**, `public`; request `—` → `Page<LanguageCapability>` (200).

**Loading, empty, invalid and recovery states:** Microphone denied, unsupported language, voice service outage.

**Required screen acceptance test:** Always provide text fallback; label synthesized voice not official authority.

**Frontend tests (implement, do not assume passed):** `M09-01` renders loading/true-empty correctly; `M09-02` denies restricted controls and direct-route access; `M09-03` binds valid server data without invented defaults; `M09-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-m10"></a>
#### M10 — User memory & privacy controls

**UI URL:** `/marine/privacy`  \
**Personas:** User.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Let user see and remove permitted application memory without treating it as actual observations.

**Visual layout:** Memory rows with kind, source, creation and Delete confirmation; explicit retained compliance records.

**User interactions:** Read saved memory; delete selected item; inspect privacy scope.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/me/preferences` — **P12**, `user:read`; request `—` → `UserPreferences` (200).
- `GET /v1/me/memory` — **P12**, `user:read`; request `cursor?,type?` → `Page<VisibleMemory>` (200).
- `DELETE /v1/me/memory/{memory_id}` — **P12**, `user:write`; request `If-Match` → `—` (204).

**Loading, empty, invalid and recovery states:** Memory plane not exposed to user; delete denied by legal hold; no entries.

**Required screen acceptance test:** Memory is provenance-labeled; no UI fabricated ability to edit unsupported planes.

**Frontend tests (implement, do not assume passed):** `M10-01` renders loading/true-empty correctly; `M10-02` denies restricted controls and direct-route access; `M10-03` binds valid server data without invented defaults; `M10-04` handles stated conflict/outage/expiry and accessible retry.

### 5.10 Model & monitoring lab

<a id="screen-l01"></a>
#### L01 — Model registry

**UI URL:** `/org/[orgId]/models`  \
**Personas:** Authorized model operator.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inventory approved ML/LLM models with task coverage, version and evaluations.

**Visual layout:** Model table: purpose, dataset rights, validation state, deployment availability.

**User interactions:** Register model; open model; inspect evaluation.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/research/model-registry` — **P12**, `model:operate`; request `domain?,kind?,cursor?` → `Page<ModelRecord>` (200).
- `POST /v1/research/model-registry` — **P12**, `model:operate`; request `RegisterModel{provider,version,digest,approved_scopes}` → `ModelRecord` (201).
- `GET /v1/research/model-registry/{model_id}` — **P12**, `model:operate`; request `path ID` → `ModelRecord` (200).

**Loading, empty, invalid and recovery states:** Unreviewed model, unsupported training backend, expired dataset rights.

**Required screen acceptance test:** Model registered does not imply scientifically validated.

**Frontend tests (implement, do not assume passed):** `L01-01` renders loading/true-empty correctly; `L01-02` denies restricted controls and direct-route access; `L01-03` binds valid server data without invented defaults; `L01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-l02"></a>
#### L02 — Model evaluation suite

**UI URL:** `/org/[orgId]/models/evaluations`  \
**Personas:** Model operator, research lead.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Run scientific and agent-policy benchmark comparisons with frozen test sets.

**Visual layout:** Evaluation form, dataset split/time cutoff, metric table and unknown limitations.

**User interactions:** Submit evaluation; inspect result.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/model-evaluations` — **P12**, `model:operate`; request `ModelEvalRequest{model_version_id,benchmark_id,budget,as_of_policy}` → `Operation{kind:"model_evaluate"}` (202).
- `GET /v1/research/model-evaluations/{evaluation_id}` — **P12**, `model:operate`; request `path ID` → `ModelEvaluation` (200).

**Loading, empty, invalid and recovery states:** Unapproved benchmark, data leakage, failed run, incomplete metrics.

**Required screen acceptance test:** Do not claim improvement without held-out experimental evidence.

**Frontend tests (implement, do not assume passed):** `L02-01` renders loading/true-empty correctly; `L02-02` denies restricted controls and direct-route access; `L02-03` binds valid server data without invented defaults; `L02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-l03"></a>
#### L03 — Training jobs

**UI URL:** `/org/[orgId]/models/training`  \
**Personas:** Model operator.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Supervise approved fine-tuning/model training providers and budgets.

**Visual layout:** Training job form, eligible model/dataset limits, job progress and cancel confirmation.

**User interactions:** Start job; monitor; cancel safe job.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/training-jobs` — **P12**, `model:operate`; request `TrainingJobRequest{dataset_ref,model_version,method,safety_policy,budget}` → `Operation{kind:"training"}` (202).
- `GET /v1/research/training-jobs/{training_job_id}` — **P12**, `model:operate`; request `path ID` → `TrainingJob` (200).
- `POST /v1/research/training-jobs/{training_job_id}/cancel` — **P12**, `model:operate`; request `{reason}` → `Operation{kind:"training_cancel"}` (202).

**Loading, empty, invalid and recovery states:** Provider unavailable, dataset rights, over budget, cancellation race.

**Required screen acceptance test:** Do not present 0G RL or unsupported models as available by default.

**Frontend tests (implement, do not assume passed):** `L03-01` renders loading/true-empty correctly; `L03-02` denies restricted controls and direct-route access; `L03-03` binds valid server data without invented defaults; `L03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-l04"></a>
#### L04 — Scientific diagnostics and variable explorer

**UI URL:** `/org/[orgId]/science/diagnostics`  \
**Personas:** Researcher, data scientist.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect expanded variables and scientific diagnostics after each new method passes gate.

**Visual layout:** Variable list; method controls; diagnostic results and source validity.

**User interactions:** Browse variables; run diagnostic; inspect job.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/science/variables` — **P12**, `dataset:read`; request `family?,cursor?` → `Page<MarineVariable>` (200).
- `POST /v1/science/diagnostics` — **P12**, `research:run`; request `DiagnosticRequest{method_id,inputs,scope,time_window}` → `Operation{kind:"diagnostic"}` (202).
- `GET /v1/science/diagnostics/{diagnostic_id}` — **P12**, `research:run`; request `path ID` → `DiagnosticResult` (200).

**Loading, empty, invalid and recovery states:** Unsupported variable, no source data, method failed/unknown.

**Required screen acceptance test:** Each additional science method separately tested, not enabled by broad P12 completion alone.

**Frontend tests (implement, do not assume passed):** `L04-01` renders loading/true-empty correctly; `L04-02` denies restricted controls and direct-route access; `L04-03` binds valid server data without invented defaults; `L04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-l05"></a>
#### L05 — Research monitoring jobs

**UI URL:** `/org/[orgId]/research/monitors`  \
**Personas:** Researcher/PI.  **Highest referenced API gate:** P12 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Create controlled recurring analyses over authorized sources and notify when valid criteria change.

**Visual layout:** Monitor list with period, source/method, last scientific result, next evaluation and pause state.

**User interactions:** Create; modify; pause; inspect evaluations.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/research/monitoring-jobs` — **P12**, `research:run`; request `CreateMonitoringJob{project_id,metric,source_policy,schedule,alert_policy}` → `MonitoringJob` (201).
- `GET /v1/research/monitoring-jobs` — **P12**, `project:read`; request `project_id?,cursor?` → `Page<MonitoringJob>` (200).
- `PATCH /v1/research/monitoring-jobs/{job_id}` — **P12**, `research:run`; request `If-Match; PatchMonitoringJob` → `MonitoringJob` (200).
- `POST /v1/research/monitoring-jobs/{job_id}/pause` — **P12**, `research:run`; request `If-Match; {reason}` → `MonitoringJob` (200).
- `GET /v1/research/monitoring-jobs/{job_id}/evaluations` — **P12**, `project:read`; request `cursor?` → `Page<MonitoringEvaluation>` (200).

**Loading, empty, invalid and recovery states:** No new data, source outage, stale detection, paused.

**Required screen acceptance test:** Monitoring is distinct from official warning issuance.

**Frontend tests (implement, do not assume passed):** `L05-01` renders loading/true-empty correctly; `L05-02` denies restricted controls and direct-route access; `L05-03` binds valid server data without invented defaults; `L05-04` handles stated conflict/outage/expiry and accessible retry.

### 5.11 Platform operations

<a id="screen-o01"></a>
#### O01 — System capability and readiness

**UI URL:** `/admin/system`  \
**Personas:** Platform operator.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Make release and dependency health visible without exposing secrets.

**Visual layout:** Release profile, gate status, DB/worker/source/A2A/ENS/Arkiv health split; no decorative green all-clear.

**User interactions:** Inspect status; open ops traces and source health.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /livez` — **P01**, `public`; request `—` → `{status:"alive"}` (200).
- `GET /readyz` — **P01**, `ops/readiness`; request `—` → `ReadinessReport{components,release_profile,blocked_gates}` (200).
- `GET /v1/meta` — **P01**, `public`; request `—` → `APIMetadata{revision,release_profile,enabled_capabilities}` (200).
- `GET /openapi.json` — **P01**, `docs-policy`; request `—` → `OpenAPI31Document` (200).
- `GET /v1/operations/{operation_id}` — **P08**, `operation:read`; request `path operation_id` → `Operation` (200).
- `GET /v1/operations` — **P08**, `ops:read`; request `query state?,kind?,cursor?,limit?` → `Page<Operation>` (200).

**Loading, empty, invalid and recovery states:** Readyz 503, capability designed-only, no live provider.

**Required screen acceptance test:** System alive never implies scientifically ready.

**Frontend tests (implement, do not assume passed):** `O01-01` renders loading/true-empty correctly; `O01-02` denies restricted controls and direct-route access; `O01-03` binds valid server data without invented defaults; `O01-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-o02"></a>
#### O02 — Source and connector operations

**UI URL:** `/admin/sources`  \
**Personas:** Platform operator/data steward.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect active source adapters, probe errors, licenses and data rights.

**Visual layout:** Source health table, refresh/retry reason, rights and snapshot version inspector.

**User interactions:** Review source failures; run bounded probe; inspect licensing.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `POST /v1/catalog/source-probes` — **P03**, `source:manage`; request `ProbeRequest{provider_id,distribution_id,region,time_window,limits}` → `Operation{kind:"source_probe"}` (202).
- `GET /v1/admin/source-health` — **P08**, `source:manage`; request `provider_id?` → `Page<SourceHealth>` (200).
- `GET /v1/admin/data-rights` — **P08**, `source:manage`; request `cursor?,product_id?` → `Page<DataRightsRecord>` (200).

**Loading, empty, invalid and recovery states:** Connector failure, 429, no rights, source metadata changed.

**Required screen acceptance test:** No privileged raw provider payload or secret in logs/UI.

**Frontend tests (implement, do not assume passed):** `O02-01` renders loading/true-empty correctly; `O02-02` denies restricted controls and direct-route access; `O02-03` binds valid server data without invented defaults; `O02-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-o03"></a>
#### O03 — Durable queue and job health

**UI URL:** `/admin/jobs`  \
**Personas:** Platform operator.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Identify stuck jobs, leases, retries, unsafe duplicate completion and utilization.

**Visual layout:** Worker queue metrics, attempt state, recovery checklist, sanitized job identifiers.

**User interactions:** Inspect operation; triage; view retries and SLA budget.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/operations/{operation_id}` — **P08**, `operation:read`; request `path operation_id` → `Operation` (200).
- `GET /v1/operations` — **P08**, `ops:read`; request `query state?,kind?,cursor?,limit?` → `Page<Operation>` (200).
- `GET /v1/admin/job-health` — **P08**, `ops:read`; request `queue?,since?` → `JobHealthSummary` (200).

**Loading, empty, invalid and recovery states:** Worker death, lease expiration, fencing stale, budget exhaustion.

**Required screen acceptance test:** No duplicate rerun button unless specifically designed in API; recovery via run endpoints and policy.

**Frontend tests (implement, do not assume passed):** `O03-01` renders loading/true-empty correctly; `O03-02` denies restricted controls and direct-route access; `O03-03` binds valid server data without invented defaults; `O03-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-o04"></a>
#### O04 — Retention, archive & impact preview

**UI URL:** `/admin/retention`  \
**Personas:** Platform operator, auditor.  **Highest referenced API gate:** P08 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Preview legal and scientific retention impact before destructive changes.

**Visual layout:** Policy list, affected project/object counts if safe, preview diff and immutable evidence constraints.

**User interactions:** Preview retention action; inspect legal hold impact.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/admin/retention` — **P08**, `ops:read`; request `org_id?` → `RetentionPolicyView` (200).
- `POST /v1/admin/retention/preview` — **P08**, `ops:read`; request `RetentionPreviewRequest{scope,as_of}` → `RetentionImpact` (200).

**Loading, empty, invalid and recovery states:** Hold prevents deletion; preview truncated; user rights denied.

**Required screen acceptance test:** No execute-retention endpoint in current contract: UI is preview-only.

**Frontend tests (implement, do not assume passed):** `O04-01` renders loading/true-empty correctly; `O04-02` denies restricted controls and direct-route access; `O04-03` binds valid server data without invented defaults; `O04-04` handles stated conflict/outage/expiry and accessible retry.

<a id="screen-o05"></a>
#### O05 — Arkiv indexer operations

**UI URL:** `/admin/arkiv`  \
**Personas:** Platform operator.  **Highest referenced API gate:** P11 (all called API phases must pass; P09–P11 federation is optional release).  \
**User outcome:** Inspect public read-model freshness, in-flight chain writes and reconciliation.

**Visual layout:** Status table with entity type, chain, submitted/confirmed/indexed, expired and retry state.

**User interactions:** Inspect indexer; submit reconciliation request if authorized.

**Actual designed backend calls (exact method + path; see `api design.md` §3):**
- `GET /v1/network/arkiv/transactions/{transaction_id}` — **P11**, `network:read`; request `path tx ID` → `ChainTransactionStatus` (200).
- `POST /v1/network/arkiv/reconciliation-requests` — **P11**, `ops:read`; request `ReconcileRequest{entity_key?,tx_hash?}` → `Operation{kind:"arkiv_reconcile"}` (202).
- `GET /v1/network/arkiv/indexer-status` — **P11**, `ops:read`; request `—` → `IndexerStatus{block,height,lag,last_error}` (200).

**Loading, empty, invalid and recovery states:** Testnet reset, delayed indexer, duplicate nonce, expired entity.

**Required screen acceptance test:** Arkiv coordination errors must not block local scientific read path.

**Frontend tests (implement, do not assume passed):** `O05-01` renders loading/true-empty correctly; `O05-02` denies restricted controls and direct-route access; `O05-03` binds valid server data without invented defaults; `O05-04` handles stated conflict/outage/expiry and accessible retry.

## 6. High-fidelity text wireframes (strict white visual direction)

The following are **layout blueprints**, not placeholder screenshots. Use real values only after the relevant gate; text is structural and synthetic where illustrative. Avoid decorative icons, colored borders, shadow-heavy cards, giant mock statistics, or arbitrary hero illustrations.

### 6.1 Institutional overview / PI

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ ORCA   [Institution ▼]   [Project ▼]                          Help   Profile        │
├───────────────────────┬───────────────────────────────────────────────────────────┤
│ OVERVIEW              │ Institution / Overview                            [New study]│
│ RESEARCH              │ [Affiliation: pending verification] [Sources: 2 unavailable] │
│  Projects             │                                                           │
│  Investigations       │ Active investigations │ Awaiting review │ Source issues      │
│  Evidence             │ (only authorized & measured values; unknown != zero)        │
│ DATA & METHODS        │                                                           │
│ AGENTS                │ Attention required                                        │
│ NETWORK               │ [Study lacks baseline]  [Review requires evidence grant]  │
│ SETTINGS              │                                                           │
│                       │ Recent investigations                                    │
│                       │ Study / Project / Source time / Status / Open             │
│                       │ --------------------------------------------------------  │
│                       │ Project directory | Upcoming permitted actions            │
└───────────────────────┴───────────────────────────────────────────────────────────┘
```

### 6.2 Research Studio / map and evidence

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ORCA | Institute | Project / Study 0042                     [Run] [Export] [Review]            │
├───────────────────────┬────────────────────────────────────────────┬─────────────────────────────┤
│ Study                 │ Ocean map [Map] [Chart] [Table]             │ Evidence inspector          │
│ - Question            │ [Variable ▼] [Time ▼] [Depth ▼] [Layer ▼]   │ Source & Product version    │
│ - Polygon / time      │                                            │ Observation / valid clock   │
│ - Method / baseline   │           ACTUAL AUTHORIZED DATA           │ QC flags & masked samples   │
│ - Approved recipe     │           (or clear empty state)           │ Coverage and uncertainty    │
│ - Input snapshots     │                                            │ Scientific claim status     │
│                       │                                            │ Method & artifact hashes    │
├───────────────────────┴────────────────────────────────────────────┴─────────────────────────────┤
│ Task graph | Input fetch → QC → Alignment → Calculation → Reproduction / review                 │
│ Events: [timestamp] [stage] [result] [retry/cancel details]                                      │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 Institution-controlled agent onboarding wizard

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ ORCA > Institution > Agents > New                                        Exit │
├───────────────────────────────────────────────────────────────────────────────┤
│ Register research capability                                                  │
│ 1 Mode → 2 Identity → 3 Capabilities → 4 Endpoint → 5 ENS → 6 Wallet           │
│                     → 7 Validation → 8 Publish                                │
│                                                                               │
│ [Step title]                                                                  │
│ [Human explanation and what is shared publicly]                               │
│                                                                               │
│ Field                                      [value________________________]     │
│ Field                                      [value________________________]     │
│                                                                               │
│ Checks / blocked reasons        [separate technical / identity / scientific] │
│                                                                               │
│ [Back]                                          [Save permitted draft] [Next] │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 ENS identity and Arkiv authorization

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Institution / Agent / Identity            [Institution credential: unverified/pending]    │
├──────────────────────────────────┬──────────────────────────────────────────────────────┤
│ ENS name                         │ Cross-network authorization                           │
│ ENS chain / resolver             │ ENS controller ──signed binding──> Arkiv wallet       │
│ Endpoint record (A2A)            │                              └──> A2A service key   │
│ Delegated rights (resolver)      │ Challenge nonce / scope / expiry / revocation         │
│ [Update record] [Revoke rights]  │ [Issue challenge] [Submit binding] [Verify]           │
├──────────────────────────────────┴──────────────────────────────────────────────────────┤
│ Tests: authorized record update | sibling denial | revoked update denied              │
│ Each state is traceable to an actual chain transaction / verified binding.             │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 Arkiv task coordination and independent claims

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Network / Open tasks         [Capability ▼] [Region ▼] [Status ▼]    [Publish task]      │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Task ID | Capability | Public region | Owner | Expires at | Arkiv indexed as-of         │
│ --------------------------------------------------------------------------------------- │
│ [Task selected]                                                                         │
│ Task metadata (public only) | Research eligibility | External deadline                 │
│ Claims: Wallet A (submitted) | Wallet B (submitted) | Selected: none                    │
│ Assignment: requester decides explicitly                                                │
│ A2A dispatch: not started | scientific result: not submitted                            │
│ Chain states: tx submitted / confirmed / indexed (different labels)                     │
│ [Claim] [Requester: assign] [Details]                                                    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.6 Scientific original vs reproduction vs review

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Artifact / Scientific review                         [Reproduce] [Challenge]           │
├────────────────────────────────────────┬─────────────────────────────────────────────────┤
│ Original submitted result              │ Independent reproduced result                    │
│ Source/version/time/depth              │ Source/version/time/depth                         │
│ Method / baseline / sample weights     │ Method / baseline / sample weights                │
│ Observed numeric claim                 │ Recomputed numeric outcome                        │
│ Validity: unsupported/pending          │ Reproduction: match / mismatch / blocked          │
├────────────────────────────────────────┴─────────────────────────────────────────────────┤
│ Discrepancies: methodology | units | wrong season | missing QC | temporal mismatch    │
│ Cryptographic authenticity: separate state   Institutional authority: separate state  │
│ Scientific verdict: separate state          Reviewer judgement: separate state        │
│ [Submit review] [Request correction] [Export permitted evidence]                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.7 Marine Companion retains original four surfaces

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ORCA Marine Companion     [Location] [Language]                  [Official warnings]    │
├───────────────────┬──────────────────────────────────────┬──────────────────────────────┤
│ Conversation      │ Marine Map                           │ Evidence + Official Sources │
│                  │                                      │                              │
│ User question     │ Authorized layers / source times     │ Product / issue / valid times│
│ Answer with cite  │ (or explicit no coverage)           │ Warning authority            │
│ Input / Voice     │ Time / depth / legend               │ Claim uncertainty            │
├───────────────────┴──────────────────────────────────────┴──────────────────────────────┤
│ Agent activity = factual tool/source execution only; no hidden reasoning disclosure      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.8 Audit, quota and operations

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Institution / Governance        [Audit] [Usage] [Quotas] [Source health] [Retention]    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Filters: Actor | Project | Resource | Event type | Time | Access decision              │
│ Event time    Actor              Action             Resource         Decision              │
│ ------------- ------------------ ------------------ ---------------- ------------------  │
│ Protected evidence stays redacted | current role gates apply                              │
│                                                                              [Details]  │
│ Quota writes use ETags / source entitlement cannot be overridden                         │
│ Retention changes: PREVIEW ONLY until separately contracted execution endpoint exists   │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 6.9 Responsive behavior

| Width | Institution | Research Studio | Network/Review |
|---|---|---|---|
| ≥1280px | Fixed 236px sidebar, flexible tables | Three-pane canvas; bottom activity drawer | Wide table, optional detail inspector |
| 768–1279px | Collapsible sidebar, one context switcher | Left source/plan panel as drawer; inspector tab | Table with horizontally scrollable columns and row summary |
| <768px | Bottom/nav drawer; project selector stacked | Map/chart/table and evidence as sequential tabs, not hidden data | Task rows as labelled groups, verification as separate accessible steps |

**Keyboard-only:** map context can be represented as a focused result table, with accessible region/time filters; Escape closes drawers, arrow keys move supported tabs, focus restored after modal close; error summary jumps to invalid control. No hover-only controls.

## 7. Interactive workflows and confirmation rules

### 7.1 Investigation: question → reproducible scientific report

**F01 → I02/I04 → R02 → D03/D06/D09 → R04 → R05/R06 → R07/R08/R09 → V02/V04 → R11/R12.** The researcher must select exact approved method, time, region, historical product version and baseline. The new investigation is a draft until a plan is approved with its digest. A run is created only after `approve` succeeds and the specified source is scientifically compatible. SSE renders durable stage facts, and the UI can recover by polling GET after connection loss. The result may be `insufficient_evidence` and may produce no visualization. Report publication is a separate role-checked action.

**Form steps:** (1) project/intent, (2) geometry/time, (3) source product/baseline, (4) method/quality, (5) expected output/uncertainty, (6) plan/approval, (7) run/monitor. Reject accidental draft mutation after plan approved; force explicit new version.

### 7.2 Independent agent onboarding: one organization owns one capability

**A02 → A03 → A04 → A05 → A06 → E01/E02/E03/E04/E05 (optional/required by federation profile) → A07/A08 → A09.** Type of provider determines prerequisites: (a) ORCA-hosted logical tool, (b) institution-operated A2A service, or (c) data/MCP service without its own LLM. In current `api design.md`, not every hosted/MCP-only implementation behavior has a dedicated route. Such steps are *capability-gated/provisional* until backend DTOs and runtime semantics are approved.

**8 canonical wizard steps:**

1. **Mode** — Choose supported host/remote/tool-only path and show what is actually available.
2. **Organization and technical identity** — Bind to member-owned organization; affiliation assertion is unverified until credential decision.
3. **Capabilities** — Declare methods, outputs, input schema, geographic and temporal coverage, limitations and quota expectations.
4. **Endpoint / Agent Card** — Validate HTTPS/A2A card/credential and SSRF restrictions; store secrets server-side only.
5. **ENSv2 (where enabled)** — Resolve and configure name and resolver-scoped authority; demonstrate permitted vs denied update.
6. **Arkiv wallet binding (where enabled)** — Issue nonce challenge, sign with permitted controller/wallet, verify cross-chain binding and revocation.
7. **Technical + science + legal checklist** — Reachability is not scientific competence; inspect data rights and independent evidence expectation.
8. **Publish / activate** — Display exact public fields, verify prerequisites, prevent duplicate create and surface statuses.

**No silent wallet custody:** operator signs through an appropriate wallet or server-managed institutional signing workflow; client never pastes a wallet secret into a form. Pending chain writes are not successful permissions until confirmed.

### 7.3 ENS permission grant → endpoint update → revoke

Resolve named agent → inspect resolver scope → grant scoped capability with transaction intent → wait for confirm → operator changes only its allowed record → resolve again → revoke permission → demonstrate later denied update. Failed sibling-name access is an explicit test case. UI displays **name resolution**, **chain ownership**, **institution verification**, and **service authentication** as separate results.

### 7.4 Arkiv task → independently owned claims → assignment → evidence

Requester publishes a **minimized public** Arkiv task; independent provider wallet queries it and creates a separately owned claim; requester explicitly selects an eligible provider; dispatch uses authenticated native A2A, not an Arkiv message or fake REST command; provider publishes public result reference and permitted evidence hash; another validator independently reviews and publishes its own reference. Raw confidential data and exact sensitive geometry never appear in public Arkiv entities.

Keep `tx submitted`, `confirmed`, `indexed`, `expired`, `unavailable` separate from `scientifically reproduced`, `scientifically supported`, `institutional authority verified`. Two agents may claim same task; they do not both become assigned automatically. One task assignment has explicit final selection policy.

### 7.5 Scientific challenge / correction protocol

The reviewer selects exact artifact/version and records discrepancy category (unit, time, depth, seasonal baseline, QC, coverage, formula, provenance, independence or other). The original finding is immutable in the research history; a correction creates a new version and points to the prior result. A confirmed Arkiv hash proves only integrity/ownership, not scientific truth. If original inputs are inaccessible, the verdict must say `not reproducible with available evidence`, not `verified`.

### 7.6 Official marine warnings and public user flows

Marine companion screen keeps conversation, map, evidence and factual agent activity synchronized. Warning cards always show issuer, issue/valid times and source. When the provider is unavailable: label source unavailable; never fabricate all-clear or route safety. Normal official warnings/conditions do not wait for ENS or Arkiv. Route exposure is a scenario comparison and not certified navigation. Voice is optional and text-first fallback required.

### 7.7 Common mutation confirmation rules

| Mutation | Required frontend protection | Exact backend prerequisite |
|---|---|---|
| Create project/agent/task | One Idempotency-Key per attempt; disable duplicate submits; show committed resource only on 201/202 | P02/P09/P11 |
| Edit project/agent/policy | Capture resource ETag; send If-Match; on 412 show conflict/reload/diff | P02/P09 |
| Approve recipe | Show method/version/source/baseline/digest before confirming; 409/422 never treated as success | P04–P05 |
| Start/cancel/retry run | Display actual Operation/Run; reconcile after timeout; cancel race visible | P05 |
| Grant or revoke access | Show principal/resources/scopes/expiry, never last admin; recheck effective grants | P02 |
| Publish science report | Show outstanding uncertainty/review status and explicit confirmation | P06 |
| Issue ENS transaction | Show network/resolver/gas/subject/permission; pending/confirmed/failed states | P10 |
| Create Arkiv public record | Show **exact public attributes** and TTL, rights/privacy warning, wallet binding | P11 |
| Delete memory/subscription | Explicit user confirmation, distinguish deletion from legal retention | P12 |
| Retention preview | Never imply destructive execution; current API only previews | P08 |

## 8. Shared components, frontend folders and state ownership

### 8.1 Recommended Next.js application structure

```text
apps/web/
  src/
    app/
      (entry)/{page.tsx,auth/callback/page.tsx,workspaces/page.tsx,invites/[token]/page.tsx,account/page.tsx}
      (institution)/org/[orgId]/{overview,projects,research,data,science,agents,identity,models,settings}/...
      (federation)/network/{agents,tasks,results,reviews,arkiv,investigations}/...
      (verification)/verify/[publicRef]/page.tsx
      (marine)/marine/{conversations,map,fisheries,warnings,routes,alerts,accessibility,privacy}/...
      (ops)/admin/{system,sources,jobs,retention,arkiv}/...
    components/
      shell/{Sidebar,Topbar,OrgSwitcher,ProjectSwitcher,CapabilityGate,Breadcrumbs}.tsx
      primitives/{Button,Input,Select,Table,EmptyState,ErrorState,StatusText,Modal,Drawer,DateTime}.tsx
      organization/{InstitutionSummary,MemberTable,PolicyForm,AccessGrantEditor,QuotaTable,AuditTimeline}.tsx
      projects/{ProjectList,ProjectEditor,FileUpload,FileVersions,ProjectMemberTable}.tsx
      catalog/{ProviderTable,ProductFilters,DatasetQualityProfile,SourceClock,VersionPicker,CompatibilityPanel}.tsx
      science/{RecipeEditor,MethodDetail,GeoTimeSelector,QCCoverageTable,ScientificQuantity}.tsx
      investigations/{InvestigationComposer,PlanDigest,DurableRunTable,TaskGraph,SSEActivity,CostView}.tsx
      visualization/{MarineMap,LayerSelector,TimeSlider,DepthSelector,ScientificChart,DataTableFallback}.tsx
      evidence/{ArtifactSummary,LineageGraph,ClaimTable,ReportPreview,ExportManifest}.tsx
      review/{ReproductionPanel,ScientificDiff,ChallengeForm,ReviewForm,HistoricalReplay}.tsx
      agents/{AgentDirectory,OnboardingStepper,CapabilityBuilder,EndpointCheck,ProviderHealth}.tsx
      identity/{ENSNameTree,PermissionMatrix,WalletBinding,CredentialDecision,RevocationView}.tsx
      network/{ArkivTaskTable,ClaimList,AssignmentPanel,A2ASessionTimeline,PublicReview,ChainReceipt}.tsx
      marine/{ChatLayout,MarineConditionLayer,OfficialWarningCard,SubscriptionEditor,VoiceControls}.tsx
      models/{ModelRegistry,TrainingJob,EvaluationTable,MonitoringJob}.tsx
      operations/{JobHealth,SourceHealth,RetentionPreview,IndexerStatus}.tsx
    lib/
      api/{client.ts,problem.ts,openapi.ts,typed-routes.ts}
      auth/{oidc-client.ts,claims.ts,route-guards.ts}
      context/{org-scope.ts,project-scope.ts,capability.ts}
      queries/{query-keys.ts,invalidation.ts,scope.ts}
      streaming/{sse.ts,replay.ts,resync.ts}
      uploads/{multipart.ts,checksum.ts}
      visualization/{geojson.ts,units.ts,scientific-color-scales.ts}
      forms/{schema.ts,errors.ts,drafts.ts}
      security/{redaction.ts,external-url.ts,download.ts}
    contracts/                      # generated only from approved OpenAPI/JSON Schema
    mocks/                          # P01 test-only frontend scenario harness, NEVER production imported
    tests/{unit,components,accessibility,contracts,journeys,security,e2e}/
  playwright.config.ts
  package.json
```

**Folder policy:** routes only compose typed components; all backend calls pass through generated OpenAPI client/ports; no duplicate handwritten DTOs; scientific formatting centralized; ENS/Arkiv direct keys never exposed as env variables in browser; developer mock server isolated under `mocks` and test builds only. Strongly type scientific `unknown`, absence and quality status.

### 8.2 Reusable component contract table

| Component | Inputs and responsibility | Tests |
|---|---|---|
| `CapabilityGate` | /v1/meta implemented/live_verified + authorized capability; chooses visible/disabled/hidden state | F01 access, feature-off, stale metadata |
| `OrganizationScope` | /v1/me and org/project membership; clears protected caches on switch | Cross-tenant cache isolation |
| `DataStatus` | Separates unknown/no observations/partial/error and source clock | Null ≠ 0; stale source warning |
| `ScientificQuantity` | Value/null, SI unit/precision policy, uncertainty/status | Kelvin conversion display; unknown properly labeled |
| `SourceClockPanel` | Observed/valid/issued/published/available/retrieved; timezone conversion | No conflating historical as-of |
| `ResearchRecipeForm` | Typed question, geometry/time/method/source/baseline/digest | 422 field path, wrong plan digest |
| `TaskGraph` | Typed states, event IDs, fenced attempts and retry reasons | Out-of-order duplicate event recovery |
| `SSEClient` | Last-Event-ID replay, token renewal, heartbeat, polling fallback | Reconnect/401/cursor expiry |
| `MapLayerDescriptor` | Actual authorized source/valid times/legend/QC; no fake tiles | Expired signed URL; empty layers |
| `ArtifactProvenance` | Versioned inputs/methods/digests and license controls | Private evidence redacted |
| `EvidenceStatusMatrix` | Hash/ownership/science/reviewer verdict as distinct columns | Hash valid but science invalid |
| `OnboardingStepper` | Stateful eight-step draft based on available P09/P10/P11 features | Blocked requirement, back/forward, refresh |
| `ENSScopedPermission` | Resolver-specific rights and chain-confirmed revocation | Denied sibling mutation, pending tx |
| `ArkivReceipt` | Chain id, entity key, owner, expiry and submitted/confirmed/indexed | Index lag and chain outage |
| `ClaimAssignmentTable` | Claim entity owner separated from requester-authorized assignment | Two claims one award, revoked provider |
| `ProblemAlert` | RFC9457 code/status/detail retryable and sanitized field paths | No internal path/token leakage |
| `ScopedUpload` | Multipart staging, checksum, abort, quarantine visibility | No partial artifact publication |
| `DownloadIntent` | Obtain short-lived authorized URL; expire and reissue | Access revoked, TTL expired |

## 9. Data fetching, streaming, caching, failure and security behavior

### 9.1 Client-to-server contract details

1. Use the **generated TypeScript client** from the P01 contract artifact. No arbitrary endpoints invented from UI needs. Response/DTOs follow `api design.md` §2, §4 and §5 exactly; backend enforces final authorization.
2. `GET` is cacheable in-memory only under keys including principal, organization, project, source entitlement, product version, selected depth/time and as-of where applicable. Clear on org switch and logout. Never cache bearer tokens or full private evidence in persistent web storage.
3. `POST` with side effects requires `Idempotency-Key` (per API §2.1). Keep the same key when recovering an uncertain response; do not create a new key merely because connection timed out.
4. `PATCH`/versioned mutations require `If-Match`; 412 triggers a genuine conflict screen, not silent overwrite. 428 prompts reload.
5. List pagination uses backend `Page<T>{items,next_cursor,page_size}`, not page-number assumptions or total count unless returned; query filters only when specified by endpoint contract.
6. Operations returning 202 are polled through their resource/`/v1/operations/{id}` when supported; UI never displays `completed` from a successful 202 alone.
7. 401 redirects to OIDC reauthentication with intended destination saved safely; 403 is permission denied; privacy-aware 404 avoids existence leaks; 410 cursor expiry requires resync; 424 denotes missing scientific dependency; 429/503 preserve Retry-After and bounded backoff.
8. Source dataset errors are not replaced by mocked results in production, and chain RPC failures do not block local scientific data access.

### 9.2 SSE and polling

For `GET /v1/research/investigations/{id}/events/stream` and the conversation stream when P12 is implemented: maintain authorized event `id` and monotonically apply sequence; deduplicate by event ID; persist last ID only for the currently authorized page session; reconnect with supported Last-Event-ID strategy; on `CURSOR_EXPIRED` perform fresh authorized GET of events, run state, task graph, costs and evidence before reconnecting. A connection gap is not successful completion. On token expiration renew through approved OIDC flow or reconnect with authenticated fetch-based SSE. Never append raw prompt secrets or chain signer payloads to telemetry.

### 9.3 Scientific time/space and display validity

GeoJSON WGS84 order `[lon,lat]`; validate polygon shape and antimeridian. Display source metadata timestamps separately (`observed_at`, `valid_at`, `issued_at`, `published_at`, `available_at`, `retrieved_at`) and never infer missing availability. Display depth in stated units. Use method-controlled QC thresholds and area weighting; frontend does **not** recompute authoritative scientific results beyond unit-aware presentation. For unknown uncertainty show **Unknown**, not 0; for missing result show **No supported scientific result**. Always label `observation`, `forecast`, `analysis`, and `historical reconstruction` distinctly.

### 9.4 Chain identity and privacy boundaries

ENS name resolution and institutional credential are different levels of trust. ENSv2 writes require confirmation. Arkiv Rabdi is a public testnet with expiring records; show real time/owner/chain states, never imply permanence. A2A provider Agent Card and endpoint may be malicious; frontend must display verified bindings but backend authenticates. The browser should not send confidential research, protected coordinates, arbitrary uploaded files or private API keys to Arkiv RPC. Keep signing inside deliberate wallet or controlled server flow, not hidden background UI. Independent public verifier must work without privileged ORCA private API for the relevant public chain verification test.

### 9.5 URL and filter design; no phantom backend endpoints

URL state is limited to non-secret tab, filter and selected item identifiers. Advanced cross-product search, all-tenant review inbox, institution onboarding approvals, specialized model metrics and task-progress dashboards need new explicit backend aggregation/filter contracts if the present 220 endpoints cannot serve them correctly. Until then, show bounded authorized lists or `Not available in this release`; never invent response fields or totals.

## 10. Complete 220-operation API-to-screen crosswalk

This is a **total coverage matrix** generated from the `api design.md` §3 inventory. Rows may point to several consuming screens; the first is the **primary owning screen**. Every method/path combination is an API **proposal**. UI route paths do not create server behavior. The checked mapping is for frontend handoff, not proof of functioning APIs.

| # | Gate | HTTP method and exact endpoint | Primary screen | Secondary screen(s) |
|---:|---|---|---|---|
| 1 | P01 | `GET /livez` | [O01](#screen-o01) | — |
| 2 | P01 | `GET /readyz` | [O01](#screen-o01) | — |
| 3 | P01 | `GET /v1/meta` | [F01](#screen-f01) | F05, I01, A02, O01 |
| 4 | P01 | `GET /openapi.json` | [O01](#screen-o01) | — |
| 5 | P08 | `GET /v1/operations/{operation_id}` | [O01](#screen-o01) | O03 |
| 6 | P08 | `GET /v1/operations` | [O01](#screen-o01) | O03 |
| 7 | P02 | `GET /v1/me` | [F01](#screen-f01) | F02, F03, F04, F05 |
| 8 | P02 | `GET /v1/organizations` | [F01](#screen-f01) | F03 |
| 9 | P02 | `POST /v1/organizations` | [F03](#screen-f03) | — |
| 10 | P02 | `GET /v1/organizations/{org_id}` | [I01](#screen-i01) | I07, A03 |
| 11 | P02 | `PATCH /v1/organizations/{org_id}` | [I07](#screen-i07) | — |
| 12 | P02 | `GET /v1/organizations/{org_id}/members` | [I08](#screen-i08) | — |
| 13 | P02 | `POST /v1/organizations/{org_id}/invitations` | [I08](#screen-i08) | — |
| 14 | P02 | `POST /v1/invitations/{token}/accept` | [F04](#screen-f04) | — |
| 15 | P02 | `PATCH /v1/organizations/{org_id}/members/{member_id}` | [I08](#screen-i08) | — |
| 16 | P02 | `DELETE /v1/organizations/{org_id}/members/{member_id}` | [I08](#screen-i08) | — |
| 17 | P02 | `GET /v1/organizations/{org_id}/policies` | [I03](#screen-i03) | I07 |
| 18 | P02 | `PATCH /v1/organizations/{org_id}/policies` | [I07](#screen-i07) | — |
| 19 | P02 | `GET /v1/organizations/{org_id}/access-grants` | [I09](#screen-i09) | — |
| 20 | P02 | `POST /v1/organizations/{org_id}/access-grants` | [I09](#screen-i09) | — |
| 21 | P02 | `DELETE /v1/organizations/{org_id}/access-grants/{grant_id}` | [I09](#screen-i09) | — |
| 22 | P02 | `GET /v1/research/projects` | [I01](#screen-i01) | I02, R01 |
| 23 | P02 | `POST /v1/research/projects` | [I02](#screen-i02) | I03 |
| 24 | P02 | `GET /v1/research/projects/{project_id}` | [I04](#screen-i04) | — |
| 25 | P02 | `PATCH /v1/research/projects/{project_id}` | [I04](#screen-i04) | — |
| 26 | P02 | `POST /v1/research/projects/{project_id}/archive` | [I04](#screen-i04) | — |
| 27 | P02 | `GET /v1/research/projects/{project_id}/members` | [I05](#screen-i05) | — |
| 28 | P02 | `POST /v1/research/projects/{project_id}/members` | [I05](#screen-i05) | — |
| 29 | P02 | `PATCH /v1/research/projects/{project_id}/members/{member_id}` | [I05](#screen-i05) | — |
| 30 | P02 | `DELETE /v1/research/projects/{project_id}/members/{member_id}` | [I05](#screen-i05) | — |
| 31 | P02 | `POST /v1/research/projects/{project_id}/uploads` | [I06](#screen-i06) | — |
| 32 | P02 | `POST /v1/research/uploads/{upload_id}/complete` | [I06](#screen-i06) | — |
| 33 | P02 | `GET /v1/research/uploads/{upload_id}` | [I06](#screen-i06) | — |
| 34 | P02 | `DELETE /v1/research/uploads/{upload_id}` | [I06](#screen-i06) | — |
| 35 | P02 | `GET /v1/research/projects/{project_id}/files` | [I06](#screen-i06) | — |
| 36 | P02 | `GET /v1/research/files/{file_id}` | [I06](#screen-i06) | — |
| 37 | P02 | `POST /v1/research/files/{file_id}/download-intents` | [I06](#screen-i06) | — |
| 38 | P03 | `GET /v1/catalog/providers` | [D01](#screen-d01) | — |
| 39 | P03 | `GET /v1/catalog/providers/{provider_id}` | [D01](#screen-d01) | — |
| 40 | P03 | `GET /v1/catalog/products` | [D02](#screen-d02) | R02 |
| 41 | P03 | `GET /v1/catalog/products/{product_id}` | [D03](#screen-d03) | — |
| 42 | P03 | `GET /v1/catalog/products/{product_id}/versions` | [D03](#screen-d03) | — |
| 43 | P03 | `GET /v1/catalog/products/{product_id}/versions/{version_id}` | [D04](#screen-d04) | — |
| 44 | P03 | `GET /v1/catalog/products/{product_id}/distributions` | [D03](#screen-d03) | D04 |
| 45 | P03 | `GET /v1/catalog/products/{product_id}/variables` | [D03](#screen-d03) | — |
| 46 | P03 | `GET /v1/catalog/products/{product_id}/coverage` | [D03](#screen-d03) | — |
| 47 | P03 | `GET /v1/catalog/products/{product_id}/licenses` | [D03](#screen-d03) | — |
| 48 | P03 | `POST /v1/catalog/products/{product_id}/fitness-checks` | [D03](#screen-d03) | D06 |
| 49 | P03 | `GET /v1/catalog/snapshots` | [D05](#screen-d05) | — |
| 50 | P03 | `GET /v1/catalog/snapshots/{snapshot_id}` | [D05](#screen-d05) | — |
| 51 | P03 | `GET /v1/catalog/snapshots/{snapshot_id}/manifest` | [D05](#screen-d05) | — |
| 52 | P03 | `POST /v1/catalog/snapshot-requests` | [D05](#screen-d05) | — |
| 53 | P03 | `GET /v1/catalog/snapshot-requests/{request_id}` | [D05](#screen-d05) | — |
| 54 | P03 | `POST /v1/catalog/source-probes` | [D07](#screen-d07) | O02 |
| 55 | P03 | `GET /v1/catalog/source-probes/{probe_id}` | [D07](#screen-d07) | — |
| 56 | P03 | `GET /v1/catalog/variable-definitions` | [D02](#screen-d02) | — |
| 57 | P03 | `POST /v1/catalog/compatibility-checks` | [D06](#screen-d06) | — |
| 58 | P04 | `GET /v1/science/methods` | [D08](#screen-d08) | — |
| 59 | P04 | `GET /v1/science/methods/{method_id}` | [D08](#screen-d08) | — |
| 60 | P04 | `GET /v1/science/methods/{method_id}/versions/{version}` | [D08](#screen-d08) | — |
| 61 | P04 | `GET /v1/science/recipe-templates` | [D09](#screen-d09) | — |
| 62 | P04 | `GET /v1/science/recipe-templates/{template_id}` | [D09](#screen-d09) | — |
| 63 | P04 | `POST /v1/science/recipe-validations` | [D09](#screen-d09) | R02 |
| 64 | P04 | `GET /v1/science/policies` | [D09](#screen-d09) | — |
| 65 | P04 | `GET /v1/science/quality-codebook` | [D09](#screen-d09) | — |
| 66 | P05 | `GET /v1/research/investigations` | [I01](#screen-i01) | I04, R01, V01 |
| 67 | P05 | `POST /v1/research/investigations` | [R02](#screen-r02) | — |
| 68 | P05 | `GET /v1/research/investigations/{investigation_id}` | [R03](#screen-r03) | — |
| 69 | P05 | `PATCH /v1/research/investigations/{investigation_id}` | [R04](#screen-r04) | — |
| 70 | P05 | `POST /v1/research/investigations/{investigation_id}/plans` | [R04](#screen-r04) | — |
| 71 | P05 | `GET /v1/research/investigations/{investigation_id}/plans` | [R04](#screen-r04) | — |
| 72 | P05 | `GET /v1/research/investigations/{investigation_id}/plans/{plan_id}` | [R04](#screen-r04) | — |
| 73 | P05 | `POST /v1/research/investigations/{investigation_id}/plans/{plan_id}/approve` | [R04](#screen-r04) | — |
| 74 | P05 | `POST /v1/research/investigations/{investigation_id}/runs` | [R05](#screen-r05) | — |
| 75 | P05 | `GET /v1/research/investigations/{investigation_id}/runs` | [R05](#screen-r05) | — |
| 76 | P05 | `GET /v1/research/investigations/{investigation_id}/runs/{run_id}` | [R05](#screen-r05) | — |
| 77 | P05 | `POST /v1/research/investigations/{investigation_id}/runs/{run_id}/cancel` | [R05](#screen-r05) | — |
| 78 | P05 | `POST /v1/research/investigations/{investigation_id}/runs/{run_id}/retry` | [R05](#screen-r05) | — |
| 79 | P05 | `GET /v1/research/investigations/{investigation_id}/events` | [R06](#screen-r06) | — |
| 80 | P05 | `GET /v1/research/investigations/{investigation_id}/events/stream` | [R06](#screen-r06) | — |
| 81 | P05 | `GET /v1/research/investigations/{investigation_id}/activity` | [R03](#screen-r03) | R06 |
| 82 | P05 | `GET /v1/research/investigations/{investigation_id}/outcome` | [R03](#screen-r03) | — |
| 83 | P05 | `GET /v1/research/investigations/{investigation_id}/task-graph` | [R06](#screen-r06) | — |
| 84 | P05 | `GET /v1/research/investigations/{investigation_id}/costs` | [R05](#screen-r05) | — |
| 85 | P06 | `GET /v1/research/investigations/{investigation_id}/artifacts` | [R08](#screen-r08) | R09, V01 |
| 86 | P06 | `GET /v1/research/artifacts/{artifact_id}` | [R08](#screen-r08) | R10 |
| 87 | P06 | `GET /v1/research/artifacts/{artifact_id}/manifest` | [R08](#screen-r08) | R10, V02 |
| 88 | P06 | `GET /v1/research/artifacts/{artifact_id}/lineage` | [R09](#screen-r09) | R10 |
| 89 | P06 | `GET /v1/research/artifacts/{artifact_id}/claims` | [R09](#screen-r09) | R10 |
| 90 | P06 | `GET /v1/research/claims/{claim_id}` | [R09](#screen-r09) | — |
| 91 | P06 | `GET /v1/research/investigations/{investigation_id}/map-layers` | [R07](#screen-r07) | — |
| 92 | P06 | `GET /v1/research/map-layers/{layer_id}` | [R07](#screen-r07) | — |
| 93 | P06 | `POST /v1/research/map-layers/{layer_id}/access` | [R07](#screen-r07) | — |
| 94 | P06 | `POST /v1/research/investigations/{investigation_id}/reports` | [R11](#screen-r11) | — |
| 95 | P06 | `GET /v1/research/investigations/{investigation_id}/reports` | [R11](#screen-r11) | — |
| 96 | P06 | `GET /v1/research/reports/{report_id}` | [R11](#screen-r11) | — |
| 97 | P06 | `POST /v1/research/reports/{report_id}/publish` | [R11](#screen-r11) | — |
| 98 | P06 | `POST /v1/research/investigations/{investigation_id}/exports` | [R12](#screen-r12) | — |
| 99 | P06 | `GET /v1/research/exports/{export_id}` | [R12](#screen-r12) | — |
| 100 | P06 | `POST /v1/research/exports/{export_id}/download-intents` | [R12](#screen-r12) | — |
| 101 | P06 | `GET /v1/research/investigations/{investigation_id}/evidence-summary` | [R03](#screen-r03) | R09 |
| 102 | P07 | `POST /v1/research/artifacts/{artifact_id}/reproductions` | [V02](#screen-v02) | — |
| 103 | P07 | `GET /v1/research/artifacts/{artifact_id}/reproductions` | [V02](#screen-v02) | — |
| 104 | P07 | `GET /v1/research/reproductions/{reproduction_id}` | [V02](#screen-v02) | — |
| 105 | P07 | `POST /v1/research/artifacts/{artifact_id}/reviews` | [V03](#screen-v03) | — |
| 106 | P07 | `GET /v1/research/artifacts/{artifact_id}/reviews` | [V01](#screen-v01) | V03 |
| 107 | P07 | `GET /v1/research/reviews/{review_id}` | [V03](#screen-v03) | — |
| 108 | P07 | `POST /v1/research/artifacts/{artifact_id}/challenges` | [V04](#screen-v04) | — |
| 109 | P07 | `GET /v1/research/artifacts/{artifact_id}/challenges` | [V04](#screen-v04) | — |
| 110 | P07 | `POST /v1/research/challenges/{challenge_id}/responses` | [V04](#screen-v04) | — |
| 111 | P07 | `POST /v1/research/challenges/{challenge_id}/resolve` | [V04](#screen-v04) | — |
| 112 | P07 | `POST /v1/research/investigations/{investigation_id}/historical-evaluations` | [V05](#screen-v05) | — |
| 113 | P07 | `GET /v1/research/investigations/{investigation_id}/historical-evaluations` | [V05](#screen-v05) | — |
| 114 | P07 | `GET /v1/research/historical-evaluations/{evaluation_id}` | [V05](#screen-v05) | — |
| 115 | P07 | `GET /v1/research/benchmarks` | [V06](#screen-v06) | — |
| 116 | P07 | `GET /v1/research/benchmarks/{benchmark_id}` | [V06](#screen-v06) | — |
| 117 | P08 | `GET /v1/organizations/{org_id}/audit-events` | [I11](#screen-i11) | — |
| 118 | P08 | `GET /v1/research/projects/{project_id}/access-decisions` | [I11](#screen-i11) | — |
| 119 | P08 | `GET /v1/organizations/{org_id}/usage` | [I01](#screen-i01) | I10 |
| 120 | P08 | `GET /v1/organizations/{org_id}/quotas` | [I10](#screen-i10) | — |
| 121 | P08 | `PATCH /v1/organizations/{org_id}/quotas` | [I10](#screen-i10) | — |
| 122 | P08 | `GET /v1/admin/source-health` | [O02](#screen-o02) | — |
| 123 | P08 | `GET /v1/admin/job-health` | [O03](#screen-o03) | — |
| 124 | P08 | `GET /v1/admin/retention` | [O04](#screen-o04) | — |
| 125 | P08 | `POST /v1/admin/retention/preview` | [O04](#screen-o04) | — |
| 126 | P08 | `GET /v1/admin/data-rights` | [O02](#screen-o02) | — |
| 127 | P09 | `GET /v1/network/agents` | [A01](#screen-a01) | N01 |
| 128 | P09 | `POST /v1/network/agents` | [A03](#screen-a03) | — |
| 129 | P09 | `GET /v1/network/agents/{agent_id}` | [A07](#screen-a07) | N01 |
| 130 | P09 | `PATCH /v1/network/agents/{agent_id}` | [A07](#screen-a07) | — |
| 131 | P09 | `POST /v1/network/agents/{agent_id}/suspend` | [A07](#screen-a07) | — |
| 132 | P09 | `GET /v1/network/agents/{agent_id}/capabilities` | [A04](#screen-a04) | A07 |
| 133 | P09 | `POST /v1/network/agents/{agent_id}/capabilities` | [A04](#screen-a04) | — |
| 134 | P09 | `PATCH /v1/network/agents/{agent_id}/capabilities/{capability_id}` | [A04](#screen-a04) | — |
| 135 | P09 | `GET /v1/network/agents/{agent_id}/endpoints` | [A05](#screen-a05) | A08 |
| 136 | P09 | `POST /v1/network/agents/{agent_id}/endpoints` | [A05](#screen-a05) | — |
| 137 | P09 | `POST /v1/network/agents/{agent_id}/endpoint-checks` | [A05](#screen-a05) | A08 |
| 138 | P09 | `GET /v1/network/agents/{agent_id}/health` | [A06](#screen-a06) | A08 |
| 139 | P09 | `POST /v1/network/discovery` | [A01](#screen-a01) | N01 |
| 140 | P09 | `GET /v1/network/provider-onboarding/{agent_id}/checklist` | [A02](#screen-a02) | A06 |
| 141 | P10 | `POST /v1/identity/ens/resolutions` | [E02](#screen-e02) | — |
| 142 | P10 | `GET /v1/identity/ens/names/{encoded_name}` | [E02](#screen-e02) | E03 |
| 143 | P10 | `POST /v1/identity/ens/registrations` | [E02](#screen-e02) | — |
| 144 | P10 | `POST /v1/identity/ens/record-updates` | [E03](#screen-e03) | — |
| 145 | P10 | `POST /v1/identity/ens/permission-grants` | [E04](#screen-e04) | — |
| 146 | P10 | `POST /v1/identity/ens/permission-revocations` | [E04](#screen-e04) | — |
| 147 | P10 | `GET /v1/identity/ens/transactions/{transaction_id}` | [E03](#screen-e03) | E04 |
| 148 | P10 | `POST /v1/identity/agent-bindings/challenges` | [E05](#screen-e05) | — |
| 149 | P10 | `POST /v1/identity/agent-bindings` | [E05](#screen-e05) | — |
| 150 | P10 | `GET /v1/identity/agent-bindings` | [A06](#screen-a06) | E05 |
| 151 | P10 | `GET /v1/identity/agent-bindings/{binding_id}` | [E05](#screen-e05) | — |
| 152 | P10 | `POST /v1/identity/agent-bindings/{binding_id}/verify` | [E05](#screen-e05) | — |
| 153 | P10 | `POST /v1/identity/agent-bindings/{binding_id}/revoke` | [E05](#screen-e05) | — |
| 154 | P10 | `GET /v1/identity/institution-credentials` | [E01](#screen-e01) | — |
| 155 | P10 | `POST /v1/identity/institution-credentials` | [E01](#screen-e01) | — |
| 156 | P10 | `POST /v1/identity/institution-credentials/{credential_id}/decisions` | [E01](#screen-e01) | — |
| 157 | P11 | `GET /v1/network/tasks` | [A09](#screen-a09) | N02 |
| 158 | P11 | `POST /v1/network/tasks` | [N03](#screen-n03) | — |
| 159 | P11 | `GET /v1/network/tasks/{external_task_id}` | [N04](#screen-n04) | — |
| 160 | P11 | `POST /v1/network/tasks/{external_task_id}/claims` | [N04](#screen-n04) | — |
| 161 | P11 | `GET /v1/network/tasks/{external_task_id}/claims` | [N04](#screen-n04) | N09 |
| 162 | P11 | `POST /v1/network/tasks/{external_task_id}/assignments` | [N04](#screen-n04) | — |
| 163 | P11 | `GET /v1/network/tasks/{external_task_id}/assignments` | [A09](#screen-a09) | N04, N05 |
| 164 | P11 | `POST /v1/network/tasks/{external_task_id}/dispatch` | [N04](#screen-n04) | — |
| 165 | P11 | `GET /v1/network/tasks/{external_task_id}/a2a-sessions` | [A09](#screen-a09) | N05 |
| 166 | P11 | `POST /v1/network/results` | [N06](#screen-n06) | — |
| 167 | P11 | `GET /v1/network/results` | [N06](#screen-n06) | N09 |
| 168 | P11 | `GET /v1/network/results/{result_ref_id}` | [N06](#screen-n06) | N07 |
| 169 | P11 | `POST /v1/network/reviews` | [N07](#screen-n07) | — |
| 170 | P11 | `GET /v1/network/reviews` | [N07](#screen-n07) | — |
| 171 | P11 | `POST /v1/network/arkiv/queries` | [N02](#screen-n02) | N03, N08 |
| 172 | P11 | `GET /v1/network/arkiv/entities/{entity_key}` | [N08](#screen-n08) | N10 |
| 173 | P11 | `GET /v1/network/arkiv/transactions/{transaction_id}` | [N08](#screen-n08) | O05 |
| 174 | P11 | `POST /v1/network/arkiv/reconciliation-requests` | [N08](#screen-n08) | O05 |
| 175 | P11 | `GET /v1/network/arkiv/indexer-status` | [N08](#screen-n08) | O05 |
| 176 | P11 | `GET /v1/network/investigations/{public_task_id}/timeline` | [N09](#screen-n09) | — |
| 177 | P11 | `POST /v1/network/verifications` | [N10](#screen-n10) | — |
| 178 | P11 | `GET /v1/network/verifications/{verification_id}` | [N10](#screen-n10) | — |
| 179 | P12 | `GET /v1/conversations` | [M01](#screen-m01) | M02 |
| 180 | P12 | `POST /v1/conversations` | [M02](#screen-m02) | — |
| 181 | P12 | `GET /v1/conversations/{conversation_id}` | [M02](#screen-m02) | — |
| 182 | P12 | `POST /v1/conversations/{conversation_id}/messages` | [M03](#screen-m03) | — |
| 183 | P12 | `GET /v1/conversations/{conversation_id}/messages` | [M03](#screen-m03) | — |
| 184 | P12 | `GET /v1/conversations/{conversation_id}/events/stream` | [M03](#screen-m03) | — |
| 185 | P12 | `PATCH /v1/conversations/{conversation_id}` | [M02](#screen-m02) | — |
| 186 | P12 | `POST /v1/conversations/{conversation_id}/feedback` | [M03](#screen-m03) | — |
| 187 | P12 | `GET /v1/me/preferences` | [F05](#screen-f05) | M10 |
| 188 | P12 | `PATCH /v1/me/preferences` | [F05](#screen-f05) | M09 |
| 189 | P12 | `GET /v1/me/memory` | [M10](#screen-m10) | — |
| 190 | P12 | `DELETE /v1/me/memory/{memory_id}` | [M10](#screen-m10) | — |
| 191 | P12 | `GET /v1/marine/conditions` | [M01](#screen-m01) | M04 |
| 192 | P12 | `GET /v1/marine/pfz` | [M05](#screen-m05) | — |
| 193 | P12 | `GET /v1/marine/warnings` | [M01](#screen-m01) | M05, M06 |
| 194 | P12 | `GET /v1/marine/geofences` | [M04](#screen-m04) | M05, M07 |
| 195 | P12 | `POST /v1/marine/route-exposures` | [M07](#screen-m07) | — |
| 196 | P12 | `GET /v1/alerts/subscriptions` | [M06](#screen-m06) | M08 |
| 197 | P12 | `POST /v1/alerts/subscriptions` | [M08](#screen-m08) | — |
| 198 | P12 | `PATCH /v1/alerts/subscriptions/{subscription_id}` | [M08](#screen-m08) | — |
| 199 | P12 | `DELETE /v1/alerts/subscriptions/{subscription_id}` | [M08](#screen-m08) | — |
| 200 | P12 | `GET /v1/alerts/notifications` | [M08](#screen-m08) | — |
| 201 | P12 | `POST /v1/alerts/notifications/{notification_id}/ack` | [M08](#screen-m08) | — |
| 202 | P12 | `POST /v1/voice/transcriptions` | [M09](#screen-m09) | — |
| 203 | P12 | `POST /v1/voice/synthesis` | [M09](#screen-m09) | — |
| 204 | P12 | `GET /v1/localization/languages` | [M09](#screen-m09) | — |
| 205 | P12 | `GET /v1/research/model-registry` | [L01](#screen-l01) | — |
| 206 | P12 | `POST /v1/research/model-registry` | [L01](#screen-l01) | — |
| 207 | P12 | `GET /v1/research/model-registry/{model_id}` | [L01](#screen-l01) | — |
| 208 | P12 | `POST /v1/research/model-evaluations` | [L02](#screen-l02) | — |
| 209 | P12 | `GET /v1/research/model-evaluations/{evaluation_id}` | [L02](#screen-l02) | — |
| 210 | P12 | `POST /v1/research/training-jobs` | [L03](#screen-l03) | — |
| 211 | P12 | `GET /v1/research/training-jobs/{training_job_id}` | [L03](#screen-l03) | — |
| 212 | P12 | `POST /v1/research/training-jobs/{training_job_id}/cancel` | [L03](#screen-l03) | — |
| 213 | P12 | `GET /v1/science/variables` | [L04](#screen-l04) | — |
| 214 | P12 | `POST /v1/science/diagnostics` | [L04](#screen-l04) | — |
| 215 | P12 | `GET /v1/science/diagnostics/{diagnostic_id}` | [L04](#screen-l04) | — |
| 216 | P12 | `POST /v1/research/monitoring-jobs` | [L05](#screen-l05) | — |
| 217 | P12 | `GET /v1/research/monitoring-jobs` | [L05](#screen-l05) | — |
| 218 | P12 | `PATCH /v1/research/monitoring-jobs/{job_id}` | [L05](#screen-l05) | — |
| 219 | P12 | `POST /v1/research/monitoring-jobs/{job_id}/pause` | [L05](#screen-l05) | — |
| 220 | P12 | `GET /v1/research/monitoring-jobs/{job_id}/evaluations` | [L05](#screen-l05) | — |

**Coverage sanity check:** 220 operations; 220 unique method-path pairs; 220 mapped to at least one screen; 87 frontend screens. This coverage maps UI ownership, not automatic availability or conformance.

## 11. Test plan: screen and journey acceptance

### 11.1 Mandatory shared component tests

| Test ID | Area | Negative/positive case and expected result |
|---|---|---|
| UX-C01 | Auth | Valid/expired/revoked OIDC token; route guard never exposes scoped content before /me. |
| UX-C02 | Organization switch | Switch between tenant A/B; all query cache, SSE, signed map URLs and downloads for A are invalidated. |
| UX-C03 | Capability gating | P09/P10/P11/P12 designed-only screens never present a production Live action. |
| UX-C04 | Error contract | 401/403/404/409/410/412/422/424/428/429/503 map to accurate and accessible UI. |
| UX-C05 | Idempotency | Rapid repeated submit and browser refresh produce one commit with same key. |
| UX-C06 | Optimistic concurrency | If-Match stale → conflict and reload without overwriting server state. |
| UX-C07 | SSE | Duplicate/out-of-order events, reconnect, expired cursor, auth expiry, missing event and poll fallback. |
| UX-C08 | Science units | Kelvin/Celsius, depth, timezones, calendar metadata and known/unknown uncertainty not conflated. |
| UX-C09 | Scientific data | No valid source or baseline → blocked/insufficient, never generated dummy SST chart. |
| UX-C10 | Maps | Expired signed layer access, empty coverage, QC masked cells, keyboard list fallback. |
| UX-C11 | Uploads | Multipart partial cannot appear published; checksum fail and quarantine visible. |
| UX-C12 | Reviewer | Hash valid but scientific mismatch shows separate failing scientific verdict. |
| UX-C13 | ENS | Pending vs confirmed, legitimate update succeeds, sibling update and revoked update denied. |
| UX-C14 | Arkiv | Task/claim ownership, expiry, stale index, RPC outage and public-private redaction. |
| UX-C15 | Provider | External A2A unreachable/timeout and invalid Agent Card, still do not leak credentials. |
| UX-C16 | Accessibility | Keyboard, screen-reader names, table chart alternatives, reduced motion, contrast. |
| UX-C17 | Responsive | 320px, 768px, 1280px no data or control loss; mobile tap targets. |
| UX-C18 | Security | SSRF-prone URL not directly fetched by browser; no token/secrets/private geometry in analytics or console. |
| UX-C19 | Performance | Large paginated tables virtualize without losing keyboard access; no unbounded browser full downloads. |
| UX-C20 | Exports | Restricted rights block bytes; references-only package clearly labelled; signed URLs not logged. |
| UX-C21 | No authority confusion | Official alerts not overridden by AI generated safe language. |
| UX-C22 | Mock boundaries | Production bundle/import graph contains no fixture/mock adapters or synthetic data fallback. |
| UX-C23 | Contract drift | Generated TS client and front-end example payload match current OpenAPI on CI, no handwritten drift. |
| UX-C24 | Cross-network authorization | ENS name and Arkiv wallet without verified signed binding cannot claim authorized agency. |
| UX-C25 | Review preservation | Original result persists when correction published, no silent overwrite. |
| UX-C26 | No fabricated metrics | Unknown cost, empty list, or null chart values never displayed as zero or live tally. |

### 11.2 Screen-specific tests

Every screen in §5 defines 4 test IDs with the pattern `[SCREEN]-01` through `[SCREEN]-04`, giving **348 planned screen checks** before the shared tests. These must be implemented, not counted as existing tests. Actual server-backed E2E runs must be executed only for gates that have passed and against real service dependencies when required; mock scenarios are for development/contract testing.

### 11.3 End-to-end journeys (minimum ten)

| ID | Journey | Required UI evidence | Gated by |
|---|---|---|---|
| J01 | OIDC → org choose → authorized project | No cross-tenant cached project; role-appropriate navigation | G02 |
| J02 | Create project → staged file upload → revoke access | No premature object publication, access enforced | G02 |
| J03 | Provider product → baseline compatibility → pinned source snapshot | Exact metadata provenance, no substitution, live product evidence | G03 |
| J04 | Approve SST recipe → run → insufficient/supported output | Correct science statuses and exactly approved digest | G04/G05 |
| J05 | Worker/SSE disconnect → refresh → safe resume/cancel | No duplicate run and accurate recovery sequence | G05 |
| J06 | Real map + report + export → protected download | No unsupported layer/metric, rights-aware artifact | G06 |
| J07 | Independent reproducer → challenge → corrected version | Original preserved, discrepancy and science verdict visible | G07 |
| J08 | Org-owned A2A provider: register → endpoint verify → task handoff | Separate identities, authorized service and failure path | G09 |
| J09 | ENSv2 delegation → endpoint update → revoke | Authorized change passes, revoked/sibling change fails on chain | G10 |
| J10 | Arkiv task → second-wallet claim → assignment → result → review | Live owned chain records queried, stale/expiry/reorg paths | G11 |
| J11 | Central ORCA API disabled → independent public verifier | Public proof accessed independently, confidential bytes restricted | G11 |
| J12 | Marine question → official warning → speech/text accessible response | No fake all-clear, no mandatory wallet, source valid times | G12 selected |
| J13 | Memory delete → cross-plane context no leaked observation | User-specific memory handled with provenance and retention policy | G12 selected |
| J14 | Institutional pilot → scientific benchmark comparison | Measured human review effort and correctness; no fake winner metrics | G13 |

## 12. Backend gaps, open ADRs and no-fabrication rules

The following are **explicit UX requests not fully represented by a dedicated endpoint** in the current 220-route contract. They require an agreed API amendment/ADR before promising live behavior. Keeping them visible here is more useful than silently inventing `/v1/dashboard` or `/v1/review-queue`.

| Gap ID | Desired capability | Present API basis | Resolution / do not fabricate |
|---|---|---|---|
| GAP-F01 | Cross-project assigned review inbox | GET per investigation artifacts/reviews | Add scoped review-assignment listing with cursor or bounded authorized client aggregation; no platform-wide scan. |
| GAP-F02 | Institute dashboard count aggregates and SLA trends | Paged projects/investigations; usage GET | Use only safe authoritative counts returned by existing API, or agree dedicated aggregate contract. |
| GAP-F03 | Complete onboarding draft and 8-step server checkpoint | POST agent/capability/endpoint/checklist | Confirm backend agent draft state, wizard resume and provider-mode DTO; avoid client-only claims of saved server steps. |
| GAP-F04 | Hosted-agent model setup and MCP-only provider registration | P09 agent generic registry | Specify support and access policy in revised P09 contract; never call it live until implemented. |
| GAP-F05 | A2A task inbox filtered by operator/agent | Generic network task list | Add server-side provider/agent scoped filters or explicit provider inbox endpoint; no global download to browser. |
| GAP-F06 | Agent public publishing verification and version metadata | Agent health + onboarding checklist | Define publish transition/approval if needed; do not equate agent registration with validated publication. |
| GAP-F07 | Global search | No universal search endpoint | Limit search to documented per-resource filters, or add explicit authorized search service. |
| GAP-F08 | Map tile/legend & multi-statistical chart UX | P06 layer access and result artifacts | Render only actual layer/artifact descriptors; agree explicit chart metadata schema if missing. |
| GAP-F09 | Visual artifact diff and peer-review comment threads | P07 reproductions/challenges | Use existing review payload; propose threaded annotation endpoint only if requirement exceeds it. |
| GAP-F10 | ENS wallet-mediated transactions from browser | ENS transaction intents via backend | Confirm wallet UX/transaction custody decision in P10 ADR; no secret-key collection. |
| GAP-F11 | Public external verifier while ORCA API off | P11 /network/verifications via ORCA | Build independently deployed verifier that reads Arkiv/ENS and artifacts directly; API screen alone is insufficient. |
| GAP-F12 | Institutional alert dispatch and incident-case management | P12 marine warning/subscription endpoints only | Do not invent authority, case-management or dispatch endpoints; version separate future contract. |
| GAP-F13 | Scientific run feedback/model agent trace search | P05 task graph/events; model evals P12 | Available traces are factual/redacted and limited to contracted event data; no inner reasoning export. |
| GAP-F14 | Webhooks and signed callback subscriptions | No explicit endpoint | Implement polling/SSE initially; add a signed callback contract only by ADR. |
| GAP-F15 | Report editor rich collaborative annotation | Report generate/read/publish, no patch report | Show preview and externally generated content; any inline edit requires versioned report draft API. |

**Privacy rule:** if exposing a dashboard feature would reveal unlicensed source subsets, hidden research sites, confidential coordinates, protected chat histories or internal tool credentials, the UI should not reveal it merely because another public network record links to the same task.

## 13. Frontend delivery phases and definition of done

| Frontend stream | Supports backend gate | Pages/components completed for this stream | Real E2E needed before enabling |
|---|---|---|---|
| FE00 System foundation | G00–G01 | White UI kit, route layouts, generated client, capability gating, test-only mock fixture harness, desktop/mobile | Contract examples and test bundle audit |
| FE01 Institute & projects | G02 | F01–F05, I01–I11, project files and access | Live local OIDC, Postgres RLS and storage |
| FE02 Data & science | G03–G04 | D01–D09, science methods/compatibility/quality and geometry | Live source probe, real subset/baseline and reference science |
| FE03 Investigations & evidence | G05–G07 | R01–R12, V01–V06, SSE, map/report/exports | Durable worker, real artifacts, independent reproduction |
| FE04 Operations hardening | G08 | O01–O04, usage/quotas/audit/retention | Staging deployment, restores, tenancy/security tests |
| FE05 Agent provider | G09 | A01–A09, provider directory, wizard, A2A monitoring | Actual separately keyed provider + live protocol handshake |
| FE06 Institutional identity | G10 | E01–E05, ENS subname/permission/binding | Live supported chain rights, signed binding and revocation tests |
| FE07 Federation coordination | G11 | N01–N10, task board, claims, Arkiv receipts, verifier; O05 | Live Rabdi writes/queries and independent verification |
| FE08 Original companion/ML | G12 individually | M01–M10, L01–L05 | Authorized marine source, no invented warning/PFZ, model/voice test |
| FE09 Product validation | G13–G14 | Responsive/accessibility/security, real institutional pilot and source regression | Pilot science and load/backup/retention results |

**Per-screen definition of done:** backed by exact generated TypeScript contract; role/access verified; query keys tenant-scoped; all specified UI states; keyboard and screen-reader behavior; no fake scientific data; request ID and errors visible to authorized support; correct idempotency/ETags; tests linked to backend gate; responsive at target widths; no production mock imports. A visually complete screen using only fixtures is **FE-design-complete**, never **live-complete**.

**Recommended review:** schedule a design/code review after FE00, FE02 and FE05 before expanding other modules. Scientist reviewers should check units, source labels, uncertainty, limitations and scientific-review wording. Agent operators should check ownership, wallet permission distinctions and public disclosure preview.

## 14. Source document and design linkage

| Reference | Sections / how frontend uses it | Status |
|---|---|---|
| `api design.md` | §0 release statuses; §2 HTTP/authorization/errors; §3.1–§3.14 exact 220 operations; §4 DTOs; §5 SSE/task lifecycles; §6 examples; §10 threat model; §11 frontend handoff; §13 non-REST; §15 original cases | Authoritative proposed API contract, not implemented |
| `implementation plan.md` | §1 source catalogue; §2 release profiles; §4 full repository; §5 engineering rules; §6 P00–P14 exact implementation gates; §7 traceability/test ownership | Proposed plan; no passed gate claimed |
| `design.md` | §3 applications/workflows; §4 agent model; §7 storage; §9 security; §10 science; §11 frontend data and events | Proposed unified architecture |
| `docs/01_user_flows.md` | Doc 1 sections A–D: original four surfaces, six personas, eight scenarios, Research Studio and federation UX; acceptance table | Old+new UX design |
| `docs/02_agentic_architecture.md` | Internal supervisor, specialist agents, optional network coordinator, A2A task lifecycle, trust guards | Proposed agent workflow |
| `docs/03_data_processing.md` | Scientific source contract, quality/compatibility, availability clocks, data failure and recovery | Proposed data policy |
| `docs/04_database.md` | RLS/tenant scope, research evidence, federation task claim vs scientific claim, chain references, audit relationships | Proposed database design |
| `docs/05_implementation.md` | Project phases and dependency mapping; verify against newer 15-phase plan | Historical derived plan |
| `docs/06_memory_context.md` | Seven memory planes, isolation, provenance and correction history; privacy tests | Proposed memory policy |
| `docs/07_scientific_engine.md` | Methods, result contract, independent scientific challenges, reliability testing and historical verification | Proposed science rules |
| `docs/13_legacy_integration_playbook.md` | Migration mapping from original ORCA chat/map/activity/evidence to institution + federation modules | Integration crosswalk |
| `ORCA_3_0_Institutional_Dashboard_UX_Spec_2026-11-06.md` | Prior lighter UI concept reviewed, superseded by this screen-complete specification | Historical visual prototype reference; not authority |
| `https://teampflresearch.vercel.app/` | Original seven docs and scientific research dossier; historical specifications retained | Public project source; not deployment evidence |

### Final interface contract

**Product experiences remain separate but connected:** original public Marine Companion; authenticated institution oversight; precise reproducible Research Studio; independently operated agent onboarding; ENS identity and authorization; Arkiv public coordination; independent review/verifier; optional model/monitoring; restricted platform operations. **White-first UI; no random colors, no fake claims, no hardcoded measurements, no replacement of the previous marine map experience.**

The frontend engineer starts with FE00 and the **exact §10 route map**. For any new interface action requiring a missing backend route, file an API design amendment/ADR rather than inventing a request or silently pretending that an unavailable feature works.

---

**End of proposed frontend design specification.**