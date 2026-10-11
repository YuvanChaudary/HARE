import { Router } from 'express';
import { requireAuth } from '../auth/authMiddleware.js';
import { escalationController } from './escalationController.js';

export const escalationRouter = Router();

escalationRouter.use(requireAuth);

// GET /api/v1/escalations
escalationRouter.get('/', (req, res, next) => escalationController.listEscalations(req, res, next));

// POST /api/v1/escalations/simulate
escalationRouter.post('/simulate', (req, res, next) =>
  escalationController.simulateEscalation(req, res, next)
);

// PATCH /api/v1/escalations/:escalationId/resolve
escalationRouter.patch('/:escalationId/resolve', (req, res, next) =>
  escalationController.resolveEscalation(req, res, next)
);

