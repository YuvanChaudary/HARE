/**
 * Heat Action Response Engine (HARE) — Audit Service
 *
 * Implements tamper-evident, append-only compliance audit logging.
 * Matches docs/85_AUDIT_LOGGING.md and shared AuditEvent schema.
 */

import crypto from 'crypto';
import { AuditEvent, AuditEventType, UserRole, JwtUserPayload } from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';

export interface AuditFilters {
  worksiteId?: string;
  eventType?: AuditEventType;
  actorId?: string;
  entityId?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

export class AuditService {
  private collectionName = 'audit_events';

  /**
   * Appends an immutable audit event to the ledger with SHA-256 hash chaining.
   */
  public async logEvent(
    eventType: AuditEventType,
    actorId: string,
    actorRole: UserRole | 'SYSTEM',
    worksiteId: string,
    entityId: string,
    payloadSnapshot: Record<string, unknown>
  ): Promise<AuditEvent> {
    const events = await storage.readCollection<AuditEvent>(this.collectionName);

    const previousHash = events.length > 0
      ? events[events.length - 1].current_hash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp_utc = new Date().toISOString();
    const event_id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const hashPayload = JSON.stringify({
      event_id,
      timestamp_utc,
      event_type: eventType,
      actor_user_id: actorId,
      actor_role: actorRole,
      worksite_id: worksiteId,
      entity_id: entityId,
      previous_hash: previousHash,
      payload: payloadSnapshot,
    });

    const current_hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const auditEvent: AuditEvent = {
      event_id,
      timestamp_utc,
      event_type: eventType,
      actor_user_id: actorId,
      actor_role: actorRole,
      worksite_id: worksiteId,
      entity_id: entityId,
      payload_snapshot: payloadSnapshot,
      previous_hash: previousHash,
      current_hash,
    };

    events.push(auditEvent);
    await storage.writeCollection(this.collectionName, events);

    return auditEvent;
  }

  /**
   * Lists audit events with role and tenant-scoping filters.
   */
  public async listEvents(
    user: JwtUserPayload,
    filters: AuditFilters = {}
  ): Promise<AuditEvent[]> {
    const allEvents = await storage.readCollection<AuditEvent>(this.collectionName);

    let filtered = allEvents;

    // Role-based worksite scope confinement for supervisors
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        filtered = filtered.filter((e) => e.worksite_id === assigned);
      }
    }

    if (filters.worksiteId) {
      filtered = filtered.filter((e) => e.worksite_id === filters.worksiteId);
    }
    if (filters.eventType) {
      filtered = filtered.filter((e) => e.event_type === filters.eventType);
    }
    if (filters.actorId) {
      filtered = filtered.filter((e) => e.actor_user_id === filters.actorId);
    }
    if (filters.entityId) {
      filtered = filtered.filter((e) => e.entity_id === filters.entityId);
    }
    if (filters.fromDate) {
      const fromTime = new Date(filters.fromDate).getTime();
      filtered = filtered.filter((e) => new Date(e.timestamp_utc).getTime() >= fromTime);
    }
    if (filters.toDate) {
      const toTime = new Date(filters.toDate).getTime();
      filtered = filtered.filter((e) => new Date(e.timestamp_utc).getTime() <= toTime);
    }

    // Return newest events first
    filtered.sort(
      (a, b) => new Date(b.timestamp_utc).getTime() - new Date(a.timestamp_utc).getTime()
    );

    if (filters.limit && filters.limit > 0) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }
}

export const auditService = new AuditService();
