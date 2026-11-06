/**
 * ORCA 3.0 — N01 External Agent Discovery Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.7 Screen N01 (External agent discovery)
 * - UI URL: /network/agents
 * - Primary personas: Researcher, PI, Agent Operator
 * - Highest referenced API gate: P09 (Federated A2A Agent Directory)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.10: GET /v1/network/agents (cross-institution federated agents)
 * - api design.md §3.10: GET /v1/network/agents/{id}/capabilities (advertised methods)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Direct integration with real backend API client
 * - No mock data dependencies
 * - Strict monochrome white/neutral tokens (#FFFFFF, #E5E7EB, #111827)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusPill } from '@/components/ui/StatusPill';
import { EmptyState } from '@/components/ui/EmptyState';
import { AgentSummary } from '@/types/api';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import {
  Globe,
  Cpu,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ExternalAgentDiscoveryPage() {
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrust, setFilterTrust] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = () => {
    setLoading(true);
    setError(null);
    apiClient
      .listAgents({
        trust_state: filterTrust === 'all' ? undefined : filterTrust,
      })
      .then((res) => {
        if (res?.items) {
          setAgents(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Unable to fetch agents from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAgents();
  }, [filterTrust]);

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.ens_name && agent.ens_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      agent.declared_capabilities?.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/network/tasks" className="hover:text-[#111827]">
            Federated Network
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">External Agent Discovery</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold text-[#111827]">Federated Agent Directory</h1>
              <span className="text-xs font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                N01 · P09 / P10
              </span>
            </div>
            <p className="text-sm text-[#4B5563] mt-1">
              Discover autonomous A2A scientific agents across participating oceanographic institutes and independent providers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button suppressHydrationWarning
              onClick={fetchAgents}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Agents"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href="/network/tasks"
              className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Browse Tasks</span>
            </Link>
          </div>
        </div>

        {/* Backend Error Banner */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>API Gateway Notice: {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchAgents}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Trust Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
            <input suppressHydrationWarning
              type="text"
              placeholder="Search by agent name, capability (e.g. sst.seasonal_anomaly), or ENS name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select suppressHydrationWarning
              value={filterTrust}
              onChange={(e) => setFilterTrust(e.target.value)}
              className="text-xs border border-[#E5E7EB] rounded px-3 py-2 bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              <option value="all">All Verification States</option>
              <option value="verified">Verified Institutional Agents</option>
              <option value="unverified">Community / Independent Agents</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading registered agents from API (GET /v1/network/agents)...
          </div>
        )}

        {/* Agents Grid */}
        {!loading && filteredAgents.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280]">
            No federated agents registered yet on this backend.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] hover:border-[#111827] transition space-y-4"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-[#111827]">{agent.name}</h2>
                      {agent.ens_name && (
                        <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]">
                          {agent.ens_name}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6B7280] capitalize font-mono">
                      {agent.kind?.replace(/_/g, ' ') || 'agent'}
                    </div>
                  </div>
                  <StatusPill indicator="accreditation" status={agent.trust_state} />
                </div>

                {/* Advertised Scientific Capabilities */}
                <div className="space-y-1.5 pt-2 border-t border-[#E5E7EB]">
                  <span className="text-xs font-mono uppercase text-[#6B7280] block font-semibold">
                    Declared Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.declared_capabilities?.map((cap, i) => (
                      <span
                        key={i}
                        className="text-xs font-mono bg-[#F8F9FA] border border-[#E5E7EB] px-2 py-0.5 rounded text-[#111827]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification & A2A Endpoints */}
                <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#4B5563]">
                    <Cpu className="w-3.5 h-3.5 text-[#111827]" />
                    <span>A2A Protocol Ready</span>
                  </div>
                  {agent.a2a_agent_card_ref && (
                    <a
                      href={agent.a2a_agent_card_ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#111827] hover:underline flex items-center gap-1 text-xs"
                    >
                      <span>Inspect Agent Card</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Truth Boundary Box */}
        <div className="border border-[#E5E7EB] bg-[#F8F9FA] rounded p-4 text-xs text-[#4B5563] space-y-1">
          <div className="font-semibold text-[#111827]">Decoupled Identity & Accreditation Notice:</div>
          <div>
            A registered ENS domain or public A2A endpoint does not automatically imply institutional accreditation.
            Accreditations are validated via cryptographic multi-signature challenges recorded under Gate P10.
          </div>
        </div>
      </div>
    </Shell>
  );
}
