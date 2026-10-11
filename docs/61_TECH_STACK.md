# Technology Stack Specification

**Document ID:** `61_TECH_STACK`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Categorization Model

The purpose of this document is to specify the authoritative technology stack for the Heat Action Response Engine. It details every programming language, runtime, cloud service, database, framework, library, and development tool selected for the platform.

To maintain engineering discipline and prevent architectural over-claiming during hackathon evaluation, all technologies are strictly categorized according to implementation maturity:

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ MATURITY CLASSIFICATION  │ OPERATIONAL DEFINITION                           │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ [MVP]                    │ Actively targeted for core hackathon submission; │
│                          │ essential to the end-to-end operational loop.    │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ [P1 / OPTIONAL]          │ Planned enhancement for secondary workflows;     │
│                          │ implemented if timeline and credentials allow.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ [FUTURE]                 │ Post-hackathon enterprise production roadmap.    │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ [CONCEPTUAL]             │ Architectural design pattern; concrete technology│
│                          │ binding subject to team implementation choice.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ [PENDING VERIFICATION]   │ External API/service requiring active validation │
│                          │ (e.g., enterprise credentials, rate limits).     │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 2. Recommended MVP Technology Stack

### 2.1 Frontend Stack [MVP]
* **Core Framework:** React 18+ with TypeScript (Strict mode enabled).
* **Build Tooling:** Vite (Instant HMR, fast production bundling).
* **Application Shell & PWA:** Service Worker + Web App Manifest (`59_PWA.md`) for standalone home-screen launch and controlled offline presentation.
* **Styling Architecture:** Modern Vanilla CSS / Tailwind utility tokens tailored to the bright, light-first design system (`55_DESIGN_SYSTEM.md`).
* **State Management:** TanStack React Query for asynchronous server state synchronization and caching; Zustand for local UI preferences (`56_STATE_MANAGEMENT.md`).
* **Routing:** React Router v6 or lightweight single-page view router.
* **Icons:** Lucide React / SVG standard icons with complete accessible ARIA labels.

### 2.2 Backend & Compute Stack [MVP]
* **Runtime:** Node.js 20.x LTS.
* **Language:** TypeScript 5.x.
* **Compute Architecture:** AWS Lambda serverless functions.
* **Backend Architecture:** Modular monolithic core deployed across structured Lambda function boundaries rather than complex, independent microservices.
* **API Framework:** Lightweight handler wrappers (e.g., AWS Lambda Powertools / Express-like routing wrapper) maintaining sub-second cold starts.

### 2.3 API Gateway & Networking [MVP]
* **Protocol:** HTTPS REST API over Amazon API Gateway.
* **Data Format:** JSON schemas strictly adhering to OpenAPI 3.0 contracts (`70_API_CONTRACTS.md`).
* **Security Edge:** API Gateway JWT authorizer integration with TLS 1.3 encryption.

---

## 3. AWS Core Cloud Services Architecture

The platform leverages native AWS services to achieve high operational reliability, serverless scalability, and minimal maintenance overhead:

```text
┌──────────────────────┬────────────────────────┬────────────────────────────────────────┐
│ AWS SERVICE          │ MATURITY STATUS        │ ARCHITECTURAL ROLE                     │
├──────────────────────┼────────────────────────┼────────────────────────────────────────┤
│ Amazon API Gateway   │ [MVP]                  │ Edge entry point, TLS, routing, auth   │
│ AWS Lambda           │ [MVP]                  │ Serverless compute for APIs & workers  │
│ Amazon DynamoDB      │ [MVP]                  │ Primary operational data store         │
│ Amazon EventBridge   │ [MVP]                  │ Cron scheduling & asynchronous bus     │
│ AWS CloudWatch       │ [MVP]                  │ Centralized logs, metrics & alarms     │
│ AWS Secrets Manager  │ [MVP]                  │ Secure storage for API keys & secrets  │
│ Amazon S3            │ [MVP]                  │ Static web hosting & asset storage     │
│ Amazon CloudFront    │ [P1 / OPTIONAL]        │ Global CDN distribution for React PWA  │
│ AWS Step Functions   │ [P1 / OPTIONAL]        │ Complex escalation & retry state engine│
│ Amazon SNS           │ [P1 / OPTIONAL]        │ Multi-channel SMS/Email dispatch       │
│ Amazon Cognito       │ [PENDING VERIFICATION] │ User identity pool & JWT auth tokens   │
│ AWS IoT Core         │ [FUTURE]               │ Future physical on-site sensor ingest  │
└──────────────────────┴────────────────────────┴────────────────────────────────────────┘
```

