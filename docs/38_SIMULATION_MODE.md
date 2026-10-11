# 38 Simulation Mode Specification

## 1. Purpose

This document specifies the architecture, scenario definitions, execution controls, and safety isolation guardrails for **Simulation Mode** within the **Heat Action Response Engine**.

Simulation Mode provides a deterministic, reproducible, and verifiable operational sandbox for:
* **Hackathon & Evaluation Demonstrations:** Enabling judges and stakeholders to witness the complete end-to-end heat response workflow in minutes.
* **Automated Regression Testing:** Validating deterministic rule changes against standardized environmental scenarios.
* **Supervisory Onboarding & Training:** Training worksite supervisors and safety managers on action acknowledgment and escalation protocols without altering real-world records.
* **Engineering Development:** Testing user interfaces, notification dispatches, and audit trails without depending on live weather feeds or external API availability.

Simulation Mode is strictly an **isolated demonstration and testing harness**. It is never confused with, nor connected to, live occupational safety operations.

---

## 2. Simulation Architecture

A foundational architectural requirement is that Simulation Mode exercises the identical downstream domain logic as the production system:

```text
CONTROLLED SIMULATION INPUT (Synthetic Meteorological Payload)
                     │
                     ▼
         SIMULATION WEATHER SOURCE
                     │
                     ▼
               NORMALIZATION (Standard Schemas & Units)
                     │
                     ▼
                VALIDATION (Integrity & Sanity Checks)
                     │
                     ▼
         CANONICAL WEATHER DATA MODEL (Identical Entity Contracts)
                     │
                     ▼
           SAME HEAT RISK ENGINE (Identical Deterministic Rules)
                     │
                     ▼
             SAME ACTION ENGINE (Identical Action Generation)
                     │
                     ▼
             SAME NOTIFICATION (Targeted Supervisory Dispatch)
                     │
                     ▼
           SAME ACKNOWLEDGMENT (Supervisor Check & Response)
                     │
                     ▼
             SAME ESCALATION (Timeout & Safety Manager Handoff)
                     │
                     ▼
               SAME AUDIT LOG (Forensic Operational Trail)
```

By passing synthetic scenarios through the identical normalization, validation, risk engine, and action pipelines, Simulation Mode guarantees that a successful demonstration directly reflects real-world system capability.

---

## 3. Simulation vs. Production Comparison

The operational boundaries between production and simulation are strictly partitioned:

| Dimension | Production Environment | Simulation Mode |
| :--- | :--- | :--- |
| **Weather Source** | Live external approved APIs (Open-Meteo, IMD) or physical sensors | Controlled synthetic scenarios with reproducible values |
| **Data Nature** | Real-world atmospheric conditions | Pre-scripted, deterministic test fixtures |
| **User Identities** | Authenticated industrial employees and managers | Fictional persona accounts (e.g., Rahul Kumar, Ananya Rao) |
| **Time Execution** | Real-time operational hours (e.g., 30–60 min timeouts) | Accelerated demo timing (e.g., 30–60 second timeouts) |
| **Operational Purpose**| Life-safety hazard mitigation and compliance | Technology demonstration, validation, and training |
| **Safety Interpretation**| Binding occupational workplace directives | Non-operational demonstration; not real-world safety advice |

---

## 4. Scenario Entity Model

Every simulation scenario is defined as a structured, declarative fixture:

```yaml
simulation_scenario:
  scenario_id: "SCENARIO-DEMO-03-HIGH-HEAT"
  scenario_name: "Severe Mid-Day Heat Wave Spike"
  description: "Simulates sudden temperature and humidity spike during concrete pour."
  worksite:
    worksite_id: "WS-BLR-NORTH-04"
    name: "North Bengaluru Construction Site (Demo)"
    location: "Bengaluru Urban, Karnataka"
    timezone: "Asia/Kolkata"
  environmental_fixture:
    dry_bulb_temperature_c: 38.5
    relative_humidity_percent: 55.0
    wind_speed_kmh: 8.0
    heat_index_c: 48.2
    data_type: "SIMULATION"
    provenance_tag: "SYNTHETIC_FIXTURE_V1"
  operational_context:
    workload_category: "HEAVY"
    exposure_environment: "DIRECT_SUN"
    acclimatization_state: "UNACCLIMATIZED"
    active_shift: "DAY_SHIFT_0900_1700"
  expected_outcomes:
    expected_risk_tier: "HIGH"
    expected_actions:
      - "ACT-REST-BREAK-45MIN"
      - "ACT-HYDRATION-ELECTROLYTE"
      - "ACT-SHADE-ROTATION"
    expected_escalation_target: "SAFETY_MANAGER"
```

---

## 5. Required Demonstration Scenarios

The platform provides five pre-configured scenarios illustrating the system's capabilities:

### Scenario A — Normal Operating Baseline (LOW Risk)
* **Conditions:** Ambient temperature $26.0^\circ\text{C}$, relative humidity 50%, moderate indoor workload.
* **Outcome:** Risk engine evaluates conditions as `LOW`. Standard hydration guidelines displayed; no emergency actions generated.

### Scenario B — Elevated Environmental Heat (MODERATE Risk)
* **Conditions:** Ambient temperature $33.0^\circ\text{C}$, relative humidity 60%, outdoor sheltered assembly.
* **Outcome:** Risk engine evaluates conditions as `MODERATE`. Preemptive hydration reminders and shaded rest checks generated and assigned to supervisor.

### Scenario C — High-Risk Response Workflow (HIGH Risk & Acknowledgment)
* **Conditions:** Ambient temperature $37.5^\circ\text{C}$, relative humidity 52%, heavy concrete reinforcement in direct sun.
* **Outcome:** Risk engine evaluates conditions as `HIGH`. Urgent mandatory rest break action generated, assigned to Site Supervisor **Rahul Kumar**, notification delivered, supervisor acknowledges and logs mitigation verification.

### Scenario D — Unacknowledged Action Escalation (Escalation Pathway)
* **Conditions:** Ambient temperature $39.0^\circ\text{C}$, relative humidity 58%, unacclimatized roofing crew.
* **Outcome:** Urgent heat action generated and assigned to supervisor. Acknowledgment timer expires without response. Action automatically escalates to Safety Manager **Ananya Rao**, with complete forensic audit trail recorded.

### Scenario E — Weather Data Failure Handling (System Resilience)
* **Conditions:** External weather API connection severed (simulated timeout/503).
* **Outcome:** System flags data quality as `MISSING` / `STALE`. Dashboard displays prominent monitoring warning. The system refuses to assume a false low-risk state; existing safety protocols remain enforced.

---

## 6. Accelerated Demo Timing

In production, supervisor acknowledgment windows span 15 to 45 minutes to accommodate field movement. For hackathon presentations and automated testing, Simulation Mode supports accelerated execution:

```text
PRODUCTION TIMING                  DEMONSTRATION TIMING
Acknowledgment Window: 30 minutes ──► 30 seconds
Escalation Grace     : 15 minutes ──► 15 seconds
Refresh Cycle        : 60 minutes ──► On-demand / Step-advance
```

> [!WARNING]
> **Demo Timing Disclaimer:**
> Accelerated demonstration timing is designed strictly for evaluation efficiency. It is **not** an occupational safety standard and must never be represented as real-world operational response timing.

---

## 7. Synthetic Data Labeling and Isolation

All data generated during simulation sessions is strictly isolated from production records:

* **Mandatory Semantic Tagging:** Every simulated record carries `data_type = SIMULATION` and `is_synthetic = true`.
* **Zero Contamination:** Simulation records are stored in dedicated test partitions or temporary session databases that cannot contaminate production audit tables.
* **Realistic Anonymity:** Scenario fixtures use fictional worker and supervisor names. Real employee personal data is never loaded into simulation runs.

