/**
 * Screen I02 — Research Projects Index
 * 
 * Sourced from dashboard design.md §5.2 (Screen I02):
 * - URL: /org/[orgId]/projects
 * - Highest API Gate Referenced: P02
 * - Backend Calls: GET /v1/research/projects (§3.3), POST /v1/research/projects (§3.3)
 * - User Outcome: Find authorized active/archived projects and create new projects with explicit data policy.
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data dependencies
 * - Full RFC 9457 error and loading handling
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { FolderKanban, Plus, Search, Shield, ArrowRight, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { ResearchProject, AccessClass } from '@/types/api';

export default function ProjectsIndexPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'active' | 'archived'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New project form state
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectAccess, setNewProjectAccess] = useState<AccessClass>('organization');
  const [creating, setCreating] = useState(false);

  const fetchProjects = () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);

    apiClient
      .listProjects({ org_id: orgId, state: filterState === 'all' ? undefined : filterState })
      .then((res) => {
        if (res?.items) {
          setProjects(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to fetch projects from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, [orgId, filterState]);

  // Filter projects by search query
  const filteredProjects = projects.filter((proj) => {
    if (searchQuery && !proj.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiClient.createProject({
        organization_id: orgId,
        name: newProjectName,
        description: newProjectDesc,
        access_class: newProjectAccess,
        visibility: 'private',
        default_data_policy: 'pinned_versions_only',
      });
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      alert(`Create Project Failed: ${apiErr.problem?.detail || apiErr.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Research Projects</span>
        </div>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                Institutional Research Projects
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I02 · P02 API
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Authorized workspaces holding study plans, parameter sets, and reproducible evidence artifacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={fetchProjects}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Projects"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button suppressHydrationWarning
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>
        </div>

        {/* Backend Error Notice */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Backend Gateway Notice (GET /v1/research/projects): {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchProjects}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & State Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#F8F9FA] p-3 border border-[#E5E7EB] rounded">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
            <input suppressHydrationWarning
              type="text"
              placeholder="Filter projects by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E7EB] pl-9 pr-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="text-[#6B7280]">Status:</span>
            <select suppressHydrationWarning
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as 'all' | 'active' | 'archived')}
              className="bg-[#FFFFFF] border border-[#E5E7EB] px-2.5 py-1 text-xs rounded focus:outline-none focus:border-[#111827]"
            >
              <option value="all">All States</option>
              <option value="active">Active Projects</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading projects from backend API (GET /v1/research/projects)...
          </div>
        )}

        {/* Projects List */}
        {!loading && filteredProjects.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280] space-y-3">
            <div>No research projects found matching your criteria.</div>
            <button suppressHydrationWarning
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded font-medium"
            >
              Create New Research Project
            </button>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] font-mono text-[#4B5563] uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Project Name & Objective</th>
                  <th className="py-3 px-4 font-semibold">Classification</th>
                  <th className="py-3 px-4 font-semibold">State</th>
                  <th className="py-3 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-[#111827]">
                        <Link href={`/org/${orgId}/projects/${proj.id}`} className="hover:underline">
                          {proj.name}
                        </Link>
                      </div>
                      {proj.description && (
                        <div className="text-[11px] text-[#6B7280] line-clamp-1 mt-0.5">
                          {proj.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline">{proj.access_class}</Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            proj.state === 'active' ? 'bg-emerald-600' : 'bg-gray-400'
                          }`}
                        />
                        <span className="capitalize">{proj.state}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/org/${orgId}/projects/${proj.id}`}
                        className="inline-flex items-center gap-1 font-medium text-[#111827] hover:underline"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] rounded border border-[#E5E7EB] max-w-md w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-[#111827]" />
                  Create Research Project (POST /v1/research/projects)
                </h3>
                <button suppressHydrationWarning
                  onClick={() => setShowCreateModal(false)}
                  className="text-[#6B7280] hover:text-[#111827] text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#111827] block mb-1">
                    Project Title *
                  </label>
                  <input suppressHydrationWarning
                    type="text"
                    required
                    placeholder="e.g. Lakshadweep Coral Bleaching SST Analysis"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded p-2 focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#111827] block mb-1">
                    Scientific Description
                  </label>
                  <textarea suppressHydrationWarning
                    rows={3}
                    placeholder="Explain the oceanographic scope and hypotheses..."
                    value={newProjectDesc}
                    onChange={(e) => setNewProjectDesc(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded p-2 focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#111827] block mb-1">
                    Access Classification *
                  </label>
                  <select suppressHydrationWarning
                    value={newProjectAccess}
                    onChange={(e) => setNewProjectAccess(e.target.value as AccessClass)}
                    className="w-full border border-[#E5E7EB] rounded p-2 focus:outline-none focus:border-[#111827]"
                  >
                    <option value="internal">Internal (Organization members)</option>
                    <option value="restricted">Restricted (Project invited members only)</option>
                    <option value="confidential">Confidential (Restricted + Audit Trail)</option>
                    <option value="public">Public (Open institutional access)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-[#E5E7EB]">
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 border border-[#E5E7EB] text-[#4B5563] rounded hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                  <button suppressHydrationWarning
                    type="submit"
                    disabled={creating}
                    className="px-3.5 py-1.5 bg-[#111827] text-[#FFFFFF] font-medium rounded hover:bg-[#1F2937] disabled:opacity-50"
                  >
                    {creating ? 'Submitting...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
