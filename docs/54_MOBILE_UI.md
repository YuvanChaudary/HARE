# 54 Mobile UI Specification

**Document Status:** Draft  
**Last Updated:** 2026-10-07  

---

## 1. Document Purpose and Mobile Philosophy

This document specifies the mobile user experience, touch interactions, layout architecture, and field-optimized state flows for the **Heat Action Response Engine**.

The mobile interface is engineered primarily for **Site Supervisors** (e.g., Rahul Kumar) who manage workgroups on foot across construction yards, road paving sectors, logistics docks, and agricultural acreage.

### Mobile Operational Mission: Execution Over Administration
Desktop consoles excel at enterprise configuration and multi-site oversight. Mobile interfaces must excel at **immediate tactical execution**:

> **On mobile, the product should help a supervisor understand the current situation and complete the next required action with minimal navigation.**

```text
┌────────────────────────────────────────────────────────────────────────┐
│ PRIMARY MOBILE FIELD WORKFLOW:                                         │
│ OPEN APP ──► CURRENT WORKSITE ──► ASSESSED RISK ──► URGENT ACTION      │
│   │                                                                    │
│   ▼                                                                    │
│ REVIEW DETAILS ──► ONE-TAP ACKNOWLEDGE ──► FIELD EXECUTION             │
│   │                                                                    │
│   ▼                                                                    │
│ DIGITAL CHECKLIST VERIFY ──► AUTOMATED ESCALATION IF UNACKNOWLEDGED   │
└────────────────────────────────────────────────────────────────────────┘
```

The mobile experience eliminates administrative bureaucracy: a field supervisor wearing protective gloves in direct sunlight can absorb the risk state, acknowledge custody, and initiate required rest rotations in under ten seconds.

---

## 2. Priority Hierarchy (P0 vs. P1 vs. P2)

Mobile viewports demand strict functional prioritization:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ P0: IMMEDIATE LIFE-SAFETY EXECUTION (ABOVE THE FOLD / PRIMARY STREAM) │
│ • Current Worksite Evaluated Risk Level (LOW, MOD, HIGH, CRITICAL)     │
│ • Highest-Priority Assigned Action Card with Countdown Timer           │
│ • Primary One-Tap Acknowledgment Action Button                         │
│ • Action Verification Checklist Submission                             │
│ • Urgent Escalation Warning Notices                                    │
│ • Critical In-App Notification Badges                                  │
├────────────────────────────────────────────────────────────────────────┤
│ P1: SUPPORTING OPERATIONAL CONTEXT (SECONDARY TABS / EXPANDABLE)       │
│ • Active Shift Context (Crew count, scheduled work type, workload)     │
│ • Environmental Telemetry (Dry-bulb temperature, relative humidity)    │
│ • Forward Hourly Forecast Trend (Peak diurnal heat window)             │
│ • Telemetry Health & Staleness Disclaimers                             │
│ • Recent Shift Action Activity Stream                                  │
├────────────────────────────────────────────────────────────────────────┤
│ P2: DEFERRED ADMINISTRATIVE TASKS (DESKTOP-FIRST / MODAL DRAWERS)     │
│ • Enterprise-wide multi-site comparisons                               │
│ • Multi-month historical compliance trend graphs                       │
│ • Granular cryptographic audit log inspection                          │
│ • Complex worksite facility parameter configuration                    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mobile Navigation Architecture

The mobile application utilizes a streamlined bottom navigation bar paired with a minimalist top utility bar:

```text
┌───────────────────────────────┐
│ ☰  North Bengaluru Site   🔔2 │  ◄── Top Utility Bar: Worksite Picker & Alerts
├───────────────────────────────┤
│                               │
│                               │
│     SCROLLABLE OPERATIONAL    │  ◄── Single-Column Action Stream
│        CARD CONTAINER         │
│                               │
│                               │
├───────────────────────────────┤
│ [Home] [Actions] [Sites] [Me] │  ◄── Fixed Bottom Navigation (48px Touch)
└───────────────────────────────┘
```

* **Zero Nested Hamburger Menus for Critical Tasks:** P0 operations are reachable directly from the Home stream without opening sub-menus.
* **Persistent Worksite Anchor:** The active worksite is pinned at the top; tapping allows switching facilities if authorized.
* **Bottom Bar Tabs:**
  * **Home:** Operational cockpit (Risk + Urgent Action + Countdown).
  * **Actions:** Tabular checklist of all active and completed shift mitigations.
  * **Sites:** Quick status list of assigned facilities.
  * **Me:** Supervisory profile, shift status, and language preferences.

