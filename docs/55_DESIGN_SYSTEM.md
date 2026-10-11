# 55 Design System Specification

**Document Status:** Draft  
**Last Updated:** 2026-10-07  

---

## 1. Document Purpose and Design Philosophy

This document serves as the **authoritative visual and interaction design source of truth** for all user interfaces within the **Heat Action Response Engine**.

The design system establishes a unified, accessible, and mathematically disciplined visual language shared across all views:
* Supervisor Dashboard ([51_SUPERVISOR_DASHBOARD.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/51_SUPERVISOR_DASHBOARD.md))
* Safety Manager Dashboard ([52_SAFETY_MANAGER_DASHBOARD.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/52_SAFETY_MANAGER_DASHBOARD.md))
* Worksite View ([53_WORKSITE_VIEW.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/53_WORKSITE_VIEW.md))
* Mobile UI ([54_MOBILE_UI.md](file:///d:/Amazon%202nd%20Hackathon%20Heat/docs/54_MOBILE_UI.md))
* Action Cards, Notification Drawers, and AI Assistants

### Core Visual Philosophy
```text
CLARITY  •  TRUST  •  CALM  •  SAFETY  •  ACCOUNTABILITY  •  MODERNITY
```

The system is engineered to feel like a **modern, high-reliability workplace SaaS application**. It avoids decorative visual noise, dark-mode cyberpunk tropes, or overwhelming emergency graphics, choosing instead **calm urgency and immediate operational clarity**.

---

## 2. Theme Architecture: Light-First Mandate

The primary theme for the Heat Action Response Engine is strictly **LIGHT**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ MANDATORY LIGHT THEME FOUNDATION:                                      │
│ • Canvas Background : Light neutral slate (#F8FAFC)                    │
│ • Primary Surfaces  : Pure white cards (#FFFFFF)                       │
│ • Elevated Surfaces : White with subtle 1px border (#FFFFFF / #E2E8F0) │
│ • Primary Headers   : Dark navy slate (#0F172A)                        │
│ • Secondary Text    : Muted charcoal (#475569)                         │
└────────────────────────────────────────────────────────────────────────┘
```

> [!NOTE]
> Dark mode is **not** supported in the MVP baseline. In outdoor industrial environments, bright high-contrast light themes offer superior legibility against bright sunlight glare and dusty protective screens.

---

## 3. Semantic Color Token Architecture

Color is strictly functional; arbitrary or un-tokenized colors are prohibited across components:

| Token Name | Conceptual Value | Functional Role in UI |
| :--- | :--- | :--- |
| `color-bg-canvas` | `#F8FAFC` (Slate 50) | Full page viewport background. |
| `color-surface-card` | `#FFFFFF` (Pure White) | Primary card containers and table surfaces. |
| `color-surface-subtle`| `#F1F5F9` (Slate 100) | Secondary panels, table headers, hover states. |
| `color-border-subtle` | `#E2E8F0` (Slate 200) | 1px card borders and divider lines. |
| `color-border-strong` | `#CBD5E1` (Slate 300) | Focused inputs and active card boundaries. |
| `color-text-primary` | `#0F172A` (Slate 900) | Primary titles, metrics, and dominant action text. |
| `color-text-secondary`| `#475569` (Slate 600) | Descriptive body paragraphs and field labels. |
| `color-text-muted` | `#94A3B8` (Slate 400) | Timestamps, footnote indicators, units. |
| `color-action-primary`| `#0F172A` / `#1E293B` | High-contrast solid primary action buttons. |
| `color-action-focus` | `#3B82F6` (Blue 500) | 2px accessible keyboard focus outline ring. |

---

## 4. Dual-Track Semantic States: Risk Severity vs. Data Quality

A cornerstone safety principle of the platform is that **environmental hazard severity and data-quality health are orthogonal dimensions**:

```text
DIMENSION 1: RISK SEVERITY             DIMENSION 2: TELEMETRY QUALITY
[ LOW      ] - Emerald (#059669)       [ VALID       ] - Emerald Pill
[ MODERATE ] - Amber (#D97706)         [ AGING       ] - Yellow Pill
[ HIGH     ] - Orange-Red (#B91C1C)    [ STALE       ] - Orange Pill
[ CRITICAL ] - Crimson (#991B1B)       [ MISSING     ] - Gray Hatch
[ UNKNOWN  ] - Neutral Slate (#64748B) [ CONFLICTING ] - Amber Outline
```

### The Non-Color Safety Rule
**Color must never be the sole conveyor of risk or data status.** Every status badge, risk card, and notification must render an explicit icon and uppercase text label:
$$\text{Color + Icon + Text Label} \implies \text{Accessible Safety Clarity}$$

```text
CORRECT:   [ ⚠️ HIGH RISK ]    (Red background tint + Warning Icon + Bold Text)
VIOLATION: [             ]    (Red background with no text or icon)
```

---

## 5. Typography Scale and Hierarchy

The typographic hierarchy prioritizes legibility, scannability, and structural hierarchy:

```text
Typeface: Inter, Outfit, or System Sans-Serif (Clean, Geometric, Highly Legible)
```

| Type Token | Font Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `font-display-hero` | $32\text{px}$ ($2\text{rem}$) | Bold (700) | $40\text{px}$ | Assessed Risk Badges, Hero Heat Index. |
| `font-page-title` | $24\text{px}$ ($1.5\text{rem}$) | SemiBold (600) | $32\text{px}$ | Dashboard view headers and worksite titles. |
| `font-section-head` | $18\text{px}$ ($1.125\text{rem}$)| SemiBold (600) | $24\text{px}$ | Card module titles and table section headers.|
| `font-card-title` | $16\text{px}$ ($1\text{rem}$) | Medium (500) | $22\text{px}$ | Individual action titles (`ACT-1082`). |
| `font-body-regular` | $14\text{px}$ ($0.875\text{rem}$)| Regular (400) | $20\text{px}$ | Operational instructions, explanations. |
| `font-meta-caption` | $12\text{px}$ ($0.75\text{rem}$) | Medium (500) | $16\text{px}$ | Timestamps, data provenance pills, tags. |

---

## 6. Mathematical 8-Point Spacing Scale

Layouts enforce consistent geometric rhythm based on an 8-point spatial grid:

```text
• space-xs :  4px  (Tight badge padding, micro-gaps)
• space-sm :  8px  (Internal input padding, icon gaps)
• space-md : 16px  (Card internal padding, standard grid gap)
• space-lg : 24px  (Section dividers, modal header padding)
• space-xl : 32px  (View layout margins, major section gaps)
• space-2xl: 48px  (Desktop dashboard container margins)
```

Generous white space is prioritized over visual density, preventing mis-taps on mobile and reducing visual strain under emergency conditions.

---

## 7. Border Radius and Surface Elevation

* **`radius-sm` ($4\text{px}$):** Form inputs, buttons, checkboxes.
* **`radius-md` ($8\text{px}$):** Dropdown menus, tooltips, dialogs.
* **`radius-lg` ($12\text{px}$):** Primary dashboard cards and containers.
* **`radius-pill` ($9999\text{px}$):** Status badges, countdown pills, filter chips.

### Elevation Hierarchy (Restrained Shadows)
* **Surface Flat:** `1px solid #E2E8F0`, zero shadow (clean, modern SaaS baseline).
* **Surface Raised:** `0 1px 3px rgba(15,23,42,0.06)`, `1px solid #E2E8F0` (interactive cards).
* **Surface Floating:** `0 10px 15px -3px rgba(15,23,42,0.08)` (modals and action drawers).

---

## 8. Button Component Specifications

```text
┌───────────────────────────────────────┬───────────────────────────────────────┐
│ BUTTON VARIANT                        │ VISUAL DESIGN & INTERACTION ROLE      │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ PRIMARY ACTION                        │ Solid Navy (#0F172A), White text.     │
│ [ ✓ ACKNOWLEDGE ACTION ]              │ Main operational task execution.      │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ SECONDARY ACTION                      │ White surface, 1px Slate border.      │
│ [ View Action Details ]               │ Informational drill-down.             │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ SUCCESS VERIFY                        │ Solid Emerald (#059669), White text.  │
│ [ CONFIRM VERIFICATION ]              │ Physical mitigation sign-off.         │
├───────────────────────────────────────┼───────────────────────────────────────┤
│ DESTRUCTIVE / OVERRIDE                │ White surface, Red border (#B91C1C).  │
│ [ Flag Missing Equipment ]            │ Site constraint / escalation trigger. │
└───────────────────────────────────────┴───────────────────────────────────────┘
```

All primary buttons enforce a minimum physical touch target of $48\text{px}$ height on mobile viewports.

---

## 9. Standardized Status Badges

Badges communicate state instantly using semantic pill geometry:

```text
[ ⚠️ HIGH RISK ]           ──► Red tint (#FEF2F2), Red border, Red text (#B91C1C)
[ 📋 PENDING_ACK (18m) ]   ──► Amber tint (#FFFBEB), Amber border (#D97706)
[ ✓ VERIFIED ]            ──► Emerald tint (#ECFDF5), Emerald border (#059669)
[ 🔶 ESCALATED ]          ──► Orange tint (#FFF7ED), Orange border (#EA580C)
[ 📡 DATA STALE (75m) ]   ──► Gray tint (#F1F5F9), Slate border (#475569)
[ 🔶 SIMULATION MODE ]     ──► High-contrast Orange Solid (#EA580C), White text
```

---

## 10. Form Design and Validation Discipline

* **Inline Labeling:** Labels sit directly above form inputs with clear `(Required)` markers.
* **Proximity Error Messages:** Validation errors appear immediately beneath the offending input in high-contrast red text (`#B91C1C`), never grouped into an opaque list at the top.
* **Checklist Checkboxes:** Verification checklists provide oversized $24 \times 24\text{px}$ checkboxes with clear tap feedback.

---

## 11. Modal Dialogs vs. Side Drawers

* **Modal Dialogs:** Reserved strictly for focused, single-task confirmation workflows (e.g., submitting the 3-point verification checklist or escalating an action).
* **Side Drawers (Slide-Overs):** Used for deep informational inspections (e.g., reviewing full audit logs, reading AI explanations) without dismounting the underlying worksite dashboard.

---

## 12. Accessibility and Motion Standards (WCAG 2.1 AA)

* **Contrast Ratios:** Minimum 4.5:1 for body text; minimum 3:1 for large display headers and active UI boundaries.
* **Keyboard Focus Rings:** Clear, high-contrast blue focus ring (`box-shadow: 0 0 0 3px rgba(59,130,246,0.5)`) on all focusable elements.
* **Motion Invariants:**
  * Transitions strictly bounded between $150\text{ms}$ and $200\text{ms}$ ease-out curves.
  * Zero looping animations, flashing elements, or pulsing text.
  * Respects `prefers-reduced-motion` flags across all client styles.

---

## 13. Design System Governance

To prevent component fragmentation:
1. **Single Source of Truth:** All styles consume defined CSS custom properties / utility tokens.
2. **Zero Ad-Hoc Styling:** Engineers are prohibited from embedding arbitrary hex codes in domain components.
3. **Automated Visual Regression:** CI/CD pipeline tests ensure components maintain pixel-perfect geometry across releases.

---

## 14. Final Design Principle

> **The Design System delivers a bright, calm, and trustworthy foundation where safety status is instantly scannable, actions are unmistakable, and every element reinforces operational accountability.**
