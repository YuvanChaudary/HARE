# 12. User Flows — Heat Action Response Engine MVP

## 1. Purpose

This document defines the complete operational, user, and automated system workflows for the **Heat Action Response Engine MVP**.

While requirements define *what* capabilities must exist and user stories define *who* needs them and *why*, user flows define the dynamic pathways, state transitions, decision nodes, and exception branches that connect those capabilities into a cohesive, dependable operating system.

This document serves as the architectural bridge between strategy and execution:

```text
PRODUCT VISION
      ↓
REQUIREMENTS
      ↓
USER STORIES
      ↓
USER FLOWS
      ↓
UX / API / BACKEND IMPLEMENTATION
```

The central operational workflow implemented across all flows is the closed-loop transformation:

```text
HEAT SIGNAL
    ↓
RISK ASSESSMENT
    ↓
WORKSITE CONTEXT
    ↓
ACTION
    ↓
ASSIGN
    ↓
NOTIFY
    ↓
ACKNOWLEDGE
    ↓
VERIFY / CONFIRM
    ↓
ESCALATE IF UNRESOLVED
    ↓
AUDIT
```

---

## 2. Workflow Design Principles

Every workflow in this platform is governed by twelve operational design principles:

1. **The next action should be obvious:** Interfaces and notifications must present unambiguous next steps without requiring users to deduce or guess operational procedures.
2. **The responsible person should always be identifiable:** Every active risk condition and required action must have an explicit, identifiable human owner; unassigned actions are treated as critical anomalies.
3. **Risk should be understandable before an action is requested:** Front-line supervisors must receive clear environmental and contextual reasons explaining why a directive was issued before they are asked to act.
4. **Preventive actions should be contextual:** Recommendations must reflect actual worksite reality (workload, direct sun exposure, available water and shade assets) rather than generic, blanket thermal warnings.
5. **Notifications should lead to an actionable response:** Notifications are operational dispatch vectors that must provide direct deep links to acknowledgment and confirmation interfaces.
6. **Acknowledgment and execution must not be conflated:** The system must strictly distinguish between a supervisor confirming receipt of an order and confirming its physical execution on site.
7. **Unresolved actions must not disappear:** If an action is unacknowledged within a policy-defined time window, the system must maintain continuous pressure through automated escalation.
8. **Escalation must preserve the original context:** When an escalation event reaches secondary managers, the complete causal history (weather, risk, directive, elapsed time, assigned supervisor) must be immediately visible.
9. **Important events must be auditable:** All state transitions, dispatches, user interactions, timeouts, and confirmations must generate immutable, append-only audit events.
10. **AI must assist without becoming the safety authority:** Artificial intelligence provides plain-language explanations, translations, and summaries, but never calculates risk thresholds or creates autonomous safety directives.
11. **Missing or stale data must be visible:** Incomplete, delayed, or failing weather feeds must be explicitly surfaced; missing information must never be silently interpreted as safe conditions.
12. **DEMO and LIVE states must be clearly distinguishable:** Demonstrations, simulated scenarios, and accelerated timers must carry prominent visual indicators so they are never confused with real operational states.

---

## 3. Actors and Responsibilities

The following primary actors participate in the operational workflows:

| Actor | Responsibility |
| :--- | :--- |
| **ADMIN** | Worksite creation, geocoordinate mapping, operational user provisioning, role configuration, baseline policy setup. |
| **SAFETY_MANAGER** | Multi-site thermal risk monitoring, action oversight, intervention on open timeouts, escalation review, post-shift audit inspection. |
| **SUPERVISOR** | Front-line field recipient: receiving directives, reviewing risk context, prompt acknowledgment, coordinating site controls, and confirming execution. |
| **SYSTEM** | Automated backend services: weather polling, input validation, deterministic risk assessment, rule matrix action generation, dispatch, escalation timer management, and immutable audit logging. |
| **AI ASSISTANT** | Assistive NVIDIA AI services: plain-language risk driver explanations, supervisor rationale clarification, multilingual translation, toolbox talk drafting, and incident timeline summarization. |

### Secondary and Future Stakeholders
* **Workers:** The vital human beneficiaries of the safety workflow. In the MVP, workers receive safety interventions (water breaks, shade rest, adjusted shift paces) through their on-site human supervisor. Workers do not interact directly with software interfaces in the MVP.
* **Operations Manager:** Future executive role reviewing macro productivity impacts and cross-portfolio safety compliance trends.
* **Occupational Safety Professional:** Future specialized stakeholder defining customized algorithmic thresholds, physiological indices, and organizational policy rules.

---

## 4. Global Operational Lifecycle

Every thermal event managed by the Heat Action Response Engine moves through a finite state machine representing the lifecycle from initial environmental detection to resolved compliance and audit archival:

```text
ENVIRONMENTAL_DATA_AVAILABLE
        ↓
RISK_ASSESSED
        ↓
ACTION_CREATED
        ↓
ACTION_ASSIGNED
        ↓
NOTIFICATION_SENT
        ↓
PENDING_ACKNOWLEDGMENT
       / \
      /   \
ACKNOWLEDGED  NO_RESPONSE
     ↓             ↓
CONFIRMED       ESCALATION
     ↓             ↓
RESOLVED      ESCALATED
       \          /
        \        /
         AUDITED
```

