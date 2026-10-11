# Worker Shift Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines how worker exposure periods, operational shifts, and field work groups are modeled within the **Heat Action Response Engine**.

In occupational heat safety, environmental temperature and humidity are meaningless without **temporal context**. A forecast of 40°C heat index creates acute occupational danger during active midday excavation, but zero operational danger when the worksite is unoccupied at night.

The Worker Shift Model provides the critical temporal framework that connects:
* **Worksite Operations:** Defining when active physical labor occurs on the ground.
* **Environmental Exposure:** Determining which forecast hours overlap with human activity.
* **Preventive Actions:** Scoping work-rest rotations and hydration directives to active work windows.
* **Response Windows:** Timing supervisor acknowledgment deadlines during operational hours.
* **Automated Escalations:** Ensuring escalation alerts fire when field intervention is actionable.

> **Crucial System Boundary:** The shift model exists to provide operational and temporal context. It is strictly **not** an HR management system, employee productivity tracker, payroll clock, or medical risk-scoring engine.

---

## 2. Core Principle

> **The system needs enough temporal context to understand when heat-exposed work is occurring, but it should collect only the minimum worker-level information necessary for the MVP workflow.**

By adhering to this principle, the platform delivers precise, accountable safety interventions while strictly preserving worker privacy and avoiding unnecessary enterprise administrative burden.

---

## 3. Shift Definition

> **A shift is a configured period during which a worksite or work group is expected to perform work under defined operational conditions.**

### Critical Conceptual Distinctions
To maintain architectural clarity, the system strictly distinguishes three operational concepts:

```text
1. WORKSITE OPERATING SCHEDULE
   (General weekly facility hours, e.g., "Monday–Saturday, 06:00–18:00")
                │
                ▼
2. OPERATIONAL SHIFT
   (Specific active working window, e.g., "Morning Civil Shift, 06:00–14:00")
                │
                ▼
3. INDIVIDUAL WORKER ASSIGNMENT
   (Specific human roster, e.g., "Worker A, Worker B" — OUT OF MVP SCOPE)
```

* **Worksite Operating Schedule:** The macro administrative container defining when a physical facility is unlocked, powered, or accessible.
* **Operational Shift:** The temporal execution unit during which specific physical crews are active, supervised, and exposed to ambient conditions.
* **Individual Worker Assignment:** Personal scheduling of individual employees. The MVP manages safety at the **shift and work-group level**, intentionally avoiding the collection of individual worker identities.

---

## 4. Shift Model Attributes

The conceptual shift schema defines the operational parameters of an active work period:

| Conceptual Field | Purpose & Description |
| :--- | :--- |
| `shift_id` | Unique, immutable identifier (e.g., UUID) for this operational shift instance. |
| `worksite_id` | Foreign identifier linking the shift to the parent worksite. |
| `shift_name` | Human-readable label (e.g., "Morning Concrete Pour", "Afternoon Trenching"). |
| `start_time` | Local scheduled start time (e.g., `06:00`). |
| `end_time` | Local scheduled end time (e.g., `14:00`). |
| `timezone` | Local IANA timezone identifier (e.g., `Asia/Kolkata`). |
| `status` | Current lifecycle state (`SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`). |
| `work_type` | Nature of physical tasks (e.g., `CONCRETE_CASTING`, `REBAR_TYING`). |
| `workload_category` | Baseline metabolic exertion tier (`LIGHT`, `MODERATE`, `HEAVY`, `VERY_HEAVY`). |
| `exposure_context` | Environmental exposure classification (`DIRECT_SUN`, `PARTIAL_SHADE`, `INDOOR`). |
| `supervisor_id` | User ID of the primary field supervisor accountable for this specific shift. |
| `created_at` | UTC timestamp of record creation. |
| `updated_at` | UTC timestamp of most recent shift record modification. |

---

## 5. Shift Lifecycle

Every operational shift progresses through a deterministic lifecycle state machine:

```text
       ┌───────────────┐
       │   SCHEDULED   │
       └───────┬───────┘
               │ (Shift Start Time Reached)
               ▼
       ┌───────────────┐   (Shift End Time)   ┌───────────────┐
       │    ACTIVE     │ ───────────────────> │   COMPLETED   │
       └───────┬───────┘                      └───────────────┘
               │
               │ (Adverse Weather / Stand-Down)
               ▼
       ┌───────────────┐
       │   CANCELLED   │
       └───────────────┘
```

### Lifecycle States
1. **`SCHEDULED`:** Shift profile is configured in advance. Environmental forecasts are monitored, but no live operational action directives are generated until the start window approaches.
2. **`ACTIVE`:** Shift is currently underway. Weather observations are evaluated against shift context; preventive action directives are generated, assigned to the supervisor, and actively monitored for acknowledgment.
3. **`COMPLETED`:** Shift end time has elapsed. Open actions are verified or transitioned through handover; shift audit log is sealed.
4. **`CANCELLED`:** Shift was called off prior to or during work (e.g., torrential rain, lightning, or severe heat stand-down). Active timers are cleanly halted.

---

## 6. Shift Timing & Temporal Calculations

Accurate timekeeping is critical to prevent false alarms and ensure directives arrive when crews can act:

* **Local Timezone Normalization:** While all system timestamps are recorded in UTC, shift comparisons use the worksite's declared local timezone (`Asia/Kolkata`).
* **Forecast-to-Shift Overlap:** The system queries weather forecasts matching the shift window. If extreme heat is forecast between 12:00 and 14:00, the system generates proactive alerts prior to that exposure period.
* **Overnight Shifts:** Shifts crossing the midnight boundary (e.g., `22:00` to `06:00`) are handled as single continuous intervals spanning two calendar dates, preventing interval calculation errors.

---

## 7. Workload Context

Metabolic heat production from physical muscle exertion significantly increases human thermal strain. The shift model captures workload as an operational category:

* **`LIGHT`:** Machine operation, light tool assembly, supervisory inspection, seated work (metabolic rate $\approx$ 100–200 W).
* **`MODERATE`:** Walking with moderate load, persistent hammering, equipment maintenance, plumbing (metabolic rate $\approx$ 200–350 W).
* **`HEAVY`:** Shoveling, concrete wheelbarrow transfer, manual rebar tying, heavy timber framing (metabolic rate $\approx$ 350–500 W).
* **`VERY_HEAVY`:** Rapid intense physical exertion, climbing ladders carrying heavy loads, structural firefighting activities (metabolic rate $> 500$ W).
* **`UNKNOWN`:** Default unclassified state that prompts administrative review.

> **Operational Boundary:** Workload category is an operational descriptor of the job task. It is **not** an individual physiological heart-rate or oxygen-consumption measurement.

---

## 8. Exposure Context

Exposure context describes how the physical shift environment interacts with ambient weather:

* **Direct Solar Radiation (`DIRECT_SUN`):** Work performed in open terrain without physical tree canopy or overhead structures, adding significant radiant heat load to ambient temperature.
* **Partial Shade (`PARTIAL_SHADE`):** Intermittent protection under scaffolding, partial awnings, or foliage.
* **Enclosed Outdoor (`ENCLOSED`):** Work in trenches, unconditioned steel containers, or enclosed framing where air circulation is restricted.
* **Indoor Semi-Conditioned (`INDOOR`):** Work in large high-ceiling logistics bays or workshops with passive ventilation.
* **Hydration Access:** Travel distance and availability of chilled potable water supplies.
* **Cooling Asset Availability:** Proximity to misting stations or air-conditioned break trailers.
* **PPE Ensemble:** High-visibility vests, protective coveralls, or impermeable chemical suits that hinder evaporative sweat cooling.

---

## 9. Worker Assignment Model (Privacy-First Abstraction)

Rather than maintaining invasive individual worker rosters, the Heat Action Response Engine utilizes a privacy-first group abstraction:

```text
INVASIVE ANTI-PATTERN (Explicitly Rejected)
Worksite ──> Individual Worker ──> Personal Health Record ──> Biometric Data

PRIVACY-FIRST MVP MODEL (Authoritative)
Worksite ──> Shift ──> Supervisor ──> Work Group (Anonymous Crew Unit)
```

