/**
 * @license
 * SPDX-License-Identifier: MIT
 * Accessible color-coded verdict badge with text label
 */
import React from 'react';
import { VerdictLabel } from '../lib/verdict';

interface VerdictBadgeProps {
  label: VerdictLabel;
  borderline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  label,
  borderline,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm font-semibold',
    lg: 'px-3.5 py-1.5 text-base font-bold',
  };

  let colorClasses = 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
  let accessibleIcon = '✓';

  if (label === 'Review') {
    colorClasses = 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    accessibleIcon = '▲';
  } else if (label === 'Refer') {
    colorClasses = 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    accessibleIcon = '●';
  }

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        role="status"
        aria-label={`Screening Verdict: ${label}`}
        className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition-colors ${sizeClasses[size]} ${colorClasses}`}
      >
        <span aria-hidden="true" className="font-bold">{accessibleIcon}</span>
        <span>{label}</span>
      </span>

      {borderline && (
        <span
          role="status"
          aria-label="Borderline score"
          className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700"
        >
          Borderline
        </span>
      )}
    </div>
  );
};
