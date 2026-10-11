# Exposure Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the **Exposure Model** within the **Heat Action Response Engine**.

Environmental heat does not affect workers instantaneously. Physiological heat strain is fundamentally cumulative: the severity of heat stress depends directly on **how long**, **at what time of day**, and **under what physical shielding conditions** workers are exposed to environmental and radiant thermal loads.

The Exposure Model operationalizes physical exposure dimensions, allowing the Heat Risk Engine to evaluate whether environmental heat conditions coincide with vulnerable operational exposure windows.

```text
       AMBIENT WEATHER
 (39°C Temp | 60% Humidity)
             +
      EXPOSURE CONTEXT
 (Direct Sun | Unshaded Deck)
             +
      EXPOSURE DURATION
  (4 Hours Continuous Labor)
             │
             ▼
CUMULATIVE THERMAL STRAIN ACCELERATOR
             │
             ▼
CONTEXTUAL HIGH RISK TRIGGER
```

### Critical Operational Boundary
The Exposure Model is an **operational context classifier**. It represents physical site conditions and scheduling parameters. It is **not** a personal dosimetry monitor, individual physiological thermal strain index, or medical diagnostic tool.

---

## 2. Core Exposure Dimensions

The model organizes physical exposure across ten operational dimensions:

1. **Physical Shielding:** Outdoor unshaded, outdoor covered/scaffolded, semi-enclosed unconditioned, or enclosed mechanical room.
2. **Solar Radiation Direction:** Direct unhindered solar beam vs. diffuse/cloud-attenuated radiation.
3. **Radiant Ground Reflection:** Dark asphalt paving, reflective structural metal decking, hot concrete viaducts, or natural vegetation/soil.
4. **Exposure Duration:** Cumulative hours of physical presence in the hot environment during the shift.
5. **Continuous vs. Intermittent Exposure:** Long uninterrupted work stretches vs. scheduled micro-rotations into shaded rest shelters.
6. **Time-of-Day Exposure Window:** Early morning exposure (06:00–10:00) vs. acute solar peak hours (12:00–15:30).
7. **Recovery Opportunities:** Availability and accessibility of thermal recovery zones between work bouts.
8. **Hydration Infrastructure Access:** Walking travel time from the active work face to potable chilled drinking water.
9. **Active Cooling Infrastructure:** Presence of mechanical misting fans, evaporative chillers, or air-conditioned break trailers.
10. **Protective Clothing / PPE Ensembles:** Chemical suits, heavy leather welding gear, or flame-retardant coveralls that trap heat and humidity against the body.

---

## 3. Exposure Categories

To support automated rule evaluations without overwhelming front-line users, the system defines four operational exposure categories:

| Exposure Category | Physical Workplace Definition | Typical Operational Scenarios | Action Engine Implication |
| :--- | :--- | :--- | :--- |
| **`LOW`** | Substantially shielded from direct sun; continuous airflow; hydration $< 1$ min walk | Indoor shaded warehouse with ventilation; equipment operation in conditioned cabs | Standard advisory monitoring; routine hydration breaks |
| **`MODERATE`** | Intermittent outdoor exposure; partial overhead scaffolding shade; nearby water | Exterior framing with temporary overhead netting; utility trenching in morning hours | Structured work-rest rotations; mandatory hourly water intervals |
| **`HIGH`** | Unshaded open terrain; direct solar radiation; radiant ground heat; strenuous tasks | Structural bridge concrete placement; asphalt road paving; open field pipeline assembly | Accelerated work-rest cycles (e.g., 45/15 or 30/30); dedicated shade shelters |
| **`UNKNOWN`** | Physical worksite shelter and solar conditions unverified | Newly registered site; unconfigured shift parameters | Conservative baseline; prompts supervisor to verify site exposure |

*Note: These categories are system-context classifications and must not be represented as universal medical thresholds.*

---

## 4. Exposure Duration Dynamics

The physiological impact of heat exposure changes dramatically as time elapses:

