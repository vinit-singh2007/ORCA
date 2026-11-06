'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { DisagreementRun, ResearchProject } from '@/types/api';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  FileText,
  Lock,
  ChevronRight,
  Info,
  Layers,
  Bot,
  ExternalLink,
  Copy,
  Zap,
} from 'lucide-react';

const OPERATOR_ACCEPTANCE_PROJECT = 'bd11b1ae-1934-468e-a92a-bf57529df56f';

export default function DisagreementDemoPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const { session, selectedOrg } = useAuth();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [runs, setRuns] = useState<DisagreementRun[]>([]);
  const [runsLoading, setRunsLoading] = useState(false);

  const [activeRun, setActiveRun] = useState<DisagreementRun | null>(null);
  const [startingRun, setStartingRun] = useState(false);
  const [correctingRun, setCorrectingRun] = useState(false);
  const [approvePublicRef, setApprovePublicRef] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const activeOrgId = selectedOrg?.id || orgId;

  // Load user's projects
  const loadProjects = useCallback(async () => {
    if (!activeOrgId) return;
    setProjectsLoading(true);
    try {
      const res = await apiClient.listProjects({ organization_id: activeOrgId, limit: 50 });
      const items = res?.items || [];
      setProjects(items);
      if (items.length > 0) {
        setSelectedProjectId(items[0].id);
      } else {
        setSelectedProjectId(OPERATOR_ACCEPTANCE_PROJECT);
      }
    } catch {
      setSelectedProjectId(OPERATOR_ACCEPTANCE_PROJECT);
    } finally {
      setProjectsLoading(false);
    }
  }, [activeOrgId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Load runs for selected project
  const loadRuns = useCallback(async () => {
    if (!selectedProjectId) return;
    setRunsLoading(true);
    setError(null);
    try {
      const list = await apiClient.listDisagreements(selectedProjectId);
      setRuns(Array.isArray(list) ? list : []);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Unable to load disagreement runs for project');
    } finally {
      setRunsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      loadRuns();
    }
  }, [selectedProjectId, loadRuns]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimerRef.current) clearTimeout(pollingTimerRef.current);
      isPollingRef.current = false;
    };
  }, []);

  // Poll active run
  const pollActiveRun = useCallback((runId: string, projectId: string) => {
    isPollingRef.current = true;

    const poll = async () => {
      if (!isPollingRef.current) return;
      try {
        const run = await apiClient.getDisagreementRun(runId, projectId);
        setActiveRun(run);

        // Pause polling if reached challenged state (waiting for user), or completed/failed
        if (run.status === 'challenged') {
          isPollingRef.current = false;
          return;
        }
        if (run.status === 'completed' || run.status === 'failed') {
          isPollingRef.current = false;
          loadRuns();
          return;
        }

        pollingTimerRef.current = setTimeout(poll, 2000);
      } catch {
        isPollingRef.current = false;
      }
    };

    pollingTimerRef.current = setTimeout(poll, 2000);
  }, [loadRuns]);

  // Start new disagreement run
  const handleStartRun = async () => {
    if (!selectedProjectId) return;
    setStartingRun(true);
    setError(null);
    setActionSuccess(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const run = await apiClient.createDisagreementRun(
        selectedProjectId,
        approvePublicRef,
        idempotencyKey
      );
      setActiveRun(run);
      setActionSuccess(`Disagreement run ${run.id.slice(0, 8)} initialized.`);
      if (run.status !== 'completed' && run.status !== 'failed' && run.status !== 'challenged') {
        pollActiveRun(run.id, selectedProjectId);
      }
      loadRuns();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Failed to initiate disagreement run');
    } finally {
      setStartingRun(false);
    }
  };

  // Request clean-input rerun (correction)
  const handleCorrectRun = async () => {
    if (!activeRun || !selectedProjectId) return;
    setCorrectingRun(true);
    setError(null);
    try {
      const newIdempotencyKey = apiClient.generateIdempotencyKey();
      const currentVersion = activeRun.version || 1;
      const updated = await apiClient.correctDisagreementRun(
        activeRun.id,
        selectedProjectId,
        currentVersion,
        newIdempotencyKey
      );
      setActiveRun(updated);
      setActionSuccess('Clean-input rerun submitted. Resuming A2A verification.');
      pollActiveRun(activeRun.id, selectedProjectId);
      loadRuns();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Failed to submit correction run');
    } finally {
      setCorrectingRun(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={orgId ? `/org/${orgId}/overview` : '/workspaces'} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <Link href={`/org/${orgId}/research/investigations`} className="hover:text-[#111827]">
            Research
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Intentional Disagreement Demo</span>
        </div>

        {/* Permanent Synthetic Data Badge & Protocol Notice */}
        <div className="p-4 rounded border border-amber-200 bg-amber-50 text-amber-900 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-900 text-amber-100 tracking-wider">
                Synthetic Data · Intentional Disagreement
              </span>
              <span className="text-xs font-semibold text-amber-900">
                A2A Challenge &amp; Autonomous Resolution Protocol
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Private Demo Slice · No Unconsented Blockchain Publishing
            </span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800">
            This demonstration runs actual agent-to-agent (A2A) review messages and produces signed artifacts.
            The producer intentionally calculates with a synthetic flaw (~2°C anomaly), which is intercepted by an independent reviewer agent, paused at <strong className="font-mono">challenged</strong>, and requires explicit authorization to trigger the clean-input rerun (~1°C resolution).
          </p>
        </div>

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">A2A Intentional Disagreement Studio</h1>
            <p className="text-xs text-[#4B5563] mt-1">
              Test decentralized multi-agent verification: injection, challenge detection, and clean re-execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={loadRuns}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Runs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Project Selector Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <span className="text-[#6B7280] font-medium">Target Project:</span>
            {projectsLoading ? (
              <span className="text-[#9CA3AF]">Loading projects...</span>
            ) : (
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
                <option value={OPERATOR_ACCEPTANCE_PROJECT}>
                  Oracle Acceptance Project (bd11b1ae...)
                </option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <label className="flex items-center gap-1.5 text-[#4B5563] cursor-pointer select-none">
              <input
                suppressHydrationWarning
                type="checkbox"
                checked={approvePublicRef}
                onChange={(e) => setApprovePublicRef(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#111827] focus:ring-0"
              />
              <span className="text-[11px]">Approve public Arkiv reference</span>
            </label>

            <button
              suppressHydrationWarning
              onClick={handleStartRun}
              disabled={startingRun || !selectedProjectId}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded text-xs font-semibold hover:bg-[#374151] transition disabled:opacity-40"
            >
              {startingRun ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Start Disagreement Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => setError(null)}
              className="text-xs text-red-600 underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="p-3 border border-green-200 bg-green-50 rounded text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Active Disagreement Lifecycle Tracker */}
        {activeRun && (
          <div className="border border-[#111827] rounded bg-[#FFFFFF] p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7EB] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#111827]">Active Disagreement Run</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#FFFFFF]">
                    RUN ID: {activeRun.id}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-1 font-mono">
                  State: <strong className="uppercase text-[#111827]">{activeRun.status}</strong> · Version: {activeRun.version}
                </p>
              </div>

              {/* Explicit Clean Rerun Trigger if paused at challenged */}
              {activeRun.status === 'challenged' && (
                <div className="flex items-center gap-2">
                  <button
                    suppressHydrationWarning
                    onClick={handleCorrectRun}
                    disabled={correctingRun}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 transition shadow-sm animate-pulse"
                  >
                    {correctingRun ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Clean Rerun...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Request Clean-Input Rerun (Correction)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Stages Progression Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { key: 'producer', label: '1. Producer Run', desc: 'Synthetic Flaw (~2°C)' },
                { key: 'review', label: '2. Reviewer Audit', desc: 'Discrepancy Check' },
                { key: 'challenged', label: '3. Challenge Gate', desc: 'Execution Paused' },
                { key: 'correction', label: '4. Clean Rerun', desc: 'Corrected Input' },
                { key: 're_review_resolved', label: '5. Resolved', desc: 'Final Validated (~1°C)' },
              ].map((step, idx) => {
                const stageData = activeRun.stages?.find((s) => s.stage === step.key);
                const isCurrent = activeRun.status === step.key;
                const isCompleted =
                  stageData?.status === 'completed' ||
                  (activeRun.status === 'completed' && ['producer', 'review', 'challenged', 'correction', 're_review_resolved'].includes(step.key)) ||
                  (activeRun.status === 'corrected' && ['producer', 'review', 'challenged'].includes(step.key));

                let badgeCls = 'border-[#E5E7EB] bg-[#F8F9FA] text-[#6B7280]';
                if (isCurrent && activeRun.status === 'challenged') {
                  badgeCls = 'border-amber-400 bg-amber-50 text-amber-900 ring-2 ring-amber-300';
                } else if (isCurrent) {
                  badgeCls = 'border-blue-400 bg-blue-50 text-blue-900 ring-2 ring-blue-300';
                } else if (isCompleted) {
                  badgeCls = 'border-green-300 bg-green-50 text-green-900';
                }

                return (
                  <div key={step.key} className={`p-3 rounded border ${badgeCls} space-y-1`}>
                    <div className="text-[11px] font-bold">{step.label}</div>
                    <div className="text-[10px] text-[#4B5563]">{step.desc}</div>
                    {stageData?.anomaly !== undefined && (
                      <div className="text-xs font-mono font-bold mt-1">
                        Anomaly: {stageData.anomaly > 0 ? `+${stageData.anomaly}` : stageData.anomaly} °C
                      </div>
                    )}
                    <div className="text-[10px] font-mono uppercase mt-1">
                      {isCompleted ? '✓ Passed' : isCurrent ? '● Active' : '○ Pending'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Challenged Pause Banner */}
            {activeRun.status === 'challenged' && (
              <div className="p-4 rounded border-2 border-amber-300 bg-amber-50 text-amber-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                  <span>Methodological Challenge Raised — Execution Paused</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  Independent reviewer agent intercepted an intentional anomaly discrepancy in the producer output.
                  In accordance with the ORCA protocol, the computation is paused at this verification gate.
                  To resolve the challenge, the research operator must authorize the clean-input rerun above.
                </p>
              </div>
            )}

            {/* Resolved Anomalies Summary */}
            {activeRun.anomalies && activeRun.anomalies.length > 0 && (
              <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded space-y-1 text-xs">
                <div className="font-semibold text-[#111827]">Anomaly Transition Series:</div>
                <div className="flex items-center gap-2 font-mono">
                  {activeRun.anomalies.map((val, i) => (
                    <span
                      key={i}
                      className={`px-2 py-0.5 rounded border text-xs font-bold ${
                        i === 0
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-green-100 border-green-300 text-green-900'
                      }`}
                    >
                      {val > 0 ? `+${val}` : val} °C
                    </span>
                  ))}
                  <span className="text-[10px] text-[#6B7280]">(Producer synthetic flaw resolved to clean baseline)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Existing Runs List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111827]">
              Disagreement Demonstrations ({runs.length})
            </h3>
            <span className="text-xs text-[#6B7280]">Project ID: {selectedProjectId.slice(0, 8)}...</span>
          </div>

          {runsLoading ? (
            <div className="p-8 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading disagreement runs from Oracle backend...</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6B7280] space-y-2">
              <div>No disagreement runs recorded for this project yet.</div>
              <button
                suppressHydrationWarning
                onClick={handleStartRun}
                className="px-3 py-1.5 bg-[#111827] text-white rounded text-xs font-medium hover:bg-[#374151]"
              >
                Launch First Disagreement Run
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] font-mono text-[#4B5563] uppercase">
                <tr>
                  <th className="py-3 px-4">Run Identifier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Version</th>
                  <th className="py-3 px-4">Anomalies</th>
                  <th className="py-3 px-4">Public Ref</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {runs.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3 px-4 font-mono font-semibold text-[#111827]">
                      {r.id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold ${
                          r.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : r.status === 'challenged'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">v{r.version}</td>
                    <td className="py-3 px-4 font-mono text-[#4B5563]">
                      {r.anomalies?.join(', ') || '—'} °C
                    </td>
                    <td className="py-3 px-4 text-[10px] font-mono">
                      {r.approve_public_reference ? (
                        <span className="text-green-700">Consented</span>
                      ) : (
                        <span className="text-[#9CA3AF]">Private Only</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        suppressHydrationWarning
                        onClick={() => {
                          setActiveRun(r);
                          if (r.status !== 'completed' && r.status !== 'failed' && r.status !== 'challenged') {
                            pollActiveRun(r.id, selectedProjectId);
                          }
                        }}
                        className="text-xs font-semibold text-[#111827] hover:underline"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Existing Operator Acceptance Records Reference */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded space-y-2 text-xs">
          <div className="font-semibold text-[#111827] flex items-center justify-between">
            <span>Oracle Live Operator Acceptance Records</span>
            <span className="text-[10px] font-mono text-[#6B7280]">Verified Internal Runs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-[#4B5563]">
            <div className="p-2 border border-[#E5E7EB] bg-[#FFFFFF] rounded">
              <div className="text-[#6B7280]">Real-Source Mur SST Succeeded Run:</div>
              <div className="text-[#111827] font-bold">55ea4442-5a97-48de-89e5-0626129f114e</div>
              <div className="text-[10px] text-green-700 mt-0.5">Anomaly: +0.623497 °C (Report Generated)</div>
            </div>
            <div className="p-2 border border-[#E5E7EB] bg-[#FFFFFF] rounded">
              <div className="text-[#6B7280]">Private Intentional-Data A2A Run:</div>
              <div className="text-[#111827] font-bold">74f32bda-8a6a-415b-922c-993a9104a900</div>
              <div className="text-[10px] text-amber-700 mt-0.5">Resolved Anomalies: [2, 1, 1, 1] °C</div>
            </div>
            <div className="p-2 border border-[#E5E7EB] bg-[#FFFFFF] rounded">
              <div className="text-[#6B7280]">Authorized Operator Project:</div>
              <div className="text-[#111827] font-bold">bd11b1ae-1934-468e-a92a-bf57529df56f</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">Bound by membership authority check</div>
            </div>
            <div className="p-2 border border-[#E5E7EB] bg-[#FFFFFF] rounded">
              <div className="text-[#6B7280]">Public Arkiv Task Reference:</div>
              <div className="text-[#111827] font-bold">84410849-a102-4269-b52f-d7d3333ec626</div>
              <div className="text-[10px] text-[#6B7280] mt-0.5">4 retained testnet records</div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

