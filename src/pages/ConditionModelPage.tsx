/**
 * @license
 * SPDX-License-Identifier: MIT
 * ConditionModelPage: Supervised pattern classifier training, temperature calibration, and export
 */
import {
  AlertTriangle,
  Brain,
  CheckCircle,
  Download,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import {
  CLASS_MIN_IMAGES,
  CLASS_RECOMMENDED_IMAGES,
  EPOCHS,
  LEARNING_RATE,
  TRAIN_SPLIT,
} from '../config';
import {
  ClassSample,
  computeClassifierMetrics,
  ConfusionMatrixData,
  fitTemperature,
  stratifiedSplit,
} from '../lib/classifier';
import { extractFeatures, getTf } from '../lib/extractor';
import { loadImageFromFile } from '../lib/imageUtils';
import {
  ConditionModelData,
  exportConditionModelJson,
  getLoadedConditionModel,
  importConditionModel,
  setLoadedConditionModel,
} from '../lib/suggest';

interface ClassFolder {
  name: string;
  files: File[];
}

export const ConditionModelPage: React.FC = () => {
  const jsonImportRef = useRef<HTMLInputElement | null>(null);

  const [activeModel, setActiveModelState] = useState<ConditionModelData | null>(
    getLoadedConditionModel()
  );

  const [classes, setClasses] = useState<ClassFolder[]>([
    { name: 'Normal', files: [] },
    { name: 'Pneumonia', files: [] },
    { name: 'Tuberculosis', files: [] },
  ]);

  const [newClassName, setNewClassName] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [lossHistory, setLossHistory] = useState<{ epoch: number; loss: number; acc: number }[]>([]);
  const [metrics, setMetrics] = useState<ConfusionMatrixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddClass = () => {
    const clean = newClassName.trim().slice(0, 30);
    if (!clean) return;
    if (classes.some((c) => c.name.toLowerCase() === clean.toLowerCase())) {
      setError('A class with this name already exists.');
      return;
    }
    setClasses([...classes, { name: clean, files: [] }]);
    setNewClassName('');
    setError(null);
  };

  const handleRemoveClass = (idx: number) => {
    if (classes.length <= 2) {
      setError('A condition classifier requires at least 2 distinct classes.');
      return;
    }
    setClasses(classes.filter((_, i) => i !== idx));
  };

  const handleFilesAdded = (classIdx: number, fileList: FileList | null) => {
    if (!fileList) return;
    const added = Array.from(fileList);
    setClasses((prev) =>
      prev.map((c, i) => (i === classIdx ? { ...c, files: [...c.files, ...added] } : c))
    );
  };

  const startTraining = async () => {
    // 1. Validation
    for (const c of classes) {
      if (c.files.length < CLASS_MIN_IMAGES) {
        setError(
          `Class "${c.name}" has only ${c.files.length} images. Minimum ${CLASS_MIN_IMAGES} required.`
        );
        return;
      }
    }

    setError(null);
    setIsTraining(true);
    setLossHistory([]);

    try {
      const tf = await getTf();
      const allSamples: ClassSample[] = [];

      // Extract global embedding features for each image
      for (let cIdx = 0; cIdx < classes.length; cIdx++) {
        const cls = classes[cIdx];
        for (let fIdx = 0; fIdx < cls.files.length; fIdx++) {
          const file = cls.files[fIdx];
          const img = await loadImageFromFile(file);
          const feat = await extractFeatures(img);
          allSamples.push({
            id: `${cls.name}-${fIdx}`,
            features: feat.globalEmbedding,
            labelIndex: cIdx,
          });
        }
      }

      // Stratified Split
      const { train, test } = stratifiedSplit(allSamples, TRAIN_SPLIT, 42);

      const d = allSamples[0].features.length;
      const numClasses = classes.length;

      // Build single Dense Layer softmax head with L2 regularization
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          inputShape: [d],
          units: numClasses,
          kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
          activation: 'softmax',
        })
      );

      model.compile({
        optimizer: tf.train.adam(LEARNING_RATE),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
      });

      // Prepare training tensors
      const xTrain = tf.tensor2d(train.map((s) => s.features));
      const yTrain = tf.oneHot(
        tf.tensor1d(
          train.map((s) => s.labelIndex),
          'int32'
        ),
        numClasses
      );

      const xTest = tf.tensor2d(test.map((s) => s.features));

      const historyData: { epoch: number; loss: number; acc: number }[] = [];

      await model.fit(xTrain, yTrain, {
        epochs: EPOCHS,
        batchSize: 16,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            setTrainingEpoch(epoch + 1);
            if (logs) {
              historyData.push({
                epoch: epoch + 1,
                loss: Math.round((logs.loss || 0) * 1000) / 1000,
                acc: Math.round((logs.acc || 0) * 1000) / 1000,
              });
              setLossHistory([...historyData]);
            }
            await tf.nextFrame();
          },
        },
      });

      // Temperature scaling fit on validation slice
      const testPreds = model.predict(xTest) as import('@tensorflow/tfjs').Tensor2D;
      const testProbs = (await testPreds.array()) as number[][];
      const testLabels = test.map((s) => s.labelIndex);

      const temperature = fitTemperature(testProbs, testLabels);

      // Extract model weights & biases
      const [weightsTensor, biasesTensor] = model.layers[0].getWeights();
      const weights = (await weightsTensor.array()) as number[][];
      const biases = (await biasesTensor.array()) as number[];

      // Compute confusion matrix & metrics
      const computedMetrics = computeClassifierMetrics(
        testLabels,
        testProbs,
        classes.map((c) => c.name)
      );
      setMetrics(computedMetrics);

      const modelData: ConditionModelData = {
        id: `model-${Date.now()}`,
        version: '1.0.0',
        name: `CXR-Classifier-${new Date().toISOString().slice(0, 10)}`,
        createdAt: new Date().toISOString(),
        classes: classes.map((c) => c.name),
        weights,
        biases,
        temperature,
        metrics: {
          accuracy: computedMetrics.overallAccuracy,
          macroAuroc: computedMetrics.macroAuroc,
          testSamples: test.length,
        },
      };

      setLoadedConditionModel(modelData);
      setActiveModelState(modelData);
      showToast('Condition classifier trained, temperature-calibrated, and activated!');

      // Dispose tensors
      xTrain.dispose();
      yTrain.dispose();
      xTest.dispose();
      testPreds.dispose();
    } catch (err: any) {
      setError(err.message || 'Model training failed.');
    } finally {
      setIsTraining(false);
    }
  };

  const handleExportModel = () => {
    if (!activeModel) return;
    const json = exportConditionModelJson(activeModel);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scankavach-model-${activeModel.classes.join('-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Model exported as JSON.');
  };

  const handleImportModelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const loaded = importConditionModel(text);
      setActiveModelState(loaded);
      showToast('Condition model imported and activated!');
    } catch (err: any) {
      setError(`Import failed: ${err.message}`);
    }
  };

  return (
    <AppShell pageTitle="Condition Classifier Model">
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
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Supervised Condition Classifier
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
              Train a lightweight softmax regression head on top of the frozen MobileNet backbone.
              Fuses with the anomaly detector to provide calibrated diagnostic decision support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeModel && (
              <button
                type="button"
                onClick={handleExportModel}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export Model
              </button>
            )}

            <button
              type="button"
              onClick={() => jsonImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Import Model (.json)
            </button>
            <input
              ref={jsonImportRef}
              type="file"
              accept=".json"
              onChange={handleImportModelFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Dataset Shortcut Warning Banner */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <h3 className="font-bold">Dataset Confounder Warning</h3>
            <p>
              Do not mix datasets carelessly. If Normal images come from one hospital or dataset and Pneumonia images from another, the model can learn the scanner style instead of the disease. Prefer classes from the same source institution.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 rounded-xl text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Active Model Status Card */}
        {activeModel && (
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Active Condition Model
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Classes: {activeModel.classes.join(', ')}
                </h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                Active in Screening
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Test Accuracy</span>
                <strong className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {Math.round(activeModel.metrics.accuracy * 100)}%
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Macro AUROC</span>
                <strong className="text-base font-bold font-mono text-teal-600 dark:text-teal-400">
                  {activeModel.metrics.macroAuroc}
                </strong>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Calibrated Temp</span>
                <strong className="text-base font-bold font-mono text-slate-900 dark:text-slate-100">
                  {activeModel.temperature}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Class Data Management */}
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Training Classes & Datasets
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="New class name (e.g. Atelectasis)"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddClass}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Class
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls, idx) => (
              <div
                key={cls.name}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {cls.name}
                  </h4>
                  {classes.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveClass(idx)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  <span>{cls.files.length} images loaded</span>
                  {cls.files.length < CLASS_MIN_IMAGES && (
                    <span className="text-rose-500 block font-semibold">
                      (Min: {CLASS_MIN_IMAGES})
                    </span>
                  )}
                </div>

                <label className="block text-center py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-500/30 rounded-lg text-xs font-semibold cursor-pointer transition-colors">
                  Upload Scans
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesAdded(idx, e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>
            ))}
          </div>

          {/* Training Progress and Graph */}
          {isTraining && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                  Training Softmax Head (Epoch {trainingEpoch}/{EPOCHS})...
                </span>
              </div>

              {lossHistory.length > 0 && (
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossHistory}>
                      <XAxis dataKey="epoch" tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 9 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="loss" stroke="#ef4444" dot={false} strokeWidth={1.5} />
                      <Line type="monotone" dataKey="acc" stroke="#10b981" dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={startTraining}
              disabled={isTraining}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              {isTraining ? 'Training in Progress...' : 'Train Softmax Classifier'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
