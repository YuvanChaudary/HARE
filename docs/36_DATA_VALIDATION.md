# 36 Data Validation Specification

## 1. Purpose

This document defines the validation gates, integrity verification rules, and quality classification logic for all environmental data entering the **Heat Action Response Engine**.

The validation layer serves as the primary defensive barrier protecting the deterministic Heat Risk Engine from corrupted, malformed, physically impossible, or deceptive external inputs.

### Core Architecture Rule
Validation must execute **before** any environmental data point is stored in operational tables or passed to the Heat Risk Engine. The risk engine assumes that any input it receives has already been evaluated against formal validation gates and tagged with an explicit data quality status.

---

## 2. Validation Pipeline

Every raw payload and parsed record passes through a sequential validation pipeline before being admitted to the canonical data store:

```text
RAW INGESTED DATA
        │
        ▼
   SCHEMA CHECK (JSON Schema / Payload Structure)
        │
        ▼
    TYPE CHECK (Field Types: Float, Integer, String, ISO 8601)
        │
        ▼
    UNIT CHECK (Explicit Units: °C, %, km/h, mm)
        │
        ▼
   RANGE CHECK (Physical Feasibility Clamping)
        │
        ▼
 TIMESTAMP CHECK (Temporal Ordering & Formatting)
        │
        ▼
 LOCATION CHECK (Latitude, Longitude, Worksite Bounds)
        │
        ▼
  SOURCE CHECK (Provider Authenticity & Known Adapters)
        │
        ▼
CONSISTENCY CHECK (Cross-Field Thermodynamic Sanity)
        │
        ▼
 FRESHNESS CHECK (Age vs. Permissible Thresholds)
        │
        ▼
ASSIGN QUALITY STATUS (VALID, STALE, MISSING, INVALID, UNKNOWN, CONFLICTING)
```

If a record fails an early validation stage, subsequent processing is halted, the failure is logged, and the record is routed to a quarantine/rejection state.

---

## 3. Validation Categories and Gate Definitions

The validation engine evaluates incoming environmental records across seven distinct operational dimensions:

### 3.1 Structural Validation
* **Schema Integrity:** Validates that incoming JSON/tabular structures match expected provider schemas.
* **Mandatory Field Presence:** Confirms the presence of non-nullable attributes (e.g., `temperature`, `relative_humidity`, `retrieved_at`, `worksite_id`).
* **Data Types:** Enforces strict typing; rejects unexpected strings, nulls, or scientific notation overflows in scalar fields.

### 3.2 Semantic Validation
* **Physical Plausibility:** Confirms that reported environmental values represent physically plausible atmospheric conditions on Earth.
* **Unit Compatibility:** Enforces that values match declared unit systems without ambiguous scaling factors.
* **Sensible Metric Relationships:** Validates that apparent temperature or heat index metrics align logically with base temperatures.

### 3.3 Geospatial Validation
* **Coordinate Bounds:** Rejects latitudes outside $[-90.0, +90.0]$ and longitudes outside $[-180.0, +180.0]$.
* **Worksite Proximity:** For physical station or sensor reports, verifies that the coordinates fall within an acceptable radius of the configured worksite centroid.

### 3.4 Temporal Validation
* **Valid Formatting:** Ensures all timestamps parse as valid ISO 8601 UTC strings.
* **Temporal Sequence:** Rejects records where `forecast_period` is earlier than `forecast_generated_at`, or where `retrieved_at` is set in the future relative to system clocks.
* **Horizon Validity:** Confirms that forecast time slices do not exceed configured planning boundaries (e.g., >168 hours into the future).

### 3.5 Source Validation
* **Recognized Origin:** Rejects records lacking an accredited provider identifier (`OPEN_METEO`, `IMD`, `IOT_EDGE`, `SIMULATION`).
* **Provenance Attestation:** Confirms that provider identifiers, adapter versions, and transport metadata are present.

### 3.6 Freshness Validation
* **Age Calculation:** Computes the elapsed duration between record generation/measurement and the current operational moment.
* **Threshold Comparison:** Evaluates whether the record falls within `FRESH`, `AGING`, or `STALE` boundaries.

