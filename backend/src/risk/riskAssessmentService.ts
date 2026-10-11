/**
 * Heat Action Response Engine (HARE) — Risk Assessment Service
 *
 * Orchestrates worksite context, operational shifts, and meteorological telemetry
 * to generate and persist authoritative, deterministic heat risk assessments.
 *
 * Reference: docs/20_HEAT_RISK_ENGINE.md
 *            docs/73_RISK_API.md
 */

import {
  RiskAssessmentResult,
  JwtUserPayload,
  WorkloadCategory,
  SunExposure,
  AcclimatizationContext,
  DataHealthStatus,
  RiskLevel,
  WeatherTelemetryResponse,
  ShiftContext,
} from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { worksiteService } from '../worksite/worksiteService.js';
import { weatherService } from '../weather/weatherService.js';
import { evaluateHeatRisk, EnvironmentalInput, WorksiteEvaluationContext } from './riskRuleEvaluator.js';
import { simulationInjector } from '../weather/simulationInjector.js';
import { actionService } from '../action/actionService.js';
import { AppError } from '../middleware/errorHandler.js';

export interface AssessOptions {
  shiftId?: string;
  forceTelemetryRefresh?: boolean;
  workloadOverride?: WorkloadCategory;
  exposureOverride?: SunExposure;
  acclimatizationContext?: AcclimatizationContext;
  scenarioId?: string;
  reason?: string;
}

export interface HistoryFilters {
  limit?: number;
  cursor?: string;
  from?: string;
  to?: string;
  riskLevel?: RiskLevel;
  dataQuality?: DataHealthStatus;
  includeSimulation?: boolean;
}

export class RiskAssessmentService {
  private collectionName = 'risk_assessments';

  /**
   * Executes a deterministic heat risk assessment for a worksite.
   */
  public async assessWorksite(
    worksiteId: string,
    user: JwtUserPayload,
    options: AssessOptions = {}
  ): Promise<RiskAssessmentResult> {
    // 1. Verify worksite existence and authorization (tenant & supervisor scoping)
    const worksite = await worksiteService.getWorksiteById(worksiteId, user);

    // 2. Resolve shift context
    let activeShift: ShiftContext | null = null;
    let shiftAmbiguous = false;
    if (options.shiftId) {
      const shifts = await worksiteService.listShifts(worksiteId, user);
      activeShift = shifts.find((s) => s.shift_id === options.shiftId) || null;
      if (!activeShift) {
        throw new AppError('SHIFT_NOT_FOUND', `Shift '${options.shiftId}' not found on worksite.`, 404);
      }
    } else {
      const shiftResolution = await worksiteService.resolveActiveShift(worksite);
      activeShift = shiftResolution.activeShift;
      shiftAmbiguous = shiftResolution.isAmbiguous;
    }

    // 3. Retrieve environmental telemetry
    let weatherTelemetry: WeatherTelemetryResponse | null = null;
    let envInput: EnvironmentalInput;

    try {
      if (options.scenarioId) {
        weatherTelemetry = simulationInjector.generateSimulatedObservation(worksiteId, options.scenarioId);
      } else {
        if (options.forceTelemetryRefresh) {
          weatherService.clearCache(worksiteId);
        }
        weatherTelemetry = await weatherService.getCurrentWeather(worksiteId, user.org_id);
      }

      envInput = {
        dry_bulb_temperature_c: weatherTelemetry.metrics.dry_bulb_temperature_c,
        relative_humidity_pct: weatherTelemetry.metrics.relative_humidity_pct,
        apparent_temperature_c: weatherTelemetry.metrics.apparent_temperature_c,
        heat_index_c: weatherTelemetry.metrics.heat_index_c,
        solar_radiation_wm2: weatherTelemetry.metrics.solar_radiation_wm2,
        wind_speed_kmh: weatherTelemetry.metrics.wind_speed_kmh,
        data_quality: weatherTelemetry.provenance.quality_status,
        observation_timestamp: weatherTelemetry.provenance.observation_timestamp,
        observation_age_minutes: weatherTelemetry.provenance.observation_age_minutes,
        weather_source: weatherTelemetry.provenance.provider,
        source_type: weatherTelemetry.telemetry_type === 'SIMULATION' ? 'SIMULATED_INPUT' : 'CURRENT_OBSERVATION',
        station_id: weatherTelemetry.provenance.station_id,
        is_simulation: weatherTelemetry.provenance.is_simulation,
      };
    } catch (err: any) {
      console.error('[assessWorksite] Weather catch error:', err?.message || err, err?.stack);
      // Invariant: MISSING != SAFE, UNKNOWN != LOW.
      // If weather service completely fails or throws, construct fail-safe UNKNOWN telemetry.
      envInput = {
        dry_bulb_temperature_c: NaN,
        relative_humidity_pct: NaN,
        data_quality: 'MISSING',
        observation_timestamp: new Date().toISOString(),
        observation_age_minutes: 999,
        weather_source: 'UPSTREAM_FAILURE',
        source_type: 'MISSING_TELEMETRY',
        is_simulation: false,
      };
    }

    // 4. Build worksite evaluation context
    const worksiteContext: WorksiteEvaluationContext = {
      worksite_id: worksite.worksite_id,
      organization_id: worksite.organization_id,
      name: worksite.name,
      zones: worksite.zones,
      safeguards: worksite.safeguards,
      active_shift: activeShift,
      shift_ambiguous: shiftAmbiguous,
      workload_override: options.workloadOverride,
      exposure_override: options.exposureOverride,
      acclimatization_context: options.acclimatizationContext,
    };

    // 5. Evaluate deterministic risk rules
    const assessment = evaluateHeatRisk(envInput, worksiteContext);

    // 6. Persist immutable assessment record to storage
    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.collectionName);
    allAssessments.push(assessment);
    await storage.writeCollection(this.collectionName, allAssessments);

