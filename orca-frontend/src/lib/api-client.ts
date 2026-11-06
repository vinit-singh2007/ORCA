/**
 * ORCA 3.0 — Typed API Client & Gateway Interface
 * 
 * Sourced directly from:
 * - api design.md §2 (Global HTTP contract)
 * - api design.md §2.1 (URL, media types, lifecycle)
 * - api design.md §2.2 (Authentication / authorization)
 * - api design.md §2.4 (RFC 9457 Problem Details)
 * - api design.md §3 (Operation inventory: 220 operations across 14 families)
 * 
 * Features:
 * - Bearer OIDC token injection
 * - Automatic X-Request-ID correlation header
 * - Automatic Idempotency-Key on POST/PUT mutations
 * - If-Match requirement support for versioned updates
 * - RFC 9457 structured error handling
 * - Configurable via NEXT_PUBLIC_ORCA_API_URL
 */

import { ProblemDetail } from '@/types/errors';
import * as T from '@/types/api';

export interface ApiClientConfig {
  baseUrl?: string;
  getAuthToken?: () => Promise<string | null> | string | null;
  orgId?: string;
}

export class OrcaApiError extends Error {
  public problem: ProblemDetail;
  public status: number;

  constructor(status: number, problem: ProblemDetail) {
    super(problem.detail || problem.title || `HTTP ${status}`);
    this.name = 'OrcaApiError';
    this.status = status;
    this.problem = problem;
  }
}

/**
 * Creates an instance of the configured ORCA API client.
 */
