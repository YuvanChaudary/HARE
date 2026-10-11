# 52 Safety Manager Dashboard Specification

**Document Status:** Draft  
**Last Updated:** 2026-10-07  

---

## 1. Document Purpose and Core Principle

This document specifies the information architecture, operational metrics, cross-site monitoring tables, and escalation interfaces for the **Safety Manager Dashboard** within the **Heat Action Response Engine**.

The Safety Manager Dashboard provides macro-level executive and operational oversight for enterprise safety leadership (e.g., Organizational Safety Manager **Ananya Rao**). Its core operational mission is to provide complete organizational visibility with immediate drill-down capability:

> **The Safety Manager should be able to see where attention is needed across the entire enterprise without losing the ability to drill into any underlying worksite, shift, or unacknowledged action within two clicks.**

```text
┌────────────────────────────────────────────────────────────────────────┐
│ SAFETY MANAGER EXECUTIVE MISSION:                                      │
│ 1. Scans enterprise overview across 12 distributed worksites.          │
│ 2. Identifies facilities operating in HIGH or CRITICAL heat tiers.     │
│ 3. Intercepts escalated actions where field supervisors timed out.     │
│ 4. Audits compliance verification rates and data-quality health.       │
│ 5. Drills down into granular worksite timelines for compliance review. │
└────────────────────────────────────────────────────────────────────────┘
```

The interface embodies a **bright, spacious, data-dense yet clean SaaS visual design**, enabling executives to prioritize risk without succumbing to cognitive fatigue or alarmist clutter.

---

## 2. Information Hierarchy

The Safety Manager Dashboard is structured along a funnel of increasing operational specificity:

```text
1. ORGANIZATIONAL OVERVIEW METRICS   ──► Total sites, active workforce, enterprise hazard status
                 │
                 ▼
2. RISK DISTRIBUTION MATRIX          ──► Categorical count: Low, Moderate, High, Critical
                 │
                 ▼
3. ATTENTION REQUIRED FEED           ──► High-priority exceptions: Escalations, time-outs, stale data
                 │
                 ▼
4. MULTI-WORKSITE STATUS TABLE       ──► Scannable roster of all active facilities with filters
                 │
                 ▼
5. ESCALATION & COMPLIANCE LOGS      ──► Detailed resolution queue for overdue supervisory actions
                 │
                 ▼
6. GRANULAR WORKSITE DRILL-DOWN      ──► Direct navigation into individual facility consoles
```

---

## 3. Desktop Dashboard Layout Architecture

The desktop view utilizes a high-efficiency modular grid with clear semantic hierarchy:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Heat Action Response Engine   Enterprise Command: InfraCorp Ltd   [Bell (4)] [Ananya]│
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ Executive Safety Overview                                       Last Synced: 10:35 AM IST│
│ 12 Active Worksites • 340 Workers on Shift • 2 Regional Heat Advisories Active           │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ WORKSITES     │ │ HIGH / CRIT   │ │ UNRESOLVED    │ │ ACTIVE        │ │ TELEMETRY   │ │
│ │ 12 Active     │ │ 3 Sites (25%) │ │ 7 Actions     │ │ 2 Escalations │ │ 1 Stale     │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────┘ │
│                                                                                         │
│ ┌───────────────────────────────────────────────┐ ┌───────────────────────────────────┐ │
│ │ ⚠️ ATTENTION REQUIRED QUEUE (Priority Sorted)  │ │ CROSS-SITE RISK DISTRIBUTION      │ │
│ │ • [CRITICAL] WS-PUN-02: Work Stoppage Review  │ │ [████ Critical (1)               ]│ │
│ │ • [ESCALATION] WS-BLR-04: Rahul Kumar Timeout │ │ [████████ High (2)               ]│ │
│ │ • [STALE DATA] WS-MUM-01: API Down (75 mins)  │ │ [████████████ Moderate (5)       ]│ │
│ │ • [OVERDUE ACK] WS-HYD-03: Shade Deployment   │ │ [████████████████ Low (4)        ]│ │
│ └───────────────────────────────────────────────┘ └───────────────────────────────────┘ │
│                                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ALL ACTIVE WORKSITES (Filter: All | High/Crit (3) | Escalated (2))                  │ │
│ │ Worksite Name       Risk Tier   Heat Index  Data Health  Actions Pending  Escalation│ │
│ │ North Bengaluru     HIGH        44.1°C      VALID        2 Actions (18m)  None      │ │
│ │ Pune Metro Line 3   CRITICAL    47.2°C      VALID        1 Action (Overdue) ACTIVE  │ │
│ │ Mumbai Logistics    MODERATE    38.0°C      STALE (75m)  0 Actions        None      │ │
│ │ Hyderabad Solar Pad LOW         33.2°C      VALID        0 Actions        None      │ │
│ └─────────────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Key Metric Summary Cards

