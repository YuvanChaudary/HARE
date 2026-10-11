import { config } from '../config.js';
import { AppError } from '../middleware/errorHandler.js';

export interface OpenMeteoRawResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  current?: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    direct_normal_irradiance?: number;
    wind_speed_10m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    direct_normal_irradiance?: number[];
    wind_speed_10m?: number[];
  };
}

export type FetchFn = (url: string, options?: any) => Promise<any>;

export class OpenMeteoClient {
  private baseUrl: string;
  private fetchFn: FetchFn;
  private timeoutMs: number;

  constructor(baseUrl = config.weatherBaseUrl, timeoutMs = 5000, fetchFn?: FetchFn) {
    this.baseUrl = baseUrl;
    this.timeoutMs = timeoutMs;
    this.fetchFn = fetchFn || (globalThis.fetch as FetchFn);
  }

  /**
   * Fetches current meteorological observations and hourly forecast from Open-Meteo.
   * Enforces 5-second timeout and exponential backoff retry policy (docs/31_OPEN_METEO.md).
   */
  public async fetchTelemetry(
    latitude: number,
    longitude: number,
    forecastHours = 24
  ): Promise<OpenMeteoRawResponse> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set(
      'current',
      'temperature_2m,relative_humidity_2m,apparent_temperature,direct_normal_irradiance,wind_speed_10m'
    );
    url.searchParams.set(
      'hourly',
      'temperature_2m,relative_humidity_2m,apparent_temperature,direct_normal_irradiance,wind_speed_10m'
    );
    url.searchParams.set('forecast_hours', forecastHours.toString());
    url.searchParams.set('timezone', 'UTC');

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await this.fetchFn(url.toString(), {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'User-Agent': 'HeatActionResponseEngine/1.0.0 (WorkplaceSafetyPlatform)',
          },
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          throw new AppError(
            'RATE_LIMITED',
            'Upstream weather provider rate limit exceeded. Retrying...',
            429,
            true
          );
        }

        if (!response.ok) {
          throw new AppError(
            'DATA_UNAVAILABLE',
            `Upstream weather provider error: HTTP ${response.status}`,
            502,
            true
          );
        }

        const data: OpenMeteoRawResponse = await response.json();
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);

        const isLastAttempt = attempts >= maxAttempts;
        if (err.name === 'AbortError') {
          if (isLastAttempt) {
            throw new AppError(
              'DATA_UNAVAILABLE',
              `Weather provider connection timed out after ${this.timeoutMs}ms.`,
              504,
              true
            );
          }
        } else if (isLastAttempt) {
          if (err instanceof AppError) throw err;
          throw new AppError(
            'DATA_UNAVAILABLE',
            `Failed communicating with weather provider: ${err.message}`,
            502,
            true
          );
        }

        // Exponential backoff before next attempt: 100ms, 300ms...
        await new Promise((resolve) => setTimeout(resolve, attempts * 100));
      }
    }

    throw new AppError('DATA_UNAVAILABLE', 'Exceeded maximum retries for weather telemetry.', 502);
  }
}

export const openMeteoClient = new OpenMeteoClient();
