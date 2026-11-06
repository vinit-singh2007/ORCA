/**
 * ORCA — Public Landing Page (On-Screen / Viewport-Locked)
 *
 * Single-viewport landing page with custom ocean background and transparent navbar.
 * Features auto-rotating circular floating cards that glide right-to-left every 2 seconds.
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Waves,
  Network,
  ArrowRight,
  GitBranch,
  Lock,
  BookOpen,
  ShieldCheck,
  Compass,
} from 'lucide-react';

const METRIC_CARDS = [
  {
    id: 'marine-streams',
    label: 'Marine Data Streams',
    value: '14 APIs',
    desc: 'Real-time IMD & INCOIS feeds',
    icon: Waves,
  },
  {
    id: 'on-chain-proof',
    label: 'On-Chain Verification',
    value: 'Ethereum',
    desc: 'Arkiv Merkle provenance proofs',
    icon: Lock,
  },
  {
    id: 'a2a-network',
    label: 'Agent Coordination',
    value: 'A2A Protocol',
    desc: 'Decentralized scientific agents',
    icon: Network,
  },
  {
    id: 'workspaces',
    label: 'Research Modules',
    value: '4 Workspaces',
    desc: 'Institution, Network, Marine & Ops',
    icon: BookOpen,
  },
  {
    id: 'coastal-hazards',
    label: 'Hazard Advisories',
    value: 'Live Feeds',
    desc: 'Official cyclone & sea state alerts',
    icon: ShieldCheck,
  },
  {
    id: 'ocean-obs',
    label: 'Environmental Sensor',
    value: 'SST & Wave Hs',
    desc: 'Sea temp & wave swell dynamics',
    icon: Compass,
  },
];

export default function LandingPage() {
  const [cards, setCards] = useState(METRIC_CARDS);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCircularIndex, setActiveCircularIndex] = useState(0);

  // Auto-move cards from right to left every 2 seconds in a circular format
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIsAnimating(true);

      // Advance circular indicator index
      setActiveCircularIndex((prev) => (prev + 1) % METRIC_CARDS.length);

      // After 500ms slide animation completes, rotate the array and reset position seamlessly
      setTimeout(() => {
        setCards((prev) => {
          const [first, ...rest] = prev;
          return [...rest, first];
        });
        setIsAnimating(false);
      }, 500);
    }, 2000); // 2-second interval gap requested

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div
      className="relative min-h-screen lg:h-screen lg:overflow-hidden flex flex-col justify-between text-[#111827] font-sans antialiased bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/landing-bg.jpg')" }}
    >

      {/* ── TOP NAV (TRANSPARENT) ─────────────────────────────────────── */}
      <header className="shrink-0 bg-transparent border-b border-transparent">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Waves className="w-8 h-8 lg:w-9 lg:h-9 text-[#111827] stroke-[2.5]" />
            <span className="font-black text-2xl sm:text-3xl lg:text-3xl tracking-tight text-[#111827]">
              ORCA
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/vinit-singh2007/ORCA"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-2 text-base font-semibold text-[#374151] hover:text-[#111827] transition"
            >
              <GitBranch className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-sm sm:text-base font-bold rounded-xl transition shadow-sm hover:shadow-md"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO & CIRCULAR MOVING CARDS ─────────────────────────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-13 pb-3 lg:pb-10 flex flex-col justify-between">
        <div className="max-w-2xl space-y-5 pt-8 lg:pt-16">
          <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-[#111827] leading-[1.1]">
            Verifiable Ocean Research,{' '}
            <span className="relative">
              <span className="relative z-10">On-Chain.</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-sky-200/50 -z-10 rounded" />
            </span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-[#374151] leading-relaxed max-w-2xl font-normal">
            ORCA is an open platform for reproducible oceanographic science — combining
            real-time marine data, decentralized agent coordination, and immutable
            provenance tracking on Ethereum.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#111827] hover:bg-[#1F2937] text-[#FFFFFF] text-base font-semibold rounded-lg shadow-sm transition"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/vinit-singh2007/ORCA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 border border-[#D1D5DB] bg-[#FFFFFF]/80 hover:bg-[#FFFFFF] text-[#111827] text-base font-semibold rounded-lg transition shadow-xs"
            >
              <GitBranch className="w-4 h-4" />
              <span>View on GitHub</span>
            </a>
          </div>
        </div>

        {/* ── CIRCULAR MOVING FLOATING CARDS ───────────────────────────── */}
        <div
          className="mt-auto mb-1 lg:mb-1.5"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Elevated Floating Container with Frosted Glass Backdrop */}
          <div className="bg-[#FFFFFF]/90 backdrop-blur-md rounded-2xl border border-[#E5E7EB]/80 shadow-[0_16px_50px_rgba(0,0,0,0.08)] hover:shadow-[0_22px_60px_rgba(0,0,0,0.12)] transition-all duration-300 overflow-hidden p-2">
            <div
              className={`flex transition-transform ${isAnimating
                ? '-translate-x-full md:-translate-x-1/2 lg:-translate-x-1/4 duration-500 ease-in-out'
                : 'translate-x-0 duration-0'
                }`}
            >
              {cards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div
                    key={`${card.id}-${idx}`}
                    className="w-full md:w-1/2 lg:w-1/4 shrink-0 px-2"
                  >
                    <div className="h-full p-4 lg:p-5 rounded-xl border border-transparent hover:border-[#E5E7EB] hover:bg-[#FFFFFF]/95 transition flex flex-col justify-between gap-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono uppercase tracking-wide text-[#6B7280] truncate">
                          {card.label}
                        </span>
                        <div className="p-1.5 rounded-lg bg-[#F3F4F6] text-[#111827] shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </div>

                      <div>
                        <div className="text-xl lg:text-2xl font-bold text-[#111827] tracking-tight">
                          {card.value}
                        </div>
                        <div className="text-xs text-[#6B7280] mt-0.5 truncate">
                          {card.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Circular indicators on the left lower */}
          <div className="flex items-center gap-1.5 pt-2 px-2">
            {METRIC_CARDS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeCircularIndex
                  ? 'w-5 bg-[#111827]'
                  : 'w-1.5 bg-[#CBD5E1]'
                  }`}
              />
            ))}
          </div>
        </div>
      </main>

    </div>
  );
}
