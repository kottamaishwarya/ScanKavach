/**
 * @license
 * SPDX-License-Identifier: MIT
 * Accessible History Table with CSV Export and Detailed Inspection
 */
import { AlertCircle, CheckCircle, Download, Trash2 } from 'lucide-react';
import React from 'react';
import { HistoryItem } from '../lib/stats';
import { VerdictBadge } from './VerdictBadge';

interface HistoryTableProps {
  history: HistoryItem[];
  onSelectRow?: (item: HistoryItem) => void;
  onClearHistory?: () => void;
  onExportCsv?: () => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  history,
  onSelectRow,
  onClearHistory,
  onExportCsv,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No screening history recorded yet. Scans evaluated in this session will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
          Screening Log ({history.length})
        </h2>
        <div className="flex items-center gap-2">
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          )}
          {onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-4 py-3">File Name</th>
              <th scope="col" className="px-4 py-3">Safety Gate</th>
              <th scope="col" className="px-4 py-3">Score</th>
              <th scope="col" className="px-4 py-3">Percentile</th>
              <th scope="col" className="px-4 py-3">Verdict</th>
              <th scope="col" className="px-4 py-3">AI Finding</th>
              <th scope="col" className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 15).map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectRow?.(item)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100 max-w-[140px] truncate" title={item.fileName}>
                  {item.fileName}
                </td>
                <td className="px-4 py-3">
                  {item.gatePassed ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Rejected
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">
                  {item.score !== undefined ? item.score : '—'}
                </td>
                <td className="px-4 py-3 font-mono">
                  {item.percentile !== undefined ? `${item.percentile}%` : '—'}
                </td>
                <td className="px-4 py-3">
                  {item.verdict ? (
                    <VerdictBadge label={item.verdict} borderline={item.borderline} size="sm" />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.suggestion ? (
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.suggestion}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
