# AWS Infrastructure Architecture

**Document ID:** `64_AWS_ARCHITECTURE`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Architectural Philosophy

The purpose of this specification is to define the authoritative Amazon Web Services (AWS) infrastructure architecture for the Heat Action Response Engine. It maps the system's logical domain requirements (`60_SYSTEM_ARCHITECTURE.md`) and technology stack selections (`61_TECH_STACK.md`) to concrete, serverless cloud primitives.

### Architectural Philosophy
* **Serverless-First:** Prioritize fully managed, auto-scaling serverless primitives (Lambda, API Gateway, DynamoDB, EventBridge) to eliminate server provisioning, patching, and idle resource expenses.
* **Pragmatic for Hackathons, Resilient for Enterprise:** Architected to be buildable, testable, and demonstrable within hackathon timelines, while remaining structured for clean enterprise evolution.
* **Decoupled Infrastructure vs. Domain Logic:** AWS services host, route, compute, and persist; **pure deterministic TypeScript domain code** retains absolute ownership of all occupational safety logic.
* **Cost & Operational Awareness:** Designed to run lean on on-demand capacity without requiring complex multi-VPC networking overhead.

---

## 2. High-Level AWS Architecture

```text
                                 USERS / OPERATORS
                           (Mobile PWA / Desktop Web)
                                        │
                                        ▼ HTTPS (Port 443)
                         ┌─────────────────────────────┐
                         │   Amazon CloudFront (CDN)   │ [P1 / Optional]
                         │   Edge Caching & SSL Cert   │
                         └──────────────┬──────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │      Amazon S3 Bucket       │ [MVP]
                         │  Static React PWA Hosting   │
                         └─────────────────────────────┘
                                        │ API Requests
                                        ▼
                         ┌─────────────────────────────┐
                         │     Amazon API Gateway      │ [MVP]
                         │   REST Edge Routing & TLS   │
                         └──────────────┬──────────────┘
                                        │
               ┌────────────────────────┴────────────────────────┐
               ▼ (JWT Token Validation)                          ▼ (Route Execution)
┌─────────────────────────────┐                   ┌─────────────────────────────┐
│    Amazon Cognito / Auth    │ [Pending]         │     AWS Lambda Compute      │ [MVP]
│   User Pools & Token Gate   │                   │    (Modular Node.js Core)   │
└─────────────────────────────┘                   └──────────────┬──────────────┘
                                                                 │
                       ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                       ▼                                         ▼                                         ▼
        ┌─────────────────────────────┐           ┌─────────────────────────────┐           ┌─────────────────────────────┐
        │      Worksite Services      │           │    Risk & Action Engines    │           │    Notification Dispatch    │
        │   Facilities, Shifts, Roster│           │  Pure Deterministic Domain  │           │   In-App, Alerts & Queue    │
        └──────────────┬──────────────┘           └──────────────┬──────────────┘           └──────────────┬──────────────┘
                       │                                         │                                         │
                       └─────────────────────────────────────────┼─────────────────────────────────────────┘
                                                                 │
                                                                 ▼
                                                  ┌─────────────────────────────┐
                                                  │       Amazon DynamoDB       │ [MVP]
                                                  │  Primary Operational Store  │
                                                  │   (Strongly Consistent)     │
                                                  └──────────────┬──────────────┘
                                                                 │
                                                                 ▼
                                                  ┌─────────────────────────────┐
                                                  │     Amazon EventBridge      │ [MVP]
                                                  │  Domain Bus & Scheduler Cron│
                                                  └──────────────┬──────────────┘
                                                                 │
                                 ┌───────────────────────────────┴───────────────────────────────┐
                                 ▼                                                               ▼
                  ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
                  │    Weather Ingest Lambda    │ [MVP]                           │     AWS Step Functions      │ [P1 / Opt]
                  │  (Hourly Cron Execution)    │                                 │   Escalation SLA Countdown  │
                  └──────────────┬──────────────┘                                 └──────────────┬──────────────┘
                                 │                                                               │
                                 ▼                                                               ▼
                  ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
                  │   External Weather APIs     │                                 │    Amazon SNS Fan-Out       │ [P1 / Opt]
                  │   (Open-Meteo / Mock IMD)   │                                 │    (Emergency Alerts/SMS)   │
                  └─────────────────────────────┘                                 └─────────────────────────────┘
```

---

## 3. AWS Account & Environment Topology

To isolate experimental hackathon development from stable demonstration environments, the system establishes four conceptual deployment environments:

```text
┌──────────────────────┬────────────────────────────────────────────────────────┐
│ ENVIRONMENT TIER     │ PURPOSE & INFRASTRUCTURE PROFILE                       │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ 1. `local`           │ Developer workstation; Vite local dev server; mock     │
│                      │ DynamoDB / local Express wrapper for rapid iteration.  │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ 2. `dev`             │ Sandbox AWS account/region; automated feature branch   │
│                      │ deployments via GitHub Actions; ephemeral testing.     │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ 3. `demo`            │ Dedicated, frozen hackathon evaluation environment;    │
│                      │ pre-seeded with canonical demo data (North Bengaluru). │
├──────────────────────┼────────────────────────────────────────────────────────┤
│ 4. `production`      │ Future enterprise deployment; multi-region replication,│
│                      │ dedicated tenant VPC endpoints, and strict governance. │
└──────────────────────┴────────────────────────────────────────────────────────┘
```

*Hackathon Scope:* For hackathon judging, the engineering team prioritizes a stable, verified deployment in the **`demo`** environment.

---

## 4. Frontend Web Hosting Architecture

The compiled React TypeScript Progressive Web App bundle is hosted as a static web application:

```text
BROWSER / PWA CLIENT
         │
         ▼ HTTPS (Port 443)
AMAZON CLOUDFRONT (CDN) [P1 / OPTIONAL]
         │
         ├─► Edge SSL Termination via AWS Certificate Manager (ACM)
         ├─► Global Edge Caching for Static Assets (CSS, JS bundles, SVGs)
         ├─► Cache Invalidation on New CI/CD Deployment
         │
         ▼ Origin S3 Fetch
AMAZON S3 BUCKET (Static Hosting) [MVP]
         │
         ├─► Configured as Private Bucket with CloudFront Origin Access Control (OAC)
         └─► Serves `index.html`, `manifest.json`, and Vite bundle artifacts
```

*Hackathon Fallback:* If CloudFront distribution provisioning adds DNS delays, the S3 static website hosting endpoint with direct HTTPS can serve the demo frontend directly.

---

## 5. Amazon API Gateway Architecture

Amazon API Gateway functions as the public managed entry point for all client interactions:
* **API Type:** REST API (Regional Endpoint, `ap-south-1` Mumbai recommended for Indian worksite proximity).
* **Security Edge:**
  * TLS 1.3 enforced.
  * Native Lambda Authorizer / Cognito User Pool Authorizer validating incoming JWT tokens.
  * Cross-Origin Resource Sharing (CORS) configured with explicit allowed origins, methods (`GET`, `POST`, `PUT`, `DELETE`), and headers (`Authorization`, `Content-Type`, `Idempotency-Key`).
* **Request Throttling & Burst Buffering:**
  * Default Stage Limit: 1,000 requests/second.
  * Burst Limit: 2,000 requests.
  * Prevents distributed denial-of-service and protects downstream Lambda compute.
* **Separation of Concerns:** API Gateway performs edge routing and payload validation; it **does not** contain business decision logic.

---

## 6. AWS Lambda Compute Architecture

Rather than deploying dozens of tiny, fragmented micro-functions that suffer from cold starts and complex orchestration overhead, the platform adopts a **Pragmatic Modular Lambda Topology**:

```text
┌──────────────────────────┬──────────────────────┬──────────────────────────────┐
│ LAMBDA FUNCTION          │ TRIGGER MECHANISM    │ CORE DOMAIN RESPONSIBILITIES │
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `ApiHandlerFunction`     │ API Gateway Any Route│ Core REST routing, RBAC gate,│
│                          │                      │ Action commands, Worksite API│
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `WeatherIngestFunction`  │ EventBridge Schedule │ Scheduled Open-Meteo polling,│
│                          │ (Every 60 min)       │ normalization, QA scoring    │
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `RiskEngineFunction`     │ EventBridge Event    │ Pure deterministic heat-risk │
│                          │ (`WEATHER_REFRESHED`)│ calculations across sites    │
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `ActionEngineFunction`   │ EventBridge Event    │ Contextual action generation,│
│                          │ (`RISK_ASSESSED`)    │ assignment, SLA resolution   │
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `EscalationFunction`     │ Step Functions / TTL │ Evaluates unacknowledged SLAs│
│                          │                      │ triggers safety manager alert│
├──────────────────────────┼──────────────────────┼──────────────────────────────┤
│ `AIAssistantFunction`    │ API Gateway Route    │ Formulates grounded prompts, │
│                          │ (`/api/v1/assistant`)│ calls NVIDIA NIM with guards │
└──────────────────────────┴──────────────────────┴──────────────────────────────┘
```

