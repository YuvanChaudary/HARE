# Personas — Heat Action Response Engine MVP

## 1. Purpose

This document translates the target user definitions established in [06_TARGET_USERS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/06_TARGET_USERS.md) into concrete, operational personas. These personas provide representative user models that directly guide:

* **Product Requirements:** Grounding functional specifications in authentic day-to-day user tasks.
* **UX & Interaction Design:** Shaping role-tailored dashboards, mobile field screens, and information density.
* **Permissions & Access Control:** Defining boundaries for Role-Based Access Control (RBAC).
* **Workflow Ownership:** Establishing explicit responsibility for risk monitoring, action acceptance, and escalation resolution.
* **Notification Systems:** Designing alerts that respect front-line operating constraints without causing alert fatigue.
* **Dashboard Design:** Structuring executive command views versus tactical field action centers.
* **Action Assignment & Escalation:** Ensuring actions route to accountable individuals and escalate predictably when unattended.
* **Assistive AI Interfaces:** Scoping AI interactions to plain-language explanation and operational drafting rather than autonomous decisions.
* **Testing & Quality Assurance:** Generating user-centered test suites and acceptance criteria.
* **Hackathon Demonstration:** Supporting scripted, realistic demonstration scenarios.

> **Design Boundary Note:** Personas are structured product-design models developed to represent archetypal operational roles. They do not constitute assertions about every organization or individual worker.

---

## 2. Persona Design Principles

The construction of all personas in the Heat Action Response Engine is governed by ten design principles:

1. **Role-Based Responsibility:** Every persona has distinct organizational duties; software capabilities map strictly to what that role is empowered and expected to perform.
2. **Action-Oriented Workflows:** Personas engage with the system to execute or supervise real-world safety interventions, not to browse data passively.
3. **Human Accountability:** Consequential safety decisions, operational acknowledgments, and field confirmations always belong to an authenticated human being.
4. **Context-Aware Information:** Operational data presented to each persona is filtered by worksite context, physical location, and current shift conditions.
5. **Minimum Necessary Information:** Interfaces surface only the telemetry and controls required for that persona’s specific decisions, avoiding administrative cognitive overload.
6. **Clear Ownership:** The system ensures that every active heat condition has an unmistakable single point of human contact.
7. **Escalation for Unresolved Actions:** When a front-line persona cannot or does not respond, the system preserves safety momentum by alerting supervisory personas.
8. **Traceability:** Every user interaction (sign-in, acknowledgment, handover, confirmation, escalation response) generates an immutable, timestamped audit entry.
9. **Safety-First AI Boundaries:** AI features serve as assistive advisors for human personas, strictly prohibited from altering deterministic risk logic or making autonomous decisions.
10. **No Unnecessary Worker Surveillance:** Personas are structured to coordinate safer workplace conditions, actively rejecting personal worker tracking, medical surveillance, or performance policing.

---

## 3. Primary MVP Personas

### Persona P01 — Safety Manager

* **System Role:** `SAFETY_MANAGER`
* **Archetype:** Organizational Safety & Compliance Lead
* **Operational Scope:** Multi-site environmental monitoring, protocol oversight, escalation management, and compliance auditing.

#### 1. Role & Profile
The Safety Manager oversees occupational safety and health compliance across an organization’s portfolio of active outdoor and semi-indoor worksites. They coordinate preventive heat-safety policies, monitor changing weather patterns across multiple geographic locations, ensure supervisors respond to high-risk conditions, and maintain defensible safety audit trails.

#### 2. Responsibilities
* Monitor heat-risk indicators across all registered organizational worksites simultaneously.
* Review system-generated preventive action plans to verify alignment with organizational standards.
* Track supervisor acknowledgment latency and ensure directives are not orphaned.
* Intervene immediately when unresolved actions trigger automated system escalations.
* Audit historical incident chronologies and compliance records for executive reporting.

#### 3. Primary Goals
* Eliminate unmanaged heat exposure across all company projects.
* Prevent operational blind spots where severe environmental heat goes unnoticed or unaddressed.
* Maintain complete organizational accountability with verifiable records showing when warnings occurred and who acted.
* Quickly identify bottlenecks where field supervisors struggle to implement preventive controls.

#### 4. Key Problems & Pain Points
* **Alert Fatigue:** Bombarded by generic weather alerts that do not specify operational implications.
* **Operational Blind Spots:** Inability to know whether a field supervisor actually saw a warning or adjusted work schedules.
* **Fragmented Data:** Struggling to correlate raw temperature forecasts with physical worksite conditions (e.g., direct sun, heavy labor, shade availability).
* **Compliance Exposure:** Lacking an immutable, auditable log to prove preventive steps were taken prior to an incident.

