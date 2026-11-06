/**
 * ORCA 3.0 — I08 Members & Invitations Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.2 Screen I08 (Members & invitations)
 * - UI URL: /org/[orgId]/settings/members
 * - Primary personas: Org Owner, Org Admin, PI
 * - Highest referenced API gate: P02 (Institutional management)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.2: GET /v1/organizations/{id}/members (list members)
 * - api design.md §3.2: POST /v1/invitations (invite new researcher or auditor)
 * - api design.md §3.2: DELETE /v1/organizations/{id}/members/{user_id} (remove member)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Role-based permissions matrix clearly distinguished
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  MoreVertical,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'principal_investigator' | 'researcher' | 'data_steward' | 'auditor';
  joinedAt: string;
  status: 'active' | 'pending';
}

const INITIAL_MEMBERS: Member[] = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    name: 'Dr. Vinit (You)',
    email: 'vinit@nori.ocean.gov.in',
    role: 'principal_investigator',
    joinedAt: '2026-01-15T08:00:00Z',
    status: 'active',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Dr. Ananya Sharma',
    email: 'ananya.s@nori.ocean.gov.in',
    role: 'researcher',
    joinedAt: '2026-02-01T10:30:00Z',
    status: 'active',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    name: 'Dr. Marcus Vance',
    email: 'm.vance@ocean-alliance.org',
    role: 'auditor',
    joinedAt: '2026-09-12T14:20:00Z',
    status: 'pending',
  },
];

export default function MembersSettingsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '00000000-0000-4000-8000-000000000010';

  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'researcher' | 'principal_investigator' | 'data_steward' | 'auditor'>('researcher');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: Member = {
      id: `00000000-0000-4000-8000-${Date.now().toString().slice(-12)}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      joinedAt: new Date().toISOString(),
      status: 'pending',
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
    setShowInviteModal(false);
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
          <span className="text-[#111827] font-medium">Members & Permissions</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Institutional Members & Roles</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                I08 · P02
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Manage scientific researchers, principal investigators, data stewards, and independent auditors.
            </p>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Institutional Member</span>
          </button>
        </div>

        {/* Members Table */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F8F9FA] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Active & Invited Members</span>
            <span className="font-mono text-[#6B7280] text-[11px]">{members.length} members</span>
          </div>

          <table className="w-full text-xs text-left">
            <thead className="bg-[#FFFFFF] border-b border-[#E5E7EB] text-[#6B7280] font-mono text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Name / Email</th>
                <th className="px-4 py-2.5">Assigned Role</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Joined Date</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-[#F8F9FA]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-[#111827]">{member.name}</div>
                    <div className="text-[11px] text-[#6B7280]">{member.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="capitalize font-mono text-xs text-[#111827]">
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={member.status === 'active' ? 'success' : 'outline'}>
                      {member.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563] font-mono text-[11px]">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {member.id !== '00000000-0000-4000-8000-000000000001' && (
                      <button
                        onClick={() => setMembers(members.filter((m) => m.id !== member.id))}
                        className="text-[#6B7280] hover:text-[#111827] p-1"
                        title="Revoke access"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Invite Member Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-[#000000] bg-opacity-30 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg max-w-md w-full p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-semibold text-[#111827]">Invite Institutional Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-xs text-[#6B7280] hover:text-[#111827]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] block mb-1">
                    Work Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="researcher@institute.edu"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] block mb-1">
                    Institutional Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
                  >
                    <option value="researcher">Researcher (Run investigations, inspect evidence)</option>
                    <option value="principal_investigator">Principal Investigator (Approve plans & publications)</option>
                    <option value="data_steward">Data Steward (Manage sources and snapshots)</option>
                    <option value="auditor">Auditor (Read-only verification & audit logs)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-3 py-1.5 border border-[#E5E7EB] rounded text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded hover:bg-[#1F2937]"
                  >
                    Send Invitation
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

