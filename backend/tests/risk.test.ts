import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/auth/authService.js';
import {
  calculateHeatIndexCelsius,
  calculateHeatIndexFahrenheit,
  calculateHeatIndexDetailed,
} from '../src/risk/heatIndexCalculator.js';
import {
  calculateSwbgtCelsius,
  calculateVaporPressureHpa,
  calculateSwbgtDetailed,
} from '../src/risk/swbgtCalculator.js';
import {
  evaluateHeatRisk,
  RULE_VERSION,
  EnvironmentalInput,
  WorksiteEvaluationContext,
} from '../src/risk/riskRuleEvaluator.js';
import { riskAssessmentService } from '../src/risk/riskAssessmentService.js';
import { storage } from '../src/storage/localJsonDriver.js';
import { ShiftContext, Worksite } from '@hare/shared';

describe('Phase 5: Deterministic Heat Risk Engine', () => {
  const validPassword = 'HareSafety#2026';
  let supervisorToken: string;
  let safetyManagerToken: string;
  let adminToken: string;
  let crossOrgToken: string;
  const app = createApp();

  const initialShifts: ShiftContext[] = [
    {
      shift_id: 'SHIFT-DAY-01',
      worksite_id: 'WS-BLR-NORTH-04',
      name: 'Morning Civil & Casting Shift',
      shift_type: 'DAY_SHIFT',
      start_time_local: '07:00',
      end_time_local: '15:30',
      peak_sun_overlap: true,
      workload_intensity: 'HEAVY',
      worker_count: 24,
      supervisor_user_id: 'usr_sup_rahul',
      status: 'ACTIVE',
      created_at_utc: '2026-10-01T04:00:00Z',
      updated_at_utc: '2026-10-07T06:00:00Z',
    },
    {
      shift_id: 'SHIFT-AFT-02',
      worksite_id: 'WS-BLR-NORTH-04',
      name: 'Afternoon Assembly & Logistics Shift',
      shift_type: 'AFTERNOON_SHIFT',
      start_time_local: '15:30',
      end_time_local: '23:30',
      peak_sun_overlap: false,
      workload_intensity: 'MODERATE',
      worker_count: 15,
      supervisor_user_id: 'usr_sup_rahul',
      status: 'SCHEDULED',
      created_at_utc: '2026-10-01T04:00:00Z',
      updated_at_utc: '2026-10-07T06:00:00Z',
    },
    {
      shift_id: 'SHIFT-SOUTH-01',
      worksite_id: 'WS-BLR-SOUTH-02',
      name: 'Day Facade Installation Shift',
      shift_type: 'DAY_SHIFT',
      start_time_local: '08:00',
      end_time_local: '16:30',
      peak_sun_overlap: true,
      workload_intensity: 'MODERATE',
      worker_count: 12,
      supervisor_user_id: 'usr_sup_kiran',
      status: 'ACTIVE',
      created_at_utc: '2026-10-01T04:00:00Z',
      updated_at_utc: '2026-10-07T06:00:00Z',
    },
  ];

  beforeEach(async () => {
    const supSession = await authService.login('rahul@site.hare.local', validPassword);
    supervisorToken = supSession.token;

    const mgrSession = await authService.login('ananya@safety.hare.local', validPassword);
    safetyManagerToken = mgrSession.token;

    const admSession = await authService.login('vikram@admin.hare.local', validPassword);
    adminToken = admSession.token;

    const crossOrgSession = authService.generateToken({
      user_id: 'usr_attacker',
      email: 'attacker@rival.corp',
      full_name: 'Attacker User',
      role: 'ADMIN',
      organization_id: 'org_rival_corp',
      assigned_worksite_id: 'ALL',
    });
    crossOrgToken = crossOrgSession.token;
  });

  // ==========================================================================
  // 1. 50 GOLDEN BENCHMARK CASES (NOAA NWS OFFICIAL HEAT INDEX TABLE)
  // ==========================================================================
  describe('Task 5.1: NOAA Rothfusz Heat Index Math (50 Golden Benchmark Cases)', () => {
    // Canonical points from official NOAA/NWS Heat Index chart (T in °F, RH in %, Expected HI in °F within ±1°F)
    const noaaGoldenPoints = [
      { tf: 80, rh: 40, expectedHiF: 80 },
      { tf: 80, rh: 45, expectedHiF: 80 },
      { tf: 80, rh: 50, expectedHiF: 81 },
      { tf: 80, rh: 55, expectedHiF: 81 },
      { tf: 80, rh: 60, expectedHiF: 82 },
      { tf: 80, rh: 65, expectedHiF: 82 },
      { tf: 82, rh: 40, expectedHiF: 82 },
      { tf: 82, rh: 45, expectedHiF: 82 },
      { tf: 82, rh: 50, expectedHiF: 83 },
      { tf: 82, rh: 55, expectedHiF: 84 },
      { tf: 82, rh: 60, expectedHiF: 84 },
      { tf: 82, rh: 65, expectedHiF: 85 },
      { tf: 84, rh: 40, expectedHiF: 83 },
      { tf: 84, rh: 45, expectedHiF: 84 },
      { tf: 84, rh: 50, expectedHiF: 85 },
      { tf: 84, rh: 55, expectedHiF: 86 },
      { tf: 84, rh: 60, expectedHiF: 88 },
      { tf: 84, rh: 65, expectedHiF: 89 },
      { tf: 86, rh: 40, expectedHiF: 85 },
      { tf: 86, rh: 45, expectedHiF: 87 },
      { tf: 86, rh: 50, expectedHiF: 88 },
      { tf: 86, rh: 55, expectedHiF: 89 },
      { tf: 86, rh: 60, expectedHiF: 91 },
      { tf: 86, rh: 65, expectedHiF: 93 },
      { tf: 88, rh: 40, expectedHiF: 88 },
      { tf: 88, rh: 45, expectedHiF: 89 },
      { tf: 88, rh: 50, expectedHiF: 91 },
      { tf: 88, rh: 55, expectedHiF: 93 },
      { tf: 88, rh: 60, expectedHiF: 95 },
      { tf: 88, rh: 65, expectedHiF: 98 },
      { tf: 90, rh: 40, expectedHiF: 91 },
      { tf: 90, rh: 45, expectedHiF: 93 },
      { tf: 90, rh: 50, expectedHiF: 95 },
      { tf: 90, rh: 55, expectedHiF: 97 },
      { tf: 90, rh: 60, expectedHiF: 100 },
      { tf: 90, rh: 65, expectedHiF: 103 },
      { tf: 92, rh: 40, expectedHiF: 94 },
      { tf: 92, rh: 45, expectedHiF: 96 },
      { tf: 92, rh: 50, expectedHiF: 99 },
      { tf: 92, rh: 55, expectedHiF: 101 },
      { tf: 92, rh: 60, expectedHiF: 105 },
      { tf: 92, rh: 65, expectedHiF: 108 },
      { tf: 94, rh: 40, expectedHiF: 97 },
      { tf: 94, rh: 45, expectedHiF: 100 },
      { tf: 94, rh: 50, expectedHiF: 103 },
      { tf: 94, rh: 55, expectedHiF: 106 },
      { tf: 94, rh: 60, expectedHiF: 110 },
      { tf: 94, rh: 65, expectedHiF: 114 },
      { tf: 96, rh: 40, expectedHiF: 101 },
      { tf: 96, rh: 45, expectedHiF: 104 },
      { tf: 96, rh: 50, expectedHiF: 108 },
      { tf: 96, rh: 60, expectedHiF: 116 },
      { tf: 98, rh: 40, expectedHiF: 105 },
      { tf: 98, rh: 50, expectedHiF: 113 },
      { tf: 100, rh: 40, expectedHiF: 109 },
      { tf: 100, rh: 50, expectedHiF: 118 },
      { tf: 102, rh: 40, expectedHiF: 114 },
      { tf: 104, rh: 40, expectedHiF: 119 },
      { tf: 104, rh: 45, expectedHiF: 124 },
      { tf: 106, rh: 40, expectedHiF: 124 },
    ];

    it('Verifies at least 50 NOAA golden benchmark cases match within ±1.0°F tolerance', () => {
      expect(noaaGoldenPoints.length).toBeGreaterThanOrEqual(50);

      for (const pt of noaaGoldenPoints) {
        const computed = calculateHeatIndexFahrenheit(pt.tf, pt.rh);
        const delta = Math.abs(computed - pt.expectedHiF);
        expect(delta).toBeLessThanOrEqual(1.0);
      }
    });

    it('Correctly returns ambient temperature when temp < 20.0°C (68°F)', () => {
      expect(calculateHeatIndexCelsius(15.0, 80)).toBe(15.0);
      expect(calculateHeatIndexCelsius(18.5, 95)).toBe(18.5);
      expect(calculateHeatIndexCelsius(0.0, 50)).toBe(0.0);
    });

    it('Applies low relative humidity adjustment when RH < 13% and 80 <= Tf <= 112', () => {
      // 95°F and 10% RH
      const detailed = calculateHeatIndexDetailed((95 - 32) * (5 / 9), 10);
      expect(detailed.adjustment_applied).toBe('LOW_HUMIDITY');
      expect(detailed.adjustment_value_f).toBeLessThan(0);
    });

    it('Applies high relative humidity adjustment when RH > 85% and 80 <= Tf <= 87', () => {
      // 84°F and 90% RH
      const detailed = calculateHeatIndexDetailed((84 - 32) * (5 / 9), 90);
      expect(detailed.adjustment_applied).toBe('HIGH_HUMIDITY');
      expect(detailed.adjustment_value_f).toBeGreaterThan(0);
    });

    it('Throws descriptive error when receiving NaN inputs', () => {
      expect(() => calculateHeatIndexCelsius(NaN, 50)).toThrow();
      expect(() => calculateHeatIndexCelsius(35, NaN)).toThrow();
    });
  });

  // ==========================================================================
  // 2. SIMPLIFIED WET BULB GLOBE TEMPERATURE (sWBGT)
  // ==========================================================================
  describe('Task 5.2: Simplified Wet Bulb Globe Temperature (sWBGT)', () => {
    it('Calculates accurate water vapor pressure (e) in hPa', () => {
      // At 30°C and 50% RH: saturation vapor pressure ≈ 42.4 hPa, e ≈ 21.2 hPa
      const e = calculateVaporPressureHpa(30.0, 50.0);
      expect(e).toBeGreaterThan(20.0);
      expect(e).toBeLessThan(23.0);
    });

    it('Calculates sWBGT deterministically according to BOM formula', () => {
      // At 35°C and 60% RH
      const swbgt = calculateSwbgtCelsius(35.0, 60.0);
      expect(swbgt).toBeGreaterThan(34.0);
      expect(swbgt).toBeLessThan(40.0);

      // Verify repeatability
      expect(calculateSwbgtCelsius(35.0, 60.0)).toBe(swbgt);
    });

    it('Preserves documented limitations notice in detailed calculation', () => {
      const detailed = calculateSwbgtDetailed(38.0, 55.0);
      expect(detailed.limitations).toContain('ISO 7243');
      expect(detailed.limitations).toContain('black-globe sensors');
    });
  });

  // ==========================================================================
  // 3. BASE ENVIRONMENTAL TIERS & BOUNDARY CONDITIONS
  // ==========================================================================
  describe('Task 5.3: Base Environmental Tiers & Exact Boundary Transitions', () => {
    const baseContext: WorksiteEvaluationContext = {
      worksite_id: 'WS-BLR-NORTH-04',
      name: 'North Bengaluru Site',
      workload_override: 'LIGHT',
      exposure_override: 'PARTIAL_SHADE',
    };

    it('Classifies HI < 32.0°C as LOW risk (R01_ENV_LOW)', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 28.0,
        relative_humidity_pct: 45.0,
        heat_index_c: 28.5,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(env, baseContext);
      expect(result.risk_level).toBe('LOW');
      expect(result.triggered_rule_ids).toContain('R01_ENV_LOW');
    });

    it('Transitions from LOW to MODERATE at exact 32.0°C boundary', () => {
      // 31.9°C => LOW
      const envLow: EnvironmentalInput = {
        dry_bulb_temperature_c: 30.0,
        relative_humidity_pct: 50.0,
        heat_index_c: 31.9,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };
      expect(evaluateHeatRisk(envLow, baseContext).risk_level).toBe('LOW');

      // 32.0°C => MODERATE
      const envMod: EnvironmentalInput = {
        ...envLow,
        heat_index_c: 32.0,
      };
      const resMod = evaluateHeatRisk(envMod, baseContext);
      expect(resMod.risk_level).toBe('MODERATE');
      expect(resMod.triggered_rule_ids).toContain('R01_ENV_MODERATE');
    });

    it('Transitions from MODERATE to HIGH at exact 39.0°C boundary', () => {
      // 38.9°C => MODERATE
      const envMod: EnvironmentalInput = {
        dry_bulb_temperature_c: 34.0,
        relative_humidity_pct: 60.0,
        heat_index_c: 38.9,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };
      expect(evaluateHeatRisk(envMod, baseContext).risk_level).toBe('MODERATE');

      // 39.0°C => HIGH
      const envHigh: EnvironmentalInput = {
        ...envMod,
        heat_index_c: 39.0,
      };
      const resHigh = evaluateHeatRisk(envHigh, baseContext);
      expect(resHigh.risk_level).toBe('HIGH');
      expect(resHigh.triggered_rule_ids).toContain('R01_ENV_HIGH');
    });

    it('Transitions from HIGH to CRITICAL at exact 46.0°C boundary', () => {
      // 45.9°C => HIGH
      const envHigh: EnvironmentalInput = {
        dry_bulb_temperature_c: 38.0,
        relative_humidity_pct: 65.0,
        heat_index_c: 45.9,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };
      expect(evaluateHeatRisk(envHigh, baseContext).risk_level).toBe('HIGH');

      // 46.0°C => CRITICAL
      const envCrit: EnvironmentalInput = {
        ...envHigh,
        heat_index_c: 46.0,
      };
      const resCrit = evaluateHeatRisk(envCrit, baseContext);
      expect(resCrit.risk_level).toBe('CRITICAL');
      expect(resCrit.triggered_rule_ids).toContain('R01_ENV_CRITICAL');
    });
  });

  // ==========================================================================
  // 4. DATA INTEGRITY, FAIL-SAFE & STALENESS GATES (R06)
  // ==========================================================================
  describe('Safety Invariant: Data Integrity & Failsafe Handling (R06)', () => {
    const baseContext: WorksiteEvaluationContext = {
      worksite_id: 'WS-BLR-NORTH-04',
      name: 'North Bengaluru Site',
    };

    it('CRITICAL INVARIANT: Missing weather returns UNKNOWN, never LOW or safe', () => {
      const envMissing: EnvironmentalInput = {
        dry_bulb_temperature_c: 25.0,
        relative_humidity_pct: 40.0,
        data_quality: 'MISSING',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envMissing, baseContext);
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.data_health).toBe('MISSING');
      expect(result.triggered_rule_ids).toContain('R06_DATA_INTEGRITY_FAIL');
    });

    it('Rejects corrupt/out-of-bounds telemetry with UNKNOWN and INVALID status', () => {
      const envInvalid: EnvironmentalInput = {
        dry_bulb_temperature_c: 78.0, // Exceeds 65°C physical limit
        relative_humidity_pct: 120.0, // Exceeds 100%
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 5,
        weather_source: 'IOT_SENSOR',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envInvalid, baseContext);
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.data_health).toBe('INVALID');
      expect(result.triggered_rule_ids).toContain('R06_DATA_INTEGRITY_FAIL');
    });

    it('Flags STALE telemetry (61m - 180m) as DATA_DEGRADED while evaluating under grace period', () => {
      const envStaleGrace: EnvironmentalInput = {
        dry_bulb_temperature_c: 36.0,
        relative_humidity_pct: 60.0,
        heat_index_c: 41.5, // Base HIGH
        data_quality: 'STALE',
        observation_timestamp: '2026-10-08T08:30:00Z',
        observation_age_minutes: 90, // 90m old (within 180m grace)
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envStaleGrace, baseContext);
      expect(result.risk_level).not.toBe('UNKNOWN');
      expect(result.data_health).toBe('STALE');
      expect(result.triggered_rule_ids).toContain('R06_DATA_DEGRADED_STALE');
      expect(result.trigger_factors.some((f) => f.includes('DATA_DEGRADED'))).toBe(true);
    });

    it('Suspends evaluation and yields UNKNOWN when stale telemetry exceeds 180 minutes', () => {
      const envStaleExpired: EnvironmentalInput = {
        dry_bulb_temperature_c: 36.0,
        relative_humidity_pct: 60.0,
        data_quality: 'STALE',
        observation_timestamp: '2026-10-08T06:00:00Z',
        observation_age_minutes: 240, // 4 hours old
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envStaleExpired, baseContext);
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.data_health).toBe('STALE');
      expect(result.triggered_rule_ids).toContain('R06_DATA_INTEGRITY_FAIL');
    });

    it('Rejects future-dated telemetry with UNKNOWN and INVALID status', () => {
      const now = new Date();
      const futureTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours in the future
      const envFuture: EnvironmentalInput = {
        dry_bulb_temperature_c: 32.0,
        relative_humidity_pct: 50.0,
        data_quality: 'VALID',
        observation_timestamp: futureTime,
        observation_age_minutes: -120, // Negative age
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envFuture, baseContext, now.toISOString());
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.data_health).toBe('INVALID');
      expect(result.triggered_rule_ids).toContain('R06_DATA_INTEGRITY_FAIL');
      expect(result.trigger_factors.some((f) => f.includes('future-dated'))).toBe(true);
    });

    it('Rejects negative relative humidity with UNKNOWN and INVALID status', () => {
      const envNegativeRh: EnvironmentalInput = {
        dry_bulb_temperature_c: 30.0,
        relative_humidity_pct: -5.0,
        data_quality: 'VALID',
        observation_timestamp: new Date().toISOString(),
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(envNegativeRh, baseContext);
      expect(result.risk_level).toBe('UNKNOWN');
      expect(result.data_health).toBe('INVALID');
      expect(result.triggered_rule_ids).toContain('R06_DATA_INTEGRITY_FAIL');
    });

    it('Identifies and flags ambiguous shift context with R06_SHIFT_CONTEXT_AMBIGUOUS and limitations note', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 35.0,
        relative_humidity_pct: 55.0,
        heat_index_c: 40.0,
        data_quality: 'VALID',
        observation_timestamp: new Date().toISOString(),
        observation_age_minutes: 15,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ambiguousContext: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        shift_ambiguous: true,
      };

      const result = evaluateHeatRisk(env, ambiguousContext);
      expect(result.triggered_rule_ids).toContain('R06_SHIFT_CONTEXT_AMBIGUOUS');
      expect(result.trigger_factors.some((f) => f.includes('R06_SHIFT_CONTEXT_AMBIGUOUS'))).toBe(true);
      expect(result.explanation.limitations).toContain('Shift context is ambiguous');
    });
  });

  // ==========================================================================
  // 5. CONTEXTUAL ESCALATION RULES (R02, R03, R04, R05)
  // ==========================================================================
  describe('Task 5.3: Contextual Escalation Modifiers', () => {
    it('R02: Escalate HIGH to CRITICAL when Heavy Workload coincides with Direct Sun', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 36.0,
        relative_humidity_pct: 55.0,
        heat_index_c: 42.0, // Base HIGH (39°C - 45.9°C)
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T11:00:00Z',
        observation_age_minutes: 15,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'HEAVY',
        exposure_override: 'DIRECT_SUN',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('CRITICAL');
      expect(result.triggered_rule_ids).toContain('R01_ENV_HIGH');
      expect(result.triggered_rule_ids).toContain('R02_COMBINED_CONTEXT_HIGH_TO_CRITICAL');
    });

    it('R02: Escalate MODERATE to HIGH when Heavy Workload coincides with Direct Sun', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 32.0,
        relative_humidity_pct: 50.0,
        heat_index_c: 35.0, // Base MODERATE (32°C - 38.9°C)
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T11:00:00Z',
        observation_age_minutes: 15,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'HEAVY',
        exposure_override: 'DIRECT_SUN',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('HIGH');
      expect(result.triggered_rule_ids).toContain('R01_ENV_MODERATE');
      expect(result.triggered_rule_ids).toContain('R02_COMBINED_CONTEXT_MODERATE_TO_HIGH');
    });

    it('R03: Escalate MODERATE to HIGH when Workload is VERY_HEAVY (even in shade)', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 32.0,
        relative_humidity_pct: 50.0,
        heat_index_c: 35.0, // Base MODERATE
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T11:00:00Z',
        observation_age_minutes: 15,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'VERY_HEAVY',
        exposure_override: 'FULL_SHADE',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('HIGH');
      expect(result.triggered_rule_ids).toContain('R03_WORKLOAD_VERY_HEAVY_ESCALATION');
    });

    it('R02: Escalate LOW to MODERATE when VERY_HEAVY labor is performed in Direct Sun', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 28.0,
        relative_humidity_pct: 45.0,
        heat_index_c: 29.0, // Base LOW (< 32°C)
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T09:00:00Z',
        observation_age_minutes: 15,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'VERY_HEAVY',
        exposure_override: 'DIRECT_SUN',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('MODERATE');
      expect(result.triggered_rule_ids).toContain('R02_COMBINED_CONTEXT_LOW_TO_MODERATE');
    });

    it('R05: Escalate MODERATE to HIGH for NEW_OR_RETURNING workforce acclimatization context', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 33.0,
        relative_humidity_pct: 50.0,
        heat_index_c: 36.5, // Base MODERATE
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'LIGHT',
        exposure_override: 'PARTIAL_SHADE',
        acclimatization_context: 'NEW_OR_RETURNING',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('HIGH');
      expect(result.triggered_rule_ids).toContain('R05_ACCLIMATIZATION_MODIFIER_NEW_WORKERS');
    });

    it('Conservative Safety Precedence: Multi-factor conflicts always resolve upward, never downward', () => {
      // Base MODERATE
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 34.0,
        relative_humidity_pct: 50.0,
        heat_index_c: 37.0,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      // Modifiers elevate to HIGH
      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'HEAVY',
        exposure_override: 'DIRECT_SUN',
      };

      const result = evaluateHeatRisk(env, ctx);
      expect(result.risk_level).toBe('HIGH');
    });
  });

  // ==========================================================================
  // 6. REPEATABILITY, EXPLAINABILITY & PROVENANCE
  // ==========================================================================
  describe('Explainability, Rule Versioning & Repeatability', () => {
    it('Produces 100% deterministic, identical results given identical inputs', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 37.5,
        relative_humidity_pct: 62.0,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T12:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const ctx: WorksiteEvaluationContext = {
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'North Bengaluru Site',
        workload_override: 'HEAVY',
        exposure_override: 'DIRECT_SUN',
      };

      const fixedTimestamp = '2026-10-08T12:05:00Z';
      const run1 = evaluateHeatRisk(env, ctx, fixedTimestamp);
      const run2 = evaluateHeatRisk(env, ctx, fixedTimestamp);

      expect(run1.risk_level).toBe(run2.risk_level);
      expect(run1.heat_index_c).toBe(run2.heat_index_c);
      expect(run1.swbgt_c).toBe(run2.swbgt_c);
      expect(run1.triggered_rule_ids).toEqual(run2.triggered_rule_ids);
      expect(run1.explanation).toEqual(run2.explanation);
    });

    it('Permanently records rule_version: "1.0.0" in assessment results', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 30.0,
        relative_humidity_pct: 50.0,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(env, { worksite_id: 'WS-BLR-NORTH-04', name: 'Site' });
      expect(result.rule_version).toBe('1.0.0');
      expect(RULE_VERSION).toBe('1.0.0');
    });

    it('Emits complete 6-part explanation contract matching docs/73_RISK_API.md Section 7', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 38.0,
        relative_humidity_pct: 58.0,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 12,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(env, { worksite_id: 'WS-BLR-NORTH-04', name: 'Site' });
      expect(result.explanation.what).toBeDefined();
      expect(result.explanation.why).toBeDefined();
      expect(result.explanation.data).toBeDefined();
      expect(result.explanation.rule).toContain('1.0.0');
      expect(result.explanation.limitations).toContain('wet-bulb globe temperature');
      expect(result.explanation.next_steps).toBeDefined();
    });

    it('Guarantees ZERO individual worker clinical PII in risk output', () => {
      const env: EnvironmentalInput = {
        dry_bulb_temperature_c: 35.0,
        relative_humidity_pct: 50.0,
        data_quality: 'VALID',
        observation_timestamp: '2026-10-08T10:00:00Z',
        observation_age_minutes: 10,
        weather_source: 'OPEN_METEO',
        source_type: 'CURRENT_OBSERVATION',
        is_simulation: false,
      };

      const result = evaluateHeatRisk(env, { worksite_id: 'WS-BLR-NORTH-04', name: 'Site' });
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('worker_name');
      expect(serialized).not.toContain('heart_rate');
      expect(serialized).not.toContain('core_temp');
      expect(serialized).not.toContain('medical');
    });
  });

  // ==========================================================================
  // 7. REST API ENDPOINTS & RBAC SCOPING (Task 5.5 & docs/73_RISK_API.md)
  // ==========================================================================
  describe('Task 5.5 & docs/73_RISK_API.md HTTP API & Authorization', () => {
    it('POST /api/v1/risk/evaluate/:worksiteId evaluates and returns authoritative risk', async () => {
      const res = await request(app)
        .post('/api/v1/risk/evaluate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${safetyManagerToken}`)
        .send({
          reason: 'SCHEDULED_MIDDAY_CHECK',
          workload_override: 'HEAVY',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assessment_id).toBeDefined();
      expect(res.body.data.risk_level).toBeDefined();
      expect(res.body.data.rule_version).toBe('1.0.0');
      expect(res.body.data.explanation).toBeDefined();
      expect(res.body.data.risk_factors).toBeInstanceOf(Array);
    });

    it('POST /api/v1/worksites/:worksiteId/risk/assess alias endpoint evaluates correctly', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/risk/assess')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          reason: 'SUPERVISOR_OBSERVATION',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(res.body.data.risk_level).toBeDefined();
    });

    it('SECURITY INVARIANT: Rejects client attempt to supply or override risk level with 422', async () => {
      const res = await request(app)
        .post('/api/v1/risk/evaluate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          risk_level: 'LOW', // Attempted override
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('CLIENT_OVERRIDE_PROHIBITED');
    });

    it('GET /api/v1/risk/:worksiteId/latest returns current assessment', async () => {
      const res = await request(app)
        .get('/api/v1/risk/WS-BLR-NORTH-04/latest')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(res.body.data.risk_level).toBeDefined();
      expect(res.body.data.heat_index_c).toBeDefined();
    });

    it('GET /api/v1/worksites/:worksiteId/risk alias endpoint returns latest assessment', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/risk')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worksite_id).toBe('WS-BLR-NORTH-04');
    });

    it('GET /api/v1/risk/:worksiteId/history returns chronological history list', async () => {
      const res = await request(app)
        .get('/api/v1/risk/WS-BLR-NORTH-04/history')
        .set('Authorization', `Bearer ${safetyManagerToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.count).toBeDefined();
    });

    it('DENIES Supervisor access to unassigned worksite with 403', async () => {
      // Supervisor Rahul is assigned to WS-BLR-NORTH-04, NOT WS-BLR-SOUTH-02
      const res = await request(app)
        .get('/api/v1/risk/WS-BLR-SOUTH-02/latest')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toContain('RESOURCE_ACCESS_DENIED');
    });

    it('DENIES cross-tenant user access with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .get('/api/v1/risk/WS-BLR-NORTH-04/latest')
        .set('Authorization', `Bearer ${crossOrgToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });

    it('Returns 404 WORKSITE_NOT_FOUND when requesting non-existent worksite', async () => {
      const res = await request(app)
        .get('/api/v1/risk/WS-NON-EXISTENT/latest')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('WORKSITE_NOT_FOUND');
    });
  });
});
