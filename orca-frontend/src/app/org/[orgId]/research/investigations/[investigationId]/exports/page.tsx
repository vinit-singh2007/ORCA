/**
 * ORCA 3.0 — R12 Reproducible Export Center Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.4 Screen R12 (Reproducible export center)
 * - UI URL: /org/[orgId]/research/investigations/[investigationId]/exports
 * - Primary personas: Researcher, Independent Reviewer, Auditor
 * - Highest referenced API gate: P06 (Evidence & Artifact Registry)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.6: POST /v1/research/investigations/{id}/exports (request export bundle)
 * - api design.md §3.6: GET /v1/research/investigations/{id}/exports/{export_id} (bundle status & download URL)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Complete transparent inventory of all tarball components
 * - Direct bash one-liner verification snippet for offline scientific reproduction
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { Investigation } from '@/types/api';
import {
  Download,
  Copy,
  Check,
  Terminal,
  ArrowLeft,
  AlertCircle,
  FileArchive,
} from 'lucide-react';

export default function ReproducibleExportPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const investigationId = (params?.investigationId as string) || '';

  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      if (!investigationId) return;
      setLoading(true);
      setError(null);
      try {
        const inv = await apiClient.getInvestigation(investigationId);
        if (active) setInvestigation(inv);
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load investigation details';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [investigationId]);

  const verificationSnippet = `curl -sSL https://exports.orca.ocean/bundle-${(investigationId || 'investigation').slice(0, 8)}.tar.gz | tar -xz\ncd orca-reproduction && ./verify_reproduction.sh`;

  const copySnippet = () => {
    navigator.clipboard.writeText(verificationSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleDownload = async () => {
    if (!investigationId) return;
    setDownloading(true);
    try {
      const exp = await apiClient.createInvestigationExport(investigationId, {
        format: 'tar.gz',
        include_raw_snapshots: true,
      });
      alert(`Reproducible Export Created (POST /v1/research/investigations/${investigationId}/exports):\n\nID: ${exp.export_id}\nStatus: ${exp.status}\nLocation: ${exp.download_url || 'Pending packaging pipeline'}`);
    } catch (err: unknown) {
      alert(`Export failed: ${err instanceof Error ? err.message : 'API error'}`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4 max-w-5xl animate-pulse">
          <div className="h-6 w-48 bg-[#E5E7EB] rounded" />
          <div className="h-64 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
        </div>
      </Shell>
    );
  }

  if (error || !investigation) {
    return (
      <Shell>
        <div className="p-6 border border-[#E5E7EB] rounded bg-[#FFFFFF] max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-semibold text-sm">Failed to load export workspace</h2>
          </div>
          <p className="text-xs text-[#4B5563] font-mono">{error || 'Investigation not found'}</p>
          <Link
            href={`/org/${orgId}/research/investigations`}
            className="inline-block px-3 py-1.5 text-xs border border-[#E5E7EB] rounded text-[#111827] hover:border-[#111827]"
          >
            Back to Investigations
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <Link href={`/org/${orgId}/research/investigations`} className="hover:text-[#111827]">
            Investigations
          </Link>
          <span>/</span>
          <Link
            href={`/org/${orgId}/research/investigations/${investigationId}`}
            className="hover:text-[#111827]"
          >
            Studio
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Reproducible Export</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Reproducible Scientific Export Center</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                R12 · P06
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Package self-contained computational artifacts, input snapshot manifests, code digests, and verification scripts
              for independent third-party reproduction.
            </p>
          </div>

          <button suppressHydrationWarning
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Compiling Archive...' : 'Download Full Bundle (tar.gz)'}</span>
          </button>
        </div>

        {/* Bundle Specification Card */}
        <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider">
                Reproducible Scientific Bundle (v1.0 Standard)
              </span>
              <h2 className="text-base font-semibold text-[#111827]">
                orca-investigation-{investigationId.slice(0, 8)}-bundle.tar.gz
              </h2>
            </div>
            <Badge variant="outline">RO-CRATE ARCHIVE</Badge>
          </div>

          {/* Archive Manifest Inventory */}
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
            <span className="text-xs font-mono font-semibold uppercase text-[#111827] block">
              Package Contents
            </span>
            <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded divide-y divide-[#E5E7EB] text-xs font-mono">
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[#111827]">manifest.json</span>
                <span className="text-[#6B7280] text-[11px]">Root Merkle tree and SHA-256 digests</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[#111827]">recipe.json</span>
                <span className="text-[#6B7280] text-[11px]">Executable scientific parameters & polygon</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[#111827]">inputs/</span>
                <span className="text-[#6B7280] text-[11px]">Pinned NetCDF observational & baseline slices</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[#111827]">outputs/anomaly_map.nc</span>
                <span className="text-[#6B7280] text-[11px]">Primary calculated gridded scientific output</span>
              </div>
              <div className="p-2.5 flex justify-between items-center">
                <span className="text-[#111827]">verify_reproduction.sh</span>
                <span className="text-[#6B7280] text-[11px]">One-click bash script to recalculate & verify</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offline Verification Snippet */}
        <div className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#111827]" />
              <span className="text-xs font-semibold text-[#111827] font-mono uppercase">
                Terminal One-Liner (Independent Reproduction)
              </span>
            </div>
            <button suppressHydrationWarning
              onClick={copySnippet}
              className="text-xs text-[#4B5563] hover:text-[#111827] flex items-center gap-1"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5 text-[#111827]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <pre className="bg-[#111827] text-[#FFFFFF] p-3 rounded font-mono text-xs overflow-x-auto">
            {verificationSnippet}
          </pre>

          <p className="text-[11px] text-[#6B7280]">
            Requires Docker or Podman. Runs in a hermetic container and matches output SHA-256 against official signed record.
          </p>
        </div>
      </div>
    </Shell>
  );
}
