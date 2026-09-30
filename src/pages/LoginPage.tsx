/**
 * @license
 * SPDX-License-Identifier: MIT
 * LoginPage: Accessible client-side authentication with PBKDF2 and instant demo sign-in
 */
import { Eye, EyeOff, Lock, ShieldCheck, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APP_FULL_TITLE, APP_NAME, APP_TAGLINE } from '../config';
import {
  checkLockout,
  getCurrentSession,
  loginDemoUser,
  loginUser,
  registerUser,
} from '../lib/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Clinician' | 'Radiology Technician' | 'Student/Researcher'>('Clinician');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  useEffect(() => {
    // If already logged in, redirect immediately
    if (getCurrentSession()) {
      navigate('/dashboard', { replace: true });
    }

    // Check lockout timer
    const lock = checkLockout();
    if (lock.locked) {
      setLockoutRemaining(lock.remainingSeconds);
    }

    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters in length.');
      return;
    }

    setLoading(true);
    try {
      if (tab === 'signin') {
        await loginUser(email, password);
      } else {
        if (!name.trim()) {
          setError('Name is required for registration.');
          setLoading(false);
          return;
        }
        await registerUser(name, email, password, role);
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
      const lock = checkLockout();
      if (lock.locked) {
        setLockoutRemaining(lock.remainingSeconds);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    loginDemoUser();
    navigate(from, { replace: true });
  };

  const isLocked = lockoutRemaining > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-900 text-slate-100">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
        {/* Brand Left Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-teal-950 via-slate-900 to-slate-950 border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Medical Imaging Decision Support</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-6">
              {APP_NAME}
            </h1>
            <p className="text-teal-400 font-semibold text-sm mt-1">
              {APP_TAGLINE}
            </p>

            <p className="text-slate-400 text-xs sm:text-sm mt-4 leading-relaxed">
              {APP_FULL_TITLE}. Completely client-side, zero cloud exposure, and privacy guaranteed for clinical screening workflows.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Label-free healthy memory bank screening</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Input safety gate blocks false positives</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span>Empirically calibrated Normal / Review / Refer</span>
            </div>
          </div>
        </div>

        {/* Form Right Panel */}
        <div className="p-8 sm:p-10 bg-slate-900 flex flex-col justify-center">
          {/* Tabs */}
          <div className="flex rounded-lg bg-slate-950 p-1 mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setTab('signin');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === 'signin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                tab === 'register'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Lockout Warning */}
          {isLocked && (
            <div
              role="alert"
              className="p-3 mb-4 bg-amber-950/60 border border-amber-800 rounded-lg text-amber-200 text-xs flex items-center gap-2"
            >
              <Lock className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Account locked after multiple failed attempts. Please wait{' '}
                <strong>{lockoutRemaining}s</strong> before trying again.
              </span>
            </div>
          )}

          {/* Error Notice */}
          {error && !isLocked && (
            <div
              role="alert"
              className="p-3 mb-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-200 text-xs"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Rajesh Kumar"
                  disabled={isLocked || loading}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="user-email"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Work Email
              </label>
              <input
                id="user-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@hospital.org"
                disabled={isLocked || loading}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label
                htmlFor="user-password"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Password (min. 8 characters)
              </label>
              <div className="relative">
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLocked || loading}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label
                  htmlFor="user-role"
                  className="block text-xs font-medium text-slate-300 mb-1"
                >
                  Clinical Role
                </label>
                <select
                  id="user-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Clinician">Clinician (General / Pulmonology)</option>
                  <option value="Radiology Technician">Radiology Technician</option>
                  <option value="Student/Researcher">Student / Medical Researcher</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked || loading}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 mt-2"
            >
              {loading
                ? 'Verifying...'
                : tab === 'signin'
                ? 'Sign In to ScanKavach'
                : 'Create Local Account'}
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Or Instant Evaluation
            </span>
          </div>

          <button
            type="button"
            onClick={handleDemoSignIn}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <UserCheck className="w-4 h-4" />
            Continue as demo user (instant evaluation)
          </button>

          <p className="mt-6 text-[10px] text-center text-slate-500 leading-tight">
            Accounts are stored on this device only (demo authentication with PBKDF2-SHA256). No external cloud transmits your credentials.
          </p>
        </div>
      </div>
    </div>
  );
};