### Lifecycle State Definitions
* `ENVIRONMENTAL_DATA_AVAILABLE`: Environmental weather observations or forecasts have been successfully ingested and validated.
* `RISK_ASSESSED`: Deterministic risk calculation has executed, classifying the worksite into an operational risk tier (`LOW`, `MODERATE`, `HIGH`, or `EXTREME`).
* `ACTION_CREATED`: Rule matrices have evaluated the risk tier and worksite context, generating specific work-rest and hydration directives.
* `ACTION_ASSIGNED`: The action directive is bound to an authenticated worksite supervisor.
* `NOTIFICATION_SENT`: Outbound alerts (in-app, email, webhook/SMS) have been dispatched to the assigned supervisor.
* `PENDING_ACKNOWLEDGMENT`: The action awaits active supervisor receipt; the escalation countdown timer is active.
* `ACKNOWLEDGED`: Supervisor has explicitly interacted with the action directive, stopping the escalation countdown.
* `CONFIRMED`: Supervisor has self-reported the physical implementation of the requested site controls.
* `ESCALATED`: Escalation timer expired without supervisor acknowledgment; emergency secondary notifications have dispatched to the Safety Manager.
* `RESOLVED`: The action has concluded either through verified confirmation or authorized manager intervention.
* `AUDITED`: The entire sequence of causal and temporal events is sealed in the immutable audit ledger.

---

## 5. Flow — User Authentication

### Goal
Allow an authorized user to securely authenticate and enter the application with role-appropriate permissions.

### Actors
* User (`ADMIN`, `SAFETY_MANAGER`, or `SUPERVISOR`)
* Authentication System / Backend Identity Service

### Preconditions
* User account exists in the system database.
* User account is active and assigned an operational role.

### Main Flow
```text
Open Application
      ↓
Enter Credentials (Email & Password)
      ↓
System Authenticates Credentials
      ↓
Identify User Role & Assigned Worksites
      ↓
Generate Secure Session / Token
      ↓
Load Authorized Role Interface:
  - ADMIN → Admin Management Console
  - SAFETY_MANAGER → Multi-Site Operations Command Center
  - SUPERVISOR → Supervisor Action Center
```

### Failure Flow
```text
Enter Credentials
      ↓
Authentication Fails (Invalid Password / Inactive Account)
      ↓
Increment Failure Counter
      ↓
Display Generic Error Message: "Invalid credentials or account inactive"
      ↓
Remain on Login Screen (Access Denied)
```

### Postcondition
The user is securely authenticated, session state is established, and navigation is restricted strictly to authorized role views.

---

## 6. Flow — Worksite Configuration

### Goal
Create, configure, and activate an operational worksite profile capable of participating in automated heat-risk workflows.

### Actor
ADMIN

### Main Flow
```text
Admin Selects "Create Worksite"
      ↓
Enter Worksite Name and Geographic Coordinates (Latitude, Longitude)
      ↓
Configure Worksite Context:
  - Work Type (Construction, Logistics, Agriculture, Maintenance)
  - Workload Category (Light, Moderate, Heavy, Very Heavy)
  - Heat Exposure (Direct Sun, Partial Shade, Enclosed Outdoor)
  - Available Controls (Water Stations, Shade Canopies, Cooling Trailers)
  - Shift Windows (Start Time, End Time)
  - Clothing / PPE Context (Standard Cotton, Heavy Coveralls, Impermeable PPE)
      ↓
Select and Assign Primary Responsible Supervisor
      ↓
System Validates All Mandatory Configuration Fields
      ↓
System Assigns Unique Worksite ID
      ↓
Admin Activates Worksite
      ↓
System Schedules Weather Polling & Enables Risk Engine
```

### Worksite Context Boundaries
The worksite context represents physical, environmental, and operational attributes of the job site. The system explicitly collects zero personal medical, physiological, or biometric data from individual workers.

### Failure Paths
* **Missing or Invalid Coordinates:** Geocoordinates outside valid latitude (-90 to 90) or longitude (-180 to 180) are rejected with field-level validation errors.
* **Unassigned Supervisor:** Attempting to activate a worksite without an assigned supervisor prompts: *"A responsible supervisor must be designated before activation to ensure action ownership."*
* **Incomplete Context:** Missing mandatory workload or exposure classifications prevents activation until defaults or specific selections are supplied.

---

## 7. Flow — Weather / Forecast Ingestion

### Goal
Retrieve, validate, and persist current and forecast environmental observations for all active worksites.

### Actors
* SYSTEM (Scheduled Polling Worker or Manual Ingestion Trigger)
* External Weather API Provider

### Main Flow
```text
Scheduled Timer Fires (e.g., every 30 or 60 minutes) OR Manual Refresh
      ↓
Query Active Worksites
      ↓
Dispatch API Request with Worksite Latitude & Longitude
      ↓
Receive Environmental Payload (Temperature, Humidity, Wind, Solar/Cloud)
      ↓
Validate Physical Boundaries (e.g., -20°C < Temp < 60°C, 0% < Humidity < 100%)
      ↓
Associate Snapshot with Worksite ID & Record UTC Ingestion Timestamp
      ↓
Persist Environmental Observation Record
      ↓
Pass Validated Snapshot to Deterministic Risk Engine
```

### Failure Flow
```text
Dispatch API Request to Weather Provider
      ↓
Provider Fails (Network Timeout, HTTP 5xx, Rate Limit Exceeded)
      ↓
Log Ingestion Error with Diagnostic Codes
      ↓
Mark Worksite Data Status as "UNAVAILABLE" or "STALE"
      ↓
Raise System Alert on Safety Manager Dashboard
      ↓
DO NOT Treat Missing Data as Safe (Do NOT default to zero risk)
```

### Important Architectural Boundary
Weather data retrieved from meteorological APIs represents regional grid forecasts and observational models. The MVP does not require or depend upon physical on-site IoT sensors or weather stations.

---

## 8. Flow — Heat-Risk Assessment

### Goal
Evaluate validated environmental inputs alongside worksite contextual factors using deterministic, rule-based algorithms.

### Actors
* SYSTEM (Heat-Risk Engine)
* SAFETY_MANAGER / SUPERVISOR (Consumers of Assessment Output)

