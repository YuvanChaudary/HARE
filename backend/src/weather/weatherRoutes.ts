import { Router } from 'express';
import { weatherController } from './weatherController.js';
import { requireAuth, requireRole, requireWorksiteScope } from '../auth/authMiddleware.js';

export const weatherRouter = Router({ mergeParams: true });

// All weather endpoints require authentication and worksite scoping
weatherRouter.use(requireAuth);
weatherRouter.use(requireWorksiteScope('params', 'worksiteId'));

// Read routes: Accessible to all roles scoped to the worksite
weatherRouter.get('/current', (req, res, next) => weatherController.getCurrentWeather(req, res, next));
weatherRouter.get('/forecast', (req, res, next) => weatherController.getForecast(req, res, next));
weatherRouter.get('/history', (req, res, next) => weatherController.getHistory(req, res, next));

// Administrative / managerial operations
weatherRouter.post(
  '/refresh',
  requireRole('SAFETY_MANAGER', 'ADMIN'),
  (req, res, next) => weatherController.refreshWeather(req, res, next)
);

weatherRouter.post(
  '/simulate',
  requireRole('SAFETY_MANAGER', 'ADMIN'),
  (req, res, next) => weatherController.setSimulation(req, res, next)
);

weatherRouter.post(
  '/clear-simulation',
  requireRole('SAFETY_MANAGER', 'ADMIN'),
  (req, res, next) => weatherController.clearSimulation(req, res, next)
);
