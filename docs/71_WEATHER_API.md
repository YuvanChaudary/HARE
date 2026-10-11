# Weather Telemetry & Forecast API Specification

**Document ID:** `71_WEATHER_API`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

This specification defines the authoritative API contracts for retrieving meteorological telemetry, weather forecast series, and historical environmental observations. It provides a clean, normalized abstraction layer that shields client applications from upstream provider-specific data structures (Open-Meteo, IMD, and future physical IoT stations).

This document establishes:
* Endpoints for current observations, multi-hour forecasts, and historical telemetry.
* The normalized meteorological data model and explicit provenance schema.
* Data quality indicators (`VALID`, `AGING`, `STALE`, `MISSING`, `INVALID`, `UNKNOWN`, `CONFLICTING`).
* Complete request/response schemas with error contracts and authorization rules.

---

## 2. Core Meteorological Data Model

All weather endpoints return normalized metric units conforming to `33_WEATHER_DATA_MODEL.md`:

```text
┌──────────────────────────┬──────────┬────────────────────────────────────────┐
│ PARAMETER NAME           │ UNIT     │ DESCRIPTION                            │
├──────────────────────────┼──────────┼────────────────────────────────────────┤
│ `dry_bulb_temperature_c` │ °C       │ Ambient air temperature measured       │
│ `relative_humidity_pct`  │ %        │ Ambient relative humidity (0–100%)     │
│ `heat_index_c`           │ °C       │ Calculated NOAA/Rothfusz Heat Index    │
│ `solar_radiation_wm2`    │ W/m²     │ Surface global horizontal irradiance   │
│ `wind_speed_ms`          │ m/s      │ Wind speed measured at 2m/10m surface  │
│ `wet_bulb_temp_c`        │ °C       │ Natural thermodynamic wet-bulb temp    │
│ `wbgt_estimated_c`       │ °C       │ Estimated Wet Bulb Globe Temperature   │
└──────────────────────────┴──────────┴────────────────────────────────────────┘
```

### Data Provenance & Quality Model
Every response embeds an explicit provenance block to eliminate false certainty:
```json
{
  "provenance": {
    "provider": "OPEN_METEO",
    "station_id": "STN_BLR_AWS_04",
    "observation_timestamp": "2026-10-07T14:00:00Z",
    "retrieval_timestamp": "2026-10-07T14:02:15Z",
    "observation_age_minutes": 22,
    "quality_status": "VALID",
    "is_simulation": false
  }
}
```

---

## 3. Endpoints Overview

```text
┌────────┬──────────────────────────────────────────────┬────────────────────────┐
│ METHOD │ ROUTE                                        │ ACCESS ROLE            │
├────────┼──────────────────────────────────────────────┼────────────────────────┤
│ GET    │ `/api/v1/worksites/{id}/weather/current`     │ All Roles (Scoped)     │
│ GET    │ `/api/v1/worksites/{id}/weather/forecast`    │ All Roles (Scoped)     │
│ GET    │ `/api/v1/worksites/{id}/weather/history`     │ All Roles (Scoped)     │
│ POST   │ `/api/v1/worksites/{id}/weather/refresh`     │ Safety Manager / Admin │
└────────┴──────────────────────────────────────────────┴────────────────────────┘
```

---

## 4. Endpoint Specifications

### 4.1 Get Current Weather Observation

Retrieves the latest validated physical weather telemetry for a specific worksite.

* **Route:** `GET /api/v1/worksites/{worksite_id}/weather/current`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (must have access to target worksite).
* **Headers:**
  * `Authorization: Bearer <token>`
* **Path Parameters:**
  * `worksite_id` (String, required): Worksite identifier (e.g. `site_blr_north_01`).

