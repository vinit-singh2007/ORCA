/**
 * ORCA 3.0 — M02 Marine Assistant Conversations Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M02 (Conversations list)
 * - UI URL: /marine/conversations
 * - Primary personas: Fisher, Field Agent, Coast Guard Operator
 * - Highest referenced API gate: P12 (Marine Companion & Hazards)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.13: GET /v1/marine/conversations (list chat threads)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome tokens (#FFFFFF, #E5E7EB, #111827)
 * - Zero mock data dependencies
 * - Dynamic loading, error, and empty states
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';
import {
  MessageSquare,
  Plus,
  AlertTriangle,
  ArrowRight,
  Clock,
  Compass,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function MarineConversationsPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listConversations();
      setConversations(res.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations from gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Assistant Conversations</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Marine Assistant Threads</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M02 · P12
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Conversational inquiry threads for coastal sea state, IMD advisories, and INCOIS potential fishing zones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadConversations}
              disabled={loading}
              className="p-1.5 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/marine/map"
              className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open Marine Map</span>
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
              Gateway Notice
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Conversations List */}
        {!loading && !error && conversations.length === 0 && (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#9CA3AF] mx-auto" />
            <h3 className="text-sm font-semibold text-[#111827]">No active conversation threads</h3>
            <p className="text-xs text-[#6B7280]">
              Inquire about coastal advisories or fishing zones on the Marine Map to start a conversation.
            </p>
          </div>
        )}

        {!loading && !error && conversations.length > 0 && (
          <div className="space-y-3">
            {conversations.map((thread) => (
              <Link
                key={thread.id}
                href={`/marine/conversations/${thread.id}`}
                className="block border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] hover:border-[#111827] transition space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#111827]">{thread.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B7280]">
                    {thread.last_active_at ? new Date(thread.last_active_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-[#4B5563] line-clamp-2">
                  {thread.preview || 'No messages yet'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
