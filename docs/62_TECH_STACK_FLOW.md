# Technology Stack Flow & End-to-End Execution

**Document ID:** `62_TECH_STACK_FLOW`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose

The purpose of this document is to answer the fundamental engineering question:

> **"How does a heat-risk event move through the actual technology stack from external environmental input to a verified workplace action?"**

This specification serves as the visual, implementation-oriented blueprint connecting the architectural design (`60_SYSTEM_ARCHITECTURE.md`) and technology choices (`61_TECH_STACK.md`) into coherent, end-to-end data and execution flows across AWS services, TypeScript engines, and user interfaces.

---

## 2. Master Technology Flow

```text
               EXTERNAL DATA SOURCES: OPEN-METEO / IMD
                                  │
                                  ▼
                    EVENTBRIDGE SCHEDULED TRIGGER
                       (Every 60 min or manual)
                                  │
                                  ▼
                      AWS LAMBDA: WEATHER INGEST
                                  │
                                  ▼
                      NORMALIZER & UNIT PARSER
                                  │
                                  ▼
                      VALIDATION & QA FILTER
                                  │
                                  ▼
                      DATA QUALITY ENGINE
                     (VALID, STALE, MISSING)
                                  │
                                  ▼
                       AMAZON DYNAMODB
                     (Store WeatherRecord)
                                  │
                                  ▼
                     AWS LAMBDA: RISK ENGINE
                                  │
                                  ▼
                     DETERMINISTIC EVALUATION
                     (Temperature + Workload)
                                  │
                                  ▼
                       AMAZON DYNAMODB
                   (Store RiskAssessment)
                                  │
                                  ▼
                    AWS LAMBDA: ACTION ENGINE
                                  │
                                  ▼
                   SITE-SPECIFIC ACTION ENGINE
                    (Contextualize Directives)
                                  │
                                  ▼
                       AMAZON DYNAMODB
                     (Store ActionRecord)
                                  │
                ┌─────────────────┴─────────────────┐
                ▼                                   ▼
      NOTIFICATION ROUTER                   EVENTBRIDGE BUS
                │                                   │
                ▼                                   ▼
      SUPERVISOR DASHBOARD                 ESCALATION WORKFLOW
      (PWA / In-App Alert)                 (Step Functions / TTL)
                │                                   │
                ▼                                   ▼
      SUPERVISOR ACKNOWLEDGES              SLA BREACHED: ALERT
     (POST /api/actions/{id}/ack)           SAFETY MANAGER
                │                                   │
                ▼                                   ▼
        ACTION IN PROGRESS                  SAFETY INTERVENTION
                │                                   │
                ▼                                   │
        ACTION VERIFICATION                         │
     (Inspection Sign-off)                          │
                │                                   │
                └─────────────────┬─────────────────┘
                                  │
                                  ▼
                       IMMUTABLE AUDIT LOG
                       (Amazon DynamoDB)
```

---

## 3. User Request & API Flow

When an authenticated supervisor accesses the platform, requests execute through a secure, low-latency pipeline:

```text
SUPERVISOR ON MOBILE PWA
          │
          ▼ HTTPS (TLS 1.3)
AMAZON API GATEWAY
          │
          ├─► Validates Request Structure (OpenAPI Schema)
          ├─► Cryptographically Verifies Cognito JWT Bearer Token
          │
          ▼
AWS LAMBDA: ApiHandlerFunction
          │
          ├─► Extracts User Claims: User ID, Role (`SUPERVISOR`), Org ID
          ├─► Authorizes Worksite Scope (Is user assigned to `site_blr_north`?)
          │
          ▼
APPLICATION SERVICE LAYER: ActionService
          │
          ▼
AMAZON DYNAMODB
          │ Execute Strongly Consistent Read or Conditional Write
          │
          ▼
RESPONSE FORMATTED AS JSON
          │
          ▼ HTTP 200 OK
REACT PWA: TANSTACK QUERY CACHE UPDATED
          │
          ▼
CALM UI RENDER: Immediate State Transition
```

---

## 4. Weather Ingestion & Refresh Flow

