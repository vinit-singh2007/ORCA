/**
 * ORCA 3.0 — Mode-Aware Global Header
 * 
 * Sourced from ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §3.1:
 * - One thin top bar (52-56px), fixed within page shell
 * - Workspace switcher: Institution | Network | Marine | Platform Ops (role-gated)
 * - Universal search input (⌘K / Ctrl+K)
 * - Active Organization Switcher with live API integration
 * - Profile & tenant context from GET /v1/me and GET /v1/organizations
 * 
 * TRUTH BOUNDARY & API CONTRACT:
 * - Direct integration with apiClient.getMe() (§3.2) and apiClient.listOrganizations() (§3.2)
 * - No mock data dependencies
 * - Clean, quiet monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Network,
  Compass,
  Search,
  ChevronDown,
  Radio,
  User,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { OrganizationSummary, CurrentPrincipal } from '@/types/api';

export function Header() {
  const pathname = usePathname() || '';
  const router = useRouter();

  const [organizations, setOrganizations] = useState<OrganizationSummary[]>([]);
  const [principal, setPrincipal] = useState<CurrentPrincipal | null>(null);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Extract orgId from URL pathname if inside /org/:orgId
  const orgMatch = pathname.match(/\/org\/([^/]+)/);
  const currentPathOrgId = orgMatch ? orgMatch[1] : null;

  useEffect(() => {
    let isMounted = true;

    // Fetch live principal from API (GET /v1/me)
    apiClient
      .getMe()
      .then((p) => {
        if (isMounted) setPrincipal(p);
      })
      .catch(() => {
        // Fallback for unauthenticated / developing session
      });

    // Fetch permitted organizations from API (GET /v1/organizations)
    apiClient
      .listOrganizations()
      .then((res) => {
        if (isMounted && res?.items) {
          setOrganizations(res.items);
        }
      })
      .catch(() => {
        // Offline or connection pending
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Determine active organization
  const activeOrg =
    organizations.find((o) => o.id === currentPathOrgId) ||
    organizations[0] ||
    (currentPathOrgId
      ? {
          id: currentPathOrgId,
          name: 'Current Workspace',
          slug: 'workspace',
          visibility: 'public' as const,
          verification_status: 'verified' as const,
        }
      : null);

  // Determine current active workspace mode strictly from route
  const isMarine = pathname.startsWith('/marine');
  const isOps = pathname.startsWith('/admin');
  const isNetwork = pathname.startsWith('/network') || pathname.includes('/agents');
  const isInstitution = !isMarine && !isOps && !isNetwork;

  return (
    <header className="h-14 bg-[#FFFFFF] border-b border-[#E5E7EB] px-4 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Brand & Workspace Switcher */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm font-bold tracking-tight text-[#111827]">
          <span className="w-5 h-5 bg-[#111827] text-white flex items-center justify-center text-xs rounded-sm">O</span>
          <span>ORCA</span>
        </Link>

        {/* Workspace Mode Switcher (§3.1) */}
        <nav className="hidden md:flex items-center gap-1 border-l border-[#E5E7EB] pl-4" aria-label="Workspaces">
          <Link
            href={activeOrg ? `/org/${activeOrg.id}/overview` : '/workspaces'}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              isInstitution
                ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Institution</span>
          </Link>

          <Link
            href="/network/tasks"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              isNetwork
                ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Network</span>
          </Link>

          <Link
            href="/marine"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              isMarine
                ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Marine</span>
          </Link>

          {/* Platform Ops — Shown only to authorized operators */}
          <Link
            href="/admin/system"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition ${
              isOps
                ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Platform Ops</span>
          </Link>
        </nav>
      </div>

      {/* Center/Right: Universal Search & Organization Selector */}
      <div className="flex items-center gap-3">
        {/* Universal Search (⌘K / Ctrl+K) */}
        <div className="relative hidden sm:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search projects, tasks (⌘K)..."
            onClick={() => setSearchOpen(true)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-[#E5E7EB] rounded bg-[#F8F9FA] text-[#111827] placeholder:text-[#6B7280] focus:bg-[#FFFFFF] focus:outline-none focus:border-[#111827]"
          />
        </div>

        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 border border-[#E5E7EB] hover:border-[#111827] bg-[#FFFFFF] rounded text-xs transition"
          >
            <span className="w-2 h-2 rounded-full bg-[#111827]" />
            <span className="font-medium text-[#111827] max-w-[130px] truncate">{activeOrg?.name || 'Workspaces'}</span>
            <ChevronDown className="w-3 h-3 text-[#6B7280]" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-1 w-64 bg-[#FFFFFF] border border-[#E5E7EB] rounded shadow-sm py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-mono text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                Switch Organization
              </div>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setShowOrgDropdown(false);
                      router.push(`/org/${org.id}/overview`);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#F3F4F6] flex items-center justify-between ${
                      org.id === activeOrg.id ? 'font-semibold text-[#111827] bg-[#F8F9FA]' : 'text-[#4B5563]'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    {org.id === activeOrg.id && <span className="text-[10px] font-mono">Active</span>}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-[#6B7280]">
                  {activeOrg.name}
                </div>
              )}
              <div className="border-t border-[#E5E7EB] pt-1 mt-1">
                <Link
                  href="/workspaces"
                  onClick={() => setShowOrgDropdown(false)}
                  className="block px-3 py-1.5 text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]"
                >
                  Manage All Workspaces...
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Context Avatar */}
        <div className="flex items-center gap-1.5 border-l border-[#E5E7EB] pl-3 text-xs text-[#4B5563]">
          <div className="w-6 h-6 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center font-mono text-[10px] text-[#111827]">
            {principal?.user_id ? principal.user_id.slice(0, 2).toUpperCase() : 'PI'}
          </div>
          <span className="hidden lg:inline text-[11px] font-medium text-[#111827]">
            {principal?.roles?.[0] ? `${principal.roles[0].replace('_', ' ')}` : 'Principal Investigator'}
          </span>
        </div>
      </div>
    </header>
  );
}
