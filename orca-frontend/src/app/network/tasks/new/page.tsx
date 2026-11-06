/**
 * ORCA 3.0 — N03 Publish Public Research Task Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.7 Screen N03 (Publish public research task)
 * - UI URL: /network/tasks/new
 * - Primary personas: PI, Research Coordinator, Auditor
 * - Highest referenced API gate: P11 (Arkiv Coordination & Public Verification)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.12: POST /v1/network/tasks (broadcast task to public Arkiv board)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Direct integration with real backend API client
 * - No mock data dependencies
 * - Strict monochrome white/neutral tokens (#FFFFFF, #E5E7EB, #111827)
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import {
  Globe,
  Send,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function PublishNetworkTaskPage() {
  const router = useRouter();

  const [title, setTitle] = useState('Independent SST Anomaly Re-calculation (Saurashtra Polygon)');
  const [capability, setCapability] = useState('sst.seasonal_anomaly');
  const [assignmentPolicy, setAssignmentPolicy] = useState<'single' | 'multi'>('single');
  const [deadlineDays, setDeadlineDays] = useState('7');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const deadline = new Date(Date.now() + parseInt(deadlineDays, 10) * 86400000).toISOString();

    try {
      await apiClient.createNetworkTask({
        investigation_id: '00000000-0000-4000-8000-000000000201',
        title,
        required_capability: capability,
        assignment_policy: assignmentPolicy,
        deadline,
      });
      router.push('/network/tasks');
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Failed to submit task to network gateway');
      setSubmitting(false);
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
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#111827]" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Formulation Form */}
        <form onSubmit={handleSubmit} className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-5 text-xs">
          <div>
            <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
              Task Title
            </label>
            <input suppressHydrationWarning
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Required Capability
              </label>
              <select suppressHydrationWarning
                value={capability}
                onChange={(e) => setCapability(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="sst.seasonal_anomaly">sst.seasonal_anomaly (Sea Surface Temperature)</option>
                <option value="upwelling.bakun_index">upwelling.bakun_index (Coastal Upwelling)</option>
                <option value="marine.qc_verification">marine.qc_verification (Quality Control)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Assignment Policy
              </label>
              <select suppressHydrationWarning
                value={assignmentPolicy}
                onChange={(e) => setAssignmentPolicy(e.target.value as 'single' | 'multi')}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="single">Single-Award Assignment</option>
                <option value="multi">Multi-Agent Quorum Consensus</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#111827] uppercase tracking-wider block mb-1">
              Execution Deadline
            </label>
            <select suppressHydrationWarning
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
              className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              <option value="3">3 Days (Fast-track computation)</option>
              <option value="7">7 Days (Standard academic window)</option>
              <option value="14">14 Days (Extended multi-source verification)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
            <Link
              href="/network/tasks"
              className="text-[#6B7280] hover:text-[#111827] flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Link>

            <button suppressHydrationWarning
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] rounded font-medium flex items-center gap-1.5 disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Broadcasting...' : 'Publish to Arkiv Board'}</span>
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
