# Notification Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the communication architecture of the **Heat Action Response Engine**: the **Notification Model**.

In workplace heat operations, environmental detection and deterministic calculations are useless if the resulting directives fail to reach the responsible human actors. The notification system is the operational bridge that conveys:
* Elevated environmental heat-risk alerts
* Newly assigned preventive action directives
* Time-sensitive acknowledgment reminders
* High-priority escalation notifications
* Execution verification requests
* Critical data-ingestion or provider failure alerts

### Core Architectural Principle
> **A notification is a communication mechanism, not proof that a human has seen or acted on the message.**

The system maintains a strict semantic distinction between the act of dispatching an alert, the network receipt of that message, the human visual opening of the notification, and the operational acknowledgment of the underlying safety directive.

---

## 2. Notification Lifecycle

A notification event moves through an explicit communication lifecycle:

```text
       ┌───────────┐
       │  CREATED  │
       └─────┬─────┘
             │ (Assemble Payload)
             ▼
       ┌───────────┐
       │  QUEUED   │
       └─────┬─────┘
             │ (Dispatch via Channel)
             ▼
       ┌───────────┐     (Channel Error)     ┌───────────┐
       │   SENT    │ ──────────────────────> │  FAILED   │
       └─────┬─────┘                         └─────┬─────┘
             │                                     │
             │ (Provider Delivery Receipt)         │ (Bounded Retry)
             ▼                                     ▼
       ┌───────────┐                         ┌───────────┐
       │ DELIVERED │                         │ RETRYING  │
       └─────┬─────┘                         └───────────┘
             │
             │ (User Opens App / Screen)
             ▼
       ┌───────────┐
       │READ/OPENED│
       └─────┬─────┘
             │
             │ (User Taps "Acknowledge" on Action)
             ▼
       ┌──────────────┐
       │ ACKNOWLEDGED │ (Halts Action Escalation Timer)
       └──────────────┘
```

### Essential Accountability Disctinctions:
$$\text{Alert Sent} \neq \text{Alert Delivered} \neq \text{Alert Read} \neq \text{Action Acknowledged} \neq \text{Controls Implemented}$$

* **Sent:** Network packets have departed the application server.
* **Delivered:** Target endpoint carrier has returned an HTTP 200 or delivery receipt.
* **Read / Opened:** User opened the notification card in their interface.
* **Acknowledged:** Authenticated user clicked the explicit button on the underlying **action directive**, accepting operational ownership. Only this step halts the escalation countdown timer.

---

## 3. Notification Types

The platform defines six standard notification types:

* **`N01 — Risk Notification`:** Informational advisory alerting safety managers and supervisors that an active worksite has crossed into an elevated risk tier (`MODERATE`, `HIGH`, or `EXTREME`).
* **`N02 — Action Assignment`:** High-priority task notification alerting an assigned supervisor that a concrete preventive directive has been generated and requires prompt acknowledgment.
* **`N03 — Acknowledgment Reminder`:** Urgent timed reminder dispatched when an active directive reaches the final countdown minutes of its response window.
* **`N04 — Escalation Notification`:** Critical alert sent to the Safety Manager indicating that an assigned supervisor has missed their response deadline or reported a blocked task.
* **`N05 — Verification Reminder`:** Operational prompt reminding an on-site supervisor to submit execution confirmation after scheduled rest rotations or water distributions have concluded.
* **`N06 — System / Data Failure`:** Diagnostic alert informing administrators and managers that external weather feeds, notification channels, or integration endpoints are offline or degraded.

---

## 4. Notification Priority

Notification priority reflects the operational urgency of the underlying event:

* **`INFO`:** Low-urgency updates (e.g., daily shift schedule confirmed, worksite paused for weekend); visual toast or in-app bell notification.
* **`NORMAL`:** Standard operational alerts (e.g., moderate temperature rise forecast in 4 hours); standard in-app notification.
* **`HIGH`:** Urgent operational safety directives (e.g., high heat risk detected, 45/15 work-rest cycle assigned); high-contrast banner, audible chime, persistent in-app modal.
* **`CRITICAL`:** Emergency escalation events (e.g., supervisor non-responsive, acute extreme heat wave, site water failure); pulsing red banner, multi-channel dispatch, immediate modal takeover.

