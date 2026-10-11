# System Architecture Specification

**Document ID:** `60_SYSTEM_ARCHITECTURE`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

The purpose of this specification is to define the end-to-end technical architecture of the Heat Action Response Engine. It articulates how environmental weather feeds, worksite operational parameters, deterministic heat-risk calculations, action decision logic, escalation timers, and audit logs are orchestrated across a robust, serverless AWS infrastructure to deliver a reliable, responsive, and accountable workplace safety platform.

The document establishes:
* What architectural components exist and their precise operational boundaries.
* Why each component is selected and how they communicate.
* Where safety-critical deterministic decisions occur versus where presentation and assistance reside.
* How data and domain events traverse the platform.
* How failure conditions and telemetry disruptions are absorbed without compromising life safety.
* How AWS cloud services implement the architecture without overriding domain safety logic.

---

## 2. Core Architectural Goals

The platform is engineered around eighteen foundational system goals:

1. **Safety-First Deterministic Processing:** Environmental heat-hazard calculations and mitigation rules execute purely through auditable, deterministic algorithms.
2. **Clear Separation of Responsibilities:** Presentation, routing, calculation, workflow, storage, and AI assistance reside in distinct, decoupled layers.
3. **Backend-Authoritative Operational State:** The server is the sole arbiter of risk assessments, required actions, SLAs, and verifications.
4. **Reliable Telemetry Ingestion:** Robust scheduled fetching, normalization, and quality scoring of external meteorological data.
5. **Explainable Risk Assessment:** Every risk level is fully traceable to validated input factors (temperature, humidity, solar exposure, workload, acclimatization).
6. **Contextual Action Generation:** Required workplace safeguards adapt to specific worksite facilities, active shifts, and worker task intensities.
7. **Accountable Ownership:** Every generated action is assigned to a specific, authenticated supervisor with clear response expectations.
8. **Traceable Acknowledgment:** Supervisor receipt and physical execution acceptance are recorded with authoritative timestamps.
9. **Automated Escalation:** Unacknowledged or unverified high-risk directives trigger multi-tier escalations to safety managers before health emergencies arise.
10. **Comprehensive Auditability:** Every state transition forms an immutable, queryable operational record.
11. **Server-Enforced Role-Based Authorization:** Access control and tenant/worksite boundaries are strictly validated on the backend.
12. **AI Isolation from Safety Decisions:** LLMs function strictly as explanatory and communicative assistants; they never determine risk levels or action mandates.
13. **Scalable Event-Driven Architecture:** Asynchronous event queues absorb sudden bursts of weather updates and multi-site notifications.
14. **Radical Failure Transparency:** Sensor dropouts, API timeouts, and stale telemetry are visibly flagged; failures never degrade silently to reassuring "Low" states.
15. **Secure Multi-Tenant Isolation:** Complete logical isolation between enterprise organizations, facilities, and personnel data.
16. **Developer Velocity & Maintainability:** Modular, clean TypeScript architecture enabling straightforward local development, testing, and CI/CD.
17. **Hackathon Implementation Feasibility:** A practical, serverless MVP deployable on AWS without unnecessary distributed microservice overhead.
18. **Future Extensibility:** Architecture naturally accommodates future on-site IoT sensors, wearable telemetry, and additional meteorological providers.

---

## 3. High-Level Architecture Overview

The system architecture partitions into an external data ingestion tier, a deterministic core backend, an asynchronous event/workflow pipeline, and a modern web/mobile user experience layer.

