/**
 * ORCA 3.0 — Root Application Layout
 * 
 * Provides base HTML scaffolding, strict typography tokens, and global CSS imports.
 * Sourced from dashboard design.md §2 (Visual language: strict white / neutral only).
 * 
 * Comments included per user requirement.
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ORCA 3.0 — Institutional Marine Science & Verification Workspace',
  description: 'Verified oceanographic calculations, reproducible investigations, and decentralized A2A agent coordination.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#FFFFFF]">
      <body className="min-h-full bg-[#FFFFFF] text-[#111827] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
