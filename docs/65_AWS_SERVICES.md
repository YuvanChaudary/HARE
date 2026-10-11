# AWS Services Catalog & Evaluation

**Document ID:** `65_AWS_SERVICES`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Service Classification Model

The purpose of this document is to provide a comprehensive, rigorous catalog of every Amazon Web Services (AWS) primitive evaluated for the Heat Action Response Engine. It articulates exactly why each service is chosen, where it fits in the architecture, its operational strengths and tradeoffs, and why certain services are intentionally deferred or excluded.

To enforce architectural discipline and eliminate unnecessary cloud complexity, every service is assigned an explicit operational maturity classification:

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ CLASSIFICATION           │ OPERATIONAL MEANING                              │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ REQUIRED FOR MVP         │ Mandatory core service essential for hackathon   │
│                          │ execution and live demonstration.                │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ OPTIONAL / P1            │ High-value enhancement implemented if hackathon   │
│                          │ timeline, credentials, and setup permit.         │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ FUTURE                   │ Long-term enterprise production capability; not  │
│                          │ required for hackathon submission.               │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ NOT REQUIRED             │ Evaluated and intentionally excluded to prevent  │
│                          │ architectural over-engineering or idle cost.    │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

*Guiding Principle:* **An AWS service is introduced only when its architectural responsibility is distinct and its concrete operational value justifies the added complexity.**

---

## 2. Amazon API Gateway

* **Classification:** **`REQUIRED FOR MVP`**
* **Architectural Purpose:** Public managed HTTP entry point, routing layer, and edge security gate.
* **Concrete Responsibilities:**
  * Terminating incoming TLS 1.3 HTTPS traffic from web browsers and mobile PWAs.
  * Routing URI paths (`/api/v1/worksites`, `/api/v1/actions/{id}/acknowledge`) to downstream Lambda compute.
  * Executing JWT authorization checks via Cognito/Lambda authorizers before compute invocation.
  * Enforcing Cross-Origin Resource Sharing (CORS) policies and request rate throttling.
* **Strict Exclusions:** API Gateway **does not** perform business calculations, evaluate heat indices, make escalation decisions, or generate audit entries.

---

## 3. AWS Lambda

* **Classification:** **`REQUIRED FOR MVP`**
* **Architectural Purpose:** Primary serverless compute engine hosting the platform's backend application code and domain logic.
* **Concrete Responsibilities:**
  * Handling synchronous REST API requests forwarded by API Gateway.
  * Executing scheduled weather ingestion and validation workers.
  * Running the pure deterministic Heat-Risk Engine (`20_HEAT_RISK_ENGINE.md`).
  * Running the contextual Action Engine (`40_ACTION_ENGINE.md`).
  * Processing acknowledgment commands, state-machine transitions, and escalation evaluations.
* **Strengths:**
  * Zero server provisioning, auto-scaling concurrency, zero idle compute costs.
  * Native integration with EventBridge, DynamoDB, and CloudWatch.
* **Managed Tradeoffs:**
  * Cold starts ($<250\text{ ms}$ on Node.js Graviton2 runtime; mitigated by lean bundling).
  * 15-minute maximum execution timeout (irrelevant for sub-second REST and ingestion tasks).
  * Stateless runtime requires all operational state to reside in Amazon DynamoDB.

---

## 4. Amazon DynamoDB

* **Classification:** **`REQUIRED FOR MVP`**
* **Architectural Purpose:** The single authoritative operational database for all persistent application entities.
* **Entities Stored:**
  * Organizations, Users, Roles & Permissions (`19_PERMISSION_MODEL.md`).
  * Worksites, Facilities, Shifts & Rosters (`14_WORKSITE_MODEL.md`, `15_WORKER_SHIFT_MODEL.md`).
  * Ingested Weather History (`33_WEATHER_DATA_MODEL.md`).
  * Authoritative Risk Assessments (`26_RISK_LEVELS.md`).
  * Action Directives, Acknowledgments & Verifications (`16_ACTION_MODEL.md`).
  * Escalation Breaches (`17_ESCALATION_MODEL.md`).
  * Immutable Compliance Audit Logs (`85_AUDIT_LOGGING.md`).