```text
                    EXTERNAL METEOROLOGICAL SOURCES
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
         Open-Meteo               IMD               Future IoT
        (Hourly/3-hr)        (Gridded/AWS)       (On-site WBGT)
              │                    │                    │
              └────────────────────┼────────────────────┘
                                   │
                                   ▼
                       WEATHER INGESTION SERVICE
                                   │
                                   ▼
                      NORMALIZATION & PARSING
                                   │
                                   ▼
                   DATA VALIDATION & QA FILTERING
                                   │
                                   ▼
                     DATA QUALITY & FRESHNESS ENGINE
                                   │
                                   ▼
                        WEATHER DATA STORAGE
                                   │
                                   ▼
                     DETERMINISTIC HEAT-RISK ENGINE
                                   │
                                   ▼
                       RISK ASSESSMENT STORAGE
                                   │
                                   ▼
                      CONTEXTUAL ACTION ENGINE
                                   │
                                   ▼
                       SITE-SPECIFIC ACTIONS
                                   │
                                   ▼
                     SUPERVISOR ASSIGNMENT & DISPATCH
                                   │
                                   ▼
                      NOTIFICATION DISPATCH SERVICE
                                   │
                                   ▼
                   SUPERVISOR ACKNOWLEDGMENT & VERIFY
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼ (If SLA breached)                 ▼ (If acknowledged)
         ESCALATION ENGINE                     EXECUTION & VERIFY
                 │                                   │
                 ▼                                   ▼
         SAFETY MANAGER                      IMMUTABLE AUDIT LOG
```

### Client Interaction & Serverless Cloud Topology

```text
                             ┌───────────────────────┐
                             │   React + Vite PWA    │
                             │ (Mobile / Tablet / PC)│
                             └───────────┬───────────┘
                                         │ HTTPS / WSS
                                         ▼
                             ┌───────────────────────┐
                             │  Amazon API Gateway   │
                             │  (REST / WebSocket)   │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  AWS Lambda Backend   │
                             │   (Modular Node.js)   │
                             └───────────┬───────────┘
                                         │
                ┌────────────────────────┼────────────────────────┐
                ▼                        ▼                        ▼
       Worksite & Shift          Risk & Action Engine      User & Auth Layer
           Services                    Services                (Cognito)
                │                        │                        │
                └────────────────────────┼────────────────────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │    Amazon DynamoDB    │
                             │ (Operational Storage) │
                             └───────────┬───────────┘
                                         │
                                         ▼
                             ┌───────────────────────┐
                             │  Amazon EventBridge   │
                             │  (Domain Event Bus)   │
                             └───────────────────────┘
```

*Note: While the long-term production target uses full AWS serverless infrastructure, the architectural components are structured logically so that the MVP can run either in AWS or as a modular monolith during hackathon evaluation.*

---

## 4. Architectural Layers

The architecture is organized into five clean, unidirectional tiers:

```text
EXPERIENCE LAYER (Presentation, PWA, State Cache)
      ↓
API GATEWAY & EDGE (Authentication, Routing, Throttling)
      ↓
APPLICATION SERVICES (Orchestration, Domain Use Cases)
      ↓
DOMAIN / SAFETY LAYER (Pure Deterministic Safety Logic)
      ↓
DATA & INFRASTRUCTURE LAYER (DynamoDB, EventBridge, CloudWatch)
```

### Layer 1 — Experience Layer
* **Technologies:** React, TypeScript, Vite, Tailwind/Vanilla CSS Design System (`55_DESIGN_SYSTEM.md`), Progressive Web App Service Worker (`59_PWA.md`).
* **Responsibilities:**
  * Render bright, calm, highly scannable supervisor and safety manager dashboards.
  * Facilitate frictionless mobile touch interactions ($48\text{ px}$ targets).
  * Maintain local query cache and optimistic view state.
  * Visibly communicate connection health (`CONNECTED`, `OFFLINE`, `STALE`).
* **Strict Exclusions:**
  * **Never** calculates heat indices, thresholds, or risk categories.
  * **Never** decides whether an action should escalate or auto-close.

### Layer 2 — API & Routing Layer
* **Technologies:** Amazon API Gateway (REST API endpoints), AWS Lambda Authorizers / Cognito JWT verifiers.
* **Responsibilities:**
  * TLS termination and HTTP request validation against OpenAPI schemas.
  * Extraction and cryptographic verification of user bearer tokens.
  * Server-side role-based authorization (RBAC) and tenant boundary enforcement.
  * Rate limiting, abuse throttling, and structured CORS handling.
  * Consistent error serialization (HTTP 400, 401, 403, 404, 409, 500).

