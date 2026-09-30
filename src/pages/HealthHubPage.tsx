/**
 * @license
 * SPDX-License-Identifier: MIT
 * HealthHubPage: Public health education, symptom questionnaire, and prevention checklist
 */
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  HeartPulse,
  HelpCircle,
  MapPin,
  PhoneCall,
  Search,
  Shield,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';
import { AppShell } from '../components/AppShell';
import {
  EMERGENCY_NOTICE,
  HEALTH_CONDITIONS,
  HEALTH_DISCLAIMER,
  HEALTH_SOURCES_NOTE,
  HealthCondition,
} from '../data/healthContent';
import { getCurrentSession } from '../lib/auth';
import {
  DEFAULT_PREVENTION_ITEMS,
  getStoredPreventionItems,
  PreventionItem,
  saveStoredPreventionItems,
} from '../lib/prevention';
import {
  SymptomAnswers,
  SymptomTriageResult,
  triageSymptoms,
} from '../lib/symptomCheck';

export const HealthHubPage: React.FC = () => {
  const session = getCurrentSession();
  const userId = session?.userId || 'guest';

  const [activeTab, setActiveTab] = useState<'conditions' | 'symptoms' | 'prevention'>('conditions');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<HealthCondition | null>(HEALTH_CONDITIONS[0]);

  // Symptom Questionnaire state
  const [symptoms, setSymptoms] = useState<SymptomAnswers>({
    coughOverTwoWeeks: false,
    fever: false,
    nightSweats: false,
    unexplainedWeightLoss: false,
    bloodInSputum: false,
    chestPain: false,
    difficultyBreathingAtRest: false,
    blueLipsOrConfusion: false,
    tbContact: false,
    smoker: false,
    ageVulnerable: false,
    chronicIllness: false,
  });

  const [triageResult, setTriageResult] = useState<SymptomTriageResult | null>(null);

  // Prevention checklist state
  const [preventionItems, setPreventionItems] = useState<PreventionItem[]>(
    getStoredPreventionItems(userId)
  );

  const handleTogglePrevention = (id: string) => {
    const updated = preventionItems.map((item) =>
      item.id === id
        ? {
            ...item,
            completed: !item.completed,
            completedAt: !item.completed ? new Date().toISOString() : undefined,
          }
        : item
    );
    setPreventionItems(updated);
    saveStoredPreventionItems(userId, updated);
  };

  const handleRunTriage = () => {
    const res = triageSymptoms(symptoms);
    setTriageResult(res);
  };

  const filteredConditions = HEALTH_CONDITIONS.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.whatItIs.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppShell pageTitle="Community Health Hub & Prevention">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Mandatory Educational Disclaimer Banner */}
        <div className="p-4 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-2xl flex items-center gap-3 text-teal-950 dark:text-teal-200">
          <Shield className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <p className="text-xs font-semibold">{HEALTH_DISCLAIMER}</p>
        </div>

        {/* Emergency Notice Card */}
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3 text-rose-900 dark:text-rose-200">
            <PhoneCall className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{EMERGENCY_NOTICE}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.google.com/maps/search/hospital+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Nearest Hospital
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('conditions')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'conditions'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Respiratory Conditions & Guidelines
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('symptoms')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'symptoms'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Symptom Assessment Questionnaire
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prevention')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'prevention'
                ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Prevention Checklist Tracker
          </button>
        </div>

        {/* TAB 1: Conditions */}
        {activeTab === 'conditions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Condition List & Search */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>

              <div className="space-y-1.5">
                {filteredConditions.map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition-colors ${
                      selectedCondition?.id === cond.id
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 text-teal-900 dark:text-teal-200 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {cond.name}
                  </button>
                ))}
              </div>

              {/* Find Care Links */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Find Clinical Care
                </h4>
                <div className="flex flex-col gap-1.5 pt-1">
                  <a
                    href="https://www.google.com/maps/search/chest+specialist+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-between"
                  >
                    <span>Chest specialist near me</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://www.google.com/maps/search/government+TB+testing+centre+near+me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 dark:text-teal-400 hover:underline flex items-center justify-between"
                  >
                    <span>Government TB testing centre (NTEP)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Condition Detail Panel */}
            {selectedCondition && (
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {selectedCondition.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {selectedCondition.whatItIs}
                  </p>
                </div>

                {/* Common Symptoms */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Common Symptoms
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {selectedCondition.commonSymptoms.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Higher Risk */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Who Is At Higher Risk
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {selectedCondition.whoIsAtHigherRisk.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    How to Reduce Risk (Prevention)
                  </h4>
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                    {selectedCondition.prevention.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* When to see doctor & what they do */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                      When to See a Doctor
                    </h4>
                    <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                      {selectedCondition.whenToSeeDoctor.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 mb-1">
                      What Clinicians Usually Do
                    </h4>
                    <ul className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 list-disc list-inside">
                      {selectedCondition.whatDoctorsUsuallyDo.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Myths vs Facts */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Myths vs Facts
                  </h4>
                  <div className="space-y-2">
                    {selectedCondition.mythsVsFacts.map((mf, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/80 text-xs"
                      >
                        <p className="text-rose-600 dark:text-rose-400 font-medium">
                          <strong>Myth:</strong> {mf.myth}
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                          <strong>Fact:</strong> {mf.fact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Symptom Assessment Questionnaire */}
        {activeTab === 'symptoms' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Respiratory Symptom Self-Assessment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Answer these questions to evaluate your respiratory urgency. No disease diagnosis is generated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { id: 'coughOverTwoWeeks', label: 'Cough lasting more than 2 weeks' },
                { id: 'fever', label: 'Recurring fever or chills' },
                { id: 'nightSweats', label: 'Drenching night sweats' },
                { id: 'unexplainedWeightLoss', label: 'Unexplained weight loss or loss of appetite' },
                { id: 'bloodInSputum', label: 'Coughing up blood or blood-tinged phlegm' },
                { id: 'chestPain', label: 'Sharp chest pain when breathing or coughing' },
                { id: 'difficultyBreathingAtRest', label: 'Shortness of breath or breathing difficulty at rest' },
                { id: 'blueLipsOrConfusion', label: 'Bluish tint to lips or sudden confusion' },
                { id: 'tbContact', label: 'Close household contact with an active TB patient' },
                { id: 'smoker', label: 'Active tobacco smoker or high secondhand smoke' },
                { id: 'ageVulnerable', label: 'Age over 60 or under 5 years old' },
                { id: 'chronicIllness', label: 'Underlying chronic illness (Asthma, COPD, Diabetes, HIV)' },
              ].map((q) => (
                <label
                  key={q.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={(symptoms as any)[q.id]}
                    onChange={(e) =>
                      setSymptoms({ ...symptoms, [q.id]: e.target.checked })
                    }
                    className="w-4 h-4 text-teal-600 rounded accent-teal-600 cursor-pointer"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">
                    {q.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRunTriage}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Evaluate Triage Urgency
              </button>
            </div>

            {/* Triage Output */}
            {triageResult && (
              <div
                role="alert"
                className={`p-5 rounded-xl border ${
                  triageResult.urgency === 'Seek urgent care now'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    : triageResult.urgency === 'See a doctor soon'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold uppercase tracking-wider">
                    Assessment: {triageResult.urgency}
                  </h4>
                </div>

                <div className="text-xs space-y-1">
                  <strong>Triggered Factors:</strong>
                  <ul className="list-disc list-inside">
                    {triageResult.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs space-y-1">
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside">
                    {triageResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Prevention Checklist Tracker */}
        {activeTab === 'prevention' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Respiratory Health Protection Checklist
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Evidence-based lifestyle shields supporting pulmonary immunity. Changes save to this device.
              </p>
            </div>

            <div className="space-y-3">
              {preventionItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleTogglePrevention(item.id)}
                        className="w-4 h-4 text-teal-600 rounded accent-teal-600"
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {item.title}
                      </span>
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6">
                      💡 <strong>Why this helps:</strong> {item.whyThisHelps}
                    </p>
                  </div>

                  {item.completed && item.completedAt && (
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400 shrink-0">
                      Logged {new Date(item.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources attribution */}
        <p className="text-[11px] text-slate-400 text-center">
          {HEALTH_SOURCES_NOTE}
        </p>
      </div>
    </AppShell>
  );
};