* **Strengths:**
  * Managed serverless database with single-digit millisecond latency.
  * On-Demand billing mode eliminates manual capacity provisioning.
  * Atomic conditional writes guarantee concurrency safety for acknowledgments.
* **Managed Tradeoffs:**
  * Access-pattern-first design requires upfront index modeling (`68_DYNAMODB.md`).
  * Relational joins are absent; handled by embedding essential site context into action records.

---

## 5. Amazon EventBridge

* **Classification:** **`REQUIRED FOR MVP`**
* **Architectural Purpose:** Enterprise event bus and precision scheduler for background automation.
* **Concrete Responsibilities:**
  * **EventBridge Scheduler:** Triggers periodic weather ingestion cron routines (hourly standard; 30-min during active heatwaves).
  * **Event Bus Routing:** Decouples core domain events (`heat.action.weather_refreshed`, `heat.action.risk_assessed`, `heat.action.escalated`) from downstream notification and archiving handlers.
* **Strengths:**
  * Native JSON schema pattern matching filters events before invoking Lambda functions.
  * Built-in retry policies and Dead-Letter Queue (DLQ) support for unhandled events.

---

## 6. AWS Step Functions

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Visual, deterministic state-machine orchestration for multi-step escalation countdowns.
* **Operational Role:**
  * Tracking the 15-minute acknowledgment SLA countdown after an action is created.
  * Inspecting DynamoDB status after timer expiry; triggering escalation Lambda if unacknowledged.
* **Tradeoffs & Hackathon Decision:**
  * *Benefits:* Visual execution graph, native wait states, built-in retry blocks.
  * *Tradeoffs:* Adds CloudFormation template complexity and state-machine JSON definitions.
  * *Pragmatic Alternative:* For the hackathon MVP, escalation timers can be executed via EventBridge scheduled rules or DynamoDB TTL stream events (`69_EVENTBRIDGE_STEP_FUNCTIONS.md`).

---

## 7. Amazon Simple Notification Service (SNS)

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Publish/subscribe notification fan-out for emergency operational broadcasts.
* **Operational Role:**
  * Fan-out dispatch of high-severity safety alerts to multiple notification endpoints.
  * Direct SMS and Email delivery to Safety Managers during `CRITICAL_HEAT_EMERGENCY` events.
* **Safety Boundary:** Dispatching an SNS notification does **not** prove human acknowledgment. The escalation timer continues running until the supervisor authenticates and confirms via the API.

---

## 8. Amazon CloudWatch

* **Classification:** **`REQUIRED FOR MVP OPERABILITY`**
* **Architectural Purpose:** Centralized observability, log aggregation, performance metrics, and operational alarms.
* **Concrete Responsibilities:**
  * Ingesting structured JSON log streams from all Lambda functions via `AWS Lambda Powertools`.
  * Collecting API Gateway 4xx/5xx latency metrics and DynamoDB read/write throttling stats.
  * Sounding operational alarms if weather ingestion fails consecutively or escalations spike.
* **Hackathon Configuration:** 14-day log retention policy to eliminate unnecessary storage costs.

---

## 9. AWS Secrets Manager

* **Classification:** **`REQUIRED WHEN EXTERNAL SECRETS ARE USED`**
* **Architectural Purpose:** Encrypted, centralized vault for sensitive third-party API credentials and private keys.
* **Secrets Stored:**
  * `open-meteo/api-key` (commercial weather license where deployed).
  * `nvidia-nim/api-token` (NVIDIA AI inference endpoint credentials).
  * `jwt-signing-secret` (standalone JWT token signing secret).
* **Strict Security Rule:** Secrets are queried dynamically at Lambda runtime with in-memory caching; they are **never** committed to Git or exposed to client-side code.

---

## 10. Amazon Cognito

