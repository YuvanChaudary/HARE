import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../auth/authMiddleware.js';
import { ApiResponse, JwtUserPayload } from '@hare/shared';
import { dashboardService } from './dashboardService.js';

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

// GET /api/v1/dashboard/overview
dashboardRouter.get('/overview', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user as JwtUserPayload;
    const data = await dashboardService.getOverview(user);
    const response: ApiResponse<typeof data> = {
      data,
      meta: {
        request_id: (req as any).requestId || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/analytics
export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);

analyticsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user as JwtUserPayload;
    const data = await dashboardService.getAnalytics(user);
    const response: ApiResponse<typeof data> = {
      data,
      meta: {
        request_id: (req as any).requestId || `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
      },
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
