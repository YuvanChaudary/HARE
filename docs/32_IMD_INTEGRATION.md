# 32 IMD (India Meteorological Department) Integration Specification

## 1. Purpose

This document defines how information from the **India Meteorological Department (IMD)** conceptually integrates into the **Heat Action Response Engine**.

The primary objective of incorporating IMD data is to ground environmental monitoring in authoritative Indian meteorological context, official heat-wave classifications, and national weather advisories:

* **Authoritative National Context:** Providing official Indian meteorological forecasts, regional bulletins, and climate advisories.
* **Heat-Wave Information:** Ingesting official IMD heat-wave alerts, severe heat-wave declarations, and yellow/orange/red meteorological warning tiers.
* **Synoptic Consistency:** Calibrating global numerical weather prediction models against national observational analyses where accessible.

However, a strict jurisdictional boundary must be maintained:

```text
IMD METEOROLOGICAL INFORMATION
              ≠
COMPLETE WORKPLACE OCCUPATIONAL HEAT-RISK ASSESSMENT
```

IMD issues meteorological forecasts and civic weather warnings for geographical regions and general populations. It does not establish industrial workplace safety rules, evaluate microclimatic indoor/outdoor workloads, assess personal protective equipment (PPE) thermal burdens, or mandate worksite stop-work orders. Those operational and safety decisions remain the exclusive remit of the deterministic Heat Risk Engine, configured employer policies, and accountable worksite supervisors.

> [!WARNING]
> **Integration Verification Notice:**
> The exact machine-readable API contracts, endpoints, licensing conditions, and programmatic feed availability for IMD data remain:
> `PENDING_API_VERIFICATION`
> This document specifies architecture, ingestion modes, and governance rules without claiming or fabricating unverified technical endpoints.

---

## 2. Integration Modes

Because public-sector meteorological services provide information across diverse media, the system defines three conceptual integration modes:

### Mode A — Official Machine-Readable Ingestion (Automated API / Feed)
* **Description:** Direct programmatic consumption of an officially published, machine-readable API, JSON/XML feed, or real-time meteorological portal service provided or sanctioned by IMD.
* **Prerequisites:** Documented REST/API specification, authenticated API credentials (if required), verified rate limits, uptime SLAs, and explicit automated data redistribution rights.
* **Status:** `PENDING_API_VERIFICATION`

### Mode B — Official Published Data / Semi-Automated Ingestion
* **Description:** Ingestion of structured official IMD regional bulletins, daily weather reports, or heat-wave press releases published via official web portals. Data extraction is performed via approved ingestion adapters or administrative entry.
* **Prerequisites:** Verification of publication schedules, structured parsing reliability, attribution compliance, and non-disruptive access terms.
* **Status:** `PENDING_API_VERIFICATION`

### Mode C — Reference & Regulatory Guidance Source (Domain Rules)
* **Description:** Utilizing published IMD criteria (e.g., official meteorological definitions of heat wave and severe heat wave based on departure from normal maximum temperatures) as static or semi-static reference rules within the Heat Risk Engine, rather than live programmatic polling.
* **Status:** `AVAILABLE / DOCUMENTED IN DOMAIN REFERENCES`

### MVP Baseline Status
The baseline operational mode for IMD integration in the initial MVP release is:

```text
CURRENT MVP STATUS: TO BE CONFIRMED (PENDING_API_VERIFICATION)
```

Until Mode A or Mode B passes formal operational and licensing verification, the MVP relies on Open-Meteo for live numeric forecast ingestion, while utilizing IMD classification criteria conceptually within domain rules as referenced in [29_DOMAIN_REFERENCES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/29_DOMAIN_REFERENCES.md).

---

## 3. Source Hierarchy and Multi-Provider Coexistence

When both Open-Meteo and IMD data streams are active, they coexist within a structured multi-source ingestion pipeline:

```text
                 WEATHER SOURCES
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
    Open-Meteo                        IMD
(High-Frequency Numerical Forecast)  (Authoritative National Warnings)
         │                             │
         └──────────────┬──────────────┘
                        │
                        ▼
            SOURCE ADAPTERS & INGESTION
                        │
                        ▼
               NORMALIZATION LAYER
                        │
                        ▼
         VALIDATION & CONFLICT DETECTION
                        │
                        ▼
           CANONICAL WEATHER DATA MODEL
                        │
                        ▼
                HEAT RISK ENGINE
```

### Precedence Policy
The system does **not** assume that IMD automatically overrides Open-Meteo for every field, nor that Open-Meteo supersedes IMD. Source precedence is explicitly configured per data category:

1. **Continuous Numerical Forecasts (Hourly $T_a, RH$):** Open-Meteo serves as the default provider for continuous, multi-day hourly numeric curves unless high-resolution IMD city-level numerical APIs are verified.
2. **National / Regional Warnings & Heat-Wave Alerts:** IMD is designated as the primary authority. If IMD issues an official "Orange" or "Red" heat-wave warning for a worksite's district, this advisory status takes immediate precedence in informing baseline site readiness.
3. **Physical Microclimate:** Neither provider supersedes local physical reality. Future on-site sensor telemetry will take precedence over both macroscopic external models.

---

## 4. IMD Data Categories

The architecture categorizes potential IMD inputs into distinct functional groupings:

| Category | Description | Data Format / Type | Verification Status |
| :--- | :--- | :--- | :--- |
| **City/District Forecasts** | 7-day outlook of minimum/maximum temperatures and general conditions | Tabular / Text | `PENDING_API_VERIFICATION` |
| **Heat-Wave Advisories** | Official declarations of Heat Wave (HW) or Severe Heat Wave (SHW) | Categorical / Warning Tier | `PENDING_API_VERIFICATION` |
| **Color-Coded Bulletins** | Green (Normal), Yellow (Watch), Orange (Alert), Red (Warning) | Color Tier / Geo-Region | `PENDING_API_VERIFICATION` |
| **Nowcast Bulletins** | Severe weather warnings for immediate 3–6 hour windows | Text / Geo-Polygon | `PENDING_API_VERIFICATION` |
| **Observational Stations** | Actual physical readings from IMD airport/synoptic weather stations | Point Station Reports | `PENDING_API_VERIFICATION` |

---

## 5. Source Provenance and Lineage

All records derived from IMD publications, bulletins, or feeds must capture rigorous provenance metadata:

```yaml
provenance:
  source_id: "IMD-NATIONAL"
  provider: "INDIA_METEOROLOGICAL_DEPARTMENT"
  source_type: "OFFICIAL_NATIONAL_MET_SERVICE"
  feed_identifier: "PENDING_API_VERIFICATION"
  document_reference: "BULLETIN-BENGALURU-URBAN-20261007-01"
  retrieval_timestamp: "2026-10-07T08:30:00Z"
  effective_start: "2026-10-07T00:00:00Z"
  effective_end: "2026-10-07T23:59:59Z"
  geographic_scope:
    country: "IND"
    state: "Karnataka"
    district: "Bengaluru Urban"
  category: "HEAT_WAVE_ADVISORY"
  validation_status: "VALID"
```

This provenance payload guarantees that downstream risk outputs and supervisory actions can be audited directly back to official government releases.

---

## 6. Advisory vs. Raw Meteorological Data

A critical architectural distinction is enforced between numeric atmospheric values and governmental advisories:

```text
NUMERICAL WEATHER DATA (Continuous Scalar Metrics)
  - Ambient Temperature: 38.5 °C
  - Relative Humidity: 42%
  - Wind Speed: 12 km/h

               vs.

OFFICIAL GOVERNMENT ADVISORY (Contextual Categorical Domain Assessment)
  - Color Code: ORANGE (Alert / Prepare)
  - Phenomenon: SEVERE HEAT WAVE CONDITIONS LIKELY
  - Advisory Text: "High temperature with high humidity will result in discomfort..."
```

### Architectural Guardrails
* **No Reduction to Scalar Values:** An IMD "Red Warning" cannot simply be coerced into an arbitrary ambient temperature. It represents a macroscopic civic alert.
* **Dual-Track Input:** The canonical Weather Data Model maintains separate structures for continuous numerical time-series (`NumericalWeatherPoint`) and qualitative civic alerts (`OfficialWeatherAdvisory`).
* **Preservation of Warning Semantics:** Downstream rules consume the official warning tier directly to adjust baseline supervisory vigilance and escalation timeouts.

---

## 7. Integration with the Heat Risk Engine

When ingested, IMD data feeds directly into deterministic domain rules without altering the core risk evaluation algorithm:

```text
IMD Advisory / Data
         │
         ▼
Validation & Schema Check
         │
         ▼
Normalization & Provenance Tagging
         │
         ▼
Heat Risk Engine (Rule Evaluation)
  - Evaluates site workload + worker exposure
  - Cross-references IMD heat-wave warning tier
  - Triggers mandatory compliance actions if mandated by domain rules
         │
         ▼
Action Engine (Generates Assigned, Traceable Actions)
```

As specified in [27_RISK_RULES.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/27_RISK_RULES.md), external advisories serve as environmental risk multipliers. They do not bypass human supervision or replace localized workload assessments.

---

## 8. Multi-Source Conflict Handling

Discrepancies between global numerical models (e.g., Open-Meteo) and national meteorological forecasts (e.g., IMD) can occur due to differing model physics, spatial resolutions, or update schedules:

```text
Scenario:
  Open-Meteo Model Forecast : Max Temp 37.0 °C (No Heat Wave)
  IMD District Advisory     : ORANGE ALERT - Severe Heat Wave (Expected Max Temp 40.0 °C)
```

