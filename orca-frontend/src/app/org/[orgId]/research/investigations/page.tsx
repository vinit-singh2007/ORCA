/**
 * Screen R01 — Investigation Library
 * 
 * Sourced from dashboard design.md §5.4 (Screen R01):
 * - URL: /org/[orgId]/research/investigations
 * - Highest API Gate Referenced: P05
 * - Backend Calls: GET /v1/research/investigations (§3.6)
 * - Required Acceptance Test: Statuses 'scientific supported' vs 'run completed' must be separate.
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - Full loading, error, and empty state support
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import { FileSearch, Plus, Search, Filter, ArrowRight, Clock, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { InvestigationSummary } from '@/types/api';

export default function InvestigationsLibraryPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [investigations, setInvestigations] = useState<InvestigationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchInvestigations = () => {
    setLoading(true);
    setError(null);

    apiClient
      .listInvestigations({
        state: statusFilter === 'all' ? undefined : statusFilter,
      })
      .then((res) => {
        if (res?.items) {
          setInvestigations(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to fetch investigations from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInvestigations();
  }, [statusFilter]);

  const filtered = investigations.filter((inv) => {
    if (searchQuery && !inv.question.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                Scientific Investigation Library
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                R01 · P05 API
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Durable marine studies, bounded SST anomaly calculations, and immutable evidence manifests.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={fetchInvestigations}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Investigations"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href={`/org/${orgId}/research/investigations/new`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              New Scientific Investigation
            </Link>
          </div>
        </div>

        {/* Real Research Demo Feature Banner per Handoff §8 */}
        <div className="p-4 border border-[#111827] bg-[#F8F9FA] rounded flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-[#111827]">
                Descriptive Sea Surface Temperature Research Demo
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-[#FFFFFF]">
                Real Verified Backend Slice
              </span>
            </div>
            <p className="text-xs text-[#4B5563]">
              Preserved MUR SST access sample, 31-day daily series, deterministic recompute, and confirmed Arkiv Rabdi receipt.
            </p>
          </div>
          <Link
            href={`/org/${orgId}/research/demo`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-semibold rounded hover:bg-[#374151] transition shrink-0 self-start sm:self-center"
          >
            <span>Open Research Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Backend Error Banner */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Gateway Notice (GET /v1/research/investigations): {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchInvestigations}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#F8F9FA] p-3 border border-[#E5E7EB] rounded">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
            <input suppressHydrationWarning
              type="text"
              placeholder="Search by research question..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E7EB] pl-9 pr-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">State Filter:</span>
            <select suppressHydrationWarning
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] px-2.5 py-1 text-xs rounded focus:outline-none focus:border-[#111827]"
            >
              <option value="all">All States</option>
              <option value="succeeded_supported">Succeeded (Supported)</option>
              <option value="approved">Approved Recipe</option>
              <option value="draft">Draft Formulation</option>
              <option value="running">Durable Run in Progress</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading investigations from API (GET /v1/research/investigations)...
          </div>
        )}

        {/* Investigations List */}
        {!loading && filtered.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280] space-y-3">
            <div>No investigations found matching your filter.</div>
            <Link
              href={`/org/${orgId}/research/investigations/new`}
              className="inline-block px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded font-medium"
            >
              Formulate New Investigation
            </Link>
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] font-mono text-[#4B5563] uppercase">
                <tr>
                  <th className="py-3 px-4 font-semibold">Investigation Question</th>
                  <th className="py-3 px-4 font-semibold">Scientific Verdict</th>
                  <th className="py-3 px-4 font-semibold">Execution State</th>
                  <th className="py-3 px-4 font-semibold text-right">Studio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="font-semibold text-[#111827]">{inv.question}</div>
                      <div className="text-[10px] font-mono text-[#6B7280] mt-0.5">
                        ID: {inv.id}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusIndicator category="science" state={inv.scientific_status || 'draft'} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline">{inv.state}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/org/${orgId}/research/investigations/${inv.id}`}
                        className="inline-flex items-center gap-1 font-medium text-[#111827] hover:underline"
                      >
                        Open Studio
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
