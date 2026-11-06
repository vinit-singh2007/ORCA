/**
 * ORCA 3.0 — Five Independent Status Indicators
 * 
 * Sourced directly from dashboard design.md §2:
 * "ENS ownership, institutional accreditation, A2A reachability,
 *  Arkiv confirmation and scientific validity get five separate indicators."
 */

import React from 'react';
import { Badge } from './Badge';

export type StatusCategory = 'ens' | 'accreditation' | 'a2a' | 'arkiv' | 'science';

interface StatusIndicatorProps {
  category?: StatusCategory;
  indicator?: StatusCategory;
  state?: string;
  status?: string;
  label?: string;
}

export function StatusIndicator({
  category,
  indicator,
  state,
  status,
  label,
}: StatusIndicatorProps) {
  const activeCategory = category || indicator || 'science';
  const activeState = state || status || 'unknown';

  // Configured mappings per category
  switch (activeCategory) {
    case 'ens':
      return (
        <Badge variant={activeState === 'verified' ? 'verified' : 'outline'}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#111827]" />
          ENS: {label || activeState}
        </Badge>
      );

    case 'accreditation':
      return (
        <Badge variant={activeState === 'verified' ? 'verified' : 'outline'}>
          <span className="w-1.5 h-1.5 rounded-full border border-[#111827]" />
          ORG: {label || activeState}
        </Badge>
      );

    case 'a2a':
      return (
        <Badge variant={activeState === 'reachable' ? 'neutral' : 'outline'}>
          A2A: {label || activeState}
        </Badge>
      );

    case 'arkiv':
      return (
        <Badge variant={activeState === 'confirmed' || activeState === 'indexed' ? 'verified' : 'outline'}>
          ARKIV: {label || activeState}
        </Badge>
      );

    case 'science':
      return (
        <Badge
          variant={
            activeState === 'supported'
              ? 'verified'
              : activeState === 'insufficient_evidence'
              ? 'warning'
              : 'outline'
          }
        >
          SCIENCE: {label || activeState}
        </Badge>
      );

    default:
      return <Badge variant="outline">{label || activeState}</Badge>;
  }
}

// Export StatusPill as alias for StatusIndicator to satisfy both component names
export const StatusPill = StatusIndicator;