---

## 4. Mobile Dashboard Above-the-Fold Layout

When the supervisor launches the application, the top of the viewport presents an uncompromised operational card:

```text
┌───────────────────────────────┐
│ North Bengaluru Site • Day 1  │
├───────────────────────────────┤
│                               │
│  [ ⚠️ HIGH RISK ]             │
│  Heat Index: 44.1 °C          │
│  Updated 10:30 AM • VALID     │
│                               │
├───────────────────────────────┤
│ ⚡ ACTION REQUIRING ATTENTION  │
│ [ HIGH ] ACT-1082 (18m left)  │
│ Stage 25L Water in Sector 4   │
│                               │
│ [ ✓ ACKNOWLEDGE ACTION ]      │
├───────────────────────────────┤
│ • 2 Other Actions In Progress │
│ • 0 Escalations Active        │
└───────────────────────────────┘
```

The supervisor is never required to scroll past decorative imagery, weather forecasts, or charts to find their assigned life-safety task.

---

## 5. Ergonomic Touch Targets and Physical Field Usability

Field operations involve glare, vibrations, dust, and work gloves:

* **Minimum Target Dimensions:** All primary buttons provide a physical hit target of at least $48 \times 48\text{ pixels}$ (surpassing WCAG 2.1 AA requirements).
* **Defensive Separation:** Destructive or secondary controls (e.g., *"Flag Constraint"*) are separated by at least $16\text{px}$ from the primary confirmation CTA.
* **No Icon-Only Critical Controls:** Critical life-safety actions always render explicit text labels alongside icons (e.g., `[ ✓ ACKNOWLEDGE ACTION ]`, never just a checkmark icon).
* **Haptic and Audio Feedback:** Successful acknowledgment emits a crisp device haptic vibration and subtle audio chime to confirm execution in loud job-site environments.

---

## 6. Interactive Mobile Action Lifecycle UX

The mobile interface models the state machine specified in [16_ACTION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/16_ACTION_MODEL.md) with absolute clarity:

```text
STEP 1: PENDING ACKNOWLEDGMENT
┌───────────────────────────────────────┐
│ [ HIGH PRIORITY ]        Timer: 18m   │
│ ACT-1082: Stage 25L Electrolyte Water │
│ Sector 4 Rebar Pad • Heavy Workload   │
│                                       │
│ [ ✓ ACKNOWLEDGE RESPONSIBILITY ]      │
│ [ View Details & Instructions ]       │
└───────────────────────────────────────┘
                  │ Supervisor taps "Acknowledge"
                  ▼
STEP 2: IN PROGRESS (CUSTODY ACCEPTED)
┌───────────────────────────────────────┐
│ [ IN PROGRESS ]        Acked 10:32 AM │
│ ACT-1082: Stage 25L Electrolyte Water │
│ Acknowledged by Rahul Kumar           │
│                                       │
│ [ 📋 SUBMIT VERIFICATION CHECKLIST ]  │
│ [ Flag Site Constraint / Issue ]      │
└───────────────────────────────────────┘
                  │ Supervisor completes field staging & taps "Submit Checklist"
                  ▼
STEP 3: VERIFICATION MODAL
┌───────────────────────────────────────┐
│ VERIFY ACT-1082: Sector 4 Water       │
│ [x] 25L Chilled Water Dispenser staged│
│ [x] Electrolyte packets stocked       │
│ [x] Located within 100m of rebar pad  │
│                                       │
│ [ CONFIRM PHYSICAL VERIFICATION ]     │
└───────────────────────────────────────┘
                  │ Checklist submitted
                  ▼
STEP 4: COMPLETED & VERIFIED
┌───────────────────────────────────────┐
│ ✓ VERIFIED at 10:48 AM by Rahul Kumar │
│ Audit Record: aud_88a10b92 committed. │
└───────────────────────────────────────┘
```

> [!CRITICAL]
> **Safety Invariant:** Tapping "Acknowledge" records supervisory responsibility; it **never** automatically marks the action verified. Verification requires explicit physical confirmation.

---

## 7. Mobile Environmental Context Card

