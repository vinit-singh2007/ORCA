'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { NetworkTaskDetail, ResearchProject } from '@/types/api';
import {
  Globe,
  Plus,
  Clock,
  ExternalLink,
  ShieldAlert,
  Cpu,
  ArrowRight,
  Info,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const OPERATOR_PROJECT = 'bd11b1ae-1934-468e-a92a-bf57529df56f';

export default function ArkivTasksPage() {
  const searchParams = useSearchParams();
  const { selectedOrg } = useAuth();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    searchParams?.get('project_id') || OPERATOR_PROJECT
  );
  const [tasks, setTasks] = useState<NetworkTaskDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user projects
  useEffect(() => {
    if (selectedOrg?.id) {
      apiClient
        .listProjects({ organization_id: selectedOrg.id })
        .then((res) => {
          if (res?.items && res.items.length > 0) {
            setProjects(res.items);
            if (!searchParams?.get('project_id')) {
              setSelectedProjectId(res.items[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [selectedOrg?.id, searchParams]);

  const fetchTasks = useCallback(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    setError(null);

    apiClient
      .listNetworkTasks(selectedProjectId)
      .then((taskList) => {
        setTasks(Array.isArray(taskList) ? taskList : []);
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to query network tasks from Oracle backend');
        setLoading(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span>Federated Network</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Research Tasks</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#111827]">Research Tasks</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                N02 · P11 Protocol
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Decentralized task claims, A2A session dispatching, and independent scientific review coordination on Arkiv.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={fetchTasks}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Task Board"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/network/arkiv"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-xs font-medium rounded transition"
            >
              <Globe className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Arkiv Explorer</span>
            </Link>
            <Link
              href={`/network/tasks/new?project_id=${selectedProjectId}`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#1F2937] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Network Task</span>
            </Link>
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#6B7280] font-medium">Project Scope:</span>
            <select
              suppressHydrationWarning
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] px-2.5 py-1 text-xs rounded font-mono text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id.slice(0, 8)}...)
                </option>
              ))}
              <option value={OPERATOR_PROJECT}>
                Operator Acceptance Project ({OPERATOR_PROJECT.slice(0, 8)}...)
              </option>
            </select>
          </div>
          <span className="text-[11px] font-mono text-[#6B7280]">
            Endpoint: GET /v1/network/tasks?project_id={selectedProjectId.slice(0, 8)}...
          </span>
        </div>

        {/* Backend Error Banner */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Backend Notice: {error}</span>
            </div>
            <button
              suppressHydrationWarning
              onClick={fetchTasks}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Arkiv Truth Notice */}
        <div className="p-3.5 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#111827]">Decentralized Task Coordination:</strong> Tasks are published to the network with explicit project authority. Claims submitted by agent providers require authoritative award assignment before dispatching execution.
          </div>
        </div>

        {/* Tasks List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Network Research Tasks</span>
            <span className="font-mono text-[#6B7280]">
              {loading ? 'Querying backend...' : `${tasks.length} tasks recorded`}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading tasks for project {selectedProjectId.slice(0, 8)}...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280] space-y-3">
              <div>No active tasks found for project {selectedProjectId.slice(0, 8)}...</div>
              <Link
                href={`/network/tasks/new?project_id=${selectedProjectId}`}
                className="inline-block px-3 py-1.5 bg-[#111827] text-white rounded font-medium"
              >
                Publish New Network Task
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 hover:bg-[#F8F9FA] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#111827]">
                        {task.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#FFFFFF] text-[#111827] uppercase font-bold">
                        {task.status || 'Active'}
                      </span>
                      <span className="text-xs font-mono text-[#6B7280]">
                        Gen #{task.generation ?? 0}
                      </span>
                    </div>
                    <div className="text-xs text-[#4B5563] flex flex-wrap items-center gap-3">
                      <span>Capability: <code className="font-mono text-[#111827]">{task.capability || 'sst.seasonal_anomaly'}</code></span>
                      <span>•</span>
                      <span>Claims: {task.claims?.length || 0}</span>
                      <span>•</span>
                      <span>Assignments: {task.assignments?.length || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Link
                      href={`/network/tasks/${task.id}?project_id=${selectedProjectId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-[#FFFFFF] text-xs font-medium rounded transition"
                    >
                      <span>Inspect Claims &amp; Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
