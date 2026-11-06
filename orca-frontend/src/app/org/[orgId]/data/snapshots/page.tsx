/**
 * ORCA 3.0 — D05 Source Snapshots & Manifest Explorer Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen D05 (Source snapshots & manifest explorer)
 * - UI URL: /org/[orgId]/data/snapshots
 * - Primary personas: Researcher, Data steward, Auditor
 * - Highest referenced API gate: P03 (Data catalog & source ingestion)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.4: GET /v1/catalog/snapshots (list immutable pinned snapshots)
 * - api design.md §3.4: GET /v1/catalog/snapshots/{id}/manifest (inspect sha256 manifest)
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - Strict monochrome white/neutral tokens (#FFFFFF, #E5E7EB, #111827)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { DataMethodsNav } from '@/components/navigation/DataMethodsNav';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { DatasetSnapshot } from '@/types/api';
import {
  Database,
  FileCheck,
  Download,
  Copy,
  Check,
  Calendar,
  Layers,
  ShieldCheck,
  Search,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SourceSnapshotsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [snapshots, setSnapshots] = useState<DatasetSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchSnapshots = () => {
    setLoading(true);
    setError(null);
    apiClient
      .listSnapshots()
      .then((res) => {
        if (res?.items) {
          setSnapshots(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to fetch snapshots from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const copyDigest = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const filteredSnapshots = snapshots.filter((s) =>
    s.product_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artifact_digest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <Link href={`/org/${orgId}/data/products`} className="hover:text-[#111827]">
            Data & Methods
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Source Snapshots</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Source Snapshots & Manifests</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                D05 · P03
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Cryptographically pinned observational datasets and reanalysis grids with immutable SHA-256 manifests.
            </p>
          </div>

          <button suppressHydrationWarning
            onClick={fetchSnapshots}
            className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
            title="Refresh Snapshots"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* In-Page Secondary Navigation Tabs (§5.5) */}
        <DataMethodsNav orgId={orgId} />

        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Catalog Gateway: {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchSnapshots}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
          <input suppressHydrationWarning
            type="text"
            placeholder="Search snapshots by product ID or SHA-256 digest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
          />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading pinned snapshots from API (GET /v1/catalog/snapshots)...
          </div>
        )}

        {/* Snapshots Table */}
        {!loading && filteredSnapshots.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280]">
            No pinned dataset snapshots found in catalog.
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[10px] font-mono uppercase text-[#4B5563]">
                <tr>
                  <th className="py-2.5 px-4">Dataset Product ID</th>
                  <th className="py-2.5 px-4">Temporal Range</th>
                  <th className="py-2.5 px-4">SHA-256 Manifest Digest</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredSnapshots.map((snap) => (
                  <tr key={snap.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3 px-4 font-semibold text-[#111827]">
                      <div>{snap.product_id}</div>
                      <div className="text-[10px] font-mono text-[#6B7280]">Version: {snap.product_version}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#4B5563]">
                      {snap.scope?.time_window?.start ? `${snap.scope.time_window.start.slice(0, 10)} to ${snap.scope.time_window.end.slice(0, 10)}` : 'Standard Climatology'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-mono text-[10px] text-[#111827]">
                        <span>{snap.artifact_digest.slice(0, 24)}...</span>
                        <button suppressHydrationWarning
                          onClick={() => copyDigest(snap.artifact_digest)}
                          className="p-1 hover:bg-[#E5E7EB] rounded"
                          title="Copy Full Digest"
                        >
                          {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#6B7280]" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={snap.status === 'verified_snapshot' ? 'verified' : 'outline'}>
                        {snap.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/org/${orgId}/data/products`}
                        className="text-[#111827] hover:underline font-medium"
                      >
                        Inspect →
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
