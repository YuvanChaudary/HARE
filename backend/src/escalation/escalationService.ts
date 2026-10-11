/**
 * Heat Action Response Engine (HARE) — Escalation Service
 *
 * Tracks supervisory SLA breaches, deadline timeouts, and safety manager resolutions.
 * Matches docs/17_ESCALATION_MODEL.md & docs/77_ESCALATION_API.md
 */

import { EscalationRecord, EscalationState, JwtUserPayload } from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { auditService } from '../audit/auditService.js';
import { AppError } from '../middleware/errorHandler.js';

export interface EscalationFilters {
  worksiteId?: string;
  state?: EscalationState;
  supervisorId?: string;
  limit?: number;
}

export class EscalationService {
  private collectionName = 'escalations';

  /**
   * Creates an escalation record when an acknowledgment SLA breaches or blocker occurs.
   */
  public async createEscalation(
    actionId: string,
    worksiteId: string,
    supervisorId: string,
    reason: 'ACKNOWLEDGMENT_SLA_BREACH' | 'EXECUTION_TIMEOUT' | 'SUPERVISOR_BLOCKED',
    escalatedToUserId: string = 'usr_mgr_ananya'
  ): Promise<EscalationRecord> {
    const escalations = await storage.readCollection<EscalationRecord>(this.collectionName);

    // Idempotency: Do not duplicate active pending escalation for the same action
    const existing = escalations.find(
      (e) => e.action_id === actionId && (e.state === 'PENDING' || e.state === 'TRIGGERED')
    );
    if (existing) {
      return existing;
    }

    const escalation: EscalationRecord = {
      escalation_id: `esc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action_id: actionId,
      worksite_id: worksiteId,
      supervisor_id: supervisorId,
      escalated_to_user_id: escalatedToUserId,
      reason,
      state: 'TRIGGERED',
      triggered_at_utc: new Date().toISOString(),
    };

    escalations.push(escalation);
    await storage.writeCollection(this.collectionName, escalations);

    // Record immutable audit event
    await auditService.logEvent(
      'ACTION_ESCALATED',
      supervisorId,
      'SUPERVISOR',
      worksiteId,
      actionId,
      { escalation_id: escalation.escalation_id, reason, state: escalation.state }
    );

    return escalation;
  }

  /**
   * Lists escalations scoped to the user's role and assigned worksites.
   */
  public async listEscalations(
    user: JwtUserPayload,
    filters: EscalationFilters = {}
  ): Promise<EscalationRecord[]> {
    const all = await storage.readCollection<EscalationRecord>(this.collectionName);

    let scoped = all;

    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        scoped = scoped.filter((e) => e.worksite_id === assigned);
      }
    }

    if (filters.worksiteId) {
      scoped = scoped.filter((e) => e.worksite_id === filters.worksiteId);
    }
    if (filters.state) {
      scoped = scoped.filter((e) => e.state === filters.state);
    }
    if (filters.supervisorId) {
      scoped = scoped.filter((e) => e.supervisor_id === filters.supervisorId);
    }

    scoped.sort(
      (a, b) => new Date(b.triggered_at_utc).getTime() - new Date(a.triggered_at_utc).getTime()
    );

    if (filters.limit && filters.limit > 0) {
      scoped = scoped.slice(0, filters.limit);
    }

    return scoped;
  }

  /**
   * Resolves an escalation with safety manager authorization.
   */
  public async resolveEscalation(
    escalationId: string,
    resolutionNotes: string,
    user: JwtUserPayload
  ): Promise<EscalationRecord> {
    if (user.role === 'SUPERVISOR') {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        'Only Safety Managers and Administrators can resolve escalations.',
        403
      );
    }

    const escalations = await storage.readCollection<EscalationRecord>(this.collectionName);
    const index = escalations.findIndex((e) => e.escalation_id === escalationId);

    if (index === -1) {
      throw new AppError('NOT_FOUND', `Escalation '${escalationId}' not found.`, 404);
    }

    const item = escalations[index];
    item.state = 'RESOLVED';
    item.resolved_at_utc = new Date().toISOString();
    item.resolution_notes = resolutionNotes;

    escalations[index] = item;
    await storage.writeCollection(this.collectionName, escalations);

    await auditService.logEvent(
      'ACTION_VERIFIED',
      user.sub,
      user.role,
      item.worksite_id,
      item.action_id,
      { escalation_id: item.escalation_id, resolution_notes: resolutionNotes, state: 'RESOLVED' }
    );

    return item;
  }
}

export const escalationService = new EscalationService();
