# Escalation Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the automated accountability failsafe of the **Heat Action Response Engine**: the **Escalation Model**.

In workplace safety operations, notifications alone are insufficient. When environmental conditions reach dangerous thermal levels, an unacknowledged or unexecuted directive cannot be allowed to silently dissolve into the background.

The Escalation Model ensures that when expected front-line responses do not occur within policy-defined timeframes, attention and responsibility are systematically and transparently elevated to senior operational personnel:

```text
       ACTION ASSIGNED TO SUPERVISOR
                     │
                     ▼
             WAIT FOR RESPONSE
             (Active Countdown)
                     │
              RESPONSE RECEIVED?
               /              \
         YES  /                \  NO (Timeout Reached)
             ▼                  ▼
     CONTINUE NORMAL     TRIGGER ESCALATION
     FIELD WORKFLOW      (Alert Safety Manager)
```

Without an active escalation mechanism, heat-safety operations remain open-loop and vulnerable to human oversight.

---

## 2. Definition of Escalation

> **Escalation is the controlled transfer of attention or responsibility to a higher-level operational role when an expected response does not occur or an action cannot be completed within its configured response conditions.**

### Critical Operational Boundary
To maintain ethical, legal, and operational integrity, escalation is strictly defined by what it is **not**:
* **Not an employee punishment:** Escalation is an operational safeguard designed to protect worker safety, not a disciplinary mechanism to penalize supervisors.
* **Not employee performance monitoring:** It is not an HR metric used to calculate worker efficiency, bonus deductions, or performance ratings.
* **Not an emergency medical determination:** Escalation signals that a software action is unacknowledged; it does not indicate that a worker has suffered physical trauma or clinical heat stroke.
* **Not legal liability enforcement:** It provides an operational audit trail, not a statutory liability judgment.
* **Not proof of physical worker harm:** It reflects software response latency, not physiological injury.

---

## 3. Escalation Triggers

The system identifies five distinct operational conditions that trigger an escalation event:

* **`E01 — No Acknowledgment (Timeout)`:** The assigned supervisor fails to acknowledge an active directive within the policy-defined response window (e.g., 15 minutes in Live mode / 30 seconds in Demo mode).
* **`E02 — Action Blocked (Site Impediment)`:** The supervisor acknowledges the directive but reports that physical execution is blocked due to on-site resource failures (e.g., depleted potable water, damaged shade structure, broken ice machinery).
* **`E03 — Verification Pending (Execution Timeout)`:** The directive was acknowledged, but the supervisor failed to submit operational confirmation of physical deployment within the scheduled operational interval.
* **`E04 — Owner Unavailable / Invalid`:** The worksite's assigned supervisor account is deactivated, invalid, or unassigned when a high-risk directive is generated.
* **`E05 — Repeated Unresolved Action`:** A worksite remains under sustained `HIGH` or `EXTREME` risk across multiple sequential polling cycles without resolution, requiring managerial intervention.

---

## 4. Escalation States

The escalation lifecycle is modeled as an explicit state machine:

```text
       ┌──────────────────┐
       │   NOT_REQUIRED   │
       └────────┬─────────┘
                │ (Trigger Condition Met)
                ▼
       ┌──────────────────┐
       │     PENDING      │ (Evaluation Window)
       └────────┬─────────┘
                │ (Deadline Expired)
                ▼
       ┌──────────────────┐
       │    TRIGGERED     │ (Escalation Alerts Dispatched)
       └────────┬─────────┘
                │ (Safety Manager Reviews)
                ▼
       ┌──────────────────┐
       │   ACKNOWLEDGED   │
       └────────┬─────────┘
                │ (Manager Intervenes / Resolves Site)
                ▼
       ┌──────────────────┐
       │   IN_PROGRESS    │
       └────────┬─────────┘
                │ (Site Controls Established)
                ▼
       ┌──────────────────┐
       │     RESOLVED     │
       └────────┬─────────┘
                │ (Audit Ledger Sealed)
                ▼
       ┌──────────────────┐
       │      CLOSED      │
       └──────────────────┘
```

### State Definitions
1. **`NOT_REQUIRED`:** Baseline state; action is proceeding normally within allowable response windows.
2. **`PENDING`:** The escalation timer is active; system is monitoring elapsed time against policy thresholds.
3. **`TRIGGERED`:** Response deadline expired; escalation notifications have dispatched to the Safety Manager.
4. **`ACKNOWLEDGED`:** The Safety Manager has opened the escalation alert and taken operational ownership of the anomaly.
5. **`IN_PROGRESS`:** The Safety Manager is actively intervening (contacting the field, reassigning crew, or dispatching supplies).
6. **`RESOLVED`:** Physical controls are confirmed on site, or the supervisor has acknowledged under managerial direction.
7. **`CLOSED`:** The escalation event is formally concluded and archived in the immutable audit ledger.

