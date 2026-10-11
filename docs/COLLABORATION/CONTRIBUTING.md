# Contributor Guide

> **Product**: Heat Action Response Engine  
> **Tagline**: *From heat warning to verified workplace action.*  
> **Core Operational Loop**:  
> `HEAT SIGNAL → RISK → WORKSITE CONTEXT → ACTION → ASSIGN → NOTIFY → ACKNOWLEDGE → ESCALATE → VERIFY → AUDIT`

Welcome to the **Heat Action Response Engine** project! This guide establishes the engineering standards, safety mandates, contribution workflows, and testing requirements for all contributors—including software engineers, AI coding agents, data scientists, and safety researchers.

---

## 1. Project Overview

The Heat Action Response Engine addresses a critical gap in industrial and occupational safety: **the translation of environmental heat warnings into accountable, timely, and verified workplace actions**.

While raw weather forecasts and alert bulletins warn of extreme heat, workplaces regularly experience injuries because warnings are not operationalized. Our platform converts environmental data (temperature, humidity, solar radiation) together with site-specific parameters (workload intensity, shade, hydration access, shift schedules) into concrete preventive protocols assigned directly to supervisors on the ground.

### Operational Core Loop

```text
[HEAT SIGNAL]
      ↓
[RISK CALCULATION] (Deterministic mathematical modeling)
      ↓
[WORKSITE CONTEXT] (Metabolic load, physical site conditions)
      ↓
[ACTION GENERATION] (Deterministic protocol rules)
      ↓
[SUPERVISOR ASSIGNMENT]
      ↓
[NOTIFICATION DISPATCH]
      ↓
[SUPERVISOR ACKNOWLEDGMENT] (Tracked SLA timer)
      ↓
[ESCALATION ENGINE] (Triggers if unacknowledged)
      ↓
[ACTION VERIFICATION] (Confirmation of shade/water/rest implementation)
      ↓
[AUDIT LOGGING] (Tamper-evident, traceable operational record)
```

---

## 2. Core Contribution Principles

All work across this repository must strictly adhere to seven core principles:

1. **Safety before convenience**: Never bypass validation, authentication, or deterministic checks to expedite a feature or build.
2. **Correctness before speed**: A fast algorithm that miscalculates heat risk is a critical hazard. Correctness is paramount.
3. **Small changes before large changes**: Deliver small, self-contained, reviewable patches rather than monolithic rewrites.
4. **Explicit contracts before assumptions**: Define and agree upon domain interfaces and API schemas before writing implementation code.
5. **Tests before confidence**: Code without comprehensive automated test coverage is incomplete and unverified.
6. **Documentation before tribal knowledge**: Document architectural decisions, state transitions, and schemas in `docs/` as changes occur.
7. **Human accountability before automation**: AI models and automated triggers may assist, summarize, or notify, but designated human safety personnel remain strictly accountable for workplace decisions.

---

## 3. Before Starting Work

Before writing code or editing files, every contributor (human or AI agent) must complete this preparatory sequence:

```text
1. REVIEW ARCHITECTURE & DOCUMENTATION
   Locate relevant specifications under `docs/` and read the authoritative contracts.

2. VERIFY OWNERSHIP & COORDINATION
   Consult `docs/COLLABORATION/AGENT_OWNERSHIP.md` to identify the domain steward and review mandates.

3. INSPECT OPEN QUESTIONS & LIMITATIONS
   Check existing issues and the latest `docs/COLLABORATION/AGENT_HANDOFF.md` for known blockers.

4. IDENTIFY SHARED CONTRACTS
   Determine whether your task alters API schemas, database keys, or the action state machine.

5. DEFINE BOUNDED SCOPE
   Declare the exact subset of files to touch; avoid touching unassigned modules.
```

### Documentation Directory Map

Consult the relevant documentation directory before beginning work:

* `docs/00–09`: **Product Vision & Scope** (Problem statement, non-goals, user profiles, charter)
* `docs/10–19`: **Requirements & Workflows** (User journeys, supervisor flows, core lifecycle)
* `docs/20–29`: **Heat Risk Modeling** (Formulas, WBGT/Heat Index calculations, thresholds)
* `docs/30–39`: **Weather & Environmental Data** (Open-Meteo integration, caching, data hygiene)
* `docs/40–49`: **Action Engine & AI Assistance** (Deterministic rules, LLM guidance boundaries)
* `docs/50–59`: **Frontend & Supervisor UX** (Dashboard designs, UI components, states)
* `docs/60–69`: **Backend & AWS Architecture** (Lambda, DynamoDB, EventBridge, Step Functions)
* `docs/70–79`: **API Specifications** (REST contracts, acknowledgment API, error envelopes)
* `docs/80–89`: **Security, Privacy & Safety** (Threat model, RBAC, secrets, medical disclaimer)
* `docs/90–99`: **Testing & Evaluation** (Unit test suites, edge cases, synthetic scenarios)
* `docs/100–109`: **Hackathon Execution** (Milestones, demo scripts, submission runbook)
* `docs/110–117`: **Governance & Compliance** (Traceability, operational standards)
* `docs/COLLABORATION/`: **Collaboration Standards** (Handoffs, ownership, integration contract)

