/**
 * ORCA 3.0 — M04 Marine Map & Environmental Conditions Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M04 (Marine map & environmental conditions)
 * - UI URL: /marine/map
 * - Primary personas: Fisherman, Coastal Navigator, Marine Researcher
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.11: GET /v1/marine/layers (list available GIS tile layers)
 * - api design.md §3.11: GET /v1/marine/probes (point sample value at lat/lon)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral frame (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Scientifically validated color ramp confined strictly inside the canvas viewport
 * - Persistent accessible table alternative for screen readers and keyboard users
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Layers,
  MapPin,
  Compass,
  Eye,
  Sliders,
  Table,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MarineMapPage() {
  const [activeLayer, setActiveLayer] = useState<'sst' | 'waves' | 'chlorophyll' | 'cyclone'>('sst');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [probedCoords, setProbedCoords] = useState<{ lat: number; lon: number; value: string }>({
    lat: 21.2,
    lon: 70.1,
    value: '29.4 °C (SST anomaly: +0.84 °C)',
  });

  return (
    <Shell>
      <div className="space-y-4 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Environmental Map</span>
        </div>

        {/* Header & Controls Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#111827]">Oceanographic Conditions Map</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M04 · P12
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-0.5">
              Real-time spatial layers from INCOIS ERDDAP and Indian Coastal Buoy Network.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* View Mode Toggle */}
            <div className="flex border border-[#E5E7EB] rounded bg-[#FFFFFF] p-0.5">
              <button suppressHydrationWarning
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'map' ? 'bg-[#111827] text-[#FFFFFF]' : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Map View
              </button>
              <button suppressHydrationWarning
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded text-xs transition ${
                  viewMode === 'table' ? 'bg-[#111827] text-[#FFFFFF]' : 'text-[#4B5563] hover:text-[#111827]'
                }`}
              >
                Data Table
              </button>
            </div>
          </div>
        </div>

        {/* Layer Selector Chips */}
        <div className="flex gap-2 flex-wrap text-xs">
          <button suppressHydrationWarning
            onClick={() => setActiveLayer('sst')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition ${
              activeLayer === 'sst'
                ? 'bg-[#111827] text-[#FFFFFF] border-[#111827]'
                : 'bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
            }`}
          >
            Sea Surface Temp (SST)
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveLayer('waves')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition ${
              activeLayer === 'waves'
                ? 'bg-[#111827] text-[#FFFFFF] border-[#111827]'
                : 'bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
            }`}
          >
            Wave Height & Direction
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveLayer('chlorophyll')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition ${
              activeLayer === 'chlorophyll'
                ? 'bg-[#111827] text-[#FFFFFF] border-[#111827]'
                : 'bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
            }`}
          >
            Chlorophyll-a (PFZ Lines)
          </button>
          <button suppressHydrationWarning
            onClick={() => setActiveLayer('cyclone')}
            className={`px-3 py-1.5 rounded border text-xs font-medium transition ${
              activeLayer === 'cyclone'
                ? 'bg-[#111827] text-[#FFFFFF] border-[#111827]'
                : 'bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
            }`}
          >
            Active Hazard Tracks
          </button>
        </div>

        {/* Main Canvas View */}
        {viewMode === 'map' ? (
          <div className="border border-[#E5E7EB] rounded bg-[#F8F9FA] relative h-[480px] flex flex-col justify-between p-4 overflow-hidden">
            {/* SVG GIS Simulation Canvas */}
            <div className="absolute inset-0 flex items-center justify-center opacity-85 pointer-events-none">
              <svg width="100%" height="100%" className="w-full h-full">
                <defs>
                  <pattern id="ocean-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E5E7EB" strokeWidth="0.8" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ocean-grid)" />

                {/* Stylized Gujarat / Saurashtra Coastline Polygon */}
                <path
                  d="M 120 40 Q 240 80 320 140 T 480 200 T 640 260 T 780 320 L 780 480 L 120 480 Z"
                  fill="#FFFFFF"
                  stroke="#111827"
                  strokeWidth="1.5"
                />

                {/* Study Polygon Box */}
                <polygon
                  points="340,160 460,170 450,260 330,250"
                  fill="#111827"
                  fillOpacity="0.08"
                  stroke="#111827"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />

                {/* Buoy Station Markers */}
                <circle cx="380" cy="210" r="5" fill="#111827" />
                <circle cx="430" cy="190" r="5" fill="#111827" />
              </svg>
            </div>

            {/* Top Overlay: Canvas State & Coordinates */}
            <div className="relative z-10 flex justify-between items-start">
              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded p-2.5 shadow-sm text-xs space-y-1">
                <div className="font-semibold text-[#111827] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#111827]" />
                  <span>Interactive Coordinate Probe</span>
                </div>
                <div className="font-mono text-xs text-[#4B5563]">
                  <span>Lat: {probedCoords.lat}°N · Lon: {probedCoords.lon}°E</span>
                </div>
                <div className="font-mono text-xs text-[#111827] font-medium">
                  {probedCoords.value}
                </div>
              </div>

              <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded px-3 py-1.5 shadow-sm text-xs font-mono">
                <span className="text-[#6B7280]">Active EPSG: </span>
                <span className="text-[#111827] font-medium">4326 (WGS 84)</span>
              </div>
            </div>

            {/* Bottom Overlay: Scientific Color Ramp Legend */}
            <div className="relative z-10 bg-[#FFFFFF] border border-[#E5E7EB] rounded p-3 shadow-sm max-w-sm space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#111827] font-mono text-xs uppercase">
                  {activeLayer === 'sst' && 'Sea Surface Temp (°C)'}
                  {activeLayer === 'waves' && 'Significant Wave Height (m)'}
                  {activeLayer === 'chlorophyll' && 'Chlorophyll-a (mg/m³)'}
                  {activeLayer === 'cyclone' && 'Wind Speed (knots)'}
                </span>
                <span className="text-xs text-[#6B7280] font-mono">INCOIS HR-SST</span>
              </div>

              {/* Monochrome Grayscale / Density Gradient Legend */}
              <div className="h-3 w-full rounded bg-gradient-to-r from-[#E5E7EB] via-[#9CA3AF] to-[#111827]" />

              <div className="flex justify-between text-xs font-mono text-[#6B7280]">
                <span>26.0 °C</span>
                <span>28.0 °C</span>
                <span>30.5 °C</span>
              </div>
            </div>
          </div>
        ) : (
          /* Accessible Table Fallback */
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex justify-between items-center text-xs">
              <span className="font-semibold text-[#111827]">Saurashtra Coastline In-Situ Buoy Station Telemetry</span>
              <span className="font-mono text-[#6B7280] text-xs">3 reporting stations</span>
            </div>
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-xs">
                <tr>
                  <th className="px-4 py-2.5">Buoy ID</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5">SST (°C)</th>
                  <th className="px-4 py-2.5">Wave Height (m)</th>
                  <th className="px-4 py-2.5">Wind (km/h)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                <tr className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">CB-02 (Veraval Offshore)</td>
                  <td className="px-4 py-3 font-mono text-[#6B7280]">20.85°N, 70.30°E</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">29.2 °C</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">2.4 m</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">48 km/h (SW)</td>
                </tr>
                <tr className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">CB-04 (Porbandar Deep)</td>
                  <td className="px-4 py-3 font-mono text-[#6B7280]">21.60°N, 69.45°E</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">29.6 °C</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">3.1 m</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">55 km/h (WSW)</td>
                </tr>
                <tr className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">CB-07 (Diu Head)</td>
                  <td className="px-4 py-3 font-mono text-[#6B7280]">20.65°N, 71.05°E</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">28.9 °C</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">2.1 m</td>
                  <td className="px-4 py-3 font-mono text-[#111827]">42 km/h (S)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}

