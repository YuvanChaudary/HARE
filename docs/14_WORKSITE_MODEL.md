# Worksite Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the conceptual and data model for a **Worksite** within the Heat Action Response Engine.

In the operational architecture of this platform, a worksite is the foundational anchor to which all operational entities and workflows are attached:

* **Environmental Inputs:** Weather observations, humidity, solar exposure, and atmospheric forecasts.
* **Heat-Risk Assessments:** Deterministic evaluations calculating thermal indices and risk categories.
* **Contextual Factors:** Workload categories, physical shading, available hydration, and PPE ensembles.
* **Preventive Actions:** Site-tailored work-rest schedules, hydration targets, and control directives.
* **Personnel Assignment:** Primary front-line supervisors and responsible safety managers.
* **Notification Routing:** Target communication endpoints for active field alerts.
* **Acknowledgments:** Time-stamped operational receipts verifying supervisor awareness.
* **Escalations:** Automated alerting paths when directives remain unresolved.
* **Audit Records:** Permanent chronological event ledgers proving safety compliance.

Without a well-defined worksite model, environmental weather signals cannot be translated into coordinated, accountable workplace action.

---

## 2. Worksite Definition

> **A worksite is a configured physical or operational location where heat-exposed work may occur and where the system evaluates environmental conditions and coordinates preventive actions.**

### Key Distinctions
To maintain strict architectural boundaries, a worksite is explicitly defined by what it is **not**:
* **A worksite is not a worker:** It does not represent an individual person, employee record, or medical patient.
* **A worksite is not a weather station:** It represents a geographical point of human activity whose environmental parameters are derived from meteorological providers (e.g., Open-Meteo API grid forecasts).
* **A worksite is not an IoT hardware device:** The MVP does not require or depend upon on-site physical sensors, microcontrollers, or wearable monitors.
* **Future Extension:** Future versions may optionally link on-site physical sensors, microclimate monitors, or digital twins to a worksite profile, but the core MVP operates effectively as a software-first system.

---

## 3. Worksite Lifecycle

A worksite transitions through four distinct lifecycle states:

```text
       ┌──────────┐
       │  DRAFT   │
       └────┬─────┘
            │ (Validate & Activate)
            ▼
       ┌──────────┐   (Pause)   ┌──────────┐
       │  ACTIVE  │ ──────────> │  PAUSED  │
       │          │ <────────── │          │
       └────┬─────┘   (Resume)  └────┬─────┘
            │                        │
            │ (Decommission)         │ (Decommission)
            ▼                        ▼
       ┌───────────────────────────────────┐
       │             ARCHIVED              │
       └───────────────────────────────────┘
```

### Lifecycle States
1. **`DRAFT`:**
   * Newly created profile undergoing initial configuration.
   * Worksite coordinates, operational context, and supervisor assignments are being entered.
   * *Allowed Operations:* Editing all attributes, deletion, validation.
   * *Safety Constraint:* Inactive in automated weather polling; cannot generate active actions or trigger escalations.
2. **`ACTIVE`:**
   * Fully configured and validated operational worksite participating in live safety workflows.
   * *Allowed Operations:* Scheduled weather polling, deterministic risk evaluations, automated action generation, supervisor assignment, notification dispatch, escalation timers, and audit logging.
   * *State Requirement:* Must possess valid geographic coordinates and an active assigned supervisor.
3. **`PAUSED`:**
   * Temporarily suspended operational site (e.g., weekend shutdown, seasonal project pause, scheduled maintenance).
   * *Allowed Operations:* Editing context attributes, reactivating to `ACTIVE`, decommissioning to `ARCHIVED`.
   * *Safety Constraint:* Automated weather polling and action generation are suspended; open pending actions must be resolved before entering paused state.
4. **`ARCHIVED`:**
   * Decommissioned or completed worksite retained strictly for regulatory compliance and historical audit review.
   * *Allowed Operations:* Read-only inspection of historical audit trails and completed actions.
   * *Safety Constraint:* Permanently barred from participating in active workflows; cannot be reactivated directly (must be cloned into a new profile if work resumes).

---

## 4. Core Worksite Attributes

The conceptual worksite schema captures essential spatial, organizational, and operational attributes:

