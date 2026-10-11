# Data Architecture — Heat Action Response Engine MVP

## 1. Purpose

This document defines the overarching **Weather and Environmental Data Architecture** for the **Heat Action Response Engine**.

The primary mission of the data architecture is to provide **validated, traceable, and normalized environmental information** to the deterministic Heat Risk Engine. Without clean and dependable environmental inputs, downstream risk evaluations, preventive action generation, and automated escalation timers cannot operate reliably.

The data layer supports six critical operational requirements:
* **Worksite Environmental Monitoring:** Ingesting atmospheric conditions for registered geographic coordinates.
* **Forecast Horizon Evaluation:** Ingesting multi-hour forward forecasts to enable proactive operational scheduling.
* **Deterministic Risk Engine Inputs:** Delivering normalized temperature, humidity, wind, and solar metrics to the rule evaluation pipeline.
* **Operational Action Generation:** Providing the objective environmental basis for work-rest schedules and hydration quotas.
* **Executive & Field Dashboard Telemetry:** Rendering live and forecast trends across Safety Manager and Supervisor interfaces.
* **Regulatory & Incident Auditability:** Maintaining immutable provenance that links every generated action directive back to the exact weather snapshot that triggered it.

---

## 2. High-Level Data Architecture

The data architecture enforces a strict layered processing pipeline that decouples external meteorological providers from internal safety logic:

```text
                 WEATHER / DATA SOURCES
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Open-Meteo         IMD       Future Sensors
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  INGESTION LAYER
                         ↓
                 NORMALIZATION LAYER
                         ↓
                  VALIDATION LAYER
                         ↓
                PROVENANCE / METADATA
                         ↓
                 WEATHER DATA STORE
                         ↓
                RISK ENGINE INPUT
                         ↓
               HEAT RISK ENGINE
                         ↓
                ACTION ENGINE
```

### Layer Responsibilities:
1. **Weather / Data Sources:** External meteorological APIs (e.g., Open-Meteo, IMD) providing atmospheric model forecasts and regional observations.
2. **Ingestion Layer:** Manages scheduled polling jobs, manual on-demand refreshes, connection retries, and network error handling.
3. **Normalization Layer:** Transforms diverse third-party payload formats into an internal standardized schema with unified units and standardized timestamp semantics.
4. **Validation Layer:** Enforces physical boundary checks (e.g., temperature and humidity sanity limits) and evaluates data freshness.
5. **Provenance & Metadata Layer:** Binds source provider tags, API query parameters, retrieval timestamps, and normalization version strings to the record.
6. **Weather Data Store:** Persists normalized observations and forecast series for real-time querying and historical audit reconstruction.
7. **Risk Engine Input Interface:** Exposes clean environmental context payloads to the deterministic Heat Risk Engine.
8. **Heat Risk Engine & Action Engine:** Downstream domain core evaluating versioned safety rules and generating preventive workplace directives.

---

## 3. Source Abstraction Architecture

To ensure the platform never becomes tightly coupled to a single third-party meteorological vendor, the architecture defines a strict **Source Abstraction Pattern**:

```text
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   Open-Meteo Adapter    │     │       IMD Adapter       │     │  Future Sensor Adapter  │
└────────────┬────────────┘     └────────────┬────────────┘     └────────────┬────────────┘
             │                               │                               │
             └───────────────────────┬───────┴───────────────────────────────┘
                                     │ (Emits Raw Provider Payloads)
                                     ▼
                     ┌───────────────────────────────┐
                     │   WeatherNormalizer Service   │
                     └───────────────┬───────────────┘
                                     │ (Emits Normalized Entities)
                                     ▼
                     ┌───────────────────────────────┐
                     │    NormalizedWeatherRecord    │
                     └───────────────┬───────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │     Heat Risk Engine Core     │
                     └───────────────────────────────┘
```

The Heat Risk Engine consumes exclusively the internal `NormalizedWeatherRecord` entity. Provider-specific JSON structures, custom field names, and external schema quirks are completely isolated within dedicated source adapters.

---

## 4. End-to-End Data Pipeline

The environmental data processing lifecycle progresses through nine sequential pipeline stages:

```text
DISCOVER ──> REQUEST ──> RECEIVE ──> PARSE ──> NORMALIZE ──> VALIDATE ──> PROVENANCE ──> STORE ──> EXPOSE
```