Environmental data is framed strictly as operational context, avoiding consumer weather clutter:

```text
┌───────────────────────────────────────┐
│ 🌤️ ENVIRONMENTAL CONTEXT              │
├───────────────────────────────────────┤
│ CURRENT READING (10:30 AM • Open-Meteo│
│ • Air Temperature  : 37.5 °C          │
│ • Relative Humidity: 54 %             │
│ • Wind Velocity    : 9.2 km/h         │
│ • Data Health      : VALID (Fresh)    │
├───────────────────────────────────────┤
│ PROJECTED PEAK (13:00 PM • Model Run) │
│ • Projected Temp   : 38.5 °C (Heat 45)│
│ • Direct Sunload   : Peak Radiation   │
└───────────────────────────────────────┘
```

The interface explicitly labels forward-looking model runs as **PROJECTED PEAK** to prevent conflation with current ground-truth physical telemetry.

---

## 8. Mobile Notification Drawer and Badging

Mobile alerts adhere to strict operational prioritization:

```text
1. Red Badge Pill (Urgent Action Assigned / Escalation Triggered)
2. Amber Badge Pill (Acknowledgment Window Half-Elapsed)
3. Gray Badge Pill (General Informational Shift Log)
```

Push and in-app notifications link directly to the specific target action card, opening the acknowledgment drawer immediately upon interaction.

---

## 9. Offline Resilience and Degraded Connectivity

Industrial sites frequently suffer from intermittent 4G/5G signals or concrete shadowing. The mobile UI manages connectivity honestly:

```text
┌───────────────────────────────────────────────────────────────────────┐
│ ⚠️ OFFLINE MODE — DISPLAYING LOCALLY CACHED STATE (10:30 AM)           │
│ Cached Risk: HIGH • Action ACT-1082 Remains Enforced                  │
│ [ Reconnecting to Network... ]                                        │
└───────────────────────────────────────────────────────────────────────┘
```

* **No Silent Masking:** The UI prominently renders an orange offline banner showing the exact timestamp of the cached state.
* **Queued Intent:** If a supervisor taps "Acknowledge" while offline, the UI indicates *"Queued locally; awaiting network sync"* with a distinct visual badge. It never pretends server confirmation occurred.
* **Failed Action Alert:** If an acknowledgment synchronization fails repeatedly, the UI alerts: *"Action update failed to sync. Call Safety Manager directly."*

---

## 10. Mobile Responsive Breakpoints

The client-side layout adapts across standardized responsive thresholds:

| Device Category | Viewport Width | Layout Adaptations |
| :--- | :--- | :--- |
| **Small Mobile** | $<380\text{px}$ | Stacked action cards; compact typography; collapsed telemetry pills. |
| **Standard Mobile**| $380\text{px} - 600\text{px}$ | Standard single-column card stream; $48\text{px}$ touch targets. |
| **Tablet Portrait**| $600\text{px} - 840\text{px}$ | 2-column layout (Left: Risk & Urgent Action; Right: Context & Stream). |
| **Tablet Landscape**| $>840\text{px}$ | Transitions to responsive desktop grid layout. |

---

## 11. Mobile Privacy and Ethical Display Safeguards

To prevent horizontal privacy leaks when phones are shared or placed on vehicle dashboards:

* **Zero Personal Health Data:** No personal core temperatures, heart rates, or medical histories are rendered on mobile screens.
* **Aggregated Rosters:** Crews are represented by workgroup designations (`Crew B - Rebar Tying`) rather than personal national identity numbers or private contact details.
* **Session Invalidation:** Mobile sessions enforce automatic screen lock timeouts to prevent unauthorized action tampering.

---

## 12. Persistent Mobile Simulation Mode Banner

Whenever Simulation Mode is engaged (see [38_SIMULATION_MODE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/38_SIMULATION_MODE.md)):

```text
┌───────────────────────────────────────┐
│ 🔶 SIMULATION MODE • SYNTHETIC DEMO   │
├───────────────────────────────────────┤
│ North Bengaluru Site • Day Shift      │
```

The persistent orange header ensures observers and field operators never mistake synthetic testing drills for real-world life-safety events.

---

## 13. Final Mobile Design Principle

> **On mobile, the interface must be an operational shield, not an administrative burden; it gives field supervisors instant visibility into heat hazards and allows them to execute life-safety mitigations in seconds.**
