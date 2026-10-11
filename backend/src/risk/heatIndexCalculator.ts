/**
 * Heat Action Response Engine (HARE) — NOAA / Rothfusz Heat Index Calculator
 *
 * Implements the official National Weather Service (NWS) / NOAA Heat Index formulation:
 * Reference: docs/22_HEAT_INDEX_AND_LIMITATIONS.md
 * Domain Citation: REF-NOAA-NWS (Technical Attachment SR 90-23 by Rothfusz, 1990)
 * Secondary Citation: REF-STEADMAN-1979 (The Assessment of Sultriness, Steadman 1979)
 *
 * 100% Deterministic — Zero Generative AI Involvement
 */

export interface HeatIndexCalculationDetails {
  dry_bulb_temperature_c: number;
  dry_bulb_temperature_f: number;
  relative_humidity_pct: number;
  heat_index_f: number;
  heat_index_c: number;
  adjustment_applied: 'NONE' | 'LOW_HUMIDITY' | 'HIGH_HUMIDITY';
  adjustment_value_f: number;
  equation_used: 'DIRECT_TEMP' | 'STEADMAN_SIMPLE' | 'ROTHFUSZ_REGRESSION';
}

/**
 * Computes NOAA Heat Index in degrees Fahrenheit from Fahrenheit temperature and RH.
 */
export function calculateHeatIndexFahrenheit(tempF: number, rh: number): number {
  if (tempF < 68.0) {
    return Math.round(tempF * 10) / 10;
  }

  // 1. Simple Steadman formula
  let hiF = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);
  hiF = (hiF + tempF) / 2.0;

  // 2. If HI >= 80°F, apply full Rothfusz regression polynomial
  if (hiF >= 80.0) {
    hiF =
      -42.379 +
      2.04901523 * tempF +
      10.14333127 * rh -
      0.22475541 * tempF * rh -
      0.00683783 * tempF * tempF -
      0.05481717 * rh * rh +
      0.00122874 * tempF * tempF * rh +
      0.00085282 * tempF * rh * rh -
      0.00000199 * tempF * tempF * rh * rh;

    // Low relative humidity adjustment
    if (rh < 13 && tempF >= 80 && tempF <= 112) {
      const term = (17 - Math.abs(tempF - 95)) / 17;
      if (term > 0) {
        const adj = -((13 - rh) / 4) * Math.sqrt(term);
        hiF += adj;
      }
    }
    // High relative humidity adjustment
    else if (rh > 85 && tempF >= 80 && tempF <= 87) {
      const adj = ((rh - 85) / 10) * ((87 - tempF) / 5);
      hiF += adj;
    }
  }

  return Math.round(hiF * 10) / 10;
}

/**
 * Computes NOAA Heat Index in degrees Celsius from Celsius temperature and Relative Humidity.
 *
 * @param tempC Dry-bulb ambient air temperature in °C
 * @param rh Relative humidity as percentage [0..100]
 * @returns Heat Index in °C rounded to 1 decimal place
 */
export function calculateHeatIndexCelsius(tempC: number, rh: number): number {
  if (isNaN(tempC) || isNaN(rh)) {
    throw new Error(`Invalid numeric input for Heat Index: tempC=${tempC}, rh=${rh}`);
  }

  // Under 20°C (68°F), Heat Index equals ambient temperature
  if (tempC < 20.0) {
    return Math.round(tempC * 10) / 10;
  }

  const tempF = (tempC * 9) / 5 + 32;
  const hiF = calculateHeatIndexFahrenheit(tempF, rh);
  const hiC = ((hiF - 32) * 5) / 9;

  return Math.round(hiC * 10) / 10;
}

/**
 * Comprehensive calculation function returning full mathematical details for auditing.
 */
export function calculateHeatIndexDetailed(tempC: number, rh: number): HeatIndexCalculationDetails {
  if (isNaN(tempC) || isNaN(rh)) {
    throw new Error(`Invalid numeric input for Heat Index: tempC=${tempC}, rh=${rh}`);
  }

  const tempF = (tempC * 9) / 5 + 32;

  if (tempC < 20.0) {
    return {
      dry_bulb_temperature_c: Math.round(tempC * 10) / 10,
      dry_bulb_temperature_f: Math.round(tempF * 10) / 10,
      relative_humidity_pct: rh,
      heat_index_f: Math.round(tempF * 10) / 10,
      heat_index_c: Math.round(tempC * 10) / 10,
      adjustment_applied: 'NONE',
      adjustment_value_f: 0.0,
      equation_used: 'DIRECT_TEMP',
    };
  }

  let hiF = 0.5 * (tempF + 61.0 + (tempF - 68.0) * 1.2 + rh * 0.094);
  hiF = (hiF + tempF) / 2.0;

  if (hiF < 80.0) {
    const hiC = ((hiF - 32) * 5) / 9;
    return {
      dry_bulb_temperature_c: Math.round(tempC * 10) / 10,
      dry_bulb_temperature_f: Math.round(tempF * 10) / 10,
      relative_humidity_pct: rh,
      heat_index_f: Math.round(hiF * 10) / 10,
      heat_index_c: Math.round(hiC * 10) / 10,
      adjustment_applied: 'NONE',
      adjustment_value_f: 0.0,
      equation_used: 'STEADMAN_SIMPLE',
    };
  }

  // Full Rothfusz polynomial
  hiF =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  let adjustmentApplied: 'NONE' | 'LOW_HUMIDITY' | 'HIGH_HUMIDITY' = 'NONE';
  let adjValue = 0.0;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    const term = (17 - Math.abs(tempF - 95)) / 17;
    if (term > 0) {
      adjValue = -((13 - rh) / 4) * Math.sqrt(term);
      hiF += adjValue;
      adjustmentApplied = 'LOW_HUMIDITY';
    }
  } else if (rh > 85 && tempF >= 80 && tempF <= 87) {
    adjValue = ((rh - 85) / 10) * ((87 - tempF) / 5);
    hiF += adjValue;
    adjustmentApplied = 'HIGH_HUMIDITY';
  }

  const hiC = ((hiF - 32) * 5) / 9;

  return {
    dry_bulb_temperature_c: Math.round(tempC * 10) / 10,
    dry_bulb_temperature_f: Math.round(tempF * 10) / 10,
    relative_humidity_pct: rh,
    heat_index_f: Math.round(hiF * 10) / 10,
    heat_index_c: Math.round(hiC * 10) / 10,
    adjustment_applied: adjustmentApplied,
    adjustment_value_f: Math.round(adjValue * 100) / 100,
    equation_used: 'ROTHFUSZ_REGRESSION',
  };
}
