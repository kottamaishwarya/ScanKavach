/**
 * @license
 * SPDX-License-Identifier: MIT
 * AboutPage: Scientific Foundation, Differentiation, Transparency, and Privacy Architecture
 */
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Cpu,
  Eye,
  Info,
  Layers,
  Lock,
  Play,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { APP_FULL_TITLE, APP_NAME, APP_TAGLINE } from '../config';
import { clearAuditLogs } from '../lib/auditLog';
import { clearHistory } from '../lib/history';
import { setActiveBank } from '../lib/memoryBank';
import { setLoadedConditionModel } from '../lib/suggest';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all local data? This will reset history, audit logs, cached banks, and trained models on this browser.'
      )
    ) {
      clearHistory();
      clearAuditLogs();
      setActiveBank(null);
      setLoadedConditionModel(null);
      localStorage.clear();
      showToast('All local data cleared successfully.');
    }
  };

  return (
    <AppShell pageTitle="About ScanKavach">
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

        {/* Hero Section */}
        <div className="p-8 bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 text-white rounded-3xl border border-teal-500/20 shadow-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 text-teal-300 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>OptiForge 2026 Innovation Track</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {APP_NAME}
          </h2>
          <p className="text-teal-300 font-semibold text-sm">
            {APP_TAGLINE}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {APP_FULL_TITLE}.
            ScanKavach bridges the critical triage gap in under-resourced medical centres by decoupling anomaly detection from disease annotation. It learns healthy thoracic anatomy from unannotated healthy scans and provides statistically calibrated triage flags with full visual explainability.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/quality')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Run Self-Test & Quality Audit
            </button>
            <button
              type="button"
              onClick={handleClearAllData}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 text-xs font-semibold rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All Local Data
            </button>
          </div>
        </div>

        {/* How It Works in 4 Steps */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            How ScanKavach Works (4-Step Pipeline)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                1
              </span>
              <strong className="block font-bold text-slate-900 dark:text-slate-100">
                Input Safety Gate
              </strong>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Rejects non-chest radiographs, color selfies, blurry photos, and low-contrast blanks before feature extraction.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <strong className="block font-bold text-slate-900 dark:text-slate-100">
                Neural Patch Extraction
              </strong>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Extracts 14x14 spatial patch representations using MobileNet v1 0.25 layer conv_pw_11_relu.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                3
              </span>
              <strong className="block font-bold text-slate-900 dark:text-slate-100">
                Memory Bank Comparison
              </strong>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Computes nearest-neighbor distance against healthy reference patches via chunked matrix multiplication.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800">
              <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                4
              </span>
              <strong className="block font-bold text-slate-900 dark:text-slate-100">
                Calibrated Verdict & Fusion
              </strong>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Outputs empirical Normal/Review/Refer verdicts with borderline flags and dual-signal fusion.
              </p>
            </div>
          </div>
        </div>

        {/* Why This Is Different (Comparison Table) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              Innovation: Why ScanKavach Outperforms Conventional Anomaly Detectors
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Capability</th>
                  <th className="px-4 py-3">Conventional PatchCore / Raw Anomaly</th>
                  <th className="px-4 py-3 text-teal-600 dark:text-teal-400">ScanKavach Shield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-semibold">Input Quality Defense</td>
                  <td className="px-4 py-3 text-slate-400">None (scores selfies and blanks as severe disease)</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    4-point Input Safety Gate halts execution early
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Explainability</td>
                  <td className="px-4 py-3 text-slate-400">Opaque floating-point number without visual context</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Side-by-side nearest healthy scan + 3x3 region locator
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Triage Thresholds</td>
                  <td className="px-4 py-3 text-slate-400">Arbitrary heuristics or guessed cut-offs</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Empirical 95th and 99th percentiles with 5% borderline margin
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Hardware Shift Awareness</td>
                  <td className="px-4 py-3 text-slate-400">Mistakes scanner protocol changes for disease</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Scanner-shift detector separates global shifts from focal lesions
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Multi-Signal Fusion</td>
                  <td className="px-4 py-3 text-slate-400">Single isolated signal without sanity check</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Unsupervised anomaly + Supervised suggestion with Conflict flag
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold">Deployment Privacy</td>
                  <td className="px-4 py-3 text-slate-400">Requires sending patient medical scans to cloud servers</td>
                  <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% on-device in-browser execution with zero network transmission
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Accessibility Statement */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Accessibility Statement (WCAG 2.1 AA)
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            ScanKavach has been engineered for universal accessibility: including full keyboard navigability, &ldquo;Skip to main content&rdquo; jump links, visible focus indicators, screen reader-friendly aria-live regions for asynchronous results, high-contrast dark/light theme options (minimum 4.5:1 contrast ratio), and text-label indicators alongside every color-coded badge.
          </p>
        </div>

        {/* Sources attribution */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400">
          Sources: WHO, Ministry of Health and Family Welfare (India), ICMR - please verify all findings with your qualified clinician.
        </div>
      </div>
    </AppShell>
  );
};
