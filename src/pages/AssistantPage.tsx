/**
 * @license
 * SPDX-License-Identifier: MIT
 * AssistantPage: Conversational AI assistance with local and Gemini mode
 */
import { Bot } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { ChatPanel } from '../components/ChatPanel';
import { AssistantContext } from '../lib/assistant';

export const AssistantPage: React.FC = () => {
  const location = useLocation();
  const context = (location.state as any)?.context as AssistantContext | undefined;

  return (
    <AppShell pageTitle="ScanKavach Clinical Assistant">
      <div className="max-w-4xl mx-auto space-y-4">
        {context && (
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs flex items-center justify-between text-teal-950 dark:text-teal-200">
            <span>
              <strong>Active Scan Context Loaded:</strong> Verdict:{' '}
              {context.verdict || 'N/A'} (Score: {context.score ?? 'N/A'},{' '}
              {context.percentile ?? 'N/A'}th percentile)
            </span>
          </div>
        )}

        <ChatPanel context={context} />
      </div>
    </AppShell>
  );
};
