# 31 Open-Meteo Integration Specification

## 1. Purpose

This document specifies the integration architecture, provider boundaries, normalization protocols, and operational limitations for utilizing Open-Meteo within the **Heat Action Response Engine**.

Within the project's documentation-first architecture, the role of Open-Meteo is strictly defined:

> **Open-Meteo is used as a weather/forecast data source; it is not being treated as an occupational safety authority.**

Open-Meteo provides environmental model outputs, numerical forecasts, and reported atmospheric conditions. It possesses no domain awareness of occupational heat stress, metabolic workloads, worker acclimatization state, or workplace safety regulations. Downstream safety determinations remain the exclusive responsibility of the deterministic Heat Risk Engine and authorized human supervisors.

---

## 2. MVP Role

For the MVP baseline, Open-Meteo serves as a primary external weather and forecast data provider. Its responsibilities are scoped to supplying raw atmospheric variables for configured worksite geographical coordinates:

* **Current/Near-Current Weather:** Ambient dry-bulb temperature, relative humidity, wind speed, wind direction, and precipitation (where supplied by the provider endpoint).
* **Hourly Forecasts:** Forward-looking atmospheric projections across operational shift horizons (e.g., 24 to 72 hours).
* **Daily Forecasts:** Multi-day baseline trends for operational planning and forward heat-wave risk anticipation.
* **Documented Atmospheric Variables:**
  * Ambient air temperature ($T_a$)
  * Relative humidity ($RH$)
  * Wind speed at standard height ($v$)
  * Precipitation / precipitation probability
  * Apparent temperature / heat index (where explicitly supported or calculated)

Only variables supported by the verified Open-Meteo API configuration are utilized. The engine must not invent API fields or assume undocumented meteorological properties.

---

## 3. Integration Architecture

The flow of environmental data from Open-Meteo into the system adheres to a strict pipeline that enforces provider isolation before reaching safety evaluation:

```text
WORKSITE
   │
   ▼
LATITUDE / LONGITUDE (Geo-coordinates + Timezone)
   │
   ▼
OPEN-METEO REQUEST (HTTP/REST Query Construction)
   │
   ▼
PROVIDER RESPONSE (Raw JSON Payload)
   │
   ▼
PARSER (Extract Payload & Structure)
   │
   ▼
NORMALIZER (Transform to Standard Schema & Units)
   │
   ▼
VALIDATOR (Range, Freshness, Sanity Checks)
   │
   ▼
NORMALIZED WEATHER RECORD (Immutable Contract Entity)
   │
   ▼
RISK ENGINE (Deterministic Heat Risk Evaluation)
```

---

## 4. Provider Boundary

To protect the core domain logic from provider churn, API deprecations, or vendor lock-in, Open-Meteo integration is strictly contained behind an adapter interface:

```text
OpenMeteoAdapter
       │
       ▼
ProviderWeatherResponse (Vendor-Specific DTO)
       │
       ▼
WeatherNormalizer
       │
       ▼
NormalizedWeatherRecord (System Canonical Entity)
```

### Architectural Guardrails
1. **Zero Provider Leakage:** The Heat Risk Engine, Worksite Model, and Action Engine must never import, parse, or directly reference Open-Meteo specific response formats, HTTP status codes, or JSON schemas.
2. **Encapsulated Ingestion:** The `OpenMeteoAdapter` is responsible for handling provider authentication (if configured), HTTP connections, rate limits, transport retries, and network serialization.
3. **Pluggable Architecture:** Replacing Open-Meteo with another weather provider (or augmenting it with local IoT sensors) requires implementing an alternate adapter without altering any downstream risk assessment code.

---

## 5. Units and Normalization

Open-Meteo provides configurable unit parameters. However, the system enforces explicit unit handling during query construction and normalization:

> **The implementation must explicitly request or normalize units rather than relying on implicit assumptions.**

### Canonical Target Units
* **Temperature:** Degrees Celsius (°C)
* **Relative Humidity:** Percentage (%, 0–100)
* **Wind Speed:** Kilometers per hour (km/h) or meters per second (m/s) as configured by system standard
* **Precipitation:** Millimeters (mm)
* **Atmospheric Pressure:** Hectopascals (hPa)
* **Time:** ISO 8601 with explicit timezone offsets (`YYYY-MM-DDTHH:MM:SSZ` or `YYYY-MM-DDTHH:MM:SS+05:30`)

