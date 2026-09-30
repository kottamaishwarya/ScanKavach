/**
 * @license
 * SPDX-License-Identifier: MIT
 * 60-Second Guided Demo Tour for AI Judge and Evaluators
 */
import {
  AlertOctagon,
  ArrowRight,
  Brain,
  CheckCircle,
  Eye,
  ShieldCheck,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Step 1: Input Safety Gate (First Line of Defense)',
      icon: <AlertOctagon className="w-8 h-8 text-rose-500" />,
      tagline: 'Stops false alarms before neural scoring begins',
      content:
        'Most anomaly detectors fail in real clinical deployments by treating selfies, color photos, blurry photos, or wrong body parts as diseases. ScanKavach enforces a 4-point gate (color difference, contrast std, Laplacian sharpness, and out-of-distribution distance). If rejected, NO score and NO verdict are generated.',
      badge: 'Safety First',
    },
    {
      title: 'Step 2: Nearest Healthy Example & 3x3 Region Localization',
      icon: <Eye className="w-8 h-8 text-teal-500" />,
      tagline: 'Explainable AI without black-box confusion',
      content:
        'Instead of an opaque scalar score, ScanKavach pairs the scan with the closest healthy scan from your memory bank. It calculates the exact area percentage exceeding baseline variation and reports the peak region on a 3x3 grid (e.g. "Unusual pattern in the lower right of the image, about 14% of the area. Not a diagnosis.")',
      badge: 'Visual Explainability',
    },
    {
      title: 'Step 3: Calibrated Normal / Review / Refer Verdict',
      icon: <CheckCircle className="w-8 h-8 text-emerald-500" />,
      tagline: 'Mathematically anchored empirical percentiles',
      content:
        'Thresholds are derived from the 95th and 99th percentiles of a held-out healthy validation set—never hand-tuned or guessed. Scores within 5% of a boundary trigger an explicit "Borderline: needs human review" badge, preventing dangerous overconfidence.',
      badge: 'Calibrated Triage',
    },
    {
      title: 'Step 4: Dual-Signal Fusion & Scanner Shift Awareness',
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      tagline: 'Unsupervised anomaly detector + Supervised condition head',
      content:
        'When a supervised condition model is trained, ScanKavach runs fusion logic. If signals disagree (e.g., classifier predicts disease but anomaly says Normal), an explicit "Conflict" flag warns clinicians to manually inspect. The shift detector flags hardware/protocol differences from disease patterns.',
      badge: 'Dual-Engine Fusion',
    },
  ];

  const current = tourSteps[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ScanKavach Guided Feature Tour"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full p-6 text-slate-900 dark:text-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              ScanKavach Guided Tour ({step + 1}/4)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tour"
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {current.icon}
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {current.badge}
              </span>
              <h2 className="text-base sm:text-lg font-bold mt-1 text-slate-900 dark:text-slate-100">
                {current.title}
              </h2>
            </div>
          </div>

          <p className="text-xs font-semibold text-teal-600 dark:text-teal-400">
            {current.tagline}
          </p>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            {current.content}
          </p>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Exit Tour
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Previous
              </button>
            )}

            {step < tourSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Start Exploring
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