### Main Flow
```text
Receive Validated Weather Data & Worksite Context
      ↓
Calculate Base Thermal Metric (Heat Index / Estimated WBGT)
      ↓
Evaluate Contextual Modifier Rules:
  - If Workload is HEAVY, apply metabolic threshold adjustment
  - If Radiant Heat is DIRECT SUN, apply solar exposure adjustment
  - If Impermeable PPE is selected, apply clothing adjustment factor
      ↓
Classify Site into Operational Risk Tier:
  - LOW
  - MODERATE
  - HIGH
  - EXTREME
      ↓
Compile Traceable Assessment Record:
  - Worksite ID & Timestamp
  - Raw Inputs (Temp, Humidity, Wind, Solar)
  - Calculated Numerical Index
  - Assigned Operational Risk Tier
  - Rule Execution Rationale (Exact threshold logic triggered)
      ↓
Persist Risk Assessment Record
```

### Decision A — Valid Inputs & Elevated Risk
If calculated risk tier is `HIGH` or `EXTREME`, automatically trigger Flow 10 (Preventive Action Generation).

### Decision B — Insufficient or Corrupted Inputs
```text
System Detects Missing Mandatory Weather Variables (e.g., Humidity Missing)
      ↓
Halt Deterministic Calculation
      ↓
Classify Assessment State as "UNCERTAIN / DATA DEGRADED"
      ↓
Record Diagnostic Event in Audit Ledger
      ↓
Notify Safety Manager: "Manual evaluation required due to incomplete weather feed"
      ↓
Suppress Automated Unchecked Action Generation
```

### Safety and Regulatory Boundary
Operational heat-risk classification represents an operational workflow trigger. It is never a medical diagnosis, clinical triage metric, or personal medical determination. Exact mathematical formulas and index thresholds are documented separately in [20_HEAT_RISK_ENGINE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/20_HEAT_RISK_ENGINE.md).

---

## 9. Flow — Worksite Contextualization

### Goal
Ensure ambient environmental measurements are properly interpreted within the operational reality of the specific physical job site.

### Inputs
* Ambient dry-bulb temperature and relative humidity
* Workload intensity (`LIGHT`, `MODERATE`, `HEAVY`, `VERY_HEAVY`)
* Heat exposure conditions (Direct Sunlight vs. Shaded Enclosure)
* Available hydration points and active cooling shelters
* PPE ensemble requirements
* Active shift timings and crew acclimatization status

### Contextualization Flow
```text
Ambient Weather Metric (e.g., Ambient Temp 34°C, Humidity 70%)
                    +
Worksite Context (Heavy Manual Labor + Direct Solar Radiation)
                    ↓
Contextual Threshold Engine
                    ↓
Operational Risk Escalation:
  - Ambient Index alone might indicate MODERATE risk
  - Heavy Labor + Direct Sun elevates operational risk to HIGH
                    ↓
Resulting Operational Risk State Determines Response Urgency
```

### Operational Rationale
Environmental metrics alone fail to capture occupational danger. A worker performing light machine operation in an air-conditioned cabin faces vastly different physiological strain than a worker carrying structural steel in direct sunlight under identical ambient temperatures. Worksite contextualization closes this critical gap.

---

## 10. Flow — Preventive Action Generation

### Goal
Convert an elevated operational heat-risk condition into concrete, site-specific preventive work-rest, hydration, and shade directives.

### Main Flow
```text
Triggered by Risk Assessment (Risk Tier: HIGH or EXTREME)
      ↓
Lookup Approved Deterministic Rule Matrix:
  - Match [Risk Tier] + [Workload Category] + [Exposure Type]
      ↓
Generate Tailored Action Directive:
  - Specific Work/Rest Ratio (e.g., "45 minutes work / 15 minutes rest per hour")
  - Mandatory Hydration Target (e.g., "1 liter potable water per worker per hour")
  - Environmental Controls (e.g., "Mandatory rest in designated Shade Canopy A")
  - Peer Monitoring (e.g., "Enforce 2-person buddy system for symptom awareness")
      ↓
Assemble Action Package:
  - Unique Action ID
  - Originating Assessment ID
  - Worksite ID & Associated Supervisor ID
  - Priority Level (HIGH / CRITICAL)
  - Current Status: PENDING
  - Escalation Timeout Deadline (UTC Timestamp)
      ↓
Persist Action Record & Proceed to Flow 11 (Assignment)
```

### AI Safety Boundary
The generative AI assistant may assist by explaining or summarizing the directive. However, AI **never** calculates safety limits, overrides rule matrices, invents ad-hoc work/rest cycles, or makes autonomous decisions. Deterministic rules are the sole authoritative source of safety protocols.

---

## 11. Flow — Supervisor Assignment

### Goal
Ensure every generated preventive action directive is bound to an unambiguous, identifiable human owner.

### Main Flow
```text
Action Directive Generated
      ↓
Query Worksite Profile for Designated Primary Supervisor
      ↓
Verify Supervisor Account is Active
      ↓
Bind Supervisor ID to Action Record
      ↓
Set Initial Action State to PENDING
      ↓
Start Automated Escalation Countdown Timer
      ↓
Initiate Dispatch to Supervisor (Flow 12)
```

### Failure Flow — Unassigned or Inactive Supervisor
```text
Action Directive Generated
      ↓
Primary Supervisor Missing, Deactivated, or Unreachable
      ↓
Flag Critical Operational Anomaly: "ORPHANED ACTION DIRECTIVE"
      ↓
Assign Temporary Emergency Ownership to Lead Safety Manager
      ↓
Dispatch High-Priority Alert to Safety Manager:
  "Worksite [Site] has no active supervisor. Action requires immediate assignment."
      ↓
Safety Manager Manually Reassigns to Active Supervisor via Console
```

---

## 12. Flow — Notification

### Goal
Rapidly dispatch actionable alerts across configured communication channels to inform the assigned supervisor that a response is required.