#### 5. Information Needs
* Real-time thermal risk classifications (`LOW`, `MODERATE`, `HIGH`, `EXTREME`) across all worksites.
* Plain-language explanations of why specific sites breached thermal thresholds.
* Live status of generated action directives (`PENDING`, `ACKNOWLEDGED`, `CONFIRMED`, `ESCALATED`).
* Real-time escalation alerts indicating which supervisor has exceeded their response deadline.
* Data freshness tags indicating when external weather data was last retrieved.

#### 6. Decisions & System Actions
* **Decisions:** Whether to pause high-exertion tasks organization-wide; whether to intervene directly when an escalation triggers; whether worksite context profiles require updating.
* **Actions in System:** Review Multi-Site Dashboard; drill down into Worksite Details; manually trigger re-evaluations; reassign unacknowledged actions; acknowledge and resolve escalated alerts; export audit reports.

#### 7. Dashboard & Interface Needs
* High-density desktop/tablet web console (Safety Manager Command Center).
* Prominent top-level KPI ribbon: Active Sites, Sites in Extreme Risk, Pending Acknowledgments, Active Escalations.
* Sortable and filterable table of all active worksites with color-coded risk and status badges.
* Dedicated, high-contrast "Active Escalations" alert panel.

#### 8. Notification & Escalation Needs
* **Notifications:** Immediate alerts for sites entering `HIGH` or `EXTREME` risk; immediate critical push/email/SMS notifications when an action triggers an escalation timeout.
* **Escalation Responsibilities:** Serves as the primary escalation recipient when field supervisors fail to acknowledge directives within the configured timeout window.

#### 9. Audit & Traceability Needs
* Full access to immutable event ledgers for every worksite.
* Ability to reconstruct the exact causal chain: Weather Snapshot $\rightarrow$ Risk Evaluation $\rightarrow$ Action Directive $\rightarrow$ Notification $\rightarrow$ Acknowledgment / Escalation $\rightarrow$ Confirmation.

#### 10. AI Assistance Needs
* Plain-language synthesis explaining multi-factor risk drivers (e.g., combining high humidity with heavy metabolic workload).
* Post-shift incident timeline summarization for executive safety reporting.
* Bounded query assistant to answer grounded questions regarding site context and historical responses.

#### 11. Frustrations
* Having to make multiple phone calls to verify if crews took mandatory hydration breaks.
* Weather tools that show ambient temperature without factoring in humidity, direct radiant heat, or strenuous labor.
* Software systems that require hours of complex configuration just to track basic field safety.

#### 12. Success Criteria
* Can assess the safety posture of all organizational sites in under 30 seconds upon opening the dashboard.
* Zero unaddressed escalations exceeding 15 minutes during extreme heat events.
* Generates comprehensive, audit-ready compliance timelines with one click.

#### 13. Example Workflow
1. **07:30:** Logs into Safety Manager Command Center; reviews morning forecast across five infrastructure projects.
2. **11:45:** System detects rising ambient temperature and humidity at North Yard; deterministically classifies site as `HIGH` risk and generates a 45/15 work-rest directive assigned to Supervisor Rahul.
3. **12:00:** System escalation timer expires because Rahul has not acknowledged the directive. Escalation alert pulses red on Ananya’s screen.
4. **12:02:** Ananya reviews the escalation card, clicks "Direct Call" to reach Rahul, confirms he was resolving a field machinery issue, and monitors as Rahul immediately clicks "Acknowledge" in his mobile interface.
5. **17:00:** Reviews daily audit ledger; exports verified compliance log showing timely mitigation across all sites.

---

### Persona P02 — Site Supervisor

* **System Role:** `SUPERVISOR`
* **Archetype:** Front-Line Construction / Field Operations Lead
* **Operational Scope:** Direct crew leadership, on-site environmental awareness, directive acknowledgment, physical control deployment, and execution confirmation.

#### 1. Role & Profile
The Site Supervisor manages daily physical operations on the ground (e.g., concrete pouring, trenching, structural assembly). They manage a crew of workers, balance task deadlines with occupational safety, directly observe physical environmental conditions, and coordinate on-site logistics such as water supplies, shade shelters, and rest schedules.

#### 2. Responsibilities
* Keep field crews safe from environmental hazards while delivering operational milestones.
* Receive and review assigned heat-prevention action directives promptly.
* Explicitly acknowledge directives in the system to verify operational awareness and halt escalation timers.
* Translate directives into physical site controls (distributing chilled water, setting up canopy shade, enforcing work-rest cycles).
* Confirm execution in the system once physical controls are actively deployed on site.

