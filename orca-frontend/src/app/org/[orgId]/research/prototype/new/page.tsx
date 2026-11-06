'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { ResearchProject, PrototypeInvestigation } from '@/types/api';
import {
  FlaskConical, ChevronRight, AlertCircle, CheckCircle2, Loader2,
  Info, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

const FIXED_SCOPE = {
  method: 'orca.seasonal-sst-anomaly/1.0',
  region: 'Arabian Sea · 68.45–68.55°E, 20.45–20.55°N',
  current: 'January 2025',
  baseline: 'January 2003–2022 (20-year reference, NOT a 30-year climate normal)',
};

export default function NewPrototypeInvestigationPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = (params?.orgId as string) || '';
  const { session, selectedOrg } = useAuth();

  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [question, setQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [investigation, setInvestigation] = useState<PrototypeInvestigation | null>(null);

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const orgIdForProjects = selectedOrg?.id || orgId;

  const loadProjects = useCallback(() => {
    if (!orgIdForProjects) return;
    setProjectsLoading(true);
    setProjectsError(null);
    apiClient
      .listProjects({ organization_id: orgIdForProjects, limit: 50 })
      .then((res) => {
        setProjects(res.items || []);
        if (res.items?.length === 1) setSelectedProjectId(res.items[0].id);
        setProjectsLoading(false);
      })
      .catch((err: OrcaApiError) => {
        setProjectsError(err.problem?.detail || 'Failed to load projects');
        setProjectsLoading(false);
      });
  }, [orgIdForProjects]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmitQuestion = async () => {
    if (!selectedProjectId || question.trim().length < 10) return;
    setSubmitting(true);
    setSubmitError(null);
    setInvestigation(null);
    try {
      const inv = await apiClient.createPrototypeInvestigation(
        selectedProjectId,
        question.trim(),
        apiClient.generateIdempotencyKey()
      );
      setInvestigation(inv);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setSubmitError(apiErr.problem?.detail || 'Failed to create investigation. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!investigation || !selectedProjectId) return;
    setApproving(true);
    setApproveError(null);
    try {
      const approved = await apiClient.approvePrototypePlan(
        investigation.id,
        selectedProjectId,
        apiClient.generateIdempotencyKey()
      );
      setInvestigation(approved);
      // Navigate to run page
      router.push(`/org/${orgId}/research/prototype/${approved.id}?project_id=${selectedProjectId}`);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setApproveError(apiErr.problem?.detail || 'Failed to approve plan.');
      setApproving(false);
    }
  };

  const questionLength = question.trim().length;
  const questionValid = questionLength >= 10 && questionLength <= 2000;

  return (
    <Shell>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-5">
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2">
            <Link href={`/org/${orgId}/research/investigations`} className="hover:underline">
              Research
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>New Prototype Investigation</span>
          </div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-[#111827]" />
            <h1 className="text-xl font-bold text-[#111827]">New Prototype Investigation</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              /v1/prototype/*
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-1">
            Ask a question about the fixed SST study scope. The backend will return a guided plan for your approval before any computation begins.
          </p>
        </div>

        {/* Fixed Study Scope Banner */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#111827]">
            <Info className="w-3.5 h-3.5 shrink-0" />
            Fixed Study Scope — This prototype analyses only:
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
            <dt className="text-[#6B7280] font-mono">Region</dt>
            <dd className="text-[#111827]">{FIXED_SCOPE.region}</dd>
            <dt className="text-[#6B7280] font-mono">Current Period</dt>
            <dd className="text-[#111827]">{FIXED_SCOPE.current}</dd>
            <dt className="text-[#6B7280] font-mono">Baseline</dt>
            <dd className="text-[#111827]">{FIXED_SCOPE.baseline}</dd>
            <dt className="text-[#6B7280] font-mono">Method</dt>
            <dd className="text-[#111827] font-mono">{FIXED_SCOPE.method}</dd>
          </dl>
          <p className="text-[10px] text-[#6B7280]">
            Questions about other regions, dates, variables or methods are unsupported. This is a research prototype, not independently validated science.
          </p>
        </div>

        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#111827]">
            Select Project <span className="text-red-500">*</span>
          </label>
          {projectsLoading ? (
            <div className="text-xs text-[#6B7280] flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading projects…
            </div>
          ) : projectsError ? (
            <div className="text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5" /> {projectsError}
              <button suppressHydrationWarning onClick={loadProjects} className="underline ml-1">Retry</button>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-xs text-[#6B7280]">
              No projects found in this organization.{' '}
              <Link href={`/org/${orgId}/projects`} className="underline">Create a project first.</Link>
            </div>
          ) : (
            <select
              suppressHydrationWarning
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#111827] bg-white"
            >
              <option value="">— choose a project —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id.slice(0, 8)}…)
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Question Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#111827]">
            Research Question <span className="text-red-500">*</span>
          </label>
          <textarea
            suppressHydrationWarning
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="e.g. Was sea surface temperature in this Arabian Sea region warmer in January 2025 compared to the historical reference?"
            className="w-full border border-[#E5E7EB] rounded px-3 py-2 text-sm focus:outline-none focus:border-[#111827] resize-none"
            disabled={!!investigation}
          />
          <div className="flex items-center justify-between text-[10px] text-[#6B7280]">
            <span>{questionLength} / 2000 characters (min 10)</span>
            {questionLength > 0 && !questionValid && (
              <span className="text-red-500">Must be 10–2000 characters</span>
            )}
          </div>
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        {!investigation && (
          <button
            suppressHydrationWarning
            onClick={handleSubmitQuestion}
            disabled={!selectedProjectId || !questionValid || submitting}
            className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded hover:bg-[#374151] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Plan…</>
            ) : (
              <><FlaskConical className="w-4 h-4" /> Generate Plan</>
            )}
          </button>
        )}

        {/* Plan Display */}
        {investigation && (
          <div className="space-y-4 border border-[#E5E7EB] rounded p-5 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-[#111827]">Plan Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                  ID: {investigation.id.slice(0, 8)}…
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  investigation.state === 'approved'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-50 text-yellow-700'
                }`}>
                  {investigation.state === 'approved' ? '✓ Approved' : 'Awaiting Approval'}
                </span>
              </div>
            </div>

            {/* Planner badge */}
            <div className="text-xs text-[#6B7280]">
              Planner:{' '}
              <span className="font-mono px-2 py-0.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded">
                {investigation.plan.planner === 'gemini' ? 'Gemini' : 'Guided'}
              </span>
            </div>

            {/* Summary */}
            <div>
              <div className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-1">Summary</div>
              <p className="text-sm text-[#111827]">{investigation.plan.summary}</p>
            </div>

            {/* Scope / Baseline */}
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
              <dt className="text-[#6B7280] font-mono">Scope</dt>
              <dd className="text-[#111827]">{investigation.plan.scope}</dd>
              <dt className="text-[#6B7280] font-mono">Baseline</dt>
              <dd className="text-[#111827]">{investigation.plan.baseline}</dd>
            </dl>

            {/* Steps */}
            {investigation.plan.steps && investigation.plan.steps.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2">Analysis Steps</div>
                <ol className="space-y-1 list-none">
                  {investigation.plan.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="font-mono text-[#6B7280] shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-[#111827]">
                        {typeof step === 'string' ? step : step.description || step.step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Limitations */}
            {investigation.plan.limitations && investigation.plan.limitations.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1">
                <div className="text-xs font-semibold text-amber-800">Limitations</div>
                <ul className="space-y-0.5">
                  {investigation.plan.limitations.map((lim, i) => (
                    <li key={i} className="text-xs text-amber-700 flex gap-1.5">
                      <span className="shrink-0">·</span>
                      {lim}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bundle digest */}
            {investigation.plan.bundle_digest && (
              <div className="text-[10px] font-mono text-[#9CA3AF]">
                bundle_digest: {investigation.plan.bundle_digest}
              </div>
            )}

            {/* Approve Error */}
            {approveError && (
              <div className="p-3 border border-red-200 bg-red-50 rounded text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {approveError}
              </div>
            )}

            {/* Action Buttons */}
            {investigation.state !== 'approved' ? (
              <button
                suppressHydrationWarning
                onClick={handleApprovePlan}
                disabled={approving}
                className="flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded hover:bg-[#374151] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {approving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /> Approve Plan & Continue</>
                )}
              </button>
            ) : (
              <Link
                href={`/org/${orgId}/research/prototype/${investigation.id}?project_id=${selectedProjectId}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] text-white text-sm font-medium rounded hover:bg-[#374151] transition"
              >
                Continue to Analysis <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}
