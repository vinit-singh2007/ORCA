# ORCA Architecture Doc 1 (Revised) — User Flows, Research Studio and Federation UX

**Version:** 3.0 — extends the [original Doc 1](https://teampflresearch.vercel.app/doc1.html). **New design, not implemented.**

## A. What survives unchanged

- Four synchronized user-facing surfaces: **Conversation**, **Marine Map**, **Agent Activity**, **Evidence & Reasoning**.
- Six principal personas: fisherman, researcher, coastal authority, disaster manager, maritime operator and environmental agency.
- Eight original scenarios: PFZ discovery, marine outing safety, local tides/weather/state, cyclone/lightning alerts, favorable SST/CHL, route assessment, productivity decline investigation and hazardous/restricted fishing regions.
- Multilingual input/output, voice accessibility, low-bandwidth mobile support, location/time contextual follow-ups, progressive map layer construction and user-controlled scenario exploration.
- Stream factual activity and data provenance—not internal model hidden reasoning. Marine alerts and official advisories must not be modified by synthesized responses.

## B. New experience architecture

### B.1 Modes

| Mode | Default user | New experiences | Wallet needed? |
|---|---|---|---|
| Marine Companion | Fisherman / crew | Original four surfaces, voice, map, cached observations, official warnings | No |
| Research Studio | Scientist / university lab | Projects, typed scientific recipe, method review, dataset validity, run notebook, figures, independent reproduction, historical replay | No |
| Institutional Operations | Port/fleet/authority | Sources, route exposure, event timelines, decision audit and warnings with official provenance | No |
| Provider Portal | Research group/agent operator | Organization onboarding, ENS identity setup, A2A Agent Card, scientific capability catalog, work claims and results | Only if using on-chain coordination/ENS actions; abstract wallet UX for ordinary users |
| Network Explorer | Any authorized observer | Open public tasks, provider identities, result hashes, reviews, chain receipts; private contents remain hidden | Read-only: no |
| Independent Verification | Independent researcher/auditor | Re-fetch public records and permitted source artifacts, check signatures and rerun methods | No for public read |

### B.2 Research Studio layout

```text
┌──────────── Project / Investigation navigator ───────────┐
│ Project goals, versions, team, data rights, review status│
├────────────┬─────────────────────┬──────────────────────┤
│ Chat +    │ Map / chart /       │ Sources & QC          │
│ typed     │ transect / time     │ Methods & assumptions │
│ recipe    │ series / raster     │ Independent review    │
├────────────┴─────────────────────┴──────────────────────┤
│ Task timeline: DATA → CALCULATE → REPRODUCE → REVIEW    │
│ Tabs: task DAG | agents | chain coordination | audit     │
├────────────────────────────────────────────────────────┤
│ Reports / reproducibility export / run comparison      │
└────────────────────────────────────────────────────────┘
```

Researcher flow:
1. Select/create institutional project and confirm dataset access scope.
2. Ask a natural-language research question or import an approved method recipe.
3. Review interpreted region (polygon), time range, variable, depth, baseline and scientific assumptions; meaningful ambiguity triggers user confirmation **before** execution.
4. Inspect ranked datasets: coverage, QC, version, licensing, original publication/availability time, numerical/vertical compatibility.
5. Choose **Local reproducible analysis** or **Federated independent review**. The federation option only appears if a meaningful external capability exists.
6. Watch task DAG and map progress as actual events are confirmed; display distinct `data retrieved`, `scientific computation done`, `review requested`, `record confirmed` and `science reproduced` statuses.
7. Inspect a result by selecting any numerical claim, viewing underlying source, method, data subset, QC flags, uncertainty and reproducibility controls.
8. Compare an original finding to a validator's challenge; view exact discrepancy, original version and corrected version; no overwrite of prior science.
9. Run historical as-of replay, compare to later observations, export research bundle and optionally share a limited public reference.

### B.3 Provider portal

- **Institution Profile:** institutional display name, approved membership role, credential state (`self-asserted`, `verified by reviewer`, `revoked`), data rights and contact procedure.
- **Agent Setup:** choose Hosted Agent, Institution-hosted A2A Agent, or Dataset/MCP-only Provider. Don't require an LLM for tool providers.
- **ENSv2 enrollment:** connect wallet, set up institution-owned namespace, agent subnames, per-agent resolver boundary, delegation grant and revoke. Show *actual* network/tx confirmations.
- **Cross-chain binding:** sign an authorization document binding the ENS agent identity to Arkiv wallet, A2A signing key, task scope and expiry; verify on both networks.
- **A2A capabilities:** advertise Agent Card, domain skills, spatial coverage, methods, endpoint, requirements and access controls.
- **Network activity:** public tasks by capability from real Arkiv queries; claims, assignments, response deadlines, scientific artifacts and review requests.
- **Finance:** if later used, explicit opt-in paid methods with budgets, invoice and settlement; not required to view public science.

### B.4 End-user truthfulness vocabulary

| UI label | Exactly when allowed |
|---|---|
| `Agent discovered` | Agent Card successfully retrieved; not yet authorized |
| `Institution verified` | Credential + binding have passed institutional validation; ENS name alone insufficient |
| `Task published` | Confirmed/publicly queryable Arkiv entity exists (show network, key, receipt) |
| `Claim submitted` | Claim entity accepted, not automatically assigned |
| `Result submitted` | Signed result artifact exists; not necessarily scientifically checked |
| `Hash verified` | Downloaded bytes digest equals committed digest |
| `Scientifically reproduced` | Reproducibility execution matches reference result within method-specific tolerance and fitness checks |
| `Approved by official source` | Only when authoritative issuer explicitly provides the status; never inferred from ORCA consensus |

### B.5 Offline and partial network UX

- Direct local marine answers remain available without ENS/Arkiv. When blockchain is unavailable, the UI says `External collaboration unavailable` and does not hide available official warnings.
- If an agent is disconnected, show last confirmed status and explicit retry/fallback or no result. Never synthesize completed work.
- If a result's scientific package is private or unavailable, show `Public commitment present; scientific verification not possible from this view`.
- Expiring Arkiv records show expiry; cached copies are marked as snapshots, not live network state.

## C. Updated user stories and acceptance criteria

| Story | Concrete acceptance test |
|---|---|
| Fisher asks whether dangerous conditions apply | Official warnings and valid time shown with no wallet/network dependency; no unsupported all-clear |
| Scientist requests SST anomaly for a polygon | Region and seasonal baseline confirmed; deterministic calculation, provenance, map and export |
| Scientist requests external review | Eligible independent validator discovered, authorization checked, A2A task submitted, signed review displayed |
| Agent operator controls a name | Real ENSv2 subname and endpoint can be updated by delegated key; sibling update denied; revoked key denied |
| External provider claims a task | Second wallet reads real Arkiv task and publishes queryable claim; requester explicitly accepts |
| Researcher challenges a finding | Original numerical artifact is retained; challenge cites method/source mismatch; corrected result is a new version |
| Auditor verifies after central API outage | Public unexpired Arkiv records can be fetched independently; private evidence limitations are clearly indicated |
| User deletes personal history | Relevant user conversation/memory deletion honored subject to law; public commitments never contain personal content |

## D. New frontend component hierarchy

```text
apps/web
  MarineWorkspace/Chat, Map, AgentActivity, EvidencePanel, Alerts
  ResearchStudio/ProjectSidebar, RecipeEditor, DatasetInspector,
    RunTimeline, ScientificPlot, ClaimTrace, ReproductionPanel,
    ChallengeDiff, HistoricalReplay, ExportCenter
  ProviderPortal/OrgProfile, ENSNamespace, AgentRegistration,
    CapabilityEditor, TaskBoard, Claims, ExecutionHistory, WalletBindings
  VerifyPortal/ArkivReader, ENSResolver, HashValidator, ScientificRerunner
  Shared/AuthOrgSwitch, RoleGuard, ConsentScope, ErrorStates, SourceBadges
```

## E. New event-to-UI contract

Every emitted event contains `event_id`, `investigation_id`, `task_id?`, `organization_id`, `event_type`, `occurred_at`, `trace_id`, `payload` (redacted for viewer permissions), `source` and `version`. Stream only committed or truthfully marked intermediate states. Events: `research_recipe_created`, `research_recipe_approved`, `dataset_quality_checked`, `external_agent_discovered`, `ens_identity_resolved`, `institutional_authorization_verified`, `arkiv_task_tx_submitted`, `arkiv_task_confirmed`, `claim_received`, `assignment_authorized`, `a2a_task_running`, `scientific_artifact_received`, `hash_verified`, `review_challenged`, `reproduction_completed`, `science_inconclusive`, `report_published`, `source_unavailable`. Account for SSE reconnect using event cursor.

## F. UX guardrails

- No claim that a model predicted actual fish catch; PFZ is a source-based advisory/suitability indicator with constraints.
- Protect personal coordinates: exact position only to approved internal data services, not ENS/Arkiv.
- Distinguish science review from official hazard authority and from a cryptographic hash match.
- Fallback in Hindi/Gujarati plus original regional-language roadmap. Do not promise 10+ languages without measured quality.
- Asynchronous deep research may take far longer than the original unverified `<8s` complex-query target; display progress, cancellability, cost and ETA estimates only after measurement.

**Source:** https://teampflresearch.vercel.app/doc1.html — four original UI surfaces, personas, eight scenarios, progressive map and alert design. Added Research Studio / Provider Portal flows from ORCA 3.0 requirements.