#### 3. Primary Goals
* Protect crew members from severe heat stress and preventable thermal illness.
* Understand exactly what is required without having to read long, complex policy manuals.
* Minimize administrative friction so safety actions can be taken quickly.
* Prevent system escalations that alert senior management to unanswered notifications.

#### 4. Key Problems & Pain Points
* **Harsh Operating Environment:** Working outdoors under bright glare, loud machinery noise, wearing protective gloves, and holding a mobile device.
* **Information Ambiguity:** Receiving vague advisories (e.g., "Take care in the heat") without clear work/rest ratios or hydration volumes.
* **Competing Pressures:** Juggling tight construction schedules against safety requirements.
* **Cumbersome Apps:** Software requiring complex navigation, endless form-filling, or high data bandwidth in poor connectivity zones.

#### 5. Information Needs
* Current worksite name and assigned work group.
* Current operational risk tier (`MODERATE`, `HIGH`, `EXTREME`).
* Clear, concise action checklist: Work/Rest ratio, mandatory water intake, designated shade area.
* Escalation countdown timer showing remaining time to acknowledge.
* Plain-language explanation of why this specific action is necessary today.

#### 6. Decisions & System Actions
* **Decisions:** When to rotate crews into shade; how to adjust task pacing based on heat conditions; whether to request emergency assistance if site resources are inadequate.
* **Actions in System:** Open Supervisor Action Center; review pending directive; click "Acknowledge Directive"; click "Generate Crew Briefing" for toolbox talk; click "Confirm Execution" after controls are established.

#### 7. Dashboard & Interface Needs
* Ultra-streamlined, mobile-first web interface (Supervisor Action Center).
* Large, high-contrast touch targets usable with gloves or in bright sunlight.
* Zero multi-level dropdowns; primary action ("Acknowledge") prominently displayed above the fold.
* Clean visual countdown timer showing urgency.

#### 8. Notification & Escalation Needs
* **Notifications:** Urgent, multi-channel alerting (in-app push banner, direct SMS/webhook, email) stating clearly: Site Name, Risk Level, Core Directive, and Acknowledgment Deadline.
* **Escalation Implications:** Understands that failing to acknowledge within the policy window automatically triggers an alert to their Safety Manager.

#### 9. Audit & Traceability Needs
* Sees their own acknowledgment timestamp and confirmation history.
* Assured that the system accurately records their timely response, protecting them from unfair blame during post-shift reviews.

#### 10. AI Assistance Needs
* Plain-language translation of safety directives into 60-second verbal scripts ("Toolbox Talks") suitable for morning or midday crew briefings.
* Multilingual translation of directives into native languages spoken by field crew members (e.g., Hindi, Kannada, Tamil, Spanish).
* Bounded explanations clarifying why heavy labor under high humidity requires 15 minutes of shaded rest per hour.

#### 11. Frustrations
* Having to decipher dense regulatory tables while standing in the midday sun.
* Apps that crash or lose form input when mobile connectivity drops momentarily.
* Being blamed for safety delays when directives fail to specify concrete procedures.

#### 12. Success Criteria
* Can view, understand, and acknowledge a heat directive in under 15 seconds from receiving the notification.
* Deploys mandatory work-rest cycles and hydration stations before crew members experience heat exhaustion.
* Maintains zero unacknowledged escalations across their operational shifts.

#### 13. Example Workflow
1. **06:00:** Arrives at North Bengaluru Construction Site; opens Supervisor Action Center on mobile phone to verify site status (currently `LOW`).
2. **12:15:** Mobile phone buzzes with high-priority SMS and push notification: *"URGENT: North Site is now HIGH HEAT RISK. Action required within 15 min."*
3. **12:16:** Taps notification deep link; Supervisor Action Center opens directly to Action Card #402. Reads: *"45 min work / 15 min rest per hour; 1L water/worker/hr; enforce buddy check."*
4. **12:17:** Taps large green button: **"Acknowledge Directive"**. Countdown halts; status transitions to `ACKNOWLEDGED`.
5. **12:20:** Gathers civil crew at water station; uses AI-generated 60-second toolbox briefing to explain the 15-minute rest cycle.
6. **12:45:** Crew completes first rest rotation in shaded canopy; Rahul taps **"Confirm Execution"** on his mobile screen. Status transitions to `CONFIRMED`.

---

### Persona P03 — Organization Administrator

* **System Role:** `ADMIN`
* **Archetype:** Enterprise Systems & Operational Setup Administrator
* **Operational Scope:** Worksite provisioning, user management, role assignments, notification routing configuration, and baseline policy maintenance.