### Layer 3 — Application Services Layer
* **Structure:** A modular TypeScript application core organized by bounded domains:
  * `WorksiteService`: Facility profiles, shift schedules, active worker rosters.
  * `WeatherService`: Provider connectors, polling schedules, cache invalidation.
  * `RiskService`: Evaluates operational heat hazard across worksites.
  * `ActionService`: Generates, assigns, tracks, and transitions mitigation actions.
  * `NotificationService`: Formats in-app alerts and SMS/email notifications.
  * `AcknowledgmentService`: Validates supervisor action confirmations.
  * `EscalationService`: Evaluates SLA timeouts and reroutes unaddressed risks.
  * `AuditService`: Appends immutable events to compliance logs.
  * `AIAssistanceService`: Interfaces with NVIDIA AI for contextual explanations.
* **Microservices vs. Modular Architecture:**
  For the hackathon MVP, these services run within a clean, modular serverless application rather than separate independently deployed microservices, maximizing developer velocity while maintaining pristine architectural separation.

### Layer 4 — Domain / Safety Layer
* **Nature:** Zero external cloud dependencies; pure, isolated, unit-tested TypeScript domain functions.
* **Core Logic:** Implements the deterministic heat risk algorithms (`20_HEAT_RISK_ENGINE.md` through `28_SAFETY_GUARDRAILS.md`) and action generation rules (`40_ACTION_ENGINE.md` through `42_SITE_SPECIFIC_ACTIONS.md`).

### Layer 5 — Data & Event Layer
* **Technologies:** Amazon DynamoDB (operational tables), Amazon EventBridge (event routing), Amazon CloudWatch (observability).
* **Responsibilities:** Highly available persistence, monotonic version control, event fan-out, and audit trail storage.

---

## 5. Domain & Safety Layer: Deterministic Processing

The Domain Safety Layer represents the intellectual and legal core of the platform. Under no circumstances may AI models, frontend client scripts, or third-party weather APIs make safety determinations.

```text
VALIDATED ENVIRONMENTAL DATA
(Dry Bulb, RH, Solar, Wind)
             +
WORKSITE PROFILE
(Indoor/Outdoor, Shading, AC)
             +
SHIFT CONTEXT
(Shift Type, Active Hours)
             +
WORKLOAD CLASSIFICATION
(Light, Moderate, Heavy, Very Heavy)
             +
ACCLIMATIZATION PROFILE
(New Workers, Heatwave Day Count)
             │
             ▼
┌──────────────────────────────────────────────┐
│       DETERMINISTIC HEAT RISK RULES          │
│   (Math models, ISO 7243 / OSHA / NDMA)      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│        AUTHORITATIVE RISK ASSESSMENT         │
│  Level: HIGH | Quality: VALID | Rule: v1.2   │
│  Contributing Factors & Primary Drivers      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         DETERMINISTIC ACTION RULES           │
│  (Hydration cadence, rest breaks, rotation)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│          SITE-SPECIFIC ACTION RECORD         │
│  Action: MANDATORY_HYDRATION_BREAK           │
│  SLA: 15m | Owner: Supervisor Rahul          │
└──────────────────────────────────────────────┘
```

---

## 6. Logical Data Storage Domains

Application data is segmented into twelve logical entity domains. Detailed physical single-table / multi-table DynamoDB partition key structures are defined in `68_DYNAMODB.md`.

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ STORAGE DOMAIN           │ ENTITIES & SCOPE                                 │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Organizations         │ Tenant profiles, enterprise settings, contacts.  │
│ 2. Users & Personnel     │ Authenticated profiles, roles, contact numbers.  │
│ 3. Roles & Permissions   │ RBAC matrices, granular capability scopes.       │
│ 4. Worksites             │ Geographic coordinates, shade/cooling assets.    │
│ 5. Shifts & Rosters      │ Shift hours, assigned worker counts, workloads.  │
│ 6. Weather Records       │ Ingested raw, normalized, and validated records. │
│ 7. Risk Assessments      │ Calculated risk runs, input factors, rule v#.    │
│ 8. Actions               │ Active and historical mitigation directives.     │
│ 9. Notifications         │ Dispatched supervisor and manager alert records. │
│ 10. Acknowledgments      │ Signed confirmation records with user metadata.  │
│ 11. Escalations          │ Active timeout trackers, breach events, alerts.  │
│ 12. Audit Events         │ Immutable append-only operational event history. │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 7. Event Architecture & Domain Event Flow