| Conceptual Field | Purpose & Description |
| :--- | :--- |
| `worksite_id` | Unique, immutable system identifier (e.g., UUID) distinguishing this location. |
| `organization_id` | Foreign identifier linking the worksite to the parent enterprise tenant. |
| `name` | Human-readable operational site name (e.g., "North Bengaluru Viaduct Pier 42"). |
| `description` | Narrative description of physical scope, contract package, or site layout. |
| `status` | Current lifecycle state (`DRAFT`, `ACTIVE`, `PAUSED`, `ARCHIVED`). |
| `latitude` | Geographic coordinate in decimal degrees (-90.000000 to +90.000000). |
| `longitude` | Geographic coordinate in decimal degrees (-180.000000 to +180.000000). |
| `timezone` | IANA timezone string (e.g., `Asia/Kolkata`, `America/New_York`) for accurate shift calculations. |
| `address_description` | Physical street address, landmark description, or municipal sector notes. |
| `worksite_type` | Controlled vocabulary classification identifying operational domain (e.g., `CONSTRUCTION`). |
| `primary_supervisor_id` | User ID of the designated front-line supervisor accountable for receiving site directives. |
| `safety_manager_id` | User ID of the lead safety manager responsible for cross-site oversight and escalations. |
| `operating_schedule` | Configured active shift hours, operating days, and scheduled rest intervals. |
| `created_at` | UTC timestamp of initial worksite record creation. |
| `updated_at` | UTC timestamp of the most recent profile modification. |

---

## 5. Worksite Type

The worksite model utilizes a standardized controlled vocabulary to categorize operational environments. This classification informs baseline contextual risk modifiers:

* **`CONSTRUCTION`:** Commercial, residential, or heavy civil building sites characterized by open-air structures, unshaded scaffolding, and variable heavy equipment.
* **`ROAD_WORK`:** Linear infrastructure, asphalt laying, and paving characterized by direct solar radiation and extreme thermal reflection from hot asphalt surfaces.
* **`AGRICULTURE`:** Open field harvesting, planting, or greenhouse operations with long continuous outdoor exposure and variable tree canopy shade.
* **`WAREHOUSE`:** Enclosed or semi-enclosed unconditioned logistics facilities with high ceilings, large metal roofing, and poor mechanical air circulation.
* **`MANUFACTURING`:** Heavy industrial or fabrication yards combining ambient heat with process-generated heat sources (welding, foundries, stamping).
* **`INFRASTRUCTURE`:** Public transit, bridge building, tunneling, utilities, and rail expansion projects.
* **`OUTDOOR_EVENT`:** Temporary staging, security, and crowd coordination in open arenas or public parks.
* **`OTHER`:** Specialized commercial activities with customizable operational context.

*Note:* This controlled vocabulary is designed to evolve gracefully as new occupational domains are onboarded.

---

## 6. Geographic Model

Location is the primary spatial index linking the worksite to meteorological data sources:

```text
  Latitude / Longitude Coordinates
  (e.g., 13.0827° N, 77.5877° E)
                 │
                 ▼
  Meteorological Provider Query
  (Open-Meteo API Grid Lookup)
                 │
                 ▼
  Environmental Snapshot
  (Ambient Temp, Relative Humidity, Solar Radiation, Wind Speed)
```

### Spatial Requirements
1. **Coordinate Precision:** Coordinates are stored in standard decimal degrees with at least six decimal places, providing sub-meter geographic resolution.
2. **Weather Grid Mapping:** Meteorological providers return forecast and observational data based on regional grid points closest to the provided coordinates.
3. **No Worker Geolocation:** The geographic model locates the *job site*, not the real-time GPS coordinates of individual workers. Individual worker tracking is explicitly prohibited.

---

## 7. Worksite Context

Worksite context represents the physical, operational, and structural conditions that modify how ambient environmental heat impacts human physiological strain:

* **Work Type:** Specific physical trades operating at the site (e.g., rebar tying, concrete finishing, earthmoving).
* **Workload Category:** Metabolic intensity classification (`LIGHT`, `MODERATE`, `HEAVY`, `VERY_HEAVY`).
* **Exposure Type:** Physical shelter classification (Full Direct Sunlight, Partial Tree/Awning Shade, Enclosed Unconditioned).
* **Shade Availability:** On-site availability of deployable canopies, air-conditioned trailers, or shaded rest shelters within a 2-minute walking radius.
* **Hydration Availability:** Proximity and volume of chilled potable water stations and electrolyte supplies.
* **Cooling Assets:** Presence of active cooling controls (e.g., misting fans, evaporative cooling stations).
* **PPE / Clothing Ensemble:** Required protective apparel (standard breathable cotton, heavy flame-retardant coveralls, impermeable chemical gear).
* **Surface Thermal Attributes:** Radiant ground properties (heat-absorbing dark asphalt, reflective metal decking, bare soil).
* **Acclimatization Baseline:** General crew acclimatization status (e.g., newly mobilized crew vs. fully acclimatized mid-season crew).

