# 37 Data Failures Specification

## 1. Purpose

This document specifies the fault-tolerance protocols, failure taxonomy, state preservation models, and operational safety boundaries for environmental data failures within the **Heat Action Response Engine**.

External weather APIs, telecommunication networks, and data storage services are inherently subject to intermittent outages, timeouts, and corrupted payloads. The core objective of the failure management architecture is to ensure that:
1. Technical data failures are handled transparently rather than silently swallowed.
2. System uncertainty is preserved and made visible to operational supervisors.
3. Environmental data ingestion outages never cause the system to assume a false "safe" or "zero-risk" default.
4. Active workplace heat mitigation actions remain enforced and auditable regardless of external provider uptime.

---

## 2. Failure Taxonomy and Classification

The system categorizes environmental data failures into fifteen specific failure modes:

| Failure Identifier | Description | Root Cause / Scope |
| :--- | :--- | :--- |
| **`SOURCE_UNAVAILABLE`** | External meteorological endpoint is unreachable or returning HTTP 5xx errors. | Upstream provider outage or maintenance. |
| **`NETWORK_FAILURE`** | Inability to establish a socket connection or resolve DNS. | Cloud egress outage, local connectivity loss, or routing failure. |
| **`TIMEOUT`** | Outbound HTTP request exceeded permissible latency threshold (e.g., >4000ms). | Network congestion or sluggish provider response. |
| **`RATE_LIMITED`** | Provider returned HTTP 429 (Too Many Requests). | Exhaustion of hourly/daily API quota or rapid concurrent queries. |
| **`AUTHENTICATION_FAILURE`** | Provider rejected credentials with HTTP 401/403. | Expired API key, invalid token, or permission revocation. |
| **`MALFORMED_RESPONSE`** | Response received but failed JSON/XML parsing or MIME decoding. | Truncated payload, upstream syntax error, or HTML error page. |
| **`MISSING_DATA`** | Expected payload was received but essential fields ($T_a, RH$) were null. | Upstream model defect or station sensor failure. |
| **`INVALID_DATA`** | Environmental values failed physical feasibility range checks ($T_a = 95^\circ\text{C}$). | Corrupted provider payload or software bug. |
| **`STALE_DATA`** | Ingested data carries timestamps older than maximum allowable refresh window. | Upstream provider caching old model runs or stalled updates. |
| **`CONFLICTING_DATA`** | Concurrent authorized sources report divergent conditions exceeding tolerance. | Differing meteorological model physics or station microclimates. |
| **`NORMALIZATION_FAILURE`** | Adapter failed to map vendor attributes to canonical schema or execute unit conversion. | Unexpected vendor schema mutation or missing unit metadata. |
| **`VALIDATION_FAILURE`** | Payload failed structural, temporal, or geospatial validation gates. | Structural payload anomaly or coordinate mismatch. |
| **`STORAGE_FAILURE`** | Database write or persistence layer failed to commit validated record. | Database throttling, disk full, or connection pool exhaustion. |
| **`PROCESSING_FAILURE`** | Unhandled exception encountered during forecast series time alignment. | Internal software defect or memory limit breach. |
| **`UNKNOWN_FAILURE`** | Unclassified runtime exception or panic during ingestion pipeline. | Anomalous runtime error. |

---

## 3. Failure Handling Pipeline

When an environmental ingestion or processing operation fails, the system executes a structured response workflow:

```text
DATA INGESTION / PROCESSING FAILURE
                 │
                 ▼
          CLASSIFY FAILURE (Map to Taxonomy Category)
                 │
                 ▼
          LOG FORENSIC EVENT (Structured Error & Worksite Context)
                 │
                 ▼
 PRESERVE LAST VALID STATE (Retain Historical Record without Overwrite)
                 │
                 ▼
 MARK DATA QUALITY STATUS (Flag as STALE, MISSING, or INVALID)
                 │
                 ▼
 RETRY (If Failure is Transient; Backoff with Jitter)
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
Retries Succeed        Retries Exhausted
     │                       │
     ▼                       ▼
Resume Normal Flow     SURFACE SYSTEM ALERT (Notify Ops & Supervisor)
```

> [!CRITICAL]
> **Safety Invariant:** A data source failure must never be interpreted as an absence of heat risk. Technical downtime is an operational uncertainty event, not a meteorological safety clearance.

---

## 4. Preservation of Last Known Good Data

To maintain operational continuity during transient outages, the platform preserves the `LAST_KNOWN_VALID_RECORD`:

```text
Active Timeline:
10:00 AM  ──► Record Ingested : Valid (34.5°C)  ──► Stored as LAST_KNOWN_VALID
10:30 AM  ──► Request Failed  : Timeout         ──► Maintain LAST_KNOWN_VALID
11:00 AM  ──► Request Failed  : HTTP 503        ──► Transition to STALE state
```

### Non-Masking Protocol
* **Original Timestamps Preserved:** The last known valid record retains its original `retrieved_at` and `observation_time` timestamps.
* **No Artificial Refresh:** The system never rewrites timestamps to make an old record appear fresh.
* **Explicit Age Indication:** Every user interface displaying last known good data must visibly display its elapsed age (e.g., *"Data age: 75 minutes — Warning: Stale"*).

---

## 5. Heat Risk Engine Behavior Under Data Failure

When critical environmental data becomes unavailable or stale:

```text
Weather Ingestion Outage
           │
           ▼
Environmental Context State = MISSING / STALE / UNKNOWN
           │
           ▼
Heat Risk Engine Fallback Evaluation:
  - If data is STALE within grace window: Compute risk, flag as STALE, inhibit de-escalation.
  - If data is MISSING or beyond grace: Risk status = UNCERTAIN / DATA_FAILURE.
  - Precautionary Rule: Existing High/Critical actions CANNOT be automatically cleared.
  - Mandatory Notification: Alert site supervisor that active monitoring is impaired.
```

The risk engine never defaults to `LOW` risk during an outage. In industrial heat safety, data unavailability requires maintaining vigilance, not relaxing precautions.

---

## 6. Bounded Retry Management

To prevent resource exhaustion while maximizing recovery from transient glitches:

* **Transient Failures (Retryable):** `NETWORK_FAILURE`, `TIMEOUT`, `SOURCE_UNAVAILABLE` (HTTP 502/503/504).
* **Permanent Failures (Non-Retryable):** `AUTHENTICATION_FAILURE` (HTTP 401/403), `MALFORMED_RESPONSE`, `INVALID_DATA`. Non-retryable errors abort immediately and trigger administrator alerts.
* **Bounded Retries:** Retry attempts are strictly capped (e.g., maximum 3 attempts) with exponential backoff and randomized jitter.
* **Circuit Breaking:** If an external provider fails across multiple worksites consecutively, outbound queries are throttled to prevent resource locks.

---

## 7. Multi-Source Failover Governance

If a primary provider fails, switching to a secondary source must adhere to strict architectural governance:

```text
Primary Provider (Open-Meteo) ──► Failure Confirmed
                                         │
                                         ▼
                             Failover Assessment
                                         │
                        Is Secondary Source Approved?
                        Are Units & Semantics Compatible?
                        Is Precedence Policy Configured?
                                ╱               ╲
                             [YES]             [NO]
                               │                 │
                               ▼                 ▼
                       Ingest Secondary    Flag MISSING
                       (Tag Provenance)   (Surface Alert)
```

### Failover Constraints
* **No Unverified Failover:** The system does not claim automatic failover between Open-Meteo and IMD until formal machine-readable IMD ingestion is verified.
* **Explicit Lineage:** If failover occurs, downstream records explicitly document the provider transition within their provenance blocks.

---

## 8. Source Conflict Resolution

When two active external providers return substantially divergent values for the same worksite:

```text
Open-Meteo : 35.0 °C  |  IMD Station : 40.5 °C  (ΔT = 5.5 °C)
                           │
                           ▼
            FLAG DATA AS CONFLICTING
                           │
                           ▼
          CONSERVATIVE SAFETY PRINCIPLE
  - Evaluate risk using the more protective value (40.5 °C)
  - Transmit discrepancy notification to Safety Manager
  - Request manual on-site temperature confirmation
```

The system never hides discrepancy by averaging the two values into an arbitrary synthetic figure ($37.75^\circ\text{C}$).

---

## 9. Storage and Persistence Failures

If internal database layers fail to persist an incoming environmental record:

* **Error Isolation:** The persistence failure is logged with complete payload forensics.
* **In-Memory Cache Guard:** The system prevents the in-memory cache from claiming a successful database commit.
* **Retry Buffer:** Transient database errors are buffered for local replay if storage recovers within acceptable time limits.
* **System Health Alert:** An elevated infrastructure alarm is emitted to cloud monitoring services.

---

## 10. Operational Action Safety During Outages

A critical safety principle of the Heat Action Response Engine is that data failures must not dismantle existing workplace protections:

```text
Active Workplace Heat Action (Mandatory Rest Break in Progress)
                           │
                           ▼
           Weather Data Ingestion Fails
                           │
                           ▼
          SAFETY ACTION REMAINS ACTIVE
  - Action is NOT cancelled or downgraded.
  - Acknowledgment timer continues to run.
  - Escalation pathway remains active.
  - Operational dashboard displays "Data Stale - Action Remains Enforced".
```

An external API failure must never excuse a supervisor from acknowledging an already-assigned life safety mitigation.

---

## 11. Notification and Escalation of System Failures

Technical failures that compromise heat safety monitoring generate dedicated operational alerts:

* **Target Audience:** Worksite Safety Supervisors, Organizational Safety Managers, and System Administrators.
* **Communication Channels:** Web dashboard banners and in-app system alerts as defined in [18_NOTIFICATION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/18_NOTIFICATION_MODEL.md).
* **Content:** Specific worksite affected, duration of data outage, current fallback posture, and recommended physical checks.

---

## 12. AI Isolation from Data Failures

Generative AI and natural language assistants are auxiliary systems. In the event of an environmental data failure:

* **No Synthetic Reconstruction:** AI models are strictly prohibited from "guessing" missing temperatures, inventing humidity values, or synthesizing plausible weather trends.
* **Safe Explanations:** If queried by a supervisor during an outage, the AI assistant explicitly states that live weather telemetry is offline and advises following manual site safety protocols.
* **Independent Safety Core:** The core deterministic risk rules and action escalation workflows operate completely independently of AI availability.

---

## 13. Forensic Failure Audit Schema

Every data failure event is committed to the immutable operational audit log:

```json
{
  "failure_audit": {
    "failure_id": "fail_9b2c34a1-8d21-4b11-9f12-abcdef123456",
    "timestamp_utc": "2026-10-07T11:15:02Z",
    "worksite_id": "WS-BLR-001",
    "pipeline_stage": "INGESTION_FETCH",
    "failure_category": "TIMEOUT",
    "source_id": "OPEN_METEO",
    "http_status": null,
    "retry_attempt": 3,
    "resolution_status": "EXHAUSTED",
    "active_fallback_state": "STALE_DATA_RETAINED",
    "error_details": "Client connection timed out after 4000ms"
  }
}
```

---

## 14. User Experience and Dashboard Transparency

When an environmental data failure occurs, operational dashboards convey clear, non-panicking, actionable status:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ WEATHER MONITORING IMPAIRED — NORTH BENGALURU SITE                  │
├────────────────────────────────────────────────────────────────────────┤
│ Status: Weather provider unreachable (Last updated 42 minutes ago)     │
│ Active Protective Posture: HIGH RISK PROTOCOL REMAINS ENFORCED         │
│ Recommended Action: Verify on-site drinking water; follow manual check │
└────────────────────────────────────────────────────────────────────────┘
```

Technical stack traces are concealed from field supervisors, while the operational safety consequences are highlighted prominently.

---

## 15. Technical Severity vs. Occupational Risk Severity

The system strictly decouples IT infrastructure severity from workplace occupational heat severity:

```text
TECHNICAL INFRASTRUCTURE SEVERITY        OCCUPATIONAL HEAT SEVERITY
- INFO     (Transient retry success)     - LOW      (Normal work conditions)
- WARNING  (Single worksite aging)       - MODERATE (Basic hydration required)
- ERROR    (Provider endpoint down)      - HIGH     (Mandatory rest/shade breaks)
- CRITICAL (Database cluster outage)     - CRITICAL (Stop heavy outdoor tasks)
```

An IT `ERROR` (weather API offline) does **not** automatically mean the worksite is in a `CRITICAL` heat crisis, nor does it mean it is `LOW`. It means environmental uncertainty is high, requiring defensive supervisory vigilance.

---

## 16. Recovery and Revalidation Pipeline

When an external provider or network connection recovers:

```text
RECOVERY DETECTED
       │
       ▼
FETCH RECOVERY PAYLOAD
       │
       ▼
FULL VALIDATION GATES (Must pass schema, range, and timestamp checks)
       │
       ▼
COMMIT VALID RECORD
       │
       ▼
CLEAR STALE / MISSING FLAGS
       │
       ▼
TRIGGER RISK REASSESSMENT & NOTIFY DASHBOARD
```

Recovered data must earn its way back into the system through standard validation gates. The system never accepts recovery payloads without full verification.

---

## 17. Design Principle

> **A data failure must remain visible as a data failure; the system must never convert uncertainty into false reassurance.**
