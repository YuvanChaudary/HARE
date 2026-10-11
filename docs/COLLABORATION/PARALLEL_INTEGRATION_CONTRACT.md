# Parallel Integration Contract

> **Product**: Heat Action Response Engine  
> **Tagline**: *From heat warning to verified workplace action.*  
> **Core Operational Loop**:  
> `HEAT SIGNAL → RISK → WORKSITE CONTEXT → ACTION → ASSIGN → NOTIFY → ACKNOWLEDGE → ESCALATE → VERIFY → AUDIT`

---

## 1. Purpose

The Heat Action Response Engine operates as a mission-critical workplace safety platform. When multiple developers, AI coding agents, researchers, and automated test runners work simultaneously across the repository, uncoordinated changes can compromise core deterministic logic, break API contracts, or corrupt state machines.

This **Parallel Integration Contract** establishes the technical rules, architectural boundaries, validation standards, and invariant conditions required to ensure parallel workstreams merge cleanly and predictably without compromising workplace safety or system stability.

---

## 2. Core Principle

Safe parallel execution rests on a single inviolable equation:

$$\text{PARALLEL WORK} + \text{EXPLICIT OWNERSHIP} + \text{STABLE CONTRACTS} + \text{SMALL COMMITS} + \text{RIGOROUS REVIEW} + \text{COMPREHENSIVE TESTS} = \mathbf{SAFE\ INTEGRATION}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE SAFETY ARCHITECTURE                        │
│                                                                        │
│   ENVIRONMENTAL DATA                                                   │
│           ↓                                                            │
│       VALIDATION                                                       │
│           ↓                                                            │
│   DETERMINISTIC HEAT RISK ENGINE (Authoritative)                       │
│           ↓                                                            │
│   RISK LEVEL + RISK EXPLANATION                                        │
│           ↓                                                            │
│   DETERMINISTIC ACTION RULES (Authoritative)                           │
│           ↓                                                            │
│      ACTION ENGINE                                                     │
│           ↓                                                            │
│   SITE-SPECIFIC ACTION ASSIGNMENT                                      │
│           ↓                                                            │
│   AI ASSISTANCE (Non-Authoritative: Explanation/Summary/Translation)   │
│           ↓                                                            │
│   HUMAN SUPERVISOR / SAFETY MANAGER (Accountable)                      │
│           ↓                                                            │
│   TAMPER-EVIDENT AUDIT TRAIL (Traceable)                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Workstream and Branching Strategy

To isolate concurrent development, the repository follows a structured, branch-based workstream model. 

> [!NOTE]
> The branch patterns below illustrate the project's **conceptual Git workflow standard**. Their presence here defines naming policy and integration protocol; it does not imply that specific branches currently exist on remote repositories.

```text
main (Protected, stable integration target)
 │
 ├── feature/<domain>-<short-description>   (e.g., feature/risk-wbgt-bounds)
 ├── fix/<domain>-<short-description>       (e.g., fix/action-timeout-leak)
 ├── test/<domain>-<short-description>      (e.g., test/escalation-matrix)
 ├── docs/<domain>-<short-description>      (e.g., docs/api-73-update)
 └── refactor/<domain>-<short-description>  (e.g., refactor/weather-normalization)
```

### Workstream Branch Rules
1. **Short-Lived Branches**: Branches should live for single, coherent tasks or tickets (typically 1–2 days).
2. **Rebase or Merge Regularly**: Feature branches must integrate changes from `main` frequently to detect drift early.
3. **No Direct Commits to Main**: All modifications land in `main` through pull requests backed by passing tests and domain review.

---

## 4. Workstream Isolation Patterns

Parallel contributors must isolate their work by vertical domain slices and abstract dependencies using contracts rather than live shared dependencies.

### Conceptual Workstream Distribution (Illustrative Example)

| Contributor / Agent | Focus Domain | Isolation Boundary | Integration Point |
| :--- | :--- | :--- | :--- |
| **Agent / Contributor A** | Frontend Supervisor UX | Component mock data | REST Client Contract (`docs/74`) |
| **Agent / Contributor B** | Backend REST API | Route controllers & handlers | Domain Service Interface |
| **Agent / Contributor C** | Deterministic Risk Engine | Pure algorithmic core | Weather Data Contract (`docs/30`) |
| **Agent / Contributor D** | Cloud Infrastructure | Declarative IaC specs | Lambda handler interfaces |
| **Agent / Contributor E** | Integration & Edge Tests | Test harness runners | Public API endpoints & DB models |

### Isolation Safeguards
* **Mock at the Boundary**: If a downstream service is being implemented in parallel, build against the documented contract interface using a lightweight mock adapter.
* **No "Cross-Border" Commits**: A contributor working on Frontend UX must not silently edit Backend routing logic or Risk thresholds in the same patch.

