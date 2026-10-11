# 11. User Stories — Heat Action Response Engine MVP

## 1. Purpose

This document translates the architectural and functional requirements defined in [10_REQUIREMENTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/10_REQUIREMENTS.md) into user-centered stories and acceptance-oriented scenarios for the **Heat Action Response Engine MVP**.

These stories serve as the common operational contract guiding:
* **Product Development:** Aligning development sprints with concrete user outcomes.
* **UX Design:** Designing clean, role-tailored operational surfaces without superfluous clutter.
* **API Design:** Ensuring backend contracts directly support end-to-end task flows.
* **Implementation:** Keeping development strictly bounded to software-first MVP scope.
* **Testing & Quality Assurance:** Providing verifiable test conditions and boundary tests.
* **Acceptance Testing:** Defining unambiguous criteria for feature sign-off.
* **Hackathon Demonstration:** Supporting the scripted live execution of both nominal and escalation paths.

Every user story strictly preserves the core product workflow:

```text
HEAT SIGNAL
    ↓
RISK ASSESSMENT
    ↓
WORKSITE CONTEXT
    ↓
ACTION
    ↓
ASSIGNMENT
    ↓
NOTIFICATION
    ↓
ACKNOWLEDGMENT
    ↓
VERIFICATION / CONFIRMATION
    ↓
ESCALATION IF UNRESOLVED
    ↓
AUDIT
```

---

## 2. User Story Format

Every user story follows the canonical user-centric structure:

> **As a [role], I want [capability], so that [value/outcome].**

Each story specification includes:
* **Story ID:** Unique identifier prefixed by epic domain (e.g., `US-AUTH-01`).
* **Epic:** The functional domain grouping the story.
* **Priority:** Operational urgency and scope tier:
  * **P0 — Mandatory for MVP:** Essential for the end-to-end operational loop; without this, the core workflow breaks.
  * **P1 — Important Supporting Capability:** Enhances reliability, management, usability, or demo capability.
  * **P2 — Future / Optional:** Advanced or deferred capabilities outside the core MVP boundary.
* **Actor:** The primary persona or system component initiating or benefiting from the capability.
* **User Story:** The standardized user requirement statement.
* **Acceptance Criteria:** Verifiable, testable conditions required to consider the story satisfied.
* **Related Requirement Area:** Cross-reference to [10_REQUIREMENTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/10_REQUIREMENTS.md) functional and non-functional requirements.
* **Related MVP Feature:** Cross-reference to MVP feature IDs (`F01`–`F14`) defined in [04_MVP_SCOPE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/04_MVP_SCOPE.md).

---

## 3. Actors

### 3.1 ADMIN
Responsible for operational foundation setup:
* Worksite profile creation, location geocoordinates, and activation state.
* Authorized user credential and role provisioning.
* Operational policy baseline and baseline supervisor associations.
* Ensuring operational responsibilities are assigned to real individuals.

### 3.2 SAFETY_MANAGER
Responsible for organizational oversight and compliance:
* Monitoring real-time and forecast heat-risk conditions across multiple managed sites.
* Reviewing worksite operational context and environmental risk classifications.
* Overseeing preventive action generation and supervisor assignments.
* Tracking acknowledgment latency, execution confirmations, and open timeouts.
* Receiving, investigating, and resolving system escalations when supervisors fail to respond.
* Reviewing immutable audit trails for organizational accountability and reporting.

### 3.3 SUPERVISOR
Responsible for direct front-line worksite operations:
* Receiving assigned, site-specific preventive action directives.
* Understanding the risk drivers and operational reasoning behind an assigned action.
* Acknowledging receipt of instructions promptly to halt escalation timers.
* Confirming the operational execution of physical controls (hydration breaks, shade setup, work shifts).
* Providing human operational feedback when physical worksite conditions diverge from baseline models.

### 3.4 SYSTEM
Represents automated platform processes operating under deterministic logic:
* Scheduled and on-demand weather/forecast retrieval from trusted APIs.
* Input validation, boundary checks, and data freshness tracking.
* Deterministic heat-risk assessment based on published, approved occupational index algorithms.
* Generating contextual preventive action protocols from approved organizational rule matrices.
* Automated notification dispatch across primary channels.
* Escalation timer management, timeout detection, and fallback alerting.
* Immutable audit event creation and ledger persistence.

### 3.5 AI ASSISTANT
Represents assistive, bounded intelligence (powered by NVIDIA AI infrastructure):
* Synthesizing multi-variable environmental and contextual factors into plain-language summaries.
* Clarifying operational rationale for front-line supervisors.
* Formulating concise toolbox talk scripts and vernacular translations.
* Summarizing post-shift event timelines for managerial reviews.
* **Strict Constraint:** The AI Assistant is an advisor only. It never calculates safety thresholds, modifies protocols, overrides deterministic rules, or makes autonomous decisions.

### 3.6 Secondary / Future Actors
Identified for architectural context and future expansion, but explicitly excluded from direct user interaction in the MVP:
* **Worker:** Field personnel benefiting from executed preventive controls; receives instructions via the human supervisor (no worker-facing app or login in MVP).
* **Operations Manager:** Executive reviewing cross-portfolio aggregate safety trends and productivity impacts.
* **Occupational Safety Professional:** Specialist defining customized heat stress threshold algorithms and institutional policies.

---

## 4. Epic Overview

The user stories are organized across seventeen functional and operational epics:

1. **Authentication & Access:** Secure identity, role-based access control, session boundaries.
2. **Worksite Management:** Physical site profiles, location association, operational lifecycle.
3. **Weather & Environmental Data:** API retrieval, data caching, freshness validation, failure fallback.
4. **Heat-Risk Assessment:** Deterministic evaluation, threshold classification, explainable drivers.
5. **Worksite Context:** Operational characteristics, workload intensity, exposure, protective controls.
6. **Action Management:** Protocol generation, linking actions to risk, status tracking.
7. **Assignment:** Explicit supervisor ownership, reassignment, ownership accountability.
8. **Notifications:** Reliable dispatch, multi-channel alerting, delivery state tracking.
9. **Acknowledgment:** Receipt confirmation, timestamp capture, escalation suppression.
10. **Escalation:** Timeout detection, multi-tier escalation notifications, manager intervention.
11. **Verification:** Distinguishing software receipt from operational physical confirmation.
12. **Audit History:** Comprehensive chronologies, causal traceability, tamper-evident logs.
13. **Dashboards:** Safety Manager Command Center, Supervisor Action Center, Admin views.
14. **Simulation / Demo:** Scripted heat event triggers, accelerated timeouts, repeatable resets.
15. **AI Assistance:** Plain-language explanations, multilingual translation, audit summaries.
16. **Security & Privacy:** Role boundaries, minimal data exposure, audit protection.
17. **Reliability & Failure Handling:** Stale data detection, graceful degradation, idempotency.

---

## 5. Authentication & Access

### US-AUTH-01 — User Sign-In
* **Epic:** Authentication & Access
* **Priority:** P0
* **Actor:** User
* **User Story:**
  > As an authorized user, I want to sign in so that I can securely access the system according to my role.
* **Acceptance Criteria:**
  * Authorized users can authenticate with valid credentials.
  * Invalid authentication attempts are rejected with clear, generic error messages.
  * Successful authentication correctly establishes the user's role (`ADMIN`, `SAFETY_MANAGER`, or `SUPERVISOR`).
  * Unauthenticated users are prevented from accessing any operational API endpoint or view.
  * Authentication sessions expire after configured inactivity periods.
* **Related Requirement Area:** FR-01 (Authentication & RBAC), SEC-01
* **Related MVP Feature:** Cross-cutting foundational capability

---

### US-AUTH-02 — Role-Based Access Control
* **Epic:** Authentication & Access
* **Priority:** P0
* **Actor:** User
* **User Story:**
  > As a user, I want to see only the capabilities permitted for my role so that operational information and actions are appropriately protected.
* **Acceptance Criteria:**
  * `ADMIN` users can access system configuration, worksite setup, and user provisioning.
  * `SAFETY_MANAGER` users can view all worksites, trigger evaluations, review escalations, and inspect audit logs.
  * `SUPERVISOR` users can view only their assigned worksites, pending action items, and relevant site context.
  * Any unauthorized request to mutate data or access restricted endpoints is rejected with an HTTP 403 response.
  * UI visibility boundaries are strictly backed by backend authorization enforcement.
* **Related Requirement Area:** FR-01 (Role-Based Access Control), SEC-01
* **Related MVP Feature:** Cross-cutting foundational capability

---

### US-AUTH-03 — User Role Configuration
* **Epic:** Authentication & Access
* **Priority:** P1
* **Actor:** ADMIN
* **User Story:**
  > As an administrator, I want to configure authorized user roles so that operational responsibilities are clearly defined.