### Why Individual Worker Accounts Are Excluded in MVP
1. **Ethical Privacy:** Front-line workers should not be subjected to invasive medical surveillance or digital tracking to receive basic occupational heat protections.
2. **Operational Reality:** Field construction and agricultural labor forces frequently experience high crew rotation and subcontractor churn; maintaining individual digital accounts creates severe administrative friction.
3. **Actionability:** Preventive heat controls (work-rest cycles, canopy deployment, water distribution) are deployed **collectively** across crews, not individually.

---

## 10. Worker Groups

A **Work Group** represents an operational crew performing related tasks under a common supervisor during a shift:

* **`Civil Crew`:** Heavy concrete placement, formwork, and foundation excavation.
* **`Road Crew`:** Asphalt laying, roller operation, and road paving.
* **`Electrical Crew`:** Conduit installation, wiring, and panel assembly.
* **`Material Handling Crew`:** Rigging, crane signaling, and warehouse staging.
* **`General Labor`:** Site cleanup, materials transport, and logistics assistance.

Directives generated for a shift can be targeted to specific work groups (e.g., applying a 30/30 work-rest cycle to the Civil Crew while the Equipment Operators maintain standard rotations).

---

## 11. Shift-to-Risk Relationship

The heat-risk engine evaluates environmental forecasts against active shift schedules:

```text
  Weather / Forecast Feed (Hourly Grid)
                 │
                 ▼
  Filter Forecast by Active Shift Window (e.g., 06:00–14:00)
                 │
                 ▼
  Identify Peak Thermal Overlap (e.g., 12:00–14:00 at 41°C Heat Index)
                 │
                 ▼
  Apply Shift Context (Heavy Labor + Direct Sun)
                 │
                 ▼
  Deterministic Risk Classification (EXTREME RISK during Hours 6–8)
                 │
                 ▼
  Preventive Action Plan Generated for Shift Supervisor
```

If severe heat develops outside shift hours (e.g., at 16:00 when the shift concluded at 14:00), the system suppresses unnecessary field alarms while alerting management to potential evening shift exposure.

---

## 12. Shift-to-Action Relationship

Actions generated within the system are scoped directly to the active shift:

* **Action Scoping:** Every action directive links to both `worksite_id` and `shift_id`.
* **Concrete Shift Directives:**
  * *Adjust Work-Rest Ratio:* "For Hours 6 through 8 of Morning Shift, mandate 45 min work / 15 min rest per hour in Shade Canopy A."
  * *Hydration Quotas:* "Enforce minimum 1 liter chilled potable water intake per worker per hour."
  * *Schedule Resequencing:* "Move heavy concrete pouring to 06:00–09:00; transition crew to shaded fabrication during 12:00–14:00."
  * *Toolbox Briefing:* "Conduct 60-second midday heat awareness briefing focusing on peer buddy monitoring."

These directives represent operational workplace controls, not medical prescriptions.

---

## 13. Shift Acknowledgment and Verification

The shift model defines the operational lifecycle of action directives:

```text
ASSIGNED ──> PENDING_ACKNOWLEDGMENT ──> ACKNOWLEDGED ──> CONFIRMED ──> RESOLVED
                                  │
                                  └──> TIMEOUT EXPIRED ──> ESCALATED
```

### Key Principles
* **Acknowledgment:** The authenticated supervisor confirms they have read, understood, and accepted responsibility for executing the directive during this shift.
* **Confirmation:** The supervisor reports that the physical controls (shade, water, rest) have been deployed on site.
* **No False Proof:** Software acknowledgment and supervisor confirmation represent operational attestations; the software does not claim independent, automated sensor verification of physical compliance.

---

## 14. Escalation and Shift Timing

Escalation countdowns are tightly coupled to the active shift window:

```text
  Active Shift Underway (11:30 AM)
                 │
                 ▼
  Risk Breaches Threshold ──> Action Directive Generated
                 │
                 ▼
  Supervisor Notified ──> Response Timer Starts
                 │
  ┌──────────────┴──────────────┐
  │                             │
  ▼ (Supervisor Acknowledges)   ▼ (Timer Reaches Zero)
Timer Dismissed              Escalation Engine Fires
Normal Shift Continues       Safety Manager Alerted Immediately
```