---

## 5. Contract-First Integration

All cross-component interactions must be defined by formal contracts before implementation begins. The canonical contracts govern:
1. **API Request and Response Payloads**: Validated JSON schemas.
2. **Domain Models**: Immutable TypeScript interfaces representing core entities.
3. **State Transition Enums**: Strict lifecycle states for actions and risks.
4. **Asynchronous Event Schemas**: EventBridge envelopes and detail structures.
5. **Database Access Patterns**: Partition and Sort key schemas and query signatures.
6. **Error Envelopes**: Structured error representations.

### Canonical Error Envelope Contract

All REST APIs and service boundaries must standardize error handling using the following canonical error envelope:

```json
{
  "error": {
    "code": "ACTION_STATE_CONFLICT",
    "message": "The action cannot be acknowledged in its current state.",
    "details": {
      "action_id": "act_884920",
      "current_state": "VERIFIED",
      "attempted_transition": "ACKNOWLEDGED",
      "allowed_transitions": []
    },
    "request_id": "req_a7c83f12-4211-4b18-b2e1-88f56417dc10",
    "correlation_id": "corr_heat_event_9921",
    "timestamp": "2026-10-08T10:45:00Z"
  }
}
```

#### Error Envelope Field Specifications
* `code` (string, required): Machine-readable upper-snake-case error code (e.g., `UNAUTHORIZED_SCOPE`, `STALE_WEATHER_DATA`, `INVALID_STATE_TRANSITION`).
* `message` (string, required): Human-readable, non-sensitive summary of the failure.
* `details` (object, optional): Structured context diagnosing the root cause without exposing stack traces or secrets.
* `request_id` (string, required): Unique UUID assigned to the incoming HTTP request.
* `correlation_id` (string, required): Cross-service trace identifier tracking the operational loop transaction.
* `timestamp` (string, required): ISO 8601 UTC timestamp of error generation.

---

## 6. Shared Contract Change Protocol

Modifying an existing shared contract (API schema, DB key structure, domain entity, event format) requires strict compliance with the change protocol:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   STEP 1: DOCUMENT CURRENT CONTRACT                    │
│               Identify baseline schema, version, and usage              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   STEP 2: FORMULATE PROPOSED DELTA                     │
│               Detail exact property changes, removals, additions       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                STEP 3: COMPATIBILITY & CONSUMER ANALYSIS               │
│        Determine whether change is backward-compatible or breaking     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     STEP 4: DEFINE MIGRATION PLAN                      │
│        Specify deprecation period, dual-write or adapter strategy      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   STEP 5: UPDATE SUITE & SECURE REVIEW                 │
│         Run contract regression tests; obtain Domain Steward sign-off  │
└────────────────────────────────────────────────────────────────────────┘
```

> [!WARNING]
> **No Breaking Changes Without Versioning**: Fields must not be deleted or renamed in active shared schemas without a transitional deprecation cycle or version increment (e.g., `/v1/` to `/v2/`).

---

## 7. Database Integration Rules

Parallel work touching DynamoDB single-table definitions or data stores must follow these rules:

1. **Explicit Key Schema Conventions**: Partition Keys (`PK`) and Sort Keys (`SK`) must strictly adhere to the project's namespace format (e.g., `ORG#<id>#SITE#<id>`, `ACTION#<id>`).
2. **Backward Compatible Projections**: When adding attributes to stored items, ensure existing query deserializers handle omitted or `null` values gracefully.
3. **No Uncoordinated In-Place Migrations**: Modifying existing records in place must be orchestrated via written migration scripts or dual-read adapters.
4. **Never Overwrite or Purge Seed/Test Data Silently**: Do not drop tables, purge test collections, or alter shared fixtures without notifying co-contributors.
5. **Single Source of Truth**: Never persist the same domain entity across two divergent table structures to satisfy different workstreams.
6. **Optimistic Locking**: State updates must enforce version checks or conditional expressions (`attribute_exists(PK) AND #version = :current_version`) to eliminate race conditions.

---

## 8. API Integration Rules

All REST API endpoints across the platform must conform to these integration guarantees:

* **Explicit Typing**: All query parameters, route parameters, and request bodies must validate against runtime schemas (e.g., Zod, JSON Schema).
* **Deterministic Status Codes**:
  * `200 OK`: Successful read or idempotent update.
  * `201 Created`: Successful entity creation.
  * `400 Bad Request`: Schema validation failure or malformed payload.
  * `401 Unauthorized`: Missing, expired, or invalid authentication credentials.
  * `403 Forbidden`: Authenticated user lacks RBAC role or worksite scope.
  * `404 Not Found`: Entity does not exist within the requester's authorized scope.
  * `409 Conflict`: State transition violation or concurrency conflict.
  * `500 Internal Server Error`: Unhandled failure (must omit internal stack traces).