### Notification Content Package
Every notification payload contains:
* Worksite Name and Location
* Current Operational Heat-Risk Tier (`HIGH` / `EXTREME`)
* Core Required Directive Summary (Work/Rest cycle, Water target)
* Escalation Countdown / Deadline
* Deep link to the Supervisor Action Center

### Main Flow
```text
Action Assigned to Supervisor
      ↓
System Dispatches Multi-Channel Notifications:
  - In-App Real-Time Push / WebSocket Alert
  - Automated Email Notification
  - Webhook / SMS Mockup Dispatch
      ↓
Capture Dispatch Result:
  - Success: Record Delivery Timestamp & Mark State as NOTIFIED
  - Failure: Log Dispatch Error & Alert Safety Manager
      ↓
Supervisor Receives Alert & Opens Deep Link
      ↓
Direct Navigation to Supervisor Action Center
```

### Essential Accountability Distinction
The system maintains strict semantic separation between delivery and comprehension:

```text
Notification Sent (Bytes left server)
      ≠
Notification Seen (Device screen lit up)
      ≠
Action Acknowledged (Supervisor accepted responsibility)
      ≠
Action Executed (Controls deployed on site)
```

---

## 13. Flow — Supervisor Acknowledgment

### Goal
Capture verifiable, prompt supervisor acceptance of an operational directive, confirming they are aware of site risk and taking charge of crew safety.

### Main Flow
```text
Supervisor Opens Supervisor Action Center
      ↓
View Highlighted Action Card:
  - Review Worksite Name & Risk Level
  - Review Environmental Drivers (Temp, Humidity, Sun)
  - Review Required Work/Rest & Hydration Directives
  - View Live Escalation Timer Countdown
      ↓
Supervisor Clicks "Acknowledge Directive"
      ↓
System Captures:
  - Authenticated Supervisor User ID
  - Exact UTC Acknowledgment Timestamp
  - Network Session Metadata
      ↓
Transition Action State: PENDING → ACKNOWLEDGED
      ↓
Cancel Escalation Countdown Timer
      ↓
Append Acknowledgment Event to Immutable Audit Ledger
      ↓
Update Safety Manager Dashboard in Real Time
```

### Conceptual State Progression
$$\text{PENDING} \longrightarrow \text{ACKNOWLEDGED} \longrightarrow \text{CONFIRMED / RESOLVED}$$

Acknowledgment halts the automated escalation countdown. It confirms that the human supervisor has taken operational charge, but does not claim physical task completion.

---

## 14. Flow — Action Confirmation / Verification

### Goal
Provide the strongest verifiable operational completion milestone supported within the software-first MVP scope.

### Main Flow
```text
Action Directive in ACKNOWLEDGED State
      ↓
Supervisor Implements Physical Controls on Site:
  - Crew directed to shade canopy
  - Water supplies verified and distributed
  - Work pace adjusted to 45/15 ratio
      ↓
Supervisor Opens Action Card in Action Center
      ↓
Click "Confirm Execution" (Optional: check off completed checklist items)
      ↓
System Records:
  - User ID and UTC Timestamp
  - Checklist Items Verified
      ↓
Transition Action State: ACKNOWLEDGED → CONFIRMED
      ↓
Mark Action Status as RESOLVED
      ↓
Append Confirmation Event to Audit Ledger
      ↓
Safety Manager Dashboard Displays Green "Resolved & Confirmed" Badge
```

### Important Verification Limitation
In a software-first system without biometric body sensors or physical cameras, software confirmation represents the supervisor's self-reported operational attestation. It is labelled in dashboards as *"Confirmed by Supervisor"* rather than *"Independently Sensor-Verified."*

---

## 15. Flow — Missed Response and Escalation

### Goal
Guarantee that when a front-line supervisor fails to acknowledge a high-risk directive, responsibility automatically escalates to safety management rather than silently lapsing.

### Main Flow
```text
Action Assigned and Notification Dispatched
      ↓
Escalation Countdown Timer Active (Policy Duration: e.g., 15 min Live / 30 sec Demo)
      ↓
Timer Reaches Zero Without Supervisor Acknowledgment
      ↓
System Escalation Engine Fires:
  - Transition Action State: PENDING → ESCALATED
  - Generate High-Priority Escalation Event
      ↓
Dispatch Escalation Alerts:
  - Urgent Alert to Safety Manager Dashboard (Visual pulsing red banner)
  - Escalation Email / Emergency SMS to Safety Manager
  - Secondary Urgent Reminder to Supervisor
      ↓
Append Escalation Event to Audit Ledger
      ↓
Safety Manager Intervenes:
  - Calls Supervisor Directly, OR
  - Reassigns Action to Alternate On-Site Personnel, OR
  - Issues Direct Site Stand-Down Order
      ↓
Safety Manager Resolves Escalation in System Console
```

### Operational Decisions

```text
               Timer Expired?
                 /         \
             YES /           \ NO
                ▼             ▼
       Trigger Escalation   Supervisor Acknowledges
                │                     │
                ▼                     ▼
       Notify Safety Manager   Cancel Timer & Proceed
```

Escalation timing in production is governed by organizational policy configuration. In DEMO mode, timers are compressed to support rapid hackathon evaluations.

---

## 16. Flow — Audit Trail

### Goal
Maintain an immutable, append-only record of all operational risk events, human actions, system dispatches, and state transitions for regulatory and managerial compliance.

### Monitored Event Sequence
```text
Worksite Configured / Context Updated
       ↓
Weather Observation Ingested
       ↓
Heat Risk Evaluated & Classified
       ↓
Preventive Action Generated
       ↓
Action Assigned to Supervisor
       ↓
Notification Attempted & Dispatched
       ↓
Supervisor Acknowledged Action
       ↓
[OR Escalation Triggered upon Timeout]
       ↓
Supervisor Confirmed Execution
       ↓
Action Resolved & Closed
```

