# HARE Live Hackathon Demonstration Script & Narrative

**Project:** Heat Action Response Engine (HARE)  
**Live URL:** [http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/](http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/)  
**Duration:** 5 - 7 minutes  
**Target Audience:** Hackathon Judges, Enterprise Safety Evaluators, AWS Architects

---

## Storyline & Operational Narrative

> *"Most weather applications tell you it's 38°C outside. In an industrial or logistics setting, knowing it's hot doesn't protect a single worker. What protects workers is operational accountability: knowing who was assigned to refill the electrolyte hydration station, whether they acknowledged it before their deadline, what happened when they reported an equipment blocker, and whether an authorized safety manager physically verified compliance."*

---

## Phase 1: Operational Sign In & Scope Selection (1 min)

1. **Open the Live Application:**
   - Navigate to: `http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/`
2. **Review the Landing Screen:**
   - Point out the core product mission: *"From heat warning to verified workplace action."*
   - Highlight the two architectural pillars on screen:
     - **Authoritative Determinism:** Transparent rule engine, zero hallucinatory AI risk.
     - **Human Operational Accountability:** Human-in-the-loop acknowledgment and verification.
3. **Select Quick Demo Persona:**
   - Click **Rahul Kumar (Site Supervisor • Bangalore Logistics Hub)**.
   - The application authenticates via AWS API Gateway and loads the **Operations Command Cockpit**.

---

## Phase 2: Microclimate Geometry & Live Telemetry (45 Seconds)

1. **Navigate to Worksites & Zones Tab:**
   - Click on the **Worksites & Zones** tab in the top navigation bar.
2. **Inspect Facility Hierarchy & Zones:**
   - On the left under **MANAGED FACILITIES (1)**:
     - Point to: **North Bengaluru Metro Viaduct Site** (`WS-BLR-NORTH-04`, Bangalore, 2 Zones).
   - On the right under **Operational Work Zones (2)**:
     - **Sector 4 Rebar Fabrication Pad** (`ZONE-01-REBAR`) — Type: `OUTDOOR_UNSHADED`, High Metabolic Workload, Direct Sun.
     - **Casting Yard Batching Plant** (`ZONE-02-CASTING`) — Type: `OUTDOOR_CANOPY`, Moderate Workload, Covered Canopy.
3. **Inspect Validated Atmospheric Telemetry:**
   - Point to the live telemetry cards ingested from **Open-Meteo**:
     - **Dry-Bulb Temperature:** (e.g. ~`25°C` live Bangalore satellite reading)
     - **Relative Humidity:** (e.g. `62% - 80%`)
     - **Wind Velocity:** (e.g. `2.8 m/s`)
     - **Direct Solar Radiation:** (e.g. `0 W/m²` dusk/evening)
     - **Data Quality:** Green badge `VALID` (Confidence: 98%).
   - Click the top-right button **Refresh Telemetry** to prove real-time fetch from the weather ingestion pipeline.

---

## Phase 3: Hazard Proof & Deterministic Risk Simulation (1 Minute)

1. **Navigate to Risk Assessments Tab:**
   - Click on the **Risk Assessments** tab.
2. **Demonstrate Deterministic Baseline (Current Weather):**
   - Click **Evaluate Risk for WS-BLR-NORTH-04**.
   - Show the result: `LOW` Risk Level based on current mild evening temperature.
3. **Simulate Severe Heat Wave Spike (Hazard Proof for Judges):**
   - Point to the interactive **Demo Simulation Scenarios** toolbar:
     - Click **🔴 Severe Heat Spike (39°C / 58% RH)**.
   - Click **Evaluate Risk for WS-BLR-NORTH-04**:
     - The engine immediately calculates:
       - **Heat Index:** `57.2°C`
       - **sWBGT:** `34.1°C`
       - **Assessed Risk Level:** `CRITICAL` (Red Badge)
       - **Rule Triggered:** `R01_ENV_CRITICAL` (NOAA SR 90-23 / OSHA NEP criteria).
   - Point to the explanation:
     > *"Authoritative determinism guarantees that safety actions are dispatched instantly without relying on generative AI calculations."*
   - Show that candidate SOP directives are automatically created and pushed to the Action Center queue.

---

## Phase 4: Action Lifecycle & Supervisor Accountability (1 Minute)

1. **Navigate to Workplace Action Center:**
   - Click on the **Action Center** tab.
   - Show the queue of deterministic safety actions assigned to worksite supervisors.
2. **Open the Action Management Drawer:**
   - In the table, point to an action (e.g. `[P2_MEDIUM] Replenish Clean Chilled Drinking Water Stations` or `[P1_CRITICAL] Mandatory Work Stoppage`).
   - Notice: You can **click anywhere on the table row** or click the blue **Manage** button on the right.
   - The slide-out action management drawer opens from the right.
