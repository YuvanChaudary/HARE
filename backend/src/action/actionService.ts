/**
 * Heat Action Response Engine (HARE) — Action Service
 *
 * Orchestrates deterministic action generation, deduplication, persistence,
 * and scoped retrieval for preventive workplace action directives.
 *
 * References:
 *   docs/16_ACTION_MODEL.md
 *   docs/40_ACTION_ENGINE.md
 *   docs/74_ACTION_API.md
 *   docs/79_ERROR_CONTRACTS.md
 *   PHASE.md Phase 6
 */

import {
  ActionRecord,
  ActionStatus,
  ActionPriority,
  ActionType,
  JwtUserPayload,
  RiskAssessmentResult,
  ShiftContext,
  Worksite,
} from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { worksiteService } from '../worksite/worksiteService.js';
import { evaluateActionRules, ActionEvaluationOptions } from './actionRuleEngine.js';
import { AppError } from '../middleware/errorHandler.js';
import { auditService } from '../audit/auditService.js';
import { escalationService } from '../escalation/escalationService.js';

export interface ActionFilters {
  worksiteId?: string;
  status?: ActionStatus;
  priority?: ActionPriority;
  shiftId?: string;
  assessmentId?: string;
  actionType?: ActionType;
  includeSimulation?: boolean;
  limit?: number;
}

export class ActionService {
  private actionCollection = 'actions';
  private riskCollection = 'risk_assessments';

  /**
   * Generates deterministic preventive actions for a given risk assessment ID.
   * Enforces idempotency and deduplication against active in-flight directives.
   */
  public async generateActionsForAssessment(
    assessmentId: string,
    user: JwtUserPayload,
    options: ActionEvaluationOptions = {}
  ): Promise<ActionRecord[]> {
    // 1. Retrieve the authoritative risk assessment
    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.riskCollection);
    const assessment = allAssessments.find(
      (a) => a.assessment_id === assessmentId || a.risk_id === assessmentId
    );

    if (!assessment) {
      throw new AppError(
        'ASSESSMENT_NOT_FOUND',
        `Risk assessment '${assessmentId}' was not found in authoritative records.`,
        404
      );
    }

    // 2. Retrieve worksite and verify authorization
    const worksite = await worksiteService.getWorksiteById(assessment.worksite_id, user);

    // 3. Resolve active shift context
    let activeShift: ShiftContext | null = null;
    if (assessment.shift_id) {
      const shifts = await worksiteService.listShifts(worksite.worksite_id, user);
      activeShift = shifts.find((s) => s.shift_id === assessment.shift_id) || null;
    } else {
      const shiftResolution = await worksiteService.resolveActiveShift(worksite);
      activeShift = shiftResolution.activeShift;
    }

    // 4. Pure deterministic action rule evaluation
    const candidateActions = evaluateActionRules(assessment, worksite, activeShift, options);

