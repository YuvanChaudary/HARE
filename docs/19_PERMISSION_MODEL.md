# Permission Model — Heat Action Response Engine MVP

## 1. Purpose

This document defines the Role-Based Access Control (RBAC) and authorization architecture for the **Heat Action Response Engine MVP**.

The Permission Model enforces operational safety boundaries, protects organizational data, and ensures accountability by governing access across all core system resources:
* **Worksites:** Profiles, geographic coordinates, physical contexts, and lifecycle states.
* **Environmental & Risk Data:** Ingested weather observations, thermal indices, and risk classifications.
* **Preventive Actions:** Directive generation, assignment, acknowledgment, verification, and closure.
* **Escalations:** Timeout detection, escalation alerting, reassignment, and managerial resolution.
* **Notifications:** Channel routing, user inboxes, and operational dispatch logs.
* **Audit History:** Permanent, append-only event ledgers and compliance chronologies.
* **User Accounts & Roles:** Provisioning, credential lifecycle, and role assignments.
* **System Settings:** Integration configurations, escalation policies, and simulation modes.

The objective of this model is to provide robust operational security and clear accountability without introducing unnecessary administrative complexity during the MVP.

---

## 2. Core RBAC Model

The system enforces a standard five-tier Role-Based Access Control relationship:

```text
       USER (Authenticated Identity)
         │
         ▼
       ROLE (Functional Responsibility Archetype)
         │
         ▼
    PERMISSION (Atomic Entitlement, e.g., ACTION:ACKNOWLEDGE)
         │
         ▼
     RESOURCE (Domain Entity, e.g., Action #ACT-892)
         │
         ▼
      ACTION (Permitted Operation: Read, Mutate, Execute)
```

Authorization is determined by evaluating the user’s assigned operational role against the requested resource within a specific organizational and worksite scope.

---

## 3. MVP Roles

The Heat Action Response Engine MVP defines exactly three primary operational roles:

* **`ADMIN`:** Enterprise Systems & Operational Setup Administrator.
* **`SAFETY_MANAGER`:** Organizational Safety, Compliance, & Escalation Lead.
* **`SUPERVISOR`:** Front-Line Field Works Operations Lead.

### Secondary & Future Roles (Out of MVP Scope):
* **`WORKER`:** Field tradesperson (beneficiary; no direct login or software permissions in MVP).
* **`OPERATIONS_MANAGER`:** Enterprise executive reviewing aggregate cross-site portfolio productivity.
* **`OCCUPATIONAL_SAFETY_PROFESSIONAL`:** Specialized industrial hygienist configuring raw algorithmic thresholds.

---

## 4. Role: ADMIN

### Core Responsibilities:
* Register and configure physical worksite profiles and GPS coordinates.
* Define baseline worksite contexts (workload categories, shade, hydration assets).
* Provision user accounts, manage credentials, and assign operational roles.
* Map primary and backup supervisors to specific active worksites.
* Configure organization-level operational parameters (e.g., default escalation timeout windows).
* Monitor system health, external API status, and integration exceptions.

### Explicit Prohibitions (What ADMIN Must NOT Do):
* **No Unilateral Safety Overrides:** An Admin cannot arbitrarily override deterministic risk classifications or declare dangerous weather "safe."
* **No Medical Determinations:** An Admin has no clinical authority within the system.
* **No Audit Tampering:** An Admin cannot delete, backdate, edit, or purge historical audit ledgers.
* **No Safety Workflow Bypassing:** An Admin cannot force-close active safety actions without operational safety justification.

---

## 5. Role: SAFETY_MANAGER

### Core Responsibilities:
* Monitor real-time heat risk across all organizational worksites via the Command Center.
* Review system-generated preventive action directives and ensure protocol adherence.
* Track supervisor acknowledgment latency and operational response metrics.
* Receive, investigate, and resolve automated system escalations when field timeouts expire.
* Intervene directly on blocked actions by coordinating emergency site resources.
* Inspect and export comprehensive, timestamped compliance audit ledgers.
* Test operational response readiness using the Simulation & Demo sandbox.

---

## 6. Role: SUPERVISOR

### Core Responsibilities:
* View environmental risk conditions and context for their assigned worksites only.
* Receive assigned heat-prevention action directives via the Supervisor Action Center.
* Explicitly acknowledge assigned directives to confirm receipt and stop escalation timers.
* Coordinate on-site physical controls (distributing water, directing crews to shade).
* Confirm physical execution of controls via interactive checklists.
* Report on-site resource blockers (e.g., depleted water supplies) to trigger safety intervention.

