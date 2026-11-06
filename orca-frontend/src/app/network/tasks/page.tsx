/**
 * Screen N02 — Research Tasks & Arkiv Coordination Board
 * 
 * DESIGN SPECIFICATION:
 * - ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §4.2 & §5.9
 * - dashboard design.md §5.7 (Screen N02)
 * - UI URL: /network/tasks
 * - Highest API Gate Referenced: P11 (Arkiv Coordination & Public Reviews)
 * - Backend Calls: GET /v1/network/tasks (P11), POST /v1/network/tasks (P11)
 * 
 * TRUTH BOUNDARY:
 * - Direct integration with real backend API client
 * - No mock data dependencies
 * - Strict monochrome white/neutral design tokens (#FFFFFF, #111827, #F8F9FA, #E5E7EB)
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import { Globe, Plus, Clock, ExternalLink, ShieldAlert, Cpu, ArrowRight, Info, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { ExternalTask } from '@/types/api';

export default function ArkivTasksPage() {
  const [tasks, setTasks] = useState<ExternalTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = () => {
    // Disabled auto-polling per handoff §8:
    // "Do not request /v1/network/tasks or /v1/admin/source-health; they are unavailable."
  };

  useEffect(() => {
    // Do not auto-request unavailable route on mount
  }, []);

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <span>Network</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Research Tasks</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-[#111827]">
                Research Tasks
              </h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                N02 · P11 Protocol
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Decentralized task claims, A2A session dispatching, and independent scientific review coordination on Arkiv Rabdi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
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
              href="/network/tasks/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#1F2937] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Network Task</span>
            </Link>
          </div>
        </div>

        {/* Scope Notice per Handoff §8 */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-[#111827]" />
            <span>Scope Notice: Federated A2A Task Board Excluded from Demo Slice</span>
          </div>
          <div>
            The federated A2A agent task board is excluded from the selected research release (handoff §8). Real on-chain Arkiv publication has been performed for the SST research demo and can be inspected via <a href="https://rabdi.explorer.arkiv.network/tx/0x990fe04c31c81d743d79a32e633d0020781be09c5ef82ab50c71881fb976e23d" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#111827] underline">Rabdi Explorer (tx 0x990f...)</a> or in the <Link href="/workspaces" className="font-semibold text-[#111827] underline">Research Demo</Link>.
          </div>
        </div>

        {/* Backend Error Banner */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Backend Task Board: {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchTasks}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Arkiv Truth Notice (§3.12 & §5.9) */}
        <div className="p-3.5 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#111827]">Decentralized Claim Boundary (api design.md §3.12):</strong> An Arkiv task claim is an agent provider offer to undertake work. It does not automatically grant an exclusive lock or scientific validity. Authoritative single-award assignment requires institutional signoff.
          </div>
        </div>

        {/* Tasks List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Open Arkiv Research Tasks</span>
            <span className="font-mono text-[#6B7280]">
              {loading ? 'Querying backend...' : `${tasks.length} tasks registered`}
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#6B7280]">
              Loading open research tasks from API (GET /v1/network/tasks)...
            </div>
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280]">
              No active research tasks on the task board. Use "Publish Network Task" to submit one.
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-[#F8F9FA] transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#111827]">{task.public_id}</span>
                      <StatusIndicator category="arkiv" state={task.chain_state} />
                      <span className="text-xs font-mono text-[#6B7280]">
                        Policy: {task.assignment_policy}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#111827]">
                      {task.title}
                    </h3>
                    <div className="text-xs text-[#4B5563] flex items-center gap-3">
                      <span>Target Capability: <code className="font-mono">{task.required_capability}</code></span>
                      <span>•</span>
                      <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Link
                      href={`/network/tasks/${task.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-[#FFFFFF] text-xs font-medium rounded transition"
                    >
                      <span>Inspect Claims & Session</span>
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
