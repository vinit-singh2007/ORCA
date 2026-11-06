/**
 * ORCA 3.0 — M05 Potential Fishing Zone (PFZ) & Marine Restrictions Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M05 (Potential fishing zone & restrictions)
 * - UI URL: /marine/fisheries
 * - Primary personas: Fisherman, Coastal Cooperative Lead, Fisheries Officer
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.11: GET /v1/marine/pfz (official INCOIS PFZ advisory lines and sectors)
 * - api design.md §3.11: GET /v1/marine/restrictions (marine protected areas & monsoon ban boundaries)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Fixture indicator: All synthetic mocks tagged with fixture: true
 * - Clear distinction between advisory opportunities (PFZ) and mandatory statutory bans (EEZ closed seasons)
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Compass,
  Fish,
  AlertOctagon,
  MapPin,
  Calendar,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PFZZone {
  id: string;
  sectorName: string;
  bearingDistance: string;
  depthFathoms: string;
  targetedSpecies: string[];
  chlorophyllFront: string;
  validUntil: string;
  status: 'active' | 'expired';
  fixture: true;
}

const MOCK_PFZ_DATA: PFZZone[] = [
  {
    id: 'pfz-01',
    sectorName: 'Veraval South-West Sector',
    bearingDistance: '14 NM bearing 215° from Veraval Harbour',
    depthFathoms: '30 - 45 fathoms',
    targetedSpecies: ['Indian Mackerel', 'Ribbonfish', 'Tuna shoals'],
    chlorophyllFront: 'Thermal-Chlorophyll frontal gradient: 0.8 mg/m³ delta',
    validUntil: '2026-11-07T12:00:00Z',
    status: 'active',
    fixture: true,
  },
  {
    id: 'pfz-02',
    sectorName: 'Mangrol Offshore Zone',
    bearingDistance: '18 NM bearing 240° from Mangrol Port Light',
    depthFathoms: '35 - 50 fathoms',
    targetedSpecies: ['Pomfret', 'Squid', 'Croaker'],
    chlorophyllFront: 'SST boundary: 28.6°C to 29.4°C transition',
    validUntil: '2026-11-07T12:00:00Z',
    status: 'active',
    fixture: true,
  },
  {
    id: 'pfz-03',
    sectorName: 'Jafarabad Coastal Flank',
    bearingDistance: '9 NM bearing 180° from Jafarabad Creek',
    depthFathoms: '18 - 25 fathoms',
    targetedSpecies: ['Bombay Duck', 'Threadfin Bream'],
    chlorophyllFront: 'Estuarine coastal plume boundary',
    validUntil: '2026-11-06T18:00:00Z',
    status: 'active',
    fixture: true,
  },
];

export default function FisheriesPFZPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPFZ = MOCK_PFZ_DATA.filter((zone) =>
    zone.sectorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.targetedSpecies.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
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
              <h1 className="text-xl font-semibold text-[#111827]">Potential Fishing Zones (PFZ) & Statutory Boundaries</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M05 · P12
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Official INCOIS satellite-derived PFZ advisories integrating ocean thermal front lines and chlorophyll-a concentrations.
            </p>
          </div>

          <Badge variant="success">INCOIS ADVISORY ACTIVE</Badge>
        </div>

        {/* Mandatory Restriction Warning Banner */}
        <div className="border border-[#E5E7EB] rounded p-4 bg-[#F8F9FA] space-y-2">
          <div className="flex items-center gap-2 text-[#111827] font-semibold text-xs">
            <AlertOctagon className="w-4 h-4 text-[#111827]" />
            <span>Marine Protected Area Notice: Marine National Park (Gulf of Kutch)</span>
          </div>
          <p className="text-xs text-[#4B5563] leading-relaxed">
            All mechanized trawling and purse-seining is strictly prohibited within the declared Marine National Park
            coordinates (22°15&apos;N to 22°45&apos;N, 69°00&apos;E to 70°15&apos;E) pursuant to the Wildlife Protection Act.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search sectors by landing port, fish species (e.g. Mackerel, Pomfret)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
          />
        </div>

        {/* PFZ Advisories Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPFZ.map((zone) => (
            <div
              key={zone.id}
              className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] hover:border-[#111827] transition space-y-4"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-semibold text-[#111827]">{zone.sectorName}</h2>
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280] font-mono">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{zone.bearingDistance}</span>
                  </div>
                </div>
                <Badge variant="outline">{zone.depthFathoms}</Badge>
              </div>

              {/* Frontal Boundary Physics */}
              <div className="p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs text-[#4B5563] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold">
                  Oceanographic Signature
                </span>
                <p className="font-mono text-[11px] text-[#111827]">{zone.chlorophyllFront}</p>
              </div>

              {/* Target Fish Species */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-mono uppercase text-[#6B7280] block font-semibold">
                  Expected Pelagic Shoals
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {zone.targetedSpecies.map((sp, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-[#FFFFFF] border border-[#E5E7EB] px-2 py-0.5 rounded text-[#111827] flex items-center gap-1"
                    >
                      <Fish className="w-3 h-3 text-[#6B7280]" />
                      <span>{sp}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Validity Footer */}
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px] text-[#6B7280] font-mono">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Valid until: {new Date(zone.validUntil).toLocaleString()}</span>
                </div>
                <span className="text-[#111827] font-medium">INCOIS Multilingual Feed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