---

## 4. Branching and Commit Guidance

We follow standard Git conventions to maintain a clean and bisectable project history.

> [!NOTE]
> The examples below illustrate recommended conventions. They do not imply that these specific branches or commits currently exist in the repository.

### Branch Naming Conventions
* `feature/<domain>-<short-description>`: e.g., `feature/action-sla-timer`
* `fix/<domain>-<short-description>`: e.g., `fix/weather-stale-cache`
* `docs/<domain>-<short-description>`: e.g., `docs/authz-rbac-spec`
* `test/<domain>-<short-description>`: e.g., `test/risk-boundary-cases`
* `refactor/<domain>-<short-description>`: e.g., `refactor/notification-envelope`

### Commit Message Guidelines
Use the Conventional Commits specification:

```text
feat: add worksite metabolic rate adjustment
fix: prevent state transition from VERIFIED to ACKNOWLEDGED
docs: update supervisor escalation response window
test: add unit test suite for high-humidity edge conditions
refactor: isolate Open-Meteo HTTP client error handling
```

---

## 5. Pull Request and Review Expectations

Every pull request or merge proposal must clearly articulate its context, impact, and verification status:

```markdown
### Pull Request Summary

1. **What changed?**: Detailed summary of functional modifications.
2. **Why?**: Business justification, issue reference, or architectural requirement.
3. **Files changed**: Exact list of added, modified, or removed files.
4. **Behavior changes**: Differences in system output, API responses, or UI behavior.
5. **Contract changes**: Any alterations to JSON schemas, shared types, or state machines.
6. **Tests performed**: Commands executed and passing status (unit, integration, e2e).
7. **Known gaps / Untested items**: Explicit declaration of what was NOT verified.
8. **Security & Privacy impact**: Verification of RBAC, data minimization, and secret protection.
9. **Safety impact**: Evidence that deterministic risk calculation and action rules remain intact.
10. **AI impact**: Confirmation that AI remains assistive and non-authoritative.
11. **Migrations required**: Any database key or configuration changes needed.
```

---

## 6. Testing Expectations and Quality Hierarchy

All code contributions must be supported by automated tests across the testing hierarchy:

```text
┌────────────────────────────────────────────────────────┐
│                   DEMO / VALIDATION                    │
│           End-to-end hackathon scripted flows          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│               STATE MACHINE TRANSITION TESTS           │
│     Exhaustive validation of action lifecycle paths    │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                  INTEGRATION & API TESTS               │
│     HTTP request validation, RBAC, error contracts     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                      UNIT TESTS                        │
│   Pure deterministic calculations, data parsing, math  │
└────────────────────────────────────────────────────────┘
```

### Critical Test Categories
* **Deterministic Risk Engine**: Tests verifying exact numerical outputs across extreme boundary conditions (0% humidity, 100% humidity, temperature spikes).
* **Data Hygiene**: Verifying that `MISSING`, `STALE`, `INVALID`, or `CONFLICTING` environmental inputs never default to `LOW` or `SAFE`.
* **Action Lifecycle Enforcement**: Confirming that illegal state transitions (e.g., `CREATED → VERIFIED` or `VERIFIED → ACKNOWLEDGED`) throw deterministic errors.
* **Escalation SLA Timers**: Verifying escalation triggers fire when the acknowledgment window expires.
* **RBAC Enforcement**: Verifying that `SUPERVISOR` cannot access admin endpoints or mutate other worksites.
* **AI Guardrail Boundaries**: Confirming that simulated AI outages trigger deterministic template fallbacks without interrupting the core safety loop.

---

## 7. Security Rules

Every contributor must rigorously enforce system security:

1. **Never Commit Secrets**: Never commit passwords, API keys, JWT signing keys, AWS credentials, database URLs, or `.env` files.
2. **Secrets Management**: Use environment variable injection or AWS Secrets Manager references.
3. **No Authorization Bypass**: Never disable RBAC checks, bypass authentication tokens, or hardcode mock admin identities to ease local testing.
4. **No Secret Leakage in Logs**: Never log tokens, headers, PII, or internal credentials in CloudWatch or console outputs.
5. **Input Sanitization**: Validate and sanitize all external inputs against runtime schemas before processing.

---

## 8. Safety Mandates & Disclaimers

The Heat Action Response Engine is built to safeguard worker health, but it operates under explicit safety boundaries:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     SYSTEM SAFETY INVARIANTS                           │
│                                                                        │
│  [!] This is NOT a medical diagnosis or physiological monitoring tool. │
│  [!] This is NOT a medical clearance or return-to-work engine.         │
│  [!] This is NOT an emergency response dispatch system.                │
│  [!] This is NOT a legal or regulatory certification engine.           │
└────────────────────────────────────────────────────────────────────────┘
```

* **Deterministic Authority**: All safety actions and risk classifications must originate from deterministic rules. AI models are strictly prohibited from calculating, altering, or downgrading risk.
* **Human Accountability**: Actions must be assigned to and acknowledged by identified human supervisors.

---

## 9. Data Protection and Worker Privacy

To protect the workforce and maintain ethical labor standards, contributors must respect worker privacy:

* **Data Minimization**: Collect only operational information required to assign and verify workplace actions (e.g., site name, shift name, supervisor ID).
* **No Continuous Location Tracking**: Do not track continuous, high-precision GPS coordinates of individual workers.
* **No Biometric or Physiological Telemetry**: The system must not require or store personal health data, core body temperature, sweat rates, or medical histories.
* **Anti-Surveillance Boundary**: The system must never be repurposed as a worker productivity monitor, break-time surveillance tool, or punitive measure.

---

## 10. AI Contribution Rules

When implementing or modifying features involving Large Language Models or Generative AI:

1. **Human Review Mandatory**: All AI-generated code, prompt templates, and documentation must be thoroughly verified by human contributors.
2. **Strictly Assistive**: AI is limited to explanation, plain-language summarization, regional language translation, and notification message styling.
3. **No Safety Authority**: AI must never determine risk levels, suppress escalations, verify actions, or grant medical clearances.
4. **Resilience to Failure**: An AI service outage or malformed LLM response must **never** halt the action engine or drop safety notifications; the system must gracefully fall back to deterministic default templates.

---

## 11. Documentation Contribution Standards

Documentation in this repository represents the source of truth for architectural invariants.

* **Factual Integrity**: Never document features, endpoints, AWS services, or AI integrations as existing unless they are fully implemented in the code.
* **Explicit Status Vocabulary**: Clearly tag capabilities with standard status tags:
  * `IMPLEMENTED`: Actively in the codebase and verified by automated tests.
  * `PLANNED`: Formally targeted for the active roadmap/milestone.
  * `PROPOSED`: Under architectural review or design consideration.
  * `FUTURE`: Conceptual direction deferred to subsequent releases.
  * `PENDING VERIFICATION`: Code exists but automated test proof is incomplete.
* **Cross-References**: Maintain clickable markdown file links and update table of contents indexes when adding or modifying files.

---

## 12. Issue Reporting Protocol

When logging defects or unexpected system behavior, use the standardized issue template:

```markdown
# [Domain] Issue Title

## Summary
Brief description of the problem.

## Expected Behavior
What should happen according to the documentation contracts.

## Actual Behavior
What actually happened.

## Steps to Reproduce
1. Step one...
2. Step two...
3. Step three...

## Environment
OS: [e.g., Windows 11 / Ubuntu 22.04]
Node.js: [e.g., 20.x]
Git Commit Hash: [e.g., a7c83f1]

## Relevant Files
- `src/...`
- `docs/...`

## Logs / Error Output
```text
Paste sanitized error messages or test output here.
```

## Safety Impact
[ ] Yes: Affects risk calculation, action generation, or escalation.
[ ] No: Cosmetic, documentation, or non-safety tooling.

## Security Impact
[ ] Yes: Potential authorization bypass, secret leak, or data exposure.
[ ] No: No security exposure detected.

## Severity
[CRITICAL / HIGH / MEDIUM / LOW]