export class OrcaApiClient {
  private baseUrl: string;
  private getAuthToken?: () => Promise<string | null> | string | null;
  private orgId?: string;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl =
      config.baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_ORCA_API_URL ||
      'https://orca.130.210.15.82.sslip.io';
    this.getAuthToken = config.getAuthToken;
    this.orgId = config.orgId;
  }

  /**
   * Generates a standard random UUID v4 for request correlation and idempotency keys.
   */
  public generateIdempotencyKey(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Internal generic fetch wrapper enforcing RFC 9457 and ORCA headers.
   */
  async request<R>(
    endpoint: string,
    options: RequestInit & {
      idempotencyKey?: string;
      etag?: string;
      params?: Record<string, string | number | boolean | undefined>;
    } = {}
  ): Promise<R> {
    const { idempotencyKey, etag, params, headers: customHeaders, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-Request-ID': this.generateIdempotencyKey(),
      ...((customHeaders as Record<string, string>) || {}),
    };

    if (this.orgId && !headers['X-Organization-ID']) {
      headers['X-Organization-ID'] = this.orgId;
    }

    // Append Auth Bearer token if available
    let token: string | null = null;
    if (this.getAuthToken) {
      token = await this.getAuthToken();
    } else if (typeof window !== 'undefined') {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token || null;
      } catch {
        // Fallback if supabase not yet initialized
      }
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Required for mutations: Idempotency-Key
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(fetchOptions.method?.toUpperCase() || '')) {
      headers['Idempotency-Key'] = idempotencyKey || this.generateIdempotencyKey();
    }

    // Required for conditional mutations: If-Match
    if (etag) {
      headers['If-Match'] = etag;
    }

    if (fetchOptions.body && typeof fetchOptions.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        credentials: 'omit',
        ...fetchOptions,
        headers,
      });

      // 204 No Content
      if (response.status === 204) {
        return undefined as unknown as R;
      }

      // Check for error response (RFC 9457)
      if (!response.ok) {
        let problem: ProblemDetail;
        try {
          problem = await response.json();
        } catch {
          problem = {
            type: 'https://docs.orca.example/problems/http-error',
            title: response.statusText || 'HTTP Request Failed',
            status: response.status,
            detail: `Request to ${endpoint} failed with status ${response.status}`,
            instance: endpoint,
            code: `HTTP_${response.status}`,
            request_id: headers['X-Request-ID'],
            retryable: response.status >= 500,
          };
        }
        throw new OrcaApiError(response.status, problem);
      }

      return (await response.json()) as R;
    } catch (err: unknown) {
      if (err instanceof OrcaApiError) {
        throw err;
      }
      // Network failure
      throw new OrcaApiError(503, {
        type: 'https://docs.orca.example/problems/network-failure',
        title: 'Backend Connection Refused / Network Error',
        status: 503,
        detail: (err as Error).message || `Unable to connect to ORCA API gateway at ${this.baseUrl}${endpoint}`,
        instance: endpoint,
        code: 'SOURCE_UNAVAILABLE',
        request_id: headers['X-Request-ID'] || '',
        retryable: true,
      });
    }
  }

  // ========================================================
  // §3.1 Runtime Identity, Capability & Contract Metadata
  // ========================================================

  /** GET /livez - Gateway process liveness */
  async livez(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/livez');
  }

  async getLivez() {
    return this.request<{ status: 'alive' }>('/livez');
  }

  /** GET /readyz - Component readiness */
  async getReadyz() {
    return this.request<{
      components: Record<string, boolean>;
      release_profile: string;
      blocked_gates: string[];
    }>('/readyz');
  }

  /** GET /v1/meta - Capabilities metadata */
  async getMeta() {
    return this.request<T.APIMetadata>('/v1/meta');
  }

  /** GET /v1/operations - Async operations list */
  async listOperations(params?: { state?: string; kind?: string; cursor?: string; limit?: number }) {
    return this.request<T.Page<T.Operation>>('/v1/operations', { params });
  }

  /** GET /v1/operations/{id} - Async operation detail */
  async getOperation(operationId: string) {
    return this.request<T.Operation>(`/v1/operations/${operationId}`);
  }

  // ========================================================
  // §3.2 Identity, Organizations, Membership & Access Grants
  // ========================================================

  /** GET /v1/me - Principal identity and memberships */
  async me(): Promise<T.CurrentUser> {
    return this.request<T.CurrentUser>('/v1/me');
  }

  async getMe() {
    return this.request<T.CurrentPrincipal>('/v1/me');
  }

  /** GET /v1/organizations - Permitted organizations list */
  async listOrganizations(cursorOrParams?: string | { limit?: number; cursor?: string }, limit?: number) {
    if (typeof cursorOrParams === 'object' && cursorOrParams !== null) {
      return this.request<T.OrganizationPage>('/v1/organizations', { params: cursorOrParams as Record<string, any> });
    }
    return this.request<T.OrganizationPage>('/v1/organizations', {
      params: { cursor: cursorOrParams, limit },
    });
  }

  // ========================================================
  // Real Research Demo API (Handoff 6 Nov 2026 §9)
  // ========================================================

  /** GET /v1/demo/research-runs/{result_id} - Real descriptive SST result */
  async getDemoResult(resultId: string, organizationId: string): Promise<T.DemoResult> {
    return this.request<T.DemoResult>(`/v1/demo/research-runs/${resultId}`, {
      params: { organization_id: organizationId },
    });
  }

  /** POST /v1/demo/research-runs - Recompute from stored snapshot */
  async recomputeDemoRun(organizationId: string, snapshotId: string): Promise<T.DemoResult> {
    return this.request<T.DemoResult>('/v1/demo/research-runs', {
      method: 'POST',
      body: JSON.stringify({
        organization_id: organizationId,
        snapshot_id: snapshotId,
      }),
    });
  }

  /** POST /v1/demo/research-runs/{result_id}/public-export - Generate minimal public reference */
  async exportDemoPublicReference(
    resultId: string,
    organizationId: string,
    snapshotId: string
  ): Promise<T.DemoPublicExport> {
    return this.request<T.DemoPublicExport>(`/v1/demo/research-runs/${resultId}/public-export`, {
      method: 'POST',
      body: JSON.stringify({
        organization_id: organizationId,
        snapshot_id: snapshotId,
      }),
    });
  }

  /** POST /v1/organizations - Create institutional organization */
  async createOrganization(body: { name: string; slug: string; visibility: 'public' | 'private' }) {
    return this.request<T.Organization>('/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/organizations/{org_id} - Organization details */
  async getOrganization(orgId: string) {
    return this.request<T.Organization>(`/v1/organizations/${orgId}`);
  }

  /** PATCH /v1/organizations/{org_id} - Update organization settings */
  async patchOrganization(orgId: string, body: Record<string, unknown>, etag?: string) {
    return this.request<T.Organization>(`/v1/organizations/${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      etag,
    });
  }

  /** GET /v1/organizations/{org_id}/members - Member roster */
  async listMembers(orgId: string, params?: { cursor?: string; limit?: number; role?: string }) {
    return this.request<T.Page<T.Member>>(`/v1/organizations/${orgId}/members`, { params });
  }

  /** POST /v1/organizations/{org_id}/invitations - Send member invite */
  async createInvitation(orgId: string, body: { email: string; role: string; expires_at?: string }) {
    return this.request<{ id: string; email: string; role: string; token: string }>(
      `/v1/organizations/${orgId}/invitations`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  /** GET /v1/organizations/{org_id}/policies - Security and data policies */
  async getOrgPolicies(orgId: string) {
    return this.request<Record<string, unknown>>(`/v1/organizations/${orgId}/policies`);
  }

  /** GET /v1/organizations/{org_id}/access-grants - Active cross-tenant access grants */
  async listAccessGrants(orgId: string, params?: { resource?: string; principal?: string; cursor?: string }) {
    return this.request<T.Page<T.AccessGrant>>(`/v1/organizations/${orgId}/access-grants`, { params });
  }

  /** GET /v1/organizations/{org_id}/usage - Resource usage and accounting */
  async getOrgUsage(orgId: string) {
    return this.request<{
      compute_hours_used: number;
      compute_hours_limit: number;
      storage_bytes_used: number;
      storage_bytes_limit: number;
      active_investigations: number;
    }>(`/v1/organizations/${orgId}/usage`);
  }

  // ========================================================
  // §3.3 Research Projects, Memberships & Storage
  // ========================================================

  /** GET /v1/research/projects - Research projects list */
  async listProjects(params?: { organization_id?: string; org_id?: string; cursor?: string; limit?: number; state?: string }) {
    const queryParams: Record<string, any> = { ...params };
    if (queryParams.org_id && !queryParams.organization_id) {
      queryParams.organization_id = queryParams.org_id;
    }
    return this.request<T.Page<T.ResearchProject>>('/v1/research/projects', { params: queryParams });
  }

  /** POST /v1/research/projects - Create research project */
  async createProject(body: {
    organization_id: string;
    name: string;
    slug: string;
    description?: string;
    visibility: 'organization' | 'project' | 'restricted' | 'confidential';
  }) {
    return this.request<T.ResearchProject>('/v1/research/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/research/projects/{project_id} - Project details */
  async getProject(projectId: string) {
    return this.request<T.ResearchProject>(`/v1/research/projects/${projectId}`);
  }

  /** PATCH /v1/research/projects/{project_id} - Update project metadata */
  async patchProject(projectId: string, body: Partial<T.ResearchProject>, etag?: string) {
    return this.request<T.ResearchProject>(`/v1/research/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      etag,
    });
  }

  /** POST /v1/research/projects/{project_id}/archive - Archive project */
  async archiveProject(projectId: string, body: { reason: string }, etag?: string) {
    return this.request<T.ResearchProject>(`/v1/research/projects/${projectId}/archive`, {
      method: 'POST',
      body: JSON.stringify(body),
      etag,
    });
  }

  /** GET /v1/research/projects/{project_id}/members - Project members */
  async listProjectMembers(projectId: string, params?: { cursor?: string; limit?: number }) {
    return this.request<T.Page<T.Member>>(`/v1/research/projects/${projectId}/members`, { params });
  }

  /** POST /v1/research/projects/{project_id}/members - Add project collaborator */
  async addProjectMember(projectId: string, body: { principal_id: string; role: string }) {
    return this.request<T.Member>(`/v1/research/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/research/projects/{project_id}/uploads - Staged file upload intent */
  async createUploadIntent(
    projectId: string,
    body: {
      filename: string;
      media_type: string;
      size_bytes: number;
      sha256: string;
      classification: string;
    }
  ) {
    return this.request<{
      upload_id: string;
      parts: Array<{ part_number: number; upload_url: string }>;
      expires_at: string;
    }>(`/v1/research/projects/${projectId}/uploads`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/research/uploads/{upload_id}/complete - Complete upload */
  async completeUpload(uploadId: string, body: { part_etags: string[]; sha256: string }) {
    return this.request<{ status: 'pending_validation' | 'verified'; artifact_id?: string }>(
      `/v1/research/uploads/${uploadId}/complete`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  // ========================================================
  // §3.4 Scientific Catalog & Data Connectors
  // ========================================================

  /** GET /v1/catalog/providers - Registered source data providers */
  async listProviders(params?: { cursor?: string; limit?: number; source_class?: string }) {
    return this.request<T.Page<T.SourceProvider>>('/v1/catalog/providers', { params });
  }

  /** GET /v1/catalog/providers/{id} - Provider details */
  async getProvider(id: string) {
    return this.request<T.SourceProvider>(`/v1/catalog/providers/${id}`);
  }

  /** GET /v1/catalog/products - Marine product catalog */
  async listProducts(params?: {
    cursor?: string;
    limit?: number;
    kind?: string;
    variable?: string;
    provider_id?: string;
  }) {
    return this.request<T.Page<T.ScientificProduct>>('/v1/catalog/products', { params });
  }

  /** GET /v1/catalog/products/{id} - Product details */
  async getProduct(id: string) {
    return this.request<T.ScientificProduct>(`/v1/catalog/products/${id}`);
  }

  /** GET /v1/catalog/snapshots - Pinned dataset snapshots */
  async listSnapshots(params?: { product_id?: string; cursor?: string; limit?: number }) {
    return this.request<T.Page<T.DatasetSnapshot>>('/v1/catalog/snapshots', { params });
  }

  /** GET /v1/catalog/snapshots/{id} - Snapshot details */
  async getSnapshot(id: string) {
    return this.request<T.DatasetSnapshot>(`/v1/catalog/snapshots/${id}`);
  }

  /** GET /v1/catalog/snapshots/{id}/manifest - Inspect SHA-256 manifest */
  async getSnapshotManifest(id: string) {
    return this.request<{
      snapshot_id: string;
      sha256_digest: string;
      byte_size: number;
      files: Array<{ path: string; sha256: string; byte_size: number }>;
    }>(`/v1/catalog/snapshots/${id}/manifest`);
  }

  /** POST /v1/catalog/compatibility-checks - Check dataset pair compatibility */
  async checkCompatibility(body: {
    product_a_id: string;
    product_b_id: string;
    method_id: string;
  }) {
    return this.request<{
      compatible: boolean;
      crs_match: boolean;
      grid_resolution_ratio: string;
      unit_match: boolean;
      regrid_strategy: string;
      notices: string[];
    }>('/v1/catalog/compatibility-checks', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ========================================================
  // §3.5 Scientific Methods & Recipe Templates
  // ========================================================

  /** GET /v1/science/methods - Scientific method registry */
  async listMethods(params?: { cursor?: string; limit?: number; category?: string }) {
    return this.request<T.Page<{
      id: string;
      name: string;
      version: string;
      category: string;
      description: string;
      formula: string;
      input_variables: string[];
      output_variable: string;
      code_digest: string;
    }>>('/v1/science/methods', { params });
  }

  /** GET /v1/science/methods/{id} - Method details and schema */
  async getMethod(id: string) {
    return this.request<{
      id: string;
      name: string;
      version: string;
      category: string;
      description: string;
      formula: string;
      input_variables: string[];
      output_variable: string;
      code_digest: string;
      assumptions: string[];
    }>(`/v1/science/methods/${id}`);
  }

  /** GET /v1/science/recipe-templates - Canonical recipe blueprints */
  async listRecipeTemplates(params?: { method_id?: string; cursor?: string }) {
    return this.request<T.Page<{
      id: string;
      method_id: string;
      title: string;
      template_json: string;
    }>>('/v1/science/recipe-templates', { params });
  }

  /** POST /v1/science/recipes/validate - Dry-run recipe validation */
  async validateRecipe(recipePayload: Record<string, unknown>) {
    return this.request<{
      valid: boolean;
      plan_digest?: string;
      errors?: Array<{ path: string; message: string }>;
    }>('/v1/science/recipes/validate', {
      method: 'POST',
      body: JSON.stringify(recipePayload),
    });
  }

  // ========================================================
  // §3.6 Research Investigations & Durable Computation
  // ========================================================

  /** GET /v1/research/investigations - Investigations list */
  async listInvestigations(params?: {
    project_id?: string;
    state?: string;
    cursor?: string;
    limit?: number;
  }) {
    return this.request<T.Page<T.InvestigationSummary>>('/v1/research/investigations', { params });
  }

  /** POST /v1/research/investigations - Formulate new investigation */
  async createInvestigation(body: {
    project_id: string;
    question: string;
    description?: string;
    geo_scope: T.GeoScope;
    time_window: T.TimeWindow;
    risk_tier: 'research' | 'operational' | 'safety_critical';
  }) {
    return this.request<T.Investigation>('/v1/research/investigations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/research/investigations/{id} - Full investigation details */
  async getInvestigation(id: string) {
    return this.request<T.Investigation>(`/v1/research/investigations/${id}`);
  }

  /** POST /v1/research/investigations/{id}/plans - Submit computational plan */
  async createInvestigationPlan(
    investigationId: string,
    body: {
      strategy: 'typed' | 'composite';
      method_hint?: string;
      method: T.MethodRef;
      assumptions: string[];
      source_products: string[];
      baseline_ref: string;
      budget: T.MoneyBudget;
    }
  ) {
    return this.request<T.InvestigationPlan>(`/v1/research/investigations/${investigationId}/plans`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/research/investigations/{id}/plans/{plan_id}/approve - Formally approve plan */
  async approveInvestigationPlan(
    investigationId: string,
    planId: string,
    body: { approver_comment?: string }
  ) {
    return this.request<T.ApprovedPlan>(
      `/v1/research/investigations/${investigationId}/plans/${planId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  /** POST /v1/research/investigations/{id}/runs - Trigger durable computation run */
  async startInvestigationRun(investigationId: string, body?: { plan_id?: string }) {
    return this.request<T.ComputeRun>(`/v1/research/investigations/${investigationId}/runs`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    });
  }

  /** GET /v1/research/investigations/{id}/outcome - Final scientific outcome */
  async getInvestigationOutcome(investigationId: string) {
    return this.request<T.ScientificOutcome>(`/v1/research/investigations/${investigationId}/outcome`);
  }

  // ========================================================
  // §3.7 Scientific Artifacts, Lineage, Reports & Exports
  // ========================================================

  /** GET /v1/research/investigations/{id}/artifacts - Artifact list */
  async listInvestigationArtifacts(investigationId: string, params?: { cursor?: string; limit?: number }) {
    return this.request<T.Page<T.ScientificArtifact>>(
      `/v1/research/investigations/${investigationId}/artifacts`,
      { params }
    );
  }

  /** GET /v1/research/artifacts/{id} - Inspect single scientific artifact */
  async getArtifact(artifactId: string) {
    return this.request<T.ScientificArtifact>(`/v1/research/artifacts/${artifactId}`);
  }

  /** GET /v1/research/artifacts/{id}/lineage - Provenance DAG */
  async getArtifactLineage(artifactId: string) {
    return this.request<{
      artifact_id: string;
      parents: Array<{ id: string; type: string; digest: string }>;
      method: T.MethodRef;
      environment: { digest: string };
      source_snapshots: Array<{ id: string; digest: string }>;
    }>(`/v1/research/artifacts/${artifactId}/lineage`);
  }

  /** GET /v1/research/investigations/{id}/reports - Study reports */
  async listInvestigationReports(investigationId: string, params?: { cursor?: string }) {
    return this.request<T.Page<{
      id: string;
      investigation_id: string;
      title: string;
      status: 'draft' | 'approved' | 'published';
      published_at?: string;
      doi?: string;
      summary: string;
    }>>(`/v1/research/investigations/${investigationId}/reports`, { params });
  }

  /** POST /v1/research/investigations/{id}/reports/{reportId}/publish - Publish report */
  async publishReport(investigationId: string, reportId: string) {
    return this.request<{
      id: string;
      status: 'published';
      published_at: string;
      doi: string;
    }>(`/v1/research/investigations/${investigationId}/reports/${reportId}/publish`, {
      method: 'POST',
    });
  }

  /** GET /v1/research/investigations/{id}/runs - Compute runs */
  async listInvestigationRuns(investigationId: string, params?: { cursor?: string; limit?: number }) {
    return this.request<T.Page<T.ComputeRun>>(`/v1/research/investigations/${investigationId}/runs`, { params });
  }

  /** POST /v1/research/investigations/{id}/exports - Request reproducibility export bundle */
  async createInvestigationExport(
    investigationId: string,
    body: { format: 'zip' | 'tar.gz'; include_raw_snapshots: boolean }
  ) {
    return this.request<{
      export_id: string;
      status: 'queued' | 'ready';
      download_url?: string;
      expires_at?: string;
      sha256?: string;
    }>(`/v1/research/investigations/${investigationId}/exports`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/research/exports/{id} - Poll export status */
  async getExport(exportId: string) {
    return this.request<{
      export_id: string;
      status: 'queued' | 'ready' | 'failed';
      download_url?: string;
      expires_at?: string;
      sha256?: string;
    }>(`/v1/research/exports/${exportId}`);
  }

  // ========================================================
  // §3.8 Reproductions, Peer Reviews & Challenges
  // ========================================================

  /** GET /v1/research/artifacts/{id}/reproductions - Independent reproduction runs */
  async listReproductions(artifactId: string, params?: { cursor?: string }) {
    return this.request<T.Page<T.ReproductionRun>>(`/v1/research/artifacts/${artifactId}/reproductions`, { params });
  }

  /** POST /v1/research/artifacts/{id}/reproductions - Initiate reproduction check */
  async createReproduction(artifactId: string, body?: Record<string, unknown>) {
    return this.request<T.ReproductionRun>(`/v1/research/artifacts/${artifactId}/reproductions`, {
      method: 'POST',
      body: JSON.stringify(body || {}),
    });
  }

  /** GET /v1/research/artifacts/{id}/reviews - Peer reviews */
  async listReviews(artifactId: string, params?: { cursor?: string }) {
    return this.request<T.Page<{
      id: string;
      artifact_id: string;
      reviewer_id: string;
      verdict: T.ReproductionVerdict;
      statement: string;
      signature?: string;
      created_at: string;
    }>>(`/v1/research/artifacts/${artifactId}/reviews`, { params });
  }

  /** POST /v1/research/artifacts/{id}/reviews - Submit formal scientific verdict */
  async createReview(
    artifactId: string,
    body: {
      verdict: T.ReproductionVerdict;
      statement: string;
      signature?: string;
    }
  ) {
    return this.request<{
      id: string;
      artifact_id: string;
      verdict: T.ReproductionVerdict;
      created_at: string;
    }>(`/v1/research/artifacts/${artifactId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/research/reviews/{id} - Review details */
  async getReview(reviewId: string) {
    return this.request<{
      id: string;
      artifact_id: string;
      reviewer_id: string;
      verdict: T.ReproductionVerdict;
      statement: string;
      numerical_differences?: Array<{ variable: string; delta: number; tolerance: number }>;
      created_at: string;
    }>(`/v1/research/reviews/${reviewId}`);
  }

  /** POST /v1/research/artifacts/{id}/challenges - Submit methodological dispute */
  async createChallenge(
    artifactId: string,
    body: {
      discrepancy_type: 'baseline_mismatch' | 'unit_conversion_error' | 'qc_mask_omission' | 'temporal_leakage';
      explanation: string;
      claim_ids?: string[];
    }
  ) {
    return this.request<T.ScientificChallenge>(`/v1/research/artifacts/${artifactId}/challenges`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ========================================================
  // §3.10 Federation Agent Registry & Discovery
  // ========================================================

  /** GET /v1/network/agents - Discover public/institutional agents */
  async listAgents(params?: {
    cursor?: string;
    limit?: number;
    capability?: string;
    trust_state?: string;
    organization_id?: string;
  }) {
    return this.request<T.Page<T.AgentSummary>>('/v1/network/agents', { params });
  }

  /** POST /v1/network/agents - Register new external A2A agent */
  async registerAgent(body: {
    name: string;
    kind: 'orca_hosted' | 'institution_hosted_a2a' | 'tool_or_dataset_only';
    declared_capabilities: string[];
    a2a_endpoint_uri: string;
    a2a_agent_card_url?: string;
    auth_scheme: string;
  }) {
    return this.request<T.AgentSummary>('/v1/network/agents', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/network/agents/{id} - Agent details */
  async getAgent(id: string) {
    return this.request<T.AgentSummary>(`/v1/network/agents/${id}`);
  }

  /** GET /v1/network/agents/{id}/capabilities - Capabilities descriptors */
  async getAgentCapabilities(id: string) {
    return this.request<{
      agent_id: string;
      capabilities: Array<{
        method_id: string;
        version: string;
        description: string;
        regions: string[];
      }>;
    }>(`/v1/network/agents/${id}/capabilities`);
  }

  /** POST /v1/network/agents/{id}/endpoint-checks - Probe A2A endpoint TLS/Card */
  async probeAgentEndpoint(id: string) {
    return this.request<{
      status: 'healthy' | 'unreachable' | 'invalid_card';
      latency_ms: number;
      card_digest?: string;
      checked_at: string;
    }>(`/v1/network/agents/${id}/endpoint-checks`, {
      method: 'POST',
    });
  }

  // ========================================================
  // §3.11 ENSv2 Identity & Cross-Chain Authorization
  // ========================================================

  /** POST /v1/identity/ens/resolutions - Resolve ENSv2 name records */
  async resolveENS(body: { ens_name: string; chain_id?: number }) {
    return this.request<{
      ens_name: string;
      resolver: string;
      controller: string;
      wallet_address: string;
      resolved_at_block: number;
    }>('/v1/identity/ens/resolutions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/identity/agent-bindings/challenges - Generate multi-sig binding challenge */
  async createAgentBindingChallenge(body: {
    agent_id: string;
    ens_name: string;
    arkiv_wallet: string;
  }) {
    return this.request<{
      challenge_id: string;
      nonce: string;
      message_to_sign: string;
      expires_at: string;
    }>('/v1/identity/agent-bindings/challenges', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/identity/agent-bindings - Submit signed binding payload */
  async createAgentBinding(body: {
    challenge_id: string;
    agent_id: string;
    ens_signature: string;
    wallet_signature: string;
  }) {
    return this.request<T.CrossChainBinding>('/v1/identity/agent-bindings', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** POST /v1/identity/agent-bindings/{id}/revoke - Revoke binding */
  async revokeAgentBinding(bindingId: string, body: { reason: string }) {
    return this.request<{ status: 'revoked'; revoked_at: string }>(
      `/v1/identity/agent-bindings/${bindingId}/revoke`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  // ========================================================
  // §3.12 Arkiv Task Coordination & Public Ledger (Oracle Backend Contract)
  // ========================================================

  /** GET /v1/network/tasks?project_id=UUID - Public research task board (requires project_id) */
  async listNetworkTasks(projectId: string): Promise<T.NetworkTaskDetail[]> {
    return this.request<T.NetworkTaskDetail[]>('/v1/network/tasks', {
      params: { project_id: projectId },
    });
  }

  /** POST /v1/network/tasks - Publish research task to Arkiv (returns NetworkOperation 202) */
  async createNetworkTask(
    body: {
      project_id: string;
      source_run_id: string;
      capability?: string;
      review_of?: string;
      correction_of?: string;
      approve_public_reference?: boolean;
      deadline_seconds?: number;
    },
    idempotencyKey?: string
  ): Promise<T.NetworkOperation> {
    return this.request<T.NetworkOperation>('/v1/network/tasks', {
      method: 'POST',
      body: JSON.stringify(body),
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
    });
  }

  /** GET /v1/network/tasks/{id}?project_id=UUID - Task details with claims & generation */
  async getNetworkTask(id: string, projectId: string): Promise<T.NetworkTaskDetail> {
    return this.request<T.NetworkTaskDetail>(`/v1/network/tasks/${id}`, {
      params: { project_id: projectId },
    });
  }

  /** POST /v1/network/tasks/{id}/claims?project_id=UUID - Request provider claim */
  async claimNetworkTask(
    taskId: string,
    projectId: string,
    providerId: string,
    idempotencyKey?: string
  ): Promise<T.NetworkTaskClaim> {
    return this.request<T.NetworkTaskClaim>(`/v1/network/tasks/${taskId}/claims`, {
      method: 'POST',
      params: { project_id: projectId },
      body: JSON.stringify({ provider_id: providerId }),
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
    });
  }

  /** POST /v1/network/tasks/{id}/assignments?project_id=UUID - Authoritative provider assignment */
  async assignTaskProvider(
    taskId: string,
    projectId: string,
    body: { claim_id: string; expected_generation: number },
    idempotencyKey?: string
  ): Promise<T.NetworkOperation> {
    return this.request<T.NetworkOperation>(`/v1/network/tasks/${taskId}/assignments`, {
      method: 'POST',
      params: { project_id: projectId },
      body: JSON.stringify(body),
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
    });
  }

  /** GET /v1/network/tasks/{id}/timeline?project_id=UUID - Real task timeline & stages */
  async getNetworkTaskTimeline(taskId: string, projectId: string): Promise<T.NetworkTaskTimelineEvent[]> {
    return this.request<T.NetworkTaskTimelineEvent[]>(`/v1/network/tasks/${taskId}/timeline`, {
      params: { project_id: projectId },
    });
  }

  /** GET /v1/network/operations/{id}?project_id=UUID - Poll async network operations */
  async getNetworkOperation(operationId: string, projectId: string): Promise<T.NetworkOperation> {
    return this.request<T.NetworkOperation>(`/v1/network/operations/${operationId}`, {
      params: { project_id: projectId },
    });
  }

  // ========================================================
  // §3.12.1 Intentional Disagreement Demo Adapter (Handoff 7 Nov 2026)
  // ========================================================

  /** POST /v1/demo/disagreements - Trigger intentional disagreement run */
  async createDisagreementRun(
    projectId: string,
    approvePublicReference: boolean = false,
    idempotencyKey?: string
  ): Promise<T.DisagreementRun> {
    return this.request<T.DisagreementRun>('/v1/demo/disagreements', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        approve_public_reference: approvePublicReference,
      }),
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
    });
  }

  /** GET /v1/demo/disagreements?project_id=UUID - List disagreement runs for project */
  async listDisagreements(projectId: string): Promise<T.DisagreementRun[]> {
    return this.request<T.DisagreementRun[]>('/v1/demo/disagreements', {
      params: { project_id: projectId },
    });
  }

  /** GET /v1/demo/disagreements/{run_id}?project_id=UUID - Poll disagreement run progress */
  async getDisagreementRun(runId: string, projectId: string): Promise<T.DisagreementRun> {
    return this.request<T.DisagreementRun>(`/v1/demo/disagreements/${runId}`, {
      params: { project_id: projectId },
    });
  }

  /** POST /v1/demo/disagreements/{run_id}/correct?project_id=UUID - Trigger clean-input rerun */
  async correctDisagreementRun(
    runId: string,
    projectId: string,
    expectedVersion: number,
    idempotencyKey?: string
  ): Promise<T.DisagreementRun> {
    return this.request<T.DisagreementRun>(`/v1/demo/disagreements/${runId}/correct`, {
      method: 'POST',
      params: { project_id: projectId },
      body: JSON.stringify({ expected_version: expectedVersion }),
      idempotencyKey: idempotencyKey || this.generateIdempotencyKey(),
    });
  }

  /** POST /v1/arkiv/queries - Query raw indexed Arkiv entities */
  async queryArkiv(body: {
    query?: string;
    entity_type?: string;
    chain_id?: number;
    limit?: number;
  }) {
    return this.request<Array<{
      entity_key: string;
      entity_type: string;
      block_number: number;
      tx_hash: string;
      sender_address: string;
      payload_summary: string;
      ledger_status: string;
    }>>('/v1/arkiv/queries', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/arkiv/entities/{key} - Inspect exact state commitment */
  async getArkivEntity(key: string) {
    return this.request<{
      entity_key: string;
      entity_type: string;
      block_number: number;
      tx_hash: string;
      sender_address: string;
      payload: Record<string, unknown>;
      ledger_status: string;
    }>(`/v1/arkiv/entities/${encodeURIComponent(key)}`);
  }

  // ========================================================
  // §3.13 Extended Marine Companion
  // ========================================================

  /** GET /v1/marine/observations - Current coastal marine conditions */
  async getMarineConditions(params?: { sector?: string; lat?: number; lon?: number }) {
    return this.request<T.MarineConditions>('/v1/marine/observations', { params });
  }

  /** GET /v1/marine/advisories - Official weather & ocean alerts */
  async listAdvisories(params?: { sector?: string; severity?: string; cursor?: string }) {
    return this.request<T.Page<T.OfficialWarning>>('/v1/marine/advisories', { params });
  }

  /** GET /v1/marine/conversations - Marine chat threads */
  async listConversations(params?: { cursor?: string; limit?: number }) {
    return this.request<T.Page<{
      id: string;
      title: string;
      preview: string;
      last_active_at: string;
      unread_count: number;
    }>>('/v1/marine/conversations', { params });
  }

  /** GET /v1/marine/conversations/{id} - Single thread messages */
  async getConversation(id: string) {
    return this.request<{
      id: string;
      title: string;
      messages: Array<{
        id: string;
        sender: 'user' | 'agent' | 'system';
        sender_name: string;
        content: string;
        created_at: string;
        citations?: string[];
      }>;
    }>(`/v1/marine/conversations/${id}`);
  }

  /** POST /v1/marine/conversations/{id}/messages - Send message in conversation */
  async sendMessage(conversationId: string, body: { content: string; sector?: string }) {
    return this.request<{
      id: string;
      sender: 'agent';
      sender_name: string;
      content: string;
      created_at: string;
    }>(`/v1/marine/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/marine/fisheries/zones - Potential Fishing Zones (PFZ) */
  async listFisheriesZones(params?: { sector?: string }) {
    return this.request<{
      zones: Array<{
        id: string;
        name: string;
        depth_range: string;
        sst_gradient: string;
        chlorophyll_index: string;
        confidence: string;
        valid_until: string;
      }>;
    }>('/v1/marine/fisheries/zones', { params });
  }

  /** POST /v1/marine/routes/evaluations - Coastal route hazard evaluation */
  async evaluateRoute(body: { origin: [number, number]; destination: [number, number]; speed_knots: number }) {
    return this.request<{
      distance_nm: number;
      estimated_hours: number;
      max_wave_height: number;
      advisories_intersected: string[];
      safety_assessment: 'clear' | 'caution' | 'hazardous';
    }>('/v1/marine/routes/evaluations', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/alerts/subscriptions - Alert channel subscriptions */
  async listAlertSubscriptions() {
    return this.request<Array<{
      id: string;
      hazard_type: string;
      region: string;
      channel: 'sms' | 'voice_call' | 'web_push';
      language: string;
      status: 'active' | 'paused';
    }>>('/v1/alerts/subscriptions');
  }

  /** POST /v1/alerts/subscriptions - Subscribe to hazard alerts */
  async createAlertSubscription(body: {
    hazard_type: string;
    region: string;
    channel: 'sms' | 'voice_call' | 'web_push';
    language: string;
    target_destination: string;
  }) {
    return this.request<{ id: string; status: 'active' }>('/v1/alerts/subscriptions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /** GET /v1/alerts/notifications - Delivered alerts inbox */
  async listAlertNotifications() {
    return this.request<Array<{
      id: string;
      title: string;
      hazard_type: string;
      delivered_at: string;
      read: boolean;
    }>>('/v1/alerts/notifications');
  }

  // ========================================================
  // §3.14 Admin, Operational Telemetry & System Health
  // ========================================================

  /** GET /v1/admin/source-health - Connector probe health */
  async getSourceHealth() {
    return this.request<{
      connectors: Array<{
        name: string;
        source_class: string;
        status: 'healthy' | 'degraded' | 'unavailable';
        latency_ms: number;
        last_probed: string;
      }>;
    }>('/v1/admin/source-health');
  }

  /** GET /v1/admin/job-health - Durable worker and queue metrics */
  async getJobHealth() {
    return this.request<{
      active_workers: number;
      queued_jobs: number;
      running_jobs: number;
      stale_leases: number;
      failed_last_24h: number;
    }>('/v1/admin/job-health');
  }

  /** GET /v1/admin/leases - Worker fencing leases */
  async getLeases() {
    return this.request<Array<{
      worker_id: string;
      investigation_id: string;
      fencing_token: number;
      expires_at: string;
    }>>('/v1/admin/leases');
  }

  /** GET /v1/admin/arkiv/indexer-status - Arkiv indexer sync state */
  async getArkivIndexerStatus() {
    return this.request<{
      rabdi_block: number;
      indexed_events_count: number;
      sync_lag_seconds: number;
      reconciliation_needed: boolean;
    }>('/v1/admin/arkiv/indexer-status');
  }

  /** GET /v1/admin/audit-events - Tamper-evident audit store */
  async getAuditEvents(params?: { org_id?: string; event_type?: string; cursor?: string; limit?: number }) {
    return this.request<T.Page<{
      id: string;
      event_type: string;
      principal_id: string;
      organization_id?: string;
      details: Record<string, unknown>;
      timestamp: string;
    }>>('/v1/admin/audit-events', { params });
  }

  // ========================================================
  // §4. Prototype Research API (/v1/prototype/*)
  // Handoff 6 Nov 2026 — Hackathon runtime contract
  // ========================================================

  /** GET /v1/prototype/config — Public prototype configuration (no auth required) */
  async getPrototypeConfig(): Promise<T.PrototypeConfig> {
    return this.request<T.PrototypeConfig>('/v1/prototype/config');
  }

  /** POST /v1/prototype/investigations — Create investigation (question → plan) */
  async createPrototypeInvestigation(
    projectId: string,
    question: string,
    idempotencyKey?: string
  ): Promise<T.PrototypeInvestigation> {
    return this.request<T.PrototypeInvestigation>('/v1/prototype/investigations', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, question }),
      idempotencyKey,
    });
  }

  /** GET /v1/prototype/investigations?project_id=UUID — List investigations for project */
  async listPrototypeInvestigations(projectId: string): Promise<{ items: T.PrototypeInvestigation[]; total?: number }> {
    return this.request<{ items: T.PrototypeInvestigation[]; total?: number }>(
      '/v1/prototype/investigations',
      { params: { project_id: projectId } }
    );
  }

  /** GET /v1/prototype/investigations/{id}?project_id=UUID — Investigation detail */
  async getPrototypeInvestigation(id: string, projectId: string): Promise<T.PrototypeInvestigation> {
    return this.request<T.PrototypeInvestigation>(`/v1/prototype/investigations/${id}`, {
      params: { project_id: projectId },
    });
  }

  /** POST /v1/prototype/investigations/{id}/approve?project_id=UUID — Approve plan */
  async approvePrototypePlan(id: string, projectId: string, idempotencyKey?: string): Promise<T.PrototypeInvestigation> {
    return this.request<T.PrototypeInvestigation>(`/v1/prototype/investigations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({}),
      params: { project_id: projectId },
      idempotencyKey,
    });
  }

  /** POST /v1/prototype/runs — Submit run (requires Idempotency-Key) */
  async submitPrototypeRun(
    projectId: string,
    investigationId: string,
    idempotencyKey: string
  ): Promise<T.PrototypeRun> {
    return this.request<T.PrototypeRun>('/v1/prototype/runs', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, investigation_id: investigationId }),
      idempotencyKey,
    });
  }

  /** GET /v1/prototype/runs/{id}?project_id=UUID — Poll run status */
  async getPrototypeRun(runId: string, projectId: string): Promise<T.PrototypeRun> {
    return this.request<T.PrototypeRun>(`/v1/prototype/runs/${runId}`, {
      params: { project_id: projectId },
    });
  }

  /** GET /v1/prototype/runs?project_id=UUID — List runs for project */
  async listPrototypeRuns(projectId: string, investigationId?: string): Promise<{ items: T.PrototypeRun[] }> {
    return this.request<{ items: T.PrototypeRun[] }>('/v1/prototype/runs', {
      params: {
        project_id: projectId,
        ...(investigationId ? { investigation_id: investigationId } : {}),
      },
    });
  }

  /** GET /v1/prototype/runs/{run_id}/report?project_id=UUID — Authenticated Markdown report download */
  async downloadPrototypeReport(runId: string, projectId: string, accessToken: string): Promise<Blob> {
    const url = `${this.baseUrl}/v1/prototype/runs/${runId}/report?project_id=${encodeURIComponent(projectId)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'text/markdown, text/plain, */*',
        'X-Request-ID': this.generateIdempotencyKey(),
      },
      credentials: 'omit',
    });
    if (response.status === 409) {
      throw new OrcaApiError(409, {
        type: 'https://docs.orca.example/problems/not-ready',
        title: 'Report Not Ready',
        status: 409,
        detail: 'The report is not yet ready. The run may still be processing.',
        instance: `/v1/prototype/runs/${runId}/report`,
        code: 'REPORT_NOT_READY',
        request_id: '',
        retryable: true,
      });
    }
    if (!response.ok) {
      throw new OrcaApiError(response.status, {
        type: 'https://docs.orca.example/problems/http-error',
        title: 'Report Download Failed',
        status: response.status,
        detail: `Report download failed with status ${response.status}`,
        instance: `/v1/prototype/runs/${runId}/report`,
        code: `HTTP_${response.status}`,
        request_id: '',
        retryable: response.status >= 500,
      });
    }
    return response.blob();
  }
}

/** Default singleton client instance configured for the active environment */
export const apiClient = new OrcaApiClient();
