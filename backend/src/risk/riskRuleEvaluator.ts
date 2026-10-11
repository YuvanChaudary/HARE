/**
 * Heat Action Response Engine (HARE) — Deterministic Risk Rule Evaluator
 *
 * Implements authoritative multi-factor rule matrices for occupational heat stress:
 * Reference: docs/20_HEAT_RISK_ENGINE.md
 *            docs/26_RISK_LEVELS.md
 *            docs/27_RISK_RULES.md
 *            docs/73_RISK_API.md
 *
 * Rule Set Version: 1.0.0
 * 100% Deterministic — Zero Generative AI Involvement
 */

import {
  RiskLevel,
  DataHealthStatus,
  WorkloadCategory,
  SunExposure,
  AcclimatizationContext,
  WorkZone,
  WorksiteSafeguards,
  ShiftContext,
  RiskAssessmentResult,
  RiskFactorItem,
  RiskExplanation,
  RiskSourceContext,
} from '@hare/shared';
import { calculateHeatIndexCelsius } from './heatIndexCalculator.js';
import { calculateSwbgtCelsius } from './swbgtCalculator.js';

export const RULE_VERSION = '1.0.0';

export interface EnvironmentalInput {
  dry_bulb_temperature_c: number;
  relative_humidity_pct: number;
  apparent_temperature_c?: number;
  heat_index_c?: number;
  swbgt_c?: number;
  wind_speed_kmh?: number;
  solar_radiation_wm2?: number;
  data_quality: DataHealthStatus;
  observation_timestamp: string;
  observation_age_minutes: number;
  weather_source: string;
  source_type: string;
  station_id?: string;
  is_simulation: boolean;
}

export interface WorksiteEvaluationContext {
  worksite_id: string;
  organization_id?: string;
  name: string;
  zones?: WorkZone[];
  safeguards?: WorksiteSafeguards;
  active_shift?: ShiftContext | null;
  shift_ambiguous?: boolean;
  workload_override?: WorkloadCategory;
  exposure_override?: SunExposure;
  acclimatization_context?: AcclimatizationContext;
}

const RISK_LEVEL_SEVERITY: Record<RiskLevel, number> = {
  UNKNOWN: 0,
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
};

/**
 * Resolves the effective workload intensity from overrides, shift context, or zones.
 * Applies conservative safety default (MODERATE) if unconfigured per docs/23_WORKLOAD_MODEL.md.
 */
function resolveEffectiveWorkload(
  context: WorksiteEvaluationContext,
  warnings: string[]
): { workload: WorkloadCategory; isDefaulted: boolean } {
  if (context.workload_override) {
    return { workload: context.workload_override, isDefaulted: false };
  }
  if (context.active_shift?.workload_intensity) {
    return { workload: context.active_shift.workload_intensity, isDefaulted: false };
  }
  if (context.zones && context.zones.length > 0) {
    const order: WorkloadCategory[] = ['VERY_HEAVY', 'HEAVY', 'MODERATE', 'LIGHT'];
    for (const cat of order) {
      if (context.zones.some((z) => z.workload_category === cat && z.active_crew_count > 0)) {
        return { workload: cat, isDefaulted: false };
      }
    }
    // Check without active crew count
    for (const cat of order) {
      if (context.zones.some((z) => z.workload_category === cat)) {
        return { workload: cat, isDefaulted: false };
      }
    }
  }

  warnings.push('R06_UNCONFIGURED_WORKLOAD_DEFAULT: Workload unconfigured; conservatively defaulted to MODERATE.');
  return { workload: 'MODERATE', isDefaulted: true };
}

/**
 * Resolves effective sun exposure from overrides, shift, or zones.
 */
function resolveEffectiveExposure(
  context: WorksiteEvaluationContext
): SunExposure {
  if (context.exposure_override) {
    return context.exposure_override;
  }
  if (context.zones && context.zones.length > 0) {
    const order: SunExposure[] = ['DIRECT_SUN', 'PARTIAL_SHADE', 'FULL_SHADE', 'INDOORS'];
    for (const exp of order) {
      if (context.zones.some((z) => z.sun_exposure === exp)) {
        return exp;
      }
    }
  }
  return 'DIRECT_SUN';
}

