# Safety Guardrails — Heat Action Response Engine MVP

## 1. Purpose

This document defines the comprehensive **Safety Guardrails** governing the **Heat Action Response Engine**.

Because this platform operates in the domain of occupational health, physical human labor, and life safety, architectural boundaries must be enforced with absolute rigor. The software must never overstep into clinical medical diagnosis, produce a false sense of security, operate autonomously without human supervision, or permit non-deterministic artificial intelligence models to control safety-critical decisions.

```text
       AUTHORITATIVE DOMAIN GUIDANCE & POLICY
                         │
                         ▼
             DETERMINISTIC SAFETY CORE
        (Mathematical Rules & State Machines)
                         │
                         ▼
        OPERATIONAL MITIGATION & DIRECTIVES
                         │
                         ▼
       HUMAN SUPERVISION & ACCOUNTABILITY
                         │
                         ▼
               IMMUTABLE AUDIT TRAIL

[ AI LAYER: Strictly Assistive Explanation & Drafting Only ]
[ AI LAYER: Explicitly Blocked from Altering Safety State   ]
```

This document establishes the binding architectural constraints that ensure the platform remains dependable, legally defensible, and safe.

---

## 2. Guardrail Framework Overview

The system enforces ten operational guardrail categories:

```text
 1. DOMAIN GUARDRAILS         ──> No medical overreach, legal adjudications, or clinical claims
 2. DATA GUARDRAILS           ──> Validation, provenance, staleness detection, and sensor clarity
 3. RISK ENGINE GUARDRAILS    ──> 100% deterministic, explainable, versioned, and fail-safe
 4. ACTION GUARDRAILS         ──> Explicit ownership, concrete controls, no autonomous machinery
 5. AI GOVERNANCE GUARDRAILS  ──> Strictly assistive; zero authority over safety thresholds
 6. HUMAN OVERSIGHT           ──> Consequential decisions remain with authenticated humans
 7. PRIVACY SAFEGUARDS        ──> Group abstractions; zero worker biometric or medical tracking
 8. AUDIT INTEGRITY           ──> Append-only ledgers; tamper-evident historical preservation
 9. FAILURE-SAFE BEHAVIOR     ──> Missing data yields UNKNOWN; no silent assumptions of safety
10. DEMO BOUNDARIES           ──> Accelerated demo timers strictly segregated from live standards
```

---

## 3. Domain Guardrails (No Medical or Legal Overreach)

The Heat Action Response Engine explicitly restricts its operational domain:

* **No Medical Diagnoses:** The system does not diagnose heat exhaustion, heat stroke, dehydration, or any physiological medical disorder.
* **No Medical Prescriptions:** The system does not prescribe clinical medical treatments, pharmaceutical drugs, or intravenous fluids.
* **No Fitness-for-Duty Determinations:** The system cannot declare an individual human worker "medically fit" or "medically unfit" for work.
* **No Emergency Medical Services (EMS) Replacement:** In the event of acute worker collapse, confusion, or medical trauma, the platform does not act as an emergency dispatch service; on-site personnel must follow local standard emergency medical protocols (e.g., calling 911 or local emergency numbers).
* **No Replacement for Certified Safety Professionals:** The software is an operational coordination tool that executes organizational policies; it does not replace the professional judgment of certified industrial hygienists, ergonomists, or safety directors.
* **No Statutory Compliance Certifications:** The system generates auditable operational records; it does not self-certify formal statutory or regulatory compliance.

---

## 4. Data Guardrails (Data Integrity & Provenance)

To ensure the engine never operates on misleading or corrupted inputs:

* **Strict Input Boundary Validation:** Temperature (-20°C to 60°C) and humidity (0% to 100%) inputs are strictly validated. Out-of-bounds readings are rejected immediately.
* **Provenance Preservation:** Every ingested environmental record permanently captures source provider (e.g., Open-Meteo), query coordinates, and retrieval timestamps.
* **Staleness Detection:** Weather observations older than 60 minutes are automatically flagged as `STALE`, displaying visual warnings across management interfaces.
* **Distinction Between Forecasts and Physical Sensors:** User interfaces and API documentation explicitly identify meteorological data as regional grid models, strictly prohibiting marketing claims that describe API data as on-site physical sensor measurements.

---

## 5. Risk Engine Guardrails (Deterministic Authority)

The decision-making core is strictly protected against non-deterministic drift:

* **100% Deterministic Code:** Given identical inputs, context, and rule versions, the engine produces identical risk scores and reason codes every single time.
* **No Hidden AI Thresholds:** Machine learning or generative AI algorithms are strictly barred from calculating, altering, or evaluating risk scores.
* **No Unsupported Arbitrary Numbers:** Operational thresholds are mapped through configuration-driven matrices derived from verified domain sources (e.g., IMD Heat Action Plans, NIOSH criteria).
* **Immutable Version Binding:** Every risk assessment permanently binds the semantic version string of the rule matrix evaluated.

---

## 6. Action Guardrails (Operational Accountability)

Preventive directives must lead to verifiable human action:

* **Mandatory Explicit Ownership:** An active action directive must have an authenticated human owner (`SUPERVISOR`). Unassigned actions are rejected.
* **No Autonomous Equipment Actuation:** The software does not actuate physical valves, sirens, or automated machinery; all physical site adjustments are executed by human personnel.
* **No Silent Action Deletion:** Actions cannot be deleted from the database. Directives can only transition through authorized lifecycle states (`ACKNOWLEDGED`, `CONFIRMED`, `CANCELLED`).

---

## 7. AI Governance Guardrails (Assistive Isolation)

Artificial intelligence features (powered by NVIDIA AI infrastructure) are bounded by strict architectural constraints:

### Permitted AI Functions:
* Summarizing complex multi-variable risk drivers in plain language.
* Drafting concise 60-second verbal crew talks (toolbox briefings) from approved directives.
* Translating approved directives into regional languages (Hindi, Kannada, Spanish) without altering numbers.
* Synthesizing incident chronologies from audit ledgers for executive safety reports.
* Answering grounded questions regarding active worksite context.

### Prohibited AI Functions:
$$\text{AI CANNOT: Overrule Rules } \quad|\quad \text{Alter Thresholds } \quad|\quad \text{Suppress Actions } \quad|\quad \text{Declare Site "Safe"} \quad|\quad \text{Diagnose Illness}$$

* **Isolation from Critical Runtime Path:** An outage, timeout, or rate-limit error from external AI APIs **never halts or impedes** the core deterministic safety workflow (ingestion, calculation, action generation, notification, acknowledgment, escalation, audit).

---

## 8. Human Oversight Guardrails

The platform adheres to the fundamental principle of **Human-in-the-Loop**:

```text
SYSTEM EVALUATION (Deterministic Risk Engine)
                 │
                 ▼
     HUMAN REVIEW & ACKNOWLEDGMENT (Site Supervisor)
                 │
                 ▼
       HUMAN PHYSICAL DEPLOYMENT (Water, Shade, Rest)
                 │
                 ▼
     HUMAN CONFIRMATION & OVERSIGHT (Safety Manager)
```

The system provides intelligent decision support and automated accountability timers, but the authority and responsibility for physical workplace safety remain entirely with authenticated human supervisors and safety managers.

---

## 9. Privacy and Anti-Surveillance Guardrails

The platform coordinates workplace safety without compromising worker dignity:

* **Zero Personal Medical Data:** Medical histories, personal health conditions, prescription drug usage, and doctor notes are completely excluded from the platform.
* **Zero Biometric Tracking:** Core body temperature, skin temperature, heart rate, and wearable physiological metrics are not required, collected, or stored.
* **No Individual Worker Surveillance:** Systems manage safety through anonymous **Work Group** abstractions (`Civil Crew`, `Road Crew`), strictly rejecting individual worker GPS tracking, worker speed monitoring, or employee productivity scoring.
* **No HR Disciplinary Repurposing:** Safety break records and response timers exist exclusively for safety compliance; using safety logs for wage deductions or employee performance penalties is explicitly prohibited.

---

## 10. Audit Integrity Guardrails

To ensure legal defensibility and transparency:
* **Append-Only Event Ledger:** The audit database enforces strict `INSERT`-only permissions at the database tier; `UPDATE` and `DELETE` commands are permanently disabled.
* **Tamper-Evident History:** Historical event records cannot be backdated or altered by any user role, including the `ADMIN`.

---

## 11. Failure-Safe Behavior (Graceful Degradation)

When system components fail, the platform fails safely:

* **Weather API Unavailable:** Worksite status transitions to `WEATHER_UNAVAILABLE`; risk tier becomes `UNKNOWN`. The system refuses to silently infer low risk.
* **Worksite Context Missing:** System applies conservative baseline rules and alerts management to configure required site context.
* **Supervisor Unresponsive:** Escalation engine fires automatically upon timeout expiration, transferring ownership to the Safety Manager.
* **Notification Network Failure:** Escalation countdown timers continue running unabated; delivery failures are highlighted prominently on web dashboards.
* **AI Service Offline:** UI gracefully falls back to displaying raw deterministic action cards with a clean informational notice.

---

## 12. Demonstration and Sandbox Guardrails

To prevent testing features from compromising real safety:
* **Accelerated Demo Timers Labeled:** When hackathon demonstration mode compresses escalation timers (e.g., to 30 seconds), interfaces display prominent, persistent banners:
  > **DEMO SANDBOX TIMING ACTIVE (30s) — NOT AN AUTHORITATIVE OCCUPATIONAL SAFETY STANDARD.**
* **Sandbox Data Isolation:** Simulated demo weather injections are sandboxed from live production monitoring databases.

---

## 13. Emergency Medical Disclaimer

> **IMPORTANT DISCLAIMER:** The Heat Action Response Engine is a preventive operational management system designed to coordinate workplace controls before heat illness occurs. It is **not** an emergency medical alert system or clinical monitoring device. If a worker exhibits signs of heat stroke, confusion, loss of consciousness, or physical distress, on-site personnel must immediately call local Emergency Medical Services (EMS) and initiate standard on-site first aid cooling protocols.

---

## 14. Design Principle

> **Safety should never depend on an AI model behaving correctly. The deterministic safety layer, authoritative domain guidance, human oversight, and auditability remain the foundation of the system.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