```text
AMAZON EVENTBRIDGE CRON
          │
          ▼
AWS LAMBDA: WeatherIngestionHandler
          │
          ▼
CALL EXTERNAL API: Open-Meteo REST Endpoint
          │
          ├─────────────────────────────────────────┐
          ▼ (Success Path)                          ▼ (Failure Path: 504 / Drop)
PARSE RAW JSON METEOROLOGICAL DATA          RETRY WITH EXPONENTIAL BACKOFF
          │                                         │
          ▼                                         ▼ (Max Retries Failed)
NORMALIZE UNITS (°C, %, W/m², m/s)          LOG TELEMETRY INCIDENT
          │                                         │
          ▼                                         ▼
VALIDATE NUMERICAL BOUNDS                   MARK DATA QUALITY: STALE / MISSING
          │                                         │
          ▼                                         ▼
CALCULATE DATA QUALITY SCORE                PRESERVE LAST VALID RECORD
(VALID: Age < 60 min, Variance Normal)      DO NOT REASSURE USER
          │                                         │
          └────────────────────┬────────────────────┘
                               │
                               ▼
            AMAZON DYNAMODB: Save WeatherRecord
                               │
                               ▼
            TRIGGER RISK REASSESSMENT PIPELINE
```

---

## 5. Deterministic Risk Calculation Flow

```text
WEATHER RECORD STORED IN DYNAMODB
               │
               ▼
AWS LAMBDA: RiskEngineHandler
               │
               ├─► Retrieve Latest Validated WeatherRecord
               ├─► Retrieve Worksite Facility Context (Outdoor vs Indoor, Shading)
               ├─► Retrieve Active Shift Parameters (Workload: HEAVY, Acclimatization)
               │
               ▼
INVOKE PURE DETERMINISTIC RISK FUNCTION (`20_HEAT_RISK_ENGINE.md`)
               │
               ├─► Compute Apparent Temperature / Heat Index
               ├─► Apply ISO 7243 / OSHA / NDMA Threshold Offsets
               ├─► Map to Categorical Risk Level:
               │   [ LOW | MODERATE | HIGH | CRITICAL | UNKNOWN ]
               ├─► Compile Deterministic Factor Attribution
               │
               ▼
AMAZON DYNAMODB: PutItem (RiskAssessment)
               │
               ▼
EMIT DOMAIN EVENT: `RISK_ASSESSED` (Level: HIGH)
```

*Architectural Principle:* The frontend React client **never** computes heat risk. It solely renders the authoritative backend evaluation.

---

## 6. Action Generation & Owner Resolution Flow

```text
DOMAIN EVENT: `RISK_ASSESSED` (Level: HIGH)
               │
               ▼
AWS LAMBDA: ActionEngineHandler
               │
               ├─► Fetch Worksite Safeguard Profile (`14_WORKSITE_MODEL.md`)
               ├─► Evaluate Action Rules Matrix (`41_ACTION_RULES.md`)
               │   - Condition: Risk = HIGH AND Workload = HEAVY
               │   - Mandate: 30 min rest/hour under shade + Electrolyte replenishment
               │
               ├─► Contextualize Directive (`42_SITE_SPECIFIC_ACTIONS.md`):
               │   - Target: "Shaded Rest Zone B" (Nearest designated cooling point)
               │
               ├─► Deduplicate: Suppress if identical action is already ACTIVE
               ├─► Resolve Assignee: Lookup active on-duty Supervisor (`usr_sup_rahul`)
               │
               ▼
AMAZON DYNAMODB: PutItem (ActionRecord)
               │ Attributes: { id, site_id, assigned_to, status: PENDING_ACK, sla_ack: +15m }
               │
               ▼
EMIT DOMAIN EVENT: `ACTION_CREATED` & `ACTION_ASSIGNED`
```

---

## 7. Notification Routing Flow

```text
DOMAIN EVENT: `ACTION_ASSIGNED`
               │
               ▼
AWS LAMBDA: NotificationDispatcher
               │
               ├─► Identify Target User Preferences & Device Tokens
               ├─► Formulate Deterministic Notification Payload:
               │   Title: "HIGH Risk Directive: Mandatory Hydration Break"
               │   Body: "Enforce 30 min shade rest for heavy tasks at Site North."
               │
               ├─► (Optional P1) AI Language Assistance (`49_NOTIFICATION_GENERATION.md`):
               │   - NVIDIA NIM translates briefing into regional Kannada/Hindi
               │   - Output strictly validated against deterministic facts
               │
               ▼
WRITE IN-APP NOTIFICATION TO DYNAMODB
               │
               ▼ (Optional Push / SNS)
AMAZON SNS / WEB PUSH SERVICE -> FIELD SUPERVISOR DEVICE
```

