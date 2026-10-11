# Heat Action Response Engine (HARE) — Project Architecture & System Blueprint

**Project Name:** Heat Action Response Engine (HARE)  
**Tagline:** *From heat warning to verified workplace action.*  
**Target Event:** AWS Hackathon — Operational Heat Safety & Climate Resilience  
**Live Production S3 App:** [http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/](http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/)  
**Live API Gateway Base URL:** `https://5k8d4lhgc6.execute-api.ap-southeast-2.amazonaws.com`  
**AWS Account ID:** `293951764497`  
**Primary Region:** `ap-southeast-2` (Sydney)  
**Budget Guardrail Region:** `us-east-1` (Global)

---

## 1. Executive Summary & Problem Space

Extreme heat is an occupational killer. Traditional heat safety programs rely on passive advisory emails, weather apps, or generic spreadsheets. When the wet-bulb globe temperature spikes, these passive warnings fail because:
1. **No Operational Grounding:** High-level city weather alerts do not reflect on-site microclimates (e.g. rebar yards vs. covered casting sheds).
2. **No Closed-Loop Accountability:** Nobody knows who acknowledged an alert, what protective actions were taken, or whether hydration and rest breaks actually occurred.
3. **No Verifiable Regulatory Audit Trail:** Paper logs and post-incident recollections cannot prove compliance to OSHA/regulatory inspectors.

**The HARE Solution:**
The Heat Action Response Engine converts environmental signals into deterministic, verifiable workplace actions through an authoritative rule engine, serverless cloud orchestration, automated SLA escalation, and an immutable SHA-256 hash-chained audit ledger.

---

## 2. End-to-End System Architecture Diagram (Mermaid)