* **Role and Scope Enforcement**: Every endpoint must validate the caller's role (`ADMIN`, `SAFETY_MANAGER`, `SUPERVISOR`) and match the target `organization_id` and `worksite_id` against the caller's authorized scope.
* **Idempotency**: Retried mutations (e.g., action acknowledgment, notifications) must support idempotency keys to prevent duplicate records or cascading alerts.

---

## 9. State-Machine Safety Contracts

The **Action Lifecycle State Machine** is the central operational invariant of the Heat Action Response Engine. Contributors must never introduce custom status strings or bypass defined states.

### Authoritative Action State Machine

```text
                  ┌─────────┐
                  │ CREATED │
                  └────┬────┘
                       │
                       ▼
                 ┌──────────┐
                 │ ASSIGNED │
                 └─────┬────┘
                       │
                       ▼
                 ┌──────────┐
                 │ NOTIFIED │
                 └─────┬────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │  PENDING_ACKNOWLEDGMENT │
          └──────┬───────────┬──────┘
                 │           │
   (Ack timeout) │           │ (Supervisor acknowledges)
                 ▼           ▼
          ┌─────────────┐  ┌──────────────┐
          │ NO_RESPONSE │  │ ACKNOWLEDGED │
          └──────┬──────┘  └──────┬───────┘
                 │                │
                 ▼                ▼
          ┌───────────┐    ┌─────────────┐
          │ ESCALATED │    │ IN_PROGRESS │
          └───────────┘    └──────┬──────┘
                                  │
                                  ▼
                     ┌──────────────────────┐
                     │ VERIFICATION_PENDING │
                     └──────────┬───────────┘
                                │
                                ▼
                         ┌──────────┐
                         │ VERIFIED │
                         └──────────┘
```

### Exceptional and Failure Transitions
* `PENDING_ACKNOWLEDGMENT → NO_RESPONSE → ESCALATED`
* `ACKNOWLEDGED → BLOCKED → ESCALATED`
* `IN_PROGRESS → BLOCKED → ESCALATED`
* `ACKNOWLEDGED → CANCELLED` (Requires `SAFETY_MANAGER` or `ADMIN` role with documented audit reason)
* `IN_PROGRESS → CANCELLED` (Requires `SAFETY_MANAGER` or `ADMIN` role with documented audit reason)

### Invariant Rules
1. **No Backward Transitions**: An action cannot move from `VERIFIED` back to `IN_PROGRESS` or `ACKNOWLEDGED`.
2. **Mandatory Actor Attribution**: Every state change must record: `actor_id`, `actor_role`, `previous_state`, `new_state`, `timestamp`, and `correlation_id`.
3. **No Direct Creation in Terminal States**: Actions cannot be directly instantiated as `ACKNOWLEDGED` or `VERIFIED`.

---

## 10. Risk-Engine Integration Contracts

The Heat Risk Engine is the authoritative safety core. It calculates risk through mathematical modeling and explicit regulatory thresholds (e.g., OSHA, NIOSH, IMD guidelines).

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE SAFETY AXIOMS                              │
│                                                                        │
│   UNKNOWN     ≠  LOW           MISSING     ≠  SAFE                     │
│   STALE       ≠  CURRENT       INVALID     ≠  SAFE                     │
│   CONFLICTING ≠  SAFE          FORECAST    ≠  OBSERVATION              │
│   SIMULATION  ≠  REAL EVENT    AI OUTPUT   ≠  AUTHORITATIVE STATE      │
└────────────────────────────────────────────────────────────────────────┘
```

### Risk Engine Integration Mandates
* **Strict Mathematical Determinism**: Given the identical tuple $(T, RH, \text{solar\_load}, \text{wind}, \text{workload})$, the risk calculation must produce the exact identical numerical index, risk level, and explanation every time.
* **Conservative Degraded Modes**:
  * Missing humidity or temperature: The system must enter `DATA_DEGRADED` state and escalate to default high-vigilance protocols; it must **never** assume default mild conditions.
  * Stale weather cache (> 60 minutes): Must flag `DATA_STALE` and trigger telemetry warnings.
* **Zero AI Override**: AI components are strictly prohibited from evaluating, overriding, adjusting, or downgrading risk calculations.

---

## 11. AI Integration Contracts and Guardrail Boundaries

AI services (e.g., LLM integrations, prompt engines) provide **assistive linguistic features only**. They sit outside the authoritative safety loop.

### Permitted AI Functions
* Generating plain-language explanations of why a deterministic risk level was reached.
* Translating supervisor action instructions into regional languages or simplified vernacular.
* Summarizing multi-site incident reports for executive management.
* Answering contextual questions regarding safety manual reference texts.

### Strictly Forbidden AI Functions
```text
┌────────────────────────────────────────────────────────────────────────┐
│                    PROHIBITED AI ACTIONS                               │
│                                                                        │
│  [X] Determining authoritative heat risk levels                        │
│  [X] Downgrading risk classifications                                  │
│  [X] Suppressing or modifying safety actions                           │
│  [X] Suppressing or delaying escalation alerts                         │
│  [X] Automatically acknowledging or verifying actions                  │
│  [X] Granting medical clearance or diagnosing heat illness             │
│  [X] Overriding role-based authorization or tenancy boundaries         │
│  [X] Altering or pruning audit log entries                             │
└────────────────────────────────────────────────────────────────────────┘
```

### AI Failure Contract
If an AI model times out, returns malformed JSON, hallucinates, or is unreachable:

$$\mathbf{AI\ FAILURE\ \ne\ SAFETY\ FAILURE}$$

* The system must immediately fall back to **pre-configured deterministic templates**.
* The core action assignment and notification loop must proceed without interruption.
* The failure must be logged in audit telemetry as `AI_ASSISTANCE_UNAVAILABLE`.

---

## 12. Pre-Merge Integration Checklist

Before any branch, pull request, or agent contribution is merged into `main` or an integration branch, the following checklist must be satisfied:

```markdown
### Pre-Merge Verification Checklist