### Explicit Prohibitions (What SUPERVISOR Must NOT Do):
* **No Global Risk Modification:** Cannot alter risk calculation rules or organizational thresholds.
* **No Cross-Site Tampering:** Cannot view or manipulate actions belonging to other unassigned worksites.
* **No User Administration:** Cannot create users, assign roles, or modify system permissions.
* **No Audit Deletion:** Cannot modify or clear historical acknowledgment timestamps.

---

## 7. Permission Naming Standard

Permissions follow a clean, standardized `RESOURCE:ACTION` nomenclature:

```text
WORKSITE:READ         WORKSITE:CREATE       WORKSITE:UPDATE       WORKSITE:ACTIVATE
RISK:READ             RISK:EVALUATE         RISK:EXPLAIN
ACTION:READ           ACTION:CREATE         ACTION:ASSIGN         ACTION:ACKNOWLEDGE
ACTION:UPDATE         ACTION:CONFIRM        ACTION:CANCEL         ACTION:BLOCK
ESCALATION:READ       ESCALATION:ACKNOWLEDGE ESCALATION:RESOLVE
NOTIFICATION:READ     NOTIFICATION:MANAGE
AUDIT:READ            AUDIT:EXPORT
USER:READ             USER:CREATE           USER:UPDATE           USER:DEACTIVATE
ROLE:ASSIGN           SYSTEM:CONFIGURE      DEMO:EXECUTE
```

---

## 8. Permission Matrix

The comprehensive entitlement matrix maps roles to explicit capabilities:

| Permission Name | Description | ADMIN | SAFETY_MANAGER | SUPERVISOR |
| :--- | :--- | :---: | :---: | :---: |
| **`WORKSITE:READ`** | View worksite profile & location | All Sites | All Sites | **Assigned Only** |
| **`WORKSITE:CREATE`** | Register new worksite | **Yes** | Policy Limited | No |
| **`WORKSITE:UPDATE`** | Edit worksite context & assets | **Yes** | Policy Limited | No |
| **`WORKSITE:ACTIVATE`**| Toggle site status (`ACTIVE`/`PAUSED`) | **Yes** | No | No |
| **`RISK:READ`** | View calculated heat-risk tiers | All Sites | All Sites | **Assigned Only** |
| **`RISK:EVALUATE`** | Trigger on-demand risk evaluation | System Only | **Yes** | No |
| **`RISK:EXPLAIN`** | Request AI plain-language risk summary | Yes | **Yes** | **Yes** |
| **`ACTION:READ`** | View preventive action directives | All Sites | All Sites | **Assigned Only** |
| **`ACTION:CREATE`** | Generate action directive | System Only | **Yes (Manual)** | No |
| **`ACTION:ASSIGN`** | Bind supervisor to action directive | Config Level | **Yes (Operational)**| No |
| **`ACTION:ACKNOWLEDGE`**| Confirm receipt of assigned directive | If Assigned | If Assigned | **Yes (Primary)** |
| **`ACTION:CONFIRM`** | Submit physical execution confirmation | If Assigned | **Yes** | **Yes (Primary)** |
| **`ACTION:BLOCK`** | Report on-site resource impediment | No | No | **Yes** |
| **`ACTION:CANCEL`** | Cancel obsolete action directive | No | **Yes (Audited)** | No |
| **`ESCALATION:READ`** | View active escalation events | All Sites | **Yes (Primary)** | **Assigned Only** |
| **`ESCALATION:RESOLVE`**| Intervene and formally close escalation| No | **Yes (Primary)** | If Directed |
| **`NOTIFICATION:READ`**| View notification alerts in inbox | Own | Own | Own |
| **`AUDIT:READ`** | Inspect chronological event ledgers | All Sites | **All Sites** | **Assigned Only** |
| **`AUDIT:EXPORT`** | Export compliance audit reports | System Logs | **Safety Logs** | No |
| **`USER:MANAGE`** | Provision, edit, & deactivate users | **Yes** | No | No |
| **`ROLE:ASSIGN`** | Assign RBAC roles to user accounts | **Yes** | No | No |
| **`AUDIT:MODIFY`** | Edit or delete historical audit entries| **PROHIBITED** | **PROHIBITED** | **PROHIBITED** |
| **`SAFETY:OVERRIDE`** | Unilaterally declare high risk as safe | **PROHIBITED** | **PROHIBITED** | **PROHIBITED** |

---

## 9. Resource Scoping

Authorization is evaluated at both the role level and the **resource scope level**:

```text
                  ENTERPRISE TENANT (organization_id)
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ORGANIZATIONAL SCOPE                      WORKSITE SCOPE (worksite_id)
   (Admin & Safety Manager)                   (Site Supervisor)
   • Access all worksites                    • Access assigned site only
   • Access all escalations                  • Access assigned actions only
   • Access complete audit ledger            • Access assigned crew directives
```