### Hackathon Demo vs. Real Operational Timing
* **Real Operational Policy:** Escalation timeouts are configured based on organizational safety policies (typically 15 to 30 minutes).
* **Demo Sandbox Mode:** To enable rapid hackathon validation, the demo mode compresses escalation timers to **30 to 60 seconds**.
* **Strict Boundary:** Demo timeouts are presentation constructs and must never be represented as real-world occupational safety standards.

---

## 15. Multiple Shifts and Overlap Handling

Worksites frequently run multiple sequential or overlapping shifts:

```text
Morning Shift:   06:00 ──────────────────> 14:00
Afternoon Shift:           13:30 ──────────────────> 21:30
Night Shift:                               21:00 ──────────────> 05:00
```

### Overlap Rules
1. **Explicit Supervisor Binding:** Every shift has its own designated supervisor; overlapping shifts do not create split ownership.
2. **Targeted Directives:** Actions generated during an overlap specify the intended shift and work group, preventing confusion between incoming and outgoing crews.

---

## 16. Shift Handover

When an active shift ends while an action directive remains in progress or escalated:

```text
  Outgoing Shift Supervisor (Shift A Ending)
                 │
                 ▼
  Initiates "Shift Handover" in Supervisor Action Center
                 │
                 ▼
  Transfers Open Directive to Incoming Supervisor (Shift B)
                 │
                 ▼
  Incoming Supervisor Acknowledges Handover
                 │
                 ▼
  System Preserves Full Causal History & Original Timestamps
```

The handover protocol ensures that critical heat-safety directives **never silently lapse or disappear** simply because a work shift concluded.

---

## 17. Shift Edge Cases

| Edge Case | System Behavior | User Visibility | Safety Implication | Recovery Action |
| :--- | :--- | :--- | :--- | :--- |
| **Missing Shift Profile** | System monitors worksite at macro level; flags missing shift | Warning prompt in Admin Console | Forecast heat may not have specific supervisor routing | Admin configures shift schedule |
| **Shift Overlap** | Actions scope to explicit shift IDs | Separate action cards per supervisor | Eliminates shared or ambiguous ownership | Supervisors manage their respective crews |
| **Supervisor Absent** | Actions route to configured backup supervisor or Safety Manager | "Emergency Supervisor Fallback" badge | Prevents unassigned directives | Safety Manager reassigns active supervisor |
| **Shift Cancelled Early** | Active action directives for that shift are closed with status `CANCELLED` | Notification to Safety Manager | Prevents ghost escalations when crews have left site | Reason for cancellation logged in audit |
| **Shift Extended Overtime** | Supervisor updates shift end time in Action Center | Extended monitoring indicator | Protects crews working late during evening heat | System extends weather polling window |
| **Overnight Shift Crossing Midnight**| Normalized interval math treats 22:00–06:00 as continuous | Normal shift display | Correctly models nighttime cooling or nocturnal heat | Handled natively by temporal engine |
| **Weather Feed Unavailable** | Marks shift weather status as `DEGRADED`; uses last cached forecast | Prominent warning banner | Informs supervisor that live forecast updates are paused | Supervisor conducts visual site checks |

---

## 18. Privacy and Data Minimization

The Heat Action Response Engine enforces strict data minimization:

### Excluded Personal Data
The system **never** collects, requires, or stores:
* Worker personal names, national identity numbers, or home addresses.
* Personal medical records, pre-existing health conditions, or prescription histories.
* Core body temperature, skin temperature, or heart-rate telemetry.
* Individual biometric data, hydration status, or blood biomarkers.
* Personal fitness-for-duty determinations or individual clinical triage scores.

Worker health is protected through **environmental and administrative controls**, avoiding intrusive surveillance.

---

## 19. Worker Safety vs. Worker Surveillance

> **The purpose of the shift model is to coordinate safer workplace conditions, not to monitor employee performance.**

### Explicit Anti-Surveillance Safeguards
* **No Productivity Policing:** Response times, break intervals, and rest durations are recorded to verify organizational compliance, never to penalize individual worker productivity.
* **No Performance Ranking:** Supervisors and workers are not ranked or gamified based on heat break usage.
* **No HR Adverse Action:** System data cannot be exported or used as evidence for disciplinary HR actions or wage deductions related to heat pauses.

