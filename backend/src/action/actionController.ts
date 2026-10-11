/**
 * Heat Action Response Engine (HARE) — Action Controller
 *
 * Implements REST endpoints for Phase 6 Deterministic Action Engine:
 * Reference: docs/74_ACTION_API.md
 *            docs/70_API_CONTRACTS.md
 *            docs/79_ERROR_CONTRACTS.md
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, JwtUserPayload } from '@hare/shared';
import { actionService, ActionFilters } from './actionService.js';
import { AppError } from '../middleware/errorHandler.js';

export class ActionController {
  /**
   * Generates or retrieves deterministic actions for a worksite's latest assessment.
   * Routes:
   *   POST /api/v1/actions/generate/:worksiteId
   *   POST /api/v1/worksites/:worksiteId/actions/generate
   */
  public async generateForWorksite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const worksiteId = req.params.worksiteId as string;

      if (!worksiteId) {
        throw new AppError('VALIDATION_ERROR', 'worksiteId route parameter is required.', 400);
      }

      // Security Invariant: Client cannot dictate action priority or status!
      if (req.body && (req.body.priority || req.body.status || req.body.action_id)) {
        throw new AppError(
          'CLIENT_OVERRIDE_PROHIBITED',
          'Clients are strictly prohibited from dictating or overriding action priorities, statuses, or IDs.',
          422
        );
      }

      const assessmentId = req.body?.assessment_id || req.body?.assessmentId;
      const targetZoneId = req.body?.target_zone_id || req.body?.targetZoneId;

      let actions;
      if (assessmentId) {
        actions = await actionService.generateActionsForAssessment(assessmentId, user, { targetZoneId });
      } else {
        actions = await actionService.generateActionsForWorksite(worksiteId, user, { targetZoneId });
      }

      const response: ApiResponse<typeof actions> = {
        data: actions,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: actions.length,
          resource_version: 1,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Generates or retrieves actions linked to a specific assessment ID.
   * Route: POST /api/v1/risk-assessments/:assessmentId/actions
   */
  public async generateForAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const assessmentId = req.params.assessmentId as string;

      if (!assessmentId) {
        throw new AppError('VALIDATION_ERROR', 'assessmentId parameter is required.', 400);
      }

      // Security Invariant: Client cannot dictate priority or status!
      if (req.body && (req.body.priority || req.body.status || req.body.action_id)) {
        throw new AppError(
          'CLIENT_OVERRIDE_PROHIBITED',
          'Clients are strictly prohibited from dictating or overriding action priorities, statuses, or IDs.',
          422
        );
      }

      const targetZoneId = req.body?.target_zone_id || req.body?.targetZoneId;
      const actions = await actionService.generateActionsForAssessment(assessmentId, user, { targetZoneId });

      const response: ApiResponse<typeof actions> = {
        data: actions,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: actions.length,
          resource_version: 1,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Lists actions within the authenticated user's authorized scope.
   * Route: GET /api/v1/actions
   */
  public async listActions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;

      const filters: ActionFilters = {
        worksiteId: (req.query.worksite_id || req.query.worksiteId) as string,
        status: req.query.status as any,
        priority: req.query.priority as any,
        shiftId: (req.query.shift_id || req.query.shiftId) as string,
        assessmentId: (req.query.assessment_id || req.query.assessmentId) as string,
        actionType: (req.query.action_type || req.query.actionType) as any,
        includeSimulation: req.query.include_simulation === 'true' || req.query.includeSimulation === 'true',
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      };

      const actions = await actionService.listActions(user, filters);

      const response: ApiResponse<typeof actions> = {
        data: actions,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: actions.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves a single action by actionId.
   * Route: GET /api/v1/actions/:actionId
   */
  public async getActionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;

      if (!actionId) {
        throw new AppError('VALIDATION_ERROR', 'actionId parameter is required.', 400);
      }

      const action = await actionService.getActionById(actionId, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          resource_version: 1,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all actions for a specific worksite.
   * Route: GET /api/v1/worksites/:worksiteId/actions
   */
  public async getActionsForWorksite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const worksiteId = req.params.worksiteId as string;

      if (!worksiteId) {
        throw new AppError('VALIDATION_ERROR', 'worksiteId parameter is required.', 400);
      }

      const filters: ActionFilters = {
        status: req.query.status as any,
        priority: req.query.priority as any,
        includeSimulation: req.query.include_simulation === 'true' || req.query.includeSimulation === 'true',
      };

      const actions = await actionService.getActionsByWorksite(worksiteId, user, filters);

      const response: ApiResponse<typeof actions> = {
        data: actions,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: actions.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves all actions linked to an assessment ID.
   * Route: GET /api/v1/risk-assessments/:assessmentId/actions
   */
  public async getActionsForAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const assessmentId = req.params.assessmentId as string;

      if (!assessmentId) {
        throw new AppError('VALIDATION_ERROR', 'assessmentId parameter is required.', 400);
      }

      const actions = await actionService.getActionsByAssessment(assessmentId, user);

      const response: ApiResponse<typeof actions> = {
        data: actions,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: actions.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/actions/:actionId/acknowledge
   */
  public async acknowledge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;
      const notes = req.body?.notes;

      const action = await actionService.acknowledgeAction(actionId, user, notes);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/actions/:actionId/start
   */
  public async start(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;

      const action = await actionService.startAction(actionId, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/actions/:actionId/block
   */
  public async reportBlocker(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;
      const reason = req.body?.reason || 'Field supervisor reported physical impediment';

      const action = await actionService.reportBlocker(actionId, reason, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/actions/:actionId/complete
   */
  public async submitCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;
      const notes = req.body?.notes || 'Field mitigations staged successfully';

      const action = await actionService.submitCompletion(actionId, notes, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/actions/:actionId/verify
   */
  public async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;
      const decision = req.body?.decision === 'REJECTED' ? 'REJECTED' : 'VERIFIED';
      const notes = req.body?.notes || 'Verified compliant with safety protocol';

      const action = await actionService.verifyAction(actionId, decision, notes, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/actions/:actionId/escalate
   */
  public async escalate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const actionId = req.params.actionId as string;
      const reason = req.body?.reason || 'ACKNOWLEDGMENT_SLA_BREACH';

      const action = await actionService.escalateAction(actionId, reason, user);

      const response: ApiResponse<typeof action> = {
        data: action,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const actionController = new ActionController();