Domain events enable decoupled communication across application boundaries without brittle point-to-point HTTP dependencies.

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE DOMAIN EVENT CATALOG                       │
├──────────────────────────┬─────────────────────────────────────────────┤
│ EVENT NAME               │ EMISSION TRIGGER & PURPOSE                  │
├──────────────────────────┼─────────────────────────────────────────────┤
│ `WEATHER_REFRESHED`      │ New weather observation ingested & validated│
│ `DATA_QUALITY_CHANGED`   │ Weather shifted quality (e.g. VALID->STALE) │
│ `RISK_ASSESSED`          │ Risk engine produced new site evaluation    │
│ `ACTION_CREATED`         │ Action engine generated required directive  │
│ `ACTION_ASSIGNED`        │ Action linked to designated supervisor      │
│ `NOTIFICATION_DISPATCHED`│ Push/SMS/in-app alert emitted               │
│ `ACTION_ACKNOWLEDGED`    │ Supervisor confirmed receipt & ownership    │
│ `ACTION_UPDATED`         │ Execution progress or field note recorded   │
│ `VERIFICATION_REQUIRED`  │ Physical implementation marked complete     │
│ `ACTION_VERIFIED`        │ Authorized manager signed off closure       │
│ `ESCALATION_TRIGGERED`   │ Response SLA breached; manager alerted      │
│ `ESCALATION_RESOLVED`    │ Escalation dismissed following mitigation   │
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Event Routing Topology
* **Ingestion:** Services emit standard JSON domain events via Amazon EventBridge.
* **Routing Rules:** EventBridge rules filter and route events to target AWS Lambda consumer functions (e.g., `ACTION_CREATED` routes to `NotificationDispatcherLambda`).
* **Dead-Letter Handling:** Failed event deliveries route to Amazon SQS Dead-Letter Queues (DLQs) with CloudWatch alarms for operational triage.

---

## 8. Workflow Orchestration: Synchronous vs. Asynchronous

The architecture establishes a strict policy regarding when to execute synchronously versus when to orchestrate asynchronously:

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ SYNCHRONOUS HTTP REST (Fast API)  │ ASYNCHRONOUS WORKFLOWS (Events)   │
├───────────────────────────────────┼───────────────────────────────────┤
│ • User login and profile check    │ • Periodic weather feed ingestion │
│ • Fetching current worksite state │ • Multi-site risk evaluations     │
│ • Fetching active action cards    │ • Multi-channel notification fan-out│
│ • Supervisor tapping Acknowledge  │ • Escalation timer tracking       │
│ • Manager tapping Verify Action   │ • Long-term compliance archiving  │
│ • Reading compliance audit logs   │ • AI explanation generation       │
└───────────────────────────────────┴───────────────────────────────────┘
```

*Guideline:* Simple user interactions must never be blocked by complex asynchronous event queues. A supervisor acknowledging an action receives an immediate synchronous HTTP 200 confirmation, while the background fan-out (audit logging, dashboard event broadcast) processes asynchronously.

---

## 9. Core User Request / Response Flow

```text
SUPERVISOR ON MOBILE PWA
          │
          ▼
HTTPS REQUEST: POST /api/v1/actions/{id}/acknowledge
          │
          ▼
AMAZON API GATEWAY
          │
          ├─► Validates TLS & Request Schema
          ├─► Validates Cognito JWT Signature & Expiration
          │
          ▼
AWS LAMBDA (API Handler)
          │
          ├─► Extracts Authenticated User Claims (Role: SUPERVISOR)
          ├─► Verifies Worksite Scope (Is user assigned to Worksite?)
          ├─► ActionService.acknowledgeAction(id, user)
          │        │
          │        ▼
          │   DYNAMODB: Atomic Conditional Write
          │   Condition: attribute_exists(id) AND status = 'PENDING_ACK'
          │   Update: status = 'ACKNOWLEDGED', ack_user = user.id, ack_time = NOW
          │        │
          │        ▼
          ├─► Emits Event: ACTION_ACKNOWLEDGED to EventBridge
          ├─► Appends Record: AuditService.logEvent(...)
          │
          ▼
