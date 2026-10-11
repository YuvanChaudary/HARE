# 39 IoT and Physical Sensor Future Extension Specification

## 1. Purpose

This document specifies the forward-looking integration architecture, data flows, validation protocols, and security requirements for incorporating physical Internet of Things (IoT) edge sensors into the **Heat Action Response Engine**.

### Foundational Architectural Boundary
The initial MVP release of the Heat Action Response Engine is strictly:

```text
SOFTWARE-FIRST ARCHITECTURE — NO HARDWARE REQUIRED FOR MVP
```

The system delivers comprehensive heat risk evaluation, supervisory action assignment, and multi-tier escalation utilizing external meteorological feeds (Open-Meteo, IMD) and worksite operational context. Physical sensors represent a **future modular extension** designed to refine local microclimatic awareness without altering the core software engine.

---

## 2. High-Level Evolution Architecture

The platform is architecturally structured so that adding on-site physical hardware simply introduces a new adapter into the existing normalization pipeline:

```text
                         CURRENT MVP BASELINE
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
              Open-Meteo                        IMD
                   │                             │
                   └──────────────┬──────────────┘
                                  │
                                  ▼
                         WEATHER DATA LAYER
                                  │
                                  ▼
                          HEAT RISK ENGINE


                         FUTURE EXTENSION
                                  │
                           PHYSICAL SENSORS
                                  │
                                  ▼
                             EDGE DEVICE
                                  │
                                  ▼
                             IoT GATEWAY
                                  │
                                  ▼
                            AWS IoT CORE
                                  │
                                  ▼
                         NORMALIZATION LAYER
                                  │
                                  ▼
                          VALIDATION GATES
                                  │
                                  ▼
                      CANONICAL WEATHER DATA MODEL
                                  │
                                  ▼
                          HEAT RISK ENGINE
```

Downstream risk evaluation and supervisory action workflows remain completely insulated from whether an environmental data point originated from an external cloud API or an on-site microcontroller.

---

## 3. Potential Sensor Modalities

When physical hardware is introduced in future phases, the system will support diverse sensor classes:

* **Ambient Dry-Bulb Temperature Sensors:** Measuring local air temperature shielded from direct solar radiation.
* **Relative Humidity Sensors:** Measuring local atmospheric moisture content.
* **Radiant Heat Instrumentation (Black Globe):** Measuring mean radiant temperature ($T_g$) resulting from solar radiation and hot industrial surfaces.
* **Airflow / Anemometer Sensors:** Measuring local wind velocity across worksite zones.
* **Specialized Wet-Bulb Globe Temperature (WBGT) Instruments:** Integrating natural wet-bulb, dry-bulb, and black-globe measurements into standardized occupational heat indices.

> [!WARNING]
> **Measurement Scope Notice:**
> A basic ambient temperature and humidity sensor (e.g., standard consumer electronics) measures macroscopic air conditions. It does **not** measure radiant solar load, ground reflection, or personal core body temperature. It must not be marketed as a complete replacement for certified industrial hygiene instrumentation.

---

## 4. Illustrative Edge Hardware

For prototype testing and future pilot deployments, illustrative edge hardware configurations may include:

* **Microcontroller Unit (MCU):** Espressif ESP32 with hardware cryptographic acceleration, Wi-Fi, and Bluetooth/LoRa connectivity.
* **Environmental Sensor Modules:** Sensirion SHT31, Bosch BME280, or digital DHT22 sensors mounted inside ventilated solar radiation shields.
* **Enclosure:** IP65-rated industrial weatherproofing designed for harsh construction and logistics environments.

These hardware components are purely illustrative examples for future engineering exploration; they are **not** MVP dependencies.

---

## 5. IoT Data Ingestion Flow

The conceptual telemetry pipeline from physical silicon to the Heat Risk Engine follows nine deterministic stages:

```text
1. SENSOR           : Physical transducers measure ambient environmental properties.
         │
2. EDGE DEVICE      : Microcontroller reads digital bus (I2C/SPI), formats JSON packet.
         │
3. NETWORK          : Encrypted wireless transmission (Wi-Fi, Cellular NB-IoT, or LoRaWAN).
         │
4. INGESTION        : Ingested via secure message broker (e.g., AWS IoT Core MQTT broker).
         │
5. AUTHENTICATION   : X.509 device client certificate validation and authorization check.
         │
6. VALIDATION       : Range, physical feasibility, and packet sequence verification.
         │
7. NORMALIZATION    : Transformation into canonical internal schema and metric units.
         │
8. DATA MODEL       : Commits immutable WeatherRecord with source_type = PHYSICAL_SENSOR.
         │
9. RISK ENGINE      : Deterministic evaluation consumes validated local observation.
```

---

## 6. Benefits and Physical Limitations of Local Sensors

Integrating on-site hardware introduces notable capabilities alongside operational tradeoffs:

### Key Operational Benefits
* **Microclimate Fidelity:** Captures specific thermal conditions inside steel warehouses, trenches, or unventilated industrial sheds where macroscopic weather models fail.
* **Real-Time Telemetry:** Provides immediate observational updates (e.g., every 5 minutes) rather than waiting for hourly model cycles.
* **Forecast Calibration:** Enables empirical validation and bias-correction of regional forecast models against actual site measurements.

### Inherent Hardware Limitations
* **Sensor Drift & Calibration:** Electronic humidity sensors degrade rapidly when exposed to industrial dust, cement particulates, and high humidity, requiring periodic recalibration.
* **Placement Sensitivity:** A sensor placed near a running generator or directly against a black asphalt surface will report misleadingly high localized extremes.
* **Maintenance & Power:** Batteries deplete, wireless signals drop across concrete barriers, and physical enclosures suffer physical damage from heavy construction machinery.

---

## 7. Comparative Environmental Source Matrix

A balanced environmental monitoring strategy recognizes the distinct role of each source type:

| Source Type | Operational Strength | Critical Limitation |
| :--- | :--- | :--- |
| **Numerical Forecast API** | Forward-looking shift planning (24–72 hours). | Inherent forecast model uncertainty; cannot confirm current reality. |
| **Current Weather API** | Broad, zero-hardware geographical coverage. | Grid resolution (2–25 km) may not reflect worksite microclimate. |
| **Local IoT Sensor** | Highly localized, real-time physical observation. | Requires hardware capital, installation, battery maintenance, and calibration. |
| **Occupational WBGT Meter** | Gold-standard physiological exposure assessment. | High equipment cost, manual operation, and limited continuous remote coverage. |

No single source completely dominates; each serves a specialized operational purpose within the larger safety architecture.

---

## 8. Sensor Provenance Model

Every sensor-derived data record must carry extensive device-level provenance metadata:

```json
{
  "sensor_provenance": {
    "source_type": "PHYSICAL_SENSOR",
    "device_id": "EDGE-BLR-004-NODE-B",
    "hardware_model": "ESP32-S3-WROOM-1",
    "firmware_version": "2.4.1",
    "transducer_types": ["SHT35-DIS-B", "BLACK_GLOBE_NTC"],
    "worksite_id": "WS-BLR-001",
    "zone_identifier": "ZONE-C-OUTDOOR-CONCRETE",
    "measurement_timestamp_utc": "2026-10-07T11:28:45Z",
    "ingestion_timestamp_utc": "2026-10-07T11:28:48Z",
    "last_calibrated_date": "2026-08-15",
    "battery_voltage_volts": 4.12,
    "transport_protocol": "MQTT_OVER_TLS"
  }
}
```

---

## 9. Device Identity, Authentication, and Edge Security

Deploying hardware in physically accessible field environments introduces significant attack vectors. The future IoT subsystem enforces rigorous edge security:

* **Mutual TLS (mTLS):** All outbound device traffic authenticates via unique X.509 client certificates registered in AWS IoT Core.
* **Hardware Root of Trust:** Private keys are stored in secure elements or encrypted flash partitions.
* **Least Privilege Authorization:** Devices possess permissions strictly to publish telemetry to their dedicated worksite MQTT topic; they cannot read other devices' streams or access system databases.
* **Over-The-Air (OTA) Updates:** Firmware updates require cryptographic digital signature verification before flashing.
* **Revocation and Quarantine:** Compromised or erratic hardware nodes can be revoked instantly at the cloud broker level.

---

## 10. Sensor Data Validation Gates

Physical telemetry must never be accepted as unquestioned truth simply because it originated from silicon:

```text
Incoming Sensor Telemetry Packet
                │
                ▼
      X.509 Certificate Validated?
                │
                ▼
      Device ID Registered & Active?
                │
                ▼
      Timestamps Monotonically Increasing?
                │
                ▼
      Values Within Physical Sanity Bounds?
      (-20.0 °C ≤ Ta ≤ 65.0 °C  |  0% ≤ RH ≤ 100%)
                │
                ▼
      Rate of Change Plausible? (No impossible 20°C jumps in 5 seconds)
                │
                ▼
      Battery / Signal Health Adequate?
                │
                ▼
PASSED GATES ──► CANONICAL NORMALIZATION ──► HEAT RISK ENGINE
```

If a sensor packet fails any gate, it is rejected, logged, and the device state is flagged for diagnostic inspection.

---

## 11. Sensor Health and Failure States

The platform monitors physical node health through an explicit device state lifecycle:

```text
┌─────────┐      ┌──────────┐      ┌─────────┐      ┌──────────┐
│ ONLINE  │ ───► │ DEGRADED │ ───► │  STALE  │ ───► │ OFFLINE  │
└─────────┘      └──────────┘      └─────────┘      └──────────┘
```

* **`ONLINE`:** Transmitting valid readings within expected reporting intervals.
* **`DEGRADED`:** Operating with low battery voltage, high packet jitter, or secondary sensor failure.
* **`STALE`:** Missed scheduled reporting intervals; last valid observation retained with visible staleness tag.
* **`OFFLINE`:** Device unreachable beyond grace threshold; system falls back to external weather API context.
* **`INVALID`:** Transmitting corrupted or physically impossible readings.

