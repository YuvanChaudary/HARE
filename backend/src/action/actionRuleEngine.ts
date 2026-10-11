/**
 * Heat Action Response Engine (HARE) — Deterministic Action Rule Engine
 *
 * Implements deterministic action rule evaluation mapping evaluated heat risk,
 * worksite safeguards/zones, and operational shift context into actionable,
 * time-bounded preventive SOP action directives.
 *
 * References:
 *   docs/16_ACTION_MODEL.md
 *   docs/40_ACTION_ENGINE.md
 *   docs/41_ACTION_RULES.md
 *   docs/42_SITE_SPECIFIC_ACTIONS.md
 *   docs/74_ACTION_API.md
 *   PHASE.md Task 6.2
 *
 * Rule Set Version: 1.0.0
 * 100% Deterministic — Zero Generative AI Involvement
 */

import {
  ActionRecord,
  RiskAssessmentResult,
  Worksite,
  ShiftContext,
  WorkZone,
} from '@hare/shared';
import { ACTION_CATALOG, ActionDefinition } from './actionCatalog.js';

export const ACTION_RULE_VERSION = '1.0.0';

export interface ActionEvaluationOptions {
  evaluatedAtUtc?: string;
  targetZoneId?: string;
}

/**
 * Helper to construct an ActionRecord from a catalog definition and evaluation context.
 */
function createActionRecord(
  ruleId: string,
  catalogKey: string,
  assessment: RiskAssessmentResult,
  worksite: Worksite,
  shift: ShiftContext | null | undefined,
  zone: WorkZone | undefined,
  evaluatedAt: string,
  explanation: string,
  overridePriority?: ActionDefinition['default_priority']
): ActionRecord {
  const def = ACTION_CATALOG[catalogKey];
  if (!def) {
    throw new Error(`Unknown action catalog key: ${catalogKey}`);
  }

  const evalTime = new Date(evaluatedAt).getTime();
  const deadlineUtc = new Date(evalTime + def.sla_minutes * 60 * 1000).toISOString();
  const zoneId = zone?.zone_id;
  const shiftId = shift?.shift_id || assessment.shift_id;
  const supervisorId = shift?.supervisor_user_id || worksite.assigned_supervisor_id || 'usr_sup_default';

  // Construct deterministic unique action ID
  const sanitizedWorksite = worksite.worksite_id.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const sanitizedSop = def.sop_code.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const actionId = `act_${evalTime}_${sanitizedWorksite}_${sanitizedSop}${zoneId ? `_${zoneId}` : ''}`;

  const deduplicationKey = `${ruleId}:${worksite.worksite_id}:${shiftId || 'SITE'}:${zoneId || 'ALL'}`;

  // Tailor title and description with context
  let title = def.title;
  let description = def.description_template;

  if (zone) {
    title = `${title} (${zone.name})`;
    description = `${description} [Target Zone: ${zone.name}]`;
  }
  if (shift) {
    description = `${description} [Shift: ${shift.name} (${shift.start_time_local} - ${shift.end_time_local})]`;
  }

  return {
    action_id: actionId,
    organization_id: worksite.organization_id || assessment.organization_id,
    worksite_id: worksite.worksite_id,
    zone_id: zoneId,
    shift_id: shiftId,
    assessment_id: assessment.assessment_id,
    risk_id: assessment.assessment_id,
    action_type: def.sop_code,
    category: def.category,
    title,
    description,
    priority: overridePriority || def.default_priority,
    status: 'PENDING_ACKNOWLEDGMENT',
    assigned_supervisor_id: supervisorId,
    owner_role: def.owner_role,
    created_at_utc: evaluatedAt,
    deadline_utc: deadlineUtc,
    sla_minutes: def.sla_minutes,
    is_required: def.is_required,
    is_simulation: Boolean(assessment.is_simulation),
    deduplication_key: deduplicationKey,
    explanation,
    source_rule_id: ruleId,
    rule_version: ACTION_RULE_VERSION,
  };
}

/**
 * Pure evaluation function that takes an authoritative risk assessment and worksite/shift context,
 * and outputs deterministic action directives.
 */
