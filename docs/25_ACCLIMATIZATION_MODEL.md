# Acclimatization Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the **Acclimatization Model** within the **Heat Action Response Engine**.

In occupational medicine and industrial hygiene, **heat acclimatization** is recognized as one of the most critical physiological defenses against severe thermal illness. A fully acclimatized individual sweats earlier, in greater volume, and with lower electrolyte loss, while maintaining lower resting and working heart rates and lower core body temperatures compared to an unacclimatized individual performing identical labor under identical ambient conditions.

Epidemiological studies and occupational safety agencies (such as NIOSH and OSHA) consistently document that a disproportionate percentage of occupational heat fatalities occur during a worker's **first few days on the job** or upon returning from extended absences.

```text
       ACCLIMATIZATION CONTEXT
    (New or Returning Work Group)
                 │
                 ▼
  DETERMINISTIC CONTEXT MODIFIER
(Heightened susceptibility to heat)
                 │
                 ▼
    ADJUSTED RISK ASSESSMENT
  (Elevates operational vigilance)
                 │
                 ▼
   PREVENTIVE ACTION DIRECTIVE
(Enhanced Buddy Checks & Shaded Rest)
```

### Critical Operational Boundary
The Acclimatization Model is an **operational planning construct**. It is explicitly **not**:
* An individual medical fitness assessment.
* A clinical biomarker measurement of physiological heat adaptation.
* A medical clearance mechanism declaring a specific human "acclimatized."

---

## 2. Privacy & Data Minimization Safeguards

A foundational architectural requirement of this platform is the protection of worker privacy:

### What the System NEVER Collects:
* Personal medical records or prescription drug histories.
* Prior diagnoses of heat exhaustion, heat stroke, or cardiovascular illness.
* Individual biometric data, core body temperature telemetry, or sweat rate tests.
* Personal reasons for employee leaves of absence or medical notes.

### Privacy-Preserving Group Abstraction:
Instead of tracking individual workers, acclimatization is managed exclusively at the **Work Group**, **Shift**, or **Worksite** level:

```text
INVASIVE ANTI-PATTERN (Explicitly Prohibited)
Individual Worker Profile ──> Personal Medical History ──> Physiological Acclimatization Score

PRIVACY-PRESERVING MVP MODEL (Authoritative)
Worksite / Work Group ──> Operational Acclimatization Context ──> Group-Level Mitigation Protocol
```

---

## 3. Operational Acclimatization Categories

The platform defines three standardized operational categories:

| Operational Category | Contextual Workplace Definition | Typical Operational Scenario | Recommended Operational Controls |
| :--- | :--- | :--- | :--- |
| **`ESTABLISHED`** | Workforce has performed physical labor in local seasonal climate continuously for $\ge 14$ days | Existing local civil crew working through mid-summer contract | Standard deterministic work-rest and hydration protocols |
| **`NEW_OR_RETURNING`** | Crew includes newly mobilized workers or individuals returning after $> 7$ days of absence | Newly mobilized subcontractor crew; post-holiday mobilization; sudden heat wave onset | Staged workload ramp-up; enhanced peer buddy monitoring; frequent shaded rest |
| **`UNKNOWN`** | Workforce acclimatization context has not been configured | Newly registered worksite; subcontractor crew with unverified schedule | Conservative baseline; prompts supervisor to verify crew background |

---

## 4. Understanding Uncertainty & AI Boundaries

### 4.1 System Limitations
The platform acknowledges clear physiological boundaries:
* **Cannot Infer Biology from Weather:** The system cannot determine human physiological adaptation from atmospheric meteorological feeds alone.
* **Cannot Generalize to Individuals:** An operational designation of `ESTABLISHED` does not guarantee that every individual crew member is immune to heat exhaustion.

### 4.2 Strict Generative AI Boundaries
* **No Casual Inferences:** Generative AI assistants must **never** infer, predict, or guess workforce acclimatization from casual chat conversations, weather trends, or informal shift notes.
* **No Medical Determinations:** AI assistants are prohibited from declaring a worker or crew "safely acclimatized" or medically cleared for unshaded physical exertion.
* **Explicit Role:** AI features are restricted to explaining approved acclimatization protocols and drafting supervisor briefing talking points.

---

## 5. Organizational Acclimatization Framework

Authoritative occupational guidance (such as NIOSH recommended criteria) advocates for gradual exposure schedules (the "Rule of 20%"):
* **New Workers:** Exposing new crews to no more than 20% of normal physical duration on Day 1, increasing by no more than 20% each subsequent day.
* **Returning Workers:** For crews returning from extended absences, initiating exposure at 50% on Day 1, 60% on Day 2, 80% on Day 3, and 100% on Day 4.

The Heat Action Response Engine operationalizes these recommendations by allowing supervisors and planners to select structured acclimatization protocols that tailor generated work-rest ratios during crew onboarding.

---

## 6. Relationship to Risk Assessment and Action Generation

Acclimatization context acts as a deterministic modifier in the risk and action pipeline:

```text
  Ambient Heat Index: 37°C (Moderate Environmental Warning)
                         │
                         ▼
  Evaluate Acclimatization Context:
    • If ESTABLISHED: Risk remains MODERATE; standard hydration breaks advised.
    • If NEW_OR_RETURNING: Contextual rule triggers elevation to HIGH RISK.
                         │
                         ▼
  Dispatch to Action Engine:
    • Action Directive mandates shortened work intervals.
    • Mandates 2-person buddy system for symptom awareness.
    • Generates supervisor briefing script focusing on new worker safety.
```

### Supported Preventive Actions:
* **Enhanced Peer Buddy Monitoring:** Pairing new or returning workers with experienced personnel instructed to monitor each other for early heat strain signs (confusion, unsteady gait, excessive sweating cessation).
* **Scheduled Recovery Ramps:** Structuring shorter work bouts with mandatory shade pauses during peak afternoon hours.
* **Supervisor Field Awareness:** Alerting the on-site supervisor to maintain visual contact with newly mobilized subcontractor teams.

---

## 7. Canonical Fictional Acclimatization Scenario

```text
Worksite:             North Bengaluru Construction Site (Pier 42)
Shift:                Morning Structural Concrete Pour
Target Work Group:    Subcontractor Steel Assembly Crew (15 Workers)

Acclimatization Context:
  status:             NEW_OR_RETURNING
  justification:      Crew mobilized yesterday from a cooler northern region;
                      Day 2 on site during peak seasonal summer heat wave.

Engine Assessment:
  Ambient Heat Index: 38.5°C
  Rule Trigger:       R05_ACCLIMATIZATION_MODIFIER (Elevates risk from MODERATE to HIGH)

Action Directive Generated:
  • Mandate 45 min work / 15 min rest cycle in shade canopy.
  • Pair workers in 2-person buddy teams for continuous monitoring.
  • Deliver 60-second toolbox talk on early heat exhaustion symptoms.
```

---

## 8. Design Principle

> **Acclimatization is a recognized biological reality that profoundly influences workplace vulnerability. By modeling acclimatization as an operational, group-level planning context, the platform provides proactive safeguards for new and returning workers without compromising personal medical privacy.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