#### 1. Role & Profile
The Organization Administrator configures and maintains the software environment. They are responsible for setting up corporate worksite profiles, entering precise geocoordinates, provisioning user accounts, assigning roles (`SAFETY_MANAGER`, `SUPERVISOR`), and mapping primary supervisors to specific job sites. They ensure the technical plumbing is correct so operational safety workflows execute reliably.

#### 2. Responsibilities
* Register new worksites with accurate GPS latitude/longitude coordinates and operating timezones.
* Define baseline worksite context attributes (work type, workload category, sun exposure, available shade and water assets).
* Provision user accounts and maintain active contact channels (emails, mobile numbers, webhook endpoints).
* Bind responsible primary supervisors to their designated worksites.
* Configure organization-level operational policies (e.g., default escalation timeout durations).
* Monitor system health indicators, external weather API connectivity, and user session activity.

#### 3. Primary Goals
* Ensure every active operational worksite is properly configured and monitored.
* Guarantee that no active worksite lacks an assigned, responsible supervisor.
* Provide smooth onboarding and credential management for field personnel.
* Maintain strict security and role-based access control boundaries across organizational data.

#### 4. Key Problems & Pain Points
* **Incomplete Setup:** Incomplete site profiles (e.g., missing coordinates or unassigned supervisors) that cause runtime routing failures.
* **User Churn:** Frequent rotation of field supervisors across projects requiring constant reassignment.
* **Misconfiguration:** Inaccurate timezones or coordinate entries that pull meteorological data from the wrong geographic region.
* **Security Overhead:** Managing enterprise user access without creating cumbersome administration bottlenecks.

#### 5. Information Needs
* Comprehensive directory of active and inactive worksites.
* User roster with associated roles, active sessions, and assigned worksites.
* Status of external integrations (weather API connectivity, notification dispatch gateways, NVIDIA AI service endpoints).
* System-level error and exception logs.

#### 6. Decisions & System Actions
* **Decisions:** When to activate or pause a worksite profile; which supervisor to associate with a newly launched project; what baseline escalation policy to apply.
* **Actions in System:** Access Admin Console; create/edit worksites; assign supervisors to sites; invite new users and set RBAC roles; toggle worksite operational status (`ACTIVE` / `PAUSED` / `ARCHIVED`); review integration health diagnostics.

#### 7. Dashboard & Interface Needs
* Structured administrative desktop console (Admin Management Console).
* Clear data-entry forms with real-time validation (e.g., coordinate boundary checks, timezone auto-population).
* Visual assignment matrix mapping supervisors to active worksites with prominent warnings for unassigned sites.
* Integration health dashboard showing API response latencies and failure counts.

#### 8. Notification & Escalation Needs
* **Notifications:** System alerts regarding API connection failures, data-polling exceptions, or orphan actions created without a valid supervisor.
* **Escalation Role:** The Admin is *not* an operational safety responder; they do not receive tactical heat escalations unless configured as an emergency organizational fallback.

#### 9. Audit & Access Control Needs
* Full access to administrative audit logs tracking user creation, role changes, worksite context modifications, and site activation toggles.
* Ability to review security logs for unauthorized access attempts.

#### 10. AI Assistance Needs
* Contextual help explaining configuration attributes and operational rule matrices.
* Automated validation assistance flagging potential setup anomalies (e.g., coordinates placed in the ocean or mismatched operating timezones).

#### 11. Frustrations
* Having to manually debug why a field user is not receiving notifications due to mistyped phone numbers or email addresses.
* Safety managers bypassing formal configuration workflows to create unmonitored ad-hoc projects.
* Complex enterprise software that requires weeks of specialized training for basic account provisioning.

#### 12. Success Criteria
* Can configure a new worksite, input operational context, assign a supervisor, and activate live weather monitoring in under 3 minutes.
* Zero worksites operating in an unmonitored or unassigned state.
* Integration health dashboard shows 99.9% uptime for scheduled environmental data ingestion.

#### 13. Example Workflow
1. **08:30:** Logs into Admin Console; receives notification of a new infrastructure contract awarded in East Bengaluru.
2. **08:35:** Opens "Create Worksite"; enters name: "East Bengaluru Substation"; inputs latitude and longitude; selects timezone `Asia/Kolkata`.
3. **08:38:** Configures site context: Work Type = `ELECTRICAL_INFRASTRUCTURE`, Workload = `MODERATE`, Exposure = `DIRECT_SUN`, Shading = `PARTIAL`.
4. **08:40:** Assigns Rahul Kumar as Primary Supervisor and Ananya Rao as Safety Manager.
5. **08:42:** Clicks "Validate & Activate"; system verifies external weather feed can be queried for coordinates and sets worksite status to `ACTIVE`.

---

## 4. Secondary & Future Personas

### Persona P04 — Worker (Beneficiary)

