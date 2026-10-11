# Progressive Web App (PWA) Specification

**Document ID:** `59_PWA`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Core Philosophy

The purpose of this specification is to define how the Heat Action Response Engine delivers a resilient, high-performance, mobile-first progressive web application across field devices, job-site tablets, and supervisor smartphones, while strictly upholding the platform's backend-authoritative safety model.

### Core PWA Principle

> **"The PWA improves accessibility, reach, installability, and resilience; it does not become an independent safety system."**

In industrial safety operations, a progressive web app bridges the gap between field mobility and mission-critical cloud intelligence. However, field mobility must never compromise operational truth:
* A cached risk reading is **never** guaranteed to represent current atmospheric reality.
* An offline acknowledgment is **never** considered legally verified until committed to the authoritative backend ledger.
* The client application **never** calculates heat hazard ratings, threshold breaches, or escalation triggers independently in browser storage.

---

## 2. PWA Goals & Operational Objectives

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          CORE PWA OBJECTIVES                           │
├──────────────────────┬─────────────────────────────────────────────────┤
│ OBJECTIVE            │ OPERATIONAL VALUE                               │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 1. Zero-Install Reach│ Instant supervisor onboarding via web URL; zero │
│                      │ MDM or app-store gatekeeping during heatwaves.  │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 2. Installable Shell │ One-tap addition to device home screen with     │
│                      │ dedicated standalone window and splash screen.  │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 3. Fast Shell Load   │ Sub-second rendering of core navigation and     │
│                      │ layout shell on 3G/4G cellular connections.     │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 4. Controlled Offline│ Clear display of last-known validated state,    │
│    Transparency      │ explicit staleness timestamps, and safe offline │
│                      │ action queueing.                                │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 5. Safe Reconnect    │ Automatic, non-destructive reconciliation of    │
│    Reconciliation    │ local actions upon cellular signal recovery.    │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 6. Memory Efficiency │ Lean memory and battery footprint suitable for  │
│                      │ budget Android devices under high ambient heat. │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. PWA Architecture

The PWA operates as an interface delivery mechanism, positioning the service worker and local cache strictly as transport resilience tools, not as decision-making authorities:

```text
                           ┌─────────────────────────┐
                           │    BACKEND CLOUD CORE   │
                           │  Authoritative State,   │
                           │  Risk & Action Engines  │
                           └────────────┬────────────┘
                                        │ REST / SSE
                                        ▼
                           ┌─────────────────────────┐
                           │      NETWORK LAYER      │
                           │  Retry, Timeout, Auth   │
                           └────────────┬────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │ SERVICE WORKER & CACHE  │
                           │ Asset Cache, Offline    │
                           │ Detection, Sync Queue   │
                           └────────────┬────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │     PWA APPLICATION     │
                           │  Domain State, Shell,   │
                           │  Zustand, React Query   │
                           └────────────┬────────────┘
                                        │
                                        ▼
                           ┌─────────────────────────┐
                           │  MOBILE / DESKTOP VIEW  │
                           │  Bright, Accessible UI  │
                           └─────────────────────────┘
```

