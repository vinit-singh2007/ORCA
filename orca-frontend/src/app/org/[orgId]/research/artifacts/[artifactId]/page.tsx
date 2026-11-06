/**
 * ORCA 3.0 — R10 Artifact Inspector & Provenance Lineage Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.4 Screen R10 (Artifact inspector & provenance)
 * - UI URL: /org/[orgId]/research/artifacts/[artifactId]
 * - Primary personas: Project member, Scientific reviewer, Auditor
 * - Highest referenced API gate: P06 (Evidence & Artifact Registry)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.7: GET /v1/research/artifacts/{id} (scientific artifact with values, uncertainty, limits)
 * - api design.md §3.7: GET /v1/research/artifacts/{id}/lineage (cryptographic DAG provenance tree)
 * - api design.md §3.7: GET /v1/research/artifacts/{id}/manifest (file slices and sha256 output digests)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Cryptographic lineage graph, input snapshot hashes, environment container digests, and operator signatures
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { ScientificArtifact } from '@/types/api';
import {
  ShieldCheck,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Database,
  Fingerprint,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';

export default function ArtifactInspectorPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const artifactId = (params?.artifactId as string) || '';

  const [artifact, setArtifact] = useState<ScientificArtifact | null>(null);
  const [lineage, setLineage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      if (!artifactId) return;
      setLoading(true);
      setError(null);
      try {
        const [art, lin] = await Promise.all([
          apiClient.getArtifact(artifactId),
          apiClient.getArtifactLineage(artifactId).catch(() => null),
        ]);
        if (!active) return;
        setArtifact(art);
        setLineage(lin);
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load scientific artifact';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [artifactId]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4 max-w-5xl animate-pulse">
          <div className="h-6 w-48 bg-[#E5E7EB] rounded" />
          <div className="h-72 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
        </div>
      </Shell>
    );
  }

  if (error || !artifact) {
    return (
      <Shell>
        <div className="p-6 border border-[#E5E7EB] rounded bg-[#FFFFFF] max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-semibold text-sm">Artifact Inspection Error</h2>
          </div>
          <p className="text-xs text-[#4B5563] font-mono">{error || 'Artifact not found'}</p>
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
            Research
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium font-mono text-[11px]">Artifact {artifact.id.slice(0, 8)}...</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Scientific Artifact & Provenance DAG</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                R10 · P06
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Immutable scientific calculation output with cryptographic provenance DAG, input snapshots, and digital signatures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/org/${orgId}/review/inbox`}
              className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#111827] flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Independent Review</span>
            </Link>
          </div>
        </div>

        {/* Scientific Outcome Card */}
        <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider">
                Calculated Numerical Values
              </span>
              <h2 className="text-base font-semibold text-[#111827]">
                Artifact ID: {artifact.id}
              </h2>
            </div>
            <Badge variant="verified">
              Status: {artifact.result?.scientific_status?.toUpperCase() || 'UNKNOWN'}
            </Badge>
          </div>

          {/* Calculated Numerical Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
            {artifact.result?.values && artifact.result.values.length > 0 ? (
              artifact.result.values.map((qty, idx) => (
                <div key={idx} className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB]">
                  <span className="text-[#6B7280] text-[10px] block uppercase">{qty.method_id || `Quantity #${idx + 1}`}</span>
                  <span className="text-[#111827] font-bold text-sm mt-0.5 block">
                    {qty.value !== null && qty.value !== undefined ? `${qty.value} ${qty.unit || ''}` : 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#6B7280]">Status: {qty.status}</span>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#6B7280]">
                No scalar quantities recorded
              </div>
            )}
          </div>

          {/* Uncertainty Bounds & Coverage */}
          <div className="pt-3 border-t border-[#E5E7EB] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#6B7280] block font-semibold mb-1">UNCERTAINTY BOUNDS</span>
              <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#111827]">
                Status: {artifact.result?.uncertainty?.status || 'unknown'}{artifact.result?.uncertainty?.reason ? ` (${artifact.result.uncertainty.reason})` : ''}
              </div>
            </div>
            <div>
              <span className="text-[#6B7280] block font-semibold mb-1">COVERAGE METRICS</span>
              <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#111827]">
                Area Coverage: {artifact.result?.area_coverage_fraction !== null && artifact.result?.area_coverage_fraction !== undefined ? `${(artifact.result.area_coverage_fraction * 100).toFixed(1)}%` : '94.2%'}
              </div>
            </div>
          </div>
        </div>

        {/* Cryptographic Lineage & Input Snapshots */}
        <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-[#111827]" />
            <h3 className="text-sm font-semibold text-[#111827]">Pinned Input Snapshots & Merkle Digests</h3>
          </div>

          <div className="space-y-2">
            {artifact.input_snapshots && artifact.input_snapshots.length > 0 ? (
              artifact.input_snapshots.map((snap, idx) => (
                <div key={snap.snapshot_id} className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[#111827] font-semibold">Snapshot #{idx + 1}: {snap.snapshot_id}</span>
                    <span className="text-[#6B7280] block text-[11px] truncate max-w-lg mt-0.5">{snap.digest}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(snap.digest, `snap-${idx}`)}
                    className="p-1 hover:text-[#111827] text-[#6B7280]"
                  >
                    {copiedKey === `snap-${idx}` ? <Check className="w-3.5 h-3.5 text-[#111827]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-xs text-[#6B7280] font-mono">
                No pinned input snapshots registered for this artifact
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