---

## 4. Operational Database: Amazon DynamoDB [MVP]

Amazon DynamoDB is the primary operational data store for the Heat Action Response Engine.

### Why DynamoDB?
* **Serverless Operations:** Zero database server provisioning, patching, or connection pool exhaustion risks under Lambda concurrency.
* **Consistent Single-Digit Latency:** Predictable sub-10ms response times for critical supervisor acknowledgment workflows.
* **Native AWS Integration:** Direct IAM authentication, EventBridge streaming hooks, and seamless infrastructure-as-code support.

### Operational Tradeoffs & Managed Mitigations
* **Access-Pattern Driven Design:** DynamoDB requires upfront query modeling. Multi-table or single-table designs must be planned prior to coding (detailed in `68_DYNAMODB.md`).
* **No Relational Joins:** Handled by denormalizing essential worksite context into action and risk records at evaluation time.
* **Eventual Consistency:** Mitigated by utilizing DynamoDB **Strongly Consistent Reads** and conditional writes (`attribute_exists`, `status = 'PENDING_ACK'`) for all safety-critical action state transitions.

---

## 5. Event-Driven Architecture: Amazon EventBridge [MVP]

Amazon EventBridge serves as the nervous system for decoupled background operations:
* **Scheduled Ingestion:** EventBridge Scheduler triggers the weather ingestion pipeline on a configurable hourly cadence.
* **Domain Event Routing:** Services publish standard operational events (`RISK_ASSESSED`, `ACTION_CREATED`, `ESCALATION_TRIGGERED`).
* **Pragmatic Boundary:** EventBridge is used where decoupling provides operational value (fan-out, background processing). Simple user CRUD operations remain clean synchronous REST calls to avoid unnecessary event choreography.

---

## 6. Scheduling & Timer Mechanisms [MVP]

Time is a critical variable in heat-risk mitigation:
* **Weather Refresh:** Configured via EventBridge scheduled rules (hourly during standard operations, 30-minute intervals during active heatwaves).
* **Acknowledgment SLAs:** Tracked via DynamoDB TTL or scheduled Step Functions / Lambda polling checkers.
* **Shift Transitions:** Triggered at shift handover boundaries to evaluate incoming worker rosters.

---

## 7. Multi-Channel Notification Technology

```text
┌──────────────────────┬──────────────────┬──────────────────────────────────────────────┐
│ CHANNEL              │ MATURITY         │ DELIVERY MECHANISM                           │
├──────────────────────┼──────────────────┼──────────────────────────────────────────────┤
│ In-App Alerts        │ [MVP]            │ Direct REST query sync + PWA banner updates  │
│ Web Notifications    │ [P1 / OPTIONAL]  │ Browser Notification API on desktop/Android  │
│ Email Notifications  │ [P1 / OPTIONAL]  │ Amazon SNS / SES transactional email         │
│ SMS / Text Alert     │ [FUTURE]         │ Amazon SNS / Twilio field dispatch           │
│ WhatsApp Enterprise  │ [FUTURE]         │ Meta Cloud API connector                     │
│ Audio Sirens / IoT   │ [FUTURE]         │ On-site hardware integration via IoT Core    │
└──────────────────────┴──────────────────┴──────────────────────────────────────────────┘
```

*Hackathon Commitment:* The MVP focuses on flawless, persistent in-app notifications and dashboard counters. External SMS/WhatsApp connectors are documented as future enterprise extensions.

---

## 8. Meteorological Data Provider Stack

### 8.1 Open-Meteo API [MVP]
* **Role:** Primary environmental weather and hourly forecast provider.
* **Data Ingested:** Dry-bulb temperature (°C), relative humidity (%), surface solar radiation (W/m²), wind speed (m/s), apparent temperature / Heat Index.
* **Status:** Free-tier / Non-commercial open API with high geographic precision across India.

### 8.2 India Meteorological Department (IMD) [PENDING VERIFICATION]
* **Role:** Official national heatwave warning validation source.
* **Status:** Subject to government API availability and format validation; mocked or integrated via open gridded endpoints during hackathon prototyping (`32_IMD_INTEGRATION.md`).

