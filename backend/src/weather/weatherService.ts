import {
  WeatherTelemetryResponse,
  WeatherForecastResponse,
  Worksite,
} from '@hare/shared';
import { storage } from '../storage/localJsonDriver.js';
import { OpenMeteoClient, openMeteoClient } from './openMeteoClient.js';
import { weatherNormalizer } from './weatherNormalizer.js';
import { simulationInjector } from './simulationInjector.js';
import { AppError } from '../middleware/errorHandler.js';

export class WeatherService {
  private client: OpenMeteoClient;
  private memoryCache = new Map<string, WeatherTelemetryResponse>();
  private lastRefreshTimes = new Map<string, number>();

  constructor(client: OpenMeteoClient = openMeteoClient) {
    this.client = client;
  }

  /**
   * Resolves a worksite by worksite_id from storage, validating organization tenant boundaries.
   */
  public async getWorksite(worksiteId: string, userOrgId?: string): Promise<Worksite> {
    const worksites = await storage.readCollection<Worksite>('worksites');
    const worksite = worksites.find((w) => w.worksite_id === worksiteId);
    if (!worksite) {
      throw new AppError('WORKSITE_NOT_FOUND', `Worksite '${worksiteId}' not found.`, 404);
    }
    if (userOrgId && worksite.organization_id !== userOrgId) {
      throw new AppError(
        'AUTHORIZATION_DENIED',
        'Forbidden: Cross-tenant data access is strictly prohibited.',
        403
      );
    }
    return worksite;
  }

  /**
   * Retrieves current meteorological observation for a worksite.
   * If simulation mode is active, returns synthetic data with explicit simulation provenance.
   * If external provider fails and last valid observation is cached, returns degraded/STALE record.
   */
  public async getCurrentWeather(worksiteId: string, userOrgId?: string): Promise<WeatherTelemetryResponse> {
    const worksite = await this.getWorksite(worksiteId, userOrgId);

    // 1. Simulation override check
    if (simulationInjector.isSimulating(worksiteId)) {
      return simulationInjector.generateSimulatedObservation(worksiteId);
    }

    // 2. Fetch live telemetry from Open-Meteo
    try {
      const raw = await this.client.fetchTelemetry(
        worksite.location.latitude,
        worksite.location.longitude,
        24
      );

      const normalized = weatherNormalizer.normalizeCurrentObservation(worksiteId, raw);

      // Cache latest valid observation
      if (normalized.provenance.quality_status === 'VALID' || normalized.provenance.quality_status === 'STALE') {
        this.memoryCache.set(worksiteId, normalized);
      }

      return normalized;
    } catch (err: any) {
      // 3. Fallback to cached last known valid data if available
      const cached = this.memoryCache.get(worksiteId);
      if (cached) {
        const now = new Date();
        const obsDate = new Date(cached.provenance.observation_timestamp);
        const ageMinutes = Math.max(0, Math.floor((now.getTime() - obsDate.getTime()) / (60 * 1000)));

        const degraded: WeatherTelemetryResponse = {
          ...cached,
          provenance: {
            ...cached.provenance,
            retrieval_timestamp: now.toISOString(),
            observation_age_minutes: ageMinutes,
            quality_status: ageMinutes > 60 ? 'STALE' : cached.provenance.quality_status,
          },
        };

        return degraded;
      }

      // If no cached telemetry, preserve error transparently (never fabricate safe weather)
      if (err instanceof AppError) throw err;
      throw new AppError(
        'PROVIDER_UNAVAILABLE',
        `External weather provider unreachable: ${err.message}`,
        502,
        true
      );
    }
  }

  /**
   * Retrieves hourly weather forecast series for a worksite.
   */
  public async getForecast(
    worksiteId: string,
    hours = 12,
    userOrgId?: string
  ): Promise<WeatherForecastResponse> {
    const worksite = await this.getWorksite(worksiteId, userOrgId);

    if (simulationInjector.isSimulating(worksiteId)) {
      return simulationInjector.generateSimulatedForecast(worksiteId, undefined, hours);
    }

    try {
      const raw = await this.client.fetchTelemetry(
        worksite.location.latitude,
        worksite.location.longitude,
        hours
      );

      return weatherNormalizer.normalizeForecast(worksiteId, raw, hours);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError(
        'PROVIDER_UNAVAILABLE',
        `Forecast provider unreachable: ${err.message}`,
        502,
        true
      );
    }
  }

  /**
   * Forces an on-demand refresh for a worksite's weather data with 5-minute rate limit.
   */
  public async refreshWeather(
    worksiteId: string,
    userOrgId?: string
  ): Promise<{
    worksite_id: string;
    refresh_status: 'REFRESHED';
    refreshed_at: string;
    latest_observation: WeatherTelemetryResponse;
  }> {
    const worksite = await this.getWorksite(worksiteId, userOrgId);

    const now = Date.now();
    const lastRefresh = this.lastRefreshTimes.get(worksiteId) || 0;
    const cooldownMs = 5 * 60 * 1000; // 5 minutes (docs/71_WEATHER_API.md)

    if (now - lastRefresh < cooldownMs) {
      const remainingSeconds = Math.ceil((cooldownMs - (now - lastRefresh)) / 1000);
      throw new AppError(
        'REFRESH_RATE_LIMITED',
        `Manual refresh requested too soon. Please wait ${remainingSeconds} seconds before refreshing again.`,
        429,
        true,
        { retry_after_seconds: remainingSeconds }
      );
    }

    const raw = await this.client.fetchTelemetry(
      worksite.location.latitude,
      worksite.location.longitude,
      24
    );

    const normalized = weatherNormalizer.normalizeCurrentObservation(worksiteId, raw);
    this.memoryCache.set(worksiteId, normalized);
    this.lastRefreshTimes.set(worksiteId, now);

    return {
      worksite_id: worksiteId,
      refresh_status: 'REFRESHED',
      refreshed_at: new Date().toISOString(),
      latest_observation: normalized,
    };
  }

  /**
   * Historical telemetry accessor (docs/71_WEATHER_API.md section 4.3).
   */
  public async getHistory(
    worksiteId: string,
    _fromIso?: string,
    _toIso?: string,
    _limit = 50,
    userOrgId?: string
  ): Promise<any[]> {
    await this.getWorksite(worksiteId, userOrgId);

    const cached = this.memoryCache.get(worksiteId);
    if (!cached) {
      return [];
    }

    return [
      {
        observation_timestamp: cached.provenance.observation_timestamp,
        dry_bulb_temperature_c: cached.metrics.dry_bulb_temperature_c,
        relative_humidity_pct: cached.metrics.relative_humidity_pct,
        heat_index_c: cached.metrics.heat_index_c,
        solar_radiation_wm2: cached.metrics.solar_radiation_wm2,
        wind_speed_ms: cached.metrics.wind_speed_ms,
        quality_status: cached.provenance.quality_status,
      },
    ];
  }

  /**
   * Clears in-memory cache (for specific worksite or all, primarily for test isolation).
   */
  public clearCache(worksiteId?: string): void {
    if (worksiteId) {
      this.memoryCache.delete(worksiteId);
      this.lastRefreshTimes.delete(worksiteId);
    } else {
      this.memoryCache.clear();
      this.lastRefreshTimes.clear();
    }
  }
}

export const weatherService = new WeatherService();
