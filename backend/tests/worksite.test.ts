import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/auth/authService.js';
import {
  parseMinutes,
  calculatePeakSunOverlap,
  isTimeInInterval,
  worksiteService,
} from '../src/worksite/worksiteService.js';
import { Worksite, ShiftContext } from '@hare/shared';
import { storage } from '../src/storage/localJsonDriver.js';

describe('Phase 4: Worksite & Shift Context Engine', () => {
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

  beforeAll(async () => {
    await storage.writeCollection('shifts', initialShifts);
  });

  afterAll(async () => {
    await storage.writeCollection('shifts', initialShifts);
  });

  beforeEach(async () => {
    // Generate valid tokens
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

  // --------------------------------------------------------------------------
  // 1. DOMAIN LOGIC: TIME MATH & PEAK SUN CALCULATIONS
  // --------------------------------------------------------------------------
  describe('Temporal Mathematics & Peak Sun Exposure (docs/15_WORKER_SHIFT_MODEL.md)', () => {
    it('Parses valid HH:mm time strings into correct minute counts', () => {
      expect(parseMinutes('00:00')).toBe(0);
      expect(parseMinutes('07:30')).toBe(450);
      expect(parseMinutes('15:45')).toBe(945);
      expect(parseMinutes('23:59')).toBe(1439);
    });

    it('Rejects malformed and out-of-range time strings', () => {
      expect(() => parseMinutes('invalid')).toThrow();
      expect(() => parseMinutes('25:00')).toThrow();
      expect(() => parseMinutes('12:60')).toThrow();
    });

    it('Correctly determines if time falls in standard interval', () => {
      const start = parseMinutes('07:00'); // 420
      const end = parseMinutes('15:30');   // 930

      expect(isTimeInInterval(parseMinutes('07:00'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('12:00'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('15:29'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('15:30'), start, end)).toBe(false);
      expect(isTimeInInterval(parseMinutes('06:59'), start, end)).toBe(false);
    });

    it('Correctly handles overnight shift intervals crossing midnight', () => {
      const start = parseMinutes('22:00'); // 1320
      const end = parseMinutes('06:00');   // 360

      expect(isTimeInInterval(parseMinutes('23:30'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('02:00'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('05:59'), start, end)).toBe(true);
      expect(isTimeInInterval(parseMinutes('06:00'), start, end)).toBe(false);
      expect(isTimeInInterval(parseMinutes('12:00'), start, end)).toBe(false);
    });

    it('Calculates peak sun overlap accurately (11:00 to 15:00 window)', () => {
      // Day shift (07:00 - 15:30) overlaps 11:00 - 15:00
      expect(calculatePeakSunOverlap('07:00', '15:30')).toBe(true);

      // Afternoon shift (15:30 - 23:30) starts after peak sun ends
      expect(calculatePeakSunOverlap('15:30', '23:30')).toBe(false);

      // Morning shift (06:00 - 10:30) ends before peak sun begins
      expect(calculatePeakSunOverlap('06:00', '10:30')).toBe(false);

      // Midday shift (11:30 - 14:00) falls entirely inside peak sun
      expect(calculatePeakSunOverlap('11:30', '14:00')).toBe(true);

      // Night shift (22:00 - 06:00) does not overlap
      expect(calculatePeakSunOverlap('22:00', '06:00')).toBe(false);
    });
  });

  // --------------------------------------------------------------------------
  // 2. ACTIVE SHIFT RESOLUTION & AMBIGUITY DETECTION
  // --------------------------------------------------------------------------
  describe('Active Shift Resolution Engine', () => {
    it('Resolves active shift deterministically based on reference time', async () => {
      const worksite = await worksiteService.getWorksiteById('WS-BLR-NORTH-04', {
        sub: 'usr_mgr_ananya',
        email: 'ananya@safety.hare.local',
        role: 'SAFETY_MANAGER',
        org_id: 'org_infra_corp',
      });

      // 10:00 AM IST on October 7, 2026 (04:30 AM UTC)
      const morningRef = new Date('2026-10-07T04:30:00Z');
      const result = await worksiteService.resolveActiveShift(worksite, morningRef);

      expect(result.isAmbiguous).toBe(false);
      expect(result.activeShift).toBeDefined();
      expect(result.activeShift?.shift_id).toBe('SHIFT-DAY-01');
      expect(result.activeShift?.name).toBe('Morning Civil & Casting Shift');
    });

    it('Returns null active shift when worksite is unoccupied outside shift hours', async () => {
      const worksite = await worksiteService.getWorksiteById('WS-BLR-NORTH-04', {
        sub: 'usr_mgr_ananya',
        email: 'ananya@safety.hare.local',
        role: 'SAFETY_MANAGER',
        org_id: 'org_infra_corp',
      });

      // 03:00 AM IST (21:30 PM UTC previous day)
      const nightRef = new Date('2026-10-06T21:30:00Z');
      const result = await worksiteService.resolveActiveShift(worksite, nightRef);

      expect(result.isAmbiguous).toBe(false);
      expect(result.activeShift).toBeNull();
      expect(result.matchingCount).toBe(0);
    });

    it('Flags ambiguity and refuses to arbitrarily pick when multiple shifts overlap', async () => {
      // Temporarily inject overlapping shift
      const shifts = await storage.readCollection<ShiftContext>('shifts');
      const overlapShift: ShiftContext = {
        shift_id: 'SHIFT-OVERLAP-TEST',
        worksite_id: 'WS-BLR-NORTH-04',
        name: 'Overlapping Concrete Pour',
        shift_type: 'DAY_SHIFT',
        start_time_local: '08:00',
        end_time_local: '16:00',
        peak_sun_overlap: true,
        supervisor_user_id: 'usr_sup_rahul',
        status: 'ACTIVE',
      };
      await storage.writeCollection('shifts', [...shifts, overlapShift]);

      try {
        const worksite = await worksiteService.getWorksiteById('WS-BLR-NORTH-04', {
          sub: 'usr_mgr_ananya',
          email: 'ananya@safety.hare.local',
          role: 'SAFETY_MANAGER',
          org_id: 'org_infra_corp',
        });

        // 10:00 AM IST (matches both SHIFT-DAY-01 and SHIFT-OVERLAP-TEST)
        const morningRef = new Date('2026-10-07T04:30:00Z');
        const result = await worksiteService.resolveActiveShift(worksite, morningRef);

        expect(result.isAmbiguous).toBe(true);
        expect(result.activeShift).toBeNull(); // Do NOT pick an arbitrary winner
        expect(result.matchingCount).toBe(2);
      } finally {
        // Restore original shifts
        await storage.writeCollection('shifts', shifts);
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. TENANT ISOLATION & SUPERVISOR WORKSITE CONFINEMENT
  // --------------------------------------------------------------------------
  describe('Tenant Boundary & Supervisor Scoping (docs/19_PERMISSION_MODEL.md & docs/83_AUTHORIZATION.md)', () => {
    it('GET /api/v1/worksites confines Supervisor Rahul to WS-BLR-NORTH-04', async () => {
      const res = await request(app)
        .get('/api/v1/worksites')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].worksite_id).toBe('WS-BLR-NORTH-04');
    });

    it('GET /api/v1/worksites allows Safety Manager Ananya cross-site view of entire organization', async () => {
      const res = await request(app)
        .get('/api/v1/worksites')
        .set('Authorization', `Bearer ${safetyManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      const siteIds = res.body.data.map((w: Worksite) => w.worksite_id);
      expect(siteIds).toContain('WS-BLR-NORTH-04');
      expect(siteIds).toContain('WS-BLR-SOUTH-02');
    });

    it('GET /api/v1/worksites isolates cross-tenant users completely', async () => {
      const res = await request(app)
        .get('/api/v1/worksites')
        .set('Authorization', `Bearer ${crossOrgToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0); // Rival org has no worksites in infra corp
    });

    it('GET /api/v1/worksites/:id DENIES Supervisor access to unassigned worksite with 403', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-SOUTH-02')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('RESOURCE_ACCESS_DENIED');
    });

    it('GET /api/v1/worksites/:id DENIES cross-tenant access with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04')
        .set('Authorization', `Bearer ${crossOrgToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });
  });

  // --------------------------------------------------------------------------
  // 4. WORKSITE CREATION & COORDINATE VALIDATION
  // --------------------------------------------------------------------------
  describe('Worksite Lifecycle & Geocoding Validation', () => {
    it('POST /api/v1/worksites DENIES Supervisor role with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/worksites')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ name: 'Unauthorized Site' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });

    it('POST /api/v1/worksites rejects out-of-range coordinates with 422 INVALID_COORDINATES', async () => {
      const res = await request(app)
        .post('/api/v1/worksites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Lat Site',
          location: {
            latitude: 120.5, // Invalid > 90
            longitude: 77.5,
          },
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('INVALID_COORDINATES');
    });

    it('POST /api/v1/worksites allows Administrator to provision new worksite', async () => {
      const newSiteId = `WS-TEST-${Date.now().toString(36).toUpperCase()}`;
      const res = await request(app)
        .post('/api/v1/worksites')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          worksite_id: newSiteId,
          name: 'Airport Metro Station Link',
          timezone: 'Asia/Kolkata',
          location: {
            city: 'Bengaluru',
            latitude: 13.1986,
            longitude: 77.7066,
          },
          zones: [
            {
              zone_id: 'ZONE-A1',
              name: 'Terminal Canopy Assembly',
              sun_exposure: 'PARTIAL_SHADE',
              workload_category: 'MODERATE',
              active_crew_count: 14,
              shade_available: true,
              water_access_distance_m: 20,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.worksite_id).toBe(newSiteId);
      expect(res.body.data.organization_id).toBe('org_infra_corp'); // Forced to user org
    });
  });

  // --------------------------------------------------------------------------
  // 5. ZONE OPERATIONAL PARAMETERS MUTATION
  // --------------------------------------------------------------------------
  describe('Zone Operational Updates (Task 4.5)', () => {
    it('PATCH /worksites/:id/zones/:zoneId allows assigned Supervisor to update crew and shade', async () => {
      const res = await request(app)
        .patch('/api/v1/worksites/WS-BLR-NORTH-04/zones/ZONE-01-REBAR')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          active_crew_count: 20,
          shade_available: true,
        });

      expect(res.status).toBe(200);
      const updatedZone = res.body.data.zones.find((z: any) => z.zone_id === 'ZONE-01-REBAR');
      expect(updatedZone.active_crew_count).toBe(20);
      expect(updatedZone.shade_available).toBe(true);
    });

    it('PATCH /worksites/:id/zones/:zoneId rejects negative crew counts with 400', async () => {
      const res = await request(app)
        .patch('/api/v1/worksites/WS-BLR-NORTH-04/zones/ZONE-01-REBAR')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          active_crew_count: -5,
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('PATCH /worksites/:id/zones/:zoneId returns 404 for unknown zone', async () => {
      const res = await request(app)
        .patch('/api/v1/worksites/WS-BLR-NORTH-04/zones/ZONE-NON-EXISTENT')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ active_crew_count: 10 });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('ZONE_NOT_FOUND');
    });
  });

  // --------------------------------------------------------------------------
  // 6. SHIFTS MANAGEMENT & ROSTER CONTRACTS
  // --------------------------------------------------------------------------
  describe('Shift Scheduling API (docs/72_WORKSITE_API.md)', () => {
    it('GET /worksites/:id/shifts returns scheduled and active shifts', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/shifts')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data[0].shift_id).toBe('SHIFT-DAY-01');
      expect(res.body.data[0].peak_sun_overlap).toBe(true);
    });

    it('POST /worksites/:id/shifts allows Safety Manager to schedule new shift with auto peak-sun computation', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/shifts')
        .set('Authorization', `Bearer ${safetyManagerToken}`)
        .send({
          name: 'Night Finishing Shift',
          shift_type: 'NIGHT_SHIFT',
          start_time_local: '22:00',
          end_time_local: '06:00',
          workload_intensity: 'LIGHT',
          worker_count: 8,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.peak_sun_overlap).toBe(false); // 22:00-06:00 has no peak sun
      expect(res.body.data.worker_count).toBe(8);
      expect(res.body.data.status).toBe('SCHEDULED');

      // Clean up the created test shift so subsequent tests have a clean roster
      const allShifts = await storage.readCollection<ShiftContext>('shifts');
      await storage.writeCollection('shifts', allShifts.filter((s) => s.shift_id !== res.body.data.shift_id));
    });

    it('POST /worksites/:id/shifts DENIES Supervisor role with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/shifts')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({
          name: 'Supervisor Attempt',
          start_time_local: '08:00',
          end_time_local: '16:00',
        });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });
  });

  // --------------------------------------------------------------------------
  // 7. AGGREGATED OPERATIONAL DASHBOARD & PRIVACY AUDIT
  // --------------------------------------------------------------------------
  describe('Worksite Operational Dashboard (docs/72_WORKSITE_API.md section 4.6)', () => {
    it('GET /worksites/:id/dashboard returns integrated worksite snapshot', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/dashboard')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worksite.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(res.body.data.zones).toHaveLength(2);
      expect(res.body.data.total_active_crew).toBeGreaterThan(0);
      expect(res.body.data.shift_ambiguity_flag).toBe(false);
    });

    it('Verifies ZERO individual worker PII is exposed in worksite responses (docs/86_WORKER_DATA_PROTECTION.md)', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/dashboard')
        .set('Authorization', `Bearer ${supervisorToken}`);

      const jsonStr = JSON.stringify(res.body);

      // Verify prohibited fields are completely absent
      expect(jsonStr).not.toContain('worker_name');
      expect(jsonStr).not.toContain('medical_history');
      expect(jsonStr).not.toContain('heart_rate');
      expect(jsonStr).not.toContain('core_temp');
      expect(jsonStr).not.toContain('biometric');
      expect(jsonStr).not.toContain('worker_id_card');
    });
  });
});
