# Worksite & Shift Facility API Specification

**Document ID:** `72_WORKSITE_API`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Scope

This specification defines the authoritative API contracts for managing physical worksites, environmental safeguard assets (water points, shaded cooling shelters, fans), operational worker rosters, and active shift parameters (`14_WORKSITE_MODEL.md`, `15_WORKER_SHIFT_MODEL.md`).

This document establishes:
* CRUD operations for worksite facility profiles and infrastructure safeguards.
* Shift creation, active shift tracking, and metabolic workload scheduling.
* The aggregated Worksite Operational Dashboard endpoint for rapid mobile and desktop status loading.
* Multi-tenant authorization boundaries and role-based access rules.

---

## 2. Core Worksite & Shift Data Models

### 2.1 Worksite Facility Profile Model
```text
┌──────────────────────────┬──────────┬────────────────────────────────────────┐
│ ATTRIBUTE NAME           │ TYPE     │ OPERATIONAL DESCRIPTION                │
├──────────────────────────┼──────────┼────────────────────────────────────────┤
│ `worksite_id`            │ String   │ Unique worksite ID (`site_blr_north_01`)│
│ `name`                   │ String   │ Human-readable job site designation    │
│ `organization_id`        │ String   │ Tenant organization owner              │
│ `location`               │ Object   │ Latitude, longitude, elevation, address│
│ `timezone`               │ String   │ IANA timezone string (`Asia/Kolkata`)  │
│ `environment_type`       │ Enum     │ `OUTDOOR`, `INDOOR_UNCOOLED`,          │
│                          │          │ `SEMI_ENCLOSED`, `INDOOR_COOLED`       │
│ `safeguards`             │ Object   │ Physical cooling & hydration assets    │
│ `assigned_supervisors`   │ Array    │ User IDs of authorized field leads     │
│ `is_active`              │ Boolean  │ Active operational status              │
└──────────────────────────┴──────────┴────────────────────────────────────────┘
```

### 2.2 Safeguards Sub-Schema
```json
{
  "safeguards": {
    "water_stations_count": 6,
    "shaded_rest_areas_count": 3,
    "active_misting_fans_count": 4,
    "first_aid_station_present": true,
    "nearest_medical_facility_km": 3.2
  }
}
```

### 2.3 Shift Context Model
```text
┌──────────────────────────┬──────────┬────────────────────────────────────────┐
│ ATTRIBUTE NAME           │ TYPE     │ OPERATIONAL DESCRIPTION                │
├──────────────────────────┼──────────┼────────────────────────────────────────┤
│ `shift_id`               │ String   │ Unique shift ID (`shift_day_20261007`) │
│ `worksite_id`            │ String   │ Associated worksite                    │
│ `shift_type`             │ Enum     │ `DAY_SHIFT`, `AFTERNOON_SHIFT`, `NIGHT`│
│ `start_time`             │ String   │ UTC ISO 8601 start timestamp           │
│ `end_time`               │ String   │ UTC ISO 8601 end timestamp             │
│ `worker_count`           │ Integer  │ Active worker headcount on site        │
│ `workload_intensity`     │ Enum     │ `LIGHT`, `MODERATE`, `HEAVY`,          │
│                          │          │ `VERY_HEAVY` (ISO 7243 metabolic rate) │
│ `acclimatization_factor` │ Object   │ New worker ratio & heatwave day count  │
│ `status`                 │ Enum     │ `SCHEDULED`, `ACTIVE`, `COMPLETED`     │
└──────────────────────────┴──────────┴────────────────────────────────────────┘
```

---

## 3. Endpoints Overview

```text
┌────────┬──────────────────────────────────────────────┬────────────────────────┐
│ METHOD │ ROUTE                                        │ ACCESS ROLE            │
├────────┼──────────────────────────────────────────────┼────────────────────────┤
│ GET    │ `/api/v1/worksites`                          │ All Roles (Scoped)     │
│ GET    │ `/api/v1/worksites/{id}`                     │ All Roles (Scoped)     │
│ POST   │ `/api/v1/worksites`                          │ Administrator Only     │
│ PUT    │ `/api/v1/worksites/{id}`                     │ Admin / Safety Manager │
│ GET    │ `/api/v1/worksites/{id}/shifts`              │ All Roles (Scoped)     │
│ POST   │ `/api/v1/worksites/{id}/shifts`              │ Admin / Safety Manager │
│ GET    │ `/api/v1/worksites/{id}/dashboard`           │ All Roles (Scoped)     │
└────────┴──────────────────────────────────────────────┴────────────────────────┘
```

---

## 4. Endpoint Specifications

### 4.1 List Worksites

Retrieves all worksites within the caller's authorized tenant organization.

