# Real-Time UI Architecture

**Document ID:** `57_REAL_TIME_UI`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

The purpose of this document is to specify how the frontend handles dynamically changing operational information, pushes authoritative updates to the screen, and manages transient or degraded connectivity.

In a life-safety and heat-risk mitigation system, operational state (environmental risk assessments, required mitigation actions, acknowledgment deadlines, escalations) fluctuates continuously throughout the workday. The frontend must communicate changes promptly while maintaining absolute honesty regarding data freshness, connectivity health, and the authoritative boundaries between server computation and client rendering.

---

## 2. Core Real-Time Principle

> **"Real-time UI means timely synchronization with authoritative application state; it does not mean that every displayed value is continuously observed or guaranteed to be current."**

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          REAL-TIME PRINCIPLE                           │
├──────────────────────────────────┬─────────────────────────────────────┤
│ WHAT REAL-TIME UI MEANS          │ WHAT REAL-TIME UI DOES NOT MEAN     │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Prompt delivery of backend-    │ • Sensor readings updating every    │
│   calculated safety assessments  │   second without physical sensors   │
│ • Immediate UI reflection of     │ • Client-side simulation of weather │
│   supervisor acknowledgments     │   or temperature trajectories       │
│ • Audible/visual escalation      │ • Guarantees that environmental     │
│   dispatch upon trigger          │   conditions have not changed       │
│ • Clear, visible indication of   │ • Masking connectivity breaks with  │
│   connection health & sync age   │   false "Live" or green indicators  │
└──────────────────────────────────┴─────────────────────────────────────┘
```

The UI must never deceive the user into believing an environmental reading is instantaneous or infallible when it is derived from a hourly weather forecast run or an aging observational feed.

---

## 3. Real-Time Architecture

The system decouples backend event production from UI rendering through an explicit event channel and state invalidation pipeline.

```text
┌─────────────────────────┐
│      BACKEND EVENT      │ Risk Engine, Action Engine, Escalation Engine
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   EVENT / PUSH CHANNEL  │ WebSocket / Server-Sent Events / Managed Stream
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ FRONTEND EVENT HANDLER  │ Validation, Deduplication, Scoping Check
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│    STATE INVALIDATION   │ Query Invalidation, Cache Revalidation, Refetch
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│       UI REFRESH        │ Calm Visual Transition, Badge Update, Drawer Sync
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│          USER           │ Supervisor / Safety Manager Action
└─────────────────────────┘
```

### Transport Technology Strategy (Conceptual & Pluggable)
The exact transport technology will be finalized during platform infrastructure rollout:
* **Server-Sent Events (SSE):** Recommended default for unidirectional server-to-client operational broadcasts (risk updates, escalations, system banners).
* **WebSocket:** Candidate for bidirectional environments where real-time chat/AI or rapid multi-user collaborative action tracking is deployed.
* **Long Polling / Configurable Polling:** Standard fallback when corporate firewalls, cellular gateways, or proxies block persistent streaming connections.

The frontend client abstraction must isolate components from the underlying transport protocol.

---

## 4. Real-Time Events Taxonomy

The engine publishes discrete domain events. Each payload carries envelope metadata for tracking, versioning, and tenancy:

```json
{
  "event_id": "evt_01HXYZ7890ABCDEF",
  "event_type": "ACTION_ASSIGNED",
  "timestamp": "2026-10-07T14:20:00Z",
  "org_id": "org_infra_corp",
  "worksite_id": "site_blr_north_01",
  "resource_id": "act_88219",
  "resource_version": 3,
  "payload": {
    "action_type": "MANDATORY_HYDRATION_BREAK",
    "priority": "HIGH",
    "assigned_to": "usr_sup_rahul"
  }
}
```

### Standard Event Catalog
1. `RISK_UPDATED`: Authoritative heat risk assessment recalculated by backend engine.
2. `ACTION_CREATED`: Action engine generated a new required workplace action.
3. `ACTION_ASSIGNED`: Action assigned or reassigned to a designated supervisor.
4. `ACTION_ACKNOWLEDGED`: Supervisor confirmed receipt and ownership of action.
5. `ACTION_UPDATED`: Action execution progress, delay notes, or status changes recorded.
6. `VERIFICATION_REQUIRED`: Action execution marked complete; requires manager/supervisor sign-off.
7. `ACTION_VERIFIED`: Action independently verified and closed.
8. `ESCALATION_TRIGGERED`: Acknowledgment or verification SLA breached; escalation fired.
9. `ESCALATION_UPDATED`: Escalation assigned to backup authority or resolved.
10. `NOTIFICATION_CREATED`: Direct notification generated for current user.
11. `DATA_QUALITY_CHANGED`: Weather data source shifted quality state (e.g., `VALID` to `STALE`).
12. `WORKSITE_UPDATED`: Worksite active shift, worker count, or operational boundaries modified.

---

## 5. UI Event Priority Hierarchy

When multiple events arrive simultaneously or over high-latency connections, the UI handles visual rendering according to operational urgency:

```text
┌──────┬──────────────────────────────┬──────────────────────────────────────────────────┐
│ RANK │ EVENT CATEGORY               │ UI PRESENTATION BEHAVIOR                         │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P1   │ ESCALATION_TRIGGERED         │ Persistent warning badge, top-level amber/red    │
│      │                              │ banner, optional audio chime (supervisor device) │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P2   │ ACTION_ASSIGNED / CREATED    │ Immediate Action Card injection, unread counter  │
│      │ (HIGH / CRITICAL Risk)       │ increment, dominant primary CTA emphasis         │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P3   │ RISK_UPDATED (Escalation)    │ Worksite header risk badge transition, banner    │
│      │ (e.g. MODERATE -> HIGH)      │ alert, update reason link                        │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P4   │ ACTION_ACKNOWLEDGED /        │ State transition in Action Card, optimistic lock │
│      │ VERIFIED                     │ release, toast notification confirmation         │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P5   │ DATA_QUALITY_CHANGED         │ Freshness badge shift (VALID -> STALE), calm     │
│      │                              │ subtle amber pill, banner if critical            │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P6   │ RISK_UPDATED (De-escalation) │ Calm transition to lower severity, toast notice  │
│      │ (e.g. HIGH -> MODERATE)      │                                                  │
├──────┼──────────────────────────────┼──────────────────────────────────────────────────┤
│ P7   │ INFORMATIONAL / BACKGROUND   │ Silent dashboard badge count sync, subtle table  │
│      │ (Shift end, worker checkout) │ row refresh without re-rendering active forms    │
└──────┴──────────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 6. Connection States & Visual Communication

