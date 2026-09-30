/**
 * @license
 * SPDX-License-Identifier: MIT
 * Safety Gate Rejection Card: Explains why an image was blocked with actionable upload tips
 */
import { AlertOctagon, HelpCircle, RefreshCw, UploadCloud } from 'lucide-react';
import React from 'react';
import { GateResult } from '../lib/gate';

interface GateRejectCardProps {
  gateResult: GateResult;
  onRetry?: () => void;
}

export const GateRejectCard: React.FC<GateRejectCardProps> = ({ gateResult, onRetry }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl shadow-sm text-slate-800 dark:text-slate-200"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-100 dark:bg-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
          <AlertOctagon className="w-8 h-8" />
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
              Input Safety Gate: Image Rejected
            </h2>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              To protect screening integrity and prevent false alarms, this image was not evaluated for anomalies.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-4 rounded-lg border border-rose-200 dark:border-rose-900/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
              Specific Reason(s):
            </h3>
            <ul className="list-disc list-inside text-sm font-medium text-rose-900 dark:text-rose-200 space-y-1">
              {gateResult.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className="pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              How to provide a valid scan:
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <li>• Upload high-quality diagnostic grayscale chest radiographs (PA or AP view).</li>
              <li>• Avoid uploading color photos, pictures of computer screens taken with smartphones, or selfies.</li>
              <li>• Ensure the scan is well-focused without motion blur or extreme contrast compression.</li>
            </ul>
          </div>

          {onRetry && (
            <div className="pt-3">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                Upload New Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
