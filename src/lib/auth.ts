/**
 * @license
 * SPDX-License-Identifier: MIT
 * Client-side authentication using Web Crypto PBKDF2 (SHA-256)
 */

import { AUTH_EXPIRY_HOURS, LOCKOUT_SECONDS, MAX_FAILED_LOGINS } from '../config';
import { logger } from './logger';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'Clinician' | 'Radiology Technician' | 'Student/Researcher';
  saltHex: string;
  hashHex: string;
  createdAt: string;
}

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  role: 'Clinician' | 'Radiology Technician' | 'Student/Researcher';
  expiresAt: number;
}

const MEMORY_USERS: Map<string, UserAccount> = new Map();
let failedLoginCount = 0;
let lockoutUntilTime = 0;

/**
 * Constant-time comparison between two hex strings
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Derives a PBKDF2 hash using Web Crypto
 */
export async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates a random 16-byte salt in hex
 */
export function generateSalt(): Uint8Array {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return salt;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function checkLockout(): { locked: boolean; remainingSeconds: number } {
  const now = Date.now();
  if (now < lockoutUntilTime) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((lockoutUntilTime - now) / 1000),
    };
  }
  return { locked: false, remainingSeconds: 0 };
}

export function registerFailedAttempt(): { locked: boolean; remainingSeconds: number } {
  failedLoginCount++;
  if (failedLoginCount >= MAX_FAILED_LOGINS) {
    lockoutUntilTime = Date.now() + LOCKOUT_SECONDS * 1000;
    failedLoginCount = 0;
    return { locked: true, remainingSeconds: LOCKOUT_SECONDS };
  }
  return { locked: false, remainingSeconds: 0 };
}

export function resetFailedAttempts(): void {
  failedLoginCount = 0;
  lockoutUntilTime = 0;
}

/**
 * Storage wrapper with fallback
 */
function getStoredUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem('scankavach_users');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.warn('Failed reading localStorage users', err);
  }
  return Array.from(MEMORY_USERS.values());
}

function saveStoredUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem('scankavach_users', JSON.stringify(users));
  } catch (err) {
    logger.warn('Failed writing localStorage users', err);
  }
  for (const u of users) {
    MEMORY_USERS.set(u.email.toLowerCase(), u);
  }
}

/**
 * Register a new user account
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'Clinician' | 'Radiology Technician' | 'Student/Researcher'
): Promise<UserSession> {
  const normEmail = email.trim().toLowerCase();
  const users = getStoredUsers();

  if (users.some((u) => u.email.toLowerCase() === normEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const salt = generateSalt();
  const hashHex = await hashPassword(password, salt);
  const saltHex = bytesToHex(salt);

  const newUser: UserAccount = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    email: normEmail,
    role,
    saltHex,
    hashHex,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveStoredUsers(users);
  resetFailedAttempts();

  return createSession(newUser);
}

/**
 * Sign in existing user
 */
export async function loginUser(email: string, password: string): Promise<UserSession> {
  const lockout = checkLockout();
  if (lockout.locked) {
    throw new Error(`Too many failed attempts. Try again in ${lockout.remainingSeconds} seconds.`);
  }

  const normEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const user = users.find((u) => u.email.toLowerCase() === normEmail);

  if (!user) {
    registerFailedAttempt();
    throw new Error('Invalid email or password.');
  }

  const salt = hexToBytes(user.saltHex);
  const calculatedHash = await hashPassword(password, salt);

  if (!timingSafeEqualHex(calculatedHash, user.hashHex)) {
    registerFailedAttempt();
    throw new Error('Invalid email or password.');
  }

  resetFailedAttempts();
  return createSession(user);
}

/**
 * Instant demo sign-in
 */
export function loginDemoUser(): UserSession {
  resetFailedAttempts();
  const demoUser: UserAccount = {
    id: 'user-demo-clinician',
    name: 'Dr. A. Sharma',
    email: 'demo.clinician@scankavach.org',
    role: 'Clinician',
    saltHex: '',
    hashHex: '',
    createdAt: new Date().toISOString(),
  };
  return createSession(demoUser);
}

function createSession(user: UserAccount): UserSession {
  const session: UserSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + AUTH_EXPIRY_HOURS * 3600 * 1000,
  };

  try {
    sessionStorage.setItem('scankavach_session', JSON.stringify(session));
  } catch (err) {
    logger.warn('Failed to store session in sessionStorage', err);
  }

  return session;
}

export function getCurrentSession(): UserSession | null {
  try {
    const raw = sessionStorage.getItem('scankavach_session');
    if (raw) {
      const session: UserSession = JSON.parse(raw);
      if (session.expiresAt && Date.now() < session.expiresAt) {
        return session;
      }
      sessionStorage.removeItem('scankavach_session');
    }
  } catch (err) {
    logger.warn('Failed reading session', err);
  }
  return null;
}

export function logout(): void {
  try {
    sessionStorage.removeItem('scankavach_session');
  } catch {
    // ignore
  }
}
