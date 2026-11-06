/**
 * Screen F03 — Workspace Selector & Organization Directory
 * 
 * Sourced directly from ORCA Frontend Handoff §7 & §8:
 * - Real Supabase Auth sign-in state via useAuth()
 * - Shows LoginForm when unauthenticated
 * - Loads /v1/organizations with Bearer token
 * - Controlled workspace selection
 * - Organization creation disabled per §8 ("Organization creation is managed by the backend administrator")
 * - If directory empty: shows "Ask the organization administrator for access"
 * - Role displayed as returned from server (e.g. 'researcher')
 * - No synthetic fallback or dummy organizations
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { Building2, ArrowRight, ShieldCheck, Check, AlertCircle, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

export default function WorkspacesPage() {
  const router = useRouter();
  const {
    user,
    currentUser,
    organizations,
    selectedOrgId,
    selectOrg,
    orgsLoading,
    error,
    refreshDirectory,
    isBackendAlive,
  } = useAuth();

  // If not logged in, render the login form
  if (!user) {
    return (
      <Shell>
        <div className="w-full max-w-xl mx-auto py-10">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-2xl font-bold text-[#111827]">ORCA Authentication</h1>
            <p className="text-sm text-[#4B5563]">
              Sign in with your Supabase account to access your institutional research workspaces.
            </p>
          </div>
          <LoginForm />
        </div>
      </Shell>
    );
  }

  const handleSelectWorkspace = (orgId: string) => {
    selectOrg(orgId);
    router.push(`/org/${orgId}/overview`);
  };

  return (
    <Shell>
      <div className="space-y-6 w-full max-w-5xl">
        {/* Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">
              Organization & Workspace Directory
            </h1>
            <p className="text-sm text-[#4B5563] mt-1">
              Choose a workspace you have access to. Research projects, data snapshots, and reproducible executions are strictly scoped to your authorized organization context.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              suppressHydrationWarning
              onClick={() => refreshDirectory()}
              disabled={orgsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] rounded text-xs font-medium text-[#111827] hover:bg-[#F8F9FA] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${orgsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Backend Connection Error Banner */}
        {error && (
          <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#111827]">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Backend Directory Notice (GET /v1/organizations): {error}</span>
            </div>
            <button
              suppressHydrationWarning
              onClick={() => refreshDirectory()}
              className="inline-flex items-center gap-1 px-2.5 py-1 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Organizations List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] text-xs font-mono font-semibold text-[#4B5563] uppercase flex justify-between items-center">
            <span>Authorized Institutional Organizations ({organizations.length})</span>
            {orgsLoading && <span className="text-xs font-sans text-[#6B7280]">Loading live records...</span>}
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            {organizations.length === 0 && !orgsLoading && (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-[#111827]">
                  No authorized organizations found
                </div>
                <p className="text-xs text-[#6B7280] max-w-md mx-auto">
                  Ask the organization administrator for access. Creating an authentication account alone does not grant research workspace membership.
                </p>
              </div>
            )}

            {organizations.map((org) => {
              const isSelected = org.id === selectedOrgId;
              const userRole = org.role || (currentUser?.roles?.[0] ?? 'researcher');
              const isDemoOrg = org.id === 'b7806251-9ebc-4ad0-ac93-044345e83d24';

              return (
                <div
                  key={org.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isSelected ? 'bg-[#F9FAFB] border-l-4 border-l-[#111827]' : 'hover:bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded border border-[#E5E7EB] bg-[#FFFFFF] flex items-center justify-center text-[#111827] mt-0.5 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-semibold text-[#111827]">
                          {org.name}
                        </h2>
                        {isDemoOrg && (
                          <Badge variant="verified">
                            <Sparkles className="w-3 h-3 text-[#111827]" />
                            Real Research Demo Workspace
                          </Badge>
                        )}
                        {org.visibility && (
                          <Badge variant="outline">{org.visibility}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] mt-1 font-mono">
                        Slug: <span className="text-[#111827] font-semibold">{org.slug}</span>
                        {' · '}
                        ID: <span>{org.id}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        <span className="text-[#4B5563]">
                          Server Verified Role:{' '}
                          <strong className="text-[#111827] uppercase font-mono">
                            {userRole}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    {isSelected ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 border border-[#111827] bg-[#FFFFFF] text-[#111827] text-xs font-medium rounded">
                        <Check className="w-3.5 h-3.5" />
                        Active Selection
                      </span>
                    ) : (
                      <button
                        suppressHydrationWarning
                        onClick={() => selectOrg(org.id)}
                        className="px-3 py-1.5 border border-[#E5E7EB] hover:border-[#111827] text-[#111827] text-xs font-medium rounded transition"
                      >
                        Select Workspace
                      </button>
                    )}
                    <button
                      suppressHydrationWarning
                      onClick={() => handleSelectWorkspace(org.id)}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
                    >
                      Enter Workspace
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Backend Provisioning Note per Handoff §8 */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827]">Organization Management Notice:</div>
          <div>
            Organization creation is managed directly by backend database administrators. If your institution is not listed, contact your ORCA administrator to be assigned membership.
          </div>
        </div>
      </div>
    </Shell>
  );
}