#### Success Response (`200 OK`):
```json
{
  "data": {
    "worksite_id": "site_blr_north_01",
    "telemetry_type": "OBSERVATION",
    "metrics": {
      "dry_bulb_temperature_c": 38.2,
      "relative_humidity_pct": 56.0,
      "heat_index_c": 43.8,
      "solar_radiation_wm2": 890.0,
      "wind_speed_ms": 2.4,
      "wet_bulb_temp_c": 29.5,
      "wbgt_estimated_c": 33.1
    },
    "provenance": {
      "provider": "OPEN_METEO",
      "station_id": "STN_BLR_AWS_04",
      "observation_timestamp": "2026-10-07T14:00:00Z",
      "retrieval_timestamp": "2026-10-07T14:02:15Z",
      "observation_age_minutes": 22,
      "quality_status": "VALID",
      "is_simulation": false
    }
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:22:15.123Z",
    "resource_version": 1
  }
}
```

#### Degraded Telemetry Response (`200 OK` with Stale Quality):
When weather data refresh is delayed, the API returns the last valid record with an explicit `STALE` quality flag:
```json
{
  "data": {
    "worksite_id": "site_blr_north_01",
    "telemetry_type": "OBSERVATION",
    "metrics": {
      "dry_bulb_temperature_c": 37.8,
      "relative_humidity_pct": 54.0,
      "heat_index_c": 42.9,
      "solar_radiation_wm2": 780.0,
      "wind_speed_ms": 2.1,
      "wet_bulb_temp_c": 28.9,
      "wbgt_estimated_c": 32.4
    },
    "provenance": {
      "provider": "OPEN_METEO",
      "station_id": "STN_BLR_AWS_04",
      "observation_timestamp": "2026-10-07T11:00:00Z",
      "retrieval_timestamp": "2026-10-07T11:02:10Z",
      "observation_age_minutes": 202,
      "quality_status": "STALE",
      "warning": "Telemetry is older than 2 hours. Atmospheric conditions may have changed.",
      "is_simulation": false
    }
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:22:15.123Z",
    "resource_version": 1
  }
}
```

---

### 4.2 Get Weather Forecast Series

Retrieves multi-hour predictive meteorological runs for shift planning and advance warning.

* **Route:** `GET /api/v1/worksites/{worksite_id}/weather/forecast`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (scoped).
* **Headers:**
  * `Authorization: Bearer <token>`
* **Query Parameters:**
  * `hours` (Integer, optional, default `12`, max `48`): Forecast horizon in hours.

#### Success Response (`200 OK`):
```json
{
  "data": {
    "worksite_id": "site_blr_north_01",
    "telemetry_type": "FORECAST",
    "model_run_timestamp": "2026-10-07T12:00:00Z",
    "forecast_series": [
      {
        "target_timestamp": "2026-10-07T15:00:00Z",
        "dry_bulb_temperature_c": 39.5,
        "relative_humidity_pct": 52.0,
        "heat_index_c": 45.2,
        "solar_radiation_wm2": 820.0,
        "wind_speed_ms": 2.8,
        "wbgt_estimated_c": 34.0,
        "projected_risk_level": "CRITICAL"
      },
      {
        "target_timestamp": "2026-10-07T16:00:00Z",
        "dry_bulb_temperature_c": 38.8,
        "relative_humidity_pct": 55.0,
        "heat_index_c": 44.6,
        "solar_radiation_wm2": 610.0,
        "wind_speed_ms": 2.9,
        "wbgt_estimated_c": 33.5,
        "projected_risk_level": "HIGH"
      }
    ],
    "provenance": {
      "provider": "OPEN_METEO",
      "model": "ECMWF_IFS_HR",
      "retrieval_timestamp": "2026-10-07T12:05:00Z",
      "quality_status": "VALID",
      "is_simulation": false
    }
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:22:15.123Z",
    "resource_version": 1
  }
}
```

*Architectural Invariant:* The `telemetry_type` is explicitly set to `"FORECAST"` to prevent client runtimes from conflating models with physical observations.

---

### 4.3 Get Historical Weather Telemetry

Retrieves historical observations for trend charts, post-incident investigations, and regulatory audit reviews.

