/**
 * Screen F01 — Entry & Workspace Router
 * 
 * Sourced directly from ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §2 & §5.1:
 * - Quiet entry router eliminating the 3-layer duplicated card collages
 * - Prioritizes authenticated institutional researcher workflow
 * - Connected to live backend APIs: GET /v1/organizations (§3.2) & GET /v1/meta (§3.1)
 * - Removed all mock data dependencies
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Network,
  Compass,
  ArrowRight,
  FolderKanban,
  FileSearch,
  Activity,
  CheckCircle2,
  Server,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { Shell } from '@/components/layout/Shell';
import { OrganizationSummary, APIMetadata } from '@/types/api';

export default function EntryPage() {
  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [metadata, setMetadata] = useState<APIMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([apiClient.listOrganizations(), apiClient.getMeta()]).then(([orgsRes, metaRes]) => {
      if (!isMounted) return;

      if (orgsRes.status === 'fulfilled' && orgsRes.value?.items) {
        setOrganizations(orgsRes.value.items);
      } else if (orgsRes.status === 'rejected') {
        const err = orgsRes.reason as OrcaApiError;
        setError(err.problem?.detail || 'Unable to connect to ORCA backend gateway');
      }

      if (metaRes.status === 'fulfilled' && metaRes.value) {
        setMetadata(metaRes.value);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const activeOrg = organizations[0] || null;

  return (
    <Shell>
      <div className="space-y-8 max-w-4xl py-4">
        {/* Backend Connectivity Status banner if offline */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>
                Backend API Gateway ({process.env.NEXT_PUBLIC_ORCA_API_URL || 'http://localhost:8000'}): {error}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#6B7280]">Offline / Standby</span>
          </div>
        )}

        {/* Institutional Welcome & Primary Action */}
        <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#6B7280]">
              Authorized Research Session
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827]">
              {loading
                ? 'Connecting to Institutional Gateway...'
                : activeOrg
                ? activeOrg.name
                : 'Welcome to ORCA 3.0 Workspace'}
            </h1>
            <p className="text-xs text-[#4B5563] max-w-2xl leading-relaxed">
              Verifiable oceanographic research workspace. Perform bounded scientific investigations, inspect
              immutable provenance artifacts, and coordinate with federated peer institutions.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {activeOrg ? (
              <>
                <Link
                  href={`/org/${activeOrg.id}/overview`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-xs font-medium rounded transition"
                >
                  <span>Enter Institution Command Centre</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <Link
                  href={`/org/${activeOrg.id}/projects`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-xs font-medium rounded transition"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-[#4B5563]" />
                  <span>Browse Research Projects</span>
                </Link>
              </>
            ) : (
              <Link
                href="/workspaces"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-xs font-medium rounded transition"
              >
                <span>Select or Create an Organization in Workspaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            <Link
              href="/workspaces"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[#4B5563] hover:text-[#111827] text-xs transition"
            >
              <span>Switch Organization...</span>
            </Link>
          </div>
        </div>

        {/* Actionable Workspaces Grid (§0.1 One-page decision) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Research Studio Quick Jump */}
          <Link
            href={`/org/${activeOrg.id}/research/investigations`}
            className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] hover:border-[#111827] transition space-y-2 block"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <FileSearch className="w-3.5 h-3.5" />
                <span>Research Studio</span>
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">R01–R03</span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Flagship scientific workspace with interactive Map, Time-Series Charts, and Evidence Inspector.
            </p>
          </Link>

          {/* Card 2: Network Tasks */}
          <Link
            href="/network/tasks"
            className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] hover:border-[#111827] transition space-y-2 block"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5" />
                <span>Federated Tasks</span>
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">N02</span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Arkiv public research task board for decentralized A2A agent verification and claims.
            </p>
          </Link>

          {/* Card 3: Marine Map */}
          <Link
            href="/marine/map"
            className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] hover:border-[#111827] transition space-y-2 block"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#111827] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                <span>Environmental Map</span>
              </span>
              <span className="text-[10px] font-mono text-[#6B7280]">M04</span>
            </div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Real-time coastal SST, chlorophyll-a, significant wave heights, and official hazard advisories.
            </p>
          </Link>
        </div>

        {/* Quiet Truth Boundary & Contract Footnote */}
        <div className="border-t border-[#E5E7EB] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#111827]">ORCA 3.0</span>
            <span>·</span>
            <span>Contract Revision: {metadata?.revision || '3.1.0-proposal'}</span>
            <span>·</span>
            <span className="font-mono text-[10px] bg-[#F8F9FA] px-1.5 py-0.5 rounded border border-[#E5E7EB]">
              API Mode Active (api design.md §3)
            </span>
          </div>
          <div>
            <Link href="/admin/system" className="hover:text-[#111827] hover:underline">
              Inspect Platform Readiness Matrix →
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
