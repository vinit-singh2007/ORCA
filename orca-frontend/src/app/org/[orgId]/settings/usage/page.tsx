/**
 * ORCA 3.0 — I10 Usage, Quotas & Budgets Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.2 Screen I10 (Usage, quota and budgets)
 * - UI URL: /org/[orgId]/settings/usage
 * - Primary personas: Org Admin, PI, Finance & Operations
 * - Highest referenced API gate: P08 (Institutional operations)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.8: GET /v1/organizations/{id}/usage (current compute, storage, egress usage)
 * - api design.md §3.8: PATCH /v1/organizations/{id}/quotas (update soft/hard caps with ETag)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Tabular numerical meters without decorative neon gradients
 * - Explicit accounting units: Compute Units (CU), Gigabytes (GB), API Invocations
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Activity,
  HardDrive,
  Cpu,
  Globe,
  Sliders,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function UsageQuotasPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#6B7280]">Settings</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Usage & Quotas</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Institutional Compute & Storage Quotas</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I10 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Live consumption telemetry across hermetic scientific worker nodes, pinned storage, and egress.
            </p>
          </div>

          <Badge variant="outline">TIER 3 RESEARCH GRANT</Badge>
        </div>

        {/* Quota Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Compute */}
          <div className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#111827]" />
                <span>Compute Units (CU)</span>
              </span>
              <span className="font-mono text-[#6B7280]">34.2%</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded overflow-hidden">
              <div className="bg-[#111827] h-full" style={{ width: '34.2%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-[#4B5563] font-mono">
              <span>342 CU consumed</span>
              <span className="text-[#6B7280]">Cap: 1,000 CU</span>
            </div>
          </div>

          {/* Card 2: Pinned Storage */}
          <div className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#111827]" />
                <span>Pinned Snapshots (GB)</span>
              </span>
              <span className="font-mono text-[#6B7280]">48.5%</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded overflow-hidden">
              <div className="bg-[#111827] h-full" style={{ width: '48.5%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-[#4B5563] font-mono">
              <span>242.5 GB stored</span>
              <span className="text-[#6B7280]">Cap: 500 GB</span>
            </div>
          </div>

          {/* Card 3: Network Egress */}
          <div className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#111827]" />
                <span>A2A Network Egress</span>
              </span>
              <span className="font-mono text-[#6B7280]">12.1%</span>
            </div>
            <div className="w-full bg-[#E5E7EB] h-2 rounded overflow-hidden">
              <div className="bg-[#111827] h-full" style={{ width: '12.1%' }} />
            </div>
            <div className="flex justify-between text-[11px] text-[#4B5563] font-mono">
              <span>12.1 GB exported</span>
              <span className="text-[#6B7280]">Cap: 100 GB</span>
            </div>
          </div>
        </div>

        {/* Quota Policy Safeguards */}
        <div className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#111827]" />
            <h2 className="text-xs font-semibold text-[#111827] font-mono uppercase">
              Deterministic Budget Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#4B5563]">
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded space-y-1">
              <span className="font-semibold text-[#111827] block">Hard Cap Execution Guard</span>
              <p className="text-[11px]">
                Jobs exceeding remaining allocated Compute Units are safely queued in durable Redis storage until next
                billing epoch or PI approval.
              </p>
            </div>
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded space-y-1">
              <span className="font-semibold text-[#111827] block">Snapshot Eviction Immunity</span>
              <p className="text-[11px]">
                Snapshots cited in published research monographs (R11) are immune to automatic retention sweeps and pinned
                permanently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