---

## 20. MVP vs. Future Shift Model

| Shift Capability | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **Worksite Shift Scheduling** | Yes (Start, end, timezone) | Dynamic algorithmic shift optimization |
| **Supervisor Association** | Yes (One primary supervisor per shift) | Multi-tier crew leadership structures |
| **Workload & Exposure Context** | Yes (Operational category tiers) | Dynamic microclimate sensor integration |
| **Work Group Abstraction** | Yes (Anonymous crew categories) | Role-specific crew micro-rotations |
| **Individual Worker Accounts** | **No** (Group abstraction) | Voluntary worker mobile companion app |
| **Wearable Physiological Sensors**| **No** (Software-first boundary) | Optional non-invasive biometric wearables |
| **Personal Heat Acclimatization** | Limited (General site context) | Individualized physiological acclimatization modeling |
| **Workforce Predictive Analytics**| **No** (Operational focus) | Enterprise labor productivity optimization |

---

## 21. Canonical Demo Shift

For hackathon demonstration and testing, the following fictional shift scenario is established:

```text
Worksite:
  name:                  "North Bengaluru Construction Site"
  worksite_id:           "ws-demo-blr-001"

Shift Parameters:
  shift_id:              "shf-demo-morning-01"
  shift_name:            "Morning Concrete Pour"
  start_time:            "06:00"
  end_time:              "14:00"
  timezone:              "Asia/Kolkata"
  status:                ACTIVE

Operational Context:
  work_type:             "Elevated Pier Concrete Casting"
  workload_category:     HEAVY
  exposure_context:      DIRECT_SUN
  work_group:            "Civil Casting Crew (20 Workers)"

Personnel:
  assigned_supervisor:   "usr-sup-rahul" (Rahul Kumar)
  safety_manager:        "usr-mgr-ananya" (Ananya Rao)
```

---

## 22. Conceptual Data Relationships

```text
Organization (Tenant)
     │
     ▼
  Worksite
     │
     ▼
Operational Shift
 ┌───┼───────────────────────────────────────────┐
 │   │                                           │
 ▼   ▼                                           ▼
Work Group Context                           Supervisor
(Civil Crew, Heavy Labor)                  (Rahul Kumar)
 │                                               │
 ▼                                               ▼
Environmental Forecast                     Notifications
(06:00–14:00 Overlap)                      (Deep Link Alerts)
 │                                               │
 ▼                                               ▼
Deterministic Risk Assessment              Acknowledgment
(EXTREME Risk during 12:00–14:00)          (Supervisor Tap)
 │                                               │
 ▼                                               ▼
Preventive Action Directive                Confirmation / Escalation
(45/15 Rest, Water Targets)                (Physical Controls Verified)
 └───────────────────────┬───────────────────────┘
                         ▼
               Immutable Audit Ledger
```

---

## 23. Relationship to Heat Risk Engine Documentation

This document defines the **temporal and operational model** for shifts and crews. It explicitly does **not** define:
* Mathematical heat index formulas or WBGT approximation algorithms.
* Occupational thermal safety thresholds or physiological limits.
* Statutory work-rest duration tables or clinical hydration ratios.
* Medical definitions of heat exhaustion or heat stroke.

Those domain definitions are documented separately in the heat-risk engine specifications:
* `docs/20_HEAT_RISK_ENGINE.md`
* `docs/21_HEAT_RISK_FACTORS.md`
* `docs/23_WORKLOAD_MODEL.md`
* `docs/24_EXPOSURE_MODEL.md`
* `docs/25_ACCLIMATIZATION_MODEL.md`
* `docs/26_RISK_LEVELS.md`
* `docs/27_RISK_RULES.md`

---

## 24. Final Worker Shift Principle

> **The worker shift model provides temporal and operational context for heat-risk response without turning the MVP into a medical, biometric, HR, or employee-surveillance system. It connects when and where work occurs with accountable supervisors, preventive actions, response windows, escalation, and traceability.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
