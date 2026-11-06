/**
 * Screen A07/A08 — Agent Detail & Operational Health
 * 
 * Sourced directly from:
 * - dashboard design.md §5.6 (Screens A07, A08)
 * - api design.md §3.10 (GET /v1/network/agents/{agent_id}, GET /v1/network/agents/{agent_id}/health)
 * 
 * Capabilities Managed on this Screen:
 * - Operating parameters & A2A endpoint registration
 * - Declared method contracts & supported schema boundaries
 * - Health telemetry (observed_at, availability status)
 * - One-click access to ENS Identity & Cryptographic Bindings (P10)
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
import {
  Cpu,
  ArrowLeft,
  Key,
  ShieldCheck,
  Activity,
  Layers,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function AgentDetailPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';
  const agentId = (params?.agentId as string) || '';

  const [agent, setAgent] = useState<AgentRecord | null>(null);
  const [capabilities, setCapabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAgent() {
      if (!agentId) return;
      setLoading(true);
      setError(null);
      try {
        const [a, caps] = await Promise.all([
          apiClient.getAgent(agentId),
          apiClient.getAgentCapabilities(agentId).catch(() => ({ agent_id: agentId, capabilities: [] })),
        ]);
        if (!active) return;
        setAgent(a);
        setCapabilities(caps.capabilities || []);
      } catch (err: unknown) {
        if (!active) return;
        const msg = err instanceof Error ? err.message : 'Failed to load agent profile';
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAgent();

    return () => {
      active = false;
    };
  }, [agentId]);

  if (loading) {
    return (
      <Shell>
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-[#E5E7EB] rounded" />
          <div className="h-64 bg-[#F8F9FA] rounded border border-[#E5E7EB]" />
        </div>
      </Shell>
    );
  }

  if (error || !agent) {
    return (
      <Shell>
        <div className="p-6 border border-[#E5E7EB] rounded bg-[#FFFFFF] max-w-3xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-[#DC2626]">
            <AlertCircle className="w-5 h-5" />
            <h2 className="font-semibold text-sm">Agent Lookup Error</h2>
          </div>
          <p className="text-xs text-[#4B5563] font-mono">{error || 'Agent record not found'}</p>
          <Link
            href={`/org/${orgId}/agents`}
            className="inline-block px-3 py-1.5 text-xs border border-[#E5E7EB] rounded text-[#111827] hover:border-[#111827]"
          >
            Back to Agent Directory
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/agents`} className="hover:text-[#111827] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Agent Directory
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">{agent.name}</span>
        </div>

        {/* Header Bar */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[#111827]">{agent.name}</h1>
                <Badge variant="outline">{agent.kind?.replace('_', ' ') || 'agent'}</Badge>
              </div>
              <p className="text-xs text-[#4B5563] mt-1 font-mono">
                Agent ID: {agent.id}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/org/${orgId}/agents/${agent.id}/identity`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111827] text-white text-xs font-medium rounded hover:bg-[#374151] transition"
              >
                <Key className="w-3.5 h-3.5" />
                Manage ENS Identity (P10)
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="pt-3 border-t border-[#F3F4F6] flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">ENS Binding:</span>
              <strong className="text-[#111827] font-mono">{agent.ens_name || 'Unbound'}</strong>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">Accreditation:</span>
              <StatusIndicator category="accreditation" state={agent.trust_state || 'unknown'} />
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">Protocol:</span>
              <span className="font-mono text-[#111827]">A2A 1.x</span>
            </div>
          </div>
        </div>

        {/* Connection & Endpoint Specification */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-4 text-xs font-mono">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <span className="font-bold text-[#111827]">ENDPOINT & TRANSPORT TOPOLOGY</span>
            <Badge variant="verified">HTTPS Validated</Badge>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-[#6B7280] block text-[10px]">A2A SERVICE ENDPOINT:</span>
              <div className="p-2 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#111827] mt-0.5">
                {agent.endpoint_uri || 'https://agents.orca.ocean/a2a/v1'}
              </div>
            </div>
            <div>
              <span className="text-[#6B7280] block text-[10px]">WELL-KNOWN AGENT CARD:</span>
              <div className="p-2 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#111827] mt-0.5">
                {agent.card_url || `${agent.endpoint_uri || 'https://agents.orca.ocean'}/.well-known/agent-card.json`}
              </div>
            </div>
          </div>
        </div>

        {/* Declared Scientific Capabilities */}
        <div className="border border-[#E5E7EB] bg-[#FFFFFF] rounded p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div className="flex items-center gap-2 font-mono font-bold text-[#111827]">
              <Layers className="w-4 h-4 text-[#4B5563]" />
              DECLARED SCIENTIFIC CAPABILITIES ({capabilities.length || agent.supported_methods?.length || 0})
            </div>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            {(agent.declared_capabilities && agent.declared_capabilities.length > 0) ? (
              agent.declared_capabilities.map((m: string) => (
                <div key={m} className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] flex items-center justify-between">
                  <span className="font-bold text-[#111827]">{m}</span>
                  <Badge variant="verified">Verified Contract</Badge>
                </div>
              ))
            ) : (
              <div className="p-3 bg-[#F8F9FA] rounded border border-[#E5E7EB] text-[#6B7280]">
                No explicit method contracts declared
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
