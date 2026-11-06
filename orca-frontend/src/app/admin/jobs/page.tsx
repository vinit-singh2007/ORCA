/**
 * ORCA 3.0 — O03 Durable Compute Jobs & Worker Leases Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.9 Screen O03 (Job queues & durable execution)
 * - UI URL: /admin/jobs
 * - Primary personas: DevOps, SRE, Platform Operator
 * - Highest referenced API gate: P04 (Durable Execution & Fencing Leases)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.14: GET /v1/admin/job-health (queue depth, stale leases)
 * - api design.md §3.14: GET /v1/admin/leases (fenced compute worker leases)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 * - Zero mock data dependencies
 * - Dynamic loading, error, and empty states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import {
  Layers,
  Cpu,
  Clock,
  RotateCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function JobQueuesAdminPage() {
  const [jobHealth, setJobHealth] = useState<any | null>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadJobsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, leaseList] = await Promise.all([
        apiClient.getJobHealth(),
        apiClient.getLeases().catch(() => []),
      ]);
      setJobHealth(health);
      setLeases(leaseList || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query worker lease health from gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsData();
  }, []);

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/admin/system" className="hover:text-[#111827]">
            Platform Ops
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Job Queues & Leases</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#111827]">Durable Execution & Fencing Leases</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                O03 · P04
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Distributed worker fencing tokens, monotonic lease renewals, and task queue depth telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadJobsData}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/admin/system"
              className="px-3 py-1.5 text-xs font-medium rounded border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827]"
            >
              System Health
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] animate-pulse space-y-3">
            <div className="h-4 w-48 bg-[#E5E7EB] rounded" />
            <div className="h-20 bg-[#F8F9FA] rounded" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Queue Telemetry Notice
            </div>
            <p className="text-sm text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Telemetry Strip */}
        {!loading && jobHealth && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
              <span className="text-[#6B7280] text-xs block">QUEUED JOBS</span>
              <span className="text-lg font-bold text-[#111827] mt-0.5 block">{jobHealth.queued_jobs ?? 0}</span>
            </div>
            <div className="p-3 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
              <span className="text-[#6B7280] text-xs block">RUNNING WORKERS</span>
              <span className="text-lg font-bold text-[#111827] mt-0.5 block">{jobHealth.running_jobs ?? 0}</span>
            </div>
            <div className="p-3 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
              <span className="text-[#6B7280] text-xs block">STALE LEASES</span>
              <span className="text-lg font-bold text-[#111827] mt-0.5 block">{jobHealth.stale_leases ?? 0}</span>
            </div>
            <div className="p-3 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
              <span className="text-[#6B7280] text-xs block">FAILURES (24H)</span>
              <span className="text-lg font-bold text-[#111827] mt-0.5 block">{jobHealth.failed_last_24h ?? 0}</span>
            </div>
          </div>
        )}

        {/* Active Worker Leases Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <span className="font-mono text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Monotonic Worker Fencing Leases ({leases.length})
            </span>
          </div>

          {!loading && leases.length === 0 && (
            <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
              <Cpu className="w-8 h-8 text-[#9CA3AF] mx-auto" />
              <h3 className="text-sm font-semibold text-[#111827]">No active worker leases</h3>
              <p className="text-sm text-[#6B7280]">Compute workers will register fencing tokens here when scientific runs are active.</p>
            </div>
          )}

          {!loading && leases.length > 0 && (
            <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#6B7280]">
                    <th className="py-2.5 px-4 font-medium">Worker ID</th>
                    <th className="py-2.5 px-4 font-medium">Investigation</th>
                    <th className="py-2.5 px-4 font-medium">Fencing Token</th>
                    <th className="py-2.5 px-4 font-medium">Expires At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {leases.map((lease, i) => (
                    <tr key={i} className="hover:bg-[#F9FAFB] transition">
                      <td className="py-3 px-4 font-bold text-[#111827]">{lease.worker_id}</td>
                      <td className="py-3 px-4 text-[#6B7280]">{lease.investigation_id}</td>
                      <td className="py-3 px-4">
                        <Badge variant="verified">Token #{lease.fencing_token}</Badge>
                      </td>
                      <td className="py-3 px-4 text-[#6B7280] text-xs">{new Date(lease.expires_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
