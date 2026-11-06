/**
 * ORCA 3.0 — D01 Provider Catalogue Screen
 * 
 * DESIGN SPECIFICATION:
 * - dashboard design.md §5.3 Screen D01 (Provider catalogue)
 * - UI URL: /org/[orgId]/data/providers
 * - Primary personas: Data steward, researcher, PI
 * - Highest referenced API gate: P03 (Data catalog & source ingestion)
 * 
 * CONTRACT REFERENCES:
 * - api design.md §3.4: GET /v1/catalog/providers (list verified external source providers)
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - Strict monochrome neutral styling (#FFFFFF, #E5E7EB, #111827)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Shell } from '@/components/layout/Shell';
import { Badge } from '@/components/ui/Badge';
import { StatusPill } from '@/components/ui/StatusPill';
import { DataMethodsNav } from '@/components/navigation/DataMethodsNav';
import { SourceProvider } from '@/types/api';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { Globe, Database, Server, ExternalLink, CheckCircle2, ShieldCheck, Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ProviderCataloguePage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [providers, setProviders] = useState<SourceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');

  const fetchProviders = () => {
    setLoading(true);
    setError(null);

    apiClient
      .listProviders({
        source_class: filterClass === 'all' ? undefined : filterClass,
      })
      .then((res) => {
        if (res?.items) {
          setProviders(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to fetch providers from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProviders();
  }, [filterClass]);

  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (provider.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <Shell>
      <div className="space-y-6 max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Data Providers</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E5E7EB] pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-[#111827]">External Source Providers</h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E7EB] bg-[#F8F9FA] text-[#4B5563]">
                D01 · P03
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-1">
              Registered oceanographic institutes, satellite operators, and reanalysis data providers ingested into ORCA.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProviders}
              className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
              title="Refresh Providers"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link
              href={`/org/${orgId}/data/products`}
              className="px-3 py-1.5 text-xs font-medium border border-[#E5E7EB] rounded bg-[#FFFFFF] hover:bg-[#F3F4F6] text-[#111827] flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Browse Products</span>
            </Link>
          </div>
        </div>

        {/* In-Page Secondary Navigation Tabs (§5.5) */}
        <DataMethodsNav orgId={orgId} />

        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Provider Gateway Notice: {error}</span>
            </div>
            <button
              onClick={fetchProviders}
              className="px-2 py-0.5 border border-[#111827] rounded text-xs hover:bg-[#111827] hover:text-[#FFFFFF]"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search & Class Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search providers by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#6B7280]" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="text-xs border border-[#E5E7EB] rounded px-3 py-2 bg-[#FFFFFF] text-[#111827] focus:outline-none focus:border-[#111827]"
            >
              <option value="all">All Source Classes</option>
              <option value="government_oceanographic">Government Oceanographic</option>
              <option value="meteorological">Meteorological Agency</option>
              <option value="academic">Academic Consortium</option>
              <option value="satellite_operator">Satellite Operator</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading data providers from API (GET /v1/catalog/providers)...
          </div>
        )}

        {/* Provider Cards Grid */}
        {!loading && filteredProviders.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280]">
            No source providers found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProviders.map((provider) => (
              <div
                key={provider.id}
                className="border border-[#E5E7EB] rounded p-5 bg-[#FFFFFF] hover:border-[#111827] transition space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-[#111827]">{provider.name}</h2>
                    <span className="text-[11px] font-mono text-[#6B7280] block">
                      Slug: {provider.slug}
                    </span>
                  </div>
                  <Badge variant="outline">{provider.source_class.replace(/_/g, ' ')}</Badge>
                </div>

                <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-2">
                  {provider.description || 'Verified observational ocean data provider connected via ERDDAP.'}
                </p>

                <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="capitalize">{provider.status}</span>
                  </div>

                  {provider.homepage_url && (
                    <a
                      href={provider.homepage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#111827] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Homepage</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
