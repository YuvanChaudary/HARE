# 53 Worksite View Specification

**Document Status:** Draft  
**Last Updated:** 2026-10-07  

---

## 1. Document Purpose and Core Principle

This document specifies the information architecture, operational widgets, environmental telemetry cards, and action history streams for the detailed **Worksite View** within the **Heat Action Response Engine**.

The Worksite View is the unified operational convergence point for a single physical workplace. It connects eight dimensions of operational reality into a cohesive console:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ WORKSITE DETAIL CONVERGENCE:                                           │
│ WORKSITE METADATA  +  ENVIRONMENTAL TELEMETRY  +  ASSESSED RISK        │
│          +                 +                         +                 │
│ ACTIVE SHIFT CREW  +  PREVENTIVE ACTIONS       +  NOTIFICATIONS        │
│          +                 +                         +                 │
│ ACTIVE ESCALATIONS +  IMMUTABLE CHRONOLOGICAL AUDIT HISTORY            │
└────────────────────────────────────────────────────────────────────────┘
```

The Worksite View enables field supervisors, safety inspectors, and corporate safety managers to inspect the complete operational lifecycle of heat safety for a specific facility on a single, beautifully organized screen.

---

## 2. Desktop Worksite View Layout Architecture

The Worksite View employs a modern, bright, multi-panel modular layout structured for scanning and rapid navigation:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Worksites]   North Bengaluru Construction Site (WS-BLR-NORTH-04)   [Status: Active] │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Facility Type: Commercial Building Construction • Location: Bengaluru Urban, Karnataka   │
│ Primary Supervisor: Rahul Kumar • Safety Manager: Ananya Rao • Timezone: Asia/Kolkata   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ ┌───────────────────────────────┐ ┌───────────────────────────────────────────────────┐ │
│ │ CURRENT EVALUATED RISK        │ │ ACTIVE SHIFT & WORKLOAD CONTEXT                   │ │
│ │ [ ⚠️ HIGH RISK ]              │ │ Shift Day 1 (08:00 – 17:00 IST)                   │ │
│ │ Assessed Heat Index : 44.1 °C │ │ Task: Concrete Pour & Rebar Tying (Heavy Workload)│ │
│ │ Last Evaluated      : 10:30 AM│ │ Sun Exposure: Direct Sunlight • Crew Count: 14    │ │
│ │ [ View Evaluation Derivation ]│ │ [ View Shift Roster ]                             │ │
│ └───────────────────────────────┘ └───────────────────────────────────────────────────┘ │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ENVIRONMENTAL & FORECAST CONTEXT (Source: Open-Meteo • Validated 10:30 AM)          │ │
│ │ Dry-Bulb Temp: 37.5°C • Relative Humidity: 54% • Wind: 9.2 km/h • Precipitation: 0mm│ │
│ │ Forecast Trend: Projected peak 38.5°C at 13:00 • Status: FRESH (Refreshed 12m ago)  │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ACTIVE PREVENTIVE ACTIONS (Filter: All (3) | Pending ACK (1) | In Progress (2))     │ │
│ │ Priority  Action Title              Owner        Status          Deadline   Actions │ │
│ │ [ HIGH ]  ACT-1082: Stage 25L Water Rahul Kumar  PENDING_ACK     18m left   [ACK]   │ │
│ │ [ HIGH ]  ACT-1083: Erect Shade TentRahul Kumar  IN_PROGRESS     48m left   [VERIFY]│ │
│ │ [ MOD  ]  ACT-1080: Morning BriefingRahul Kumar  VERIFIED        Done       [VIEW]  │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                         │
│ ┌───────────────────────────────────────┐ ┌───────────────────────────────────────────┐ │
│ │ ACTIVE ESCALATIONS & OVERDUE NOTICES  │ │ RECENT AUDIT TIMELINE STREAM              │ │
│ │ • Zero active escalations on this site│ │ • 10:32 AM - ACT-1080 Verified (Rahul K.) │ │
│ │ • All morning mitigations on schedule │ │ • 10:30 AM - Risk elevated to HIGH (RR-002)│ │
│ │ [ View Escalation Policy ]            │ │ • 08:00 AM - Shift Day 1 Started          │ │
│ └───────────────────────────────────────┘ └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Worksite Identity Header

The top header establishes geographical and administrative authority:

* **Worksite Title & Code:** Prominently renders the operational site name (`North Bengaluru Construction Site`) and canonical identifier (`WS-BLR-NORTH-04`).
* **Operational Status Pill:** Indicates whether the site is actively operating (`[ Active ]`), on weekend pause (`[ Paused ]`), or archived (`[ Archived ]`).
* **Designated Leadership:** Explicitly cites the authenticated primary Site Supervisor and Organizational Safety Manager.
* **Non-Surveillance Guarantee:** Displays aggregated crew headcount and task categories; strictly conceals personal worker phone numbers, Aadhaar IDs, or private health data.

---

## 4. Evaluated Risk Section

The Risk Section displays the current deterministic output evaluated by the Heat Risk Engine:

```text
┌─────────────────────────────────────────────────────────┐
│ CURRENT EVALUATED RISK                                  │
│                                                         │
│ [ ⚠️ HIGH RISK ]                                        │
│                                                         │
│ Evaluated Heat Index : 44.1 °C                          │
│ Ambient Temperature  : 37.5 °C                          │
│ Triggering Rule      : RR-HIGH-002 (v1.0.0)             │
│ Primary Risk Drivers : High Humidity + Direct Sunload   │
│ Telemetry Health     : VALID (Open-Meteo Ingestion)     │
│ Assessment Timestamp : 2026-10-07 10:30 AM IST          │
│                                                         │
│ [ 📖 Explain Risk with AI Assistant ]                   │
└─────────────────────────────────────────────────────────┘
```

The risk card features clean white surfaces, bold amber/red typography, and an immediate link to open the AI explanation drawer.

---

## 5. Environmental and Forecast Telemetry Section

The environmental panel provides granular atmospheric metrics while maintaining strict data disambiguation:

* **Current vs. Forecast Separation:** Observational readings and forward-looking model forecasts are rendered in clearly demarcated sub-panels:
  ```text
  CURRENT CONDITIONS (10:30 AM)         HOURLY FORECAST PEAK (13:00 PM)
  • Temperature : 37.5 °C               • Projected Temp : 38.5 °C
  • Rel Humidity: 54 %                  • Projected RH   : 56 %
  • Wind Speed  : 9.2 km/h              • Projected Index: 45.8 °C
  • Data Nature : OBSERVATION           • Data Nature    : MODEL FORECAST
  ```
* **Explicit Source Attribution:** Displays the data provider (`Open-Meteo API v1` or `IMD Bulletin Ref`), time of retrieval, and calculation provenance.
* **Zero Speculative Modeling:** The interface never disguises a 24-hour forecast projection as an on-site physical thermometer reading.

---

## 6. Active Shift and Workload Profile Section

Safety mitigations are meaningless without operational context. This panel displays the shift envelope governing the active workforce:

* **Shift Name & Hours:** Active shift timing (`Shift Day 1: 08:00 – 17:00 IST`).
* **Occupational Work Type:** Specific task activity (`Reinforced Concrete & Steel Formwork`).
* **Metabolic Workload Category:** Declared intensity (`HEAVY - Approx 415 W metabolic rate`).
* **Radiant Exposure Environment:** Solar classification (`FULL_SUN - Unshaded Elevated Slab`).
* **Clothing / PPE Factor:** Heavy protective gear adjustments (`Standard Coveralls + Hardhats`).

---

## 7. Site Infrastructure and Facilities Context

The facilities profile informs what preventive actions are physically viable:

| Infrastructure Category | Configured Site Capacity | Status Flag |
| :--- | :--- | :--- |
| **Potable Hydration** | Central water tank + 4 mobile 25L coolers | `[ VERIFIED_ON_SITE ]` |
| **Shaded Rest Shelters**| 2 portable pop-up canopy awnings | `[ LIMITED ]` |
| **Active Cooling** | Zero misting fans or air-conditioned break trailers | `[ NONE ]` |
| **First-Aid Capability** | Trained first-aider on site + electrolyte reserves | `[ EQUIPPED ]` |

If an infrastructure attribute is `UNKNOWN`, the UI displays an orange advisory pill prompting the supervisor to log a physical facility check.

---

## 8. Active Actions Management Table

The core interactive component of the Worksite View is the Actions Management Table:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ACTIVE WORKSITE MITIGATIONS (Filter: All | Pending ACK | In Progress | Verified)       │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ID        Priority  Action Description            Owner        Deadline    Status       │
│ ACT-1082  [ HIGH ]  Stage 25L Electrolyte Cooler  Rahul Kumar  18 mins left PENDING_ACK │
│ ACT-1083  [ HIGH ]  Erect Shaded Canopy Awning    Rahul Kumar  48 mins left IN_PROGRESS │
│ ACT-1080  [ MOD  ]  Morning Heat Toolbox Talk     Rahul Kumar  Completed   VERIFIED     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Interactive Actions:** Clicking any row opens the **Action Detail Drawer**, allowing supervisors to review instructions, confirm implementation, or submit digital checklists.
* **Inline Status Badges:** Uses high-contrast semantic badges (`[ PENDING ACK ]`, `[ IN PROGRESS ]`, `[ VERIFIED ]`, `[ ESCALATED ]`).

---

## 9. Escalations and Exception Queue

If an action at this worksite experiences an acknowledgment or execution delay, it is highlighted in the Escalation Queue:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ ACTIVE WORKSITE ESCALATION                                           │
├────────────────────────────────────────────────────────────────────────┤
│ Action ACT-1049 (Hydration Check) breached supervisory response window.│
│ Escalated to: Safety Manager Ananya Rao at 10:45 AM IST.               │
│ Reason: Supervisor Acknowledgment Window (30m) Expired.                │
│ Resolution Status: Pending Executive Review.                           │
│ [ Intervene in Escalation ]             [ View Supervisor Timeline ]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Chronological Operational Activity Stream

The Worksite View includes an append-only, human-readable activity stream reflecting recent state transitions:

```text
10:32 AM IST • ACT-1080 marked VERIFIED by Supervisor Rahul Kumar (Checklist submitted).
10:31 AM IST • Action ACT-1082 assigned to Rahul Kumar. Response deadline set to 11:01 AM.
10:30 AM IST • Worksite transitioned to HIGH RISK under Rule RR-HIGH-002 (Heat Index 44.1°C).
10:15 AM IST • Morning crew toolbox talk acknowledged by Supervisor Rahul Kumar.
08:00 AM IST • Shift Day 1 commenced with 14 active workers logged.
07:45 AM IST • Ingested morning weather forecast from Open-Meteo API (VALID).
```

Each event features a timestamp, actor identification, and a direct link to the underlying immutable compliance audit entry.

---

## 11. Contextual AI Explanation Drawer

Users can click **[ Explain Site Status ]** to slide open the integrated AI Assistant drawer:

* **Pre-Scripted Contextual Questions:**
  * *"Why is this worksite currently at High Risk?"*
  * *"What actions are still pending completion?"*
  * *"Draft an operational update for the project manager."*
* **Grounding Invariant:** The drawer passes the exact JSON context of `WS-BLR-NORTH-04`. The AI is technically barred from referencing unrelated worksites or inventing missing site equipment.

---

## 12. Data Quality and Uncertainty Visual States

The Worksite View explicitly communicates telemetry health states across seven modes:

1. **`VALID`:** Clean green indicator: *"Live Telemetry • Validated 10:30 AM via Open-Meteo"*.
2. **`AGING`:** Subtle yellow pill: *"Telemetry Aging • Last updated 48 minutes ago"*.
3. **`STALE`:** High-contrast orange banner: *"⚠️ Telemetry Stale (75m). High-Risk safety protocols remain actively enforced."*
4. **`MISSING`:** Prominent alert card: *"Telemetry Offline. Dispatch manual environmental check."*
5. **`CONFLICTING`:** Amber banner: *"Meteorological source discrepancy detected. Applying conservative safety posture."*
6. **`SIMULATION_MODE`:** Persistent top banner: *"🔶 DEMONSTRATION MODE ACTIVE: Synthetic Data"*.
7. **`API_NETWORK_ERROR`:** Non-blocking toast: *"Unable to refresh live telemetry. Displaying last valid state."*

---

## 13. Cross-Document Frontend UX Consistency Framework (Docs 50–53)

All four frontend specifications ([50_FRONTEND_ARCHITECTURE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/50_FRONTEND_ARCHITECTURE.md), [51_SUPERVISOR_DASHBOARD.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/51_SUPERVISOR_DASHBOARD.md), [52_SAFETY_MANAGER_DASHBOARD.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/52_SAFETY_MANAGER_DASHBOARD.md), and `53_WORKSITE_VIEW.md`) share a cohesive design system:

### 13.1 Bright-First Visual System
* **Surfaces:** Pure white cards (`#FFFFFF`) mounted on subtle off-white backgrounds (`#F8FAFC`).
* **Borders:** Crisp, low-contrast neutral borders (`1px solid #E2E8F0`).
* **Typography:** Dark navy primary headings (`#0F172A`) paired with muted slate metadata (`#64748B`).
* **Shadows:** Restrained, natural elevation shadows (`0 1px 3px rgba(0,0,0,0.05)`). Zero heavy drop shadows.

