/**
 * Screen D02 — Marine Product Catalogue
 * 
 * DESIGN SPECIFICATION:
 * - ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §4.1 & §5.5
 * - dashboard design.md §5.3 (Screen D02)
 * - UI URL: /org/[orgId]/data/products
 * - Highest API Gate Referenced: P03 (ERDDAP & Satellite Ingestion)
 * - Canonical API: GET /v1/catalog/products (api design.md §3.4)
 * 
 * TRUTH BOUNDARY:
 * - Direct backend API integration via apiClient
 * - Removed mock data imports
 * - In-page Data & Methods secondary navigation bar
 */

'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { DataMethodsNav } from '@/components/navigation/DataMethodsNav';
import { Badge } from '@/components/ui/Badge';
import { Database, Search, Filter, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { apiClient, OrcaApiError } from '@/lib/api-client';
import { ScientificProduct } from '@/types/api';

export default function MarineProductsPage() {
  const params = useParams();
  const orgId = (params?.orgId as string) || '';

  const [products, setProducts] = useState<ScientificProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');

  const fetchProducts = () => {
    setLoading(true);
    setError(null);

    apiClient
      .listProducts({
        kind: kindFilter === 'all' ? undefined : kindFilter,
      })
      .then((res) => {
        if (res?.items) {
          setProducts(res.items);
        }
        setLoading(false);
      })
      .catch((err) => {
        const apiErr = err as OrcaApiError;
        setError(apiErr.problem?.detail || 'Failed to fetch marine products from backend');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [kindFilter]);

  const filtered = products.filter((prod) => {
    if (search && !prod.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <Shell>
      <div className="space-y-5 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <Link href={`/org/${orgId}/overview`} className="hover:text-[#111827]">
            Institution
          </Link>
          <span>/</span>
          <span className="text-[#111827] font-medium">Data & Methods</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[#111827]">
                Data & Methods
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F8F9FA] border border-[#E5E7EB] text-[#4B5563]">
                D02 · P03 Contract
              </span>
            </div>
            <p className="text-xs text-[#4B5563] mt-0.5">
              Verified oceanographic datasets, external providers, immutable snapshots, and computational methods.
            </p>
          </div>

          <button suppressHydrationWarning
            onClick={fetchProducts}
            className="p-2 border border-[#E5E7EB] rounded hover:bg-[#F8F9FA] text-[#6B7280] hover:text-[#111827]"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* In-Page Secondary Navigation Tabs (§5.5) */}
        <DataMethodsNav orgId={orgId} />

        {/* Backend Error Banner */}
        {error && (
          <div className="p-3 border border-[#E5E7EB] bg-[#F8F9FA] rounded text-xs text-[#4B5563] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#111827]" />
              <span>Catalog Gateway Error: {error}</span>
            </div>
            <button suppressHydrationWarning
              onClick={fetchProducts}
              className="px-2 py-0.5 border border-[#111827] rounded text-[11px] font-medium hover:bg-[#111827] hover:text-[#FFFFFF] transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-[#F8F9FA] p-3 border border-[#E5E7EB] rounded">
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6B7280]" />
            <input suppressHydrationWarning
              type="text"
              placeholder="Search by product name or variable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E5E7EB] pl-9 pr-3 py-1.5 text-xs rounded focus:outline-none focus:border-[#111827]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#6B7280]" />
            <select suppressHydrationWarning
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E5E7EB] px-2.5 py-1.5 text-xs rounded text-[#111827] focus:outline-none"
            >
              <option value="all">All Product Kinds</option>
              <option value="observational">Observational (Satellite / In-Situ)</option>
              <option value="reanalysis">Reanalysis Grid</option>
              <option value="forecast">Numerical Forecast</option>
              <option value="static">Static Bathymetry / Geography</option>
            </select>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="p-8 text-center text-xs text-[#6B7280]">
            Loading marine product catalog from API (GET /v1/catalog/products)...
          </div>
        )}

        {/* Products Table */}
        {!loading && filtered.length === 0 ? (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] p-8 text-center text-xs text-[#6B7280]">
            No marine products found in the catalog matching your filter.
          </div>
        ) : (
          <div className="border border-[#E5E7EB] rounded bg-[#FFFFFF] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] border-b border-[#E5E7EB] font-mono text-[#4B5563] uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Product Name</th>
                  <th className="py-2.5 px-3 font-semibold">Kind & Resolution</th>
                  <th className="py-2.5 px-3 font-semibold">Variable</th>
                  <th className="py-2.5 px-3 font-semibold">Licensing</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3 px-3">
                      <Link
                        href={`/org/${orgId}/data/products/${prod.id}`}
                        className="font-semibold text-[#111827] hover:underline block"
                      >
                        {prod.name}
                      </Link>
                      <span className="text-[10px] font-mono text-[#6B7280]">
                        Slug: {prod.slug}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-[11px] text-[#111827] uppercase">
                        {prod.kind}
                      </div>
                      <div className="text-[10px] text-[#6B7280]">
                        {prod.resolution_spatial}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-1.5 py-0.5 border border-[#E5E7EB] rounded text-[10px] font-mono bg-[#F8F9FA] text-[#111827]">
                        {prod.variable}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <Badge variant="outline">{prod.license_type}</Badge>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/org/${orgId}/data/products/${prod.id}`}
                        className="inline-flex items-center gap-1 font-medium text-[#111827] hover:underline"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
