/**
 * Unit tests for Audit Logging (auditLog.ts)
 */
import { describe, expect, it } from 'vitest';
import {
  addAuditLog,
  clearAuditLogs,
  exportAuditLogsCsv,
  getAuditLogs,
} from '../lib/auditLog';

describe('Audit Logging (auditLog.ts)', () => {
  it('appends and reads audit records in order', () => {
    clearAuditLogs();
    addAuditLog('user-1', 'login', 'User logged in via demo session');
    addAuditLog('user-1', 'scan_analysed', 'Analysed test-scan.png');

    const logs = getAuditLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].action).toBe('scan_analysed');
    expect(logs[1].action).toBe('login');
  });

  it('exports audit log to valid CSV string', () => {
    clearAuditLogs();
    addAuditLog('u1', 'bank_built', 'Created memory bank with 50 scans');
    const csv = exportAuditLogsCsv();
    expect(csv).toContain('Action');
    expect(csv).toContain('bank_built');
  });

  it('clears all audit records cleanly', () => {
    addAuditLog('u1', 'login', 'login');
    clearAuditLogs();
    expect(getAuditLogs().length).toBe(0);
  });
});