/**
 * Pure evaluation function for deterministic heat risk assessment.
 */
export function evaluateHeatRisk(
  env: EnvironmentalInput,
  worksiteCtx: WorksiteEvaluationContext,
  evaluatedAt = new Date().toISOString()
): RiskAssessmentResult {
  const assessmentId = `rsk_${Date.now()}_${worksiteCtx.worksite_id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
  const validUntil = new Date(new Date(evaluatedAt).getTime() + 60 * 60 * 1000).toISOString();

  const sourceContext: RiskSourceContext = {
    weather_source: env.weather_source || 'OPEN_METEO',
    source_type: (env.source_type as any) || 'CURRENT_OBSERVATION',
    observation_timestamp: env.observation_timestamp,
    observation_age_minutes: env.observation_age_minutes,
    station_id: env.station_id || 'STN_GRID_DEFAULT',
  };

  const triggeredRuleIds: string[] = [];
  const triggerFactors: string[] = [];
  const warnings: string[] = [];

  // ==========================================================================
  // STAGE 1: DATA INTEGRITY & FRESHNESS GATE (R06)
  // Reference: docs/27_RISK_RULES.md Section 4 (R06) & docs/20_HEAT_RISK_ENGINE.md Section 6
  // Invariant: MISSING != SAFE, UNKNOWN != LOW, STALE != CURRENT, INVALID != SAFE
  // ==========================================================================

  // Check physical limits
  const tempValid =
    typeof env.dry_bulb_temperature_c === 'number' &&
    !isNaN(env.dry_bulb_temperature_c) &&
    env.dry_bulb_temperature_c >= -20.0 &&
    env.dry_bulb_temperature_c <= 65.0;

  const rhValid =
    typeof env.relative_humidity_pct === 'number' &&
    !isNaN(env.relative_humidity_pct) &&
    env.relative_humidity_pct >= 0.0 &&
    env.relative_humidity_pct <= 100.0;

  if (!tempValid || !rhValid) {
    triggeredRuleIds.push('R06_DATA_INTEGRITY_FAIL');
    triggerFactors.push('Atmospheric telemetry out of physical bounds or missing');

    const explanation: RiskExplanation = {
      what: 'Unable to evaluate worksite heat risk (Risk Level: UNKNOWN).',
      why: 'Environmental telemetry values breach physical validity thresholds or are null.',
      data: `Received Dry-Bulb: ${env.dry_bulb_temperature_c}°C, Relative Humidity: ${env.relative_humidity_pct}% (Status: INVALID).`,
      rule: `Evaluated against Rule Matrix v${RULE_VERSION} Precondition Gate.`,
      limitations: 'Physical sensor or meteorological provider reported corrupt data.',
      next_steps: 'Check sensor connectivity and conduct on-site physical measurement immediately.',
    };

    return {
      assessment_id: assessmentId,
      risk_id: assessmentId,
      worksite_id: worksiteCtx.worksite_id,
      organization_id: worksiteCtx.organization_id,
      shift_id: worksiteCtx.active_shift?.shift_id,
      risk_level: 'UNKNOWN',
      heat_index_c: isNaN(env.dry_bulb_temperature_c) ? 0.0 : env.dry_bulb_temperature_c,
      swbgt_c: 0.0,
      trigger_factors: triggerFactors,
      triggered_rule_ids: triggeredRuleIds,
      rule_version: RULE_VERSION,
      evaluated_at_utc: evaluatedAt,
      valid_until_utc: validUntil,
      data_health: 'INVALID',
      is_simulation: env.is_simulation,
      source_context: sourceContext,
      risk_factors: [],
      explanation,
      reason_synthesis: 'Environmental telemetry is corrupt or missing. Risk cannot be calculated safely.',
    };
  }

  // Check future-dated observation timestamp or impossible negative age (docs/36_DATA_VALIDATION.md)
  const obsTime = new Date(env.observation_timestamp).getTime();
  const evalTime = new Date(evaluatedAt).getTime();
  const isFutureDated = !isNaN(obsTime) && !isNaN(evalTime) && obsTime > evalTime + 5 * 60 * 1000; // >5 min clock skew

  if (isFutureDated || env.observation_age_minutes < -5) {
    triggeredRuleIds.push('R06_DATA_INTEGRITY_FAIL');
    triggerFactors.push('Telemetry timestamp is future-dated relative to system evaluation clock');

    const explanation: RiskExplanation = {
      what: 'Unable to evaluate worksite heat risk (Risk Level: UNKNOWN).',
      why: 'Environmental telemetry timestamp is future-dated; chronological sequencing violated.',
      data: `Received Observation: ${env.observation_timestamp}, Evaluated At: ${evaluatedAt} (Status: INVALID).`,
      rule: `Evaluated against Rule Matrix v${RULE_VERSION} Temporal Sequence Precondition Gate.`,
      limitations: 'Temporal sequencing failure detected in environmental telemetry feed.',
      next_steps: 'Verify system clock synchronization and telemetry provider timestamp accuracy.',
    };

    return {
      assessment_id: assessmentId,
      risk_id: assessmentId,
      worksite_id: worksiteCtx.worksite_id,
      organization_id: worksiteCtx.organization_id,
      shift_id: worksiteCtx.active_shift?.shift_id,
      risk_level: 'UNKNOWN',
      heat_index_c: env.dry_bulb_temperature_c,
      swbgt_c: 0.0,
      trigger_factors: triggerFactors,
      triggered_rule_ids: triggeredRuleIds,
      rule_version: RULE_VERSION,
      evaluated_at_utc: evaluatedAt,
      valid_until_utc: validUntil,
      data_health: 'INVALID',
      is_simulation: env.is_simulation,
      source_context: sourceContext,
      risk_factors: [],
      explanation,
      reason_synthesis: 'Environmental telemetry is future-dated. Risk cannot be calculated safely.',
    };
  }

  // Check data quality status
  if (
    env.data_quality === 'MISSING' ||
    env.data_quality === 'INVALID' ||
    env.data_quality === 'UNKNOWN' ||
    env.data_quality === 'CONFLICTING'
  ) {
    triggeredRuleIds.push('R06_DATA_INTEGRITY_FAIL');
    triggerFactors.push(`Data health is ${env.data_quality}`);

    const explanation: RiskExplanation = {
      what: 'Unable to evaluate worksite heat risk (Risk Level: UNKNOWN).',
      why: `Environmental telemetry feed returned ${env.data_quality} status. Safety assumptions suspended.`,
      data: `Provider: ${env.weather_source}, Quality Status: ${env.data_quality}, Observation Age: ${env.observation_age_minutes}m.`,
      rule: `Evaluated against Rule Matrix v${RULE_VERSION} Precondition Gate.`,
      limitations: 'Automated telemetry is currently unavailable or unverified.',
      next_steps: 'Conduct manual on-site wet-bulb/dry-bulb check and verify network telemetry feed.',
    };

    return {
      assessment_id: assessmentId,
      risk_id: assessmentId,
      worksite_id: worksiteCtx.worksite_id,
      organization_id: worksiteCtx.organization_id,
      shift_id: worksiteCtx.active_shift?.shift_id,
      risk_level: 'UNKNOWN',
      heat_index_c: env.dry_bulb_temperature_c,
      swbgt_c: 0.0,
      trigger_factors: triggerFactors,
      triggered_rule_ids: triggeredRuleIds,
      rule_version: RULE_VERSION,
      evaluated_at_utc: evaluatedAt,
      valid_until_utc: validUntil,
      data_health: env.data_quality,
      is_simulation: env.is_simulation,
      source_context: sourceContext,
      risk_factors: [],
      explanation,
      reason_synthesis: `Environmental telemetry is ${env.data_quality}. Automated safety assumptions suspended.`,
    };
  }

  // Check staleness grace period (>180 minutes = hard fail into UNKNOWN)
  let effectiveDataHealth = env.data_quality;
  if (env.observation_age_minutes > 180 || env.data_quality === 'STALE' && env.observation_age_minutes > 180) {
    triggeredRuleIds.push('R06_DATA_INTEGRITY_FAIL');
    triggerFactors.push('Stale telemetry exceeded maximum 180-minute grace period');

    const explanation: RiskExplanation = {
      what: 'Unable to evaluate worksite heat risk (Risk Level: UNKNOWN).',
      why: `Telemetry age (${env.observation_age_minutes} minutes) exceeds maximum allowed grace window (180m).`,
      data: `Observation timestamp: ${env.observation_timestamp} (${env.observation_age_minutes}m old).`,
      rule: `Evaluated against Rule Matrix v${RULE_VERSION} Staleness Gate.`,
      limitations: 'Data freshness SLA breached; automated safety calculations suspended.',
      next_steps: 'Refresh meteorological telemetry or inject fresh observation.',
    };

    return {
      assessment_id: assessmentId,
      risk_id: assessmentId,
      worksite_id: worksiteCtx.worksite_id,
      organization_id: worksiteCtx.organization_id,
      shift_id: worksiteCtx.active_shift?.shift_id,
      risk_level: 'UNKNOWN',
      heat_index_c: env.dry_bulb_temperature_c,
      swbgt_c: 0.0,
      trigger_factors: triggerFactors,
      triggered_rule_ids: triggeredRuleIds,
      rule_version: RULE_VERSION,
      evaluated_at_utc: evaluatedAt,
      valid_until_utc: validUntil,
      data_health: 'STALE',
      is_simulation: env.is_simulation,
      source_context: sourceContext,
      risk_factors: [],
      explanation,
      reason_synthesis: 'Telemetry age exceeds 180 minutes. Automated safety evaluation suspended.',
    };
  }

  // Stale warning (between 60m and 180m)
  if (env.observation_age_minutes > 60 || env.data_quality === 'STALE') {
    effectiveDataHealth = 'STALE';
    triggeredRuleIds.push('R06_DATA_DEGRADED_STALE');
    warnings.push(`DATA_DEGRADED: Telemetry is ${env.observation_age_minutes} minutes old (evaluating under grace period).`);
  }

  // ==========================================================================
  // STAGE 2: MATHEMATICAL HEAT INDICATOR CALCULATION
  // ==========================================================================

  const heatIndexC =
    typeof env.heat_index_c === 'number' && !isNaN(env.heat_index_c)
      ? env.heat_index_c
      : calculateHeatIndexCelsius(env.dry_bulb_temperature_c, env.relative_humidity_pct);

  const swbgtC =
    typeof env.swbgt_c === 'number' && !isNaN(env.swbgt_c)
      ? env.swbgt_c
      : calculateSwbgtCelsius(env.dry_bulb_temperature_c, env.relative_humidity_pct);

  // ==========================================================================
  // STAGE 3: RESOLVE CONTEXTUAL PARAMETERS
  // ==========================================================================

  if (worksiteCtx.shift_ambiguous) {
    triggeredRuleIds.push('R06_SHIFT_CONTEXT_AMBIGUOUS');
    warnings.push('R06_SHIFT_CONTEXT_AMBIGUOUS: Multiple overlapping active shifts detected; shift context ambiguous. Evaluated under conservative site baseline.');
  }

  const { workload } = resolveEffectiveWorkload(worksiteCtx, warnings);
  const exposure = resolveEffectiveExposure(worksiteCtx);
  const acclimatization = worksiteCtx.acclimatization_context || 'ESTABLISHED';

  // ==========================================================================
  // STAGE 4: BASE ENVIRONMENTAL TIER EVALUATION (R01)
  // Reference: docs/27_RISK_RULES.md Section 4 & PHASE.md Task 5.3
  // HI < 32°C => LOW
  // 32°C <= HI < 39°C => MODERATE
  // 39°C <= HI < 46°C => HIGH
  // HI >= 46°C => CRITICAL
  // ==========================================================================

  let baseRiskLevel: RiskLevel;
  let baseRuleId: string;

  if (heatIndexC < 32.0) {
    baseRiskLevel = 'LOW';
    baseRuleId = 'R01_ENV_LOW';
    triggerFactors.push(`Heat Index (${heatIndexC}°C) is below baseline advisory threshold (32°C)`);
  } else if (heatIndexC < 39.0) {
    baseRiskLevel = 'MODERATE';
    baseRuleId = 'R01_ENV_MODERATE';
    triggerFactors.push(`Heat Index (${heatIndexC}°C) breaches Moderate threshold (32°C - 38.9°C)`);
  } else if (heatIndexC < 46.0) {
    baseRiskLevel = 'HIGH';
    baseRuleId = 'R01_ENV_HIGH';
    triggerFactors.push(`Heat Index (${heatIndexC}°C) breaches High threshold (39°C - 45.9°C)`);
  } else {
    baseRiskLevel = 'CRITICAL';
    baseRuleId = 'R01_ENV_CRITICAL';
    triggerFactors.push(`Heat Index (${heatIndexC}°C) breaches Critical threshold (>= 46°C)`);
  }

  triggeredRuleIds.push(baseRuleId);

  // ==========================================================================
  // STAGE 5: CONTEXTUAL ESCALATION MODIFIERS
  // Reference: docs/27_RISK_RULES.md Section 4 & 5 (Conservative Safety Precedence)
  // R02: Combined Environmental & Contextual Rules
  // R03: Workload Intensity Rules
  // R04: Solar / Exposure Window Rules
  // R05: Acclimatization Rules
  // ==========================================================================

  let finalRiskLevel = baseRiskLevel;

  // R02 Combined Context Rule: High Base + Heavy/Very Heavy + Direct Sun => CRITICAL
  if (
    baseRiskLevel === 'HIGH' &&
    (workload === 'HEAVY' || workload === 'VERY_HEAVY') &&
    exposure === 'DIRECT_SUN'
  ) {
    finalRiskLevel = 'CRITICAL';
    triggeredRuleIds.push('R02_COMBINED_CONTEXT_HIGH_TO_CRITICAL');
    triggerFactors.push(
      `High ambient Heat Index (${heatIndexC}°C) combined with ${workload} labor in DIRECT SUN escalates risk to CRITICAL`
    );
  }

  // R02 Combined Context Rule: Moderate Base + Heavy/Very Heavy + Direct Sun => HIGH
  else if (
    baseRiskLevel === 'MODERATE' &&
    (workload === 'HEAVY' || workload === 'VERY_HEAVY') &&
    exposure === 'DIRECT_SUN'
  ) {
    finalRiskLevel = 'HIGH';
    triggeredRuleIds.push('R02_COMBINED_CONTEXT_MODERATE_TO_HIGH');
    triggerFactors.push(
      `Moderate Heat Index (${heatIndexC}°C) combined with ${workload} labor in DIRECT SUN escalates risk to HIGH`
    );
  }

  // R03 Workload Modifier: Moderate Base + Very Heavy labor (even in shade) => HIGH
  if (
    baseRiskLevel === 'MODERATE' &&
    workload === 'VERY_HEAVY' &&
    RISK_LEVEL_SEVERITY[finalRiskLevel] < RISK_LEVEL_SEVERITY.HIGH
  ) {
    finalRiskLevel = 'HIGH';
    triggeredRuleIds.push('R03_WORKLOAD_VERY_HEAVY_ESCALATION');
    triggerFactors.push(
      `Extreme metabolic exertion (VERY_HEAVY workload) elevates operational risk to HIGH`
    );
  }

  // R02 Combined Context Rule: Low Base + Very Heavy labor + Direct Sun => MODERATE
  if (
    baseRiskLevel === 'LOW' &&
    workload === 'VERY_HEAVY' &&
    exposure === 'DIRECT_SUN' &&
    RISK_LEVEL_SEVERITY[finalRiskLevel] < RISK_LEVEL_SEVERITY.MODERATE
  ) {
    finalRiskLevel = 'MODERATE';
    triggeredRuleIds.push('R02_COMBINED_CONTEXT_LOW_TO_MODERATE');
    triggerFactors.push(
      `Low ambient index (${heatIndexC}°C) elevated to MODERATE due to VERY_HEAVY labor under DIRECT SUN`
    );
  }

  // R04 Solar Peak Sun Overlap Modifier
  if (
    worksiteCtx.active_shift?.peak_sun_overlap &&
    exposure === 'DIRECT_SUN' &&
    (workload === 'HEAVY' || workload === 'VERY_HEAVY')
  ) {
    triggeredRuleIds.push('R04_SOLAR_PEAK_EXPOSURE');
    triggerFactors.push('Active shift overlaps peak solar radiation window (11:00 - 15:00)');
  }

  // R05 Acclimatization Modifier: NEW_OR_RETURNING workforce
  if (acclimatization === 'NEW_OR_RETURNING') {
    if (RISK_LEVEL_SEVERITY[finalRiskLevel] === RISK_LEVEL_SEVERITY.MODERATE) {
      finalRiskLevel = 'HIGH';
      triggeredRuleIds.push('R05_ACCLIMATIZATION_MODIFIER_NEW_WORKERS');
      triggerFactors.push(
        'Workforce contains newly mobilized or returning workers; elevated susceptibility escalates risk from MODERATE to HIGH'
      );
    } else {
      triggeredRuleIds.push('R05_ACCLIMATIZATION_SUSCEPTIBILITY_WARNING');
      triggerFactors.push('Unacclimatized workers present; mandatory peer buddy monitoring indicated');
    }
  }

  // Add any warnings to trigger factors
  for (const w of warnings) {
    triggerFactors.push(w);
  }

  // ==========================================================================
  // STAGE 6: ASSEMBLE STRUCTURED RISK FACTORS ATTRIBUTION
  // Reference: docs/73_RISK_API.md Section 6.1
  // ==========================================================================

  const riskFactors: RiskFactorItem[] = [
    {
      factor_name: 'DRY_BULB_TEMPERATURE',
      value: env.dry_bulb_temperature_c,
      unit: 'CELSIUS',
      weight: env.dry_bulb_temperature_c >= 40.0 ? 'CRITICAL' : env.dry_bulb_temperature_c >= 35.0 ? 'MAJOR' : 'MODERATE',
      contribution: env.dry_bulb_temperature_c >= 35.0 ? 'ELEVATED' : 'BASELINE',
    },
    {
      factor_name: 'RELATIVE_HUMIDITY',
      value: env.relative_humidity_pct,
      unit: 'PERCENT',
      weight: env.relative_humidity_pct >= 70.0 ? 'MAJOR' : 'MODERATE',
      contribution: env.relative_humidity_pct >= 60.0 ? 'HIGH_EVAPORATIVE_RESISTANCE' : 'MODERATE_EVAPORATIVE_RESISTANCE',
    },
    {
      factor_name: 'HEAT_INDEX',
      value: heatIndexC,
      unit: 'CELSIUS',
      weight: heatIndexC >= 46.0 ? 'CRITICAL' : heatIndexC >= 39.0 ? 'MAJOR' : 'MODERATE',
      contribution:
        heatIndexC >= 46.0
          ? 'ACUTE_DANGER'
          : heatIndexC >= 39.0
          ? 'HIGH_THERMAL_BURDEN'
          : heatIndexC >= 32.0
          ? 'ELEVATED_VIGILANCE'
          : 'MINIMAL_STRAIN',
    },
    {
      factor_name: 'SWBGT_ESTIMATED',
      value: swbgtC,
      unit: 'CELSIUS',
      weight: swbgtC >= 32.0 ? 'MAJOR' : 'MODERATE',
      contribution: swbgtC >= 30.0 ? 'HEAVY_ENVIRONMENTAL_LOAD' : 'NOMINAL_ENVIRONMENTAL_LOAD',
    },
    {
      factor_name: 'WORKLOAD_INTENSITY',
      value: workload,
      unit: 'METABOLIC_RATE',
      weight: workload === 'VERY_HEAVY' || workload === 'HEAVY' ? 'MAJOR' : 'MINOR',
      contribution:
        workload === 'VERY_HEAVY'
          ? 'MAXIMUM_METABOLIC_INTERNAL_HEAT'
          : workload === 'HEAVY'
          ? 'SIGNIFICANT_INTERNAL_HEAT'
          : 'NOMINAL_METABOLIC_HEAT',
    },
    {
      factor_name: 'DIRECT_SUN_EXPOSURE',
      value: exposure,
      unit: 'EXPOSURE_CLASS',
      weight: exposure === 'DIRECT_SUN' ? 'MODERATE' : 'MINOR',
      contribution: exposure === 'DIRECT_SUN' ? 'SOLAR_RADIATION_ADDITION' : 'SHIELDED_FROM_DIRECT_BEAM',
    },
    {
      factor_name: 'ACCLIMATIZATION_PROFILE',
      value: acclimatization,
      unit: 'ROSTER_STATUS',
      weight: acclimatization === 'NEW_OR_RETURNING' ? 'MAJOR' : 'MINOR',
      contribution:
        acclimatization === 'NEW_OR_RETURNING'
          ? 'HEIGHTENED_PHYSIOLOGICAL_SUSCEPTIBILITY'
          : 'ESTABLISHED_SEASONAL_ADAPTATION',
    },
  ];

  // ==========================================================================
  // STAGE 7: 6-PART EXPLANATION SYNTHESIS
  // Reference: docs/73_RISK_API.md Section 7
  // ==========================================================================

  let nextStepsText = '';
  switch (finalRiskLevel) {
    case 'CRITICAL':
      nextStepsText =
        'Enforce aggressive work-rest schedule (30/30 or 20/40), provide chilled hydration, and prepare for potential task rescheduling or site stand-down.';
      break;
    case 'HIGH':
      nextStepsText =
        'Mandatory 45 min work / 15 min rest cycle in shade, enforce 1L/worker/hr hydration quotas, and activate peer buddy monitoring.';
      break;
    case 'MODERATE':
      nextStepsText =
        'Ensure continuous chilled water availability, conduct hydration toolbox briefing, and permit self-pacing.';
      break;
    case 'LOW':
    default:
      nextStepsText =
        'Standard operational baseline; verify potable water dispensers are replenished.';
      break;
  }

  const reasonSynthesis = `Worksite reached ${finalRiskLevel} operational risk because calculated Heat Index (${heatIndexC}°C) coincides with ${workload} labor in ${exposure.replace('_', ' ')}${acclimatization === 'NEW_OR_RETURNING' ? ' with newly mobilized workers present' : ''}.`;

  const limitationParts = [
    'Direct physical wet-bulb globe temperature sensor unavailable; sWBGT is an empirical mathematical proxy (BOM formula), not a physical black-globe measurement (ISO 7243).',
    'Base thresholds (32°C, 39°C, 46°C) reflect IMD Heat Action Plan & OSHA NEP demonstration baselines; client policy must verify site-specific thresholds.',
  ];
  if (worksiteCtx.shift_ambiguous) {
    limitationParts.push('Shift context is ambiguous due to multiple overlapping active shifts; conservative safety defaults applied.');
  }
  if (effectiveDataHealth === 'STALE') {
    limitationParts.push(`Environmental telemetry is aged (${env.observation_age_minutes}m); evaluated under stale grace period.`);
  }

  const explanation: RiskExplanation = {
    what: `Worksite is operating at ${finalRiskLevel} heat risk.`,
    why: reasonSynthesis,
    data: `Based on validated telemetry from ${env.observation_timestamp} (${env.observation_age_minutes}m old, quality: ${effectiveDataHealth}).`,
    rule: `Evaluated against Approved Rule Matrix v${RULE_VERSION} (NOAA SR 90-23 / OSHA NEP / IMD HAP / ISO 7243).`,
    limitations: limitationParts.join(' '),
    next_steps: nextStepsText,
  };

  return {
    assessment_id: assessmentId,
    risk_id: assessmentId,
    worksite_id: worksiteCtx.worksite_id,
    organization_id: worksiteCtx.organization_id,
    shift_id: worksiteCtx.active_shift?.shift_id,
    risk_level: finalRiskLevel,
    heat_index_c: heatIndexC,
    swbgt_c: swbgtC,
    trigger_factors: triggerFactors,
    triggered_rule_ids: triggeredRuleIds,
    rule_version: RULE_VERSION,
    evaluated_at_utc: evaluatedAt,
    valid_until_utc: validUntil,
    data_health: effectiveDataHealth,
    is_simulation: env.is_simulation,
    source_context: sourceContext,
    risk_factors: riskFactors,
    explanation,
    reason_synthesis: reasonSynthesis,
    generated_action_ids: [],
  };
}