The application must visibly, unambiguously expose its connection health. The UI must **never** claim to be "Live" if the transport channel is closed, reconnecting, or degraded.

```text
┌─────────────────┐       Connection Lost       ┌──────────────────┐
│    CONNECTED    │ ──────────────────────────> │    CONNECTING    │
│    (Live)       │                             │  (Re-acquiring)  │
└─────────────────┘                             └────────┬─────────┘
        ▲                                                │
        │ Success                                        │ Retry Attempt
        │                                                ▼
┌───────┴─────────┐       Max Retries Fail      ┌──────────────────┐
│  RECONNECTING   │ <────────────────────────── │   DISCONNECTED   │
│   & RESYNCING   │                             │  (Offline Mode)  │
└─────────────────┘                             └────────┬─────────┘
                                                         │
                                                         ▼
                                                ┌──────────────────┐
                                                │   ERROR / HALT   │
                                                │ (Manual Retry)   │
                                                └──────────────────┘
```

### Visual Indicator Matrix

```text
[ CONNECTED ]
● Live  •  Synced 14:24:10
Visual: Green dot (#16A34A), calm text, no layout shift.

[ CONNECTING / RECONNECTING ]
◐ Reconnecting...  •  Last synced 14:22:05
Visual: Amber dot (#D97706), subtle pulse, no intrusive modal.

[ DISCONNECTED / OFFLINE ]
○ Offline  •  Last synchronized 14:15:00  •  [ Reconnect Now ]
Visual: Neutral slate dot (#64748B), persistent top utility strip banner:
"Working in offline view. New risk assessments and actions will not be received until reconnected."

[ STALE / SYNC TIMEOUT ]
⚠ Data Stale  •  Last confirmed 45m ago  •  [ Force Refresh ]
Visual: Warning amber pill (#D97706), risk card marked with STALE banner.
```

---

## 7. Freshness & Timestamp Disambiguation

