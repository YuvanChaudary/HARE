import { Router } from 'express';
import { requireAuth } from '../auth/authMiddleware.js';
import { auditController } from './auditController.js';

export const auditRouter = Router();

auditRouter.use(requireAuth);

// GET /api/v1/audit
auditRouter.get('/', (req, res, next) => auditController.listEvents(req, res, next));