* **Acceptance Criteria:**
  * Administrators can assign or update user roles (`ADMIN`, `SAFETY_MANAGER`, `SUPERVISOR`).
  * Administrators can associate supervisors with valid contact channels (email, SMS/webhook identifiers).
  * Role updates take effect immediately upon the next user authorization check.
  * Deactivated users cannot authenticate or receive active operational assignments.
* **Related Requirement Area:** FR-01, FR-02
* **Related MVP Feature:** F01 (Worksite Management & User Provisioning)

---

## 6. Worksite Management

### US-SITE-01 — Create Worksite
* **Epic:** Worksite Management
* **Priority:** P0
* **Actor:** ADMIN
* **User Story:**
  > As an ADMIN, I want to create a worksite so that the system can monitor and manage heat risk for that location.
* **Acceptance Criteria:**
  * Administrators can input worksite name, geographic coordinates (latitude and longitude), and operating timezone.
  * Geographic coordinates are validated for valid geographical bounds (-90 to 90 lat, -180 to 180 lon).
  * System assigns a unique, immutable worksite identifier upon creation.
  * Incomplete or invalid required fields prevent site creation and display clear validation feedback.
* **Related Requirement Area:** FR-02 (Worksite Management)
* **Related MVP Feature:** F01 (Worksite Management)

---

### US-SITE-02 — View Worksite
* **Epic:** Worksite Management
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to view a worksite so that I can understand its current operational and heat-risk state.
* **Acceptance Criteria:**
  * Safety managers can view a comprehensive profile of any configured worksite.
  * The view displays current weather observations, calculated risk level, assigned supervisor, and active actions.
  * Worksites with active escalations or pending actions are highlighted visually.
  * Worksites can be filtered or sorted by current heat-risk tier.
* **Related Requirement Area:** FR-02, FR-12
* **Related MVP Feature:** F12 (Safety Manager Operations View)

---

### US-SITE-03 — Configure Worksite Context
* **Epic:** Worksite Management
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to configure relevant worksite characteristics so that risk and actions can be interpreted in operational context.
* **Acceptance Criteria:**
  * Users can select work environment classification (direct sun outdoor, covered outdoor, semi-indoor).
  * Users can configure baseline workload intensity (light, moderate, heavy, very heavy).
  * Users can record on-site mitigations (water station proximity, shade availability, active cooling stations).
  * Context modifications update the worksite profile and trigger an audit entry.
* **Related Requirement Area:** FR-02, FR-04
* **Related MVP Feature:** F04 (Worksite Context Management)

---

### US-SITE-04 — Assign Supervisor to Worksite
* **Epic:** Worksite Management
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to assign a supervisor to a worksite so that heat-related actions have clear ownership.
* **Acceptance Criteria:**
  * An authorized user can select an active user with the `SUPERVISOR` role for a worksite.
  * Worksite profile clearly displays the assigned primary supervisor's name and contact information.
  * When heat-risk actions are generated for that site, they automatically route to the assigned supervisor.
  * A worksite without an assigned supervisor warns the administrator and falls back to safety manager assignment.
* **Related Requirement Area:** FR-02, FR-06
* **Related MVP Feature:** F01, F06 (Supervisor Assignment)

---

### US-SITE-05 — Activate / Deactivate Worksite
* **Epic:** Worksite Management
* **Priority:** P1
* **Actor:** ADMIN
* **User Story:**
  > As an ADMIN, I want to activate or deactivate a worksite so that only operational worksites participate in active workflows.
* **Acceptance Criteria:**
  * Administrators can toggle a worksite status between Active and Inactive.
  * Inactive worksites cease automated weather polling and scheduled heat-risk evaluations.
  * Deactivation preserves historical data, completed actions, and audit logs.
  * Pending active actions must be acknowledged, confirmed, or dismissed before deactivation completes.
* **Related Requirement Area:** FR-02
* **Related MVP Feature:** F01 (Worksite Management)

---

## 7. Weather & Environmental Data

### US-WEATHER-01 — Retrieve Weather Data
* **Epic:** Weather & Environmental Data
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to retrieve current/forecast weather information for a configured worksite so that heat-risk assessment can use relevant environmental inputs.
* **Acceptance Criteria:**
  * System calls approved external weather APIs using the worksite's geographic coordinates.
  * Retrieved payload includes dry-bulb temperature, relative humidity, wind speed, solar radiation/cloud cover, and forecast periods.
  * Retrieved values are parsed and validated against physical boundary limits.
  * Retrieval can be triggered by scheduled background timers or on-demand manual requests.
* **Related Requirement Area:** FR-03 (Weather & Environmental Ingestion)
* **Related MVP Feature:** F02 (Weather Ingestion & Processing)

---

### US-WEATHER-02 — Associate Weather With Worksite
* **Epic:** Weather & Environmental Data
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want weather information associated with the correct worksite so that risk calculations use the appropriate environmental context.
* **Acceptance Criteria:**
  * Incoming weather payloads are strictly tagged with the target `worksite_id`.
  * Weather observation records include an ingestion timestamp, source provider identifier, and location coordinates.
  * System preserves the exact environmental snapshot used during any subsequent risk assessment.
* **Related Requirement Area:** FR-03, FR-04
* **Related MVP Feature:** F02 (Weather Ingestion & Processing)

---

### US-WEATHER-03 — Display Data Freshness
* **Epic:** Weather & Environmental Data
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see when weather data was retrieved so that I can understand how current the information is.
* **Acceptance Criteria:**
  * UI explicitly shows the observation timestamp and elapsed time since last retrieval for each site.
  * Data older than the defined freshness threshold (e.g., 60 minutes) is visually flagged as stale.
  * Safety managers can initiate an on-demand refresh to pull updated weather data immediately.
* **Related Requirement Area:** FR-03, FR-12
* **Related MVP Feature:** F02, F12 (Safety Manager Operations View)

---

### US-WEATHER-04 — Handle Weather Provider Failure
* **Epic:** Weather & Environmental Data
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to detect weather-provider failures so that missing information is not silently interpreted as safe conditions.
* **Acceptance Criteria:**
  * Upstream API network errors, HTTP 5xx responses, or rate limits are intercepted without crashing.
  * The system transitions the worksite's data status to `UNAVAILABLE` or `DATA_DEGRADED`.
  * System does not default to zero degrees or assume low risk in the absence of valid data.
  * System raises an operational alert for the Safety Manager indicating data ingestion disruption.
* **Related Requirement Area:** FR-03, NFR-03 (Reliability & Resilience)
* **Related MVP Feature:** F02, F12

---

### US-WEATHER-05 — Distinguish Simulation Data
* **Epic:** Weather & Environmental Data
* **Priority:** P1
* **Actor:** Demonstrator / User
* **User Story:**
  > As a demonstrator, I want to distinguish simulated conditions from live weather information so that demonstration scenarios are not mistaken for real operational data.
* **Acceptance Criteria:**
  * When operating in simulation mode, environmental payloads carry an explicit `is_simulated = true` flag.
  * The user interface renders a prominent visual banner identifying simulated environmental inputs.
  * Audit logs and event histories clearly distinguish simulated weather events from live API ingestion.
  * Live weather polling can be paused or bypassed during active demo scenarios.
* **Related Requirement Area:** FR-03, FR-14 (Simulation Mode)
* **Related MVP Feature:** F14 (Simulation & Hackathon Demo Sandbox)

---

## 8. Heat-Risk Assessment

### US-RISK-01 — Determine Heat Risk
* **Epic:** Heat-Risk Assessment
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to evaluate available environmental and contextual inputs using deterministic rules so that heat-risk classification is consistent and explainable.
* **Acceptance Criteria:**
  * System calculates environmental heat index (or estimated WBGT) using deterministic, mathematical formulas.
  * Result is classified into established operational risk categories: `LOW`, `MODERATE`, `HIGH`, `EXTREME`.
  * Contextual adjustments (workload intensity, direct sun radiant heat) modify the operational threshold deterministically.
  * Given identical environmental and contextual inputs, the engine produces identical risk outputs every time.
* **Related Requirement Area:** FR-04 (Deterministic Heat-Risk Assessment)
* **Related MVP Feature:** F03 (Heat-Risk Calculation Engine)

---

### US-RISK-02 — View Risk Classification
* **Epic:** Heat-Risk Assessment
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see the current heat-risk classification for a worksite so that I can understand whether preventive action may be required.
* **Acceptance Criteria:**
  * Safety manager dashboard displays prominent risk badges (`LOW`, `MODERATE`, `HIGH`, `EXTREME`) per worksite.
  * Visual indicators use accessible, high-contrast color coding and text labels.
  * System displays both the underlying metric (e.g., Heat Index 39.2°C) and the operational tier.
  * Sites transitioning across threshold boundaries update their visual state promptly.
* **Related Requirement Area:** FR-04, FR-12
* **Related MVP Feature:** F03, F12

---

