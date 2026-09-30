/**
 * Unit tests for Authentication & PBKDF2 Hashing (auth.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  bytesToHex,
  checkLockout,
  generateSalt,
  hashPassword,
  hexToBytes,
  loginDemoUser,
  registerFailedAttempt,
  resetFailedAttempts,
  timingSafeEqualHex,
} from '../lib/auth';

describe('Authentication (auth.ts)', () => {
  it('generates 16-byte random salts', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1.length).toBe(16);
    expect(salt2.length).toBe(16);
    expect(salt1).not.toEqual(salt2);
  });

  it('converts bytes to hex and back losslessly', () => {
    const salt = generateSalt();
    const hex = bytesToHex(salt);
    const recovered = hexToBytes(hex);
    expect(recovered).toEqual(salt);
  });

  it('generates consistent PBKDF2 hash for same password and salt', async () => {
    const salt = new Uint8Array(16).fill(5);
    const hash1 = await hashPassword('SecurePass123!', salt);
    const hash2 = await hashPassword('SecurePass123!', salt);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // 256 bits = 64 hex chars
  });

  it('generates different hashes for different salts', async () => {
    const salt1 = new Uint8Array(16).fill(1);
    const salt2 = new Uint8Array(16).fill(2);
    const hash1 = await hashPassword('SamePassword', salt1);
    const hash2 = await hashPassword('SamePassword', salt2);
    expect(hash1).not.toBe(hash2);
  });

  it('compares hex strings in constant time', () => {
    expect(timingSafeEqualHex('abcd1234', 'abcd1234')).toBe(true);
    expect(timingSafeEqualHex('abcd1234', 'abcd9999')).toBe(false);
    expect(timingSafeEqualHex('abcd', 'abcdef')).toBe(false);
  });

  it('enforces lockout after 5 consecutive failed login attempts', () => {
    resetFailedAttempts();
    expect(checkLockout().locked).toBe(false);

    registerFailedAttempt();
    registerFailedAttempt();
    registerFailedAttempt();
    registerFailedAttempt();
    expect(checkLockout().locked).toBe(false);

    const lock = registerFailedAttempt(); // 5th attempt
    expect(lock.locked).toBe(true);
    expect(lock.remainingSeconds).toBeGreaterThan(0);
    expect(checkLockout().locked).toBe(true);

    resetFailedAttempts();
    expect(checkLockout().locked).toBe(false);
  });

  it('signs in demo user without credentials instantly', () => {
    const session = loginDemoUser();
    expect(session.userId).toBe('user-demo-clinician');
    expect(session.name).toBe('Dr. A. Sharma');
    expect(session.role).toBe('Clinician');
    expect(session.expiresAt).toBeGreaterThan(Date.now());
  });
});
