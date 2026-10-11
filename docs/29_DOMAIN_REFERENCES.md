# Domain References & Governance — Heat Action Response Engine MVP

## 1. Purpose

This document establishes the authoritative **Domain Reference Registry and Governance Model** for the **Heat Action Response Engine**.

A foundational architectural commitment of this project is that **safety thresholds, risk rules, and preventive protocols must never be invented or hallucinated**. To maintain absolute legal, scientific, and operational defensibility, every deterministic rule, baseline indicator, work-rest ratio, and acclimatization guideline configured within the platform must be directly traceable to verified, recognized occupational safety standards, meteorological authorities, or peer-reviewed scientific literature.

```text
       AUTHORITATIVE EXTERNAL SOURCES
(OSHA, NIOSH, IMD, NOAA, ISO, WHO, Peer-Reviewed Science)
                         │
                         ▼
             DOMAIN REFERENCE REGISTRY
         (Documented in this Specification)
                         │
                         ▼
        THRESHOLD MAPPING & VERIFICATION
                         │
                         ▼
       CONFIGURATION-DRIVEN RULE MATRICES
             (Versioned & Auditable)
                         │
                         ▼
        DETERMINISTIC HEAT RISK ENGINE
```

Where a specific operational threshold is pending formal validation by organizational safety leadership, the system explicitly marks it as `PENDING_VERIFICATION` or `SOURCE_REQUIRED` rather than fabricating arbitrary numbers.

---

## 2. Evidence Hierarchy & Classification Policy

When selecting sources to inform operational safety rules, the system enforces a strict seven-tier **Authority Level Hierarchy**:

```text
TIER 1: APPLICABLE STATUTORY & REGULATORY REQUIREMENTS
        Binding legal standards within target jurisdiction (e.g., OSHA General Duty Clause, state heat standards).
                         │
                         ▼
TIER 2: AUTHORITATIVE GOVERNMENT & PUBLIC HEALTH GUIDANCE
        National meteorological & safety agency guidance (e.g., IMD Heat Action Plans, NIOSH Criteria).
                         │
                         ▼
TIER 3: RECOGNIZED OCCUPATIONAL HYGIENE STANDARDS
        Consensus technical standards (e.g., ISO 7243, ISO 8996, ACGIH TLVs).
                         │
                         ▼
TIER 4: PEER-REVIEWED SCIENTIFIC & MEDICAL LITERATURE
        Published empirical research on biometeorology and human thermal physiology.
                         │
                         ▼
TIER 5: METEOROLOGICAL SOURCE DOCUMENTATION
        Algorithm specifications from meteorological agencies (e.g., NOAA/NWS Heat Index formulations).
                         │
                         ▼
TIER 6: SECONDARY TECHNICAL & INDUSTRY GUIDELINES
        Construction association best practices and trade-specific safety advisories.
                         │
                         ▼
TIER 7: ILLUSTRATIVE DEMONSTRATION VALUES
        Synthetic demo thresholds used strictly for hackathon testing (Never deployed in production).
```

### Evidence Classification Codes
Every domain assertion or rule threshold in the system is labeled with an explicit evidence status:
* **`VERIFIED`:** Citation formally validated against primary source documentation.
* **`SOURCE_REQUIRED`:** Operational rule requires formal domain reference before production activation.
* **`PENDING_VERIFICATION`:** Source identified but awaiting formal occupational safety review.
* **`ASSUMPTION`:** Engineering baseline parameter documented explicitly for pilot testing.
* **`ILLUSTRATIVE`:** Synthetic parameter configured solely for hackathon sandbox demonstration.

---

## 3. Authoritative Domain Reference Registry

The following registry documents primary domain sources informing the Heat Action Response Engine:

