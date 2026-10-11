# API Architecture Specification

**Document ID:** `63_API_ARCHITECTURE`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

The purpose of this specification is to define the authoritative Application Programming Interface (API) architecture for the Heat Action Response Engine. It governs how client applications (React PWA, mobile field views, safety management consoles) and internal backend services communicate.

This document establishes:
* The RESTful and command-oriented API architectural style.
* The API request lifecycle, authentication gates, and server-side authorization boundaries.
* Resource hierarchy, URI conventions, query parameters, and pagination strategies.
* Standardized request/response envelopes, error serialization, and HTTP status codes.
* Concurrency controls, idempotency protocols, and safety-critical state transition enforcement.
* Real-time event and AI assistance integration boundaries.

*Note:* Detailed individual endpoint schema contracts (payload fields, specific parameters, and request/response examples) are codified in `70_API_CONTRACTS.md` through `79_ERROR_CONTRACTS.md`. This document establishes the governing architectural standards.

---

## 2. API Design Goals

The API is engineered around fourteen foundational operational goals:

1. **Clear & Predictable:** Clean, standard RESTful resource URIs with intuitive HTTP verb semantics.
2. **Strictly Resource-Oriented:** Resources model real-world operational entities (`worksites`, `actions`, `risks`, `notifications`).
3. **Command-Explicit for Safety:** Critical operational mutations employ explicit command sub-resources (`/acknowledge`, `/verify`, `/resolve`) rather than ambiguous partial updates.
4. **Server-Enforced Authorization:** Every request validates role, tenant organization, and worksite boundary on the backend before executing.
5. **Organization- & Worksite-Scoped:** Multi-tenant boundaries are impenetrable; cross-tenant data access is strictly prevented.
6. **Deterministic Backend Authority:** The API exposes server-computed risk levels and action mandates; it never accepts client-calculated safety assertions.
7. **Idempotent Critical Operations:** Repeated or retried acknowledgment and verification commands produce consistent, safe operational states without duplicate records.
8. **Concurrency-Safe:** Optimistic versioning prevents stale clients from overwriting updated field conditions.
9. **Fully Observable:** Correlation IDs (`requestId`, `correlationId`) track every call from the edge through services to database writes.
10. **Versioned:** Explicit URL versioning (`/api/v1/`) guarantees backward compatibility as mobile PWA versions update.
11. **Frontend-Optimized:** Ergonomic, lightweight JSON structures enabling rapid, sub-100ms client caching and minimal mobile bandwidth usage.
12. **Radically Failure-Transparent:** Structured error responses explain failure causes without leaking sensitive server internals or masking hazards.
13. **Strict Validation:** Comprehensive input schema validation rejects malformed coordinates, timestamps, or illegal payloads before domain execution.
14. **Audit-Integrated:** State-changing commands automatically trigger immutable compliance audit entries.

---

## 3. API Architectural Style

The platform adopts a **RESTful HTTP API** architecture augmented with **Explicit Domain Command Endpoints** for safety-critical workflows.

### 3.1 Standard RESTful Resource Operations
Standard entity lifecycles map to conventional HTTP verbs:
* `GET /api/v1/worksites`: Retrieve a collection of authorized worksites.
* `GET /api/v1/worksites/{id}`: Retrieve a specific worksite profile.
* `POST /api/v1/worksites`: Create a new worksite (Admin only).
* `PUT /api/v1/worksites/{id}`: Replace or update worksite parameters.
* `DELETE /api/v1/worksites/{id}`: Decommission/archive a worksite.

### 3.2 Explicit Domain Command Endpoints
In an occupational life-safety system, updating an action's state is not a generic database property mutation—it represents a legally binding operational commitment. Generic `PATCH /actions/{id}` requests containing arbitrary JSON fragments introduce ambiguity and state-machine bypass vulnerabilities.

Therefore, the API mandates explicit, action-oriented command endpoints:
```text
POST /api/v1/actions/{actionId}/acknowledge   # Supervisor confirms operational responsibility
POST /api/v1/actions/{actionId}/start         # Execution commenced on site
POST /api/v1/actions/{actionId}/verify        # Safety Manager inspects & signs off closure
POST /api/v1/escalations/{escalationId}/resolve # Safety Manager marks escalation resolved
```

