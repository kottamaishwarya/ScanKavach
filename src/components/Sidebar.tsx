/**
 * @license
 * SPDX-License-Identifier: MIT
 * Responsive Accessible Sidebar navigation
 */
import {
  Activity,
  BarChart3,
  Bot,
  Brain,
  Database,
  FileCheck2,
  FileText,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  X,
} from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, APP_TAGLINE } from '../config';
import { SupportedLanguage, t } from '../lib/i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLanguage;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, currentLang }) => {
  const navItems = [
    { to: '/dashboard', label: t('navDashboard', currentLang), icon: LayoutDashboard },
    { to: '/analyze', label: t('navAnalyze', currentLang), icon: Activity },
    { to: '/bank', label: t('navBuildBank', currentLang), icon: Database },
    { to: '/batch', label: t('navBatch', currentLang), icon: Layers },
    { to: '/evaluation', label: t('navEvaluation', currentLang), icon: BarChart3 },
    { to: '/condition-model', label: t('navConditionModel', currentLang), icon: Brain },
    { to: '/health-hub', label: t('navHealthHub', currentLang), icon: HeartPulse },
    { to: '/assistant', label: t('navAssistant', currentLang), icon: Bot },
    { to: '/model-card', label: t('navModelCard', currentLang), icon: FileText },
    { to: '/quality', label: t('navQuality', currentLang), icon: FileCheck2 },
    { to: '/help', label: t('navHelp', currentLang), icon: HelpCircle },
    { to: '/about', label: t('navAbout', currentLang), icon: Info },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        aria-label="Main Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-lg text-white shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-white tracking-tight">{APP_NAME}</span>
              <p className="text-[10px] text-teal-400 font-medium truncate max-w-[130px]" title={APP_TAGLINE}>
                {APP_TAGLINE}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isActive
                      ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Privacy Note Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <p className="text-[11px] text-slate-400 leading-tight">
            🛡️ <strong className="text-slate-300">Privacy preserved:</strong> Medical images never leave this device.
          </p>
        </div>
      </aside>
    </>
  );
};