A Site Supervisor authenticated in the system is strictly scoped to the `worksite_id`(s) to which they are assigned. Attempting to access directives for another worksite is blocked with an HTTP 403 Forbidden response.

---

## 10. Principle of Least Privilege

> **Users should receive only the permissions strictly required to perform their operational responsibilities.**

### Architectural Enforcement:
1. **Deny by Default:** All API endpoints and interface views require explicit permission; unassigned routes deny access automatically.
2. **No Superuser Bypass:** There is no unrestricted "God Mode" account. Even administrators cannot delete audit records or bypass safety verification gates.
3. **Explicit Grants:** Permissions are bundled into formal roles, preventing ad-hoc, untracked permission creeping.

---

## 11. Authentication vs. Authorization

The platform maintains a clean architectural boundary between identity and permission:

* **Authentication (AuthN):** *"Who are you?"* Verified via secure credentials, session tokens, or JWTs.
* **Authorization (AuthZ):** *"What are you allowed to do with this resource right now?"* Evaluated by the permission engine based on role, resource ID, and operational state.

This document defines **Authorization**. Authentication infrastructure is detailed in separate identity documentation.

---

## 12. Safety-Critical Authorization Safeguards

To prevent operational negligence or unauthorized interference during hazardous weather:

1. **No Rule Alteration by Field Roles:** Supervisors cannot alter the underlying mathematical risk rules to avoid receiving work-rest directives.
2. **No Silent Action Deletion:** Actions cannot be deleted from the database. An action can only transition to `CANCELLED` through an auditable managerial event.
3. **Immutable Audit Ledger:** The audit log table permits strictly `INSERT` operations. `UPDATE` and `DELETE` queries are disabled at the database layer for all application accounts.
4. **Mandatory Justification for Overrides:** If a Safety Manager intervenes to cancel an escalated action, the system requires a mandatory text rationale before authorization is granted.

---

## 13. Audit Requirements for Security Events

All security-relevant actions generate permanent audit ledger entries:

```text
{
  "event_id": "sec-evt-9912",
  "event_type": "ROLE_REASSIGNED",
  "actor_id": "usr-admin-priya",
  "actor_role": "ADMIN",
  "target_user_id": "usr-sup-rahul",
  "previous_role": "SUPERVISOR",
  "new_role": "SAFETY_MANAGER",
  "timestamp": "2026-10-07T14:30:00Z",
  "justification": "Promotion to regional safety compliance lead"
}
```

Security events logged include: role changes, permission modifications, supervisor reassignment, action cancellations, and escalation closures.

---

## 14. Data Visibility Boundaries

Information display is strictly filtered by role to avoid privacy violations and administrative noise:

* **ADMIN:** Sees configuration tables, user rosters, integration endpoints, and system logs. Sees zero personal worker data.
* **SAFETY_MANAGER:** Sees multi-site risk summaries, active directives, response latencies, and escalation queues.
* **SUPERVISOR:** Sees only their own worksite, active crew directives, work/rest checklists, and countdown timers.

---

## 15. Authorization Failure Handling

When a user attempts an unauthorized action:

```text
User Requests Action (e.g., Supervisor attempts to delete worksite)
                       │
                       ▼
            Authorization Check Fails
                       │
                       ▼
              Access Denied (HTTP 403)
                       │
                       ▼
        Safe Generic Error Rendered in UI:
        "You do not have permission to perform this operation."
                       │
                       ▼
     Security Event Logged (Actor, Target, Timestamp)
```

Error messages must never reveal sensitive internal schema details or system credentials.

---

## 16. User Role Changes & Session Invalidation

When an administrator updates a user’s role (e.g., changing a user from `SUPERVISOR` to `SAFETY_MANAGER`):
1. **Immediate Invalidation:** Active session tokens refresh authorization claims on the subsequent API request.
2. **Review Active Assignments:** The administrator is prompted to reassign any active worksites currently supervised by that user.
3. **Audit Logging:** The role modification is permanently sealed in the administrative audit log.

---

## 17. User Deactivation Protocol

When a user account is marked `INACTIVE`:
1. **Access Revocation:** Login authentication is blocked immediately.
2. **Preserve Historical Records:** All past acknowledgments, confirmations, and audit logs associated with that user ID remain permanently intact.
3. **Operational Reassignment:** Any active worksites or pending actions bound to the deactivated user are immediately flagged as `UNASSIGNED`, prompting the Safety Manager to assign an active replacement.

---

## 18. Permission Integration with Escalation

The escalation engine strictly adheres to permission boundaries:
* An action directive can **only escalate to an authenticated user possessing the `SAFETY_MANAGER` role**.
* The system validates that the target escalation recipient has active authorization over the worksite’s organizational tenant before dispatching high-priority alerts.