### Audit Inquiries Answered
An authorized auditor or manager reviewing the audit history can reconstruct:
* Exactly what environmental conditions were observed and when.
* Which mathematical and contextual rules determined the risk classification.
* What specific preventive action directives were generated.
* Who was assigned ownership and when they received notification.
* How many seconds elapsed before acknowledgment occurred.
* Whether an escalation occurred and how management intervened.
* When final execution was confirmed.

---

## 17. Flow — Safety Manager Dashboard

### Goal
Provide safety managers with real-time, cross-site operational awareness, prioritizing urgent risk conditions and open compliance bottlenecks.

### Main Flow
```text
Safety Manager Logs In
      ↓
Open Operations Command Center
      ↓
Review Top-Level Executive KPI Cards:
  - Total Active Worksites
  - Worksites at HIGH / EXTREME Risk
  - Active Pending Directives
  - Active Escalations (Prominent Counter)
      ↓
Scan Multi-Site Heat Map / Status Table:
  - Filter by Risk Level or Escalation Status
  - Observe Real-Time Weather Observations and Freshness Tags
      ↓
Interact with Critical Anomalies:
  - Click Escalated Site to View Unresolved Directive Details
  - Initiate Manager Intervention (Reassign / Overrule / Contact)
      ↓
Open Worksite Detail Screen for Complete Audit Drill-Down
```

### Dashboard Priority Hierarchy
1. **Active Escalations:** Unacknowledged directives requiring immediate manager intervention.
2. **Elevated Risk Sites:** Sites under `HIGH` or `EXTREME` heat risk.
3. **Pending Actions:** Directives currently within normal acknowledgment countdown windows.
4. **Resolved & Historical Actions:** Completed interventions for retrospective audit.

---

## 18. Flow — Supervisor Dashboard (Supervisor Action Center)

### Goal
Provide front-line field supervisors with a lightweight, high-contrast, low-friction mobile/tablet interface focused entirely on their assigned duties.

### Main Flow
```text
Supervisor Logs In via Mobile / Tablet Device
      ↓
Direct Route to "My Assigned Actions"
      ↓
Review Active Directives Requiring Response:
  - Urgent Action Cards highlighted with Countdown Badges
  - Plain-Language Summary: Risk Level, Ambient Temp, Humidity
  - Clear Directives: Work/Rest Ratio, Water Volume, Shade Rest Location
      ↓
Click "Acknowledge Directive" (Single Tap)
      ↓
Interface Transitions to "Implementation Mode"
      ↓
After Deploying Site Controls, Click "Confirm Execution"
      ↓
Card Moves to "Completed Today" Section
```

The supervisor interface eliminates non-essential administrative clutter, enabling rapid responses under direct sunlight and noisy outdoor conditions.

---

## 19. Flow — Admin Workflow

### Goal
Configure and maintain the organizational topology, user accounts, worksites, and policy parameters.

### Main Flow
```text
Admin Logs In to System
      ↓
Manage User Directory:
  - Provision Safety Managers and Field Supervisors
  - Configure Email, Phone, and Notification Routing Identifiers
      ↓
Manage Worksite Registry:
  - Create New Worksites with Exact GPS Coordinates
  - Assign Primary and Secondary Supervisors
  - Define Contextual Attributes (Workload, Exposure, Shading, Water Assets)
      ↓
Configure System Parameters:
  - Set Default Escalation Timeout Windows (Production vs. Demo)
  - Verify External Weather API Integration Status
      ↓
Activate Configured Worksites for Live Monitoring
```

---

## 20. Flow — AI Risk Explanation

### Goal
Provide plain-language, contextual explanations of system-generated heat-risk scores to aid manager and supervisor understanding.

### Main Flow
```text
User Views Calculated Heat Risk (e.g., HIGH Risk Badge)
      ↓
User Clicks "Explain Risk Assessment"
      ↓
System Assembles Grounded Context Payload:
  - Raw Temperature & Humidity
  - Worksite Workload Category & Direct Sun Factor
  - Rule Threshold Triggered
      ↓
NVIDIA AI Assistant Generates Concise Explanation:
  "The worksite has reached HIGH risk because ambient temperature (38°C) and
   humidity (65%) produce a heat index of 44°C. When combined with heavy manual
   lifting in unshaded conditions, metabolic heat cannot dissipate normally."
      ↓
User Reviews Grounded Narrative (Clearly badged as "Assistive AI Explanation")
```

The AI assistant interprets deterministic facts; it does not compute or modify the score.

---

## 21. Flow — AI Action Explanation

### Goal
Clarify the physiological and operational reasoning behind specific preventive directives for field supervisors.

### Main Flow
```text
Supervisor Reviews Assigned Action (e.g., "45 min work / 15 min rest")
      ↓
Supervisor Clicks "Why This Action?"
      ↓
System Sends Approved Action Directive and Site Context to AI
      ↓
AI Synthesizes Plain-Language Rationale:
  "Under extreme radiant heat, scheduled 15-minute breaks in shade allow internal
   core body temperature to decline, preventing cumulative thermal exhaustion."
      ↓
Supervisor Reads Rationale and Applies Human Judgment during Crew Implementation
```

---

## 22. Flow — AI Communication Assistance (Toolbox Talk)

### Goal
Translate technical safety directives into concise, engaging field briefings for morning or midday crew talks.

### Main Flow
```text
Supervisor Clicks "Generate Crew Briefing"
      ↓
System Sends Directive Details (Water targets, Rest intervals) to AI Assistant
      ↓
AI Generates Structured 60-Second Verbal Script:
  - Direct message to workers: "Team, heat index is crossing 42°C today."
  - Specific instructions: "Mandatory water breaks every 45 minutes at Canopy B."
  - Peer safety: "Watch your buddy for dizziness or slurred speech."
      ↓
Supervisor Reviews and Adapts Script for Verbal Crew Delivery
```

---

## 23. Flow — AI Unavailable (Graceful Degradation)

