import {
  WeatherTelemetryResponse,
  WeatherForecastResponse,
  WeatherForecastPoint,
  WeatherMetrics,
  WeatherProvenance,
  SimulationScenario,
} from '@hare/shared';
import { calculateHeatIndex } from './weatherValidator.js';
import { AppError } from '../middleware/errorHandler.js';

export interface DefinedSimulationScenario extends SimulationScenario {
  ageMinutes?: number;
  qualityStatus?: 'VALID' | 'STALE' | 'INVALID';
  forecastPeakTempC?: number;
}

export const PRESET_SIMULATION_SCENARIOS: Record<string, DefinedSimulationScenario> = {
  'SCENARIO-DEMO-01-BASELINE': {
    scenario_id: 'SCENARIO-DEMO-01-BASELINE',
    scenario_name: 'Scenario A: Normal Operating Baseline (LOW Risk)',
    description: 'Mild environmental conditions with light thermal load.',
    metrics: {
      dry_bulb_temperature_c: 26.0,
      relative_humidity_pct: 50.0,
      apparent_temperature_c: 26.0,
      heat_index_c: 26.0,
      solar_radiation_wm2: 400.0,
      wind_speed_kmh: 8.0,
      wind_speed_ms: 2.2,
    },
    provenance_tag: 'SYNTHETIC_FIXTURE_BASELINE_V1',
    forecastPeakTempC: 28.0,
  },
  'SCENARIO-DEMO-02-ELEVATED': {
    scenario_id: 'SCENARIO-DEMO-02-ELEVATED',
    scenario_name: 'Scenario B: Elevated Environmental Heat (MODERATE Risk)',
    description: 'Elevated temperature and humidity requiring precautionary hydration.',
    metrics: {
      dry_bulb_temperature_c: 33.0,
      relative_humidity_pct: 60.0,
      apparent_temperature_c: 38.0,
      heat_index_c: calculateHeatIndex(33.0, 60.0),
      solar_radiation_wm2: 700.0,
      wind_speed_kmh: 10.0,
      wind_speed_ms: 2.8,
    },
    provenance_tag: 'SYNTHETIC_FIXTURE_ELEVATED_V1',
    forecastPeakTempC: 35.0,
  },
  'SCENARIO-DEMO-03-HIGH-HEAT': {
    scenario_id: 'SCENARIO-DEMO-03-HIGH-HEAT',
    scenario_name: 'Scenario C: High-Risk Response Workflow (HIGH Risk)',
    description: 'Dangerous heat spike requiring mandatory rest breaks and active shade rotation.',
    metrics: {
      dry_bulb_temperature_c: 37.5,
      relative_humidity_pct: 52.0,
      apparent_temperature_c: 44.0,
      heat_index_c: calculateHeatIndex(37.5, 52.0),
      solar_radiation_wm2: 850.0,
      wind_speed_kmh: 8.0,
      wind_speed_ms: 2.2,
    },
    provenance_tag: 'SYNTHETIC_FIXTURE_HIGH_HEAT_V1',
    forecastPeakTempC: 39.5,
  },
  'SCENARIO-DEMO-04-UNACK-ESCALATION': {
    scenario_id: 'SCENARIO-DEMO-04-UNACK-ESCALATION',
    scenario_name: 'Scenario D: Severe Heat Spike (Unacknowledged Escalation)',
    description: 'Extreme heat load designed to test timeout escalation to Safety Manager.',
    metrics: {
      dry_bulb_temperature_c: 39.0,
      relative_humidity_pct: 58.0,
      apparent_temperature_c: 48.0,
      heat_index_c: calculateHeatIndex(39.0, 58.0),
      solar_radiation_wm2: 920.0,
      wind_speed_kmh: 6.0,
      wind_speed_ms: 1.7,
    },
    provenance_tag: 'SYNTHETIC_FIXTURE_CRITICAL_SPIKE_V1',
    forecastPeakTempC: 41.0,
  },
  'SCENARIO-DEMO-05-STALE-ANOMALY': {
    scenario_id: 'SCENARIO-DEMO-05-STALE-ANOMALY',
    scenario_name: 'Scenario E: Weather Data Failure Handling (STALE / Outage)',
    description: 'Telemetry older than 2 hours simulating external provider outage.',
    metrics: {
      dry_bulb_temperature_c: 36.0,
      relative_humidity_pct: 55.0,
      apparent_temperature_c: 42.0,
      heat_index_c: calculateHeatIndex(36.0, 55.0),
      solar_radiation_wm2: 780.0,
      wind_speed_kmh: 7.0,
      wind_speed_ms: 1.9,
    },
    provenance_tag: 'SYNTHETIC_FIXTURE_STALE_OUTAGE_V1',
    ageMinutes: 180,
    qualityStatus: 'STALE',
    forecastPeakTempC: 37.0,
  },
};

export class SimulationInjector {
  private activeSimulations = new Map<string, string>(); // worksiteId -> scenarioId