### Advantages of Command Endpoints:
* **Strict Semantic Validation:** The handler enforces exact preconditions for that specific transition.
* **Precise Authorization:** Differentiates between who can acknowledge (Supervisor) versus who can verify (Safety Manager).
* **Clear Audit Trail:** The command maps 1:1 with a named audit event (`ACTION_ACKNOWLEDGED`, `ACTION_VERIFIED`).

---

## 4. API Base Structure & Resource Hierarchy

All public and internal endpoints are prefixed under a major version path:
```text
/api/v1/
```

### Resource Organization
```text
/api/v1/
├── organizations/          # Tenant organization profiles (Admin)
├── users/                  # User accounts, profiles, preferences
├── worksites/              # Physical job sites & facilities
│   └── {worksiteId}/
│       ├── shifts/         # Active & scheduled worker shifts
│       ├── weather/        # Ingested & normalized weather telemetry
│       ├── risks/          # Authoritative heat risk assessments
│       ├── actions/        # Generated workplace mitigation actions
│       └── audit/          # Compliance audit trail for the worksite
├── actions/                # Global/Cross-site action querying & command execution
│   └── {actionId}/
│       ├── acknowledge     # Command: Acknowledge action
│       ├── start           # Command: Mark in-progress
│       └── verify          # Command: Sign-off verification
├── notifications/          # In-app alerts & delivery tracking
├── escalations/            # Unresolved action breaches & interventions
├── assistant/              # Grounded AI explanatory chat & summaries
└── health                  # System & service status health check
```

---

## 5. API Request Lifecycle

Every incoming HTTP request traverses a rigorous, sequential verification pipeline:

```text
CLIENT (Browser / Mobile PWA)
           │
           ▼ HTTPS (TLS 1.3)
AMAZON API GATEWAY
           │
           ├─► Request Rate Limiting & Throttling Check
           ├─► TLS Termination & CORS Policy Validation
           ├─► API Gateway Lambda Authorizer (Cognito JWT Verification)
           │
           ▼ (Authorized Request with Valid Token)
AWS LAMBDA API HANDLER
           │
           ├─► 1. Extract Identity & Context:
           │      `user_id`, `org_id`, `role` from verified JWT claims
           │
           ├─► 2. Server-Side Scope Authorization:
           │      Validate user belongs to target `org_id` and assigned `worksite_id`
           │
           ├─► 3. Request Schema & Payload Validation:
           │      Validate query params and JSON body against OpenAPI schemas
           │
           ├─► 4. Application Service Execution:
           │      Pass valid command to Domain Layer (e.g. `ActionService.acknowledge`)
           │
           ├─► 5. Deterministic State Machine Validation:
           │      Confirm resource exists and transition is legally permitted
           │
           ├─► 6. Data Store Atomic Mutation:
           │      Execute conditional write in Amazon DynamoDB
           │
           ├─► 7. Event & Audit Emission:
           │      Emit EventBridge domain event; write immutable audit entry
           │
           ▼
FORMAT ENVELOPE RESPONSE (HTTP 200/201/4xx/5xx)
           │
           ▼
CLIENT RECEIVES AUTHORITATIVE CONFIRMATION
```

*Architectural Mandate:* Authentication and authorization must execute **before** any protected worksite or personnel record is accessed or modified.

---

## 6. Authentication Architecture

The API requires standard Bearer token authentication over secure HTTPS.

