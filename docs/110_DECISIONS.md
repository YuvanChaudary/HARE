# 110 — Architecture & Product Decision Records (ADR)

```text
Status: Documented
Scope: Hackathon MVP Architecture & Governance
Audience: System Architects, Product Leads, Security Engineers, Evaluators
Last Updated: 2026-10-08
Governance Role: Authoritative Architectural Decision Record (ADR)
```

---

## 1. Document Purpose & ADR Governance

This document records the foundational architectural, product, and safety decisions governing the **Heat Action Response Engine**.

### Decision Record Template
Every formal decision is captured using a standardized ADR structure:
* **Decision ID:** Unique sequential identifier (`DEC-001`, `DEC-002`, ...).
* **Title:** Concise statement of the architectural choice.
* **Status:** `PROPOSED`, `ACCEPTED`, `SUPERSEDED`, `REJECTED`, or `PENDING VERIFICATION`.
* **Date:** Ratification or documentation date (ISO 8601).
* **Context:** The operational, technical, or regulatory context motivating the decision.
* **Decision:** The binding architectural commitment.
* **Rationale:** The justification for why this option was chosen over alternatives.
* **Alternatives Considered:** Technical paths evaluated and rejected.
* **Consequences:** Positive benefits, operational tradeoffs, and systemic constraints.
* **Related Documents:** Cross-references to detailed specifications in `docs/`.

---

## 2. Foundational Decision Records

### DEC-001 — Software-First MVP (No Mandatory IoT Hardware)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Industrial worksites face dangerous heat stress, but deploying custom physical IoT sensors across hundreds of worksites introduces high capital costs, supply-chain friction, and complex physical maintenance.
* **Decision:** Build the hackathon MVP as a pure **software-first platform** consuming existing public/commercial meteorological feeds (e.g., Open-Meteo, IMD) rather than requiring proprietary on-site IoT hardware.
* **Rationale:** Maximizes immediate deployment speed, eliminates hardware procurement blockers, enables instant multi-site onboarding, and focuses engineering resources on the primary differentiator: the operational action and accountability workflow.
* **Alternatives Considered:** (1) Mandating custom ESP32/LoRaWAN microclimate sensor nodes on site (rejected: cost, battery, and hackathon scope risk); (2) Wearable worker sensor integration (rejected: high privacy friction, battery constraints).
* **Consequences:** Eliminates hardware dependency. Ambient macro-weather is used as an operational proxy; localized radiant microclimates (e.g., rebar radiating heat) are accounted for via worksite contextual offsets rather than live physical measurement.
* **Related Documents:** [04_MVP_SCOPE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/04_MVP_SCOPE.md), [05_NON_GOALS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/05_NON_GOALS.md).

---

### DEC-002 — Deterministic Safety Authority
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Life-safety operations demand absolute predictability, auditability, and legal non-repudiation. Generative probabilistic models are prone to hallucinations, non-determinism, and drift.
* **Decision:** All consequential safety calculations—including heat risk classification, threshold breaches, mandatory action generation, and escalation deadlines—are derived exclusively from **100% deterministic code and versioned rule matrices**.
* **Rationale:** Deterministic systems are mathematically reproducible, unit-testable at threshold boundaries, transparent to regulators, and fail safely when inputs are missing. Generative AI is prohibited from holding safety decision authority.
* **Alternatives Considered:** (1) LLM agent autonomously evaluating risk and recommending ad-hoc actions (rejected: un-auditable, non-deterministic, dangerous safety failure modes).
* **Consequences:** Every risk assessment and action directive can be audited against an exact `rule_version`. Testing can mathematically guarantee boundary behavior ($T \pm \epsilon$).
* **Related Documents:** [20_HEAT_RISK_ENGINE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/20_HEAT_RISK_ENGINE.md), [27_RISK_RULES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/27_RISK_RULES.md), [91_RISK_ENGINE_TESTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/91_RISK_ENGINE_TESTS.md).

---

