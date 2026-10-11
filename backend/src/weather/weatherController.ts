import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@hare/shared';
import { weatherService } from './weatherService.js';
import { simulationInjector, PRESET_SIMULATION_SCENARIOS } from './simulationInjector.js';
import { AppError } from '../middleware/errorHandler.js';

export class WeatherController {
  /**
   * GET /api/v1/worksites/:worksiteId/weather/current
   */
  public async getCurrentWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      const observation = await weatherService.getCurrentWeather(worksiteId, req.user?.org_id);

      const response: ApiResponse<typeof observation> = {
        data: observation,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
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
   * GET /api/v1/worksites/:worksiteId/weather/forecast
   */
  public async getForecast(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      const hoursParam = req.query.hours ? parseInt(req.query.hours as string, 10) : 12;
      const hours = isNaN(hoursParam) ? 12 : Math.min(Math.max(hoursParam, 1), 48);

      const forecast = await weatherService.getForecast(worksiteId, hours, req.user?.org_id);

      const response: ApiResponse<typeof forecast> = {
        data: forecast,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
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
   * GET /api/v1/worksites/:worksiteId/weather/history
   */
  public async getHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      const from = req.query.from as string | undefined;
      const to = req.query.to as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const history = await weatherService.getHistory(worksiteId, from, to, limit, req.user?.org_id);

      const response: ApiResponse<typeof history> = {
        data: history,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          resource_version: 1,
          count: history.length,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/worksites/:worksiteId/weather/refresh
   */
  public async refreshWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      const result = await weatherService.refreshWeather(worksiteId, req.user?.org_id);

      const response: ApiResponse<typeof result> = {
        data: result,
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
          resource_version: 2,
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/worksites/:worksiteId/weather/simulate
   */
  public async setSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      const { scenario_id } = req.body;

      if (!scenario_id) {
        throw new AppError(
          'VALIDATION_ERROR',
          `Missing scenario_id. Available scenarios: ${Object.keys(PRESET_SIMULATION_SCENARIOS).join(', ')}`,
          400
        );
      }

      await weatherService.getWorksite(worksiteId, req.user?.org_id);
      const scenario = simulationInjector.setSimulationScenario(worksiteId, scenario_id);
      const simulatedObservation = simulationInjector.generateSimulatedObservation(worksiteId);

      const response: ApiResponse<{
        scenario: typeof scenario;
        observation: typeof simulatedObservation;
      }> = {
        data: {
          scenario,
          observation: simulatedObservation,
        },
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/worksites/:worksiteId/weather/clear-simulation
   */
  public async clearSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const worksiteId = req.params.worksiteId as string;
      await weatherService.getWorksite(worksiteId, req.user?.org_id);
      const cleared = simulationInjector.clearSimulation(worksiteId);

      const response: ApiResponse<{ cleared: boolean; worksite_id: string }> = {
        data: {
          cleared,
          worksite_id: worksiteId,
        },
        meta: {
          request_id: (req as any).requestId || 'req_auto',
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }
}

export const weatherController = new WeatherController();
