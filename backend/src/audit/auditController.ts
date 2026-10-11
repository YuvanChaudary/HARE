import { Request, Response, NextFunction } from 'express';
import { ApiResponse, JwtUserPayload } from '@hare/shared';
import { auditService } from './auditService.js';

export class AuditController {
  public async listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;

      const events = await auditService.listEvents(user, {
        worksiteId: (req.query.worksite_id || req.query.worksiteId) as string,
        eventType: req.query.event_type as any,
        actorId: req.query.actor_id as string,
        entityId: req.query.entity_id as string,
        fromDate: req.query.from_date as string,
        toDate: req.query.to_date as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
      });

      const response: ApiResponse<typeof events> = {
        data: events,
        meta: {
          request_id: (req as any).requestId || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: events.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const auditController = new AuditController();
