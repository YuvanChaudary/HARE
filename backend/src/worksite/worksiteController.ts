import { Request, Response, NextFunction } from 'express';
import { ApiResponse, WorksiteStatus, ShiftStatus } from '@hare/shared';
import { worksiteService } from './worksiteService.js';
import { AppError } from '../middleware/errorHandler.js';

export class WorksiteController {
  /**
   * GET /api/v1/worksites
   */
  public async listWorksites(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const statusFilter = req.query.status as WorksiteStatus | undefined;
      const worksites = await worksiteService.listWorksites(req.user, statusFilter);

      const response: ApiResponse<typeof worksites> = {
        data: worksites,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          count: worksites.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/worksites/:worksiteId
   */
  public async getWorksiteById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const worksite = await worksiteService.getWorksiteById(worksiteId, req.user);

      const response: ApiResponse<typeof worksite> = {
        data: worksite,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
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
   * POST /api/v1/worksites
   */
  public async createWorksite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const newWorksite = await worksiteService.createWorksite(req.user, req.body);

      const response: ApiResponse<typeof newWorksite> = {
        data: newWorksite,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          resource_version: 1,
        },
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/worksites/:worksiteId
   */
  public async updateWorksite(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const updated = await worksiteService.updateWorksite(worksiteId, req.user, req.body);

      const response: ApiResponse<typeof updated> = {
        data: updated,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/worksites/:worksiteId/zones/:zoneId
   */
  public async updateWorkZone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const zoneId = req.params.zoneId as string;
      const updatedWorksite = await worksiteService.updateWorkZone(worksiteId, zoneId, req.user, req.body);

      const response: ApiResponse<typeof updatedWorksite> = {
        data: updatedWorksite,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/worksites/:worksiteId/shifts
   */
  public async listShifts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const statusFilter = req.query.status as ShiftStatus | undefined;
      const shifts = await worksiteService.listShifts(worksiteId, req.user, statusFilter);

      const response: ApiResponse<typeof shifts> = {
        data: shifts,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          count: shifts.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/worksites/:worksiteId/shifts
   */
  public async createShift(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const newShift = await worksiteService.createShift(worksiteId, req.user, req.body);

      const response: ApiResponse<typeof newShift> = {
        data: newShift,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          resource_version: 1,
        },
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/worksites/:worksiteId/dashboard
   */
  public async getWorksiteDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('AUTHENTICATION_REQUIRED', 'Authentication required', 401);

      const worksiteId = req.params.worksiteId as string;
      const dashboard = await worksiteService.getWorksiteDashboard(worksiteId, req.user);

      const response: ApiResponse<typeof dashboard> = {
        data: dashboard,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const worksiteController = new WorksiteController();
