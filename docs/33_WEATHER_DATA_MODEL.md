# 33 Weather Data Model Specification

## 1. Purpose

This document defines the canonical, normalized **Weather Data Model** for the **Heat Action Response Engine**.

The Weather Data Model serves as the architectural contract and abstraction barrier between diverse external environmental providers (e.g., Open-Meteo, IMD, and future physical IoT sensors) and the downstream Heat Risk Engine:

```text
Open-Meteo ───┐
              │
IMD ──────────┼───► CANONICAL WEATHER DATA MODEL ───► HEAT RISK ENGINE
              │
Future IoT ───┘
```

By establishing a standardized internal representation, the platform ensures that:
1. Downstream safety, risk evaluation, and action generation logic remain entirely decoupled from vendor-specific payloads, field names, and transport quirks.
2. Every environmental data point consumed by the risk engine carries rigorous provenance, quality flags, and temporal classifications.
3. New meteorological services, localized microclimate models, or physical sensor grids can be integrated without modifying risk evaluation algorithms.

---

## 2. Core Entity: `WeatherRecord`

The primary entity within the weather data domain is the immutable `WeatherRecord`. 

A `WeatherRecord` captures a validated environmental state or forecast projection associated with a specific worksite location and operational time horizon. It encapsulates measured or projected scalar metrics, data categorization, structural quality states, and forensic source lineage.

---

## 3. Conceptual Schema and Field Taxonomy

The fields comprising a `WeatherRecord` are classified into four structural categories:
* `REQUIRED`: Mandatory for every valid record regardless of source.
* `OPTIONAL`: Populated only when supported by the provider or sensor capabilities.
* `SOURCE_DEPENDENT`: Mandatory for specific data types (e.g., forecasts require projection horizons; physical stations require station IDs).
* `DERIVED`: Computed by internal normalization logic or provided as a derived index by the vendor.

| Field Name | Category | Type / Format | Description |
| :--- | :--- | :--- | :--- |
| `weather_record_id` | `REQUIRED` | UUIDv4 / String | Globally unique, immutable record identifier |
| `worksite_id` | `REQUIRED` | UUID / String | Foreign key to the associated Worksite entity |
| `source_id` | `REQUIRED` | String | Identifier of the originating provider (`OPEN_METEO`, `IMD`, `IOT_EDGE`) |
| `source_type` | `REQUIRED` | Enum | Classification of the origin (`MODEL_FORECAST_API`, `OFFICIAL_MET_SERVICE`, `PHYSICAL_SENSOR`, `SIMULATION`) |
| `location` | `REQUIRED` | GeoJSON / Object | Geographical point (`latitude`, `longitude`, `elevation`) |
| `latitude` | `REQUIRED` | Decimal Float | Worksite latitude in decimal degrees (-90.0 to +90.0) |
| `longitude` | `REQUIRED` | Decimal Float | Worksite longitude in decimal degrees (-180.0 to +180.0) |
| `timezone` | `REQUIRED` | String | IANA timezone identifier (e.g., `Asia/Kolkata`) |
| `data_type` | `REQUIRED` | Enum | Nature of the data (`OBSERVATION`, `FORECAST`, `ADVISORY`, `DERIVED`) |
| `observation_time` | `SOURCE_DEPENDENT` | ISO 8601 UTC | Valid timestamp of physical measurement (mandatory if `OBSERVATION`) |
| `forecast_period` | `SOURCE_DEPENDENT` | ISO 8601 UTC | Target operational time slice (mandatory if `FORECAST`) |
| `forecast_generated_at`| `SOURCE_DEPENDENT`| ISO 8601 UTC | Model initialization/issuance timestamp (mandatory if `FORECAST`) |
| `retrieved_at` | `REQUIRED` | ISO 8601 UTC | Exact system timestamp when payload was ingested |
| `temperature` | `REQUIRED` | Float (°C) | Dry-bulb ambient air temperature ($T_a$) |
| `relative_humidity` | `REQUIRED` | Float (%) | Relative humidity ($RH$, 0.0 to 100.0) |
| `wind_speed` | `OPTIONAL` | Float (km/h) | Wind speed at standard meteorological height |
| `wind_direction` | `OPTIONAL` | Float (Degrees) | Wind direction in degrees (0–360) |
| `precipitation` | `OPTIONAL` | Float (mm) | Precipitation amount or rate ($\ge 0.0$) |
| `cloud_cover` | `OPTIONAL` | Float (%) | Total cloud coverage percentage (0–100) |
| `heat_index` | `DERIVED` | Float (°C) | Calculated or provider-supplied Rothfusz/NOAA heat index |
| `apparent_temperature`| `DERIVED` | Float (°C) | Calculated or provider-supplied apparent temperature |
| `quality_status` | `REQUIRED` | Enum | Validation status (`VALID`, `STALE`, `MISSING`, `INVALID`, `UNKNOWN`, `CONFLICTING`) |
| `freshness_status` | `REQUIRED` | Enum | Temporal health (`FRESH`, `AGING`, `STALE`, `UNKNOWN`) |
| `provenance` | `REQUIRED` | JSON / Object | Forensic audit block containing raw hashes, endpoints, and adapters |
| `normalization_version`| `REQUIRED`| String | Version of the transformation schema (e.g., `1.0.0`) |
| `created_at` | `REQUIRED` | ISO 8601 UTC | System ingestion persistence timestamp |