---

## 12. Multi-Source Fusion Governance

When a worksite features concurrent external forecasts, regional station reports, and local IoT sensors, data fusion adheres to strict transparency rules:

1. **Local Observation Precedence:** For real-time current conditions ($t = t_{\text{now}}$), a validated on-site sensor takes precedence over macroscopic cloud model estimates.
2. **Forecast Integration:** For forward-looking planning ($t > t_{\text{now}}$), external numerical weather models remain the primary source, with local sensor history used to estimate microclimatic offsets.
3. **Preservation of Lineage:** The system never synthesizes an opaque, blended "AI temperature." Every risk evaluation record explicitly cites whether it was driven by `PHYSICAL_SENSOR` or `MODEL_FORECAST_API`.

---

## 13. Downstream Risk Engine Compatibility

The primary architectural achievement of the normalization layer is complete downstream compatibility:

```text
Current MVP Pipeline:
Open-Meteo API ──► Normalizer ──► NormalizedWeatherRecord ──► Heat Risk Engine

Future IoT Pipeline:
Physical ESP32 ──► Normalizer ──► NormalizedWeatherRecord ──► Heat Risk Engine
```

The Heat Risk Engine evaluates identical risk rules regardless of data origin. Adding hardware requires **zero modifications** to downstream risk assessment, supervisory assignment, or escalation logic.

---

## 14. Edge AI and Anomaly Detection

In future phases, machine learning models may operate at the edge or cloud ingestion boundary in an assistive capacity:

* **Sensor Drift Detection:** Detecting slow calibration degradation by comparing sensor readings against adjacent nodes and external APIs.
* **Anomaly Recognition:** Flagging sensor placement errors (e.g., detecting if a sensor was accidentally placed directly in front of an exhaust vent).
* **Predictive Maintenance:** Forecasting battery depletion based on ambient operating temperatures and transmission duty cycles.

Edge AI models assist with **instrument diagnostics**. They are strictly forbidden from modifying authoritative safety rules or inventing missing environmental readings.

---

## 15. Future AWS Cloud IoT Architecture

When implemented in subsequent phases, the cloud IoT ingestion layer will leverage managed AWS services:

```text
ESP32 Edge Devices (mTLS / MQTT)
               │
               ▼
         AWS IoT Core (Message Broker & Device Shadow)
               │
               ▼
     AWS IoT Rules Engine (Filter & Route Telemetry)
               │
               ▼
        AWS Lambda Ingestion Worker
               │
               ▼
       Validation & Canonical Normalization
               │
               ▼
       Amazon DynamoDB (Environmental Store)
               │
               ▼
   Amazon EventBridge ──► Heat Risk Engine Lambda
```

This reference topology demonstrates how the modular data architecture scales into enterprise cloud infrastructure without disrupting existing software services.

---

## 16. Cost and Operational Complexity Rationale

The deliberate decision to keep physical IoT hardware outside the initial MVP scope is grounded in pragmatic operational realities:

* **Hardware Capital & Logistics:** Procuring, assembling, and shipping physical microcontroller nodes across distributed worksites creates supply chain friction.
* **Field Maintenance Overhead:** Dust accumulation, battery replacements, and physical breakage demand dedicated on-site technician support.
* **Connectivity Challenges:** Remote infrastructure projects frequently suffer from intermittent cellular or Wi-Fi coverage.
* **Rapid Customer Onboarding:** A software-first MVP allows industrial organizations to deploy the Heat Action Response Engine in minutes using existing geographical coordinates, delivering immediate life-safety value.

---

## 17. Multi-Phase Hardware Roadmap

The planned evolution of environmental data capabilities spans four structured phases:

```text
PHASE 1 (Current MVP Baseline)
Software-first integration with external meteorological APIs (Open-Meteo, IMD).
Zero hardware required; instant global onboarding.

                     │
                     ▼
PHASE 2 (Pilot Edge Telemetry)
Introduction of optional, self-contained ambient temperature and humidity IoT nodes.
Automated ingestion via AWS IoT Core with local microclimate calibration.

                     │
                     ▼
PHASE 3 (Multi-Source Environmental Fusion)
Automated cross-calibration between on-site sensors, regional radar, and satellite feeds.
Dynamic urban heat island microclimate mapping across complex worksite campuses.

                     │
                     ▼
PHASE 4 (Advanced Occupational Instrumentation)
Integration with certified industrial WBGT stations, black-globe radiation meters,
and personal physiological thermal strain monitors where medically authorized.
```

*(Note: Roadmap phases represent engineering architecture concepts and do not constitute contractually committed release timelines.)*

---

## 18. Future Architecture Principle

> **IoT should extend the Heat Action Response Engine's environmental awareness without changing its core operational contract: validated environmental data enters through the same normalized data layer, deterministic risk rules remain authoritative, and human-supervised preventive action remains the product's central purpose.**