To prevent "false certainty," the UI distinguishes between three completely different timestamps across all views:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        TIMESTAMP ARCHITECTURE                          │
├──────────────────────────┬───────────────────────┬─────────────────────┤
│ TIMESTAMP TYPE           │ UI DISPLAY FORMAT     │ OPERATIONAL MEANING │
├──────────────────────────┼───────────────────────┼─────────────────────┤
│ 1. UI Synchronization    │ "Synced 14:24"        │ The exact moment    │
│    Timestamp             │                       │ the browser/client  │
│                          │                       │ confirmed data with │
│                          │                       │ the server.         │
├──────────────────────────┼───────────────────────┼─────────────────────┤
│ 2. Weather Observation   │ "Observed 14:00       │ The actual physical │
│    Timestamp             │ (Station AWS-04)"     │ capture time of the │
│                          │                       │ environmental feed. │
├──────────────────────────┼───────────────────────┼─────────────────────┤
│ 3. Weather Forecast Run  │ "Forecast run 12:00   │ Model generation    │
│    Timestamp             │ for target 14:00"     │ run time (IMD /     │
│                          │                       │ Open-Meteo).        │
└──────────────────────────┴───────────────────────┴─────────────────────┘
```

### Component Formatting Example
```text
┌────────────────────────────────────────────────────────────────┐
│ Current Assessment: HIGH                                       │
│ Heat Index: 43.8°C  (Dry Bulb: 38.2°C, RH: 56%)               │
│                                                                │
│ [i] Physical observation: 14:00 IST (IMD Station Bengaluru)   │
│ [i] Risk assessment engine run: 14:05 IST                       │
│ [i] Client connection synced: 14:24 IST (● Live)              │
└────────────────────────────────────────────────────────────────┘
```

---

## 8. Specific State Update Behaviors

### 8.1 Risk Update Behavior
When an authoritative `RISK_UPDATED` event arrives:

```text
BACKEND RISK ENGINE EVALUATION
               │
               ▼
   EVENT: RISK_UPDATED (Payload: New Level, Factors, Timestamp)
               │
               ▼
   FRONTEND EVENT RECEIVER
               │
               ├─► Check Active Worksite Scope
               │
               ├─► Update Global/Worksite Risk State
               │
               ├─► Trigger Invalidation of Action List Query
               │
               ├─► Smooth Color/Label Transition in Risk Card
               │
               └─► Display Non-Intrusive Notification Toast:
                   "Risk level updated to HIGH based on 14:20 observation"
```
*Note: The frontend NEVER recalculates risk levels based on temperature updates alone. It waits for the authoritative backend risk calculation.*

### 8.2 Action Update Behavior
When an action changes status (e.g., from `PENDING_ACKNOWLEDGMENT` to `ACKNOWLEDGED`):

```text
SUPERVISOR CLICKS [ACKNOWLEDGE]
               │
               ▼
   API CALL: POST /api/v1/actions/{id}/acknowledge
               │
               ▼
   BACKEND VALIDATES & COMMITS (Authoritative)
               │
               ▼
   EVENT BROADCAST: ACTION_ACKNOWLEDGED
               │
               ▼
   FRONTEND EVENT HANDLER
               │
               ├─► Invalidate Action Query Cache
               │
               ├─► Refresh Action Detail Drawer & Card
               │
               ├─► Decrement Pending Acknowledgment Counter
               │
               └─► Transition Action Card:
                   Status Badge: "Acknowledged by Rahul Kumar (14:22)"
                   Next Step CTA: "[ Update Execution Progress ]"
