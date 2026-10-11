# 43 AI Assistant Specification

## 1. Document Purpose

This document provides the technical and domain specification for the **AI Assistant** within the **Heat Action Response Engine**.

The AI Assistant is an assistive, human-supervised intelligence layer operating strictly on top of the platform's deterministic safety core:

> **The AI Assistant is a human-supervised intelligence layer that explains heat-risk assessments, summarizes site-specific actions, assists with communication, and helps authorized users navigate operational information without independently determining safety-critical outcomes.**

The AI Assistant does not calculate heat hazards, establish safety policies, or issue autonomous work-rest mandates. It acts as an interactive, natural-language interface that translates structured system outputs into actionable operational insight for human decision-makers.

---

## 2. Operational Rationale: Why AI Exists in the Platform

The deterministic core of the Heat Action Response Engine executes rigorous calculations, producing rich structured data:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ STRUCTURED SYSTEM STATE (DETERMINISTIC OUTPUTS)                        │
│ • Assessed Risk Level: HIGH (Rule AR-004, Heat Index 44.2°C)           │
│ • Primary Risk Drivers: High Ambient Temp, Direct Solar, Heavy Workload│
│ • Active Actions: 4 Pending Actions (Hydration, Shade, Rest, Briefing) │
│ • Response Deadlines: 30 minutes (21 minutes remaining)                │
│ • Escalation Status: TIER_1_WARNING (Backup Supervisor Notified)       │
│ • Worksite Profile: Sector 4 Concrete Deck (Unacclimatized Crew)       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ AI ASSISTANT NATURAL-LANGUAGE TRANSLATION                              │
│ "Site Supervisor Rahul: Your concrete pouring crew in Sector 4 is      │
│ under HIGH heat risk due to intense direct sun and heavy labor. You    │
│ have 21 minutes left to stage the 25L hydration cooler and confirm the │
│ 15-minute rest rotation before this action escalates to Safety         │
│ Manager Ananya Rao."                                                   │
└────────────────────────────────────────────────────────────────────────┘
```

In high-stress industrial and construction environments, field supervisors do not have the time to parse raw database tables, JSON payloads, or multi-tab dashboards. The AI Assistant solves the **cognitive load and communication barrier** by delivering:
* Instant plain-language explanations of *why* a worksite was flagged.
* Rapid operational summaries of overdue tasks.
* Tailored shift briefings in regional languages.
* Traceable answers grounded exclusively in verified application state.

---

## 3. Primary Users and Role-Scoped Access

The AI Assistant interacts with authenticated platform personas, enforcing strict role-based access control aligned with [19_PERMISSION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/19_PERMISSION_MODEL.md):

* **`SUPERVISOR` (e.g., Rahul Kumar):**
  * *Access Scope:* Bound strictly to assigned worksites, active shifts, and supervised workgroups.
  * *Interaction Focus:* Clarifying assigned actions, logging checklist verifications, generating vernacular crew briefings, and checking remaining response deadlines.
* **`SAFETY_MANAGER` (e.g., Ananya Rao):**
  * *Access Scope:* Multi-site enterprise visibility across all organizational facilities.
  * *Interaction Focus:* Summarizing escalated hazards, analyzing multi-site compliance trends, reviewing audit logs, and drafting incident memorandums.
* **`SYSTEM_ADMIN`:**
  * *Access Scope:* Platform infrastructure and telemetry health.
  * *Interaction Focus:* Inspecting data pipeline outages, provider API failures, and user provisioning state.

> [!CRITICAL]
> **Authorization Invariant:** The AI Assistant must never provide information to a user that the user is not permitted to view via standard dashboard screens. A field supervisor cannot query the assistant to inspect another supervisor's site or corporate safety audits.

---

## 4. MVP Assistant Capabilities

The MVP scopes seven grounded assistance capabilities:

### A. Risk Explanation
Translates complex deterministic evaluations into transparent reasoning:
* *User Query:* "Why is the North Bengaluru site marked HIGH risk today?"
* *Assistant Response:* "The deterministic risk engine classified the site as HIGH risk because the forecasted Heat Index reaches 43.8°C at 13:00, combined with heavy rebar tying work in full direct sunlight. Five protective actions have been generated to mitigate this condition."

### B. Action Explanation
Explains the operational intent and compliance requirements of specific directives:
* *User Query:* "What does action ACT-1082 require me to do?"
* *Assistant Response:* "Action ACT-1082 requires staging a minimum of 25L of chilled drinking water and electrolyte packets within 100 meters of the Sector 4 work pad before 11:30 AM. A digital checklist confirmation must be submitted upon completion."

### C. Action Summary
Aggregates pending operational obligations across active shifts:
* *User Query:* "What actions are currently pending my acknowledgment?"
* *Assistant Response:* "You have 2 pending actions for Shift Day-1: (1) Confirm hydration staging at Sector 4 (deadline in 14 minutes), and (2) Deploy mobile canopy tent to East Rebar Pad (deadline in 28 minutes)."

### D. Site Summary
Generates comprehensive operational snapshots for management:
* *User Query:* "Give me a safety briefing for the North Bengaluru site."
* *Assistant Response:* "The site is currently operating under HIGH risk. 3 of 4 morning heat actions have been verified. 1 action (Shade Deployment) is currently IN_PROGRESS. No escalations have been triggered today."

### E. Escalation Summary
Surfaces unresolved bottlenecks for executive oversight:
* *User Query:* "Which worksite actions escalated in the last 4 hours?"
* *Assistant Response:* "One action escalated: ACT-1049 (Hydration Check at West Trench) exceeded its 30-minute supervisor acknowledgment window at 10:45 AM and was escalated to Safety Manager Ananya Rao. It is currently awaiting review."

### F. Communication and Vernacular Assistance
Drafts toolbox talks and crew announcements adapted to field dialects (e.g., Kannada, Hindi):
* *User Query:* "Draft a 1-minute toolbox briefing in Kannada for my rebar team about heat rest cycles."
* *Assistant Response:* Generates an accurate, localized verbal script reinforcing the mandatory 15-minute rest breaks and buddy monitoring.

### G. Trend and Temporal Change Explanation
Explains shifts in environmental severity across consecutive updates:
* *User Query:* "Why did our risk level jump from MODERATE to HIGH at 11:00 AM?"
* *Assistant Response:* "The 11:00 AM weather refresh received an updated forecast showing relative humidity increasing from 42% to 58% while temperature held at 36°C, driving the Heat Index past the configured 42°C High Risk threshold."

---

## 5. Explicitly Prohibited AI Capabilities

To protect worker life safety and uphold legal compliance, the AI Assistant is technically prohibited from executing the following actions:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ABSOLUTE NEGATIVE BOUNDARIES — THE AI ASSISTANT MUST NEVER:           │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Independently determine, calculate, or alter a heat risk level.     │
│ 2. Create, modify, or override deterministic safety rules.             │
│ 3. Suppress, delay, or cancel a mandatory preventive action.           │
│ 4. Declare an industrial workplace "safe" based on model reasoning.   │
│ 5. Provide medical diagnoses or assess physiological symptoms.         │
│ 6. Prescribe medical treatments or emergency clinical care.            │
│ 7. Determine individual worker medical fitness or tolerance.           │
│ 8. Certify regulatory occupational safety compliance.                  │
│ 9. Bypass authorization to disclose restricted corporate data.        │
│ 10. Alter or delete immutable database audit logs.                     │
│ 11. Execute write operations without explicit human confirmation.      │
│ 12. Synthesize speculative weather data to fill missing observations. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Grounded Retrieval Architecture

The AI Assistant enforces a strict multi-stage grounding pipeline that eliminates unconstrained model generation:

```text
USER NATURAL-LANGUAGE QUESTION
              │
              ▼