Priority levels correspond strictly to documented rule matrices and organizational policy; they are never assigned arbitrarily.

---

## 5. Notification Channels

The notification architecture supports a phased multi-channel strategy:

| Channel | Scope Tier | Description & Implementation |
| :--- | :--- | :--- |
| **`IN_APP`** | **MVP (P0)** | Real-time web socket push, notification bell drawer, and high-visibility alert modals within the web applications. |
| **`EMAIL`** | **MVP (P1)** | Transactional email dispatch via standard SMTP/API gateways (HTML & plaintext summary with deep link). |
| **`SMS`** | Future | Direct cellular SMS dispatch for field personnel without reliable mobile data connectivity. |
| **`PUSH`** | Future | Native OS push notifications (APNs / FCM) for mobile and tablet companion apps. |
| **`WHATSAPP`** | Future | Instant messaging enterprise integration for field crews accustomed to chat platforms. |
| **`VOICE`** | Future | Automated text-to-speech emergency call trees for unacknowledged critical escalations. |
| **`ENTERPRISE`** | Future | Webhook integrations into Slack, Microsoft Teams, or corporate safety dispatch centers. |

*Note:* For the hackathon MVP, the system focuses on robust **In-App alerting** and supporting **Email/Webhook dispatch**, avoiding complex external telephony dependencies.

---

## 6. Notification Content Standards

Every operational notification provides concise, unambiguous information answering the core operational questions:

* **Title:** Clear, high-contrast headline summarizing the event.
* **Priority:** Visual tag (`INFO`, `NORMAL`, `HIGH`, `CRITICAL`).
* **Worksite:** Specific physical site name and location.
* **Action:** Concrete summary of required physical controls.
* **Reason:** Primary environmental and workload drivers.
* **Expected Response:** Exactly what the user must click or execute.
* **Deadline / Timing:** Countdown or exact UTC response deadline.
* **Recipient:** Authenticated user name and designated role.
* **Call-to-Action (CTA):** Direct, one-click deep link to the Supervisor Action Center or Safety Command Center.

---

## 7. Canonical Fictional Notification Example

```text
[HIGH PRIORITY — ACTION REQUIRED]
Title:       Heat-Risk Directive Assigned — Acknowledgment Required
Worksite:    North Bengaluru Construction Site (Pier 42 Casting Yard)
Shift:       Morning Concrete Pour (06:00–14:00 IST)
Assigned To: Rahul Kumar (Site Supervisor)
Priority:    HIGH
Deadline:    12:15:00 IST (12 minutes remaining before escalation)

Directive Summary:
Ambient conditions (38°C temp, 65% humidity) have triggered HIGH HEAT RISK.
Mandatory 45 min work / 15 min rest cycle in shade canopy required immediately.
Replenish 50L chilled water dispensers at Canopy A.

[ OPEN SUPERVISOR ACTION CENTER & ACKNOWLEDGE ]
```

---

## 8. Notification vs. Action Directive

The architectural boundary between an action and a notification is paramount:

```text
   ACTION DIRECTIVE (Authoritative Object)
   ┌────────────────────────────────────────────────────────┐
   │ • Unique ID: act-2026-0892                             │
   │ • Worksite: North Bengaluru Construction Site          │
   │ • State: PENDING_ACKNOWLEDGMENT                        │
   │ • Authoritative Operational Source of Truth            │
   └────────────────────────────────────────────────────────┘
                               │
            Dispatches Multiple Notifications Over Time
                               │
                               ▼
   NOTIFICATION INSTANCES (Transient Communication Vectors)
   ┌───────────────────────┐ ┌───────────────────────┐
   │ In-App Alert (12:00)  │ │ SMS Reminder (12:10)  │
   │ Status: DELIVERED     │ │ Status: SENT          │
   └───────────────────────┘ └───────────────────────┘
```

Deleting or clearing a notification from an in-app inbox **never** resolves or cancels the underlying action directive. The action record remains the sole operational source of truth.

---

## 9. Delivery States

Notification tracking utilizes an explicit state machine:

* **`QUEUED`:** Alert payload assembled and scheduled for dispatch.
* **`SENDING`:** Transmitting payload to communication gateway.
* **`SENT`:** Successfully accepted by gateway provider.
* **`DELIVERED`:** Confirmation returned that message reached target client.
* **`FAILED`:** Gateway rejected payload or network timeout occurred.
* **`RETRYING`:** Transient network failure triggered automated retry backoff.

---

## 10. Retry Strategy

To ensure reliability without creating alert storms:
1. **Bounded Exponential Backoff:** Transient network failures retry up to three times with exponential backoff (e.g., 5s, 15s, 45s).
2. **Permanent Failure Visibility:** If all retries fail, state is permanently marked `FAILED`, and an alert surfaces on the Safety Manager dashboard.
3. **Escalation Preservation:** A failed notification does **not** halt the action’s escalation countdown timer; the timer continues running to ensure the unacknowledged action is escalated even if cellular communication drops.

---

## 11. In-App Notification Center

Both the Safety Manager Command Center and Supervisor Action Center feature an integrated notification center:
* **Unread Counter:** Badged indicator displaying active unread alerts.
* **Priority Sorting:** Critical and High alerts pinned to the top of the feed.
* **Action Deep Linking:** Tapping an alert immediately navigates the user to the exact action directive card.
* **Escalation Badges:** Prominently flags notifications associated with active escalations.
* **Status Sync:** When an action is acknowledged, associated notification cards update their status to reflect completion.

---

## 12. Notification Preferences vs. Safety Rules

The platform respects user communication preferences while protecting safety integrity:

* **Informational Preferences (Configurable):** Users may customize preferences for `INFO` and `NORMAL` advisories (e.g., opting in or out of daily forecast morning summaries).
* **Safety-Critical Directives (Non-Configurable):** High-priority action assignments (`N02`), acknowledgment reminders (`N03`), and critical escalations (`N04`) **cannot be disabled or muted**. Operational safety directives are mandatory system dispatches.

---

## 13. Role-Based Notification Routing

To eliminate alert fatigue, notifications route strictly according to organizational responsibility:

```text
                  SYSTEM EVENT GENERATION
                             │
       ┌─────────────────────┼─────────────────────┐
       ▼                     ▼                     ▼
 SITE SUPERVISOR       SAFETY MANAGER            ADMIN
┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│ • Action Assigned │ │ • Escalations (E01)│ │ • API Outages     │
│ • Ack Reminders   │ │ • Cross-Site High │ │ • Missing Config  │
│ • Shift Overlap   │ │   Risk Summaries  │ │ • Unassigned Site │
│ • Execution Checks│ │ • Blocked Directives│ │   Alerts          │
└───────────────────┘ └───────────────────┘ └───────────────────┘
```

A field supervisor is never spammed with administrative configuration notices, and a safety manager is alerted to tactical field actions only when thresholds breach or escalations trigger.

---

## 14. Escalation Notifications

Escalation alerts sent to the Safety Manager follow a specialized high-urgency schema:

* **Escalation Trigger Reason:** Exact code (e.g., `E01 — Supervisor Unresponsive`).
* **Original Action Directive:** Full text and work-rest ratios.
* **Original Owner:** Name and contact number of the non-responsive supervisor.
* **Elapsed Latency:** Total minutes elapsed since initial assignment.
* **Current Thermal Severity:** Live Heat Index and ambient temperature.
* **One-Click Intervention:** Direct action buttons to call supervisor, reassign action, or force stand-down.

---

## 15. Notification Deduplication

To prevent repetitive alert flooding during prolonged heat waves:
* **State-Based Deduplication:** If a worksite remains under `HIGH` risk across multiple sequential 30-minute weather polling cycles, the system suppresses duplicate "New Action Assigned" notifications as long as the initial action remains active in `PENDING` or `ACKNOWLEDGED` state.
* **Change-Triggered Alerts:** New notifications are generated only when the risk tier escalates (e.g., `HIGH` $\rightarrow$ `EXTREME`), an escalation fires, or a new shift begins.

---

## 16. Idempotency & Backend Reliability

