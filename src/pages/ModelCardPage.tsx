/**
 * @license
 * SPDX-License-Identifier: MIT
 * ModelCardPage: Comprehensive Model Card, Regulatory Auditing, and System Transparency
 */
import {
  AlertTriangle,
  Award,
  BookOpen,
  Cpu,
  Download,
  FileText,
  History,
  Lock,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/AppShell';
import {
  COLOR_DIFF_LIMIT,
  DEFAULT_BLUR_LIMIT,
  MIN_CONTRAST_STD,
  OOD_MARGIN,
  PATCH_LAYER,
  REFER_PERCENTILE,
  REVIEW_PERCENTILE,
} from '../config';
import { exportAuditLogsCsv, getAuditLogs } from '../lib/auditLog';
import { getActiveBank } from '../lib/memoryBank';
import { getLoadedConditionModel } from '../lib/suggest';

export const ModelCardPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState(getAuditLogs());
  const activeBank = getActiveBank();
  const conditionModel = getLoadedConditionModel();

  const handleExportAuditCsv = () => {
    const csv = exportAuditLogsCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'scankavach-audit.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell pageTitle="Model Card & System Audit">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              ScanKavach System & Model Card
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Formal technical specification, empirical calibration lineage, ethical boundaries, and UN SDG alignment.
          </p>
        </div>

        {/* 1. Intended & Not-Intended Use */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Authorized Use Cases
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Intended Applications
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Preliminary triage prioritization for high-volume chest radiograph queues.</li>
              <li>Decision support and second-reader review in remote, primary health centres.</li>
              <li>Medical student and radiology resident visual localization education.</li>
              <li>Research prototype evaluation for label-free anomaly detection.</li>
            </ul>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Prohibited & Out-of-Scope
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Not-Intended Use
            </h3>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Sole diagnostic device or automated clinician replacement.</li>
              <li>Emergency life-threatening diagnosis (e.g., tension pneumothorax, pulmonary embolism).</li>
              <li>Prescribing pharmacological medications or treatment regimens.</li>
              <li>Evaluating non-chest anatomical radiographs or cross-sectional CT/MRI scans.</li>
            </ul>
          </div>
        </div>

        {/* 2. Technical Architecture & Parameters */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-600" />
            Neural Feature Extractor & Memory Bank
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Backbone Model</span>
              <strong className="text-slate-900 dark:text-slate-100">MobileNet v1 0.25 (224x224)</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Feature Extraction Layer</span>
              <strong className="text-slate-900 dark:text-slate-100 font-mono">{PATCH_LAYER}</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Calibrated Review Percentile</span>
              <strong className="text-amber-600 font-mono font-bold">{REVIEW_PERCENTILE}th percentile</strong>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <span className="text-slate-400 block text-[11px]">Calibrated Refer Percentile</span>
              <strong className="text-rose-600 font-mono font-bold">{REFER_PERCENTILE}th percentile</strong>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Input Safety Gate Parameters:
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              Color Difference Limit: &le; {COLOR_DIFF_LIMIT} • Contrast Std: &ge; {MIN_CONTRAST_STD} •
              Blur Laplacian Limit: &ge; {activeBank?.blurLimit ?? DEFAULT_BLUR_LIMIT} • OOD Margin: {OOD_MARGIN}x
            </p>
          </div>
        </div>

        {/* 3. Known Limitations & Bias Analysis */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Documented Technical Limitations & Bias Considerations
          </h3>

          <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
            <li>
              <strong>Lightweight ImageNet Backbone:</strong> MobileNet v1 0.25 was pre-trained on generic natural images. While intermediate patches generalize effectively to texture anomalies, specialized medical weights may exhibit higher discriminative sensitivity.
            </li>
            <li>
              <strong>Paediatric vs Adult Anatomical Differences:</strong> Thoracic anatomy, thymic shadows, and ribs differ substantially in infants and young children. Baseline banks should match patient age cohorts.
            </li>
            <li>
              <strong>Scanner & Acquisition Variation:</strong> Hardware differences across digital radiography (DR) and computed radiography (CR) machines can induce slight global feature shifts. ScanKavach incorporates a shift detector to mitigate this risk.
            </li>
          </ul>
        </div>

        {/* 4. UN Sustainable Development Goals Alignment */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              UN Sustainable Development Goal (SDG) Alignment
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                SDG 3: Good Health & Well-Being
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Targets 3.4 & 3.8</h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Supports universal digital health coverage by expediting detection of respiratory diseases and reducing premature mortality in underserved communities.
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                SDG 9: Industry & Innovation
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Target 9.5</h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Runs entirely inside commodity client browsers without requiring high-cost cloud computing clusters or enterprise GPU servers.
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                SDG 10: Reduced Inequalities
              </span>
              <h4 className="font-bold text-slate-900 dark:text-slate-100">Target 10.2</h4>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                Democratizes radiological decision support for under-resourced rural clinics via open, multilingual (English, Telugu, Hindi) and offline-capable software.
              </p>
            </div>
          </div>
        </div>

        {/* 5. User Audit Log Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <History className="w-4 h-4 text-teal-600" />
              Operational Audit Log ({auditLogs.length} Events)
            </h3>
            <button
              type="button"
              onClick={handleExportAuditCsv}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Audit CSV
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Details</th>
                  <th className="px-4 py-2 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.length > 0 ? (
                  auditLogs.slice(0, 10).map((log) => (
                    <tr key={log.id}>
                      <td className="px-4 py-2 font-mono font-semibold text-teal-600 dark:text-teal-400">
                        {log.action}
                      </td>
                      <td className="px-4 py-2 text-slate-600 dark:text-slate-300">
                        {log.details}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-[11px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-xs">
                      No audit events logged yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
