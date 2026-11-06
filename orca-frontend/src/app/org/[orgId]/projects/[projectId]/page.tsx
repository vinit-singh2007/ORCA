/**
 * Screen I04 — Project Overview & Activity
 * 
 * Sourced from dashboard design.md §5.2 (Screen I04):
 * - URL: /org/[orgId]/projects/[projectId]
 * - Highest API Gate Referenced: P05
 * - Backend Calls:
 *   GET /v1/research/projects/{project_id} (§3.3)
 *   GET /v1/research/investigations (§3.6)
 *   GET /v1/research/projects/{project_id}/members (§3.3)
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - Full RFC 9457 error and loading handling
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { ResearchProject, InvestigationSummary, Member } from '@/types/api';
import {
  FolderKanban,
  FileSearch,
  Plus,
  ArrowLeft,
  Users,
  FileText,
  Clock,
  Layers,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const projectId = (params?.projectId as string) || '';

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'investigations' | 'files' | 'members'>('overview');

  const fetchProjectData = () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      apiClient.getProject(projectId),
      apiClient.listInvestigations({ project_id: projectId }),
      apiClient.listProjectMembers(projectId),
    ]).then(([projRes, invRes, memRes]) => {
      if (projRes.status === 'fulfilled' && projRes.value) {
        setProject(projRes.value);
      } else if (projRes.status === 'rejected') {
        const err = projRes.reason as OrcaApiError;
        setError(err.problem?.detail || 'Project not found on backend');
      }

      if (invRes.status === 'fulfilled' && invRes.value?.items) {
        setInvestigations(invRes.value.items);
      }

      if (memRes.status === 'fulfilled' && memRes.value?.items) {
        setMembers(memRes.value.items);
      }

      setLoading(false);
    });
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  if (loading) {
    return (
      <Shell>
        <div className="max-w-5xl mx-auto py-12 text-center text-xs text-[#6B7280]">
          Loading project workspace from API (GET /v1/research/projects/{projectId})...
        </div>
      </Shell>
    );
  }

  if (error || !project) {
    return (
      <Shell>
        <div className="max-w-5xl mx-auto space-y-4 py-8">
          <Link href={`/org/${orgId}/projects`} className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
          </Link>
          <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#111827] mx-auto" />
            <h2 className="text-sm font-semibold text-[#111827]">Project Not Found or Access Denied</h2>
            <p className="text-xs text-[#4B5563]">{error || 'Unable to load project.'}</p>
            <button
              onClick={fetchProjectData}
              className="px-3 py-1.5 border border-[#111827] text-xs font-medium rounded hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/projects`} className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Projects
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#E5E7EB]" />
          <span className="text-[#111827] font-medium">{project.name}</span>
        </div>

        {/* Project Header */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-[#111827]">{project.name}</h1>
                <Badge variant="outline">{project.access_class}</Badge>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#4B5563]">
                  {project.state}
                </span>
              </div>
              <p className="text-xs text-[#4B5563] max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/org/${orgId}/research/investigations/new?projectId=${project.id}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
              >
                <Plus className="w-3.5 h-3.5" />
                New Investigation
              </Link>
            </div>
          </div>

          {/* Contextual Tabs Navigation */}
          <div className="flex items-center gap-2 border-t border-[#E5E7EB] pt-4 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'overview'
                  ? 'bg-[#111827] text-[#FFFFFF]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('investigations')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'investigations'
                  ? 'bg-[#111827] text-[#FFFFFF]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
              }`}
            >
              Investigations ({investigations.length})
            </button>
            <Link
              href={`/org/${orgId}/projects/${project.id}/files`}
              className="px-3 py-1.5 rounded text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA] transition"
            >
              Files & Uploads
            </Link>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'members'
                  ? 'bg-[#111827] text-[#FFFFFF]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
              }`}
            >
              Members ({members.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-3">
              <h2 className="font-semibold text-sm text-[#111827]">Project Governance & Tenancy</h2>
              <div className="space-y-2 font-mono text-[11px] text-[#4B5563]">
                <div>Organization ID: <code>{project.organization_id}</code></div>
                <div>Project ID: <code>{project.id}</code></div>
                <div>Data Policy: <code>{project.default_data_policy || 'pinned_versions_only'}</code></div>
                <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
              </div>
            </div>

            <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-3">
              <h2 className="font-semibold text-sm text-[#111827]">Active Studies & Investigations</h2>
              <p className="text-[#6B7280]">
                {investigations.length} bounded scientific investigations formulated within this project scope.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('investigations')}
                  className="font-medium text-[#111827] hover:underline"
                >
                  View all investigations →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Investigations */}
        {activeTab === 'investigations' && (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden text-xs">
            <div className="p-4 bg-[#F8F9FA] border-b border-[#E5E7EB] flex justify-between items-center font-semibold text-[#111827]">
              <span>Project Investigations</span>
              <span className="font-mono text-[#6B7280]">{investigations.length} records</span>
            </div>

            {investigations.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280]">
                No investigations formulated in this project yet.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {investigations.map((inv) => (
                  <div key={inv.id} className="p-4 hover:bg-[#F8F9FA] transition flex items-center justify-between">
                    <div>
                      <Link
                        href={`/org/${orgId}/research/investigations/${inv.id}`}
                        className="font-semibold text-[#111827] hover:underline block"
                      >
                        {inv.question}
                      </Link>
                      <div className="text-[11px] text-[#6B7280] mt-0.5">
                        State: <code className="font-mono">{inv.state}</code> • Science: <span className="font-medium text-[#111827]">{inv.scientific_status || 'draft'}</span>
                      </div>
                    </div>
                    <Link
                      href={`/org/${orgId}/research/investigations/${inv.id}`}
                      className="px-3 py-1 border border-[#111827] rounded text-xs font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
                    >
                      Studio →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Members */}
        {activeTab === 'members' && (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden text-xs">
            <div className="p-4 bg-[#F8F9FA] border-b border-[#E5E7EB] flex justify-between items-center font-semibold text-[#111827]">
              <span>Project Collaborators</span>
              <span className="font-mono text-[#6B7280]">{members.length} members</span>
            </div>

            {members.length === 0 ? (
              <div className="p-8 text-center text-[#6B7280]">
                No members found via GET /v1/research/projects/{project.id}/members.
              </div>
            ) : (
              <div className="divide-y divide-[#E5E7EB]">
                {members.map((m) => (
                  <div key={m.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[#111827]">{m.display_name}</div>
                      <div className="text-[11px] text-[#6B7280]">{m.email || m.user_id}</div>
                    </div>
                    <Badge variant="outline">{m.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