### Conflict Resolution Policy
1. **No Silent Overwrites:** The system must never silently discard or reconcile conflicting data points behind an opaque averaging heuristic.
2. **Data Quality Flagging:** When source outputs deviate beyond configured divergence tolerances (e.g., $\Delta T > 3.0^\circ\text{C}$ or conflicting alert levels), the record state is flagged as `CONFLICTING`.
3. **Conservative Safety Default:** In safety-critical contexts, conflicting data triggers the more protective operational posture (precautionary escalation) while alerting site supervisors to the discrepancy.
4. **Transparent Dashboard Visibility:** The operational dashboard displays both provider perspectives with clear source attribution, enabling human managers to make informed decisions.

---

## 9. Official Source Verification Checklist

Before activating automated live ingestion of any IMD data feed into production, the following verification checklist must be fully completed and audited:

| Item | Verification Question | MVP Status |
| :--- | :--- | :--- |
| **V-01** | Is the endpoint or feed hosted directly on an official Government of India domain (`.gov.in` / `.nic.in`)? | `PENDING_VERIFICATION` |
| **V-02** | Is programmatic, machine-readable API access officially sanctioned and documented? | `PENDING_VERIFICATION` |
| **V-03** | What are the contractual terms, rate limits, and authentication protocols (API keys, IP whitelisting)? | `PENDING_VERIFICATION` |
| **V-04** | What data licensing, redistribution, and legal attribution notices are required? | `PENDING_VERIFICATION` |
| **V-05** | What is the guaranteed update cadence, latency, and publication schedule of the data feed? | `PENDING_VERIFICATION` |
| **V-06** | What is the granular geographic coverage (pin-code, district, meteorological subdivision)? | `PENDING_VERIFICATION` |
| **V-07** | Are machine-readable error schemas and service health monitoring endpoints available? | `PENDING_VERIFICATION` |
| **V-08** | Is there historical archiving available for post-incident regulatory audits? | `PENDING_VERIFICATION` |

Items remaining `PENDING_VERIFICATION` must be resolved by engineering and compliance teams before transition to automated Mode A ingestion.

---

## 10. India-Specific Operational Context

The Heat Action Response Engine is architected to address extreme heat challenges across Indian industrial, construction, and logistics environments. In this operational context:

* **Regional Climate Variations:** Indian climatic zones range from arid desert heat (Northwest) to coastal tropical humidity (Peninsula). IMD definitions account for regional normal temperatures (e.g., heat wave criteria for plains require maximum temperature $\ge 40^\circ\text{C}$, while coastal stations require $\ge 37^\circ\text{C}$).
* **Civic Action Plans (NDMA / HAP):** Indian municipalities increasingly implement Heat Action Plans (HAP) tied directly to IMD warning colors. Incorporating IMD context ensures alignment between worksite internal responses and broader municipal civil defense directives.
* **Realistic Boundary:** The engine does not claim universal coverage of all remote rural Indian locations, nor does it guarantee access to real-time physical telemetry without dedicated local sensors.

---

## 11. Illustrative Worksites Integration Example

The following scenario illustrates conceptual multi-source binding for an Indian construction facility:

```yaml
worksite_profile:
  worksite_id: "WS-BLR-NORTH-04"
  name: "North Bengaluru Construction Site"
  location:
    district: "Bengaluru Urban"
    state: "Karnataka"
    timezone: "Asia/Kolkata"
  environmental_data_sources:
    numerical_continuous:
      provider: "OPEN_METEO"
      role: "Hourly numerical temperature and humidity curve"
      status: "ACTIVE_MVP"
    official_advisory:
      provider: "IMD"
      role: "District-level heat-wave warning and civic alert tracking"
      status: "PENDING_API_VERIFICATION (Configured for Manual / Reference Mode)"
  safety_governance:
    risk_decision_authority: "Deterministic Heat Risk Engine"
    human_in_the_loop: "Site Safety Supervisor (Assigned Responsible Role)"
    policy_reference: "National Heat Action Plan Guidelines & OSHA Heat Reference Rules"
```

*(Note: Data and configuration values are illustrative for operational design.)*

---

## 12. Future Unified Architecture

As the system evolves toward physical edge integration, the ingestion pipeline seamlessly accommodates local IoT sensors alongside IMD and Open-Meteo:

```text
                         WEATHER SOURCES
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
   Open-Meteo                  IMD                Local Sensors
(Global Models)        (National Authority)       (Physical Site)
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                         SOURCE ADAPTERS
                                │
                                ▼
                       NORMALIZATION LAYER
                                │
                                ▼
                   VALIDATION & CONFLICT ENGINE
                                │
                                ▼
                   CANONICAL WEATHER DATA MODEL
                                │
                                ▼
                        HEAT RISK ENGINE
```

---

## 13. Design Principle

> **IMD can strengthen India-specific meteorological context, but source authority must be preserved separately from occupational safety decision authority.**
