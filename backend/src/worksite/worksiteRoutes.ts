import { Router } from 'express';
import { worksiteController } from './worksiteController.js';
import { riskController } from '../risk/riskController.js';
import { requireAuth, requireRole, requireWorksiteScope } from '../auth/authMiddleware.js';

export const worksiteRouter = Router();

// All worksite endpoints require authentication
worksiteRouter.use(requireAuth);

// 1. Worksite collection routes
worksiteRouter.get('/', (req, res, next) => worksiteController.listWorksites(req, res, next));

worksiteRouter.post(
  '/',
  requireRole('ADMIN'),
  (req, res, next) => worksiteController.createWorksite(req, res, next)
);

// 2. Specific worksite routes (with worksite scoping)
worksiteRouter.get(
  '/:worksiteId',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.getWorksiteById(req, res, next)
);

worksiteRouter.patch(
  '/:worksiteId',
  requireRole('SAFETY_MANAGER', 'ADMIN'),
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.updateWorksite(req, res, next)
);

worksiteRouter.patch(
  '/:worksiteId/zones/:zoneId',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.updateWorkZone(req, res, next)
);

// 3. Shift routes
worksiteRouter.get(
  '/:worksiteId/shifts',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.listShifts(req, res, next)
);

worksiteRouter.post(
  '/:worksiteId/shifts',
  requireRole('SAFETY_MANAGER', 'ADMIN'),
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.createShift(req, res, next)
);

// 4. Aggregated operational dashboard
worksiteRouter.get(
  '/:worksiteId/dashboard',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => worksiteController.getWorksiteDashboard(req, res, next)
);

// 5. Authoritative Risk sub-routes (docs/73_RISK_API.md Section 4 & 6)
worksiteRouter.get(
  '/:worksiteId/risk',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.getLatestRisk(req, res, next)
);

worksiteRouter.get(
  '/:worksiteId/risk/history',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.getRiskHistory(req, res, next)
);

worksiteRouter.post(
  '/:worksiteId/risk/assess',
  requireWorksiteScope('params', 'worksiteId'),
  (req, res, next) => riskController.evaluateRisk(req, res, next)
);