---

## 19. Permission Integration with Notifications

The notification dispatcher validates authorization prior to routing:
* Notifications containing operational directives are dispatched **only** to users with valid read permissions for that worksite.
* If a supervisor’s assignment is revoked, pending notification queues for that site are cleared immediately.

---

## 20. Permission Integration with AI Services

Artificial intelligence features operate entirely **within the authenticated user's permission scope**:

```text
Supervisor asks AI: "Show me all active heat actions."
                             │
                             ▼
  AI Service Queries Backend with Supervisor's Auth Token
                             │
                             ▼
  Backend Filters Data: (worksite_id = supervisor_assigned_site)
                             │
                             ▼
  AI Generates Summary ONLY for Authorized Assigned Directives
```

> **CRITICAL ARCHITECTURAL PRINCIPLE:** The AI layer inherits application authorization boundaries; it can never bypass access controls, escalate user privileges, or surface unauthorized cross-site data.

---

## 21. Permission Integration with Audit Logs

Audit access is governed by role and scope:
* **Administrators** can inspect system configuration, integration, and security audit logs.
* **Safety Managers** can inspect complete operational safety, risk, and escalation audit logs across all organizational sites.
* **Supervisors** can inspect their own acknowledgment and confirmation history.
* **No role** has permission to modify or truncate audit tables.

---

## 22. MVP vs. Future Permission Model

| Authorization Feature | MVP Scope | Future Scope |
| :--- | :--- | :--- |
| **Standard Roles (Admin, Safety Mgr, Supervisor)** | Yes (Three core roles) | Custom role authoring with granular policy builder |
| **Resource Scoping by Worksite** | Yes (Primary site assignment) | Complex multi-site tagging and regional groups |
| **Worker Portal Role** | **No** (Beneficiary only) | Read-only worker portal for advisory broadcasts |
| **Attribute-Based Access Control (ABAC)** | Limited (Contextual checks) | Dynamic ABAC evaluating real-time GPS proximity |
| **Single Sign-On (SSO / SAML / OIDC)** | Future | Enterprise Okta / Azure AD federated SSO |
| **Multi-Factor Authentication (MFA)** | Standard passwords in demo | WebAuthn passkeys, FIDO2 hardware keys, SMS OTP |

---

## 23. Ten Security & Permission Principles

1. **Least Privilege:** Grant only the minimum permissions required for that role.
2. **Deny by Default:** Explicit grants required for all resources.
3. **Explicit Authorization:** Permissions map to formal, named operations.
4. **Strict Resource Scoping:** Supervisors access their assigned sites only.
5. **No AI Privilege Escalation:** AI models inherit authenticated user constraints.
6. **No Unauthorized Safety Overrides:** Operational safety rules cannot be bypassed.
7. **Append-Only Audit Trails:** Audit history is strictly immutable.
8. **Minimal Data Exposure:** Personal worker medical data is completely excluded.
9. **Auditable Administrative Changes:** All role and assignment updates are logged.
10. **Human Accountability:** Consequential actions belong to authenticated humans.

---

## 24. Canonical Permission Scenario

For hackathon demonstration and role validation, the following operational profile is established:

```text
User Identity:
  name:                  "Rahul Kumar"
  user_id:               "usr-sup-rahul"
  role:                  SUPERVISOR
  assigned_worksite:     "North Bengaluru Construction Site (Pier 42)"

Permitted Operations:
  [✓] View North Bengaluru worksite weather and calculated risk tier.
  [✓] Receive and view assigned action directives for North Bengaluru.
  [✓] Click "Acknowledge Directive" for assigned action directives.
  [✓] Click "Confirm Execution" and submit operational checklists.
  [✓] Report on-site resource blockers ("Report Blocker").
  [✓] Request AI plain-language explanations of assigned directives.

Prohibited Operations (Enforced with HTTP 403 Forbidden):
  [✗] View or acknowledge actions for South Bengaluru Yard (Unassigned Site).
  [✗] Create new worksites or edit worksite GPS coordinates.
  [✗] Provision user accounts or assign roles.
  [✗] Modify deterministic heat-risk calculation rule matrices.
  [✗] Delete or backdate acknowledgment timestamps in the audit log.
  [✗] Cancel an active safety directive without managerial authorization.
```

---

## 25. Final Principle

> **Permissions should reflect responsibility: administrators configure the system, safety managers oversee organizational safety workflows, supervisors execute assigned operational actions, and no role—including AI—should bypass authorization or silently override safety-critical controls.**

**Status:** Draft  
**Last Updated:** 2026-10-07  
**Owner:** Project Team
