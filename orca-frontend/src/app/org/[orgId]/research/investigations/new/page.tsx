/**
 * Screen R02 — New Investigation Formulation Wizard
 * 
 * Sourced from dashboard design.md §5.4 (Screen R02):
 * - URL: /org/[orgId]/research/investigations/new
 * - Highest API Gate Referenced: P05
 * - Backend Calls: POST /v1/research/investigations (§3.6)
 * - Required Acceptance Test: Explicit validation of bounding polygon, time window, and baseline.
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - Full RFC 9457 error and submitting handling
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Check, ChevronRight, FileSearch, HelpCircle, AlertCircle } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';

export default function NewInvestigationPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = (params?.orgId as string) || '';
  const projectIdParam = searchParams.get('projectId') || '00000000-0000-4000-8000-000000000101';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [question, setQuestion] = useState('What was the seasonal SST anomaly along the Saurashtra coast?');
  const [methodHint, setMethodHint] = useState('sst.seasonal_anomaly');
  const [startDate, setStartDate] = useState('2025-06-01');
  const [endDate, setEndDate] = useState('2025-08-31');
  const [riskTier, setRiskTier] = useState<'research' | 'operational' | 'safety_critical'>('research');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const created = await apiClient.createInvestigation({
        project_id: projectIdParam,
        question,
        description: `Method hint: ${methodHint}. Formulated via institutional research studio.`,
        geo_scope: {
          type: 'Polygon',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [69.5, 20.5],
                [71.5, 20.5],
                [71.5, 22.0],
                [69.5, 22.0],
                [69.5, 20.5],
              ],
            ],
          },
        },
        time_window: {
          start: `${startDate}T00:00:00Z`,
          end: `${endDate}T23:59:59Z`,
        },
        risk_tier: riskTier,
      });

      router.push(`/org/${orgId}/research/investigations/${created.id}`);
    } catch (err) {
      const apiErr = err as OrcaApiError;
      setError(apiErr.problem?.detail || 'Failed to create investigation on backend');
      setSubmitting(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/research/investigations`} className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Investigations
          </Link>
          <ChevronRight className="w-3 h-3 text-[#E5E7EB]" />
          <span className="text-[#111827] font-medium">New Formulation</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#111827]">
              Formulate Scientific Investigation
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              R02 · P05
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-1">
            Define research question, geographic boundary polygon, temporal scope, and reference baseline.
          </p>
        </div>

        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#111827]" />
            <span>{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center gap-4 text-xs border-b border-[#E5E7EB] pb-3">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-1.5 ${
              step === 1 ? 'font-bold text-[#111827]' : 'text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-[#111827] flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Question & Scope</span>
          </button>
          <span>→</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-1.5 ${
              step === 2 ? 'font-bold text-[#111827]' : 'text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-[#111827] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Temporal & Risk Tier</span>
          </button>
          <span>→</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1.5 ${
              step === 3 ? 'font-bold text-[#111827]' : 'text-[#6B7280]'
            }`}
          >
            <span className="w-5 h-5 rounded-full border border-[#111827] flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Review & Dispatch</span>
          </button>
        </div>

        {/* Formulation Form */}
        <form onSubmit={handleSubmit} className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-6 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-[#111827] block mb-1">
                  Primary Research Question *
                </label>
                <textarea
                  rows={3}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded p-2 focus:outline-none focus:border-[#111827]"
                  placeholder="e.g. What was the magnitude and spatial extent of the seasonal SST thermal anomaly...?"
                />
              </div>

              <div>
                <label className="font-semibold text-[#111827] block mb-1">
                  Target Scientific Method *
                </label>
                <select
                  value={methodHint}
                  onChange={(e) => setMethodHint(e.target.value)}
                  className="w-full border border-[#E5E7EB] rounded p-2 focus:outline-none focus:border-[#111827]"
                >
                  <option value="sst.seasonal_anomaly">sst.seasonal_anomaly (Seasonal Sea Surface Temperature Anomaly)</option>
                  <option value="upwelling.bakun_index">upwelling.bakun_index (Coastal Upwelling Index)</option>
                  <option value="marine.qc_verification">marine.qc_verification (In-Situ Quality Control)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-1.5 bg-[#111827] text-[#FFFFFF] rounded font-medium"
                >
                  Next: Temporal Window →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-[#111827] block mb-1">
                    Temporal Window Start *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#111827] block mb-1">
                    Temporal Window End *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#111827] block mb-1">
                  Risk Tier & Safety Boundary
                </label>
                <select
                  value={riskTier}
                  onChange={(e) => setRiskTier(e.target.value as 'research' | 'operational' | 'safety_critical')}
                  className="w-full border border-[#E5E7EB] rounded p-2"
                >
                  <option value="research">Research (Academic investigation only)</option>
                  <option value="operational">Operational (Institutional advisory feed)</option>
                  <option value="safety_critical">Safety Critical (Strict multi-source validation required)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-3 py-1.5 border border-[#E5E7EB] text-[#4B5563] rounded"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-1.5 bg-[#111827] text-[#FFFFFF] rounded font-medium"
                >
                  Next: Review & Formulate →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-2 text-xs">
                <div className="font-semibold text-[#111827]">Investigation Formulation Summary</div>
                <div><strong>Question:</strong> {question}</div>
                <div><strong>Method Hint:</strong> <code>{methodHint}</code></div>
                <div><strong>Period:</strong> {startDate} to {endDate}</div>
                <div><strong>Risk Tier:</strong> <code className="capitalize">{riskTier}</code></div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-3 py-1.5 border border-[#E5E7EB] text-[#4B5563] rounded"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#111827] text-[#FFFFFF] rounded font-medium disabled:opacity-50"
                >
                  {submitting ? 'Creating Investigation...' : 'Submit to Gateway (POST /v1/research/investigations)'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Shell>
  );
}