### 3.7 Cross-Field Consistency Validation
* **Thermodynamic Sanity:** For example, relative humidity must be mathematically bounded between 0% and 100%.
* **Derived Input Alignment:** If a record includes a pre-computed Heat Index, the system verifies that the underlying ambient temperature and humidity fields are present and compatible with the calculation formula.

---

## 4. Data Quality States

Upon completing the pipeline, every record is assigned one of six mutually exclusive quality states:

```text
                        QUALITY STATUS
                               │
   ┌───────────┬───────────────┼───────────────┬───────────┐
   ▼           ▼               ▼               ▼           ▼
 VALID       STALE          MISSING         INVALID     CONFLICTING
(Trusted) (Expired Age)  (Unavailable)    (Malformed)  (Divergent)
                               │
                               ▼
                            UNKNOWN
                     (Unverified State)
```

| Quality Status | Operational Definition | Safety Implications |
| :--- | :--- | :--- |
| **`VALID`** | Passed all structural, range, temporal, and consistency checks within freshness limits. | Trusted input for standard deterministic risk evaluation. |
| **`STALE`** | Structurally and semantically valid, but age exceeds the permissible refresh window. | Retained for continuity, but flagged; safety protections cannot be downgraded based on stale data. |
| **`MISSING`** | Expected environmental record could not be retrieved due to provider outage or network loss. | `MISSING ≠ SAFE`. Triggers administrative alert and activates fallback precautionary rules. |
| **`INVALID`** | Failed range, schema, or type checks (e.g., corrupted payload or impossible value). | Quarantined immediately. Never passed to the risk engine as numerical input. |
| **`UNKNOWN`** | Health, origin, or lineage cannot be verified with certainty. | Treated with high skepticism; risk engine applies conservative assumptions. |
| **`CONFLICTING`** | Multiple active providers report divergent conditions exceeding safety tolerances. | Flagged on dashboards; triggers conservative safety bias and prompts human supervisory review. |

---

## 5. Physical Range Checks

The system implements strict bounding gates to detect corrupted sensors, parsing errors, or telecommunication glitches:

```text
               PHYSICAL PLAUSIBILITY BOUNDARIES
┌─────────────────────────────────────────────────────────────┐
│ Dry-Bulb Temperature ($T_a$)    : -20.0 °C  to  +65.0 °C    │
│ Relative Humidity ($RH$)        :    0.0 %  to  100.0 %     │
│ Wind Speed ($v$)                :    0.0    to  250.0 km/h  │
│ Precipitation                   :   ≥ 0.0 mm                │
│ Solar / Cloud Cover             :    0.0 %  to  100.0 %     │
└─────────────────────────────────────────────────────────────┘
```

### Safety Principles for Range Bounding
* **Physical Impossibility vs. Safety Rules:** Physical range checks reject impossible atmospheric numbers (e.g., $95^\circ\text{C}$ ambient air). They must never be confused with occupational heat safety thresholds (e.g., $32^\circ\text{C}$ triggers work-rest cycles).
* **Documented Bounds:** Range limits are explicitly documented and version-controlled.
* **Zero Speculative Clamping:** If an incoming temperature is $85^\circ\text{C}$, the validator does **not** clamp it down to $65^\circ\text{C}$ to "save" the record. It rejects the entire record as `INVALID`.

---

## 6. Unit Validation and Standard Scaling

Misinterpreting units can cause catastrophic safety miscalculations (e.g., confusing Fahrenheit with Celsius):

### Rules
1. **Explicit Metadata:** Every provider adapter must output explicit canonical units.
2. **Ambiguity Rejection:** If an external feed fails to declare its unit system and cannot be guaranteed by verified adapter configuration, the record is rejected as `INVALID`.
3. **No Dynamic Guessing:** The normalizer must never guess units based on numerical magnitude (e.g., guessing that 104 must be Fahrenheit).

---

## 7. Timestamp Validation and Temporal Ordering

Timestamps must undergo rigorous logical verification:

$$\text{forecast\_generated\_at} \le \text{retrieved\_at} \le \text{current\_time} + \text{ClockTolerance}$$

$$\text{forecast\_generated\_at} < \text{forecast\_period}$$

Any violation of temporal sequence—such as a forecast claiming to predict conditions prior to its own generation time—indicates corrupted feed metadata and results in immediate rejection.

---

## 8. Logical Deduplication

To prevent duplicate records from inflating audit tables during API retry bursts, the validator enforces logical deduplication:

* **Natural Composite Key:** $\langle\text{source\_id}, \text{worksite\_id}, \text{data\_type}, \text{forecast\_run\_id}, \text{forecast\_period}\rangle$
* **Duplicate Action:** If an exact composite key already exists with identical checksums, the validator rejects the redundant write and acknowledges the transaction as idempotent.

---

## 9. Conflicting Source Handling

When multiple approved sources supply concurrent data for the same worksite (e.g., Open-Meteo numerical forecast vs. IMD regional station):

$$\Delta T = |T_{\text{Open-Meteo}} - T_{\text{IMD}}|$$

* **Within Tolerance ($\Delta T \le 2.5^\circ\text{C}$):** Both records are validated; system follows documented source hierarchy.
* **Exceeds Tolerance ($\Delta T > 2.5^\circ\text{C}$):** Records are validated structurally, but tagged with `quality_status = CONFLICTING`.
* **Safety Protocol:** The system never silently averages conflicting values into an artificial compromise. Discrepancies are surfaced to operational supervisors with a conservative safety bias.

---

## 10. Derived-Metric Validation

For computed indicators such as the Rothfusz Heat Index or Apparent Temperature:

1. **Input Verification:** Confirms that the required base variables ($T_a, RH$) exist, are tagged as `VALID`, and fall within formula applicability domains ($T_a \ge 20^\circ\text{C}$).
2. **Provenance Attestation:** Records must specify the exact mathematical algorithm (`NOAA_NWS_ROTHFUSZ_1990`) and implementation version.
3. **Non-Conflation:** Derived values must never be labeled as physical observations.

---

## 11. Validation Outcomes and Routing

The terminal state of the validation pipeline determines how data is persisted and exposed downstream:

```text
Validation Outcome
       │
       ├─► [VALID] ──────────► Store in DB & Expose to Heat Risk Engine
       │
       ├─► [INVALID] ────────► Quarantine, Log Error, Block Downstream Use
       │
       ├─► [STALE] ──────────► Store with STALE Flag, Retain Continuity
       │
       ├─► [UNKNOWN] ────────► Retain Uncertainty Flag, Request Diagnostic
       │
       └─► [CONFLICTING] ────► Store both, Flag Discrepancy, Alert Supervisor
```

---

## 12. Validation Observability Metrics

System health dashboards track the effectiveness of the validation layer:

* **Validation Pass Rate (%):** Proportion of ingested records successfully achieving `VALID` status.
* **Malformed Payload Rate (%):** Frequency of external responses failing JSON parsing.
* **Range Violation Count:** Number of records rejected due to physical feasibility violations.
* **Unit Mismatch Rejections:** Count of records dropped due to absent or ambiguous unit metadata.
* **Stale Record Ingestion Count:** Frequency of upstream providers delivering expired timestamps.

---

## 13. Critical Safety Boundary

The validation layer must never attempt to "repair" invalid data through speculative guessing:

```text
CORRUPTED INPUT           UNACCEPTABLE GUESS            MANDATORY PROTOCOL
Missing Temperature   ──► Guess 30.0 °C             ──► Mark INVALID / MISSING
Missing Humidity      ──► Assume 50.0 %             ──► Mark INVALID / MISSING
Broken Forecast Run   ──► Copy Yesterday's Forecast ──► Mark MISSING / STALE
```

Fabricating synthetic weather data to bypass validation errors undermines occupational safety, compromises regulatory compliance, and exposes workers to unmitigated hazards.

---

## 14. Design Principle

> **Validation protects the risk engine from bad inputs; it must never hide uncertainty by inventing data.**
