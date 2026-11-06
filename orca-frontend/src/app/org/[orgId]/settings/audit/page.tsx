/**
 * ORCA 3.0 — I11 Audit & Access Decisions Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.2 Screen I11 (Audit & access decisions)
 * - UI URL: /org/[orgId]/settings/audit
 * - Primary personas: Auditor, Org Admin, PI, Security Officer
 * - Highest referenced API gate: P08 (Institutional operations)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.8: GET /v1/audit-events (tamper-evident audit log)
 * - api design.md §3.8: GET /v1/audit-events/{id} (full decision context)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Protected evidence stays redacted; current role gates strictly apply
 * - Decisions explicitly marked as allow vs deny with RFC 9457 justification
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  decision: 'allow' | 'deny';
  ipAddress: string;
  reason?: string;
  fixture: true;
}

const MOCK_AUDIT_LOGS: AuditEvent[] = [
  {
    id: '00000000-0000-4000-8000-000000000801',
    timestamp: '2026-11-06T06:15:22Z',
    actor: 'Dr. Vinit (PI)',
    action: 'investigation.plan.approve',
    resource: 'urn:orca:investigation:00000000-0000-4000-8000-000000000201:plan',
    decision: 'allow',
    ipAddress: '103.21.144.12',
    fixture: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000802',
    timestamp: '2026-11-06T05:40:11Z',
    actor: 'external-agent-bot (Unauthenticated)',
    action: 'evidence.raw.download',
    resource: 'urn:orca:artifact:00000000-0000-4000-8000-000000000301:raw',
    decision: 'deny',
    ipAddress: '198.51.100.44',
    reason: 'RFC 9457: Missing OIDC Bearer Token or valid Access Grant',
    fixture: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000803',
    timestamp: '2026-11-05T18:22:04Z',
    actor: 'Dr. Marcus Vance (Auditor)',
    action: 'audit.lineage.inspect',
    resource: 'urn:orca:artifact:00000000-0000-4000-8000-000000000301:provenance',
    decision: 'allow',
    ipAddress: '192.0.2.88',
    fixture: true,
  },
];

export default function AuditDecisionsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '00000000-0000-4000-8000-000000000010';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDecision, setFilterDecision] = useState<'all' | 'allow' | 'deny'>('all');

  const filteredLogs = MOCK_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDecision = filterDecision === 'all' || log.decision === filterDecision;
    return matchesSearch && matchesDecision;
  });

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#6B7280]">Settings</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Audit & Access Decisions</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Tamper-Evident Security & Access Audit</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I11 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Append-only audit ledger recording every authentication, grant evaluation, and scientific authorization decision.
            </p>
          </div>

          <button
            onClick={() => alert('Exporting audit log as CSV (Synthetic preview)...')}
            className="px-3.5 py-2 text-xs font-medium border border-[#E5E7EB] rounded bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#111827] flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Filter by actor, action name, or resource URN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select
              value={filterDecision}
              onChange={(e) => setFilterDecision(e.target.value as any)}
              className="text-xs border border-[#E5E7EB] rounded px-3 py-2 bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              <option value="all">All Decisions</option>
              <option value="allow">Allowed Decisions Only</option>
              <option value="deny">Denied / Blocked Access</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Security Decision Log</span>
            <span className="font-mono text-[#6B7280] text-[11px]">{filteredLogs.length} events</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Timestamp (UTC)</th>
                <th className="px-4 py-2.5">Actor</th>
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Resource Target</th>
                <th className="px-4 py-2.5 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-mono text-[11px] text-[#6B7280]">
                    {log.timestamp.replace('T', ' ').replace('Z', '')}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#111827]">
                    {log.actor}
                    <span className="text-[10px] text-[#6B7280] block font-mono">{log.ipAddress}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-[#111827]">{log.action}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#4B5563] max-w-xs truncate">
                    {log.resource}
                    {log.reason && (
                      <span className="text-[10px] text-[#991B1B] block font-sans mt-0.5">{log.reason}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded ${
                        log.decision === 'allow'
                          ? 'bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB]'
                          : 'bg-[#111827] text-[#FFFFFF]'
                      }`}
                    >
                      {log.decision === 'allow' ? (
                        <CheckCircle2 className="w-3 h-3 text-[#111827]" />
                      ) : (
                        <XCircle className="w-3 h-3 text-[#FFFFFF]" />
                      )}
                      <span>{log.decision.toUpperCase()}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

