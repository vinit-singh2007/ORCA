'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { PrototypeInvestigation, PrototypeRun, SeasonalResult } from '@/types/api';
import { SstDailyChart } from '@/components/research/SstDailyChart';
import {
  FlaskConical, ChevronRight, AlertCircle, CheckCircle2, Loader2,
  Download, Copy, RefreshCw, Info, Clock, Activity
} from 'lucide-react';
import Link from 'next/link';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    queued: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    running: 'bg-blue-50 text-blue-700 border-blue-200',
    succeeded: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };
  const cls = map[status] || 'bg-[#F8F9FA] text-[#4B5563] border-[#E5E7EB]';
  return (
    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cls}`}>
      {status.toUpperCase()}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      suppressHydrationWarning
      onClick={copy}
      className="ml-1 p-0.5 hover:bg-[#E5E7EB] rounded"
      title="Copy"
    >
      {copied ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3 text-[#9CA3AF]" />}
    </button>
  );
}

function DigestRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1 text-[10px] font-mono">
      <span className="text-[#9CA3AF] shrink-0">{label}:</span>
      <span className="text-[#4B5563] truncate max-w-xs">{value}</span>
      <CopyButton value={value} />
    </div>
  );
}

function SeasonalResultDisplay({ result, run }: { result: SeasonalResult; run: PrototypeRun }) {
  const anomalyPositive = result.anomaly >= 0;
  const chartData = Object.fromEntries(
    result.daily
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => [d.date, d.anomaly])
  );

  return (
    <div className="space-y-6">
      {/* Scientific status warning — always visible */}
      <div className="p-3 border border-amber-200 bg-amber-50 rounded flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-800">
          <strong>Scientific Status:</strong>{' '}
          <span className="font-mono">{result.scientific_status}</span> — Results are a research prototype,
          not independently qualified science.
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'January 2025 Mean SST', value: `${result.current_mean.toFixed(3)} ${result.units}` },
          { label: 'Reference Mean (2003–2022)', value: `${result.baseline_mean.toFixed(3)} ${result.units}` },
          {
            label: 'Temperature Difference',
            value: `${anomalyPositive ? '+' : ''}${result.anomaly.toFixed(3)} ${result.units}`,
            highlight: true,
            positive: anomalyPositive,
          },
          { label: 'Study Area', value: `${result.area_km2.toFixed(1)} km²` },
        ].map((m) => (
          <div key={m.label} className={`p-3 border rounded space-y-1 ${
            m.highlight
              ? m.positive
                ? 'border-orange-300 bg-orange-50'
                : 'border-blue-300 bg-blue-50'
              : 'border-[#E5E7EB] bg-white'
          }`}>
            <div className="text-[10px] text-[#6B7280] uppercase tracking-wider">{m.label}</div>
            <div className="text-base font-bold text-[#111827]">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-2.5 border border-[#E5E7EB] rounded bg-[#F8F9FA]">
          <div className="text-[#6B7280]">Spatial Coverage</div>
          <div className="font-semibold">{(result.spatial_coverage * 100).toFixed(1)}%</div>
        </div>
        <div className="p-2.5 border border-[#E5E7EB] rounded bg-[#F8F9FA]">
          <div className="text-[#6B7280]">Current Cells</div>
          <div className="font-semibold">{result.current_cells.toLocaleString()}</div>
        </div>
        <div className="p-2.5 border border-[#E5E7EB] rounded bg-[#F8F9FA]">
          <div className="text-[#6B7280]">Baseline Cells</div>
          <div className="font-semibold">{result.baseline_cells.toLocaleString()}</div>
        </div>
        <div className="p-2.5 border border-[#E5E7EB] rounded bg-[#F8F9FA]">
          <div className="text-[#6B7280]">Uncertainty</div>
          <div className="font-semibold">{result.uncertainty}</div>
        </div>
      </div>

      {/* Daily anomaly chart */}
      {Object.keys(chartData).length > 0 && (
        <div className="border border-[#E5E7EB] rounded p-4 bg-white">
          <div className="text-xs font-semibold text-[#111827] mb-3">
            Daily difference from January reference (°C)
          </div>
          <SstDailyChart dailyMeans={chartData} units={result.units} />
        </div>
      )}

      {/* Limitations */}
      {result.limitations.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1">
          <div className="text-xs font-semibold text-amber-800">Limitations</div>
          <ul className="space-y-0.5">
            {result.limitations.map((lim, i) => (
              <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                <span className="shrink-0">·</span>{lim}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence & Provenance Panel */}
      <div className="border border-[#E5E7EB] rounded p-4 space-y-3 bg-white">
        <div className="text-xs font-semibold text-[#111827] uppercase tracking-wider">Provenance & Evidence</div>

        <div className="space-y-1.5">
          <DigestRow label="result_digest" value={run.result_digest} />
          <DigestRow label="bundle_digest" value={result.bundle_digest} />
          <DigestRow label="method_code_digest" value={result.method_code_digest} />
          <DigestRow label="input_parser_digest" value={result.input_parser_digest} />
          <DigestRow label="metadata_digest" value={result.metadata_digest} />
        </div>

        {result.input_snapshots && result.input_snapshots.length > 0 && (
          <div>
            <div className="text-[10px] font-semibold text-[#6B7280] uppercase mb-1">Input Snapshots</div>
            <div className="space-y-1">
              {result.input_snapshots.map((snap, i) => (
                <div key={i} className="text-[10px] font-mono text-[#4B5563] flex gap-2 flex-wrap">
                  <span className="text-[#9CA3AF]">year {snap.year}</span>
                  <span className="truncate max-w-xs">{snap.id}</span>
                  {snap.sha256 && <span className="text-[#9CA3AF] truncate max-w-xs">{snap.sha256}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {result.baseline_years && result.baseline_years.length > 0 && (
          <div className="text-[10px] text-[#6B7280]">
            Baseline years: {result.baseline_years.join(', ')}
          </div>
        )}

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[10px]">
          <dt className="text-[#9CA3AF] font-mono">analysis_as_of</dt>
          <dd className="text-[#4B5563]">{result.analysis_as_of}</dd>
          {result.license_ref && (
            <>
              <dt className="text-[#9CA3AF] font-mono">license_ref</dt>
              <dd className="text-[#4B5563]">{result.license_ref}</dd>
            </>
          )}
          {result.redistribution_permitted !== undefined && (
            <>
              <dt className="text-[#9CA3AF] font-mono">redistribution_permitted</dt>
              <dd className="text-[#4B5563]">{String(result.redistribution_permitted)}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Arkiv — Pending */}
      <div className="border border-[#E5E7EB] rounded p-4 bg-[#F8F9FA] space-y-2">
        <div className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-2">
          <span>On-Chain Publication (Arkiv / Rabdi)</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E7EB] text-[#9CA3AF]">
            Pending Integration
          </span>
        </div>
        <p className="text-xs text-[#9CA3AF]">
          New seasonal-SST Arkiv publication is pending backend integration. The on-chain publish/verify controls
          are not available for prototype runs. The existing descriptive-SST Arkiv receipt is only shown in the
          separate Research Demo section and is not applicable here.
        </p>
      </div>
    </div>
  );
}

export default function PrototypeRunPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const investigationId = (params?.investigationId as string) || '';
  const projectId = searchParams?.get('project_id') || '';

  const { session } = useAuth();

  const [investigation, setInvestigation] = useState<PrototypeInvestigation | null>(null);
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState<string | null>(null);

  const [run, setRun] = useState<PrototypeRun | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const [reportDownloading, setReportDownloading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const idempotencyKeyRef = useRef<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRunning = useRef(false);

  // Load investigation
  const loadInvestigation = useCallback(async () => {
    if (!investigationId || !projectId) return;
    setInvLoading(true);
    setInvError(null);
    try {
      const inv = await apiClient.getPrototypeInvestigation(investigationId, projectId);
      setInvestigation(inv);
      setInvLoading(false);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setInvError(apiErr.problem?.detail || 'Failed to load investigation.');
      setInvLoading(false);
    }
  }, [investigationId, projectId]);

  useEffect(() => {
    loadInvestigation();
  }, [loadInvestigation]);

  // Stop polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
      pollingRunning.current = false;
    };
  }, []);

  const startPolling = useCallback((runId: string) => {
    pollingRunning.current = true;

    const poll = async () => {
      if (!pollingRunning.current) return;
      try {
        const updated = await apiClient.getPrototypeRun(runId, projectId);
        setRun(updated);
        if (updated.status === 'succeeded' || updated.status === 'failed') {
          pollingRunning.current = false;
          return;
        }
        pollingRef.current = setTimeout(poll, 2000);
      } catch {
        // stop polling on error
        pollingRunning.current = false;
      }
    };

    pollingRef.current = setTimeout(poll, 2000);
  }, [projectId]);

  const handleApprovePlan = async () => {
    if (!investigation || !projectId) return;
    setApproving(true);
    setApproveError(null);
    try {
      const approved = await apiClient.approvePrototypePlan(
        investigation.id,
        projectId,
        apiClient.generateIdempotencyKey()
      );
      setInvestigation(approved);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setApproveError(apiErr.problem?.detail || 'Failed to approve plan.');
    } finally {
      setApproving(false);
    }
  };

  const handleStartRun = async () => {
    if (!investigation || !projectId) return;
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = apiClient.generateIdempotencyKey();
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const newRun = await apiClient.submitPrototypeRun(
        projectId,
        investigation.id,
        idempotencyKeyRef.current
      );
      setRun(newRun);
      if (newRun.status !== 'succeeded' && newRun.status !== 'failed') {
        startPolling(newRun.id);
      }
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setSubmitError(apiErr.problem?.detail || 'Failed to submit run.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewRun = () => {
    // Reset for a fresh idempotency key
    idempotencyKeyRef.current = null;
    setRun(null);
    setSubmitError(null);
    setReportError(null);
  };

  const handleDownloadReport = async () => {
    if (!run || !projectId) return;
    const token = session?.access_token;
    if (!token) {
      setReportError('Not authenticated. Please sign in again.');
      return;
    }
    setReportDownloading(true);
    setReportError(null);
    try {
      const blob = await apiClient.downloadPrototypeReport(run.id, projectId, token);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orca-report-${run.id.slice(0, 8)}.md`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setReportError(apiErr.problem?.detail || 'Report download failed.');
    } finally {
      setReportDownloading(false);
    }
  };

  const handleExportJSON = () => {
    if (!run) return;
    const blob = new Blob([JSON.stringify(run, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orca-run-${run.id.slice(0, 8)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const isPolling = run && (run.status === 'queued' || run.status === 'running');

  if (!projectId) {
    return (
      <Shell>
        <div className="p-6 text-sm text-red-600">
          Missing <code>project_id</code> query parameter.{' '}
          <Link href={`/org/${orgId}/research/prototype/new`} className="underline">
            Start a new investigation.
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/research/investigations`} className="hover:underline">Research</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/org/${orgId}/research/prototype/new`} className="hover:underline">Prototype</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-mono">{investigationId.slice(0, 8)}…</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FlaskConical className="w-5 h-5 text-[#111827]" />
              <h1 className="text-xl font-bold text-[#111827]">Prototype Investigation</h1>
            </div>
            {investigation && (
              <p className="text-sm text-[#4B5563] max-w-2xl">{investigation.question}</p>
            )}
          </div>
          <button suppressHydrationWarning onClick={loadInvestigation} className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280]">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading */}
        {invLoading && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading investigation…
          </div>
        )}

        {/* Error */}
        {invError && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {invError}
            <button suppressHydrationWarning onClick={loadInvestigation} className="ml-auto underline">Retry</button>
          </div>
        )}

        {/* Investigation Plan */}
        {investigation && !invLoading && (
          <div className="border border-[#E5E7EB] rounded p-4 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">Plan</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#9CA3AF]">
                  planner: {investigation.plan.planner === 'gemini' ? 'Gemini' : 'Guided'}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  investigation.state === 'approved'
                    ? 'border-green-200 bg-green-50 text-green-700'
                    : 'border-yellow-200 bg-yellow-50 text-yellow-700'
                }`}>
                  {investigation.state}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#111827]">{investigation.plan.summary}</p>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <dt className="text-[#9CA3AF] font-mono">scope</dt>
              <dd>{investigation.plan.scope}</dd>
              <dt className="text-[#9CA3AF] font-mono">baseline</dt>
              <dd>{investigation.plan.baseline}</dd>
            </dl>

            {investigation.plan.steps && investigation.plan.steps.length > 0 && (
              <ol className="space-y-0.5">
                {investigation.plan.steps.map((step, i) => (
                  <li key={i} className="text-xs flex gap-2">
                    <span className="text-[#9CA3AF] font-mono shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span>{typeof step === 'string' ? step : step.description || step.step}</span>
                  </li>
                ))}
              </ol>
            )}

            {investigation.plan.limitations && investigation.plan.limitations.length > 0 && (
              <ul className="text-[10px] text-amber-700 space-y-0.5 bg-amber-50 border border-amber-200 rounded p-2">
                {investigation.plan.limitations.map((lim, i) => (
                  <li key={i}>· {lim}</li>
                ))}
              </ul>
            )}

            {/* Approve if not yet approved */}
            {investigation.state !== 'approved' && !run && (
              <div className="pt-2 space-y-2">
                {approveError && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {approveError}
                  </div>
                )}
                <button
                  suppressHydrationWarning
                  onClick={handleApprovePlan}
                  disabled={approving}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#111827] text-white text-xs font-medium rounded hover:bg-[#374151] transition disabled:opacity-40"
                >
                  {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Approve Plan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Run Controls */}
        {investigation && investigation.state === 'approved' && !run && (
          <div className="space-y-3">
            {submitError && (
              <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {submitError}
              </div>
            )}
            <button
              suppressHydrationWarning
              onClick={handleStartRun}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded hover:bg-[#374151] transition disabled:opacity-40"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting Run…</>
              ) : (
                <><Activity className="w-4 h-4" /> Start Analysis</>
              )}
            </button>
          </div>
        )}

        {/* Run Status */}
        {run && (
          <div className="space-y-6">
            <div className="border border-[#E5E7EB] rounded p-4 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                  <Activity className="w-3.5 h-3.5" />
                  Run Status
                </div>
                <StatusBadge status={run.status} />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                <dt className="text-[#9CA3AF] font-mono">run_id</dt>
                <dd className="font-mono flex items-center gap-1">
                  {run.id}
                  <CopyButton value={run.id} />
                </dd>
                <dt className="text-[#9CA3AF] font-mono">created_at</dt>
                <dd>{run.created_at}</dd>
                <dt className="text-[#9CA3AF] font-mono">updated_at</dt>
                <dd>{run.updated_at}</dd>
              </dl>

              {isPolling && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Polling for results every 2 seconds…
                </div>
              )}

              {run.status === 'failed' && (
                <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Run failed{run.error_code ? `: ${run.error_code}` : ''}.</span>
                  </div>
                  <button
                    suppressHydrationWarning
                    onClick={handleNewRun}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#111827] text-white text-xs rounded hover:bg-[#374151]"
                  >
                    <RefreshCw className="w-3 h-3" /> Start New Run
                  </button>
                </div>
              )}
            </div>

            {/* Result Download buttons */}
            {run.status === 'succeeded' && (
              <div className="flex flex-wrap gap-2">
                <button
                  suppressHydrationWarning
                  onClick={handleDownloadReport}
                  disabled={reportDownloading}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded text-xs text-[#111827] hover:bg-[#F8F9FA] transition disabled:opacity-40"
                >
                  {reportDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Download Markdown Report
                </button>
                <button
                  suppressHydrationWarning
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-3 py-1.5 border border-[#E5E7EB] rounded text-xs text-[#111827] hover:bg-[#F8F9FA] transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Result JSON
                </button>
              </div>
            )}

            {reportError && (
              <div className="text-xs text-red-600 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> {reportError}
              </div>
            )}

            {/* Seasonal Results */}
            {run.status === 'succeeded' && run.result && (
              <SeasonalResultDisplay result={run.result} run={run} />
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