- [ ] **Scope Match**: All modified files fall strictly within the assigned task boundaries.
- [ ] **No Unrelated Code**: No extraneous refactorings, formatting sweeps, or unintended file edits.
- [ ] **Contract Compliance**: All shared interfaces, event schemas, and API contracts match canonical specifications.
- [ ] **Unit Tests Pass**: 100% of local unit tests pass without errors or regressions.
- [ ] **Existing Test Suite Passes**: Full project test suite passes cleanly.
- [ ] **State Machine Invariants**: Action and risk state transitions strictly honor the canonical state machine.
- [ ] **Security Review**:
  - [ ] No hardcoded API keys, passwords, or cloud credentials committed.
  - [ ] RBAC authorization checks enforced on all new/modified endpoints.
  - [ ] No sensitive worker data or precise location telemetry exposed.
- [ ] **Safety Review**:
  - [ ] No AI components placed in the authoritative safety decision path.
  - [ ] Stale or missing data handled conservatively (never defaulting to safe/low).
- [ ] **Audit Preservation**: All mutating actions record complete, append-only audit entries.
- [ ] **Documentation Updated**: Architecture docs, API specs, and schemas updated to reflect changes.
- [ ] **Handoff Completed**: `AGENT_HANDOFF.md` updated with comprehensive summary, risks, and next steps.
```

---

## 13. Conflict Resolution Protocol

When parallel changes produce code conflicts, logical incompatibilities, or divergent test expectations, resolve them through this deliberate sequence:

```text
1. STOP
   Halt automated merging or force-pushing. Do not attempt blind auto-resolutions.

2. ISOLATE THE CONFLICT
   Identify exactly which schemas, files, or state logic diverge.

3. CONSULT THE AUTHORITATIVE CONTRACT
   Check the corresponding documentation in `docs/` to confirm the intended system specification.

4. COMPARE BEHAVIORAL INTENT
   Understand *why* each contributor introduced their changes. Does one introduce a safety fix?

5. PRESERVE SAFETY INVARIANTS
   In any ambiguity between ease-of-use and strict safety enforcement, strict safety enforcement wins.

6. RESOLVE DELIBERATELY
   Refactor the conflicting code to support both valid use cases or split into phased PRs.

7. RE-RUN FULL TEST SUITE
   Validate that neither the new functionality nor the regression baseline is broken.

8. DOCUMENT RESOLUTION
   Record the decision and rationale in the task handoff notes.
```

---

## 14. Integration Failure Rules

When integration or end-to-end tests fail during parallel development, the team must adhere to three foundational axioms:

$$\mathbf{TIMEOUT\ \ne\ SUCCESS}$$
$$\mathbf{ERROR\ \ne\ SAFE}$$
$$\mathbf{PARTIAL\ SUCCESS\ \ne\ COMPLETE\ SUCCESS}$$

* **No Silent Retries**: A test that times out waiting for an escalation alert or notification dispatch is an integration failure.
* **No Swallowing Errors**: Catch blocks that swallow exceptions and return `200 OK` or default to `LOW` risk are critical security defects.
* **Integration Failures Remain Visible**: Broken integration builds must block downstream deployments until explicitly diagnosed and resolved.
