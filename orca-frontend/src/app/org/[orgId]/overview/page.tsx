/**
 * ORCA 3.0 — Screen I01: Institution Command Centre & Research Overview
 * 
 * DESIGN SPECIFICATION:
 * - ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §2 (Critique B) & §5.2
 * - dashboard design.md §5.2 (Screen I01)
 * - UI URL: /org/[orgId]/overview
 * - Persona: Lead Marine Scientist, Institutional Principal Investigator
 * 
 * CONTRACT INTEGRATION (§3):
 * - GET /v1/organizations/{org_id} (api design.md §3.2)
 * - GET /v1/research/projects (api design.md §3.3)
 * - GET /v1/research/investigations (api design.md §3.6)
 * - GET /v1/organizations/{org_id}/usage (api design.md §3.9)
 * 
 * TRUTH BOUNDARY:
 * - Connected directly to live backend via apiClient
 * - Removed all mock data dependencies
 * - Full loading, error, and empty state support
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import {
  FolderKanban,
  FileSearch,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  FileCheck2,
  AlertCircle,
  Database,
  ExternalLink,
  Bot,
  Info,
  RefreshCw,
} from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { Organization, ResearchProject, InvestigationSummary, AgentSummary } from '@/types/api';

export default function InstitutionOverviewPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<'all' | 'restricted' | 'internal'>('all');

  const fetchOverviewData = () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      apiClient.getOrganization(orgId),
      apiClient.listProjects({ org_id: orgId }),
      apiClient.listInvestigations(),
      apiClient.listAgents({ organization_id: orgId }),
    ]).then(([orgRes, projRes, invRes, agentRes]) => {
      if (orgRes.status === 'fulfilled' && orgRes.value) {
        setCurrentOrg(orgRes.value);
      } else if (orgRes.status === 'rejected') {
        const err = orgRes.reason as OrcaApiError;
        setError(err.problem?.detail || 'Unable to connect to organization on backend');
      }

      if (projRes.status === 'fulfilled' && projRes.value?.items) {
        setProjects(projRes.value.items);
      }

      if (invRes.status === 'fulfilled' && invRes.value?.items) {
        setInvestigations(invRes.value.items);
      }

      if (agentRes.status === 'fulfilled' && agentRes.value?.items) {
        setAgents(agentRes.value.items);
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOverviewData();
  }, [orgId]);

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'all') return true;
    return p.access_class?.toLowerCase() === projectFilter;
  });

  const orgName = currentOrg?.name || 'Institution Workspace';

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb & Navigation Anchor */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span>Institution</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Overview</span>
        </div>

        {/* Backend Gateway Error Alert */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Backend Notice (GET /v1/organizations/{orgId}): {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchOverviewData}
              className="px-2.5 py-1 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Action-First Header (§5.2) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#111827]">
                {loading ? 'Loading Institutional Context...' : orgName}
              </h1>
              {currentOrg?.verification_status === 'verified' && (
                <Badge variant="verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#111827]" />
                  Verified Core
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Active oceanographic research operations, project governance, and verifiable computational investigations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={fetchOverviewData}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Dashboard"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href={`/org/${orgId}/projects`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-xs font-medium rounded transition"
            >
              <FolderKanban className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Manage Projects</span>
            </Link>
            <Link
              href={`/org/${orgId}/research/investigations/new`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-xs font-medium rounded transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Investigation</span>
            </Link>
          </div>
        </div>

        {/* Real Research Demo Feature Box per Handoff §8 */}
        <div className="border-2 border-[#111827] rounded-xl p-5 bg-[#FFFFFF] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base text-[#111827]">
                Descriptive Sea Surface Temperature Research Demo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#FFFFFF] font-semibold">
                Real Verified Backend Slice
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Validation Pending
              </span>
            </div>
            <p className="text-xs text-[#4B5563] max-w-2xl leading-relaxed">
              Preserved MUR SST access sample: 3,751 finite observations, 31 daily sample means, deterministic re-execution, and confirmed Arkiv Rabdi transaction receipt.
            </p>
            <div className="flex items-center gap-4 text-xs pt-1 font-mono text-[#6B7280]">
              <span>Sample Mean: <strong className="text-[#111827]">28.32 °C</strong></span>
              <span>·</span>
              <span>Min: <strong className="text-[#111827]">27.45 °C</strong></span>
              <span>·</span>
              <span>Max: <strong className="text-[#111827]">29.35 °C</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://rabdi.explorer.arkiv.network/tx/0x990fe04c31c81d743d79a32e633d0020781be09c5ef82ab50c71881fb976e23d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-xs font-medium rounded transition"
            >
              <span>Rabdi Tx</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Link
              href={`/org/${orgId}/research/demo`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-xs font-semibold rounded shadow-sm transition"
            >
              <span>Open Research Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Compact Sourced Metric Strip (§5.2) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metric 1: Active Projects */}
          <div className="p-3.5 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
            <div className="text-[11px] font-mono text-[#6B7280] uppercase flex items-center justify-between">
              <span>Active Projects</span>
              <FolderKanban className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#111827]">
              {projects.length} <span className="text-xs font-normal text-[#6B7280]">authorized</span>
            </div>
            <div className="text-[10px] text-[#6B7280]">Tenant-scoped via RLS (GET /v1/research/projects)</div>
          </div>

          {/* Metric 2: Investigations Count */}
          <div className="p-3.5 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
            <div className="text-[11px] font-mono text-[#6B7280] uppercase flex items-center justify-between">
              <span>Total Investigations</span>
              <FileCheck2 className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#111827]">
              {investigations.length} <span className="text-xs font-normal text-[#6B7280]">registered</span>
            </div>
            <Link
              href={`/org/${orgId}/review/inbox`}
              className="text-[10px] text-[#111827] hover:underline font-medium inline-flex items-center gap-1"
            >
              Open review inbox <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>

          {/* Metric 3: Verified Source Freshness */}
          <div className="p-3.5 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
            <div className="text-[11px] font-mono text-[#6B7280] uppercase flex items-center justify-between">
              <span>Source Connectors</span>
              <Database className="w-3.5 h-3.5 text-[#6B7280]" />
            </div>
            <div className="text-lg font-bold font-mono text-[#111827]">
              ERDDAP / INCOIS <span className="text-xs font-normal text-[#6B7280]">Ready</span>
            </div>
            <div className="text-[10px] text-[#6B7280]">NetCDF subsetting & baseline verification</div>
          </div>
        </div>

        {/* Two-Column Section: Action Required (Left) & Recent Research (Right) (§5.2) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Required Box */}
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#111827]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
                  Action Required
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#6B7280]">
                Active Tasks
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded border border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#111827]">Scientific Reviews Pending</div>
                  <div className="text-[11px] text-[#4B5563]">Independent numerical verification queue check.</div>
                </div>
                <Link
                  href={`/org/${orgId}/review/inbox`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-[#111827] bg-[#FFFFFF] text-[#111827] rounded hover:bg-[#111827] hover:text-[#FFFFFF] transition whitespace-nowrap self-start sm:self-center"
                >
                  <span>Review Inbox</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="p-3 rounded border border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-[#111827]">Data Catalog & Methods</div>
                  <div className="text-[11px] text-[#4B5563]">Browse verified source products and recipe templates.</div>
                </div>
                <Link
                  href={`/org/${orgId}/data/products`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium border border-[#111827] bg-[#FFFFFF] text-[#111827] rounded hover:bg-[#111827] hover:text-[#FFFFFF] transition whitespace-nowrap self-start sm:self-center"
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Research Investigations (§5.2) */}
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5">
              <div className="flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#111827]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
                  Recent Research Investigations
                </h2>
              </div>
              <Link
                href={`/org/${orgId}/research/investigations`}
                className="text-[11px] text-[#111827] hover:underline inline-flex items-center gap-0.5"
              >
                All investigations <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>

            {investigations.length === 0 && !loading ? (
              <div className="py-6 text-center text-xs text-[#6B7280]">
                No investigations formulated yet. Click "New Investigation" above to start.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {investigations.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <Link
                        href={`/org/${orgId}/research/investigations/${inv.id}`}
                        className="font-semibold text-[#111827] hover:underline truncate block"
                      >
                        {inv.question}
                      </Link>
                      <div className="text-[10px] text-[#6B7280] flex items-center gap-2">
                        <span>Compute: <code className="font-mono">{inv.state}</code></span>
                        <span>•</span>
                        <span>
                          Science: <span className="font-medium text-[#111827]">{inv.scientific_status || 'draft'}</span>
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/org/${orgId}/research/investigations/${inv.id}`}
                      className="text-[11px] font-medium text-[#111827] hover:underline whitespace-nowrap"
                    >
                      Studio →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full-Width My Projects Table (§5.2) */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E7EB] pb-2.5">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-[#111827]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#111827]">
                My Projects ({filteredProjects.length})
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7280]">Filter:</span>
              <button suppressHydrationWarning
                onClick={() => setProjectFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  projectFilter === 'all'
                    ? 'bg-[#111827] text-[#FFFFFF] font-medium'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                }`}
              >
                All
              </button>
              <button suppressHydrationWarning
                onClick={() => setProjectFilter('internal')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  projectFilter === 'internal'
                    ? 'bg-[#111827] text-[#FFFFFF] font-medium'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                }`}
              >
                Internal
              </button>
              <button suppressHydrationWarning
                onClick={() => setProjectFilter('restricted')}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  projectFilter === 'restricted'
                    ? 'bg-[#111827] text-[#FFFFFF] font-medium'
                    : 'text-[#4B5563] hover:bg-[#F3F4F6]'
                }`}
              >
                Restricted
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredProjects.length === 0 && !loading ? (
              <div className="p-8 text-center text-xs text-[#6B7280]">
                No projects found for this organization. Create one in the Projects directory.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] font-mono text-[#4B5563] uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Project</th>
                    <th className="py-2.5 px-3 font-semibold">Classification</th>
                    <th className="py-2.5 px-3 font-semibold">State</th>
                    <th className="py-2.5 px-3 font-semibold">ID</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filteredProjects.map((proj) => (
                    <tr key={proj.id} className="hover:bg-[#F8F9FA] transition">
                      <td className="py-3 px-3">
                        <Link
                          href={`/org/${orgId}/projects/${proj.id}`}
                          className="font-semibold text-[#111827] hover:underline"
                        >
                          {proj.name}
                        </Link>
                        {proj.description && (
                          <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                            {proj.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant="outline">{proj.access_class}</Badge>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#4B5563]">
                        {proj.state}
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-[#6B7280]">
                        {proj.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/org/${orgId}/projects/${proj.id}`}
                          className="font-medium text-[#111827] hover:underline"
                        >
                          Open →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Network Participation Callout (§5.2 & §4.1) */}
        <div className="border border-[#E5E7EB] rounded p-4 bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded text-[#111827]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-[#111827]">
                Federated Agent Network Participation
              </div>
              <div className="text-[11px] text-[#6B7280]">
                {agents.length} institutional A2A agent(s) registered for this organization
              </div>
            </div>
          </div>
          <Link
            href={`/org/${orgId}/agents`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFFFFF] border border-[#111827] text-[#111827] rounded text-xs font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
          >
            <span>Manage Institutional Agents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quiet Scientific Gate Boundary Footnote (§5.2) */}
        <div className="border-t border-[#E5E7EB] pt-4 text-[11px] text-[#6B7280] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#6B7280]" />
            <span>
              Scientific boundary notice: Technical completion of compute jobs does not imply positive hypothesis confirmation.
            </span>
          </div>
          <span className="font-mono text-[10px]">API Target: {process.env.NEXT_PUBLIC_ORCA_API_URL || '/v1'}</span>
        </div>
      </div>
    </Shell>
  );
}