### US-RISK-03 — Explain Risk Drivers
* **Epic:** Heat-Risk Assessment
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to understand why a worksite has been assigned a particular risk level so that I understand the reason behind the requested action.
* **Acceptance Criteria:**
  * Risk details breakdown shows the primary contributors (e.g., high humidity 82%, direct sun radiation, heavy physical labor).
  * System states the exact threshold rule triggered (e.g., "Heat Index > 38°C with Heavy Workload elevates risk to HIGH").
  * Explanations are deterministic and derived from rule execution facts, not probabilistic AI hallucinations.
  * Explanations avoid medical jargon and state operational conditions clearly.
* **Related Requirement Area:** FR-04, FR-11
* **Related MVP Feature:** F03, F11 (Supervisor Action Center)

---

### US-RISK-04 — Handle Uncertain Assessment
* **Epic:** Heat-Risk Assessment
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to identify insufficient or unreliable inputs so that the system does not silently present an uncertain assessment as a reliable one.
* **Acceptance Criteria:**
  * If critical input parameters (e.g., temperature or humidity) are missing, assessment status is set to `UNCERTAIN` / `DEGRADED`.
  * The system displays an explicit warning: "Risk assessment degraded due to incomplete data."
  * System does not generate standard automated action directives based on uncertain inputs without flagging data quality.
  * Safety managers receive an administrative prompt to review site conditions manually.
* **Related Requirement Area:** FR-04, NFR-03
* **Related MVP Feature:** F03, F12

---

## 9. Worksite Context

### US-CONTEXT-01 — Configure Work Type
* **Epic:** Worksite Context
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to define the type of work performed at a site so that preventive actions can reflect operational context.
* **Acceptance Criteria:**
  * User can specify operational domain (e.g., Construction, Logistics Yard, Agricultural Field, Roadwork).
  * Work type is stored in the worksite profile and linked to risk threshold matrices.
  * Action generation engine tailors suggested control measures to the configured work type.
* **Related Requirement Area:** FR-02, FR-05
* **Related MVP Feature:** F04 (Worksite Context Management)

---

### US-CONTEXT-02 — Configure Workload Intensity
* **Epic:** Worksite Context
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to define a relevant workload category so that heat-risk assessment can consider the intensity of work.
* **Acceptance Criteria:**
  * User can select from defined metabolic workload tiers: `LIGHT`, `MODERATE`, `HEAVY`, `VERY_HEAVY`.
  * Each tier references objective operational descriptions (e.g., equipment operation vs. manual heavy lifting).
  * Changes in workload category recalculate risk thresholds during subsequent engine runs.
* **Related Requirement Area:** FR-04, FR-05
* **Related MVP Feature:** F04

---

### US-CONTEXT-03 — Configure Heat Exposure Conditions
* **Epic:** Worksite Context
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to describe relevant heat exposure conditions so that the system can contextualize environmental risk.
* **Acceptance Criteria:**
  * User can define radiant heat conditions (full direct sunlight, partial tree/awning shade, enclosed unconditioned space).
  * User can indicate ground surface thermal attributes (asphalt, concrete, bare soil, reflective metal).
  * Exposure settings are incorporated into the contextual risk modifier rules.
* **Related Requirement Area:** FR-04, FR-05
* **Related MVP Feature:** F04

---

### US-CONTEXT-04 — Configure Hydration and Cooling Resources
* **Epic:** Worksite Context
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to record available hydration, shade, or cooling resources so that preventive actions can reflect available controls.
* **Acceptance Criteria:**
  * User can check available on-site controls: potable chilled water, shaded rest shelters, misting fans, air-conditioned trailers.
  * Walking distance/travel time to water and shade can be recorded.
  * Generated preventive actions cite available specific site assets (e.g., "Direct crew to designated Shade Canopy 2").
* **Related Requirement Area:** FR-05
* **Related MVP Feature:** F04, F05 (Action Generation Engine)

---

### US-CONTEXT-05 — Configure Shift Context
* **Epic:** Worksite Context
* **Priority:** P0
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to configure relevant shift/time information so that risk can be evaluated in the correct operational context.
* **Acceptance Criteria:**
  * User can set operating hours (shift start time, shift end time) and lunch/rest windows.
  * Automated evaluations focus on active shift hours and flag peak midday thermal windows (e.g., 12:00–16:00).
  * Actions generated outside active shift hours are flagged as advisory or scheduled for shift commencement.
* **Related Requirement Area:** FR-02, FR-05
* **Related MVP Feature:** F04

---

