/**
 * @license
 * SPDX-License-Identifier: MIT
 * Main responsive layout shell for ScanKavach
 */
import React, { useState } from 'react';
import { getAppLanguage, SupportedLanguage } from '../lib/i18n';
import { Sidebar } from './Sidebar';
import { SkipLink } from './SkipLink';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>(getAppLanguage());

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
      <SkipLink />

      {/* Navigation Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentLang={currentLang}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <TopBar
          title={pageTitle}
          onOpenSidebar={() => setSidebarOpen(true)}
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
        />

        <main id="main-content" tabIndex={-1} className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto outline-none">
          {children}
        </main>
      </div>
    </div>
  );
};