### 8.3 Future Environmental Sensors [FUTURE]
* **Role:** On-site Wet Bulb Globe Temperature (WBGT) physical stations and wearable monitors (`39_IOT_FUTURE_EXTENSION.md`).

---

## 9. Deterministic Risk Engine Architecture [MVP]

The risk engine is built as an isolated, technology-independent pure TypeScript library:
* **Zero UI / Cloud Coupling:** Can execute inside a Lambda function, a local CLI runner, or a unit-test harness.
* **Deterministic Contract:**
  * **Inputs:** Temperature, humidity, solar exposure, wind, indoor/outdoor classification, workload level, acclimatization state.
  * **Outputs:** Risk level (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), primary contributing factors, mathematical explanation, rule version (`v1.2`).
* **Strict Rule:** Heat risk is **never** evaluated by client-side browser JavaScript or prompt-driven LLMs.

---

## 10. Deterministic Action Engine Architecture [MVP]

The action engine operates as pure backend business logic:
* **Contract:**
  * **Inputs:** Calculated Risk Assessment, Worksite Facility Profile (shade availability, water stations, active fans), Worker Shift Roster.
  * **Outputs:** Prioritized workplace action directives, assigned supervisors, response SLAs, verification requirements.
* **Safety Mandate:** Standard operating procedures are mathematically derived from established occupational safety guidelines (NDMA, OSHA, ISO 7243).

---

## 11. Artificial Intelligence Stack: NVIDIA AI / NIM [P1 / OPTIONAL]

AI capabilities are integrated strictly as an optional natural language assistance and translation layer:
* **Model Direction:** NVIDIA NIM microservices or hosted LLM endpoints (e.g., Llama 3 / Mistral NIM on NVIDIA API catalog).
* **SDK / Transport:** Standard OpenAI-compatible HTTP client library in TypeScript.
* **Operational Scope:**
  * Translating complex meteorological data into plain-language worker briefings.
  * Answering supervisor questions regarding why a specific action was triggered.
  * Generating regional language summaries (Hindi, Kannada, Tamil).
* **Strict AI Guardrails:**
  * AI models have zero access to write directly to the database.
  * AI cannot override, downgrade, or calculate heat risk levels.
  * AI outputs are validated against deterministic schemas before rendering.

---

## 12. Authentication & Identity Management

* **Direction:** Amazon Cognito User Pools [PENDING VERIFICATION] or lightweight signed JWT tokens.
* **Architecture:**
  * Standard Bearer Token Authorization headers (`Authorization: Bearer <token>`).
  * Claims include `sub` (User ID), `org_id` (Tenant), and `custom:role` (`SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN`).
  * Backend API handlers cryptographically verify token signatures on every call.

---

## 13. Infrastructure as Code (IaC) [MVP]

To ensure reproducible cloud deployments:
* **Primary Recommendation:** AWS Serverless Application Model (AWS SAM) or AWS Cloud Development Kit (AWS CDK in TypeScript).
* **Policy:** The project will standardize on **one** IaC tool during deployment rather than mixing Terraform, SAM, and manual console configurations.
* **Local Development Alternative:** A lightweight local Express/Node wrapper can mirror Lambda handlers for local hackathon testing before cloud deployment.

---

## 14. Development & Testing Tooling [MVP]

