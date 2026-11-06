/**
 * ORCA 3.0 — Contextual Workspace-Specific Sidebar
 * 
 * Sourced directly from ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §3.2 & §4:
 * - Shows ONLY 3-6 primary navigation links for the ACTIVE WORKSPACE MODE.
 * - No more stacked all-in-one 20-item sidebars!
 * - Clean visual language: restrained neutral background (#F3F4F6), left marker (border-l-2), no heavy dark blocks.
 * - Supports collapse to 60px icon-only mode with tooltips.
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  FolderKanban,
  FileSearch,
  Database,
  FileCheck2,
  Cpu,
  Globe,
  Compass,
  MessageSquare,
  Fish,
  Navigation,
  Bell,
  Radio,
  Server,
  Layers,
  Settings,
  Sparkles,
  Users,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const orgMatch = pathname.match(/\/org\/([^/]+)/);
  const orgId = orgMatch ? orgMatch[1] : '';
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Derive active workspace mode strictly from current URL path
  const isMarine = pathname.startsWith('/marine');
  const isOps = pathname.startsWith('/admin');
  const isNetwork = pathname.startsWith('/network') || pathname.includes('/agents');
  const isInstitution = !isMarine && !isOps && !isNetwork;

  const navItem = (href: string, label: string, icon: React.ReactNode, exact = false) => {
    const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        title={isCollapsed ? label : undefined}
        className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition ${
          isActive
            ? 'bg-[#F3F4F6] text-[#111827] font-semibold border-l-2 border-l-[#111827] pl-2.5'
            : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
        }`}
      >
        <span className="shrink-0">{icon}</span>
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={`sticky top-14 h-[calc(100vh-3.5rem)] bg-[#FFFFFF] border-r border-[#E5E7EB] flex flex-col justify-between p-3 transition-all duration-200 overflow-y-auto shrink-0 z-30 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="space-y-4">
        {/* Workspace Title Indicator */}
        {!isCollapsed && (
          <div className="px-3 text-xs font-mono font-semibold uppercase tracking-wider text-[#6B7280]">
            {isInstitution && 'Institution'}
            {isNetwork && 'Federated Network'}
            {isMarine && 'Marine Companion'}
            {isOps && 'Platform Operations'}
          </div>
        )}

        {/* 1. INSTITUTION NAVIGATION (Max 5 primary links per §4.1) */}
        {isInstitution && (
          <div className="space-y-1">
            {navItem(orgId ? `/org/${orgId}/overview` : '/workspaces', 'Overview', <Activity className="w-4 h-4" />)}
            {navItem(orgId ? `/org/${orgId}/research/demo` : '/workspaces', 'Research Demo', <Sparkles className="w-4 h-4 text-[#111827]" />)}
            {navItem(orgId ? `/org/${orgId}/projects` : '/workspaces', 'Projects', <FolderKanban className="w-4 h-4" />)}
            {navItem(orgId ? `/org/${orgId}/research/investigations` : '/workspaces', 'Investigations', <FileSearch className="w-4 h-4" />)}
            {navItem(orgId ? `/org/${orgId}/data/products` : '/workspaces', 'Data & Methods', <Database className="w-4 h-4" />)}
            {navItem(orgId ? `/org/${orgId}/review/inbox` : '/workspaces', 'Scientific Reviews', <FileCheck2 className="w-4 h-4" />)}
          </div>
        )}

        {/* 2. NETWORK NAVIGATION (Max 4 primary links per §4.2) */}
        {isNetwork && (
          <div className="space-y-1">
            {navItem('/network/agents', 'Discover Agents', <Cpu className="w-4 h-4" />)}
            {navItem('/network/tasks', 'Research Tasks', <Globe className="w-4 h-4" />)}
            {navItem(orgId ? `/org/${orgId}/agents` : '/network/agents', 'My Agents', <Server className="w-4 h-4" />)}
          </div>
        )}

        {/* 3. MARINE COMPANION NAVIGATION (Max 4 primary links per §4.3) */}
        {isMarine && (
          <div className="space-y-1">
            {navItem('/marine', 'Marine Overview', <Compass className="w-4 h-4" />, true)}
            {navItem('/marine/map', 'Map & Conditions', <Compass className="w-4 h-4" />)}
            {navItem('/marine/alerts', 'Advisories', <Bell className="w-4 h-4" />)}
            {navItem('/marine/conversations', 'Assistant', <MessageSquare className="w-4 h-4" />)}
            
            {/* Contextual Marine Tools */}
            {!isCollapsed && (
              <div className="pt-3 mt-2 border-t border-[#E5E7EB] space-y-1">
                <div className="px-3 pb-1 text-xs font-mono uppercase text-[#6B7280]">Tools</div>
                {navItem('/marine/fisheries', 'Fisheries & PFZ', <Fish className="w-4 h-4" />)}
                {navItem('/marine/routes', 'Route Analysis', <Navigation className="w-4 h-4" />)}
              </div>
            )}
          </div>
        )}

        {/* 4. PLATFORM OPS NAVIGATION (Operator-only per §4.4) */}
        {isOps && (
          <div className="space-y-1">
            {navItem('/admin/system', 'System Health', <Radio className="w-4 h-4" />)}
            {navItem('/admin/sources', 'Source Connectors', <Server className="w-4 h-4" />)}
            {navItem('/admin/jobs', 'Job Queues', <Layers className="w-4 h-4" />)}
            {navItem('/admin/arkiv', 'Arkiv Indexer', <Globe className="w-4 h-4" />)}
          </div>
        )}
      </div>

      {/* Footer Navigation Section */}
      <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
        {/* Settings Sub-Menu for Institution Mode */}
        {isInstitution && !isCollapsed && (
          <div className="space-y-1">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-[#4B5563] hover:text-[#111827] rounded hover:bg-[#F8F9FA] transition"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </div>
              <ChevronDown className={`w-3 h-3 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
            </button>

            {showSettings && (
              <div className="pl-6 space-y-0.5 text-xs">
                <Link
                  href={`/org/${orgId}/settings/members`}
                  className={`block py-1 text-xs hover:text-[#111827] ${
                    pathname.includes('/settings/members') ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'
                  }`}
                >
                  Members &amp; Roles
                </Link>
                <Link
                  href={`/org/${orgId}/settings/access`}
                  className={`block py-1 text-xs hover:text-[#111827] ${
                    pathname.includes('/settings/access') ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'
                  }`}
                >
                  Access &amp; Sharing
                </Link>
                <Link
                  href={`/org/${orgId}/settings/usage`}
                  className={`block py-1 text-xs hover:text-[#111827] ${
                    pathname.includes('/settings/usage') ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'
                  }`}
                >
                  Usage &amp; Limits
                </Link>
                <Link
                  href={`/org/${orgId}/settings/audit`}
                  className={`block py-1 text-xs hover:text-[#111827] ${
                    pathname.includes('/settings/audit') ? 'font-semibold text-[#111827]' : 'text-[#6B7280]'
                  }`}
                >
                  Audit Log
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Advanced Links for Network Mode */}
        {isNetwork && !isCollapsed && (
          <div className="space-y-0.5 text-xs text-[#6B7280]">
            <div className="px-3 pb-0.5 font-mono uppercase text-xs text-[#9CA3AF]">Advanced</div>
            <Link
              href="/network/arkiv"
              className={`block px-3 py-1 hover:text-[#111827] rounded hover:bg-[#F8F9FA] ${
                pathname === '/network/arkiv' ? 'font-semibold text-[#111827]' : ''
              }`}
            >
              Arkiv Explorer
            </Link>
            <Link
              href="/verify/ARKIV-TASK-2026-088"
              className="block px-3 py-1 hover:text-[#111827] rounded hover:bg-[#F8F9FA]"
            >
              Public Proof Verifier
            </Link>
          </div>
        )}

        {/* Collapse / Expand Toggle Button */}
        <button
          type="button"
          suppressHydrationWarning
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center p-2 text-xs text-[#6B7280] hover:text-[#111827] hover:bg-[#F8F9FA] rounded transition"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="ml-1.5 text-xs font-medium">Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  );
}