* **Classification:** **`PENDING IMPLEMENTATION DECISION`**
* **Architectural Purpose:** Managed user identity pool, authentication directory, and JWT issuer.
* **Operational Role:**
  * Storing supervisor and manager user directories with hashed credentials.
  * Emitting signed RS256 JWT access tokens containing user claims (`sub`, `custom:org_id`, `custom:role`).
* **Implementation Decision:** If Cognito setup introduces domain verification or SMS verification delays during active hackathon coding, the team may utilize a lightweight, cryptographically signed JWT implementation with standard RS256/HS256 tokens (`82_AUTHENTICATION.md`).

---

## 11. Amazon Simple Storage Service (S3)

* **Classification:** **`REQUIRED FOR MVP HOSTING`**
* **Architectural Purpose:** Object storage for static web assets, compiled PWA bundles, and export reports.
* **Concrete Responsibilities:**
  * Hosting the compiled React Vite single-page application bundle (`index.html`, JavaScript, CSS, icons).
  * Storing generated compliance audit CSV/PDF exports.
* **Security Configuration:** Configured as a private bucket with CloudFront Origin Access Control (OAC); public bucket policies are blocked.

---

## 12. Amazon CloudFront

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Global Content Delivery Network (CDN) for edge caching and TLS termination.
* **Operational Role:**
  * Caching compiled frontend assets at edge locations close to Indian mobile users.
  * Providing automated HTTPS certificate management via AWS Certificate Manager (ACM).
* **Hackathon Fallback:** If DNS routing or CloudFront propagation adds setup friction, S3 static hosting endpoints can serve the demo frontend directly.

---

## 13. AWS IoT Core

* **Classification:** **`FUTURE`**
* **Architectural Purpose:** Future ingestion pipeline for physical on-site environmental weather stations and wearable heat monitors (`39_IOT_FUTURE_EXTENSION.md`).
* **Why Deferred:** The MVP deliberately utilizes open digital meteorological feeds (Open-Meteo, IMD) to eliminate hardware dependencies during hackathon evaluation.

---

## 14. AWS X-Ray

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Distributed request tracing and visual latency waterfall analysis across Lambda, API Gateway, and DynamoDB.
* **Hackathon Stance:** Useful for enterprise performance auditing, but structured JSON logging and correlation IDs in CloudWatch are fully sufficient for hackathon judging.

---

## 15. AWS Key Management Service (KMS)

* **Classification:** **`OPTIONAL / SECURITY ENHANCEMENT`**
* **Architectural Purpose:** Customer-managed encryption key lifecycle management.
* **Hackathon Stance:** AWS-managed default encryption keys (AES-256) for DynamoDB, S3, and Secrets Manager provide complete, zero-cost encryption at rest without requiring custom KMS key policy overhead.

---

## 16. AWS WAF (Web Application Firewall)

* **Classification:** **`OPTIONAL / P1 / DEPLOYMENT-DEPENDENT`**
* **Architectural Purpose:** Edge firewall rules blocking SQL injection, cross-site scripting (XSS), and malicious IP floods on API Gateway.
* **Operational Role:** Recommended for public enterprise production; native API Gateway request throttling is sufficient for hackathon demonstrations.

---

## 17. AWS CloudTrail

* **Classification:** **`OPTIONAL / SECURITY & GOVERNANCE`**
* **Architectural Purpose:** Logging AWS account-level infrastructure API calls (e.g., who created a Lambda function or altered an IAM policy).
* **CRITICAL ARCHITECTURAL DISTINCTION:**
  ```text
  ┌─────────────────────────────────┬─────────────────────────────────┐
  │ AWS CLOUDTRAIL                  │ APPLICATION COMPLIANCE AUDIT    │
  ├─────────────────────────────────┼─────────────────────────────────┤
  │ Infrastructure Audit:           │ Operational Workplace Audit:    │
  │ Records AWS Console & CLI API   │ Records supervisor action acks, │
  │ calls made to cloud resources.  │ risk assessments & verifications│
  │ Owned by AWS Cloud Admin.       │ Stored in DynamoDB AuditTable.  │
  └─────────────────────────────────┴─────────────────────────────────┘
  ```
  CloudTrail does **not** replace the platform's domain compliance audit log.

