# Risk Levels — Heat Action Response Engine MVP

## 1. Purpose

This document defines the standardized **Risk Level Taxonomy** utilized across the **Heat Action Response Engine**.

A core failure of many environmental alert systems is presenting raw numerical values (e.g., "Heat Index 41.3°C") without translating them into a clear operational meaning. Front-line supervisors operating in demanding job site conditions require unambiguous, standardized risk tiers that immediately communicate operational urgency, required preventive actions, and expected response times.

```text
       AUTHORITATIVE DOMAIN THRESHOLDS
    (e.g., IMD Guidance / OSHA / Corporate Policy)
                         │
                         ▼
           DETERMINISTIC RULE MATRIX
       (Evaluates Weather + Worksite Context)
                         │
                         ▼
             STANDARDIZED RISK LEVEL
    (LOW | MODERATE | HIGH | CRITICAL | UNKNOWN)
                         │
                         ▼
        OPERATIONAL RESPONSE PROTOCOL
    (Action Urgency, Alerts, & Escalations)
```

### Critical Safety Boundary
A system risk level is an **operational risk-classification signal**. It is explicitly **not**:
* A medical emergency diagnosis or clinical triage score.
* A guarantee that no individual worker will experience heat strain at "Low" risk.
* A static legal determination of compliance or non-compliance.

---

## 2. Standardized Risk Taxonomy

The Heat Action Response Engine organizes operational heat risk into five discrete, standardized tiers:

| Risk Level | Operational Meaning | Core Operational Response | Notification Urgency | Escalation Implications |
| :--- | :--- | :--- | :--- | :--- |
| **`LOW`** | Environmental and contextual conditions pose minimal thermal strain to normal operations | Standard operations; ensure baseline potable water availability | Low / Informational (`INFO`); no intrusive alarms | No automated escalation required |
| **`MODERATE`** | Elevated conditions requiring increased vigilance, hydration awareness, and planning | Ensure readily accessible chilled water; remind crews of self-pacing; review forecast | Standard operational alert (`NORMAL`); dashboard badge | Standard timeout monitoring (e.g., 60 min) |
| **`HIGH`** | Serious thermal conditions; metabolic and radiant strain significantly narrow safety margins | Mandate scheduled work-rest cycles (e.g., 45/15); active canopy shade; mandatory hydration | High-priority alert (`HIGH`); visual banner; audible chime | Strict policy timeout (e.g., 15 min Live / 30s Demo) |
| **`CRITICAL`** | Extreme environmental heat creating acute thermal danger; unmitigated work is hazardous | Enforce aggressive work-rest (e.g., 30/30) or task rescheduling; mandatory supervisor check | Immediate emergency alert (`CRITICAL`); modal takeover | Rapid escalation (e.g., 5 min Live / 15s Demo) |
| **`UNKNOWN`** | Environmental data missing, stale, invalid, or worksite context unconfigured | Suspend automated safety assumptions; prompt immediate administrative data review | Diagnostic alert (`HIGH`); amber warning banner | Immediate prompt to Safety Manager |

---

## 3. Detailed Risk Level Specifications

### 3.1 Level: LOW
* **Operational Interpretation:** Ambient heat and humidity combined with active workload remain within normal baseline parameters. Normal convective and evaporative cooling mechanisms function effectively.
* **Required Data Quality:** `VALID` environmental observations required.
* **Action Directives Generated:** Standard baseline advisories (e.g., verify primary water dispenser volume).
* **System Behavior:** Worksite card displays green "LOW RISK" badge; automated hourly weather polling continues normally.

### 3.2 Level: MODERATE
* **Operational Interpretation:** Environmental heat is elevated. While not acutely dangerous for light tasks, sustained heavy physical labor or unshaded exposure begins to induce cardiovascular fatigue and sweat fluid deficits.
* **Required Data Quality:** `VALID` environmental observations required.
* **Action Directives Generated:** Hydration readiness checks; supervisor toolbox talks on hydration; advisory work-rest planning for heavy trades.
* **System Behavior:** Worksite card displays yellow "MODERATE RISK" badge; notification dispatched to supervisor.