---

## 4. Data Type Classification

To prevent conflation between forward-looking projections and real-world ground conditions, every record is explicitly tagged with its semantic `data_type`:

```text
                               DATA TYPE
                                   │
      ┌────────────────┬───────────┴───────────┬────────────────┐
      ▼                ▼                       ▼                ▼
 OBSERVATION        FORECAST               ADVISORY          DERIVED
(Ground Truth)   (Model Projection)     (Civic Warning)   (Computed Index)
```

1. **`OBSERVATION`:** Represents a measured physical atmospheric condition reported at a specific historical or current instant (e.g., automated synoptic weather station or future on-site sensor).
2. **`FORECAST`:** Represents an expected future condition output by a numerical weather prediction model for a specific forward time window.
3. **`ADVISORY`:** Represents a qualitative, categorical, or color-coded civil protection warning issued by an official meteorological authority (e.g., IMD Heat Wave Orange Alert). Advisories are not coerced into numerical scalar fields.
4. **`DERIVED`:** Represents a synthesized environmental metric computed from multiple base parameters (e.g., Heat Index calculated from ambient temperature and relative humidity).

---

## 5. Location Architecture

Weather records are linked to the operational worksite rather than mobile worker coordinates:

```text
Worksite
  ├── worksite_id: "WS-BLR-001"
  ├── latitude: 13.0827
  ├── longitude: 77.5877
  ├── timezone: "Asia/Kolkata"
  └── location_precision: "CENTROID"
```

### Architectural Principles
* **Worksite Centricity:** Industrial and construction heat risk is evaluated against the physical worksite location where shifts are scheduled.
* **Privacy by Design:** Storing unnecessary high-frequency worker GPS tracks is prohibited. Worker association occurs via workgroup shift assignments to the worksite.
* **Geospatial Consistency:** Worksite coordinates are validated against geographical range bounds and country boundaries before generating weather queries.

---

## 6. Time Model and Temporal Disambiguation

Accurate risk assessment requires absolute clarity regarding temporal milestones. The model strictly separates four distinct timestamps:

```text
Example Scenario:
  Upstream Model Run      : 08:00 UTC (forecast_generated_at)
  System API Fetch        : 08:05 UTC (retrieved_at)
  Shift Target Window     : 14:00 local / 08:30 UTC (forecast_period)
  Physical Sensor Read    : 14:02 local / 08:32 UTC (observation_time)
```

### Definitions
* **`forecast_generated_at`:** When the numerical prediction model was compiled by the meteorological organization. Indicates the age of the forecast model.
* **`retrieved_at`:** When the response payload was ingested by the platform. Governs cache invalidation and connection health.
* **`forecast_period`:** The future time slice to which the projected weather applies. Aligns with worker shift operational intervals.
* **`observation_time`:** The exact instant when an observational reading was recorded on physical instruments.