*Guardrail:* AI assistance never selects notification recipients, overrides deadlines, or alters safety directives.

---

## 8. Supervisor Acknowledgment Flow

```text
SUPERVISOR REVIEWS DIRECTIVE ON MOBILE PWA
                    │
                    ▼
SUPERVISOR TAPS [ ACKNOWLEDGE ]
                    │
                    ▼ POST /api/v1/actions/{id}/acknowledge
AMAZON API GATEWAY -> AWS LAMBDA: ActionHandler
                    │
                    ├─► Authenticate & Authorize User Ownership
                    │
                    ▼
AMAZON DYNAMODB: Conditional Transaction Write
Condition: attribute_exists(id) AND status = 'PENDING_ACK'
Update:
  status = 'ACKNOWLEDGED'
  acknowledged_by = 'usr_sup_rahul'
  acknowledged_at = '2026-10-07T14:20:00Z'
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
[ WRITE SUCCEEDS ]      [ WRITE FAILS (Conflict / Timeout) ]
Return HTTP 200 OK      Return HTTP 409 Conflict
Emit `ACTION_ACKNOWLEDGED` Explain Conflict Reason
Log Immutable Audit     Prompt Supervisor Review
```

*Safety Rule:* The UI never uses optimistic state confirmation for safety acknowledgments. The card only transitions after authoritative DynamoDB write confirmation.

---

## 9. Automated Escalation Flow

```text
ACTION RECORD CREATED (Acknowledgment SLA: 15 minutes)
                    │
                    ▼
EVENTBRIDGE SCHEDULED RULE / STEP FUNCTIONS SLA TIMER
                    │
                    ▼
EVALUATE STATUS AFTER 15 MINUTES:
Is status still 'PENDING_ACK'?
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
    [ NO ]                    [ YES ]
Action Acknowledged;      SLA BREACH DETECTED!
Cancel Escalation Timer   AWS Lambda: EscalationHandler
                                 │
                                 ▼
                     TRANSITION STATUS IN DYNAMODB:
                     status = 'ESCALATED'
                                 │
                                 ▼
                     EMIT DOMAIN EVENT: `ESCALATION_TRIGGERED`
                                 │
                                 ▼
                     DISPATCH URGENT ESCALATION ALERT:
                     - Priority Notification to Safety Manager (Ananya Rao)
                     - High-visibility banner on Central Safety Dashboard
                     - Record Incident in Compliance Audit Log
```

---

## 10. Action Verification Flow

Verification ensures that acknowledged actions were physically carried out on site:

```text
SUPERVISOR COMPLETES FIELD SAFEGUARD EXECUTION
                    │
                    ▼
SUPERVISOR SUBMITS VERIFICATION ATTESTATION:
POST /api/v1/actions/{id}/request-verification
                    │
                    ▼
STATUS TRANSITIONS TO: `VERIFICATION_PENDING`
                    │
                    ▼
SAFETY MANAGER INSPECTS FIELD EVIDENCE / COMPLETION LOG
                    │
                    ▼ POST /api/v1/actions/{id}/verify
AWS LAMBDA: ActionVerificationHandler
                    │
                    ├─► Validates Actor Role: Must be `SAFETY_MANAGER` or Authorized Lead
                    │
                    ▼
DYNAMODB UPDATE:
status = 'VERIFIED'
verified_by = 'usr_mgr_ananya'
verified_at = '2026-10-07T15:00:00Z'
                    │
                    ▼
IMMUTABLE AUDIT RECORD APPENDED
```

*Distinction:* `ACKNOWLEDGED` confirms legal receipt; `VERIFIED` confirms physical execution.

---

## 11. AI Assistant Grounded Query Flow