AUTHENTICATION & IDENTITY VALIDATION (JWT / Session Token)
              │
              ▼
AUTHORIZATION & RBAC FILTERING (Enforce User Scopes & Permissions)
              │
              ▼
STRUCTURED CONTEXT RETRIEVAL (Query Application DB for Exact Records)
              │
              ▼
PROMPT SYNTHESIS (Inject Authoritative Payload into System Template)
              │
              ▼
AI INFERENCE ENGINE (NVIDIA AI / Approved LLM Execution)
              │
              ▼
OUTPUT VALIDATION GATES (Scan for Safety Violations & Hallucinations)
              │
              ▼
SAFE NATURAL-LANGUAGE RESPONSE DELIVERED TO USER
```

The model never receives unrestricted access to the database or internal operating system shells.

---

## 7. Authoritative Knowledge Hierarchy

When formulating responses, the AI Assistant prioritizes information according to a strict hierarchy:

```text
1. CURRENT LIVE APPLICATION STATE (Active DB Records: Risk Event, Actions, Status)
                   │ Overrides
                   ▼
2. DETERMINISTIC ENGINE OUTPUTS (Evaluated Rules, Factor Weights, Lineage)
                   │ Overrides
                   ▼
3. WORKSITE & SHIFT CONFIGURATION (Facility Profile, Crew Roster, Rosters)
                   │ Overrides
                   ▼
4. HISTORICAL AUDIT LOGS (Immutable Timeline of Past Actions & Escalations)
                   │ Overrides
                   ▼
