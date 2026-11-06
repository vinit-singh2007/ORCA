/**
 * Screen A01 — Federated Agent Directory
 * 
 * Sourced from dashboard design.md §5.6 (Screen A01):
 * - URL: /org/[orgId]/agents
 * - Highest API Gate Referenced: P09 (A2A Directory) & P10 (ENS Identity)
 * - Backend Calls:
 *   GET /v1/network/agents (P09)
 *   POST /v1/network/discovery (P09)
 * 
 * User Review Enhancement:
 * - Direct deep-link to Agent Onboarding Wizard (/org/[orgId]/agents/new)
 * - Direct deep-link to Agent Details (/org/[orgId]/agents/[agentId])
 * - Direct deep-link to ENS Identity Management (/org/[orgId]/agents/[agentId]/identity)
 * - Visibly marks A2A capability directory (P09) vs ENS resolution & wallet bindings (P10)
 * 
 * Comments included in full per user instructions.
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusIndicator } from '@/components/ui/StatusPill';
import { apiClient } from '@/lib/api-client';
import { AgentRecord } from '@/types/api';
import { Cpu, Plus, Globe, Shield, ExternalLink, Key, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function AgentDirectoryPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [agents, setAgents] = useState<AgentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listAgents({ limit: 50 });
      setAgents(res.items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load federated agents';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, [orgId]);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                Federated Agent Directory
              </h1>
              <Badge variant="outline">GATE P09 DIRECTORY</Badge>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Autonomous A2A agent services, verified scientific capability discovery, and decentralized provider onboarding.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={loadAgents}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href={`/org/${orgId}/agents/new`}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#374151] transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Agent Onboarding Wizard (P09)
            </Link>
          </div>
        </div>

        {/* Protocol Boundary Callout (§13.1 & §13.3) */}
        <div className="p-4 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs space-y-1 text-[#4B5563]">
          <div className="font-semibold text-[#111827]">A2A Discovery vs ENS Identity Separation (api design.md §3.10 & §3.11):</div>
          <div>
            A2A capability discovery (P09) registers and tests HTTPS Agent Cards. Blockchain ENS identity records, multi-signature wallet challenges, and institutional accreditations are verified independently under Gate P10.
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            <div className="h-44 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
            <div className="h-44 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Agent Directory Error
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {!loading && !error && agents.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <Cpu className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No agents registered</h3>
            <p className="text-xs text-[#6B7280]">Register an institutional A2A agent using the Onboarding Wizard.</p>
          </div>
        )}

        {/* Agents Directory Grid */}
        {!loading && !error && agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-4 hover:border-[#111827] transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link
                      href={`/org/${orgId}/agents/${agent.id}`}
                      className="text-sm font-bold text-[#111827] hover:underline flex items-center gap-2"
                    >
                      <Cpu className="w-4 h-4 text-[#111827]" />
                      {agent.name}
                    </Link>
                    <div className="text-[11px] font-mono text-[#6B7280] mt-0.5">
                      Type: {agent.kind?.replace('_', ' ') || 'agent'}
                    </div>
                  </div>
                  <StatusIndicator category="accreditation" state={agent.trust_state || 'unknown'} />
                </div>

                {/* Cryptographic Identifiers */}
                <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB] space-y-1 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">ENS Binding (P10):</span>
                    <span className="font-semibold text-[#111827]">{agent.ens_name || 'Unbound'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Endpoint:</span>
                    <span className="truncate max-w-[200px] text-[#4B5563]">{agent.endpoint_uri || 'https://...'}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[#F3F4F6] text-xs">
                  <Link
                    href={`/org/${orgId}/agents/${agent.id}`}
                    className="text-[#111827] font-medium hover:underline flex items-center gap-1"
                  >
                    <span>Health & Telemetry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/org/${orgId}/agents/${agent.id}/identity`}
                    className="text-[#4B5563] hover:text-[#111827] flex items-center gap-1 font-mono text-[11px]"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Manage ENS</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