The top metric row provides instant situational awareness across five vital operational indicators:

1. **Active Worksites Pill:** Displays total active facilities under operational monitoring.
2. **High & Critical Risk Counter:** Highlights facilities operating in hazardous thermal bands (`HIGH` or `CRITICAL`), styled with high-contrast amber/red badges.
3. **Unresolved Action Counter:** Tracks total open physical mitigation tasks across all worksites.
4. **Active Escalations Badge:** Displays overdue actions where supervisory acknowledgment windows lapsed, rendered with an urgent visual pill.
5. **Telemetry Health Monitor:** Quantifies facilities experiencing data ingestion staleness or source conflicts.

---

## 5. The "Attention Required" Exception Queue

Rather than forcing the safety manager to hunt through multi-row tables, the **Attention Required Queue** aggregates all high-priority operational exceptions into a prioritized stack:

```text
PRIORITY RANKING IN THE EXCEPTION QUEUE:
1. CRITICAL Risk Facilities (Immediate physical danger to crews)
2. Active Escalations (Supervisor timed out; manager intervention required)
3. High-Risk Unacknowledged Actions (Timer nearing zero)
4. Telemetry Outages / Stale Data (Monitoring blind spots exceeding 60 mins)
5. Blocked Actions (Supervisor flagged missing site equipment)
```

Each entry in the queue provides direct one-click actions: **[ Review Escalation ]**, **[ Inspect Telemetry ]**, or **[ Contact Supervisor ]**.

---

## 6. Multi-Worksite Operational Overview Table

The primary data grid delivers comprehensive, filterable cross-site visibility:

| Worksite Name | Risk Tier | Heat Index | Telemetry Health | Pending Actions | Escalation Status | Actions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **North Bengaluru Const.** | `[ ⚠️ HIGH ]` | 44.1 °C | `[ VALID ]` | 2 Pending (18m left) | `None` | `[ View Site ]` |
| **Pune Metro Line 3** | `[ 🛑 CRIT ]` | 47.2 °C | `[ VALID ]` | 1 Overdue Task | `[ 🔶 TIER 1 ]` | `[ Intervene ]` |
| **Mumbai Logistics Hub** | `[ ⚠️ MOD ]` | 38.0 °C | `[ ⚠️ STALE ]` | 0 Active | `None` | `[ View Site ]` |
| **Hyderabad Solar Array** | `[ ✓ LOW ]` | 33.2 °C | `[ VALID ]` | 0 Active | `None` | `[ View Site ]` |

### Interaction Design
* **Sortable Columns:** Sort instantly by Risk Tier, Heat Index, or Pending Action urgency.
* **Semantic Highlighting:** Rows with active escalations feature a subtle left-border indicator.
* **Instant Filtering:** Quick toggles isolate *"Sites Needing Attention"* with a single click.

---

## 7. Granular Drill-Down Architecture

The Safety Manager Dashboard is built on a non-destructive drill-down paradigm:

```text
SAFETY MANAGER DASHBOARD (Macro Overview)
             │ Click "North Bengaluru Construction"
             ▼
WORKSITE DETAIL VIEW (53_WORKSITE_VIEW.md)
             │ Click "ACT-1082: Hydration Readiness"
             ▼
ACTION AUDIT DRAWER (16_ACTION_MODEL.md)
             │
             ├── Complete Chronological Event Stream (Assigned, Notified, Timed Out)
             ├── Exact Triggering Weather Ingestion Payload
             └── Supervisor Verification Checkmarks & Geolocation Tag
```

The executive can navigate from enterprise overview down to the specific digital checkmark signed by a field supervisor in less than two clicks, preserving complete audit context.

---

## 8. Multi-Site Trend and Compliance Visualization

The dashboard includes a dedicated, clean visualization card illustrating compliance trends over configurable timeframes (Today, Past 7 Days, Past 30 Days):

