# Agent Handoff Specification & Protocol

```text
Status: Documented
Scope: Multi-Agent & Contributor Collaboration Standard
Audience: AI Coding Agents, Software Engineers, Code Reviewers, Technical Leads
Last Updated: 2026-10-08
Safety Mandate: Deterministic Logic Authority & Traceable Operational State
```

---

## 1. Purpose & Objectives

In a distributed development environment combining human engineers and autonomous AI coding agents, **unstructured, ambiguous, or incomplete handoffs are a primary source of architectural drift, broken safety contracts, and silent regressions**.

The purpose of this specification is to establish a rigorous, standardized **Handoff Protocol** ensuring that when one contributor (human or AI agent) concludes or pauses work, the receiving contributor receives complete situational awareness:
* **What was done:** Specific functional and structural modifications introduced.
* **What was not done:** Explicitly deferred tasks, edge cases, and out-of-scope items.
* **What changed & why:** Architectural rationale and design decisions behind edits.
* **What remains:** Next actionable milestones required to reach completion.
* **What is blocked:** External dependencies, missing credentials, or unapproved PRs.
* **What must be tested:** Exact validation procedures and regression targets.
* **What risks & assumptions exist:** Operational vulnerabilities and unverified hypotheses.

---

## 2. Standard Handoff Schema Template

Every context transfer between agents or contributors must utilize this canonical Markdown schema:

```markdown
# Agent Handoff

## Task
[Unique task identifier and short descriptive title]

## Objective
[Clear 1-2 sentence statement of what this task was intended to achieve]

## Scope
[Bounded domain: what was explicitly IN SCOPE and OUT OF SCOPE]

## Status
[NOT_STARTED | IN_PROGRESS | BLOCKED | READY_FOR_REVIEW | READY_FOR_INTEGRATION | COMPLETED | DEFERRED | CANCELLED]

## Completed
- [Itemized list of functional capabilities and components implemented]

## Not Completed
- [Itemized list of remaining tasks or deliberately deferred items]

## Files Changed
- [file/path/name.ext]: [Brief summary of modifications made in this file]

## Files Not Changed
- [Explicit list of sensitive or adjacent files intentionally left untouched to prevent scope creep]

## Architecture Impact
[Impact on serverless mesh, microservice boundaries, or event flows]

## API Impact
[Modifications to REST routes, request/response schemas, or error envelopes]

## Database Impact
[Modifications to DynamoDB single-table schema, partition keys, or access patterns]

## Security Impact
[Modifications to authentication, JWT claims, RBAC permissions, or secrets]

## Safety Impact
[Modifications touching deterministic risk math, thresholds, actions, or escalations]

## AI Impact
[Modifications to prompts, guardrails, or model adapters; confirm non-authoritative boundary]

## Tests Run
- [Exact test command]: [Result: Passed/Failed, assertions verified]

## Tests Not Run
- [Tests deferred, missing test fixtures, or manual verification pending]

## Known Issues
- [Bugs, performance bottlenecks, or unhandled edge cases observed]

## Open Questions
- [Unresolved architectural or domain questions requiring product decision]

## Assumptions
- [Operating assumptions made during implementation]

## Dependencies
- [Upstream PRs, external APIs, environment variables, or library dependencies]

## Risks
- [Operational, security, or safety risks introduced by this change]

## Next Recommended Steps
1. [Numbered, prioritized sequence of next concrete actions for receiving agent]

## Verification Checklist
- [ ] Code builds without compilation errors
- [ ] No hardcoded secrets or credentials committed
- [ ] Deterministic safety rules remain uncompromised
- [ ] AI remains non-authoritative
- [ ] Tests executed and passing

## Handoff Notes
[Any operational context, quirks, terminal commands, or debugging tips]
```

---

## 3. Standard Status Vocabulary

All handoff documents and task tickets must use these standardized status values:

| Status Value | Operational Meaning | Transition Precondition |
| :--- | :--- | :--- |
| **`NOT_STARTED`** | Task is defined in backlog but no code or documentation has been modified. | Initial ticket state. |
| **`IN_PROGRESS`** | Work has commenced; branch or workspace is dirty; implementation incomplete. | Agent actively editing. |
| **`BLOCKED`** | Work cannot proceed due to external dependency, upstream bug, or missing decision. | Blocking issue identified. |
| **`READY_FOR_REVIEW`** | Implementation and local unit testing complete; awaiting peer/agent audit. | All unit tests pass. |
| **`READY_FOR_INTEGRATION`**| Reviewed and approved; ready for merge into main/develop integration branch. | Review approval logged. |
| **`COMPLETED`** | Merged into target branch, verified on staging, and documentation updated. | Definition of Done met. |
| **`DEFERRED`** | Intentionally postponed to post-hackathon phases (Phase 1 or Future Roadmap). | Architectural agreement. |
| **`CANCELLED`** | Task deemed unnecessary, redundant, or architecturally superseded. | Justification documented. |

---

## 4. Handoff Quality Standards & Verification Gates

A handoff is deemed **defective and rejected** if it fails to provide:
1. **Accurate File Manifest:** Omitting any modified file or failing to list untouched sensitive files.
2. **Behavioral Delta:** Failing to explain how system runtime behavior changed.
3. **Test Evidence:** Claiming tests passed without providing the exact execution command and output summary.
4. **Failure Disclosure:** Hiding failed experiments, broken builds, or unresolved TypeScript lints.
5. **Security/Safety Assessment:** Failing to explicitly evaluate impact on deterministic safety logic and RBAC.

---

## 5. Agent-to-Agent Operational Rules

When operating in an autonomous multi-agent loop, all coding agents must obey these non-negotiable rules:

1. **Zero Undocumented Context:** Never assume the receiving agent possesses memory of prior chat turns. All relevant decisions, file paths, and environment quirks must be written into the handoff artifact.
2. **Never Hide Failed Attempts:** If an implementation approach failed, document *why* it failed so the next agent does not repeat the dead end.
3. **No Partial Completion Claims:** Never report a task as `COMPLETED` if edge cases, unit tests, or error handlers remain unwritten. Use `IN_PROGRESS` with explicit remaining items.
4. **Respect Ownership Boundaries:** Never modify files outside your assigned ownership domain without explicit coordination documented in the handoff ([AGENT_OWNERSHIP.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/COLLABORATION/AGENT_OWNERSHIP.md)).
5. **No Silent Deletions:** Never delete another contributor’s code, interfaces, or documentation without providing clear architectural rationale in the handoff notes.
6. **Reproducible Commands:** Always provide exact CLI commands (with working directories) to build, run, and test the workstream.
7. **Distinguish Local from Integration Success:** Clearly state whether tests passed in an isolated local mock environment vs. an integrated cloud staging environment.

---

## 6. Safety-Critical Handoff Protocol

Any handoff touching the following safety-critical domains triggers the **Mandatory Safety Review Protocol**:
* **Deterministic Heat Risk Logic:** Rothfusz regression equations, apparent temperature math, threshold cutoffs.
* **Action Directives Catalog:** Declarative action mapping rules, priorities, response deadlines.
* **State Machine & Escalation:** Step Functions timers, supervisory non-response transitions, timeout aborts.
* **Physical Verification:** Verification permissions, evidence submission contracts, non-medical boundaries.
* **Worker Data Privacy:** Telemetry ingestion schemas, shift roster tracking, anti-surveillance constraints.
* **AI Safety Boundaries:** System prompts, guardrail filters, medical refusal logic.
* **Security & Audit:** Cognito JWT validation, DynamoDB transactional locking, append-only audit persistence.

### Required Protocol Gate
```text
SAFETY-CRITICAL CHANGE IDENTIFIED
       ↓
MANDATORY SAFETY IMPACT STATEMENT IN HANDOFF
       ↓
EXECUTE AUTHORITATIVE TEST SUITE (docs/91, docs/92, docs/93, docs/94)
       ↓
EXPLICIT SAFETY PEER REVIEW SIGN-OFF
       ↓
PERMITTED INTEGRATION INTO MAIN
```

---

## 7. Concrete Handoff Example (Synthetic Feature Demonstration)

The following example illustrates a fully compliant handoff artifact for a synthetic development task. *(Note: This feature description is a documentation demonstration and does not imply historical implementation status.)*

