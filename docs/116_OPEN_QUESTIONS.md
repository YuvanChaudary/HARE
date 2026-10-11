# 116 — Open Architectural & Operational Questions Register

```text
Status: Documented
Scope: Hackathon MVP to Production Transition Governance
Audience: System Architects, Product Leads, Security Engineers, Domain Specialists
Last Updated: 2026-10-08
Integrity Standard: Genuinely Unresolved Questions; No False Certainty
```

---

## 1. Document Purpose & Governance

This document records the **active, unresolved architectural, domain, and operational questions** confronting the Heat Action Response Engine project.

### Core Philosophy
> **A credible engineering architecture does not pretend that every complex domain problem has already been solved.**
> **By systematically cataloging genuine open questions, defining why they matter, establishing decision deadlines, and assigning explicit owners, the team ensures that critical design choices are resolved through empirical investigation rather than accidental drift.**

---

## 2. Master Open Questions Register (Q-001 to Q-016)

### Q-001 — Which Exact Heat-Risk Methodology Should Be Authoritative Across Jurisdictions?
* **Question:** Should the platform enforce a single unified heat index equation (e.g., US NOAA/OSHA Rothfusz regression), or dynamically switch calculation methodologies (e.g., IMD Heat Index criteria, ISO 7243 WBGT, or BOM Heatwave Index) based on worksite geographic coordinates?
* **Why It Matters:** Applying US OSHA thresholds to Indian construction sites or Australian mines introduces regulatory mismatch and inappropriate operational curtailments.
* **Current Understanding:** For the Hackathon MVP, we implement a dual-mode engine: a baseline standard Heat Index equation with documented threshold mappings reflecting IMD guidance for Indian demonstration scenarios.
* **Decision Needed:** Define the formal multi-jurisdiction rule resolution protocol for Phase 1 enterprise deployments.
* **Owner:** Lead Safety Modeler | **Priority:** `HIGH` | **Status:** `OPEN` | **Target Date:** Phase 1 Architecture Sprint

---

### Q-002 — What Is the Minimum Validated Environmental Input Set Required for a Legal Risk Assessment?
* **Question:** Is dry-bulb temperature and relative humidity sufficient to compute authoritative operational risk, or must direct solar radiation ($W/m^2$) and wind speed ($m/s$) be mandatory?
* **Why It Matters:** If solar radiation is mandatory, missing radiation readings from simpler weather stations would invalidate assessments; if omitted, radiant heat strain in direct sun may be underestimated.
* **Current Understanding:** MVP mandates dry-bulb temperature and relative humidity as non-negotiable inputs; solar radiation is treated as an optional modifier that elevates risk tier when present.
* **Decision Needed:** Ratify whether wind speed and solar radiation should be legally mandatory for specific industrial archetypes (e.g., open-cast mining).
* **Owner:** Lead Safety Modeler | **Priority:** `HIGH` | **Status:** `INVESTIGATING` | **Target Date:** Phase 1 Review

---

### Q-003 — How Should Conflicting Environmental Sources Be Deterministically Resolved?
* **Question:** When an on-site IoT sensor reports 34°C while regional meteorological satellite interpolation reports 40°C, which source takes precedence?
* **Why It Matters:** Conflicting data creates operational ambiguity: site supervisors may dispute alerts, while corporate safety directors demand conservative protection.
* **Current Understanding:** Current MVP logic applies a fail-safe stance: detect the conflict and adopt the **higher-risk protective tier**.
* **Decision Needed:** Establish a formal Sensor Provenance & Calibration Trust Score weighting algorithm for production.
* **Owner:** Data Engineer | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 2 Sprint

---

### Q-004 — What Exact Data Freshness Window Qualifies Telemetry as "Stale"?
* **Question:** At what exact elapsed time threshold ($30\text{ min}$, $60\text{ min}$, or $120\text{ min}$) must weather telemetry transition to `DATA_STALE` and trigger supervisory warning banners?
* **Why It Matters:** Setting the window too short triggers nuisance alarms during transient API retries; setting it too long allows midday heat spikes to slip by unnoticed.
* **Current Understanding:** Currently configured to 60 minutes for live operational polling.
* **Decision Needed:** Determine whether the staleness window should dynamically adjust based on time of day (e.g., 30 minutes during peak thermal velocity between 11:00 AM and 3:00 PM; 120 minutes early morning).
* **Owner:** Backend Lead | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 1 Polish

