/**
 * ORCA 3.0 — Main Application Shell Component
 *
 * Provides the global layout frame:
 * - Fixed Top Header
 * - Collapsible Left Sidebar (w-16 collapsed / w-60 expanded)
 * - Main canvas expands to fill remaining width on sidebar collapse
 */

'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';

function ShellInner({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto bg-[#FFFFFF] p-6 lg:p-10 transition-all duration-200">
          <div className="w-full transition-all duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}
