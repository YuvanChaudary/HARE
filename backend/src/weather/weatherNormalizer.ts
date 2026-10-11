import {
  WeatherTelemetryResponse,
  WeatherForecastResponse,
  WeatherForecastPoint,
  WeatherMetrics,
  WeatherProvenance,
} from '@hare/shared';
import { OpenMeteoRawResponse } from './openMeteoClient.js';
import { calculateHeatIndex, validateWeatherMetrics } from './weatherValidator.js';
import { AppError } from '../middleware/errorHandler.js';

export class WeatherNormalizer {
  /**
   * Transforms raw Open-Meteo payload into canonical WeatherTelemetryResponse (OBSERVATION).
   */
  public normalizeCurrentObservation(
    worksiteId: string,
    raw: OpenMeteoRawResponse,
    retrievedAtIso = new Date().toISOString()
  ): WeatherTelemetryResponse {
    if (!raw.current) {
      throw new AppError(
        'MISSING_DATA',
        'Weather provider payload omitted current meteorological observations.',
        502
      );
    }

    const temp = raw.current.temperature_2m;
    const rh = raw.current.relative_humidity_2m;
    const apparent = raw.current.apparent_temperature ?? temp;
    const solar = raw.current.direct_normal_irradiance ?? 0;
    const windKmh = raw.current.wind_speed_10m ?? 0;
    const windMs = Math.round((windKmh / 3.6) * 10) / 10;
    const heatIndex = calculateHeatIndex(temp, rh);

    // Format timestamp to ISO 8601 UTC
    let obsTimeIso = raw.current.time;
    if (!obsTimeIso.endsWith('Z') && !obsTimeIso.includes('+')) {
      obsTimeIso = `${obsTimeIso}Z`;
    }

    const obsDate = new Date(obsTimeIso);
    const retrievedDate = new Date(retrievedAtIso);
    const ageMinutes = Math.max(0, Math.floor((retrievedDate.getTime() - obsDate.getTime()) / (60 * 1000)));

    const metrics: WeatherMetrics = {
      dry_bulb_temperature_c: temp,
      relative_humidity_pct: rh,
      apparent_temperature_c: apparent,
      heat_index_c: heatIndex,
      solar_radiation_wm2: solar,
      wind_speed_kmh: windKmh,
      wind_speed_ms: windMs,
    };

    const validation = validateWeatherMetrics(metrics, obsTimeIso, retrievedAtIso);
    if (!validation.isValid && validation.qualityStatus === 'INVALID') {
      throw new AppError(
        'INVALID_DATA',
        `Weather telemetry failed physical validation: ${validation.errors.join('; ')}`,
        502,
        false,
        { errors: validation.errors }
      );
    }

    const provenance: WeatherProvenance = {
      provider: 'OPEN_METEO',
      station_id: `OPEN_METEO_GRID_${raw.latitude}_${raw.longitude}`,
      observation_timestamp: obsTimeIso,
      retrieval_timestamp: retrievedAtIso,
      observation_age_minutes: ageMinutes,
      quality_status: validation.qualityStatus,
      is_simulation: false,
    };

    return {
      worksite_id: worksiteId,
      telemetry_type: 'OBSERVATION',
      metrics,
      provenance,
    };
  }

  /**
   * Transforms raw Open-Meteo hourly projections into canonical WeatherForecastResponse (FORECAST).
   */
  public normalizeForecast(
    worksiteId: string,
    raw: OpenMeteoRawResponse,
    maxHours = 24,
    retrievedAtIso = new Date().toISOString()
  ): WeatherForecastResponse {
    if (!raw.hourly || !Array.isArray(raw.hourly.time)) {
      throw new AppError(
        'MISSING_DATA',
        'Weather provider payload omitted hourly forecast time series.',
        502
      );
    }

    const count = Math.min(maxHours, raw.hourly.time.length);
    const series: WeatherForecastPoint[] = [];

    for (let i = 0; i < count; i++) {
      const targetTime = raw.hourly.time[i];
      let targetTimeIso = targetTime;
      if (!targetTimeIso.endsWith('Z') && !targetTimeIso.includes('+')) {
        targetTimeIso = new Date(targetTimeIso).toISOString();
      }

      const temp = raw.hourly.temperature_2m[i];
      const rh = raw.hourly.relative_humidity_2m[i];
      const apparent = raw.hourly.apparent_temperature?.[i] ?? temp;
      const solar = raw.hourly.direct_normal_irradiance?.[i] ?? 0;
      const windKmh = raw.hourly.wind_speed_10m?.[i] ?? 0;
      const windMs = Math.round((windKmh / 3.6) * 10) / 10;
      const heatIndex = calculateHeatIndex(temp, rh);

      series.push({
        target_timestamp: targetTimeIso,
        dry_bulb_temperature_c: temp,
        relative_humidity_pct: rh,
        apparent_temperature_c: apparent,
        heat_index_c: heatIndex,
        solar_radiation_wm2: solar,
        wind_speed_kmh: windKmh,
        wind_speed_ms: windMs,
      });
    }

    const provenance: WeatherProvenance = {
      provider: 'OPEN_METEO',
      station_id: `OPEN_METEO_GRID_${raw.latitude}_${raw.longitude}`,
      observation_timestamp: retrievedAtIso,
      retrieval_timestamp: retrievedAtIso,
      observation_age_minutes: 0,
      quality_status: 'VALID',
      is_simulation: false,
    };

    return {
      worksite_id: worksiteId,
      telemetry_type: 'FORECAST',
      model_run_timestamp: retrievedAtIso,
      forecast_horizon_hours: series.length,
      forecast_series: series,
      provenance,
    };
  }
}

export const weatherNormalizer = new WeatherNormalizer();
