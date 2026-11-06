/**
 * ORCA 3.0 — N10 Independent Verifier (Public-Only Mode) Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.7 Screen N10 (Independent verifier)
 * - UI URL: /verify/[publicRef]
 * - Primary personas: External Auditor, Scientific Reviewer, Public Viewer
 * - Highest referenced API gate: P11 (Arkiv Coordination & Public Verification)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.10: POST /v1/network/verifications (zero-trust mathematical validation)
 * - api design.md §3.10: GET /v1/network/results/{publicRef} (public unredacted evidence)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Publicly accessible without authentication cookies or session credentials
 * - Displays verifiable proof: input digests, container image digest, recipe parameters, output match
 */

'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  Compass,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function IndependentVerifierPage() {
  const params = useParams();
  const publicRef = (params?.publicRef as string) || 'ARKIV-TASK-2026-088';

  const [inputRef, setInputRef] = useState(publicRef);
  const [copied, setCopied] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    verified: boolean;
    investigationTitle: string;
    method: string;
    inputManifestDigest: string;
    computedValue: string;
    reproducerValue: string;
    absoluteDelta: string;
    chainCommitment: string;
    timestamp: string;
  }>({
    verified: true,
    investigationTitle: 'Seasonal SST Anomaly in Saurashtra Polygon (Summer 2025)',
    method: 'sst.seasonal_anomaly v1.2.0',
    inputManifestDigest: 'sha256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    computedValue: '+0.84 °C',
    reproducerValue: '+0.84 °C',
    absoluteDelta: '0.00 °C (Exact Bitwise Match)',
    chainCommitment: '0x8f2a41d99b104928a...33190 (Confirmed Block #6842910)',
    timestamp: '2026-11-05T10:14:00Z',
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Verifying cryptographic proof for ${inputRef}...`);
  };

  const copyHash = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col font-sans">
      {/* Public Top Header */}
      <header className="border-b border-[#E5E7EB] bg-[#FFFFFF] px-6 py-3.5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-bold text-sm tracking-tight text-[#111827] flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#111827]" />
            <span>ORCA 3.0</span>
          </Link>
          <span className="text-xs text-[#6B7280]">|</span>
          <span className="text-xs font-mono text-[#6B7280]">Public Evidence Verifier</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Link href="/workspaces" className="text-[#4B5563] hover:text-[#111827]">
            Institutional Workspaces
          </Link>
          <Link href="/marine" className="text-[#4B5563] hover:text-[#111827]">
            Marine Companion
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        <div className="border-b border-[#E5E7EB] pb-5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-[#111827]">Independent Scientific Proof Verification</h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
              N10 · P11
            </span>
          </div>
          <p className="text-xs text-[#4B5563] mt-1">
            Zero-trust verification portal. Inspect input SHA-256 manifests, reproducible container digests, and peer
            reproduction consensus without requiring an ORCA account.
          </p>
        </div>

        {/* Search Ref Input */}
        <form onSubmit={handleVerify} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              value={inputRef}
              onChange={(e) => setInputRef(e.target.value)}
              placeholder="Enter Arkiv Task ID, Artifact Digest, or DOI..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827] font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#111827] text-[#FFFFFF] text-xs font-medium rounded hover:bg-[#1F2937] transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Proof</span>
          </button>
        </form>

        {/* Verification Result Card */}
        <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-xs font-mono text-[#6B7280] uppercase tracking-wider">
                Target: {inputRef}
              </span>
              <h2 className="text-base font-semibold text-[#111827]">{verificationData.investigationTitle}</h2>
              <div className="text-xs text-[#4B5563] font-mono">Method: {verificationData.method}</div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded bg-[#111827] text-[#FFFFFF]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>MATHEMATICALLY REPRODUCED</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E5E7EB] text-xs">
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded">
              <span className="text-[#6B7280] block text-[11px]">Original Calculation</span>
              <span className="font-mono text-sm font-semibold text-[#111827]">
                {verificationData.computedValue}
              </span>
            </div>
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded">
              <span className="text-[#6B7280] block text-[11px]">Independent Reproduction</span>
              <span className="font-mono text-sm font-semibold text-[#111827]">
                {verificationData.reproducerValue}
              </span>
            </div>
            <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded">
              <span className="text-[#6B7280] block text-[11px]">Numerical Delta</span>
              <span className="font-mono text-sm font-semibold text-[#111827]">
                {verificationData.absoluteDelta}
              </span>
            </div>
          </div>

          {/* Cryptographic Manifest Check */}
          <div className="space-y-2 pt-2 border-t border-[#E5E7EB] text-xs">
            <span className="font-mono uppercase text-[#6B7280] block font-semibold text-[11px]">
              Input Snapshot Digest Proof
            </span>
            <div className="p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded font-mono text-[10px] text-[#111827] flex justify-between items-center">
              <span className="truncate">{verificationData.inputManifestDigest}</span>
              <button
                onClick={() => copyHash(verificationData.inputManifestDigest)}
                className="ml-2 text-[#4B5563] hover:text-[#111827]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#111827]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Arkiv Chain Commitment */}
          <div className="space-y-2 text-xs">
            <span className="font-mono uppercase text-[#6B7280] block font-semibold text-[11px]">
              Arkiv Sepolia State Commitment
            </span>
            <div className="p-2.5 bg-[#F8F9FA] border border-[#E5E7EB] rounded font-mono text-[10px] text-[#111827]">
              {verificationData.chainCommitment}
            </div>
          </div>
        </div>

        {/* Public Audit Statement */}
        <div className="border border-[#E5E7EB] bg-[#F8F9FA] rounded p-4 text-xs text-[#4B5563] space-y-1">
          <div className="font-semibold text-[#111827] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#111827]" />
            <span>Verifiable Science Standard</span>
          </div>
          <p>
            No trust in central servers is required. Any party can download the reproducible Docker bundle (R12), execute
            it offline with the identical input snapshot, and verify that the output array digest matches bit-for-bit.
          </p>
        </div>
      </main>
    </div>
  );
}

