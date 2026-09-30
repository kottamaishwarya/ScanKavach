/**
 * @license
 * SPDX-License-Identifier: MIT
 * DashboardPage: Central analytics, health metrics, and workflow actions
 */
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Download,
  PlusCircle,
  Shield,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppShell } from '../components/AppShell';
import { HistoryTable } from '../components/HistoryTable';
import { StatCard } from '../components/StatCard';
import { TourModal } from '../components/TourModal';
import { RECOMMENDED_NORMALS } from '../config';
import { getCurrentSession } from '../lib/auth';
import { clearHistory, exportHistoryCsv, getHistory, loadSampleHistory } from '../lib/history';
import { getActiveBank, importBankJson } from '../lib/memoryBank';
import { aggregateTimings, getRecentTimings } from '../lib/perf';
import { calculatePreventionProgress, getStoredPreventionItems } from '../lib/prevention';
import { computeDashboardStats, DashboardStats, HistoryItem } from '../lib/stats';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const session = getCurrentSession();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bankPatches, setBankPatches] = useState<number>(0);
  const [hasSampleBankAvailable, setHasSampleBankAvailable] = useState<boolean>(false);
  const [preventionProgress, setPreventionProgress] = useState<number>(0);
  const [tourOpen, setTourOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeBank = getActiveBank();
  const perf = aggregateTimings(getRecentTimings());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const refreshData = () => {
    const h = getHistory();
    setHistory(h);
    setStats(computeDashboardStats(h));

    const bank = getActiveBank();
    setBankPatches(bank ? bank.patchCount : 0);

    if (session) {
      const items = getStoredPreventionItems(session.userId);
      setPreventionProgress(calculatePreventionProgress(items));
    }
  };

  useEffect(() => {
    refreshData();

    // Check if sample bank exists in public/
    fetch('/sample-bank.json', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setHasSampleBankAvailable(true);
      })
      .catch(() => setHasSampleBankAvailable(false));
  }, []);

  const handleLoadSampleData = () => {
    loadSampleHistory();
    refreshData();
    showToast('Loaded synthetic demo screening history.');
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your local screening history?')) {
      clearHistory();
      refreshData();
      showToast('Screening history cleared.');
    }
  };

  const handleExportCsv = () => {
    const csv = exportHistoryCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'scankavach-history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported history as safe CSV.');
  };

  const handleLoadSampleBank = async () => {
    try {
      const res = await fetch('/sample-bank.json');
      const text = await res.text();
      importBankJson(text);
      refreshData();
      showToast('Loaded calibrated sample chest X-ray bank!');
    } catch {
      showToast('Failed to load sample bank.');
    }
  };

  const donutColors = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <AppShell pageTitle="Clinical Screening Dashboard">
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-slate-900 text-teal-300 border border-teal-500/40 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in"
          >
            {toastMessage}
          </div>
        )}

        {/* Top Banner & Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
              Welcome back, {session?.name || 'Clinician'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Label-free anomaly screening with mathematical percentile calibration and device privacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <Activity className="w-4 h-4" />
              Analyze Scan
            </button>

            <button
              type="button"
              onClick={() => navigate('/bank')}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Build Bank
            </button>

            <button
              type="button"
              onClick={() => setTourOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <Compass className="w-4 h-4" />
              Take the tour (60s)
            </button>

            <button
              type="button"
              onClick={handleLoadSampleData}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Load sample data
            </button>

            {hasSampleBankAvailable && bankPatches === 0 && (
              <button
                type="button"
                onClick={handleLoadSampleBank}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                Load sample bank
              </button>
            )}
          </div>
        </div>

        {/* Bank Health Alert Card (if bank has fewer than recommended normals) */}
        {activeBank && activeBank.patchCount / 196 < RECOMMENDED_NORMALS && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <h3 className="font-bold">Reference Bank Health Warning</h3>
              <p className="mt-0.5">
                The current bank contains features from fewer than {RECOMMENDED_NORMALS} healthy scans. While operational, adding more normal scans will improve empirical percentile calibration and reduce false positive rates.
              </p>
            </div>
          </div>
        )}

        {/* Metric Summary StatCards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Screenings"
            value={stats?.totalScans ?? 0}
            subtext={`${stats?.gateRejections ?? 0} stopped by safety gate`}
            icon={<Activity className="w-4 h-4" />}
            highlight="teal"
          />

          <StatCard
            label="Triage Breakdown"
            value={`${stats?.normalCount ?? 0} Normal`}
            subtext={`${stats?.reviewCount ?? 0} Review / ${stats?.referCount ?? 0} Refer (${stats?.borderlineCount ?? 0} Borderline)`}
            icon={<Shield className="w-4 h-4" />}
          />

          <StatCard
            label="Average Latency"
            value={`${stats?.avgLatencyMs ?? 0} ms`}
            subtext="Target: < 1000 ms per analysis"
            badge={perf.meetsUnder1sTarget ? 'Meets Target' : 'High Load'}
            icon={<Clock className="w-4 h-4" />}
            highlight={perf.meetsUnder1sTarget ? 'default' : 'amber'}
          />

          <StatCard
            label="Prevention Score"
            value={`${preventionProgress}%`}
            subtext="Community respiratory protection ring"
            icon={<CheckCircle2 className="w-4 h-4" />}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Triage Verdict Donut */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4 flex items-center justify-between">
              <span>Triage Verdict Ratio</span>
              <span className="text-[10px] text-slate-400 font-normal">All Time</span>
            </h3>

            {stats && stats.totalScans > 0 ? (
              <div className="h-52 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.verdictDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {stats.verdictDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-xs text-slate-400">
                No scans recorded yet
              </div>
            )}

            <div className="flex justify-around pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                ● Normal: {stats?.normalCount ?? 0}
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                ● Review: {stats?.reviewCount ?? 0}
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                ● Refer: {stats?.referCount ?? 0}
              </span>
            </div>
          </div>

          {/* Last 30 Scores Line Chart with Review and Refer Threshold Lines */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Recent Anomaly Score Sequence & Threshold Bands
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="text-amber-500 font-semibold">-- Review ({activeBank?.reviewThreshold ?? 1.0})</span>
                <span className="text-rose-500 font-semibold">-- Refer ({activeBank?.referThreshold ?? 1.5})</span>
              </div>
            </div>

            {stats && stats.recentScores.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.recentScores}>
                    <XAxis dataKey="index" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" domain={[0, 'auto']} />
                    <Tooltip />
                    <ReferenceLine
                      y={activeBank?.reviewThreshold ?? 1.0}
                      stroke="#f59e0b"
                      strokeDasharray="3 3"
                    />
                    <ReferenceLine
                      y={activeBank?.referThreshold ?? 1.5}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                    />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ r: 3, fill: '#0d9488' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                No score sequence available yet. Perform an analysis to view calibrated trend.
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Volume & Performance Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 7-Day Trend Bar Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-4">
              7-Day Screening Volume
            </h3>
            {stats && stats.dailyTrend.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyTrend}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                No daily data
              </div>
            )}
          </div>

          {/* Latency Stage Breakdown Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Latency Breakdown by Stage (Last 20 Runs)
              </h3>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                Total Avg: {perf.avgTotal} ms
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Preprocessing & Quality extraction:</span>
                <span className="font-mono font-medium">{perf.avgPreprocessing} ms</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full"
                  style={{ width: `${Math.min(100, (perf.avgPreprocessing / Math.max(1, perf.avgTotal)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                <span>MobileNet Feature Extraction:</span>
                <span className="font-mono font-medium">{perf.avgFeatureExtraction} ms</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full"
                  style={{ width: `${Math.min(100, (perf.avgFeatureExtraction / Math.max(1, perf.avgTotal)) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 pt-1">
                <span>Nearest-Neighbour Search (Chunked tf.matmul):</span>
                <span className="font-mono font-medium">{perf.avgNnSearch} ms</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-700 h-full"
                  style={{ width: `${Math.min(100, (perf.avgNnSearch / Math.max(1, perf.avgTotal)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Screening Table */}
        <HistoryTable
          history={history}
          onClearHistory={handleClearHistory}
          onExportCsv={handleExportCsv}
          onSelectRow={(item) => navigate(`/analyze`)}
        />

        {/* Guided Tour Modal */}
        <TourModal isOpen={tourOpen} onClose={() => setTourOpen(false)} />
      </div>
    </AppShell>
  );
};