```mermaid
flowchart TB
    %% STYLING SPECIFICATIONS
    classDef client fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a;
    classDef gateway fill:#ede9fe,stroke:#7c3aed,stroke-width:2px,color:#0f172a;
    classDef compute fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#0f172a;
    classDef storage fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a;
    classDef external fill:#f1f5f9,stroke:#64748b,stroke-width:2px,color:#0f172a;
    classDef workflow fill:#fce7f3,stroke:#db2777,stroke-width:2px,color:#0f172a;
    classDef ai fill:#fae8ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
    classDef ops fill:#fef9c3,stroke:#ca8a04,stroke-width:2px,color:#0f172a;

    %% 1. PRESENTATION LAYER
    subgraph TIER1 [" 1. CLIENT PRESENTATION LAYER "]
        direction TB
        USER1["👷 Site Supervisor<br/><b>Rahul Kumar</b> (Site Scope: WS-BLR-NORTH-04)"]:::client
        USER2["🦺 Regional Safety Manager<br/><b>Ananya Rao</b> (Enterprise Multi-Site Scope)"]:::client
        USER3["⚙️ System Administrator<br/><b>Vikram Singh</b> (Platform & Audit Scope)"]:::client
        S3["🪣 Amazon S3 Static Website Hosting<br/>React 18 + TypeScript SPA<br/><code>hare-app-293951764497-sydney</code>"]:::client
    end

    %% 2. API INGRESS LAYER
    subgraph TIER2 [" 2. API INGRESS & ROUTING LAYER "]
        APIGW["⚡ Amazon API Gateway (HTTP API v2)<br/>HTTPS CORS Proxy • JWT Bearer Auth<br/><code>5k8d4lhgc6.execute-api.ap-southeast-2</code>"]:::gateway
    end

    %% 3. SERVERLESS CORE BACKEND
    subgraph TIER3 [" 3. SERVERLESS CORE BACKEND COMPUTE LAYER "]
        direction TB
        LAMBDA["λ AWS Lambda Backend API Engine<br/>Node.js 20.x • Serverless Express • 512MB RAM<br/><code>hare-backend-api</code>"]:::compute
        
        subgraph ENGINES [" Core Business Logic & Invariants "]
            AUTH["🔐 RBAC Auth Service<br/>JWT Sign/Verify • Strict Scope Guard"]:::compute
            RISK["🌡️ Authoritative Deterministic Heat Risk Engine<br/>v1.0.0 Rule Matrix • sWBGT Proxy • Fail-Safe"]:::compute
            ACTION["📋 Action Lifecycle Engine<br/>SOP Generation • Deduplication • Priority Queue"]:::compute
            AUDIT["🔒 Audit Ledger Service<br/>SHA-256 Hash Chained • Immutable Blocks"]:::compute
        end
        LAMBDA --- ENGINES
    end

    %% 4. EDGE WORKER COMPUTING
    subgraph TIER_EDGE [" EDGE COMPUTING "]
        EC2["💻 Amazon EC2 Edge Worker Node<br/>Instance: <code>i-0c6453f7986631915</code> (t3.micro, AL2023)<br/>Public IP: 3.106.130.183 • IoT Telemetry Relay"]:::compute
    end

    %% 5. EXTERNAL INGESTION & ASSISTIVE AI
    subgraph TIER_EXT [" 4. EXTERNAL TELEMETRY & ASSISTIVE AI "]
        OPENMETEO["🌦️ Open-Meteo Weather API<br/>Hourly UTC Ingestion (Temp, Humidity, Solar, Wind)"]:::external
        BEDROCK["🧠 Amazon Bedrock<br/>• Titan Embeddings V2 (1024-dim vectors)<br/>• Nova Micro (Assistive Safety Summaries)"]:::ai
        NVIDIA["✨ NVIDIA NIM Assistive AI<br/>Meta Llama 3.2 11B Vision Instruct<br/><i>(Strictly Non-Authoritative)</i>"]:::ai
    end

    %% 6. DATA PERSISTENCE LAYER
    subgraph TIER4 [" 5. DURABLE DATA PERSISTENCE LAYER "]
        direction TB
        DDB_OPS["🗄️ DynamoDB: <code>HARE-OperationalTable</code><br/>PK/SK: Actions, Worksites, Statuses, GSI1 Indexes"]:::storage
        DDB_TEL["🗄️ DynamoDB: <code>HARE-TelemetryTable</code><br/>Historical Microclimate Readings & Weather Caches"]:::storage
        DDB_AUD["🗄️ DynamoDB: <code>HARE-AuditTable</code><br/>Cryptographic Tamper-Evident SHA-256 Blocks"]:::storage
        RDS["🐘 Amazon RDS PostgreSQL 18.3<br/>Instance: <code>hare-relational-db</code> (db.t3.micro)<br/>Relational Compliance & Regulatory Reporting"]:::storage
    end

    %% 7. ORCHESTRATION & ALERTS
    subgraph TIER5 [" 6. WORKFLOW ORCHESTRATION & NOTIFICATIONS "]
        direction TB
        SFN["🔄 AWS Step Functions State Machine<br/><code>HARE-SupervisorEscalation-StateMachine</code><br/>30s SLA Countdown Timer & Automated Callback"]:::workflow
        SNS["📢 Amazon SNS Topics<br/>• <code>hare-emergency-heat-alerts</code><br/>• <code>hare-escalation-breaches</code>"]:::workflow
        EVENTBRIDGE["⏰ Amazon EventBridge<br/>Bus: <code>heat-action-event-bus</code><br/>Rule: <code>hare-weather-ingest-schedule</code> (15-min cron)"]:::workflow
    end

    %% 8. OBSERVABILITY & GOVERNANCE
    subgraph TIER6 [" 7. OBSERVABILITY & GOVERNANCE LAYER "]
        CW["📊 Amazon CloudWatch<br/>• Log Group: <code>/aws/lambda/hare-backend-api</code><br/>• Dashboard: <code>HARE-Operational-Cockpit</code><br/>• Alarm: <code>HARE-LambdaErrors-Alarm</code>"]:::ops
        BUDGET["💰 AWS Budgets<br/><code>HARE-Hackathon-Safety-Budget</code> ($50.00/mo)"]:::ops
        SSM["🔑 AWS Systems Manager Parameter Store<br/><code>/hare/config/*</code> Application Configurations"]:::ops
    end

    %% ARCHITECTURAL FLOW CONNECTIONS
    USER1 -->|HTTPS Browser| S3
    USER2 -->|HTTPS Browser| S3
    USER3 -->|HTTPS Browser| S3

    S3 -.->|REST API Calls (CORS)| APIGW
    APIGW -->|Proxy HTTP Payload| LAMBDA

    EC2 -.->|Telemetry Relay Ingest| APIGW

    LAMBDA <-->|Weather Fetch (UTC)| OPENMETEO
    LAMBDA <-->|Semantic Context| BEDROCK
    LAMBDA <-->|Advisory Q&A| NVIDIA

    LAMBDA -->|Read/Write Operations| DDB_OPS
    LAMBDA -->|Store Observations| DDB_TEL
    LAMBDA -->|Append Hash Chained Events| DDB_AUD
    LAMBDA -->|Sync Relational Schema| RDS

    LAMBDA -->|Start Execution (actionId)| SFN
    SFN -->|SLA Timeout Breach Event| SNS
    SNS -->|Urgent SMS / Email Alert| USER2

    EVENTBRIDGE -->|15-Minute Cron Trigger| LAMBDA

    LAMBDA -.->|Emit Real-time Logs & Metrics| CW
    LAMBDA -.->|Retrieve Dynamic Config| SSM
```

