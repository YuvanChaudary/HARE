import { Request, Response, NextFunction } from 'express';
import { ApiResponse, JwtUserPayload } from '@hare/shared';
import { escalationService } from './escalationService.js';
import { AppError } from '../middleware/errorHandler.js';

export class EscalationController {
  public async listEscalations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;

      const escalations = await escalationService.listEscalations(user, {
        worksiteId: (req.query.worksite_id || req.query.worksiteId) as string,
        state: req.query.state as any,
        supervisorId: (req.query.supervisor_id || req.query.supervisorId) as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      const response: ApiResponse<typeof escalations> = {
        data: escalations,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: escalations.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public async resolveEscalation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const escalationId = req.params.escalationId;
      const { resolution_notes } = req.body || {};

      if (!escalationId) {
        throw new AppError('VALIDATION_ERROR', 'escalationId is required.', 400);
      }

      const result = await escalationService.resolveEscalation(
        escalationId as string,
        resolution_notes || 'Resolved by Safety Manager in Operations Command Center',
        user
      );

      const response: ApiResponse<typeof result> = {
        data: result,
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

  public async simulateEscalation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const { worksite_id, reason, action_id } = req.body || {};

      const escalation = await escalationService.createEscalation(
        action_id || `act_demo_${Date.now()}`,
        worksite_id || (user.assigned_worksite_id && user.assigned_worksite_id !== 'ALL' ? user.assigned_worksite_id : 'WS-BLR-NORTH-04'),
        'usr_supervisor_rahul',
        (reason as any) || 'ACKNOWLEDGMENT_SLA_BREACH',
        'usr_mgr_ananya'
      );

      const response: ApiResponse<typeof escalation> = {
        data: escalation,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
        },
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const escalationController = new EscalationController();

