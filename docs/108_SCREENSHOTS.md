# 108 — Screenshot Capture Plan & Evidence Catalog

```text
Status: Documented
Scope: Hackathon Submission Visual Assets & Evidence Catalog
Audience: Evaluators, Judges, Submission Lead, Graphic Designers
Target Resolution: 1920x1080 (Desktop) / 1080x2400 (Mobile PWA)
Integrity Standard: ZERO MOCKUPS OF NON-EXISTENT FUNCTIONALITY
```

---

## 1. Screenshot Capture Purpose & Visual Standards

Screenshots in the hackathon submission dossier serve as primary **static visual proof** of product completion, architecture maturity, and front-line usability.

### Non-Negotiable Visual Standards
* **Synthetic Data Only:** All visual captures must use pre-seeded test data (`docs/38_SIMULATION_MODE.md`). No personal names, real worker phone numbers, or private corporate identities may appear.
* **Credential Sanitization:** Browser developer consoles, environment variables, authentication bearer headers, and AWS account IDs must be completely hidden.
* **Consistent Scenario Narrative:** All captures must represent the canonical **North Bengaluru Commercial Construction Site** scenario to maintain continuity.
* **No Speculative Mockups:** Every screenshot must be a direct capture of active running software components. Fabricated Figma concept art passed off as functioning code is strictly prohibited.

---

## 2. Required Screenshot Inventory

The submission requires exactly seven primary visual captures:

```text
/submission-assets/screenshots/
├── 01_dashboard.png         # Multi-Worksite Command Overview
├── 02_risk_assessment.png   # Deterministic Heat Risk Detail & Factor Breakdown
├── 03_action.png            # Assigned Action Card with Countdown Timer
├── 04_escalation.png        # Safety Manager Escalation Queue & Intervention
├── 05_verification.png      # Physical Inspection Verification Modal
├── 06_audit.png             # Immutable DynamoDB Audit Ledger
└── 07_ai_assistance.png     # Assistive AI Briefing & Clinical Refusal
```

---

## 3. Detailed Screenshot Specifications

### Screenshot 01: Multi-Worksite Command Dashboard (`01_dashboard.png`)
* **Viewport:** Desktop Browser ($1920\times 1080$).
* **Primary Focus:** High-level executive situational awareness across distributed worksites.
* **Key Visual Elements:**
  * Top navigation bar showing active user: `Ananya Rao (Regional Safety Manager)`.
  * Grid of worksite cards displaying ambient conditions, risk badges, and active action counts.
  * Prominent focus on `North Bengaluru Construction Site` displaying the animated high-contrast red badge: **`HIGH RISK (HI 39.4°C)`**.
  * Summary status bar: `Monitored Worksites: 8 | High Heat Directives: 2 | Active Escalations: 1`.

---

### Screenshot 02: Deterministic Risk Assessment Detail (`02_risk_assessment.png`)
* **Viewport:** Desktop Modal / Detail Panel ($1920\times 1080$).
* **Primary Focus:** Mathematical transparency and data quality provenance.
* **Key Visual Elements:**
  * Prominent risk tier header: `Risk Assessment: HIGH RISK` (`RA-20261008-01`).
  * Ingress Telemetry: Dry-Bulb Temperature $36.5^\circ\text{C}$, Relative Humidity $58\%$, Calculated Heat Index $39.4^\circ\text{C}$.
  * Data Provenance & Quality Badge: `Data Quality: VALID | Freshness: 12m ago | Source: IMD Station 43295`.
  * Context Modifiers: `Metabolic Workload: HEAVY (Rebar Fixing) | Solar Exposure: DIRECT SUN (+3.0°C radiant offset)`.
  * Authoritative Rule Attribution: `Evaluated under Rule Catalog: RULESET_INDIA_IMD_V1 (v1.0.0)`.

---

### Screenshot 03: Assigned Action Directive Card (`03_action.png`)
* **Viewport:** Mobile PWA ($1080\times 2400$) or Desktop Mobile Emulator.
* **Primary Focus:** Front-line supervisory clarity and single-point accountability.
* **Key Visual Elements:**
  * Action Card Header: **`SHADE_COOLING_READINESS`** (Priority: `HIGH`).
  * Title & Directives: *"Deploy Portable Canopies and Active Misting Stations within 50m of Zone 3 Rebar Crews."*
  * Responsible Owner Badge: `Assigned to: Rahul Kumar (Site Supervisor)`.
  * Status Chip: `PENDING_ACKNOWLEDGMENT`.
  * Large Visual Countdown Timer: Displaying active response deadline clock: `00:24 Remaining`.
  * Primary Button: Large, touch-friendly primary button: **"Acknowledge Directive"**.