### Packaging & Runtime Standards
* **Runtime:** Node.js 20.x on `arm64` (AWS Graviton2 architecture for superior cost-performance).
* **Bundler:** esbuild via Vite/SAM; tree-shaking yields ultra-lean bundle sizes ($<10\text{ MB}$), keeping cold starts under $250\text{ ms}$.
* **Memory Allocation:** Standard 512 MB to 1024 MB per function, balancing execution speed and CPU credits.

---

## 7. Amazon DynamoDB: Operational Database Architecture

DynamoDB acts as the authoritative operational data store for the entire system:
* **Billing Mode:** On-Demand Capacity Mode (`PAY_PER_REQUEST`), eliminating manual capacity planning during hackathon traffic bursts.
* **Encryption:** Encrypted at rest via AWS-managed encryption keys (AES-256).
* **Data Consistency:**
  * **Strongly Consistent Reads** enforced for safety-critical queries (`/actions`, `/risk/current`, `/escalations`).
  * **Transactional Conditional Writes** (`TransactWriteItems`) used during supervisor acknowledgment to guarantee zero race conditions or double-acknowledgments.
* **Time to Live (TTL):** Enabled on temporary ingestion telemetry and idempotency records (`ttl_timestamp`) to ensure automatic, zero-cost data expiration.

*Detailed table schema, partition keys (`PK`), sort keys (`SK`), and Global Secondary Indexes (`GSI`) are formally specified in `68_DYNAMODB.md`.*

---

## 8. Amazon EventBridge: Scheduling & Domain Event Bus

Amazon EventBridge provides decoupled event routing and scheduled cron execution:
* **Default Event Bus:** Routes application domain events (`heat.action.risk_assessed`, `heat.action.escalated`).
* **EventBridge Scheduler:** Configured with precision cron expressions:
  * Hourly weather ingestion: `cron(0 * * * ? *)`
  * Rapid afternoon heatwave refresh: `cron(*/30 11-16 * * ? *)`
* **Filtering Rules:** Native EventBridge pattern matching filters events at the bus level, ensuring functions only execute when their exact operational preconditions are met.

---

## 9. AWS Step Functions: Workflow & Escalation Orchestration [P1 / OPTIONAL]

For complex multi-step workflows involving countdown delays and human escalations, AWS Step Functions Express/Standard State Machines provide visual, deterministic orchestration:

```text
[ Action Created ]
        │
        ▼
[ Dispatch Notification Lambda ]
        │
        ▼
[ Wait 15 Minutes (SLA Countdown) ]
        │
        ▼
[ Check Acknowledgment Status Lambda ]
        │
        ├─────────────────────────────┐
        ▼ (Status === 'ACKNOWLEDGED')  ▼ (Status === 'PENDING_ACK')
[ Execution Complete: End ]    [ Trigger Escalation Lambda ]
                                      │
                                      ▼
                               [ Notify Safety Manager ]
```

*Hackathon Pragmatism:* If Step Functions introduce deployment friction, the MVP can implement escalation timers using EventBridge scheduled rules or DynamoDB TTL-based stream triggers (`69_EVENTBRIDGE_STEP_FUNCTIONS.md`).

---

## 10. Amazon SNS: Notification Fan-Out [P1 / OPTIONAL]

Amazon Simple Notification Service (SNS) acts as a flexible publish/subscribe fan-out router:
* Used for broadcasting high-priority escalation notices (`CRITICAL_HEAT_EMERGENCY`) to multiple subscriber endpoints (Safety Manager email distributions, SMS gateways).
* Delivery status logging enabled to CloudWatch to track dispatch success.

---

## 11. Amazon CloudWatch: Observability & Operational Health [MVP]

CloudWatch provides centralized visibility across all cloud primitives:
* **CloudWatch Logs:**
  * Retention: 14 days (cost-effective for hackathons).
  * Structured JSON logging emitted by all Lambda functions via `AWS Lambda Powertools`.
* **Standard Operational Metrics:**
  * `ApiGatewayLatency`, `ApiGateway4xxErrorCount`, `ApiGateway5xxErrorCount`.
  * `LambdaInvocations`, `LambdaErrors`, `LambdaDuration`, `LambdaThrottles`.
  * `DynamoDBConsumedReadCapacityUnits`, `DynamoDBSystemErrors`.
* **Operational Alarms:**
  * `HighRiskActionEscalationAlarm`: Fires if $>5$ unacknowledged actions escalate within a 30-minute window.
  * `WeatherIngestionFailureAlarm`: Fires if consecutive Open-Meteo polling attempts fail.