HTTP 200 OK RESPONSE RETURNED TO PWA (<150ms)
          │
          ▼
PWA TRANSITIONS ACTION CARD: "Acknowledged • In Progress"
```

---

## 10. Weather Telemetry Ingestion Flow

```text
AMAZON EVENTBRIDGE CRON RULE (Every 60 minutes or on demand)
                      │
                      ▼
AWS LAMBDA: WeatherIngestorLambda
                      │
                      ├─► Fetch Forecast & Observations from Open-Meteo
                      ├─► Fetch Official Observations from IMD (where avail)
                      │
                      ▼
DATA NORMALIZER & PARSER
                      │
                      ▼
DATA VALIDATION FILTER (`36_DATA_VALIDATION.md`)
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ PASSES VALIDATION ]      [ VALIDATION FAILED ]
Quality: VALID             Quality: INVALID / MISSING
                      │                     │
                      └─────────────┬───────┘
                                    │
                                    ▼
DYNAMODB: Save WeatherRecord { worksite_id, timestamp, quality, params }
                                    │
                                    ▼
EMIT DOMAIN EVENT: WEATHER_REFRESHED
```

---

## 11. Deterministic Heat-Risk Processing Flow

```text
EVENT: WEATHER_REFRESHED (or Shift Transition Trigger)
                      │
                      ▼
AWS LAMBDA: RiskEngineLambda
                      │
                      ├─► Retrieve latest validated WeatherRecord
                      ├─► Retrieve active Worksite Profile & Shift Roster
                      ├─► Extract Workload (Metabolic rate), Shading, Acclimatization
                      │
                      ▼
EXECUTE DETERMINISTIC RISK RULES (`27_RISK_RULES.md`)
                      │
                      ▼
CALCULATE RISK SCORE & MAP TO LEVEL:
[ LOW | MODERATE | HIGH | CRITICAL | UNKNOWN ]
                      │
                      ▼
DYNAMODB: Store RiskAssessment { assessment_id, site_id, level, factors, rule_v }
                      │
                      ▼
EMIT DOMAIN EVENT: RISK_ASSESSED
```

---

## 12. Action Generation & Assignment Flow

```text
EVENT: RISK_ASSESSED (Level: HIGH or CRITICAL)
                      │
                      ▼
AWS LAMBDA: ActionEngineLambda
                      │
                      ├─► Retrieve Risk Assessment & Site Infrastructure
                      ├─► Match against Deterministic Action Rules (`41_ACTION_RULES.md`)
                      ├─► Contextualize Actions (`42_SITE_SPECIFIC_ACTIONS.md`):
                      │   - Water points present? -> Dispense Electrolytes
                      │   - Heavy outdoor task? -> Enforce 30m Shade Rest
                      ├─► Deduplicate against active existing actions
                      ├─► Resolve on-duty Field Supervisor for active shift
                      │
                      ▼
DYNAMODB: Insert ActionRecord { action_id, site_id, assigned_to, status: PENDING_ACK, sla_ack }
                      │
                      ▼
EMIT DOMAIN EVENT: ACTION_CREATED & ACTION_ASSIGNED
```

---

## 13. Acknowledgment, Escalation & Verification Flow

```text
ACTION CREATED (SLA: Acknowledgment required within 15 minutes)
                     │
                     ├─────────────────────────────────────────┐
                     ▼                                         ▼
            SUPERVISOR ACKNOWLEDGES                   NO ACKNOWLEDGMENT
                     │                                         │
                     ▼                                         ▼
         Status: ACKNOWLEDGED                         15-MINUTE TIMER EXPIRES
                     │                                         │
                     ▼                                         ▼
         Physical execution begins                    ESCALATION TRIGGERED
                     │                                         │
                     ▼                                         ▼
         SUPERVISOR REQUESTS VERIFICATION             Status: ESCALATED
                     │                                         │
                     ▼                                         ▼
         SAFETY MANAGER INSPECTS & CONFIRMS           ALERT DISPATCHED TO
                     │                                SAFETY MANAGER
                     ▼                                         │
         Status: VERIFIED & CLOSED                             ▼
                     │                                SAFETY MANAGER INTERVENES
                     └────────────────────┬────────────────────┘
                                          │
                                          ▼
                             IMMUTABLE AUDIT LOG UPDATED
