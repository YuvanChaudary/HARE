# 107 — Video Walkthrough Production Script

```text
Status: Documented
Scope: Hackathon Video Demonstration Recording & Voiceover Script
Total Duration: 4 Minutes 30 Seconds
Resolution / Aspect Ratio: 1920x1080 (16:9) @ 60 FPS
Audio: Clear Studio Voiceover + Subtle Ambient Instrumental Music
Dataset: SYNTHETIC DEMO DATA (North Bengaluru Construction Site)
```

---

## 1. Video Recording Principles & Technical Guidelines

Before hitting record, the production team must adhere to these recording rules:
* **Synthetic Data Only:** All displayed worksites, worker names, phone numbers, and organizations must use synthetic demo fixtures (`docs/38_SIMULATION_MODE.md`).
* **Zero Exposed Credentials:** No browser inspector tabs, terminal windows with environment variables, or private tokens may appear on screen.
* **Deliberate Cursor Movement:** Smooth, paced mouse navigation with 1-second pauses before major clicks to allow viewers to follow the operational flow.
* **Readable Typography:** Browser zoom set to 110% or 125% to guarantee crisp readability on mobile screens and embedded video players.
* **Backup Takes:** Record each major segment in isolated takes to allow clean editing. Never use deceptive cuts to fake non-existent functionality.

---

## 2. Comprehensive Segment-by-Segment Production Table

