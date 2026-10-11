/**
 * Heat Action Response Engine (HARE) — Risk Routes
 *
 * Implements routing for Phase 5 Deterministic Heat Risk Engine:
 * Reference: PHASE.md Task 5.5
 *            docs/73_RISK_API.md
 */

import { Router } from 'express';
import { requireAuth, requireWorksiteScope } from '../auth/authMiddleware.js';
import { riskController } from './riskController.js';

// Primary risk router: mounted at /api/v1/risk
export const riskRouter = Router();

// Evaluate / assess on demand (Task 5.5)
riskRouter.post(
  '/evaluate/:worksiteId',
  requireAuth,
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.evaluateRisk(req, res, next)
);

// Get latest risk assessment (Task 5.5)
riskRouter.get(
  '/:worksiteId/latest',
  requireAuth,
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.getLatestRisk(req, res, next)
);

// Get risk assessment history
riskRouter.get(
  '/:worksiteId/history',
  requireAuth,
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.getRiskHistory(req, res, next)
);

// Get specific assessment by assessment ID
riskRouter.get(
  '/assessment/:assessmentId',
  requireAuth,
  (req, res, next) => riskController.getAssessmentById(req, res, next)
);

// Router for docs/73_RISK_API.md alias: mounted at /api/v1/risk-assessments
export const riskAssessmentsAliasRouter = Router();

riskAssessmentsAliasRouter.get(
  '/:riskId',
  requireAuth,
  (req, res, next) => riskController.getAssessmentById(req, res, next)
);
