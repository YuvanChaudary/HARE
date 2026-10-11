# 51 Supervisor Dashboard Specification

**Document Status:** Draft  
**Last Updated:** 2026-10-07  

---

## 1. Document Purpose and Core Principle

This document specifies the information architecture, visual layout, interactive workflows, and component states for the **Supervisor Dashboard** within the **Heat Action Response Engine**.

The Supervisor Dashboard is the primary operational console for on-site field leadership (e.g., Site Supervisor **Rahul Kumar**). Its primary objective is to eliminate ambiguity in fast-paced industrial environments:

> **The Supervisor Dashboard should make the next required safety action obvious within seconds.**

```text
┌────────────────────────────────────────────────────────────────────────┐
│ SUPERVISOR OPERATIONAL MISSION:                                        │
│ 1. Glances at mobile or tablet screen on the job site.                 │
│ 2. Sees current worksite risk level immediately.                       │
│ 3. Identifies the exact physical mitigation assigned to their crew.    │
│ 4. Acknowledges responsibility with a single tap.                      │
│ 5. Executes and verifies the mitigation before the deadline expires.  │
└────────────────────────────────────────────────────────────────────────┘
```

The interface is engineered with a **bright, calm, high-contrast, professional aesthetic** that maintains legibility under direct outdoor sunlight and dusty construction conditions.

---

## 2. Information Hierarchy

The Supervisor Dashboard organizes operational data across six sequential priority tiers:

```text
1. CURRENT WORKSITE & SHIFT  ──► Where am I, and who is on shift right now?
              │
              ▼
2. CURRENT RISK LEVEL        ──► What is the assessed hazard level (LOW, MOD, HIGH, CRIT)?
              │
              ▼
3. HIGHEST-PRIORITY ACTION   ──► What specific physical task must be executed immediately?
              │
              ▼
4. PENDING ACKNOWLEDGMENT    ──► What actions are awaiting my sign-off, and what is the timer?
              │
              ▼
5. VERIFICATION PENDING      ──► What physical mitigations require checklist confirmation?
              │
              ▼
6. ESCALATION STATUS         ──► Has any overdue action escalated to the Safety Manager?
```

---

## 3. Desktop Dashboard Layout Architecture

The desktop view utilizes a spacious, light-themed card layout structured for scanning:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [Logo] Heat Action Response Engine     North Bengaluru Site • Shift Day│
├────────────────────────────────────────────────────────────────────────┤
│ Good morning, Rahul Kumar                                              │
│ Sector 4 Rebar Fabrication Pad • 14 Workers Active                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────┐ │
│ │ CURRENT RISK         │ │ MY ACTIONS           │ │ ACTIVE           │ │
│ │ ⚠️ HIGH              │ │ 3 Total Assigned     │ │ ESCALATIONS      │ │
│ │ Heat Index: 44.1°C   │ │ 1 PENDING ACK (18m)  │ │ 0 Active         │ │
│ │ Validated 10:30 AM   │ │ 2 In Progress        │ │                  │ │
│ └──────────────────────┘ └──────────────────────┘ └──────────────────┘ │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ ⚡ URGENT ACTION REQUIRING ATTENTION                                │ │
│ │ HIGH PRIORITY • ACT-1082: Stage 25L Electrolyte Cooler             │ │
│ │ Sector 4 Rebar Pad • Response Deadline: 18 minutes remaining       │ │
│ │ Reason: Heat Index 44.1°C with heavy physical rebar tying.         │ │
│ │                                                                    │ │
│ │ [ ACKNOWLEDGE ACTION ]        [ View Details & Checklist ]         │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ ┌──────────────────────────────────┐ ┌───────────────────────────────┐ │
│ │ ENVIRONMENTAL CONTEXT            │ │ RECENT SHIFT ACTIVITY         │ │
│ │ Temp: 37.5°C • Humidity: 54%     │ │ 10:30 - Risk elevated to HIGH │ │
│ │ Direct Sunlight • Shade: Limited │ │ 10:31 - ACT-1082 Assigned     │ │
│ │ Telemetry Health: VALID          │ │ 10:15 - Morning briefing logged││
│ └──────────────────────────────────┘ └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Above-the-Fold Operational Invariants

When a supervisor opens the dashboard on any device, the following elements are **immediately visible without scrolling**:

1. **Active Worksite & Shift Name:** Eliminates confusion regarding location or crew assignment.
2. **Current Evaluated Risk Badge:** Prominent, high-contrast semantic indicator (`[ ⚠️ HIGH RISK ]`).
3. **Telemetry Freshness Indicator:** Proves that environmental data is active and valid.
4. **Primary Urgent Action Card:** The single most pressing operational mitigation requiring attention.
5. **Countdown Timer:** Live minutes remaining before automated escalation occurs.
6. **Primary Acknowledgment CTA:** A high-contrast, prominent action button.

---

## 5. Component Deep Dive: The Risk Card

The Risk Card communicates environmental severity without overwhelming the user with raw meteorological tables:

```text
┌─────────────────────────────────────────────────────────┐
│ CURRENT WORKSITE RISK                                   │
│                                                         │
│ [ ⚠️ HIGH RISK ]                                        │
│                                                         │
│ Assessed Heat Index : 44.1 °C                           │
│ Primary Driver      : Heavy Workload + Direct Sun       │
│ Evaluation Time     : 10:30 AM IST (Valid via Open-Meteo)│
│                                                         │
│ [ Why is this High? — Ask AI Assistant ]                │
└─────────────────────────────────────────────────────────┘
```

* **Color & Contrast:** Off-white card surface (`#FFFFFF`), subtle border (`#E2E8F0`), bold amber-red typography (`#B91C1C`) for HIGH risk.
* **Non-Color Support:** Always accompanied by the warning triangle icon and the text label `"HIGH RISK"`.
* **Zero Speculation:** Does not display unverified claims; indicates data source and evaluation timestamp clearly.

---

## 6. Component Deep Dive: The Action Card

The Action Card is the functional nucleus of the Supervisor Dashboard:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [ HIGH PRIORITY ]                             Deadline: 18m remaining  │
│ ACT-1082: Stage 25L Electrolyte Cooler at Sector 4                     │
├────────────────────────────────────────────────────────────────────────┤
│ Target Location : Sector 4 Rebar Fabrication Pad (East Wing)           │
│ Target Workgroup: Concrete Rebar Crew (14 Workers)                     │
│ Operational Why : High ambient heat (37.5°C) combined with heavy manual│
│                   steel tying creates severe clinical dehydration risk.│
│ Action Required : Physically place 25L chilled water dispenser and     │
│                   electrolyte packets within 100m of work zone.        │
├────────────────────────────────────────────────────────────────────────┤
│ Status: PENDING_ACKNOWLEDGMENT                                         │
│                                                                        │
│ [ ✓ ACKNOWLEDGE RESPONSIBILITY ]          [ View Full Checklist ]     │
└────────────────────────────────────────────────────────────────────────┘
```

* **Interactive States:** Changes dynamically as the action transitions from `PENDING_ACKNOWLEDGMENT` to `IN_PROGRESS` to `VERIFICATION_PENDING`.
* **Dynamic CTA:** 
  * If `PENDING_ACKNOWLEDGMENT` $\rightarrow$ **[ ACKNOWLEDGE RESPONSIBILITY ]**
  * If `IN_PROGRESS` $\rightarrow$ **[ COMPLETE & VERIFY IMPLEMENTATION ]**
  * If `ESCALATED` $\rightarrow$ **[ VIEW ESCALATION NOTICE ]**

---

## 7. Interactive Workflow: Acknowledgment UX

The acknowledgment flow is optimized for one-tap supervisory sign-off:

```text
1. Supervisor clicks [ ACKNOWLEDGE RESPONSIBILITY ]
        │
        ▼
2. Immediate Optimistic UI Feedback:
   - Button disables, displays checkmark spinner: "Acknowledging..."
   - Audio feedback chime (mobile field setting)
        │
        ▼
3. Server Commits State Transition:
   - Action status updates to: ACKNOWLEDGED
   - Countdown timer stops
   - Action Card updates: "Acknowledged at 10:32 AM. In Progress."
   - Next CTA renders: [ SUBMIT VERIFICATION CHECKLIST ]
```

Acknowledgment does **not** mark the action verified. It simply attests that the supervisor has received the order and accepted operational custody.

---

## 8. Interactive Workflow: Verification UX

Once physical mitigations are deployed on site, the supervisor completes verification:

```text
1. Supervisor clicks [ SUBMIT VERIFICATION CHECKLIST ]
        │
        ▼
2. Modal Opens with Mandatory Digital Checklist:
   [x] 25L Chilled drinking water staged within 100m of work pad.
   [x] Electrolyte replenishment packets verified in site first-aid kit.
   [x] Mobile shade awning erected adjacent to rebar rack.
        │
        ▼
