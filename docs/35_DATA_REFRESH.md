# 35 Data Refresh Specification

## 1. Purpose

This document defines the data refresh architecture, execution cycles, freshness lifecycle, and idempotency controls for the **Heat Action Response Engine**.

Environmental conditions fluctuate continuously throughout operational work shifts. The purpose of the data refresh system is to maintain timely, validated meteorological inputs for:
* **Current Weather Monitoring:** Tracking real-time ambient conditions during active worker shifts.
* **Forecast Updates:** Ingesting new numerical weather model runs as they are published by upstream meteorological services.
* **Official Advisories:** Catching official governmental heat-wave warnings and emergency weather bulletins.
* **Future On-Site Sensors:** Ingesting high-frequency local microclimatic telemetry from edge hardware.

The refresh layer functions strictly as a data maintenance pipeline. It ensures environmental freshness and data-quality tagging before any risk reassessment or action evaluation is initiated.

---

## 2. Refresh Architecture

The conceptual architecture governing data refresh flows through a deterministic cycle:

```text
SCHEDULE / TIME TRIGGER or EVENT TRIGGER
                   │
                   ▼
            REFRESH REQUEST
                   │
                   ▼
            SOURCE ADAPTER (Open-Meteo / IMD / Sensor Adapter)
                   │
                   ▼
            FETCH / INGEST (Transport & Payload Extraction)
                   │
                   ▼
            VALIDATE (Range, Schema, Integrity Checks)
                   │
                   ▼
            STORE (Append Immutable Historical Record)
                   │
                   ▼
         UPDATE LATEST STATE (Project LATEST_VALID_RECORD)
                   │
                   ▼
TRIGGER RELEVANT PROCESSING (Evaluate Delta & Notify Risk Engine)
```

### Future Cloud Realization
In cloud-deployed architectures, this pipeline may conceptually be realized using AWS services such as Amazon EventBridge (time-based schedules), AWS Lambda (adapter execution), AWS Step Functions (orchestrated retries and state management), and Amazon DynamoDB (operational record storage). However, this document defines the conceptual mechanics; formal cloud resource configurations are deferred to [64_AWS_ARCHITECTURE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/64_AWS_ARCHITECTURE.md) and [69_EVENTBRIDGE_STEP_FUNCTIONS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/69_EVENTBRIDGE_STEP_FUNCTIONS.md).

---

## 3. Refresh Categories

Different environmental data streams operate on distinct natural cadences. The system categorizes refresh operations into four independent pipelines:

```text
                           REFRESH CATEGORIES
                                    │
       ┌─────────────────┬──────────┴──────────┬─────────────────┐
       ▼                 ▼                     ▼                 ▼
FORECAST REFRESH  CURRENT WEATHER      ADVISORY REFRESH   SENSOR REFRESH
(Model Cycles)    (Near-Current)       (Civic Bulletins)  (Edge Telemetry)
```

1. **`FORECAST_REFRESH`:**
   * *Nature:* Large payload containing multi-day hourly forecast arrays.
   * *Upstream Driver:* Global numerical weather model execution runs (typically every 3 to 6 hours).
   * *Purpose:* Forward-looking shift scheduling and preemptive hazard staging.
2. **`CURRENT_WEATHER_REFRESH`:**
   * *Nature:* Point-in-time scalar snapshot of ambient temperature, humidity, and wind.
   * *Upstream Driver:* Intermediate API queries or station updates during active shifts.
   * *Purpose:* Real-time situational awareness and mid-shift work-rest interval adjustments.
3. **`ADVISORY_REFRESH`:**
   * *Nature:* Qualitative bulletin polling (e.g., IMD daily heat-wave statements).
   * *Upstream Driver:* Official morning and mid-day meteorological press releases.
   * *Purpose:* Calibrating worksite baseline vigilance to civic emergency tiers.
4. **`SENSOR_REFRESH` (Future Extension):**
   * *Nature:* High-frequency edge telemetry stream from on-site IoT devices.
   * *Upstream Driver:* Device MQTT publication or periodic gateway push (e.g., 5 to 15-minute intervals).
   * *Purpose:* Real-time microclimate adjustment.