* **System Role:** Beneficiary / Field Crew Member (No direct software access in MVP)
* **Archetype:** Outdoor Laborer / Construction Tradesperson / Field Operative
* **Role in System:**
  The Worker is the primary human beneficiary of the entire platform. In the MVP, workers do not log into the software, carry specialized enterprise devices, or configure settings. Instead, they receive the operational benefits of the closed-loop safety system through their human supervisor—benefiting from timely work-rest rotations, guaranteed access to shaded shelters, adequate potable water supplies, and peer monitoring.
* **Ethical & Architectural Boundaries:**
  * **No Worker Surveillance:** The system explicitly rejects personal tracking, GPS path tracking, physiological biometric monitoring, or productivity policing.
  * **No Personal Medical Data:** Workers are never asked to input medical histories, personal health conditions, or biometric measurements.
  * **Future Evolution:** Future product iterations may introduce a simple, voluntary worker-facing mobile app or localized display screen for broadcast safety advisories, voluntary hydration reminders, and anonymous hazard reporting.

---

### Persona P05 — Operations Manager

* **System Role:** `OPERATIONS_MANAGER` (Future / Secondary Stakeholder)
* **Archetype:** Enterprise Vice President of Operations / General Project Director
* **Role in System:**
  The Operations Manager oversees macro project schedules, labor productivity, resource budgets, and aggregate operational risk across dozens of active infrastructure and commercial contracts.
* **Primary Needs:**
  * High-level visibility into how severe heat waves impact overall operational velocity and shift schedules across the enterprise.
  * Aggregate reporting comparing planned versus adjusted shift hours during heat waves.
  * Ensuring adequate corporate resources (cooling shelters, potable water tankers, ice supplies) are allocated to high-risk project zones.
* **Future Evolution:**
  Future versions will provide dedicated macro-analytical dashboards showing portfolio-level thermal impact trends, predictive labor disruption forecasts, and resource allocation optimization models.

---

### Persona P06 — Occupational Safety Professional

* **System Role:** `OCCUPATIONAL_SAFETY_PROFESSIONAL` (Future / Specialized Stakeholder)
* **Archetype:** Certified Industrial Hygienist / Enterprise Safety Director / Ergonomist
* **Role in System:**
  The Occupational Safety Professional is a specialized domain expert who designs and governs organizational safety policies, validates threshold algorithms, and ensures compliance with occupational safety standards.
* **Primary Needs:**
  * Deep configuration access to customize the deterministic heat-risk engine’s mathematical formulas (e.g., tuning WBGT clothing adjustment factors or metabolic rate coefficients).
  * Auditing rule matrix logic against emerging occupational heat research and jurisdictional safety recommendations.
  * Reviewing long-term organizational health and safety metrics to refine worksite control protocols.
* **Boundary Clarification:**
  The Heat Action Response Engine does not replace the professional judgment of certified safety specialists. Instead, it acts as an operational execution engine that consistently applies the approved policies established by safety professionals.

---

## 5. Persona Comparison Matrix

| Persona | Role Scope | Primary Goal | Main Responsibilities | Key Information Displayed | Main System Actions | Primary User Interface |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **P01 Safety Manager** | **Primary MVP** | Oversee multi-site thermal risk and organizational response | Risk monitoring, action oversight, escalation resolution, compliance audit | Multi-site risk map, active action statuses, open escalations, audit history | Monitor sites, intervene on escalations, reassign actions, export audit logs | Safety Manager Command Center (Desktop / Tablet) |
| **P02 Site Supervisor** | **Primary MVP** | Ensure on-site crew safety and directive execution | Receive directives, acknowledge promptly, deploy site controls, confirm execution | Assigned site risk, required work/rest ratio, water target, countdown timer | Acknowledge directive, generate crew briefing, confirm physical execution | Supervisor Action Center (Mobile / High-Contrast) |
| **P03 Administrator** | **Primary MVP** | Configure and maintain the operational environment | Worksite setup, GPS mapping, user provisioning, supervisor routing, policy setup | Worksite registry, user directory, integration health, system error logs | Create worksites, assign supervisors, manage user roles, toggle site status | Admin Management Console (Desktop Web) |
| **P04 Worker** | **Secondary (Beneficiary)** | Safe working conditions without thermal injury | Execute work safely, participate in rest rotations, maintain personal hydration | Verbal instructions from supervisor; visual site signage | Receives on-site safety controls via supervisor (No software login in MVP) | Field Environment / Verbal Briefings (Future App) |
| **P05 Operations Manager** | **Future** | Optimize macro project velocity while preserving safety | Resource allocation, macro trend analysis, project schedule coordination | Cross-project disruption trends, regional heat patterns, resource expenditures | Review aggregate reports, allocate site cooling assets, approve schedule shifts | Executive Analytics Portal (Future Desktop) |
| **P06 Safety Professional** | **Future** | Validate and refine organizational safety rules | Policy definition, algorithmic threshold auditing, scientific compliance | Raw formula parameters, index adjustment matrices, longitudinal safety trends | Configure rule matrices, audit threshold models, calibrate risk equations | Safety Policy Studio (Future Web) |