    // 7. Auto-generate candidate SOP actions for the worksite
    try {
      const generated = await actionService.generateActionsForAssessment(assessment.assessment_id, user);
      assessment.generated_action_ids = generated.map((a) => a.action_id);
    } catch (actErr) {
      console.warn('[assessWorksite] Action generation notice:', actErr);
    }

    return assessment;
  }

  /**
   * Retrieves the latest authoritative risk evaluation for a worksite.
   * If none exists in persistent storage, automatically computes an evaluation.
   */
  public async getLatestAssessment(
    worksiteId: string,
    user: JwtUserPayload
  ): Promise<RiskAssessmentResult> {
    // Verify access
    await worksiteService.getWorksiteById(worksiteId, user);

    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.collectionName);
    const siteAssessments = allAssessments.filter((a) => a.worksite_id === worksiteId);

    if (siteAssessments.length > 0) {
      // Return most recent by evaluated_at_utc
      siteAssessments.sort(
        (a, b) => new Date(b.evaluated_at_utc).getTime() - new Date(a.evaluated_at_utc).getTime()
      );
      return siteAssessments[0];
    }

    // If none exists, evaluate fresh
    return this.assessWorksite(worksiteId, user);
  }

  /**
   * Retrieves chronological past risk assessments with filtering and pagination.
   */
  public async getAssessmentHistory(
    worksiteId: string,
    user: JwtUserPayload,
    filters: HistoryFilters = {}
  ): Promise<{ assessments: RiskAssessmentResult[]; total: number; nextCursor?: string }> {
    // Verify access
    await worksiteService.getWorksiteById(worksiteId, user);

    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.collectionName);
    let siteAssessments = allAssessments.filter((a) => a.worksite_id === worksiteId);

    // Filter by simulation
    if (!filters.includeSimulation) {
      siteAssessments = siteAssessments.filter((a) => !a.is_simulation);
    }

    // Filter by risk level
    if (filters.riskLevel) {
      siteAssessments = siteAssessments.filter((a) => a.risk_level === filters.riskLevel);
    }

    // Filter by data quality
    if (filters.dataQuality) {
      siteAssessments = siteAssessments.filter((a) => a.data_health === filters.dataQuality);
    }

    // Filter by timestamp range
    if (filters.from) {
      const fromTime = new Date(filters.from).getTime();
      siteAssessments = siteAssessments.filter((a) => new Date(a.evaluated_at_utc).getTime() >= fromTime);
    }
    if (filters.to) {
      const toTime = new Date(filters.to).getTime();
      siteAssessments = siteAssessments.filter((a) => new Date(a.evaluated_at_utc).getTime() <= toTime);
    }

    // Sort descending by time
    siteAssessments.sort(
      (a, b) => new Date(b.evaluated_at_utc).getTime() - new Date(a.evaluated_at_utc).getTime()
    );

    const limit = Math.min(filters.limit || 50, 200);
    let startIndex = 0;

    if (filters.cursor) {
      try {
        const decoded = Buffer.from(filters.cursor, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (parsed.assessment_id) {
          const idx = siteAssessments.findIndex((a) => a.assessment_id === parsed.assessment_id);
          if (idx >= 0) {
            startIndex = idx + 1;
          }
        }
      } catch {
        // Fallback: start at 0 if cursor is malformed
      }
    }

    const paged = siteAssessments.slice(startIndex, startIndex + limit);
    let nextCursor: string | undefined;

    if (startIndex + limit < siteAssessments.length) {
      const lastItem = paged[paged.length - 1];
      nextCursor = Buffer.from(JSON.stringify({ assessment_id: lastItem.assessment_id })).toString('base64');
    }

    return {
      assessments: paged,
      total: siteAssessments.length,
      nextCursor,
    };
  }

  /**
   * Retrieves an immutable risk assessment record by assessment_id / risk_id.
   */
  public async getAssessmentById(
    riskId: string,
    user: JwtUserPayload
  ): Promise<RiskAssessmentResult> {
    const allAssessments = await storage.readCollection<RiskAssessmentResult>(this.collectionName);
    const assessment = allAssessments.find((a) => a.assessment_id === riskId || a.risk_id === riskId);

    if (!assessment) {
      throw new AppError('RISK_ASSESSMENT_NOT_FOUND', `Risk assessment '${riskId}' not found.`, 404);
    }

    // Verify tenant boundaries & supervisor scoping
    await worksiteService.getWorksiteById(assessment.worksite_id, user);

    return assessment;
  }
}

export const riskAssessmentService = new RiskAssessmentService();