---

### Q-005 — Which Action Directives Are Legally Authoritative Across Industry Verticals?
* **Question:** How do we establish the authoritative rule provenance mapping specific thermal thresholds to mandatory physical controls (canopies, water volume quotas, 45/15 rest cycles) across diverse industries (construction vs. foundries vs. agriculture)?
* **Why It Matters:** Recommending non-standard rest cycles could conflict with collective bargaining agreements or established company Heat Illness Prevention Plans (HIPPs).
* **Current Understanding:** MVP implements 9 canonical action types based on OSHA and IMD general guidance ([41_ACTION_RULES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/41_ACTION_RULES.md)).
* **Decision Needed:** Build an administrative visual rule configuration portal allowing enterprise safety directors to import and certify their corporate safety policies.
* **Owner:** Product Manager | **Priority:** `HIGH` | **Status:** `OPEN` | **Target Date:** Phase 2 Design

---

### Q-006 — Which Exact NVIDIA AI Model / SDK Will Be Verified for Production Deployment?
* **Question:** Which specific NVIDIA NIM microservice (e.g., Nemotron-4-340B-Instruct, Llama-3-70B-Instruct-NIM, or a quantized 8B model) delivers the optimal balance of inference latency ($<1500\text{ms}$), memory footprint, and vernacular translation fidelity?
* **Why It Matters:** Cloud inference pricing, container GPU memory allocation, and operational latency directly depend on the chosen model architecture.
* **Current Understanding:** Current architecture defines clean integration adapters, labeled as: `NVIDIA NIM INTEGRATION PENDING IMPLEMENTATION VERIFICATION`.
* **Decision Needed:** Benchmark latency, token pricing, and guardrail compatibility across candidate NIM containers on enterprise GPU instances.
* **Owner:** AI Lead | **Priority:** `MEDIUM` | **Status:** `INVESTIGATING` | **Target Date:** Post-Hackathon Phase 1

---

### Q-007 — What Is the Minimal Set of AI Capabilities That Add True Operational Value?
* **Question:** Beyond 30-second morning briefing scripts and multilingual translation, do front-line supervisors actually need conversational chat interfaces during an active shift?
* **Why It Matters:** Front-line supervisors operating in noisy, sun-glared field conditions do not have time for multi-turn conversational chat.
* **Current Understanding:** MVP prioritizes 1-click pre-compiled briefing chips over open-ended conversational chat.
* **Decision Needed:** Conduct field user testing with construction supervisors to evaluate whether conversational Q&A is utilized or should be replaced with audio voice synthesis.
* **Owner:** UX Lead | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 1 Usability Review

---

### Q-008 — Which Notification Channel Delivers the Highest Field Acknowledgment Rate?
* **Question:** Is SMS, WhatsApp, Web Push, or automated Voice IVR phone calls the most resilient channel for reaching front-line industrial supervisors?
* **Why It Matters:** In emerging markets (e.g., India), WhatsApp Business messages achieve significantly higher open rates than SMS, while in Western markets SMS is standard.
* **Current Understanding:** MVP implements In-App Center and Web Push, with simulated SMS payloads.
* **Decision Needed:** Select primary enterprise telecom aggregators (Twilio vs. AWS End User Messaging) and implement WhatsApp Business API templates.
* **Owner:** Integration Lead | **Priority:** `HIGH` | **Status:** `OPEN` | **Target Date:** Phase 1 Sprint

---

### Q-009 — What Constitutes Legally Sufficient Physical Verification Evidence in the MVP?
* **Question:** Is a digital checklist signed by a Safety Manager sufficient for legal verification, or must the system mandate geo-tagged photo uploads and physical water meter readings?
* **Why It Matters:** Balancing operational friction (making safety managers upload photos for every canopy) against legal evidentiary strength during OSHA or labor board audits.
* **Current Understanding:** MVP requires safety managers to select inspection method (`PHYSICAL_INSPECTION`, `PHOTO_EVIDENCE`, `CHECKLIST`) and submit mandatory descriptive notes.
* **Decision Needed:** Define when photo evidence is mandatory (e.g., only on `CRITICAL` risk work-rest plan verifications).
* **Owner:** Legal Counsel / Safety Director | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 2 Policy

