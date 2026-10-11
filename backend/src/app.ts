import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestCorrelation } from './middleware/requestCorrelation.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sendSuccess } from './utils/responseEnvelope.js';
import { storage } from './storage/localJsonDriver.js';
import { config } from './config.js';
import { authRouter } from './auth/authController.js';
import { weatherRouter } from './weather/weatherRoutes.js';
import { worksiteRouter } from './worksite/worksiteRoutes.js';
import { riskRouter, riskAssessmentsAliasRouter } from './risk/riskRoutes.js';
import { actionRouter, worksiteActionsRouter, assessmentActionsRouter } from './action/actionRoutes.js';
import { dashboardRouter, analyticsRouter } from './dashboard/dashboardRoutes.js';
import { escalationRouter } from './escalation/escalationRoutes.js';
import { auditRouter } from './audit/auditRoutes.js';

export function createApp(): express.Application {
  const app = express();

  // Standard Security & Body Parsers
  app.use(helmet());
  app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }));
  app.use(express.json());

  // Tracing Middleware
  app.use(requestCorrelation);

  // Health Check Endpoint (Public, unauthenticated)
  app.get('/api/v1/health', async (req, res, next) => {
    try {
      const storageHealth = await storage.checkHealth();
      const payload = {
        service: 'heat-action-response-engine',
        status: storageHealth.status === 'HEALTHY' ? 'HEALTHY' : 'DEGRADED',
        version: '1.0.0',
        environment: config.env,
        storage: {
          driver: config.storageDriver,
          status: storageHealth.status,
          writable: storageHealth.writable,
        },
        ai: {
          provider: config.aiProvider,
          model: config.nvidiaModel,
          configured: !!config.nvidiaApiKey,
        },
        timestamp_utc: new Date().toISOString(),
      };
      res.json(sendSuccess(req, payload));
    } catch (error) {
      next(error);
    }
  });

  // Authentication & RBAC Routes
  app.use('/api/v1/auth', authRouter);

  // Weather & Environmental Telemetry Routes
  app.use('/api/v1/worksites/:worksiteId/weather', weatherRouter);

  // Worksite & Shift Management Routes
  app.use('/api/v1/worksites', worksiteRouter);

  // Deterministic Heat Risk Engine Routes (Phase 5: Task 5.5 & docs/73_RISK_API.md)
  app.use('/api/v1/risk', riskRouter);
  app.use('/api/v1/risk-assessments', riskAssessmentsAliasRouter);

  // Deterministic Action Engine Routes (Phase 6: Task 6.5 & docs/74_ACTION_API.md)
  app.use('/api/v1/actions', actionRouter);
  app.use('/api/v1/worksites', worksiteActionsRouter);
  app.use('/api/v1/risk-assessments', assessmentActionsRouter);

  // Operational Dashboard & Analytics Routes
  app.use('/api/v1/dashboard', dashboardRouter);
  app.use('/api/v1/analytics', analyticsRouter);

  // Supervisory Escalations & Audit Trail Routes
  app.use('/api/v1/escalations', escalationRouter);
  app.use('/api/v1/audit', auditRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