> **Important Boundary:** Worksite context captures *operational characteristics*, not personal medical histories or individual physiological fitness. Precise mathematical weightings and threshold rules are defined in [20_HEAT_RISK_ENGINE.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/20_HEAT_RISK_ENGINE.md).

---

## 8. Worksite Operating Schedule

Thermal heat risk is profoundly dependent on the time of day and the duration of human exposure:

* **Operating Hours:** Defined start time and end time (e.g., `06:00` to `15:00`).
* **Operating Days:** Standard weekly schedule (e.g., Monday through Saturday).
* **Midday Peak Windows:** Highlighted periods of peak solar radiation (e.g., `12:00` to `15:30`) triggering heightened monitoring.
* **Timezone Normalization:** All internal calculations store timestamps in universal UTC, while operating schedules are evaluated relative to the worksite's declared local timezone (`Asia/Kolkata`).
* **Operational Value:** Ambient heat reaching 38°C at 23:00 has vastly different operational implications than 38°C during peak midday concrete pouring. Schedule context ensures the system prioritizes active working hours.

---

## 9. Worksite Responsibilities and Relationships

The worksite serves as the conceptual parent uniting administrative setup with runtime execution:

```text
Organization (Tenant)
    │
    ▼
 Worksite Profile
 ┌───┼───────────────────────────────────────────┐
 │   │                                           │
 ▼   ▼                                           ▼
Worksite Context                             Supervisor
(Workload, Sun, Shade)                     (Primary Owner)
 │                                               │
 ▼                                               ▼
Environmental Snapshot                     Notifications
(Weather & Forecast)                       (Dispatched Alerts)
 │                                               │
 ▼                                               ▼
Deterministic Risk Assessment              Acknowledgment
(Calculated Risk Tier)                     (Verified Receipt)
 │                                               │
 ▼                                               ▼
Preventive Action Plan                     Confirmation / Escalation
(Work-Rest, Hydration)                     (Physical Verification)
 └───────────────────────┬───────────────────────┘
                         ▼
               Immutable Audit Ledger
```

---

## 10. Supervisor Assignment

Every active worksite requires an explicit, authenticated human supervisor:

### Assignment Rules
1. **Mandatory Single Point of Ownership:** Every `ACTIVE` worksite must have a designated `primary_supervisor_id`. An active worksite cannot exist without an assigned supervisor.
2. **Direct Action Routing:** When the system generates a preventive action directive for a worksite, ownership automatically routes to the primary supervisor.
3. **Escalation Fallback:** If the primary supervisor does not respond within the policy deadline, the worksite’s associated `safety_manager_id` automatically receives the escalation alert.
4. **Auditable Reassignment:** If a supervisor is reassigned mid-project, the change is recorded in the audit trail. Unacknowledged actions transfer cleanly to the new supervisor without resetting compliance history.

---

## 11. Worksite-to-Weather Relationship

The relationship between a worksite and external weather data follows a strict ingestion pipeline:

```text
  Worksite Coordinates (Lat, Lon)
                 │
                 ▼
  Weather / Forecast Provider (e.g., Open-Meteo)
                 │
                 ▼
  Raw Meteorological Payload (Temp, Humidity, Wind, Radiation)
                 │
                 ▼
  Input Validation & Freshness Timestamp
                 │
                 ▼
  Persisted Environmental Snapshot (Linked to worksite_id)
```

### Architectural Principles
* **Provider Independence:** Open-Meteo serves as the default weather and forecast provider for the MVP. The worksite model abstracts provider calls so alternative APIs can be supported without changing core logic.
* **Timestamp & Source Tracking:** Every ingested weather observation records the exact UTC retrieval timestamp, provider identifier, and data freshness age.
* **No False Safety Signals:** If the weather provider fails or returns stale data (> 60 minutes), the worksite status is marked as `DATA_DEGRADED` or `WEATHER_UNAVAILABLE`. The system **never** silently defaults to zero degrees or assumes safe conditions.

---

## 12. Worksite-to-Risk Relationship

A worksite’s risk state is derived dynamically by evaluating environmental inputs against worksite context:

* **Associated Data:** Every risk assessment record references `worksite_id`, `observation_id`, evaluation timestamp, context snapshot, rule version, and calculated risk tier (`LOW`, `MODERATE`, `HIGH`, `EXTREME`).
* **Deterministic Reproducibility:** Given identical environmental inputs and worksite context, the engine produces identical risk scores every time.
* **Separation of Concerns:** This document defines the *relationship* between worksites and risk assessments. Exact calculation algorithms, formula definitions, and threshold numbers are defined in separate domain documents:
  * `docs/20_HEAT_RISK_ENGINE.md`
  * `docs/21_HEAT_RISK_FACTORS.md`
  * `docs/26_RISK_LEVELS.md`
  * `docs/27_RISK_RULES.md`

---

## 13. Worksite-to-Action Relationship

A worksite can generate multiple sequential action directives across an operational shift:

* **Action Directive Contents:**
  * `action_id`: Unique traceable identifier.
  * `worksite_id`: Target operational location.
  * `risk_assessment_id`: Originating risk event.
  * `action_type`: Operational category (e.g., `WORK_REST_CYCLE`, `HYDRATION_DEPLOYMENT`).
  * `priority`: Urgency level (`HIGH`, `CRITICAL`).
  * `owner_id`: Assigned supervisor user ID.
  * `status`: Lifecycle state (`PENDING`, `NOTIFIED`, `ACKNOWLEDGED`, `CONFIRMED`, `ESCALATED`, `RESOLVED`).
  * `due_at`: Policy deadline before escalation triggers.
* **Cardinality:** One worksite may possess many historical action records, but typically maintains at most one active `PENDING` or `ACKNOWLEDGED` action per work group at any given moment to prevent directive collision.

---

## 14. Worksite Status vs. Safety Workflow States

The worksite model strictly differentiates administrative worksite status from operational risk and response states:

```text
Worksite Administrative Status:  ACTIVE / PAUSED / ARCHIVED
Worksite Environmental Risk:     LOW / MODERATE / HIGH / EXTREME
Active Action Directive Status:  PENDING / ACKNOWLEDGED / CONFIRMED / RESOLVED
Escalation Status:               NORMAL / ESCALATED
```

These states represent orthogonal operational dimensions:
* An `ACTIVE` worksite may experience `LOW` risk (no action needed).
* An `ACTIVE` worksite under `EXTREME` risk may have an action that is `ACKNOWLEDGED` and `NORMAL` (under control).
* An `ACTIVE` worksite under `HIGH` risk may have an action that is `PENDING` and `ESCALATED` (supervisor missed deadline).

Collapsing these distinct states into a single status field is strictly prohibited in the system architecture.

---

## 15. Worksite Data Validation

To prevent runtime failures during critical weather events, worksite configuration must satisfy strict validation rules before transitioning to `ACTIVE`:

1. **Coordinates Validation:** Latitude must fall strictly between -90.0 and +90.0; longitude between -180.0 and +180.0. Non-numeric or null coordinates are rejected.
2. **Valid Timezone:** Timezone must be a recognized IANA identifier.
3. **Valid Supervisor:** `primary_supervisor_id` must resolve to an active user account with the `SUPERVISOR` role.
4. **Valid Safety Manager:** `safety_manager_id` must resolve to an active user with the `SAFETY_MANAGER` role.
5. **Operating Schedule Completeness:** Shift start time and end time must be defined with valid timestamps.
6. **Mandatory Context:** Workload category and exposure type cannot be null.

---

## 16. Worksite Failure and Edge Cases

| Failure / Edge Case | System Behavior | User Visibility | Safety Implication | Recovery Path |
| :--- | :--- | :--- | :--- | :--- |
| **Missing Coordinates** | Rejects worksite activation; retains profile in `DRAFT` | Form error displayed in Admin Console | Prevents weather lookup failures | Admin inputs valid GPS coordinates |
| **Invalid Coordinates** | API returns geocoding boundary error | Field validation warning on screen | Prevents querying invalid ocean/polar grids | Admin corrects coordinate entries |
| **Unassigned Supervisor** | Blocks activation to `ACTIVE` state | Visual warning: "Supervisor Required" | Prevents orphaned directives without ownership | Admin assigns active supervisor |
| **Weather API Failure** | Marks worksite data as `UNAVAILABLE`; preserves last known state | Amber warning badge on Safety Manager view | Alerts management that automated assessment is offline | System retries; Manager conducts manual review |
| **Stale Weather Data (>60m)** | Flags data as `STALE`; suppresses automated new actions | Yellow warning label next to temperature | Informs users that data may not reflect rapid heat waves | System executes on-demand polling refresh |
| **Duplicate Worksite Profile** | Database enforces unique name within organization | Prompt: "Worksite with this name already exists" | Prevents confusing split assignments | Admin updates name or archives duplicate |
| **Supervisor Deactivated** | Flags worksite as `SUPERVISOR_UNASSIGNED`; alerts Safety Manager | Red alert banner in Admin and Safety Console | Unassigned actions route temporarily to Safety Manager | Admin reassigns active replacement supervisor |
| **Timezone Mismatch** | Validates timezone string against global registry | Rejects invalid strings with dropdown prompt | Prevents evaluating night conditions as daytime | User selects valid IANA timezone |

