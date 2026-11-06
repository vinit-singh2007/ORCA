/**
 * ORCA 3.0 — M05 Potential Fishing Zones (PFZ) Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M05 (Fisheries PFZ tool)
 * - UI URL: /marine/fisheries
 * - Primary personas: Coastal Fisher, Fisheries Cooperative, Field Scientist
 * - Highest referenced API gate: P12 (Marine Companion & Hazards)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.13: GET /v1/marine/fisheries/zones (INCOIS thermal & chlorophyll PFZ)
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
  Fish,
  Compass,
  ArrowLeft,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function FisheriesPFZPage() {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listFisheriesZones();
      setZones(res.zones || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve PFZ zones from gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Fisheries & PFZ</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#111827]">Potential Fishing Zones (PFZ)</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M05 · P12
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              INCOIS thermal front lines, chlorophyll-a bloom boundaries, and safe navigational coordinates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadZones}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/marine/map"
              className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>View On Map</span>
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
              PFZ Feed Notice
            </div>
            <p className="text-sm text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Zones List */}
        {!loading && !error && zones.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <Fish className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No active fishing zones returned</h3>
            <p className="text-sm text-[#6B7280]">
              Cloud cover or satellite pass cycle may temporarily restrict optical chlorophyll PFZ processing.
            </p>
          </div>
        )}

        {!loading && !error && zones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] space-y-3 hover:border-[#111827] transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-semibold text-[#111827]">{zone.name}</h3>
                    <div className="text-xs font-mono text-[#6B7280] mt-0.5">Depth: {zone.depth_range}</div>
                  </div>
                  <Badge variant="verified">Confidence: {zone.confidence}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#F8F9FA] rounded text-xs font-mono">
                  <div>
                    <span className="text-[#6B7280] block text-xs">SST GRADIENT</span>
                    <span className="font-semibold text-[#111827]">{zone.sst_gradient}</span>
                  </div>
                  <div>
                    <span className="text-[#6B7280] block text-xs">CHLOROPHYLL</span>
                    <span className="font-semibold text-[#111827]">{zone.chlorophyll_index}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-[#6B7280] flex justify-between pt-1">
                  <span>Valid Until: {zone.valid_until}</span>
                  <span>Source: INCOIS</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
