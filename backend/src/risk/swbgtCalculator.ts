/**
 * Heat Action Response Engine (HARE) — Simplified Wet Bulb Globe Temperature (sWBGT) Calculator
 *
 * Implements the deterministic approximation for Wet Bulb Globe Temperature (sWBGT)
 * derived from dry-bulb temperature and relative humidity:
 *
 * Reference: docs/22_HEAT_INDEX_AND_LIMITATIONS.md Section 5
 * Formula: sWBGT = 0.567 * T + 0.393 * e + 3.94
 * where e is water vapor pressure in hPa:
 * e = (RH / 100) * 6.105 * exp((17.27 * T) / (237.7 + T))
 *
 * Citation: Bureau of Meteorology (BOM) / ISO 7243 Environmental Ergonomics
 *
 * 100% Deterministic — Zero Generative AI Involvement
 */

export interface SwbgtCalculationDetails {
  dry_bulb_temperature_c: number;
  relative_humidity_pct: number;
  vapor_pressure_hpa: number;
  swbgt_c: number;
  limitations: string;
}

/**
 * Calculates water vapor pressure (e) in hectopascals (hPa) from temperature (°C) and relative humidity (%).
 */
export function calculateVaporPressureHpa(tempC: number, rh: number): number {
  if (isNaN(tempC) || isNaN(rh)) {
    throw new Error(`Invalid numeric input for vapor pressure: tempC=${tempC}, rh=${rh}`);
  }
  const saturationVaporPressure = 6.105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
  return (rh / 100.0) * saturationVaporPressure;
}

/**
 * Calculates Simplified Wet Bulb Globe Temperature (sWBGT) in degrees Celsius.
 *
 * @param tempC Dry-bulb ambient air temperature in °C
 * @param rh Relative humidity as percentage [0..100]
 * @returns sWBGT in °C rounded to 1 decimal place
 */
export function calculateSwbgtCelsius(tempC: number, rh: number): number {
  if (isNaN(tempC) || isNaN(rh)) {
    throw new Error(`Invalid numeric input for sWBGT: tempC=${tempC}, rh=${rh}`);
  }

  const e = calculateVaporPressureHpa(tempC, rh);
  const swbgt = 0.567 * tempC + 0.393 * e + 3.94;

  return Math.round(swbgt * 10) / 10;
}

/**
 * Detailed calculation returning vapor pressure and documented limitations.
 */
export function calculateSwbgtDetailed(tempC: number, rh: number): SwbgtCalculationDetails {
  const e = calculateVaporPressureHpa(tempC, rh);
  const swbgt = calculateSwbgtCelsius(tempC, rh);

  return {
    dry_bulb_temperature_c: Math.round(tempC * 10) / 10,
    relative_humidity_pct: rh,
    vapor_pressure_hpa: Math.round(e * 100) / 100,
    swbgt_c: swbgt,
    limitations:
      'sWBGT is a mathematical approximation assuming standard outdoor air movement and does not substitute for calibrated on-site black-globe sensors (ISO 7243).',
  };
}