```

---

## 14. Immutable Audit Architecture

Every safety-critical state change is captured as a permanent, structured audit entry:

```json
{
  "audit_id": "aud_01JXYZ9923KMN",
  "timestamp": "2026-10-07T14:20:00.123Z",
  "org_id": "org_infra_corp",
  "worksite_id": "site_blr_north_01",
  "event_type": "ACTION_ACKNOWLEDGED",
  "actor_id": "usr_sup_rahul",
  "actor_role": "SUPERVISOR",
  "resource_type": "ACTION",
  "resource_id": "act_88219",
  "rule_version": "action_rules_v1.2",
  "is_simulation": false,
  "state_before": { "status": "PENDING_ACKNOWLEDGMENT" },
  "state_after": { "status": "ACKNOWLEDGED", "ack_timestamp": "2026-10-07T14:20:00Z" }
}
```

Audit records are append-only. No user, regardless of administrative privilege, can alter or delete historical audit entries.

---

## 15. Authentication & Authorization (RBAC)

Access control is strictly enforced on the server using structured Role-Based Access Control:

```text
┌─────────────────┬────────────────────────────────────────────────────────┐
│ ROLE            │ PERMITTED CAPABILITIES & WORKSPACE BOUNDARIES          │
├─────────────────┼────────────────────────────────────────────────────────┤
│ ADMINISTRATOR   │ Manage organizations, worksite configs, user roles,    │
│                 │ compliance audit export, system configurations.        │
├─────────────────┼────────────────────────────────────────────────────────┤
│ SAFETY MANAGER  │ Multi-site monitoring, escalation handling, action     │
│                 │ verification, manual hazard overrides, shift audits.   │
├─────────────────┼────────────────────────────────────────────────────────┤
│ SUPERVISOR      │ View assigned worksite, acknowledge assigned actions,  │
│                 │ submit execution progress, report field disruptions.   │
└─────────────────┴────────────────────────────────────────────────────────┘
```

*Server Authority Mandate:* The backend **never** relies on client-side routing, hidden UI elements, or frontend token parsing for security. Every API request validates authorization against the target resource's `worksite_id` and `org_id`.

---

## 16. AI Architecture Boundary & Isolation

Artificial Intelligence (powered by NVIDIA NIM / supported models) operates strictly as a read-only assistance layer:

```text
┌─────────────────────────────────────────────────────────────┐
│                 AUTHORITATIVE DATABASE                      │
│        (Validated Risk, Active Actions, Audit Log)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured JSON Context
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               AI ASSISTANCE ADAPTER SERVICE                 │
│  - Restricts context to user's authorized worksites         │
│  - Assembles prompt with strict system guardrails           │
└──────────────────────────────┬──────────────────────────────┘
                               │ Grounded Prompt
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             NVIDIA AI / NIM MODEL RUNTIME                   │
│  - Generates natural language explanation                   │
│  - Translates directives into regional languages            │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw AI Response
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                OUTPUT VALIDATION GUARDRAILS                 │
│  - Validates zero hallucinated medical advice               │
│  - Verifies factual alignment with deterministic risk level │
└──────────────────────────────┬──────────────────────────────┘
                               │ Safe Natural Language
                               ▼
                       USER INTERFACE
```

### Prohibited AI Actions:
* Overriding a deterministic risk assessment.
* Suppressing a mandatory safety break.
* Canceling an active escalation timer.
* Clearing or verifying a workplace action.

---

## 17. System Failure Architecture & Resilience

```text
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ FAILURE VECTOR           │ DETECTION MECHANISM      │ RESILIENCE BEHAVIOR      │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Weather Provider Timeout │ HTTP 504 / Connection    │ Retry with backoff; mark │
│ (Open-Meteo down)        │ dropped in Ingestor      │ state as STALE; preserve │
│                          │                          │ conservative safeguards. │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ DynamoDB Throttling      │ ProvisionedThroughput    │ Exponential jitter retry;│
│                          │ ExceededException        │ on-demand billing config.│
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Push / Notification Drop │ Service worker timeout / │ In-app persistent queue  │
│                          │ Cellular disconnection   │ remains authoritative;   │
│                          │                          │ escalation SLA continues.│
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ AI Service Disruption    │ NVIDIA API 500 / timeout │ Fall back to standard    │
│                          │                          │ deterministic templates; │
│                          │                          │ core workflows unbroken. │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Browser Client Offline   │ Service worker offline   │ PWA renders last known   │
│                          │ event detected           │ state + STALE warnings;  │
│                          │                          │ queues actions locally.  │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 18. Observability & Telemetry