### Goal
Ensure the core closed-loop safety response workflow remains fully operational even when external generative AI services experience outages or latency.

### Main Flow
```text
User Requests AI Explanation, Translation, or Briefing
      ↓
AI Service Times Out, Returns HTTP 5xx, or Rate Limit Error
      ↓
Backend Intercepts Error Gracefully
      ↓
UI Displays Clean Informational Banner:
  "AI Assistant temporarily unavailable. Deterministic safety directives remain fully active."
      ↓
System Renders Authoritative Deterministic Action Card Directly
      ↓
User Proceeds with Core Workflow: Acknowledge → Confirm → Escalate → Audit
```

**Architectural Principle:** Generative AI is an assistive enhancement. It is never in the critical runtime path of deterministic risk calculation, action assignment, notification, or escalation.

---

## 24. Flow — Weather Provider Failure

### Goal
Prevent communication or provider failures from creating a false illusion of safety.

### Main Flow
```text
Scheduled Weather Polling Job Executes
      ↓
External Weather API Fails (Connection Timeout, DNS Failure, HTTP 500)
      ↓
Backend Records Ingestion Failure Event
      ↓
Check Elapsed Time Since Last Successful Ingestion:
  - If < 60 min: Use cached data but flag status as "STALE DATA"
  - If > 60 min: Mark worksite status as "WEATHER UNAVAILABLE"
      ↓
Safety Manager Dashboard Surfaces Prominent Warning Badge
      ↓
System Refuses to Silently Classify Site as "LOW" or "SAFE"
      ↓
Safety Manager Initiates Manual Review or Triggers Manual Refresh
```

---

## 25. Flow — Notification Failure

### Goal
Ensure that communication delivery failures remain completely visible to safety management rather than silently abandoning directives.

### Main Flow
```text
Action Directive Generated & Assigned
      ↓
System Attempts Outbound Dispatch (Email, SMS, Webhook)
      ↓
Dispatch Channel Fails (SMTP Error, Invalid Webhook Endpoint)
      ↓
Capture Failure Details & Record DISPATCH_FAILED Event
      ↓
Safety Manager Console Displays Urgent Communication Alert:
  "Notification failed for Supervisor [Name] on Worksite [Site]."
      ↓
Escalation Countdown Timer Continues Unabated
      ↓
Safety Manager Executes Direct Contact Protocol or Reassigns Action
```

---

## 26. Canonical Demo Flow — Successful Response

### Demo Profile
* **Worksite:** Fictional "Bengaluru Metro Phase 2 — Elevated Viaduct Pier 42"
* **Actors:** Demo Admin, Safety Manager (Priya), Field Supervisor (Ramesh)
* **Status:** Simulated Demo Sandbox

### Step-by-Step Flow
```text
1. Demonstrator opens Demo Sandbox and selects "Simulate High Heat Wave".
2. System ingests simulated weather: 39°C Temperature, 70% Relative Humidity.
3. Deterministic Risk Engine evaluates: Heat Index 48°C + Heavy Structural Concrete Work.
4. Classification: EXTREME HEAT RISK.
5. Action Engine generates: "30 min work / 30 min rest; 1.5L chilled water/hr; Canopy Shade Rest".
6. System assigns directive to Supervisor Ramesh.
7. Real-time notification appears in Supervisor Action Center.
8. Demonstrator switches to Supervisor view and reviews risk explanation.
9. Demonstrator clicks "Acknowledge Directive" (Escalation timer stops immediately).
10. Demonstrator clicks "Confirm Execution" (Reports water distributed, crew rested).
11. Demonstrator switches to Safety Manager view: Worksite badge turns green (Confirmed).
12. Demonstrator opens Audit Trail: Shows complete timestamped sequence from weather to confirmation.
```

---

## 27. Canonical Demo Flow — Missed Response (Escalation)

### Demo Profile
* **Worksite:** Fictional "Bengaluru Metro Phase 2 — Underground Station Yard"
* **Scenario:** Supervisor unresponsive under acute thermal conditions.

### Step-by-Step Flow
```text
1. Demonstrator injects simulated extreme heat event with Demo Timeout (30 seconds).
2. Action Engine generates mandatory directive and assigns to Supervisor.
3. Notification dispatches; countdown timer begins ticking: 30... 20... 10... 0.
4. Demonstrator intentionally withholds acknowledgment.
5. Timer expires; Escalation Engine triggers automatically.
6. Action state transitions to ESCALATED.
7. Safety Manager Command Center displays flashing red banner:
   "CRITICAL ESCALATION: Supervisor failed to respond to EXTREME risk at Station Yard."
8. Secondary alert dispatches to Safety Manager.
9. Demonstrator (as Safety Manager) clicks "Intervene & Reassign".
10. Audit Ledger documents the timeout, escalation trigger, and manager intervention.
```

---

## 28. DEMO Mode

DEMO mode provides an isolated, repeatable sandbox environment for hackathon judging and validation.

### Capabilities of DEMO Mode
* **Simulated Weather Injection:** Inject extreme heat waves, high humidity, or sudden drops on demand.
* **Accelerated Escalation Timers:** Configurable timeout windows (e.g., 30–60 seconds instead of 15–30 minutes) to demonstrate the complete escalation loop in live presentations.
* **Deterministic Scenario Playback:** Pre-scripted operational scenarios that execute predictably every time.
* **Instant State Reset:** A single click resets worksites, dismisses pending demo actions, and restores baseline conditions.
* **Prominent Visual Indicators:** An unmistakable top banner states: *"DEMO MODE ACTIVE — SIMULATED DATA — NOT FOR REAL SAFETY OPERATIONS."*

---

## 29. LIVE Mode

