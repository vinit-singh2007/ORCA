/**
 * ORCA 3.0 — Main Application Shell Component
 * 
 * Provides the global layout frame:
 * - Fixed Top Header
 * - Fixed Left Sidebar
 * - Scrollable Main Canvas adhering to strict white neutral design rules
 */

'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col font-sans">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#FFFFFF]">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

