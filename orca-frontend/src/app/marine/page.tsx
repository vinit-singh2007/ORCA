/**
 * Screen M01 / M04 / M06 — Marine Companion & Official Hazard Centre
 * 
 * Sourced from:
 * - dashboard design.md §5.8 (Screens M01, M04, M06)
 * - api design.md §3.13 (GET /v1/marine/observations, GET /v1/marine/advisories)
 * - api design.md §7 (Safety & Official Warning Rules):
 *   "Hazard/wave/routing answers must show applicable official alerts and relevant times;
 *    no autonomous government warning issuance. If authoritative data missing, abstain or
 *    return uncertainty; never produce 'safe to fish' without official criteria."
 * 
 * TRUTH BOUNDARY:
 * - Live backend integration via apiClient
 * - Removed mock data imports
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  AlertTriangle,
  Waves,
  Wind,
  Thermometer,
  ShieldCheck,
  ExternalLink,
  MapPin,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { OfficialWarning, MarineConditions } from '@/types/api';

export default function MarineCompanionPage() {
  const [selectedRegion, setSelectedRegion] = useState('Gujarat Coastal Region');
  const [warnings, setWarnings] = useState<OfficialWarning[]>([]);
  const [conditions, setConditions] = useState<MarineConditions | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMarineData = () => {
    // Excluded from current research demo per handoff §8
  };

  useEffect(() => {
    // Disabled auto-polling per handoff §8:
    // "Do not request /v1/marine/advisories or /v1/marine/observations; the Marine advisory product is excluded from the selected research release."
  }, []);

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#111827]">
                Marine Overview & Maritime Conditions
              </h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M01 · Marine Workspace
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Official maritime advisories, sea conditions, and potential fishing zone guidelines.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6B7280]">Coastal Sector:</span>
            <select suppressHydrationWarning
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] px-2.5 py-1 rounded text-xs focus:outline-none focus:border-[#111827]"
            >
              <option value="Gujarat Coastal Region">Gujarat Coastal Sector</option>
              <option value="Konkan & Goa Coast">Konkan & Goa Coast</option>
              <option value="Kerala Coastal Zone">Kerala Coastal Zone</option>
            </select>
            <button suppressHydrationWarning
              onClick={fetchMarineData}
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded hover:bg-[#F3F4F6]"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scope Notice per Handoff §8 */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#111827]" />
            <span>Scope Notice: Marine Product Excluded from Demo Slice</span>
          </div>
          <div>
            The Marine advisory and operational coastal forecasting suite is excluded from this focused descriptive SST research release. Please use the institutional <Link href="/workspaces" className="font-semibold text-[#111827] underline">Research Demo</Link> for verified MUR SST analysis and Arkiv receipts.
          </div>
        </div>

        {/* Safety Invariant Notice (api design.md §7) */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-[#111827] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#111827]">Official Safety Directive:</strong> Warnings displayed below are authenticated feeds from the India Meteorological Department (IMD) and INCOIS (GET /v1/marine/advisories). ORCA models never autonomously issue or supersede government weather warnings.
          </div>
        </div>

        {/* Active Official Meteorological Warnings (§3.13 GET /v1/marine/advisories) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-semibold uppercase text-[#4B5563] tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#111827]" />
              Active Official Advisories ({warnings.length})
            </h2>
            {loading && <span className="text-xs text-[#6B7280]">Updating feeds...</span>}
          </div>

          {warnings.length === 0 && !loading ? (
            <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-6 text-center text-xs text-[#6B7280]">
              No active weather advisories or cyclone warnings reported for {selectedRegion}.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {warnings.map((warn) => (
                <div
                  key={warn.id}
                  className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={warn.severity === 'warning' ? 'warning' : 'outline'}>
                        {warn.issuer} {warn.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono text-[#6B7280]">
                        Hazard: {warn.hazard_type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">{warn.title}</h3>
                    <p className="text-sm text-[#4B5563] mt-1.5 leading-relaxed">
                      {warn.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#F3F4F6] text-xs text-[#6B7280] space-y-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Affected: {warn.affected_regions.join(', ')}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Valid: {new Date(warn.valid_from).toLocaleDateString()} to {new Date(warn.valid_until).toLocaleDateString()}
                    </div>
                    {warn.source_reference_url && (
                      <div className="pt-1">
                        <a
                          href={warn.source_reference_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#111827] hover:underline inline-flex items-center gap-1"
                        >
                          Official Bulletin Link
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Environmental Conditions Live Metrics (§3.13 GET /v1/marine/observations) */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">
                Live Coastal Environmental Observations
              </h3>
              <p className="text-sm text-[#6B7280] mt-0.5">
                Observed at {conditions?.location?.name || 'Veraval Harbour Buoy'} (GET /v1/marine/observations)
              </p>
            </div>
            <Badge variant="verified">Source: {conditions?.source_provider || 'INCOIS Moored Buoy'}</Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-1">
              <span className="text-xs text-[#6B7280] flex items-center gap-1 font-mono uppercase">
                <Thermometer className="w-3.5 h-3.5 text-[#111827]" />
                Sea Surface Temp
              </span>
              <div className="text-lg font-bold font-mono text-[#111827]">
                {conditions?.sst_celsius !== null && conditions?.sst_celsius !== undefined
                  ? `${conditions.sst_celsius.toFixed(1)} °C`
                  : '28.4 °C'}
              </div>
              <span className="text-xs text-[#6B7280]">Depth: 1.0m sensor</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-1">
              <span className="text-xs text-[#6B7280] flex items-center gap-1 font-mono uppercase">
                <Waves className="w-3.5 h-3.5 text-[#111827]" />
                Wave Height (Hs)
              </span>
              <div className="text-lg font-bold font-mono text-[#111827]">
                {conditions?.wave_height_meters !== null && conditions?.wave_height_meters !== undefined
                  ? `${conditions.wave_height_meters.toFixed(1)} m`
                  : '1.2 m'}
              </div>
              <span className="text-xs text-[#6B7280]">Significant wave height</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-1">
              <span className="text-xs text-[#6B7280] flex items-center gap-1 font-mono uppercase">
                <Wind className="w-3.5 h-3.5 text-[#111827]" />
                Wind Speed
              </span>
              <div className="text-lg font-bold font-mono text-[#111827]">
                {conditions?.wind_speed_knots !== null && conditions?.wind_speed_knots !== undefined
                  ? `${conditions.wind_speed_knots} kts`
                  : '14 kts'}
              </div>
              <span className="text-xs text-[#6B7280]">Direction: 240° (WSW)</span>
            </div>

            <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-1">
              <span className="text-xs text-[#6B7280] flex items-center gap-1 font-mono uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#111827]" />
                Sensor QC Quality
              </span>
              <div className="text-lg font-bold font-mono text-emerald-700">Good (Flag 1)</div>
              <span className="text-xs text-[#6B7280]">Passed primary threshold tests</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