```

### 8.3 Escalation Behavior
When an `ESCALATION_TRIGGERED` event arrives:

```text
SLA TIMER BREACHED IN BACKEND ESCALATION ENGINE
               │
               ▼
   EVENT: ESCALATION_TRIGGERED (Priority: CRITICAL, SLA: +15m)
               │
               ▼
   FRONTEND EVENT ROUTER (Safety Manager & Backup Supervisor)
               │
               ├─► Insert Escalation Banner at top of Active Dashboard
               │
               ├─► Play Short Non-Looping Audible Audio Chime (if enabled)
               │
               ├─► Increment Urgent Counter on Navigation Icon: [ 🔔 3 ]
               │
               └─► Action Card highlights with Warning Border (#DC2626)
                   Badge: "ESCALATED (No response in 15 mins)"
```

---

## 9. Fallback, Resynchronization & Reconnection

### 9.1 Polling Fallback Architecture
If WebSockets or SSE cannot connect within 10 seconds (due to network edge firewall or cellular instability), the client switches to polite polling:

```text
CONNECTING (WebSockets) ──[ Timeout 10s ]──> FALLBACK TO POLLING
                                                    │
                                                    ▼
                                     Configurable Poll Schedule:
                                     • Critical Actions: Every 15s
                                     • Worksite Risk State: Every 60s
                                     • Weather Context: Every 300s
```

### 9.2 Reconnection & State Catch-up
When a disconnected client regains connectivity:

```text
RECONNECTED EVENT
        │
        ▼
CHECK LAST SYNC TIMESTAMP
        │
        ▼
CALL RECONCILIATION API:
GET /api/v1/sync?worksite_id=xxx&since={last_sync_timestamp}
        │
        ├─► Missed Events Returned: Apply in strict backend version order
        │
        └─► Discrepancy or Stale Horizon (>30 mins):
            Invalidate ALL client cache and perform full page query refetch
        │
        ▼
RESTORE STATUS TO "● Live"
```

The frontend **never assumes** that zero events occurred while disconnected.

---

## 10. Duplicate & Out-of-Order Event Handling

Distributed network hops frequently deliver duplicated or transposed packets.

### Deduplication Logic
Each incoming event is checked against a bounded LRU ring buffer of recent event IDs (retaining the last 200 events or 15 minutes of history):
```typescript
if (processedEventCache.has(event.event_id)) {
  // Drop duplicate event silently without triggering query refetches
  return;
}
processedEventCache.add(event.event_id);
```

### Monotonic Version Check
Where an event mutates a resource (such as an Action or Risk assessment), the frontend checks the incoming `resource_version`:
```typescript
if (event.resource_version < currentResource.version) {
  // Discard older packet arriving out of sequence
  return;
} else if (event.resource_version > currentResource.version + 1) {
  // Gap detected! We missed intermediate events: force full resource refetch
  queryClient.invalidateQueries(['actions', event.resource_id]);
}
```

---

## 11. Weather Refresh vs. UI Real-Time

A critical conceptual distinction must be maintained in the UI:

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ REAL-TIME UI                      │ REAL-TIME WEATHER                 │
├───────────────────────────────────┼───────────────────────────────────┤
│ The user interface reflects       │ Ambient atmospheric parameters    │
│ backend database mutations within │ (dry-bulb temperature, humidity,  │
│ hundreds of milliseconds.         │ solar radiation) update when      │
│                                   │ provider forecast runs publish    │
│                                   │ (e.g. hourly or 3-hourly).        │
└───────────────────────────────────┴───────────────────────────────────┘
```

The UI must explicitly display:
* `"Live sync active"` — refers to system connectivity.
* `"Weather update: 14:00 (Next scheduled update: 15:00)"` — refers to the environmental observation cycle.

The UI must **never** animate mock continuous temperature fluctuations (e.g., ticking seconds on a thermometer) to simulate sensor activity that does not physically exist.

---

## 12. Real-Time AI Interaction

When users interact with the built-in AI Assistant (e.g., asking *"Why is this worksite rated HIGH risk?"*), background real-time updates may invalidate the underlying context while the AI is responding.

```text
USER REQUEST: "Why is site HIGH?"
       │
       ▼
AI GENERATION IN PROGRESS (Based on Risk Run v12, HIGH)
       │
       ├────────────────────────────────────────┐
       │ (Simultaneous Real-Time Event Arrives) │
       │ NEW EVENT: Risk downgraded to MODERATE│
       │ (Risk Run v13, Wind shifted, 14:30)    │
       │                                        │
       ▼                                        ▼
AI RESPONSE READY               FRONTEND DETECTS VERSION MISMATCH
                                                │
                                                ▼
UI RENDERS NOTICE OVER AI RESPONSE:
"⚠ Risk context changed while generating this answer.
Worksite has transitioned to MODERATE as of 14:30.
[ Regenerate Explanation for MODERATE ]"
```

The system prevents presenting obsolete AI rationales as current guidance.

---

## 13. Real-Time Security & Scoping

Push subscriptions must enforce strict security boundaries:
* **Tenant Isolation:** Events carry `org_id` headers; the push gateway terminates subscriptions attempting cross-tenant listening.
* **Worksite Scoping:** Supervisors only receive real-time action and risk events for their explicitly assigned worksites (`worksite_id` whitelist).
* **RBAC Filtering:** Confidential escalation notes or personnel reassignments are only dispatched to authorized manager channels.

The frontend client discards any event that does not match the active authenticated user's authorization claims.

---

## 14. Simulation Mode Isolation

When simulation mode is active on a worksite (e.g., for safety drills or scenario training):
* All simulated events carry explicit envelope metadata: `"is_simulation": true, "simulation_id": "sim_2026_q4_drill"`.
* The real-time connection status switches to:
  ```text
  [ SIMULATION STREAM ACTIVE ]
  ◆ Simulated Live Feed  •  Scenario: Extreme Heat Wave (+4°C)
  ```
* Production operational dashboards strictly filter out simulation events. Under no circumstances may simulated risk levels alter production escalation queues.

---

## 15. Testing & Validation Suite

The real-time UI layer must be validated against the following 12 failure and boundary test scenarios:

```text
┌────┬─────────────────────────────┬────────────────────────────────────────────────────────┐
│ #  │ TEST SCENARIO               │ ACCEPTANCE CRITERIA                                    │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1  │ Connection Loss             │ Within 5s, status switches from Live to Reconnecting;  │
│    │                             │ no full-screen crashes; offline banner appears.        │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2  │ Seamless Reconnection       │ On socket re-open, reconciliation API triggers; missed │
│    │                             │ actions populate without page reload.                  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3  │ Duplicate Event Ingestion   │ Sending identical event_id twice results in single     │
│    │                             │ state change and zero duplicated toast notifications.  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4  │ Out-of-Order Packet Delivery│ Action status ACKNOWLEDGED arriving before ASSIGNED    │
│    │                             │ triggers cache refetch; does not crash state machine.  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5  │ Stale UI Detection          │ Inactive tab after 20 minutes marks data as STALE and  │
│    │                             │ prompts revalidation upon tab refocus.                 │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 6  │ Missed Intermediate Events  │ Simulating version jump from v1 to v4 triggers full    │
│    │                             │ resource query invalidation.                           │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 7  │ Rapid Event Sequence        │ 50 simultaneous events throttled cleanly without UI    │
│    │                             │ thread locking or dropped frame rates.                 │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 8  │ Authorization Revocation    │ Session token expiry mid-stream cleanly drops socket   │
│    │                             │ and displays secure authentication modal.              │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 9  │ Fast Worksite Switching     │ Switching sites unbinds previous room/channel and      │
│    │                             │ binds new channel without leaking stale site updates.  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 10 │ Simulation Mode Isolation   │ Simulation stream does not alter production dashboard   │
│    │                             │ metrics or trigger live SMS/notifications.             │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 11 │ Partial API Degradation     │ Real-time socket up while REST backend down shows      │
│    │                             │ degraded capability warning without false Live badge.  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ 12 │ Audio / Notification Flood  │ Maximum 1 audible chime per 30-second window to prevent│
│    │ Suppression                 │ cognitive distress during mass escalation events.      │
└────┴─────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 16. Cross-Document Architecture Integration

The frontend documentation suite forms a complete, cohesive architectural framework:

```text
50 FRONTEND ARCHITECTURE (Foundational Structure & Tech Stack)
      │
      ├───────────────────────┬───────────────────────┐
      ▼                       ▼                       ▼
51 SUPERVISOR DASHBOARD  52 SAFETY MANAGER DASH.  53 WORKSITE VIEW
(Field Execution View)   (Multi-site Oversight)   (Drill-down Context)
      │                       │                       │
      └───────────────────────┼───────────────────────┘
                              ▼
                        54 MOBILE UI
                 (Field Supervisor Mobile UX)
                              │
                              ▼
                      55 DESIGN SYSTEM
             (Visual & Interaction Source of Truth)
                              │
                              ▼
                    56 STATE MANAGEMENT
             (Data Stores, Query Layer & Logic)
                              │
                              ▼
                     57 REAL-TIME UI
             (Dynamic Events, Sync & Freshness)
```

### Complete Workflow Alignment

```text
              ┌─────────────────────────┐
              │     BRIGHT LIGHT UI     │
              │                         │
              │  Clear                  │
              │  Calm                   │
              │  Accessible             │
              │  Responsive             │
              │  Action-oriented        │
              └───────────┬─────────────┘
                          │
                          ▼
             AUTHORITATIVE BACKEND STATE
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
      RISK              ACTION          ESCALATION
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                    HUMAN RESPONSE
                          │
                          ▼
                    ACK / VERIFY
                          │
                          ▼
                        AUDIT
```

---

## 17. Non-Negotiable UX Rules

All frontend implementations across mobile, tablet, and desktop must strictly adhere to these 18 rules:

1. **Light theme is the default visual direction.**
2. **The UI must be bright, clean, modern, and professional.**
3. **Safety information must be highly scannable.**
4. **Critical actions must be visually obvious.**
5. **Color must never be the only indicator of risk/status.**
6. **Risk severity and data quality are separate dimensions.**
7. **Forecast and observation must never be visually conflated.**
8. **Unknown must never look like low risk.**
9. **Stale data must remain visibly stale.**
10. **Simulation mode must always be obvious.**
11. **The frontend must not independently calculate safety decisions.**
12. **Safety-critical updates should wait for backend confirmation rather than using misleading optimistic state.**
13. **Real-time connection status must be visible when relevant.**
14. **Mobile supervisors must be able to reach their primary action quickly.**
15. **AI must never block the core safety workflow.**
16. **Accessibility is part of safety UX.**
17. **The design should create calm urgency, not panic.**
18. **Every important operational state must remain traceable to authoritative backend data.**