---

## 3. Detailed Architectural Layer Explanations

### Tier 1: Client & Presentation Layer
* **Amazon S3 (`hare-app-293951764497-sydney`):**
  * Hosts the production Single Page Application (React 18, TypeScript, Tailwind CSS / Vanilla CSS design system).
  * Direct URL: `http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/`
* **Role-Based Dynamic Workspaces:**
  * **Site Supervisor (Rahul Kumar):** Scoped exclusively to his assigned facility (`WS-BLR-NORTH-04`). Features a priority operational action queue, one-click acknowledgment, blocker reporting with mitigation notes, and completion submissions.
  * **Regional Safety Manager (Ananya Rao):** Unrestricted visibility across all 19 regional worksites. Features an Escalations resolution center for unacknowledged actions, emergency override controls, and human verification sign-off.
  * **System Administrator (Vikram Singh):** Enterprise oversight, cryptographic SHA-256 audit ledger inspection, and live AWS cloud infrastructure health probes.

### Tier 2: API Ingress & Routing Layer
* **Amazon API Gateway (HTTP API v2 `5k8d4lhgc6`):**
  * Fully managed, low-latency entry point with integrated CORS handling (`GET`, `POST`, `PUT`, `OPTIONS`).
  * Routes all requests (`/{proxy+}`) directly into the Lambda backend compute engine.
  * Enforces JWT Authorization headers (`Bearer <token>`).

### Tier 3: Serverless Core Backend Compute Layer
* **AWS Lambda (`hare-backend-api`):**
  * Node.js 20.x runtime packaged via `@codegenie/serverless-express`.
  * **Deterministic Heat Risk Engine (v1.0.0):** Authoritative rule matrix computing NOAA Heat Index and simplified Wet-Bulb Globe Temperature (sWBGT).
    * *Core Invariant:* **AI is strictly assistive and NEVER in the authoritative calculation path.**
    * *Fail-Safe Logic:* Missing or invalid sensor inputs escalate to `HIGH` risk rather than defaulting to false safety (`MISSING != SAFE`).
  * **Action Lifecycle Engine:** Generates SOP directives (misting fans, shaded rest rotations, electrolyte delivery) and prevents duplicate action generation for active in-flight hazards.
  * **Audit Ledger Service:** Implements SHA-256 cryptographic hash-chaining where each action event embeds the hash of the preceding block, guaranteeing tamper evidence.

### Tier 4: External Ingestion & Assistive AI Layer
* **Open-Meteo Weather API:** Ingests live dry-bulb temperature, relative humidity, wind velocity, and direct solar radiation normalized into strict UTC ISO strings.
* **Amazon Bedrock:**
  * Foundation Model: `amazon.titan-embed-text-v2:0` (1024-dimensional semantic text embeddings).
  * Foundation Model: `amazon.nova-micro-v1:0` (Assistive workplace safety summaries).
* **NVIDIA NIM:** Llama 3.2 11B Vision Instruct for advisory Q&A and multi-lingual worker advisory summaries.

### Tier 5: Durable Data Persistence Layer
* **Amazon DynamoDB (On-Demand NoSQL):**
  * `HARE-OperationalTable`: Stores active actions, worksite boundaries, microclimate zones, and worker profiles. Partitioned for millisecond status updates.
  * `HARE-TelemetryTable`: Archives weather inputs, heat indices, and sensor time-series.
  * `HARE-AuditTable`: Immutable ledger recording every lifecycle transition with previous-hash linkage.