```text
┌──────────────────────┬────────────────────────────────────────────────────────┐
│ TOOLING CATEGORY     │ SELECTED TECHNOLOGY                                    │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ Source Control       │ Git + GitHub Repository                                │
│ Code Editor          │ Visual Studio Code / Cursor                            │
│ Package Management   │ Node.js 20.x, npm / pnpm                               │
│ Code Quality         │ ESLint + Prettier + TypeScript Compiler (`tsc`)        │
│ Unit Testing         │ Vitest / Jest (Pure domain logic & rule tests)         │
│ API Testing          │ Postman / Thunder Client / Vitest integration tests    │
│ Accessibility QA     │ axe-core, Lighthouse CLI (`58_ACCESSIBILITY.md`)       │
└──────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 15. Continuous Integration & Deployment (CI/CD) [MVP]

* **Provider:** GitHub Actions.
* **Pipeline Workflow:**
  ```text
  PUSH TO MAIN / PR
         │
         ▼
  1. LINT & TYPE CHECK (eslint && tsc --noEmit)
         │
         ▼
  2. UNIT TEST EXECUTION (vitest run)
         │
         ▼
  3. BUILD ARTIFACTS (vite build && esbuild lambda)
         │
         ▼
  4. SECURITY AUDIT (npm audit)
         │
         ▼
  5. DEPLOY TO AWS (sam deploy / cdk deploy)
  ```
* **Environments:** `local` (developer machine), `demo` (hackathon presentation), `production` (future).

---

## 16. Configuration & Secrets Management [MVP]

```text
┌──────────────────────┬───────────────────────┬────────────────────────────────┐
│ CONFIGURATION TIER   │ STORAGE LOCATION      │ EXAMPLE ATTRIBUTES             │
├──────────────────────┼───────────────────────┼────────────────────────────────┤
│ Safe Public Config   │ `.env` / Vite bundle  │ `API_BASE_URL`, `APP_VERSION`  │
│ Runtime Server Env   │ Lambda Environment    │ `DYNAMODB_TABLE_NAME`, `REGION`│
│ Sensitive Secrets    │ AWS Secrets Manager   │ `OPEN_METEO_API_KEY`,          │
│                      │                       │ `NVIDIA_API_KEY`, `JWT_SECRET` │
└──────────────────────┴───────────────────────┴────────────────────────────────┘
```

*Security Rule:* API keys and signing secrets are strictly barred from Git commits and client-side bundles.

---

## 17. Technology Decision Principles

The platform's technical choices are governed by four pragmatic engineering rules:

1. **Velocity over Vanity:** Choose battle-tested, familiar TypeScript and AWS serverless primitives rather than novel, unproven frameworks.
2. **Deterministic Safety:** Never outsource mathematical or life-safety logic to third-party black boxes or probabilistic AI.
3. **Simplicity over Complexity:** Avoid distributed microservices when clean modular monolith boundaries achieve identical results with zero operational friction.
4. **Hackathon Demonstrability:** Every selected technology must actively contribute to a working, verifiable, judge-ready live demonstration.

---

## 18. Technology Stack Summary Table

```text
┌──────────────────────┬──────────────────────────────────┬─────────────────────┐
│ LAYER                │ INTENDED MVP DIRECTION           │ MATURITY STATUS     │
├──────────────────────┼──────────────────────────────────┼─────────────────────┤
│ User Interface       │ React 18 + TypeScript + Vite     │ [MVP]               │
│ Design System        │ Vanilla CSS / Tailwind Tokens    │ [MVP]               │
│ Mobile / PWA         │ Service Worker + Web Manifest    │ [MVP]               │
│ API Protocol         │ REST API (OpenAPI 3.0)           │ [MVP]               │
│ API Gateway          │ Amazon API Gateway               │ [MVP]               │
│ Compute Runtime      │ AWS Lambda (Node.js 20.x)        │ [MVP]               │
│ Primary Database     │ Amazon DynamoDB                  │ [MVP]               │
│ Scheduling           │ Amazon EventBridge Scheduler     │ [MVP]               │
│ Event Routing        │ Amazon EventBridge Event Bus     │ [MVP]               │
│ Orchestration        │ AWS Step Functions               │ [P1 / OPTIONAL]     │
│ Cloud Observability  │ Amazon CloudWatch Logs & Metrics │ [MVP]               │
│ Secret Management    │ AWS Secrets Manager              │ [MVP]               │
│ Static Asset Hosting │ Amazon S3 + CloudFront           │ [MVP]               │
│ Weather Feeds        │ Open-Meteo REST API              │ [MVP]               │
│ National Heat Alerts │ IMD Open Gridded / Mock Feeds    │ [PENDING VERIF.]    │
│ AI Assistance        │ NVIDIA NIM / Supported LLM       │ [P1 / OPTIONAL]     │
│ User Identity        │ Amazon Cognito / Signed JWT      │ [PENDING VERIF.]    │
│ CI/CD Automation     │ GitHub Actions                   │ [MVP]               │
│ Infrastructure as Code│ AWS SAM / CDK                    │ [MVP]               │
└──────────────────────┴──────────────────────────────────┴─────────────────────┘
```

*Note: This table represents the authoritative MVP implementation target; specific service configurations may adapt based on sandbox AWS access during active hacking.*