* **Route:** `GET /api/v1/worksites/{worksite_id}/weather/history`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (scoped).
* **Query Parameters:**
  * `from` (String, required): ISO 8601 UTC start time (e.g. `2026-10-07T06:00:00Z`).
  * `to` (String, required): ISO 8601 UTC end time (e.g. `2026-10-07T14:00:00Z`).
  * `limit` (Integer, optional, default `50`, max `100`): Maximum entries.
  * `cursor` (String, optional): Pagination token.

#### Success Response (`200 OK`):
```json
{
  "data": [
    {
      "observation_timestamp": "2026-10-07T13:00:00Z",
      "dry_bulb_temperature_c": 37.1,
      "relative_humidity_pct": 58.0,
      "heat_index_c": 42.5,
      "solar_radiation_wm2": 910.0,
      "wind_speed_ms": 2.1,
      "quality_status": "VALID"
    },
    {
      "observation_timestamp": "2026-10-07T12:00:00Z",
      "dry_bulb_temperature_c": 35.8,
      "relative_humidity_pct": 60.0,
      "heat_index_c": 40.8,
      "solar_radiation_wm2": 930.0,
      "wind_speed_ms": 2.0,
      "quality_status": "VALID"
    }
  ],
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:22:15.123Z",
    "count": 2,
    "next_cursor": null
  }
}
```

---

### 4.4 Trigger On-Demand Weather Refresh

Forces an immediate out-of-band telemetry fetch from the meteorological provider.

* **Route:** `POST /api/v1/worksites/{worksite_id}/weather/refresh`
* **Authorization:** `SAFETY_MANAGER`, `ADMIN` (Supervisors cannot trigger manual API quota consumption).
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Idempotency-Key: <UUID>`

#### Success Response (`200 OK`):
```json
{
  "data": {
    "worksite_id": "site_blr_north_01",
    "refresh_status": "REFRESHED",
    "refreshed_at": "2026-10-07T14:25:30Z",
    "latest_observation": {
      "observation_timestamp": "2026-10-07T14:20:00Z",
      "dry_bulb_temperature_c": 38.6,
      "relative_humidity_pct": 55.0,
      "heat_index_c": 44.1,
      "quality_status": "VALID"
    }
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:25:31.123Z",
    "resource_version": 2
  }
}
```

---

## 5. Error Responses & Failure Contracts

```text
┌──────┬────────────────────────┬────────────────────────────────────────┐
│ CODE │ ERROR CODE             │ FAILURE SCENARIO                       │
├──────┼────────────────────────┼────────────────────────────────────────┤
│ 403  │ `WORKSITE_FORBIDDEN`   │ User not assigned to target worksite.  │
│ 404  │ `WORKSITE_NOT_FOUND`   │ Worksite ID does not exist in org.     │
│ 429  │ `REFRESH_RATE_LIMITED` │ Manual refresh requested within 5 mins.│
│ 502  │ `PROVIDER_UNAVAILABLE` │ Upstream Open-Meteo connection failure.│
└──────┴────────────────────────┴────────────────────────────────────────┘
```

### Upstream Failure Error Payload (`502 Bad Gateway`):
```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "External meteorological provider timed out. Retaining last validated observation.",
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:22:15.123Z",
    "retryable": true,
    "details": {
      "provider": "OPEN_METEO",
      "last_valid_observation": "2026-10-07T13:00:00Z"
    }
  }
}
```

---

## 6. Non-Negotiable Safety Invariants

1. **Failure is Not Low Risk:** If the weather provider fails, the API surfaces `STALE` or `MISSING` quality statuses; it **never** manufactures a `LOW` risk reading.
2. **Forecast is Not Observation:** The API strictly partitions observation records from predictive models in both schema and data types.
3. **Frontend Does Not Calculate:** The frontend receives pre-validated heat indices and metrics; it is strictly prohibited from running meteorological formulas locally.
