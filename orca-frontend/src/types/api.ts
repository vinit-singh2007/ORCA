/**
 * ORCA 3.0 — Core API Type Definitions & Canonical Contracts
 * 
 * Sourced directly from:
 * - api design.md §2.5 (Common DTOs)
 * - api design.md §4 (Canonical Request/Response DTO Specifications)
 * - api design.md §3 (14 Endpoint Families / 220 operations)
 * 
 * CONTRACT REVISION: 3.1.0-proposal
 * STATUS: Designed contracts. All timestamps UTC RFC 3339.
 * 
 * Rules enforced:
 * - Strict typing, no ambiguous anys
 * - UTC timestamps RFC 3339
 * - GeoScope GeoJSON coordinates [lon, lat]
 * - Currency amounts represented as decimal strings
 * - Every entity contains id, created_at, updated_at, etag
 */

export type UUID = string;
export type RFC3339UTC = string;
export type Digest = `sha256:${string}`;
export type AccessClass = 'public' | 'organization' | 'project' | 'restricted' | 'confidential';

export type ResearchRole =
  | 'org_owner'
  | 'org_admin'
  | 'principal_investigator'
  | 'researcher'
  | 'reviewer'
  | 'viewer'
  | 'agent_operator'
  | 'auditor'
  | 'platform_operator';

export type ReleaseProfile = 'core-A' | 'core-B' | 'core-C' | 'federation' | 'expanded';

export type ScientificStatus =
  | 'draft'
  | 'proposed'
  | 'supported'
  | 'unsupported'
  | 'insufficient_evidence'
  | 'inconclusive'
  | 'invalid'
  | 'superseded'
  | 'retracted';

export type ChainState =
  | 'not_requested'
  | 'pending'
  | 'submitted'
  | 'confirmed'
  | 'indexed'
  | 'unknown'
  | 'expired'
  | 'failed';

export type ReproductionVerdict = 'reproduced' | 'mismatch' | 'inconclusive' | 'blocked';

// ==========================================
// 1. Common DTOs (api design.md §2.5)
// ==========================================

export interface ResourceRef {
  type: string;
  id: UUID;
  version: string;
  digest?: Digest;
  access_class?: AccessClass;
}

export interface Page<T> {
  items: T[];
  next_cursor: string | null;
  page_size: number;
  total?: number;
}

export interface Operation {
  id: UUID;
  kind: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  resource_ref: ResourceRef;
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
  progress?: number;
  retry_after_seconds?: number;
  failure?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  links?: Record<string, string>;
}

export interface GeoScope {
  type: 'Point' | 'Polygon' | 'MultiPolygon';
  geometry: {
    type: 'Point' | 'Polygon' | 'MultiPolygon';
    coordinates: number[] | number[][] | number[][][];
  };
  crs?: 'EPSG:4326';
}

export interface TimeWindow {
  start: RFC3339UTC;
  end: RFC3339UTC;
  calendar?: string;
  temporal_resolution?: string;
}

export interface SourceClock {
  observed_at: RFC3339UTC | null;
  valid_at: RFC3339UTC | null;
  issued_at: RFC3339UTC | null;
  published_at: RFC3339UTC | null;
  available_at: RFC3339UTC | null;
  retrieved_at: RFC3339UTC | null;
  availability_status?: 'available' | 'unknown' | 'restricted' | 'retired';
}

export interface ScientificQuantity {
  value: number | null;
  unit: string;
  status: 'known' | 'unknown' | 'not_applicable';
  uncertainty?: number;
  method_id?: string;
  precision_policy?: string;
}

export interface ProvenanceRef {
  source_id: string;
  product_id: string;
  version_ref: string;
  snapshot_digest: Digest;
  license_ref?: string;
  quality_ref?: string;
  source_url?: string;
}

export interface MethodRef {
  method_id: string;
  method_version: string;
  code_digest: Digest;
  environment_digest?: Digest;
  parameters_digest?: Digest;
}

