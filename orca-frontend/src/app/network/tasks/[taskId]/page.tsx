'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { NetworkTaskDetail, NetworkTaskTimelineEvent, NetworkTaskClaim } from '@/types/api';
import {
  Globe,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Send,
  Cpu,
  Key,
  ShieldAlert,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Loader2,
  Plus,
} from 'lucide-react';

const OPERATOR_PROJECT = 'bd11b1ae-1934-468e-a92a-bf57529df56f';

export default function NetworkTaskDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const taskId = (params?.taskId as string) || '';
  const projectId = searchParams?.get('project_id') || OPERATOR_PROJECT;

  const [task, setTask] = useState<NetworkTaskDetail | null>(null);
  const [timeline, setTimeline] = useState<NetworkTaskTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  const [providerIdInput, setProviderIdInput] = useState('00000000-0000-4000-8000-000000000901');
  const [claiming, setClaiming] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  const fetchTaskDetails = useCallback(() => {
    if (!taskId || !projectId) return;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      apiClient.getNetworkTask(taskId, projectId),
      apiClient.getNetworkTaskTimeline(taskId, projectId),
    ]).then(([taskRes, timelineRes]) => {
      if (taskRes.status === 'fulfilled' && taskRes.value) {
        setTask(taskRes.value);
        if (taskRes.value.claims && taskRes.value.claims.length > 0) {
          setSelectedClaimId(taskRes.value.claims[0].id || taskRes.value.claims[0].claim_id || '');
        }
      } else if (taskRes.status === 'rejected') {
        const err = taskRes.reason as OrcaApiError;
        setError(err.problem?.detail || 'Task not found on backend');
      }

      if (timelineRes.status === 'fulfilled' && Array.isArray(timelineRes.value)) {
        setTimeline(timelineRes.value);
      }
      setLoading(false);
    });
  }, [taskId, projectId]);

  useEffect(() => {
    fetchTaskDetails();
  }, [fetchTaskDetails]);

  const handleAssignProvider = async () => {
    if (!task || !selectedClaimId) return;
    setAssigning(true);
    setAssignSuccess(null);
    setError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      await apiClient.assignTaskProvider(
        task.id,
        projectId,
        {
          claim_id: selectedClaimId,
          expected_generation: task.generation ?? 0,
        },
        idempotencyKey
      );
      setAssignSuccess(`Authoritative provider assignment submitted for claim ${selectedClaimId.slice(0, 8)}...`);
      fetchTaskDetails();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(`Assignment failed: ${apiErr.problem?.detail || apiErr.message}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !providerIdInput) return;
    setClaiming(true);
    setError(null);
    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      await apiClient.claimNetworkTask(task.id, projectId, providerIdInput, idempotencyKey);
      setShowClaimForm(false);
      fetchTaskDetails();
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(`Claim submission failed: ${apiErr.problem?.detail || apiErr.message}`);
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto py-12 text-center text-xs text-[#6B7280] flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading task details and claims from Oracle backend...</span>
        </div>
      </Shell>
    );
  }

  if (error && !task) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto space-y-4 py-8">
          <Link
            href={`/network/tasks?project_id=${projectId}`}
            className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Research Tasks
          </Link>
          <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-[#111827] mx-auto" />
            <h2 className="text-sm font-semibold text-[#111827]">Task Not Found or Inaccessible</h2>
            <p className="text-xs text-[#4B5563]">{error || 'Task could not be loaded from the backend gateway.'}</p>
            <button
              suppressHydrationWarning
              onClick={fetchTaskDetails}
              className="px-3 py-1.5 border border-[#111827] text-xs font-medium rounded hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const claims = task?.claims || [];

  return (
    <Shell>
      <div className="space-y-6 w-full max-w-5xl">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Link href={`/network/tasks?project_id=${projectId}`} className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Research Tasks
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium font-mono">{task?.id}</span>
        </div>

        {/* Task Header Card */}
        {task && (
          <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#111827]">{task.id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#111827] uppercase font-bold">
                    {task.status || 'Active'}
                  </span>
                  <span className="text-xs font-mono text-[#6B7280]">
                    Generation #{task.generation ?? 0}
                  </span>
                </div>
                <h1 className="text-lg font-bold text-[#111827] mt-1">
                  Capability: {task.capability || 'sst.seasonal_anomaly'}
                </h1>
                <p className="text-xs text-[#4B5563] mt-0.5 font-mono">
                  Project: {task.project_id} {task.source_run_id && `• Source Run: ${task.source_run_id}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  suppressHydrationWarning
                  onClick={fetchTaskDetails}
                  className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280]"
                  title="Refresh Task"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E5E7EB] text-xs">
              <div>
                <span className="text-[#6B7280] block text-[11px]">Provider Claims</span>
                <strong className="font-mono text-[#111827]">{claims.length} registered</strong>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">Authoritative Assignments</span>
                <strong className="font-mono text-[#111827]">{task.assignments?.length || 0} awarded</strong>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">Generated Artifacts</span>
                <strong className="font-mono text-[#111827]">{task.artifacts?.length || 0} records</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Alerts */}
        {error && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {assignSuccess && (
          <div className="p-3 border border-green-200 bg-green-50 rounded text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{assignSuccess}</span>
          </div>
        )}

        {/* Claims & Assignment Section */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">
                Agent Provider Claims ({claims.length})
              </h2>
              <p className="text-xs text-[#6B7280]">
                Select a verified provider claim and commit an authoritative award assignment.
              </p>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => setShowClaimForm(!showClaimForm)}
              className="text-xs font-semibold text-[#111827] px-2.5 py-1 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Submit Provider Claim</span>
            </button>
          </div>

          {/* New Claim Submission Form */}
          {showClaimForm && (
            <form onSubmit={handleCreateClaim} className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded space-y-3 text-xs">
              <div className="font-semibold text-[#111827]">Register New Claim for Provider</div>
              <div>
                <label className="block text-[11px] text-[#4B5563] mb-1 font-mono">Provider Agent ID (UUID)</label>
                <input
                  suppressHydrationWarning
                  type="text"
                  required
                  value={providerIdInput}
                  onChange={(e) => setProviderIdInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded bg-white font-mono text-xs focus:outline-none focus:border-[#111827]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowClaimForm(false)}
                  className="px-2.5 py-1 text-xs text-[#6B7280] hover:text-[#111827]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={claiming}
                  className="px-3 py-1 bg-[#111827] text-white text-xs font-semibold rounded hover:bg-[#374151] disabled:opacity-40"
                >
                  {claiming ? 'Submitting...' : 'Register Claim'}
                </button>
              </div>
            </form>
          )}

          {claims.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7280] border border-dashed border-[#E5E7EB] rounded">
              No claims submitted for this task yet. External A2A providers can claim this task.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => {
                const claimId = claim.id || claim.claim_id || '';
                return (
                  <div
                    key={claimId}
                    onClick={() => setSelectedClaimId(claimId)}
                    className={`p-3.5 border rounded cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedClaimId === claimId
                        ? 'border-[#111827] bg-[#F8F9FA]'
                        : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-sm text-[#111827] flex items-center gap-2">
                        <input
                          suppressHydrationWarning
                          type="radio"
                          name="claim"
                          checked={selectedClaimId === claimId}
                          onChange={() => setSelectedClaimId(claimId)}
                          className="text-[#111827]"
                        />
                        <span className="font-mono text-xs">Claim: {claimId}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#6B7280] pl-5">
                        Provider ID: {claim.provider_id} • Status: {claim.status || 'Active'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Assignment Trigger */}
          <div className="pt-3 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-[11px] text-[#6B7280] font-mono">
              POST /v1/network/tasks/{task?.id}/assignments?project_id={projectId.slice(0, 8)}... (Generation #{task?.generation ?? 0})
            </span>

            <button
              suppressHydrationWarning
              onClick={handleAssignProvider}
              disabled={assigning || !selectedClaimId || claims.length === 0}
              className="px-4 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-semibold rounded hover:bg-[#1F2937] transition flex items-center gap-1.5 disabled:opacity-40"
            >
              {assigning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <>
                  <Key className="w-3.5 h-3.5" />
                  <span>Commit Single-Award Assignment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Task Timeline & Stages */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Live Execution Timeline</h2>
              <p className="text-xs text-[#6B7280]">
                Telemetry recorded via /tasks/{taskId.slice(0, 8)}.../timeline.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#4B5563]">
              {timeline.length} events
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#6B7280]">
              No timeline stages recorded yet. Events will appear here once provider computation begins.
            </div>
          ) : (
            <div className="space-y-2">
              {timeline.map((event, idx) => (
                <div key={idx} className="p-3 border border-[#E5E7EB] rounded text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#6B7280] text-[10px]">{event.timestamp}</span>
                    <strong className="text-[#111827] font-semibold">{event.stage}</strong>
                    {event.detail && <span className="text-[#4B5563]">— {event.detail}</span>}
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
