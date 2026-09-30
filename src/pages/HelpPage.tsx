/**
 * @license
 * SPDX-License-Identifier: MIT
 * HelpPage: FAQ, Glossary, and Troubleshooting
 */
import { HelpCircle, Info, LifeBuoy } from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/AppShell';

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does ScanKavach detect diseases without diagnostic labels?',
      a: 'ScanKavach uses a patch-level memory bank approach (inspired by PatchCore). By indexing the neural feature patterns of verified healthy chest radiographs, any image with textures or opacities that deviate from the normal baseline is flagged as anomalous. This avoids the high cost and human annotation bottlenecks of requiring thousands of rare disease labels.',
    },
    {
      q: 'What does a "Borderline" screening score indicate?',
      a: 'A borderline score falls within a 5% margin of the review (95th percentile) or refer (99th percentile) threshold. Because biological variation across patients is continuous, borderline scores represent ambiguous transition zones and strictly mandate direct review by a qualified radiologist or physician.',
    },
    {
      q: 'Why did the input safety gate reject my image?',
      a: 'The safety gate protects against false alarms by verifying that the image is a valid diagnostic radiograph. Common rejection reasons include uploading a full-color photograph, a low-contrast/blank image, a blurry image, or an out-of-distribution body part (e.g. an extremity or abdominal X-ray).',
    },
    {
      q: 'Are patient images ever transmitted to cloud servers?',
      a: 'Never. ScanKavach executes completely in-browser via TensorFlow.js (using WebGL acceleration with CPU fallback). Images, pixel arrays, and DICOM metadata never leave your physical device.',
    },
    {
      q: 'Can ScanKavach diagnose a patient or prescribe medications?',
      a: 'No. ScanKavach is an assistive research and decision-support prototype. It does not possess medical regulatory clearance as an autonomous diagnostic device, and it never provides drug names or dosages.',
    },
  ];

  const glossary = [
    { term: 'Anomaly Score', def: 'The average distance of the top 3 most unusual image patches to their nearest healthy neighbor in the memory bank.' },
    { term: 'Empirical Percentile', def: 'The proportion of healthy validation scans that scored lower than the current scan. For example, the 98th percentile means the scan is more unusual than 98% of healthy validation radiographs.' },
    { term: 'Review Threshold', def: 'The 95th percentile of healthy validation scores. Approximately 5% of healthy scans naturally fall into Review by design to maintain high screening sensitivity.' },
    { term: 'Refer Threshold', def: 'The 99th percentile of healthy validation scores, marking the top 1% most marked deviations requiring rapid clinical follow-up.' },
    { term: 'Memory Bank', def: 'A sub-sampled repository of neural feature vectors extracted from healthy reference scans.' },
  ];

  return (
    <AppShell pageTitle="Help, FAQ & Medical Glossary">
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Help Center & Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Understanding mathematical calibration, screening boundaries, and troubleshooting common upload issues.
          </p>
        </div>

        {/* FAQs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Frequently Asked Questions
          </h3>

          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left p-3.5 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-teal-600 font-mono text-sm">
                    {openFaq === idx ? '−' : '+'}
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="p-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Glossary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Screening & Calibration Glossary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {glossary.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <strong className="text-slate-900 dark:text-slate-100 font-bold block text-teal-700 dark:text-teal-400">
                  {item.term}
                </strong>
                <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  {item.def}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Troubleshooting Card */}
        <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <LifeBuoy className="w-4 h-4 text-teal-600" />
            Troubleshooting Quick Guide
          </h4>
          <p className="text-slate-600 dark:text-slate-400">
            • <strong>Model will not load:</strong> Ensure your browser supports WebGL or check your network connection during initial script initialization.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            • <strong>High Latency:</strong> Close unnecessary browser tabs to free GPU/WebGL context buffers.
          </p>
        </div>
      </div>
    </AppShell>
  );
};