---

## 12. AWS Secrets Manager: Secret & Credential Storage [MVP]

All external API tokens and signing credentials reside exclusively in AWS Secrets Manager:
* **Managed Secrets:**
  * `open-meteo/api-key` (where commercial tier is deployed).
  * `nvidia-nim/api-token` (NVIDIA AI inference endpoints).
  * `jwt-signing-secret` (where standalone JWT token signing is configured).
* **Access Control:** IAM policies restrict secret read access exclusively to the specific Lambda execution roles that require them.
* **Prohibition:** Secrets are **never** committed to Git repositories or injected into client-side web bundles.

---

## 13. AWS IAM: Principle of Least Privilege

IAM execution roles enforce strict privilege boundaries across all serverless compute:

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ EXECUTION ROLE           │ RESTRICTED PERMISSION POLICY                     │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `ApiHandlerRole`         │ Read/Write access to DynamoDB tables; PutEvents  │
│                          │ on EventBridge; Read access to Secrets Manager.  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `WeatherIngestRole`      │ Write access to Weather DynamoDB table;          │
│                          │ PutEvents on EventBridge; Secrets Manager read.  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `RiskEngineRole`         │ Read access to Weather table; Write access to    │
│                          │ RiskAssessment table; PutEvents on EventBridge.  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ `ActionEngineRole`       │ Read access to Risk table; Read/Write access to  │
│                          │ Action table; PutEvents on EventBridge.          │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

*Security Standard:* The blanket policy `AdministratorAccess` is strictly barred from all runtime Lambda execution roles.

---

## 14. Network Architecture: Pragmatic Serverless Topology

For the hackathon MVP, all compute and database components run on **AWS Public Managed Services with IAM and TLS Encryption**:
* Lambda functions, DynamoDB tables, and API Gateway operate over secure, encrypted AWS infrastructure without being placed inside a private Amazon Virtual Private Cloud (VPC).
* **Rationale:** Introducing a private VPC for Lambda requires configuring NAT Gateways (adding $30+/month idle costs and setup friction) and VPC Endpoints for DynamoDB/Secrets Manager, providing zero additional security for pure serverless APIs while significantly slowing down hackathon deployment velocity.
* Every HTTP packet is encrypted in transit via TLS 1.3, and all DynamoDB data is encrypted at rest.

---

## 15. Encryption & Data Protection Standards

* **In Transit:** TLS 1.3 enforced on all API Gateway endpoints, CloudFront distributions, and external HTTP fetches.
* **At Rest:** AES-256 server-side encryption applied automatically across Amazon DynamoDB, Amazon S3 buckets, and AWS CloudWatch Logs.
* **Secret Encryption:** Managed by AWS Key Management Service (AWS KMS) default keys backing AWS Secrets Manager.

---

## 16. Multi-Tenant Data Isolation Strategy

Data isolation across enterprise clients is enforced programmatically by the serverless application layer:
* **Partitioning:** Every DynamoDB record includes an explicit `org_id` partition attribute.
* **Query Scoping:** API Gateway authorizer claims pass the caller's verified `org_id` into Lambda handlers. All DynamoDB queries enforce the tenant ID in their partition key expressions (`PK = ORG#<org_id>`).
* Cross-tenant data leakage is mathematically prevented.

---

## 17. End-to-End AWS Telemetry Data Flow

```text
OPEN-METEO / IMD PROVIDER
           │
           ▼
AMAZON EVENTBRIDGE (Cron: Hourly)
           │
           ▼
AWS LAMBDA: WeatherIngestFunction
           │
           ▼
AMAZON DYNAMODB (Save WeatherRecord)
           │
           ▼
AMAZON EVENTBRIDGE (Event: `heat.action.weather_refreshed`)
           │
           ▼
AWS LAMBDA: RiskEngineFunction
           │
           ▼
AMAZON DYNAMODB (Save RiskAssessment)
           │
           ▼
AMAZON EVENTBRIDGE (Event: `heat.action.risk_assessed`)
           │
           ▼
AWS LAMBDA: ActionEngineFunction
           │
           ▼
AMAZON DYNAMODB (Save ActionRecord)
           │
           ├─────────────────────────────────────────┐
           ▼                                         ▼
AMAZON DYNAMODB (In-App Notification)       AWS STEP FUNCTIONS (SLA Timer)
           │                                         │
           ▼                                         ▼
API GATEWAY -> REACT PWA                     ACTION ESCALATES IF UNACKNOWLEDGED
```

---

## 18. AWS Failure Containment & Resilience Strategy

