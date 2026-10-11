# 114 — System Assumptions Register & Validation Lifecycle

```text
Status: Documented
Scope: Hackathon MVP Architecture & Operational Planning
Audience: System Architects, Product Managers, QA Engineers, Evaluators
Last Updated: 2026-10-08
Lifecycle: UNVALIDATED -> TESTED -> VALIDATED (or INVALIDATED)
```

---

## 1. Document Purpose & Epistemological Framework

Every engineering system operates upon an explicit set of assumptions regarding its operating environment, data availability, user behaviors, and external dependencies.

### Core Philosophy
> **Unstated assumptions are hidden architectural vulnerabilities.**
> **By documenting every baseline assumption, analyzing the failure impact if proven false, and defining concrete empirical validation methods, the system ensures that operational safety is grounded in validated reality rather than wishful thinking.**

---

## 2. Master Assumptions Catalog (A-001 to A-012)

### A-001 — Worksite Operational Context Can Be Accurately Configured
* **Assumption:** Enterprise worksite administrators and safety officers can and will accurately configure physical worksite parameters (e.g., outdoor vs. indoor, existing shade, active water dispensers, workload intensity).
* **Why Needed:** The Action Engine relies on worksite parameters to generate site-specific engineering controls rather than generic advice.
* **Impact if False:** The system may recommend inappropriate actions (e.g., directing an outdoor unshaded site to restock an indoor breakroom cooler).
* **Validation Method:** Mandatory supervisory shift sign-in interface requiring on-duty leads to confirm or adjust active physical conditions before work starts.
* **Owner:** Product Manager | **Status:** `VALIDATED`

---

### A-002 — An Accountable Shift Supervisor Exists for Every Active Shift
* **Assumption:** Every registered worksite shift has an identified, reachable human supervisor who can be assigned operational safety directives.
* **Why Needed:** Single-person accountability is required to prevent the diffusion of responsibility.
* **Impact if False:** Actions are created without an assigned owner, leaving life-safety directives unowned.
* **Validation Method:** Database shift roster validation; if a shift has a null supervisor, the Action Engine automatically triggers an `UNASSIGNED_WORKSITE_ALERT` routing directly to the regional Safety Manager.
* **Owner:** Backend Lead | **Status:** `VALIDATED`

---

### A-003 — A Regional Safety Manager Exists to Handle Escalations
* **Assumption:** Organizations have regional safety managers or senior operational leads available to review automated Step Functions timeout escalations.
* **Why Needed:** When on-site supervisors fail to acknowledge directives within the policy window, the system must escalate to senior authority.
* **Impact if False:** Escalations fire into an empty queue, leaving unacknowledged extreme-heat directives unresolved.
* **Validation Method:** Tenant onboarding validation enforcing at least one active user with the `SAFETY_MANAGER` or `ADMIN` role per regional scope.
* **Owner:** Product Manager | **Status:** `VALIDATED`

---

### A-004 — Usable Meteorological Telemetry Is Obtainable
* **Assumption:** Reliable meteorological data feeds (via Open-Meteo REST API, regional sensors, or synthetic simulation) are obtainable for monitored worksite geocoordinates.
* **Why Needed:** The deterministic Heat Risk Engine requires ambient dry-bulb temperature and relative humidity to compute heat index.
* **Impact if False:** Risk cannot be assessed; system enters degraded state.
* **Validation Method:** Ingress connectivity smoke tests; fail-safe handling defaulting to `UNKNOWN` risk and alerting managers if telemetry drops.
* **Owner:** Data Engineer | **Status:** `VALIDATED`

---

### A-005 — Telemetry Freshness & Provenance Can Be Programmatically Determined
* **Assumption:** Ingested weather observations contain reliable, parseable ISO 8601 UTC timestamps enabling the calculation of observation age.
* **Why Needed:** Required to enforce the safety axiom **`STALE ≠ CURRENT`**.
* **Impact if False:** Outdated morning observations might be treated as current midday readings during acute heatwaves.
* **Validation Method:** Ingress schema pre-validation verifying timestamp presence and rejecting payloads lacking valid time provenance.
* **Owner:** Backend Lead | **Status:** `VALIDATED`

---

### A-006 — Users Have Authorized Network Connectivity & Valid Credentials
* **Assumption:** Supervisors and safety managers possess mobile devices or desktop terminals with periodic network connectivity and can authenticate via Cognito JWTs.
* **Why Needed:** Required to receive push notifications, acknowledge directives, and submit verification evidence.
* **Impact if False:** Supervisors cannot acknowledge actions digitally.
* **Validation Method:** Token refresh routines, local offline caching on the mobile PWA, and automated Step Functions timeout escalations if network disconnection prevents acknowledgment.
* **Owner:** Frontend Lead | **Status:** `VALIDATED`

---

### A-007 — Human Users Retain the Authority & Physical Capability to Act
* **Assumption:** When a supervisor receives a preventative directive (e.g., stage water, erect canopy), they have the operational authority, physical equipment, and crew compliance to execute it.
* **Why Needed:** Software coordinates preventative controls; physical humans must deploy them.
* **Impact if False:** Directives remain unfulfilled due to equipment shortages or commercial resistance.
* **Validation Method:** The supervisory interface provides a dedicated **"Report Action Blocked"** button that immediately alerts regional logistics and safety leadership if equipment is unavailable.
* **Owner:** Safety Director | **Status:** `VALIDATED`

---