The notification engine enforces backend idempotency:
* **Unique Idempotency Keys:** Outbound alerts are generated with keys formatted as `hash(action_id, notification_type, recipient_id, trigger_event)`.
* **Safe Retries:** If a background worker restarts unexpectedly, duplicate processing runs recognize existing idempotency keys and prevent duplicate email or push transmissions.

---

## 17. Failure Handling & Outage Scenarios

| Failure Scenario | System Handling | User Visibility | Operational Recovery |
| :--- | :--- | :--- | :--- |
| **Email Gateway Offline** | Captures failure; logs `DISPATCH_FAILED`; retries 3x | Delivery error icon on Safety Console | In-app notification serves as primary channel |
| **Supervisor In Bad Cellular Zone** | In-app notification queues locally via service worker | Queued status indicator | Alert displays instantly once connection reconnects |
| **Invalid Supervisor Phone / Email**| Rejects dispatch; flags user account as unroutable | Urgent setup alert on Admin Console | Admin updates user contact profile |
| **System Crash During Dispatch** | Persisted action record triggers catch-up worker upon reboot | Catch-up alerts marked with original timestamp | Safety Manager conducts backlog review |
| **Action Resolved While Alert Sending** | Alert payload updates dynamically or marks as "Resolved" | Status tag: "Already Acknowledged" | Eliminates supervisor confusion |

---

## 18. Security and Privacy Safeguards

1. **No Sensitive Medical Data:** Notifications never contain private medical histories, health conditions, or biometric measurements.
2. **Minimal Worker Personal Data:** Alerts reference job sites, shifts, and supervisor names, strictly omitting individual worker names.
3. **No Embedded Credentials:** Notifications contain secure deep links requiring authenticated active sessions, never embedding raw API tokens or sensitive passwords in email bodies.

---

## 19. AI-Assisted Notification Generation

Artificial intelligence features assist with communication formatting while respecting deterministic boundaries:

### Allowed AI Assistance:
* **Clarity & Tone Adjustment:** Formatting dense directives into punchy, mobile-optimized headlines.
* **Multilingual Translation:** Translating email and in-app alerts into vernacular languages (Hindi, Kannada, Spanish) for regional supervisors.
* **Toolbox Talk Summaries:** Generating 60-second verbal scripts attached to assignment notifications.

### Deterministic Fields That AI Cannot Alter:
$$\text{Risk Tier} \quad|\quad \text{Action ID} \quad|\quad \text{Work/Rest Ratio} \quad|\quad \text{Owner ID} \quad|\quad \text{Timeout Deadline}$$

---

## 20. Notification Performance Metrics

The system monitors key communication metrics:
* **Dispatch Latency:** Milliseconds elapsed from action creation to gateway transmission (Target: $< 5$ seconds).
* **Delivery Success Rate:** Percentage of outbound alerts successfully reaching target client endpoints.
* **Notification Open Latency:** Time elapsed between delivery and human visual opening.
* **Notification Failure Frequency:** Number of failed transmissions per hundred dispatches.
* **Channel Drop Rate:** Percentage of notifications requiring fallback channel routing.

> **Crucial Boundary:** These metrics evaluate *technical communication performance*, not worker biological health or medical safety.

---

## 21. MVP vs. Future Notification Model

| Notification Capability | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **In-App Real-Time Push** | Yes (WebSockets & alert drawer) | Native mobile OS background push (APNs/FCM) |
| **Transactional Email Dispatch** | Yes (P1 gateway support) | Dynamic email micro-apps with embedded one-tap ack |
| **SMS Cellular Dispatch** | **No** (Mockup / Future) | Direct cellular SMS via Twilio / AWS SNS |
| **WhatsApp Business Alerts** | **No** (Future) | Two-way interactive WhatsApp bot conversations |
| **Text-to-Speech Voice Calls** | **No** (Future) | Automated emergency telephone call trees |
| **AI Language Translation** | Yes (P1 assistive translation) | Real-time multilingual voice briefing synthesis |
| **Enterprise Webhooks** | Limited (Basic POST hooks) | Native Slack, Microsoft Teams, and Procore apps |

---

## 22. Final Principle

> **Notifications should move the right information to the right authorized person, but the action record—not the notification itself—is the source of truth for operational status and accountability.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