* **Amazon RDS PostgreSQL 18.3 (`hare-relational-db`):**
  * Provisioned `db.t3.micro` instance with 20GB gp2 storage.
  * Dedicated to structured compliance reporting and regulatory compliance queries.

### Tier 6: Workflow Orchestration & Messaging Layer
* **AWS Step Functions (`HARE-SupervisorEscalation-StateMachine`):**
  * Executes a resilient 30-second acknowledgment timer when a critical heat action is generated.
  * If the Site Supervisor fails to acknowledge within the SLA window, the state machine automatically triggers a breach event.
* **Amazon SNS Topics:**
  * `hare-emergency-heat-alerts`: High-priority heat hazard broadcasts.
  * `hare-escalation-breaches`: Dispatches escalation notices directly to the Regional Safety Manager.
* **Amazon EventBridge:**
  * Configured with custom event bus `heat-action-event-bus` and a 15-minute recurring cron rule `hare-weather-ingest-schedule` to continuously refresh telemetry.

### Tier 7: Edge Worker & Governance Layer
* **Amazon EC2 (`i-0c6453f7986631915`):**
  * `t3.micro` running Amazon Linux 2023 at `3.106.130.183`.
  * Simulates an edge worksite IoT collector gateway.
* **Amazon CloudWatch:** Real-time logging under `/aws/lambda/hare-backend-api`, operational dashboard `HARE-Operational-Cockpit`, and alarm `HARE-LambdaErrors-Alarm`.
* **AWS Budgets:** Active budget `HARE-Hackathon-Safety-Budget` ($50.00/month limit) protecting AWS credits.
* **AWS Systems Manager (SSM):** Secure parameter storage for `/hare/config/*`.

---

## 4. End-to-End Operational Lifecycle Walkthrough

```
[1. WEATHER SIGNAL]
       │  (Open-Meteo Ingestion via EventBridge 15-min Cron or Manual Trigger)
       ▼
[2. DETERMINISTIC RISK EVALUATION]
       │  (Authoritative Rule Matrix: sWBGT Proxy, Heat Index, Workload Factor)
       ▼
[3. ACTION GENERATION & DEDUPLICATION]
       │  (Generates SOP: e.g. act_chilled_water_refill assigned to Rahul Kumar)
       ▼
[4. SLA COUNTDOWN INITIATED]
       │  (AWS Step Functions 30-sec timer begins)
       ├─────────────────────────────────────────┐
       │ (Supervisor acknowledges in time)       │ (SLA window expires or blocker logged)
       ▼                                         ▼
[5. ACTION ACKNOWLEDGED]               [6. SLA BREACH ESCALATED]
       │                                         │
       │ (Field execution & notes)               │ (Amazon SNS alert sent to Safety Manager)
       ▼                                         ▼
[7. COMPLETION SUBMITTED]              [8. SAFETY MGR RESOLUTION]
       │                                         │
       └────────────────────┬────────────────────┘
                            ▼
                [9. HUMAN VERIFICATION]
         (Safety Manager Ananya Rao inspects & verifies)
                            ▼
              [10. TERMINAL STATUS: VERIFIED]
                            ▼
            [11. SHA-256 AUDIT LEDGER ENTRY]
           (Cryptographic Hash Chained & Immutable)
```

---

## 5. Master Prompt for Google Gemini (Generate Professional Draw.io Diagram)

Copy and paste the entire block below into Google Gemini to generate the professional XML diagram code:

```text
Act as a Principal AWS Solutions Architect and enterprise system diagram designer.

Please generate a complete, professional, publication-quality AWS Architecture Diagram for the "Heat Action Response Engine (HARE)" platform. 

Output the response in two parts:
Part 1: A valid, production-grade Draw.io XML document enclosed in a ```xml code block that can be directly imported into Draw.io (Diagrams.net) by clicking Arrange > Insert > Advanced > XML.
Part 2: A brief component and connection summary explaining the visual layout.

Use the following design standards:
- Modern AWS Architecture 2024 styling: standard AWS cloud container boundaries, clean pastel container fills, rounded rectangle cards, and professional typography.
- Clear Swimlane Layout with 6 structured tiers:
  1. Client Presentation Tier (Top)
  2. API Ingress & Routing Tier
  3. Serverless Compute & Edge Tier
  4. External Integrations & Assistive AI Tier
  5. Persistence & Storage Tier
  6. Workflow, Messaging & Governance Tier (Bottom/Right)
