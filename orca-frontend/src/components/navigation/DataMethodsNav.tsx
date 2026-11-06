/**
 * ORCA 3.0 — Data & Methods Secondary Navigation Bar
 * 
 * DESIGN SPECIFICATION:
 * - ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md §4.1 & §5.5
 * - Groups D01–D09 under a unified in-page secondary tab navigation
 * - Preserves all 6 distinct deep-linkable URLs without bloating the global sidebar:
 *   1. Products:       /org/[orgId]/data/products
 *   2. Providers:      /org/[orgId]/data/providers
 *   3. Snapshots:      /org/[orgId]/data/snapshots
 *   4. Compatibility:  /org/[orgId]/data/compatibility
 *   5. Methods:        /org/[orgId]/science/methods
 *   6. Recipes:        /org/[orgId]/science/recipes
 * 
 * VISUAL LANGUAGE:
 * - Monochrome tabs (#FFFFFF, #111827, #F8F9FA, #E5E7EB)
 * - Clear active tab underline / border indicator
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Server, Camera, CheckSquare, Wrench, BookOpen } from 'lucide-react';

interface DataMethodsNavProps {
  orgId: string;
}

export function DataMethodsNav({ orgId }: DataMethodsNavProps) {
  const pathname = usePathname() || '';

  const tabs = [
    {
      name: 'Products',
      href: `/org/${orgId}/data/products`,
      icon: Database,
      isActive: pathname.includes('/data/products'),
    },
    {
      name: 'Providers',
      href: `/org/${orgId}/data/providers`,
      icon: Server,
      isActive: pathname.includes('/data/providers'),
    },
    {
      name: 'Snapshots',
      href: `/org/${orgId}/data/snapshots`,
      icon: Camera,
      isActive: pathname.includes('/data/snapshots'),
    },
    {
      name: 'Compatibility',
      href: `/org/${orgId}/data/compatibility`,
      icon: CheckSquare,
      isActive: pathname.includes('/data/compatibility'),
    },
    {
      name: 'Methods',
      href: `/org/${orgId}/science/methods`,
      icon: Wrench,
      isActive: pathname.includes('/science/methods'),
    },
    {
      name: 'Recipes',
      href: `/org/${orgId}/science/recipes`,
      icon: BookOpen,
      isActive: pathname.includes('/science/recipes'),
    },
  ];

  return (
    <div className="border-b border-[#E5E7EB] bg-[#FFFFFF]">
      <div className="flex items-center gap-1 overflow-x-auto py-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded transition whitespace-nowrap ${
                tab.isActive
                  ? 'bg-[#111827] text-[#FFFFFF]'
                  : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F8F9FA]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