```text
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### Identity Provider Integration [PENDING VERIFICATION]
* **Target Provider:** Amazon Cognito User Pools or verified OIDC/OAuth2 identity service.
* **Token Characteristics:**
  * Signed JSON Web Token (JWT) utilizing RS256 asymmetric cryptography.
  * Short-lived access tokens (standard 60-minute expiration) with secure refresh token rotation.
  * Public keys cached at API Gateway edge for rapid, zero-database verification latency.

### Token Claims Payload Schema
```json
{
  "sub": "usr_sup_rahul_102",
  "iss": "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_example",
  "exp": 1791388800,
  "iat": 1791385200,
  "email": "rahul.kumar@infracorp.example",
  "custom:org_id": "org_infra_corp",
  "custom:role": "SUPERVISOR",
  "custom:worksites": ["site_blr_north_01", "site_blr_west_04"]
}
```

---

## 7. Server-Side Role-Based Authorization (RBAC)

Authorization is strictly enforced by the backend on every invocation. Client-side routing, hidden UI controls, or user-supplied role parameters are **never trusted**.

```text
┌─────────────────┬────────────────────────────────────────────────────────┐
│ ROLE            │ API ACCESS SCOPE & PERMISSIONS                         │
├─────────────────┼────────────────────────────────────────────────────────┤
│ `ADMINISTRATOR` │ Full read/write within tenant organization: create     │
│                 │ worksites, configure thresholds, export audits.        │
├─────────────────┼────────────────────────────────────────────────────────┤
│ `SAFETY_MANAGER`│ Multi-site oversight within organization: inspect risk,│
│                 │ verify actions, resolve escalations, manual overrides. │
├─────────────────┼────────────────────────────────────────────────────────┤
│ `SUPERVISOR`    │ Restricted strictly to assigned worksites: view risk,  │
│                 │ acknowledge assigned actions, update progress.         │
└─────────────────┴────────────────────────────────────────────────────────┘
```

### Tri-Fold Scope Validation
Every protected handler enforces three nested security boundaries:
1. **Tenant Isolation:** `request.org_id === token.org_id`.
2. **Worksite Authorization:** `user.worksites.includes(request.worksite_id) || user.role === 'SAFETY_MANAGER'`.
3. **Role Capability Check:** Confirms the user's role is authorized to execute the specific HTTP method or command.

---

## 8. Multi-Tenant Resource Hierarchy

Resources form a strict ownership hierarchy rooted in the Tenant Organization:

```text
Organization (Tenant Boundary)
   │
   ├── Users & Role Assignments
   │
   ├── Worksites (Geographic Boundaries)
   │     ├── Shifts & Rosters
   │     ├── Ingested Weather History
   │     ├── Risk Assessments
   │     ├── Action Directives
   │     └── Escalation Instances
   │
   └── Master Audit Log (Append-Only)
```

No API route permits querying a resource across organization boundaries without an explicit, validated tenant partition key.

---

## 9. Read vs. Command API Patterns

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ READ APIS (GET)                   │ COMMAND APIS (POST / PUT)         │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Cacheable with `ETag` headers   │ • Non-cacheable                   │
│ • Zero side-effects on state      │ • Explicit domain side-effects    │
│ • Strongly or eventually consistent│ • Strongly consistent reads/writes│
│ • Supports cursor pagination      │ • Requires conditional checks     │
│ • Example: `GET /worksites/{id}`  │ • Example: `POST /actions/{id}/ack`│
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 10. Safety-Critical State Machine Enforcement

The API is the absolute enforcer of legal state transitions. State machines are codified on the server and cannot be bypassed:

### Action Lifecycle State Machine
```text
┌──────────────┐      POST /acknowledge      ┌──────────────┐
│ PENDING_ACK  │ ──────────────────────────> │ ACKNOWLEDGED │
└──────────────┘                             └──────┬───────┘
        │                                           │
        │ Timeout (SLA Breach)                      │ POST /start
        ▼                                           ▼
┌──────────────┐                             ┌──────────────┐
│  ESCALATED   │                             │ IN_PROGRESS  │
└──────────────┘                             └──────┬───────┘
        │                                           │
        │ Manager Intervention                      │ POST /request-verification
        ▼                                           ▼
┌──────────────┐                             ┌──────────────────────┐
│ ACKNOWLEDGED │                             │ VERIFICATION_PENDING │
└──────────────┘                             └──────┬───────────────┘
                                                    │
                                                    │ POST /verify
                                                    ▼
                                             ┌──────────────┐
                                             │   VERIFIED   │
                                             └──────────────┘