## Suggested Next Step
Recommended investigation path or proposed fix.
```

> [!CAUTION]
> **Security Vulnerability Reporting**: If you discover a critical security vulnerability or authorization bypass, **do not log sensitive exploit details in public issue trackers**. Report the vulnerability immediately through the project's designated private maintainer channel.

---

## 13. Bug Severity Classification

Defects must be classified according to their operational and safety impact:

| Severity | Definition | Concrete Examples |
| :--- | :--- | :--- |
| **CRITICAL** | Direct safety compromise, unauthorized risk modification, audit tampering, or auth bypass | • Deterministic risk engine downgrades risk due to logic error.<br>• Action bypasses acknowledgment directly to `VERIFIED`.<br>• Authentication token validation fails open.<br>• Audit logs deleted or modified. |
| **HIGH** | Major workflow disruption, missed escalation, or role violation | • Escalation timer fails to fire when action is unacknowledged.<br>• Notifications fail to dispatch to assigned supervisors.<br>• Supervisor role able to view data for other organizations. |
| **MEDIUM** | Non-critical functionality degraded with workaround available | • Dashboard metrics fail to refresh automatically.<br>• AI explanation service times out (deterministic fallback functions).<br>• Filter controls in supervisor UI unresponsive. |
| **LOW** | Minor inconvenience, cosmetic flaw, or documentation typo | • Typo in safety manual reference document.<br>• CSS alignment defect on mobile portrait view.<br>• Non-breaking warning in test harness output. |

---

## 14. AI-Agent Contributor Rules

For autonomous and semi-autonomous AI coding agents working on this codebase:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     AI-AGENT WORKFLOW CONTRACT                         │
│                                                                        │
│   1. STAY WITHIN ASSIGNED TASK SCOPE                                   │
│   2. READ EXISTING CODE & RECENT DOCS BEFORE WRITING                   │
│   3. DO NOT PERFORM UNRELATED MASS REFACTORINGS                        │
│   4. PRESERVE ALL EXISTING CONTRACTS & INTERFACES                      │
│   5. NEVER INVENT MISSING ENDPOINTS, MODELS, OR DEPLOYMENTS            │
│   6. REPORT UNCERTAINTIES EXPLICITLY TO THE HUMAN OPERATOR             │
│   7. RUN LOCAL TESTS TO VERIFY CHANGES BEFORE CONCLUDING TURN          │
│   8. ALWAYS UPDATE `AGENT_HANDOFF.md` AT CONCLUSION                    │
└────────────────────────────────────────────────────────────────────────┘
```

Agents must prefer small, surgical patches:

$$\mathbf{SMALL\ PATCH} \longrightarrow \mathbf{TEST} \longrightarrow \mathbf{REVIEW} \longrightarrow \mathbf{INTEGRATE}$$

Never attempt large, uncoordinated architectural rewrites in a single prompt execution.

---

## 15. Definition of Done (DoD)

A task or pull request is considered **DONE** only when all items on this checklist are verified:

```markdown
### Project Definition of Done Checklist

- [ ] **Requirement Understood**: Clear alignment with product specifications in `docs/00–19`.
- [ ] **Scope Enforced**: Edits are restricted strictly to the assigned domain and task.
- [ ] **Ownership Checked**: Domain steward consulted per `AGENT_OWNERSHIP.md`.
- [ ] **Implementation Complete**: Feature, bugfix, or document is fully written and coherent.
- [ ] **Automated Tests Passing**: All new and pre-existing unit and integration tests pass cleanly.
- [ ] **State Machine Invariants Maintained**: Action lifecycle transitions strictly adhere to `PARALLEL_INTEGRATION_CONTRACT.md`.
- [ ] **Deterministic Safety Preserved**: No AI models placed in the authoritative safety path.
- [ ] **Security Verified**: RBAC enforced; no secrets, keys, or credentials committed.
- [ ] **Worker Privacy Respected**: No biometric collection or continuous location tracking introduced.
- [ ] **Audit Trail Maintained**: All mutating actions record complete, append-only audit events.
- [ ] **Documentation Updated**: Associated contracts, schemas, and API docs updated under `docs/`.
- [ ] **No Fabrications**: All implementation claims accurately reflect actual repository state.
- [ ] **Handoff Completed**: Comprehensive handoff entry written to `docs/COLLABORATION/AGENT_HANDOFF.md`.
```

---

## 16. Cross-Document Collaboration Flow

The four collaboration documents operate together as an integrated lifecycle:

```text
       CONTRIBUTING.md
  (Guides rules, testing & DoD)
             │
             ▼
     AGENT_OWNERSHIP.md
(Allocates domains & review paths)
             │
             ▼
PARALLEL_INTEGRATION_CONTRACT.md
  (Guarantees contract stability)
             │
             ▼
     AGENT_HANDOFF.md
 (Transfers context & verification)
             │
             ▼
     NEXT CONTRIBUTOR
```
