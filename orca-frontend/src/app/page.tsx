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
      <div className="space-y-8 w-full max-w-6xl py-2">
        {/* Backend Connectivity Status banner if offline */}
        {error && (
          <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-sm text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#111827] shrink-0" />
              <span>
                Backend API Gateway ({process.env.NEXT_PUBLIC_ORCA_API_URL || 'http://localhost:8000'}): {error}
              </span>
            </div>
            <span className="font-mono text-xs uppercase text-[#6B7280]">Offline / Standby</span>
          </div>
        )}

        {/* Institutional Welcome & Primary Action */}
        <div className="border border-[#E5E7EB] rounded-lg p-6 sm:p-8 bg-[#FFFFFF] space-y-5 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] font-semibold">
              Authorized Research Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              {loading
                ? 'Connecting to Institutional Gateway...'
                : activeOrg
                ? activeOrg.name
                : 'Welcome to ORCA 3.0 Workspace'}
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-3xl leading-relaxed">
              Verifiable oceanographic research workspace. Perform bounded scientific investigations, inspect
              immutable provenance artifacts, and coordinate with federated peer institutions.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {activeOrg ? (
              <>
                <Link
                  href={`/org/${activeOrg.id}/overview`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm font-medium rounded transition"
                >
                  <span>Enter Institution Command Centre</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/org/${activeOrg.id}/projects`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-sm font-medium rounded transition"
                >
                  <FolderKanban className="w-4 h-4 text-[#4B5563]" />
                  <span>Browse Research Projects</span>
                </Link>
              </>
            ) : (
              <Link
                href="/workspaces"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm font-medium rounded transition"
              >
                <span>Select or Create an Organization in Workspaces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/workspaces"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[#4B5563] hover:text-[#111827] text-sm transition"
            >
              <span>Switch Organization...</span>
            </Link>
          </div>
        </div>

        {/* Actionable Workspaces Grid (§0.1 One-page decision) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Research Studio Quick Jump */}
          <Link
            href={activeOrg ? `/org/${activeOrg.id}/research/investigations` : '/workspaces'}
            className="border border-[#E5E7EB] rounded-lg p-5 bg-[#FFFFFF] hover:border-[#111827] hover:shadow-sm transition space-y-3 block"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#111827] flex items-center gap-2">
                <FileSearch className="w-4 h-4" />
                <span>Research Studio</span>
              </span>
              <span className="text-xs font-mono text-[#6B7280]">R01–R03</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Flagship scientific workspace with interactive Map, Time-Series Charts, and Evidence Inspector.
            </p>
          </Link>

          {/* Card 2: Network Tasks */}
          <Link
            href="/network/tasks"
            className="border border-[#E5E7EB] rounded-lg p-5 bg-[#FFFFFF] hover:border-[#111827] hover:shadow-sm transition space-y-3 block"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#111827] flex items-center gap-2">
                <Network className="w-4 h-4" />
                <span>Federated Tasks</span>
              </span>
              <span className="text-xs font-mono text-[#6B7280]">N02</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Arkiv public research task board for decentralized A2A agent verification and claims.
            </p>
          </Link>

          {/* Card 3: Marine Map */}
          <Link
            href="/marine/map"
            className="border border-[#E5E7EB] rounded-lg p-5 bg-[#FFFFFF] hover:border-[#111827] hover:shadow-sm transition space-y-3 block"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#111827] flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Environmental Map</span>
              </span>
              <span className="text-xs font-mono text-[#6B7280]">M04</span>
            </div>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Real-time coastal SST, chlorophyll-a, significant wave heights, and official hazard advisories.
            </p>
          </Link>
        </div>

        {/* Quiet Truth Boundary & Contract Footnote */}
        <div className="border-t border-[#E5E7EB] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#6B7280]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[#111827] font-semibold">ORCA 3.0</span>
            <span>·</span>
            <span>Contract Revision: {metadata?.revision || '3.1.0-proposal'}</span>
            <span>·</span>
            <span className="font-mono text-xs bg-[#F8F9FA] px-2 py-0.5 rounded border border-[#E5E7EB]">
              API Mode Active (api design.md §3)
            </span>
          </div>
          <div>
            <Link href="/admin/system" className="hover:text-[#111827] hover:underline font-medium">
              Inspect Platform Readiness Matrix →
            </Link>
          </div>
        </div>
      </div>
    </Shell>
  );
}