  public setSimulationScenario(worksiteId: string, scenarioId: string): DefinedSimulationScenario {
    const scenario = PRESET_SIMULATION_SCENARIOS[scenarioId];
    if (!scenario) {
      throw new AppError(
        'VALIDATION_ERROR',
        `Unknown simulation scenario ID: '${scenarioId}'. Available: ${Object.keys(
          PRESET_SIMULATION_SCENARIOS
        ).join(', ')}`,
        400
      );
    }
    this.activeSimulations.set(worksiteId, scenarioId);
    return scenario;
  }

  public clearSimulation(worksiteId: string): boolean {
    return this.activeSimulations.delete(worksiteId);
  }

  public getActiveScenarioId(worksiteId: string): string | undefined {
    return this.activeSimulations.get(worksiteId);
  }

  public isSimulating(worksiteId: string): boolean {
    return this.activeSimulations.has(worksiteId);
  }

  public generateSimulatedObservation(
    worksiteId: string,
    scenarioId?: string
  ): WeatherTelemetryResponse {
    const targetScenarioId = scenarioId || this.activeSimulations.get(worksiteId);
    if (!targetScenarioId) {
      throw new AppError('VALIDATION_ERROR', `No active simulation configured for worksite '${worksiteId}'.`, 400);
    }

    const scenario = PRESET_SIMULATION_SCENARIOS[targetScenarioId];
    if (!scenario) {
      throw new AppError('VALIDATION_ERROR', `Unknown simulation scenario '${targetScenarioId}'.`, 400);
    }

    const now = new Date();
    const ageMinutes = scenario.ageMinutes ?? 5;
    const observationTimestamp = new Date(now.getTime() - ageMinutes * 60 * 1000).toISOString();

    const provenance: WeatherProvenance = {
      provider: 'SIMULATION',
      station_id: `SIM_STATION_${worksiteId}`,
      observation_timestamp: observationTimestamp,
      retrieval_timestamp: now.toISOString(),
      observation_age_minutes: ageMinutes,
      quality_status: scenario.qualityStatus ?? 'VALID',
      is_simulation: true,
      simulation_scenario_id: scenario.scenario_id,
    };

    return {
      worksite_id: worksiteId,
      telemetry_type: 'SIMULATION',
      metrics: { ...scenario.metrics },
      provenance,
    };
  }

  public generateSimulatedForecast(
    worksiteId: string,
    scenarioId?: string,
    horizonHours = 12
  ): WeatherForecastResponse {
    const targetScenarioId = scenarioId || this.activeSimulations.get(worksiteId);
    if (!targetScenarioId) {
      throw new AppError('VALIDATION_ERROR', `No active simulation configured for worksite '${worksiteId}'.`, 400);
    }

    const scenario = PRESET_SIMULATION_SCENARIOS[targetScenarioId];
    if (!scenario) {
      throw new AppError('VALIDATION_ERROR', `Unknown simulation scenario '${targetScenarioId}'.`, 400);
    }

    const now = new Date();
    const baseTemp = scenario.metrics.dry_bulb_temperature_c;
    const peakTemp = scenario.forecastPeakTempC ?? baseTemp + 3;
    const rh = scenario.metrics.relative_humidity_pct;

    const series: WeatherForecastPoint[] = [];
    for (let h = 1; h <= horizonHours; h++) {
      const targetTime = new Date(now.getTime() + h * 3600 * 1000).toISOString();
      // Curve upwards towards peak in mid-shift
      const progress = Math.sin((h / horizonHours) * Math.PI);
      const temp = Math.round((baseTemp + (peakTemp - baseTemp) * progress) * 10) / 10;
      const hi = calculateHeatIndex(temp, rh);

      series.push({
        target_timestamp: targetTime,
        dry_bulb_temperature_c: temp,
        relative_humidity_pct: rh,
        apparent_temperature_c: hi,
        heat_index_c: hi,
        solar_radiation_wm2: Math.max(0, Math.round((scenario.metrics.solar_radiation_wm2 ?? 500) * progress)),
        wind_speed_kmh: scenario.metrics.wind_speed_kmh ?? 8,
        wind_speed_ms: scenario.metrics.wind_speed_ms ?? 2.2,
      });
    }

    const provenance: WeatherProvenance = {
      provider: 'SIMULATION',
      station_id: `SIM_STATION_${worksiteId}`,
      observation_timestamp: now.toISOString(),
      retrieval_timestamp: now.toISOString(),
      observation_age_minutes: 0,
      quality_status: scenario.qualityStatus ?? 'VALID',
      is_simulation: true,
      simulation_scenario_id: scenario.scenario_id,
    };

    return {
      worksite_id: worksiteId,
      telemetry_type: 'SIMULATION',
      model_run_timestamp: now.toISOString(),
      forecast_horizon_hours: series.length,
      forecast_series: series,
      provenance,
    };
  }
}

export const simulationInjector = new SimulationInjector();