export interface ScientificOutcome {
  status: 'supported' | 'insufficient_evidence' | 'inconclusive' | 'invalid';
  claim_ids: UUID[];
  artifact_ids: UUID[];
  limitations?: string[];
  quality_metrics?: Record<string, number>;
  uncertainty?: {
    status: 'known' | 'unknown' | 'not_evaluated';
    reason?: string;
  };
}

export interface MoneyBudget {
  currency: 'USD';
  max_amount: string;
  spent_amount?: string;
  reserved_amount?: string;
}

export interface ChainReference {
  chain_id: number;
  tx_hash: string;
  entity_key: string;
  owner: string;
  state: ChainState;
  block_number?: string;
  observed_at?: RFC3339UTC;
  expires_at?: RFC3339UTC;
  index_confirmed_at?: RFC3339UTC;
}

// ==========================================
// 2. Identity & Tenant DTOs (§3.2 & §4.1)
// ==========================================

export interface CurrentPrincipal {
  user_id: UUID;
  orgs: Array<{
    org_id: UUID;
    org_name: string;
    role: ResearchRole;
  }>;
  roles: ResearchRole[];
  capabilities: string[];
}

export interface Organization {
  id: UUID;
  slug: string;
  name: string;
  display_name: string;
  visibility: 'public' | 'private';
  verification_status: 'unverified' | 'pending' | 'verified';
  settings: Record<string, unknown>;
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
  etag: string;
}

export interface OrganizationSummary {
  id: UUID;
  slug: string;
  name: string;
  visibility: 'public' | 'private';
  verification_status: 'unverified' | 'pending' | 'verified';
}

export interface Member {
  id: UUID;
  user_id: UUID;
  display_name: string;
  email?: string;
  role: ResearchRole;
  status: 'active' | 'suspended' | 'removed';
  joined_at: RFC3339UTC;
  updated_at: RFC3339UTC;
  etag: string;
}

export interface AccessGrant {
  id: UUID;
  issuer_id: UUID;
  resource_ref: { type: string; id: UUID };
  principal_ref: { type: 'user' | 'organization' | 'agent'; id: string };
  scopes: string[];
  data_license_ref: string | null;
  valid_from: RFC3339UTC;
  expires_at: RFC3339UTC | null;
  revoked_at: RFC3339UTC | null;
}

// ==========================================
// 3. Research Project & Investigation DTOs
// ==========================================

export interface ResearchProject {
  id: UUID;
  organization_id: UUID;
  name: string;
  description: string | null;
  access_class: AccessClass;
  state: 'active' | 'archived';
  default_data_policy?: string;
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
  etag: string;
}

export interface InvestigationSummary {
  id: UUID;
  project_id: UUID;
  question: string;
  state: 'draft' | 'plan_pending' | 'plan_ready' | 'approved' | 'queued' | 'running' | 'succeeded_supported' | 'succeeded_insufficient' | 'failed' | 'cancelled' | 'inconclusive';
  scientific_status?: ScientificStatus;
  updated_at: RFC3339UTC;
  created_at: RFC3339UTC;
}

export interface Investigation {
  id: UUID;
  project_id: UUID;
  question: string;
  description?: string;
  geo_scope: GeoScope;
  time_window: TimeWindow;
  as_of?: RFC3339UTC;
  risk_tier: 'research' | 'operational' | 'safety_critical';
  state: 'draft' | 'plan_pending' | 'plan_ready' | 'approved' | 'queued' | 'running' | 'succeeded_supported' | 'succeeded_insufficient' | 'failed' | 'cancelled' | 'inconclusive';
  scientific_status?: ScientificStatus;
  source_readiness?: 'unknown' | 'available' | 'unavailable' | 'degraded';
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
  etag: string;
}

export interface InvestigationPlan {
  id: UUID;
  investigation_id: UUID;
  version: number;
  plan_digest: Digest;
  strategy: 'typed' | 'composite';
  method_hint?: string;
  method: MethodRef;
  assumptions: string[];
  source_products: string[];
  baseline_ref: string;
  budget: MoneyBudget;
  status: 'draft' | 'ready_for_approval' | 'approved' | 'superseded';
  created_at: RFC3339UTC;
}

