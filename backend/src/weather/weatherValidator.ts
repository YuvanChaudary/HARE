import { DataHealthStatus } from '@hare/shared';

export interface ValidationResult {
  isValid: boolean;
  qualityStatus: DataHealthStatus;
  errors: string[];
}

export interface MetricBounds {
  minTempC: number;
  maxTempC: number;
  minHumidityPct: number;
  maxHumidityPct: number;
  minWindKmh: number;
  maxWindKmh: number;
}

// Physical plausibility boundaries matching docs/36_DATA_VALIDATION.md Section 5
export const DEFAULT_BOUNDS: MetricBounds = {
  minTempC: -20.0,
  maxTempC: 65.0,
  minHumidityPct: 0.0,
  maxHumidityPct: 100.0,
  minWindKmh: 0.0,
  maxWindKmh: 250.0,
};

// Freshness threshold in minutes matching docs/33_WEATHER_DATA_MODEL.md & docs/36_DATA_VALIDATION.md
export const FRESHNESS_THRESHOLD_MINUTES = 60;

/**
 * Calculates NOAA / Rothfusz Heat Index in degrees Celsius.
 * Reference: docs/22_HEAT_INDEX_AND_LIMITATIONS.md
 */
export function calculateHeatIndex(tempC: number, rh: number): number {
  // Heat index is only meaningful for temperatures >= 20°C (68°F)
  if (tempC < 20.0) {
    return Math.round(tempC * 10) / 10;
  }

  const tf = (tempC * 9) / 5 + 32;

  // Simple formula first
  let hiF = 0.5 * (tf + 61.0 + (tf - 68.0) * 1.2 + rh * 0.094);
  hiF = (hiF + tf) / 2.0;

  // If HI >= 80°F, apply full Rothfusz regression equation
  if (hiF >= 80.0) {
    hiF =
      -42.379 +
      2.04901523 * tf +
      10.14333127 * rh -
      0.22475541 * tf * rh -
      0.00683783 * tf * tf -
      0.05481717 * rh * rh +
      0.00122874 * tf * tf * rh +
      0.00085282 * tf * rh * rh -
      0.00000199 * tf * tf * rh * rh;

    // Adjustment for low relative humidity
    if (rh < 13 && tf >= 80 && tf <= 112) {
      const adj = -((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tf - 95)) / 17);
      hiF += adj;
    }
    // Adjustment for high relative humidity
    else if (rh > 85 && tf >= 80 && tf <= 87) {
      const adj = ((rh - 85) / 10) * ((87 - tf) / 5);
      hiF += adj;
    }
  }

  const hiC = ((hiF - 32) * 5) / 9;
  return Math.round(hiC * 10) / 10;
}

/**
 * Validates environmental telemetry metrics against physical and temporal sanity boundaries.
 * Enforces safety invariant: INVALID numbers are rejected, NEVER speculatively clamped.
 */
export function validateWeatherMetrics(
  metrics: {
    dry_bulb_temperature_c?: number | null;
    relative_humidity_pct?: number | null;
    wind_speed_kmh?: number | null;
    solar_radiation_wm2?: number | null;
  },
  observationTimestampIso: string,
  nowIso = new Date().toISOString(),
  bounds = DEFAULT_BOUNDS
): ValidationResult {
  const errors: string[] = [];

  // 1. Mandatory presence check
  if (
    metrics.dry_bulb_temperature_c === undefined ||
    metrics.dry_bulb_temperature_c === null ||
    isNaN(metrics.dry_bulb_temperature_c)
  ) {
    errors.push('Missing or null dry_bulb_temperature_c');
  }

  if (
    metrics.relative_humidity_pct === undefined ||
    metrics.relative_humidity_pct === null ||
    isNaN(metrics.relative_humidity_pct)
  ) {
    errors.push('Missing or null relative_humidity_pct');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      qualityStatus: 'INVALID',
      errors,
    };
  }

  const temp = metrics.dry_bulb_temperature_c!;
  const rh = metrics.relative_humidity_pct!;

  // 2. Physical range check (plausibility bounds)
  if (temp < bounds.minTempC || temp > bounds.maxTempC) {
    errors.push(
      `Temperature ${temp}°C is outside physical feasibility bounds [${bounds.minTempC}°C, ${bounds.maxTempC}°C]`
    );
  }

  if (rh < bounds.minHumidityPct || rh > bounds.maxHumidityPct) {
    errors.push(
      `Relative humidity ${rh}% is outside valid physical bounds [${bounds.minHumidityPct}%, ${bounds.maxHumidityPct}%]`
    );
  }

  if (
    metrics.wind_speed_kmh !== undefined &&
    metrics.wind_speed_kmh !== null &&
    (metrics.wind_speed_kmh < bounds.minWindKmh || metrics.wind_speed_kmh > bounds.maxWindKmh)
  ) {
    errors.push(
      `Wind speed ${metrics.wind_speed_kmh} km/h is outside valid physical bounds [${bounds.minWindKmh}, ${bounds.maxWindKmh}]`
    );
  }

  if (
    metrics.solar_radiation_wm2 !== undefined &&
    metrics.solar_radiation_wm2 !== null &&
    metrics.solar_radiation_wm2 < 0.0
  ) {
    errors.push(
      `Solar radiation ${metrics.solar_radiation_wm2} W/m² cannot be negative`
    );
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      qualityStatus: 'INVALID',
      errors,
    };
  }

  // 3. Timestamp verification
  const obsTime = new Date(observationTimestampIso).getTime();
  const now = new Date(nowIso).getTime();

  if (isNaN(obsTime)) {
    return {
      isValid: false,
      qualityStatus: 'INVALID',
      errors: ['Invalid observation timestamp format'],
    };
  }

  // Future timestamp tolerance: 5 minutes max
  const clockToleranceMs = 5 * 60 * 1000;
  if (obsTime > now + clockToleranceMs) {
    return {
      isValid: false,
      qualityStatus: 'INVALID',
      errors: ['Observation timestamp is set in the future beyond clock tolerance'],
    };
  }

  // 4. Freshness evaluation
  const ageMinutes = Math.floor((now - obsTime) / (60 * 1000));
  if (ageMinutes > FRESHNESS_THRESHOLD_MINUTES) {
    return {
      isValid: true,
      qualityStatus: 'STALE',
      errors: [`Telemetry is stale (${ageMinutes} minutes old, threshold is ${FRESHNESS_THRESHOLD_MINUTES}m)`],
    };
  }

  return {
    isValid: true,
    qualityStatus: 'VALID',
    errors: [],
  };
}
