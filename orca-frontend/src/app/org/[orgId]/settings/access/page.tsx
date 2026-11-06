/**
 * ORCA 3.0 — I09 External Access Grants Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.2 Screen I09 (External access grants)
 * - UI URL: /org/[orgId]/settings/access
 * - Primary personas: Org Admin, Data Steward, PI
 * - Highest referenced API gate: P02 (Institutional management)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.2: GET /v1/access-grants (list outbound and inbound access grants)
 * - api design.md §3.2: POST /v1/access-grants (create cryptographically signed grant)
 * - api design.md §3.2: DELETE /v1/access-grants/{id} (revoke grant)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Scoped permission tokens and non-transferable capability delegation
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  KeyRound,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Lock,
  Globe,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AccessGrant {
  id: string;
  granteeType: 'external_organization' | 'auditor' | 'federated_agent';
  granteeName: string;
  resourceScope: string;
  permissions: string[];
  expiresAt: string;
  status: 'active' | 'expired';
}

const INITIAL_GRANTS: AccessGrant[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    granteeType: 'external_organization',
    granteeName: 'Marine Coastal Alliance (MCA)',
    resourceScope: 'urn:orca:project:00000000-0000-4000-8000-000000000101:*',
    permissions: ['project:read', 'evidence:read'],
    expiresAt: '2026-12-31T23:59:59Z',
    status: 'active',
  },
  {
    id: '00000000-0000-4000-8000-000000000102',
    granteeType: 'federated_agent',
    granteeName: 'coastal-sentinel.eth (Agent A2A)',
    resourceScope: 'urn:orca:investigation:00000000-0000-4000-8000-000000000201:inputs',
    permissions: ['dataset:read'],
    expiresAt: '2026-11-30T00:00:00Z',
    status: 'active',
  },
];

export default function AccessGrantsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '00000000-0000-4000-8000-000000000010';

  const [grants, setGrants] = useState<AccessGrant[]>(INITIAL_GRANTS);

  const handleRevoke = (id: string) => {
    setGrants(grants.filter((g) => g.id !== id));
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#6B7280]">Settings</span>
          <span>/</span>
          <span className="text-[#111827] font-medium">Access Grants</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">External Access Grants & Delegation</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I09 · P02
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Issue time-bounded cryptographic access grants to partner oceanographic institutes and external verifiers.
            </p>
          </div>

          <button
            onClick={() => alert('New access grant modal ready (POST /access-grants).')}
            className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Scoped Access Grant</span>
          </button>
        </div>

        {/* Grants Table */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Active External Grants</span>
            <span className="font-mono text-[#6B7280] text-[11px]">{grants.length} grants active</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Grantee</th>
                <th className="px-4 py-2.5">Target Resource URN</th>
                <th className="px-4 py-2.5">Granted Scopes</th>
                <th className="px-4 py-2.5">Expires</th>
                <th className="px-4 py-2.5 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {grants.map((grant) => (
                <tr key={grant.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{grant.granteeName}</div>
                    <div className="text-[10px] font-mono text-[#6B7280] capitalize">
                      {grant.granteeType.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-[#4B5563] max-w-xs truncate">
                    {grant.resourceScope}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {grant.permissions.map((p, i) => (
                        <span key={i} className="text-[9px] font-mono bg-[#F3F4F6] px-1.5 py-0.5 rounded text-[#111827]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563] font-mono text-[11px]">
                    {new Date(grant.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleRevoke(grant.id)}
                      className="text-[#6B7280] hover:text-[#111827] p-1"
                      title="Revoke Grant"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}

