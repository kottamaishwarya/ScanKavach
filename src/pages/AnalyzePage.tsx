/**
 * @license
 * SPDX-License-Identifier: MIT
 * AnalyzePage: Single-scan screening pipeline with input safety gate and visual explainability
 */
import {
  Activity,
  AlertCircle,
  Camera,
  FileSearch,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { GateRejectCard } from '../components/GateRejectCard';
import { ResultCard } from '../components/ResultCard';
import { saveAnalysisToHistory } from '../lib/history';
import { loadImageFromFile, validateImageFile } from '../lib/imageUtils';
import { AnalysisResult, analyzeImage } from '../lib/scorer';

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('Initializing analysis...');
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file.');
      return;
    }

    setLoading(true);
    setLoadingStage('Loading and stripping metadata...');

    try {
      const img = await loadImageFromFile(file);
      setImagePreviewUrl(img.src);

      setLoadingStage('Evaluating input safety gate...');
      const result = await analyzeImage(img, file.name);

      setCurrentResult(result);
      saveAnalysisToHistory(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try a different scan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleAskAi = (result: AnalysisResult) => {
    navigate('/assistant', {
      state: {
        context: {
          verdict: result.verdict?.label,
          score: result.score,
          percentile: result.verdict?.percentile,
          borderline: result.verdict?.borderline,
          gatePassed: result.gateResult.passed,
          suggestion: result.fusionResult?.topClass,
          suggestedConfidence: result.fusionResult?.topProbability,
          hasShift: result.shiftResult?.hasShift,
          reliability: result.reliabilityResult?.level,
        },
      },
    });
  };

  return (
    <AppShell pageTitle="Analyze Medical Scan">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        {!currentResult && !loading && (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-8 sm:p-12 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl text-center space-y-4 transition-all shadow-xs"
          >
            <div className="w-16 h-16 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload chest radiograph for decision support screening
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Drag and drop your DICOM/PNG/JPG chest X-ray, or browse your files.
                All processing occurs locally in your browser memory.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <FileSearch className="w-4 h-4" />
                Select Scan from Device
              </button>

              <label
                htmlFor="camera-input"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Capture with Camera
                <input
                  id="camera-input"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              Supported formats: PNG, JPG, WEBP • Max upload size: 15MB • Zero cloud transmission
            </p>
          </div>
        )}

        {/* Loading Progress State */}
        {loading && (
          <div className="p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm animate-pulse">
            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded-2xl flex items-center justify-center mx-auto">
              <Activity className="w-7 h-7 animate-spin" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Screening in progress...
            </h2>
            <p className="text-xs text-teal-600 dark:text-teal-400 font-mono font-medium">
              {loadingStage}
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Failed Gate Result */}
        {currentResult && !currentResult.gateResult.passed && (
          <div className="space-y-4">
            <GateRejectCard
              gateResult={currentResult.gateResult}
              onRetry={() => {
                setCurrentResult(null);
                setImagePreviewUrl(null);
              }}
            />
          </div>
        )}

        {/* Passed Screening Result */}
        {currentResult && currentResult.gateResult.passed && imagePreviewUrl && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Screening Assessment Complete
              </h2>
              <button
                type="button"
                onClick={() => {
                  setCurrentResult(null);
                  setImagePreviewUrl(null);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 rounded-lg transition-colors"
              >
                Analyze Another Scan
              </button>
            </div>

            <ResultCard
              result={currentResult}
              inputImageSource={imagePreviewUrl}
              onAskAi={handleAskAi}
            />
          </div>
        )}
      </div>
    </AppShell>
  );
};