```text
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ INFRASTRUCTURE FAILURE   │ CLOUD RECOVERY MECHANISM │ SAFETY IMPACT            │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Lambda Execution Crash   │ API Gateway returns 500; │ Client alerts user; no   │
│ (Unhandled Exception)    │ CloudWatch alarm fires.  │ false state saved.       │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ DynamoDB Throttling      │ Lambda SDK automatically │ Zero lost writes; slight │
│                          │ retries with jitter.     │ latency increase (<1s).  │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Weather Feed 504 Timeout │ Ingest Lambda retries 3x;│ Mark record STALE; retain│
│                          │ logs telemetry incident. │ conservative safeguards. │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ EventBridge Queue Jam    │ SQS Dead-Letter Queue    │ Events preserved for     │
│ (Target unreachable)     │ captures unhandled event.│ operator replay.         │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

---

## 19. Dead-Letter Queue (DLQ) Architecture

To prevent silent event loss in asynchronous background processing:
* Asynchronous Lambda consumers (Weather Ingest, Risk Engine, Escalation) are configured with an **Amazon SQS Dead-Letter Queue**.
* If an event execution fails after 3 consecutive attempts, the raw event payload is moved to the DLQ.
* A CloudWatch alarm monitors DLQ depth, alerting operators if events fail processing.

---

## 20. Cost Awareness & Free Tier Utilization

The architecture is explicitly optimized for cost efficiency during hackathon execution:
* **Amazon API Gateway:** Free tier provides 1M REST API calls/month.
* **AWS Lambda:** Free tier provides 1M requests and 3.2M seconds of compute/month.
* **Amazon DynamoDB:** Free tier covers 25 GB of storage and 25 write/read capacity units (or on-demand pay-per-use costing pennies for thousands of operations).
* **Amazon EventBridge:** Event routing costs are negligible for hackathon scale ($1.00 per million events).
* **Estimated Hackathon Operating Cost:** $< \$5.00\text{ USD}$ total AWS infrastructure expenditure.

---

## 21. Deployment Architecture & CI/CD Pipeline

Cloud infrastructure and code artifacts deploy via automated GitHub Actions:

```text
GITHUB REPOSITORY (main branch)
               │
               ▼
GITHUB ACTIONS WORKFLOW RUNNER
               │
               ├─► Run Vitest Unit Tests (Pure Domain Engines)
               ├─► Run ESLint & TypeScript Checks (`tsc --noEmit`)
               ├─► Build React PWA Bundle via Vite
               │
               ▼
INFRASTRUCTURE SYNTHESIS (AWS SAM / AWS CDK)
               │
               ├─► Package Lambda Zip Archives
               ├─► Synthesize CloudFormation Templates
               │
               ▼
AWS CLOUDFORMATION DEPLOYMENT
               │
               ├─► Update API Gateway, Lambda, DynamoDB, EventBridge
               ├─► Sync React PWA build to Amazon S3
               └─► Invalidate CloudFront CDN Cache
```

---

## 22. Infrastructure as Code (IaC) Framework

* **Standard Framework:** **AWS Serverless Application Model (AWS SAM)** or **AWS Cloud Development Kit (AWS CDK in TypeScript)**.
* **Discipline:** The project mandates choosing **one** framework for deployment. Mixing Terraform, manual AWS Console setups, and SAM templates within the same deployment pipeline is prohibited.

---

## 23. AWS Security & Compliance Alignment

Aligned with enterprise safety standards (`80_SECURITY.md` through `89_THREAT_MODEL.md`):
* All cloud resources deploy with explicit resource tags (`Project: HeatActionResponseEngine`, `Environment: demo`).
* CloudWatch Logs capture all administrative and operational activities with zero client PII exposure.

---

## 24. MVP Baseline vs. Future Enterprise Cloud Architecture

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ HACKATHON MVP BASELINE            │ FUTURE ENTERPRISE CLOUD ROADMAP   │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Regional API Gateway (Mumbai)   │ • Multi-Region Active-Active API  │
│ • Single-region DynamoDB          │ • DynamoDB Global Tables          │
│ • Pragmatic serverless topology   │ • Dedicated VPC & PrivateLink     │
│ • EventBridge scheduled crons     │ • AWS IoT Core hardware ingest    │
│ • In-app + basic SNS alerts       │ • Multi-channel Twilio / SES / SNS│
│ • S3 static hosting + CloudFront  │ • AWS WAF edge firewall filtering │
│ • CloudWatch structured logs      │ • AWS X-Ray distributed tracing   │
└───────────────────────────────────┴───────────────────────────────────┘
```
