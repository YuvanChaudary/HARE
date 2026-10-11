# Workload Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the **Workload Model** within the **Heat Action Response Engine**.

In occupational heat safety, environmental temperature represents only half of the thermal equation. The human body is a metabolic engine: physical muscle exertion generates internal heat that must be transferred to the environment to prevent internal core body temperature from rising to hazardous levels.

The Workload Model represents physical work intensity in a structured, operational format suitable for automated decision support, allowing the system to adjust thermal risk thresholds based on the physical demands of active job tasks.

```text
       TASK CLASSIFICATION
      (e.g., Concrete Pouring)
                 │
                 ▼
     WORKLOAD CATEGORY (HEAVY)
                 │
                 ▼
  DETERMINISTIC CONTEXT MODIFIER
                 │
                 ▼
    ADJUSTED RISK ASSESSMENT
 (Lowers acceptable thermal window)
                 │
                 ▼
   TAILORED ACTION DIRECTIVE
 (45/15 Work-Rest Cycle + Hydration)
```

### Critical Operational Boundary
The Workload Model is an **operational task descriptor**. It is explicitly **not**:
* An individual employee productivity tracking metric.
* An employee speed or performance rating.
* An individual physiological oxygen consumption ($\text{VO}_2$) or heart-rate monitor.
* An individual medical fitness-for-duty evaluation.

---

## 2. Core Workload Categories

The platform classifies tasks into four standardized operational categories:

| Workload Category | Typical Metabolic Rate | Physical Exertion Description | Typical Trade Task Examples |
| :--- | :--- | :--- | :--- |
| **`LIGHT`** | $\approx 100\text{--}200\text{ W}$ | Seated or standing work with minimal bodily movement; arm and hand control | Equipment operation in conditioned cab, supervisory inspection, instrument calibration, precision assembly |
| **`MODERATE`** | $\approx 200\text{--}350\text{ W}$ | Sustained arm and leg movement; intermittent walking with light tools or gear | Equipment maintenance, framing, electrical rough-in, light bricklaying, plumbing, warehouse staging |
| **`HEAVY`** | $\approx 350\text{--}500\text{ W}$ | Intensive, continuous full-body physical exertion; lifting and carrying heavy loads | Manual shoveling, trench digging, manual concrete placement, structural rebar tying, asphalt raking |
| **`VERY_HEAVY`** | $> 500\text{ W}$ | Maximum continuous physical exertion; rapid physical pacing | Rapid heavy lifting uphill, sledgehammering, emergency structural timbering |
| **`UNKNOWN`** | *Unspecified* | Task intensity unconfigured or unverified | Default state prompting supervisor or administrator configuration |

*Note: Metabolic rate wattages are provided strictly as conceptual domain reference brackets derived from established occupational ergonomics literature (e.g., ISO 8996); the software does not calculate individual human metabolic wattages directly.*

---

## 3. Workload Determinants

When configuring or assessing workload for an active shift, operational planners and supervisors evaluate eight physical task determinants:

1. **Physical Exertion Level:** Sustained isometric muscle tension vs. dynamic movement.
2. **Lifting & Carrying:** Frequency and weight of materials transported manually across the worksite.
3. **Repetitive Bodily Movement:** Constant bending, stooping, squatting, or overhead reaching.
4. **Climbing & Elevation:** Frequent climbing of ladders, scaffolding decks, or steep embankments.
5. **Digging & Manual Earthwork:** Heavy continuous engagement of large muscle groups.
6. **Pushing & Pulling:** Transporting heavy wheelbarrows, concrete buggies, or hand trucks.
7. **Machinery Operation:** Degree to which heavy equipment reduces direct human physical labor.
8. **Work Pace & Recovery Structure:** Rapid, deadline-driven pacing vs. self-paced, flexible routines.

---

## 4. Configuration and Operational Governance

### 4.1 Who Configures Workload?
* **Pre-Shift Baseline:** Configured by the Organization Administrator (`ADMIN`) or Safety Manager (`SAFETY_MANAGER`) during shift creation or daily job hazard analysis.
* **On-Site Dynamic Adjustment:** Updated by the on-site Site Supervisor (`SUPERVISOR`) if actual field tasks diverge from planned schedules (e.g., machinery breakdown forcing a crew to transition from mechanized excavation to manual digging).