### DEC-003 — Human-in-the-Loop Supervisory Accountability
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Fully automated industrial shutdown systems face severe resistance from site operators and can trigger dangerous false-positive work interruptions or false-negative neglect.
* **Decision:** Maintain an explicit **human-in-the-loop operational architecture**. The software prescribes, assigns, notifies, and escalates, but certified human safety professionals and on-site supervisors retain final execution responsibility.
* **Rationale:** Front-line supervisors possess physical situational awareness (e.g., sudden cloud cover, equipment delays, individual crew fatigue) that software cannot sense. The platform empowers human judgment rather than attempting to autonomously replace it.
* **Alternatives Considered:** (1) Autonomous plant shutdown via SCADA integration (rejected: out of scope, liability risks); (2) Unassigned broadcasting of alerts to generic chat channels (rejected: causes diffusion of responsibility).
* **Consequences:** Requires responsive, low-friction mobile interfaces for supervisors. Escalation mechanisms are required to handle human non-responsiveness.
* **Related Documents:** [12_USER_FLOWS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/12_USER_FLOWS.md), [16_ACTION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/16_ACTION_MODEL.md).

---

### DEC-004 — Action-Layer Product Differentiation
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Weather apps, heat-index calculators, and municipal heat alerts already exist in abundance. Simply displaying another heat warning provides zero incremental operational value.
* **Decision:** Define the platform’s core differentiation as the **operational execution and accountability loop**:
  $$\text{Heat Signal} \rightarrow \text{Risk Assessment} \rightarrow \text{Worksite Context} \rightarrow \text{Action} \rightarrow \text{Assign} \rightarrow \text{Notify} \rightarrow \text{Acknowledge} \rightarrow \text{Escalate} \rightarrow \text{Verify} \rightarrow \text{Audit}$$
