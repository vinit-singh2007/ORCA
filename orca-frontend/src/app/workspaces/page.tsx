/**
 * Screen F03 — Workspace Selector & Organization Directory
 * 
 * Sourced from dashboard design.md §5.1 (Screen F03):
 * - URL: /workspaces
 * - Highest API Gate Referenced: P02
 * - Backend Calls: GET /v1/me (§3.2), GET /v1/organizations (§3.2), POST /v1/organizations (§3.2)
 * - Acceptance Rule: Switching org clears scoped queries and updates breadcrumbs/routes.
 * 
 * TRUTH BOUNDARY:
 * - Direct integration with real backend API client
 * - No mock data dependencies
 * - Full RFC 9457 error and loading handling
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { Building2, Plus, ArrowRight, ShieldCheck, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { OrganizationSummary, CurrentPrincipal } from '@/types/api';

export default function WorkspacesPage() {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [principal, setPrincipal] = useState<CurrentPrincipal | null>(null);
  const [activeOrgId, setActiveOrgId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = () => {
    setLoading(true);
    setError(null);
    Promise.allSettled([apiClient.listOrganizations(), apiClient.getMe()]).then(([orgsRes, meRes]) => {
      if (orgsRes.status === 'fulfilled' && orgsRes.value?.items) {
        setOrganizations(orgsRes.value.items);
        if (orgsRes.value.items.length > 0) {
          setActiveOrgId(orgsRes.value.items[0].id);
        }
      } else if (orgsRes.status === 'rejected') {
        const err = orgsRes.reason as OrcaApiError;
        setError(err.problem?.detail || 'Unable to fetch organizations from backend');
      }

      if (meRes.status === 'fulfilled' && meRes.value) {
        setPrincipal(meRes.value);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreateOrg = async () => {
    const name = prompt('Enter new Organization name:');
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    try {
      const created = await apiClient.createOrganization({ name, slug, visibility: 'private' });
      alert(`Organization created: ${created.name} (${created.id})`);
      fetchWorkspaces();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      alert(`Failed to create organization: ${apiErr.problem?.detail || apiErr.message}`);
    }
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <h1 className="text-xl font-bold text-[#111827]">
              Organization & Workspace Directory
            </h1>
            <p className="text-xs text-[#4B5563] mt-1">
              Select an authorized organization context. Row-level security (RLS) scopes all subsequent research projects and datasets.
            </p>
          </div>
          <button
            onClick={handleCreateOrg}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Organization
          </button>
        </div>

        {/* Backend Error Banner */}
        {error && (
          <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#111827]">
              <AlertCircle className="w-4 h-4" />
              <span>Backend Connection Error: {error}</span>
            </div>
            <button
              onClick={fetchWorkspaces}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Organizations List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-mono font-semibold text-[#4B5563] uppercase flex justify-between items-center">
            <span>Affiliated Institutional Organizations ({organizations.length})</span>
            {loading && <span className="text-[11px] font-sans text-[#6B7280]">Loading live records...</span>}
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {organizations.length === 0 && !loading && (
              <div className="p-8 text-center text-xs text-[#6B7280] space-y-2">
                <div>No organizations found for this principal account on the backend.</div>
                <button
                  onClick={handleCreateOrg}
                  className="px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded text-xs font-medium"
                >
                  Create Initial Organization
                </button>
              </div>
            )}

            {organizations.map((org) => {
              const isSelected = org.id === activeOrgId;
              const membership = principal?.orgs?.find((o) => o.org_id === org.id);

              return (
                <div
                  key={org.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isSelected ? 'bg-[#F8F9FA]' : 'hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-center text-[#111827] mt-0.5">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-semibold text-[#111827]">
                          {org.name}
                        </h2>
                        {org.verification_status === 'verified' && (
                          <Badge variant="verified">
                            <ShieldCheck className="w-3 h-3 text-[#111827]" />
                            VERIFIED INSTITUTION
                          </Badge>
                        )}
                        <Badge variant="outline">{org.visibility}</Badge>
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1">
                        Slug: <code className="font-mono text-[#111827]">{org.slug}</code> | ID: <code className="font-mono text-[#6B7280]">{org.id}</code>
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-[#4B5563]">
                          Principal Role:{' '}
                          <strong className="text-[#111827]">
                            {membership ? membership.role.replace('_', ' ') : 'viewer'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {isSelected ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 border border-[#111827] bg-[#FFFFFF] text-[#111827] text-xs font-medium rounded">
                        <Check className="w-3.5 h-3.5" />
                        Current Active Scope
                      </span>
                    ) : (
                      <button
                        onClick={() => setActiveOrgId(org.id)}
                        className="px-3 py-1.5 border border-[#E5E7EB] hover:border-[#111827] text-[#111827] text-xs font-medium rounded transition"
                      >
                        Set Active Scope
                      </button>
                    )}
                    <Link
                      href={`/org/${org.id}/overview`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
                    >
                      Enter Overview
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tenancy & Security Invariant Callout */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827]">Tenant Boundary Rule (api design.md §2.2):</div>
          <div>
            ORCA validates tenant context against server-side session claims and database RLS. Headers such as <code>X-Organization-ID</code> are correlation hints only and cannot grant cross-tenant authority.
          </div>
        </div>
      </div>
    </Shell>
  );
}
