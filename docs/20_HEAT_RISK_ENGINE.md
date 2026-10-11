# Heat Risk Engine — Heat Action Response Engine MVP

## 1. Purpose

This document defines the architectural and operational specification for the **Heat Risk Engine**.

The Heat Risk Engine is the decision-support and operational risk-classification core of the **Heat Action Response Engine**. Its primary responsibility is to transform validated environmental inputs (ambient temperature, relative humidity, solar radiation, wind speed) and operational worksite context (workload intensity, solar exposure, shading, hydration assets, shift timing, and workforce acclimatization context) into a structured, explainable, and deterministic **Heat Risk Assessment**.

```text
WEATHER / ENVIRONMENTAL INPUT
              ↓
       DATA VALIDATION
              ↓
  HEAT INDICATOR CALCULATION
              ↓
       WORKSITE CONTEXT
              ↓
           WORKLOAD
              ↓
           EXPOSURE
              ↓
    ACCLIMATIZATION CONTEXT
              ↓
     RISK RULE EVALUATION
              ↓
          RISK LEVEL
              ↓
       RISK EXPLANATION
              ↓
        ACTION ENGINE
```

### Critical Operational Boundary
The Heat Risk Engine is an **operational decision-support and workflow-triggering component**. It is explicitly **not**:
* A medical diagnostic tool.
* A clinical heat illness assessment device.
* An individual physiological monitoring engine.
* A legal compliance certification mechanism.
* A substitute for professional occupational health and safety judgment.

---

## 2. Core Architectural Properties

To guarantee safety, reliability, and regulatory defensibility, the engine adheres to seven architectural properties:

1. **Deterministic Execution:** Given identical validated environmental inputs, worksite context, and rule versions, the engine produces the exact same risk classification and reason codes every single time:
   $$\text{Validated Inputs} + \text{Worksite Context} + \text{Rule Version } v \longrightarrow \text{Identical Risk Assessment}$$
2. **Explainability by Design:** Every calculated risk tier is accompanied by structured, human-readable reason codes detailing which specific environmental factors and contextual thresholds triggered the classification.
3. **Traceability & Provenance:** Every assessment record preserves the complete environmental snapshot, data source identifier, timestamp, and rule matrix version evaluated.
4. **No Hidden AI Thresholds:** Generative AI models are strictly prohibited from calculating, adjusting, or evaluating risk thresholds. The classification logic is 100% deterministic code executing approved rule matrices.
5. **Fail-Safe Data Handling:** When critical environmental or contextual inputs are missing, stale, or corrupted, the engine fails safely into explicit uncertainty states (`UNKNOWN` or `DATA_DEGRADED`). It **never** silently defaults to a "Safe" or "Low" risk assumption.
6. **Decoupled Architecture:** The engine evaluates operational risk independently of downstream notification dispatch, supervisor acknowledgment, or escalation logic.
7. **Versioned Rule Governance:** Risk rules are formally versioned and auditable, ensuring retrospective safety reviews can reconstruct the exact decision logic active at any historical moment.

---

## 3. Conceptual Input Model

The engine ingests data across four structured categories:

```text
                     HEAT RISK ENGINE INPUTS
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  ENVIRONMENTAL             WORKSITE                  WORK & SHIFT
┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ • Air Temperature   │ │ • Worksite ID & GPS │ │ • Workload Category │
│ • Relative Humidity │ │ • Indoor / Outdoor  │ │ • Task Classification│
│ • Apparent Temp     │ │ • Shade Shelter Prox│ │ • Active Shift Hours│
│ • Solar Proxy       │ │ • Hydration Assets  │ │ • Continuous Expose │
│ • Wind Speed        │ │ • Cooling Stations  │ │ • Break Frequency   │
│ • Data Timestamp    │ │ • PPE / Clothing    │ │ • Crew Size Context │
│ • Source Provider   │ │ • Surface Thermal   │ │ • Acclimatization   │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

### 3.1 Environmental Inputs
* **Dry-Bulb Air Temperature ($T_a$):** Measured in degrees Celsius (°C).
* **Relative Humidity ($RH$):** Measured as a percentage (0–100%).
* **Heat Indicator / Apparent Temperature:** Mathematical heat index derived from ambient temperature and humidity.
* **Solar / Radiant Heat Proxy:** Solar radiation estimates ($W/m^2$) or cloud cover percentage from meteorological models.
* **Wind Speed ($v$):** Air velocity in meters per second ($m/s$) or $km/h$.
* **Data Provenance:** Originating meteorological provider (e.g., Open-Meteo grid forecast), retrieval timestamp, and observation validity flag.

### 3.2 Worksite Contextual Inputs
* **Physical Enclosure:** Outdoor direct sun, outdoor covered/scaffolded, semi-indoor unconditioned, or enclosed mechanical space.
* **Hydration Infrastructure:** On-site presence and walking distance to potable, chilled drinking water stations.
* **Cooling Assets:** Proximity to designated shaded rest canopies, misting fans, or air-conditioned break shelters.
* **Surface Properties:** Thermal radiance of surrounding ground (e.g., dark asphalt, reflective metal decking, structural concrete, or soil).
* **PPE / Clothing Ensemble:** Required personal protective equipment (e.g., breathable cotton, heavy flame-retardant coveralls, impermeable vapor-barrier suits).

### 3.3 Work & Task Inputs
* **Workload Category:** Operational metabolic exertion tier (`LIGHT`, `MODERATE`, `HEAVY`, `VERY_HEAVY`).
* **Task Nature:** Physical description of work (e.g., equipment operation, manual rebar tying, trench excavation).
* **Continuous vs. Intermittent Exposure:** Duration of uninterrupted exposure without structured rest breaks.

### 3.4 Acclimatization Context
* **Workforce Acclimatization Category:** Operational classification of the crew (`ESTABLISHED`, `NEW_OR_RETURNING`, or `UNKNOWN`).
* *Privacy Safeguard:* Individual medical records, personal fitness assessments, or physiological biometrics are **never** collected.

---

## 4. Conceptual Output Model

The engine outputs a structured, immutable **Heat Risk Assessment** record:

```text
{
  "risk_assessment_id": "ra-2026-10-07-0892",
  "worksite_id": "ws-demo-blr-001",
  "shift_id": "shf-demo-morning-01",
  "assessment_timestamp": "2026-10-07T11:45:00Z",
  "data_provenance": {
    "source_provider": "Open-Meteo API",
    "observation_timestamp": "2026-10-07T11:30:00Z",
    "data_quality_status": "VALID",
    "data_freshness_seconds": 900
  },
  "environmental_indicators": {
    "dry_bulb_temperature_c": 38.2,
    "relative_humidity_pct": 64.0,
    "calculated_heat_index_c": 44.1,
    "solar_radiation_proxy_w_m2": 820.0,
    "wind_speed_kmh": 6.5
  },
  "contextual_factors": {
    "workload_category": "HEAVY",
    "exposure_type": "DIRECT_SUN",
    "shading_status": "CANOPY_AVAILABLE_50M",
    "hydration_status": "DISPENSERS_ACTIVE",
    "ppe_ensemble": "STANDARD_COTTON",
    "acclimatization_context": "ESTABLISHED"
  },
  "evaluation_result": {
    "risk_level": "HIGH",
    "risk_reason": "Heat Index 44.1°C combined with Heavy Labor in Direct Sun elevates operational risk to HIGH.",
    "triggered_rules": ["R01_ENV_THRESHOLD", "R03_WORKLOAD_MODIFIER", "R04_SOLAR_MODIFIER"],
    "rule_version": "v1.2.0"
  },
  "recommended_action_categories": [
    "WORK_REST_CYCLE_ADJUSTMENT",
    "MANDATORY_HYDRATION_QUOTA",
    "SUPERVISOR_CREW_BRIEFING"
  ],
  "created_at": "2026-10-07T11:45:02Z"
}
```

---

## 5. Processing Stages

The engine evaluates data across seven sequential processing stages:

```text
STAGE 1: Ingestion & Boundary Validation
         Verify temperature (-20°C to 60°C) and humidity (0% to 100%).
                       ↓
STAGE 2: Freshness & Data Quality Check
         Check elapsed observation time; classify quality state.
                       ↓
STAGE 3: Environmental Indicator Calculation
         Compute Apparent Temperature / Heat Index deterministically.
                       ↓
STAGE 4: Context Aggregation
         Retrieve worksite profile, active shift parameters, and workload.
                       ↓
STAGE 5: Deterministic Rule Evaluation
         Execute versioned rule matrix against combined parameters.
                       ↓
STAGE 6: Risk Classification & Reason Assembly
         Assign operational risk level (LOW, MODERATE, HIGH, CRITICAL, UNKNOWN).
                       ↓
STAGE 7: Dispatch to Action Engine & Audit Ledger
         Pass assessment to Action Engine and append to immutable log.
```

---

## 6. Data Quality & Missing Data Model

The engine implements a rigorous data-quality state machine to prevent misleading assessments:

```text
               DATA INGESTION STATE
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
     VALID             STALE           MISSING /
(Fresh & In-Bounds) (>60 min old)      INVALID
        │                │                │
        ▼                ▼                ▼
   Full Normal       Degraded Risk    UNKNOWN Risk
   Assessment       Assessment + Alert   Assessment