---

### Q-010 — How Should Enterprise Multi-Tenant Data Isolation Be Formally Certified?
* **Question:** Is DynamoDB single-table partition key prefixing (`tenant_id#...`) sufficient for enterprise defense contractors and tier-1 construction firms, or will enterprise clients demand physically isolated DynamoDB tables or dedicated AWS accounts?
* **Why It Matters:** Enterprise security compliance reviews may reject logical software partitioning for high-profile defense or infrastructure projects.
* **Current Understanding:** Single-table multi-tenant isolation enforced via Cognito JWT claims and DynamoDB partition prefixes.
* **Decision Needed:** Architect an optional single-tenant CloudFormation/CDK deployment template for high-security enterprise clients.
* **Owner:** Security Engineer | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 2 Security Review

---

### Q-011 — What Is the Regulatory-Compliant Compliance Audit Retention Window?
* **Question:** How many years must immutable audit records be retained in DynamoDB before archiving to Amazon S3 Glacier: 3 years (standard OSHA recordkeeping), 5 years, or 7 years?
* **Why It Matters:** Indefinite retention in DynamoDB increases primary storage costs; premature deletion creates legal liability during worker injury compensation litigation.
* **Current Understanding:** MVP retains all audit records indefinitely; production will implement DynamoDB Time-To-Live (TTL) routing expired records to Glacier.
* **Decision Needed:** Establish formal data retention and archiving lifecycle policies aligned with regional occupational statutes.
* **Owner:** Compliance Officer | **Priority:** `LOW` | **Status:** `OPEN` | **Target Date:** Phase 2 Governance

---

### Q-012 — Which Worker-Related Operational Data Should Be Retained vs. Purged at Shift End?
* **Question:** To maximize worker privacy, should shift roster associations (linking a supervisor to specific worker counts) be permanently archived or purged after shift verification?
* **Why It Matters:** Balancing accountability (knowing which crew was exposed) against privacy-by-design principles under the India DPDP Act and GDPR.
* **Current Understanding:** System stores aggregate cohort counts and supervisor IDs; individual worker biometric data is never collected.
* **Decision Needed:** Define precise data scrubbing schedules for non-essential operational metadata.
* **Owner:** Data Protection Officer | **Priority:** `MEDIUM` | **Status:** `OPEN` | **Target Date:** Phase 1 Privacy Review

---

### Q-013 — Which Specific On-Site IoT Environmental Sensors Add Meaningful Value Beyond Weather APIs?
* **Question:** In Phase 3 hardware expansion, should the platform integrate black-globe temperature sensors, ultrasonic wind anemometers, or simple ambient DHT22 modules?
* **Why It Matters:** Black-globe sensors allow true physical WBGT calculations but require expensive calibration; cheap ambient sensors add little value over Open-Meteo.
* **Current Understanding:** Software-first for MVP; on-site sensor integration deferred to Phase 3.
* **Decision Needed:** Partner with industrial environmental hardware manufacturers (e.g., Davis Instruments, TSI Quest) rather than developing custom sensor hardware from scratch.
* **Owner:** Hardware Architect | **Priority:** `LOW` | **Status:** `DEFERRED` | **Target Date:** Phase 3 Roadmap

---

### Q-014 — Which Regional Vernacular Languages Must Be Prioritized for Multi-Language Translation?
* **Question:** In the Indian construction sector, what is the precise prioritization sequence for translating safety directives (Hindi, Kannada, Telugu, Tamil, Bengali, Odia)?
* **Why It Matters:** Migrant construction labor in metropolitan centers (e.g., Bengaluru) often speaks regional dialects distinct from the local state language.
* **Current Understanding:** MVP demonstrates Hindi and Kannada; additional languages marked pending implementation verification.
* **Decision Needed:** Identify linguistic demographics across initial enterprise pilot worksites.
* **Owner:** Product Manager | **Priority:** `MEDIUM` | **Status:** `INVESTIGATING` | **Target Date:** Phase 1 Sprint