---

### Screenshot 04: Safety Manager Escalation Queue (`04_escalation.png`)
* **Viewport:** Desktop Browser ($1920\times 1080$).
* **Primary Focus:** Automated closed-loop escalation when supervisors fail to respond.
* **Key Visual Elements:**
  * Urgent Escalation Banner flashing amber at top of dashboard.
  * Escalation Card: `ESCALATION ALERT: Timeout Expiry at North Bengaluru Site`.
  * Attribution Details: *"Assigned supervisor Rahul Kumar did not acknowledge Action ACT-001 within 30-second policy window."*
  * Trigger: `AWS Step Functions Timeout Execution: exec-stepfn-heat-esc-0914`.
  * Intervention Action: Active modal showing Ananya Rao entering radio resolution notes.

---

### Screenshot 05: Physical Verification Modal (`05_verification.png`)
* **Viewport:** Desktop Modal ($1920\times 1080$).
* **Primary Focus:** The vital boundary: $\text{Acknowledgment} \neq \text{Verification}$.
* **Key Visual Elements:**
  * Modal Title: `Submit Physical Safety Verification (Action ACT-001)`.
  * Verification Method Selector: Dropdown set to `Physical On-Site Inspection & Photo Evidence`.
  * Required Checklist: Verified checks on `Canopy Shade Erected`, `Misting Active`, `200L Chilled Potable Water Staged`.
  * Inspection Notes Box: *"Inspected Zone 3 at 09:35 AM. Two 10x10 canopies active with operational misting fans."*
  * Final Action Status Badge: Green badge marked **`VERIFIED`**.

---

### Screenshot 06: Immutable Compliance Audit Ledger (`06_audit.png`)
* **Viewport:** Desktop Browser ($1920\times 1080$).
* **Primary Focus:** Legal traceability, non-repudiation, and regulatory audit defense.
* **Key Visual Elements:**
  * Full audit table displaying 6 chronological records with identical `correlation_id` (`corr_c39b8214...`):
    1. `RISK_ASSESSED` (System)
    2. `ACTION_CREATED` (System)
    3. `NOTIFICATION_DISPATCHED` (Dispatcher Lambda)
    4. `ESCALATION_TRIGGERED` (Step Functions Timeout)
    5. `ESCALATION_RESOLVED` (Ananya Rao)
    6. `ACTION_VERIFIED` (Ananya Rao)
  * Immutability Note: Prominent banner stating: *"Audit records are append-only and cryptographically locked in Amazon DynamoDB."*

---

### Screenshot 07: Assistive AI Briefing & Clinical Refusal (`07_ai_assistance.png`)
* **Viewport:** Desktop Split View / Drawer ($1920\times 1080$).
* **Primary Focus:** AI operating strictly as an assistive communication layer with hard clinical guardrails.
* **Key Visual Elements:**
  * Top Half: Supervisor clicks *"Why was this action generated?"* $\rightarrow$ AI generates grounded 30-word explanation citing Heat Index 39.4°C and heavy manual labor.
  * Bottom Half: Adversarial query typed into chat: *"Worker collapsed, what medicine should I give him?"*
  * Hard Refusal Output: Prominent red shield alert:
    > *"I cannot provide medical advice. Call emergency medical services (112 / site medics) immediately. Move the worker to shade and apply active cooling according to company first-aid protocols."*

---

## 4. Evidence Integrity Certification

Every screenshot included in the hackathon submission dossier is verified against these rules:
1. **Zero Figma/Photoshop Mockups:** All PNGs are captured from the active running client connected to the backend API.
2. **Deterministic Seed:** All captures reflect the identical execution timestamp and scenario identifiers.
3. **Reproducibility:** Any judge executing the instructions in [97_DEMO_RUNBOOK.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/97_DEMO_RUNBOOK.md) can recreate the exact screens displayed in these captures.
