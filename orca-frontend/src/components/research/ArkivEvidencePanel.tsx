/**
 * ArkivEvidencePanel — Confirmed On-Chain Public Reference & Receipt Panel
 * 
 * Sourced directly from ORCA Frontend Handoff §13:
 * - Real confirmed publication on Arkiv Rabdi testnet (Chain ID 7794095)
 * - Copy buttons for entity key, transaction hash, owner, and result digest
 * - Direct link to Rabdi Block Explorer
 * - Clear display of 7-day lifetime and expiry block 594444
 * - Explicit boundary disclaimer regarding wallet-owned reference vs scientific validation
 */

'use client';

import React, { useState } from 'react';
import { ExternalLink, Copy, Check, ShieldCheck, AlertCircle, Clock, Link2 } from 'lucide-react';

interface ArkivEvidencePanelProps {
  resultDigest?: string;
}

export function ArkivEvidencePanel({ resultDigest }: ArkivEvidencePanelProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const publication = {
    network: 'Rabdi Testnet',
    chainId: 7794095,
    entityKey: '0x220085ad817f225f59eb5fe21d14fcf57fe8942c3aea3aacffa4bd43fb798bcf',
    txHash: '0x990fe04c31c81d743d79a32e633d0020781be09c5ef82ab50c71881fb976e23d',
    owner: '0x8cBFE2bD01C7FDfc500e62A1cF99A01B6A11bCBe',
    resultDigest: resultDigest || 'sha256:5c7b69bd47950e4936e80e733d75f5d21d16bf971ce1e8e6578ccc4d1b679e79',
    expiryBlock: 594444,
    lifetime: '7-day requested lifetime',
    explorerUrl: 'https://rabdi.explorer.arkiv.network/tx/0x990fe04c31c81d743d79a32e633d0020781be09c5ef82ab50c71881fb976e23d',
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden space-y-0">
      {/* Header */}
      <div className="px-4 py-3 bg-[#F8F9FA] border-b border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#111827]" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#111827]">
            Arkiv Merkle Reference & On-Chain Receipt
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E5E7EB] text-[#111827]">
            Confirmed Publication · Read-Back Verified
          </span>
          <a
            href={publication.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-[#111827] bg-[#111827] text-[#FFFFFF] hover:bg-[#374151] transition"
          >
            <span>Rabdi Explorer</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Grid of parameters */}
      <div className="p-4 space-y-3.5 text-xs">
        {/* Network & Expiry */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB]">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase block">Settlement Chain</span>
            <span className="font-semibold text-[#111827]">{publication.network} (ID: {publication.chainId})</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB]">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase block">Entity Expiry Block</span>
            <span className="font-mono font-semibold text-[#111827]">{publication.expiryBlock.toLocaleString()} ({publication.lifetime})</span>
          </div>

          <div className="p-2.5 bg-[#F8F9FA] rounded border border-[#E5E7EB]">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase block">Publication Mode</span>
            <span className="font-semibold text-[#111827]">Dedicated Backend Demo Signer</span>
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#4B5563]">
            <span className="font-mono text-[10px] uppercase font-semibold">Transaction Hash</span>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => copyToClipboard(publication.txHash, 'tx')}
              className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
            >
              {copiedField === 'tx' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copiedField === 'tx' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-[11px] break-all select-all text-[#111827]">
            {publication.txHash}
          </div>
        </div>

        {/* Entity Key */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#4B5563]">
            <span className="font-mono text-[10px] uppercase font-semibold">Arkiv Entity Key</span>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => copyToClipboard(publication.entityKey, 'entity')}
              className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
            >
              {copiedField === 'entity' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copiedField === 'entity' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-[11px] break-all select-all text-[#111827]">
            {publication.entityKey}
          </div>
        </div>

        {/* Result Digest */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#4B5563]">
            <span className="font-mono text-[10px] uppercase font-semibold">Result Digest (SHA-256)</span>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => copyToClipboard(publication.resultDigest, 'digest')}
              className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
            >
              {copiedField === 'digest' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copiedField === 'digest' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-[11px] break-all select-all text-[#111827]">
            {publication.resultDigest}
          </div>
        </div>

        {/* Dedicated Signer Address */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[#4B5563]">
            <span className="font-mono text-[10px] uppercase font-semibold">Signer / Wallet Owner</span>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => copyToClipboard(publication.owner, 'owner')}
              className="inline-flex items-center gap-1 text-[11px] text-[#111827] hover:underline"
            >
              {copiedField === 'owner' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copiedField === 'owner' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded font-mono text-[11px] break-all select-all text-[#111827]">
            {publication.owner}
          </div>
        </div>

        {/* Explicit Boundary Disclaimer per §13 */}
        <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-[11px] text-[#4B5563] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[#111827]">
            <AlertCircle className="w-3.5 h-3.5 text-[#111827]" />
            <span>Verification & Lifetime Limitations (handoff §13)</span>
          </div>
          <div>
            This on-chain record proves a wallet-owned public reference was recorded on Rabdi. It does <strong>not</strong> prove institutional identity, ENS authority, scientific correctness, independent peer review or causality. Private source datasets and full private results were never published on-chain. Entities expire after 7 days (block 594444).
          </div>
        </div>
      </div>
    </div>
  );
}