    // 5. Load existing actions for deduplication and idempotency
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);

    // If this assessment was already processed and generated actions exist, return them idempotently
    const existingForAssessment = allActions.filter(
      (a) => a.assessment_id === assessment.assessment_id || a.risk_id === assessment.assessment_id
    );

    if (existingForAssessment.length > 0) {
      return existingForAssessment;
    }

    // 6. Deduplicate against active (non-concluded) actions on the same site/shift
    // An action is active if status is PENDING_ACKNOWLEDGMENT, ACKNOWLEDGED, or IN_PROGRESS
    const activeStatuses: ActionStatus[] = ['PENDING_ACKNOWLEDGMENT', 'ACKNOWLEDGED', 'IN_PROGRESS'];
    const activeDeduplicationKeys = new Set(
      allActions
        .filter((a) => a.worksite_id === worksite.worksite_id && activeStatuses.includes(a.status))
        .map((a) => a.deduplication_key)
        .filter(Boolean)
    );

    const actionsToPersist: ActionRecord[] = [];
    const resultingActions: ActionRecord[] = [];

    for (const candidate of candidateActions) {
      if (candidate.deduplication_key && activeDeduplicationKeys.has(candidate.deduplication_key)) {
        // Redundant alert suppressed by deduplication rule
        const activeExisting = allActions.find(
          (a) => a.deduplication_key === candidate.deduplication_key && activeStatuses.includes(a.status)
        );
        if (activeExisting) {
          resultingActions.push(activeExisting);
        }
        continue;
      }

      actionsToPersist.push(candidate);
      resultingActions.push(candidate);
      if (candidate.deduplication_key) {
        activeDeduplicationKeys.add(candidate.deduplication_key);
      }
    }

    // 7. Persist newly created action records
    if (actionsToPersist.length > 0) {
      allActions.push(...actionsToPersist);
      await storage.writeCollection(this.actionCollection, allActions);

      // Backlink generated action IDs into the risk assessment record
      const actionIds = resultingActions.map((a) => a.action_id);
      const assessmentIdx = allAssessments.findIndex(
        (a) => a.assessment_id === assessment.assessment_id
      );
      if (assessmentIdx !== -1) {
        allAssessments[assessmentIdx].generated_action_ids = actionIds;
        await storage.writeCollection(this.riskCollection, allAssessments);
      }
    }

    return resultingActions;
  }

  /**
   * Generates actions directly for a worksite's latest assessment.
   */
  public async generateActionsForWorksite(
    worksiteId: string,
    user: JwtUserPayload,
    options: ActionEvaluationOptions = {}
  ): Promise<ActionRecord[]> {
    // Verify worksite exists & authorized
    await worksiteService.getWorksiteById(worksiteId, user);

    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.riskCollection);
    const siteAssessments = allAssessments.filter((a) => a.worksite_id === worksiteId);

    if (siteAssessments.length === 0) {
      throw new AppError(
        'ASSESSMENT_NOT_FOUND',
        `No prior risk assessment exists for worksite '${worksiteId}'. Trigger a risk evaluation first.`,
        404
      );
    }

    siteAssessments.sort(
      (a, b) => new Date(b.evaluated_at_utc).getTime() - new Date(a.evaluated_at_utc).getTime()
    );

    const latestAssessment = siteAssessments[0];
    return this.generateActionsForAssessment(latestAssessment.assessment_id, user, options);
  }

  /**
   * Lists actions within the authenticated user's authorized scope.
   */
  public async listActions(
    user: JwtUserPayload,
    filters: ActionFilters = {}
  ): Promise<ActionRecord[]> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);

    let scoped = allActions.filter((a) => {
      // Organization / Tenant scoping
      if (a.organization_id && a.organization_id !== user.org_id) {
        return false;
      }
      return true;
    });

    // Role-based worksite scoping
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL') {
        scoped = scoped.filter((a) => a.worksite_id === assigned);
      }
    }

    // Apply query filters
    if (filters.worksiteId) {
      scoped = scoped.filter((a) => a.worksite_id === filters.worksiteId);
    }
    if (filters.status) {
      scoped = scoped.filter((a) => a.status === filters.status);
    }
    if (filters.priority) {
      scoped = scoped.filter((a) => a.priority === filters.priority);
    }
    if (filters.shiftId) {
      scoped = scoped.filter((a) => a.shift_id === filters.shiftId);
    }
    if (filters.assessmentId) {
      scoped = scoped.filter(
        (a) => a.assessment_id === filters.assessmentId || a.risk_id === filters.assessmentId
      );
    }
    if (filters.actionType) {
      scoped = scoped.filter((a) => a.action_type === filters.actionType);
    }
    if (!filters.includeSimulation) {
      scoped = scoped.filter((a) => !a.is_simulation);
    }

    // Sort newest first
    scoped.sort(
      (a, b) => new Date(b.created_at_utc).getTime() - new Date(a.created_at_utc).getTime()
    );

    if (filters.limit && filters.limit > 0) {
      scoped = scoped.slice(0, filters.limit);
    }

    return scoped;
  }

  /**
   * Retrieves a single action by its unique ID.
   */
  public async getActionById(actionId: string, user: JwtUserPayload): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const action = allActions.find((a) => a.action_id === actionId);

    if (!action) {
      throw new AppError('ACTION_NOT_FOUND', `Action directive '${actionId}' was not found.`, 404);
    }

    // Tenant authorization check
    if (action.organization_id && action.organization_id !== user.org_id) {
      throw new AppError('AUTHORIZATION_DENIED', 'Cannot access action directives of other organizations.', 403);
    }

    // Supervisor scoping check
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL' && action.worksite_id !== assigned) {
        throw new AppError(
          'RESOURCE_ACCESS_DENIED',
          `Supervisor is not authorized to access actions for worksite '${action.worksite_id}'.`,
          403
        );
      }
    }

    return action;
  }

  /**
   * Retrieves all actions associated with a worksite.
   */
  public async getActionsByWorksite(
    worksiteId: string,
    user: JwtUserPayload,
    filters: ActionFilters = {}
  ): Promise<ActionRecord[]> {
    // Verify worksite access
    await worksiteService.getWorksiteById(worksiteId, user);
    return this.listActions(user, { ...filters, worksiteId });
  }

  /**
   * Retrieves all actions linked to an assessment ID.
   */
  public async getActionsByAssessment(
    assessmentId: string,
    user: JwtUserPayload
  ): Promise<ActionRecord[]> {
    return this.listActions(user, { assessmentId, includeSimulation: true });
  }

  /**
   * Acknowledges an action directive.
   */
  public async acknowledgeAction(
    actionId: string,
    user: JwtUserPayload,
    notes?: string
  ): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];

    // Enforce worksite scope
    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL' && action.worksite_id !== assigned) {
        throw new AppError('RESOURCE_ACCESS_DENIED', 'Cannot acknowledge action outside assigned worksite.', 403);
      }
    }

    // Atomic state update
    const now = new Date().toISOString();
    action.status = 'ACKNOWLEDGED';
    action.acknowledged_at_utc = now;
    action.acknowledged_by_user_id = user.sub;
    if (notes) {
      action.supervisor_notes = notes;
    }

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await auditService.logEvent(
      'ACTION_ACKNOWLEDGED',
      user.sub,
      user.role,
      action.worksite_id,
      action.action_id,
      { acknowledged_at_utc: now, notes }
    );

    return action;
  }

  /**
   * Starts field implementation for an acknowledged action.
   */
  public async startAction(actionId: string, user: JwtUserPayload): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];

    if (user.role === 'SUPERVISOR') {
      const assigned = user.assigned_worksite_id;
      if (assigned && assigned !== 'ALL' && action.worksite_id !== assigned) {
        throw new AppError('RESOURCE_ACCESS_DENIED', 'Cannot modify action outside assigned worksite.', 403);
      }
    }

    const now = new Date().toISOString();
    action.status = 'IN_PROGRESS';
    action.started_at_utc = now;

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await auditService.logEvent(
      'ACTION_IN_PROGRESS',
      user.sub,
      user.role,
      action.worksite_id,
      action.action_id,
      { started_at_utc: now }
    );

    return action;
  }

  /**
   * Reports a physical blocker on an action, triggering an immediate safety escalation.
   */
  public async reportBlocker(
    actionId: string,
    reason: string,
    user: JwtUserPayload
  ): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];
    action.status = 'ESCALATED';
    action.supervisor_notes = `BLOCKER: ${reason}`;

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await escalationService.createEscalation(
      action.action_id,
      action.worksite_id,
      user.sub,
      'SUPERVISOR_BLOCKED'
    );

    return action;
  }

  /**
   * Submits completion notes and evidence for an action.
   */
  public async submitCompletion(
    actionId: string,
    evidenceNotes: string,
    user: JwtUserPayload
  ): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];
    action.status = 'IN_PROGRESS'; // Pending verification
    action.verification_evidence = {
      checklist_confirmed: true,
      notes: evidenceNotes,
    };

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await auditService.logEvent(
      'ACTION_IN_PROGRESS',
      user.sub,
      user.role,
      action.worksite_id,
      action.action_id,
      { stage: 'COMPLETION_SUBMITTED', evidenceNotes }
    );

    return action;
  }

  /**
   * Verifies an action's physical execution (authorized for SAFETY_MANAGER and ADMIN).
   */
  public async verifyAction(
    actionId: string,
    decision: 'VERIFIED' | 'REJECTED',
    notes: string,
    user: JwtUserPayload
  ): Promise<ActionRecord> {
    if (user.role === 'SUPERVISOR') {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        'Only Safety Managers and Administrators can perform compliance verification.',
        403
      );
    }

    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];
    const now = new Date().toISOString();

    if (decision === 'VERIFIED') {
      action.status = 'VERIFIED';
      action.verified_at_utc = now;
      action.verified_by_user_id = user.sub;
    } else {
      action.status = 'IN_PROGRESS';
      action.supervisor_notes = `Verification rejected: ${notes}`;
    }

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await auditService.logEvent(
      'ACTION_VERIFIED',
      user.sub,
      user.role,
      action.worksite_id,
      action.action_id,
      { decision, notes, verified_at_utc: now }
    );

    return action;
  }

  /**
   * Triggers an escalation on an action due to SLA expiration or manual elevation.
   */
  public async escalateAction(
    actionId: string,
    reason: string = 'ACKNOWLEDGMENT_SLA_BREACH',
    user: JwtUserPayload
  ): Promise<ActionRecord> {
    const allActions = await storage.readCollection<ActionRecord>(this.actionCollection);
    const index = allActions.findIndex((a) => a.action_id === actionId);

    if (index === -1) {
      throw new AppError('ACTION_NOT_FOUND', `Action '${actionId}' was not found.`, 404);
    }

    const action = allActions[index];
    action.status = 'ESCALATED';

    allActions[index] = action;
    await storage.writeCollection(this.actionCollection, allActions);

    await escalationService.createEscalation(
      action.action_id,
      action.worksite_id,
      user.sub,
      reason as any
    );

    return action;
  }
}

export const actionService = new ActionService();