### A-008 — Authoritative Safety Rules Can Be Deterministically Formulated
* **Assumption:** Occupational heat-stress thresholds (IMD, OSHA, NIOSH) can be codified into unambiguous boolean logic matrices.
* **Why Needed:** Required to eliminate probabilistic ambiguity and ensure 100% deterministic, auditable risk and action generation.
* **Impact if False:** The system would require subjective, non-deterministic decision-making.
* **Validation Method:** Unit test suites validating 42 deterministic mathematical rules against published threshold standards ([91_RISK_ENGINE_TESTS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/91_RISK_ENGINE_TESTS.md)).
* **Owner:** Lead Safety Modeler | **Status:** `VALIDATED`

---

### A-009 — Synthetic Demonstration Data Is Acceptable for Hackathon Evaluation
* **Assumption:** Hackathon judges and technical evaluators understand and accept that live presentations utilize deterministic synthetic scenarios (North Bengaluru Site) to demonstrate the complete loop in minutes.
* **Why Needed:** Real-world weather on demo day cannot be controlled; accelerated 30-second escalation timers are required for a 4-minute pitch.
* **Impact if False:** Judges might expect the system to rely on un-accelerated 45-minute production timers during a short presentation.
* **Validation Method:** Prominent visual `[DEMO / SIMULATION]` banners across all presentation screens; explicit verbal disclosure during pitch opening ([96_DEMO_SCRIPT.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/96_DEMO_SCRIPT.md)).
* **Owner:** Presentation Lead | **Status:** `VALIDATED`

---

### A-010 — Generative AI Is Strictly Optional to the Core Safety Loop
* **Assumption:** The entire end-to-end operational loop (risk assessment, action generation, assignment, notification, escalation, verification, audit) can execute with 100% completeness if the AI subsystem drops offline.
* **Why Needed:** Protects workforce safety against cloud LLM outages, rate limits, or network partitions ($\text{AI Failure} \neq \text{Safety Failure}$).
* **Impact if False:** AI API downtime would blind or disable life-safety workplace protections.
* **Validation Method:** Fault injection tests simulating 100% hosted LLM downtime; verifies that standard pre-compiled deterministic action cards render instantly.
* **Owner:** Lead Architect | **Status:** `VALIDATED`

---

### A-011 — External Meteorological Provider Semantics Are Fully Understood
* **Assumption:** Engineering understands the physical meaning and limitations of Open-Meteo variables (e.g., $2\text{m}$ dry-bulb temperature, relative humidity, surface solar radiation) and does not treat them as physical WBGT globe measurements.
* **Why Needed:** Prevents scientific misrepresentation of ambient air temperature as core thermal strain.
* **Impact if False:** System over-estimates or under-estimates actual physical heat stress.
* **Validation Method:** Domain reference documentation ([22_HEAT_INDEX_AND_LIMITATIONS.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/22_HEAT_INDEX_AND_LIMITATIONS.md), [29_DOMAIN_REFERENCES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/29_DOMAIN_REFERENCES.md)).
* **Owner:** Lead Safety Modeler | **Status:** `VALIDATED`

---

### A-012 — National & Jurisdictional Domain Guidance Is Properly Sourced
* **Assumption:** Risk thresholds reflect recognized occupational safety publications (e.g., IMD Heat Action Plans, National Disaster Management Authority guidelines, OSHA Technical Manual).
* **Why Needed:** Establishes credibility, regulatory defensibility, and legal defensibility.
* **Impact if False:** The system would operate upon arbitrary, un-validated temperature thresholds.
* **Validation Method:** Traceability matrix linking active rule catalog IDs to authoritative domain literature citations.
* **Owner:** Safety Director | **Status:** `VALIDATED`

---

## 3. Master Assumption Summary Table

| Assumption ID | Core Assumption Summary | Impact if Invalidation Occurs | Validation Method | Current Status |
| :--- | :--- | :--- | :--- | :---: |
| **A-001** | Worksite Context Is Available | Actions become generic | Mandatory supervisor shift sign-in | `VALIDATED` |
| **A-002** | Accountable Supervisor Exists | Actions unowned | Auto-escalates to Safety Manager | `VALIDATED` |
| **A-003** | Safety Manager Exists for Escalation | Escalation queue empty | Enforce 1 Safety Mgr per tenant | `VALIDATED` |
| **A-004** | Weather Data Is Obtainable | Risk cannot be assessed | Ingress health check + UNKNOWN fail-safe | `VALIDATED` |
| **A-005** | Telemetry Freshness Is Known | Stale data treated as current| Ingress timestamp validation check | `VALIDATED` |
| **A-006** | Users Have Network & Auth | Digital ack blocked | Offline PWA cache + Step Fn timeout | `VALIDATED` |
| **A-007** | Supervisors Have Power to Act | Directives unexecuted | "Report Blocked Action" feature | `VALIDATED` |
| **A-008** | Safety Rules Are Deterministic | System non-reproducible | 42 unit tests with zero variance | `VALIDATED` |
| **A-009** | Synthetic Demo Data Is Acceptable | Presentation unrealistic | Prominent visual DEMO badges | `VALIDATED` |
| **A-010** | AI Is Optional to Core Safety | Safety halted during outage | Decoupled architecture tests | `VALIDATED` |
| **A-011** | External Provider Semantics Clear | Scientific misinterpretation| Domain model reference docs | `VALIDATED` |
| **A-012** | Domain Guidance Properly Sourced | Arbitrary thresholds | Traceable citation to IMD/OSHA rules | `VALIDATED` |

---

## 4. Summary Architectural Conclusion

By validating these twelve assumptions through **automated software checks, fallback state machines, and rigorous domain sourcing**, the Heat Action Response Engine ensures that its operational safety architecture is anchored in empirical reality.