5. APPROVED DOMAIN REFERENCES (OSHA, NDMA, NIOSH Literature in Document Store)
```

External internet training weights or general-purpose LLM heuristics must **never** supersede active application database records.

---

## 8. Retrieval-Augmented Generation (RAG) Framework

In future architectural extensions, the assistant may integrate an enterprise vector store indexing:
* Historical incident reports and worksite post-mortems.
* Specific organizational safety manuals and company heat illness prevention plans.
* Regulatory statutory guidelines (NDMA, OSHA NEP, ISO 7243).

> [!NOTE]
> In the current MVP baseline, the AI Assistant utilizes **direct structured database context injection** rather than an open vector RAG pipeline, guaranteeing absolute determinism and zero semantic search drift.

---

## 9. Conceptual Tool and Function Calling Interface

The assistant interacts with platform services through strongly typed, read-only functional interfaces:

```typescript
// Conceptual Tool Signatures (Read-Only by Default)
interface AIAssistantTools {
  getWorksiteProfile(worksiteId: string): Promise<WorksiteDetails>;
  getCurrentRiskEvent(worksiteId: string): Promise<RiskEventSnapshot>;
  getRiskHistory(worksiteId: string, hours: number): Promise<RiskEventSnapshot[]>;
  getActiveActions(worksiteId: string, shiftId?: string): Promise<ActionRecord[]>;
  getEscalationHistory(worksiteId: string): Promise<EscalationRecord[]>;
  getShiftRoster(shiftId: string): Promise<ShiftRosterSnapshot>;
  getAuditTrail(actionId: string): Promise<AuditEntry[]>;
}
```

Tool invocations are logged with complete execution parameters and strictly bound to the requesting user’s session token.

---

## 10. Read vs. Write Boundary Separation

To prevent unintended operational modifications:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ READ-ONLY ASSISTANCE (Automated)      │ WRITE-CAPABLE ACTIONS (Human-Gated)   │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • "Explain this risk assessment"      │ • Acknowledging an assigned action    │
│ • "Summarize my pending tasks"        │ • Marking a checklist verified        │
│ • "Translate briefing to Hindi"       │ • Reassigning an action to a peer     │
│ • "Compare morning vs afternoon risk" │ • Overriding a worksite safety stop   │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ Handled directly via AI generation.   │ AI may draft the intent, but the user │
│ Zero operational state change.        │ MUST click a physical confirmation UI.│
└───────────────────────────────────────┴───────────────────────────────────────┘
```

The AI Assistant is technically prohibited from executing autonomous database mutations. Consequential operational writes require explicit human confirmation.

---

## 11. Grounding and Anti-Hallucination Controls

The AI Assistant operates under strict factual grounding rules:

1. **Non-Extrapolation:** The model is instructed: *"If the provided context does not contain the answer, state: 'I do not have verified operational records to confirm that.'"*
2. **Citation of Record IDs:** Every claim regarding an action, risk event, or supervisor must reference the explicit system ID (`ACT-1082`, `WS-BLR-001`).
3. **Zero Assumption:** If shade status is missing from the database, the assistant must **not** assume shade is present; it must explicitly state that shade availability is unrecorded.

---

## 12. Explicit Handling of Environmental Uncertainty

The assistant actively surfaces data quality states to users:

* **Stale Telemetry:** *"Note: Weather telemetry is currently STALE (last updated 75 minutes ago). The system is enforcing High Risk precautions as a safety buffer."*
* **Forecast vs. Observation:** *"This assessment is based on tomorrow's 14:00 numerical forecast (39°C), not a live physical reading."*
* **Simulation Mode:** *"Warning: You are viewing SIMULATION MODE. This data is synthetic demonstration data and does not reflect real worksite conditions."*

---

## 13. Role-Adapted Interaction Modes

The assistant dynamically formats its conversational density based on the user's role:

```text
SUPERVISOR CONSOLE MODE (Tactical, Brief, Imperative)
"Rahul: Sector 4 rebar work is HIGH risk. Action ACT-1082 (Hydration) is pending.
Please stage water and acknowledge within 14 minutes."

SAFETY MANAGER CONSOLE MODE (Analytical, Aggregated, Strategic)
"Ananya: 3 worksites active today. North Bengaluru transitioned to HIGH risk at 11:00 AM.
1 action escalated due to supervisor timeout. All other mitigations proceeding on schedule."
```

---

## 14. Explainability Framework

When asked *"Why did this happen?"*, the assistant explains the complete deterministic derivation:

$$\text{Forecast/Weather Metric} \xrightarrow{\text{Evaluated by}} \text{Risk Rule} \xrightarrow{\text{Combined with}} \text{Site Profile} \xrightarrow{\text{Triggers}} \text{Action Rule} \xrightarrow{\text{Yields}} \text{Action}$$

The assistant never replies with opaque assertions (*"Because the AI determined it is dangerous"*). It cites the specific ambient values, metabolic workloads, and organizational rules that produced the outcome.

---

## 15. Illustrative Multi-Turn Dialogue Examples