### 13.2 Card Design Discipline
* Group related operational concepts together into unified containers.
* Avoid fragmentation; do not break single workflows into dozens of detached floating cards.
* Maintain consistent $16\text{px}$ internal padding and $12\text{px}$ border radius.

### 13.3 Spacing and Scannability Scale
* Employs an 8-point spatial grid ($8\text{px}, 16\text{px}, 24\text{px}, 32\text{px}$).
* Generous white space ensures field supervisors wearing protective gloves can scan and interact with ease.

### 13.4 Button and CTA Semantics
* **Primary Interactive Actions:** High-contrast solid buttons (`#0F172A` or semantic brand navy).
* **Confirmative Safety Actions:** Solid emerald green for verification submission (`#059669`).
* **Urgent / Escalated Actions:** High-contrast amber-red for overdue attention (`#B91C1C`).

### 13.5 Tables and Data Lists
* Left-aligned text; right-aligned numerical metrics.
* Sticky table headers for smooth vertical scrolling across extensive worksite rosters.
* Responsive collapse into card stacks on screens $<768\text{px}$ wide.

### 13.6 Restrained Motion and Micro-Interactions
* Transitions strictly capped at $150\text{ms}$–$200\text{ms}$ ease-out curves.
* Zero gratuitous rotating animations or flashing text that distracts during an emergency.
* Full conformance with `prefers-reduced-motion` operating system preferences.

---

## 14. Final UX Architecture Principle

> **The Heat Action Response Engine should feel bright, calm, trustworthy, and operationally clear. A user should be able to understand the current risk, identify the required action, see who owns it, acknowledge or verify the action, and understand escalation status without fighting the interface.**
>
> The visual design should communicate:
>
> ```text
> CLARITY
> +
> CONFIDENCE
> +
> ACCOUNTABILITY
> +
> CALM URGENCY
> ```
> —not fear, clutter, or technical complexity.
