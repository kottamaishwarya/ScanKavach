/**
 * @license
 * SPDX-License-Identifier: MIT
 * Accessible TopBar with user controls, language selector, and theme toggle
 */
import { LogOut, Menu, Moon, Sun, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getCurrentSession, logout, UserSession } from '../lib/auth';
import { SupportedLanguage } from '../lib/i18n';
import { LanguageSelect } from './LanguageSelect';
import { ModelStatus } from './ModelStatus';

interface TopBarProps {
  onOpenSidebar: () => void;
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSidebar,
  currentLang,
  onLanguageChange,
  title,
}) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setSession(getCurrentSession());

    // Check system or saved preference
    const savedTheme = localStorage.getItem('scankavach_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('scankavach_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('scankavach_theme', 'light');
    }
  };

  const handleSignOut = () => {
    logout();
    window.location.hash = '/login';
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open sidebar navigation"
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status Indicators */}
        <div className="hidden lg:block">
          <ModelStatus />
        </div>

        {/* Language selector */}
        <LanguageSelect currentLang={currentLang} onLanguageChange={onLanguageChange} />

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* User Profile & Sign out */}
        {session && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {session.name}
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                {session.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              title="Sign out"
              aria-label="Sign out of ScanKavach"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