3. **Supervisor Acknowledgment:**
   - In the drawer, point to the blue button: **Acknowledge Assignment (Supervisor)**.
   - Click the button.
   - Notice the status immediately changes from `PENDING_ACKNOWLEDGMENT` to `ACKNOWLEDGED`.
4. **Demonstrating Operational Obstacles (Blocker Escalation):**
   - Under the **Report Operational Blocker** section:
     - Enter reason: *"Water cooler #2 cooling coil malfunction; ice supplier delayed."*
     - Click **Confirm Blocker**.
     - Notice: Action status transitions to `ESCALATED`.
     - *Key Pitch:* "HARE does not hide field friction — reporting a blocker immediately triggers an AWS Step Functions escalation to regional safety leadership!"
5. **Supervisor Work Completion:**
   - If continuing work: Under **Submit Work Completion**:
     - Enter completion evidence notes: *"Procured 4 emergency 20L chilled water dispensers at Sector 4 rebar pad."*
     - Click **Submit Completion for Verification**.
     - Status updates to `IN_PROGRESS` with verification evidence attached.

---

## Phase 5: Regional Safety Manager Intervention & Verification (1 Minute)

1. **Switch Persona to Regional Safety Manager:**
   - Click **Sign Out** in the top right header.
   - Click **Ananya Rao (Regional Safety Manager • Multi-Worksite Scope)**.
2. **Resolve the Escalated SLA Breach:**
   - Click on the **Escalations** tab.
   - Show the breach card:
     - Point to `BREACH #esc_...` with tag `SUPERVISOR_BLOCKED` or `ACKNOWLEDGMENT_SLA_BREACH`.
     - Point to the AWS notification proof: `AWS SNS Alert: DISPATCHED to Regional Safety Mgr (usr_mgr_ananya)`.
     - *(Note: If all escalations were previously resolved, click the prominent button **⚡ Simulate Step Functions SLA Timeout** to generate an instant live demo breach!)*
   - On the right under **Safety Manager Resolution Panel**:
     - Click **Resolve Breach** on the card.
     - Enter resolution notes: *"Contacted supervisor Rahul Kumar via radio; authorized emergency commercial ice procurement. Verified crew hydration intact."*
     - Click **Confirm Resolution**.
     - The breach transitions to `RESOLVED` in the historical log.
3. **Execute Human Safety Verification:**
   - Return to **Action Center** ➔ Click **Manage** on the action.
   - Scroll down to the green **Safety Manager Human Verification** panel:
     - Enter verification notes: *"Inspected chilled water temperature at 12°C. Compliance confirmed."*
     - Click **Accept Human Verification & Close**.
     - Action achieves final compliance status: `VERIFIED`.

---

## Phase 6: Immutable Compliance Audit Trail & Cloud Architecture (1 Minute)

1. **Inspect Immutable Audit Trail:**
   - Click on the **Audit History** tab.
   - Point to the **SHA-256 HASH CHAINED** badge:
     - Every single event (`ACTION_ACKNOWLEDGED`, `ACTION_ESCALATED`, `ESCALATION_RESOLVED`, `ACTION_VERIFIED`) is sealed with a cryptographic hash chain (`PREV HASH` ➔ `CURR HASH`).
     - Point out: Even if an enterprise database is compromised, historical safety compliance cannot be falsified or altered without breaking the hash chain.
2. **Inspect System Health & Live AWS Cloud Architecture:**
   - Click on the **System Health** tab.
   - Point to the green status pill: `PHASE 1-7 VERIFIED`.
   - Point out the live AWS cloud services actively powering the platform:
     - **Amazon S3 Website:** Deployed in Sydney (`ap-southeast-2`)
     - **Amazon API Gateway:** Managed HTTPS REST API
     - **AWS Lambda:** Node.js 20.x Serverless compute
     - **Amazon DynamoDB:** High-throughput operational store
     - **Amazon RDS:** Relational compliance store
     - **AWS Step Functions:** Automated SLA breach countdown state machine
     - **Amazon SNS:** Urgent supervisor & safety manager alert dispatch
     - **Amazon EventBridge:** 15-minute automated telemetry ingestion scheduler
     - **NVIDIA NIM:** Assistive intelligence (`meta/llama-3.2-11b-vision-instruct`)
3. **Closing Punchline:**
   - Look at the judges and conclude:
     > *"HARE is not another weather app. It is an end-to-end operational safety accountability engine that ensures when heat risks strike, physical protections are executed, human-verified, and cryptographically proven on AWS."*

