/**
 * @license
 * SPDX-License-Identifier: MIT
 * Metric summary card component
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  badge?: string;
  highlight?: 'default' | 'teal' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  badge,
  highlight = 'default',
}) => {
  const borderHighlight = {
    default: 'border-slate-200 dark:border-slate-800',
    teal: 'border-teal-500/40 dark:border-teal-500/30',
    amber: 'border-amber-500/40 dark:border-amber-500/30',
    rose: 'border-rose-500/40 dark:border-rose-500/30',
  }[highlight];

  return (
    <div
      className={`p-5 bg-white dark:bg-slate-900 border ${borderHighlight} rounded-xl shadow-xs transition-all hover:shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && <div className="text-slate-400 dark:text-slate-500">{icon}</div>}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </span>
        {badge && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {subtext}
        </p>
      )}
    </div>
  );
};
