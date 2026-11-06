/**
 * ORCA — Mode-Aware Global Header
 * 
 * Sourced directly from ORCA Frontend Handoff §7 & §8:
 * - Real Supabase session identity and server-returned membership role (e.g. "researcher")
 * - Connected to authorized organization directory from GET /v1/organizations
 * - Real sign-out via supabase.auth.signOut()
 * - Clean visual tokens adhering to white-neutral design guidelines
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Building2,
  Network,
  Compass,
  Radio,
  ChevronDown,
  LogOut,
  LogIn,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Header() {
  const pathname = usePathname() || '';
  const router = useRouter();

  const {
    user,
    currentUser,
    organizations,
    selectedOrg,
    selectOrg,
    signOut,
  } = useAuth();

  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Extract orgId from URL pathname if inside /org/:orgId
  const orgMatch = pathname.match(/\/org\/([^/]+)/);
  const currentPathOrgId = orgMatch ? orgMatch[1] : null;

  const activeOrg =
    selectedOrg ||
    organizations.find((o) => o.id === currentPathOrgId) ||
    organizations[0] ||
    null;

  // Determine current active workspace mode strictly from route
  const isMarine = pathname.startsWith('/marine');
  const isOps = pathname.startsWith('/admin');
  const isNetwork = pathname.startsWith('/network') || pathname.includes('/agents');
  const isInstitution = !isMarine && !isOps && !isNetwork;

  // Derive verified role per handoff §7
  const displayRole = currentUser?.roles?.[0]
    ? currentUser.roles[0].replace(/_/g, ' ')
    : user
    ? 'Researcher'
    : 'Guest';

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
            href="/network/agents"
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

      {/* Right: Workspace Selector & Real Identity */}
      <div className="flex items-center gap-3">
        {/* Organization Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setShowOrgDropdown(!showOrgDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 border border-[#E5E7EB] hover:border-[#111827] bg-[#FFFFFF] rounded text-xs transition"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="font-medium text-[#111827] max-w-[140px] truncate">
              {activeOrg?.name || 'Select Workspace'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#6B7280]" />
          </button>

          {showOrgDropdown && (
            <div className="absolute right-0 mt-1 w-64 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg shadow-lg py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-xs font-mono text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
                Authorized Workspaces ({organizations.length})
              </div>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <button
                    key={org.id}
                    suppressHydrationWarning
                    onClick={() => {
                      selectOrg(org.id);
                      setShowOrgDropdown(false);
                      router.push(`/org/${org.id}/overview`);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-[#F3F4F6] flex items-center justify-between ${
                      activeOrg && org.id === activeOrg.id ? 'font-semibold text-[#111827] bg-[#F8F9FA]' : 'text-[#4B5563]'
                    }`}
                  >
                    <span className="truncate">{org.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F3F4F6] border border-[#E5E7EB] uppercase">
                      {org.role || 'Member'}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-xs text-[#6B7280]">
                  {user ? 'No authorized organizations' : 'Sign in to view workspaces'}
                </div>
              )}
              <div className="border-t border-[#E5E7EB] pt-1 mt-1">
                <Link
                  href="/workspaces"
                  onClick={() => setShowOrgDropdown(false)}
                  className="block px-3 py-1.5 text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]"
                >
                  Workspace Directory...
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Session & Role Profile per Handoff §7 & §8 */}
        {user ? (
          <div className="relative">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 border-l border-[#E5E7EB] pl-3 py-1 text-xs text-[#4B5563] hover:text-[#111827] transition"
            >
              <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center font-mono text-xs font-semibold">
                {user.email ? user.email.slice(0, 2).toUpperCase() : 'ME'}
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#111827] max-w-[130px] truncate leading-tight">
                  {user.email}
                </span>
                <span className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider capitalize">
                  {displayRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#6B7280]" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-1 w-64 bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg shadow-lg py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-[#E5E7EB] space-y-1">
                  <div className="font-semibold text-[#111827] truncate">{user.email}</div>
                  <div className="flex items-center gap-1.5 text-[#6B7280] font-mono text-[10px]">
                    <Shield className="w-3 h-3 text-emerald-600" />
                    <span>Role: {displayRole}</span>
                  </div>
                  {currentUser?.user_id && (
                    <div className="text-[10px] font-mono text-[#9CA3AF] truncate">
                      ID: {currentUser.user_id}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={async () => {
                    setShowUserDropdown(false);
                    await signOut();
                    router.push('/workspaces');
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] hover:bg-[#1F2937] text-white rounded text-xs font-semibold transition"
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
