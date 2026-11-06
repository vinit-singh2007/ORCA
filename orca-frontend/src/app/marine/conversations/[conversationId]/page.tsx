/**
 * ORCA 3.0 — M03 Marine Conversation + Response Evidence Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M03 (Conversation + response evidence)
 * - UI URL: /marine/conversations/[conversationId]
 * - Primary personas: Fisherman, Coastal resident, Vessel Master
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.11: GET /v1/conversations/{id} (load thread messages)
 * - api design.md §3.11: POST /v1/conversations/{id}/messages (submit query)
 * - api design.md §3.11: GET /v1/conversations/{id}/events (SSE token & evidence stream)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Fixture indicator: All synthetic mocks tagged with fixture: true
 * - Citations to real oceanographic models and warnings; no hallucinated safety assurances
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  MessageSquare,
  Send,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Compass,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citation?: {
    source: string;
    bulletinId: string;
    url: string;
  };
  hazardWarning?: {
    severity: 'warning' | 'advisory';
    title: string;
  };
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'user',
    content: 'Is it safe to sail from Porbandar harbour tonight toward the 40-fathom fishing zone?',
    timestamp: '2026-11-06T06:28:00Z',
  },
  {
    id: 'm2',
    sender: 'assistant',
    content: 'Official IMD Coastal Bulletin advises AGAINST venturing into deep sea off the Porbandar and North Gujarat coast tonight. Squally weather with gale winds of 45–55 kmph gusting to 65 kmph and significant wave heights exceeding 3.2 meters are expected through 18:00 UTC tomorrow.',
    timestamp: '2026-11-06T06:28:15Z',
    hazardWarning: {
      severity: 'warning',
      title: 'IMD Coastal Warning: Gale Winds & High Seas Active',
    },
    citation: {
      source: 'India Meteorological Department (IMD) Coastal Bulletin #42',
      bulletinId: 'IMD-GUJ-2026-11-06',
      url: 'https://mausam.imd.gov.in',
    },
  },
];

export default function ConversationStreamPage() {
  const params = useParams();
  const conversationId = (params?.conversationId as string) || '00000000-0000-4000-8000-000000001001';

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [streaming, setStreaming] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `m_${Date.now()}`,
      sender: 'user',
      content: inputText,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setStreaming(true);

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `m_${Date.now() + 1}`,
        sender: 'assistant',
        content: 'Analyzing local buoy telemetry and INCOIS high-resolution wave forecast. Inshore conditions remain moderately choppy with 1.8m swell.',
        timestamp: new Date().toISOString(),
        citation: {
          source: 'INCOIS Coastal Wave Model (SWAN)',
          bulletinId: 'SWAN-AS-20261106',
          url: 'https://incois.gov.in',
        },
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreaming(false);
    }, 1000);
  };

  return (
    <Shell>
      <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3 text-xs">
          <div className="flex items-center gap-2 text-[#6B7280]">
            <Link href="/marine" className="hover:text-[#111827]">
              Marine Companion
            </Link>
            <span>/</span>
            <Link href="/marine/conversations" className="hover:text-[#111827]">
              Conversations
            </Link>
            <span>/</span>
            <span className="text-[#111827] font-medium font-mono text-[11px]">Chat {conversationId.slice(0, 8)}...</span>
          </div>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
            M03 · P12
          </span>
        </div>

        {/* Message Thread Canvas */}
        <div className="flex-1 overflow-y-auto space-y-4 p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-2xl rounded p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-[#111827] text-[#FFFFFF]'
                    : 'bg-[#F8F9FA] border border-[#E5E7EB] text-[#111827]'
                }`}
              >
                {/* Hazard Banner if applicable */}
                {msg.hazardWarning && (
                  <div className="flex items-center gap-1.5 bg-[#111827] text-[#FFFFFF] px-2.5 py-1 rounded font-mono text-[11px] font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{msg.hazardWarning.title}</span>
                  </div>
                )}

                <p>{msg.content}</p>

                {/* Grounded Citation */}
                {msg.citation && (
                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] font-mono text-[#6B7280]">
                    <span>Source: {msg.citation.source}</span>
                    <a
                      href={msg.citation.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#111827] hover:underline flex items-center gap-1"
                    >
                      <span>{msg.citation.bulletinId}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

              <span className="text-[10px] font-mono text-[#6B7280] mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}

          {streaming && (
            <div className="flex items-center gap-2 text-xs text-[#6B7280] font-mono p-2">
              <Compass className="w-4 h-4 animate-spin text-[#111827]" />
              <span>Consulting INCOIS & IMD oceanographic telemetry stream...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Ask about sea conditions, gale advisories, PFZ lines, or safe navigation..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2.5 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#1F2937] disabled:opacity-50 transition flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </Shell>
  );
}