---

## 6. Persona-to-Workflow Mapping

The core closed-loop operational workflow of the Heat Action Response Engine involves distinct persona interactions at each lifecycle stage:

```text
STAGE 1:  ENVIRONMENTAL DATA INGESTION
STAGE 2:  DETERMINISTIC RISK ASSESSMENT
STAGE 3:  WORKSITE CONTEXT INTEGRATION
STAGE 4:  PREVENTIVE ACTION GENERATION
STAGE 5:  SUPERVISOR ASSIGNMENT
STAGE 6:  NOTIFICATION DISPATCH
STAGE 7:  SUPERVISOR ACKNOWLEDGMENT
STAGE 8:  EXECUTION CONFIRMATION
STAGE 9:  ESCALATION UPON TIMEOUT
STAGE 10: AUDIT LOGGING & ARCHIVAL
```

| Workflow Stage | Safety Manager (P01) | Site Supervisor (P02) | Administrator (P03) | System Automated (SYSTEM) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Environmental Data** | Observes data freshness | Unaware (Background) | Monitors API connectivity | Executes scheduled polling & bounds validation |
| **2. Risk Assessment** | Monitors calculated risk tiers | Views site risk badge | Unaware (Background) | Computes deterministic index & risk tier |
| **3. Worksite Context** | Reviews context accuracy | Observes context drivers | Configures site context | Applies contextual threshold modifiers |
| **4. Action Generation** | Oversees generated directives | Unaware until assigned | Unaware (Background) | Executes rule matrix to generate action plan |
| **5. Assignment** | Can manually reassign | Designated as primary owner | Maps default supervisor | Binds supervisor ID & starts escalation timer |
| **6. Notification** | Monitors delivery status | Receives multi-channel alert | Unaware (Background) | Dispatches push, email, SMS/webhook alerts |
| **7. Acknowledgment** | Tracks acknowledgment latency | **Executes explicit tap** | Unaware (Background) | Records timestamp, halts timer, updates status |
| **8. Confirmation** | Sees green "Confirmed" badge | **Confirms physical controls** | Unaware (Background) | Captures confirmation telemetry & closes action |
| **9. Escalation** | **Primary intervention recipient** | Receives urgent re-alert | Receives system alert if orphan | Detects expired timer, triggers escalation alerts |
| **10. Audit History** | Inspects & exports event logs | Views personal history | Inspects admin changes | Writes immutable, append-only ledger entries |

---

## 7. Persona-to-Feature Mapping

This matrix maps primary personas to the core functional MVP features (`F01` through `F14`) defined in [04_MVP_SCOPE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/04_MVP_SCOPE.md):

| Feature ID | Feature Name | Safety Manager (P01) | Site Supervisor (P02) | Administrator (P03) |
| :--- | :--- | :--- | :--- | :--- |
| **F01** | Worksite Management & Setup | Supporting (Views profiles) | Out of Scope | **Primary User** (Creates & configures) |
| **F02** | Weather Ingestion & Validation | Supporting (Monitors freshness) | Out of Scope | Supporting (Monitors health) |
| **F03** | Heat-Risk Calculation Engine | **Primary User** (Monitors scores) | Supporting (Views site tier) | Out of Scope |
| **F04** | Worksite Context Management | Supporting (Reviews context) | Out of Scope | **Primary User** (Defines attributes) |
| **F05** | Action Generation Engine | **Primary User** (Oversees directives) | Supporting (Executes actions) | Out of Scope |
| **F06** | Supervisor Assignment | Supporting (Can reassign) | **Primary Recipient** | **Primary User** (Configures mappings) |
| **F07** | Notification Engine | Supporting (Monitors delivery) | **Primary Recipient** (Receives alerts) | Supporting (Configures endpoints) |
| **F08** | Acknowledgment Service | Supporting (Tracks response) | **Primary Actor** (Acknowledges) | Out of Scope |
| **F09** | Automated Escalation Engine | **Primary Actor** (Resolves escalations) | Supporting (Receives re-alerts) | Out of Scope |
| **F10** | Immutable Audit History | **Primary User** (Reviews & audits) | Supporting (Views personal log) | Supporting (Reviews security log) |
| **F11** | Supervisor Action Center | Out of Scope | **Primary User** (Sole focus) | Out of Scope |
| **F12** | Safety Manager Command Center | **Primary User** (Sole focus) | Out of Scope | Out of Scope |
| **F13** | NVIDIA Assistive AI Services | **Primary User** (Risk & audit summaries) | **Primary User** (Briefings & rationale) | Supporting (Help & documentation) |
| **F14** | Simulation Mode & Sandbox | **Primary User** (Tests scenarios) | Supporting (Demo participant) | Supporting (Enables sandbox) |

