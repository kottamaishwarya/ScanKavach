/**
 * @license
 * SPDX-License-Identifier: MIT
 * BatchPage: High-throughput sequential triage screening with CSV export
 */
import {
  AlertCircle,
  CheckCircle,
  Download,
  Layers,
  Play,
  Save,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { VerdictBadge } from '../components/VerdictBadge';
import { BATCH_LIMIT } from '../config';
import { exportBatchCsv, sortBatchByPriority } from '../lib/batch';
import { saveAnalysisToHistory } from '../lib/history';
import { loadImageFromFile, validateImageFile } from '../lib/imageUtils';
import { AnalysisResult, analyzeImage } from '../lib/scorer';

export const BatchPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const valid: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      if (validateImageFile(fileList[i]).valid) {
        valid.push(fileList[i]);
      }
    }
    const totalFiles = [...files, ...valid].slice(0, BATCH_LIMIT);
    setFiles(totalFiles);
  };

  const runBatchProcessing = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length });

    const batchResults: AnalysisResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress({ current: i + 1, total: files.length });
      try {
        const img = await loadImageFromFile(file);
        const res = await analyzeImage(img, file.name);
        batchResults.push(res);
      } catch (err: any) {
        // failed image
      }
    }

    setResults(batchResults);
    setIsProcessing(false);
    showToast(`Batch processing completed (${batchResults.length} scans).`);
  };

  const handleSaveAllToHistory = () => {
    for (const r of results) {
      saveAnalysisToHistory(r);
    }
    showToast('Saved all batch screenings to permanent history.');
  };

  const handleExportCsv = () => {
    const batchItems = results.map((r) => ({
      id: r.fileName,
      fileName: r.fileName,
      gatePassed: r.gateResult.passed,
      gateReason: r.gateResult.reasons.join('; '),
      score: r.score,
      percentile: r.verdict?.percentile,
      verdict: r.verdict?.label,
      borderline: r.verdict?.borderline,
      shiftFlag: r.shiftResult?.hasShift,
      suggestion: r.fusionResult?.topClass,
      confidence: r.fusionResult?.topProbability,
      timestamp: r.timestamp,
    }));

    const sorted = sortBatchByPriority(batchItems);
    const csv = exportBatchCsv(sorted);

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scankavach-batch.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Batch CSV exported successfully.');
  };

  return (
    <AppShell pageTitle="Sequential Batch Triage">
      <div className="space-y-6 max-w-5xl mx-auto">
        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-teal-300 border border-teal-500/40 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in"
          >
            {toast}
          </div>
        )}

        {/* Header Block */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Batch Triage Screening
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Queue up to {BATCH_LIMIT} scans for automated sequential inspection. Results are prioritized automatically by empirical abnormality percentile.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {results.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleSaveAllToHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save to History
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Batch CSV
                </button>
              </>
            )}
          </div>
        </div>

        {/* Upload Selection Zone */}
        {results.length === 0 && !isProcessing && (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/20"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Select multiple radiographs for batch triage (up to {BATCH_LIMIT})
              </p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleSelectFiles(e.target.files)}
                className="hidden"
              />
            </div>

            {files.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs">
                <span className="font-semibold text-teal-900 dark:text-teal-200">
                  {files.length} scans queued
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-rose-600 hover:underline mr-2"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={runBatchProcessing}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Start Batch Screening
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Progress */}
        {isProcessing && (
          <div className="p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs text-center space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Processing Batch: {progress.current} of {progress.total} scans evaluated
            </h3>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="bg-teal-600 h-full transition-all duration-200"
                style={{ width: `${(progress.current / (progress.total || 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Batch Results Table (Sorted by Percentile) */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Prioritized Triage Queue ({results.length} Scans)
              </h3>
              <button
                type="button"
                onClick={() => {
                  setResults([]);
                  setFiles([]);
                }}
                className="text-xs text-teal-600 hover:underline"
              >
                New Batch
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">File Name</th>
                    <th className="px-4 py-3">Gate</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Percentile</th>
                    <th className="px-4 py-3">Verdict</th>
                    <th className="px-4 py-3">Shift</th>
                    <th className="px-4 py-3">Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {results.map((r, idx) => (
                    <tr
                      key={idx}
                      onClick={() => setSelectedResult(r)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        {r.fileName}
                      </td>
                      <td className="px-4 py-3">
                        {r.gateResult.passed ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Passed
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Rejection
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">{r.score ?? '—'}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        {r.verdict?.percentile !== undefined ? `${r.verdict.percentile}%` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {r.verdict ? (
                          <VerdictBadge
                            label={r.verdict.label}
                            borderline={r.verdict.borderline}
                            size="sm"
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.shiftResult?.hasShift ? (
                          <span className="text-amber-600 font-bold">Shift</span>
                        ) : (
                          <span className="text-slate-400">Normal</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {r.fusionResult?.topClass || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