LIVE mode represents the authentic operational deployment configuration:
* **Live Ingestion:** Regularly polls commercial weather APIs using true worksite GPS coordinates.
* **Real Operational Timers:** Uses realistic, policy-mandated escalation timeout thresholds (e.g., 15–30 minutes).
* **Real Personnel Dispatch:** Dispatches live notifications via production email, webhook, or SMS channels.
* **True Causal History:** Every event is recorded in the permanent operational database.
* **Visual Status:** Displays green operational indicator: *"LIVE SYSTEM — OPERATIONAL MONITORING ACTIVE."*

---

## 30. Complete System Flow

```text
                    WEATHER / FORECAST
                           │
                           ▼
                   DATA VALIDATION
                           │
                           ▼
                   HEAT-RISK ENGINE
                           │
                           ▼
                  RISK CLASSIFICATION
                           │
                           ▼
                  WORKSITE CONTEXT
                           │
                           ▼
                   ACTION ENGINE
                           │
                           ▼
                     ASSIGNMENT
                           │
                           ▼
                     NOTIFICATION
                           │
                           ▼
                 PENDING RESPONSE
                    /          \
                   /            \
                  ▼              ▼
          ACKNOWLEDGED       NO RESPONSE
               │                 │
               ▼                 ▼
       CONFIRM / EXECUTE     ESCALATION
               │                 │
               └────────┬────────┘
                        ▼
                    AUDIT LOG
                        │
                        ▼
                 SAFETY OVERSIGHT
```

### Stage Walkthrough
1. **Weather / Forecast:** Ingestion of meteorological feeds for worksite coordinates.
2. **Data Validation:** Boundary checks ensure inputs are physically realistic and timely.
3. **Heat-Risk Engine:** Deterministic calculation produces objective thermal index values.
4. **Risk Classification:** Mapping of numerical metrics into actionable risk tiers (`LOW` to `EXTREME`).
5. **Worksite Context:** Workload intensity, direct sun, and available assets adjust the risk threshold.
6. **Action Engine:** Approved matrices generate specific work-rest and hydration directives.
7. **Assignment:** Automatic or manual binding of directive to designated supervisor.
8. **Notification:** Multi-channel alerting delivers directive deep link to supervisor.
9. **Pending Response:** System tracks response latency against escalation deadline.
10. **Acknowledged:** Supervisor confirms receipt; halts escalation timer.
11. **Confirm / Execute:** Supervisor confirms on-site deployment of physical controls.
12. **No Response & Escalation:** Unacknowledged timeout triggers secondary manager alerts.
13. **Audit Log:** Immutable ledger records every state transition, user, and timestamp.
14. **Safety Oversight:** Continuous organizational visibility across all active sites.

---

## 31. Exception Flow Matrix

| Failure / Exception | System Response | User Visibility | Workflow Impact |
| :--- | :--- | :--- | :--- |
| **Weather API Unavailable** | Mark status `UNAVAILABLE`, log failure, alert manager | Yes (Dashboard banner) | Automated risk assessment suspended |
| **Invalid Weather Data** | Reject out-of-bound readings, mark `DEGRADED` | Yes (Data quality badge) | Prevents misleading calculations |
| **Missing Worksite Context** | Prompt administrator for missing mandatory fields | Yes (Setup warning) | Prevents site activation |
| **No Active Supervisor** | Assign emergency ownership to Safety Manager | Yes (High-priority alert) | Action held until reassigned |
| **Notification Failure** | Record `DISPATCH_FAILED`, trigger fallback channel | Yes (Delivery status tag) | Escalation timer continues |
| **No Acknowledgment** | Fire automated escalation upon timeout expiration | Yes (Flashing red alert) | Secondary manager alerted |
| **AI Service Unavailable** | Fallback gracefully; render raw deterministic card | Yes (Info toast) | Core safety workflow unaffected |
| **Backend Service Interruption** | Log exception, retry idempotent state persistence | Yes (Generic retry notice) | State preserved upon recovery |
| **Duplicate Event Ingestion** | Recognize identical timestamp & site ID; deduplicate | Optional (Debug log only) | Prevents duplicate action directives |

---

## 32. State Transition Principles

1. **Traceable Origin:** Every operational risk state must reference a specific environmental snapshot and calculation run.
2. **Causal Linkage:** Every preventive action directive must reference its originating risk assessment record.
3. **Unbroken Ownership:** Every active directive must have an identifiable human user ID assigned at all times.
4. **Distinct Notification State:** Delivery to a device network endpoint is never recorded as human acknowledgment.
5. **Distinct Acknowledgment State:** Acknowledging receipt of instructions is never recorded as field execution.
6. **Preserved Escalation Context:** Escalation records must include the original directive, assigned supervisor, and expired deadline.
7. **Immutable Audit Persistence:** Once an action enters `RESOLVED` or `CONFIRMED`, its lifecycle history is permanently sealed.
8. **No False Safety Signals:** Peripheral service disruptions (weather API, AI provider) must never silently default to a "Safe" or "Normal" status.
9. **AI Subordination:** Generative AI outputs are strictly assistive and can never mutate authoritative system state.

---

## 33. Flow-to-MVP Feature Mapping

| Workflow Domain | MVP Feature ID | Capability Description |
| :--- | :--- | :--- |
| **Worksite Configuration** | **F01** | Worksite Management & Setup |
| **Weather Ingestion** | **F02** | Weather Ingestion & Validation |
| **Heat-Risk Assessment** | **F03** | Deterministic Heat-Risk Calculation |
| **Worksite Contextualization** | **F04** | Worksite Context Management |
| **Action Generation** | **F05** | Action Directive Generation |
| **Supervisor Assignment** | **F06** | Supervisor Assignment & Routing |
| **Notification** | **F07** | Notification Dispatch & Alerts |
| **Acknowledgment** | **F08** | Acknowledgment Service & Tracking |
| **Escalation** | **F09** | Automated Escalation Engine |
| **Audit History** | **F10** | Immutable Audit Trail & History |
| **Supervisor Dashboard** | **F11** | Supervisor Action Center |
| **Safety Manager View** | **F12** | Safety Manager Operations Command Center |
| **NVIDIA AI Assistance** | **F13** | Assistive AI Explanations & Translations |
| **DEMO Mode** | **F14** | Simulation Sandbox & Demo Controls |
| *Authentication & Security* | *Foundational* | Secure Login & RBAC (Cross-Cutting Architecture) |
| *Reliability & Fault Tolerance* | *Foundational* | Idempotency & Graceful Degradation (Cross-Cutting) |