---

## 8. Information Needs by Persona

To prevent cognitive overload and maintain strict operational focus, information delivery is segmented by persona:

```text
                  SAFETY MANAGER COMMAND CENTER
                  ┌───────────────────────────────────────────┐
                  │ • Multi-Site Heat Map & Risk Tiers        │
                  │ • Real-Time Escalation Alerts             │
                  │ • Acknowledgment Latency Metrics          │
                  │ • Full Worksite Audit Ledgers             │
                  └───────────────────────────────────────────┘
                                       ▲
                                       │ (Escalations & Audit)
                                       │
                  SUPERVISOR ACTION CENTER
                  ┌───────────────────────────────────────────┐
                  │ • Assigned Worksite Only                  │
                  │ • Specific Work/Rest & Hydration Directive│
                  │ • Big "Acknowledge" & "Confirm" Buttons   │
                  │ • Live Escalation Countdown Timer         │
                  └───────────────────────────────────────────┘
                                       ▲
                                       │ (Directives & Acknowledgment)
                                       │
                  ADMIN MANAGEMENT CONSOLE
                  ┌───────────────────────────────────────────┐
                  │ • Worksite Registry & GPS Coordinates     │
                  │ • User Directory & Role Assignment Matrix │
                  │ • Integration Health & Error Diagnostics  │
                  └───────────────────────────────────────────┘
```

### Safety Manager Needs
* **Portfolio Risk Posture:** Which worksites are currently at elevated thermal risk (`HIGH` or `EXTREME`).
* **Operational Bottlenecks:** Which actions are currently unacknowledged and approaching timeout deadlines.
* **Active Escalations:** Unambiguous, high-visibility alerts highlighting which supervisor failed to respond.
* **Causal Reasoning:** The exact meteorological and contextual inputs that triggered an elevated risk score.
* **Audit History:** Comprehensive chronologies proving organizational compliance.

### Site Supervisor Needs
* **Assigned Site Only:** Information strictly limited to their own job site and active crew.
* **Concrete Directives:** Specific minutes of work, minutes of rest, liters of water, and shade location.
* **Urgency & Timing:** A visible countdown timer showing exactly how much time remains before an escalation occurs.
* **Briefing Content:** A one-tap tool to convert complex technical directives into a simple spoken crew talk.

### Administrator Needs
* **Configuration Integrity:** Real-time feedback validating that GPS coordinates, timezones, and site names are valid.
* **Accountability Mappings:** An explicit view verifying that every active worksite has a designated supervisor.
* **Integration Status:** Uptime, latency, and error rates for weather API providers and notification gateways.

---

## 9. Persona-Specific AI Interaction

Artificial intelligence features (powered by NVIDIA AI infrastructure) are bounded, assistive services tailored to specific persona workflows:

```text
                         NVIDIA ASSISTIVE AI LAYER
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
    SAFETY MANAGER             SITE SUPERVISOR               ADMIN
┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
│ • Plain-Language Risk │ │ • 60-Second Crew Talk │ │ • Setup & Config Help │
│   Explanations        │ │   Drafting            │ │ • Diagnostic Log      │
│ • Incident Timeline   │ │ • Directive Rationale │ │   Clarification       │
│   Summarization       │ │   Clarification       │ │                       │
│ • Cross-Site Shift    │ │ • Multilingual        │ │                       │
│   Briefing Synthesis  │ │   Translation         │ │                       │
└───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

### Safety Manager AI Interactions
* **Risk Driver Explanation:** Synthesizes multi-variable conditions (e.g., *"North Yard reached HIGH risk because 38°C ambient temperature combined with 65% humidity produced a Heat Index of 44°C, compounded by heavy manual concrete work in direct sun."*).
* **Incident Timeline Summarization:** Condenses a multi-hour audit log into an executive paragraph for incident reviews.

### Site Supervisor AI Interactions
* **Crew Briefing Generation:** Translates technical directives into an actionable, 60-second verbal script for morning or midday toolbox talks.
* **Multilingual Translation:** Translates approved directives into languages spoken by field crew members without altering numeric thresholds.
* **Operational Rationale:** Explains why 15-minute shaded breaks are necessary to dissipate metabolic core heat.

### Administrator AI Interactions
* **Configuration Assistant:** Answers grounded questions regarding worksite context parameters and rule matrix logic.

> **CRITICAL ARCHITECTURAL DISCLAIMER:** The AI Assistant must never independently determine medical safety, override deterministic safety rules, invent safety thresholds, alter work-rest ratios, diagnose heat illness, or declare an individual worker fit or unfit for work.

---

## 10. Persona-Based UX Principles

1. **Safety Manager Sees Risk & Response:** The command center prioritizes the intersection of environmental danger and human response status.
2. **Supervisor Sees What to Do Next:** The field interface eliminates all navigation friction, presenting a clean action card with high-contrast acknowledgment controls.
3. **Admin Sees What Must Be Configured:** The administrative console immediately highlights incomplete configurations, missing coordinates, or unassigned worksites.
4. **Critical Actions Are Never Buried:** Acknowledgment buttons, escalation alerts, and required work-rest ratios must never be obscured beneath AI narratives or secondary menus.
5. **Mobile First for the Field:** The supervisor interface is engineered for high-glare outdoor screens, touch targets operable with gloves, and zero multi-step forms.
6. **Escalations Command Visual Hierarchy:** Active escalations use pulsating, high-contrast visual styling that breaks through standard dashboard routines.
7. **Audit Trails Respect Data Minimization:** Event logs display operational timestamps and role interactions without exposing personal worker information.

---

## 11. Persona-Based Success Criteria

* **Safety Manager (P01):**
  * Able to identify all high-risk worksites and unacknowledged actions within **15 seconds** of logging in.
  * Resolves or intervenes on active escalations within **5 minutes** of trigger dispatch.
  * Successfully exports a complete, timestamped compliance audit report in under **3 clicks**.
* **Site Supervisor (P02):**
  * Receives, reads, and acknowledges an assigned heat-risk directive in under **30 seconds** on a mobile device.
  * Can generate and deliver an AI-assisted 60-second toolbox briefing in under **2 minutes**.
  * Successfully confirms physical execution of controls with zero ambiguous form fields.
* **Administrator (P03):**
  * Creates, contextually configures, maps a supervisor, and activates a new worksite in under **3 minutes**.
  * Achieves **100% supervisor assignment coverage** across all active organizational worksites.

---

## 12. Canonical Demo Personas

For hackathon demonstration and end-to-end scenario validation, the following fictional organization and personas are established:

### Fictional Organization Profile
* **Organization Name:** Bengaluru Infrastructure Works (Fictional Demo Entity)
* **Primary Project:** Bengaluru Metro Phase 2 — Elevated Viaduct Package 4
* **Target Worksite:** North Bengaluru Construction Site (Pier 42 Casting Yard)

### Fictional Persona Profiles

#### 1. Ananya Rao — Safety Manager
* **Role:** Lead Occupational Health & Safety Manager
* **Location:** Central Operations Office, Bengaluru
* **System Persona:** `SAFETY_MANAGER`
* **Demo Narrative:** Monitors regional heat waves across Karnataka; relies on the Command Center to ensure casting yard supervisors enforce mandatory rest rotations.

#### 2. Rahul Kumar — Site Supervisor
* **Role:** Senior Civil Works Field Supervisor
* **Location:** North Bengaluru Construction Site (Pier 42)
* **System Persona:** `SUPERVISOR`
* **Demo Narrative:** Manages 25 civil tradespeople pouring concrete viaduct piers; operates in direct sunlight using a smartphone to acknowledge directives and coordinate canopy rest rotations.

#### 3. Priya Nair — Organization Administrator
* **Role:** Systems & Operations Coordinator
* **Location:** Bengaluru Infrastructure Works HQ
* **System Persona:** `ADMIN`
* **Demo Narrative:** Configures project GPS boundaries, registers worksites, assigns Rahul Kumar to the viaduct site, and demonstrates simulation scenario resets.

---

## 13. Persona Boundary

To prevent scope creep and maintain legal, ethical, and engineering integrity, these personas explicitly do **not** define:

* **Medical Diagnostics:** No persona is modeled or empowered as a clinical diagnostician; the software does not assess physiological vital signs or diagnose heat stroke.
* **Employee Performance Scoring:** The system does not measure, track, or score worker speed, productivity, or break duration for HR evaluations.
* **HR or Disciplinary Decisions:** Response latencies and audit logs exist strictly for operational safety coordination, not employee discipline.
* **Autonomous Safety Authorities:** Neither the software nor the AI assistant possesses autonomous authority over site operations; accountability remains with human personas.

---

## 14. Final Persona Principle

> **The product should give each person only the information and control necessary for their responsibility, while making the next safety-relevant action clear, accountable, and traceable.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
