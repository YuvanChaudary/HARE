# HARE — 3-Minute YouTube Video Demo Script

**Project:** Heat Action Response Engine (HARE)  
**Submission Target:** Amazon Hackathon Video Demo  
**Video Length Constraint:** Strictly Under 3 Minutes (Target: ~2 min 45 sec)  
**Live Application URL:** [http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/](http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/)  
**Required Evaluation Criteria Addressed:**
1. ✅ **About the Project**
2. ✅ **Tech Stack & Architecture**
3. ✅ **How AWS is Used (Deep Service Integration)**
4. ✅ **Learning & Growth**

---

## Recording Checklist Before You Hit Record
- [ ] Browser open to: `http://hare-app-293951764497-sydney.s3-website-ap-southeast-2.amazonaws.com/`
- [ ] Microphone tested and audio clear.
- [ ] Browser zoom set to 100% or 90% so all cards are clearly visible.
- [ ] Resolution set to 1080p (Full HD).

---

## ⏱️ Video Timeline Breakdown

```
0:00 ─── 0:35   Part 1: About the Project (The Problem & Vision)
0:35 ─── 1:20   Part 2: Operational Workflow (Zones, Heat Risk & Supervisor Action)
1:20 ─── 2:05   Part 3: How We Used AWS (Step Functions, SNS, DynamoDB, RDS, Lambda)
2:05 ─── 2:35   Part 4: Tech Stack & Deterministic Invariants vs. Assistive AI
2:35 ─── 3:00   Part 5: Learning, Growth & Conclusion
```

---

## Detailed Script & Teleprompter

### ⏱️ 0:00 – 0:35 | Part 1: About the Project
**🖥️ On-Screen:**
- Start on the **Sign In Screen**.
- Point mouse to the headline: *"From heat warning to verified workplace action."*
- Click persona button: **Rahul Kumar (Site Supervisor • Bangalore Logistics Hub)** to log in into the **Operations Dashboard**.

**🗣️ Voiceover (Speak clearly and with energy):**
> *"Every industrial workplace today has a weather app showing it's 38°C outside. But in a rebar yard or a logistics hub, knowing it’s hot doesn’t protect a single worker.*  
> 
> *What protects workers is operational accountability: knowing who was assigned to refill chilled water, whether they acknowledged it before their deadline, what happened when equipment failed, and whether safety leadership verified compliance.*  
> 
> *This is HARE — the Heat Action Response Engine. We turn passive weather alerts into verified, audited workplace safety actions powered by live AWS cloud infrastructure."*

---

### ⏱️ 0:35 – 1:20 | Part 2: Live Operational Workflow
**🖥️ On-Screen:**
1. Click **Worksites & Zones** tab:
   - Point to the 2 microclimate zones: *Sector 4 Rebar Fabrication Pad (Direct Sun)* and *Casting Yard (Canopy)*.
   - Point to live Open-Meteo weather cards (Dry-Bulb Temp, Humidity, Valid badge).
2. Click **Risk Assessments** tab:
   - Click scenario pill **🔴 Severe Heat Spike (39°C / 58% RH)**, then click **Evaluate Risk for WS-BLR-NORTH-04**.
   - Show the calculated Heat Index (57.2°C) and rule trigger `R01_ENV_CRITICAL`.
3. Click **Action Center** tab:
   - Click the action row or the blue **Manage** button on `Replenish Clean Chilled Drinking Water Stations`.
   - In the drawer, click **Acknowledge Assignment (Supervisor)** (status changes to `ACKNOWLEDGED`).
   - Under *Report Operational Blocker*, type *"Cooler coil fault"* and click **Confirm Blocker** (status transitions to `ESCALATED`).