* **Route:** `GET /api/v1/worksites`
* **Authorization:** `SUPERVISOR` (returns only assigned sites), `SAFETY_MANAGER` / `ADMIN` (returns all org sites).
* **Query Parameters:**
  * `status` (String, optional): `ACTIVE` or `INACTIVE`.
  * `limit` (Integer, optional, default `50`): Page size.
  * `cursor` (String, optional): Pagination pointer.

#### Success Response (`200 OK`):
```json
{
  "data": [
    {
      "worksite_id": "site_blr_north_01",
      "name": "North Bengaluru Metro Station Site",
      "environment_type": "OUTDOOR",
      "is_active": true,
      "location": {
        "city": "Bengaluru",
        "state": "Karnataka",
        "latitude": 13.0358,
        "longitude": 77.5970
      },
      "active_shift": {
        "shift_id": "shift_day_20261007",
        "shift_type": "DAY_SHIFT",
        "worker_count": 85,
        "workload_intensity": "HEAVY"
      },
      "current_risk_level": "HIGH"
    }
  ],
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "count": 1,
    "next_cursor": null
  }
}
```

---

### 4.2 Get Worksite Profile

Retrieves the detailed profile, infrastructure assets, and authorized personnel for a specific worksite.

* **Route:** `GET /api/v1/worksites/{worksite_id}`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (scoped).

#### Success Response (`200 OK`):
```json
{
  "data": {
    "worksite_id": "site_blr_north_01",
    "name": "North Bengaluru Metro Station Site",
    "organization_id": "org_infra_corp",
    "timezone": "Asia/Kolkata",
    "environment_type": "OUTDOOR",
    "is_active": true,
    "location": {
      "address": "Outer Ring Road, Nagawara, Bengaluru",
      "latitude": 13.0358,
      "longitude": 77.5970,
      "elevation_m": 920.0
    },
    "safeguards": {
      "water_stations_count": 6,
      "shaded_rest_areas_count": 3,
      "active_misting_fans_count": 4,
      "first_aid_station_present": true,
      "nearest_medical_facility_km": 3.2
    },
    "assigned_supervisors": [
      {
        "user_id": "usr_sup_rahul",
        "name": "Rahul Kumar",
        "phone": "+91-9876543210"
      }
    ],
    "created_at": "2026-03-15T09:00:00Z",
    "updated_at": "2026-10-01T11:30:00Z"
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "resource_version": 4
  }
}
```

---

### 4.3 Create Worksite

Provisions a new worksite facility within the tenant organization.

* **Route:** `POST /api/v1/worksites`
* **Authorization:** `ADMIN` only.
* **Headers:**
  * `Authorization: Bearer <token>`
  * `Content-Type: application/json`
  * `Idempotency-Key: <UUID>`

#### Request Payload:
```json
{
  "name": "Whitefield Logistics Hub",
  "timezone": "Asia/Kolkata",
  "environment_type": "SEMI_ENCLOSED",
  "location": {
    "address": "EPIP Zone, Whitefield, Bengaluru",
    "latitude": 12.9822,
    "longitude": 77.7289,
    "elevation_m": 880.0
  },
  "safeguards": {
    "water_stations_count": 10,
    "shaded_rest_areas_count": 4,
    "active_misting_fans_count": 6,
    "first_aid_station_present": true,
    "nearest_medical_facility_km": 1.8
  },
  "assigned_supervisors": ["usr_sup_kavitha"]
}
```

#### Success Response (`201 Created`):
```json
{
  "data": {
    "worksite_id": "site_blr_east_02",
    "name": "Whitefield Logistics Hub",
    "organization_id": "org_infra_corp",
    "is_active": true,
    "created_at": "2026-10-07T14:30:00Z"
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:30:01.123Z",
    "resource_version": 1
  }
}
```

---

### 4.4 Get Worksite Shifts

Lists scheduled and currently active worker shifts for a worksite.

* **Route:** `GET /api/v1/worksites/{worksite_id}/shifts`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (scoped).
* **Query Parameters:**
  * `status` (String, optional): `ACTIVE`, `SCHEDULED`, `COMPLETED`.

#### Success Response (`200 OK`):
```json
{
  "data": [
    {
      "shift_id": "shift_day_20261007",
      "worksite_id": "site_blr_north_01",
      "shift_type": "DAY_SHIFT",
      "status": "ACTIVE",
      "start_time": "2026-10-07T08:00:00Z",
      "end_time": "2026-10-07T17:00:00Z",
      "worker_count": 85,
      "workload_intensity": "HEAVY",
      "acclimatization_factor": {
        "new_worker_pct": 15,
        "consecutive_heatwave_days": 3
      }
    }
  ],
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "count": 1
  }
}
```

