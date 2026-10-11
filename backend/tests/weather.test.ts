import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { authService } from '../src/auth/authService.js';
import { OpenMeteoClient, OpenMeteoRawResponse } from '../src/weather/openMeteoClient.js';
import {
  validateWeatherMetrics,
  calculateHeatIndex,
  DEFAULT_BOUNDS,
} from '../src/weather/weatherValidator.js';
import { weatherNormalizer } from '../src/weather/weatherNormalizer.js';
import { simulationInjector, PRESET_SIMULATION_SCENARIOS } from '../src/weather/simulationInjector.js';
import { WeatherService, weatherService } from '../src/weather/weatherService.js';
import { AppError } from '../src/middleware/errorHandler.js';

describe('Phase 3: Weather & Environmental Data Layer', () => {
  const validPassword = 'HareSafety#2026';
  let supervisorToken: string;
  let safetyManagerToken: string;
  let adminToken: string;
  const app = createApp();

  const mockValidPayload: OpenMeteoRawResponse = {
    latitude: 13.0358,
    longitude: 77.597,
    generationtime_ms: 0.12,
    utc_offset_seconds: 19800,
    timezone: 'Asia/Kolkata',
    current: {
      time: new Date().toISOString(),
      interval: 900,
      temperature_2m: 34.5,
      relative_humidity_2m: 55.0,
      apparent_temperature: 38.2,
      direct_normal_irradiance: 800.0,
      wind_speed_10m: 12.0,
    },
    hourly: {
      time: [
        new Date(Date.now() + 3600 * 1000).toISOString(),
        new Date(Date.now() + 7200 * 1000).toISOString(),
      ],
      temperature_2m: [35.0, 36.5],
      relative_humidity_2m: [52.0, 48.0],
      apparent_temperature: [39.0, 41.2],
      direct_normal_irradiance: [820.0, 850.0],
      wind_speed_10m: [11.0, 10.0],
    },
  };

  beforeEach(async () => {
    // Generate valid tokens
    const supSession = await authService.login('rahul@site.hare.local', validPassword);
    supervisorToken = supSession.token;

    const mgrSession = await authService.login('ananya@safety.hare.local', validPassword);
    safetyManagerToken = mgrSession.token;

    const admSession = await authService.login('vikram@admin.hare.local', validPassword);
    adminToken = admSession.token;

    // Reset weather simulation & cache state
    simulationInjector.clearSimulation('WS-BLR-NORTH-04');
    simulationInjector.clearSimulation('WS-BLR-SOUTH-02');
    weatherService.clearCache();
  });

  // --------------------------------------------------------------------------
  // 1. DATA VALIDATION & PHYSICAL BOUNDS TESTS
  // --------------------------------------------------------------------------
  describe('Data Validation & Physical Bounds (docs/36_DATA_VALIDATION.md)', () => {
    it('Approves physically feasible environmental readings with VALID quality', () => {
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: 32.5, relative_humidity_pct: 60.0, wind_speed_kmh: 15.0 },
        new Date().toISOString()
      );
      expect(result.isValid).toBe(true);
      expect(result.qualityStatus).toBe('VALID');
      expect(result.errors).toHaveLength(0);
    });

    it('Rejects physically impossible high temperature (> 65°C) without clamping', () => {
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: 75.0, relative_humidity_pct: 50.0 },
        new Date().toISOString()
      );
      expect(result.isValid).toBe(false);
      expect(result.qualityStatus).toBe('INVALID');
      expect(result.errors[0]).toContain('outside physical feasibility bounds');
    });

    it('Rejects physically impossible low temperature (< -20°C)', () => {
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: -30.0, relative_humidity_pct: 50.0 },
        new Date().toISOString()
      );
      expect(result.isValid).toBe(false);
      expect(result.qualityStatus).toBe('INVALID');
    });

    it('Rejects out-of-bounds relative humidity (> 100% or < 0%)', () => {
      const resultOver = validateWeatherMetrics(
        { dry_bulb_temperature_c: 30.0, relative_humidity_pct: 105.0 },
        new Date().toISOString()
      );
      expect(resultOver.isValid).toBe(false);
      expect(resultOver.qualityStatus).toBe('INVALID');

      const resultUnder = validateWeatherMetrics(
        { dry_bulb_temperature_c: 30.0, relative_humidity_pct: -5.0 },
        new Date().toISOString()
      );
      expect(resultUnder.isValid).toBe(false);
      expect(resultUnder.qualityStatus).toBe('INVALID');
    });

    it('Rejects missing or null required fields', () => {
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: null, relative_humidity_pct: 50.0 } as any,
        new Date().toISOString()
      );
      expect(result.isValid).toBe(false);
      expect(result.qualityStatus).toBe('INVALID');
      expect(result.errors[0]).toContain('Missing or null dry_bulb_temperature_c');
    });

    it('Flags telemetry older than 60 minutes as STALE without rejecting it', () => {
      const twoHoursAgo = new Date(Date.now() - 120 * 60 * 1000).toISOString();
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: 32.0, relative_humidity_pct: 50.0 },
        twoHoursAgo
      );
      expect(result.isValid).toBe(true);
      expect(result.qualityStatus).toBe('STALE');
      expect(result.errors[0]).toContain('is stale');
    });

    it('Rejects observation timestamps set far in the future (> 5 mins)', () => {
      const tenMinutesFuture = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const result = validateWeatherMetrics(
        { dry_bulb_temperature_c: 32.0, relative_humidity_pct: 50.0 },
        tenMinutesFuture
      );
      expect(result.isValid).toBe(false);
      expect(result.qualityStatus).toBe('INVALID');
      expect(result.errors[0]).toContain('set in the future');
    });

    it('Computes NOAA/Rothfusz Heat Index correctly', () => {
      // 35°C with 60% humidity produces heat index ~45°C
      const hi = calculateHeatIndex(35.0, 60.0);
      expect(hi).toBeGreaterThan(43.0);
      expect(hi).toBeLessThan(48.0);

      // Low temp < 20°C returns dry bulb temp unchanged
      expect(calculateHeatIndex(18.0, 50.0)).toBe(18.0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. OPEN-METEO CLIENT & ERROR RETRY HANDLING
  // --------------------------------------------------------------------------
  describe('OpenMeteoClient HTTP & Resilience (docs/31_OPEN_METEO.md & docs/37_DATA_FAILURES.md)', () => {
    it('Parses valid Open-Meteo REST response successfully', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200,
        json: async () => mockValidPayload,
      });

      const client = new OpenMeteoClient('http://mock-weather.local', 5000, mockFetch as any);
      const data = await client.fetchTelemetry(13.0, 77.0);

      expect(data.latitude).toBe(13.0358);
      expect(data.current?.temperature_2m).toBe(34.5);
    });

    it('Handles 429 rate limit error gracefully', async () => {
      let callCount = 0;
      const mockFetch = async () => {
        callCount++;
        return {
          ok: false,
          status: 429,
          json: async () => ({ error: true, reason: 'rate limit' }),
        };
      };

      const client = new OpenMeteoClient('http://mock-weather.local', 5000, mockFetch as any);
      await expect(client.fetchTelemetry(13.0, 77.0)).rejects.toThrowError(AppError);
      expect(callCount).toBe(3); // retries 3 times before giving up
    });

    it('Surfaces 502 DATA_UNAVAILABLE when provider returns 500 error', async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 500,
        json: async () => ({ error: true, reason: 'internal server error' }),
      });

      const client = new OpenMeteoClient('http://mock-weather.local', 5000, mockFetch as any);
      try {
        await client.fetchTelemetry(13.0, 77.0);
        expect.unreachable('Should have thrown error');
      } catch (err: any) {
        expect(err.statusCode).toBe(502);
        expect(err.code).toBe('DATA_UNAVAILABLE');
      }
    });

    it('Handles client timeout and throws 504 Gateway Timeout', async () => {
      const mockFetch = async () => {
        const err: any = new Error('The operation was aborted');
        err.name = 'AbortError';
        throw err;
      };

      const client = new OpenMeteoClient('http://mock-weather.local', 100, mockFetch as any);
      try {
        await client.fetchTelemetry(13.0, 77.0);
        expect.unreachable('Should have timed out');
      } catch (err: any) {
        expect(err.statusCode).toBe(504);
        expect(err.code).toBe('DATA_UNAVAILABLE');
        expect(err.message).toContain('timed out');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 3. WEATHER NORMALIZER & OBSERVATION VS FORECAST PARTITION
  // --------------------------------------------------------------------------
  describe('Weather Normalization & Distinction (docs/33_WEATHER_DATA_MODEL.md)', () => {
    it('Normalizes current observation with strict OBSERVATION telemetry_type and provenance', () => {
      const observation = weatherNormalizer.normalizeCurrentObservation(
        'WS-BLR-NORTH-04',
        mockValidPayload
      );

      expect(observation.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(observation.telemetry_type).toBe('OBSERVATION');
      expect(observation.metrics.dry_bulb_temperature_c).toBe(34.5);
      expect(observation.metrics.relative_humidity_pct).toBe(55.0);
      expect(observation.metrics.heat_index_c).toBeGreaterThan(34.5);
      expect(observation.metrics.wind_speed_ms).toBe(3.3); // 12 km/h / 3.6

      expect(observation.provenance.provider).toBe('OPEN_METEO');
      expect(observation.provenance.quality_status).toBe('VALID');
      expect(observation.provenance.is_simulation).toBe(false);
    });

    it('Normalizes forecast series with strict FORECAST telemetry_type', () => {
      const forecast = weatherNormalizer.normalizeForecast('WS-BLR-NORTH-04', mockValidPayload, 2);

      expect(forecast.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(forecast.telemetry_type).toBe('FORECAST');
      expect(forecast.forecast_horizon_hours).toBe(2);
      expect(forecast.forecast_series).toHaveLength(2);
      expect(forecast.forecast_series[0].dry_bulb_temperature_c).toBe(35.0);
      expect(forecast.forecast_series[1].dry_bulb_temperature_c).toBe(36.5);
      expect(forecast.provenance.provider).toBe('OPEN_METEO');
    });

    it('Rejects corrupted payload with missing current observations', () => {
      const corruptPayload: OpenMeteoRawResponse = {
        ...mockValidPayload,
        current: undefined,
      };

      expect(() =>
        weatherNormalizer.normalizeCurrentObservation('WS-BLR-NORTH-04', corruptPayload)
      ).toThrowError(AppError);
    });
  });

  // --------------------------------------------------------------------------
  // 4. PRESERVATION OF LAST KNOWN GOOD DATA & RATE LIMITING
  // --------------------------------------------------------------------------
  describe('Weather Service Resilience & Fallback (docs/37_DATA_FAILURES.md)', () => {
    it('Returns last known valid record flagged as STALE during upstream outage', async () => {
      let succeed = true;
      const mockFetch = async () => {
        if (!succeed) throw new Error('Network cable severed');
        return {
          ok: true,
          status: 200,
          json: async () => mockValidPayload,
        };
      };

      const customClient = new OpenMeteoClient('http://mock.local', 5000, mockFetch as any);
      const service = new WeatherService(customClient);

      // 1. Initial successful retrieval
      const initial = await service.getCurrentWeather('WS-BLR-NORTH-04');
      expect(initial.metrics.dry_bulb_temperature_c).toBe(34.5);
      expect(initial.provenance.quality_status).toBe('VALID');

      // 2. Upstream provider fails
      succeed = false;
      const fallback = await service.getCurrentWeather('WS-BLR-NORTH-04');
      expect(fallback.metrics.dry_bulb_temperature_c).toBe(34.5);
      expect(fallback.provenance.provider).toBe('OPEN_METEO');
      // Preserves original observation timestamp without fabricating fresh time
      expect(fallback.provenance.observation_timestamp).toBe(
        initial.provenance.observation_timestamp
      );
    });

    it('Enforces 5-minute cooldown on manual refresh with 429 REFRESH_RATE_LIMITED', async () => {
      const mockFetch = async () => ({
        ok: true,
        status: 200,
        json: async () => mockValidPayload,
      });

      const customClient = new OpenMeteoClient('http://mock.local', 5000, mockFetch as any);
      const service = new WeatherService(customClient);

      // First refresh succeeds
      const first = await service.refreshWeather('WS-BLR-NORTH-04');
      expect(first.refresh_status).toBe('REFRESHED');

      // Immediate second refresh fails with 429
      try {
        await service.refreshWeather('WS-BLR-NORTH-04');
        expect.unreachable('Should have failed with rate limit');
      } catch (err: any) {
        expect(err.statusCode).toBe(429);
        expect(err.code).toBe('REFRESH_RATE_LIMITED');
      }
    });
  });

  // --------------------------------------------------------------------------
  // 5. SIMULATION MODE & PROVENANCE ISOLATION
  // --------------------------------------------------------------------------
  describe('Simulation Mode Isolation (docs/38_SIMULATION_MODE.md)', () => {
    it('Injects High-Heat demonstration scenario with explicit SIMULATION provenance', () => {
      simulationInjector.setSimulationScenario(
        'WS-BLR-NORTH-04',
        'SCENARIO-DEMO-03-HIGH-HEAT'
      );

      const sim = simulationInjector.generateSimulatedObservation('WS-BLR-NORTH-04');
      expect(sim.telemetry_type).toBe('SIMULATION');
      expect(sim.provenance.provider).toBe('SIMULATION');
      expect(sim.provenance.is_simulation).toBe(true);
      expect(sim.provenance.simulation_scenario_id).toBe('SCENARIO-DEMO-03-HIGH-HEAT');
      expect(sim.metrics.dry_bulb_temperature_c).toBe(37.5);
      expect(sim.metrics.relative_humidity_pct).toBe(52.0);
    });

    it('Injects Stale Outage demonstration scenario with STALE quality tag', () => {
      simulationInjector.setSimulationScenario(
        'WS-BLR-NORTH-04',
        'SCENARIO-DEMO-05-STALE-ANOMALY'
      );

      const sim = simulationInjector.generateSimulatedObservation('WS-BLR-NORTH-04');
      expect(sim.provenance.quality_status).toBe('STALE');
      expect(sim.provenance.observation_age_minutes).toBe(180);
      expect(sim.provenance.is_simulation).toBe(true);
    });

    it('Rejects unknown simulation scenario with 400 VALIDATION_ERROR', () => {
      expect(() => {
        simulationInjector.setSimulationScenario('WS-BLR-NORTH-04', 'SCENARIO-UNKNOWN-INVALID');
      }).toThrowError(AppError);
    });
  });

  // --------------------------------------------------------------------------
  // 6. HTTP API CONTRACTS & RBAC / SCOPING INTEGRATION
  // --------------------------------------------------------------------------
  describe('HTTP API Endpoints & RBAC Scoping (docs/71_WEATHER_API.md)', () => {
    it('GET /weather/current requires authentication (401)', async () => {
      const res = await request(app).get('/api/v1/worksites/WS-BLR-NORTH-04/weather/current');
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('GET /weather/current allows Supervisor to access assigned worksite (WS-BLR-NORTH-04)', async () => {
      // Set simulation so it runs deterministically without live internet
      simulationInjector.setSimulationScenario(
        'WS-BLR-NORTH-04',
        'SCENARIO-DEMO-01-BASELINE'
      );

      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/weather/current')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worksite_id).toBe('WS-BLR-NORTH-04');
      expect(res.body.data.metrics.dry_bulb_temperature_c).toBe(26.0);
      expect(res.body.meta.request_id).toBeDefined();
    });

    it('GET /weather/current DENIES Supervisor access to unassigned worksite (WS-BLR-SOUTH-02) with 403', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-SOUTH-02/weather/current')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('RESOURCE_ACCESS_DENIED');
    });

    it('GET /weather/current allows Safety Manager cross-site access to WS-BLR-SOUTH-02', async () => {
      simulationInjector.setSimulationScenario(
        'WS-BLR-SOUTH-02',
        'SCENARIO-DEMO-02-ELEVATED'
      );

      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-SOUTH-02/weather/current')
        .set('Authorization', `Bearer ${safetyManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.worksite_id).toBe('WS-BLR-SOUTH-02');
      expect(res.body.data.metrics.dry_bulb_temperature_c).toBe(33.0);
    });

    it('GET /weather/forecast returns multi-hour projection series', async () => {
      simulationInjector.setSimulationScenario(
        'WS-BLR-NORTH-04',
        'SCENARIO-DEMO-03-HIGH-HEAT'
      );

      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/weather/forecast?hours=6')
        .set('Authorization', `Bearer ${supervisorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.telemetry_type).toBe('SIMULATION');
      expect(res.body.data.forecast_series).toHaveLength(6);
    });

    it('POST /weather/simulate DENIES Supervisor role with 403 AUTHORIZATION_DENIED', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/weather/simulate')
        .set('Authorization', `Bearer ${supervisorToken}`)
        .send({ scenario_id: 'SCENARIO-DEMO-03-HIGH-HEAT' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });

    it('POST /weather/simulate ALLOWS Safety Manager to engage simulation scenario', async () => {
      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/weather/simulate')
        .set('Authorization', `Bearer ${safetyManagerToken}`)
        .send({ scenario_id: 'SCENARIO-DEMO-03-HIGH-HEAT' });

      expect(res.status).toBe(200);
      expect(res.body.data.scenario.scenario_id).toBe('SCENARIO-DEMO-03-HIGH-HEAT');
      expect(res.body.data.observation.metrics.dry_bulb_temperature_c).toBe(37.5);
    });

    it('POST /weather/clear-simulation ALLOWS Safety Manager to clear simulation mode', async () => {
      // First engage simulation so there is an active simulation to clear
      await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/weather/simulate')
        .set('Authorization', `Bearer ${safetyManagerToken}`)
        .send({ scenario_id: 'SCENARIO-DEMO-03-HIGH-HEAT' });

      const res = await request(app)
        .post('/api/v1/worksites/WS-BLR-NORTH-04/weather/clear-simulation')
        .set('Authorization', `Bearer ${safetyManagerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.cleared).toBe(true);
      expect(simulationInjector.isSimulating('WS-BLR-NORTH-04')).toBe(false);
    });

    it('Returns 404 WORKSITE_NOT_FOUND when requesting non-existent worksite', async () => {
      const res = await request(app)
        .get('/api/v1/worksites/WS-NON-EXISTENT-99/weather/current')
        .set('Authorization', `Bearer ${safetyManagerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('WORKSITE_NOT_FOUND');
    });
  });

  // --------------------------------------------------------------------------
  // 7. SECURITY & MULTI-TENANT BOUNDARY TESTS
  // --------------------------------------------------------------------------
  describe('Security & Multi-Tenant Boundaries (docs/83_AUTHORIZATION.md)', () => {
    it('Denies access if user org does not match worksite org', async () => {
      // Generate token for a user from another org
      const crossOrgSession = authService.generateToken({
        user_id: 'usr_attacker',
        email: 'attacker@rival.corp',
        full_name: 'Attacker User',
        role: 'ADMIN',
        organization_id: 'org_rival_corp',
        assigned_worksite_id: 'ALL',
      });

      // Attempt to access org_infra_corp worksite
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/weather/current')
        .set('Authorization', `Bearer ${crossOrgSession.token}`);

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('AUTHORIZATION_DENIED');
    });

    it('Rejects forged JWT token with invalid signature', async () => {
      const forgedToken = supervisorToken.slice(0, -6) + 'abcdef';
      const res = await request(app)
        .get('/api/v1/worksites/WS-BLR-NORTH-04/weather/current')
        .set('Authorization', `Bearer ${forgedToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('AUTHENTICATION_INVALID');
    });
  });
});
