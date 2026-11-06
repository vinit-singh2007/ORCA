/**
 * Documentation Generator for ORCA 3.0 Frontend
 * Creates dedicated markdown files for every source file with required header comments.
 */

import fs from 'fs';
import path from 'path';

const DOCS_DIR = 'c:/ocra frontend/orca-frontend/docs';

const FILES_METADATA = [
  // Foundation
  {
    target: 'src/app/page.tsx',
    docPath: 'foundation/F01_entry.md',
    title: 'F01 — Entry & Release-Capabilities',
    screenId: 'F01',
    gate: 'P02',
    operations: ['GET /v1/meta', 'GET /v1/me', 'GET /v1/organizations'],
    apiRef: 'api design.md §3.1',
    uxRef: 'dashboard design.md §5.1',
    summary: 'Root application landing page framing release profile capabilities (core-C), active organization greeting, quick launches to Research Studio (R03), Marine Map (M04), and Review Inbox (V01), and the backend capability gate table.'
  },
  {
    target: 'src/app/workspaces/page.tsx',
    docPath: 'foundation/F03_workspaces.md',
    title: 'F03 — Workspace Selector & Organization Directory',
    screenId: 'F03',
    gate: 'P02',
    operations: ['GET /v1/organizations', 'GET /v1/me'],
    apiRef: 'api design.md §3.2',
    uxRef: 'dashboard design.md §5.1',
    summary: 'Organization directory enabling multi-institutional switching, displaying data retention days, tenant isolation, and row-level security boundaries.'
  },
  {
    target: 'src/app/layout.tsx',
    docPath: 'foundation/layout.md',
    title: 'Root Application Layout Scaffolding',
    screenId: 'Global Layout',
    gate: 'P02',
    operations: ['Initial HTML Scaffolding'],
    apiRef: 'api design.md §0',
    uxRef: 'dashboard design.md §4',
    summary: 'Root HTML template providing font-sans antialiasing, base viewport meta tags, and global CSS inclusion.'
  },
  {
    target: 'src/app/globals.css',
    docPath: 'foundation/globals_css.md',
    title: 'Strict White / Neutral Monochrome Theme Stylesheet',
    screenId: 'Global Stylesheet',
    gate: 'P02',
    operations: ['Tailwind CSS v4 Token Definitions'],
    apiRef: 'api design.md §11',
    uxRef: 'dashboard design.md §2',
    summary: 'Defines the strict monochrome CSS variables: #FFFFFF, #111827, #E5E7EB, #F8F9FA, custom scrollbars, and removes all legacy colorful gradients.'
  },

  // Institution
  {
    target: 'src/app/org/[orgId]/overview/page.tsx',
    docPath: 'institution/I01_command_centre.md',
    title: 'I01 — Institution Command Centre',
    screenId: 'I01',
    gate: 'P08',
    operations: ['GET /v1/organizations/{id}', 'GET /v1/research/projects', 'GET /v1/research/investigations'],
    apiRef: 'api design.md §3.2 & §3.3',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Institutional command center showing project health KPIs, pending peer reviews, source data freshness, and blocked-work alerts.'
  },
  {
    target: 'src/app/org/[orgId]/projects/page.tsx',
    docPath: 'institution/I02_projects_index.md',
    title: 'I02 — Research Projects Index',
    screenId: 'I02',
    gate: 'P02',
    operations: ['GET /v1/research/projects', 'POST /v1/research/projects'],
    apiRef: 'api design.md §3.3',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Research project catalogue with filterable data access classifications, pinned data policy tags, and modal for creating new studies.'
  },
  {
    target: 'src/app/org/[orgId]/projects/[projectId]/page.tsx',
    docPath: 'institution/I04_project_detail.md',
    title: 'I04 — Project Details & Activity',
    screenId: 'I04',
    gate: 'P05',
    operations: ['GET /v1/research/projects/{id}', 'GET /v1/research/investigations'],
    apiRef: 'api design.md §3.3 & §3.6',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Project command screen containing 4 distinct operational tabs: Overview, Investigations, Files, and Project Members.'
  },
  {
    target: 'src/app/org/[orgId]/projects/[projectId]/files/page.tsx',
    docPath: 'institution/I06_project_files.md',
    title: 'I06 — Project Files & Immutable Scientific Inputs',
    screenId: 'I06',
    gate: 'P02',
    operations: ['GET /v1/research/projects/{id}/files', 'POST /files/upload-intents'],
    apiRef: 'api design.md §3.3',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Immutable repository for GeoJSON bounding polygons and in-situ buoy telemetry CSVs stamped with SHA-256 digests.'
  },
  {
    target: 'src/app/org/[orgId]/settings/members/page.tsx',
    docPath: 'institution/I08_members.md',
    title: 'I08 — Institutional Members & Permissions',
    screenId: 'I08',
    gate: 'P02',
    operations: ['GET /v1/organizations/{id}/members', 'POST /v1/invitations'],
    apiRef: 'api design.md §3.2',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Institutional team roster managing principal investigators, researchers, data stewards, and independent auditors with email invitation flow.'
  },
  {
    target: 'src/app/org/[orgId]/settings/access/page.tsx',
    docPath: 'institution/I09_access_grants.md',
    title: 'I09 — External Access Grants & Delegation',
    screenId: 'I09',
    gate: 'P02',
    operations: ['GET /v1/access-grants', 'POST /v1/access-grants'],
    apiRef: 'api design.md §3.2',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Time-bounded cryptographic access grants allowing cross-institution sharing of protected evidence and dataset scopes.'
  },
  {
    target: 'src/app/org/[orgId]/settings/usage/page.tsx',
    docPath: 'institution/I10_usage_quotas.md',
    title: 'I10 — Institutional Compute & Storage Quotas',
    screenId: 'I10',
    gate: 'P08',
    operations: ['GET /v1/organizations/{id}/usage', 'PATCH /v1/organizations/{id}/quotas'],
    apiRef: 'api design.md §3.8',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Resource accounting meters for Compute Units (CU), snapshot storage gigabytes, and A2A egress with hard-cap policy safeguards.'
  },
  {
    target: 'src/app/org/[orgId]/settings/audit/page.tsx',
    docPath: 'institution/I11_audit_log.md',
    title: 'I11 — Tamper-Evident Security & Access Audit',
    screenId: 'I11',
    gate: 'P08',
    operations: ['GET /v1/audit-events', 'GET /v1/audit-events/{id}'],
    apiRef: 'api design.md §3.8',
    uxRef: 'dashboard design.md §5.2',
    summary: 'Append-only audit trail logging principal authentication, resource downloads, and cryptographic access decisions with RFC 9457 error summaries.'
  },

  // Data & Methods
  {
    target: 'src/app/org/[orgId]/data/providers/page.tsx',
    docPath: 'data_methods/D01_providers.md',
    title: 'D01 — External Source Providers Catalogue',
    screenId: 'D01',
    gate: 'P03',
    operations: ['GET /v1/catalog/providers', 'GET /v1/catalog/providers/{id}/probes'],
    apiRef: 'api design.md §3.4',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Registry of oceanographic data providers (INCOIS, Copernicus) with license designations, protocol specs, and health checks.'
  },
  {
    target: 'src/app/org/[orgId]/data/products/page.tsx',
    docPath: 'data_methods/D02_products.md',
    title: 'D02 — Marine Product Catalogue',
    screenId: 'D02',
    gate: 'P03',
    operations: ['GET /v1/catalog/products', 'GET /v1/catalog/products/{id}'],
    apiRef: 'api design.md §3.4',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Verified marine observation and reanalysis product directory detailing canonical variables, units, and spatial/temporal resolutions.'
  },
  {
    target: 'src/app/org/[orgId]/data/products/[productId]/page.tsx',
    docPath: 'data_methods/D03_product_detail.md',
    title: 'D03 — Product Detail & Scientific Suitability',
    screenId: 'D03',
    gate: 'P03',
    operations: ['GET /v1/catalog/products/{id}', 'POST /v1/catalog/products/{id}/fitness-checks'],
    apiRef: 'api design.md §3.4',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Detailed product metadata with pinned immutable versions and interactive spatial/temporal fitness checker executing POST /fitness-checks.'
  },
  {
    target: 'src/app/org/[orgId]/data/snapshots/page.tsx',
    docPath: 'data_methods/D05_snapshots.md',
    title: 'D05 — Source Snapshots & Manifest Explorer',
    screenId: 'D05',
    gate: 'P03',
    operations: ['GET /v1/catalog/snapshots', 'POST /v1/catalog/snapshots'],
    apiRef: 'api design.md §3.4',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Explorer for cryptographically pinned raw source slices and root Merkle SHA-256 manifests required for reproducible research.'
  },
  {
    target: 'src/app/org/[orgId]/data/compatibility/page.tsx',
    docPath: 'data_methods/D06_compatibility.md',
    title: 'D06 — Dataset Compatibility Workbench',
    screenId: 'D06',
    gate: 'P03',
    operations: ['POST /v1/catalog/compatibility-checks'],
    apiRef: 'api design.md §3.4',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Pre-flight validation workbench testing CRS alignment (EPSG:4326), canonical unit equivalency, and regridding factors.'
  },
  {
    target: 'src/app/org/[orgId]/science/methods/page.tsx',
    docPath: 'data_methods/D08_methods.md',
    title: 'D08 — Scientific Method Registry',
    screenId: 'D08',
    gate: 'P04',
    operations: ['GET /v1/science/methods', 'GET /v1/science/methods/{id}'],
    apiRef: 'api design.md §3.5',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Peer-reviewed scientific algorithms (sst.seasonal_anomaly, upwelling.bakun_index) with mathematical definitions, formulas, and container digests.'
  },
  {
    target: 'src/app/org/[orgId]/science/recipes/page.tsx',
    docPath: 'data_methods/D09_recipes.md',
    title: 'D09 — Recipe Templates & Validation',
    screenId: 'D09',
    gate: 'P04',
    operations: ['GET /v1/science/recipe-templates', 'POST /v1/science/recipes/validate'],
    apiRef: 'api design.md §3.5',
    uxRef: 'dashboard design.md §5.3',
    summary: 'Interactive JSON scientific recipe template editor with live schema validation, parameter checking, and SHA-256 plan digest computation.'
  },

  // Research
  {
    target: 'src/app/org/[orgId]/research/investigations/page.tsx',
    docPath: 'research/R01_investigations.md',
    title: 'R01 — Scientific Investigation Library',
    screenId: 'R01',
    gate: 'P05',
    operations: ['GET /v1/research/investigations'],
    apiRef: 'api design.md §3.6',
    uxRef: 'dashboard design.md §5.4',
    summary: 'Comprehensive library of oceanographic investigations filterable by execution state, scientific validity, and risk tier.'
  },
  {
    target: 'src/app/org/[orgId]/research/investigations/new/page.tsx',
    docPath: 'research/R02_new_investigation.md',
    title: 'R02 — New Scientific Investigation Formulation Wizard',
    screenId: 'R02',
    gate: 'P05',
    operations: ['POST /v1/research/investigations', 'POST /v1/research/plans'],
    apiRef: 'api design.md §3.6',
    uxRef: 'dashboard design.md §5.4',
    summary: 'Multi-step formulation wizard guiding researchers through scientific hypothesis, spatial polygon, temporal window, and baseline method binding.'
  },
  {
    target: 'src/app/org/[orgId]/research/investigations/[investigationId]/page.tsx',
    docPath: 'research/R03_research_studio.md',
    title: 'R03 — Flagship Unified Research Studio',
    screenId: 'R03',
    gate: 'P06',
    operations: ['GET /v1/research/investigations/{id}', 'GET /artifacts/{id}', 'POST /runs'],
    apiRef: 'api design.md §3.6 & §3.7',
    uxRef: 'dashboard design.md §5.4',
    summary: 'ORCA 3.0 flagship three-pane workstation: Left research scope, Center Map/Chart/Table outputs with polygon overlay, Right evidence inspector, and bottom durable timeline.'
  },
  {
    target: 'src/app/org/[orgId]/research/artifacts/[artifactId]/page.tsx',
    docPath: 'research/R10_artifact_inspector.md',
    title: 'R10 — Artifact Inspector & Provenance DAG',
    screenId: 'R10',
    gate: 'P06',
    operations: ['GET /v1/research/artifacts/{id}', 'GET /artifacts/{id}/lineage', 'GET /artifacts/{id}/manifest'],
    apiRef: 'api design.md §3.7',
    uxRef: 'dashboard design.md §5.4',
    summary: 'Deep cryptographic provenance inspector displaying the complete Merkle lineage graph, input snapshot digests, container image hashes, and digital signatures.'
  },
  {
    target: 'src/app/org/[orgId]/research/investigations/[investigationId]/reports/page.tsx',
    docPath: 'research/R11_reports.md',
    title: 'R11 — Research Report & Institutional Publication',
    screenId: 'R11',
    gate: 'P06',
    operations: ['GET /v1/research/investigations/{id}/reports', 'POST /reports/publish'],
    apiRef: 'api design.md §3.6',
    uxRef: 'dashboard design.md §5.4',
    summary: 'Official research monograph publication gate with DOI allocation, peer reproduction consensus meter, and PI cryptographic sign-off.'
  },
  {
    target: 'src/app/org/[orgId]/research/investigations/[investigationId]/exports/page.tsx',
    docPath: 'research/R12_exports.md',
    title: 'R12 — Reproducible Scientific Export Center',
    screenId: 'R12',
    gate: 'P06',
    operations: ['POST /v1/research/investigations/{id}/exports', 'GET /exports/{id}'],
    apiRef: 'api design.md §3.6',
    uxRef: 'dashboard design.md §5.4',
    summary: 'Generates self-contained scientific bundles (tar.gz) containing input manifests, parameters, output NetCDF arrays, and offline bash verification script.'
  },

  // Verification & Review
  {
    target: 'src/app/org/[orgId]/review/inbox/page.tsx',
    docPath: 'verification/V01_review_inbox.md',
    title: 'V01 — Scientific Review Inbox',
    screenId: 'V01',
    gate: 'P07',
    operations: ['GET /v1/review/queue'],
    apiRef: 'api design.md §3.7',
    uxRef: 'dashboard design.md §5.5',
    summary: 'Independent peer review triage inbox categorizing investigations into Pending Review, Reproduced, Challenged, and Insufficient Evidence.'
  },
  {
    target: 'src/app/org/[orgId]/review/[reviewId]/page.tsx',
    docPath: 'verification/V02_V04_review_detail.md',
    title: 'V02–V04 — Scientific Review & Reproduction Workspace',
    screenId: 'V02–V04',
    gate: 'P07',
    operations: ['GET /v1/review/{id}', 'POST /v1/review/{id}/verdicts', 'POST /v1/review/{id}/disputes'],
    apiRef: 'api design.md §3.7',
    uxRef: 'dashboard design.md §5.5',
    summary: 'Side-by-side delta workspace comparing original calculation against independent reproducer run, showing bitwise numerical diffs and signed verdict submission.'
  },
  {
    target: 'src/app/verify/[publicRef]/page.tsx',
    docPath: 'verification/N10_public_verifier.md',
    title: 'N10 — Independent Verifier (Public-Only Mode)',
    screenId: 'N10',
    gate: 'P11',
    operations: ['POST /v1/network/verifications', 'GET /v1/network/results/{ref}'],
    apiRef: 'api design.md §3.10',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Zero-trust unauthenticated public portal verifying mathematical reproducibility proofs from raw artifact digests, task IDs, or DOIs.'
  },

  // Federated Network
  {
    target: 'src/app/org/[orgId]/agents/page.tsx',
    docPath: 'federated_network/A01_agent_directory.md',
    title: 'A01 — Federated Agent Directory',
    screenId: 'A01',
    gate: 'P09',
    operations: ['GET /v1/agents'],
    apiRef: 'api design.md §3.9',
    uxRef: 'dashboard design.md §5.6',
    summary: 'Federated directory of autonomous scientific agents cleanly distinguishing P09 A2A reachability from P10 ENS cryptographic ownership.'
  },
  {
    target: 'src/app/org/[orgId]/agents/new/page.tsx',
    docPath: 'federated_network/A02_A06_agent_onboarding.md',
    title: 'A02–A06 — Agent Onboarding Wizard',
    screenId: 'A02–A06',
    gate: 'P09',
    operations: ['POST /v1/agents', 'POST /v1/agents/handshake'],
    apiRef: 'api design.md §3.9',
    uxRef: 'dashboard design.md §5.6',
    summary: '5-step institutional agent registration wizard: Mode selection, Identity, Capability advertisement, Endpoint handshake probe, and Delegation rules.'
  },
  {
    target: 'src/app/org/[orgId]/agents/[agentId]/page.tsx',
    docPath: 'federated_network/A07_A08_agent_detail.md',
    title: 'A07/A08 — Agent Detail & Operational Health',
    screenId: 'A07/A08',
    gate: 'P09',
    operations: ['GET /v1/agents/{id}', 'GET /v1/agents/{id}/health'],
    apiRef: 'api design.md §3.9',
    uxRef: 'dashboard design.md §5.6',
    summary: 'Operational health telemetry, response latency distributions, agent card specifications, and capabilities breakdown.'
  },
  {
    target: 'src/app/org/[orgId]/agents/[agentId]/identity/page.tsx',
    docPath: 'federated_network/E01_E05_ens_identity.md',
    title: 'E01–E05 — ENS Identity & Authorization Management',
    screenId: 'E01–E05',
    gate: 'P10',
    operations: ['GET /v1/identity/ens/{name}', 'POST /v1/identity/bindings'],
    apiRef: 'api design.md §3.9 & §3.10',
    uxRef: 'dashboard design.md §5.6',
    summary: 'Manages ENSv2 name bindings, Sepolia resolver text records, wallet signature challenges, multi-sig attestations, and revocation.'
  },
  {
    target: 'src/app/network/agents/page.tsx',
    docPath: 'federated_network/N01_external_agents.md',
    title: 'N01 — External Agent Discovery',
    screenId: 'N01',
    gate: 'P09',
    operations: ['GET /v1/network/agents'],
    apiRef: 'api design.md §3.9',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Cross-institution agent discovery catalog filterable by mathematical capability and accreditation tier.'
  },
  {
    target: 'src/app/network/tasks/page.tsx',
    docPath: 'federated_network/N02_network_tasks.md',
    title: 'N02 — Public Task Marketplace (Arkiv Coordination Board)',
    screenId: 'N02',
    gate: 'P11',
    operations: ['GET /v1/network/tasks'],
    apiRef: 'api design.md §3.10',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Public decentralized research task board displaying task claims, single-award assignments, and on-chain Sepolia confirmation statuses.'
  },
  {
    target: 'src/app/network/tasks/new/page.tsx',
    docPath: 'federated_network/N03_publish_task.md',
    title: 'N03 — Publish Public Research Task',
    screenId: 'N03',
    gate: 'P11',
    operations: ['POST /v1/network/tasks'],
    apiRef: 'api design.md §3.10',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Task broadcast interface to dispatch independent reproduction computations to decentralized A2A agent providers on the Arkiv board.'
  },
  {
    target: 'src/app/network/tasks/[taskId]/page.tsx',
    docPath: 'federated_network/N04_N05_task_detail.md',
    title: 'N04/N05 — Network Task Detail & A2A Session Telemetry',
    screenId: 'N04/N05',
    gate: 'P11',
    operations: ['GET /v1/network/tasks/{id}', 'GET /v1/network/tasks/{id}/sessions'],
    apiRef: 'api design.md §3.10',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Detailed claimant wallet inspections, single-award assignment state, and live A2A session telemetry stream.'
  },
  {
    target: 'src/app/network/arkiv/page.tsx',
    docPath: 'federated_network/N08_arkiv_explorer.md',
    title: 'N08 — Arkiv State & Transaction Explorer',
    screenId: 'N08',
    gate: 'P11',
    operations: ['POST /v1/arkiv/queries', 'GET /v1/arkiv/entities/{key}'],
    apiRef: 'api design.md §3.10',
    uxRef: 'dashboard design.md §5.7',
    summary: 'Direct cryptographic ledger viewer inspecting raw Sepolia transaction receipts, entity transitions, and state commitments.'
  },

  // Marine Companion
  {
    target: 'src/app/marine/page.tsx',
    docPath: 'marine/M01_M06_marine_landing.md',
    title: 'M01/M06 — Marine Companion & Real-Time Warning Centre',
    screenId: 'M01/M06',
    gate: 'P12',
    operations: ['GET /v1/marine/conditions', 'GET /v1/alerts/warnings'],
    apiRef: 'api design.md §3.11 & §3.12',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Coastal marine dashboard displaying live offshore buoy telemetry and official IMD/INCOIS cyclonic and high-wave advisories.'
  },
  {
    target: 'src/app/marine/conversations/page.tsx',
    docPath: 'marine/M02_conversations.md',
    title: 'M02 — Marine Conversations Library',
    screenId: 'M02',
    gate: 'P12',
    operations: ['GET /v1/conversations'],
    apiRef: 'api design.md §3.11',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Directory of prior natural language advisory chat threads with hazard detection badges and timestamps.'
  },
  {
    target: 'src/app/marine/conversations/[conversationId]/page.tsx',
    docPath: 'marine/M03_conversation_stream.md',
    title: 'M03 — Conversation Stream & Grounded Citations',
    screenId: 'M03',
    gate: 'P12',
    operations: ['GET /v1/conversations/{id}', 'POST /v1/conversations/{id}/messages'],
    apiRef: 'api design.md §3.11',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Interactive marine chat interface providing real-time oceanographic answers with official bulletin citations and squall banners.'
  },
  {
    target: 'src/app/marine/map/page.tsx',
    docPath: 'marine/M04_environmental_map.md',
    title: 'M04 — Oceanographic Conditions Map',
    screenId: 'M04',
    gate: 'P12',
    operations: ['GET /v1/marine/layers', 'GET /v1/marine/probes'],
    apiRef: 'api design.md §3.11',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Full GIS spatial layer viewer (SST, Waves, Chlorophyll-a, Cyclone Tracks) with interactive coordinate probe and accessible tabular fallback.'
  },
  {
    target: 'src/app/marine/fisheries/page.tsx',
    docPath: 'marine/M05_fisheries_pfz.md',
    title: 'M05 — Potential Fishing Zones (PFZ) & Statutory Boundaries',
    screenId: 'M05',
    gate: 'P12',
    operations: ['GET /v1/marine/pfz', 'GET /v1/marine/restrictions'],
    apiRef: 'api design.md §3.11',
    uxRef: 'dashboard design.md §5.8',
    summary: 'INCOIS satellite-derived PFZ advisory lines, expected pelagic species, and Marine National Park statutory ban boundaries.'
  },
  {
    target: 'src/app/marine/routes/page.tsx',
    docPath: 'marine/M07_routes.md',
    title: 'M07 — Maritime Route Hazard & Wave Exposure',
    screenId: 'M07',
    gate: 'P12',
    operations: ['POST /v1/marine/route-exposures'],
    apiRef: 'api design.md §3.11',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Voyage waypoint simulator computing peak significant wave heights, transit duration, and squall risk segments.'
  },
  {
    target: 'src/app/marine/alerts/page.tsx',
    docPath: 'marine/M08_alerts.md',
    title: 'M08 — Emergency Hazard Subscriptions & Alerts',
    screenId: 'M08',
    gate: 'P12',
    operations: ['GET /v1/alerts/subscriptions', 'POST /v1/alerts/subscriptions'],
    apiRef: 'api design.md §3.12',
    uxRef: 'dashboard design.md §5.8',
    summary: 'Multi-lingual emergency notification management across SMS, Voice sirens (Gujarati, Hindi, English), and Web Push.'
  },

  // Platform Ops
  {
    target: 'src/app/admin/system/page.tsx',
    docPath: 'admin/O01_system_readiness.md',
    title: 'O01 — Platform Readiness & Gate Matrix',
    screenId: 'O01',
    gate: 'P08',
    operations: ['GET /v1/meta', 'GET /v1/admin/readiness'],
    apiRef: 'api design.md §3.1 & §3.14',
    uxRef: 'dashboard design.md §5.10',
    summary: 'Complete platform readiness matrix tracking all 15 phase gates from P00 through P14 with pass/blocked criteria.'
  },
  {
    target: 'src/app/admin/sources/page.tsx',
    docPath: 'admin/O02_source_operations.md',
    title: 'O02 — Source Ingestion & Connector Operations',
    screenId: 'O02',
    gate: 'P08',
    operations: ['GET /v1/admin/sources', 'POST /v1/admin/sources/{id}/probe'],
    apiRef: 'api design.md §3.14',
    uxRef: 'dashboard design.md §5.10',
    summary: 'Operational monitoring of ERDDAP, CMEMS, and coastal buoy connectors with response latency and probe triggers.'
  },
  {
    target: 'src/app/admin/jobs/page.tsx',
    docPath: 'admin/O03_job_queues.md',
    title: 'O03 — Durable Computation Queues & Node Health',
    screenId: 'O03',
    gate: 'P08',
    operations: ['GET /v1/admin/jobs', 'POST /v1/admin/jobs/{id}/retry'],
    apiRef: 'api design.md §3.14',
    uxRef: 'dashboard design.md §5.10',
    summary: 'Hermetic worker pool state, running NetCDF processing tasks, queued jobs, and dead-letter queue managers.'
  },
  {
    target: 'src/app/admin/arkiv/page.tsx',
    docPath: 'admin/O05_arkiv_indexer.md',
    title: 'O05 — Arkiv On-Chain Indexer Operations',
    screenId: 'O05',
    gate: 'P11',
    operations: ['GET /v1/admin/arkiv', 'POST /v1/admin/arkiv/resync'],
    apiRef: 'api design.md §3.14',
    uxRef: 'dashboard design.md §5.10',
    summary: 'Sepolia block synchronization monitor, entity decoding status, event polling cadence, and manual resync controls.'
  },

  // Components & Layout
  {
    target: 'src/components/layout/Header.tsx',
    docPath: 'components/Header.md',
    title: 'Global Application Top Navigation Header',
    screenId: 'Global Header',
    gate: 'P02',
    operations: ['GET /v1/organizations', 'GET /v1/me'],
    apiRef: 'api design.md §3.1 & §3.2',
    uxRef: 'dashboard design.md §4',
    summary: 'Top 56px global bar containing the institutional organization switcher, mode selector, user principal badge, and alerts icon.'
  },
  {
    target: 'src/components/layout/Sidebar.tsx',
    docPath: 'components/Sidebar.md',
    title: 'Institutional Desktop Left Navigation Sidebar',
    screenId: 'Desktop Sidebar',
    gate: 'P02',
    operations: ['Navigation across all 46 routes'],
    apiRef: 'api design.md §0',
    uxRef: 'dashboard design.md §3.1 & §4',
    summary: '240px desktop left sidebar with hierarchical navigation groups (Institution, Federated Network, Marine Companion, Admin) and gate badges.'
  },
  {
    target: 'src/components/layout/Shell.tsx',
    docPath: 'components/Shell.md',
    title: 'Universal Application Frame (Header + Sidebar + Canvas)',
    screenId: 'Global Shell',
    gate: 'P02',
    operations: ['Frame Scaffolding'],
    apiRef: 'api design.md §0',
    uxRef: 'dashboard design.md §4',
    summary: 'High-level page wrapper coordinating the Header, Sidebar, and scrollable white content canvas.'
  },
  {
    target: 'src/components/ui/Badge.tsx',
    docPath: 'components/Badge.md',
    title: 'Accessible Monochrome Badge Component',
    screenId: 'UI Badge',
    gate: 'P02',
    operations: ['Visual Status Encoding'],
    apiRef: 'api design.md §0',
    uxRef: 'dashboard design.md §2',
    summary: 'Accessible status pill providing verified, warning, neutral, outline, and muted styles using monochrome borders and text.'
  },
  {
    target: 'src/components/ui/EmptyState.tsx',
    docPath: 'components/EmptyState.md',
    title: 'Mandatory System States Component (StateDisplay / EmptyState)',
    screenId: 'UI State Display',
    gate: 'P02',
    operations: ['Error & State Scaffolding'],
    apiRef: 'api design.md §11',
    uxRef: 'dashboard design.md §4.1',
    summary: 'Standardized rendering for loading, true empty, filtered empty, permission denied, unreleased feature, and retryable failure.'
  },
  {
    target: 'src/components/ui/StatusPill.tsx',
    docPath: 'components/StatusPill.md',
    title: 'Five Independent Status Indicators Component',
    screenId: 'UI Status Indicator',
    gate: 'P02',
    operations: ['Status Differentiation'],
    apiRef: 'api design.md §0',
    uxRef: 'dashboard design.md §2',
    summary: 'Encapsulates the five distinct trust indicators: ENS ownership, ORCA accreditation, A2A reachability, Arkiv confirmation, and scientific validity.'
  },

  // Lib & Types
  {
    target: 'src/lib/api-client.ts',
    docPath: 'lib_types/api_client.md',
    title: 'Typed RFC 9457 REST API Client',
    screenId: 'API Client Layer',
    gate: 'P02',
    operations: ['Core Network Layer'],
    apiRef: 'api design.md §2 & §11',
    uxRef: 'dashboard design.md §9',
    summary: 'Typed HTTP fetch wrapper injecting Bearer tokens, X-Request-ID, Idempotency-Key on mutations, and parsing RFC 9457 ProblemDetail errors.'
  },
  {
    target: 'src/lib/mock-data.ts',
    docPath: 'lib_types/mock_data.md',
    title: 'Synthetic Preview Harness & Fixture Registry',
    screenId: 'Mock Harness',
    gate: 'P01',
    operations: ['Synthetic Fixtures'],
    apiRef: 'api design.md §11.2',
    uxRef: 'dashboard design.md §1',
    summary: 'Contract-valid synthetic mock records tagged with fixture: true to guarantee truth boundaries and zero unverified claims.'
  },
  {
    target: 'src/types/api.ts',
    docPath: 'lib_types/api_types.md',
    title: 'Complete REST Contract TypeScript Definitions',
    screenId: 'API Types',
    gate: 'P00–P14',
    operations: ['220 Contract Schemas'],
    apiRef: 'api design.md §1 & §4–§11',
    uxRef: 'dashboard design.md §8',
    summary: 'TypeScript interfaces for organizations, projects, investigations, GeoJSON polygons, scientific artifacts, providers, and agents.'
  },
  {
    target: 'src/types/errors.ts',
    docPath: 'lib_types/errors_types.md',
    title: 'RFC 9457 Problem Details Error Registry',
    screenId: 'Error Types',
    gate: 'P01',
    operations: ['RFC 9457 Error Codes'],
    apiRef: 'api design.md §2.2',
    uxRef: 'dashboard design.md §9.4',
    summary: 'Strict error types including ProblemDetail schema, ErrorType enum, and helper functions to parse machine-readable API faults.'
  }
];

