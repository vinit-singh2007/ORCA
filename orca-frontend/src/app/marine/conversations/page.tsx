/**
 * ORCA 3.0 — M02 Marine Conversations Library Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M02 (Conversations library)
 * - UI URL: /marine/conversations
 * - Primary personas: Fisherman, Coastal Resident, Maritime Vessel Operator
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.11: GET /v1/conversations (list prior chat threads)
 * - api design.md §3.11: POST /v1/conversations (start new session)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Fixture indicator: All synthetic mocks tagged with fixture: true
 * - Citations linked to official IMD / INCOIS marine bulletins
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Plus,
  Compass,
  Calendar,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ConversationThread {
  id: string;
  title: string;
  lastMessage: string;
  lastActive: string;
  hazardDetected: boolean;
  fixture: true;
}

const MOCK_CONVERSATIONS: ConversationThread[] = [
  {
    id: '00000000-0000-4000-8000-000000001001',
    title: 'North Gujarat Sea State & Gale Warning Inquiry',
    lastMessage: 'IMD Coastal Warning active: Squally winds 45-55 kmph forecasted off Porbandar until tomorrow evening.',
    lastActive: '2026-11-06T06:30:00Z',
    hazardDetected: true,
    fixture: true,
  },
  {
    id: '00000000-0000-4000-8000-000000001002',
    title: 'PFZ Advisory for Veraval Offshore Sector',
    lastMessage: 'INCOIS PFZ line located 14 nautical miles SW from Veraval Light. Chlorophyll-a gradient boundary confirmed.',
    lastActive: '2026-11-05T14:15:00Z',
    hazardDetected: false,
    fixture: true,
  },
  {
    id: '00000000-0000-4000-8000-000000001003',
    title: 'Tide Schedule & Tidal Stream at Gulf of Khambhat',
    lastMessage: 'High tide of 7.4 meters predicted at Bhavnagar Port at 16:42 IST. Strong tidal bore currents expected.',
    lastActive: '2026-11-04T09:00:00Z',
    hazardDetected: false,
    fixture: true,
  },
];

export default function MarineConversationsPage() {
  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Conversations</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Marine Conversations & Advisory Chats</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M02 · P12
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Natural language maritime queries grounded in certified oceanographic models, INCOIS alerts, and IMD advisories.
            </p>
          </div>

          <Link
            href="/marine/conversations/new"
            className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Marine Chat</span>
          </Link>
        </div>

        {/* Conversation List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] divide-y divide-[#E5E7EB]">
          {MOCK_CONVERSATIONS.map((thread) => (
            <Link
              key={thread.id}
              href={`/marine/conversations/${thread.id}`}
              className="p-4 flex items-start justify-between gap-4 hover:bg-[#F8F9FA] transition block"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#111827]" />
                  <h2 className="text-xs font-semibold text-[#111827]">{thread.title}</h2>
                  {thread.hazardDetected && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-[#111827] text-[#FFFFFF]">
                      <AlertTriangle className="w-3 h-3" />
                      <span>HAZARD ALERT</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4B5563] line-clamp-1">{thread.lastMessage}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#6B7280]">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(thread.lastActive).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[#6B7280] self-center">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Shell>
  );
}

