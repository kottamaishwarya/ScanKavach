/**
 * @license
 * SPDX-License-Identifier: MIT
 * Status indicator pills for neural model and calibrated memory bank
 */
import { Cpu, Database } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getActiveBank } from '../lib/memoryBank';

export const ModelStatus: React.FC = () => {
  const [bankPatches, setBankPatches] = useState<number>(0);

  useEffect(() => {
    const bank = getActiveBank();
    if (bank) {
      setBankPatches(bank.patchCount);
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Neural Extractor Pill */}
      <span
        title="MobileNet v1 0.25 (conv_pw_11_relu, 14x14 spatial features)"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      >
        <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="hidden sm:inline">Model:</span> MobileNet v1
      </span>

      {/* Memory Bank Pill */}
      <span
        title={bankPatches > 0 ? `Active memory bank loaded with ${bankPatches} patches` : 'No custom bank loaded'}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
      >
        <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        <span className="hidden sm:inline">Bank:</span> {bankPatches > 0 ? `${bankPatches} patches` : 'Ready'}
      </span>
    </div>
  );
};
