/**
 * ORCA 3.0 — Mandatory System States (Empty, Blocked, Unreleased, Error)
 * 
 * Sourced directly from dashboard design.md §4.1:
 * "Every screen must declare: loading, true empty, filtered empty, partial,
 *  permission denied, network unavailable, stale data, retryable failure,
 *  and feature not released when relevant."
 */

import React from 'react';
import { AlertCircle, Lock, CloudOff, Inbox, RefreshCw, Layers } from 'lucide-react';

export type StateKind =
  | 'loading'
  | 'true_empty'
  | 'filtered_empty'
  | 'permission_denied'
  | 'network_unavailable'
  | 'feature_not_released'
  | 'retryable_failure';

export interface StateDisplayProps {
  kind?: StateKind;
  mode?: StateKind;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  requiredGate?: string;
}

export function StateDisplay({
  kind,
  mode,
  title,
  description,
  actionLabel,
  onAction,
  requiredGate,
}: StateDisplayProps) {
  const activeKind = kind || mode || 'true_empty';

  switch (activeKind) {
    case 'loading':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#FFFFFF] rounded">
          <RefreshCw className="w-5 h-5 text-[#4B5563] animate-spin mb-3" />
          <p className="text-sm font-medium text-[#111827]">
            {title || 'Loading verified data...'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            {description || 'Checking cryptographic digest & permissions'}
          </p>
        </div>
      );

    case 'true_empty':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#FFFFFF] rounded">
          <Inbox className="w-8 h-8 text-[#9CA3AF] mb-3" />
          <p className="text-sm font-medium text-[#111827]">
            {title || 'No records available'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {description || 'There are no active records in this view.'}
          </p>
          {actionLabel && onAction && (
            <button suppressHydrationWarning
              onClick={onAction}
              className="mt-4 px-3 py-1.5 text-xs font-medium bg-[#111827] text-[#FFFFFF] rounded hover:bg-[#1F2937] transition"
            >
              {actionLabel}
            </button>
          )}
        </div>
      );

    case 'filtered_empty':
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-[#E5E7EB] bg-[#F8F9FA] rounded">
          <p className="text-sm font-medium text-[#111827]">
            {title || 'No results matching current filters'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1">
            {description || 'Try clearing search filters or broadening your date window.'}
          </p>
        </div>
      );

    case 'permission_denied':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#FFFFFF] rounded">
          <Lock className="w-8 h-8 text-[#4B5563] mb-3" />
          <p className="text-sm font-medium text-[#111827]">
            {title || 'Access Restricted'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {description || 'Your principal role does not hold the required capability.'}
          </p>
        </div>
      );

    case 'network_unavailable':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#FFFFFF] rounded">
          <CloudOff className="w-8 h-8 text-[#4B5563] mb-3" />
          <p className="text-sm font-medium text-[#111827]">
            {title || 'Network or Service Unavailable'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {description || 'Failed to establish connection. Offline fallback active.'}
          </p>
        </div>
      );

    case 'feature_not_released':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#F8F9FA] rounded">
          <Layers className="w-8 h-8 text-[#6B7280] mb-3" />
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-[#111827]">
              {title || 'Capability Not Released'}
            </p>
            {requiredGate && (
              <span className="font-mono text-xs px-1.5 py-0.5 border border-[#E5E7EB] rounded bg-[#FFFFFF] text-[#4B5563]">
                {requiredGate}
              </span>
            )}
          </div>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {description || 'This feature has not yet passed backend phase gate verification.'}
          </p>
        </div>
      );

    case 'retryable_failure':
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-[#E5E7EB] bg-[#FFFFFF] rounded">
          <AlertCircle className="w-8 h-8 text-[#92400E] mb-3" />
          <p className="text-sm font-medium text-[#111827]">
            {title || 'Operation Failed'}
          </p>
          <p className="text-sm text-[#6B7280] mt-1 max-w-sm">
            {description || 'An unexpected error occurred during execution.'}
          </p>
          {onAction && (
            <button suppressHydrationWarning
              onClick={onAction}
              className="mt-4 px-3 py-1.5 text-xs font-medium border border-[#111827] text-[#111827] rounded hover:bg-[#F3F4F6] transition"
            >
              {actionLabel || 'Retry Operation'}
            </button>
          )}
        </div>
      );
  }
}

// Export EmptyState as alias for StateDisplay
export const EmptyState = StateDisplay;