---

## 5. Escalation Chain

The escalation chain defines the hierarchy of operational roles responsible for receiving escalated alerts:

### MVP Scope (Two-Tier Closed Loop):
```text
TIER 1 (Field Execution):     SITE SUPERVISOR
                                    │
                                    │ (Escalation Trigger)
                                    ▼
TIER 2 (Operations Oversight): SAFETY MANAGER
```

### Future Architectural Extension (Out of MVP Scope):
```text
TIER 1: SITE SUPERVISOR
           │
TIER 2: LEAD AREA SUPERVISOR
           │
TIER 3: REGIONAL SAFETY MANAGER
           │
TIER 4: VICE PRESIDENT OF OPERATIONS
```

*Note:* The MVP deliberately implements the focused two-tier model (`SUPERVISOR` $\rightarrow$ `SAFETY_MANAGER`) to maximize reliability and avoid unnecessary complexity during hackathon demonstration.

---

## 6. Escalation Ownership

To prevent ambiguous "bystander" scenarios, an escalated action maintains explicit dual-ownership tracking:

* **Original Operational Owner:** The Site Supervisor (`SUPERVISOR`) who holds initial field responsibility.
* **Escalation Incident Owner:** The Safety Manager (`SAFETY_MANAGER`) who receives the escalation alert and is responsible for driving resolution.
* **Escalation Reason:** The exact triggering code (e.g., `E01 — NO_ACKNOWLEDGMENT`).
* **Trigger Timestamp:** The exact UTC moment the timeout fired.
* **Resolution Owner:** The authenticated user who formally closes the escalation event.

The transfer of attention to the Safety Manager does not erase the supervisor’s primary field responsibility; both roles are documented in the active record.

---

## 7. Escalation Timing & Policy Windows

Escalation timing must be flexible and policy-driven, reflecting organizational guidelines and operational realities:

```text
Action Created & Assigned
            │
            ▼
   Response Window Active (Duration = T_policy)
            │
   ┌────────┴────────┐
   ▼                 ▼
Supervisor Taps     T_elapsed > T_policy
"Acknowledge"       (No Response)
   │                 │
   ▼                 ▼
Countdown Halts    Escalation Engine Dispatches
Normal Workflow    Immediate High-Priority Alert
```

* **Policy-Driven Configuration:** Organizations configure default timeout windows based on task criticality, industry standards, and site geography.
* **No Arbitrary Universal Timeout:** The software avoids claiming a single universal "scientific" timeout limit; timing is an administrative policy parameter.

---

## 8. DEMO Mode vs. LIVE Mode Timing

To support effective hackathon evaluation without waiting for real-world durations, the system provides dual timing profiles:

| Operational Dimension | LIVE Mode (Production) | DEMO Mode (Hackathon Sandbox) |
| :--- | :--- | :--- |
| **Acknowledgment Timeout** | 15 to 30 minutes (Policy-defined) | **30 to 60 seconds** (Accelerated) |
| **Execution Confirmation** | 60 to 90 minutes | **2 to 3 minutes** (Accelerated) |
| **Notification Dispatch** | Real SMTP Email & Webhook SMS | High-speed In-App Push & Local Webhooks |
| **Visual Indicators** | Standard operational badge | Prominent Banner: *"DEMO TIMEOUT ACTIVE"* |

> **Critical Safety Principle:** Accelerated demonstration timeouts exist solely for hackathon presentation and testing. They must **never** be presented as real-world occupational safety requirements.

---

## 9. Primary Escalation Flows

### Flow 1: Successful Nominal Response (No Escalation)
```text
Action Generated ──> Assigned to Supervisor ──> Alert Dispatched
                                                      │
                                                      ▼
Escalation Timer Cancelled <── Acknowledged Within Window
            │
            ▼
Controls Implemented ──> Execution Confirmed ──> Action Resolved
```

