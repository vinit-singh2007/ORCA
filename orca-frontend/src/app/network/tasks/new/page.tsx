'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { NetworkOperation, ResearchProject } from '@/types/api';
import {
  Globe,
  Send,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const OPERATOR_PROJECT = 'bd11b1ae-1934-468e-a92a-bf57529df56f';
const OPERATOR_SOURCE_RUN = '55ea4442-5a97-48de-89e5-0626129f114e';

export default function PublishNetworkTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedOrg } = useAuth();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [projectId, setProjectId] = useState<string>(
    searchParams?.get('project_id') || OPERATOR_PROJECT
  );
  const [sourceRunId, setSourceRunId] = useState<string>(OPERATOR_SOURCE_RUN);
  const [capability, setCapability] = useState('sst.seasonal_anomaly');
  const [approvePublicRef, setApprovePublicRef] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState('7');

  const [submitting, setSubmitting] = useState(false);
  const [operation, setOperation] = useState<NetworkOperation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load user projects
  useEffect(() => {
    if (selectedOrg?.id) {
      apiClient
        .listProjects({ organization_id: selectedOrg.id })
        .then((res) => {
          if (res?.items && res.items.length > 0) {
            setProjects(res.items);
            if (!searchParams?.get('project_id')) {
              setProjectId(res.items[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [selectedOrg?.id, searchParams]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const pollOperation = (opId: string, projId: string) => {
    const poll = async () => {
      try {
        const op = await apiClient.getNetworkOperation(opId, projId);
        setOperation(op);
        if (op.status === 'succeeded') {
          setSubmitting(false);
          setSuccess('Task publication confirmed on network.');
          setTimeout(() => {
            router.push(`/network/tasks?project_id=${projId}`);
          }, 1500);
          return;
        }
        if (op.status === 'failed' || op.status === 'reconciliation_required') {
          setSubmitting(false);
          setError(`Task publication ${op.status}: ${op.error || 'Check network operation logs'}`);
          return;
        }
        pollingRef.current = setTimeout(poll, 2000);
      } catch (err) {
        setSubmitting(false);
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Error polling network operation');
      }
    };
    pollingRef.current = setTimeout(poll, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !sourceRunId) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setOperation(null);

    const deadlineSeconds = parseInt(deadlineDays, 10) * 86400;

    try {
      const idempotencyKey = apiClient.generateIdempotencyKey();
      const op = await apiClient.createNetworkTask(
        {
          project_id: projectId,
          source_run_id: sourceRunId,
          capability: capability || undefined,
          approve_public_reference: approvePublicRef,
          deadline_seconds: deadlineSeconds,
        },
        idempotencyKey
      );

      setOperation(op);
      const opId = op.id || op.operation_id;
      if (opId && op.status !== 'succeeded') {
        pollOperation(opId, projectId);
      } else {
        setSubmitting(false);
        setSuccess('Task publication submitted.');
        router.push(`/network/tasks?project_id=${projectId}`);
      }
    } catch (err) {
      setSubmitting(false);
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Failed to submit task to network gateway');
    }
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/network/tasks" className="hover:text-[#111827]">
            Federated Network
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Publish Research Task</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold text-[#111827]">Broadcast Task to Arkiv Network</h1>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              N03 · P11
            </span>
          </div>
          <p className="text-sm text-[#4B5563] mt-1">
            Dispatch an independent reproduction or data-processing task to decentralized A2A agent providers on the Arkiv board.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 border border-green-200 bg-green-50 rounded text-xs text-green-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Operation Polling Banner */}
        {operation && (
          <div className="p-4 border border-[#111827] bg-[#F8F9FA] rounded text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#111827]">Queued Network Operation</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#111827] text-white uppercase font-bold">
                {operation.status}
              </span>
            </div>
            <div className="font-mono text-[#6B7280] text-[11px]">
              Operation ID: {operation.id || operation.operation_id}
            </div>
            {submitting && (
              <div className="flex items-center gap-2 text-xs text-[#4B5563]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Polling operation status until confirmed on network...</span>
              </div>
            )}
          </div>
        )}

        {/* Task Formulation Form */}
        <form onSubmit={handleSubmit} className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-5 text-xs">
          <div>
            <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
              Project Authority Scope *
            </label>
            <select
              suppressHydrationWarning
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] font-mono focus:outline-none focus:border-[#111827]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
              <option value={OPERATOR_PROJECT}>
                Operator Acceptance Project ({OPERATOR_PROJECT})
              </option>
            </select>
            <p className="text-[10px] text-[#6B7280] mt-1">
              Required. Network tasks must be anchored to an authorized project UUID.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
              Source Research Run ID *
            </label>
            <input
              suppressHydrationWarning
              type="text"
              required
              value={sourceRunId}
              onChange={(e) => setSourceRunId(e.target.value)}
              placeholder="e.g. 55ea4442-5a97-48de-89e5-0626129f114e"
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] font-mono focus:outline-none focus:border-[#111827]"
            />
            <p className="text-[10px] text-[#6B7280] mt-1 font-mono">
              The completed computation run to be independently verified by external providers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Required Capability
              </label>
              <select
                suppressHydrationWarning
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="sst.seasonal_anomaly">sst.seasonal_anomaly</option>
                <option value="sst.daily_gradient">sst.daily_gradient</option>
                <option value="wave.peak_direction">wave.peak_direction</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Deadline (Days)
              </label>
              <select
                suppressHydrationWarning
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="1">1 Day (24 Hours)</option>
                <option value="3">3 Days (72 Hours)</option>
                <option value="7">7 Days (Standard)</option>
                <option value="14">14 Days</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-[#111827] select-none">
              <input
                suppressHydrationWarning
                type="checkbox"
                checked={approvePublicRef}
                onChange={(e) => setApprovePublicRef(e.target.checked)}
                className="rounded border-[#E5E7EB] text-[#111827] focus:ring-0"
              />
              <span className="font-semibold text-xs">Approve public Arkiv reference publication</span>
            </label>
            <p className="text-[10px] text-[#6B7280] ml-5 mt-0.5">
              Only checked if explicit public on-chain commitment is intended. Otherwise kept in private federation.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB]">
            <Link
              href="/network/tasks"
              className="text-xs text-[#6B7280] hover:text-[#111827] flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Task Board</span>
            </Link>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={submitting || !projectId || !sourceRunId}
              className="px-4 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#1F2937] transition flex items-center gap-1.5 disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting &amp; Polling...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Network Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
