/**
 * @license
 * SPDX-License-Identifier: MIT
 * EvaluationPage: AUROC, Sensitivity, Specificity, ROC Curve, and Live Operating Point Slider
 */
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Play,
  RotateCcw,
  Sliders,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import {
  computeAuroc,
  generateRocPoints,
  sensitivitySpecificityAt,
} from '../lib/evaluation';
import { loadImageFromFile, validateImageFile } from '../lib/imageUtils';
import { getActiveBank, setActiveBank } from '../lib/memoryBank';
import { analyzeImage } from '../lib/scorer';

export const EvaluationPage: React.FC = () => {
  const abnormalInputRef = useRef<HTMLInputElement | null>(null);
  const activeBank = getActiveBank();

  const [abnormalFiles, setAbnormalFiles] = useState<File[]>([]);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalDone, setEvalDone] = useState(false);
  const [abnormalScores, setAbnormalScores] = useState<number[]>([]);
  const [gateRejectedCount, setGateRejectedCount] = useState(0);

  // Live threshold slider state
  const baseThreshold = activeBank?.reviewThreshold ?? 1.1;
  const [sliderThreshold, setSliderThreshold] = useState<number>(baseThreshold);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectAbnormals = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (validateImageFile(files[i]).valid) valid.push(files[i]);
    }
    setAbnormalFiles((prev) => [...prev, ...valid]);
  };

  const runEvaluation = async () => {
    if (abnormalFiles.length === 0) return;
    setIsEvaluating(true);
    setGateRejectedCount(0);

    const scores: number[] = [];
    let rejected = 0;

    for (const f of abnormalFiles) {
      try {
        const img = await loadImageFromFile(f);
        const res = await analyzeImage(img, f.name);
        if (!res.gateResult.passed) {
          rejected++;
        } else if (res.score !== undefined) {
          scores.push(res.score);
        }
      } catch {
        // skip failed
      }
    }

    setAbnormalScores(scores);
    setGateRejectedCount(rejected);
    setEvalDone(true);
    setIsEvaluating(false);
    showToast(`Evaluation completed (${scores.length} valid abnormal scans evaluated).`);
  };

  const validationNormals = activeBank?.sortedValidationScores ?? [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
  const auroc = computeAuroc(validationNormals, abnormalScores);
  const rocPoints = generateRocPoints(validationNormals, abnormalScores);

  const currentOperatingMetrics = sensitivitySpecificityAt(
    sliderThreshold,
    validationNormals,
    abnormalScores
  );

  const isUnstable = abnormalScores.length < 10 || validationNormals.length < 20;

  const handleApplyThreshold = () => {
    if (!activeBank) return;
    if (
      window.confirm(
        `Are you sure you want to update the Review threshold from ${activeBank.reviewThreshold} to ${sliderThreshold}?`
      )
    ) {
      const updated = {
        ...activeBank,
        reviewThreshold: sliderThreshold,
      };
      setActiveBank(updated);
      showToast('New threshold applied to active memory bank!');
    }
  };

  const handleResetThreshold = () => {
    setSliderThreshold(baseThreshold);
    showToast('Reset to original calibrated threshold.');
  };

  return (
    <AppShell pageTitle="Empirical Validation & ROC Evaluation">
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

        {/* Top Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Evaluation & Decision Boundary Tuning
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Evaluate the screening pipeline against ground-truth abnormal scans.
            Mann-Whitney U statistic calculates empirical AUROC using held-out healthy validation scans as true negatives.
          </p>
        </div>

        {/* Input Card */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Upload Known Abnormal Scans
            </h3>
            <span className="text-xs text-slate-500">
              Negatives: {validationNormals.length} validation healthy scans
            </span>
          </div>

          <div
            onClick={() => abnormalInputRef.current?.click()}
            className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 rounded-xl text-center cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
          >
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Select abnormal/pathological scans (e.g., Pneumonia, Infiltrates, Nodules)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP</p>
            <input
              ref={abnormalInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleSelectAbnormals(e.target.files)}
              className="hidden"
            />
          </div>

          {abnormalFiles.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-teal-50 dark:bg-teal-950/40 rounded-xl border border-teal-200 dark:border-teal-800 text-xs">
              <span className="font-semibold text-teal-900 dark:text-teal-200">
                {abnormalFiles.length} abnormal scans selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAbnormalFiles([])}
                  className="text-rose-600 hover:underline mr-2"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={runEvaluation}
                  disabled={isEvaluating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-xs"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isEvaluating ? 'Evaluating...' : 'Run Quantitative Evaluation'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Small Sample Warning */}
        {evalDone && isUnstable && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              <strong>Estimate is unstable:</strong> Fewer than 10 abnormal scans or 20 normal validation scans evaluated. Confidence bounds will tighten as more clinical exemplars are provided.
            </span>
          </div>
        )}

        {/* Metrics & ROC Display */}
        {evalDone && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ROC Curve Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Receiver Operating Characteristic (ROC)
                </h3>
                <span className="px-2.5 py-1 text-xs font-bold font-mono rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  AUROC: {auroc}
                </span>
              </div>

              <div className="h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rocPoints}>
                    <XAxis
                      dataKey="fpr"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                      label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 10 }}
                    />
                    <YAxis
                      dataKey="tpr"
                      type="number"
                      domain={[0, 1]}
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                      label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="tpr"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={false}
                    />
                    <ReferenceDot
                      x={currentOperatingMetrics.falsePositiveRate}
                      y={currentOperatingMetrics.sensitivity}
                      r={6}
                      fill="#f59e0b"
                      stroke="#fff"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                Orange dot marks the active operating threshold point.
              </p>
            </div>

            {/* Live Operating Point Slider & Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  Live Threshold Slider
                </h3>
                <span className="font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                  Threshold: {sliderThreshold.toFixed(2)}
                </span>
              </div>

              <div>
                <label htmlFor="eval-threshold-slider" className="sr-only">
                  Operating point threshold slider
                </label>
                <input
                  id="eval-threshold-slider"
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.02"
                  value={sliderThreshold}
                  onChange={(e) => setSliderThreshold(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Sensitivity (TPR)</span>
                  <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {Math.round(currentOperatingMetrics.sensitivity * 100)}%
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Specificity (TNR)</span>
                  <strong className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {Math.round(currentOperatingMetrics.specificity * 100)}%
                  </strong>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                  <span className="text-[11px] text-slate-400 block">Healthy Flagged</span>
                  <strong className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {currentOperatingMetrics.healthyFlaggedPercent}%
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleResetThreshold}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-md"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to calibrated ({baseThreshold})
                </button>

                <button
                  type="button"
                  onClick={handleApplyThreshold}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Apply as New Threshold
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
};