```markdown
# Agent Handoff

## Task
TASK-ACT-104: Implement Action Acknowledgment State Transition & Timer Abort

## Objective
Enable on-duty site supervisors to acknowledge pending safety directives via authenticated 
REST API call, atomically updating status to ACKNOWLEDGED and cancelling the running 
Step Functions escalation timer.

## Scope
- IN SCOPE: POST /api/v1/actions/{id}/acknowledge endpoint handler, DynamoDB conditional update, 
  EventBridge timer-cancel event emission, ACTION_ACKNOWLEDGED audit logging.
- OUT OF SCOPE: Physical verification (/verify), frontend UI styling, SMS carrier dispatch.

## Status
READY_FOR_REVIEW

## Completed
- Implemented acknowledgeActionHandler in src/handlers/action/acknowledge.ts.
- Added conditional write expression ensuring status is PENDING_ACKNOWLEDGMENT before mutating.
- Added EventBridge event emission (ActionAcknowledgedEvent) to cancel active Step Function.
- Added transactional audit write to DynamoDB audit partition within TransactWriteItems.
- Added 6 unit tests covering valid acknowledgment, replay token attack, and unauthorized worksite access.

## Not Completed
- Integration testing with live AWS Step Functions cluster (tested against local EventBridge mock).
- Rate-limiting middleware on the acknowledgment route (deferred to Task SEC-201).

## Files Changed
- src/handlers/action/acknowledge.ts: Implemented REST handler and validation.
- src/domain/action/stateMachine.ts: Added transition rule PENDING_ACK -> ACKNOWLEDGED.
- src/types/action.ts: Added AcknowledgeActionRequest and AcknowledgeActionResponse contracts.
- tests/unit/action/acknowledge.test.ts: Added 6 unit tests.

## Files Not Changed
- src/domain/risk/heatIndex.ts: Intentionally untouched (risk logic boundary).
- src/handlers/action/verify.ts: Intentionally untouched (separate verification role).

## Architecture Impact
Emits domain event action.acknowledged onto EventBridge custom bus heat-action-bus.

## API Impact
Exposes POST /api/v1/actions/{actionId}/acknowledge. Adheres strictly to RFC 7807 error envelopes.

## Database Impact
Performs TransactWriteItems on single-table: updates Action item and appends Audit item atomically.

## Security Impact
Enforces RS256 JWT claims validation: user must possess SUPERVISOR role and be assigned to 
the targeted worksite_id. BOLA attempts return HTTP 403 Forbidden.

## Safety Impact
Ensures acknowledgment stops the escalation countdown clock without falsely marking the action 
as physically VERIFIED. Maintains strict semantic boundary: Acknowledged != Verified.

## AI Impact
None. This is pure deterministic backend compute; zero AI dependencies.

## Tests Run
- npm test -- tests/unit/action/acknowledge.test.ts
  Result: 6/6 Passed (100% assertions satisfied). Verified conditional write abort on replay.

## Tests Not Run
- Live Step Functions timer abort (requires AWS deployment credentials).

## Known Issues
- Transient DynamoDB TransactionCanceledException occurs if client retries within 5ms; handled 
  gracefully by returning idempotent HTTP 200 with current status.

## Open Questions
- Should the acknowledgment endpoint accept signed single-use query tokens for SMS magic links, 
  or strictly require Authorization Bearer headers? (Logged as Q-008 in docs/116_OPEN_QUESTIONS.md).

## Assumptions
- Assumed the client passes correlation_id in request headers; if omitted, handler generates a new UUID.

## Dependencies
- Depends on DynamoDB single-table schema established in Task DB-001.

## Risks
- If EventBridge fails to deliver timer-cancel event, Step Functions may trigger a false escalation; 
  mitigated by checking active action status in escalation Lambda before alerting Safety Manager.

## Next Recommended Steps
1. Review pull request PR-104 focusing on DynamoDB TransactWriteItems conditional expressions.
2. Execute API contract tests in tests/api/action.test.ts.
3. Assign frontend engineer to connect mobile PWA "Acknowledge" button to this endpoint.

## Verification Checklist
- [x] Code builds without compilation errors (tsc cleanly passes)
- [x] No hardcoded secrets or credentials committed
- [x] Deterministic safety rules remain uncompromised
- [x] AI remains non-authoritative
- [x] Tests executed and passing

## Handoff Notes
Run `npm run test:watch tests/unit/action/acknowledge.test.ts` to inspect the conditional write mock.
```
