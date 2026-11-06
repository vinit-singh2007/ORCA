/**
 * Screen R-DEMO — Real Oceanographic SST Research Demo
 * 
 * Sourced directly from ORCA Frontend Handoff §1, §9, §10, §13:
 * - Real descriptive research result computed from MUR SST access sample
 * - Exact endpoints:
 *   - GET /v1/demo/research-runs/27d282f6-6cc8-538a-86cb-41033c87afbc?organization_id=...
 *   - POST /v1/demo/research-runs (Recompute from preserved snapshot)
 *   - POST /v1/demo/research-runs/{result_id}/public-export (Export public reference)
 * - Real KPI cards: sample_mean, minimum, maximum, finite_count, row_count
 * - 31-day date-sorted daily sample means line chart & table fallback
 * - Real limitations and persistent pending-validation notice
 * - Real Arkiv Rabdi transaction evidence panel
 * - Distinct handling of loading, unauthenticated, forbidden, empty, and unavailable states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Sparkles,
  RefreshCw,
  Share2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  FileText,
  Clock,
  ArrowRight,
  Database,
  ExternalLink,
  ShieldCheck,
  Lock,
  Layers,
  Thermometer,
  Activity,
} from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { DemoResult, DemoPublicExport } from '@/types/api';
import { useAuth } from '@/context/AuthContext';
import { SstDailyChart } from '@/components/research/SstDailyChart';
import { ArkivEvidencePanel } from '@/components/research/ArkivEvidencePanel';

const DEMO_CONFIG = {
  organizationId: 'b7806251-9ebc-4ad0-ac93-044345e83d24',
  snapshotId: '15378b78-c803-4b08-a490-4e1678f4694b',
  resultId: '27d282f6-6cc8-538a-86cb-41033c87afbc',
};

export default function ResearchDemoPage() {
  const params = useParams();
  const router = useRouter();
  const routeOrgId = (params?.orgId as string) || '';

  const { user, selectedOrgId, isBackendAlive } = useAuth();
  const activeOrgId = routeOrgId || selectedOrgId || DEMO_CONFIG.organizationId;

  const [result, setResult] = useState<DemoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status?: number; message: string; detail?: string } | null>(null);

  // Recompute state
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [recomputeSuccess, setRecomputeSuccess] = useState(false);

  // Public export state
  const [isExporting, setIsExporting] = useState(false);
  const [publicExport, setPublicExport] = useState<DemoPublicExport | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  // Copy helpers
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 1. Fetch initial demo result per §9
  const fetchDemoResult = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.getDemoResult(DEMO_CONFIG.resultId, activeOrgId);
      setResult(data);
    } catch (err: unknown) {
      const apiErr = err as OrcaApiError;
      setError({
        status: apiErr.status,
        message: apiErr.message || 'Failed to load research demo result',
        detail: apiErr.problem?.detail,
      });
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [user, activeOrgId]);

  useEffect(() => {
    fetchDemoResult();
  }, [fetchDemoResult]);

  // 2. Recompute recipe from preserved snapshot per §9
  const handleRecompute = async () => {
    if (isRecomputing) return;
    setIsRecomputing(true);
    setRecomputeSuccess(false);
    setError(null);

    try {
      const updated = await apiClient.recomputeDemoRun(activeOrgId, DEMO_CONFIG.snapshotId);
      setResult(updated);
      setRecomputeSuccess(true);
      setTimeout(() => setRecomputeSuccess(false), 4000);
    } catch (err: unknown) {
      const apiErr = err as OrcaApiError;
      setError({
        status: apiErr.status,
        message: apiErr.message || 'Recomputation failed on backend',
        detail: apiErr.problem?.detail,
      });
    } finally {
      setIsRecomputing(false);
    }
  };

  // 3. Explicit public reference export per §9
  const handlePublicExport = async () => {
    if (isExporting || !result) return;
    setIsExporting(true);
    setExportError(null);

    try {
      const res = await apiClient.exportDemoPublicReference(result.id, activeOrgId, DEMO_CONFIG.snapshotId);
      setPublicExport(res);
    } catch (err: unknown) {
      const apiErr = err as OrcaApiError;
      setExportError(apiErr.problem?.detail || apiErr.message || 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  // Render unauthenticated state
  if (!user) {
    return (
      <Shell>
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-10 text-center space-y-4 max-w-lg mx-auto mt-10">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#111827]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-[#111827]">Authentication Required</h2>
          <p className="text-xs text-[#4B5563]">
            You must be signed in with a verified Supabase account to inspect this private research demo slice.
          </p>
          <Link
            href="/workspaces"
            className="inline-block px-4 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-semibold rounded hover:bg-[#374151] transition"
          >
            Sign In with Supabase →
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 w-full pb-12">
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${activeOrgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <Link href={`/org/${activeOrgId}/research/investigations`} className="hover:text-[#111827]">
            Research
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">MUR SST Descriptive Demo</span>
        </div>

        {/* Header Bar with Action Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-[#111827] tracking-tight">
                Descriptive Sea Surface Temperature Analysis
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F3F4F6] border border-[#E5E7EB] text-[#111827]">
                <Database className="w-3 h-3" />
                MUR SST Snapshot Slice
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]">
                Validation Pending
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1.5 max-w-3xl leading-relaxed">
              Real computational execution against preserved MUR Sea Surface Temperature access sample. Evaluates bounded sample metrics, daily time series, and immutable Arkiv chain provenance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Recompute Button (§9) */}
            <button
              suppressHydrationWarning
              type="button"
              onClick={handleRecompute}
              disabled={isRecomputing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-semibold rounded hover:bg-[#374151] transition disabled:opacity-50 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin' : ''}`} />
              <span>{isRecomputing ? 'Computing Descriptive Summary...' : 'Run Descriptive SST Summary'}</span>
            </button>

            {/* Public Export Button (§9) */}
            <button
              suppressHydrationWarning
              type="button"
              onClick={handlePublicExport}
              disabled={isExporting || !result}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-xs font-medium rounded transition disabled:opacity-50"
              title="Export minimal public reference without sensitive source files"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Exporting...' : 'Export Public Ref'}</span>
            </button>
          </div>
        </div>

        {/* Recompute Success Notification */}
        {recomputeSuccess && (
          <div className="p-3.5 border border-[#A7F3D0] bg-[#ECFDF5] rounded text-xs text-[#065F46] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#059669]" />
              <span>
                Descriptive recipe re-executed synchronously against preserved snapshot. Result state refreshed.
              </span>
            </div>
          </div>
        )}

        {/* Persistent Scientific Boundary Notice (§10 Required) */}
        <div className="p-4 border-l-4 border-l-[#111827] border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px]">
            <AlertCircle className="w-3.5 h-3.5 text-[#111827]" />
            Scientific Status Notice
          </div>
          <div className="text-[#374151] leading-relaxed">
            Descriptive statistics. QC and seasonal baseline validation are pending. This is not an SST anomaly or a causal conclusion.
          </div>
        </div>

        {/* Backend / Gateway Error Banner */}
        {error && (
          <div className="p-4 border border-[#FECACA] bg-[#FEF2F2] rounded text-xs text-[#991B1B] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-[#DC2626]" />
                <span>Backend Error {error.status ? `(HTTP ${error.status})` : ''}: {error.message}</span>
              </div>
              <button
                suppressHydrationWarning
                onClick={fetchDemoResult}
                className="px-2.5 py-1 border border-[#DC2626] rounded text-xs hover:bg-[#DC2626] hover:text-[#FFFFFF] transition"
              >
                Retry Request
              </button>
            </div>
            {error.detail && (
              <div className="text-[11px] font-mono bg-[#FFFFFF] p-2 rounded border border-[#FCA5A5] text-[#7F1D1D]">
                {error.detail}
              </div>
            )}
            {error.status === 403 && (
              <div className="text-[11px] text-[#4B5563] pt-1">
                Tip: Your current user account does not have researcher membership in organization <code>{activeOrgId}</code>. Request organization access from the backend administrator or select an authorized workspace.
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="p-16 text-center space-y-3 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#111827]" />
            <div className="text-xs font-mono text-[#4B5563]">
              Loading verified research result from FastAPI (GET /v1/demo/research-runs/{DEMO_CONFIG.resultId})...
            </div>
          </div>
        )}

        {/* Primary Sourced Content when Loaded */}
        {result && (
          <>
            {/* 5 Real KPI Metric Cards (§10) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {/* Card 1: Sample Mean */}
              <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#6B7280] font-semibold flex items-center justify-between">
                  <span>Sample Mean SST</span>
                  <Thermometer className="w-3.5 h-3.5 text-[#111827]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {result.sample_mean.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#6B7280]">°C</span>
                </div>
                <div className="text-[10px] text-[#6B7280] leading-tight">
                  Sample mean SST (°C), not regional area-weighted mean
                </div>
              </div>

              {/* Card 2: Minimum */}
              <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#6B7280] font-semibold flex items-center justify-between">
                  <span>Minimum SST</span>
                  <Activity className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {result.minimum.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#6B7280]">°C</span>
                </div>
                <div className="text-[10px] text-[#6B7280] leading-tight">
                  Minimum sampled SST (°C)
                </div>
              </div>

              {/* Card 3: Maximum */}
              <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#6B7280] font-semibold flex items-center justify-between">
                  <span>Maximum SST</span>
                  <Activity className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {result.maximum.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-[#6B7280]">°C</span>
                </div>
                <div className="text-[10px] text-[#6B7280] leading-tight">
                  Maximum sampled SST (°C)
                </div>
              </div>

              {/* Card 4: Finite Observations */}
              <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#6B7280] font-semibold flex items-center justify-between">
                  <span>Finite Observations</span>
                  <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {result.finite_count.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#6B7280] leading-tight">
                  Non-null bounded data points
                </div>
              </div>

              {/* Card 5: Row Count */}
              <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-1">
                <div className="text-[10px] font-mono uppercase text-[#6B7280] font-semibold flex items-center justify-between">
                  <span>Source Table Rows</span>
                  <Database className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>
                <div className="text-2xl font-bold font-mono text-[#111827]">
                  {result.row_count.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#6B7280] leading-tight">
                  Total parsed tabular rows
                </div>
              </div>
            </div>

            {/* Daily Sample Means Line Chart & Data Table (§10) */}
            <SstDailyChart
              dailyMeans={result.daily_sample_means}
              units={result.units === 'degree_Celsius' ? '°C' : result.units}
            />

            {/* Public Export Notification Drawer if Exported */}
            {publicExport && (
              <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-semibold text-[#111827]">
                    <Share2 className="w-4 h-4 text-[#111827]" />
                    <span>Minimal Public Reference Export Ready</span>
                  </div>
                  <Badge variant="outline">Schema {publicExport.schema_version}</Badge>
                </div>
                <p className="text-[11px] text-[#4B5563]">
                  {publicExport.disclosure}
                </p>
                <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded font-mono text-[11px] space-y-1">
                  <div>Result ID: <span className="text-[#111827] font-semibold">{publicExport.result_id}</span></div>
                  <div>Result Digest: <span className="text-[#111827]">{publicExport.result_digest}</span></div>
                  <div>Method: <span className="text-[#111827]">{publicExport.method}</span></div>
                  <div>Scientific Status: <span className="text-[#111827]">{publicExport.scientific_status}</span></div>
                </div>
                <div className="text-[10px] text-[#6B7280]">
                  Calling this endpoint approves generating a minimal public reference; it does not send an Arkiv transaction. Do not label it &quot;published on-chain&quot;.
                </div>
              </div>
            )}

            {/* Method, Measurement Definition & Limitations (§10) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Method & Scientific Definition */}
              <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3.5 text-xs">
                <div className="border-b border-[#E5E7EB] pb-2 font-mono font-semibold uppercase text-[#111827] flex items-center justify-between">
                  <span>Method Specification</span>
                  <span className="text-[10px] text-[#6B7280] font-normal">{result.method}</span>
                </div>

                <div className="space-y-1">
                  <span className="font-semibold text-[#111827] block">Measurement Definition:</span>
                  <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#374151] leading-relaxed">
                    {result.measurement_definition}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-[#6B7280] block">Scientific Status</span>
                    <strong className="text-[#111827] uppercase font-mono">
                      {result.scientific_status === 'not_validated' ? 'Validation Pending' : result.scientific_status}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block">Unit System</span>
                    <strong className="text-[#111827] font-mono">{result.units}</strong>
                  </div>
                </div>
              </div>

              {/* Explicit Scientific Limitations (§10) */}
              <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3 text-xs">
                <div className="border-b border-[#E5E7EB] pb-2 font-mono font-semibold uppercase text-[#111827] flex items-center justify-between">
                  <span>Computational Limitations ({result.limitations.length})</span>
                  <AlertCircle className="w-3.5 h-3.5 text-[#6B7280]" />
                </div>

                <ul className="space-y-2">
                  {result.limitations.map((lim, index) => (
                    <li key={index} className="flex items-start gap-2 text-[#4B5563] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#111827] shrink-0 mt-1.5" />
                      <span>{lim}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Provenance Details Box (§10) */}
            <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-4 space-y-3 text-xs">
              <div className="border-b border-[#E5E7EB] pb-2 font-mono font-semibold uppercase text-[#111827] flex items-center justify-between">
                <span>Dataset Provenance & Storage Hashes</span>
                <span className="text-[10px] text-[#6B7280]">FastAPI / Supabase Storage</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[#4B5563]">
                    <span className="text-[10px] font-mono uppercase font-semibold">Preserved Snapshot ID</span>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => copyText(result.snapshot_id, 'snapshot')}
                      className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
                    >
                      {copiedKey === 'snapshot' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#6B7280]" />}
                      {copiedKey === 'snapshot' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-2 bg-[#F8F9FA] rounded border border-[#E5E7EB] font-mono text-[11px] text-[#111827] select-all">
                    {result.snapshot_id}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[#4B5563]">
                    <span className="text-[10px] font-mono uppercase font-semibold">Source Digest</span>
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => copyText(result.source_digest, 'digest')}
                      className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
                    >
                      {copiedKey === 'digest' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#6B7280]" />}
                      {copiedKey === 'digest' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="p-2 bg-[#F8F9FA] rounded border border-[#E5E7EB] font-mono text-[11px] text-[#111827] select-all truncate">
                    {result.source_digest}
                  </div>
                </div>
              </div>
            </div>

            {/* Real Arkiv Evidence Panel (§13) */}
            <ArkivEvidencePanel resultDigest={result.source_digest} />
          </>
        )}
      </div>
    </Shell>
  );
}