### 3.3 Level: HIGH
* **Operational Interpretation:** Severe heat conditions where ambient temperature, humidity, solar exposure, and heavy metabolic labor combine to impair thermal dissipation. Physiological heat strain accumulates rapidly without structured rest in shaded shelters.
* **Required Data Quality:** `VALID` environmental observations required.
* **Action Directives Generated:** Mandatory work-rest rotations (e.g., 45 min work / 15 min rest); mandatory 1L/worker/hr hydration quotas; deployment of canopy shade shelters; active buddy system monitoring.
* **System Behavior:** Worksite card displays orange "HIGH RISK" badge; urgent notification dispatched; escalation timer starts actively ticking.

### 3.4 Level: CRITICAL
* **Operational Interpretation:** Acute, extreme thermal danger. Ambient conditions approach or exceed human physiological heat-dissipation limits, especially under direct sunlight or heavy physical exertion. Unmitigated physical labor poses imminent danger of acute heat illness.
* **Required Data Quality:** `VALID` environmental observations required.
* **Action Directives Generated:** Aggressive work-rest cycles (e.g., 30 min work / 30 min rest or 20/40); rescheduling strenuous physical labor to cooler hours; issuing potential site stand-down directives; continuous supervisory presence.
* **System Behavior:** Worksite card displays pulsing red "CRITICAL RISK" badge; emergency alerts dispatched across all channels; rapid escalation timer active.

### 3.5 Level: UNKNOWN (Data Integrity Guardrail)
* **Operational Interpretation:** Critical inputs necessary to calculate risk are missing, stale ($> 60$ min old), invalid, or conflicting. The system cannot reliably determine the safety state of the worksite.
* **Critical Guardrail Rule:**
  > **The system strictly refuses to classify UNKNOWN as LOW or SAFE.**
* **Action Directives Generated:** Prompts the Safety Manager and Supervisor to conduct manual on-site environmental assessment and verify network connectivity.
* **System Behavior:** Worksite card displays amber striped "UNKNOWN / DATA DEGRADED" badge; automated action generation is held until data integrity is restored.

---

## 4. Policy on Numerical Cutoffs

To prevent the creation of unsupported or legally vulnerable assumptions:
* **No Hard-Coded Arbitrary Cutoffs:** This document does **not** hard-code specific universal temperatures (e.g., "35°C is always High Risk").
* **Configuration-Driven Mapping:** Threshold values are mapped through the versioned Rule Engine based on authoritative domain sources (e.g., IMD Heat Action Plans, NIOSH criteria, or approved enterprise safety standards).
* **Illustrative Values in Demos:** Any numerical thresholds displayed during hackathon demonstrations are strictly labeled as:
  > *Illustrative demonstration values only; not an authoritative occupational safety standard.*

---

## 5. Operational Risk vs. Medical Emergency

The system maintains a vital distinction between operational risk classification and medical emergencies:

```text
OPERATIONAL RISK LEVEL (System Output)
• Preventive classification based on atmospheric & contextual inputs
• Drives administrative controls: water, shade, rest intervals
• Goal: PREVENT heat illness before physiological breakdown occurs
                         ≠
MEDICAL EMERGENCY (Clinical Reality)
• Individual physiological collapse (confusion, loss of consciousness, heat stroke)
• Requires immediate 911 / emergency medical services (EMS) dispatch
• Software risk engine is NOT an emergency medical dispatch tool
```

---

## 6. Design Principle

> **Risk levels must translate complex environmental and contextual conditions into unambiguous operational urgency. The system must fail safely into UNKNOWN whenever data integrity is compromised, and it must never create a false sense of security by assuming missing data represents safe conditions.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