---

## 34. Flow-to-User-Story Mapping

| Workflow Area | Governing User Stories (from [11_USER_STORIES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/11_USER_STORIES.md)) |
| :--- | :--- |
| **Authentication & Access** | `US-AUTH-01`, `US-AUTH-02`, `US-AUTH-03`, `US-SEC-01` |
| **Worksite Configuration** | `US-SITE-01`, `US-SITE-02`, `US-SITE-03`, `US-SITE-04`, `US-SITE-05`, `US-DASH-04` |
| **Weather Ingestion** | `US-WEATHER-01`, `US-WEATHER-02`, `US-WEATHER-03`, `US-WEATHER-04`, `US-WEATHER-05` |
| **Heat-Risk Assessment** | `US-RISK-01`, `US-RISK-02`, `US-RISK-03`, `US-RISK-04` |
| **Worksite Context** | `US-CONTEXT-01`, `US-CONTEXT-02`, `US-CONTEXT-03`, `US-CONTEXT-04`, `US-CONTEXT-05`, `US-CONTEXT-06` |
| **Action Generation** | `US-ACTION-01`, `US-ACTION-02`, `US-ACTION-03`, `US-ACTION-04`, `US-ACTION-05` |
| **Supervisor Assignment** | `US-ASSIGN-01`, `US-ASSIGN-02`, `US-ASSIGN-03`, `US-ASSIGN-04` |
| **Notification Dispatch** | `US-NOTIFY-01`, `US-NOTIFY-02`, `US-NOTIFY-03`, `US-RELIABILITY-03` |
| **Acknowledgment** | `US-ACK-01`, `US-ACK-02`, `US-ACK-03`, `US-ACK-04` |
| **Escalation** | `US-ESC-01`, `US-ESC-02`, `US-ESC-03`, `US-ESC-04` |
| **Verification & Confirmation** | `US-VERIFY-01`, `US-VERIFY-02` |
| **Audit History** | `US-AUDIT-01`, `US-AUDIT-02`, `US-AUDIT-03`, `US-SEC-04` |
| **Safety Manager Command Center** | `US-DASH-01`, `US-DASH-03`, `US-VERIFY-02` |
| **Supervisor Action Center** | `US-DASH-02`, `US-ACTION-02`, `US-ACK-01` |
| **Admin Workflow** | `US-DASH-04`, `US-SITE-01`, `US-AUTH-03` |
| **AI Assistance** | `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04`, `US-AI-05`, `US-AI-06` |
| **Demo & Simulation Sandbox** | `US-DEMO-01`, `US-DEMO-02`, `US-DEMO-03` |
| **Failure & Reliability Handling** | `US-RELIABILITY-01`, `US-RELIABILITY-02`, `US-RELIABILITY-03`, `US-RELIABILITY-04` |
| **End-to-End Core Lifecycle** | `US-E2E-01` |

---

## 35. UX Principles Derived From the Flows

The user workflows establish seven core user experience design principles:

### Principle 1 — Show the Risk
Users should immediately understand what triggered the operational response. Risk badges must display both the calculated operational category and the primary underlying environmental drivers (temperature, humidity, solar exposure).

### Principle 2 — Show the Action
Directives must be concrete, unambiguous, and formatted for rapid scanning. Supervisors must never have to deduce what actions are required; work/rest ratios and hydration volumes must be prominent.

### Principle 3 — Show Ownership
Every action directive and worksite view must clearly state who is responsible. Ambiguous "someone should handle this" states are strictly eliminated.

### Principle 4 — Show Response State
The user interface must clearly communicate where every action sits along the lifecycle: `PENDING`, `ACKNOWLEDGED`, `CONFIRMED`, `ESCALATED`, or `RESOLVED`.

### Principle 5 — Show Escalation
When an action escalates due to inactivity, it must be visually unmistakable. Flashing indicators, red banner styling, and dedicated escalation counters guarantee urgent attention.

### Principle 6 — Show History
Safety managers and auditors must be able to view a chronological event timeline for any worksite or action with a single click.

### Principle 7 — Keep AI Secondary
Generative AI assistance must be framed as an assistive overlay (e.g., "Explain This", "Draft Crew Talk") that clarifies and supports without overshadowing authoritative safety controls.

---

## 36. Definition of User Flows Complete

This user flows document is considered complete and ready to guide frontend, backend, and API implementation when:

* **Actors Are Explicit:** Every workflow clearly designates who initiates, processes, and completes each step.
* **Triggers Are Defined:** Preconditions, input payloads, and triggering events are specified.
* **Transitions Are Unambiguous:** Forward pathways, branching logic, and terminal states are fully mapped.
* **Exception Handling Is Covered:** Provider outages, missing inputs, network drops, and unresponsive supervisors have concrete fallback paths.
* **Boundaries Are Preserved:** The document respects software-first constraints, avoiding IoT prerequisites and medical diagnostic claims.
* **Modes Are Segregated:** Operational differences between LIVE monitoring and DEMO simulation are clearly documented.
* **Traceability Is Maintained:** Direct mappings connect flows to functional requirements, MVP features, and user story IDs.

---

## 37. Final Workflow Principle

> **Every important heat-risk event should have a clear path from signal to decision, from decision to assigned action, from action to accountable response, and from unresolved response to escalation—with enough history to understand what happened afterward.**

**Status:** Draft  
**Last Updated:** 2026-10-07