| Pipeline Stage | Purpose | Expected Inputs | Expected Outputs | Handled Failure Conditions |
| :--- | :--- | :--- | :--- | :--- |
| **1. DISCOVER** | Identify active worksites requiring weather updates | Active worksite registry | Target GPS coordinates & timezones | Worksite unconfigured or archived (skipped) |
| **2. REQUEST** | Query external meteorological provider | Worksite GPS, query parameters | Outbound HTTP request | Network timeout, DNS failure, connection reset |
| **3. RECEIVE** | Capture raw external payload | External HTTP response | Raw JSON / XML string | HTTP 4xx (client error), 5xx (server error), rate limit |
| **4. PARSE** | Deserialize payload into provider schema | Raw text string | Provider-specific data object | Malformed JSON, corrupted payload, syntax error |
| **5. NORMALIZE** | Map third-party fields to standard schema | Provider data object | Internal normalized record | Missing mandatory variables, unexpected units |
| **6. VALIDATE** | Execute boundary checks & freshness verification | Normalized record | Validated record + quality flag | Physical boundary breach, negative humidity, stale data |
| **7. PROVENANCE**| Bind audit tags, query coordinates, & timestamps | Validated record | Sealed provenance metadata | Missing query parameters, unrecorded retrieval time |
| **8. STORE** | Persist to historical and latest state tables | Sealed record | Database persistence confirmation | Database connection drop, transaction failure |
| **9. EXPOSE** | Deliver clean environmental context to Risk Engine | Worksite ID + active timestamp | Risk Engine input payload | Incompatible schema, missing active shift context |

---

## 5. Environmental Data Categories

The data architecture categorizes environmental telemetry into four discrete types:

### 5.1 Current & Near-Current Meteorological Data
* **Dry-Bulb Temperature ($T_a$):** Ambient air temperature measured in degrees Celsius (°C).
* **Relative Humidity ($RH$):** Water vapor percentage relative to saturation (0–100%).
* **Wind Speed & Direction:** Air velocity measured in kilometers per hour ($km/h$) or meters per second ($m/s$).
* **Precipitation:** Precipitation rate in millimeters per hour ($mm/h$).
* **Cloud Cover:** Percentage of celestial dome covered by clouds (0–100%), serving as a proxy for direct solar radiance attenuation.

### 5.2 Forecast Data Series
* **Hourly Forecast Series:** Sequential hourly predictions of temperature, humidity, wind, and precipitation covering a forward horizon (e.g., 24 to 72 hours).
* **Daily Summary Forecasts:** Predicted diurnal maximum and minimum temperatures, peak heat index windows, and probability of precipitation.
* **Forecast Horizon Tags:** Explicit identification of the target forecast time interval versus the time the forecast model was initialized.

### 5.3 Derived Environmental Indicators
* **Calculated Heat Index:** Mathematical apparent temperature computed using approved biometeorological algorithms (e.g., NWS Rothfusz regression).
* **Apparent Temperature:** Temperature adjusted for wind chill or humidity resistance where supported.
* *Integrity Rule:* Derived indicators are explicitly flagged as `DERIVED` and permanently document the underlying mathematical formula and calculation timestamp.

### 5.4 Ingestion Provenance & Metadata
* External source provider identifier (e.g., `OPEN_METEO`, `IMD_OFFICIAL`).
* API endpoint URL / query string (sanitized of private credentials).
* Retrieval UTC timestamp ($T_{\text{retrieved}}$).
* Meteorological observation UTC timestamp ($T_{\text{observed}}$) or forecast horizon timestamp ($T_{\text{forecast}}$).
* Normalization schema version string.
* Data quality status code (`VALID`, `STALE`, `MISSING`, `INVALID`, `UNKNOWN`, `CONFLICTING`).

---

## 6. Worksite Location Architecture

Weather data is mapped to operational worksites through geographic coordinates:

```text
                     WORKSITE LOCATION MAPPING
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
    LATITUDE                LONGITUDE               TIMEZONE
(Decimal Degrees)       (Decimal Degrees)       (IANA Identifier)
 13.082700 N             77.587700 E             Asia/Kolkata
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                    METEOROLOGICAL QUERY
            (Nearest Grid Interpolation Point)
                                │
                                ▼
                     NORMALIZED WEATHER RECORD
                    (Associated with worksite_id)
```

### Spatial Requirements & Privacy Boundaries:
1. **Sub-Meter Precision:** Coordinates are stored in decimal degrees with six decimal places, providing sub-meter precision for physical job site mapping.
2. **Worksite-Level Association:** Environmental data is associated with the **physical worksite profile** (`worksite_id`), never with individual workers.
3. **No Worker Geolocation:** The platform strictly prohibits collecting, querying, or storing real-time GPS coordinates of individual workers.
4. **Lifecycle Sensitivity:** When a worksite enters `PAUSED` or `ARCHIVED` status, scheduled meteorological polling jobs automatically suspend.

