# Risk Rules — Heat Action Response Engine MVP

## 1. Purpose

This document defines the deterministic rules architecture and evaluation engine for the **Heat Action Response Engine**.

The Risk Rules layer represents the authoritative decision-making logic of the platform. It defines how validated environmental inputs (temperature, humidity, solar exposure, wind) and operational worksite contexts (workload intensity, direct sun, clothing barriers, shift duration, workforce acclimatization) are combined to evaluate risk levels, assign structured reason codes, and select appropriate preventive action categories.

```text
       VALIDATED INPUTS & WORKSITE CONTEXT
                        │
                        ▼
            INPUT PRECONDITION CHECK
                        │
                        ▼
          DETERMINISTIC RULE EVALUATION
          (Strict Precedence Resolution)
                        │
                        ▼
            OPERATIONAL RISK LEVEL
       (LOW | MODERATE | HIGH | CRITICAL | UNKNOWN)
                        │
                        ▼
         REASON CODES & ACTION CATEGORIES
                        │
                        ▼
              HUMAN-VISIBLE AUDIT
```

### Critical Architectural Mandate:
> **The Risk Rules layer is 100% deterministic code. Generative AI models are strictly prohibited from evaluating, adjusting, or executing risk rules.**

---

## 2. Rule Architecture Pipeline

Every evaluation cycle progresses through six deterministic stages:

1. **Input Precondition Check:** Verifies that required variables exist, fall within physically plausible boundaries, and meet freshness requirements.
2. **Environmental Threshold Evaluation:** Evaluates ambient temperature, relative humidity, and calculated Heat Index against baseline domain thresholds.
3. **Contextual Modifier Evaluation:** Evaluates physical workload, direct solar radiation, PPE ensembles, and acclimatization context to adjust effective operational concern.
4. **Precedence & Conflict Resolution:** If multiple rules fire simultaneously, the engine deterministically resolves conflicts using explicit priority rankings (favoring worker safety).
5. **Output Assembly:** Generates the final risk classification, appends triggered rule IDs, and compiles human-readable reason codes.
6. **Action Category Selection:** Maps triggered rules to recommended action categories (e.g., `WORK_REST_CYCLE_ADJUSTMENT`, `HYDRATION_QUOTA`).

---

## 3. Conceptual Rule Structure

In the system's configuration-driven architecture, every risk rule is defined as a structured, versioned object:

| Conceptual Field | Purpose & Description |
| :--- | :--- |
| `rule_id` | Unique string identifier (e.g., `R01_ENV_THRESHOLD_HIGH`). |
| `rule_name` | Concise descriptive title (e.g., "High Environmental Heat Index Rule"). |
| `rule_version` | Semantic version string (e.g., `v1.2.0`). |
| `status` | Operational state (`ACTIVE`, `INACTIVE`, `DEPRECATED`). |
| `priority` | Integer evaluation rank used for conflict resolution (higher = higher precedence). |
| `required_inputs` | Array of mandatory input variables (e.g., `["heat_index", "workload"]`). |
| `conditions` | Boolean logic expression defining when the rule fires. |
| `risk_level` | Resulting operational risk classification if fired (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`, `UNKNOWN`). |
| `reason_code` | Traceable explanation key (e.g., `REASON_HIGH_HEAT_INDEX_HEAVY_LABOR`). |
| `action_categories`| Recommended preventive action types (e.g., `["WORK_REST_CYCLE", "HYDRATION"]`). |
| `source_reference` | Citation key linking rule to authoritative domain literature (e.g., `REF-NIOSH-2016`). |
| `effective_from` | UTC timestamp when rule became active. |
| `effective_until` | UTC timestamp when rule was superseded (or null). |

---

## 4. Primary Rule Categories

The engine organizes evaluation logic into six distinct rule categories:

### R01 — Environmental Threshold Rules
* **Description:** Direct atmospheric triggers evaluated when ambient meteorological conditions breach configured advisory thresholds.
* **Example Logic:** Fires when calculated Heat Index exceeds baseline advisory levels based on authoritative meteorological heat action guidance.
* **Safety Context:** Represents the baseline ambient hazard prior to task-specific adjustment.

### R02 — Combined Environmental & Contextual Rules
* **Description:** Evaluates the interaction between ambient heat and physical job site factors.
* **Example Logic:** Fires when moderate ambient heat coincides with heavy physical labor or unshaded solar radiation, elevating the operational concern above the environmental baseline.

### R03 — High Workload Contextual Rules
* **Description:** Elevates operational protection for trades performing strenuous physical labor.
* **Example Logic:** If ambient heat is elevated and active workload is `HEAVY` or `VERY_HEAVY`, rule lowers the allowable threshold before mandatory work-rest cycles are triggered.

### R04 — Exposure Duration Contextual Rules
* **Description:** Evaluates cumulative hours of sustained physical exposure during an active shift.
* **Example Logic:** If high thermal conditions are sustained continuously for $\ge 3$ hours without structured rest intervals, rule triggers mandatory shade canopy rotations.

### R05 — Acclimatization Contextual Rules
* **Description:** Provides protective safeguards for susceptible or newly mobilized work groups.
* **Example Logic:** If workforce acclimatization context is `NEW_OR_RETURNING`, rule applies a conservative threshold modifier, mandating enhanced buddy monitoring and phased rest ramps.

### R06 — Data-Quality and Failsafe Rules
* **Description:** Protects system integrity when inputs are missing, stale, or corrupted.
* **Example Logic:** If external weather feeds are unreachable or observations are $> 60$ minutes old, rule automatically overrides other evaluations to output `UNKNOWN` risk tier.

---

## 5. Conflict Resolution & Precedence

When multiple rules fire during the same evaluation cycle, the engine resolves conflicts using strict, deterministic precedence rules:

```text
PREVENTIVE SAFETY PRECEDENCE ORDER:
1. DATA INTEGRITY RULES (R06)
   If data is invalid or missing, always yield UNKNOWN.
                 │
                 ▼
2. CRITICAL LIFE-SAFETY RULES (R01 / R02 Critical)
   Extreme conditions always supersede moderate advisory rules.
                 │
                 ▼
3. CONTEXTUAL MODIFIER ELEVATIONS (R03 / R04 / R05)
   Heavier workloads and unshaded exposure elevate risk upward.
                 │
                 ▼
4. BASELINE ADVISORY RULES (R01 Moderate / Low)
   Default evaluation when no modifiers or critical thresholds are breached.
```

### Conservative Safety Rationale:
If Rule A suggests `MODERATE` risk based on ambient temperature alone, but Rule B indicates `HIGH` risk due to heavy manual labor in direct sun, the engine **always resolves to the higher protective tier (`HIGH`)**. The system never resolves conflicts downward.

---

## 6. Rule Versioning and Change Governance

To ensure legal defensibility and scientific accountability:
1. **Immutable Historical Binding:** Every generated risk assessment permanently stores the exact `rule_id` and `rule_version` evaluated.
2. **Formal Change Control:** Modifying a rule condition, threshold value, or source citation requires incrementing the version string (e.g., `v1.2.0` $\rightarrow$ `v1.3.0`), documenting the domain rationale, and executing regression test suites against historical weather datasets before production deployment.
3. **No Unaudited In-Flight Changes:** Rules cannot be modified ad-hoc during runtime.

---

## 7. Rule Explainability Architecture

Every evaluation produces a deterministic explanation package formatted for human understanding:

```text
[ASSESSMENT RESULT: HIGH RISK]
Triggered Rules:
  • R01_ENV_HI_BREACH (Priority 80)
  • R03_WORKLOAD_MODIFIER (Priority 90)
  • R04_SOLAR_MODIFIER (Priority 75)

Reason Synthesis:
"The worksite reached HIGH operational risk because calculated Heat Index (43.8°C)
coincided with HEAVY manual concrete labor under DIRECT SUN with no overhead shading."

Recommended Action Directives:
  [1] WORK_REST_PLAN_REVIEW: Mandate 45 min work / 15 min rest cycle.
  [2] HYDRATION_READINESS: Enforce 1L potable water/worker/hr target.
  [3] SUPERVISOR_BRIEFING: Deliver 60-second crew buddy talk.
```

Generative AI may format or translate this text into local dialects, but it **cannot modify the triggered rule list or alter the resulting action categories**.

---

## 8. Verification and Test Suite Requirements

To ensure zero software regression and absolute mathematical repeatability, the rule engine must satisfy seven automated test categories:

1. **Boundary Tests:** Evaluating exact threshold boundary values ($X - 0.1$, $X$, $X + 0.1$) to verify precise trigger behavior.
2. **Missing-Data Tests:** Verifying that missing humidity or temperature inputs deterministically produce `UNKNOWN` risk states.
3. **Stale-Data Tests:** Simulating observation ages of 61 minutes to verify that data degradation alerts trigger correctly.
4. **Conflicting-Rule Tests:** Simulating multi-rule triggers to verify that precedence rules always resolve conservatively upward.
5. **Regression Tests:** Executing historical heat wave weather sequences to ensure version updates maintain expected safety baselines.
6. **Multi-Workload Tests:** Testing identical weather inputs across `LIGHT`, `MODERATE`, and `HEAVY` workloads to verify proper contextual modulation.
7. **Simulation Sandbox Tests:** Verifying that accelerated demo scenarios trigger identical deterministic logic as production runs.

---

## 9. Design Principle

> **Risk rules are the deterministic foundation of workplace heat safety. They must be transparent, versioned, explainable, and grounded in authoritative domain evidence. Safety-critical logic must never be delegated to non-deterministic artificial intelligence models.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