---

### Q-015 — What Production-Grade Monitoring Is Required Beyond Basic CloudWatch Logs?
* **Question:** What real-time observability tools (e.g., Datadog, OpenTelemetry, AWS X-Ray) are required to monitor distributed Lambda execution latency, Step Functions timeouts, and API Gateway error rates?
* **Why It Matters:** Hackathon observability relies on native CloudWatch metrics; enterprise production requires automated PagerDuty on-call alerting for dead-letter queues.
* **Current Understanding:** CloudWatch alarms configured for Step Functions execution failures and Lambda error rates.
* **Decision Needed:** Implement distributed OpenTelemetry tracing and automated incident response runbooks.
* **Owner:** DevOps Engineer | **Priority:** `LOW` | **Status:** `OPEN` | **Target Date:** Phase 1 Production Prep

---

### Q-016 — Which Operational Impact Claims Can Be Experimentally Measured in Enterprise Pilots?
* **Question:** How do we empirically measure the product’s operational impact without fabricating un-tested marketing numbers like "40% reduction in heat casualties"?
* **Why It Matters:** Ethical engineering demands that impact claims be scientifically measurable and legally defensible.
* **Current Understanding:** We identify measurable operational proxies: (1) Median time-to-acknowledgment; (2) Percentage of high-heat directives verified within policy windows; (3) Audit ledger completeness.
* **Decision Needed:** Design an empirical pilot measurement protocol comparing worksites using the platform against control worksites using traditional broadcast SMS.
* **Owner:** Research Lead | **Priority:** `HIGH` | **Status:** `OPEN` | **Target Date:** Phase 1 Pilot Design

---

## 3. Master Open Question Summary Table

| ID | Open Question Summary | Priority | Status | Assigned Owner |
| :--- | :--- | :---: | :---: | :--- |
| **Q-001** | Multi-jurisdiction heat index methodology resolution | `HIGH` | `OPEN` | Lead Safety Modeler |
| **Q-002** | Minimum mandatory environmental input variables | `HIGH` | `INVESTIGATING` | Lead Safety Modeler |
| **Q-003** | Conflict resolution policy across divergent weather feeds | `MEDIUM` | `OPEN` | Data Engineer |
| **Q-004** | Dynamic weather telemetry staleness thresholds | `MEDIUM` | `OPEN` | Backend Lead |
| **Q-005** | Legal rule provenance and administrative rule builder | `HIGH` | `OPEN` | Product Manager |
| **Q-006** | Specific NVIDIA NIM model benchmarking & selection | `MEDIUM` | `INVESTIGATING` | AI Lead |
| **Q-007** | Practical value of conversational chat vs voice audio | `MEDIUM` | `OPEN` | UX Lead |
| **Q-008** | Highest-yield mobile notification channel (SMS vs WhatsApp)| `HIGH` | `OPEN` | Integration Lead |
| **Q-009** | Legal threshold for physical verification evidence | `MEDIUM` | `OPEN` | Legal Counsel / Safety Dir |
| **Q-010** | Enterprise multi-tenant database isolation certification | `MEDIUM` | `OPEN` | Security Engineer |
| **Q-011** | Statutory audit retention and Glacier archival lifecycle | `LOW` | `OPEN` | Compliance Officer |
| **Q-012** | Privacy-by-design operational shift metadata purging | `MEDIUM` | `OPEN` | Data Protection Officer |
| **Q-013** | Selection of high-value on-site physical IoT sensors | `LOW` | `DEFERRED` | Hardware Architect |
| **Q-014** | Vernacular language prioritization for migrant workforces | `MEDIUM` | `INVESTIGATING` | Product Manager |
| **Q-015** | Production OpenTelemetry & PagerDuty observability stack | `LOW` | `OPEN` | DevOps Engineer |
| **Q-016** | Empirically measurable operational impact metrics | `HIGH` | `OPEN` | Research Lead |

---

## 4. Summary Architectural Conclusion

By establishing this open questions register, the project demonstrates **intellectual honesty, scientific rigor, and a clear path toward commercial maturity**. Rather than obscuring domain complexities, the team makes them visible, assigns responsibility, and systematically drives toward validated engineering solutions.
