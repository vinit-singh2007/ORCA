/**
 * ORCA 3.0 — I11 Institutional Audit Log Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen I11 (Audit log)
 * - UI URL: /org/[orgId]/settings/audit
 * - Primary personas: Auditor, Org Admin, Compliance Officer
 * - Highest referenced API gate: P08 (RBAC, Multi-Org & Tenant Fencing)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.14: GET /v1/admin/audit-events (tamper-evident immutable audit trail)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 * - Zero mock data dependencies
 * - Dynamic loading, error, and empty states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import {
  FileText,
  Shield,
  Download,
  Filter,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AuditLogPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.getAuditEvents({ org_id: orgId || undefined, limit: 50 });
      setLogs(res.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve tamper-evident audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [orgId]);

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={orgId ? `/org/${orgId}/overview` : '/workspaces'} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#6B7280]">Settings</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Audit Log</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Tamper-Evident Audit Trail</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I11 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Append-only cryptographic audit records for sensitive data retrievals, sign-offs, and delegations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadAudit}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
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
              Audit Log Retrieval Notice
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Logs Table */}
        {!loading && !error && logs.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <Shield className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No audit events recorded</h3>
            <p className="text-xs text-[#6B7280]">
              Audit events will be logged here as institutional actions and verification reviews occur.
            </p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[11px] text-[#6B7280]">
                  <th className="py-2.5 px-4 font-medium">Timestamp</th>
                  <th className="py-2.5 px-4 font-medium">Principal</th>
                  <th className="py-2.5 px-4 font-medium">Event Type</th>
                  <th className="py-2.5 px-4 font-medium">Event ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="py-3 px-4 text-[#6B7280] text-[11px]">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Recent'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#111827]">
                      {log.principal_id || 'System'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{log.event_type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#6B7280] text-[10px]">
                      {log.id}
                    </td>
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
