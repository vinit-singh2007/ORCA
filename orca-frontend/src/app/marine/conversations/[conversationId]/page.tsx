/**
 * ORCA 3.0 — M03 Marine Conversation Stream Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M03 (Conversation stream)
 * - UI URL: /marine/conversations/[conversationId]
 * - Primary personas: Fisher, Field Agent, Coast Guard Operator
 * - Highest referenced API gate: P12 (Marine Companion & Hazards)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.13: GET /v1/marine/conversations/{id} (conversation history)
 * - api design.md §3.13: POST /v1/marine/conversations/{id}/messages (send message)
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
import {
  MessageSquare,
  Send,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  ShieldAlert,
  Compass,
  RefreshCw,
} from 'lucide-react';

export default function ConversationStreamPage() {
  const params = useParams();
  const conversationId = (params?.conversationId as string) || '';

  const [conversation, setConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = async () => {
    if (!conversationId) return;
    setLoading(true);
    setError(null);
    try {
      const conv = await apiClient.getConversation(conversationId);
      setConversation(conv);
      setMessages(conv.messages || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    const userMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: inputText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const sentText = inputText;
    setInputText('');
    setSending(true);

    try {
      const reply = await apiClient.sendMessage(conversationId, {
        content: sentText,
      });
      setMessages((prev) => [...prev, reply]);
    } catch (err: unknown) {
      alert(`Message error: ${err instanceof Error ? err.message : 'API call failed'}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-4 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine
          </Link>
          <span>/</span>
          <Link href="/marine/conversations" className="hover:text-[#111827]">
            Conversations
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium font-mono text-[11px]">
            {conversationId ? conversationId.slice(0, 8) : 'Thread'}...
          </span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-[#111827]">
              {conversation?.title || 'Marine Inquiry Stream'}
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              M03 · P12
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadConversation}
              disabled={loading}
              className="p-1 border border-[#E5E7EB] rounded hover:border-[#111827] text-[#111827]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/marine/alerts"
              className="px-2.5 py-1 text-xs border border-[#E5E7EB] rounded text-[#111827] hover:bg-[#F8F9FA]"
            >
              Official Advisories
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="border border-[#E5E7EB] rounded p-6 bg-[#FFFFFF] animate-pulse space-y-3">
            <div className="h-4 w-48 bg-[#E5E7EB] rounded" />
            <div className="h-40 bg-[#F8F9FA] rounded" />
          </div>
        )}

        {error && (
          <div className="p-4 border border-[#E5E7EB] rounded bg-[#FFFFFF] space-y-2">
            <div className="flex items-center gap-2 text-[#DC2626] text-xs font-semibold">
              <AlertCircle className="w-4 h-4" />
              Conversation Load Error
            </div>
            <p className="text-xs text-[#4B5563] font-mono">{error}</p>
          </div>
        )}

        {/* Message Stream */}
        {!loading && (
          <div className="border border-[#E5E7EB] rounded p-4 bg-[#FFFFFF] space-y-4 min-h-[360px] max-h-[520px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#6B7280]">
                No messages yet. Ask a question regarding coastal sea state or fishing zones below.
              </div>
            ) : (
              messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div
                      className={`max-w-xl p-3 rounded text-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#111827] text-[#FFFFFF]'
                          : 'bg-[#F8F9FA] text-[#111827] border border-[#E5E7EB]'
                      }`}
                    >
                      <p>{m.content}</p>
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-mono px-1">
                      {m.sender_name || (isUser ? 'Operator' : 'ORCA Assistant')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Inquire about sea state, wind conditions, or hazard bulletins..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={sending}
            className="flex-1 px-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] focus:outline-none focus:border-[#111827]"
          />
          <button
            type="submit"
            disabled={sending || !inputText.trim()}
            className="px-4 py-2 bg-[#111827] text-[#FFFFFF] rounded text-xs font-medium hover:bg-[#1F2937] transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sending ? 'Sending...' : 'Send'}</span>
          </button>
        </form>
      </div>
    </Shell>
  );
}
