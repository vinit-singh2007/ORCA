/**
 * ORCA 3.0 — I08 Institutional Members & Permissions Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen I08 (Members & roles)
 * - UI URL: /org/[orgId]/settings/members
 * - Primary personas: Institutional Owner, Admin, PI
 * - Highest referenced API gate: P08 (RBAC, Multi-Org & Tenant Fencing)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.2: GET /v1/organizations/{id}/members (list members)
 * - api design.md §3.2: POST /v1/organizations/{id}/members (grant member role)
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
import { Member, ResearchRole } from '@/types/api';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function MembersSettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [userIdInput, setUserIdInput] = useState('');
  const [inviteRole, setInviteRole] = useState<ResearchRole>('researcher');
  const [submitting, setSubmitting] = useState(false);

  const loadMembers = async () => {
    if (!orgId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listMembers(orgId);
      setMembers(res.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load organization members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [orgId]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdInput || !orgId) return;
    setSubmitting(true);
    try {
      await apiClient.createInvitation(orgId, {
        email: userIdInput,
        role: inviteRole,
      });
      setUserIdInput('');
      setShowInviteModal(false);
      loadMembers();
    } catch (err: unknown) {
      alert(`Failed to add member: ${err instanceof Error ? err.message : 'API error'}`);
    } finally {
      setSubmitting(false);
    }
  };

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
          <span className="text-[#111827] font-medium">Members & Permissions</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Institutional Members & Roles</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I08 · P08
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Manage scientific staff, roles, and cryptographic attestation permissions for this organization.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadMembers}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button suppressHydrationWarning
              onClick={() => setShowInviteModal(true)}
              className="px-3 py-1.5 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
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
              Error Loading Members
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Members Table */}
        {!loading && !error && members.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <Users className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No members registered</h3>
            <p className="text-xs text-[#6B7280]">Add researchers or administrators to grant organization access.</p>
          </div>
        )}

        {!loading && !error && members.length > 0 && (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA] text-[11px] font-mono text-[#6B7280]">
                  <th className="py-2.5 px-4 font-medium">User ID / Principal</th>
                  <th className="py-2.5 px-4 font-medium">Assigned Role</th>
                  <th className="py-2.5 px-4 font-medium">Granted At</th>
                  <th className="py-2.5 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-[#F9FAFB] transition">
                    <td className="py-3 px-4 font-mono text-[#111827]">
                      {member.display_name || member.user_id}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{member.role.replace('_', ' ')}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#6B7280]">
                      {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] text-[#16A34A] font-medium capitalize">
                        {member.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg max-w-md w-full p-6 space-y-4 shadow-lg">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-semibold text-[#111827]">Grant Organization Access</h3>
                <button suppressHydrationWarning
                  onClick={() => setShowInviteModal(false)}
                  className="text-xs text-[#6B7280] hover:text-[#111827]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#4B5563] font-medium mb-1">User ID (Principal UUID)</label>
                  <input suppressHydrationWarning
                    type="text"
                    required
                    placeholder="e.g. usr-9812-4a01..."
                    value={userIdInput}
                    onChange={(e) => setUserIdInput(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded font-mono text-xs focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div>
                  <label className="block text-[#4B5563] font-medium mb-1">Institutional Role</label>
                  <select suppressHydrationWarning
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as ResearchRole)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-xs focus:outline-none focus:border-[#111827]"
                  >
                    <option value="principal_investigator">Principal Investigator (Full Research Sign-off)</option>
                    <option value="researcher">Researcher (Run Investigations & Recipes)</option>
                    <option value="data_steward">Data Steward (Catalog & Product Management)</option>
                    <option value="auditor">Auditor (Read & Verification Only)</option>
                    <option value="org_admin">Organization Admin</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 border border-[#E5E7EB] rounded text-[#4B5563] hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                  <button suppressHydrationWarning
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded font-medium hover:bg-[#1F2937]"
                  >
                    {submitting ? 'Granting...' : 'Grant Access'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