```text
================================================================================
SEGMENT 01: THE HOOK
================================================================================
• TIME:        0:00 – 0:15 (15 Seconds)
• SCREEN:      Wide view of the Heat Action Response Engine main dashboard.
• ACTION:      Slow zoom in on the primary worksite card showing an active heat warning.
• NARRATION:   "A heat warning is only useful if it leads to action. Across industrial 
               and construction worksites, weather alerts warn that it is hot. But who 
               makes sure someone actually deploys shade or stages drinking water?"
• TRANSITION:  Quick cut to Problem slide diagram.

================================================================================
SEGMENT 02: THE OPERATIONAL GAP
================================================================================
• TIME:        0:15 – 0:40 (25 Seconds)
• SCREEN:      High-impact graphic showing the "Broken Chain of Workplace Heat Safety."
• ACTION:      Highlight three pain points: Diffusion of Responsibility, Dead-End Alerts, 
               and Zero Verification.
• NARRATION:   "Today, safety warnings are sent to broad chat groups or generic dashboards. 
               When everyone owns an alert, no one owns it. If an on-duty supervisor ignores 
               an SMS, the workflow dead-ends. Workers remain exposed, senior management has 
               no visibility, and organizations have zero proof of preventative due diligence."
• TRANSITION:  Cross-dissolve to Live Product Interface.

================================================================================
SEGMENT 03: PRODUCT INTRODUCTION
================================================================================
• TIME:        0:40 – 1:00 (20 Seconds)
• SCREEN:      Heat Action Response Engine Dashboard header and worksite matrix.
• ACTION:      Mouse hovers over product title and tagline: "From heat warning to verified 
               workplace action."
• NARRATION:   "Introducing the Heat Action Response Engine. We are not another weather 
               dashboard. We are the operational execution layer that turns environmental 
               heat warnings into assigned, acknowledged, escalated, verified, and 
               audited workplace safety actions."
• TRANSITION:  Smooth cut into interactive demonstration view.

================================================================================
SEGMENT 04: THE OPERATIONAL WORKFLOW DEMO (RISK TO ESCALATION)
================================================================================
• TIME:        1:00 – 2:30 (90 Seconds)
• SCREEN:      Split screen: Desktop Command Console (left) and Supervisor Mobile PWA (right).
• ACTION:      
  1. (1:00) Click "Simulate Heat Spike": Telemetry updates to 36.5°C / 58% RH (HI 39.4°C).
            Risk badge immediately flashes: HIGH RISK.
  2. (1:20) Show Action Engine: Action ACT-001 (SHADE_COOLING_READINESS) generated with 
            directives: "Deploy portable canopies within 50m of rebar crews."
  3. (1:40) Show Assignment: Assigned directly to Rahul Kumar (Site Supervisor) with an 
            active 30-second countdown clock.
  4. (2:00) Simulated Non-Response: Cursor remains still. Countdown clock expires: 00:00.
            Card flashes amber; status transitions to ESCALATED.
  5. (2:15) Safety Manager Escalation: Switch to Ananya Rao's console. Ananya reviews alert, 
            clicks "Resolve Escalation", logs radio confirmation, and submits resolution.
• NARRATION:   "Watch our complete closed operational loop in action on our North Bengaluru site. 
               When ambient Heat Index breaches 39°C, our deterministic engine computes HIGH RISK. 
               Because this site involves heavy manual rebar fixing under direct sun, our 
               Action Engine generates site-specific directives: deploying canopies and staging chilled water. 
               The action is assigned directly to on-duty supervisor Rahul Kumar. 
               Now, watch our core differentiator. Rahul does not acknowledge the alert before the deadline. 
               Our AWS Step Functions engine automatically fires an escalation to Regional Safety Manager 
               Ananya Rao. Ananya intervenes, radios the worksite, and resolves the escalation. 
               The alert refuses to be ignored."
• TRANSITION:  Cut to Verification and Audit Ledger screen.

================================================================================
SEGMENT 05: PHYSICAL VERIFICATION & AUDIT LEDGER
================================================================================
• TIME:        2:30 – 3:00 (30 Seconds)
• SCREEN:      Action verification modal and DynamoDB Audit Ledger view.
• ACTION:      Ananya submits physical canopy inspection; badge turns green: VERIFIED. 
               Navigate to Audit Ledger tab; scroll through 6 chronological events with 
               matching correlation_id.
• NARRATION:   "Here is our crucial safety boundary: Acknowledgment is NOT verification. 
               Clicking a phone doesn't prove shade exists. Our platform requires formal 
               physical verification by safety personnel before an action is marked VERIFIED. 
               And every single transition—from heat detection to supervisor timeout and final 
               verification—is locked in an immutable DynamoDB compliance ledger."
• TRANSITION:  Cut to AI Safety Assistant drawer.

================================================================================
SEGMENT 06: ASSISTIVE AI IN ITS PROPER ROLE
================================================================================
• TIME:        3:00 – 3:30 (30 Seconds)
• SCREEN:      AI Assistant drawer on supervisor interface.
• ACTION:      Click "Generate Morning Briefing" -> concise text appears in 1.2s. 
               Type: "Worker collapsed, what medicine should I give him?" -> 
               Show immediate hard refusal and emergency redirect.
• NARRATION:   "Where does AI fit in? We use generative AI strictly as an assistive communication 
               layer. It synthesizes clear 30-second morning briefings and translates safety directives 
               into regional vernacular languages like Hindi and Kannada. 
               But our safety boundaries are absolute: AI cannot alter risk tiers, cannot bypass safety rules, 
               and cannot give medical advice. If asked for clinical prescriptions, it delivers an 
               immediate hard refusal and redirects to emergency services."
• TRANSITION:  Cut to AWS Serverless Architecture slide.

================================================================================
SEGMENT 07: AWS ARCHITECTURE & SCALABILITY
================================================================================
• TIME:        3:30 – 4:00 (30 Seconds)
• SCREEN:      Architecture diagram highlighting AWS Serverless cloud services.
• ACTION:      Animated callouts on API Gateway, Lambda, DynamoDB, EventBridge, and Step Functions.
• NARRATION:   "Under the hood, the Heat Action Response Engine is built on an enterprise AWS Serverless 
               architecture. Heatwaves are bursty: AWS Lambda and DynamoDB scale instantly from zero 
               to handle regional summer spikes with zero idle cost. 
               DynamoDB transactions guarantee that action state cannot be corrupted by race conditions, 
               while AWS Step Functions provides the resilient backbone for our automated escalation timers."
• TRANSITION:  Cut to Honest Product Boundaries slide.

================================================================================
SEGMENT 08: HONEST BOUNDARIES & LIMITATIONS
================================================================================
• TIME:        4:00 – 4:20 (20 Seconds)
• SCREEN:      Clear, professional slide outlining "System Safety & Product Boundaries."
• ACTION:      Highlight four badges: Not a Medical Device, No Worker Surveillance, 
               Deterministic Logic Supremacy, Human Accountability.
• NARRATION:   "We are completely transparent about our boundaries: We are not a medical diagnostic device. 
               We do not conduct intrusive worker surveillance or collect biometric vitals. 
               We empower human safety professionals with deterministic, accountable operational execution."
• TRANSITION:  Cut to final brand closing slide.

================================================================================
SEGMENT 09: CLOSING STATEMENT
================================================================================
• TIME:        4:20 – 4:30 (10 Seconds)
• SCREEN:      Clean title card: Product Logo, GitHub link, Tagline.
• ACTION:      Text animates in: "From heat warning to verified workplace action."
• NARRATION:   "The Heat Action Response Engine: From heat warning to verified workplace action. 
               Thank you."
• TRANSITION:  Fade to black.
================================================================================
```

---

## 3. Post-Production Audio & Master Delivery Checklist

* **Audio Mix:** Voiceover normalized to $-14\text{ LUFS}$; background audio ducked to $-24\text{ dB}$ during speech.
* **Visual Polish:** High-contrast cursors with subtle yellow highlight circles during clicks.
* **Transcoding:** MP4 format, H.264 video codec, AAC audio, $1920\times 1080$ resolution, file size $<250\text{ MB}$.
* **Review:** Verify that video timing matches the 4:30 target without truncated narration or misleading screen edits.
