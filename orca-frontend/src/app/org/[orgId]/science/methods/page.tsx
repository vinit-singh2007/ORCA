/**
 * ORCA 3.0 — D08 Scientific Method Registry Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen D08 (Scientific method registry)
 * - UI URL: /org/[orgId]/science/methods
 * - Primary personas: Researcher, Scientific reviewer, PI
 * - Highest referenced API gate: P04 (Scientific computation engine)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.5: GET /v1/science/methods (catalog of registered methods)
 * - api design.md §3.5: GET /v1/science/methods/{id} (method schema & validation rules)
 * 
 * TRUTH BOUNDARY & VISUAL TOKENS:
 * - Strict monochrome white/neutral tokens (dashboard design.md §2: #FFFFFF, #E5E7EB, #111827)
 * - Explicit code digest (sha256) and mathematical definition formulas
 * - Strict gate tagging (P04, P06)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataMethodsNav } from '@/components/navigation/DataMethodsNav';
import { apiClient } from '@/lib/api-client';
import {
  Binary,
  Code,
  ShieldCheck,
  Search,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Cpu,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface ScientificMethod {
  id: string;
  name: string;
  version: string;
  category: string;
  description: string;
  formula: string;
  inputVariables: string[];
  outputVariable: string;
  codeDigest: string;
  verificationGate: string;
}

export default function ScientificMethodsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [methods, setMethods] = useState<ScientificMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<ScientificMethod | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadMethods() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.listMethods();
        if (mounted) {
          const rawList = res?.items || [];
          const mapped: ScientificMethod[] = rawList.map((m: any) => ({
            id: m.id,
            name: m.name,
            version: m.version,
            category: m.category,
            description: m.description,
            formula: m.formula,
            inputVariables: m.input_variables || [],
            outputVariable: m.output_variable,
            codeDigest: m.code_digest,
            verificationGate: m.verification_gate || 'P04',
          }));
          setMethods(mapped);
          if (mapped.length > 0) {
            setSelectedMethod(mapped[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load scientific methods', err);
        if (mounted) setError('Unable to load registered scientific methods from computation engine.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMethods();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredMethods = methods.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="space-y-6 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <Link href={`/org/${orgId}/data/products`} className="hover:text-[#111827]">
            Data & Methods
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Method Registry</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">Scientific Method Registry</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                D08 · P04
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Peer-reviewed algorithms, mathematical formulations, and containerized executable packages with audited digests.
            </p>
          </div>

          <Link
            href={`/org/${orgId}/science/recipes`}
            className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#111827] flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Recipe Templates</span>
          </Link>
        </div>

        {/* In-Page Secondary Navigation Tabs (§5.5) */}
        <DataMethodsNav orgId={orgId} />

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
          <input suppressHydrationWarning
            type="text"
            placeholder="Search methods by algorithm ID, formula, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
          />
        </div>

        {loading ? (
          <div className="p-12 text-center border border-[#E5E7EB] rounded bg-[#FFFFFF]">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#6B7280]" />
            <p className="text-xs text-[#6B7280] mt-2">Loading verified scientific methods...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : methods.length === 0 ? (
          <EmptyState
            mode="true_empty"
            title="No Registered Methods Found"
            description="The computation engine has not registered any algorithmic models for this organization yet."
          />
        ) : (
          /* 2-Column: Method List on Left, Detail on Right */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Method List */}
            <div className="lg:col-span-2 border border-[#E5E7EB] rounded bg-[#FFFFFF] divide-y divide-[#E5E7EB]">
              {filteredMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`p-4 cursor-pointer transition ${
                    selectedMethod?.id === method.id
                      ? 'bg-[#F8F9FA] border-l-2 border-l-[#111827]'
                      : 'hover:bg-[#F3F4F6]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-semibold text-[#111827]">{method.name}</h3>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#FFFFFF] border border-[#E5E7EB] text-[#4B5563]">
                          v{method.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#4B5563] mt-1 line-clamp-2">
                        {method.description}
                      </p>
                    </div>
                    <Badge variant="outline">{method.verificationGate}</Badge>
                  </div>

                  <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[#6B7280]">
                    <span>ID: {method.id}</span>
                    <span>·</span>
                    <span className="capitalize">{method.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Method Detail Panel */}
            <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-5 space-y-4">
              {selectedMethod ? (
                <div className="space-y-4 text-xs font-mono">
                  <div className="border-b border-[#E5E7EB] pb-3 font-sans">
                    <span className="text-xs font-mono text-[#6B7280]">{selectedMethod.id}</span>
                    <h2 className="text-base font-semibold text-[#111827] mt-0.5">{selectedMethod.name}</h2>
                  </div>

                  {/* Mathematical Formulation */}
                  <div>
                    <span className="text-[#6B7280] block text-[11px] font-mono uppercase mb-1">
                      Mathematical Formulation
                    </span>
                    <div className="p-3 bg-[#F8F9FA] border border-[#E5E7EB] rounded text-xs text-[#111827] overflow-x-auto">
                      <code>{selectedMethod.formula}</code>
                    </div>
                  </div>

                  {/* Input Variables */}
                  <div>
                    <span className="text-[#6B7280] block text-[11px] font-mono uppercase mb-1">
                      Required Input Variables
                    </span>
                    <ul className="space-y-1">
                      {selectedMethod.inputVariables.map((v) => (
                        <li key={v} className="flex items-center gap-1.5 text-[11px] text-[#4B5563]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Output Variable */}
                  <div>
                    <span className="text-[#6B7280] block text-[11px] font-mono uppercase mb-1">
                      Output Variable
                    </span>
                    <div className="text-[11px] font-mono bg-[#FFFFFF] border border-[#E5E7EB] px-2 py-1 rounded text-[#111827] font-medium">
                      {selectedMethod.outputVariable}
                    </div>
                  </div>

                  {/* Code Digest */}
                  <div>
                    <span className="text-[#6B7280] block text-[11px] font-mono uppercase mb-1">
                      Container Code Digest
                    </span>
                    <div className="p-2 bg-[#F8F9FA] border border-[#E5E7EB] rounded font-mono text-[10px] text-[#4B5563] break-all">
                      {selectedMethod.codeDigest}
                    </div>
                  </div>

                  {/* Verification Boundary */}
                  <div className="pt-2 border-t border-[#E5E7EB] text-[11px] text-[#4B5563] space-y-1">
                    <div className="flex items-center gap-1.5 text-[#111827] font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Deterministic Execution Guarantee</span>
                    </div>
                    <p>
                      All outputs are reproducible bit-for-bit given the same input snapshot digests and configuration parameters.
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyState
                  mode="true_empty"
                  title="Select a method"
                  description="Choose an algorithm from the list to review its mathematical definition."
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}