### Flow 2: Missed Response (Automated Escalation)
```text
Action Generated ──> Assigned to Supervisor ──> Alert Dispatched
                                                      │
                                                      ▼
                      Timeout Window Reaches Zero (No Response)
                                                      │
                                                      ▼
                   Escalation Engine Transitions State: ESCALATED
                                                      │
                                                      ▼
              Urgent Alert Dispatched to Safety Manager Command Center
                                                      │
                                                      ▼
             Safety Manager Calls Supervisor Directly / Intervenes
                                                      │
                                                      ▼
               Supervisor Acknowledges Under Manager Direction
                                                      │
                                                      ▼
               Escalation Formally Resolved & Sealed in Audit Log
```

### Flow 3: Blocked Action (Site Resource Failure)
```text
Supervisor Acknowledges ──> Attempts Deployment ──> Discovers Blocker (e.g., Water Tank Empty)
                                                          │
                                                          ▼
               Supervisor Taps "Report Blocker" in Action Center
                                                          │
                                                          ▼
             Escalation State Transitions: ESCALATED (Trigger: E02)
                                                          │
                                                          ▼
             Safety Manager Dispatches Emergency Water Logistics
                                                          │
                                                          ▼
             Water Restored ──> Blocker Resolved ──> Controls Active
```

---

## 10. Escalation Notification Content

Escalation alerts must deliver complete situational context in a concise package:

```text
[CRITICAL OPERATIONAL ESCALATION]
Severity:    CRITICAL
Trigger:     E01 — NO ACKNOWLEDGMENT (Timeout: 15 minutes expired)
Worksite:    North Bengaluru Construction Site (Pier 42 Casting Yard)
Shift:       Morning Concrete Pour (06:00–14:00 IST)
Action:      Implement 45/15 Work-Rest Cycle and Chilled Water Distribution
Owner:       Rahul Kumar (Site Supervisor) — 15 min unresponsive
Heat Risk:   HIGH RISK (Heat Index: 43°C | Workload: HEAVY | Direct Sun)

Next Required Operational Action:
Safety Manager must intervene immediately: Contact supervisor or issue site stand-down.

Controls:
[ CALL SUPERVISOR ]   [ REASSIGN ACTION ]   [ RESOLVE ESCALATION ]
```

---

## 11. Escalation Closure & Cancellation

An escalation event cannot simply be dismissed; it must be formally resolved with an auditable justification:

* **Supervisor Acknowledgment:** The supervisor responds following secondary alerting; manager verifies site safety.
* **Manager Intervention:** The Safety Manager directly confirms site controls or orders a temporary task stand-down.
* **Action Reassignment:** The action is transferred to an alternate on-site supervisor who immediately assumes ownership.
* **Rapid Environmental Normalization:** Sudden thunderstorm or temperature drop lowers thermal risk below threshold; manager records weather normalization notes.

All closure transitions record the acting user ID, UTC timestamp, resolution category, and closing remarks in the permanent audit ledger.

---

## 12. Reassignment During Escalation

When an escalated action is transferred to a different supervisor:

```text
  Escalated Action Directive (Owner: Supervisor A — Unresponsive)
                     │
                     ▼
  Safety Manager Reassigns to Alternate (Supervisor B)
                     │
                     ▼
  New Owner Bound ──> Action Reset to PENDING_ACKNOWLEDGMENT
                     │
                     ▼
  New Escalation Timer Starts (Target: Supervisor B)
                     │
                     ▼
  Audit Ledger Captures Full Reassignment History:
  - Previous Owner: Supervisor A
  - Reason: Non-responsive during acute thermal event
  - New Owner: Supervisor B
  - Reassigned By: Safety Manager
```

Reassignment does not delete the record of Supervisor A's missed deadline; historical accountability is permanently preserved.

---

## 13. Escalation Failure & Edge Cases

| Failure Case | System Behavior | User Visibility | Recovery Protocol |
| :--- | :--- | :--- | :--- |
| **Safety Manager Unavailable** | System broadcasts to all active safety managers in organization | Red alert banner across all management dashboards | Any authorized safety manager can claim ownership |
| **Notification Network Failure** | Records `DISPATCH_FAILED`; persists escalation in active database | Flashing visual banner on all web interfaces | System retries notification via fallback webhook |
| **Duplicate Escalation Fired** | Idempotency engine recognizes active `ESCALATED` state; suppresses repeat | Single alert card maintained in UI | Prevents alert storms during sustained heat |
| **Escalation Ping-Pong Loop** | Prohibits reassigning back to unresponsive user within same shift | UI blocks invalid reassignment with error prompt | Manager must assign a verified active alternative |
| **System Outage During Timeout**| On recovery, background worker evaluates overdue actions immediately | Immediate backlog escalation alerts raised | Manager reviews time elapsed during outage |
| **Action Resolved Just as Timer Fires** | Race condition resolved by prioritizing `ACKNOWLEDGED` state | Escalation auto-cancels with notice: "Resolved prior to alert" | Audit records both timestamps accurately |