### 4.2 Shift and Work Group Association
Workload is associated at the **Operational Shift** and **Work Group** level (e.g., `Civil Crew: HEAVY`; `Equipment Operators: LIGHT`), never at the individual worker level. This provides necessary operational granularity without compromising worker privacy.

---

## 5. Relationship to the Risk and Action Engines

The workload category functions as an active deterministic modifier within the risk pipeline:

```text
  Raw Environmental Input (e.g., Heat Index = 38°C)
                         │
                         ▼
  Evaluate Workload Category:
    • If LIGHT: Operational risk remains MODERATE.
    • If HEAVY: Contextual rule triggers elevation to HIGH RISK.
                         │
                         ▼
  Dispatch to Action Engine:
    • Action Directive mandates 45 min work / 15 min rest cycle.
    • Hydration quota increased to 1 liter per worker per hour.
```

### Deterministic Safety Principle:
Under elevated ambient temperatures, high metabolic heat production dramatically narrows the body's safe physiological tolerance band. Therefore, heavier workloads deterministically trigger protective action directives at lower ambient thermal thresholds.

---

## 6. Handling UNKNOWN Workload

When a worksite or shift lacks a configured workload classification:
1. **Safety-First Assumption:** The system refuses to assume `LIGHT` labor by default.
2. **Conservative Evaluation:** The deterministic risk engine evaluates rules under a conservative default context (e.g., treating `UNKNOWN` as at least `MODERATE`).
3. **Administrative Prompt:** The Safety Manager and Supervisor dashboards display a visual configuration prompt: *"Workload category unconfigured for active shift. Verify physical task intensity."*
4. **Audit Logging:** The prompt and subsequent user resolution are permanently recorded in the worksite audit log.

---

## 7. Dynamic Workload Transitions During Shifts

Physical tasks frequently change throughout an operational work day:

```text
06:00 – 10:00: Heavy Concrete Pouring (Workload: HEAVY)
10:00 – 11:30: Formwork Strip & Cleanup (Workload: MODERATE)
11:30 – 14:00: Blueprint Review & Cab Operations (Workload: LIGHT)
```

The Supervisor Action Center allows on-site supervisors to update active workload classifications with a single tap. When workload is modified:
* The system logs the change with user ID and timestamp.
* The Heat Risk Engine automatically triggers an on-demand re-evaluation.
* Active work-rest directives dynamically recalculate to reflect the updated exertion level.

---

## 8. Canonical Fictional Workload Example

To demonstrate end-to-end integration during testing and hackathon review:

```text
Operational Profile:
  worksite_name:       "North Bengaluru Construction Site (Pier 42)"
  shift_name:          "Morning Viaduct Pour"
  task_description:    "Manual structural concrete placement and vibrator operation"
  assigned_work_group: "Civil Concrete Crew (20 Workers)"

Workload Configuration:
  configured_category: HEAVY
  determinants:        Manual shoveling, continuous lifting of 25kg hose lines,
                       constant upright movement on uneven rebar grids.
  configured_by:       "Priya Nair (Admin)"
  supervised_by:       "Rahul Kumar (Supervisor)"

Engine Interaction:
  Ambient Heat Index:  39.5°C (Advisory Level)
  Workload Modifier:   HEAVY labor elevates operational risk to HIGH.
  Resulting Directive: Mandates 45 min work / 15 min rest cycle in shaded canopy.
```

---

## 9. Anti-Surveillance and Ethical Guardrails

1. **No Performance Penalties:** Workload data is captured strictly to protect crews from heat illness. It is never used to calculate labor efficiency, worker output quotas, or employee bonuses.
2. **No Wearable Biometric Tracking:** The system does not require or monitor heart rates, skin temperatures, or personal metabolic burned calories.
3. **Collective Group Focus:** Workload categories apply to task descriptions and crew units, preserving worker anonymity and preventing individual employee profiling.

---

## 10. Design Principle

> **Physical exertion creates internal heat that compounds environmental thermal strain. The Workload Model provides the operational context necessary to adapt preventive safety controls to the physical realities of the job, protecting crews without intruding on individual worker privacy.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
