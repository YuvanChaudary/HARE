# Master API Contracts Specification

**Document ID:** `70_API_CONTRACTS`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

This document defines the master API contract specification for the Heat Action Response Engine. It serves as the foundational interface agreement between all client applications (React/PWA frontend, field supervisor mobile clients, safety manager desktop portals) and the serverless AWS backend.

This specification establishes:
* Global protocol, transport, and URI path conventions.
* Standardized request and response envelope schemas.
* Global HTTP headers for security, tracing, concurrency, and idempotency.
* Universal query parameter standards (pagination, filtering, sorting).
* Status code mapping and client expectation semantics.
* The complete endpoint catalog linking to detailed domain specifications (`71` through `79`).

---

## 2. Global Protocol & URI Conventions

* **Protocol & Transport:** HTTPS over TLS 1.3. Unencrypted HTTP traffic is rejected at the API Gateway edge.
* **Data Format:** Standard JSON (`application/json; charset=utf-8`).
* **Base Path:** All endpoints are strictly versioned:
  ```text
  https://api.heataction.example/api/v1
  ```
* **Character Encoding:** UTF-8 throughout all request payloads, query strings, and response bodies.
* **Case Conventions:**
  * URIs: Lowercase hyphen-separated paths (`/api/v1/worksites/{worksite-id}/active-actions`).
  * JSON Properties: `snake_case` for all object keys and property names.
  * Enum Values: `SCREAMING_SNAKE_CASE` (e.g., `HIGH`, `PENDING_ACKNOWLEDGMENT`).

---

## 3. Global Request Headers

Clients must include the following headers on all API interactions:

```text
┌──────────────────────┬──────────┬────────────────────────────────────────────┐
│ HEADER               │ REQUIRED │ OPERATIONAL PURPOSE & FORMAT               │
├──────────────────────┼──────────┼────────────────────────────────────────────┤
│ `Authorization`      │ YES*     │ Standard Bearer token (`Bearer <JWT>`).    │
│                      │          │ (*Optional only on public `/health`).      │
├──────────────────────┼──────────┼────────────────────────────────────────────┤
│ `Content-Type`       │ YES**    │ Must be `application/json`.                │
│                      │          │ (**Required on POST, PUT, PATCH).          │
├──────────────────────┼──────────┼────────────────────────────────────────────┤
│ `X-Request-Id`       │ OPTIONAL │ Client-generated UUID for client tracing.  │
├──────────────────────┼──────────┼────────────────────────────────────────────┤
│ `Idempotency-Key`    │ CRITICAL │ Mandatory UUID for state-mutating commands │
│                      │          │ (`/acknowledge`, `/verify`, `/resolve`).   │
├──────────────────────┼──────────┼────────────────────────────────────────────┤
│ `If-Match`           │ OPTIONAL │ Monotonic resource version string for      │
│                      │          │ optimistic concurrency checks (`"3"`).     │
└──────────────────────┴──────────┴────────────────────────────────────────────┘
```

---

## 4. Global Response Envelope Architecture

All API responses adhere to an explicit, predictable JSON envelope structure to guarantee parsing reliability across mobile and desktop runtimes:

### 4.1 Single Resource Success Envelope (`200 OK`, `201 Created`)
```json
{
  "data": {
    "resource_id": "res_example_123",
    "name": "Resource Name"
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "resource_version": 1
  }
}
```

### 4.2 Collection Success Envelope (Cursor Paginated)
```json
{
  "data": [
    { "resource_id": "res_01" },
    { "resource_id": "res_02" }
  ],
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "count": 2,
    "next_cursor": "eyJzdGFydEtleSI6ICJyZXNfMDIifQ=="
  }
}
```

### 4.3 Standard Error Envelope (`4xx`, `5xx`)
```json
{
  "error": {
    "code": "ACTION_STATE_CONFLICT",
    "message": "Action cannot be acknowledged because it is currently ESCALATED.",
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "retryable": false,
    "details": {
      "current_status": "ESCALATED",
      "expected_status": "PENDING_ACKNOWLEDGMENT",
      "resource_id": "act_88219"
    }
  }
}
```

---

## 5. Standard HTTP Status Code Matrix

The API strictly implements standard HTTP status semantics:

```text
┌──────┬────────────────────────┬────────────────────────────────────────┐
│ CODE │ STATUS NAME            │ CONTRACTUAL APPLICATION                │
├──────┼────────────────────────┼────────────────────────────────────────┤
│ 200  │ OK                     │ Successful GET, PUT, or Command POST.  │
│ 201  │ Created                │ Successful entity creation.            │
│ 204  │ No Content             │ Successful deletion or empty command.  │
│ 400  │ Bad Request            │ Malformed JSON, schema violation.      │
│ 401  │ Unauthorized           │ Missing, invalid, or expired JWT.      │
│ 403  │ Forbidden              │ Valid token, but unauthorized scope.   │
│ 404  │ Not Found              │ Resource ID not found in tenant org.   │
│ 409  │ Conflict               │ State conflict or concurrency mismatch.│
│ 422  │ Unprocessable Entity   │ Structurally valid, domain rule broken.│
│ 429  │ Too Many Requests      │ Rate limit or throttle exceeded.       │
│ 500  │ Internal Server Error  │ Unhandled internal server exception.   │
│ 502  │ Bad Gateway            │ Upstream weather provider failure.     │
│ 503  │ Service Unavailable    │ Temporary outage or maintenance mode.  │
└──────┴────────────────────────┴────────────────────────────────────────┘
```

