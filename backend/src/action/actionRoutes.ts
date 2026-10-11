/**
 * Heat Action Response Engine (HARE) — Action Routes
 *
 * Exposes REST routes for Phase 6 Deterministic Action Engine:
 * Reference: docs/74_ACTION_API.md
 *            docs/70_API_CONTRACTS.md
 */

import { Router } from 'express';
import { requireAuth } from '../auth/authMiddleware.js';
import { actionController } from './actionController.js';

export const actionRouter = Router();

// Apply mandatory JWT authentication
actionRouter.use(requireAuth);

// POST /api/v1/actions/generate/:worksiteId
actionRouter.post('/generate/:worksiteId', (req, res, next) =>
  actionController.generateForWorksite(req, res, next)
);

// GET /api/v1/actions
actionRouter.get('/', (req, res, next) =>
  actionController.listActions(req, res, next)
);

// GET /api/v1/actions/:actionId
actionRouter.get('/:actionId', (req, res, next) =>
  actionController.getActionById(req, res, next)
);

// PATCH /api/v1/actions/:actionId/acknowledge
actionRouter.patch('/:actionId/acknowledge', (req, res, next) =>
  actionController.acknowledge(req, res, next)
);

// PATCH /api/v1/actions/:actionId/start
actionRouter.patch('/:actionId/start', (req, res, next) =>
  actionController.start(req, res, next)
);

// PATCH /api/v1/actions/:actionId/block
actionRouter.patch('/:actionId/block', (req, res, next) =>
  actionController.reportBlocker(req, res, next)
);

// PATCH /api/v1/actions/:actionId/complete
actionRouter.patch('/:actionId/complete', (req, res, next) =>
  actionController.submitCompletion(req, res, next)
);

// PATCH /api/v1/actions/:actionId/verify
actionRouter.patch('/:actionId/verify', (req, res, next) =>
  actionController.verify(req, res, next)
);

// POST /api/v1/actions/:actionId/escalate
actionRouter.post('/:actionId/escalate', (req, res, next) =>
  actionController.escalate(req, res, next)
);

// Additional router mounted on /api/v1/worksites for actions
export const worksiteActionsRouter = Router({ mergeParams: true });
worksiteActionsRouter.use(requireAuth);

// POST /api/v1/worksites/:worksiteId/actions/generate
worksiteActionsRouter.post('/:worksiteId/actions/generate', (req, res, next) =>
  actionController.generateForWorksite(req, res, next)
);

// GET /api/v1/worksites/:worksiteId/actions
worksiteActionsRouter.get('/:worksiteId/actions', (req, res, next) =>
  actionController.getActionsForWorksite(req, res, next)
);

// Additional router mounted on /api/v1/risk-assessments for actions
export const assessmentActionsRouter = Router({ mergeParams: true });
assessmentActionsRouter.use(requireAuth);

// POST /api/v1/risk-assessments/:assessmentId/actions
assessmentActionsRouter.post('/:assessmentId/actions', (req, res, next) =>
  actionController.generateForAssessment(req, res, next)
);

// GET /api/v1/risk-assessments/:assessmentId/actions
assessmentActionsRouter.get('/:assessmentId/actions', (req, res, next) =>
  actionController.getActionsForAssessment(req, res, next)
);
