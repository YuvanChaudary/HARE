/**
 * Heat Action Response Engine (HARE) — Risk Controller
 *
 * Implements REST endpoints for Phase 5 Deterministic Heat Risk Engine:
 * Reference: docs/73_RISK_API.md
 *            docs/70_API_CONTRACTS.md
 *            docs/79_ERROR_CONTRACTS.md
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, JwtUserPayload } from '@hare/shared';
import { riskAssessmentService, AssessOptions, HistoryFilters } from './riskAssessmentService.js';
import { AppError } from '../middleware/errorHandler.js';

export class RiskController {
  /**
   * Evaluates or recalculates risk assessment on demand for a worksite.
   * Routes:
   *   POST /api/v1/risk/evaluate/:worksiteId
   *   POST /api/v1/worksites/:worksiteId/risk/assess
   */
  public async evaluateRisk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const worksiteId = req.params.worksiteId as string;

      if (!worksiteId) {
        throw new AppError('VALIDATION_ERROR', 'worksiteId route parameter is required.', 400);
      }

      // Security Invariant: Client cannot submit or dictate risk levels!
      if (req.body && (req.body.risk_level !== undefined || req.body.riskLevel !== undefined)) {
        throw new AppError(
          'CLIENT_OVERRIDE_PROHIBITED',
          'Clients are strictly prohibited from submitting, dictating, or overriding risk levels.',
          422
        );
      }

      const options: AssessOptions = {
        shiftId: req.body?.shift_id || req.body?.shiftId,
        forceTelemetryRefresh: Boolean(req.body?.force_telemetry_refresh ?? req.body?.forceTelemetryRefresh),
        workloadOverride: req.body?.workload_override || req.body?.workloadOverride,
        exposureOverride: req.body?.exposure_override || req.body?.exposureOverride,
        acclimatizationContext: req.body?.acclimatization_context || req.body?.acclimatizationContext,
        scenarioId: req.body?.scenario_id || req.body?.scenarioId,
        reason: req.body?.reason,
      };

      const assessment = await riskAssessmentService.assessWorksite(worksiteId, user, options);

      const response: ApiResponse<typeof assessment> = {
        data: assessment,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
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
   * Retrieves latest risk assessment for a worksite.
   * Routes:
   *   GET /api/v1/risk/:worksiteId/latest
   *   GET /api/v1/worksites/:worksiteId/risk
   */
  public async getLatestRisk(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const worksiteId = req.params.worksiteId as string;

      if (!worksiteId) {
        throw new AppError('VALIDATION_ERROR', 'worksiteId route parameter is required.', 400);
      }

      const assessment = await riskAssessmentService.getLatestAssessment(worksiteId, user);

      const response: ApiResponse<typeof assessment> = {
        data: assessment,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
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
   * Retrieves historical risk evaluations for a worksite.
   * Routes:
   *   GET /api/v1/risk/:worksiteId/history
   *   GET /api/v1/worksites/:worksiteId/risk/history
   */
  public async getRiskHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const worksiteId = req.params.worksiteId as string;

      const filters: HistoryFilters = {
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        cursor: req.query.cursor as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        riskLevel: req.query.risk_level as any,
        dataQuality: req.query.data_quality as any,
        includeSimulation: req.query.include_simulation === 'true',
      };

      const result = await riskAssessmentService.getAssessmentHistory(worksiteId, user, filters);

      const response: ApiResponse<typeof result.assessments> & { next_cursor?: string } = {
        data: result.assessments,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          count: result.assessments.length,
        },
        ...(result.nextCursor ? { next_cursor: result.nextCursor } : {}),
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Retrieves an immutable risk assessment record by assessment_id / risk_id.
   * Routes:
   *   GET /api/v1/risk/assessment/:assessmentId
   *   GET /api/v1/risk-assessments/:riskId
   */
  public async getAssessmentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = (req as any).user as JwtUserPayload;
      const riskId = (req.params.assessmentId || req.params.riskId) as string;

      if (!riskId) {
        throw new AppError('VALIDATION_ERROR', 'assessment identifier is required.', 400);
      }

      const assessment = await riskAssessmentService.getAssessmentById(riskId, user);

      const response: ApiResponse<typeof assessment> = {
        data: assessment,
        meta: {
          request_id: (req as any).requestId || (req.headers['x-request-id'] as string) || `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          resource_version: 1,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const riskController = new RiskController();