export interface ApprovedPlan {
  plan_id: UUID;
  approved_digest: Digest;
  approved_by: UUID;
  approved_at: RFC3339UTC;
  approver_comment?: string;
}

export interface ComputeRun {
  id: UUID;
  investigation_id: UUID;
  plan_id: UUID;
  stage: 'queued' | 'fetching_sources' | 'qc_validation' | 'calculating_anomaly' | 'generating_evidence' | 'completed' | 'failed';
  lease_status: 'active' | 'expired' | 'released';
  worker_id: string;
  fencing_token: number;
  started_at: RFC3339UTC;
  completed_at?: RFC3339UTC;
  scientific_outcome?: ScientificOutcome;
}

export interface InvestigationEvent {
  event_id: string;
  sequence: number;
  investigation_id: UUID;
  time: RFC3339UTC;
  type: string;
  visibility: 'project' | 'organization' | 'public';
  payload: Record<string, unknown>;
}

export interface ScientificArtifact {
  id: UUID;
  investigation_id: UUID;
  run_id: UUID;
  method_ref: MethodRef;
  recipe_digest: Digest;
  input_snapshots: Array<{
    snapshot_id: UUID;
    digest: Digest;
  }>;
  result: {
    scientific_status: ScientificStatus;
    values: ScientificQuantity[];
    units: string;
    area_coverage_fraction: number | null;
    time_coverage_fraction: number | null;
    uncertainty: {
      status: 'known' | 'unknown' | 'not_evaluated';
      reason?: string;
    };
    limitations: string[];
  };
  claims: UUID[];
  provenance: {
    environment_digest: Digest;
    outputs: Array<{ path: string; digest: Digest }>;
  };
  signatures: string[];
  created_at: RFC3339UTC;
}

export interface EvidenceSummary {
  supported: number;
  uncertain: number;
  missing: number;
}

// ==========================================
// 4. Catalog & Data Sources (§3.4)
// ==========================================

export interface SourceProvider {
  id: UUID;
  name: string;
  slug: string;
  source_class: 'government_oceanographic' | 'meteorological' | 'academic' | 'satellite_operator';
  status: 'available' | 'unknown' | 'restricted' | 'unavailable';
  description?: string;
  homepage_url?: string;
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
}

export interface ScientificProduct {
  id: UUID;
  provider_id: UUID;
  name: string;
  slug: string;
  kind: 'observational' | 'forecast' | 'reanalysis' | 'static';
  variable: string;
  canonical_unit: string;
  resolution_spatial: string;
  resolution_temporal: string;
  license_type: 'open_access' | 'academic_only' | 'commercial_restricted';
  status: 'candidate' | 'verified_in_use' | 'deprecated';
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
}

export interface DatasetSnapshot {
  id: UUID;
  source_id: string;
  product_id: string;
  product_version: string;
  distribution_id: string;
  variable: {
    canonical_name: string;
    native_name: string;
    native_units: string;
    normalized_units: string;
    physical_definition: string;
    depth_or_vertical_coordinate: string | null;
  };
  scope: {
    geometry_ref: string;
    time_window: TimeWindow;
    calendar: string;
  };
  source_clocks: SourceClock;
  qc_profile: {
    status: string;
    flags_mapping_ref: string | null;
  };
  rights: {
    license_ref: string;
    can_redistribute: boolean;
  };
  artifact_digest: Digest;
  status: 'candidate_not_live_verified' | 'verified_snapshot' | 'invalidated';
}

// ==========================================
// 5. Scientific Review & Reproduction (§3.8)
// ==========================================

export interface ReproductionRun {
  id: UUID;
  artifact_id: UUID;
  reviewer_id: UUID;
  original_artifact_digest: Digest;
  independent_result_digest: Digest | null;
  verdict: ReproductionVerdict;
  numerical_differences: Array<{
    variable: string;
    delta: number | null;
    tolerance: number | null;
  }>;
  scientific_caveats: string[];
  run_started_at: RFC3339UTC;
  run_finished_at: RFC3339UTC | null;
}