```

### Transition Enforcement Rules
* If a supervisor attempts to call `POST /actions/{id}/acknowledge` on an action that is already `VERIFIED`, the API rejects the request with `409 Conflict`.
* If a supervisor attempts to call `POST /actions/{id}/verify`, the API rejects the request with `403 Forbidden` because verification requires the `SAFETY_MANAGER` role.
* The API returns an explicit error payload explaining the transition conflict.

---

## 11. Request Validation Protocol

All incoming request payloads, URL parameters, and query strings undergo strict schema validation:
* **Numerical Bounds:** Geographic coordinates must fall within valid lat/long ranges (`-90` to `+90`, `-180` to `+180`); temperatures, humidities, and wind speeds must be physically plausible.
* **Enumerated Values:** Risk levels (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), action types, and roles must match recognized domain enums.
* **ISO 8601 Timestamps:** All date-time inputs must be valid UTC strings (e.g., `2026-10-07T14:20:00Z`).
* **Stripping Client-Injected Meta:** The API strips client-supplied fields such as `risk_level`, `created_at`, `rule_version`, or `org_id` to prevent spoofing.

---

## 12. Standardized Response Envelope Structure

All successful API responses adhere to a consistent JSON envelope pattern:

### 12.1 Single Resource Response
```json
{
  "data": {
    "action_id": "act_88219",
    "worksite_id": "site_blr_north_01",
    "action_type": "MANDATORY_HYDRATION_BREAK",
    "priority": "HIGH",
    "status": "ACKNOWLEDGED",
    "assigned_to": "usr_sup_rahul",
    "acknowledged_at": "2026-10-07T14:20:00Z"
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "resource_version": 2
  }
}
```

### 12.2 Collection Response (Paginated)
```json
{
  "data": [
    { "action_id": "act_88219", "priority": "HIGH" },
    { "action_id": "act_88220", "priority": "MODERATE" }
  ],
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "total_count": 2,
    "next_cursor": "eyJzdGFydEtleSI6ICJhY3RfODgyMjAifQ=="
  }
}
```

---

## 13. Standardized Error Contract

Errors return structured, actionable JSON payloads conforming to `79_ERROR_CONTRACTS.md`:

```json
{
  "error": {
    "code": "ACTION_STATE_CONFLICT",
    "message": "Action cannot be acknowledged because it is currently in ESCALATED state.",
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "retryable": false,
    "details": {
      "current_status": "ESCALATED",
      "expected_status": "PENDING_ACKNOWLEDGMENT",
      "action_id": "act_88219"
    }
  }
}
```

*Security Mandate:* Error payloads **never** expose stack traces, database table names, internal IP addresses, or sensitive credentials.

---

## 14. HTTP Status Code Philosophy

The API applies HTTP status codes according to their strict standard semantics:

```text
┌──────┬────────────────────────┬────────────────────────────────────────┐
│ CODE │ MEANING                │ OPERATIONAL APPLICATION                │
├──────┼────────────────────────┼────────────────────────────────────────┤
│ 200  │ OK                     │ Successful GET, PUT, or Command POST.  │
│ 201  │ Created                │ Successful POST entity creation.       │
│ 204  │ No Content             │ Successful DELETE or empty operation.  │
│ 400  │ Bad Request            │ Malformed JSON, missing required field.│
│ 401  │ Unauthorized           │ Missing, invalid, or expired JWT.      │
│ 403  │ Forbidden              │ Valid JWT, but insufficient role/scope.│
│ 404  │ Not Found              │ Resource ID does not exist in tenant.  │
│ 409  │ Conflict               │ State conflict (e.g. Action already ack│
│      │                        │ or optimistic lock version mismatch).  │
│ 422  │ Unprocessable Entity   │ Syntactically valid JSON, but violates │
│      │                        │ domain rule (e.g. invalid coordinates).│
│ 429  │ Too Many Requests      │ Rate limit or throttle exceeded.       │
│ 500  │ Internal Server Error  │ Unhandled internal server exception.   │
│ 502  │ Bad Gateway            │ External upstream weather API failed.  │
│ 503  │ Service Unavailable    │ Temporary maintenance or severe outage.│
└──────┴────────────────────────┴────────────────────────────────────────┘
```

---

## 15. Idempotency Protocol

Field supervisors operating on spotty cellular networks often experience connection drops after sending an acknowledgment. When the device retries, duplicate submissions must not corrupt state or log false duplicate actions.

### Implementation Protocol
* Clients submitting command operations provide an `Idempotency-Key` header containing a UUID:
  ```text
  Idempotency-Key: 7b5a8c2d-9e1f-4b3a-8c7d-6e5f4a3b2c1d
  ```
* The API handler stores the execution result in DynamoDB keyed by `idempotency_key` with a 24-hour TTL.
* If a duplicate request arrives with the same key, the API immediately returns the cached response with zero duplicate processing.

---

## 16. Optimistic Concurrency Control

To prevent race conditions when multiple safety managers or supervisors access the same worksite:
* Resources include a monotonic integer attribute: `resource_version`.
* Mutating requests submit the expected version:
  ```text
  If-Match: "2"
  ```
  *(or via payload attribute: `"expected_version": 2`)*
* DynamoDB performs an atomic conditional write:
  `attribute_exists(id) AND resource_version = :expected_version`
* If a concurrent update incremented the version to `3`, the write fails and the API returns `409 Conflict`, prompting the client to refresh its state.

---

## 17. Cursor-Based Pagination

For high-volume collections (Actions, Weather records, Audit logs):
* The API uses opaque, base64-encoded cursor tokens (`next_cursor`) representing DynamoDB `LastEvaluatedKey` offsets.
* Off-limits: Offset-based pagination (`?offset=500`) is prohibited due to performance degradation and inconsistent windowing on dynamic operational datasets.
* Default limit: 50 items; Maximum limit: 200 items.

---

## 18. Filtering, Sorting & Query Conventions

Query parameters follow strict, predictable naming conventions:
* Filtering: `?status=PENDING_ACK&priority=HIGH&shift_id=shift_day_01`
* Time Ranges: `?from=2026-10-07T00:00:00Z&to=2026-10-07T18:00:00Z`
* Pagination: `?limit=50&cursor=eyJ...`
* Sorting: Standard sort orders default to descending timestamp (newest records first).

*Security Enforcement:* Query filters can never expand a user's authorized scope beyond their assigned worksites.

---

## 19. Time, Date & Timezone Standards

* **Transport Standard:** All timestamps in JSON payloads, headers, and query parameters are formatted strictly in **UTC ISO 8601** format with millisecond precision:
  `"2026-10-07T14:20:00.123Z"`
* **Local Operational Time:** Worksite profiles maintain an explicit IANA timezone string:
  `"timezone": "Asia/Kolkata"`
* **Display Conversion:** The client interface converts UTC timestamps to the worksite's local operational timezone for shift management, avoiding ambiguity.

---

## 20. External Weather Provider API Boundary

The API shields frontend clients from messy, provider-specific weather payloads:
* The client never interacts directly with Open-Meteo or IMD.
* The API exposes a clean, normalized internal model (`33_WEATHER_DATA_MODEL.md`):
  `GET /api/v1/worksites/{id}/weather/current`
  `GET /api/v1/worksites/{id}/weather/forecast`
* Response explicitly includes data provenance:
  `"provenance": { "provider": "OPEN_METEO", "station": "AWS-04", "quality": "VALID", "observation_age_mins": 14 }`

---

## 21. Heat-Risk API Boundary

The Risk API provides the single source of truth for operational heat risk:
* Endpoint: `GET /api/v1/worksites/{id}/risk/current`
* The response delivers the authoritative assessment:
  ```json
  {
    "risk_level": "HIGH",
    "assessment_timestamp": "2026-10-07T14:05:00Z",
    "data_quality": "VALID",
    "heat_index_c": 43.8,
    "primary_factors": ["HIGH_SOLAR_EXPOSURE", "HEAVY_METABOLIC_WORKLOAD"],
    "rule_version": "v1.2",
    "explanation": "Calculated heat index of 43.8°C exceeds safe threshold for heavy construction tasks under direct sunlight."
  }
  ```
* The frontend renders this record directly without recalculating or modifying the rating.

---

## 22. Action Engine API Boundary

The Action API delivers clear, unambiguous mitigation mandates:
* Query: `GET /api/v1/worksites/{id}/actions?status=PENDING_ACK`
* Mandate: Every action record exposes its priority, legal owner, acknowledgment deadline SLA, and execution instructions.
* Commands: Supervisors transition actions via dedicated command routes (`/acknowledge`, `/start`).

---

## 23. Real-Time Event & API Boundary

REST APIs and real-time events operate in close coordination:
1. REST provides the initial, authoritative snapshot on page load (`GET /api/v1/worksites/{id}/dashboard`).
2. Event channels (SSE / WebSocket) deliver lightweight invalidation signals (`RISK_UPDATED`, `ACTION_CREATED`).
3. The client receives the event and initiates a background REST refetch to retrieve the full, verified payload.
4. *Principle:* A lightweight push event signals that state has changed; the authoritative REST API delivers the validated source of truth.

---

## 24. AI Assistance API Boundary

AI interactions operate through a dedicated, authorized endpoint:
* Route: `POST /api/v1/assistant/chat`
* Payload:
  ```json
  {
    "worksite_id": "site_blr_north_01",
    "prompt": "Why was a hydration break ordered for my shift?"
  }
  ```
* Backend Protocol:
  1. Verifies user authorization for `site_blr_north_01`.
  2. Injects authoritative risk and action context into the system prompt.
  3. Queries NVIDIA AI / NIM model.
  4. Filters output against strict guardrails (`46_AI_GUARDRAILS.md`).
  5. Returns safe, grounded explanation.

---

## 25. Compliance Audit API Boundary

The compliance audit trail is accessible exclusively to authorized personnel:
* Route: `GET /api/v1/worksites/{id}/audit`
* Access: Restricted to `SAFETY_MANAGER` and `ADMINISTRATOR` roles.
* Nature: Read-only. There are **zero** API routes that permit updating, overwriting, or deleting historical audit entries.

---

## 26. API Security Architecture

Comprehensive defense-in-depth principles protect all API routes:
* **Strict Transport Security:** Enforced TLS 1.3 with HSTS headers (`Strict-Transport-Security`).
* **Rate Limiting:** Managed at API Gateway edge (Default: 100 requests/second per IP; 500 requests/minute per authenticated user).
* **Payload Size Limits:** Max request body size capped at $1\text{ MB}$ to prevent buffer exhaustion attacks.
* **CORS Policies:** Restricts origin access strictly to authorized web domains.
* **Content Security:** Enforces `application/json` content-type verification; rejects unexpected MIME types.

---

## 27. API Observability & Tracing

Every API interaction leaves a traceable operational fingerprint:
* **Correlation Headers:** Every response echoes `X-Request-Id` and `X-Correlation-Id`.
* **Structured Logs:** Handlers emit JSON log lines to CloudWatch capturing HTTP method, path, status, latency (ms), actor ID, role, and tenant organization ID.
* **Sensitive Redaction:** Authorization tokens, passwords, and PII are redacted before log emission.

---

## 28. API Versioning Policy

* **URI Versioning:** The major version is embedded directly in the path (`/api/v1/`).
* **Non-Breaking Changes:** Adding optional fields, new endpoints, or expanding metadata occurs within the current `/v1/` path.
* **Breaking Changes:** Removing fields, altering state transition semantics, or modifying authentication schemas requires publishing `/api/v2/` with a formal migration window.

---

## 29. API Failure Principles

1. **Never fake success:** If an acknowledgment write fails, return a 5xx or 4xx error; never return a 200 with an uncommitted state.
2. **Never downgrade to low risk on error:** If weather telemetry fails, the API reports `DATA_STALE` or `DATA_MISSING`; it never returns `LOW_RISK`.
3. **AI failures must not break safety:** If NVIDIA AI times out, the API returns a structured fallback explanation using deterministic templates.

---

## 30. MVP Baseline vs. Future Roadmap

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ MVP RELEASE CAPABILITIES          │ FUTURE ROADMAP CAPABILITIES       │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Versioned RESTful API (/v1/)    │ • Bidirectional WebSocket API     │
│ • Cognito JWT Bearer Auth         │ • Public Third-Party Webhooks     │
│ • Role-based access control (RBAC)│ • Fine-grained OAuth Scopes       │
│ • Explicit action command routes  │ • GraphQL query endpoint          │
│ • Cursor-based pagination         │ • Dynamic client rate tiering     │
│ • Standardized error envelope     │ • Bulk action batch commands      │
│ • Idempotency key handling        │ • Advanced gRPC internal transport│
└───────────────────────────────────┴───────────────────────────────────┘
```
