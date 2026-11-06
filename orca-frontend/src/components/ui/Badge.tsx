/**
 * ORCA 3.0 — Accessible Monochrome Badge Component
 * 
 * Sourced from dashboard design.md §2:
 * "Status styling: accessible neutral outline/text plus semantic words and icons...
 *  Never communicate only by color."
 */

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'outline' | 'verified' | 'warning' | 'muted' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  const variantClasses: Record<string, string> = {
    neutral: 'bg-[#F3F4F6] text-[#111827] border border-[#E5E7EB]',
    outline: 'bg-[#FFFFFF] text-[#4B5563] border border-[#E5E7EB]',
    verified: 'bg-[#F8F9FA] text-[#111827] border border-[#111827] font-medium',
    success: 'bg-[#F8F9FA] text-[#111827] border border-[#111827] font-medium',
    warning: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]',
    muted: 'bg-[#F8F9FA] text-[#6B7280] border border-[#E5E7EB]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono uppercase tracking-wider ${sizeClasses} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {children}
    </span>
  );
}