---

## 6. Global Query Parameter Conventions

Collections support standardized URL query parameters:
* **Pagination:**
  * `limit` (Integer, default `50`, maximum `200`): Maximum items returned.
  * `cursor` (Opaque base64 string): Pointer for next page evaluated key.
* **Time Range Filtering:**
  * `from` (ISO 8601 UTC string): e.g. `2026-10-07T00:00:00Z`.
  * `to` (ISO 8601 UTC string): e.g. `2026-10-07T23:59:59Z`.
* **State & Priority Filtering:**
  * `status`: Filter by state enum (e.g. `?status=PENDING_ACKNOWLEDGMENT`).
  * `priority`: Filter by priority enum (e.g. `?priority=HIGH`).
* **Sorting:**
  * Default: Chronological descending (`sort=desc`, newest first).

---

## 7. Authentication, RBAC & Scoping Contract

Every API invocation (except `/health`) validates identity and authorization:

```text
USER TOKEN
    │
    ▼
EXTRACT CLAIMS: { sub, org_id, role, assigned_worksites }
    │
    ▼
VALIDATE TENANT BOUNDARY: (resource.org_id === token.org_id)
    │
    ▼
VALIDATE WORKSITE BOUNDARY: (token.assigned_worksites.includes(site_id) || role === 'SAFETY_MANAGER')
    │
    ▼
VALIDATE ROLE CAPABILITY:
- ADMIN: Complete organizational management.
- SAFETY_MANAGER: Multi-site safety oversight, verification, escalations.
- SUPERVISOR: Assigned site viewing, action acknowledgment, execution progress.
```

---

## 8. Master Domain Endpoint Catalog

The Heat Action Response Engine exposes the following authoritative endpoint families:

```text
┌──────────────────────┬──────────────────────┬──────────────────────────────────┐
│ DOMAIN SPECIFICATION │ BASE ROUTE           │ CORE FUNCTIONALITY               │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 71_WEATHER_API       │ `/worksites/{id}/    │ Current telemetry, hourly forecast│
│                      │  weather`            │ runs, telemetry refresh triggers │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 72_WORKSITE_API      │ `/worksites`         │ Worksite profiles, shift rosters,│
│                      │                      │ facility cooling assets, dash    │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 73_RISK_API          │ `/worksites/{id}/    │ Authoritative heat risk levels,  │
│                      │  risks`              │ mathematical factor attribution  │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 74_ACTION_API        │ `/actions`           │ Preventive mitigation directives,│
│                      │                      │ site-specific action generation  │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 75_NOTIFICATION_API  │ `/notifications`     │ In-app alert feeds, delivery     │
│                      │                      │ receipts, unread badge counters  │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 76_ACKNOWLEDGMENT_API│ `/actions/{id}/      │ Supervisor legal acknowledgment, │
│                      │  acknowledge`        │ idempotency & state transitions  │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 77_ESCALATION_API    │ `/escalations`       │ SLA breach tracking, supervisor  │
│                      │                      │ re-routing, manager intervention │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 78_AUDIT_API         │ `/audit`             │ Immutable append-only compliance │
│                      │                      │ and regulatory incident logs     │
├──────────────────────┼──────────────────────┼──────────────────────────────────┤
│ 79_ERROR_CONTRACTS   │ Global               │ Machine-readable error codes and │
│                      │                      │ standardized failure schemas     │
└──────────────────────┴──────────────────────┴──────────────────────────────────┘
```

---

## 9. Non-Negotiable Contract Invariants

1. **Backend is Authoritative:** The client application renders server-confirmed states; it **never** determines safety levels or invents confirmation receipts.
2. **Deterministic Processing:** Heat-risk evaluations and action triggers derive purely from explicit domain mathematical models (`20–29`, `40–42`).
3. **No False Certainty:** Stale telemetry (`STALE`), missing sensors (`MISSING`), and uncalculated conditions (`UNKNOWN`) are returned explicitly; the API **never** converts a data failure into `LOW` risk.
4. **Command-Oriented Mutations:** State transitions use explicit domain verbs (`/acknowledge`, `/verify`, `/resolve`) with mandatory `Idempotency-Key` headers.
5. **Real-Time Push Separation:** Push notifications deliver lightweight invalidation signals; the client must refetch the authoritative record via REST to update user-facing views.

---

## 10. Cross-Document Architecture Integration

* `63_API_ARCHITECTURE.md`: High-level API architecture and design philosophy.
* `64_AWS_ARCHITECTURE.md`: AWS API Gateway and Lambda deployment model.
* `67_API_GATEWAY.md`: Ingress routing, throttling, and CORS policies.
* `68_DYNAMODB.md`: Authoritative data storage backing API contracts.
* `71_WEATHER_API.md`: Detailed weather and forecast endpoint contracts.
* `72_WORKSITE_API.md`: Detailed worksite and shift facility endpoint contracts.
