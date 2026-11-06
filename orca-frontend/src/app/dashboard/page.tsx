/**
 * Screen F01 — Entry & Workspace Router
 * 
 * Sourced directly from ORCA Frontend Handoff §1, §7, §8:
 * - Real Supabase session awareness via useAuth()
 * - Directly routes to authenticated institution workspaces and real research demo
 * - Does not invent fake platform totals or trigger background calls to unavailable routes
 * - Clear error and unauthenticated states
 */

'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Sparkles,
  ArrowRight,
  FolderKanban,
  FileSearch,
  Database,
  AlertCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

export default function DashboardEntryPage() {
  const { user, selectedOrg, organizations, orgsLoading, error, isBackendAlive } = useAuth();

  const activeOrg = selectedOrg || organizations[0] || null;

  return (
    <Shell>
      <div className="space-y-8 w-full py-2 max-w-6xl">
        {/* Backend Connectivity Status banner if offline */}
        {isBackendAlive === false && (
          <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Backend API Gateway (<code className="font-mono text-xs bg-[#FFFFFF] px-1.5 py-0.5 rounded border border-[#E5E7EB]">{process.env.NEXT_PUBLIC_ORCA_API_URL || 'http://10.71.71.246:8000'}</code>): Unavailable. Check LAN connection or Wi-Fi IP address.
              </span>
            </div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#E5E7EB]">
              Offline
            </span>
          </div>
        )}

        {/* Directory Error Banner */}
        {error && (
          <div className="p-4 border border-[#FECACA] bg-[#FEF2F2] rounded text-xs text-[#991B1B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>Directory Notice: {error}</span>
            </div>
            <Link
              href="/workspaces"
              className="px-2.5 py-1 border border-[#DC2626] rounded text-xs hover:bg-[#DC2626] hover:text-[#FFFFFF] transition"
            >
              Manage Workspaces
            </Link>
          </div>
        )}

        {/* Institutional Welcome & Primary Action */}
        <div className="border border-[#E5E7EB] rounded-xl p-6 sm:p-8 bg-[#FFFFFF] space-y-5 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6B7280] font-bold">
                Authorized Research Workspace
              </span>
              {activeOrg && (
                <Badge variant="verified">
                  Verified Slice
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#111827]">
              {orgsLoading
                ? 'Connecting to Institutional Gateway...'
                : activeOrg
                ? activeOrg.name
                : 'Welcome to ORCA Workspace'}
            </h1>
            <p className="text-sm sm:text-base text-[#4B5563] max-w-4xl leading-relaxed">
              Verifiable oceanographic research platform. Perform bounded descriptive Sea Surface Temperature analysis, inspect deterministic recalculations, and examine immutable Arkiv public blockchain receipts.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {user && activeOrg ? (
              <>
                <Link
                  href={`/org/${activeOrg.id}/research/demo`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm font-semibold rounded shadow-sm transition"
                >
                  <Sparkles className="w-4 h-4 text-[#FFFFFF]" />
                  <span>Launch SST Research Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href={`/org/${activeOrg.id}/overview`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#E5E7EB] hover:bg-[#F8F9FA] text-[#111827] text-sm font-semibold rounded transition"
                >
                  <span>Institution Command Centre</span>
                </Link>

                <Link
                  href={`/org/${activeOrg.id}/projects`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[#4B5563] hover:text-[#111827] text-sm font-medium transition"
                >
                  <FolderKanban className="w-4 h-4 text-[#4B5563]" />
                  <span>Projects</span>
                </Link>
              </>
            ) : user ? (
              <Link
                href="/workspaces"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm font-semibold rounded shadow-sm transition"
              >
                <span>Select an Organization in Workspaces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/workspaces"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm font-semibold rounded shadow-sm transition"
              >
                <Lock className="w-4 h-4" />
                <span>Sign In to Access Workspaces</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              href="/workspaces"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[#6B7280] hover:text-[#111827] text-xs font-medium transition ml-auto"
            >
              <span>Switch Workspace...</span>
            </Link>
          </div>
        </div>

        {/* Actionable Workspaces Grid (§0.1 One-page decision) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Card 1: Research Demo Feature */}
          <Link
            href={activeOrg ? `/org/${activeOrg.id}/research/demo` : '/workspaces'}
            className="border-2 border-[#111827] rounded-xl p-5 bg-[#FFFFFF] hover:shadow-md transition space-y-2.5 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#111827]" />
                <span>SST Research Demo</span>
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#111827] text-[#FFFFFF]">
                Active Slice
              </span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Real computational execution against preserved MUR SST sample: 31 daily means, synchronous rerun, and verified on-chain proof.
            </p>
          </Link>

          {/* Card 2: Research Investigations */}
          <Link
            href={activeOrg ? `/org/${activeOrg.id}/research/investigations` : '/workspaces'}
            className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FFFFFF] hover:border-[#111827] hover:shadow-md transition space-y-2.5 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-base flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#111827]" />
                <span>Investigation Library</span>
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280]">
                R01
              </span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Durable ocean studies, bounded temperature calculations, and reproducible evidence manifests.
            </p>
          </Link>

          {/* Card 3: Data Products & Snapshots */}
          <Link
            href={activeOrg ? `/org/${activeOrg.id}/data/products` : '/workspaces'}
            className="border border-[#E5E7EB] rounded-xl p-5 bg-[#FFFFFF] hover:border-[#111827] hover:shadow-md transition space-y-2.5 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111827] text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-[#111827]" />
                <span>Data & Snapshots</span>
              </span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#6B7280]">
                D02–D05
              </span>
            </div>
            <p className="text-xs text-[#4B5563] leading-relaxed">
              Verified source catalogs, MUR SST snapshot digests, and license compliance verification.
            </p>
          </Link>
        </div>

        {/* Quiet Truth Boundary & Contract Footnote */}
        <div className="border-t border-[#E5E7EB] pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[#111827] font-bold">ORCA</span>
            <span>·</span>
            <span>API Target: <code className="font-mono bg-[#F8F9FA] px-1.5 py-0.5 rounded border border-[#E5E7EB]">{process.env.NEXT_PUBLIC_ORCA_API_URL || 'http://10.71.71.246:8000'}</code></span>
            <span>·</span>
            <span>Auth: <code className="font-mono bg-[#F8F9FA] px-1.5 py-0.5 rounded border border-[#E5E7EB]">Supabase Cloud</code></span>
          </div>
          <div>
            <a
              href="https://rabdi.explorer.arkiv.network/tx/0x990fe04c31c81d743d79a32e633d0020781be09c5ef82ab50c71881fb976e23d"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[#111827] hover:underline"
            >
              <span>Rabdi Arkiv Receipt (tx 0x990f...)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </Shell>
  );
}