3. Supervisor clicks [ CONFIRM PHYSICAL VERIFICATION ]
        │
        ▼
4. Action transitions to VERIFIED:
   - Card displays green checkmark: "✓ Verified at 10:48 AM by Rahul Kumar"
   - Log committed to immutable audit trail
```

---

## 9. Interactive Workflow: Escalation Warning UX

If an action remains unacknowledged and the response timer reaches zero:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🔶 ACTION ESCALATED TO SAFETY MANAGEMENT                                │
│ ACT-1082 was not acknowledged within the 30-minute operational window. │
│ Escalated to: Safety Manager Ananya Rao at 11:00 AM IST.               │
│                                                                        │
│ Operational Instruction: Please contact Ananya Rao immediately and     │
│ proceed with physical water staging. You can still confirm completion. │
│ [ Contact Safety Manager ]           [ Submit Late Verification ]      │
└────────────────────────────────────────────────────────────────────────┘
```

The escalation state is visually prominent (amber-orange border) but non-panicking. It clearly directs the supervisor on how to recover compliance.

---

## 10. AI Assistant Integration in the Supervisor View

The Supervisor Dashboard incorporates a collapsible **AI Field Assistant** panel:

* **One-Tap Quick Actions:**
  * *"Why is this site High Risk?"*
  * *"Draft crew morning briefing in Kannada"*
  * *"What is my next action deadline?"*
* **Strict Operational Constraints:**
  * The assistant only references data for the supervisor's active worksite.
  * The assistant cannot acknowledge actions or alter deadlines.
  * It translates directives into regional field languages for non-English speaking crews.

---

## 11. Mobile Field Supervisor Experience

On smartphone screens, the dashboard collapses into a single-column, touch-optimized card stream:

```text
┌───────────────────────────────┐
│ ☰  North Bengaluru Site   🔔 │
├───────────────────────────────┤
│ [ ⚠️ HIGH RISK ]              │
│ Heat Index: 44.1°C • Valid    │
├───────────────────────────────┤
│ ⚡ URGENT ACTION              │
│ ACT-1082: Stage 25L Water     │
│ Sector 4 Pad • 18m left       │
│                               │
│ [ ACKNOWLEDGE ACTION (18m) ]  │
├───────────────────────────────┤
│ Active Actions (2)            │
│ • Shade Tent Setup (In Prog)  │
│ • Buddy Monitoring (Verified) │
├───────────────────────────────┤
│ [ 🎙️ AI Briefing Assistant ]  │
└───────────────────────────────┘
```

* **No Multi-Column Tables:** Replaces dense tables with large, finger-friendly action cards ($48\text{px}$ minimum tap targets).
* **High-Sunlight Legibility:** Uses pure white card surfaces (`#FFFFFF`) on off-white backgrounds (`#F8FAFC`) with dark navy text (`#0F172A`) for maximum contrast against outdoor sun glare.

---

## 12. Complete Dashboard State Matrix

The Supervisor Dashboard renders twelve discrete operational states:

1. **`NORMAL_BASELINE`:** Risk is LOW; routine monitoring active; zero urgent actions.
2. **`ELEVATED_PREPARATION`:** Risk is MODERATE; proactive shade/water checks active.
3. **`HIGH_RISK_ACTIVE`:** Risk is HIGH; mandatory rest rotations and briefings displayed.
4. **`CRITICAL_HALT`:** Risk is CRITICAL; urgent safety stop reviews rendered.
5. **`NO_ACTIVE_ACTIONS`:** All tasks cleared; displays reassuring green checkmark state.
6. **`PENDING_ACKNOWLEDGMENT`:** Countdown timer running; primary CTA pulses softly.
7. **`VERIFICATION_PENDING`:** Acknowledged; awaiting checklist verification sign-off.
8. **`ESCALATED`:** Response deadline breached; manager handoff notice rendered.
9. **`STALE_TELEMETRY`:** Weather refresh delayed; displays orange advisory pill.
10. **`MISSING_DATA`:** Telemetry offline; renders manual inspection directive.
11. **`API_NETWORK_ERROR`:** Connectivity lost; displays offline local storage indicator.
12. **`SIMULATION_MODE`:** Synthetic demo active; persistent orange demo banner locked at top.

---

## 13. Final Design Principle

> **The Supervisor Dashboard eliminates friction between detecting heat hazard and taking physical action; it gives field supervisors total clarity on what to stage, when to rest, and who to notify without cognitive overload.**