```text
┌────────────────────────────────────────────────────────────────────────┐
│ COMPLIANCE & ESCALATION TRENDS (Past 7 Days)                           │
│                                                                        │
│ 100% ┼───────────────────────────────────────────────────────────────  │
│      │  96%         94%         98%         92%         95%            │
│  80% ┼───●───────────●───────────●───────────●───────────●───────────  │
│      │                                                                 │
│  40% ┼                                                                 │
│      │  1 Esc       2 Esc       0 Esc       3 Esc       1 Esc          │
│   0% ┴───┴───────────┴───────────┴───────────┴───────────┴───────────  │
│         Mon         Tue         Wed         Thu         Fri            │
│                                                                        │
│ Legend: ──●── On-Time Supervisory Acknowledgment Rate (%)             │
│         Bars: Daily Escalation Count                                   │
└────────────────────────────────────────────────────────────────────────┘
```

* **Zero Speculative Modeling:** Displays historical compliance facts only; does not generate speculative future predictions.
* **Accessible Visuals:** Charts feature clear data point labels, non-overlapping axes, and high contrast against white card surfaces.

---

## 9. Data Quality and Observability Panel

A dedicated telemetry panel alerts safety leadership to monitoring health deficits:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ 📡 ENVIRONMENTAL DATA INTEGRITY MONITOR                                │
├────────────────────────────────────────────────────────────────────────┤
│ • 11 of 12 worksites receiving LIVE validated weather telemetry.       │
│ • 1 worksite operating on STALE data:                                  │
│   - Mumbai Logistics Hub: API timeout for 75 mins. High-Risk safety    │
│     buffer remains automatically enforced on site.                     │
│ • Zero source conflict discrepancies detected across regional models.  │
│ [ View Ingestion Telemetry Logs ]                                      │
└────────────────────────────────────────────────────────────────────────┘
```

The dashboard ensures safety leadership is always aware of data uncertainty rather than assuming an absence of telemetry equals an absence of risk.

---

## 10. AI Enterprise Assistant Integration

The Safety Manager Dashboard integrates the AI Assistant as an **Executive Operations Copilot**:

* **Supported Executive Prompts:**
  * *"Summarize all high-risk facilities currently active."*
  * *"Which supervisors currently have overdue actions pending?"*
  * *"Draft an executive compliance report for today's heat-wave response."*
  * *"Why did Pune Metro trigger an automated escalation at 10:15 AM?"*
* **Grounding & Security Invariants:**
  * The assistant references only enterprise worksites within the manager's authorized tenant.
  * The assistant cannot dismiss escalations, modify audit logs, or alter risk rules.
  * All responses provide direct clickable links to the underlying system records.

---

## 11. Role Authorization Boundaries (RBAC Alignment)

Aligned with [19_PERMISSION_MODEL.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/19_PERMISSION_MODEL.md), the Safety Manager possesses comprehensive review privileges, but operational boundaries remain enforced:

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ PERMITTED SAFETY MANAGER ACTIONS      │ PROHIBITED DASHBOARD CAPABILITIES     │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ • View all enterprise worksites       │ • Falsely signing supervisor checklist│
│ • Intervene in escalated actions      │ • Deleting or modifying audit logs    │
│ • Reassign actions to alternate leads │ • Altering core mathematical rules    │
│ • Initiate on-demand weather refresh  │ • Creating arbitrary unvetted rules   │
│ • Export formal compliance audit logs │ • Bypassing multi-factor auth (MFA)   │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

---

## 12. Complete Dashboard State Matrix

1. **`ALL_NORMAL`:** All sites LOW or MODERATE; zero escalations; 100% telemetry health.
2. **`ELEVATED_MONITORING`:** Multiple sites in MODERATE; preventive preparations active.
3. **`SEVERE_HEAT_WAVE`:** Multiple sites in HIGH/CRITICAL; high action volumes.
4. **`ACTIVE_ESCALATION_ALERT`:** One or more actions breached supervisor timers.
5. **`TELEMETRY_DEGRADED`:** External weather API outage affecting one or more regions.
6. **`SIMULATION_HARNESS_ACTIVE`:** Demonstration mode active with persistent banner.

---

## 13. Final Design Principle

> **The Safety Manager Dashboard provides complete enterprise visibility without operational clutter; it surfaces critical exceptions immediately, tracks accountability across distributed worksites, and enables instant drill-down from macro trends to field verification records.**
