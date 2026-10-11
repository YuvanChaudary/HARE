# Agent & Domain Ownership Model

> **Product**: Heat Action Response Engine  
> **Tagline**: *From heat warning to verified workplace action.*  
> **Core Operational Loop**:  
> `HEAT SIGNAL → RISK → WORKSITE CONTEXT → ACTION → ASSIGN → NOTIFY → ACKNOWLEDGE → ESCALATE → VERIFY → AUDIT`

---

## 1. Purpose

In a fast-moving engineering environment involving multiple developers, AI coding agents, researchers, and domain specialists, **ownership serves strictly as a coordination mechanism—not a permanent personal claim or exclusionary boundary over the codebase**.

The purpose of this ownership model is to:
1. **Prevent silent overwrites and collisions**: Ensure parallel contributors do not modify the same contracts, state machines, or data structures without prior alignment.
2. **Clarify safety stewardship**: Guarantee that safety-critical logic (heat risk thresholds, action generation, escalation rules, audit integrity) undergoes mandatory domain and security review.
3. **Decouple workstreams cleanly**: Allow independent development across non-conflicting components (e.g., UI layout vs. weather ingestion adapters) without blocking progress.
4. **Anchor accountability**: Establish clear domain responsibilities so every component has a designated review authority before changes land in integration branches.

> [!IMPORTANT]
> **No Personal Names**: Ownership is assigned to **Functional Roles and Domain Stewards**, not individual personal names. Contributor assignments to roles are dynamic and documented per sprint or task.

---

## 2. Ownership Domains

