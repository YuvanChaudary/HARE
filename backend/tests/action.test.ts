import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/auth/authService.js';
import { storage } from '../src/storage/localJsonDriver.js';
import { ACTION_CATALOG } from '../src/action/actionCatalog.js';
import { evaluateActionRules, ACTION_RULE_VERSION } from '../src/action/actionRuleEngine.js';
import { actionService } from '../src/action/actionService.js';
import {
  ActionRecord,
  RiskAssessmentResult,
  Worksite,
  ShiftContext,
} from '@hare/shared';

describe('Phase 6: Deterministic Action Engine', () => {
  const validPassword = 'HareSafety#2026';
  let supervisorToken: string;
  let safetyManagerToken: string;
  let adminToken: string;
  let crossOrgToken: string;
  const app = createApp();

  const testWorksite: Worksite = {
    worksite_id: 'WS-BLR-NORTH-04',
    name: 'North Bengaluru Concrete & Heavy Casting Yard',
    organization_id: 'org_infra_corp',
    timezone: 'Asia/Kolkata',
    worksite_type: 'CONSTRUCTION',
    environment_type: 'OUTDOOR',
    location: {
      latitude: 13.0827,
      longitude: 80.2707,
      city: 'Bengaluru',
      state: 'Karnataka',
      elevation_m: 920.0,
    },
    zones: [
      {
        zone_id: 'ZONE-NORTH-CASTING',
        name: 'Precast Girders & Rebar Yard',
        workload_category: 'HEAVY',
        sun_exposure: 'DIRECT_SUN',
        active_crew_count: 24,
        shade_available: false,
        water_access_distance_m: 80,
      },
      {
        zone_id: 'ZONE-NORTH-FABRICATION',
        name: 'Covered Steel Fabrication Shed',
        workload_category: 'MODERATE',
        sun_exposure: 'PARTIAL_SHADE',
        active_crew_count: 14,
        shade_available: true,
        water_access_distance_m: 25,
      },
    ],
    safeguards: {
      water_stations_count: 4,
      shaded_rest_areas_count: 2,
      active_misting_fans_count: 2,
      first_aid_station_present: true,
    },
    assigned_supervisor_id: 'usr_sup_rahul',
    status: 'ACTIVE',
    created_at_utc: '2026-10-01T04:00:00Z',
  };

  const testShift: ShiftContext = {
    shift_id: 'SHIFT-DAY-01',
    worksite_id: 'WS-BLR-NORTH-04',
    name: 'Morning Heavy Civil & Casting Shift',
    shift_type: 'DAY_SHIFT',
    start_time_local: '07:00',
    end_time_local: '15:30',
    peak_sun_overlap: true,
    workload_intensity: 'HEAVY',
    worker_count: 24,
    supervisor_user_id: 'usr_sup_rahul',
    status: 'ACTIVE',
    created_at_utc: '2026-10-01T04:00:00Z',
  };

  const baseAssessment: RiskAssessmentResult = {
    assessment_id: 'rsk_test_high_01',
    risk_id: 'rsk_test_high_01',
    worksite_id: 'WS-BLR-NORTH-04',
    organization_id: 'org_infra_corp',
    shift_id: 'SHIFT-DAY-01',
    risk_level: 'HIGH',
    heat_index_c: 42.5,
    swbgt_c: 33.2,
    trigger_factors: [
      'Heat Index (42.5°C) breaches High threshold (39°C - 45.9°C)',
      'HEAVY labor in DIRECT SUN',
    ],
    triggered_rule_ids: ['R01_ENV_HIGH', 'R02_COMBINED_CONTEXT_HIGH_TO_CRITICAL'],
    rule_version: '1.0.0',
    evaluated_at_utc: '2026-10-08T11:30:00Z',
    valid_until_utc: '2026-10-08T12:30:00Z',
    data_health: 'VALID',
    is_simulation: false,
    source_context: {
      weather_source: 'OPEN_METEO',
      source_type: 'CURRENT_OBSERVATION',
      observation_timestamp: '2026-10-08T11:25:00Z',
      observation_age_minutes: 5,
      station_id: 'STN_BLR_NORTH_01',
    },
    risk_factors: [],
    explanation: {
      what: 'Worksite is operating at HIGH heat risk.',
      why: 'Heat Index 42.5°C with HEAVY labor in DIRECT SUN.',
      data: 'Observation 5m old, status VALID.',
      rule: 'Rule Matrix v1.0.0',
      limitations: 'sWBGT is proxy.',
      next_steps: 'Mandate work-rest cycles.',
    },
    reason_synthesis: 'High risk thermal strain.',
  };

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

    // Reset actions and ensure test assessment is seeded
    await storage.writeCollection('actions', []);
    const assessments = await storage.readCollection<RiskAssessmentResult>('risk_assessments');
    if (!assessments.some((a) => a.assessment_id === baseAssessment.assessment_id)) {
      assessments.push(baseAssessment);
      await storage.writeCollection('risk_assessments', assessments);
    }
  });

  // ==========================================================================
  // 1. ACTION CATALOG AUDIT (Task 6.1)
  // ==========================================================================
  describe('Task 6.1: Action Catalog Definitions', () => {
    it('Defines all 9 canonical industrial preventive action SOPs with valid parameters', () => {
      const canonicalSops = [
        'ACT_HYDRATION_STAGING',
        'ACT_SHADE_CANOPY_DEPLOY',
        'ACT_MANDATORY_REST_BREAK',
        'ACT_WORK_REST_CYCLE_ADJUST',
        'ACT_TOOLBOX_TALK_HEAT',
        'ACT_HIGH_EXERTION_RESCHEDULE',
        'ACT_BUDDY_SYSTEM_ACTIVATE',
        'ACT_CHILLED_WATER_REFILL',
        'ACT_CRITICAL_EVACUATION_REVIEW',
      ];

      for (const sop of canonicalSops) {
        const def = ACTION_CATALOG[sop];
        expect(def).toBeDefined();
        expect(def.sop_code).toBe(sop);
        expect(def.title).toBeTruthy();
        expect(def.description_template).toBeTruthy();
        expect(def.sla_minutes).toBeGreaterThan(0);
        expect(def.default_priority).toBeDefined();
        expect(def.source_reference).toBeTruthy();
      }
    });

    it('Correctly configures P0_CRITICAL priority for acute emergency actions', () => {
      expect(ACTION_CATALOG.ACT_MANDATORY_REST_BREAK.default_priority).toBe('P0_CRITICAL');
      expect(ACTION_CATALOG.ACT_HIGH_EXERTION_RESCHEDULE.default_priority).toBe('P0_CRITICAL');
      expect(ACTION_CATALOG.ACT_CRITICAL_EVACUATION_REVIEW.default_priority).toBe('P0_CRITICAL');
    });

    it('Correctly sets urgent SLA timeframes (15m - 45m)', () => {
      expect(ACTION_CATALOG.ACT_CRITICAL_EVACUATION_REVIEW.sla_minutes).toBe(15);
      expect(ACTION_CATALOG.ACT_MANDATORY_REST_BREAK.sla_minutes).toBe(20);
      expect(ACTION_CATALOG.ACT_HYDRATION_STAGING.sla_minutes).toBe(30);
      expect(ACTION_CATALOG.ACT_SHADE_CANOPY_DEPLOY.sla_minutes).toBe(45);
    });
  });

  // ==========================================================================
  // 2. DETERMINISTIC ACTION RULE EVALUATOR (Task 6.2)
  // ==========================================================================
  describe('Task 6.2: Pure Deterministic Action Rule Evaluator', () => {
    it('CRITICAL risk triggers mandatory rest break, exertion halt, medical standby, and hydration', () => {
      const critAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_critical',
        risk_level: 'CRITICAL',
        heat_index_c: 48.0,
      };

      const actions = evaluateActionRules(critAssessment, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_MANDATORY_REST_BREAK');
      expect(actionTypes).toContain('ACT_HIGH_EXERTION_RESCHEDULE');
      expect(actionTypes).toContain('ACT_CRITICAL_EVACUATION_REVIEW');
      expect(actionTypes).toContain('ACT_HYDRATION_STAGING');

      // Verify P0_CRITICAL priority
      const restBreak = actions.find((a) => a.action_type === 'ACT_MANDATORY_REST_BREAK');
      expect(restBreak?.priority).toBe('P0_CRITICAL');
      expect(restBreak?.is_required).toBe(true);

      const medicalStandby = actions.find((a) => a.action_type === 'ACT_CRITICAL_EVACUATION_REVIEW');
      expect(medicalStandby?.owner_role).toBe('SAFETY_MANAGER');
    });

    it('HIGH risk triggers work-rest adjustment, hydration staging, shade canopy, and buddy teams', () => {
      const highAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        risk_level: 'HIGH',
      };

      const actions = evaluateActionRules(highAssessment, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_WORK_REST_CYCLE_ADJUST');
      expect(actionTypes).toContain('ACT_HYDRATION_STAGING');
      expect(actionTypes).toContain('ACT_SHADE_CANOPY_DEPLOY');
      expect(actionTypes).toContain('ACT_BUDDY_SYSTEM_ACTIVATE');
      expect(actionTypes).toContain('ACT_HIGH_EXERTION_RESCHEDULE'); // Heavy workload in shift
    });

    it('MODERATE risk triggers water station refill and toolbox talk', () => {
      const modAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_mod',
        risk_level: 'MODERATE',
        heat_index_c: 35.5,
        trigger_factors: ['Moderate threshold breached'],
      };

      const actions = evaluateActionRules(modAssessment, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_CHILLED_WATER_REFILL');
      expect(actionTypes).toContain('ACT_TOOLBOX_TALK_HEAT');
      expect(actionTypes).not.toContain('ACT_MANDATORY_REST_BREAK');
      expect(actionTypes).not.toContain('ACT_CRITICAL_EVACUATION_REVIEW');
    });

    it('MODERATE risk with unacclimatized workers activates buddy system (R05 / AR-007)', () => {
      const modUnacclimatized: RiskAssessmentResult = {
        ...baseAssessment,
        risk_level: 'MODERATE',
        trigger_factors: ['Moderate Heat Index', 'Workforce acclimatization: newly mobilized workers present'],
      };

      const actions = evaluateActionRules(modUnacclimatized, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_BUDDY_SYSTEM_ACTIVATE');
    });

    it('LOW risk triggers standard baseline water station refill only', () => {
      const lowAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_low',
        risk_level: 'LOW',
        heat_index_c: 28.0,
        trigger_factors: ['Heat Index below 32°C'],
      };

      const actions = evaluateActionRules(lowAssessment, testWorksite, testShift);
      expect(actions.length).toBe(1);
      expect(actions[0].action_type).toBe('ACT_CHILLED_WATER_REFILL');
      expect(actions[0].priority).toBe('P2_MEDIUM');
    });

    it('CRITICAL SAFETY INVARIANT: UNKNOWN risk generates telemetry check and maintains hydration readiness', () => {
      const unknownAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_unknown',
        risk_level: 'UNKNOWN',
        data_health: 'MISSING',
        trigger_factors: ['Data health is MISSING'],
      };

      const actions = evaluateActionRules(unknownAssessment, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_WORKSITE_TELEMETRY_CHECK');
      expect(actionTypes).toContain('ACT_CHILLED_WATER_REFILL');

      const telemetryCheck = actions.find((a) => a.action_type === 'ACT_WORKSITE_TELEMETRY_CHECK');
      expect(telemetryCheck?.is_required).toBe(true);
      expect(telemetryCheck?.explanation).toContain('MISSING');
    });

    it('STALE data under grace period appends telemetry verification warning', () => {
      const staleAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_stale',
        risk_level: 'HIGH',
        data_health: 'STALE',
      };

      const actions = evaluateActionRules(staleAssessment, testWorksite, testShift);
      const actionTypes = actions.map((a) => a.action_type);

      expect(actionTypes).toContain('ACT_WORKSITE_TELEMETRY_CHECK');
      expect(actionTypes).toContain('ACT_WORK_REST_CYCLE_ADJUST');
    });

    it('Preserves simulation status across all generated action records', () => {
      const simAssessment: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_sim',
        is_simulation: true,
      };

      const actions = evaluateActionRules(simAssessment, testWorksite, testShift);
      for (const action of actions) {
        expect(action.is_simulation).toBe(true);
      }
    });

    it('Produces 100% deterministic, identical action output given identical inputs', () => {
      const run1 = evaluateActionRules(baseAssessment, testWorksite, testShift, {
        evaluatedAtUtc: '2026-10-08T12:00:00Z',
      });
      const run2 = evaluateActionRules(baseAssessment, testWorksite, testShift, {
        evaluatedAtUtc: '2026-10-08T12:00:00Z',
      });

      expect(JSON.stringify(run1)).toBe(JSON.stringify(run2));
    });

    it('Computes countdown deadline exactly matching evaluatedAt + sla_minutes', () => {
      const evaluatedAt = '2026-10-08T10:00:00.000Z';
      const actions = evaluateActionRules(baseAssessment, testWorksite, testShift, {
        evaluatedAtUtc: evaluatedAt,
      });

      for (const action of actions) {
        const expectedDeadlineMs = new Date(evaluatedAt).getTime() + action.sla_minutes * 60 * 1000;
        expect(new Date(action.deadline_utc).getTime()).toBe(expectedDeadlineMs);
      }
    });
  });

  // ==========================================================================
  // 3. DEDUPLICATION & IDEMPOTENCY SERVICE (Task 6.3 & Task 6.4)
  // ==========================================================================
  describe('Task 6.3 & 6.4: Action Service Deduplication & Idempotency', () => {
    it('Idempotently returns existing actions when same assessment is generated repeatedly', async () => {
      const user = {
        sub: 'usr_sup_rahul',
        email: 'rahul@site.hare.local',
        role: 'SUPERVISOR' as const,
        org_id: 'org_infra_corp',
        assigned_worksite_id: 'WS-BLR-NORTH-04',
      };

      const firstPass = await actionService.generateActionsForAssessment(baseAssessment.assessment_id, user);
      expect(firstPass.length).toBeGreaterThan(0);

      const secondPass = await actionService.generateActionsForAssessment(baseAssessment.assessment_id, user);
      expect(secondPass.length).toBe(firstPass.length);

      // Verify identical action IDs
      const firstIds = firstPass.map((a) => a.action_id).sort();
      const secondIds = secondPass.map((a) => a.action_id).sort();
      expect(secondIds).toEqual(firstIds);

      // Verify no duplicate records in storage
      const storedActions = await storage.readCollection<ActionRecord>('actions');
      expect(storedActions.length).toBe(firstPass.length);
    });

    it('Deduplicates active directives across subsequent assessments with identical deduplication_keys', async () => {
      const user = {
        sub: 'usr_mgr_ananya',
        email: 'ananya@safety.hare.local',
        role: 'SAFETY_MANAGER' as const,
        org_id: 'org_infra_corp',
        assigned_worksite_id: 'ALL',
      };

      // Assessment 1
      await actionService.generateActionsForAssessment(baseAssessment.assessment_id, user);
      const actionsAfterFirst = await storage.readCollection<ActionRecord>('actions');

      // Create a second assessment 15 minutes later for the same site
      const assessment2: RiskAssessmentResult = {
        ...baseAssessment,
        assessment_id: 'rsk_test_high_02',
        risk_id: 'rsk_test_high_02',
        evaluated_at_utc: '2026-10-08T11:45:00Z',
      };
      const allAssessments = await storage.readCollection<RiskAssessmentResult>('risk_assessments');
      allAssessments.push(assessment2);
      await storage.writeCollection('risk_assessments', allAssessments);

      // Assessment 2 evaluation
      const secondResult = await actionService.generateActionsForAssessment(assessment2.assessment_id, user);

      // Should reuse existing active actions rather than flooding the database with duplicates
      const actionsAfterSecond = await storage.readCollection<ActionRecord>('actions');
      expect(actionsAfterSecond.length).toBe(actionsAfterFirst.length);
      expect(secondResult.length).toBe(actionsAfterFirst.length);
    });
  });

  // ==========================================================================
  // 4. REST API ENDPOINTS & RBAC SCOPING (Task 6.5 & docs/74_ACTION_API.md)
  // ==========================================================================
  describe('Task 6.5 & docs/74_ACTION_API.md HTTP API & Authorization', () => {
    it('POST /api/v1/actions/generate/:worksiteId evaluates and returns action directives', async () => {
      const res = await request(app)
        .post('/api/v1/actions/generate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].action_id).toBeDefined();
      expect(res.body.data[0].worksite_id).toBe('WS-BLR-NORTH-04');
      expect(res.body.data[0].status).toBe('PENDING_ACKNOWLEDGMENT');
      expect(res.body.data[0].rule_version).toBe('1.0.0');
    });

    it('POST /api/v1/worksites/:worksiteId/actions/generate alias endpoint works identically', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/actions/generate')
        .set('Authorization', `Bearer ${safetyManagerToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('POST /api/v1/risk-assessments/:assessmentId/actions generates actions for specific assessment', async () => {
      const res = await request(app)
        .post(`/api/v1/risk-assessments/${baseAssessment.assessment_id}/actions`)
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send();

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].assessment_id).toBe(baseAssessment.assessment_id);
    });

    it('SECURITY INVARIANT: Rejects client attempt to dictate action priority or status with 422', async () => {
      const res = await request(app)
        .post('/api/v1/actions/generate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          priority: 'LOW', // Attempted override
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('CLIENT_OVERRIDE_PROHIBITED');
    });

    it('GET /api/v1/actions returns scoped actions list', async () => {
      // First generate actions
      await request(app)
        .post('/api/v1/actions/generate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send();

      const res = await request(app)
        .get('/api/v1/actions?worksite_id=WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/actions/:actionId returns single action by ID', async () => {
      const genRes = await request(app)
        .post('/api/v1/actions/generate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send();

      const actionId = genRes.body.data[0].action_id;

      const res = await request(app)
        .get(`/api/v1/actions/${actionId}`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.action_id).toBe(actionId);
      expect(res.body.data.source_rule_id).toBeDefined();
    });

    it('GET /api/v1/worksites/:worksiteId/actions returns worksite actions', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/actions')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('GET /api/v1/risk-assessments/:assessmentId/actions returns assessment actions', async () => {
      const res = await request(app)
        .get(`/api/v1/risk-assessments/${baseAssessment.assessment_id}/actions`)
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('DENIES Supervisor access to unassigned worksite with 403 RESOURCE_ACCESS_DENIED', async () => {
      // Supervisor Rahul is assigned to WS-BLR-NORTH-04, NOT WS-BLR-SOUTH-02
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-SOUTH-02/actions')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toContain('RESOURCE_ACCESS_DENIED');
    });

    it('DENIES cross-tenant access with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .get('/api/v1/actions')
        .set('Authorization', `Bearer ${crossOrgToken}`);

      expect(res.status).toBe(200); // Lists only their tenant's actions (0)
      expect(res.body.data.length).toBe(0);

      // Attempting to generate on rival tenant worksite fails with 404/403
      const genRes = await request(app)
        .post('/api/v1/actions/generate/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${crossOrgToken}`)
        .send();

      expect(genRes.status).toBe(403);
      expect(genRes.body.error.code).toBe('AUTHORIZATION_DENIED');
    });

    it('Returns 404 ACTION_NOT_FOUND when requesting non-existent action ID', async () => {
      const res = await request(app)
        .get('/api/v1/actions/act_non_existent_999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ACTION_NOT_FOUND');
    });
  });
});