---

## 8. Playback and Lifecycle Controls

Simulation Mode provides deterministic execution controls for presentation flow:

```text
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  START  │ ───► │  PAUSE  │ ───► │  RESET  │ ───► │ REPLAY  │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
```

* **START:** Initiates the scenario pipeline from the opening environmental state.
* **PAUSE:** Freezes simulation clocks and timers, allowing presenters to explain rule logic.
* **RESET:** Purges session data and returns the worksite state to clean baseline.
* **REPLAY:** Re-executes the exact scenario event sequence deterministically.

---

## 9. Deterministic Reproducibility

Evaluators require consistency. Under Simulation Mode:
$$\text{Scenario Fixture } X + \text{Rule Version } Y \equiv \text{Identical Risk Tier and Action Sequence}$$

Random seeds, non-deterministic clock checks, or stochastic AI outputs are eliminated from the core evaluation loop. A scenario run produces identical outputs whether executed on an engineer’s laptop or during an executive demo.

---

## 10. Simulation Safety Boundaries

To prevent accidental real-world disruptions during testing, Simulation Mode enforces strict safeguards:

1. **No External SMS / Email Dispatches:** Real external cellular networks or messaging gateways are bypassed; notifications route strictly to the demo interface.
2. **No Emergency Alert Escalation:** Simulation runs cannot trigger real-world facility sirens or municipal emergency services.
3. **No Modification of Core Rules:** Scenarios cannot alter production rule thresholds or bypass security authorization models.

---

## 11. Visual Demonstration Indicator

Whenever Simulation Mode is engaged, the user interface displays prominent, persistent visual indicators across all dashboard screens:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🔶 SIMULATION MODE ACTIVE — SYNTHETIC DEMONSTRATION ENVIRONMENT       │
│ Scenario: Scenario D (Unacknowledged Escalation) | Time Scale: 60x     │
└────────────────────────────────────────────────────────────────────────┘
```

This persistent indicator prevents any ambiguity regarding whether live occupational safety data or synthetic demonstration data is being viewed.

---

## 12. Preferred Judge Demonstration Flow

For structured evaluation and hackathon judging, the platform executes a 3-minute scripted end-to-end journey:

```text
1. Select Worksite     : Presenter opens "North Bengaluru Construction Site (Demo)"
2. Display Forecast    : Dashboard shows incoming afternoon heat spike (38.5°C)
3. Risk Detected       : Deterministic engine evaluates conditions as HIGH RISK
4. Explain Risk        : AI Assistant provides plain-language justification of rules
5. Action Generated    : Action Engine creates "Mandatory 45-min Shade & Hydration Break"
6. Assign Supervisor   : Action automatically assigned to Site Supervisor Rahul Kumar
7. Deliver Notification: In-app supervisory card appears with countdown timer
8. Simulate Inaction   : Presenter allows 30-second acknowledgment timer to elapse
9. Automatic Escalation: Engine escalates unacknowledged hazard to Safety Manager Ananya Rao
10. Incident Audited   : Presenter opens immutable audit trail showing exact timeline
```

---

## 13. Assistive AI Demonstration Role

During simulation demonstrations, Generative AI capabilities may be showcased in an auxiliary capacity:

* **Plain-Language Explanations:** Explaining *why* a specific combination of humidity and concrete pouring triggered a High Risk alert.
* **Multilingual Translation:** Rendering supervisory action cards into regional Indian languages (e.g., Kannada, Hindi) for field workers.
* **Contextual Summaries:** Drafting an executive shift briefing for the safety manager.

However, the demonstration explicitly proves that the entire core safety workflow—risk detection, action creation, assignment, countdown tracking, and escalation—functions deterministically **without requiring AI assistance**.

---

## 14. Design Principle

> **Simulation Mode demonstrates the product's operational workflow without pretending that synthetic data is real-world safety evidence.**