```text
Short Exposure (< 1 hour):
• Body absorbs initial heat; sweat mechanisms activate.
• Cardiovascular system manages strain if hydration is adequate.
                │
                ▼
Continuous Moderate Exposure (1–3 hours):
• Cumulative sweat loss begins to deplete fluid and electrolytes.
• Core body temperature rises if internal metabolic heat exceeds dissipation.
                │
                ▼
Extended Shift Exposure (> 4 hours continuous):
• Cardiovascular fatigue accumulates; sweat rate may decline if dehydrated.
• Risk of acute thermal exhaustion accelerates significantly without recovery breaks.
```

### Operational Rule Impact:
An ambient temperature that is manageable during a 45-minute morning task becomes dangerous when sustained continuously across a 5-hour unshaded afternoon pour. The Exposure Model allows risk rules to treat sustained exposure duration as an operational risk amplifier.

---

## 5. The Environmental-Workload-Exposure Triad

A central tenet of the Heat Action Response Engine is that single-variable safety models fail. The platform evaluates the triad of risk drivers:

$$\text{Operational Risk} = f(\text{Environmental Heat}, \text{Workload Intensity}, \text{Exposure Context})$$

```text
┌─────────────────────────────────┐
│     ENVIRONMENTAL SIGNAL        │ (Ambient Heat Index: 38°C)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       WORKLOAD INTENSITY        │ (Heavy Manual Rebar Tying)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       EXPOSURE CONTEXT          │ (Direct Solar Radiation on Metal Decking)
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│     CONTEXTUAL RISK RESULT      │
│     HIGH OPERATIONAL RISK       │
└─────────────────────────────────┘
```

If any one of these dimensions is evaluated in isolation, safety management fails. By combining all three, the system produces actionable, defensible preventive directives.

---

## 6. Dynamic Exposure Transitions During Shifts

Physical exposure rarely remains static across an 8-hour shift. Solar angles shift, cloud cover changes, and crews move between work faces:

```text
07:00 – 10:30: Ground Excavation (Exposure: MODERATE — Morning shade from adjacent structure)
10:30 – 13:30: Elevated Bridge Decking (Exposure: HIGH — Unshaded direct solar radiation on steel)
13:30 – 15:30: Prefabrication Yard (Exposure: MODERATE — Work under deployable canopy shelters)
```

### System Reassessment Capability:
When a supervisor updates the exposure context in the Supervisor Action Center:
* The system records the transition timestamp and user ID.
* The Heat Risk Engine executes an immediate on-demand re-evaluation.
* Active directives update dynamically (e.g., transitioning from standard monitoring to mandatory 45/15 canopy rest rotations as crews move onto unshaded elevated decks).

---

## 7. Relationship to Preventive Action Generation

The exposure category directly shapes the specific physical controls generated by the Action Engine:

* **High Solar Exposure:** Automatically mandates physical shade canopy deployment and specifies that scheduled rest breaks must occur within shaded or cooled shelters.
* **Continuous Exposure ($> 2$ hours unshaded):** Triggers mandatory work-rest cycles (e.g., 45 min work / 15 min rest) to enforce cardiovascular recovery windows.
* **Distant Hydration ($> 2$ min walk):** Generates a specific logistical directive instructing the supervisor to stage dedicated water coolers directly at the active work face.

---

## 8. Canonical Fictional Exposure Scenario

```text
Worksite:             North Bengaluru Construction Site (Pier 42)
Shift:                Morning Concrete Viaduct Pour
Active Work Group:    Civil Pouring Crew

Exposure Profile:
  classification:     HIGH
  physical_shielding: Outdoor unshaded elevated concrete viaduct pier
  solar_radiance:     Full direct sunlight (clear midday sky)
  surface_properties: Structural concrete and steel reinforcing grid (radiant reradiation)
  hydration_distance: Potable water station located at base of pier (requires climbing down)

Operational Impact:
  Ambient Heat Index: 39°C
  Engine Assessment:  High exposure and radiant reflection elevate risk to HIGH.
  Action Generated:   Mandates hoist-assisted water delivery directly to pier deck and
                      enforces mandatory 15-minute shaded canopy rest per hour.
```

---

## 9. Design Principle

> **Exposure is the bridge between atmospheric weather and the human body. By evaluating physical shielding, solar radiance, duration, and recovery opportunities, the Exposure Model ensures preventive actions reflect actual working conditions rather than generalized weather forecasts.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