```text
USER ENTERS CHAT PROMPT:
"Why is North Bengaluru rated HIGH risk right now?"
                    │
                    ▼
API GATEWAY (Authenticated via Cognito JWT)
                    │
                    ▼
AWS LAMBDA: AIAssistantHandler
                    │
                    ├─► Extract Active Worksite ID & Verify User Authorization
                    ├─► Retrieve Ground-Truth Record from DynamoDB:
                    │   - Latest RiskAssessment (Heat Index: 43.8°C, Factor: Solar + Heavy Work)
                    │   - Active ActionRecords (Hydration Break enforced)
                    │
                    ▼
CONSTRUCT DETERMINISTIC CONTEXT PROMPT (`45_PROMPT_STRATEGY.md`)
                    │
                    ▼
NVIDIA AI / NIM MODEL INVOCATION
                    │
                    ▼
AI GUARDRAIL FILTER (`46_AI_GUARDRAILS.md`)
- Verify zero medical claims
- Verify accuracy against deterministic factors
                    │
                    ▼
HTTP 200 RESPONSE WITH GROUNDED NATURAL LANGUAGE EXPLANATION
```

---

## 12. Frontend Real-Time Synchronization Flow

```text
DOMAIN EVENT EMITTED IN BACKEND: `RISK_UPDATED`
                    │
                    ▼
EVENT CHANNEL BROADCAST (SSE / WebSocket / Polling Revalidation)
                    │
                    ▼
REACT PWA: FRONTEND EVENT LISTENER
                    │
                    ├─► Check Active Worksite Scope (Is event for current site?)
                    ├─► TanStack Query: Invalidate `['risk', worksiteId]` query key
                    │
                    ▼
AUTOMATIC BACKGROUND HTTP FETCH:
GET /api/v1/worksites/{id}/risk
                    │
                    ▼
FRESH AUTHORITATIVE RECORD RECEIVED
                    │
                    ▼
CALM UI TRANSITION:
Update Risk Badge + Update Freshness Timestamp ("Synced 14:24")
```

---

## 13. Progressive Web App (PWA) Offline & Reconnect Flow

```text
SUPERVISOR OPERATES PWA IN CELLULAR DEAD ZONE
                         │
                         ▼
NETWORK STATE: OFFLINE DETECTED BY SERVICE WORKER
                         │
                         ▼
UI DISPLAYS LAST KNOWN STATE WITH PROMINENT [ ○ Offline ] BADGE
                         │
                         ▼
SUPERVISOR TAPS [ ACKNOWLEDGE ] WHILE OFFLINE
                         │
                         ▼
ACTION SAVED TO INDEXEDDB `sync_queue`
UI Displays: [ ◐ Pending Server Confirmation ]
(Action is NOT displayed as Confirmed)
                         │
                         ▼
(CELLULAR SIGNAL RESTORED)
                         │
                         ▼
SERVICE WORKER FLUSHES `sync_queue` TO API GATEWAY
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
[ SERVER ACCEPTS ]            [ SERVER REJECTS ]
Action status committed       Action already escalated;
UI transitions to Confirmed   Modal displays conflict resolution
```

---

## 14. Complete End-to-End Data Lifecycle

```text
EXTERNAL RAW TELEMETRY (Open-Meteo REST API)
       │
       ▼
NORMALIZED NUMERICAL VECTORS (Standard SI units)
       │
       ▼
VALIDATED ENVIRONMENTAL DATA (QA Pass, Quality: VALID)
       │
       ▼
DETERMINISTIC HEAT RISK MATRIX (Calculated Level: HIGH)
       │
       ▼
CONTEXTUAL MITIGATION DIRECTIVE (Mandatory Hydration Break)
       │
       ▼
DISPATCHED NOTIFICATION (In-app alert to Supervisor)
       │
       ▼
HUMAN ACKNOWLEDGMENT (Supervisor accepts ownership)
       │
       ▼
FIELD VERIFICATION (Safety Manager confirms completion)
       │
       ▼
IMMUTABLE COMPLIANCE AUDIT ENTRY (Permanent DynamoDB record)
```

---

## 15. Logical Storage Entities in Amazon DynamoDB

Logical storage entities map cleanly to DynamoDB operational structures:

```text
┌──────────────────────┬────────────────────────────────────────────────────────┐
│ ENTITY TYPE          │ KEY SCHEMAS & ATTRIBUTES                               │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ `Organization`       │ `org_id`, enterprise name, compliance tier, contacts. │
│ `User`               │ `user_id`, `org_id`, role, name, phone, email.        │
│ `Worksite`           │ `worksite_id`, `org_id`, lat/long, shade/water assets.│
│ `Shift`              │ `shift_id`, `worksite_id`, hours, worker count, tasks.│
│ `WeatherRecord`      │ `worksite_id#timestamp`, temp, humidity, solar, QA.    │
│ `RiskAssessment`     │ `assessment_id`, `worksite_id`, level, factors, rule.  │
│ `ActionRecord`       │ `action_id`, `worksite_id`, assigned_to, status, SLA.  │
│ `Notification`       │ `notification_id`, `user_id`, title, status, timestamp│
│ `Escalation`         │ `escalation_id`, `action_id`, reason, target_manager.  │
│ `AuditEvent`         │ `audit_id`, `timestamp`, actor_id, event_type, delta.  │
└──────────────────────┴────────────────────────────────────────────────────────┘
```

*Note: Concrete DynamoDB single-table primary key / sorting key (`PK`, `SK`, `GSI`) designs are specified in `68_DYNAMODB.md`.*

---

## 16. AWS Service Responsibility Matrix

```text
┌──────────────────────┬────────────────────────────────────────────────────────┐
│ AWS SERVICE          │ EXACT ARCHITECTURAL RESPONSIBILITY                     │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ Amazon API Gateway   │ HTTP entry point, JWT verification, rate limiting.     │
│ AWS Lambda           │ Compute host for REST APIs, Ingestion & Domain engines.│
│ Amazon DynamoDB      │ Operational storage, atomic conditional writes, audit. │
│ Amazon EventBridge   │ Hourly ingestion cron scheduling & domain event bus.   │
│ AWS Step Functions   │ Orchestrating acknowledgment SLA countdown & escalations│
│ AWS CloudWatch       │ Centralized JSON logs, error metrics, operational alarms│
│ AWS Secrets Manager  │ Storing Open-Meteo & NVIDIA AI endpoint credentials.   │
│ Amazon S3            │ Static web hosting for compiled React Vite PWA bundle. │
│ Amazon CloudFront    │ Global CDN distribution and edge SSL termination.      │
│ AWS IoT Core         │ (Future) Ingesting on-site physical WBGT sensors.      │
└──────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 17. Synchronous vs. Asynchronous Strategy

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ SYNCHRONOUS HTTP REQUESTS         │ ASYNCHRONOUS EVENT PROCESSING     │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Supervisor logging into PWA     │ • Ingesting hourly weather runs   │
│ • Loading worksite dashboard view │ • Evaluating multi-site heat risk │
│ • Reading active action list      │ • Fan-out alert notifications     │
│ • Submitting action acknowledgment│ • Tracking escalation SLA timers  │
│ • Submitting verification sign-off│ • Writing compliance audit events │
│ • Direct AI explanation query     │ • Archiving historical records    │
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 18. Error Propagation & Containment Flow

```text
EXTERNAL WEATHER SERVICE FAILURE (HTTP 500 / Timeout)
                  │
                  ▼
WEATHER INGESTION LAMBDA CATCHES ERROR
                  │
                  ├─► Retries 3 times with exponential backoff
                  │
                  ▼ (Failure Persists)
RECORD TELEMETRY EXCEPTION TO CLOUDWATCH
                  │
                  ▼
UPDATE WORKSITE DATA QUALITY IN DYNAMODB:
quality = 'STALE', error = 'PROVIDER_TIMEOUT'
                  │
                  ▼
PRESERVE PREVIOUS VALID RISK ASSESSMENT
(Under no circumstances downgrade risk to LOW)
                  │
                  ▼
FRONTEND PWA RENDERS VISIBLE WARNING:
"⚠ Weather feed delayed; retaining 14:00 HIGH risk safeguards."
```

---

## 19. Server-Enforced Security Flow