Conflating `retrieved_at` with `observation_time` or `forecast_period` is strictly prohibited by data integrity validation rules.

---

## 7. Canonical Units and Normalization Contract

All environmental values stored in a `WeatherRecord` must conform to canonical metric standards:

* **Ambient Temperature ($T_a$):** Degrees Celsius (°C).
* **Relative Humidity ($RH$):** Dimensionless percentage (%, 0.0 to 100.0).
* **Wind Velocity ($v$):** Kilometers per hour (km/h) or meters per second (m/s) as set by platform configuration.
* **Precipitation:** Millimeters of liquid water equivalent (mm).
* **Time:** UTC timestamps formatted according to ISO 8601 (`YYYY-MM-DDTHH:MM:SSZ`), stored alongside the worksite IANA timezone string.

The record's metadata preserves original units where necessary to support verification and auditability.

---

## 8. Quality and Freshness State Model

Every record undergoes automated validation and is assigned explicit quality and freshness states:

### Quality Status (`quality_status`)
* **`VALID`:** All required fields pass structural, range, and format validation rules.
* **`STALE`:** The record was previously valid, but its age exceeds the configured staleness horizon without a fresh update.
* **`MISSING`:** An expected weather record could not be retrieved from any source.
* **`INVALID`:** The received record failed range checks, contained malformed syntax, or omitted mandatory fields.
* **`UNKNOWN`:** The health of the data source cannot be determined.
* **`CONFLICTING`:** Multiple sources for the same worksite report divergent conditions exceeding safety tolerances.

### Freshness Status (`freshness_status`)
* **`FRESH`:** Retrieved within the normal operating update cadence.
* **`AGING`:** Approaching the staleness threshold; cache refresh recommended.
* **`STALE`:** Exceeded freshness limits; downstream systems must activate fallback precautions.
* **`UNKNOWN`:** Absence of retrieval metadata prevents freshness determination.

> [!CRITICAL]
> **Safety Invariants:**
> * `MISSING ≠ SAFE`
> * `UNKNOWN ≠ LOW RISK`
> * `STALE ≠ CURRENT`
> * `FORECAST ≠ OBSERVATION`
> Detailed refresh thresholds, validation gates, and fallback behaviors are specified in subsequent operational documentation.

---

## 9. Provenance and Lineage Tracking

To satisfy regulatory and legal audit standards, each `WeatherRecord` embeds an immutable provenance structure:

```json
{
  "provenance": {
    "provider": "OPEN_METEO",
    "source_type": "MODEL_FORECAST_API",
    "provider_record_id": "req_88f91a0c4",
    "endpoint_called": "v1/forecast",
    "retrieved_at": "2026-10-07T08:05:00Z",
    "provider_timestamp": "2026-10-07T08:00:00Z",
    "adapter_name": "OpenMeteoAdapter",
    "normalization_version": "1.0.0",
    "validation_rules_version": "2026.1",
    "raw_payload_checksum": "sha256:d41d8cd98f00b204e9800998ecf8427e..."
  }
}
```

Provenance records enable complete forensic reconstruction: any heat alert or operational action can be traced back to the exact API response or sensor packet that generated it.

---

## 10. Derived Environmental Values

Derived metrics (such as the Heat Index or Apparent Temperature) are explicitly differentiated from base observations:

```text
Base Environmental Readings ($T_a, RH$)
                  │
                  ▼
Deterministic Normalization Engine
                  │
                  ▼
Derived Value Generator (Rothfusz Equation)
                  │
                  ▼
Tagged Derived Attribute (heat_index)
  - calculation_source: "LOCAL_ENGINE" | "PROVIDER_SUPPLIED"
  - formula_reference: "NOAA_NWS_ROTHFUSZ_1990"
  - algorithm_version: "1.0.0"
  - calculated_at: ISO 8601 UTC
```

Derived metrics must never masquerade as physical sensor measurements. They are auxiliary indicators and remain subject to the scientific boundaries documented in [22_HEAT_INDEX_AND_LIMITATIONS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/22_HEAT_INDEX_AND_LIMITATIONS.md).