**🗣️ Voiceover:**
> *"HARE models physical microclimates rather than treating an entire facility as a single temperature point.*  
> 
> *When live telemetry detects hazardous conditions—like this 39°C heat spike with a 57.2°C Heat Index—our deterministic engine immediately generates standard operating procedures.*  
> 
> *In the Workplace Action Center, supervisors receive SLA-bound directives. Rahul acknowledges receipt in real time. And if equipment fails on the ground, reporting a blocker immediately triggers an escalation."*

---

### ⏱️ 1:20 – 2:05 | Part 3: How We Used AWS
**🖥️ On-Screen:**
1. Click **Sign Out** in top header ➔ Click **Ananya Rao (Regional Safety Manager)**.
2. Click **Escalations** tab:
   - Point to the breach card: `BREACH #esc_...` with badge `SUPERVISOR_BLOCKED`.
   - Highlight the alert: `AWS SNS Alert: DISPATCHED to Regional Safety Mgr`.
   - On the right panel, enter notes: *"Authorized emergency ice procurement"*, then click **Confirm Resolution**.
3. Click **Audit History** tab:
   - Point to the green **SHA-256 HASH CHAINED** badge and the cryptographic hash sequence linking all events.
4. Click **System Health** tab:
   - Point to the active AWS Sydney cloud services list.

**🗣️ Voiceover:**
> *"Here is how AWS powers HARE end-to-end:*  
> - *Our production frontend is hosted globally on **Amazon S3 Website Hosting** in Sydney.*  
> - *Requests route through **Amazon API Gateway** into serverless **AWS Lambda** compute running Node.js.*  
> - *High-throughput operational state is stored in **Amazon DynamoDB**, while relational compliance and worksite metadata reside in **Amazon RDS**.*  
> - *When an acknowledgment deadline breaches, **AWS Step Functions** state machines orchestrate the SLA countdown and dispatch urgent alerts across **Amazon SNS**.*  
> - *Every 15 minutes, **Amazon EventBridge** triggers automated weather ingestion.*  
> - *And in the Audit History, every action is cryptographically sealed in an immutable **SHA-256 hash chain** for regulatory compliance."*

---

### ⏱️ 2:05 – 2:35 | Part 4: Tech Stack & Architectural Invariants
**🖥️ On-Screen:**
- Stay on **System Health** or switch to **Operations Dashboard**.
- Point to the bottom footer: `Authoritative Determinism Guarantee` and `AWS Region: ap-southeast-2 (Sydney)`.

**🗣️ Voiceover:**
> *"For our tech stack, we built a React, TypeScript, and Vite single-page application communicating with an Express and TypeScript backend.*  
> 
> *A core architectural principle in HARE is Authoritative Determinism. When human life is on the line in extreme heat, calculations cannot hallucinate. Risk thresholds follow strict OSHA, NOAA, and IMD standards evaluated deterministically.*  
> 
> *AI is kept strictly assistive—we integrate Amazon Bedrock and NVIDIA NIM vision models for executive shift briefings and image safety analysis, completely decoupled from the life-safety calculation path."*

---

### ⏱️ 2:35 – 3:00 | Part 5: Learning, Growth & Conclusion
**🖥️ On-Screen:**
- Click **Sign Out** to return to the polished landing page, or show the **Operations Dashboard** with resolved metrics.
- Keep the webcam / screen centered on the HARE logo and final slide.

**🗣️ Voiceover:**
> *"Building HARE gave us huge growth in designing resilient event-driven cloud systems. Our biggest learning was balancing strict serverless cost guardrails via AWS Budgets with high-availability state machines in Step Functions, ensuring zero lost alerts during critical emergencies.*  
> 
> *HARE proves that with the power of AWS, enterprise safety can move from passive heat forecasts to verified, life-saving operational accountability.*  
> 
> *Thank you!"*

---

## 🎯 Word Count & Timing Verification
- **Total Spoken Word Count:** ~410 words
- **Average Reading Speed:** 140 - 150 words/minute
- **Estimated Runtime:** **2 minutes 45 seconds** (Well within the 3-minute hard ceiling!)