### US-CONTEXT-06 — Configure PPE and Clothing Context
* **Epic:** Worksite Context
* **Priority:** P1
* **Actor:** Authorized User (ADMIN / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want to record relevant PPE or clothing context where supported so that the system can account for an important operational risk factor.
* **Acceptance Criteria:**
  * User can select standard clothing ensemble (standard cotton breathable, heavy overalls, impermeable chemical suits/high-vis heavy gear).
  * Impermeable PPE selections apply an approved adjustment factor to the effective heat threshold.
  * The system maintains strict operational abstraction, collecting zero personal medical or physiological data.
* **Related Requirement Area:** FR-04, FR-05, SEC-02
* **Related MVP Feature:** F04

---

## 10. Action Management

### US-ACTION-01 — Generate Preventive Action Directives
* **Epic:** Action Management
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to generate appropriate preventive actions from an identified heat-risk condition and approved rules so that risk information becomes an operational response.
* **Acceptance Criteria:**
  * System executes deterministic rule matrices mapping risk level and context to predefined action templates.
  * Action directive includes specific work/rest ratios (e.g., "45 min work / 15 min rest per hour").
  * Action directive specifies required hydration volume (e.g., "1 liter chilled water per worker per hour").
  * Action directive specifies shade deployment, buddy-system monitoring, and emergency contact readiness.
  * Generated action receives a unique, traceable `action_id` and initial status `PENDING`.
* **Related Requirement Area:** FR-05 (Action Generation Engine)
* **Related MVP Feature:** F05 (Action Generation Engine)

---

### US-ACTION-02 — View Required Action
* **Epic:** Action Management
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to see the required preventive action so that I know what response is expected.
* **Acceptance Criteria:**
  * Supervisor Action Center displays active action directives clearly at the top of the interface.
  * Action details specify target worksite, required physical controls, and expected implementation steps.
  * Directives are rendered with unambiguous typography, checklist points, and visual urgency tags.
* **Related Requirement Area:** FR-05, FR-11
* **Related MVP Feature:** F05, F11 (Supervisor Action Center)

---

### US-ACTION-03 — Understand Action Rationale
* **Epic:** Action Management
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to understand why an action was generated so that the requested response is understandable.
* **Acceptance Criteria:**
  * Action view provides a clear summary linking environmental drivers and site context to the action requirements.
  * Display shows: "Triggered by: Heat Index 41°C + Heavy Roofing Work in Direct Sun."
  * Policy references cite approved organizational safety rules.
  * Rationale is derived strictly from deterministic system evaluation rules.
* **Related Requirement Area:** FR-04, FR-05, FR-11
* **Related MVP Feature:** F05, F11

---

### US-ACTION-04 — Link Action to Risk Event
* **Epic:** Action Management
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want each action linked to the risk event that generated it so that the operational decision can be traced.
* **Acceptance Criteria:**
  * Every action record maintains a foreign key reference to the exact `assessment_id` and `weather_id` snapshot.
  * Clicking an action in the management console reveals the complete environmental state at the time of creation.
  * Auditing queries can reconstruct the full chain of causality from raw sensor input to generated directive.
* **Related Requirement Area:** FR-05, FR-10 (Audit Trail & Event Ledger)
* **Related MVP Feature:** F05, F10 (Audit History)

---

### US-ACTION-05 — Track Action Lifecycle Status
* **Epic:** Action Management
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see action status so that I can identify pending, acknowledged, completed/confirmed, or escalated actions.
* **Acceptance Criteria:**
  * Actions display valid state machine transitions: `PENDING` $\rightarrow$ `NOTIFIED` $\rightarrow$ `ACKNOWLEDGED` $\rightarrow$ `CONFIRMED` (or $\rightarrow$ `ESCALATED` $\rightarrow$ `RESOLVED`).
  * Safety Manager console provides one-click filtering by action status across all worksites.
  * Overdue and escalated actions are visually elevated with distinct warning styling.
* **Related Requirement Area:** FR-05, FR-12
* **Related MVP Feature:** F05, F12

---

## 11. Assignment

### US-ASSIGN-01 — Assign Action to Supervisor
* **Epic:** Assignment
* **Priority:** P0
* **Actor:** SAFETY_MANAGER / SYSTEM
* **User Story:**
  > As a SAFETY_MANAGER, I want to assign a preventive action to a responsible supervisor so that ownership is explicit.
* **Acceptance Criteria:**
  * System automatically routes generated actions to the primary supervisor assigned to that worksite.
  * If automated routing fails or needs adjustment, a Safety Manager can manually select an authorized supervisor.
  * Action record explicitly records the assigned user's ID, name, and assignment timestamp.
  * Unassigned actions are flagged as high-priority anomalies requiring immediate intervention.
* **Related Requirement Area:** FR-06 (Supervisor Assignment & Routing)
* **Related MVP Feature:** F06 (Supervisor Assignment)

---

### US-ASSIGN-02 — View Action Ownership
* **Epic:** Assignment
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to see that an action is assigned to me so that I know I am responsible for responding.
* **Acceptance Criteria:**
  * Supervisor dashboard presents an "Assigned to Me" queue filtering out unrelated site actions.
  * Push/SMS/in-app notification directly addresses the supervisor by name.
  * Details emphasize personal operational responsibility for site crew compliance.
* **Related Requirement Area:** FR-06, FR-11
* **Related MVP Feature:** F06, F11

---

### US-ASSIGN-03 — Reassign Action
* **Epic:** Assignment
* **Priority:** P1
* **Actor:** Authorized User (SAFETY_MANAGER / SUPERVISOR)
* **User Story:**
  > As an authorized user, I want to reassign an action when responsibility changes so that ownership remains accurate.
* **Acceptance Criteria:**
  * Safety Manager (or current Supervisor in handover scenarios) can transfer action ownership to another active supervisor.
  * System prompts for a mandatory handover reason or notes.
  * Reassignment immediately notifies the new supervisor and restarts the acknowledgment response window.
  * Previous supervisor's queue updates to reflect the reassignment.
* **Related Requirement Area:** FR-06, FR-10
* **Related MVP Feature:** F06, F10

---

### US-ASSIGN-04 — Preserve Assignment History
* **Epic:** Assignment
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want assignment changes recorded so that responsibility can be reconstructed later.
* **Acceptance Criteria:**
  * System logs an immutable event for initial assignment and every subsequent reassignment.
  * Event captures timestamp, originating user ID, previous assignee, new assignee, and transition notes.
  * Audit inspection UI renders a clean chronological timeline of all ownership changes.
* **Related Requirement Area:** FR-06, FR-10
* **Related MVP Feature:** F06, F10

---

## 12. Notifications

### US-NOTIFY-01 — Notify Assigned Supervisor
* **Epic:** Notifications
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to notify the assigned supervisor when an action requires attention so that the responsible person is informed.
* **Acceptance Criteria:**
  * System triggers notification immediately upon action generation and assignment.
  * MVP notification dispatch delivers via in-app real-time alerts, email, and configured webhook/SMS mockup.
  * Dispatch attempt occurs within 5 seconds of action creation.
  * System marks action notification state as `DISPATCHED`.
* **Related Requirement Area:** FR-07 (Notification Dispatch & Delivery)
* **Related MVP Feature:** F07 (Notification Engine)

---

### US-NOTIFY-02 — Clear and Actionable Notification Content
* **Epic:** Notifications
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want the notification to identify the worksite, risk context, required action, and response path so that I can act without ambiguity.
* **Acceptance Criteria:**
  * Notification message clearly includes: Worksite Name, Current Risk Level, Core Required Actions (Work/Rest, Water), and Acknowledgment Deadline.
  * Message includes a direct, one-click deep link or action button to the Supervisor Action Center.
  * Text is concise, avoiding dense technical jargon and ambiguity.
* **Related Requirement Area:** FR-07, FR-11
* **Related MVP Feature:** F07, F11

---

### US-NOTIFY-03 — Track Notification Delivery Status
* **Epic:** Notifications
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see notification status so that I can understand whether the system attempted delivery.
* **Acceptance Criteria:**
  * UI shows dispatch timestamps, target communication endpoint, and provider return status (`SENT`, `FAILED`, `PENDING`).
  * Failed delivery attempts trigger an immediate system warning on the Safety Manager console.
  * The system explicitly notes that "Delivery Confirmed" indicates network transit, not human visual reading or operational comprehension.
* **Related Requirement Area:** FR-07, FR-12
* **Related MVP Feature:** F07, F12

---

## 13. Acknowledgment

### US-ACK-01 — View Actions Requiring Acknowledgment
* **Epic:** Acknowledgment
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to see actions requiring my acknowledgment so that I can respond promptly.
* **Acceptance Criteria:**
  * Supervisor Action Center prominently renders an acknowledgment badge and countdown timer on pending actions.
  * Timer shows remaining time before automated escalation triggers.
  * View is clean, responsive on mobile viewports, and accessible under high-glare field conditions.
* **Related Requirement Area:** FR-08 (Acknowledgment & Accountability Tracking), FR-11
* **Related MVP Feature:** F08 (Acknowledgment Service), F11

---

### US-ACK-02 — Acknowledge Assigned Action
* **Epic:** Acknowledgment
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to acknowledge an assigned action so that the system knows I have received and accepted the operational instruction.
* **Acceptance Criteria:**
  * Supervisor can acknowledge the action via a clear, unambiguous "Acknowledge Action" button.
  * Acknowledgment action requires explicit user interaction (no passive or automated auto-acknowledgment).
  * System updates action status to `ACKNOWLEDGED`.
  * The pending escalation timer is immediately halted and dismissed upon acknowledgment.
* **Related Requirement Area:** FR-08, FR-09
* **Related MVP Feature:** F08, F09 (Escalation Engine)

---

### US-ACK-03 — Record Acknowledgment Timestamp
* **Epic:** Acknowledgment
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to record who acknowledged an action and when so that response timing is traceable.
* **Acceptance Criteria:**
  * System captures exact UTC timestamp of acknowledgment submission.
  * System records authenticated user ID and IP/session metadata.
  * Calculates and stores latency between notification dispatch and acknowledgment.
  * Appends an immutable audit event to the worksite event ledger.
* **Related Requirement Area:** FR-08, FR-10
* **Related MVP Feature:** F08, F10 (Audit History)

---

### US-ACK-04 — Confirm Physical Execution
* **Epic:** Acknowledgment
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want to confirm execution where supported so that the system can distinguish acknowledgment from confirmation.
* **Acceptance Criteria:**
  * After acknowledging, supervisor has access to a "Confirm Execution" interface.
  * Interface allows checking off implemented controls (e.g., "Water distributed", "Rest break initiated", "Shade deployed").
  * System transitions action status to `CONFIRMED`.
  * The system distinguishes software confirmation from physical reality, clearly labelling this as "Supervisor Self-Reported Confirmation."
* **Related Requirement Area:** FR-08, FR-10
* **Related MVP Feature:** F08, F10

---

## 14. Escalation

### US-ESC-01 — Detect Unresolved Action
* **Epic:** Escalation
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to identify actions that remain unresolved according to configured policy so that they can be escalated.
* **Acceptance Criteria:**
  * System monitors active actions in `PENDING` or `NOTIFIED` state against the site escalation timeout window.
  * In normal operational mode, the policy threshold defaults to 15 minutes (or configured policy).
  * In simulation/demo mode, the timeout can be compressed to 30–60 seconds.
  * When elapsed time exceeds the threshold without acknowledgment, an escalation trigger fires automatically.
* **Related Requirement Area:** FR-09 (Automated Escalation Engine)
* **Related MVP Feature:** F09 (Escalation Engine)

---

### US-ESC-02 — Execute Automated Escalation
* **Epic:** Escalation
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to notify an appropriate escalation recipient when an action remains unresolved so that responsibility does not disappear after the initial notification.
* **Acceptance Criteria:**
  * System updates action status from `NOTIFIED` to `ESCALATED`.
  * Generates and dispatches an urgent escalation notification to the designated Safety Manager and secondary contacts.
  * Notification highlights: "UNRESOLVED HEAT ACTION: Supervisor [Name] has not responded to HIGH risk at Worksite [Site] within [X] minutes."
  * System sends a secondary re-alert to the primary supervisor.
* **Related Requirement Area:** FR-09, FR-07
* **Related MVP Feature:** F09, F07

---

### US-ESC-03 — View Escalated Actions
* **Epic:** Escalation
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see escalated actions so that I can intervene when a response has not occurred.
* **Acceptance Criteria:**
  * Safety Manager Command Center features a dedicated "Active Escalations" alert banner and table.
  * Escalated rows pulse or display high-contrast red warning styling.
  * One-click action allows the Safety Manager to intervene directly (e.g., call supervisor, reassign action, or force site stand-down).
* **Related Requirement Area:** FR-09, FR-12
* **Related MVP Feature:** F09, F12 (Safety Manager Operations View)

---

### US-ESC-04 — Preserve Escalation History
* **Epic:** Escalation
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want escalation events recorded so that the response sequence remains traceable.
* **Acceptance Criteria:**
  * System records timeout expiration timestamp, escalation dispatch time, recipient list, and subsequent resolution actions.
  * Escalation history is permanently attached to the action's lifecycle record.
  * Post-event audit exports explicitly document the latency and escalation breakdown for safety compliance reviews.
* **Related Requirement Area:** FR-09, FR-10
* **Related MVP Feature:** F09, F10

---

## 15. Verification

### US-VERIFY-01 — Distinguish Acknowledgment From Execution
* **Epic:** Verification
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want the system to distinguish acknowledgment from execution/confirmation so that the audit history does not overstate what actually occurred.
* **Acceptance Criteria:**
  * System schema maintains separate, discrete timestamps and states for `acknowledged_at` and `confirmed_at`.
  * Dashboards clearly differentiate:
    * "Acknowledged" = Supervisor saw and accepted directive.
    * "Confirmed" = Supervisor attested that physical controls were deployed.
  * The system never implies that acknowledgment equates to verified field compliance.
* **Related Requirement Area:** FR-08, FR-10
* **Related MVP Feature:** F08, F10

---

### US-VERIFY-02 — View Comprehensive Response State
* **Epic:** Verification
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to see whether an action is pending, acknowledged, confirmed, unresolved, or escalated so that I understand its current state.
* **Acceptance Criteria:**
  * Worksite detail view renders a clear multi-step progress stepper:
    `Triggered` $\rightarrow$ `Assigned` $\rightarrow$ `Dispatched` $\rightarrow$ `Acknowledged` $\rightarrow$ `Confirmed`.
  * If escalation occurred, the stepper displays an `Escalated` branch with timestamp and resolution status.
  * Current status is instantly discernible without drilling into sub-menus.
* **Related Requirement Area:** FR-08, FR-12
* **Related MVP Feature:** F08, F12

---

## 16. Audit History

### US-AUDIT-01 — View Event History
* **Epic:** Audit History
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to view the history of important risk-response events so that I can reconstruct what happened.
* **Acceptance Criteria:**
  * Safety Manager can open an audit log view for any worksite or organizational scope.
  * Log lists chronological events: weather ingested, risk calculated, action generated, notification sent, acknowledgment recorded, escalation fired, and confirmation received.
  * Events display UTC timestamp, actor (system, supervisor, safety manager), event type, and outcome.
  * Logs can be filtered by date range, worksite, or event severity.
* **Related Requirement Area:** FR-10 (Audit Trail & Event Ledger)
* **Related MVP Feature:** F10 (Audit History)

---

### US-AUDIT-02 — Trace Risk to Action
* **Epic:** Audit History
* **Priority:** P0
* **Actor:** Authorized User (SAFETY_MANAGER / ADMIN)
* **User Story:**
  > As an authorized user, I want to trace an action back to the risk event that generated it so that the operational reasoning is understandable.
* **Acceptance Criteria:**
  * Clicking an action audit record displays the upstream heat-risk assessment and raw weather variables.
  * Shows the exact decision rules evaluated and threshold criteria met.
  * Preserves full causal integrity for safety reviews and regulatory inquiries.
* **Related Requirement Area:** FR-10, FR-04, FR-05
* **Related MVP Feature:** F10

---

### US-AUDIT-03 — Trace Action to Response Lifecycle
* **Epic:** Audit History
* **Priority:** P0
* **Actor:** Authorized User (SAFETY_MANAGER / ADMIN)
* **User Story:**
  > As an authorized user, I want to trace an action through assignment, notification, acknowledgment, escalation, and confirmation so that the response lifecycle is visible.
* **Acceptance Criteria:**
  * System provides an unbroken audit chain linking `action_id` to all subsequent response telemetry.
  * Shows exact elapsed time between every lifecycle state transition.
  * Audit records are append-only; existing records cannot be edited or deleted via the UI or API.
* **Related Requirement Area:** FR-10, SEC-04
* **Related MVP Feature:** F10

---

## 17. Dashboards

### US-DASH-01 — Safety Manager Command Center
* **Epic:** Dashboards
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want a dashboard showing worksite risk, active actions, pending responses, and escalations so that I can prioritize attention.
* **Acceptance Criteria:**
  * Top metrics ribbon shows: Total Active Sites, Sites in High/Extreme Risk, Pending Acknowledgments, Active Escalations.
  * Interactive worksite table lists all sites with current risk badges, active actions, and assigned supervisors.
  * Allows sorting by highest risk level and longest pending response latency.
  * Automatically refreshes or updates via polling/WebSockets without requiring full page reload.
* **Related Requirement Area:** FR-12 (Safety Manager Operations View)
* **Related MVP Feature:** F12 (Safety Manager Operations View)

---

### US-DASH-02 — Supervisor Action Center
* **Epic:** Dashboards
* **Priority:** P0
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want a focused view of my assigned actions so that I know what requires my attention.
* **Acceptance Criteria:**
  * Dedicated, low-friction view displaying only the logged-in supervisor's assigned worksite(s).
  * Prominently highlights pending actions requiring immediate acknowledgment with countdown timers.
  * Clear action cards detail work/rest schedules, hydration requirements, and site assets.
  * Fully responsive for tablet and smartphone field use.
* **Related Requirement Area:** FR-11 (Supervisor Action Center)
* **Related MVP Feature:** F11 (Supervisor Action Center)

---

### US-DASH-03 — Worksite Detail View
* **Epic:** Dashboards
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want to open a worksite and see its risk, context, actions, and response history so that I can understand its operational state.
* **Acceptance Criteria:**
  * Detailed worksite screen displays geographic metadata, active operational context, and real-time weather metrics.
  * Displays current active action directives and recent action history.
  * Displays embedded chronological audit trail for the selected worksite.
* **Related Requirement Area:** FR-02, FR-12
* **Related MVP Feature:** F01, F12

---

### US-DASH-04 — Admin Configuration View
* **Epic:** Dashboards
* **Priority:** P1
* **Actor:** ADMIN
* **User Story:**
  > As an ADMIN, I want to manage worksites and authorized users so that the operational environment remains configured correctly.
* **Acceptance Criteria:**
  * Administrative interface for creating, editing, activating, and deactivating worksites.
  * User management screen for inviting users, configuring roles, and setting contact endpoints.
  * System configuration panel for adjusting default escalation timeout policies.
* **Related Requirement Area:** FR-01, FR-02
* **Related MVP Feature:** F01 (Worksite Management & User Provisioning)

---

## 18. Simulation / Demo

### US-DEMO-01 — Demonstrate Successful Response Flow
* **Epic:** Simulation / Demo
* **Priority:** P1
* **Actor:** Demonstrator
* **User Story:**
  > As a demonstrator, I want to trigger a controlled heat-risk event so that I can demonstrate the complete response workflow.
* **Acceptance Criteria:**
  * Demonstrator can inject a simulated high-heat weather payload via an explicit demo control panel.
  * System deterministically calculates `HIGH` or `EXTREME` risk.
  * Generates preventive action directive and assigns to the demo supervisor.
  * Notification appears in the Supervisor Action Center.
  * Demonstrator (as supervisor) clicks "Acknowledge" followed by "Confirm Execution".
  * Action completes cleanly and displays complete verification and audit logs.
* **Related Requirement Area:** FR-14 (Simulation & Demo Sandbox), SC-14
* **Related MVP Feature:** F14 (Simulation Mode)

---

### US-DEMO-02 — Demonstrate Missed Response & Escalation
* **Epic:** Simulation / Demo
* **Priority:** P1
* **Actor:** Demonstrator
* **User Story:**
  > As a demonstrator, I want to simulate a supervisor not responding so that I can demonstrate escalation.
* **Acceptance Criteria:**
  * Demonstrator injects a simulated heat-risk event with accelerated demo timeout (e.g., 30 seconds).
  * System generates action and dispatches notification.
  * Demonstrator intentionally withholds acknowledgment.
  * Countdown timer reaches zero; system automatically transitions action to `ESCALATED`.
  * Safety Manager view displays an urgent escalation alert banner and re-notifies escalation contacts.
  * Audit ledger captures the timeout and escalation events.
* **Related Requirement Area:** FR-09, FR-14, SC-15
* **Related MVP Feature:** F09, F14

---

### US-DEMO-03 — Reset Simulation Scenario
* **Epic:** Simulation / Demo
* **Priority:** P1
* **Actor:** Demonstrator
* **User Story:**
  > As a demonstrator, I want to reset the simulation so that the workflow can be demonstrated repeatedly.
* **Acceptance Criteria:**
  * One-click "Reset Demo State" button wipes simulated events, pending demo actions, and demo alerts.
  * Restores configured baseline worksite conditions and initial supervisor assignments.
  * Live operational data (if any) is preserved or completely isolated from simulation state.
  * Reset executes in under 3 seconds without requiring server or application restarts.
* **Related Requirement Area:** FR-14
* **Related MVP Feature:** F14

---

## 19. AI Assistance

### US-AI-01 — Plain-Language Risk Explanation
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want the AI assistant to explain a system-generated risk assessment in simple language so that I can understand the relevant factors.
* **Acceptance Criteria:**
  * User can click "Explain Risk" next to a calculated heat-risk score.
  * AI assistant generates a 2–3 sentence executive summary explaining how temperature, humidity, and site workload combined to breach thresholds.
  * AI output cites the deterministic facts provided in the prompt context.
  * Clearly labeled as "AI-Generated Assistive Explanation."
* **Related Requirement Area:** FR-13 (Assistive NVIDIA AI Services)
* **Related MVP Feature:** F13 (NVIDIA AI Assistance)

---

### US-AI-02 — Operational Action Rationale Clarification
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want the AI assistant to explain why an action was generated so that I understand what is expected.
* **Acceptance Criteria:**
  * Supervisor can request an AI explanation of an assigned work/rest or hydration directive.
  * Assistant explains the physiological reasoning (e.g., "At 40°C heat index, 15-minute shaded breaks allow core body temperatures to stabilize before heat exhaustion develops").
  * Does not modify or add to the mandatory deterministic directive items.
* **Related Requirement Area:** FR-13
* **Related MVP Feature:** F13

---

### US-AI-03 — Field Communication Assistance (Toolbox Talk)
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** SUPERVISOR
* **User Story:**
  > As a SUPERVISOR, I want the AI assistant to turn approved safety information into concise communication so that it is easier to understand.
* **Acceptance Criteria:**
  * Supervisor can click "Generate Crew Briefing".
  * AI formats the approved action items into a 60-second verbal briefing script tailored to field crew members.
  * Emphasizes hydration, peer buddy monitoring, and early symptom reporting.
  * Output strictly reflects approved site rules without inventing medical treatments.
* **Related Requirement Area:** FR-13
* **Related MVP Feature:** F13

---

### US-AI-04 — Multilingual Language Assistance
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** Authorized User (SUPERVISOR / SAFETY_MANAGER)
* **User Story:**
  > As an authorized user, I want approved safety information adapted into a supported language so that communication is accessible to more users.
* **Acceptance Criteria:**
  * User can select alternate languages (e.g., Spanish, Hindi, or localized dialects) for action directives.
  * AI translates approved action directives and briefings accurately.
  * Translated text preserves critical numbers (e.g., "15 minutes rest", "1 liter water") exactly.
  * Displays the original English text alongside the translation for safety verification.
* **Related Requirement Area:** FR-13
* **Related MVP Feature:** F13

---

### US-AI-05 — Post-Event Audit Response Summary
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want the AI assistant to summarize response history so that I can quickly understand what happened.
* **Acceptance Criteria:**
  * Safety Manager can request an "Incident Timeline Summary" for any completed or escalated action.
  * AI generates a concise narrative: "Risk detected at 13:00; Assigned to Supervisor John; Escalated at 13:16 after no response; Acknowledged by Manager Sarah at 13:18."
  * Summary strictly reflects facts in the audit ledger without inferring unrecorded motivations.
* **Related Requirement Area:** FR-13, FR-10
* **Related MVP Feature:** F13

---

### US-AI-06 — Grounded Operational Assistant
* **Epic:** AI Assistance
* **Priority:** P1
* **Actor:** Authorized User
* **User Story:**
  > As an authorized user, I want the AI assistant to answer questions using available system context so that responses are grounded in actual operational information.
* **Acceptance Criteria:**
  * User can query the assistant (e.g., "What cooling resources are configured for North Yard?").
  * AI retrieves context exclusively from the current worksite record and organizational policy prompt.
  * If the requested information is absent from the system context, the assistant explicitly states: "That information is not available in current worksite records" rather than hallucinating.
  * Fallback mechanism gracefully informs user if the external AI service is unreachable.
* **Related Requirement Area:** FR-13, NFR-03
* **Related MVP Feature:** F13

---

## 20. Security & Privacy

### US-SEC-01 — Protect Operational Data
* **Epic:** Security & Privacy
* **Priority:** P0
* **Actor:** Authorized User
* **User Story:**
  > As an authorized user, I want operational data protected according to my role so that unauthorized users cannot access sensitive information.
* **Acceptance Criteria:**
  * All communications are encrypted in transit via TLS 1.3/HTTPS.
  * Worksite data, supervisor contact information, and action records are restricted to authenticated users with valid organizational memberships.
  * API endpoints enforce authorization at the controller/service layer for every request.
* **Related Requirement Area:** SEC-01 (RBAC & Boundary Protection)
* **Related MVP Feature:** Cross-cutting security architecture

---

### US-SEC-02 — Minimize Sensitive Personal Data
* **Epic:** Security & Privacy
* **Priority:** P0
* **Actor:** System Owner / Organization
* **User Story:**
  > As a system owner, I want the system to collect only information necessary for the workflow so that unnecessary privacy risk is avoided.
* **Acceptance Criteria:**
  * System collects no personal health, physiological, biometric, medical history, or wearable sensor data.
  * Supervisor records contain only professional name, role, and corporate contact endpoint (email/phone).
  * Worksite records contain only operational environmental metadata and physical assets.
* **Related Requirement Area:** SEC-02 (Data Minimization & Medical Privacy)
* **Related MVP Feature:** Cross-cutting architecture

---

### US-SEC-03 — Protect AI Prompt Context
* **Epic:** Security & Privacy
* **Priority:** P1
* **Actor:** System Owner
* **User Story:**
  > As a system owner, I want AI requests to avoid unnecessary sensitive information so that AI assistance does not create unnecessary data exposure.
* **Acceptance Criteria:**
  * Prompt payloads sent to NVIDIA AI inference endpoints are sanitized of private credentials and personal user details.
  * Prompts contain only anonymized worksite environmental values, operational context, and action text.
  * System does not allow external AI providers to retain operational data for training.
* **Related Requirement Area:** SEC-03 (AI Governance & Data Privacy)
* **Related MVP Feature:** F13 (NVIDIA AI Assistance)

---

### US-SEC-04 — Preserve Audit Trail Integrity
* **Epic:** Security & Privacy
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want important audit events protected from unauthorized modification so that the response history remains trustworthy.
* **Acceptance Criteria:**
  * Audit ledger records are written via append-only database operations.
  * No application role (including `ADMIN`) has access to edit, backdate, or delete audit records through the user interface or standard API.
  * System logs cryptographic hash or immutable sequence numbers to detect tampering.
* **Related Requirement Area:** SEC-04 (Audit Trail Integrity), FR-10
* **Related MVP Feature:** F10 (Audit History)

---

## 21. Reliability & Failure Handling

### US-RELIABILITY-01 — Weather Ingestion Failure Handling
* **Epic:** Reliability & Failure Handling
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want the system to clearly indicate when weather information is unavailable or stale so that I do not mistake missing data for safe conditions.
* **Acceptance Criteria:**
  * If upstream weather APIs fail, worksite displays a prominent "Weather Data Unavailable" warning badge.
  * The system refuses to silently infer or display a `LOW` risk default state when inputs are missing.
  * Displays the timestamp of the last successful reading and marks it as `STALE`.
* **Related Requirement Area:** NFR-03 (Reliability & Fault Tolerance), FR-03
* **Related MVP Feature:** F02, F12

---

### US-RELIABILITY-02 — Graceful AI Service Degradation
* **Epic:** Reliability & Failure Handling
* **Priority:** P0
* **Actor:** User
* **User Story:**
  > As a user, I want the core safety workflow to remain usable when AI assistance is unavailable so that AI is not a single point of failure.
* **Acceptance Criteria:**
  * If the NVIDIA AI service endpoint times out, errors, or is unreachable, all core workflows (risk calculation, action generation, assignment, notification, acknowledgment, escalation, audit) function normally.
  * Assistive UI components display a clean fallback notice: "AI Assistant temporarily unavailable; deterministic action protocols remain fully active."
  * System logs the AI connectivity disruption without halting user workflows.
* **Related Requirement Area:** NFR-03, FR-13
* **Related MVP Feature:** F13, cross-cutting architecture

---

### US-RELIABILITY-03 — Notification Dispatch Failure Visibility
* **Epic:** Reliability & Failure Handling
* **Priority:** P0
* **Actor:** SAFETY_MANAGER
* **User Story:**
  > As a SAFETY_MANAGER, I want notification failures to be visible so that unresolved communication does not silently disappear.
* **Acceptance Criteria:**
  * If an email, SMS, or webhook dispatch fails, the system records `DISPATCH_FAILED` in the action record.
  * An immediate visual alert appears on the Safety Manager dashboard highlighting the communication breakdown.
  * The escalation timer continues running to ensure the action is not orphaned due to channel failure.
* **Related Requirement Area:** NFR-03, FR-07
* **Related MVP Feature:** F07, F12

---

### US-RELIABILITY-04 — Duplicate Event and Idempotency Handling
* **Epic:** Reliability & Failure Handling
* **Priority:** P0
* **Actor:** SYSTEM
* **User Story:**
  > As the system, I want to handle duplicate events safely so that repeated processing does not unintentionally create conflicting actions.
* **Acceptance Criteria:**
  * Ingested weather payloads with identical observation timestamps and worksite IDs are recognized as duplicates and ignored.
  * Webhook and notification handlers use unique idempotency keys to prevent duplicate dispatches.
  * Repeated rapid clicks on "Acknowledge" by a supervisor execute idempotently without creating redundant audit records or state anomalies.
* **Related Requirement Area:** NFR-03, FR-05, FR-08
* **Related MVP Feature:** Cross-cutting backend architecture

---

## 22. Canonical End-to-End User Story

### US-E2E-01 — Closed-Loop Heat Action Response Lifecycle
* **Epic:** Canonical Closed-Loop Lifecycle
* **Priority:** P0
* **Actor:** SAFETY_MANAGER / SUPERVISOR / SYSTEM
* **User Story:**
  > **As a Safety Manager, I want a heat-risk event at a worksite to progress from risk assessment to contextual preventive action, supervisor assignment, notification, acknowledgment, escalation if unresolved, and audit history so that my organization can coordinate and trace its heat-safety response.**

* **Comprehensive Acceptance Criteria:**
  1. **Worksite Exists and Configured:** Target worksite is active with valid geographic coordinates, assigned supervisor, and operational context (workload, exposure).
  2. **Environmental Ingestion:** Current or simulated weather data is ingested and validated for freshness.
  3. **Deterministic Risk Assessment:** Engine calculates heat index and classifies site into `HIGH` or `EXTREME` risk deterministically.
  4. **Risk Drivers Visible:** Calculated risk level, numerical index, and primary environmental drivers are rendered on the dashboard.
  5. **Worksite Context Incorporated:** Site operational context (heavy labor, direct sun) adjusts the operational threshold.
  6. **Action Directive Generated:** System executes approved rule matrices to generate specific, actionable preventive directives (work/rest ratio, hydration targets).
  7. **Supervisor Ownership Assigned:** Action is explicitly assigned to the designated worksite supervisor.
  8. **Notification Attempted:** System dispatches urgent notification alerts across configured channels within 5 seconds.
  9. **Supervisor Acknowledgment:** Supervisor receives directive in Action Center and records explicit receipt acknowledgment.
  10. **Response Latency Captured:** System logs acknowledgment timestamp, calculating exact response latency.
  11. **Timeout & Escalation Execution:** In the alternative branch where acknowledgment is withheld, system timer triggers automated escalation upon timeout expiration.
  12. **Escalation Recorded:** Escalation notice routes to Safety Manager, and status is visibly elevated across all views.
  13. **Execution Confirmation:** Supervisor records execution of physical site controls (water distributed, rest taken).
  14. **Immutable Audit Chronology:** Every state transition is recorded in the immutable audit ledger with full causal linkage.
  15. **Assistive AI Boundary Preserved:** NVIDIA AI provides plain-language explanations or toolbox translations without overriding or modifying deterministic rules.
  16. **Human Accountability Explicit:** Clear human ownership is maintained at every step of the closed-loop lifecycle.

---

## 23. User Story Acceptance Matrix

| Story ID | Epic | Priority | Actor | Acceptance Status | Related Requirement | Related MVP Feature |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US-AUTH-01** | Authentication & Access | P0 | User | Not Implemented | FR-01, SEC-01 | Foundational |
| **US-AUTH-02** | Authentication & Access | P0 | User | Not Implemented | FR-01, SEC-01 | Foundational |
| **US-AUTH-03** | Authentication & Access | P1 | ADMIN | Not Implemented | FR-01, FR-02 | F01 |
| **US-SITE-01** | Worksite Management | P0 | ADMIN | Not Implemented | FR-02 | F01 |
| **US-SITE-02** | Worksite Management | P0 | SAFETY_MANAGER | Not Implemented | FR-02, FR-12 | F01, F12 |
| **US-SITE-03** | Worksite Management | P0 | Authorized User | Not Implemented | FR-02, FR-04 | F01, F04 |
| **US-SITE-04** | Worksite Management | P0 | Authorized User | Not Implemented | FR-02, FR-06 | F01, F06 |
| **US-SITE-05** | Worksite Management | P1 | ADMIN | Not Implemented | FR-02 | F01 |
| **US-WEATHER-01** | Weather & Environmental | P0 | SYSTEM | Not Implemented | FR-03 | F02 |
| **US-WEATHER-02** | Weather & Environmental | P0 | SYSTEM | Not Implemented | FR-03, FR-04 | F02 |
| **US-WEATHER-03** | Weather & Environmental | P1 | SAFETY_MANAGER | Not Implemented | FR-03, FR-12 | F02, F12 |
| **US-WEATHER-04** | Weather & Environmental | P0 | SYSTEM | Not Implemented | FR-03, NFR-03 | F02, F12 |
| **US-WEATHER-05** | Weather & Environmental | P1 | Demonstrator | Not Implemented | FR-03, FR-14 | F02, F14 |
| **US-RISK-01** | Heat-Risk Assessment | P0 | SYSTEM | Not Implemented | FR-04 | F03 |
| **US-RISK-02** | Heat-Risk Assessment | P0 | SAFETY_MANAGER | Not Implemented | FR-04, FR-12 | F03, F12 |
| **US-RISK-03** | Heat-Risk Assessment | P0 | SUPERVISOR | Not Implemented | FR-04, FR-11 | F03, F11 |
| **US-RISK-04** | Heat-Risk Assessment | P0 | SYSTEM | Not Implemented | FR-04, NFR-03 | F03, F12 |
| **US-CONTEXT-01** | Worksite Context | P0 | Authorized User | Not Implemented | FR-02, FR-05 | F04 |
| **US-CONTEXT-02** | Worksite Context | P0 | Authorized User | Not Implemented | FR-04, FR-05 | F04 |
| **US-CONTEXT-03** | Worksite Context | P0 | Authorized User | Not Implemented | FR-04, FR-05 | F04 |
| **US-CONTEXT-04** | Worksite Context | P0 | Authorized User | Not Implemented | FR-05 | F04, F05 |
| **US-CONTEXT-05** | Worksite Context | P0 | Authorized User | Not Implemented | FR-02, FR-05 | F04 |
| **US-CONTEXT-06** | Worksite Context | P1 | Authorized User | Not Implemented | FR-04, FR-05, SEC-02 | F04 |
| **US-ACTION-01** | Action Management | P0 | SYSTEM | Not Implemented | FR-05 | F05 |
| **US-ACTION-02** | Action Management | P0 | SUPERVISOR | Not Implemented | FR-05, FR-11 | F05, F11 |
| **US-ACTION-03** | Action Management | P0 | SUPERVISOR | Not Implemented | FR-04, FR-05, FR-11 | F05, F11 |
| **US-ACTION-04** | Action Management | P0 | SAFETY_MANAGER | Not Implemented | FR-05, FR-10 | F05, F10 |
| **US-ACTION-05** | Action Management | P0 | SAFETY_MANAGER | Not Implemented | FR-05, FR-12 | F05, F12 |
| **US-ASSIGN-01** | Assignment | P0 | SAFETY_MGR / SYSTEM | Not Implemented | FR-06 | F06 |
| **US-ASSIGN-02** | Assignment | P0 | SUPERVISOR | Not Implemented | FR-06, FR-11 | F06, F11 |
| **US-ASSIGN-03** | Assignment | P1 | Authorized User | Not Implemented | FR-06, FR-10 | F06, F10 |
| **US-ASSIGN-04** | Assignment | P1 | SAFETY_MANAGER | Not Implemented | FR-06, FR-10 | F06, F10 |
| **US-NOTIFY-01** | Notifications | P0 | SYSTEM | Not Implemented | FR-07 | F07 |
| **US-NOTIFY-02** | Notifications | P0 | SUPERVISOR | Not Implemented | FR-07, FR-11 | F07, F11 |
| **US-NOTIFY-03** | Notifications | P1 | SAFETY_MANAGER | Not Implemented | FR-07, FR-12 | F07, F12 |
| **US-ACK-01** | Acknowledgment | P0 | SUPERVISOR | Not Implemented | FR-08, FR-11 | F08, F11 |
| **US-ACK-02** | Acknowledgment | P0 | SUPERVISOR | Not Implemented | FR-08, FR-09 | F08, F09 |
| **US-ACK-03** | Acknowledgment | P0 | SYSTEM | Not Implemented | FR-08, FR-10 | F08, F10 |
| **US-ACK-04** | Acknowledgment | P0 | SUPERVISOR | Not Implemented | FR-08, FR-10 | F08, F10 |
| **US-ESC-01** | Escalation | P0 | SYSTEM | Not Implemented | FR-09 | F09 |
| **US-ESC-02** | Escalation | P0 | SYSTEM | Not Implemented | FR-09, FR-07 | F09, F07 |
| **US-ESC-03** | Escalation | P0 | SAFETY_MANAGER | Not Implemented | FR-09, FR-12 | F09, F12 |
| **US-ESC-04** | Escalation | P1 | SAFETY_MANAGER | Not Implemented | FR-09, FR-10 | F09, F10 |
| **US-VERIFY-01** | Verification | P0 | SAFETY_MANAGER | Not Implemented | FR-08, FR-10 | F08, F10 |
| **US-VERIFY-02** | Verification | P0 | SAFETY_MANAGER | Not Implemented | FR-08, FR-12 | F08, F12 |
| **US-AUDIT-01** | Audit History | P0 | SAFETY_MANAGER | Not Implemented | FR-10 | F10 |
| **US-AUDIT-02** | Audit History | P0 | Authorized User | Not Implemented | FR-10, FR-04, FR-05 | F10 |
| **US-AUDIT-03** | Audit History | P0 | Authorized User | Not Implemented | FR-10, SEC-04 | F10 |
| **US-DASH-01** | Dashboards | P0 | SAFETY_MANAGER | Not Implemented | FR-12 | F12 |
| **US-DASH-02** | Dashboards | P0 | SUPERVISOR | Not Implemented | FR-11 | F11 |
| **US-DASH-03** | Dashboards | P0 | SAFETY_MANAGER | Not Implemented | FR-02, FR-12 | F01, F12 |
| **US-DASH-04** | Dashboards | P1 | ADMIN | Not Implemented | FR-01, FR-02 | F01 |
| **US-DEMO-01** | Simulation / Demo | P1 | Demonstrator | Not Implemented | FR-14, SC-14 | F14 |
| **US-DEMO-02** | Simulation / Demo | P1 | Demonstrator | Not Implemented | FR-09, FR-14, SC-15 | F09, F14 |
| **US-DEMO-03** | Simulation / Demo | P1 | Demonstrator | Not Implemented | FR-14 | F14 |
| **US-AI-01** | AI Assistance | P1 | SAFETY_MANAGER | Not Implemented | FR-13 | F13 |
| **US-AI-02** | AI Assistance | P1 | SUPERVISOR | Not Implemented | FR-13 | F13 |
| **US-AI-03** | AI Assistance | P1 | SUPERVISOR | Not Implemented | FR-13 | F13 |
| **US-AI-04** | AI Assistance | P1 | Authorized User | Not Implemented | FR-13 | F13 |
| **US-AI-05** | AI Assistance | P1 | SAFETY_MANAGER | Not Implemented | FR-13, FR-10 | F13 |
| **US-AI-06** | AI Assistance | P1 | Authorized User | Not Implemented | FR-13, NFR-03 | F13 |
| **US-SEC-01** | Security & Privacy | P0 | Authorized User | Not Implemented | SEC-01 | Foundational |
| **US-SEC-02** | Security & Privacy | P0 | System Owner | Not Implemented | SEC-02 | Foundational |
| **US-SEC-03** | Security & Privacy | P1 | System Owner | Not Implemented | SEC-03, FR-13 | F13 |
| **US-SEC-04** | Security & Privacy | P0 | SAFETY_MANAGER | Not Implemented | SEC-04, FR-10 | F10 |
| **US-RELIABILITY-01** | Reliability & Resilience | P0 | SAFETY_MANAGER | Not Implemented | NFR-03, FR-03 | F02, F12 |
| **US-RELIABILITY-02** | Reliability & Resilience | P0 | User | Not Implemented | NFR-03, FR-13 | F13 |
| **US-RELIABILITY-03** | Reliability & Resilience | P0 | SAFETY_MANAGER | Not Implemented | NFR-03, FR-07 | F07, F12 |
| **US-RELIABILITY-04** | Reliability & Resilience | P0 | SYSTEM | Not Implemented | NFR-03, FR-05, FR-08 | Foundational |
| **US-E2E-01** | Canonical Lifecycle | P0 | Multi-Role | Not Implemented | End-to-End Core | All Core MVP Features |

---

## 24. Story-to-MVP Feature Traceability

This matrix maps each core MVP feature ID (`F01` through `F14`) defined in [04_MVP_SCOPE.md](file:///d:/Amazon%202nd%20Hackathon Heat/docs/04_MVP_SCOPE.md) and [10_REQUIREMENTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/10_REQUIREMENTS.md) to its governing user stories, ensuring complete coverage of all mandatory (P0) capabilities:

| Feature ID | MVP Capability | Priority | Governing User Stories |
| :--- | :--- | :--- | :--- |
| **F01** | Worksite Management & Setup | P0 | `US-SITE-01`, `US-SITE-02`, `US-SITE-03`, `US-SITE-04`, `US-SITE-05`, `US-DASH-04` |
| **F02** | Weather Ingestion & Validation | P0 | `US-WEATHER-01`, `US-WEATHER-02`, `US-WEATHER-03`, `US-WEATHER-04`, `US-RELIABILITY-01` |
| **F03** | Deterministic Heat-Risk Calculation | P0 | `US-RISK-01`, `US-RISK-02`, `US-RISK-03`, `US-RISK-04` |
| **F04** | Worksite Context Management | P0 | `US-CONTEXT-01`, `US-CONTEXT-02`, `US-CONTEXT-03`, `US-CONTEXT-04`, `US-CONTEXT-05`, `US-CONTEXT-06` |
| **F05** | Action Directive Generation | P0 | `US-ACTION-01`, `US-ACTION-02`, `US-ACTION-03`, `US-ACTION-04`, `US-ACTION-05` |
| **F06** | Supervisor Assignment & Routing | P0 | `US-ASSIGN-01`, `US-ASSIGN-02`, `US-ASSIGN-03`, `US-ASSIGN-04` |
| **F07** | Notification Dispatch & Alerts | P0 | `US-NOTIFY-01`, `US-NOTIFY-02`, `US-NOTIFY-03`, `US-RELIABILITY-03` |
| **F08** | Acknowledgment Service & Tracking | P0 | `US-ACK-01`, `US-ACK-02`, `US-ACK-03`, `US-ACK-04`, `US-VERIFY-01` |
| **F09** | Automated Escalation Engine | P0 | `US-ESC-01`, `US-ESC-02`, `US-ESC-03`, `US-ESC-04` |
| **F10** | Immutable Audit Trail & History | P0 | `US-AUDIT-01`, `US-AUDIT-02`, `US-AUDIT-03`, `US-SEC-04` |
| **F11** | Supervisor Action Center Dashboard | P0 | `US-DASH-02`, `US-ACTION-02`, `US-ACK-01` |
| **F12** | Safety Manager Operations View | P0 | `US-DASH-01`, `US-DASH-03`, `US-VERIFY-02`, `US-ESC-03` |
| **F13** | Assistive NVIDIA AI Services | P1 | `US-AI-01`, `US-AI-02`, `US-AI-03`, `US-AI-04`, `US-AI-05`, `US-AI-06`, `US-RELIABILITY-02` |
| **F14** | Simulation Mode & Demo Sandbox | P1 | `US-DEMO-01`, `US-DEMO-02`, `US-DEMO-03`, `US-WEATHER-05` |

---

## 25. Definition of User Story Complete

A user story in the Heat Action Response Engine is considered **Complete** (Ready for Acceptance Testing) only when all of the following conditions are verified:

1. **Clear Actor & Role:** The initiating or target persona is explicitly identified (`ADMIN`, `SAFETY_MANAGER`, `SUPERVISOR`, or `SYSTEM`).
2. **Clear Capability:** The desired capability describes a concrete user outcome, not an internal database column or code library.
3. **Clear Operational Value:** The "so that" clause provides a tangible operational, safety, or accountability benefit.
4. **Testable Acceptance Criteria:** Acceptance criteria contain unambiguous, verifiable, pass/fail test conditions.
5. **Assigned Scope Priority:** The story carries an explicit priority tag (`P0`, `P1`, or `P2`).
6. **Understood Dependencies:** Pre-requisite data states (e.g., worksite must exist before weather ingestion) are documented.
7. **Requirement Traceability:** Directly references a functional or non-functional requirement from [10_REQUIREMENTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/10_REQUIREMENTS.md).
8. **MVP Feature Traceability:** Mapped to one of the MVP features (`F01` through `F14`).
9. **Strict Non-Goal Compliance:** Does not violate any non-goal boundary established in [05_NON_GOALS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/05_NON_GOALS.md) (no hardware/IoT prerequisites, no medical diagnostics, no autonomous AI safety decisions).

---

## 26. Final User-Centered Principle

> **The product should make the next responsible action obvious: the right person should understand the risk, know what action is expected, receive clear ownership, be able to acknowledge the action, and trigger escalation when the response does not occur.**

**Status:** Draft  
**Last Updated:** 2026-10-07
