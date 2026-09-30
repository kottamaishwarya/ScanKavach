/**
 * @license
 * SPDX-License-Identifier: MIT
 * Audit log management for compliance and transparency
 */

import { toCsvString } from './csv';
import { logger } from './logger';

export type AuditAction =
  | 'login'
  | 'logout'
  | 'bank_built'
  | 'bank_imported'
  | 'model_trained'
  | 'model_imported'
  | 'scan_analysed'
  | 'threshold_changed'
  | 'report_exported'
  | 'data_cleared';

export interface AuditEntry {
  id: string;
  userId: string;
  action: AuditAction;
  details: string;
  timestamp: string;
}

const MEMORY_LOGS: AuditEntry[] = [];

export function addAuditLog(userId: string, action: AuditAction, details: string): void {
  const entry: AuditEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    action,
    details,
    timestamp: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem('scankavach_audit_log');
    const logs: AuditEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift(entry);
    if (logs.length > 500) {
      logs.length = 500;
    }
    localStorage.setItem('scankavach_audit_log', JSON.stringify(logs));
  } catch (err) {
    logger.warn('Failed to save audit log to localStorage', err);
    MEMORY_LOGS.unshift(entry);
  }
}

export function getAuditLogs(): AuditEntry[] {
  try {
    const raw = localStorage.getItem('scankavach_audit_log');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.warn('Failed to read audit log', err);
  }
  return [...MEMORY_LOGS];
}

export function clearAuditLogs(): void {
  try {
    localStorage.removeItem('scankavach_audit_log');
  } catch {
    // ignore
  }
  MEMORY_LOGS.length = 0;
}

export function exportAuditLogsCsv(): string {
  const logs = getAuditLogs();
  const headers = ['ID', 'User ID', 'Action', 'Details', 'Timestamp'];
  const rows = logs.map((l) => [l.id, l.userId, l.action, l.details, l.timestamp]);
  return toCsvString(headers, rows);
}