---

## 18. Amazon Simple Queue Service (SQS)

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Asynchronous message queueing, burst load smoothing, and Dead-Letter Queue (DLQ) containment.
* **Operational Role:** Configured as a DLQ attached to asynchronous Lambda functions to catch and preserve failed weather ingestion or notification payloads.

---

## 19. Amazon Simple Email Service (SES)

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** High-deliverability transactional email dispatch for daily safety manager shift summaries.
* **Operational Role:** Secondary notification channel; does not replace primary in-app supervisor action directives.

---

## 20. AWS Systems Manager Parameter Store / AppConfig

* **Classification:** **`OPTIONAL / P1`**
* **Architectural Purpose:** Hierarchical storage for non-sensitive configuration parameters (e.g., `/heataction/demo/default_sla_minutes`).
* **Hackathon Alternative:** Standard Lambda environment variables managed via SAM/CDK provide clean, simple configuration without extra parameter fetches.

---

## 21. Comprehensive AWS Cost & Service Selection Matrix

```text
┌──────────────────────┬──────────┬──────────────────────┬────────────────────────────────────────┐
│ AWS SERVICE          │ MVP      │ ARCHITECTURAL ROLE   │ ADOPTION RATIONALE                     │
├──────────────────────┼──────────┼──────────────────────┼────────────────────────────────────────┤
│ Amazon API Gateway   │ Yes      │ Edge API Entry       │ Managed REST routing, throttling, TLS  │
│ AWS Lambda           │ Yes      │ Serverless Compute   │ Zero idle cost, auto-scaling execution │
│ Amazon DynamoDB      │ Yes      │ Operational Database │ Single-digit latency, atomic locks     │
│ Amazon EventBridge   │ Yes      │ Scheduling & Events  │ Precision cron triggers & domain bus   │
│ Amazon CloudWatch    │ Yes      │ Observability & Logs │ Centralized structured logs & alarms   │
│ AWS Secrets Manager  │ As needed│ Secret Vault         │ Secure API key & token storage         │
│ Amazon S3            │ Yes      │ Static Web Hosting   │ Reliable storage for React PWA bundle  │
│ Amazon CloudFront    │ Optional │ Edge CDN & SSL       │ Low-latency distribution for PWA       │
│ AWS Step Functions   │ Optional │ Escalation Workflow  │ Visual state-machine countdown         │
│ Amazon SNS           │ Optional │ Notification Fan-out │ Emergency SMS / Email alerts           │
│ Amazon Cognito       │ Pending  │ Identity Provider    │ Managed user directory & JWT issuance  │
│ Amazon SQS           │ Optional │ Async Dead-Letter    │ Buffering & failed event preservation  │
│ AWS SES              │ Optional │ Email Dispatch       │ Daily summary email reports            │
│ AWS IoT Core         │ Future   │ Hardware Sensor Hub  │ Physical WBGT on-site stations         │
│ AWS WAF              │ Optional │ Edge Web Firewall    │ Enterprise attack filtering            │
│ AWS X-Ray            │ Optional │ Distributed Tracing  │ Visual request latency profiling       │
│ AWS KMS              │ Optional │ Key Management       │ Custom encryption key lifecycles       │
│ AWS CloudTrail       │ Optional │ Infrastructure Audit │ AWS account administrative tracking    │
│ AWS AppConfig        │ Optional │ Dynamic Config       │ Runtime feature flag management        │
└──────────────────────┴──────────┴──────────────────────┴────────────────────────────────────────┘
```

---

## 22. Service Selection Rules & Engineering Discipline

To ensure the system remains elegant, maintainable, and verifiable during hackathon evaluation, all infrastructure implementations adhere to twelve strict rules:

1. **Use an AWS service only when its responsibility is clear and its operational value justifies the added complexity.**
2. **Prefer managed serverless services:** Never provision EC2 instances, containers, or self-hosted databases when Lambda and DynamoDB fulfill requirements.
3. **Avoid unnecessary microservices:** A clean modular monolith deployed across structured Lambda functions is vastly superior to dozens of brittle micro-functions.
4. **Avoid premature networking complexity:** Do not introduce private VPCs, NAT Gateways, or VPC peering unless a service strictly requires isolated subnets.
5. **Enforce least privilege:** Grant Lambda execution roles access strictly to the exact DynamoDB tables and EventBridge buses they operate on.
6. **Safety logic belongs in application code:** Never embed safety thresholds, heat index formulas, or escalation rules inside API Gateway mapping templates or cloud policies.
7. **Operational state belongs in an authoritative store:** The database (DynamoDB) retains source-of-truth status, never client caches or transient event payloads.
8. **Use events where they provide genuine workflow value:** Decouple background ingestion and notification fan-out, but keep synchronous CRUD routes direct and simple.
9. **Use synchronous APIs for human actions:** Acknowledging an action must return an immediate synchronous HTTP confirmation to the supervisor.
10. **Make failures observable:** Ensure every unhandled exception, telemetry timeout, and SLA breach emits structured metrics to CloudWatch.
11. **Keep simulation mode isolated:** Synthetic training events must never trigger live notifications or contaminate production compliance tables.
12. **Do not introduce AWS services merely to make the architecture diagram look impressive:** Hackathon excellence derives from working, verifiable, bulletproof software, not architectural vanity.

---

## 23. Cross-Document Architecture Integration Map

The system documentation forms an unbroken progression from problem definition to low-level implementation:

```text
60_SYSTEM_ARCHITECTURE (What the system is & how layers decouple)
          │
          ▼
61_TECH_STACK (What languages, runtimes & frameworks implement it)
          │
          ▼
62_TECH_STACK_FLOW (How data & events traverse the stack end-to-end)
          │
          ▼
63_API_ARCHITECTURE (How clients & services communicate securely)
          │
          ▼
64_AWS_ARCHITECTURE (How components deploy onto AWS serverless cloud)
          │
          ▼
65_AWS_SERVICES (Why each specific AWS service exists & its tradeoffs)
          │
          ▼
66_LAMBDA  │  67_API_GATEWAY  │  68_DYNAMODB  │  69_EVENTBRIDGE_STEP_FUNCTIONS
(Deep, code-level infrastructure & implementation specifications)
```

---

## 24. Non-Negotiable Architectural Boundaries

Throughout all API and cloud implementations, the following boundaries remain absolute:

```text
FRONTEND ≠ SAFETY ENGINE
AI ≠ SAFETY AUTHORITY
API GATEWAY ≠ BUSINESS LOGIC
LAMBDA ≠ SAFETY POLICY BY ITSELF
EVENTBRIDGE ≠ SOURCE OF TRUTH
STEP FUNCTIONS ≠ SAFETY DECISION MAKER
CLIENT CACHE ≠ AUTHORITATIVE STATE
FORECAST ≠ OBSERVATION
UNKNOWN RISK ≠ LOW RISK
STALE DATA ≠ CURRENT CONDITIONS
DATA FAILURE ≠ SAFE ENVIRONMENT
ACKNOWLEDGED ≠ VERIFIED
NOTIFICATION SENT ≠ ACTION COMPLETED
```

```text
                     AUTHORITATIVE
                         SAFETY
                          LOGIC
                            │
                            ▼
                 ┌───────────────────┐
                 │ Deterministic     │
                 │ Risk + Action     │
                 │ Engine            │
                 └─────────┬─────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
           API/AWS      Frontend       AI
         infrastructure  /PWA       assistance
              │            │            │
              └────────────┼────────────┘
                           ▼
                    HUMAN OPERATOR
```

---

## 25. Final Architectural Principle

> **The API and AWS architecture exist to reliably implement the Heat Action Response Engine's operational contract: validated environmental data enters the backend, deterministic rules produce authoritative risk and preventive actions, authorized users receive and respond to those actions, unresolved work escalates, and every important transition remains traceable. AWS services provide scalable infrastructure around that contract; they do not replace the domain logic or human responsibility at its center.**