### Architectural Authority Boundary
The Service Worker and Client Cache are **explicitly prohibited** from performing:
* Heat index calculations or WBGT estimations.
* Safety risk classification (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
* Workplace action generation or threshold rule evaluations.
* Escalation timeout determinations.
* Final authorization grant approvals.
* Permanent verification confirmations.

---

## 4. PWA Components

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ COMPONENT                │ ARCHITECTURAL ROLE & BOUNDARIES                  │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Application Shell     │ Minimal, static HTML/CSS/JS bundle containing    │
│                          │ global navigation, design tokens, and empty view │
│                          │ skeletons. Loaded instantly from CacheStorage.   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. Service Worker        │ Background network interceptor managing runtime  │
│                          │ asset caching, offline status broadcasting, and  │
│                          │ pending action serialization.                    │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. Cache Storage         │ Segregated client-side cache stores: static      │
│                          │ assets, semi-static docs, and temporary telemetry│
│                          │ with strict TTL expiration.                      │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 4. IndexedDB Queue       │ Encrypted local transactional store for queueing │
│                          │ offline action intents awaiting server delivery. │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 5. Authoritative Backend │ The single source of truth for all life-safety   │
│                          │ assessments, action lifecycles, and audit logs.  │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## 5. Installability & Web App Manifest

To support rapid field adoption without app store delays, the PWA provides full standalone installability where supported by modern mobile and desktop operating systems.

### Conceptual Web App Manifest (`manifest.json`)
```json
{
  "name": "Heat Action Response Engine",
  "short_name": "HeatAction",
  "description": "Industrial Heat Risk Mitigation and Workplace Action Response Platform",
  "start_url": "/dashboard?utm_source=pwa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#F8FAFC",
  "theme_color": "#FFFFFF",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["business", "productivity", "utilities"]
}
```

*Note: Production values, iconography assets, and theme tokens derive strictly from `55_DESIGN_SYSTEM.md`. Installability criteria are validated across Android Chrome, iOS Safari (Add to Home Screen), and desktop Chromium browsers.*

---

## 6. Application Shell Load Priority

To eliminate loading lag on unstable field networks, the PWA prioritizes critical operational elements over administrative baggage:

```text
USER OPENS APP
      │
      ▼
1. FAST APP SHELL (From CacheStorage, <100ms)
      │
      ▼
2. AUTHENTICATION & ORG SCOPE (Token Check, Session Validity)
      │
      ▼
3. NETWORK CONNECTION STATUS (● Live / ○ Offline)
      │
      ▼
4. CURRENT WORKSITE CONTEXT (Active Site, Shift, Supervisors)
      │
      ▼
5. AUTHORITATIVE HEAT RISK (Current Level, Data Quality)
      │
      ▼
6. HIGHEST-PRIORITY ACTION CARD ([ Acknowledge ] CTA)
      │
      ▼
7. DEFERRED TELEMETRY (Background charts, history logs, analytics)
```

Above-the-fold operational directives load before any historical charts or secondary widgets are fetched.

---

## 7. Offline Strategy & Operational Realities

Field worksites often experience deep concrete basements, metal sheds, and cellular dead zones. The PWA architecture enforces three strictly delineated offline tiers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        THREE OFFLINE REALITIES                         │
├──────────────────────┬─────────────────────────────────────────────────┤
│ TIER                 │ OPERATIONAL CAPABILITY & BOUNDARIES             │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Tier 1: App Shell    │ App opens instantly offline. Renders headers,   │
│                      │ layout navigation, and connection status banner.│
├──────────────────────┼─────────────────────────────────────────────────┤
│ Tier 2: Cached Data  │ Displays previously downloaded worksite data,   │
│                      │ risk levels, and actions with prominent STALE   │
│                      │ badges and exact historical timestamps.         │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Tier 3: Operational  │ Safety actions (Acknowledge, Verify) cannot be  │
│ Actions              │ confirmed offline. Stored locally as PENDING    │
│                      │ SYNC; server commits when signal is restored.   │
└──────────────────────┴─────────────────────────────────────────────────┘
```

> **CRITICAL RULE: The PWA must NEVER imply that being OFFLINE is equivalent to being in a SAFE operational state.**

---

## 8. Offline State Model

The frontend state machine tracks connection health through seven unambiguous states:

```text
┌──────────────────┐       Connection Lost       ┌──────────────────┐
│      ONLINE      │ ──────────────────────────> │     CONNECTING   │
│   (Synchronized) │                             │   (Evaluating)   │
└──────────────────┘                             └────────┬─────────┘
        ▲                                                 │
        │ Server Resync                                   │ Ping Failed
        │ Complete                                        ▼
┌───────┴──────────┐       Cellular Signal       ┌──────────────────┐
│     SYNCING      │ <────────────────────────── │     OFFLINE      │
│  (Reconciling)   │          Restored           │ (Local Cache)    │
└──────────────────┘                             └────────┬─────────┘
        │                                                 │
        │ Sync Rejection                                  │ >15m elapsed
        ▼                                                 ▼
┌──────────────────┐                             ┌──────────────────┐
│   SYNC_FAILED    │                             │STALE_LOCAL_STATE │
│ (Manual Review)  │                             │ (Telemetry Void) │
└──────────────────┘                             └──────────────────┘
```

### Visual and Screen-Reader Descriptions
* **ONLINE (`● Live`):** Real-time sync active; updates confirmed.
* **OFFLINE (`○ Offline`):** Cellular disconnected; viewing local cache; submission queued.
* **STALE_LOCAL_STATE (`⚠ Stale Local State`):** Cached data exceeds $15\text{ minutes}$; atmospheric conditions cannot be guaranteed.

---

## 9. Cached Safety Information Governance

Whenever cached safety assessments are rendered on screen, they are accompanied by mandatory provenance metadata:

```text
┌────────────────────────────────────────────────────────────────┐
│ ⚠ OFFLINE VIEW — STALE LOCAL DATA                              │
│                                                                │
│ Worksite: North Bengaluru Site                                 │
│ Last Server Sync: 14:12 IST (38 minutes ago)                   │
│ Data Quality: STALE                                            │
│                                                                │
│ Recorded Heat Risk: HIGH                                       │
│                                                                │
│ [!] Atmospheric conditions may have changed since 14:12.       │
│ Maintain active shade rest protocols until connection returns. │
└────────────────────────────────────────────────────────────────┘
```

*Prohibited:* Never hide the sync timestamp or render a clean green status indicator while operating offline.

---

## 10. Offline Risk Handling: No Client-Side Computation

If a mobile supervisor's device loses network connectivity while temperatures rise on site, the PWA **must not**:
* Run local mathematical formulas to calculate a new Heat Index.
* Escalate or downgrade risk levels based on local phone ambient sensors.
* Synthesize artificial forecast trends.

### Mandated Behavior:
1. Retain and display the last known authoritative backend assessment.
2. Clearly mark the assessment as `STALE LOCAL STATE`.
3. Inform the supervisor that live recalculations are suspended until connectivity returns.
4. Direct the supervisor to execute the most conservative protocol assigned prior to disconnect.

---

## 11. Offline Action Handling & The Pending Sync Queue

Operational actions performed by supervisors while offline are managed with extreme care to prevent false safety assurances:

```text
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ ACTION TYPE              │ OFFLINE HANDLING BEHAVIOR                        │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ Read Action Details      │ Fully permitted from cached local data.          │
│ Read Safety Instructions │ Fully permitted from cached standard SOPs.       │
│ Initiate Acknowledgment  │ Queued locally as PENDING_SYNC.                  │
│                          │ Visual status: "Pending Sync (Offline)".         │
│                          │ Primary button disabled to prevent duplicate tap.│
│ Initiate Verification    │ Queued locally as PENDING_SYNC.                  │
│                          │ Must receive backend verification before closing.│
│ Escalation Dispute       │ Queued locally with mandatory local timestamp.   │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

> **"PENDING SYNC must NEVER be displayed as ACKNOWLEDGED or VERIFIED until authoritative server confirmation is received."**

```text
SUPERVISOR TAPS [ ACKNOWLEDGE ] (WHILE OFFLINE)
                      │
                      ▼
LOCAL PERSISTENCE: Save to IndexedDB sync_queue
Payload: { action_id, user_id, client_timestamp, status: "PENDING_SYNC" }
                      │
                      ▼
UI TRANSITIONS IMMEDIATELY:
Badge: [ ◐ Pending Server Confirmation ]
Notice: "Acknowledgment recorded locally at 14:25. Will synchronize when online."
                      │
                      ▼
(CELLULAR SIGNAL RESTORED)
                      │
                      ▼
PWA FLUSHES QUEUE: POST /api/v1/actions/{id}/acknowledge
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
[ BACKEND ACCEPTS ]        [ BACKEND REJECTS (e.g. Expired SLA) ]
Badge: [ Confirmed ]       Badge: [ Escalation Conflict ]
Toast: "Sync confirmed"    Modal: "Action was escalated at 14:20 prior to sync"
```

---

## 12. Strict Acknowledgment & Verification Semantics

The PWA strictly preserves the operational lifecycle distinctions defined across `16_ACTION_MODEL.md` and `17_ESCALATION_MODEL.md`:

```text
SENT  ≠  DELIVERED  ≠  READ  ≠  ACKNOWLEDGED  ≠  VERIFIED
```

```text
┌────────────────────┬───────────────────────────────────────────────────┐
│ STATE              │ PWA OPERATIONAL MEANING                           │
├────────────────────┼───────────────────────────────────────────────────┤
│ SENT               │ Server generated action and dispatched push.      │
│ DELIVERED          │ Service worker received push packet on device.    │
│ READ               │ Supervisor opened action detail drawer.           │
│ ACKNOWLEDGED       │ Supervisor tapped Acknowledge AND server committed│
│                    │ receipt of legal responsibility.                  │
│ VERIFIED           │ Physical implementation inspected & confirmed     │
│                    │ by authorized manager on authoritative backend.   │
└────────────────────┴───────────────────────────────────────────────────┘
```

The PWA will **never** treat a background push delivery or local card impression as an operational acknowledgment.

---

## 13. Service Worker Caching Strategies

The service worker implements differentiated caching strategies tailored to the safety sensitivity of each data category:

```text
┌─────────────────────┬───────────────────────┬──────────────────────────┐
│ RESOURCE CATEGORY   │ CACHING STRATEGY      │ RATIONALE                │
├─────────────────────┼───────────────────────┼──────────────────────────┤
│ Static Shell Assets │ Cache-First           │ Maximum load velocity,   │
│ (JS, CSS, SVGs)     │ (Stale-While-Reval)   │ immutable content hashes.│
├─────────────────────┼───────────────────────┼──────────────────────────┤
│ Semi-Static Content │ Network-First         │ Updated guidelines take  │
│ (SOPs, Help Guides) │ with Cache Fallback   │ priority; offline usable.│
├─────────────────────┼───────────────────────┼──────────────────────────┤
│ Dynamic Telemetry   │ Network-First         │ Freshness is paramount;  │
│ (Risk, Weather)     │ (Short TTL Cache)     │ stale cache exposed with │
│                     │                       │ explicit warning badges. │
├─────────────────────┼───────────────────────┼──────────────────────────┤
│ Critical Action API │ Network-Only          │ Stale cache dangerous;   │
│ (Ack, Verify, Esc)  │ (IndexedDB Fallback)  │ operations must hit API  │
│                     │                       │ or enter pending queue.  │
└─────────────────────┴───────────────────────┴──────────────────────────┘
```

---

## 14. Cache Classification & Storage Budgets

```text
┌─────────────────┬───────────────────────┬────────────┬─────────────────┐
│ CACHE DOMAIN    │ STORED CONTENTS       │ MAX BUDGET │ EXPIRATION / TTL│
├─────────────────┼───────────────────────┼────────────┼─────────────────┤
│ `shell-v1`      │ HTML shell, CSS, JS   │ $15\text{ MB}$│ App update      │
│ `assets-v1`     │ Static icons, fonts   │ $5\text{ MB}$ │ 30 days         │
│ `operational-v1`│ Worksite configs      │ $10\text{ MB}$│ 24 hours        │
│ `telemetry-v1`  │ Risk runs, weather    │ $5\text{ MB}$ │ $15\text{ mins}$│
│ `sync-queue`    │ Offline pending action│ $2\text{ MB}$ │ Until confirmed │
└─────────────────┴───────────────────────┴────────────┴─────────────────┘
```

Sensitive user access tokens, encryption keys, and confidential health disclosures are **strictly barred** from `CacheStorage`.

---

## 15. Cache Invalidation Triggers

Client caches are immediately flushed or revalidated upon any of the following events:
1. **User Logout:** All operational and telemetry caches are erased; pending queues are cleared or transferred to secure memory.
2. **Organization / Tenant Switch:** Cache boundary purged to prevent cross-tenant data contamination.
3. **Worksite Assignment Change:** Out-of-scope worksite data evicted.
4. **Application Version Deployment:** Outdated shell and asset caches deleted via service worker `activate` event.
5. **Session Expiration:** Operational cards masked behind a secure re-authentication dialog.

---

## 16. Multi-Tenant Isolation in PWA Storage

In enterprise deployments, multiple subcontractors or companies may share mobile devices:
* All IndexedDB tables and CacheStorage namespaces are prefixed with the active `tenant_id` and `user_id`:
  `cache_org_acme_site_blr_telemetry`
* Cross-tenant cache leaking is mathematically impossible by enforcing isolated key storage.
* If a new user logs in on a shared tablet, the preceding user's cache is purged before the application shell renders.

---

## 17. Application Update Lifecycle

To prevent disrupting supervisors during active emergency responses:

```text
NEW SERVICE WORKER INSTALLED IN BACKGROUND
                    │
                    ▼
PWA DETECTS PENDING ACTIVATION
                    │
                    ▼
IS USER PERFORMING CRITICAL SAFETY ACTION?
                    │
       ┌────────────┴────────────┐
       ▼                         ▼
     [ YES ]                   [ NO ]
HOLD UPDATE SILENTLY       DISPLAY CALM TOP BANNER:
UNTIL ACTION CONFIRMED     "System update ready. [ Update Now ]"
                                 │
                                 ▼
                     USER TAPS OR ROUTE CHANGES
                                 │
                                 ▼
                     SKIPWAITING & CLEAN RELOAD
```

The application **never** triggers an unannounced full-page browser reload while a supervisor is filling out an action report or reviewing an urgent directive.

---

## 18. Constrained Network & High-Latency Resilience

In remote outdoor facilities with flaky 2G/3G connections:
* **API Timeout Protocol:** Network requests timeout after $8\text{ seconds}$ and fall back to cached state rather than hanging indefinitely.
* **Error Disambiguation:** The UI cleanly differentiates between:
  * `NO_NETWORK` (Offline banner shown)
  * `API_GATEWAY_TIMEOUT` (Server busy; retry scheduled)
  * `AUTHORIZATION_REVOKED` (Re-authentication required)
  * `DATA_STALE` (Displaying older valid reading)

---

## 19. Push Notifications Architecture (Optional / P1 Horizon)

Where supported and granted by the user, Web Push notifications enhance operational reach:

```text
BACKEND RISK/ACTION ENGINE TRIGGER
               │
               ▼
   NOTIFICATION SERVICE (P1)
               │
               ▼
   WEB PUSH SERVICE (FCM / VAPID)
               │
               ▼
DEVICE SERVICE WORKER (`push` event)
               │
               ▼
NATIVE SYSTEM NOTIFICATION DISPLAY:
"HIGH Risk Alert: Hydration break assigned for Shift A. [ Open ]"
```

### Safety Notification Rule
> **Push delivery to a device does NOT prove human receipt.**
The backend escalation SLA timer continues running until the supervisor physically authenticates and confirms the action within the PWA interface.

---

## 20. Simulation Mode Boundaries in PWA

When training drills or scenario simulations run (`38_SIMULATION_MODE.md`):
* The PWA establishes a completely isolated cache domain: `sim-telemetry-v1`.
* All displayed screens feature an unmissable purple border and header:
  `◆ SIMULATION DRILL ACTIVE — SYNTHETIC DATA`
* Simulated actions never synchronize to the production API, preventing mock acknowledgments from contaminating real-world audit logs.

---

## 21. PWA Failure Modes & Recovery Matrix

```text
┌────┬─────────────────────────────┬────────────────────────────────────────────────────────┐
│ #  │ FAILURE SCENARIO            │ RECOVERY & SAFETY BEHAVIOR                             │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F01│ Complete Network Drop       │ Immediate switch to Offline Mode; display last sync    │
│    │                             │ timestamp; queue actions locally in IndexedDB.         │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F02│ API Request Timeout         │ Calm toast notification; prompt user to retry; preserve│
│    │                             │ locally entered input in form memory.                  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F03│ Auth Token Expired Offline  │ Display non-destructive re-login modal upon reconnect;  │
│    │                             │ retain pending sync queue for replay post-auth.        │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F04│ Cache Storage Corruption    │ Catch CacheStorage exceptions; evict damaged bucket;   │
│    │                             │ refetch pristine assets directly from origin.          │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F05│ Sync Conflict on Reconnect  │ If server escalated action while user was offline,     │
│    │                             │ display conflict resolution dialog; do not overwrite.  │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F06│ Background Worker Crash     │ Unregister and re-install service worker cleanly       │
│    │                             │ without dropping active browser session state.         │
├────┼─────────────────────────────┼────────────────────────────────────────────────────────┤
│ F07│ Backend Down (503/504)      │ Freeze dynamic recalculation; announce backend outage; │
│    │                             │ maintain conservative on-site safety protocols.        │
└────┴─────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 22. Security Considerations

The PWA adheres to rigorous web security principles (aligned with `80_SECURITY.md` through `89_THREAT_MODEL.md`):
* **Mandatory HTTPS:** Service Workers only register over secure HTTPS contexts (or `localhost` during development).
* **Strict Content Security Policy (CSP):** Restricts script execution to authorized origin bundles; blocks unsafe inline scripts and malicious third-party trackers.
* **No Secret Storage:** API keys, database credentials, and master private keys are never stored on client devices.
* **Encrypted Local Queue:** IndexedDB payload stores avoid storing personally identifiable worker health information.

---

## 23. PWA Testing Strategy

The PWA undergoes structured validation across four testing vectors:

```text
┌─────────────────────┬──────────────────────────────────────────────────┐
│ TESTING VECTOR      │ VERIFICATION CRITERIA                            │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 1. Lighthouse PWA   │ Passes all PWA criteria; manifest valid; icons   │
│    Audit            │ maskable; fast performance score ($>90$).        │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 2. Offline Action   │ Turn on Airplane mode -> Acknowledge Action ->   │
│    Simulation       │ Confirm "Pending Sync" badge -> Turn on network  │
│                     │ -> Verify automatic backend delivery.            │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 3. Stale Data Tests │ Advance clock $30\text{ mins}$ without refresh ->│
│                     │ Confirm STALE LOCAL DATA warning banner renders. │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 4. Multi-Tenant     │ Log in as Org A -> Check cache -> Log in as      │
│    Purge Check      │ Org B -> Confirm zero data bleed from Org A.     │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 24. PWA Definition of Done (DoD)

- [ ] Web App Manifest valid with appropriate icons and standalone configuration.
- [ ] Application shell renders within $1.5\text{ seconds}$ on throttled Fast 3G.
- [ ] Service worker caches static assets cleanly without stale-lock bugs.
- [ ] Connection state changes (`ONLINE`, `OFFLINE`, `STALE`) render visibly with text.
- [ ] Offline mode clearly communicates that data is local and may be stale.
- [ ] Offline actions queue in IndexedDB as `PENDING_SYNC` and never show as confirmed.
- [ ] Reconnecting seamlessly synchronizes the offline queue with backend validation.
- [ ] Service worker never recalculates risk or modifies safety-critical logic.
- [ ] App update notifications do not interrupt active operational flows.
- [ ] Cache partitions strictly isolate organizations and clear upon user logout.
- [ ] Simulation mode is unmistakably badged and isolated from production storage.
- [ ] Fully accessible and compliant with `58_ACCESSIBILITY.md`.

---

## 25. MVP vs. Future Horizons

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ MVP RELEASE CAPABILITIES          │ FUTURE ROADMAP CAPABILITIES       │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Responsive web app & shell cache│ • Background Sync API automation  │
│ • Installable standalone manifest │ • Web Push emergency broadcast    │
│ • Offline cached telemetry review │ • Geofenced automatic site prompt │
│ • Local action queueing (IndexedDB│ • Offline biometric authentication│
│ • Visible connection health badges│ • Native Bluetooth local sensor   │
│ • Safe reconnect reconciliation   │   integration (P2 horizon)        │
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 26. Final Principle

> **Accessibility ensures that the right user can understand and operate the system; the PWA ensures that the system remains practical and resilient across devices and connectivity conditions. Neither layer changes the authoritative safety logic.**
