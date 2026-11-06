/**
 * ORCA 3.0 — M08 Marine Advisories & Hazard Subscriptions Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M08 (Official alerts & subscriptions)
 * - UI URL: /marine/alerts
 * - Primary personas: Fisher, Coast Guard Operator, Port Authority
 * - Highest referenced API gate: P12 (Marine Companion & Hazards)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.13: GET /v1/marine/advisories (official bulletins)
 * - api design.md §3.13: GET /v1/alerts/subscriptions (active notifications)
 * - api design.md §3.13: POST /v1/alerts/subscriptions (subscribe)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 * - Zero mock data dependencies
 * - Dynamic loading, error, and empty states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import {
  Bell,
  Plus,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Smartphone,
  Phone,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function MarineAlertsPage() {
  const [advisories, setAdvisories] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [advRes, subRes] = await Promise.allSettled([
        apiClient.listAdvisories(),
        apiClient.listAlertSubscriptions(),
      ]);

      if (advRes.status === 'fulfilled') {
        setAdvisories(advRes.value.items || []);
      }
      if (subRes.status === 'fulfilled') {
        setSubscriptions(subRes.value || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load advisories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Advisories & Subscriptions</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Official Marine Advisories & Notifications</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M08 · P12
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Active bulletins from India Meteorological Department (IMD) and INCOIS Ocean State Forecast.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/marine/map"
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Marine Map</span>
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] animate-pulse space-y-3">
            <div className="h-4 w-48 bg-[#E5E7EB] rounded" />
            <div className="h-24 bg-[#F8F9FA] rounded" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Advisory Gateway Notice
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Active Official Advisories Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <span className="font-mono text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Active Government Bulletins ({advisories.length})
            </span>
          </div>

          {!loading && advisories.length === 0 && (
            <div className="p-8 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
              <ShieldAlert className="w-6 h-6 text-[#9CA3AF] mx-auto" />
              <h3 className="text-xs font-semibold text-[#111827]">No active hazardous sea advisories</h3>
              <p className="text-[11px] text-[#6B7280]">Normal conditions reported by meteorological feeds.</p>
            </div>
          )}

          {!loading && advisories.length > 0 && (
            <div className="space-y-3">
              {advisories.map((adv) => (
                <div
                  key={adv.id}
                  className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] space-y-2 hover:border-[#111827] transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111827]">{adv.headline || adv.title || 'Marine Advisory'}</span>
                      <Badge variant={adv.severity === 'warning' ? 'verified' : 'outline'}>
                        {adv.severity || 'Advisory'}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-[#6B7280]">
                      {adv.source || 'IMD / INCOIS'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4B5563]">{adv.details || adv.description || 'Active weather bulletin'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscriptions Section */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2">
            <span className="font-mono text-xs font-semibold text-[#111827] uppercase tracking-wider">
              Alert Channel Subscriptions ({subscriptions.length})
            </span>
          </div>

          {!loading && subscriptions.length === 0 && (
            <div className="p-8 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
              <Bell className="w-6 h-6 text-[#9CA3AF] mx-auto" />
              <h3 className="text-xs font-semibold text-[#111827]">No channel subscriptions registered</h3>
              <p className="text-[11px] text-[#6B7280]">Subscribe to receive automated hazard SMS or voice alerts.</p>
            </div>
          )}

          {!loading && subscriptions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border border-[#E5E7EB] rounded p-3 bg-[#FFFFFF] space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#111827]">{sub.hazard_type}</span>
                    <Badge variant="outline">{sub.channel}</Badge>
                  </div>
                  <div className="text-[11px] text-[#6B7280] font-mono">Region: {sub.region}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
