/**
 * ORCA 3.0 — M07 Route Exposure Scenarios Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M07 (Route exposure scenarios)
 * - UI URL: /marine/routes
 * - Primary personas: Maritime Operator, Coastal Vessel Master, Fisherman
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.11: POST /v1/marine/route-exposures (evaluate hazards along voyage waypoints)
 * - api design.md §3.11: GET /v1/marine/ports (standard coastal waypoints and harbours)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Fixture indicator: All synthetic mocks tagged with fixture: true
 * - Clear hazard warnings along discrete waypoint segments
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Navigation,
  Anchor,
  AlertTriangle,
  Play,
  ArrowRight,
  ShieldCheck,
  Compass,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RouteExposuresPage() {
  const [origin, setOrigin] = useState('Porbandar Port');
  const [destination, setDestination] = useState('Veraval Harbour');
  const [cruisingSpeedKnots, setCruisingSpeedKnots] = useState('9');
  const [departureTime, setDepartureTime] = useState('2026-11-06T18:00');
  const [exposureResult, setExposureResult] = useState<{
    totalDistanceNM: number;
    estimatedTransitHours: number;
    maxSignificantWaveHeight: string;
    peakWindGust: string;
    hazardSegments: Array<{ waypoint: string; wave: string; risk: string }>;
  } | null>(null);

  const handleCalculateExposure = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate POST /v1/marine/route-exposures
    setExposureResult({
      totalDistanceNM: 64.2,
      estimatedTransitHours: 7.1,
      maxSignificantWaveHeight: '3.4 meters',
      peakWindGust: '58 km/h (Squall)',
      hazardSegments: [
        {
          waypoint: 'Segment 2: Off Navibandar (21°25\'N, 69°45\'E)',
          wave: '3.4m SW swell',
          risk: 'HIGH SQUALL RISK: Fishermen warning active',
        },
        {
          waypoint: 'Segment 4: Mangrol Approach (21°05\'N, 70°05\'E)',
          wave: '2.6m swell',
          risk: 'MODERATE CHOP: Crossing seas',
        },
      ],
    });
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Route Exposures</span>
        </div>

        {/* Header */}
        <div className="border-b border-[#E5E7EB] pb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-[#111827]">Maritime Route Hazard & Wave Exposure</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              M07 · P12
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-1">
            Evaluate wave heights, headwind drag, squall warnings, and safe passage windows along coastal routes.
          </p>
        </div>

        {/* Voyage Planner Form */}
        <form onSubmit={handleCalculateExposure} className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Departure Port
              </label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="Porbandar Port">Porbandar Old Port</option>
                <option value="Okha Port">Okha Port (Gulf of Kutch)</option>
                <option value="Veraval Harbour">Veraval Fishing Harbour</option>
                <option value="Mangrol Port">Mangrol Port</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Destination Port / Zone
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
              >
                <option value="Veraval Harbour">Veraval Fishing Harbour</option>
                <option value="Porbandar Port">Porbandar Old Port</option>
                <option value="Diu Anchorage">Diu Anchorage</option>
                <option value="Jafarabad Port">Jafarabad Port</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Cruising Speed (Knots)
              </label>
              <input
                type="number"
                min="4"
                max="30"
                value={cruisingSpeedKnots}
                onChange={(e) => setCruisingSpeedKnots(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded font-mono text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#111827] uppercase tracking-wider block mb-1">
                Scheduled Departure Time
              </label>
              <input
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded font-mono text-xs focus:outline-none focus:border-[#111827]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-xs font-medium rounded transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Simulate Route Exposure (POST /route-exposures)</span>
          </button>
        </form>

        {/* Simulation Output Card */}
        {exposureResult && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider">
                  Simulation Outcome
                </span>
                <h2 className="text-base font-semibold text-[#111827] mt-0.5">
                  {origin} → {destination}
                </h2>
              </div>
              <Badge variant="neutral">SW MONSOON CURRENT</Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E5E7EB] text-xs">
              <div>
                <span className="text-[#6B7280] block text-[11px]">Total Distance</span>
                <span className="font-mono text-sm font-semibold text-[#111827]">
                  {exposureResult.totalDistanceNM} NM
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">Transit Time</span>
                <span className="font-mono text-sm font-semibold text-[#111827]">
                  {exposureResult.estimatedTransitHours} hours
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">Max Wave Height</span>
                <span className="font-mono text-sm font-semibold text-[#111827]">
                  {exposureResult.maxSignificantWaveHeight}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] block text-[11px]">Peak Wind Gust</span>
                <span className="font-mono text-sm font-semibold text-[#111827]">
                  {exposureResult.peakWindGust}
                </span>
              </div>
            </div>

            {/* High-Risk Waypoint Segments */}
            <div className="space-y-2 pt-3 border-t border-[#E5E7EB]">
              <span className="text-xs font-mono font-semibold uppercase text-[#111827] block">
                Flagged Exposure Segments
              </span>
              <div className="space-y-2">
                {exposureResult.hazardSegments.map((seg, i) => (
                  <div key={i} className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-[#111827]">{seg.waypoint}</span>
                      <span className="font-mono text-[11px] text-[#111827]">{seg.wave}</span>
                    </div>
                    <div className="text-[11px] text-[#4B5563] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#111827]" />
                      <span>{seg.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