```

### Quality States:
1. **`VALID`:** All required environmental variables present, timely ($< 60$ min old), and within physical boundaries. Full evaluation proceeds.
2. **`STALE`:** Data is between 60 and 180 minutes old. Engine evaluates risk but flags assessment as `DATA_DEGRADED` and surfaces a prominent visual warning.
3. **`MISSING`:** External API unreachable or returning null. Engine suspends automated classification and outputs `UNKNOWN` risk tier.
4. **`INVALID`:** Inputs breach physical reality (e.g., humidity = 140%, temperature = -50°C in tropical zone). Rejected immediately; flagged as `DATA_ERROR`.
5. **`CONFLICTING`:** Discrepancies between forecast and current observations exceed plausible delta thresholds. Flags assessment for manual review.

### Absolute Safety Rule:
> **MISSING DATA $\neq$ SAFE CONDITIONS. UNKNOWN DATA $\neq$ LOW RISK.**  
> The system strictly refuses to default missing data to zero degrees or assume safe conditions.

---

## 7. Risk Assessment Lifecycle

A risk assessment record moves through distinct lifecycle phases:

```text
       ┌───────────┐
       │ RECEIVED  │ (Raw payload ingested)
       └─────┬─────┘
             │
             ▼
       ┌───────────┐     (Bounds Violation)     ┌───────────┐
       │ VALIDATED │ ─────────────────────────> │  INVALID  │
       └─────┬─────┘                            └───────────┘
             │
             ▼
       ┌───────────┐     (Input Stale / Down)   ┌───────────┐
       │ ASSESSED  │ ─────────────────────────> │   STALE   │
       └─────┬─────┘                            └───────────┘
             │
             ▼
       ┌───────────┐
       │ACTIONABLE │ (Dispatched to Action Engine)
       └─────┬─────┘
             │
             ▼
       ┌───────────┐
       │SUPERSEDED │ (Replaced by subsequent evaluation run)
       └───────────┘
```

* **`ACTIONABLE`:** The assessment represents the current active operational state of the worksite and is driving active action directives.
* **`SUPERSEDED`:** A newer assessment has been computed for the worksite; the previous record remains preserved in the audit log for historical reconstruction.

---

## 8. Explainability and Reason Codes

Every risk classification must be fully explainable to front-line supervisors and safety managers. The engine generates structured reason summaries:

```text
Operational Risk Level: HIGH
Triggered Reason Codes:
  • R01_ENV_HI_BREACH: Heat Index (44.1°C) breached baseline operational advisory threshold.
  • R03_WORKLOAD_MODIFIER: Heavy metabolic exertion lowers acceptable thermal duration.
  • R04_SOLAR_MODIFIER: Unshaded direct solar radiation increases radiant heat strain.

Human-Readable Synthesis:
"The worksite has been classified at HIGH risk because ambient heat index (44.1°C)
coincides with heavy concrete manual labor under direct sunlight with no natural shade."
```

Generative AI may rephrase or translate this synthesis, but the underlying reason codes and rule triggers remain strictly deterministic.

---

## 9. Rule Versioning and Governance

* **Semantic Versioning:** Every rule matrix carries an explicit version string (e.g., `rule_version: "v1.2.0"`).
* **Audit Binding:** Every generated risk assessment permanently stores the exact `rule_version` under which it was calculated.
* **Governance Pipeline:** Changes to rule thresholds, context multipliers, or classification boundaries require formal domain review, regression testing against historical weather profiles, and administrative sign-off before deployment.

---

## 10. Relationship to Other Models

The Heat Risk Engine occupies a central position within the platform's architectural topology:

```text
14_WORKSITE_MODEL (Spatial & Physical Infrastructure Anchor)
        │
        ▼
15_WORKER_SHIFT_MODEL (Active Operational Window & Work Group Context)
        │
        ▼
20_HEAT_RISK_ENGINE (Deterministic Risk Evaluation & Assessment Generation)
        │
        ▼
16_ACTION_MODEL (Translates Risk Assessment into Specific Directive)
        │
        ▼
18_NOTIFICATION_MODEL (Dispatches Directive Deep Link to Assigned Supervisor)
        │
        ▼
17_ESCALATION_MODEL (Failsafe Timer Triggers if Supervisor Does Not Acknowledge)
        │
        ▼
IMMUTABLE AUDIT LEDGER (Permanent Record of Ingestion, Decision, & Response)
```

---

## 11. Design Principle

> **The Heat Risk Engine is an objective, deterministic decision-support tool. It transforms environmental telemetry and operational context into consistent, explainable risk classifications without relying on ungrounded AI thresholds, and it fails safely whenever data integrity cannot be verified.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