### Dialogue 1: Operational Risk Explanation
* **User (Rahul Kumar, Supervisor):** "Why is my site showing High Risk right now?"
* **AI Assistant:** "Your site (North Bengaluru Construction) was assessed as HIGH risk by the deterministic engine at 10:30 AM based on:
  1. A forecasted ambient temperature of 37.5°C and 54% relative humidity (Heat Index: 44.1°C).
  2. Heavy manual metabolic workload scheduled for the Sector 4 concrete rebar crew.
  3. Direct outdoor sun exposure with limited natural shade.
  The system has generated 3 preventive actions to protect this crew. Would you like me to summarize them?"

### Dialogue 2: Action Acknowledgment Inquiry
* **User (Rahul Kumar, Supervisor):** "Can you just mark that hydration action as done for me?"
* **AI Assistant:** "I cannot mark actions complete on your behalf. To maintain safety accountability, you must physically verify that the 25L water cooler is staged in Sector 4 and click 'Confirm Verification' on your mobile dashboard card for ACT-1082."

### Dialogue 3: Ambiguous Safety Inquiry Under Stale Data
* **User (Ananya Rao, Safety Manager):** "Is the highway paving site safe to continue working?"
* **AI Assistant:** "I cannot declare the worksite safe. Currently, environmental data for the Highway Paving site is flagged as STALE due to an external weather API timeout. Under organizational safety rules, existing High Risk precautions remain active until fresh telemetry is verified. A manual site check action (ACT-1090) is currently pending supervisor confirmation."

---

## 16. AI System Failure and Graceful Degradation

If the external LLM inference provider (e.g., NVIDIA AI endpoints) experiences an outage, latency spike, or network failure:

```text
NVIDIA AI / LLM SERVICE OFFLINE
               │
               ▼
DETERMINISTIC SAFETY ENGINE UNAFFECTED
• Risk calculation continues on schedule.
• Action rules generate actions normally.
• SMS and Push notifications dispatch without delay.
• Escalation timers run uninterrupted.
• Dashboard displays standard structured data cards with template text:
  "High Heat Risk detected. Rest breaks and hydration required."
```

The AI Assistant is an **auxiliary convenience layer**. Its failure never impairs core worker safety operations.

---

## 17. Observability and Audit Telemetry

Every interaction with the AI Assistant generates a structured telemetry log:

```json
{
  "ai_interaction_log": {
    "interaction_id": "ai_log_99c10a2f",
    "timestamp_utc": "2026-10-07T05:32:10Z",
    "user_id": "usr_sup_rahul_kumar",
    "user_role": "SUPERVISOR",
    "worksite_id": "WS-BLR-NORTH-04",
    "query_intent": "RISK_EXPLANATION",
    "retrieved_context_ids": ["rsk_99c23b12", "act_88f91a0c"],
    "model_identifier": "nvidia/nemotron-mini-4b-instruct",
    "inference_latency_ms": 342,
    "guardrail_status": "PASSED",
    "tokens_consumed": {
      "prompt": 482,
      "completion": 124
    }
  }
}
```

---

## 18. Continuous Evaluation Framework

The AI Assistant is evaluated against ten rigorous safety and performance benchmarks:

1. **Groundedness Score:** Percentage of claims directly attributable to injected context ($\ge 98\%$).
2. **Hallucination Rate:** Zero tolerance ($\le 0.5\%$) on factual operational claims.
3. **Safety Policy Adherence:** 100% rejection rate against prompt injection attempts to clear safety stops.
4. **Role Boundary Enforcement:** 100% compliance in refusing unauthorized cross-site queries.
5. **Medical Advice Rejection:** 100% refusal of clinical diagnosis or treatment queries.
6. **Inference Latency:** Target $<1000\text{ms}$ response time for supervisory queries.
7. **Vernacular Fidelity:** Human evaluation of regional translation accuracy.
8. **Uncertainty Reflection:** Verification that stale/missing data states are never described as safe.
9. **Deduplication Clarity:** Ability to succinctly summarize multi-action bundles without redundancy.
10. **Tone and Demeanor:** Professional, non-alarmist, operational, and action-oriented.

---

## 19. MVP Scope vs. Future Roadmap

| Capability | MVP Baseline | Future Evolution |
| :--- | :--- | :--- |
| **Interaction Channel** | Web & Mobile Chat Assistant | Real-time two-way voice assistant on two-way radios |
| **Language Support** | English + Pre-rendered regional templates | Real-time dynamic translation across 12 Indian languages |
| **Context Scope** | Active worksite, shift, and pending actions | Historical multi-season trend forecasting & analytics |
| **Write Execution** | Read-only; human executes writes in UI | Supervised voice confirmation (*"Yes, I confirm staging"*) |

---

## 20. Final Design Principle

> **The AI Assistant exists to make authoritative safety information easier to understand and act upon; it does not become the authority that determines workplace safety.**
