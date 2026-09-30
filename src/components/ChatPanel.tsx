/**
 * @license
 * SPDX-License-Identifier: MIT
 * Accessible AI Assistant Chat Panel with local fallback and strict safety filters
 */
import { Bot, Key, Send, Shield, Sparkles, Trash2, User } from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
  AssistantContext,
  ChatMessage,
  queryAssistant,
  SUGGESTED_QUESTIONS,
} from '../lib/assistant';

interface ChatPanelProps {
  context?: AssistantContext;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ context }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello. I am the ScanKavach Assistant. I can explain screening thresholds, borderline scores, image quality tips, prevention guidelines, and when to seek clinical consultation. How can I help you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await queryAssistant(query, userApiKey || null, context);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev.slice(-9), assistantMsg]); // Keep last 10
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while generating a response. Please ask again or consult the Health Hub.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: 'Chat history cleared. How can I assist you with ScanKavach decision support?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div
      role="region"
      aria-label="AI Assistant Consultation"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden"
    >
      {/* Top Banner & Mode indicator */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-600 rounded-lg text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ScanKavach Assistant
            </h2>
            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
              {userApiKey ? '⚡ Gemini 2.5 Mode (Session Key)' : '🛡️ Local Offline Engine (No Key Required)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowKeyInput(!showKeyInput)}
            title="Configure optional Gemini API Key"
            className="p-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-1"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Key</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            title="Clear conversation"
            aria-label="Clear chat history"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Optional In-Memory Key Drawer */}
      {showKeyInput && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs space-y-2">
          <p className="text-slate-600 dark:text-slate-300">
            <strong>Security Notice:</strong> The key is held in tab memory only (never written to disk, storage, or logs). It is discarded on sign out or refresh.
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              placeholder="Paste Gemini API Key (optional)"
              value={userApiKey}
              onChange={(e) => setUserApiKey(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md outline-none focus:ring-1 focus:ring-teal-500 font-mono"
            />
            {userApiKey && (
              <button
                type="button"
                onClick={() => setUserApiKey('')}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Privacy & Safety Warning Banner */}
      <div className="px-4 py-2 bg-teal-50/70 dark:bg-teal-950/40 border-b border-teal-100 dark:border-teal-900/40 text-[11px] text-teal-800 dark:text-teal-300 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 shrink-0" />
        <span>
          <strong>Privacy Preserved:</strong> Only plain text summaries are sent to the assistant. Scans never leave your device. Not a diagnostic tool.
        </span>
      </div>

      {/* Messages area */}
      <div
        role="log"
        aria-live="polite"
        className="flex-1 p-4 overflow-y-auto space-y-4"
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
                <span
                  className={`block text-[10px] mt-1 text-right ${
                    isUser ? 'text-teal-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </span>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Consulting knowledge base...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Question Chips */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-2.5 py-1 text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 rounded-full whitespace-nowrap shadow-2xs hover:border-teal-400 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
      >
        <label htmlFor="chat-input-field" className="sr-only">
          Ask a question about medical imaging screening
        </label>
        <input
          id="chat-input-field"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about screening, thresholds, image quality, or prevention..."
          className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
          className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