---

### 4.5 Create / Schedule a Worksite Shift

Schedules a new shift roster for a worksite.

* **Route:** `POST /api/v1/worksites/{worksite_id}/shifts`
* **Authorization:** `SAFETY_MANAGER`, `ADMIN`.
* **Request Payload:**
```json
{
  "shift_type": "AFTERNOON_SHIFT",
  "start_time": "2026-10-07T14:00:00Z",
  "end_time": "2026-10-07T22:00:00Z",
  "worker_count": 60,
  "workload_intensity": "MODERATE",
  "acclimatization_factor": {
    "new_worker_pct": 10,
    "consecutive_heatwave_days": 3
  }
}
```

#### Success Response (`201 Created`):
```json
{
  "data": {
    "shift_id": "shift_aft_20261007",
    "worksite_id": "site_blr_north_01",
    "status": "SCHEDULED",
    "start_time": "2026-10-07T14:00:00Z",
    "worker_count": 60,
    "workload_intensity": "MODERATE"
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:32:00.123Z",
    "resource_version": 1
  }
}
```

---

### 4.6 Worksite Operational Dashboard (Aggregated View)

Delivers a single-payload operational snapshot to power the field supervisor mobile screen (`54_MOBILE_UI.md`) and safety manager monitoring view (`51_SUPERVISOR_DASHBOARD.md`, `52_SAFETY_MANAGER_DASHBOARD.md`) with a single HTTP round trip.

* **Route:** `GET /api/v1/worksites/{worksite_id}/dashboard`
* **Authorization:** `SUPERVISOR`, `SAFETY_MANAGER`, `ADMIN` (scoped).

#### Success Response (`200 OK`):
```json
{
  "data": {
    "worksite": {
      "worksite_id": "site_blr_north_01",
      "name": "North Bengaluru Metro Station Site",
      "timezone": "Asia/Kolkata"
    },
    "current_shift": {
      "shift_id": "shift_day_20261007",
      "shift_type": "DAY_SHIFT",
      "worker_count": 85,
      "workload_intensity": "HEAVY"
    },
    "current_risk": {
      "risk_level": "HIGH",
      "assessment_timestamp": "2026-10-07T14:05:00Z",
      "heat_index_c": 43.8,
      "data_quality": "VALID",
      "primary_driver": "High direct solar radiation on heavy manual tasks"
    },
    "weather_summary": {
      "dry_bulb_temperature_c": 38.2,
      "relative_humidity_pct": 56.0,
      "observation_timestamp": "2026-10-07T14:00:00Z",
      "quality_status": "VALID",
      "is_stale": false
    },
    "active_actions_summary": {
      "total_active": 2,
      "pending_acknowledgment": 1,
      "in_progress": 1,
      "escalated": 0,
      "highest_priority_action": {
        "action_id": "act_88219",
        "action_type": "MANDATORY_HYDRATION_BREAK",
        "priority": "HIGH",
        "status": "PENDING_ACKNOWLEDGMENT",
        "sla_deadline": "2026-10-07T14:35:00Z",
        "assigned_to": "usr_sup_rahul"
      }
    }
  },
  "meta": {
    "request_id": "req_01JXYZ8890ABCDEF",
    "timestamp": "2026-10-07T14:20:00.123Z",
    "resource_version": 5
  }
}
```

---

## 5. Error Contract & Scoping Exceptions

```text
┌──────┬────────────────────────┬────────────────────────────────────────┐
│ CODE │ ERROR CODE             │ FAILURE SCENARIO                       │
├──────┼────────────────────────┼────────────────────────────────────────┤
│ 403  │ `ORGANIZATION_FORBIDDEN`│ User token org does not match worksite│
│ 403  │ `ROLE_UNAUTHORIZED`    │ Supervisor attempts to create worksite │
│ 404  │ `WORKSITE_NOT_FOUND`   │ Worksite does not exist                │
│ 409  │ `SHIFT_TIME_OVERLAP`   │ Shift hours conflict with active shift │
│ 422  │ `INVALID_COORDINATES`  │ Lat/Long outside valid bounds          │
└──────┴────────────────────────┴────────────────────────────────────────┘
```

---

## 6. Non-Negotiable Architectural Rules

1. **Strict Multi-Tenancy:** A user from `org_alpha` can never access or query worksites belonging to `org_beta`.
2. **Context Drives Actions:** The contextual action engine uses the worksite's `environment_type` and `safeguards` assets to generate site-specific mitigation instructions (`42_SITE_SPECIFIC_ACTIONS.md`).
3. **No Phantom Shifts:** Workload intensity (`workload_intensity`) must be provided for every active shift; it directly drives deterministic metabolic rate equations.
