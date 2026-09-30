/**
 * @license
 * SPDX-License-Identifier: MIT
 * Comprehensive Screening Result Card with Calibrated Verdict, Disclaimers, and Fusion
 */
import {
  AlertTriangle,
  Bot,
  Brain,
  Download,
  Info,
  Shield,
  ShieldAlert,
} from 'lucide-react';
import React, { useState } from 'react';
import { generatePdfReport } from '../lib/report';
import { AnalysisResult } from '../lib/scorer';
import { SideBySide } from './SideBySide';
import { VerdictBadge } from './VerdictBadge';

interface ResultCardProps {
  result: AnalysisResult;
  inputImageSource: HTMLImageElement | HTMLCanvasElement | string;
  onAskAi?: (result: AnalysisResult) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  inputImageSource,
  onAskAi,
}) => {
  const [downloading, setDownloading] = useState(false);
  const verdict = result.verdict;

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const scanUrl =
        typeof inputImageSource === 'string'
          ? inputImageSource
          : inputImageSource instanceof HTMLImageElement
          ? inputImageSource.src
          : inputImageSource.toDataURL();

      await generatePdfReport(result, null, scanUrl, scanUrl);
    } catch {
      // PDF generation handled gracefully
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      role="region"
      aria-label="Screening Analysis Results"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-6 p-6"
    >
      {/* 1. Mandatory Safety Banner */}
      <div className="p-3.5 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/60 rounded-xl flex items-center gap-3 text-teal-900 dark:text-teal-200">
        <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold">
          This flags an unusual pattern for clinician review. It is not a diagnosis.
        </span>
      </div>

      {/* 2. Abstain Banner (if operational signals are conflicting or low reliability) */}
      {result.reliabilityResult?.shouldAbstain && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Not reliable enough to score: human review needed
            </h2>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              {result.reliabilityResult.abstainReason ||
                'Conflicting signals between the anomaly detector and classifier or scanner protocol shift detected.'}
            </p>
          </div>
        </div>
      )}

      {/* 3. Verdict & Quantitative Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Screening Verdict
            </span>
            {verdict && (
              <VerdictBadge
                label={verdict.label}
                borderline={verdict.borderline}
                size="md"
              />
            )}
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {verdict?.percentileText || 'Empirical percentile calibrated against healthy baseline.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Reliability Pill */}
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
              result.reliabilityResult?.level === 'High'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                : result.reliabilityResult?.level === 'Medium'
                ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
            }`}
          >
            {result.reliabilityResult?.level || 'High'} Reliability
          </span>

          <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
            Score: <strong>{result.score ?? 'N/A'}</strong>
          </span>
        </div>
      </div>

      {/* 4. Scanner Shift Warning (if applicable) */}
      {result.shiftResult?.hasShift && (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs text-orange-900 dark:text-orange-200 space-y-1">
            <h2 className="font-bold text-sm">Scanner/Protocol Shift Warning</h2>
            <p>{result.shiftResult.message}</p>
          </div>
        </div>
      )}

      {/* 5. Side by Side Visual Comparison */}
      <SideBySide
        inputImageSource={inputImageSource}
        patchScores={result.patchScores}
        nearestHealthyThumbnail={result.nearestHealthyThumbnail}
        areaPercent={result.areaPercent}
        region={result.region}
        explanationSentence={result.explanationSentence}
      />

      {/* 6. AI-Suggested Findings Section */}
      {result.fusionResult && result.fusionResult.outcome !== 'No-model' && (
        <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Brain className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              AI-suggested finding (decision support)
            </h3>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Confidence: {Math.round(result.fusionResult.topProbability * 100)}%
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {result.fusionResult.message}
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            {result.fusionResult.recommendedAction}
          </p>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700">
            This is an AI-suggested finding from a research prototype, not a confirmed diagnosis and not a medical device. It must be reviewed and confirmed by a qualified doctor or radiologist.
          </div>
        </div>
      )}

      {/* 7. Action Guidance */}
      {result.nextSteps && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Recommended Next Steps
          </h3>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {result.nextSteps.primaryMessage}
          </p>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            {result.nextSteps.actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 8. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating PDF...' : 'Download report (PDF)'}
        </button>

        {onAskAi && (
          <button
            type="button"
            onClick={() => onAskAi(result)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <Bot className="w-4 h-4" />
            Ask AI Assistant about this scan
          </button>
        )}
      </div>
    </div>
  );
};