---

## 11. Forecast Series Architecture

Weather forecasts are temporal time-series rather than single scalar snapshots:

```text
ForecastSeries (Worksite WS-BLR-001)
├── forecast_generated_at: 2026-10-07T06:00:00Z
├── horizon_hours: 48
└── points:
    ├── Point 01: [period: 08:00 IST | Ta: 28.0°C | RH: 75% | quality: VALID]
    ├── Point 02: [period: 09:00 IST | Ta: 30.5°C | RH: 68% | quality: VALID]
    ├── Point 03: [period: 10:00 IST | Ta: 33.2°C | RH: 60% | quality: VALID]
    ├── Point 04: [period: 11:00 IST | Ta: 35.8°C | RH: 52% | quality: VALID]
    └── Point ...
```

### Architectural Guardrails
* **No Collapsing:** The system must never collapse a 24-hour forecast curve into a single daily average temperature when evaluating shift risk.
* **Point-Level Evaluation:** The Heat Risk Engine evaluates operational risk against the specific forecast points corresponding to the scheduled shift hours.

---

## 12. Current Weather State vs. Historical Records

The storage and access model maintains a clear distinction between the current operational state and historical logs:

```text
                 CANONICAL INGESTION
                         │
                         ▼
             LATEST_VALID_RECORD (Fast Access)
             (Current operational picture per worksite)
                         │
                         ▼
             HISTORICAL_RECORDS (Append-Only)
             (Immutable audit trail for compliance and analysis)
```

The `LATEST_VALID_RECORD` is a read-optimized projection of the most recent valid observation or forecast. It preserves pointers to the underlying immutable `WeatherRecord` in the historical store.

---

## 13. Worksite Operational Relationship

The Weather Data Model occupies a clear position within the platform's organizational hierarchy:

```text
ORGANIZATION
     │
     ▼
  WORKSITE (Physical Geography, Workgroups, Shifts)
     │
     ▼
WEATHER RECORDS (Normalized Environmental Context)
     │
     ▼
RISK ASSESSMENTS (Engine Risk Evaluation)
     │
     ▼
ACTION ITEMS (Assigned, Escalated Workplace Mitigations)
```

Weather data exists solely to provide validated environmental context to the worksite. It possesses no organizational authority on its own.

---

## 14. Heat Risk Engine Interface Contract

The Heat Risk Engine does not consume raw weather records or vendor DTOs. Instead, it accepts a strongly typed `NormalizedEnvironmentalContext`:

```json
{
  "context_type": "ENVIRONMENTAL_SNAPSHOT",
  "worksite_id": "WS-BLR-001",
  "evaluation_time": "2026-10-07T11:00:00Z",
  "temporal_nature": "FORECAST",
  "metrics": {
    "dry_bulb_temperature_c": 36.2,
    "relative_humidity_percent": 54.0,
    "wind_speed_kmh": 8.5,
    "heat_index_c": 44.8,
    "apparent_temperature_c": 43.1
  },
  "quality": {
    "data_quality_status": "VALID",
    "freshness_status": "FRESH",
    "source_discrepancy_flag": false
  },
  "provenance_summary": {
    "primary_source": "OPEN_METEO",
    "retrieved_at": "2026-10-07T10:30:00Z"
  }
}
```

This context object is combined with non-environmental worksite inputs (workload metabolic rate, direct radiant sun exposure, clothing adjustment factors, and worker acclimatization state) to perform deterministic risk evaluation.

---

## 15. Data Integrity and Validation Invariants

A record is rejected or marked `INVALID` if it violates any of the following core data integrity invariants:

1. **Known Units:** All values must have explicit, verified measurement units.
2. **Valid Temporal Range:** Timestamps must be valid ISO 8601 strings; `retrieved_at` cannot be set in the future.
3. **Valid Coordinate Bounds:** Latitude must be within $[-90.0, +90.0]$; Longitude within $[-180.0, +180.0]$.
4. **Physical Sanity Clamping:**
   * Dry-bulb temperature: $-20.0^\circ\text{C} \le T_a \le +65.0^\circ\text{C}$
   * Relative humidity: $0.0\% \le RH \le 100.0\%$
   * Wind speed: $0.0 \le v \le 250.0\text{ km/h}$
   * Precipitation: $\ge 0.0\text{ mm}$
