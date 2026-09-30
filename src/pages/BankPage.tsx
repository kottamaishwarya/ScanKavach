/**
 * @license
 * SPDX-License-Identifier: MIT
 * BankPage: Reference Memory Bank Construction, Calibration, and Import/Export
 */
import {
  AlertTriangle,
  CheckCircle,
  Database,
  Download,
  Info,
  Layers,
  Sparkles,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  Bar,
  BarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { MIN_NORMALS, RECOMMENDED_NORMALS } from '../config';
import { loadImageFromFile, validateImageFile } from '../lib/imageUtils';
import {
  buildMemoryBank,
  exportBankJson,
  getActiveBank,
  importBankJson,
} from '../lib/memoryBank';

export const BankPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonImportRef = useRef<HTMLInputElement | null>(null);

  const [activeBank, setActiveBankState] = useState(getActiveBank());
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (validateImageFile(f).valid) {
        validFiles.push(f);
      }
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const handleStartBuilding = async () => {
    if (selectedFiles.length < MIN_NORMALS) {
      setError(`At least ${MIN_NORMALS} healthy scans are required to build a statistically valid bank.`);
      return;
    }

    setError(null);
    setIsBuilding(true);

    try {
      const loadedImages: { id: number; element: HTMLImageElement; name: string }[] = [];
      setProgressMessage('Loading and validating image files...');
      setProgressPercent(5);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const img = await loadImageFromFile(file);
        loadedImages.push({ id: i + 1, element: img, name: file.name });
      }

      const bank = await buildMemoryBank(loadedImages, (msg, pct) => {
        setProgressMessage(msg);
        setProgressPercent(pct);
      });

      setActiveBankState(bank);
      setSelectedFiles([]);
      showToast('Memory bank successfully built and calibrated!');
    } catch (err: any) {
      setError(err.message || 'Failed to construct memory bank.');
    } finally {
      setIsBuilding(false);
    }
  };

  const handleExportBank = () => {
    if (!activeBank) return;
    const json = exportBankJson(activeBank);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scankavach-bank-${activeBank.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Bank exported as JSON.');
  };

  const handleImportBankFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const bank = importBankJson(text);
      setActiveBankState(bank);
      showToast('Memory bank imported and activated successfully!');
    } catch (err: any) {
      setError(`Failed to import bank: ${err.message}`);
    }
  };

  // Prepare histogram data from sortedValidationScores
  const histogramData = activeBank?.sortedValidationScores
    ? activeBank.sortedValidationScores.map((score, idx) => ({
        index: idx + 1,
        score: Math.round(score * 100) / 100,
      }))
    : [];

  return (
    <AppShell pageTitle="Healthy Reference Memory Bank">
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
              <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Healthy Baseline Memory Bank
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              ScanKavach identifies anomalous patterns by indexing healthy tissue patch features. Zero disease annotations are required.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeBank && (
              <button
                type="button"
                onClick={handleExportBank}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Bank
              </button>
            )}

            <button
              type="button"
              onClick={() => jsonImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Bank (.json)
            </button>
            <input
              ref={jsonImportRef}
              type="file"
              accept=".json"
              onChange={handleImportBankFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Bank Card */}
        {activeBank ? (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Active Calibrated Bank
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeBank.name}
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                Calibrated & Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Indexed Patches</span>
                <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {activeBank.patchCount}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Review Threshold (95th)</span>
                <strong className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {activeBank.reviewThreshold}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Refer Threshold (99th)</span>
                <strong className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {activeBank.referThreshold}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Blur & OOD Bounds</span>
                <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {activeBank.blurLimit} / {activeBank.oodLimit}
                </strong>
              </div>
            </div>

            {/* Validation Score Distribution Histogram */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Validation Set Score Distribution (Threshold Calibration)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">
                Derived mathematically from held-out healthy validation scans. The amber dashed line indicates the 95th percentile (Review), and the red dashed line marks the 99th percentile (Refer).
              </p>

              {histogramData.length > 0 ? (
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={histogramData}>
                      <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip />
                      <ReferenceLine
                        y={activeBank.reviewThreshold}
                        stroke="#f59e0b"
                        strokeDasharray="3 3"
                        label={{ value: 'Review (95%)', fill: '#f59e0b', fontSize: 10 }}
                      />
                      <ReferenceLine
                        y={activeBank.referThreshold}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{ value: 'Refer (99%)', fill: '#ef4444', fontSize: 10 }}
                      />
                      <Bar dataKey="score" fill="#0d9488" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No histogram coordinates available.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Database className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              No Reference Bank Active
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Build a custom bank by selecting healthy scans below or import an existing calibrated JSON file.
            </p>
          </div>
        )}

        {/* Bank Builder Form */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Build New Calibrated Reference Bank
            </h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Min: {MIN_NORMALS} scans (Recommended: {RECOMMENDED_NORMALS}+)
            </span>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Select or drop healthy chest radiographs
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports multiple files (PNG, JPG, WEBP)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={(e) => handleSelectFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs">
              <span className="font-semibold text-teal-900 dark:text-teal-200">
                {selectedFiles.length} healthy scans selected
              </span>
              <button
                type="button"
                onClick={() => setSelectedFiles([])}
                className="text-rose-600 hover:underline"
              >
                Clear selection
              </button>
            </div>
          )}

          {isBuilding && (
            <div className="space-y-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{progressMessage}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleStartBuilding}
              disabled={isBuilding || selectedFiles.length < MIN_NORMALS}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {isBuilding ? 'Building Bank...' : `Build & Calibrate (${selectedFiles.length} scans)`}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