---

## 14. Escalation Loop Prevention

To prevent infinite loops between supervisors and managers:
1. **Bounded Escalation Steps:** An action can only escalate upward (`SUPERVISOR` $\rightarrow$ `SAFETY_MANAGER`). It can never automatically ping-pong between roles without manual manager authorization.
2. **Maximum Escalation Cycles:** An action that is escalated, reassigned, and unacknowledged a second time triggers an enterprise-wide `CRITICAL_SAFETY_HOLD` alert requiring executive review.

---

## 15. Escalation Audit Requirements

Every escalation event records an immutable entry containing:

* `escalation_id`: Unique identifier for the escalation incident.
* `action_id`: Foreign key linking to the underlying action directive.
* `trigger_code`: Specific trigger (`E01`, `E02`, `E03`, `E04`, `E05`).
* `source_owner_id`: User ID of the unresponsive or blocked supervisor.
* `target_manager_id`: User ID of the safety manager receiving the alert.
* `trigger_timestamp`: UTC moment the timeout or blocker was registered.
* `latency_seconds`: Number of seconds elapsed before manager acknowledged.
* `resolution_type`: How the escalation was concluded (`SUPERVISOR_RESPONDED`, `MANAGER_INTERVENED`, `REASSIGNED`).
* `resolution_timestamp`: UTC moment of closure.

---

## 16. Operational Escalation Metrics

The system tracks key performance indicators (KPIs) to identify organizational bottlenecks:

* **Acknowledgment Rate:** Percentage of directives acknowledged before escalation fires.
* **Mean Time to Acknowledge (MTTA):** Average minutes between action notification and supervisor response.
* **Escalation Frequency:** Percentage of active actions that breach policy response windows.
* **Mean Time to Escalate (MTTE):** Average elapsed time from action creation to escalation trigger.
* **Manager Intervention Time:** Average minutes between escalation trigger and manager resolution.
* **Unresolved Escalation Count:** Total active escalations currently requiring intervention.

> **Operational Boundary:** These metrics evaluate *software workflow responsiveness*, not individual worker health, biological strain, or clinical outcomes.

---

## 17. MVP vs. Future Escalation Model

| Escalation Feature | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **Timeout-Driven Escalation** | Yes (Automated countdown triggers) | Predictive timeouts based on rising thermal slopes |
| **Escalation Hierarchy** | Yes (Two-tier: Supervisor $\rightarrow$ Safety Mgr) | Multi-tier organizational routing with executive trees |
| **Blocked Action Reporting** | Yes (Manual supervisor blockage report) | Automated resource sensor monitoring (e.g., smart water meters) |
| **Demonstration Sandbox Timing** | Yes (Accelerated 30s demo timers) | Interactive scenario script builder for trainers |
| **Direct Manager Intervention** | Yes (One-click reassign and resolve) | Integrated two-way VoIP / push-to-talk field dispatch |
| **Automated Equipment Shutdown** | **No** (Software-first boundary) | IoT integration with automated work-stop interlocks |

---

## 18. Canonical Demo Escalation Scenario

For hackathon demonstration and scenario validation, the following fictional escalation event is established:

```text
Demonstration Scenario:
  worksite_name:         "North Bengaluru Construction Site (Pier 42)"
  shift_name:            "Morning Concrete Pour"
  action_id:             "act-demo-2026-001"
  assigned_supervisor:   "Rahul Kumar (Site Supervisor)"
  safety_manager:        "Ananya Rao (Lead Safety Manager)"

Timeline Execution:
  12:00:00 IST: High Heat Risk detected; action directive generated.
  12:00:05 IST: Notification dispatched to Rahul Kumar; 30-second Demo Timer starts.
  12:00:35 IST: Timer reaches zero; no acknowledgment received.
  12:00:36 IST: Escalation Engine triggers E01 — NO_ACKNOWLEDGMENT.
  12:00:37 IST: Ananya Rao's Command Center flashes red alert banner.
  12:00:45 IST: Ananya clicks "Review Escalation", calls Rahul, and reassigns site priority.
  12:01:00 IST: Escalation resolved; audit ledger documents 35-second response latency.
```

---

## 19. Final Principle

> **Escalation exists to prevent important unresolved actions from becoming invisible. It transfers attention to an accountable higher-level role while preserving the original action, ownership history, reason, and response trail.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