5. **Mandatory Source Attribution:** Records lacking provider ID, source type, or retrieval timestamps are rejected.
6. **Explicit Quality State:** Records must never default to `VALID` if validation gates are skipped.

---

## 16. Illustrative Normalized Weather Record

The following example illustrates a valid normalized record within the canonical data model:

> [!NOTE]
> **ILLUSTRATIVE EXAMPLE — NOT LIVE WEATHER**
> Values below are provided strictly to illustrate schema structure and validation bindings.

```json
{
  "weather_record_id": "rec_9f81a7b2-3e4d-4a11-89c0-123456789abc",
  "worksite_id": "WS-BLR-NORTH-04",
  "source_id": "OPEN_METEO",
  "source_type": "MODEL_FORECAST_API",
  "location": {
    "type": "Point",
    "coordinates": [77.5877, 13.0827]
  },
  "latitude": 13.0827,
  "longitude": 77.5877,
  "timezone": "Asia/Kolkata",
  "data_type": "FORECAST",
  "forecast_period": "2026-10-07T08:30:00Z",
  "forecast_generated_at": "2026-10-07T06:00:00Z",
  "retrieved_at": "2026-10-07T08:05:00Z",
  "temperature": 34.2,
  "relative_humidity": 58.0,
  "wind_speed": 11.4,
  "wind_direction": 240.0,
  "precipitation": 0.0,
  "cloud_cover": 20.0,
  "heat_index": 41.5,
  "apparent_temperature": 40.2,
  "quality_status": "VALID",
  "freshness_status": "FRESH",
  "provenance": {
    "provider": "OPEN_METEO",
    "adapter": "OpenMeteoAdapter",
    "api_version": "v1",
    "requested_url_hash": "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "response_received_at": "2026-10-07T08:05:00Z"
  },
  "normalization_version": "1.0.0",
  "created_at": "2026-10-07T08:05:02Z"
}
```

---

## 17. Relationship to Future IoT and Edge Sensors

When local microclimate hardware (e.g., ESP32 nodes with DHT22 or black-globe sensors) is deployed, its telemetry passes through an IoT Adapter into the exact same canonical `WeatherRecord` model:

```text
Physical Sensor (DHT22 / ESP32)
              │
              ▼
IoT Edge Ingestion & Adapter
              │
              ▼
Normalized WeatherRecord (data_type = OBSERVATION, source_type = PHYSICAL_SENSOR)
              │
              ▼
Identical Validation Rules & Quality Engine
              │
              ▼
Identical Heat Risk Engine Input
```

This ensures zero disruption to the downstream risk engine while maintaining the rigorous boundary between physical observations and external model forecasts.

---

## 18. Security, Privacy, and Access Governance

* **Data Sensitivity:** Meteorological data is environmental and public; however, the binding of weather forecasts to specific worksite identities, workgroup sizes, and operational schedules constitutes sensitive operational information.
* **Role-Based Access Control:** Access to worksite environmental records adheres to the permissions model defined in [19_PERMISSION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/19_PERMISSION_MODEL.md).
* **Worker Privacy:** Weather records must never embed worker personal identifiable information (PII) or biometric health records.
* **Auditability:** Modifications to worksite weather source configurations or manual weather overrides are logged with immutable audit entries.

---

## 19. Schema and Normalization Versioning

To ensure backward compatibility and risk reproducibility across system updates:
* Every normalized record records a `normalization_version` (e.g., `1.0.0`).
* If unit conversion logic or calculation formulas (e.g., Heat Index approximation) are updated, the version string is incremented.
* Historical risk assessments retain references to the exact normalization version under which they were originally evaluated.

---

## 20. Design Principle

> **The Weather Data Model is the contract between external environmental data sources and the deterministic Heat Risk Engine. It standardizes source information without hiding uncertainty, provenance, forecast limitations, or data-quality problems.**
