/**
 * @license
 * SPDX-License-Identifier: MIT
 * ScanKavach Main Application Root & Router
 */
import React, { Suspense, lazy } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';

// Code-split pages for sub-second startup
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const AnalyzePage = lazy(() =>
  import('./pages/AnalyzePage').then((m) => ({ default: m.AnalyzePage }))
);
const BankPage = lazy(() =>
  import('./pages/BankPage').then((m) => ({ default: m.BankPage }))
);
const BatchPage = lazy(() =>
  import('./pages/BatchPage').then((m) => ({ default: m.BatchPage }))
);
const EvaluationPage = lazy(() =>
  import('./pages/EvaluationPage').then((m) => ({ default: m.EvaluationPage }))
);
const ConditionModelPage = lazy(() =>
  import('./pages/ConditionModelPage').then((m) => ({ default: m.ConditionModelPage }))
);
const HealthHubPage = lazy(() =>
  import('./pages/HealthHubPage').then((m) => ({ default: m.HealthHubPage }))
);
const AssistantPage = lazy(() =>
  import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage }))
);
const ModelCardPage = lazy(() =>
  import('./pages/ModelCardPage').then((m) => ({ default: m.ModelCardPage }))
);
const QualityPage = lazy(() =>
  import('./pages/QualityPage').then((m) => ({ default: m.QualityPage }))
);
const HelpPage = lazy(() =>
  import('./pages/HelpPage').then((m) => ({ default: m.HelpPage }))
);
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);

const PageFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-teal-600 font-semibold text-sm">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping" />
      <span>Loading ScanKavach...</span>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Entry */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Workspace */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <AnalyzePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank"
              element={
                <ProtectedRoute>
                  <BankPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/batch"
              element={
                <ProtectedRoute>
                  <BatchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/evaluation"
              element={
                <ProtectedRoute>
                  <EvaluationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/condition-model"
              element={
                <ProtectedRoute>
                  <ConditionModelPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/health-hub"
              element={
                <ProtectedRoute>
                  <HealthHubPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <AssistantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/model-card"
              element={
                <ProtectedRoute>
                  <ModelCardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/quality"
              element={
                <ProtectedRoute>
                  <QualityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/about"
              element={
                <ProtectedRoute>
                  <AboutPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  );
}