---

## 4. Configurable Refresh Scheduling

Refresh frequencies must never be hard-coded into application components. Refresh scheduling is configuration-driven and dynamically adapts to worksite status:

### Contextual Scheduling Factors
* **Worksite Operational State:** Active worksites with scheduled shifts undergo more frequent current weather polling than dormant or weekend sites.
* **Ambient Thermal Severity:** As temperatures approach high-risk thresholds, polling frequency can be increased within provider rate limits.
* **Provider Quotas and Rate Limits:** Query intervals must respect third-party API service limits and network cost boundaries.
* **Forecast Horizon Depth:** Extended multi-day forecasts are queried less frequently than immediate same-day forecasts.

Exact production refresh cadences are established in deployment configuration profiles rather than hard-coded into system logic.

---

## 5. Freshness State Model

Every environmental record transitions through a deterministic freshness lifecycle based on the time elapsed since its measurement or issuance:

```text
       [Retrieval]
            │
            ▼
        ┌───────┐
        │ FRESH │ ◄─── Within standard operational interval
        └───┬───┘
            │  (Approaching boundary)
            ▼
        ┌───────┐
        │ AGING │ ◄─── Valid, but refresh recommended
        └───┬───┘
            │  (Threshold exceeded)
            ▼
        ┌───────┐
        │ STALE │ ◄─── Freshness limit breached; fallback active
        └───────┘
```

### Definitions
* **`FRESH`:** The record was retrieved within the expected operational window. Downstream engines can evaluate it with standard operational confidence.
* **`AGING`:** The record is valid, but the system is nearing the end of the expected refresh cycle. Serves as a scheduling signal for the refresh manager.
* **`STALE`:** The record’s age has exceeded the maximum permissible threshold without a successful refresh. Downstream engines must flag the staleness and apply precautionary protocols.
* **`UNKNOWN`:** The record lacks valid retrieval timestamps, preventing deterministic freshness evaluation.

> [!IMPORTANT]
> The thresholds separating `FRESH`, `AGING`, and `STALE` are fully configurable per source category and worksite profile. The system does not enforce arbitrary universal numbers across diverse deployment environments.

---

## 6. Refresh Metadata Tracking

To maintain operational visibility, the system records explicit refresh tracking metadata for every worksite and source channel:

```json
{
  "refresh_tracking": {
    "worksite_id": "WS-BLR-001",
    "source_id": "OPEN_METEO",
    "channel": "CURRENT_WEATHER_REFRESH",
    "last_successful_refresh": "2026-10-07T11:00:05Z",
    "last_attempted_refresh": "2026-10-07T11:15:02Z",
    "refresh_status": "SUCCESS",
    "failure_count_consecutive": 0,
    "last_failure_reason": null,
    "active_data_timestamp": "2026-10-07T11:00:00Z",
    "next_scheduled_refresh": "2026-10-07T11:30:00Z"
  }
}
```

---

## 7. Idempotency and Deduplication Controls

Repeated or overlapping refresh operations must never introduce duplicate records or corrupt historical time-series logs:

### Idempotency Keys
For incoming records, the system computes a deterministic logical identity:
$$\text{IdempotencyKey} = \text{Hash}(\text{source\_id} + \text{worksite\_id} + \text{data\_type} + \text{forecast\_run\_id} + \text{forecast\_period})$$

### Execution Rules
1. **Identical Payloads:** If a refresh fetches a record identical to the existing record for the same operational slice, the database update is skipped or recorded as a timestamp touch without creating duplicate entities.
2. **Network Retries:** Multiple attempts of the same scheduled refresh cycle resolve to the same underlying logical transaction.
3. **Audit Log Integrity:** Append-only logs record each *ingestion event*, but operational time-series views deduplicate to the latest valid payload.

---

## 8. Bounded Retry Strategy

Network calls to external weather APIs can experience transient packet loss or service delays. The refresh layer executes bounded, observable retries:

```text
SCHEDULED REFRESH
        │
        ▼
   Attempt 1 ────► Success ────► Ingest & Update
        │ (Failure / Timeout)
        ▼
 Exponential Backoff + Jitter
        │
        ▼
   Attempt 2 ────► Success ────► Ingest & Update
        │ (Failure / Timeout)
        ▼
 Exponential Backoff + Jitter
        │
        ▼
   Attempt 3 ────► Success ────► Ingest & Update
        │ (Failure)
        ▼
 Retries Exhausted
        │
        ▼
 Emit DATA_FAILURE State & Flag Worksite as Aging/Stale
```

### Key Principles
* **Bounded Retries:** Never loop indefinitely. Retries are capped at a configured limit (e.g., 3 attempts).
* **Jittered Backoff:** Random jitter prevents synchronized "thundering herds" against provider APIs.
* **Telemetry Emission:** Every failed retry attempt is logged to observability dashboards.

---

## 9. Stale Data Behavior and Fallback Protocols

When a refresh cycle exhausts retries and fails completely:

```text
Refresh Failure Confirmed
           │
           ▼
Preserve Last Known Valid Record (Never delete or nullify prematurely)
           │
           ▼
Mark Freshness Status = STALE
           │
           ▼
Transmit Stale Signal to Heat Risk Engine
           │
           ▼
Downstream Risk Engine Actions:
  - Continues using last valid values IF within safety grace limit
  - Appends prominent STALE DATA warning flag to risk outputs
  - Precludes downgrading existing safety protections
  - Notifies site supervisor of environmental monitoring disruption
```

> [!CRITICAL]
> **Safety Invariant:** The system must never convert a stale record into a fresh one, nor assume that lack of fresh data equates to safe weather conditions.

---

## 10. Refresh and Risk Reassessment

A successful refresh of environmental data does not automatically necessitate the creation of new workplace actions:

```text
Successful Refresh (New Weather Data)
                 │
                 ▼
Validation & Normalization
                 │
                 ▼
Divergence Evaluation:
  Did temperature change significantly?
  Did risk tier boundary change (e.g., MODERATE → HIGH)?
  Did an existing active action expire?
       ╱                    ╲
   [No Change]          [Significant Change]
       │                         │
       ▼                         ▼
Update State Only        Trigger Heat Risk Engine
                         (Reassess & Update Actions)
```

To prevent notification fatigue and supervisor alert overload, the Action Engine evaluates actions using the duplicate-prevention and transition rules specified in [16_ACTION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/16_ACTION_MODEL.md).

---

## 11. Refresh Observability and Health Metrics

System reliability engineers monitor data refresh health through explicit operational telemetry:

* **Refresh Success Rate (%):** Percentage of scheduled refresh executions completing successfully.
* **Refresh Ingestion Latency (ms):** Total round-trip time from request dispatch to database commit.
* **Consecutive Failure Count:** Alert triggered if a worksite fails $N$ consecutive refreshes.
* **Worksite Staleness Ratio (%):** Percentage of active worksites currently operating on `STALE` environmental data.
* **Provider Availability Indicator:** Tracking uptime and HTTP response code distributions per external source.

These metrics indicate technical system health; they do not represent personal worker safety guarantees.

---

## 12. Manual Refresh Capabilities

Authorized operational personnel (e.g., Safety Managers or System Administrators) may initiate an on-demand manual refresh:

* **Role-Based Authorization:** Manual refresh requests must strictly validate user permissions as defined in [19_PERMISSION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/19_PERMISSION_MODEL.md).
* **Zero Validation Bypassing:** An on-demand refresh passes through the identical parsing, normalization, and validation pipeline as an automated cycle.
* **Rate-Limit Throttling:** Manual triggers are rate-limited per worksite to prevent accidental denial-of-service against provider APIs.

---

## 13. Future Event-Driven Model

As the platform scales to support distributed sensor networks and real-time webhook feeds, the refresh architecture will expand to support event-driven ingestion alongside scheduled polling:

```text
External Webhook / Edge IoT Event
               │
               ▼
   AWS EventBridge Custom Bus
               │
               ▼
   Event Ingestion Pipeline
               │
               ▼
     Validation & Normalization
               │
               ▼
   State Update & Risk Evaluation
```

---

## 14. Design Principle

> **Freshness is a data-quality property, not a guarantee that the underlying forecast or observation is correct.**