export function evaluateActionRules(
  assessment: RiskAssessmentResult,
  worksite: Worksite,
  shift?: ShiftContext | null,
  options: ActionEvaluationOptions = {}
): ActionRecord[] {
  const evaluatedAt = options.evaluatedAtUtc || assessment.evaluated_at_utc || new Date().toISOString();
  const actions: ActionRecord[] = [];

  // Determine active zone if specified or high-risk zones
  const targetZones = options.targetZoneId
    ? worksite.zones.filter((z) => z.zone_id === options.targetZoneId)
    : worksite.zones && worksite.zones.length > 0
    ? worksite.zones
    : [undefined];

  // ==========================================================================
  // 1. DATA-INTEGRITY & FAIL-SAFE RULES (AR-010, AR-008)
  // Invariant: MISSING != SAFE, UNKNOWN != LOW.
  // When telemetry is UNKNOWN, MISSING, INVALID, or CONFLICTING, generate
  // physical worksite check rather than silent inaction.
  // ==========================================================================
  if (
    assessment.risk_level === 'UNKNOWN' ||
    assessment.data_health === 'MISSING' ||
    assessment.data_health === 'INVALID' ||
    assessment.data_health === 'CONFLICTING'
  ) {
    actions.push(
      createActionRecord(
        'AR_010_DATA_FAILSAFE_TELEMETRY_CHECK',
        'ACT_WORKSITE_TELEMETRY_CHECK',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        `Automated environmental telemetry is ${assessment.data_health} (Risk: UNKNOWN). Mandatory on-site verification required per docs/37_DATA_FAILURES.md.`
      )
    );

    // Precautionary rule: Never relax basic hydration during telemetry outages
    actions.push(
      createActionRecord(
        'AR_008_FAILSAFE_HYDRATION_CHECK',
        'ACT_CHILLED_WATER_REFILL',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Precautionary hydration readiness maintained during telemetry outage; water supplies must not lapse.'
      )
    );

    return actions;
  }

  // If telemetry is aged (STALE grace period), also attach telemetry check warning action
  if (assessment.data_health === 'STALE') {
    actions.push(
      createActionRecord(
        'AR_010_STALE_GRACE_TELEMETRY_CHECK',
        'ACT_WORKSITE_TELEMETRY_CHECK',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Telemetry is operating under stale grace period (>60m old). Physical on-site verification advised.',
        'P2_MEDIUM'
      )
    );
  }

  // ==========================================================================
  // 2. CRITICAL RISK RULES (AR-003, AR-006, AR-009, AR-001)
  // Acute heat danger (Heat Index >= 46°C or High + Heavy Labor in Sun)
  // ==========================================================================
  if (assessment.risk_level === 'CRITICAL') {
    // 2.1 Reschedule heavy metabolic tasks immediately
    actions.push(
      createActionRecord(
        'AR_006_CRITICAL_EXERTION_RESCHEDULE',
        'ACT_HIGH_EXERTION_RESCHEDULE',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Critical thermal hazard (HI >= 46°C). High-exertion outdoor physical labor must be immediately rescheduled.'
      )
    );

    // 2.2 Enforce mandatory shaded rest break
    actions.push(
      createActionRecord(
        'AR_003_CRITICAL_MANDATORY_REST',
        'ACT_MANDATORY_REST_BREAK',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Acute heat stress condition. Immediate 15-minute shaded rest break required for all active outdoor personnel.'
      )
    );

    // 2.3 Stand by emergency evacuation & medical response
    actions.push(
      createActionRecord(
        'AR_009_CRITICAL_EMERGENCY_STANDBY',
        'ACT_CRITICAL_EVACUATION_REVIEW',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Critical heat trigger activated. Safety Manager and site first aid must verify emergency heat response readiness.'
      )
    );

    // 2.4 Stage emergency electrolyte hydration
    actions.push(
      createActionRecord(
        'AR_001_CRITICAL_HYDRATION_STAGING',
        'ACT_HYDRATION_STAGING',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Critical ambient heat requires immediate staging of cold electrolyte fluids directly at work stations.'
      )
    );

    return actions;
  }

  // ==========================================================================
  // 3. HIGH RISK RULES (AR-001, AR-002, AR-004, AR-007, AR-006 conditional)
  // Hazardous thermal conditions (39°C <= HI < 46°C or Moderate + Heavy in Sun)
  // ==========================================================================
  if (assessment.risk_level === 'HIGH') {
    // 3.1 Adjust work-rest cycle (45m work / 15m rest)
    actions.push(
      createActionRecord(
        'AR_004_HIGH_WORK_REST_CYCLE',
        'ACT_WORK_REST_CYCLE_ADJUST',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'High heat risk. Implement mandatory 45 min work / 15 min shade rest rotation per OSHA/NIOSH standards.'
      )
    );

    // 3.2 Stage 25L electrolyte hydration cooler
    actions.push(
      createActionRecord(
        'AR_001_HIGH_HYDRATION_STAGING',
        'ACT_HYDRATION_STAGING',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'High thermal index requires dedicated 25L chilled electrolyte cooler staged within 100m of crews.'
      )
    );

    // 3.3 Deploy shaded canopy if outdoor or direct sun
    const isOutdoor =
      worksite.environment_type !== 'INDOOR_COOLED' &&
      worksite.environment_type !== 'INDOOR_UNCOOLED';
    if (isOutdoor) {
      actions.push(
        createActionRecord(
          'AR_002_HIGH_SHADE_CANOPY_DEPLOY',
          'ACT_SHADE_CANOPY_DEPLOY',
          assessment,
          worksite,
          shift,
          undefined,
          evaluatedAt,
          'High thermal load in unshaded outdoor zones requires active shade canopy deployment.'
        )
      );
    }

    // 3.4 Activate peer buddy monitoring
    actions.push(
      createActionRecord(
        'AR_007_HIGH_BUDDY_SYSTEM_ACTIVATE',
        'ACT_BUDDY_SYSTEM_ACTIVATE',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'High heat strain increases individual vulnerability. Mandate buddy pairs for reciprocal monitoring.'
      )
    );

    // 3.5 If heavy or very heavy physical labor is performed, also recommend task rescheduling
    const isHeavyWork =
      shift?.workload_intensity === 'HEAVY' ||
      shift?.workload_intensity === 'VERY_HEAVY' ||
      worksite.zones.some((z) => z.workload_category === 'HEAVY' || z.workload_category === 'VERY_HEAVY');

    if (isHeavyWork) {
      actions.push(
        createActionRecord(
          'AR_006_HIGH_EXERTION_SCHEDULE_REVIEW',
          'ACT_HIGH_EXERTION_RESCHEDULE',
          assessment,
          worksite,
          shift,
          undefined,
          evaluatedAt,
          'Heavy metabolic exertion under High Heat Index elevates cardiovascular strain. Review rescheduling of heaviest tasks.'
        )
      );
    }

    return actions;
  }

  // ==========================================================================
  // 4. MODERATE RISK RULES (AR-008, AR-005, AR-002/AR-007 conditional)
  // Elevated thermal vigilance (32°C <= HI < 39°C)
  // ==========================================================================
  if (assessment.risk_level === 'MODERATE') {
    // 4.1 Replenish chilled drinking water stations
    actions.push(
      createActionRecord(
        'AR_008_MODERATE_WATER_STATION_REFILL',
        'ACT_CHILLED_WATER_REFILL',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Moderate Heat Index. Inspect and replenish chilled potable drinking water dispensers across worksite.'
      )
    );

    // 4.2 Conduct 5-minute heat hazard toolbox talk
    actions.push(
      createActionRecord(
        'AR_005_MODERATE_TOOLBOX_TALK',
        'ACT_TOOLBOX_TALK_HEAT',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Conduct 5-minute toolbox briefing emphasizing regular hydration and self-pacing.'
      )
    );

    // 4.3 If new/returning workers present, activate buddy system
    const hasUnacclimatized = assessment.trigger_factors.some((f) =>
      f.toLowerCase().includes('acclimatiz') || f.toLowerCase().includes('newly mobilized')
    );
    if (hasUnacclimatized) {
      actions.push(
        createActionRecord(
          'AR_007_MODERATE_UNACCLIMATIZED_BUDDY',
          'ACT_BUDDY_SYSTEM_ACTIVATE',
          assessment,
          worksite,
          shift,
          undefined,
          evaluatedAt,
          'Unacclimatized or newly mobilized workers present under Moderate thermal conditions; buddy monitoring required.'
        )
      );
    }

    // 4.4 If direct sun exposure reported, deploy shade canopy
    const hasDirectSun = assessment.trigger_factors.some((f) =>
      f.toLowerCase().includes('direct sun')
    );
    if (hasDirectSun) {
      actions.push(
        createActionRecord(
          'AR_002_MODERATE_DIRECT_SUN_SHADE',
          'ACT_SHADE_CANOPY_DEPLOY',
          assessment,
          worksite,
          shift,
          undefined,
          evaluatedAt,
          'Direct radiant solar exposure coincides with Moderate Heat Index; stage rest shelter.'
        )
      );
    }

    return actions;
  }

  // ==========================================================================
  // 5. LOW RISK RULES (AR-008 baseline, AR-005 optional)
  // Baseline environmental conditions (HI < 32°C)
  // ==========================================================================
  if (assessment.risk_level === 'LOW') {
    // Standard operational baseline: verify potable water dispensers are replenished
    actions.push(
      createActionRecord(
        'AR_008_LOW_BASELINE_WATER_CHECK',
        'ACT_CHILLED_WATER_REFILL',
        assessment,
        worksite,
        shift,
        undefined,
        evaluatedAt,
        'Baseline operational maintenance: verify potable water stations are stocked and functional.',
        'P2_MEDIUM'
      )
    );

    return actions;
  }

  return actions;
}