---

## 17. MVP vs. Future Worksite Model

| Worksite Capability | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **Worksite Registration & GPS** | Yes (Manual entry & address lookup) | Automated geofencing & boundary mapping |
| **Weather Ingestion** | Yes (Regional grid weather via Open-Meteo) | Multi-provider ensemble & high-res radar |
| **Worksite Context Profile** | Yes (Core workload, exposure, shade, water) | Dynamic microclimate & seasonal profiles |
| **Supervisor Assignment** | Yes (Single primary supervisor per site) | Complex multi-tier supervisor hierarchies |
| **Worker Roster Association** | Limited (Anonymous crew size estimates) | Detailed crew rosters & voluntary check-ins |
| **On-Site IoT Hardware** | **No** (Software-first boundary) | On-site black-globe thermometer stations |
| **Wearable Physiological Sensors**| **No** (Software-first boundary) | Optional biometric heat strain sensors |
| **Digital Twin & 3D Shading** | **No** (Software-first boundary) | 3D solar trajectory & shadow modeling |
| **Multi-Hazard Tracking** | **No** (Heat and humidity focus) | Air quality (PM2.5), wildfire smoke, lightning |

---

## 18. Canonical Demo Worksite

For hackathon demonstration and scenario validation, the following fictional worksite profile is established:

```text
Worksite Identity:
  worksite_id:           "ws-demo-blr-001" (Fictional UUID)
  name:                  "North Bengaluru Construction Site"
  description:           "Elevated Viaduct Package 4 — Pier 42 Casting Yard"
  status:                ACTIVE
  worksite_type:         CONSTRUCTION

Geographic Parameters:
  latitude:              13.082700
  longitude:             77.587700
  timezone:              "Asia/Kolkata"
  address_description:   "Hebbal Outer Ring Road Junction, Bengaluru, Karnataka, India"

Contextual Attributes:
  work_type:             "Heavy Civil Concrete Casting"
  workload_category:     HEAVY
  exposure_type:         DIRECT_SUN
  shade_availability:    "Two 10x10m Canopy Shelters located 50m from casting beds"
  hydration_availability:"Two 50L chilled water dispensers with electrolyte powder"
  cooling_assets:        "One misting fan station at primary rest canopy"
  PPE_ensemble:          "Standard high-vis vest, hard hat, safety boots, breathable cotton"

Organizational Accountability:
  organization_name:     "Bengaluru Infrastructure Works (Fictional Demo Organization)"
  safety_manager_id:     "usr-mgr-ananya" (Ananya Rao)
  primary_supervisor_id: "usr-sup-rahul"  (Rahul Kumar)
```

---

## 19. Security and Privacy Considerations

1. **Role-Based Worksite Access:** Worksite operational profiles and configuration settings are enterprise data. Access is governed by RBAC: Admins configure, Safety Managers monitor cross-site, and Supervisors view their assigned sites.
2. **Worker Location Privacy:** The worksite model deliberately stores the physical coordinates of the *job site*, avoiding personal worker GPS tracking.
3. **Data Minimization:** The worksite context captures structural and environmental attributes without collecting private worker medical histories or personal identifiers.
4. **Audit Trail Integrity:** Modifications to coordinates, context attributes, or supervisor assignments are written to immutable audit ledgers to prevent unauthorized tampering.
5. **AI Prompt Sanitization:** When worksite context is sent to NVIDIA AI inference endpoints for plain-language summaries, company names and user credentials are sanitized.

---

## 20. Final Worksite Principle

> **A worksite is the central operational context that connects environmental conditions to risk assessment, preventive actions, accountable supervisors, response status, escalation, and audit history.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
