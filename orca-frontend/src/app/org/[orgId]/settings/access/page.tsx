/**
 * ORCA 3.0 — I09 Access & Sharing Grants Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen I09 (Access & sharing grants)
 * - UI URL: /org/[orgId]/settings/access
 * - Primary personas: Project lead, Data steward, Org Admin
 * - Highest referenced API gate: P08 (RBAC, Multi-Org & Tenant Fencing)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.2: GET /v1/organizations/{org_id}/access-grants (list active grants)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 * - Zero mock data dependencies
 * - Dynamic loading, error, and empty states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import { AccessGrant } from '@/types/api';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Trash2,
  Clock,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AccessGrantsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGrants = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listAccessGrants(orgId);
      setGrants(res.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load access grants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrants();
  }, [orgId]);

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={orgId ? `/org/${orgId}/overview` : '/workspaces'} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#6B7280]">Settings</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Access & Sharing</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Cross-Tenant Access Grants</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I09 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Time-bound cryptographic delegations to external institutions and verified federated agents.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadGrants}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/network/tasks"
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue New Grant</span>
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] animate-pulse space-y-3">
            <div className="h-4 w-48 bg-[#E5E7EB] rounded" />
            <div className="h-20 bg-[#F8F9FA] rounded" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Error Loading Access Grants
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Grants List */}
        {!loading && !error && grants.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <KeyRound className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No active cross-tenant grants</h3>
            <p className="text-xs text-[#6B7280]">
              No external institutions or agents have been delegated permissions to research assets.
            </p>
          </div>
        )}

        {!loading && !error && grants.length > 0 && (
          <div className="space-y-3">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] space-y-3 hover:border-[#111827] transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#111827]">Grant #{grant.id.slice(0, 8)}</span>
                      <Badge variant="outline">Principal: {grant.principal_ref?.id || 'Unknown'}</Badge>
                      <Badge variant="verified">
                        Status: {grant.revoked_at ? 'revoked' : grant.expires_at && new Date(grant.expires_at) < new Date() ? 'expired' : 'active'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#6B7280] font-mono mt-1">
                      Resource: {grant.resource_ref ? `${grant.resource_ref.type}:${grant.resource_ref.id}` : 'All Resources'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E5E7EB] text-[11px] font-mono text-[#6B7280]">
                  <span>Scopes: {(grant.scopes || []).join(', ') || 'read'}</span>
                  <span>•</span>
                  <span>Expires: {grant.expires_at ? new Date(grant.expires_at).toLocaleDateString() : 'Never'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