If Open-Meteo returns units differing from internal standards, the normalizer must execute deterministic unit conversion and log the transformation within the record's normalization metadata.

---

## 6. Time Handling and Timezone Awareness

Accurate time representation is essential for aligning weather forecasts with active worker shifts and operational schedules.

### Coordinate and Worksite Time
* Worksite records maintain an authoritative IANA timezone identifier (e.g., `Asia/Kolkata` for Indian deployments).
* Open-Meteo API requests must specify the worksite timezone or ingest UTC timestamps and convert explicitly to worksite local time.
* Timestamps must never rely on server-local system clock assumptions.

### Timestamp Distinctions
Every processed record maintains clear separation across temporal milestones:
* `retrieved_at`: UTC timestamp when the system received the payload from Open-Meteo.
* `forecast_generated_at`: Timestamp indicating when the numerical weather prediction model was initialized or generated by upstream meteorological centers.
* `forecast_period` / `observation_time`: The specific valid local operational time slice represented by the data (e.g., 14:00:00 IST on shift date).

---

## 7. Query Construction

Requests to Open-Meteo are deterministically generated from worksite location attributes and configured forecast parameters:

```text
Worksite Coordinates (Latitude, Longitude)
               +
Requested Variables (hourly=temperature_2m,relative_humidity_2m,wind_speed_10m)
               +
Forecast Horizon (e.g., forecast_days=3)
               +
Timezone (timezone=Asia/Kolkata)
               +
Provider Configuration (HTTP timeouts, API version)
               │
               ▼
Constructed Open-Meteo HTTP GET Request
```

### Constraints
* Coordinates must be validated before request dispatch (Latitude: -90.0 to 90.0; Longitude: -180.0 to 180.0).
* Hard-coded API endpoint URLs without configurable base paths are prohibited.
* Parameter sets are restricted to explicitly verified variables supported by the current adapter configuration.

---

## 8. Response Normalization

The table below outlines the conceptual mapping between Open-Meteo response elements and canonical internal fields:

| Open-Meteo Response Field | Canonical Internal Field | Canonical Unit | Normalization Rule / Status |
| :--- | :--- | :--- | :--- |
| `latitude` | `metadata.provider_latitude` | Decimal degrees | Preserved for geo-precision audit |
| `longitude` | `metadata.provider_longitude` | Decimal degrees | Preserved for geo-precision audit |
| `utc_offset_seconds` | `metadata.provider_utc_offset` | Seconds | Validated against worksite timezone |
| `current.time` / `hourly.time[i]` | `data_time` / `forecast_period` | ISO 8601 | Parsed with explicit timezone offset |
| `current.temperature_2m` | `temperature` | °C | Normalized to standard Celsius scale |
| `current.relative_humidity_2m` | `relative_humidity` | % | Validated within range [0, 100] |
| `current.apparent_temperature` | `apparent_temperature` | °C | `IMPLEMENTATION_VERIFICATION_REQUIRED` (Document source model) |
| `current.wind_speed_10m` | `wind_speed` | km/h or m/s | Normalized to canonical standard |
| `current.precipitation` | `precipitation` | mm | Verified and clamped $\ge 0.0$ |
| `current.weather_code` | `weather_condition_code` | Integer / Enum | Mapped to internal meteorological enum |

> [!NOTE]
> All fields labeled `IMPLEMENTATION_VERIFICATION_REQUIRED` require verification against the exact runtime endpoint configuration during adapter implementation to ensure schema parity.

---

## 9. Provenance and Lineage

Every normalized record derived from Open-Meteo must retain immutable provenance metadata to ensure auditability and risk reproducibility:

```json
{
  "provenance": {
    "provider": "OPEN_METEO",
    "source_type": "MODEL_FORECAST_API",
    "api_version": "v1",
    "endpoint_called": "IMPLEMENTATION_VERIFICATION_REQUIRED",
    "retrieved_at": "2026-10-07T11:30:00Z",
    "provider_generated_at": "2026-10-07T06:00:00Z",
    "worksite_id": "WS-BLR-001",
    "requested_coordinates": {
      "latitude": 13.0827,
      "longitude": 77.5877
    },
    "provider_coordinates": {
      "latitude": 13.08,
      "longitude": 77.60
    },
    "normalization_version": "1.0.0",
    "validation_status": "VALID"
  }
}
```

Provenance ensures that safety supervisors, auditors, and engineering teams can trace any generated heat action back to the exact API response that triggered the risk calculation.

---

## 10. Reliability and Resilience

External network calls to weather providers are susceptible to transient failures and environmental outages. The Open-Meteo adapter implements defensive fault-tolerance patterns:

### Failure Scenarios and Mitigations
1. **Network Connectivity Loss / DNS Failure:**
   * Retry with exponential backoff and jitter up to configured retry limit.
   * If retries are exhausted, emit operational alert and mark data state as `STALE` (if within staleness window) or `MISSING`.
2. **HTTP Timeouts:**
   * Enforce aggressive connection and read timeouts (e.g., 3000ms–5000ms).
   * Fall back to cached records if valid; never block risk engine execution indefinitely.
3. **Rate Limiting (HTTP 429):**
   * Detect rate-limit headers; throttle subsequent requests across all worksites.
   * Log critical telemetry for capacity planning.
4. **Malformed JSON / Schema Shift:**
   * Reject payload; do not attempt partial or speculative parsing.
   * Flag record as `INVALID`; notify system administrators.
5. **Missing Variables:**
   * If mandatory variables ($T_a$, $RH$) are null, mark record as `INVALID` or `MISSING`.
   * Never synthesize or interpolate missing values with arbitrary numbers.

> [!IMPORTANT]
> The engine does not assume unsupported service level agreements (SLAs) or guaranteed high availability from free or third-party Open-Meteo tiers. Resilience is achieved through local caching and explicit fallback policies.

---

## 11. Caching Strategy and Staleness Guardrails

To prevent redundant API queries, respect rate limits, and ensure high responsiveness, worksite weather queries utilize a caching layer:

```text
Worksite Weather Request
           │
           ▼
     Cache Lookup
     ╱          ╲
Fresh Data    Stale / Missing Data
   │                     │
   ▼                     ▼
Return Record     Dispatch Open-Meteo Request
                         │
                  Success / Failure Evaluation
                         │
                  Update Cache & Return Record
```

### Safety Rules for Caching
* **Explicit TTL:** Cached records maintain an explicit Time-To-Live (TTL) based on data category (e.g., current conditions vs. hourly forecast).
* **No Anti-Staleness Masking:** Caching must never alter the underlying `retrieved_at` or `observation_time` timestamps.
* **Audit Transparency:** Downstream consumers must always be informed whether a record was served directly from cache or freshly retrieved.
* **Safety Invariant:** Caching must not cause safety-critical data to appear fresher than it physically is.

---

## 12. Open-Meteo Limitations in Occupational Settings

While Open-Meteo is a powerful, flexible meteorological data aggregator, it possesses inherent technical limitations when applied to industrial safety:

1. **Spatial Resolution Limits:** Open-Meteo uses global and regional numerical weather prediction models (e.g., GFS, ECMWF, ICON). Grid resolution typically varies from 2 km to 25 km. A worksite experiencing a severe localized urban heat island or microclimate anomaly may differ from the grid cell center.
2. **Temporal Resolution Limits:** Numerical forecast cycles update at discrete intervals (typically every 1 to 6 hours). Rapid microclimatic temperature spikes between forecast model runs will not appear until the next upstream model generation.
3. **Lack of Physical On-Site Telemetry:** Model outputs represent standard meteorological exposure (open terrain, 2 meters height, ventilated shelter). They do not measure physical conditions inside an unventilated steel warehouse, an asphalt paving trench, or direct radiant exposure from industrial machinery.
4. **Upstream Model Dependencies:** Open-Meteo aggregates external public weather models; downstream accuracy depends on the fidelity of those underlying models.

---

## 13. Heat Index and Derived Metrics

If apparent temperature or heat index metrics are provided by Open-Meteo or computed locally from Open-Meteo raw variables:

* **Source Transparency:** The system must record whether the metric was supplied directly by the provider (`PROVIDER_SUPPLIED`) or calculated by the internal normalizer (`INTERNALLY_COMPUTED`).
* **Formula Documentation:** Internal calculations must follow documented, deterministic formulas (e.g., NOAA/Rothfusz heat index equations) as detailed in [22_HEAT_INDEX_AND_LIMITATIONS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/22_HEAT_INDEX_AND_LIMITATIONS.md).
* **Non-Exclusivity:** Derived heat index values serve as secondary environmental inputs. They do not substitute for holistic heat risk analysis incorporating metabolic workload, direct sun exposure, and clothing adjustment factors.

---

## 14. Illustrative Worksite Integration Example

The following configuration demonstrates conceptual binding for a worksite deployment:

```yaml
worksite_profile:
  worksite_id: "WS-BLR-NORTH-04"
  name: "North Bengaluru Construction Site"
  location:
    latitude: 13.0827
    longitude: 77.5877
    timezone: "Asia/Kolkata"
  primary_weather_source:
    provider: "OPEN_METEO"
    endpoint_mode: "HOURLY_AND_CURRENT"
    requested_variables:
      - "temperature_2m"
      - "relative_humidity_2m"
      - "wind_speed_10m"
      - "precipitation"
    forecast_horizon_hours: 48
  safety_role:
    purpose: "Provide verified environmental inputs to the deterministic Heat Risk Engine."
    authority: "DATA_SOURCE_ONLY (Not authorized to establish workplace safety rules)"
```

*(Note: Coordinate and configuration values are illustrative for operational design.)*

---

## 15. Security and Configuration

* **Credential Management:** If using Open-Meteo commercial tiers or endpoints requiring API keys, credentials must be stored strictly within environment variables or secret vaults. No secrets may ever be committed to the repository or logged in plaintext. Refer to [84_SECRETS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/84_SECRETS.md) (when established).
* **HTTPS Transport:** All external HTTP requests to Open-Meteo must enforce TLS/HTTPS encryption with strict certificate validation.
* **Network Egress Controls:** Outbound requests should be restricted to verified provider domains.

---

## 16. Integration Testing Suite

The Open-Meteo adapter must pass comprehensive deterministic automated test suites:

* **Test Case 1: Valid Response Ingestion:** Verify correct parsing, unit conversion, and provenance tagging from standard fixture payloads.
* **Test Case 2: Coordinate Boundary Validation:** Verify rejection of invalid latitudes (>90, <-90) and longitudes (>180, <-180).
* **Test Case 3: HTTP Timeout Resilience:** Verify graceful fallback and `STALE`/`MISSING` tagging when requests exceed timeout limits.
* **Test Case 4: HTTP 429 Rate Limiting:** Verify throttling behavior and backoff activation upon receipt of 429 responses.
* **Test Case 5: Malformed JSON Payloads:** Verify immediate parsing error handling and rejection without corrupted state storage.
* **Test Case 6: Missing Critical Variables:** Verify that records missing ambient temperature or relative humidity are marked `INVALID`.
* **Test Case 7: Unit Conversion Accuracy:** Verify mathematical accuracy of temperature, wind speed, and precipitation normalizations.
* **Test Case 8: Timezone Offsets:** Verify that timestamps properly reflect worksite local operational time (`Asia/Kolkata`) without UTC drift.
* **Test Case 9: Extreme Value Clamping:** Verify handling of anomalous data (e.g., $T_a = 95^\circ\text{C}$ or $RH = 120\%$) via validation rules.

---

## 17. Source Governance

Open-Meteo is an external information supplier. It operates under the governance rules established across the platform's safety architecture:

* Domain reference criteria: [29_DOMAIN_REFERENCES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/29_DOMAIN_REFERENCES.md)
* Safety guardrails and override controls: [28_SAFETY_GUARDRAILS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/28_SAFETY_GUARDRAILS.md)
* Deterministic risk logic: [27_RISK_RULES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/27_RISK_RULES.md)

---

## 18. Design Principle

> **Open-Meteo supplies environmental weather information; it does not determine workplace safety policy.**