* **Rationale:** Solves the primary cause of industrial heat casualties: the breakdown between knowing conditions are hazardous and ensuring preventative controls (shade, water, rest cycles) are physically staged on site.
* **Alternatives Considered:** (1) Building a hyper-accurate weather forecasting model (rejected: commodity space, doesn't drive workplace action); (2) Building a retroactive EHS incident reporting tool (rejected: reactive, not preventative).
* **Consequences:** All engineering sprints prioritize the closed-loop feedback mechanism (acknowledgment, escalation, verification) over raw meteorological complexity.
* **Related Documents:** [08_DIFFERENTIATION.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/08_DIFFERENTIATION.md), [40_ACTION_ENGINE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/40_ACTION_ENGINE.md).

---

### DEC-005 — Open-Meteo for Weather Data Ingestion
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** The system requires reliable, globally accessible, hourly meteorological feeds (dry-bulb temperature, relative humidity, solar radiation) mapped to worksite geocoordinates without restrictive enterprise licensing costs during MVP.
* **Decision:** Utilize the **Open-Meteo API** as the primary external meteorological data provider, retaining full telemetry provenance metadata (`source_type`, `observation_age_seconds`).
* **Rationale:** Provides high-quality numerical weather prediction feeds, generous non-commercial rate limits, structured JSON outputs, and comprehensive hourly variables without requiring API key management during local evaluation.
* **Alternatives Considered:** (1) Direct automated scraping of Indian Meteorological Department (IMD) portals (rejected: fragile, lacks stable REST contracts); (2) Commercial weather APIs like AccuWeather/WeatherAPI (rejected: cost, vendor lock-in).
* **Consequences:** External telemetry represents regional model grids, not localized on-site microclimates. Fallback caching and stale-data flags must be maintained.
* **Related Documents:** [31_OPEN_METEO.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/31_OPEN_METEO.md), [33_WEATHER_DATA_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/33_WEATHER_DATA_MODEL.md).

---

### DEC-006 — IMD Guidance as Domain Context (Not Live Real-Time API)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** The India Meteorological Department (IMD) issues authoritative regional heatwave criteria, color-coded alerts (Yellow, Orange, Red), and National Disaster Management Authority (NDMA) guidelines.
* **Decision:** Treat IMD standards as **domain reference thresholds and contextual guidance** within the deterministic rules catalog rather than relying on a direct live IMD REST API integration for MVP real-time polling.
* **Rationale:** As of MVP development, public automated IMD APIs lack the sub-hourly uptime SLAs and structured geocoded REST interfaces required for live cloud event triggers. Open-Meteo provides reliable ingestion telemetry, while IMD provides the authoritative threshold logic.
* **Alternatives Considered:** (1) Attempting un-authenticated web scraping of regional IMD bulletins (rejected: high failure risk, zero SLA).
* **Consequences:** Retains full fidelity to official Indian safety guidelines while protecting application uptime. Marked as: `IMD GUIDANCE/CONTEXT IMPLEMENTED; DIRECT IMD API LIVE INTEGRATION PENDING IMPLEMENTATION VERIFICATION`.
* **Related Documents:** [32_IMD_INTEGRATION.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/32_IMD_INTEGRATION.md), [29_DOMAIN_REFERENCES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/29_DOMAIN_REFERENCES.md).

---

### DEC-007 — RESTful API Architecture (`/api/v1/*`)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Client interfaces (desktop dashboard, mobile PWA, external webhooks) require standard, predictable, and cacheable interfaces to interact with backend services.
* **Decision:** Implement resource-oriented **RESTful APIs** using standard HTTP methods, JSON payloads, and RFC 7807 problem detail error envelopes, prefixed canonically with `/api/v1/`.
* **Rationale:** High interoperability, seamless integration with AWS API Gateway, established tooling for contract testing, and clear authorization boundaries.
* **Alternatives Considered:** (1) GraphQL (rejected: excessive complexity for simple operational state machines, harder caching at edge); (2) gRPC (rejected: browser PWA integration friction).
* **Consequences:** Standardized request/response envelopes across all endpoints. Strict HTTP status code mapping (401, 403, 404, 409, 422).
* **Related Documents:** [63_API_ARCHITECTURE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/63_API_ARCHITECTURE.md), [70_API_CONTRACTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/70_API_CONTRACTS.md).

---

### DEC-008 — AWS Serverless Cloud Architecture
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Workplace heat monitoring is highly bursty: extreme activity during summer midday shifts, zero activity during cold seasons or overnight.
* **Decision:** Deploy on an **AWS Serverless Cloud Mesh**: AWS API Gateway, AWS Lambda (Node.js/TypeScript), Amazon DynamoDB, Amazon EventBridge, AWS Step Functions, Amazon CloudWatch, and AWS Secrets Manager.
* **Rationale:** Zero idle compute cost, automatic scaling during sudden heatwaves, minimal operational maintenance, native integration between event buses and state machines, and fine-grained IAM security per microservice.
* **Alternatives Considered:** (1) Containerized Kubernetes cluster on EKS (rejected: high fixed idle cost, complex cluster management for MVP); (2) Traditional monolithic VM on EC2 (rejected: single point of failure, manual scaling).
* **Consequences:** Lambda functions are subject to minor cold starts (~300ms), mitigated by lightweight bundle bundling. Relies on managed AWS services.
* **Related Documents:** [64_AWS_ARCHITECTURE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/64_AWS_ARCHITECTURE.md), [65_AWS_SERVICES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/65_AWS_SERVICES.md).

---

### DEC-009 — DynamoDB Single-Table Design with Atomic Transactions
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** The system requires sub-10ms operational queries and atomic coupling between action state changes and compliance audit logging.
* **Decision:** Utilize **Amazon DynamoDB** with a single-table architecture utilizing composite partition/sort keys (`PK`, `SK`), conditional writes, and atomic transactions (`TransactWriteItems`).
* **Rationale:** Seamless serverless integration, predictable horizontal scaling, and native transactional guarantees. `TransactWriteItems` ensures that updating an action status and recording an audit record succeed or fail together atomically.
* **Alternatives Considered:** (1) Relational PostgreSQL on RDS (rejected: fixed instance costs, connection pooling overhead with Lambda); (2) DocumentDB / MongoDB (rejected: higher operational overhead in serverless).
* **Consequences:** Requires careful upfront access pattern design. Complex analytical queries are deferred to audit export partitions.
* **Related Documents:** [68_DYNAMODB.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/68_DYNAMODB.md), [85_AUDIT_LOGGING.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/85_AUDIT_LOGGING.md).

---

### DEC-010 — Decoupled Event-Driven Orchestration via EventBridge & Step Functions
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** The system must manage asynchronous timers (waiting 15 minutes for supervisor response) without holding active HTTP connections or compute threads open.
* **Decision:** Decouple domain events via an **Amazon EventBridge custom event bus** and orchestrate escalation timeout timers using **AWS Step Functions state machines**.
* **Rationale:** Step Functions provides native, resilient stateful waiting with zero compute cost while waiting. If a supervisor acknowledges the action, EventBridge dispatches an event that cleanly cancels the active Step Function execution.
* **Alternatives Considered:** (1) Polling database via scheduled cron Lambda every minute (rejected: inefficient, introduces latency drift); (2) Redis delayed queues (rejected: requires persistent managed infrastructure).
* **Consequences:** State machine executions are visible and traceable directly in the AWS console, providing operational visibility.
* **Related Documents:** [69_EVENTBRIDGE_STEP_FUNCTIONS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/69_EVENTBRIDGE_STEP_FUNCTIONS.md), [17_ESCALATION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/17_ESCALATION_MODEL.md).

---

### DEC-011 — Multi-Tenant Role-Based Access Control (RBAC/ABAC)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Multiple commercial enterprises and distributed worksites operate on the platform; users must be restricted strictly to authorized operational scopes.
* **Decision:** Implement **deny-by-default multi-tenant RBAC** scoped by `organization_id` and `worksite_id` across three primary roles: `ADMIN`, `SAFETY_MANAGER`, and `SUPERVISOR`.
* **Rationale:** Prevents Broken Object Level Authorization (BOLA/IDOR), isolates competitor data, and ensures supervisors can only interact with actions assigned to their active worksite.
* **Alternatives Considered:** (1) Flat role model without tenant scoping (rejected: catastrophic multi-tenant data leakage risk).
* **Consequences:** Every API request must validate token claims against resource path parameters before invoking application services.
* **Related Documents:** [19_PERMISSION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/19_PERMISSION_MODEL.md), [83_AUTHORIZATION.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/83_AUTHORIZATION.md).

---

### DEC-012 — Append-Only Immutable Compliance Audit Ledger
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** In the event of workplace heat stress investigations or legal regulatory reviews, organizations must prove preventative due diligence without fear of altered logs.
* **Decision:** Separate compliance audit logging from ordinary application diagnostics. Audit records are written to a dedicated **append-only DynamoDB audit partition** protected by IAM policies that prohibit update and delete actions.
* **Rationale:** Establishes non-repudiation, answers *"Who did what, to which resource, when, and what changed,"* and protects safety managers against wrongful negligence accusations.
* **Alternatives Considered:** (1) Storing audit events inside CloudWatch application logs (rejected: ephemeral retention, difficult to query from frontend, mixed with debug noise).
* **Consequences:** Audit partition grows monotonically. Strict schema requirements for `correlation_id` and actor attribution.
* **Related Documents:** [78_AUDIT_API.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/78_AUDIT_API.md), [85_AUDIT_LOGGING.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/85_AUDIT_LOGGING.md).

---

### DEC-013 — Generative AI as an Assistive Communication Layer Only
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Generative AI provides excellent language synthesis, translation, and summarization, but cannot be trusted with autonomous life-safety calculations.
* **Decision:** Constrain AI models strictly to **assistive language tasks**: generating 30-second morning briefings, translating directives into regional vernacular languages, and answering contextual Q&A based on pre-calculated backend facts.
* **Rationale:** Completely decouples safety from AI availability. If the AI service drops offline, the deterministic safety engine continues operating with zero impairment ($\text{AI Failure} \neq \text{Safety Failure}$).
* **Alternatives Considered:** (1) Autonomous AI safety agent that decides when to halt work (rejected: non-deterministic, dangerous, regulatory liability).
* **Consequences:** All AI outputs are labeled as "AI-Generated Summary" alongside an authoritative "System Directive" badge.
* **Related Documents:** [43_AI_ASSISTANT.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/43_AI_ASSISTANT.md), [87_AI_SAFETY.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/87_AI_SAFETY.md), [94_AI_EVALUATION.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/94_AI_EVALUATION.md).

---

### DEC-014 — Deterministic Simulation Sandbox Mode
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Hackathon presentations, automated CI regression tests, and safety officer training require reproducible, reliable environmental triggers independent of real-world outdoor weather on demo day.
* **Decision:** Build a first-class **Simulation Mode** ([38_SIMULATION_MODE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/38_SIMULATION_MODE.md)) that feeds deterministic synthetic weather scenarios into the identical downstream risk and action engines.
* **Rationale:** Allows evaluators to witness high-heat risk generation, supervisor non-response, Step Functions escalation, and verification in a controlled 90-second run.
* **Alternatives Considered:** (1) Relying on live outdoor weather during judging (rejected: if demo day is cloudy or 22°C, the demo fails to trigger high-heat actions).
* **Consequences:** All simulation data must be explicitly flagged with `is_simulation: true` and rendered with a high-visibility amber demonstration badge to prevent confusion with legal safety records.
* **Related Documents:** [38_SIMULATION_MODE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/38_SIMULATION_MODE.md), [97_DEMO_RUNBOOK.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/97_DEMO_RUNBOOK.md).

---

### DEC-015 — Absolute Prohibition on Medical Decision-Making & Clinical Diagnosis
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Software applications crossing into clinical triage, medical diagnosis, or physiological monitoring face severe regulatory medical device scrutiny and introduce fatal liability if inaccurate.
* **Decision:** The Heat Action Response Engine is strictly defined as an **operational workplace coordination tool**. It is explicitly prohibited from diagnosing heat illness, prescribing treatments, evaluating individual medical fitness, or replacing emergency services.
* **Rationale:** Protects human lives by directing acute medical crises immediately to emergency medical professionals (112 / 911 / site medics) rather than encouraging software reliance.
* **Alternatives Considered:** (1) Algorithmic worker heatstroke triage calculator (rejected: dangerous, uncertified clinical practice).
* **Consequences:** Mandatory UI disclaimers on all screens; AI guardrails enforce instantaneous hard refusals when prompted with medical queries.
* **Related Documents:** [88_MEDICAL_DISCLAIMER.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/88_MEDICAL_DISCLAIMER.md).

---

### DEC-016 — Zero Worker Surveillance in MVP (Anti-Surveillance Boundary)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** Safety technologies frequently suffer from "mission creep," mutating into invasive employee monitoring tools that track continuous GPS, heart rates, bathroom breaks, and productivity.
* **Decision:** Enforce an impermeable **anti-surveillance boundary**. The MVP tracks worksite environmental conditions and supervisor administrative responsiveness, never individual worker movements or biometric telemetry.
* **Rationale:** Protects worker civil liberties, complies with data protection statutes (e.g., GDPR, India DPDP Act), and fosters workforce trust.
* **Alternatives Considered:** (1) Individual worker wearable heart-rate trackers (rejected: intrusive, expensive, battery issues, privacy risk).
* **Consequences:** Data models are keyed by worksite and shift cohorts, never individual worker physiological profiles.
* **Related Documents:** [81_DATA_PRIVACY.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/81_DATA_PRIVACY.md), [86_WORKER_DATA_PROTECTION.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/86_WORKER_DATA_PROTECTION.md).

---

### DEC-017 — Progressive Scope Delivery (MVP $\rightarrow$ Phase 1 $\rightarrow$ Future Vision)
* **Status:** `ACCEPTED`
* **Date:** 2026-10-08
* **Context:** A 5-day hackathon sprint requires aggressive scope control to avoid delivering unfinished, unstable features.
* **Decision:** Partition all platform capabilities into strict lifecycle phases: **MVP (Days 1–5)**, **Phase 1 (Post-Hackathon Hardening)**, and **Future Vision (Enterprise & IoT)**.
* **Rationale:** Guarantees that the core closed operational loop is fully completed, rigorously tested, and demonstrably rock-solid before expanding into secondary features.
* **Alternatives Considered:** (1) Attempting full WhatsApp API integration, IoT sensor hardware, and complex ML models simultaneously (rejected: guaranteed failure to deliver working E2E loop).
* **Consequences:** Features outside MVP scope are cleanly documented in the roadmap and never represented as implemented.
* **Related Documents:** [04_MVP_SCOPE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/04_MVP_SCOPE.md), [117_FUTURE_ROADMAP.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/117_FUTURE_ROADMAP.md).

---

## 3. Master Decision Summary Table

| Decision ID | Decision Title | Status | Primary Rationale | System Impact |
| :--- | :--- | :---: | :--- | :--- |
| **DEC-001** | Software-First MVP | `ACCEPTED` | Eliminates physical hardware blockers; rapid multi-site onboarding | Focuses on operational action loop |
| **DEC-002** | Deterministic Safety Authority | `ACCEPTED` | Mathematical auditability, reproducibility, and safety certifiability | AI forbidden from safety calculations |
| **DEC-003** | Human-in-the-Loop | `ACCEPTED` | Empowers on-site supervisory judgment rather than replacing it | Requires responsive supervisory UI |
| **DEC-004** | Action-Layer Differentiation | `ACCEPTED` | Solves the information-to-action gap; moves beyond passive warnings | Core product loop centered on actions |
| **DEC-005** | Open-Meteo Weather Ingestion | `ACCEPTED` | Accessible, geocoded, hourly telemetry without licensing blockers | Telemetry reflects regional grid models |
| **DEC-006** | IMD Domain Context (No Live API) | `ACCEPTED` | Aligns with national thresholds while avoiding unstable scraping APIs | IMD guidance used; direct API pending |
| **DEC-007** | RESTful API (`/api/v1/*`) | `ACCEPTED` | Predictable, standard, cacheable interfaces with RFC 7807 errors | High interoperability across clients |
| **DEC-008** | AWS Serverless Cloud Architecture | `ACCEPTED` | Zero idle cost; instant elasticity during summer heatwaves | Scalable, resilient microservices |
| **DEC-009** | DynamoDB Single-Table Design | `ACCEPTED` | Sub-10ms queries; atomic transactions coupling state to audit | Single-table access patterns enforced |
| **DEC-010** | EventBridge & Step Functions | `ACCEPTED` | Stateful countdown timers without holding open compute threads | Reliable automated escalations |
| **DEC-011** | Multi-Tenant RBAC/ABAC | `ACCEPTED` | Deny-by-default isolation; prevents BOLA/IDOR data leakage | Scope validation on all endpoints |
| **DEC-012** | Immutable Audit Ledger | `ACCEPTED` | Non-repudiation; legal compliance defense for safety officers | Append-only partition; delete blocked |
| **DEC-013** | AI as Assistive Layer Only | `ACCEPTED` | Natural-language briefings without compromising deterministic safety | AI downtime never halts safety |
| **DEC-014** | Simulation Sandbox Mode | `ACCEPTED` | Deterministic, reproducible live demonstrations and CI tests | Demo data partitioned from legal records |
| **DEC-015** | No Medical Decision-Making | `ACCEPTED` | Directs medical crises to emergency services; prevents liability | UI disclaimers; AI medical refusals |
| **DEC-016** | Zero Worker Surveillance | `ACCEPTED` | Protects worker civil liberties; complies with privacy laws | Tracks worksites, not worker bodies |
| **DEC-017** | Progressive Scope Delivery | `ACCEPTED` | Ensures hackathon delivery of rock-solid vertical core | Transparent phasing (MVP vs Roadmap) |

---

## 4. Summary Architectural Conclusion

These seventeen decisions establish an unshakeable architectural foundation. By anchoring the platform in **software-first execution, deterministic safety authority, serverless cloud resilience, strict worker privacy, and human accountability**, the Heat Action Response Engine ensures that every technical trade-off directly serves the mission: **from heat warning to verified workplace action.**