Operational health is monitored through four standardized telemetry dimensions:
* **Structured JSON Logging:** CloudWatch Logs captures every incoming request, domain event, and background execution with correlation IDs (`request_id`, `worksite_id`, `org_id`).
* **Operational Metrics:** CloudWatch Metrics tracks API latencies, Lambda invocation error counts, and DynamoDB read/write capacities.
* **Escalation Alarms:** Automated alarms notify engineering if escalation breach rates or data-quality drops spike across the system.
* **Traceability:** Distributed tracing hooks (AWS X-Ray ready) ensure end-to-end request visibility from API Gateway through Lambda to DynamoDB.

---

## 19. Security Architecture

Aligned with enterprise safety standards:
* **Encryption Everywhere:** TLS 1.3 enforced for all client-to-API and inter-service communications; AES-256 server-side encryption at rest across all DynamoDB tables and logs.
* **Secrets Management:** External weather API keys, database credentials, and AI endpoint tokens are managed exclusively via AWS Secrets Manager.
* **Tenant Isolation:** Enforced cryptographically and relationally; no query can execute across partition boundaries without explicit multi-tenant authorization.

---

## 20. Scalability & Operational Tradeoffs

### Architectural Advantages:
* **Serverless Elasticity:** Automatically scales from 1 worksite during night shifts to 10,000 worksites during severe afternoon heat emergencies.
* **Zero Idle Compute Costs:** When weather is stable and shifts are inactive, resource consumption drops to baseline levels.

### Managed Tradeoffs:
* **Cold Starts:** Mitigated by keeping Lambda bundle sizes lean (<15MB) using esbuild and avoiding heavy runtime dependencies.
* **Eventual Consistency:** Managed by executing all safety-critical status updates via DynamoDB strongly consistent reads and transactional conditional writes.

---

## 21. MVP vs. Future Architecture Evolution

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ HACKATHON MVP ARCHITECTURE        │ FUTURE ENTERPRISE ARCHITECTURE    │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Modular Node.js / Lambda backend│ • Fine-grained microservices      │
│ • DynamoDB single/multi table     │ • Multi-region DynamoDB Global    │
│ • Open-Meteo + IMD scheduled cron │ • Real-time IoT sensor mesh feeds │
│ • EventBridge scheduled rules     │ • Advanced Step Functions workflows│
│ • In-app + basic email alerts     │ • Multi-channel WhatsApp/SMS/Voice│
│ • React PWA on S3/CloudFront      │ • Dedicated native mobile apps    │
│ • NVIDIA AI contextual assistance │ • On-premise air-gapped LLM NIMs  │
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 22. Architecture Principles Summary

1. **Backend is authoritative:** The server owns operational truth at all times.
2. **Safety decisions are deterministic:** Pure math and explicit rules drive risk and actions.
3. **Data provenance is preserved:** Every reading records its origin, observation time, and quality.
4. **Unknown is never safe:** Missing data triggers vigilance, never reassurance.
5. **Forecast is not observation:** Predictions and physical measurements are distinctly labeled.
6. **AI assists; it does not decide:** Explanations are AI-assisted; safety policies are deterministic.
7. **Frontend never duplicates business logic:** The UI renders state and captures user intent.
8. **Authorization is server-enforced:** RBAC checks occur before every database write.
9. **Every important action is traceable:** Immutable audit records ensure complete accountability.
10. **Failures remain visible:** Sensor and network dropouts are honestly exposed to the user.
11. **Simulation remains isolated:** Training drills never contaminate production records.
12. **MVP complexity must remain justified by product value:** Elegance and simplicity take precedence over architectural over-engineering.
