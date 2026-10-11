# HARE AWS Cloud Architecture & Security Specification

**Project:** Heat Action Response Engine (HARE)  
**Target AWS Account:** `293951764497`  
**Region:** `ap-southeast-2` (Sydney, Australia)  
**Status:** Deployed & Verified

---

## 1. Architectural Overview & Topology

The Heat Action Response Engine transforms external meteorological signals into verifiable, auditable human safety responses. The architecture is engineered around the core invariant that **safety authority is deterministic**, and all operational state transitions are recorded in an immutable ledger.

```
+----------------------------------------------------------------------------------------------------+
|                                      HARE AWS Cloud Architecture                                    |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|    +-----------------------------+                                                                 |
|    |     Amazon S3 Static Host   | <== HTTP / HTTPS Public Entry                                   |
|    |  hare-app-293951764497-syd  |                                                                 |
|    +--------------+--------------+                                                                 |
|                   |                                                                                |
|                   v                                                                                |
|    +-----------------------------+                                                                 |
|    |   Amazon API Gateway (v2)   | (HTTP API: 5k8d4lhgc6.execute-api.ap-southeast-2.amazonaws.com) |
|    +--------------+--------------+                                                                 |
|                   | (Proxy Any Route)                                                              |
|                   v                                                                                |
|    +-----------------------------+         +-------------------------------+                       |
|    |       AWS Lambda API        | <=====> |      Open-Meteo Weather API   |                       |
|    |     (hare-backend-api)      |         |  (Forecast & Live Telemetry)  |                       |
|    |   Node.js 20.x, Serverless  |         +-------------------------------+                       |
|    +---+----------+----------+---+                                                                 |
|        |          |          |                                                                     |
|        |          |          +-----------> +-------------------------------+                       |
|        |          |                        |   NVIDIA NIM Assistive AI     |                       |
|        |          |                        |  (Llama 3.2 11B Instruct)     |                       |
|        |          |                        +-------------------------------+                       |
|        |          v                                                                                |
|        |   +------------------------------------+                                                  |
|        |   |         Amazon DynamoDB            |                                                  |
|        |   |  * HARE-OperationalTable (Actions) |                                                  |
|        |   |  * HARE-TelemetryTable (Weather)   |                                                  |
|        |   |  * HARE-AuditTable (SHA-256 Logs)  |                                                  |
|        |   +------------------------------------+                                                  |
|        v                                                                                           |
|    +-----------------------------+                                                                 |
|    |    AWS Step Functions       | (HARE-SupervisorEscalation-StateMachine)                        |
|    |  * 30-sec SLA Callback      |                                                                 |
|    |  * Deterministic Escalation |                                                                 |
|    +--------------+--------------+                                                                 |
|                   |                                                                                |
|                   v (On Breach)                                                                    |
|    +-----------------------------+                                                                 |
|    |         Amazon SNS          |                                                                 |
|    |  * hare-escalation-breaches | ➔ SMS / Email Notification to Safety Manager                    |
|    +-----------------------------+                                                                 |
|                                                                                                    |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. AWS Service Inventory & Provisioned Resources

### 2.1 Amazon S3 (Static Website Hosting)
- **Bucket:** `hare-app-293951764497-sydney`
- **Location:** `ap-southeast-2`
- **Endpoint:** `http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/`
- **Policy:** Public Read on `/assets/*` and `index.html` with explicit deny on non-website verbs.

### 2.2 Amazon API Gateway
- **API ID:** `5k8d4lhgc6`
- **Protocol:** HTTP API (v2)
- **Public URL:** `https://5k8d4lhgc6.execute-api.ap-southeast-2.amazonaws.com`
- **CORS:** Configured with Allowed Origins `*`, Allowed Methods `GET, POST, PATCH, OPTIONS`, and Allowed Headers `Content-Type, Authorization, X-Request-ID`.

### 2.3 AWS Lambda
- **Function Name:** `hare-backend-api`
- **Runtime:** `nodejs20.x`
- **Memory Size:** 512 MB
- **Timeout:** 30 seconds
- **Role:** `arn:aws:iam::293951764497:role/hare-backend-lambda-role`
- **Handler:** `dist/lambda.handler`
- **Framework:** `@codegenie/serverless-express` wrapping Express application.

### 2.4 Amazon DynamoDB
All tables are configured with **Pay-Per-Request (On-Demand)** billing to minimize hackathon credit consumption:
1. `HARE-OperationalTable`:
   - Partition Key: `PK` (String) — e.g., `WORKSITE#WS-BLR-NORTH-04`
   - Sort Key: `SK` (String) — e.g., `ACTION#act_123`
   - Global Secondary Index: `GSI1` (`GSI1PK`, `GSI1SK`) for cross-site supervisor queries.
2. `HARE-TelemetryTable`:
   - Partition Key: `PK` (String) — `WORKSITE#<id>`
   - Sort Key: `SK` (String) — `TELEMETRY#<timestamp>`
3. `HARE-AuditTable`:
   - Partition Key: `PK` (String) — `TENANT#<org_id>`
   - Sort Key: `SK` (String) — `EVENT#<timestamp>#<event_id>`

### 2.5 AWS Step Functions
- **State Machine ARN:** `arn:aws:stepfunctions:ap-southeast-2:293951764497:stateMachine:HARE-SupervisorEscalation-StateMachine`
- **Workflow:**
  1. Triggered upon Action Assignment with `action_id`, `worksite_id`, `deadline_utc`.
  2. Waits for configured acknowledgment SLA (30 seconds in hackathon simulation).
  3. Re-reads authoritative database action state.
  4. If status is NOT `ACKNOWLEDGED`, triggers SNS breach alert and marks action `ESCALATED`.

### 2.6 Amazon SNS (Simple Notification Service)
- **Topic 1:** `arn:aws:sns:ap-southeast-2:293951764497:hare-emergency-heat-alerts`
  - High-priority heat hazard broadcasts to workers and facility managers.
- **Topic 2:** `arn:aws:sns:ap-southeast-2:293951764497:hare-escalation-breaches`
  - Critical SLA breach notifications delivered directly to Regional Safety Managers.

### 2.7 Amazon EventBridge
- **Custom Event Bus:** `heat-action-event-bus`
- **Scheduled Rule:** `hare-weather-ingest-schedule` (`rate(15 minutes)`) targeting Lambda API to poll microclimate changes across configured worksite coordinates.

### 2.8 Amazon CloudWatch
- **Log Group:** `/aws/lambda/hare-backend-api` (Retention: 14 days)
- **Operational Dashboard:** `HARE-Operational-Cockpit` monitoring invocation count, 5XX errors, duration, and throttles.
- **Alarm:** `HARE-LambdaErrors-Alarm` alerting if Lambda error rate exceeds 5% in a 5-minute evaluation window.

---

## 3. Security, Authentication & Least-Privilege IAM

### 3.1 Authentication & Authorization
- **Token Mechanism:** Stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`).
- **Token Claims:** `sub` (User ID), `email`, `role`, `org_id`, `assigned_worksite_id`.
- **RBAC Matrix:**
  - `SUPERVISOR`: Scoped strictly to `assigned_worksite_id`. Can acknowledge, start, report blockers, and submit completion for actions in their facility. Cross-worksite attempts return `403 FORBIDDEN`.
  - `SAFETY_MANAGER`: Regional multi-worksite scope (`ALL`). Can review multi-site command center, resolve SLA escalations with intervention notes, and perform official safety verification.
  - `ADMIN`: Enterprise scope. Can inspect system diagnostics, cloud topologies, and audit trails.

### 3.2 Immutability & Audit Guarantee
Every state mutation (Evaluation, Generation, Acknowledgment, Blocker, Completion, Escalation, Verification) appends an event to the audit ledger with cryptographic SHA-256 hash chaining:
$$\text{Current Hash} = \text{SHA256}(\text{Previous Hash} + \text{Timestamp} + \text{Actor} + \text{Entity} + \text{Payload})$$
Standard users cannot delete, modify, or rewrite historical audit records.

---

## 4. Cost Awareness & Resource Optimization ($100 Credit Budget)

The entire AWS infrastructure has been optimized for minimal credit burn:
- **S3 & API Gateway:** Pay only per request and standard transfer (< $0.05 / day).
- **Lambda:** Node.js 20 runtime with 512MB RAM executing in ~50-200ms per request (free tier covers 1M requests/mo).
- **DynamoDB:** Configured in `PAY_PER_REQUEST` On-Demand mode (0 idle provisioned capacity costs).
- **Step Functions:** Standard workflow billed per state transition (test execution consumes < $0.001).
- **Total Projected 7-Day Demo Cost:** Less than **$1.50**, conserving >98% of the $100 AWS hackathon credit.