function generateMarkdown(item) {
  return `<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: ${item.target}
Screen ID: ${item.screenId}
Highest API Gate: ${item.gate}
Designed Operations: ${item.operations.join(', ')}
API Contract: ${item.apiRef}
UX Specification: ${item.uxRef}
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# ${item.title}

- **Source File:** [\`${item.target}\`](../../${item.target})
- **Screen Registry ID:** \`${item.screenId}\`
- **Highest Gate Referenced:** \`${item.gate}\`
- **Primary Contract:** [\`${item.apiRef}\`](../../api%20design.md)
- **UX Reference:** [\`${item.uxRef}\`](../../dashboard%20design.md)

---

## 1. Functional Overview
${item.summary}

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
${item.operations.map(op => `- \`${op}\``).join('\n')}

---

## 3. Visual & Interaction Design
- **Background Base:** Pure white (\`#FFFFFF\`) per \`dashboard design.md\` §2.
- **Borders & Dividers:** Subtle 1px neutral border (\`#E5E7EB\`).
- **Typography:** High-contrast neutral text (\`#111827\`) with secondary labels in \`#4B5563\`.
- **Status Representation:** Semantic monochrome badges without decorative neon colors.
- **Accessible States:** Declarative empty, loading, permission denied, and unreleased state fallbacks.

---

## 4. Truth Boundary Compliance
- When operating in test harness mode, all records are explicitly stamped with \`fixture: true\`.
- No unverified scientific finding or mock transaction is represented as live production proof until its underlying backend phase gate passes.
`;
}

function run() {
  for (const item of FILES_METADATA) {
    const fullPath = path.join(DOCS_DIR, item.docPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const content = generateMarkdown(item);
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Generated: ${item.docPath}`);
  }
  console.log(`Successfully generated ${FILES_METADATA.length} individual documentation files.`);
}

run();

