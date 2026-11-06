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
      <div className="flex flex-1 relative">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 bg-[#FFFFFF] min-w-0 overflow-x-hidden">
          <div className="w-full max-w-[1600px] mx-auto transition-all duration-200">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

