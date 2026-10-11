# Action Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the operational core of the **Heat Action Response Engine**: the **Action Model**.

In this platform, an action is the authoritative operational entity that translates abstract environmental heat signals and risk classifications into specific, accountable, and verifiable workplace interventions.

The transformation chain is explicit and unbroken:

```text
Environmental Risk
        ↓
Worksite Context
        ↓
Action Directive
        ↓
Accountable Owner
        ↓
Operational Response
        ↓
Verification
        ↓
Escalation (if unresolved)
        ↓
Immutable Audit
```

Without a structured Action Model, heat warnings remain passive notifications with no guarantee of real-world operational execution.

---

## 2. Definition of an Action

> **An action is a specific, accountable, traceable preventive task created in response to an identified heat-risk condition and assigned to a responsible person or role.**

### Operational Boundaries
To ensure clarity, the Action Model enforces strict boundaries regarding what an action is and is not:

#### What an Action IS:
* **Operational:** A concrete workplace mitigation instruction (e.g., mandate 15 minutes of shaded rest per hour, distribute 1 liter of chilled water per worker).
* **Contextual:** Tailored to the worksite's physical workload, direct sun exposure, and available cooling assets.
* **Assigned:** Explicitly bound to an authenticated human owner (e.g., Site Supervisor).
* **Trackable:** Governed by an active lifecycle with explicit response deadlines.
* **Auditable:** Recorded in an append-only event ledger capturing all state transitions, user interactions, and timestamps.

#### What an Action IS NOT:
* **Not a medical prescription:** It does not prescribe clinical medical treatments or pharmaceutical remedies.
* **Not a medical diagnosis:** It does not evaluate whether an individual worker suffers from heat exhaustion or clinical heat stroke.
* **Not a legal determination:** It does not constitute statutory liability adjudication or legal advice.
* **Not a regulatory certification:** It does not self-certify formal statutory compliance without human oversight.
* **Not an employee performance score:** It does not track worker speed, productivity, or break durations for HR evaluations.
* **Not an autonomous equipment command:** It does not directly actuate physical machinery, sirens, or automated HVAC systems.

---

## 3. Action Lifecycle

An action directive moves through a deterministic finite state machine from creation through resolution:

```text
       ┌───────────┐
       │  CREATED  │
       └─────┬─────┘
             │ (Assign Owner)
             ▼
       ┌───────────┐
       │ ASSIGNED  │
       └─────┬─────┘
             │ (Dispatch Alert)
             ▼
       ┌───────────┐
       │  NOTIFIED │
       └─────┬─────┘
             │
             ▼
 ┌───────────────────────┐   (Timeout Expired)   ┌─────────────┐
 │ PENDING_ACKNOWLEDGMENT│ ────────────────────> │ NO_RESPONSE │
 └───────────┬───────────┘                       └──────┬──────┘
             │                                          │
             │ (Supervisor Acknowledges)                │ (Trigger Escalation)
             ▼                                          ▼
     ┌──────────────┐                            ┌─────────────┐
     │ ACKNOWLEDGED │                            │  ESCALATED  │
     └───────┬──────┘                            └─────────────┘
             │                                          ▲
             │ (Initiate Field Controls)                │
             ▼                                          │ (Cannot Complete)
     ┌──────────────┐     (Obstacle Encountered) ┌──────┴──────┐
     │ IN_PROGRESS  │ ─────────────────────────> │   BLOCKED   │
     └───────┬──────┘                            └─────────────┘
             │
             │ (Controls Implemented)
             ▼
┌──────────────────────────┐
│   VERIFICATION_PENDING   │
└────────────┬─────────────┘
             │
             │ (Supervisor Confirms / Reports)
             ▼
       ┌───────────┐
       │ VERIFIED  │ (Marked RESOLVED in Audit)
       └───────────┘
```

### Alternative Terminal Paths
* **`CANCELLED`:** An action in `CREATED`, `ASSIGNED`, or `ACKNOWLEDGED` state may transition to `CANCELLED` if weather conditions rapidly normalize, a shift is formally cancelled, or an authorized Safety Manager determines the directive is no longer applicable.

---

## 4. Action State Definitions

Every action directive exists in exactly one authoritative lifecycle state:

1. **`CREATED`:** The deterministic action engine has generated the action directive from approved rule matrices, but an operational owner has not yet been bound.
2. **`ASSIGNED`:** An accountable operational owner (e.g., Primary Site Supervisor) has been identified and bound to the action record.
3. **`NOTIFIED`:** Outbound notification alerts (in-app, email, webhook) have been successfully dispatched to the assigned owner's communication endpoints. *(Crucial rule: Dispatching an alert does not constitute human acknowledgment).*
4. **`PENDING_ACKNOWLEDGMENT`:** The action is awaiting explicit supervisor receipt; the escalation countdown timer is actively ticking.
5. **`ACKNOWLEDGED`:** The authenticated supervisor has explicitly confirmed receipt and accepted responsibility for executing the directive. The escalation countdown timer is cancelled immediately.
6. **`IN_PROGRESS`:** The supervisor is actively coordinating the deployment of physical controls on the worksite (e.g., moving crews to shade, dispensing water).
7. **`VERIFICATION_PENDING`:** Physical controls are reported deployed, awaiting final self-reported confirmation checklist submission.
8. **`VERIFIED`:** The supervisor has submitted formal operational confirmation that site controls are active. *(Crucial rule: Software verification represents workflow attestation, not independent sensor-verified compliance).*
9. **`NO_RESPONSE`:** The policy-defined response window expired without supervisor acknowledgment, triggering immediate escalation.
10. **`BLOCKED`:** The supervisor acknowledged the directive but cannot execute physical controls due to an identified site impediment (e.g., water supply exhausted, shade canopy collapsed). Triggers immediate escalation.
11. **`ESCALATED`:** The action has exceeded response parameters or encountered a blocker; secondary alerting has transferred attention to the Safety Manager.
12. **`CANCELLED`:** The directive was rendered obsolete by operational stand-down or rapid weather normalization; reason is logged in the audit trail.

---

## 5. Action Attributes

The conceptual schema for an action directive captures complete operational, organizational, and temporal metadata:

| Conceptual Field | Purpose & Description |
| :--- | :--- |
| `action_id` | Unique, immutable identifier (UUID) for this operational action directive. |
| `organization_id` | Foreign identifier linking the action to the enterprise tenant. |
| `worksite_id` | Target operational worksite where the action must be executed. |
| `shift_id` | Associated operational shift instance during which the action is active. |
| `risk_event_id` | Foreign identifier linking the action to the exact triggering risk assessment. |
| `action_type` | Controlled vocabulary classification (e.g., `HYDRATION_READINESS`). |
| `title` | Concise, human-readable summary (e.g., "Implement 45/15 Work-Rest Cycle"). |
| `description` | Detailed operational instructions, specific ratios, and resource targets. |
| `priority` | Urgency classification (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`). |
| `owner_id` | User ID of the accountable individual currently responsible for execution. |
| `owner_role` | Operational role of the current owner (`SUPERVISOR`, `SAFETY_MANAGER`). |
| `status` | Current lifecycle state (from Section 4). |
| `created_at` | UTC timestamp of initial generation by the action engine. |
| `assigned_at` | UTC timestamp when an owner was bound to the action. |
| `acknowledged_at` | UTC timestamp when the owner confirmed receipt (null if unacknowledged). |
| `started_at` | UTC timestamp when field implementation commenced. |
| `verified_at` | UTC timestamp when execution confirmation was submitted. |
| `cancelled_at` | UTC timestamp of cancellation (null unless cancelled). |
| `response_deadline`| UTC timestamp when unacknowledged action triggers escalation. |
| `escalation_status`| Status indicator (`NOT_ESCALATED`, `ESCALATED`, `RESOLVED`). |
| `source_rule_id` | Identifier of the approved deterministic rule that generated this action. |
| `rule_version` | Version string of the rule matrix used for calculation. |
| `verification_required` | Boolean flag indicating whether confirmation is mandatory. |
| `created_by` | System process identifier or user ID who generated the action. |
| `updated_at` | UTC timestamp of the most recent action record update. |

---

## 6. Action Types

The action model utilizes an extensible controlled vocabulary representing operational workplace interventions. These examples represent product categories, not universal statutory mandates:

* **`HYDRATION_READINESS`:** Verifying potable water volumes, checking chilling dispensers, distributing electrolyte supplies, and scheduling mandatory drinking intervals.
* **`SHADE_COOLING_READINESS`:** Erecting mobile canopy shelters, unlocking shaded rest trailers, activating misting fans, or positioning ventilation blowers.
* **`SUPERVISOR_BRIEFING`:** Delivering a 60-second verbal crew talk (toolbox briefing) regarding peak thermal hours, peer buddy monitoring, and early heat strain awareness.
* **`WORK_REST_PLAN_REVIEW`:** Enforcing scheduled work/rest rotations (e.g., 45 min work / 15 min rest, or 30 min work / 30 min rest per hour).
* **`TASK_RESCHEDULING_REVIEW`:** Moving heavy physical labor (concrete casting, trenching) to cooler morning hours and transitioning midday crews to lighter or shaded tasks.
* **`WORKSITE_CHECK`:** Conducting physical inspections of water station accessibility, shade shelter walking distances, and crew welfare.
* **`CREW_COMMUNICATION`:** Distributing multilingual safety instructions or visual hazard notices across the worksite.
* **`RISK_REASSESSMENT`:** Requesting an on-demand weather update and risk re-evaluation following observed changes in cloud cover or wind speed.
* **`SAFETY_MANAGER_REVIEW`:** Flagging an escalated or complex site condition for formal managerial review and intervention.

---

## 7. Action Priority

Action priority reflects operational urgency and dictates escalation deadlines:

* **`LOW`:** Advisory adjustments during moderate environmental warming; generous acknowledgment window (e.g., 60 minutes).
* **`MEDIUM`:** Standard preventive controls (hydration staging, rest planning) during elevated heat; standard response window (e.g., 30 minutes).
* **`HIGH`:** Urgent operational modifications (mandatory work-rest cycles, shade enforcement) during acute heat-risk conditions; tight response window (e.g., 15 minutes in Live / 30 seconds in Demo).
* **`CRITICAL`:** Severe thermal danger requiring immediate operational stand-down or emergency cooling intervention; immediate response window (e.g., 5 minutes in Live / 15 seconds in Demo).

Priority levels are derived deterministically from approved organizational rule matrices; they are never assigned arbitrary or subjective numbers.

---

## 8. Action Ownership

Accountability requires unambiguous human ownership:

```text
Action Directive
       ↓
Responsible Owner (Supervisor)
       ↓
Explicit Acknowledgment (Receipt Accepted)
       ↓
Field Execution (Controls Implemented)
       ↓
Operational Verification (Execution Confirmed)
```

### Ownership Rules
1. **Primary Operational Owner:** The Site Supervisor (`SUPERVISOR`) assigned to the worksite or shift is the default operational owner.
2. **Escalation Owner:** If the supervisor does not respond, ownership does not dissolve; the Safety Manager (`SAFETY_MANAGER`) assumes oversight responsibility upon escalation.
3. **Admin Excluded from Safety Ownership:** The Organization Administrator (`ADMIN`) configures the system but is **not** an operational safety owner. Actions are never assigned to administrative roles.

---

## 9. Assignment Rules

1. **Mandatory Explicit Ownership:** Every active action directive must have an authenticated `owner_id`. The system rejects the creation of unassigned "floating" actions.
2. **Auditable Reassignment:** If a supervisor must transfer an action (e.g., shift end, medical departure), the reassignment event is recorded in the audit ledger with previous owner, new owner, timestamp, and justification.
3. **Preserved Compliance History:** Reassignment transfers the action but preserves the original generation timestamp and initial alert history. Reassignment does not erase past non-response.
4. **No Silent Drops:** An action directive remains active until explicitly `VERIFIED`, `RESOLVED`, or `CANCELLED` by an authorized user.

---

## 10. Action Content (The 8 Operational Dimensions)

Every action directive communicates eight essential dimensions:

```text
1. WHAT:              Mandate 45 min work / 15 min rest cycle; provide 1L water/worker/hr
2. WHY:               Heat Index reached 43°C combined with Heavy Civil Concrete Labor
3. WHERE:             North Bengaluru Construction Site — Pier 42 Casting Yard
4. WHEN:              Immediate effect for active Morning Shift (12:00–14:00)
5. WHO:               Assigned to Rahul Kumar (Civil Works Supervisor)
6. PRIORITY:          HIGH
7. EXPECTED RESPONSE: Acknowledge within 15 minutes; confirm physical canopy rest by 12:30
8. STATUS:            PENDING_ACKNOWLEDGMENT
```

### Canonical Fictional Example

```text
[ACTION DIRECTIVE #ACT-2026-0892]
Worksite:    North Bengaluru Construction Site (Pier 42)
Shift:       Morning Shift (06:00–14:00 IST)
Type:        WORK_REST_PLAN_REVIEW & HYDRATION_READINESS
Priority:    HIGH
Owner:       Rahul Kumar (Site Supervisor)
Status:      PENDING_ACKNOWLEDGMENT
Deadline:    12:15:00 IST (14 minutes remaining)

Directive Summary:
Ambient conditions (38°C temp, 65% humidity) have triggered HIGH HEAT RISK.
Heavy concrete placement crews must transition to 45 min work / 15 min rest rotations.
Ensure 50L chilled water dispensers at Canopy A are replenished immediately.
Enforce 2-person buddy checks for early heat strain symptoms.

Action Controls:
[ ACKNOWLEDGE DIRECTIVE ]   [ REPORT BLOCKED ]   [ VIEW AI EXPLANATION ]
```

---

## 11. Action Generation Pipeline

Action directives are generated through a deterministic, explainable pipeline:

```text
  Weather & Forecast Data (Temperature, Humidity, Solar, Wind)
                 │
                 ▼
  Deterministic Risk Engine (Published Heat Index / WBGT Logic)
                 │
                 ▼
  Objective Risk Classification (e.g., HIGH RISK)
                 │
                 ▼
  Worksite & Shift Context (Workload: HEAVY; Exposure: DIRECT_SUN)
                 │
                 ▼
  Approved Action Rule Matrix (Lookup matching protocol)
                 │
                 ▼
  Generated Action Directive (Bound to Supervisor & Shift)
```

The generation pipeline is strictly deterministic. Given identical environmental inputs and worksite context, the engine generates identical action directives every time.

---

## 12. AI-Assisted Action Interaction (Boundaries)

Artificial intelligence services (powered by NVIDIA AI infrastructure) provide assistive capabilities strictly outside the critical runtime path:

### Allowed AI Capabilities:
* **Rationale Explanation:** Explaining why a 45/15 cycle is necessary to dissipate metabolic heat.
* **Plain-Language Simplification:** Converting dense technical protocols into clear, concise summaries.
* **Multilingual Translation:** Translating directives into local field languages (Hindi, Kannada, Tamil) without altering numerical thresholds.
* **Toolbox Talk Drafting:** Generating a 60-second spoken briefing script for crew supervisors.
* **Grounded Operational Q&A:** Answering questions based strictly on currently loaded worksite context.

### Prohibited AI Actions:
* **No Autonomous Threshold Generation:** AI must never invent, modify, or tune thermal safety limits.
* **No Risk Downgrading:** AI cannot declare a site "safe" or lower a deterministic risk score.
* **No Directive Suppression:** AI cannot omit, remove, or weaken mandatory action items.
* **No Medical Diagnoses:** AI cannot evaluate individual worker health or diagnose thermal illness.

---

## 13. Action Verification

Verification represents the strongest operational confirmation available within the software-first MVP:

### MVP Verification Methods:
* **`SUPERVISOR_CONFIRMATION`:** Single-tap attestation by the authenticated supervisor confirming physical deployment.
* **`CHECKLIST_CONFIRMATION`:** Interactive checklist confirming specific sub-tasks (e.g., "[x] Water distributed", "[x] Shade canopy open", "[x] Crew briefing completed").
* **`MANUAL_STATUS_UPDATE`:** Formal resolution notes submitted by a Safety Manager during direct intervention.

### Future Verification Methods (Out of MVP Scope):
* **`PHOTO_EVIDENCE`:** Uploading geotagged, timestamped photos of shade canopies or water stations.
* **`SENSOR_SIGNAL`:** Environmental verification from on-site IoT black-globe monitors.
* **`INTEGRATED_SYSTEM_CONFIRMATION`:** Automated verification from telemetry-enabled jobsite equipment.

---

## 14. Action History & Audit Logging

Every state change in an action directive appends an immutable record to the worksite event ledger:

```text
{
  "event_id": "evt-ack-8921",
  "action_id": "act-2026-0892",
  "event_type": "ACTION_ACKNOWLEDGED",
  "actor_id": "usr-sup-rahul",
  "actor_role": "SUPERVISOR",
  "timestamp": "2026-10-07T12:02:14Z",
  "previous_status": "PENDING_ACKNOWLEDGMENT",
  "new_status": "ACKNOWLEDGED",
  "latency_seconds": 134,
  "metadata": {
    "ip_address": "103.21.x.x",
    "user_agent": "Mobile Safari / iOS 18"
  }
}
```

---

## 15. Duplicate Prevention (Idempotency)

To prevent alert fatigue and conflicting instructions, the engine enforces strict deduplication:

* **Contextual Hash:** Actions are keyed by `(worksite_id, shift_id, risk_tier, rule_id)`.
* **Suppression of Redundant Directives:** If an active action with identical parameters is already in `PENDING` or `ACKNOWLEDGED` state, subsequent automated polling runs update the existing action's timestamp rather than spawning duplicate action records.

---

## 16. Action Failure & Edge Cases

| Failure Case | System Behavior | User Visibility | Recovery Action |
| :--- | :--- | :--- | :--- |
| **No Supervisor Assigned** | System creates action in `ASSIGNMENT_BLOCKED` state | Urgent red banner on Safety Manager Console | Safety Manager assigns active supervisor |
| **Invalid / Deactivated Owner** | Flags action as orphaned; routes immediately to Safety Manager | Warning: "Supervisor account inactive" | Admin updates worksite supervisor |
| **Notification Failure** | Records `DISPATCH_FAILED`; keeps escalation timer active | Delivery warning tag on action card | Retries channel; escalation remains safety net |
| **No Acknowledgment (Timeout)**| Transitions state to `NO_RESPONSE` $\rightarrow$ `ESCALATED` | High-priority flashing alert on Safety Console | Safety Manager intervenes directly |
| **Action Blocked on Site** | Supervisor taps "Report Blocked"; state becomes `BLOCKED` | Urgent escalation: "Resource Blockage at Site" | Safety Manager coordinates supply relief |
| **Rapid Weather Normalization** | Weather drops below threshold; prompts supervisor | Notice: "Conditions Normalized — Close Action?" | Supervisor or Manager formally closes action |
| **Reassignment Mid-Action** | Transfers ownership; preserves original timestamps | Audit log shows reassignment event | New owner receives urgent notification |

---

## 17. Action vs. Alert

The distinction between a passive weather alert and an active operational action is fundamental:

| Dimension | Passive Weather Alert | Operational Preventive Action |
| :--- | :--- | :--- |
| **Nature** | Informational meteorological advisory | Accountable operational workplace task |
| **Ownership** | Broad broadcast; no designated owner | Bound to an explicit, authenticated supervisor |
| **Lifecycle** | Transient message; disappears after reading | Formal state machine (`PENDING` $\rightarrow$ `VERIFIED`) |
| **Accountability**| No acknowledgment expected or enforced | Mandatory acknowledgment with escalation countdown |
| **Escalation** | None; unresolved alerts silently expire | Automatic escalation to senior management on timeout |
| **Auditability** | Rarely logged beyond message delivery | Permanent, immutable ledger documenting response latency |

---

## 18. MVP vs. Future Action Model

| Action Capability | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **Deterministic Action Generation** | Yes (Rule-matrix driven) | Algorithmic optimization with multi-variable physics |
| **Supervisor Assignment** | Yes (Primary supervisor binding) | Multi-tier delegation and automated shift rotations |
| **Mandatory Acknowledgment** | Yes (Single-tap verification) | Biometric or passkey-verified acknowledgment |
| **Operational Verification** | Yes (Self-reported confirmation) | Automated computer vision & sensor-verified compliance |
| **Automated Escalation** | Yes (Policy timeout triggers) | Predictive escalation based on crew movement telemetry |
| **Immutable Audit Logging** | Yes (Append-only database ledger) | Cryptographically chained distributed audit ledgers |
| **AI Action Explanations** | Yes (Plain-language summaries) | Conversational voice-interactive field copilots |
| **Autonomous Equipment Actuation** | **No** (Software-first boundary) | IoT integration with misting fans and siren towers |

---

## 19. Canonical Demo Action

For hackathon demonstration and testing, the following fictional action is established:

```text
Action Directive:
  action_id:             "act-demo-2026-001"
  worksite_name:         "North Bengaluru Construction Site (Pier 42)"
  shift_name:            "Morning Concrete Pour"
  action_type:           HYDRATION_READINESS & WORK_REST_PLAN_REVIEW
  title:                 "Enforce 45/15 Work-Rest Cycle and Chilled Water Distribution"
  priority:              HIGH
  status:                PENDING_ACKNOWLEDGMENT
  assigned_owner:        "Rahul Kumar (Site Supervisor)"
  safety_manager:        "Ananya Rao (Safety Manager)"
  escalation_timeout:    30 seconds (Accelerated Demo Sandbox Timeout)

Operational Directives:
  1. Mandate 15 minutes of shaded rest per hour for Civil Concrete Crew.
  2. Replenish chilled water dispensers at Canopy Shelter A (Target: 1L/worker/hr).
  3. Conduct 60-second verbal briefing on peer buddy heat symptom monitoring.
```

---

## 20. Final Principle

> **An action is the bridge between knowing that heat risk exists and doing something operationally useful about it. Every important action should have clear ownership, understandable intent, visible status, an appropriate response path, and traceable history.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
