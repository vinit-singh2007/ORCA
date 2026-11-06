/**
 * Screen V01 — Scientific Review Inbox & Validation Workspace
 * 
 * Sourced from dashboard design.md §5.5 (Screen V01):
 * - URL: /org/[orgId]/review/inbox
 * - Highest API Gate Referenced: P07 (Reproduction & Challenges)
 * - Backend Calls:
 *   GET /v1/research/investigations (P05)
 *   GET /v1/research/investigations/{investigation_id}/artifacts (P06)
 *   GET /v1/research/artifacts/{artifact_id}/reviews (P07)
 * 
 * User Review Enhancement:
 * - Explicitly distinguishes:
 *   1. Pending Review (Awaiting independent execution)
 *   2. Reproduced (Calculation verified within numerical tolerance)
 *   3. Challenged (Methodological or baseline error dispute logged)
 *   4. Insufficient Evidence (Observational coverage below threshold)
 * - Direct deep-link to Screen V02–V04: /org/[orgId]/review/[reviewId]
 * 
 * Comments included in full per user instructions.
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import { apiClient } from '@/lib/api-client';
import { InvestigationSummary } from '@/types/api';
import {
  FileCheck,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Clock,
  AlertTriangle,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ReviewInboxPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reproduced' | 'challenged' | 'insufficient'>('all');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listInvestigations({ limit: 50 });
      setInvestigations(res.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load investigations for review';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = investigations.filter((inv) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return inv.scientific_status === 'draft' || inv.scientific_status === 'proposed';
    if (activeFilter === 'reproduced') return inv.scientific_status === 'supported';
    if (activeFilter === 'challenged') return inv.scientific_status === 'unsupported';
    if (activeFilter === 'insufficient') return inv.scientific_status === 'insufficient_evidence';
    return true;
  });

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                Scientific Review & Reproduction Inbox
              </h1>
              <Badge variant="verified">GATE P07</Badge>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Deterministic re-execution queue, peer verification quorums, tolerance evaluation, and methodological challenges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadData}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href={`/org/${orgId}/research/investigations`}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] hover:border-[#111827] text-xs font-medium rounded text-[#111827] bg-[#FFFFFF] transition"
            >
              <FileCheck className="w-3.5 h-3.5" />
              All Investigations
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E5E7EB] pb-3 text-xs">
          <button suppressHydrationWarning
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded transition ${
              activeFilter === 'all'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#4B5563] hover:text-[#111827] bg-[#FFFFFF] border border-[#E5E7EB]'
            }`}
          >
            All Items ({investigations.length})
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1 rounded transition ${
              activeFilter === 'pending'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#4B5563] hover:text-[#111827] bg-[#FFFFFF] border border-[#E5E7EB]'
            }`}
          >
            Pending Review
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveFilter('reproduced')}
            className={`px-3 py-1 rounded transition ${
              activeFilter === 'reproduced'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#4B5563] hover:text-[#111827] bg-[#FFFFFF] border border-[#E5E7EB]'
            }`}
          >
            Reproduced & Verified
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveFilter('challenged')}
            className={`px-3 py-1 rounded transition ${
              activeFilter === 'challenged'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#4B5563] hover:text-[#111827] bg-[#FFFFFF] border border-[#E5E7EB]'
            }`}
          >
            Challenged / Disputed
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveFilter('insufficient')}
            className={`px-3 py-1 rounded transition ${
              activeFilter === 'insufficient'
                ? 'bg-[#111827] text-white font-medium'
                : 'text-[#4B5563] hover:text-[#111827] bg-[#FFFFFF] border border-[#E5E7EB]'
            }`}
          >
            Insufficient Evidence
          </button>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="space-y-3 animate-pulse">
            <div className="h-20 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
            <div className="h-20 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Gateway Error
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <ShieldCheck className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No items found</h3>
            <p className="text-xs text-[#6B7280]">No scientific evidence records match the selected review criteria.</p>
          </div>
        )}

        {/* Review List */}
        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((inv) => (
              <div
                key={inv.id}
                className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#111827] transition"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#6B7280]">
                      ID: {inv.id.slice(0, 8)}...
                    </span>
                    <Badge variant="outline">State: {inv.state || 'draft'}</Badge>
                    <StatusIndicator category="science" state={inv.scientific_status || 'draft'} />
                  </div>
                  <h3 className="text-xs font-bold text-[#111827]">
                    {inv.question}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[#6B7280] font-mono pt-1">
                    <span>ID: {inv.id.slice(0, 12)}...</span>
                    <span>•</span>
                    <span>Created: {inv.created_at?.slice(0, 10)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/org/${orgId}/review/${inv.id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#111827] text-white rounded text-xs font-medium hover:bg-[#374151] transition"
                  >
                    <span>Inspect Review Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