export interface ScientificChallenge {
  id: UUID;
  artifact_id: UUID;
  challenger_id: UUID;
  discrepancy_type: 'baseline_mismatch' | 'unit_conversion_error' | 'qc_mask_omission' | 'temporal_leakage';
  claim_ids: UUID[];
  status: 'OPEN' | 'RESPONDED' | 'RESOLVED' | 'INCONCLUSIVE';
  explanation: string;
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
}

// ==========================================
// 6. Federation, Agents & Arkiv (§3.10-§3.12)
// ==========================================

export interface AgentSummary {
  id: UUID;
  organization_id: UUID;
  name: string;
  kind: 'orca_hosted' | 'institution_hosted_a2a' | 'tool_or_dataset_only';
  declared_capabilities: string[];
  trust_state: 'unverified' | 'verified' | 'revoked' | 'expired';
  ens_name: string | null;
  a2a_agent_card_ref: string | null;
  endpoint_uri?: string;
  card_url?: string;
  supported_methods?: string[];
  created_at: RFC3339UTC;
  updated_at: RFC3339UTC;
}

export type AgentRecord = AgentSummary;

export type InvestigationRun = ComputeRun;

export interface InvestigationReport {
  id: string;
  investigation_id: UUID;
  title: string;
  summary: string;
  published_at?: RFC3339UTC;
  doi?: string;
  status: 'draft' | 'published';
}

export interface CrossChainBinding {
  id: UUID;
  agent_id: UUID;
  domain: 'orca.agent-binding';
  audience: string;
  ens: {
    chain_id: number;
    name: string;
    resolver: string;
    controller: string;
    resolved_block: string;
  };
  arkiv: {
    chain_id: number;
    wallet: string;
  };
  a2a: {
    public_key_id: string;
    endpoint_origin: string;
  };
  organization_credential_ref: string | null;
  scopes: string[];
  issued_at: RFC3339UTC;
  expires_at: RFC3339UTC;
  nonce: string;
  revocation_epoch: number;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired' | 'revoked';
}

export interface ExternalTask {
  id: UUID;
  public_id: string;
  investigation_id: UUID;
  title: string;
  required_capability: string;
  assignment_policy: 'single' | 'multi';
  deadline: RFC3339UTC;
  local_status: string;
  chain_state: ChainState;
  arkiv_entity_ref: string | null;
  created_at: RFC3339UTC;
}

export interface TaskClaim {
  id: UUID;
  external_task_id: UUID;
  agent_id: UUID;
  binding_id: UUID;
  claimant_wallet: string;
  availability: string;
  budget_offer?: string;
  chain_state: ChainState;
  submitted_at: RFC3339UTC;
}

// ==========================================
// 7. Marine & Operational DTOs (§3.13)
// ==========================================

export interface MarineConditions {
  location: { lat: number; lon: number; name?: string };
  observed_at: RFC3339UTC;
  valid_at: RFC3339UTC;
  sst_celsius: number | null;
  wave_height_meters: number | null;
  wind_speed_knots: number | null;
  wind_direction_deg: number | null;
  source_provider: string;
  source_clock: SourceClock;
}

export interface OfficialWarning {
  id: UUID;
  issuer: 'IMD' | 'INCOIS' | 'NOAA' | 'COPERNICUS';
  hazard_type: 'cyclone' | 'high_wave' | 'heavy_rain' | 'gale_wind' | 'tsunami';
  severity: 'advisory' | 'watch' | 'warning' | 'severe';
  title: string;
  description: string;
  issued_at: RFC3339UTC;
  valid_from: RFC3339UTC;
  valid_until: RFC3339UTC;
  affected_regions: string[];
  source_reference_url?: string;
}

export interface APIMetadata {
  revision: string;
  release_profile: ReleaseProfile;
  enabled_capabilities: Record<string, {
    implemented: boolean;
    live_verified: boolean;
  }>;
}