The Heat Action Response Engine architecture is partitioned into nineteen logical ownership domains:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        GOVERNANCE & SPECIFICATION                      │
│  [PRODUCT / REQUIREMENTS]      [DOCUMENTATION]     [DEMO / SUBMISSION]  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                        DOMAIN & SAFETY CORE                            │
│  [DOMAIN / HEAT RISK]   [WORKSITE CONTEXT]   [ACTION ENGINE]           │
│  [ESCALATION]           [AUDIT]              [AI ASSISTANCE]           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                     APPLICATION & SERVICE LAYER                        │
│  [NOTIFICATIONS]        [BACKEND / API]      [DATABASE]                │
│  [AUTHENTICATION]       [AUTHORIZATION]      [WEATHER INGESTION]       │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                   INFRASTRUCTURE, UX & ASSURANCE                       │
│  [FRONTEND / UX]        [AWS INFRASTRUCTURE] [TESTING]                 │
│  [SECURITY / PRIVACY]                                                  │
└────────────────────────────────────────────────────────────────────────┘
```

### Domain Descriptions

1. **PRODUCT / REQUIREMENTS**: Product definitions, core loop invariants, operational assumptions, user journey specs (`docs/00–09`, `docs/10–19`).
2. **DOMAIN / HEAT RISK**: Authoritative, deterministic heat index and WBGT risk calculation algorithms, thresholds, classification tables, and meteorological bounds (`docs/20–29`).
3. **WORKSITE CONTEXT**: Physical site parameters, workload metabolic rates, indoor/outdoor profiles, shade availability, hydration points, shift schedules.
4. **ACTION ENGINE**: Deterministic transformation of heat risk and worksite context into actionable, assigned workplace protocols (`docs/40–49`).
5. **ESCALATION**: Unacknowledged action escalation rules, SLA timers, manager hierarchy escalation chains (`docs/40–49`, `docs/69`).
6. **NOTIFICATIONS**: Outbound message generation, notification payload structures, multi-channel dispatch contracts (`docs/75`).
7. **FRONTEND / UX**: Dashboard interfaces, supervisor response screens, supervisor workflows, alerts, and verified action UI (`docs/50–59`).
8. **BACKEND / API**: REST endpoints, request/response validation, HTTP routing, business logic orchestration (`docs/70–79`).
9. **DATABASE**: Data entity modeling, DynamoDB single-table design or relational schema definitions, indexes, access patterns (`docs/60–65`).
10. **AUTHENTICATION**: Identity verification, session handling, token validation (`docs/82`).
11. **AUTHORIZATION**: Role-Based Access Control (RBAC: `ADMIN`, `SAFETY_MANAGER`, `SUPERVISOR`), scope validation, least-privilege enforcement (`docs/83`).
12. **AUDIT**: Append-only audit log ingestion, tamper-evident record keeping, operational trace logging (`docs/78`, `docs/85`).
13. **AI ASSISTANCE**: LLM prompt contracts, summarization, language translation, contextual Q&A adapters, non-authoritative boundary guardrails (`docs/40–49`, `docs/87`).
14. **WEATHER INGESTION**: Open-Meteo and external weather data fetching, parsing, caching, fallback handling, timestamp normalization (`docs/30–39`).
15. **AWS INFRASTRUCTURE**: Cloud architecture patterns, Lambda definitions, EventBridge rule configurations, Step Functions definitions, Secrets Manager configs (`docs/60–69`).
16. **TESTING**: Test suites (unit, integration, state transition, end-to-end), test fixtures, synthetic scenarios, evaluation harnesses (`docs/90–99`).
17. **SECURITY / PRIVACY**: Threat modeling, credential hygiene, worker privacy protection, anti-surveillance boundary compliance (`docs/80–89`).
18. **DOCUMENTATION**: Repository documentation, architecture specifications, API contracts, developer guides (`docs/*`).
19. **DEMO / SUBMISSION**: Hackathon demo script, runbook scenarios, evaluation walkthroughs, presentation artifacts (`docs/97`, `docs/100–109`).

---

## 3. Ownership Matrix

The following matrix defines the operational scope, independence level, review requirements, and safety sensitivity for each domain:

| Domain | Primary Responsibility | Typical File Paths | Independent Work? | Requires Review? | Direct Dependencies | Safety Sensitivity |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **DOCUMENTATION** | Documentation accuracy, clarity, cross-references | `docs/**` | **YES** | Peer Review | All Domains | **LOW** (except safety docs) |
| **FRONTEND / UX** | UI components, layouts, local client state, styling | `src/frontend/**`, `docs/50–59*` | **YES** (mock-backed) | Domain Steward | API Contracts | **MEDIUM** |
| **TESTING** | Test harnesses, edge cases, regression suites | `tests/**`, `docs/90–99*` | **YES** | Domain Steward | Target Engines | **HIGH** |
| **WEATHER INGESTION** | Open-Meteo client, data validation, caching | `src/weather/**`, `docs/30–39*` | **YES** (with contract) | Domain Steward | API Contracts | **HIGH** |
| **AI ASSISTANCE** | Natural language synthesis, translation, advisory UI | `src/ai/**`, `docs/87*`, `docs/94*` | **YES** (bounded) | AI Safety & Domain | Risk & Action Engines | **HIGH** (Guardrail boundaries) |
| **PRODUCT / REQUIREMENTS** | Problem scope, non-goals, functional specifications | `docs/00–19*` | **COORDINATED** | Project Lead | None | **HIGH** |
| **BACKEND / API** | REST API endpoints, routing, error handling | `src/api/**`, `docs/70–79*` | **COORDINATED** | API & Security | Domain Engines | **HIGH** |
| **WORKSITE CONTEXT** | Site attributes, task metabolic rates, shifts | `src/domain/context/**` | **COORDINATED** | Domain Steward | Risk Engine | **CRITICAL** |
| **NOTIFICATIONS** | Outbound message framing, channel adapters | `src/notifications/**` | **COORDINATED** | Backend & Privacy | Action Engine | **HIGH** |
| **AWS INFRASTRUCTURE** | Cloud resource models, Lambda, EventBridge | `infra/**`, `docs/60–69*` | **COORDINATED** | Cloud/Security | Backend & Database | **HIGH** |
| **ESCALATION** | SLA timers, escalation triggers, hierarchy rules | `src/domain/escalation/**` | **MANDATORY REVIEW** | Safety & Domain | Action Engine, Authz | **CRITICAL** |
| **DATABASE** | Schema design, key schemas, data migrations | `src/db/**`, `docs/62*` | **MANDATORY REVIEW** | Backend & Database | All Data Producers | **CRITICAL** |
| **AUTHENTICATION** | Token verification, session integrity | `src/auth/**`, `docs/82*` | **MANDATORY REVIEW** | Security Lead | API Gateways | **CRITICAL** |
| **AUTHORIZATION** | RBAC validation, tenant/site scoping | `src/authz/**`, `docs/83*` | **MANDATORY REVIEW** | Security Lead | Auth & Domain Models | **CRITICAL** |
| **AUDIT** | Append-only audit events, tamper evidence | `src/audit/**`, `docs/78*`, `docs/85*` | **MANDATORY REVIEW** | Security & Safety | State Transitions | **CRITICAL** |
| **ACTION ENGINE** | Deterministic trigger rules, protocol assignment | `src/domain/actions/**` | **MANDATORY REVIEW** | Domain & Safety | Risk Engine, Context | **CRITICAL** |
| **DOMAIN / HEAT RISK** | Mathematical risk formulas, thresholds, overrides | `src/domain/risk/**`, `docs/20–29*` | **MANDATORY REVIEW** | Safety Specialist | Weather Validation | **CRITICAL** |
| **SECURITY / PRIVACY** | Data minimization, secret management, threat model | `docs/80–89*` | **MANDATORY REVIEW** | Security Steward | All Components | **CRITICAL** |

---

## 4. Shared Ownership Areas & Coordination Mandate

Certain architectural components sit at the intersection of multiple workstreams. Parallel changes to these shared areas frequently cause merge conflicts, runtime crashes, or critical safety regressions.

The following areas are designated **Shared Ownership**:

1. **API Contracts & Error Envelopes**: `docs/70–79`, shared OpenAPI/schema definitions.
2. **Domain Models & Shared TypeScript Types**: Canonical entity interfaces (`ActionRecord`, `RiskAssessment`, `WorksiteProfile`, `SupervisorAssignment`).
3. **Database Access Patterns & Key Schemas**: DynamoDB partition key structures (`PK`, `SK`, `GSI1PK`, `GSI1SK`).
4. **Action Lifecycle State Machine**: State transitions (`CREATED → ASSIGNED → NOTIFIED → PENDING_ACKNOWLEDGMENT → ACKNOWLEDGED → IN_PROGRESS → VERIFICATION_PENDING → VERIFIED`).
5. **Deterministic Heat Risk Thresholds**: Numerical boundary rules mapping wet-bulb globe temperature or heat index to risk levels (`LOW`, `MODERATE`, `HIGH`, `EXTREME`).
6. **Authorization Policies & Role Permissions**: RBAC matrix and scope resolution (`ADMIN`, `SAFETY_MANAGER`, `SUPERVISOR`).
7. **Audit Log Event Schemas**: Event types, actor tracking metadata, and state transition payloads.
8. **Environment Configuration & Secrets Namespaces**: Configuration contracts and environment variable keys.

### Coordination Rules for Shared Areas

Whenever a contributor (developer or AI agent) needs to touch a Shared Ownership area:

```text
1. FLAG INTENT
   Notify co-contributors via task comment or scratchpad.
         ↓
2. SPECIFY PROPOSED DELTA
   Provide explicit schema diff, interface modification, or state transition.
         ↓
3. VALIDATE COMPATIBILITY
   Verify that existing consumers (API, UI, Database, Tests) will not break.
         ↓
4. OBTAIN STEWARD SIGN-OFF
   Review required before merging into any shared branch.
```

---

## 5. Ownership Transfer Protocol

When a domain or task changes hands—whether between human engineers, between an engineer and an AI agent, or between two AI agents—the transfer must be formalized.

### Transfer Record Template

```markdown
## Ownership Transfer Record

- **Domain / Task**: [e.g., ACTION ENGINE / TASK-ACT-104]
- **Current Owner Role**: [e.g., Domain Backend Agent]
- **New Owner Role**: [e.g., Safety Logic Reviewer]
- **Transfer Reason**: [e.g., Core transition logic implemented; handoff for boundary review]
- **Scope Transferred**: [e.g., `src/domain/actions/state_machine.ts` and associated unit tests]
- **Known Changes**: [List of exact file modifications and commit hashes]
- **Open Issues / Blockers**: [Any unresolved tests, failing edge cases, or pending PRs]
- **Verification Status**: [e.g., Unit tests passing (24/24), Integration tests pending]
- **Transfer Date**: [ISO 8601 UTC timestamp, e.g., 2026-10-08T18:30:00Z]
```

---

## 6. Temporary Ownership

Temporary ownership may be claimed under specific operational conditions:
- **Hackathon Sprint**: Rapid prototyping of an isolated mock or prototype module.
- **Bug Investigation & Root Cause Analysis**: Diagnosing an active regression across multiple components.
- **Integration Sprints**: Merging and reconciling feature branches during release preparation.
- **Emergency Fixes / Hotfixes**: Addressing a critical security vulnerability or deterministic safety defect.

### Temporary Ownership Rules
1. **Time-Bounded**: Temporary ownership automatically lapses once the specific ticket or sprint is completed.
2. **Explicit Declaration**: Must be recorded in the task handoff notes or pull request description.
3. **No Unilateral Contract Breaking**: Temporary owners cannot alter Shared Ownership contracts without domain steward approval.

---

## 7. Ownership Conflict Resolution

When two contributors or coding agents require conflicting changes in the same domain or file, they must adhere to the standard resolution workflow:

```text
┌────────────────────────────────────────────────────────┐
│                   CONFLICT DETECTED                    │
│      Two agents attempt incompatible modifications     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               STEP 1: STOP WORK IMMEDIATELY            │
│   Do not overwrite, force-push, or delete other work   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               STEP 2: COMPARE TASK SCOPES              │
│    Examine task objectives, PR diffs, and contracts    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               STEP 3: CHECK DOMAIN MATRIX              │
│     Determine which task aligns with Primary Owner     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              STEP 4: SPLIT SCOPES IF POSSIBLE          │
│   Extract shared interfaces; isolate distinct logic    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          STEP 5: AGREE ON INTEGRATION BOUNDARY         │
│  Establish sequential ordering or non-breaking adapters│
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               STEP 6: DOCUMENT THE DECISION            │
│     Record resolution rationale in AGENT_HANDOFF.md    │
└────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **Resolution Anti-Pattern**: Never resolve a conflict simply by "keeping the newest file" or "overwriting with current prompt output." All state machine logic, safety rules, and validation checks from both efforts must be understood and reconciled systematically.
