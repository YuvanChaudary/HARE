import { Router, Request, Response, NextFunction } from 'express';
import { authService } from './authService.js';
import { requireAuth, requireWorksiteScope } from './authMiddleware.js';
import { sendSuccess } from '../utils/responseEnvelope.js';

export const authRouter = Router();

/**
 * POST /api/v1/auth/login
 * Public endpoint: Authenticates with email and password, returning JWT and profile.
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const session = await authService.login(email, password);
    res.json(sendSuccess(req, session));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * Protected endpoint: Returns authenticated caller's profile.
 */
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await authService.getProfile(req.user!.sub);
    res.json(sendSuccess(req, profile));
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/auth/test-scope/:worksiteId
 * Protected test endpoint: Validates worksite scoping permissions.
 */
authRouter.get(
  '/test-scope/:worksiteId',
  requireAuth,
  requireWorksiteScope('params', 'worksiteId'),
  (req: Request, res: Response) => {
    res.json(
      sendSuccess(req, {
        message: 'Access granted to worksite',
        worksite_id: req.params.worksiteId,
        user_id: req.user!.sub,
        user_role: req.user!.role,
      })
    );
  }
);
