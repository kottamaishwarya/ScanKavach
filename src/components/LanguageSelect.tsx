/**
 * @license
 * SPDX-License-Identifier: MIT
 * Multilingual language selector component
 */
import React from 'react';
import { getAppLanguage, LANGUAGE_NAMES, setAppLanguage, SupportedLanguage } from '../lib/i18n';

interface LanguageSelectProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const LanguageSelect: React.FC<LanguageSelectProps> = ({ currentLang, onLanguageChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLang = e.target.value as SupportedLanguage;
    setAppLanguage(nextLang);
    onLanguageChange(nextLang);
  };

  return (
    <div className="relative inline-block text-left">
      <label htmlFor="language-select" className="sr-only">
        Select interface language
      </label>
      <select
        id="language-select"
        value={currentLang}
        onChange={handleChange}
        aria-label="Language selector"
        className="block w-full py-1.5 pl-3 pr-8 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer"
      >
        {(Object.keys(LANGUAGE_NAMES) as SupportedLanguage[]).map((code) => (
          <option key={code} value={code}>
            {LANGUAGE_NAMES[code]}
          </option>
        ))}
      </select>
    </div>
  );
};