| Reference ID | Organization / Author | Document / Standard Name | Jurisdiction | Version / Date | Applied System Domain | Authority Level | Verification Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`REF-NIOSH-2016`** | National Institute for Occupational Safety and Health (NIOSH) | *Criteria for a Recommended Standard: Occupational Exposure to Heat and Hot Environments* (DHHS/NIOSH Pub No. 2016-106) | United States / International | 2016 | Workload metabolism, acclimatization protocols ("Rule of 20%"), hydration guidelines | `GOVERNMENT_GUIDANCE` | `VERIFIED` |
| **`REF-OSHA-NEP`** | Occupational Safety and Health Administration (OSHA) | *National Emphasis Program – Outdoor and Indoor Heat-Related Hazards* (CPL 03-00-024) | United States | April 2022 | Action thresholds, shade requirements, mandatory water access | `REGULATORY` | `VERIFIED` |
| **`REF-IMD-HAP`** | India Meteorological Department (IMD) / NDMA | *National Disaster Management Guidelines for Preparation of Action Plan – Prevention and Management of Heat Wave* | India | 2019 / Annual Updates | Regional heat wave criteria, meteorological color codes, public health advisories | `GOVERNMENT_GUIDANCE` | `VERIFIED` |
| **`REF-NOAA-NWS`** | National Oceanic and Atmospheric Administration (NOAA / NWS) | *The Heat Index Equation* (Technical Attachment SR 90-23 by Rothfusz) | United States / Global | 1990 | Mathematical formulation of Heat Index combining temperature and relative humidity | `METEOROLOGICAL_SOURCE` | `VERIFIED` |
| **`REF-STEADMAN-1979`**| Robert G. Steadman | *The Assessment of Sultriness. Part I: A Temperature-Humidity Index Based on Human Physiology and Clothing Science* (J. Appl. Meteor.) | International (Academic) | July 1979 | Biometeorological foundations, apparent temperature, and clothing insulation | `SCIENTIFIC_LITERATURE` | `VERIFIED` |
| **`REF-ISO-7243`** | International Organization for Standardization (ISO) | *ISO 7243:2017 — Ergonomics of the thermal environment — Assessment of heat stress using the WBGT index* | International | 2017 | Reference criteria for Wet-Bulb Globe Temperature, reference limits for work-rest | `PROFESSIONAL_GUIDANCE` | `VERIFIED` |
| **`REF-ISO-8996`** | International Organization for Standardization (ISO) | *ISO 8996:2021 — Ergonomics of the thermal environment — Determination of metabolic rate* | International | 2021 | Classification of workload categories (Light, Moderate, Heavy, Very Heavy metabolic wattages) | `PROFESSIONAL_GUIDANCE` | `VERIFIED` |
| **`REF-WHO-WMO-2015`**| World Health Organization (WHO) / WMO | *Heatwaves and Health: Guidance on Warning-System Development* | Global | 2015 | Multi-hazard warning communication, vulnerable population adaptation | `GOVERNMENT_GUIDANCE` | `VERIFIED` |
| **`REF-ILO-2019`** | International Labour Organization (ILO) | *Working on a warmer planet: The impact of heat stress on labour productivity and decent work* | Global | 2019 | Macro-economic labor disruption, outdoor worker protection strategies | `GOVERNMENT_GUIDANCE` | `VERIFIED` |

---

## 4. Production Threshold Registry Structure

To ensure complete transparency, every production rule threshold must map to an explicit entry in the system's **Threshold Registry**:

```text
Conceptual Schema:
{
  "threshold_id":     "TH-HI-HIGH-01",
  "rule_id":          "R01_ENV_THRESHOLD_HIGH",
  "source_reference": "REF-OSHA-NEP",
  "source_version":   "CPL 03-00-024 (2022)",
  "jurisdiction":     "US_FEDERAL_AND_GLOBAL_REFERENCE",
  "metric_name":      "calculated_heat_index",
  "unit":             "celsius",
  "threshold_value":  "CONFIGURATION_DRIVEN_PENDING_CLIENT_POLICY",
  "operational_tier": "HIGH_RISK",
  "effective_date":   "2026-10-07",
  "review_status":    "VERIFIED_MAPPING_PENDING_TENANT_CONFIG"
}
```

### Strict Policy Statement:
> **Threshold values are pending authoritative domain-source selection and tenant-specific validation and must not be invented for production use.**

For the hackathon demonstration, the platform uses a **configuration-driven rules framework** that loads explicit demonstration values clearly labeled as such, rather than hard-coding unsupported safety assertions into application code.

---

## 5. Domain Change Management & Governance Protocol

When new occupational safety legislation is enacted, medical consensus updates, or meteorological standards evolve, the system enforces a strict six-stage governance protocol:

```text
STAGE 1: DOMAIN INTELLIGENCE REVIEW
         Safety Professional reviews updated external publication (e.g., new OSHA heat standard).
                       ↓
STAGE 2: IMPACT & RULE MAPPING ANALYSIS
         Identify which specific rule IDs (`R01`–`R06`) and thresholds are affected.
                       ↓
STAGE 3: FORMAL VERSIONED SPECIFICATION UPDATE
         Draft updated rule matrices; increment semantic version (e.g., `v1.2.0` → `v1.3.0`).
                       ↓
STAGE 4: HISTORICAL REGRESSION TESTING
         Execute test suite against historical weather datasets to evaluate false-positive/negative rates.
                       ↓
STAGE 5: CLIENT SAFETY COMMITTEE APPROVAL
         Tenant Safety Managers review and formally authorize the updated rule configuration.
                       ↓
STAGE 6: AUDITED PRODUCTION DEPLOYMENT
         Deploy updated rule matrix with UTC effective timestamp; previous rule version archived in audit ledger.
```

---

## 6. Strict AI Isolation Policy

Artificial intelligence models (such as NVIDIA NIM or LLM microservices) have **zero authority** over domain references or threshold rules:

* **No Automated Policy Editing:** AI models are strictly blocked from editing, suggesting, or overriding entries in the Domain Reference Registry.
* **No Uncited Assertions:** When generating explanations or toolbox briefings, the AI layer must reference only the facts, rules, and reason codes deterministically supplied in the execution context prompt.
* **No Hallucinated Citations:** The AI assistant is forbidden from creating synthetic regulatory statutes or inventing non-existent safety standards.

---

## 7. Domain Governance Principle

> **Safety-sensitive rules must remain traceable to authoritative sources, reviewed when guidance changes, versioned, tested, and never silently modified by artificial intelligence. The integrity of the Heat Action Response Engine rests entirely on the verifiable truth of its domain foundation.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