```text
INCOMING CLIENT REQUEST: POST /api/v1/worksites/{id}/actions
                  │
                  ▼
1. EXTRACT BEARER TOKEN FROM `Authorization` HEADER
                  │
                  ▼
2. CRYPTOGRAPHIC JWT VALIDATION (Cognito Public Keys)
   - Confirm token is not expired
   - Extract `sub` (User ID), `org_id`, and `role`
                  │
                  ▼
3. MULTI-TENANT BOUNDARY VALIDATION
   - Query requested `worksite_id` from DynamoDB
   - Verify `worksite.org_id === token.org_id`
   - IF MISMATCH: Immediately abort with HTTP 403 Forbidden
                  │
                  ▼
4. ROLE-BASED ACCESS CONTROL (RBAC) CHECK
   - Action requires role in `['SAFETY_MANAGER', 'ADMIN']`
   - IF INSUFFICIENT: Immediately abort with HTTP 403 Forbidden
                  │
                  ▼
5. EXECUTE BUSINESS LOGIC SECURELY
```

---

## 20. Multi-Tenant Isolation Flow

Multi-tenant isolation is enforced at every layer of the technology stack:
* **Partitioned Queries:** DynamoDB queries always include the tenant `org_id` in partition keys or composite indices (`PK: ORG#<org_id>#SITE#<site_id>`).
* **Cache Partitioning:** PWA service worker and IndexedDB caches isolate datasets under tenant prefixes, wiping storage on user logout (`59_PWA.md`).
* **AI Isolation:** Prompt contexts assemble data exclusively from the authenticated user's organization.

---

## 21. Compliance Audit Flow

```text
SAFETY-CRITICAL EVENT OCCURS (e.g. Action Acknowledged)
                  │
                  ▼
AUDIT LOGGER INTERCEPTOR
                  │
                  ├─► Captures Actor ID, Role, Client IP, User Agent
                  ├─► Captures Resource ID, Rule Version, Pre/Post State
                  ├─► Appends UTC ISO-8601 Millisecond Timestamp
                  │
                  ▼
AMAZON DYNAMODB: Append-only write to `AuditTable`
                  │
                  ▼
IMMUTABLE RECORD PERSISTED
                  │
                  ▼
SAFETY MANAGER / REGULATOR INSPECTS COMPLIANCE LOG:
GET /api/v1/worksites/{id}/audit-trail
```

---

## 22. Training & Simulation Execution Flow

```text
ADMINISTRATOR LAUNCHES SIMULATION SCENARIO:
"Extreme Heat Wave Drill (+4°C Spike)" (`38_SIMULATION_MODE.md`)
                  │
                  ▼
LAMBDA INJECTS SYNTHETIC WEATHER VECTOR INTO PIPELINE
Tag: `is_simulation = true`, `scenario_id = "drill_01"`
                  │
                  ▼
NORMALIZATION -> VALIDATION -> RISK ENGINE -> ACTION ENGINE
(Identical deterministic domain code executes!)
                  │
                  ▼
DYNAMODB PERSISTS WITH SIMULATION FLAG
                  │
                  ▼
ISOLATED EVENT ROUTING:
- PWA displays distinct Purple Banner: `◆ SIMULATION MODE`
- Live SMS / Emergency calls strictly suppressed
- Audit records marked permanently as `SIMULATION`
```

---

## 23. End-to-End Judge Demonstration Scenario

The canonical demonstration flow designed for hackathon presentation follows an acute heatwave scenario:

```text
STEP 1: BASELINE (11:00 AM)
- Worksite: North Bengaluru Metro Construction Site
- Ambient: 34°C, 45% RH -> Moderate Risk. Normal construction operations.

STEP 2: RAPID ENVIRONMENTAL ESCALATION (13:30 PM)
- Weather Ingestion fetches updated feed: 41°C, 58% RH, Solar Radiation 920 W/m².
- Deterministic Risk Engine calculates Heat Index 44.2°C -> Level transitions to HIGH.

STEP 3: ACTION DISPATCH (13:31 PM)
- Action Engine generates: "Mandatory 30m Shaded Rest & Electrolyte Dispensation".
- Assigns to Field Supervisor: Rahul Kumar. SLA: 15 minutes.

STEP 4: SUPERVISOR NOTIFICATION (13:32 PM)
- In-app notification triggers on Rahul's mobile PWA with prominent sound/banner.
- Rahul reviews the card: "Why is this required?" -> Reads clear deterministic reasoning.

STEP 5: SIMULATED UNRESPONSIVE SUPERVISOR (13:32 - 13:47 PM)
- For demo purposes, the countdown timer accelerates to demonstrate SLA breach.
- 15 minutes elapse with zero acknowledgment.

STEP 6: AUTOMATED ESCALATION (13:47 PM)
- Escalation Engine triggers: Status shifts to ESCALATED.
- Alert fires on Central Dashboard of Safety Manager: Ananya Rao.

STEP 7: INTERVENTION & VERIFICATION (13:48 PM)
- Ananya contacts site dispatch; Rahul acknowledges directive via PWA.
- Ananya confirms physical cooling station implementation -> Marks VERIFIED.

STEP 8: IMMUTABLE AUDIT TRAIL (13:49 PM)
- Dashboard displays complete, timestamped forensic record of the entire response loop.
```

---

## 24. Technology-to-Responsibility Boundary Matrix

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ SYSTEM RESPONSIBILITY    │ AUTHORITATIVE TECHNOLOGY OWNER                   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ UI Presentation & Touch  │ React 18, TypeScript, Tailwind, Vite             │
│ Client View State Cache  │ TanStack React Query, Zustand                    │
│ Mobile Offline Shell     │ PWA Service Worker, Web App Manifest             │
│ Edge Routing & Auth Gate │ Amazon API Gateway, Cognito JWT Verifier         │
│ Compute Runtime          │ AWS Lambda (Node.js 20.x TypeScript)             │
│ Weather Acquisition      │ Open-Meteo REST API, Ingestion Lambda            │
│ Data Quality Scoring     │ Data Validation Module (Pure TypeScript)         │
│ Heat Risk Calculation    │ Deterministic Risk Engine (Pure TypeScript)      │
│ Action Generation        │ Contextual Action Engine (Pure TypeScript)       │
│ Natural Language Briefing│ NVIDIA AI / NIM Hosted Microservices             │
│ Operational State Store  │ Amazon DynamoDB (Single/Multi-table design)      │
│ Scheduling & Fan-Out     │ Amazon EventBridge (Scheduler & Event Bus)       │
│ Escalation SLA Tracking  │ AWS Step Functions / DynamoDB TTL Timers         │
│ Logging & Alarms         │ Amazon CloudWatch Logs & Metrics                 │
│ Compliance Audit History │ Immutable DynamoDB Append-Only Table             │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 25. Architectural Decision Rules Summary

1. **Frontend does not calculate safety risk:** All risk ratings derive from authoritative backend engines.
2. **AI does not determine safety policy:** AI explains and communicates; pure deterministic code decides.
3. **AWS services do not define domain logic:** Cloud primitives host and orchestrate; pure TypeScript models rule.
4. **Backend owns operational truth:** Acknowledgment and verification state live exclusively in DynamoDB.
5. **DynamoDB stores authoritative state:** Cached client storage is provisional and subject to server reconciliation.
6. **Events communicate changes, not storage:** Event streams broadcast transitions; tables retain source of truth.
7. **Cached PWA state is never automatically authoritative:** Stale local data is visibly flagged as unconfirmed.
8. **Forecasts remain forecasts:** Predictive models are never visually or programmatically conflated with observations.
9. **Unknown remains unknown:** Telemetry voids trigger manual heightened precautions, never false reassurance.
10. **Data failure remains visible:** Communication and sensor outages are transparently surfaced to operators.
11. **Simulation remains isolated:** Training scenarios never contaminate production metrics or audit histories.
12. **Every operational transition is traceable:** Comprehensive audit logs record every event from ingest to verification.

---

## 26. Final Architectural Principle

> **The Heat Action Response Engine is a backend-authoritative, event-aware, deterministic safety workflow implemented on a practical AWS/serverless foundation. Environmental data is validated before entering the risk engine; risk and preventive actions are determined by explicit rules; users receive accountable actions through the application; acknowledgment, verification, escalation, and audit remain server-controlled; and AI improves explanation and communication without becoming the authority for safety decisions.**