---

## 7. Storage Architecture

The storage architecture is organized conceptually across four functional tiers:

```text
┌─────────────────────────────────┐
│     RAW SOURCE DATA STORE       │  Immutable audit archive of raw JSON responses
│     (Provider Payloads)         │  from third-party APIs for forensic review.
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│    NORMALIZED WEATHER STORE     │  Normalized, validated weather records with
│    (Structured Event Records)   │  full provenance metadata and quality tags.
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      LATEST WEATHER STATE       │  High-speed cache/view of the most recent valid
│      (Current Worksite State)   │  reading for active dashboard rendering.
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│   HISTORICAL FORECAST STORE     │  Historical time-series enabling post-shift
│   (Compliance & Incident Logs)  │  incident analysis and model validation.
└─────────────────────────────────┘
```

*Note: Specific physical database engine selections (e.g., PostgreSQL, TimescaleDB, Amazon DynamoDB, or S3) are specified in separate backend implementation documentation.*

---

## 8. Data Provenance and Traceability

Every environmental record maintains an unbroken chain of custody:

```text
{
  "provenance_metadata": {
    "source_id": "src-open-meteo-v1",
    "provider_name": "OPEN_METEO",
    "source_type": "METEOROLOGICAL_GRID_API",
    "query_coordinates": { "latitude": 13.082700, "longitude": 77.587700 },
    "request_timestamp": "2026-10-07T11:45:01Z",
    "provider_data_timestamp": "2026-10-07T11:30:00Z",
    "normalization_version": "v1.0.0",
    "validation_status": "PASSED",
    "data_quality_tier": "VALID"
  }
}
```

Provenance tracking ensures that during post-incident safety investigations, compliance auditors can inspect the exact raw meteorological data that led to a specific preventive work-rest directive.

---

## 9. Forecast Data vs. Observed Data vs. Sensor Data

To eliminate ambiguity, the platform enforces strict semantic distinctions across three data types:

| Architectural Dimension | Forecast Data | Observed Meteorological Data | Physical On-Site Sensor Data (Future) |
| :--- | :--- | :--- | :--- |
| **Physical Meaning** | Mathematical projection of expected future atmospheric conditions | Recorded meteorological reading from regional weather station network | Direct physical measurement from hardware deployed on the job site |
| **Primary Uncertainty**| Atmospheric model drift, spatial interpolation, convective storm variance | Regional grid interpolation variance; distance from physical station | Sensor calibration drift, hardware battery life, local environmental fouling |
| **Operational Role** | Proactive work planning, pre-shift crew scheduling, morning briefings | Real-time operational risk assessment, triggering active work-rest directives | Microclimate refinement, direct black-globe radiant heat verification |
| **MVP Status** | **Core MVP Requirement** | **Core MVP Requirement** | **Future Architectural Extension** |

---

## 10. Data Freshness and Staleness Lifecycle

Environmental heat conditions can change rapidly during summer heat waves. The platform manages data freshness dynamically:

```text
       INGESTION EVENT (Retrieved at T_0)
                      │
                      ▼
   FRESH / VALID: Elapsed Time < 60 minutes
   (Normal risk calculation & automated action generation active)
                      │
                      ▼
   AGING / WARNING: Elapsed Time 60–120 minutes
   (Visual yellow badge; on-demand polling refresh triggered)
                      │
                      ▼
   STALE / DEGRADED: Elapsed Time > 120 minutes
   (Automated action generation suspended; UNKNOWN risk tier assigned)
```

Staleness criteria are evaluated against organizational policy configurations; missing or stale data **never** silently defaults to a "Safe" assumption.

---

## 11. Data Quality States

Every normalized record is tagged with an explicit data quality status code:

* **`VALID`:** All required variables present, within physical boundaries, and fresh ($< 60$ min). Normal processing proceeds.
* **`STALE`:** Ingestion is overdue ($> 60$ min). System flags data as degraded and surfaces dashboard warnings.
* **`MISSING`:** API query returned null or external service is unreachable. Evaluates to `UNKNOWN` risk tier.
* **`INVALID`:** Telemetry violates physical boundaries (e.g., relative humidity $> 100\%$, ambient temperature $> 65^\circ\text{C}$). Record rejected.
* **`UNKNOWN`:** Incomplete contextual or meteorological data prevents safety evaluation. Prompts managerial review.
* **`CONFLICTING`:** Observations from overlapping providers diverge beyond plausibility thresholds. Flagged for review.

