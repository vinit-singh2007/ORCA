/**
 * ORCA 3.0 — M08 Alert Subscriptions & Notification Inbox Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.8 Screen M08 (Alert subscriptions and notification inbox)
 * - UI URL: /marine/alerts
 * - Primary personas: Fisherman, Coastal Resident, Disaster Management Liaison
 * - Highest referenced API gate: P12 (Marine Companion & Conversational Intelligence)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.12: GET /v1/alerts/subscriptions (list registered hazard alert channels)
 * - api design.md §3.12: POST /v1/alerts/subscriptions (register new SMS/voice/push subscription)
 * - api design.md §3.12: GET /v1/alerts/notifications (delivered warning inbox)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Multi-lingual delivery preference (Gujarati, Hindi, English)
 * - Official siren / warning verification
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import {
  Bell,
  Smartphone,
  PhoneCall,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface AlertSubscription {
  id: string;
  hazardType: string;
  region: string;
  channel: 'sms' | 'voice_call' | 'web_push';
  language: string;
  status: 'active' | 'paused';
}

const INITIAL_SUBSCRIPTIONS: AlertSubscription[] = [
  {
    id: 'sub-01',
    hazardType: 'Gale Wind & Cyclone Advisories',
    region: 'North Gujarat & Saurashtra Coast',
    channel: 'sms',
    language: 'Gujarati (ગુજરાતી)',
    status: 'active',
  },
  {
    id: 'sub-02',
    hazardType: 'High Wave & Swell Surge (>3.0m)',
    region: 'South Gujarat & Konkan',
    channel: 'voice_call',
    language: 'Hindi (हिन्दी)',
    status: 'active',
  },
];

export default function AlertSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>(INITIAL_SUBSCRIPTIONS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHazard, setNewHazard] = useState('Gale Wind & Cyclone Advisories');
  const [newChannel, setNewChannel] = useState<'sms' | 'voice_call' | 'web_push'>('sms');
  const [newLang, setNewLang] = useState('Gujarati (ગુજરાતી)');

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub: AlertSubscription = {
      id: `sub-${Date.now()}`,
      hazardType: newHazard,
      region: 'Saurashtra Coastal Sector',
      channel: newChannel,
      language: newLang,
      status: 'active',
    };
    setSubscriptions([...subscriptions, newSub]);
    setShowAddModal(false);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href="/marine" className="hover:text-[#111827]">
            Marine Companion
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Alert Subscriptions</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Emergency Hazard Subscriptions & Alerts</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                M08 · P12
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Configure automated SMS, automated voice telephone sirens, and web push notifications for official marine emergencies.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 text-xs font-medium rounded bg-[#111827] text-[#FFFFFF] hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Alert Channel</span>
          </button>
        </div>

        {/* Active Subscriptions List */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] divide-y divide-[#E5E7EB]">
          <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex justify-between items-center text-xs">
            <span className="font-semibold text-[#111827]">Configured Delivery Channels</span>
            <span className="font-mono text-[#6B7280] text-[11px]">{subscriptions.length} active</span>
          </div>

          {subscriptions.map((sub) => (
            <div key={sub.id} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#111827]">{sub.hazardType}</span>
                  <Badge variant="success">ACTIVE</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                  <span>Region: {sub.region}</span>
                  <span>·</span>
                  <span className="capitalize font-mono">Channel: {sub.channel.replace('_', ' ')}</span>
                  <span>·</span>
                  <span>Language: {sub.language}</span>
                </div>
              </div>

              <button
                onClick={() => setSubscriptions(subscriptions.filter((s) => s.id !== sub.id))}
                className="text-[#6B7280] hover:text-[#111827] p-1.5"
                title="Unsubscribe"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Modal for adding subscription */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[#000000] bg-opacity-30 z-50 flex items-center justify-center p-4">
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-lg max-w-md w-full p-5 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                <h3 className="text-sm font-semibold text-[#111827]">Add Hazard Alert Subscription</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs text-[#6B7280] hover:text-[#111827]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubscription} className="space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] block mb-1">
                    Emergency Hazard Trigger
                  </label>
                  <select
                    value={newHazard}
                    onChange={(e) => setNewHazard(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
                  >
                    <option value="Gale Wind & Cyclone Advisories">Gale Wind & Cyclone Advisories (IMD)</option>
                    <option value="High Wave &amp; Swell Surge (&gt;3.0m)">High Wave &amp; Swell Surge (&gt;3.0m) (INCOIS)</option>
                    <option value="Tsunami & Seismic Marine Disturbance">Tsunami Warning & Seismic Disturbance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] block mb-1">
                    Notification Channel
                  </label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
                  >
                    <option value="sms">SMS Text Message</option>
                    <option value="voice_call">Automated Voice Call (Interactive Siren)</option>
                    <option value="web_push">Browser Web Push Notification</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#4B5563] block mb-1">
                    Language Preference
                  </label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
                  >
                    <option value="Gujarati (ગુજરાતી)">Gujarati (ગુજરાતી)</option>
                    <option value="Hindi (हिन्दी)">Hindi (हिन्दी)</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E7EB]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 border border-[#E5E7EB] rounded text-[#4B5563] hover:bg-[#F3F4F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#111827] text-[#FFFFFF] rounded hover:bg-[#1F2937]"
                  >
                    Save Subscription
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