- Clear color-coded connectors:
  * Blue solid arrows for HTTPS/REST traffic
  * Green solid arrows for Database read/writes
  * Orange/Red dashed arrows for SLA breach and escalation flows
  * Purple solid arrows for EventBridge & Step Functions orchestration
  * Slate dashed arrows for CloudWatch logs and metrics

Here is the exact technical system data to include in the diagram:

1. CLIENT PRESENTATION LAYER:
   - User Persona 1: Site Supervisor (Rahul Kumar) [Site Scope: WS-BLR-NORTH-04]
   - User Persona 2: Regional Safety Manager (Ananya Rao) [Enterprise Multi-Site Scope]
   - User Persona 3: System Administrator (Vikram Singh) [Governance & Audit Scope]
   - Amazon S3 Bucket: hare-app-293951764497-sydney (Static Website Hosting React 18 + TS SPA)

2. API INGRESS & ROUTING LAYER:
   - Amazon API Gateway HTTP API v2 (5k8d4lhgc6.execute-api.ap-southeast-2.amazonaws.com) with CORS & JWT Auth.

3. SERVERLESS CORE BACKEND COMPUTE LAYER:
   - AWS Lambda: hare-backend-api (Node.js 20.x, Serverless Express, 512MB RAM, 30s timeout)
   - Internal Submodules:
     * RBAC Authentication Service (JWT & Worksite Scope Guard)
     * Authoritative Deterministic Heat Risk Engine (v1.0.0 Rule Matrix, sWBGT Proxy)
     * Action Lifecycle Engine (SOP Generation & Deduplication)
     * Cryptographic SHA-256 Audit Ledger Service
   - Amazon EC2 Edge Worker: i-0c6453f7986631915 (t3.micro, AL2023, Public IP: 3.106.130.183) for on-site IoT telemetry relay.

4. EXTERNAL DATA & ASSISTIVE AI:
   - Open-Meteo Weather API (Hourly UTC Ingestion)
   - Amazon Bedrock (Titan Text Embeddings V2 & Nova Micro Assistive Summaries)
   - NVIDIA NIM (Meta Llama 3.2 11B Vision Instruct) - strictly marked as Non-Authoritative Assistive AI

5. DURABLE DATA PERSISTENCE LAYER:
   - Amazon DynamoDB On-Demand Tables:
     * HARE-OperationalTable (Actions, Assignments, Worksites)
     * HARE-TelemetryTable (Atmospheric Observations)
     * HARE-AuditTable (Cryptographically Chained SHA-256 Blocks)
   - Amazon RDS PostgreSQL 18.3: hare-relational-db (db.t3.micro, 20GB gp2) for regulatory reporting.

6. WORKFLOW ORCHESTRATION, NOTIFICATIONS & GOVERNANCE:
   - AWS Step Functions: HARE-SupervisorEscalation-StateMachine (30-sec SLA callback timer)
   - Amazon SNS Topics: hare-emergency-heat-alerts and hare-escalation-breaches
   - Amazon EventBridge: Custom Bus heat-action-event-bus & 15-minute cron rule hare-weather-ingest-schedule
   - Amazon CloudWatch: Log Group /aws/lambda/hare-backend-api, Dashboard HARE-Operational-Cockpit, Alarm HARE-LambdaErrors-Alarm
   - AWS Budgets: HARE-Hackathon-Safety-Budget ($50.00/mo credit guardrail in us-east-1)
   - AWS SSM Parameter Store: /hare/config/*

Make the Draw.io XML complete, well-proportioned, visually stunning, and free of syntax errors so it renders immediately upon pasting into Diagrams.net!
```

---

## 6. How to Import and Render in Draw.io (Diagrams.net)

1. Open your web browser and navigate to [https://app.diagrams.net](https://app.diagrams.net).
2. Select **Create New Diagram** or **Blank Diagram**.
3. In the top navigation menu, click **Arrange** > **Insert** > **Advanced** > **XML...**
4. Paste the XML generated by Google Gemini into the text area.
5. Click **Insert**.
6. Draw.io will automatically lay out the complete enterprise architecture with all AWS components, containers, labels, and color-coded connectors ready for your presentation or documentation.
