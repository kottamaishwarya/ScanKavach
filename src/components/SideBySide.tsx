/**
 * @license
 * SPDX-License-Identifier: MIT
 * Side-by-Side Visual Comparison with Heatmap Overlay & Opacity Slider
 */
import { Eye, EyeOff, Layers, Sparkles } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { renderHeatmapToImageData } from '../lib/heatmap';

interface SideBySideProps {
  inputImageSource: HTMLImageElement | HTMLCanvasElement | string;
  patchScores?: number[];
  nearestHealthyThumbnail?: string;
  areaPercent?: number;
  region?: string;
  explanationSentence?: string;
}

export const SideBySide: React.FC<SideBySideProps> = ({
  inputImageSource,
  patchScores,
  nearestHealthyThumbnail,
  areaPercent = 0,
  region = 'centre',
  explanationSentence,
}) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [opacity, setOpacity] = useState(0.5);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !inputImageSource || !patchScores || patchScores.length === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw base input image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = 224;
      canvas.height = 224;
      ctx.clearRect(0, 0, 224, 224);
      ctx.drawImage(img, 0, 0, 224, 224);

      if (showHeatmap) {
        const minS = Math.min(...patchScores);
        const maxS = Math.max(...patchScores);
        const heatmapImgData = renderHeatmapToImageData(patchScores, minS, maxS, 14, 224, opacity);

        // Render overlay onto offscreen canvas then blend
        const overlayCanvas = document.createElement('canvas');
        overlayCanvas.width = 224;
        overlayCanvas.height = 224;
        overlayCanvas.getContext('2d')!.putImageData(heatmapImgData, 0, 0);

        ctx.drawImage(overlayCanvas, 0, 0);
      }
    };

    if (typeof inputImageSource === 'string') {
      img.src = inputImageSource;
    } else if (inputImageSource instanceof HTMLImageElement) {
      img.src = inputImageSource.src;
    } else if (inputImageSource instanceof HTMLCanvasElement) {
      img.src = inputImageSource.toDataURL();
    }
  }, [inputImageSource, patchScores, showHeatmap, opacity]);

  return (
    <div className="space-y-4">
      {/* Side-by-side grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Uploaded scan with Heatmap overlay */}
        <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center border border-slate-800">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-400" />
              Uploaded Scan (with Heatmap)
            </span>
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded text-xs transition-colors"
            >
              {showHeatmap ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showHeatmap ? 'Hide Overlay' : 'Show Overlay'}
            </button>
          </div>

          <div className="relative w-56 h-56 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-700 shadow-md">
            <canvas ref={canvasRef} className="w-full h-full object-cover" />
          </div>

          {/* Opacity control slider */}
          {showHeatmap && (
            <div className="w-full max-w-xs mt-3 flex items-center gap-2">
              <label htmlFor="heatmap-opacity" className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                Heatmap Opacity:
              </label>
              <input
                id="heatmap-opacity"
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 font-mono w-8 text-right">
                {Math.round(opacity * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Closest healthy scan from reference bank */}
        <div className="bg-slate-900 rounded-xl p-4 flex flex-col items-center border border-slate-800">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Nearest Healthy Scan (Reference Bank)
            </span>
            <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
              Healthy Exemplar
            </span>
          </div>

          <div className="relative w-56 h-56 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-700 shadow-md">
            {nearestHealthyThumbnail ? (
              <img
                src={nearestHealthyThumbnail}
                alt="Nearest healthy reference scan"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 text-slate-500 text-xs">
                No healthy reference thumbnail available
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center max-w-xs">
            Closest matching tissue architecture from your calibrated healthy baseline.
          </p>
        </div>
      </div>

      {/* Plain language explanation banner */}
      <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-xl text-teal-950 dark:text-teal-200">
        <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 mb-1">
          Spatial Localization Observation:
        </h3>
        <p className="text-sm font-medium">
          {explanationSentence || `Unusual pattern in the ${region} of the image, about ${areaPercent}% of the area. Not a diagnosis.`}
        </p>
        <p className="text-[11px] text-teal-700/80 dark:text-teal-300/80 mt-1">
          *Note: Spatial indications refer strictly to the 2D image coordinates (e.g. &ldquo;lower right of the image&rdquo;), not anatomical lung laterality.
        </p>
      </div>
    </div>
  );
};
