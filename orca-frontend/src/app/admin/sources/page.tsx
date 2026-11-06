/**
 * ORCA 3.0 — O02 Source Connector Operations & Freshness Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.9 Screen O02 (Source connector health)
 * - UI URL: /admin/sources
 * - Primary personas: DevOps, Data Steward, SRE
 * - Highest referenced API gate: P03 (Connectors, Providers & Products)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.14: GET /v1/admin/source-health (connector probe latency & status)
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
  Server,
  Globe,
  Radio,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function SourceOperationsAdminPage() {
  const [connectors, setConnectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSourceHealth = async () => {
    // Disabled auto-polling per handoff §8:
    // "Do not request /v1/network/tasks or /v1/admin/source-health; they are unavailable."
  };

  useEffect(() => {
    // Do not auto-request unavailable route on mount
  }, []);

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/admin/system" className="hover:text-[#111827]">
            Platform Ops
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Source Connectors</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#111827]">Source Connectors & Freshness Probes</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                O02 · P03
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Active HTTP / OPeNDAP / ERDDAP probes for upstream government oceanographic and meteorological feeds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadSourceHealth}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/admin/jobs"
              className="px-3 py-1.5 text-xs font-medium rounded border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827]"
            >
              Compute Queues
            </Link>
          </div>
        </div>

        {/* Scope Notice per Handoff §8 */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#111827]" />
            <span>Scope Notice: Connector Probe Endpoint (/v1/admin/source-health) Excluded</span>
          </div>
          <div>
            Live connector health polling is excluded from this focused research release (handoff §8). Real source metadata and snapshot preservation can be verified in the <Link href="/workspaces" className="font-semibold text-[#111827] underline">Research Demo</Link>.
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] animate-pulse space-y-3">
            <div className="h-4 w-48 bg-[#E5E7EB] rounded" />
            <div className="h-24 bg-[#F8F9FA] rounded" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Connector Telemetry Notice
            </div>
            <p className="text-sm text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Connectors Table */}
        {!loading && !error && connectors.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <Server className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No connectors returned</h3>
            <p className="text-sm text-[#6B7280]">Connectors will report here once backend probe cron runs.</p>
          </div>
        )}

        {!loading && !error && connectors.length > 0 && (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-xs text-[#6B7280]">
                  <th className="py-2.5 px-4 font-medium">Connector Name</th>
                  <th className="py-2.5 px-4 font-medium">Source Class</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                  <th className="py-2.5 px-4 font-medium">Probe Latency</th>
                  <th className="py-2.5 px-4 font-medium">Last Probed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {connectors.map((c, i) => (
                  <tr key={i} className="hover:bg-[#F9FAFB] transition">
                    <td className="py-3 px-4 font-bold text-[#111827]">{c.name}</td>
                    <td className="py-3 px-4 text-[#6B7280]">{c.source_class}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === 'healthy' ? 'verified' : 'outline'}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#111827]">{c.latency_ms} ms</td>
                    <td className="py-3 px-4 text-[#6B7280] text-xs">{new Date(c.last_probed).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