### Absolute Safety Imperatives:
$$\text{MISSING DATA } \neq \text{ SAFE CONDITIONS} \quad\Big|\quad \text{UNKNOWN DATA } \neq \text{ LOW RISK}$$
$$\text{STALE DATA } \neq \text{ CURRENT OBSERVATION} \quad\Big|\quad \text{FORECAST DATA } \neq \text{ SENSOR MEASUREMENT}$$

---

## 12. Boundary with the Heat Risk Engine

The data architecture enforces a strict functional separation from the risk-decision core:

```text
DATA ARCHITECTURE LAYER
• Ingests external API payloads
• Normalizes units and timestamps
• Validates boundary limits
• Binds provenance metadata
• Output: Normalized Environmental Context
              │
              ▼ (Strict Interface Boundary)
HEAT RISK ENGINE LAYER
• Evaluates deterministic safety rules
• Combines environmental metrics with worksite workload
• Classifies operational risk tier (LOW, MODERATE, HIGH, CRITICAL)
• Generates preventive action directives
```

The weather and data layer **never** evaluates risk rules, assigns risk levels, or generates action directives. It is an input provider to the safety engine.

---

## 13. Artificial Intelligence Governance Boundaries

Artificial intelligence microservices operate under strict architectural isolation relative to the data layer:

* **AI Cannot Alter Telemetry:** Generative AI models are strictly prohibited from modifying, interpolating, smoothing, or overriding raw or normalized weather telemetry.
* **AI Cannot Fill Missing Data:** If meteorological data is missing, AI must **never** hallucinate or synthesize estimated temperatures.
* **AI Cannot Alter Provenance:** Timestamps, provider IDs, and validation flags are immutable system attributes.
* **Permitted AI Functions:** Summarizing multi-day forecast trends, translating weather warnings into vernacular languages, and answering grounded queries regarding currently displayed weather values.

---

## 14. Future IoT Hardware Extension Architecture

The data architecture is engineered to accommodate future physical on-site sensors without altering the downstream risk or action engines:

```text
                     CURRENT MVP ARCHITECTURE
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
   Open-Meteo                                          IMD
        │                                               │
        └───────────────────────┬───────────────────────┘
                                ▼
                       Weather Data Layer
                                │
                                ▼
                         Heat Risk Engine


                    FUTURE EXTENSION ARCHITECTURE
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Open-Meteo                  IMD             Physical IoT Sensors
                                                (ESP32 / LoRaWAN)
                                                        │
                                                        ▼
                                                  IoT Gateway
                                                        │
        ┌───────────────────────────────────────────────┘
        ▼
   Same Normalization Layer (Emits NormalizedWeatherRecord)
        │
        ▼
   Same Validation Layer
        │
        ▼
   Same Deterministic Heat Risk Engine Core
```

By standardizing on the `NormalizedWeatherRecord` contract, adding on-site black-globe thermometers or anemometers in future phases requires only writing an IoT source adapter; the core safety and escalation logic remains untouched.

---

## 15. Architectural Principles

1. **Source Independence:** The platform is never beholden to a single third-party weather API.
2. **Provenance First:** Every environmental reading retains complete historical custody and query context.
3. **Normalize Before Evaluating:** Third-party data structures are converted to standard internal entities before safety logic executes.
4. **Validate Before Use:** Out-of-bounds readings and stale feeds are caught and flagged before reaching the risk engine.
5. **Forecast $\neq$ Observation:** Predictive models are never confused with current observations or physical sensors.
6. **Missing Data Must Be Visible:** Failsafes elevate missing telemetry to human supervisors rather than assuming safe conditions.
7. **Strict Risk Engine Boundaries:** The data layer delivers validated environmental inputs; it never decides safety policy.
8. **AI Subordination:** Generative AI features cannot mutate, hallucinate, or alter authoritative environmental telemetry.
9. **Immutable Auditability:** Ingested snapshots and timestamps are preserved in append-only ledgers for regulatory review.
10. **Hardware-Ready Extensibility:** The normalized interface cleanly accommodates future physical IoT sensors without refactoring downstream workflows.

---

## 16. Design Principle

> **The data architecture exists to deliver trustworthy, traceable environmental inputs to the risk engine; it is not itself the safety decision-maker.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
