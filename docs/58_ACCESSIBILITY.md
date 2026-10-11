# Accessibility Specification

**Document ID:** `58_ACCESSIBILITY`  
**Status:** Draft  
**Version:** 1.0.0  
**Last Updated:** 2026-10-07  
**Author:** Heat Action Response Engine Team  

---

## 1. Purpose & Core Philosophy

The purpose of this specification is to define how the Heat Action Response Engine ensures that environmental heat-risk assessments, operational mitigation directives, acknowledgment workflows, and escalation records remain understandable, operable, perceivable, and robust across diverse human abilities, physical environments, devices, and connectivity constraints.

### Core Accessibility Principle

> **"Accessibility is a safety requirement because important heat-risk information and operational actions must remain understandable and actionable for the people responsible for responding to them."**

In a life-safety workplace system, an inaccessible user interface is an operational hazard. If a site supervisor in glaring sunlight cannot read a high-risk directive, if a safety manager with low vision cannot perceive an escalation timer, or if a user with motor dexterity challenges cannot trigger a mandatory hydration acknowledgment, the safety workflow fails.

Accessibility within this platform applies holistically to:
* **Visual Perception:** Contrast, typography, non-color status differentiation, and bright sunlight readability.
* **Keyboard Interaction:** Full pointer-free navigation for complex administrative and monitoring dashboards.
* **Screen Reader Assistive Tech:** Accurate semantic tree exposure, non-intrusive ARIA live regions, and descriptive labeling.
* **Touch & Mobile Interaction:** Large touch targets ($48 \times 48\text{ px}$ minimum), generous spacing, and one-handed outdoor operation.
* **Cognitive Load:** Calm urgency, plain language, predictable layouts, progressive disclosure, and minimal visual noise.
* **Physical & Environmental Conditions:** High-glare outdoor job sites, protective work gloves, noisy industrial machinery, and intermittent cellular connectivity.
* **Temporary & Situational Impairments:** Eye fatigue, physical exhaustion, divided attention, and high-stress field conditions.

---

## 2. Accessibility Goals & Compliance Targets

The platform is engineered to align with internationally recognized digital accessibility standards (targeting WCAG 2.1 Level AA conformance practices). Rather than claiming blanket certification, the engineering team adopts an evidence-based, verifiable posture:

> *“The implementation should target recognized WCAG accessibility practices across all components and core operational workflows, subject to continuous automated testing and manual assistive validation.”*

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      CORE ACCESSIBILITY TARGETS                        │
├──────────────────────┬─────────────────────────────────────────────────┤
│ PRINCIPLE            │ OPERATIONAL IMPLEMENTATION GOAL                 │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 1. Perceivable       │ Every safety status, numerical heat reading,    │
│                      │ and action directive is conveyed through both   │
│                      │ visual (text + icon) and programmatic channels. │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 2. Operable          │ All interactive features (acknowledgment,       │
│                      │ verification, escalation) can be executed via   │
│                      │ keyboard, touch, or assistive switch devices.   │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 3. Understandable    │ Interfaces use plain language, eliminate jargon,│
│                      │ provide clear error explanations, and follow a  │
│                      │ predictable, consistent information hierarchy.  │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 4. Robust            │ Semantic HTML ensures resilient parsing across  │
│                      │ browsers, mobile webviews, screen readers, and  │
│                      │ constrained network user agents.                │
├──────────────────────┼─────────────────────────────────────────────────┤
│ 5. Error-Tolerant    │ Critical safety actions prevent accidental      │
│                      │ clicks and provide accessible confirmation      │
│                      │ without blocking urgent response times.         │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Target Users & Environmental Contexts

The accessibility architecture directly addresses the real-world operational environments of the platform's primary personas (as defined in `13_PERSONAS.md` and `06_TARGET_USERS.md`):

### 3.1 Field Site Supervisors (Mobile, Outdoor Context)
* **Environment:** Outdoor construction sites, loading docks, agricultural fields, bright direct sunlight, ambient dust, ambient noise ($>80\text{ dB}$).
* **User Constraints:** Wearing work gloves or safety gear, sweaty hands, dirty screens, moving around the facility, split attention between physical workers and mobile screen.
* **Accessibility Demands:**
  * High-contrast light UI (optimizing sunlight visibility; avoiding low-contrast dark themes).
  * Prominent, unmissable primary touch target for action acknowledgment ($>48\text{ px}$).
  * Zero requirement for delicate pinch-to-zoom or multi-finger gestures.
  * Haptic and visual confirmation on critical action state changes.

### 3.2 Enterprise Safety Managers (Desktop / Tablet Context)
* **Environment:** Job-site trailers, regional command centers, corporate office desks.
* **User Constraints:** Monitoring 10 to 50 worksites simultaneously, fatigue from prolonged screen usage, cognitive strain during acute regional heatwaves.
* **Accessibility Demands:**
  * Logical tab stops and skip links across high-density data tables and site cards.
  * Screen-reader-friendly multi-site status feeds and escalation queues.
  * High contrast between active warning states and neutral operational baselines.
  * Support for screen zoom up to 200% without horizontal scroll breakdown.

### 3.3 Platform Administrators & Configuration Officers
* **Environment:** Office workstations, desktop setups.
* **Accessibility Demands:**
  * Accessible complex forms for worksite threshold configuration and shift schedules.
  * Explicit, field-associated validation messages and error summaries.
  * Full keyboard navigability for permission matrices and role assignment tables.

---

## 4. Accessibility Architecture

Accessibility is implemented as an end-to-end, cross-cutting discipline embedded at every architectural tier:

```text
┌──────────────────────────────────────────────┐
│     DESIGN SYSTEM (Tokens, Contrast, Type)   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│      SEMANTIC HTML (Native Elements, Roles)  │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│       KEYBOARD NAVIGATION (Focus, Traps)     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│   SCREEN READER LAYER (ARIA, Live Regions)   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│     VISUAL & TOUCH ACCESSIBILITY (48px, Hi-C)│
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│     COGNITIVE & CALM UX (Plain text, Flow)   │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│     REAL-TIME & ERROR ANNOUNCEMENTS (Polite) │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│      CONTINUOUS ACCESSIBILITY TESTING        │
└──────────────────────────────────────────────┘
```

---

## 5. Semantic HTML Foundation

The platform mandates native HTML elements over styled generic containers. Native semantic controls provide built-in keyboard accessibility, platform accessibility tree hooks, and consistent browser behavior:

```text
┌──────────────────────────┬──────────────────────────┬──────────────────────────┐
│ UI PURPOSE               │ MANDATED SEMANTIC TAG    │ PROHIBITED PATTERN       │
├──────────────────────────┼──────────────────────────┼──────────────────────────┤
│ Page Header / Banner     │ `<header role="banner">` │ `<div class="topbar">`   │
│ Primary Navigation       │ `<nav aria-label="...">` │ `<div class="nav-links">`│
│ Main Dashboard Content   │ `<main id="main-content">│ `<div class="content">`  │
│ Independent Action Card  │ `<article aria-label="..`│ `<div class="card">`     │
│ Auxiliary Sidebar / Rail │ `<aside>`                │ `<div class="sidebar">`  │
│ Interactive Action CTA   │ `<button type="button">` │ `<div onclick="...">`    │
│ Page Links / Routing     │ `<a href="...">`         │ `<span class="link">`    │
│ Multi-Site Data Overview │ `<table>, <caption>`     │ Flexbox div grid tables  │
│ Operational Form         │ `<form>, <fieldset>`     │ Bare unassociated inputs │
└──────────────────────────┴──────────────────────────┴──────────────────────────┘
```

### Rationale
* **Assistive Tech Navigation:** Screen readers allow users to jump directly between landmarks (`main`, `nav`, `header`).
* **Keyboard Focusability:** Buttons and anchors receive native tab focus and respond to `Enter` and `Space` without brittle custom event listeners.
* **Browser Accessibility API:** Native elements map directly to platform accessibility APIs across Windows, iOS, and Android.

---

## 6. Heading Hierarchy & Document Structure

Every view adheres to a strict, non-skipping heading structure to allow seamless screen-reader navigation:

```text
H1: Worksite Operational Dashboard — North Bengaluru
├── H2: Environmental Heat Assessment
│   └── H3: Current Weather Parameters & Observation
├── H2: Immediate Action Directives (2 Active)
│   ├── H3: Mandatory Hydration & Shade Rest (High Priority)
│   └── H3: Heavy Equipment Shift Rotation (Moderate Priority)
├── H2: Active Escalation Alerts
└── H2: Shift Activity & Verification Log
```

### Strict Hierarchy Rules
1. **Single `<h1>` per view:** Encapsulates the core document context (e.g., page title or primary worksite).
2. **No skipping heading levels:** An `<h2>` is never followed directly by an `<h4>` simply to achieve smaller styling. Visual font scale is decoupled from semantic heading levels via design tokens.
3. **Descriptive heading text:** Headings must clearly convey section contents without requiring visual icon interpretation.

---

## 7. Keyboard Accessibility & Navigation

All interactive features must be $100\%$ operable via keyboard alone. Pointer devices are never assumed.

### 7.1 Global Keyboard Shortcuts & Traversal
* **Skip Links:** A prominent skip link (`"Skip to main operational actions"`) appears as the first focusable element on every page, allowing keyboard users to bypass navigation headers directly into urgent tasks.
* **Tab Order:** Follows the logical, visual reading flow (top-to-bottom, left-to-right). Tab order must never be artificially altered using positive `tabindex` values.
* **Standard Keyboard Controls:**
  * `Tab` / `Shift + Tab`: Move forward and backward across interactive controls.
  * `Enter`: Activate buttons, links, and submit forms.
  * `Space`: Toggle checkboxes, expand drawers, activate buttons.
  * `Escape`: Dismiss dialogs, cancel confirmation popups, collapse slide-over detail drawers.
  * `Arrow Keys`: Navigate within tablists, radio groups, and table grids.

### 7.2 Safety-Critical Workflow Keyboard Operability
The primary operational flow must be seamlessly executable with zero pointer contact:
```text
[Skip Link] 
     ↓ 
[Select Action Card (Tab)] 
     ↓ 
[Review Why Link (Enter)] 
     ↓ 
[Acknowledge Button (Tab + Enter)] 
     ↓ 
[Confirmation Dialog Opens: Focus trapped] 
     ↓ 
[Confirm (Enter)] 
     ↓ 
[Focus smoothly returned to next pending Action Card]
```

---

## 8. Focus Management

Focus must never be lost, trapped unintentionally, or reset to the top of the window during dynamic DOM updates:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        FOCUS MANAGEMENT PROTOCOL                       │
├──────────────────────┬─────────────────────────────────────────────────┤
│ EVENT                │ MANDATED FOCUS BEHAVIOR                         │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Route / View Change  │ Focus automatically placed on `<h1>` or primary │
│                      │ page container with `tabindex="-1"`.            │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Modal / Dialog Open  │ Focus trapped within dialog; initially focused   │
│                      │ on primary action or close button.              │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Modal / Dialog Close │ Focus returned to the element that triggered it │
│                      │ (e.g., the [ Acknowledge ] button).             │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Form Submit Error    │ Focus placed on the first invalid input field;  │
│                      │ error announced via `aria-describedby`.         │
├──────────────────────┼─────────────────────────────────────────────────┤
│ Dynamic State Update │ Background real-time refreshes MUST NEVER steal │
│ (e.g. Risk changes)  │ user focus while they are typing or reviewing.  │
└──────────────────────┴─────────────────────────────────────────────────┘
```

---

## 9. Screen Reader Support & Programmatic Labeling

All visual elements convey equivalent programmatic meaning to assistive technologies.

### 9.1 Status & Card Programmatic Descriptions
```html
<!-- Example of fully accessible Action Card -->
<article aria-labelledby="action-title-882" aria-describedby="action-meta-882">
  <div class="priority-badge" aria-label="Priority: High">
    <span aria-hidden="true">⚠️</span> HIGH
  </div>
  <h3 id="action-title-882">Mandatory Hydration & Shade Rest</h3>
  <div id="action-meta-882">
    <p>Status: <span class="status-text">Pending Acknowledgment</span></p>
    <p>Assigned to: Rahul Kumar</p>
    <p>Acknowledgment Deadline: 14:35 IST (10 minutes remaining)</p>
  </div>
  <button type="button" aria-label="Acknowledge Mandatory Hydration & Shade Rest Action">
    Acknowledge
  </button>
</article>
```

### 9.2 Programmatic Rules
* **No Icon-Only Controls:** Buttons with visual icons (e.g., a bell or an info bubble) must contain either visually hidden text (`<span class="sr-only">Notifications (3 unread)</span>`) or explicit `aria-label` attributes.
* **Decorative Graphics:** Purely decorative icons must include `aria-hidden="true"` to prevent redundant screen-reader noise.
* **Dynamic Badges:** Badges include their categorical dimension in their screen-reader label: `"Risk Level: HIGH"`, `"Data Quality: STALE"`, `"Status: ESCALATED"`.

---

## 10. Color Independence & Accessibility

In strict alignment with `55_DESIGN_SYSTEM.md`, **color must never be the sole mechanism for conveying information, indicating an action, prompting a response, or distinguishing a visual element.**

```text
┌────────────────────────────────────────────────────────────────────────┐
│                      MULTI-CHANNEL STATUS CODING                       │
├───────────────┬──────────────┬──────────────┬──────────────────────────┤
│ RISK / STATUS │ COLOR TOKEN  │ TEXT LABEL   │ ICON / SHAPE INDICATOR   │
├───────────────┼──────────────┼──────────────┼──────────────────────────┤
│ LOW           │ Green-600    │ "LOW"        │ Minimal check / calm dot │
│ MODERATE      │ Amber-600    │ "MODERATE"   │ Warning triangle ⚠️       │
│ HIGH          │ Orange-600   │ "HIGH"       │ Urgent alert shield ⛨    │
│ CRITICAL      │ Red-600      │ "CRITICAL"   │ Hexagon exclamation 🛑   │
│ UNKNOWN       │ Slate-500    │ "UNKNOWN"    │ Question circle ❓        │
│ STALE DATA    │ Amber-700    │ "STALE"      │ Clock with slash 🕒      │
│ SIMULATION    │ Purple-700   │ "SIMULATION" │ Science beaker ⚗️         │
└───────────────┴──────────────┴──────────────┴──────────────────────────┘
```

A user experiencing red-green color deficiency (deuteranopia/protanopia) or viewing the screen in monochrome grayscale e-ink mode can effortlessly distinguish every status through explicit typographical text and distinct icon shapes.

---

## 11. Contrast Requirements

The interface enforces strict contrast ratios against the bright, clean, light-theme background (`#F8FAFC` / `#FFFFFF`):

* **Body & Heading Text:** Minimum $4.5:1$ contrast ratio against its background (achieved via Slate-900 `#0F172A` $\approx 15.5:1$).
* **Secondary & Meta Text:** Minimum $4.5:1$ contrast ratio (achieved via Slate-700 `#334155` $\approx 8.5:1$; Slate-400 is restricted to non-text borders).
* **Interactive UI Controls & Buttons:** Minimum $3:1$ contrast against adjacent background colors.
* **Focus Rings:** High-visibility outline `#2563EB` with $2\text{ px}$ offset, maintaining $>3:1$ contrast against both the button surface and page background.
* **Sunlight Glare Allowance:** In high-illumination environments, standard $4.5:1$ text may degrade; hence, critical risk cards use darkened border lines ($1.5\text{ px}$, Slate-300 `#CBD5E1`) and high-weight bold typography.

---

## 12. Risk Level Accessibility & The "Unknown" Rule

Heat risk levels carry clear, unambiguous textual descriptors across all presentation formats:

```text
┌──────────────┬───────────────────────────────┬─────────────────────────┐
│ RISK LEVEL   │ SCREEN READER OUTPUT          │ ACCESSIBLE DESCRIPTION  │
├──────────────┼───────────────────────────────┼─────────────────────────┤
│ LOW          │ "Risk assessment: LOW"        │ Standard precautions    │
│ MODERATE     │ "Risk assessment: MODERATE"   │ Increased vigilance     │
│ HIGH         │ "Risk assessment: HIGH"       │ Active heat mitigation  │
│ CRITICAL     │ "Risk assessment: CRITICAL"   │ Curtailment / emergency │
│ UNKNOWN      │ "Risk assessment: UNKNOWN"    │ Insufficient telemetry  │
└──────────────┴───────────────────────────────┴─────────────────────────┘
```

### The Strict "UNKNOWN" Accessibility Rule
> **"UNKNOWN must never visually or programmatically resemble LOW risk."**

* Low risk indicates that validated environmental conditions do not exceed safe workplace limits.
* Unknown risk indicates an absence of valid telemetry, missing weather inputs, or calculation failure.
* Presenting `UNKNOWN` with reassuring green styling or calm checkmarks is a catastrophic life-safety flaw. `UNKNOWN` must be announced and displayed with neutral slate styling, question mark iconography, and explicit explanatory copy: *"Unable to calculate risk; maintain heightened manual vigilance."*

---

## 13. Data Quality Accessibility

Data quality is an orthogonal dimension to risk severity and is represented independently:

```text
┌─────────────────┬───────────────────────────────┬──────────────────────┐
│ DATA QUALITY    │ TEXT LABEL & BADGE            │ ACCESSIBLE MEANING   │
├─────────────────┼───────────────────────────────┼──────────────────────┤
│ VALID           │ "Data Quality: VALID"         │ Fresh telemetry      │
│ AGING           │ "Data Quality: AGING"         │ Telemetry nearing    │
│                 │                               │ refresh horizon      │
│ STALE           │ "Data Quality: STALE"         │ Telemetry overdue;   │
│                 │                               │ may not reflect now  │
│ MISSING         │ "Data Quality: MISSING"       │ Weather feed absent  │
│ INVALID         │ "Data Quality: INVALID"       │ Telemetry failed QA  │
│ CONFLICTING     │ "Data Quality: CONFLICTING"   │ Sensors disagree     │
└─────────────────┴───────────────────────────────┴──────────────────────┘
```

Both screen readers and visual displays pair data quality with explicit timestamps:
`"Data quality: STALE. Weather observation last confirmed 42 minutes ago at 14:00."`

---

## 14. Current Observation vs. Forecast Accessibility

Observed conditions and predictive forecasts must never be conflated:

* **Observed Data:** Tagged as `"Current Observed Condition (14:00 AWS-01)"`.
* **Forecasted Data:** Tagged as `"Model Forecast Run for 16:00 (Generated 12:00)"`.
* **Screen Reader Announcement:**
  *"Current observed heat index is 41 degrees Celsius. Forecast for 15:00 is 44 degrees Celsius. Forecast indicates increasing risk."*

---

## 15. Real-Time Updates & ARIA Live Region Protocol

Dynamic operational updates must not flood assistive technology users with disruptive audio streams. The platform classifies live announcements into three discrete tiers:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        ARIA LIVE REGION TIERS                          │
├──────────────┬──────────────────┬──────────────────────────────────────┤
│ TIER         │ ARIA ATTRIBUTES  │ APPLICATION TRIGGERS                 │
├──────────────┼──────────────────┼──────────────────────────────────────┤
│ Critical /   │ `aria-live=      │ • Immediate Escalation Triggered     │
│ Assertive    │  "assertive"`    │ • Worksite transition to CRITICAL    │
│              │ `role="alert"`   │ • Safety Curtailment Ordered         │
├──────────────┼──────────────────┼──────────────────────────────────────┤
│ Operational /│ `aria-live=      │ • New Action Assigned to User        │
│ Polite       │  "polite"`       │ • Action Acknowledgment Confirmed    │
│              │ `role="status"`  │ • Worksite transition to HIGH        │
│              │                  │ • Data Quality shifted to STALE      │
├──────────────┼──────────────────┼──────────────────────────────────────┤
│ Background / │ `aria-live="off"`│ • Routine hourly weather refresh     │
│ Silent       │                  │ • Shift checkout counter increment   │
│              │                  │ • Minor chart coordinate re-render   │
└──────────────┴──────────────────┴──────────────────────────────────────┘
```

### Protocol Safeguards
1. **Deduplication:** Repeated status pings do not trigger repeated screen reader announcements.
2. **Context Retention:** Announcements provide full context: *"Alert: Action Mandatory Hydration Break has been ESCALATED due to no acknowledgment in 15 minutes."*
3. **No Focus Stealing:** Live regions announce audibly without moving the user's cursor or focus.

---

## 16. Accessible Notifications

Notifications (banners, drawer items, and toasts) must be operable across all modalities:
* **Persistent Record:** Notifications are never delivered solely as auto-dismissing toasts. Every operational toast mirrors an entry in the persistent Notification Center.
* **Readable Duration:** Temporary toasts remain visible for at least $10\text{ seconds}$ and pause on mouse hover or keyboard focus.
* **Independent Controls:** Every notification panel provides accessible `[ Dismiss ]` and `[ Mark as Read ]` buttons with clear labels.

---

## 17. Action Workflow Accessibility

The core human response loop (`16_ACTION_MODEL.md`) enforces accessible state tracking:

```text
┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ PENDING ACK  │ ───>  │ ACKNOWLEDGED │ ───>  │ IN PROGRESS  │ ───>  │   VERIFIED   │
└──────────────┘       └──────────────┘       └──────────────┘       └──────────────┘
```

### Accessible State Disambiguation
* **`ACKNOWLEDGED` $\neq$ `VERIFIED`:**
  * When a supervisor acknowledges an action, the system announces: *"Action acknowledged by Rahul Kumar at 14:22. Action status is now In Progress. Mitigation measures must be physically executed on site."*
  * The system never automatically marks an action as verified upon acknowledgment.
* **Action Explainability:** Every action includes an accessible `"Why is this required?"` disclosure trigger linking to the deterministic rule reasoning.

---

## 18. Accessible Forms & Error Handling

All forms (worksite creation, shift adjustments, delay justification) follow bulletproof accessibility patterns:
* **Explicit Labels:** Every `<input>`, `<select>`, and `<textarea>` is tied to a `<label>` via matching `id` and `for` attributes.
* **Instructional Hints:** Described using `aria-describedby` linking to hint paragraphs.
* **Clear Error Associations:** When validation fails, the input receives `aria-invalid="true"` and `aria-errormessage="error-id"`.
* **Specific Error Messages:**
  * *Bad:* `"Invalid coordinate."`
  * *Good:* `"Latitude must be a decimal between 8.0 and 37.0 degrees for India region."`
* **Preservation of Input:** Form submission failures retain all validly entered user values.

---

## 19. Touch Accessibility & Outdoor Ergonomics

In field operations, touch targets must accommodate protective gear and adverse physical conditions:
* **Minimum Target Dimensions:** Every interactive touch target measures at least $48 \times 48\text{ CSS pixels}$ (conforming to WCAG 2.5.5 and Android/iOS touch guidelines).
* **Target Spacing:** Minimum $8\text{ px}$ physical separation between adjacent buttons to eliminate accidental misclicks.
* **Safe Separation of Destructive Actions:** Destructive or irreversible actions (e.g., dismissing an action or escalating a dispute) are visually and physically separated from routine confirmations.
* **No Gesture Exclusivity:** Core actions must never rely solely on complex swipe, drag, or multi-finger gestures. All features can be activated via single-tap controls.

---

## 20. Cognitive Accessibility & Calm Urgency

Cognitive ergonomics directly influence workplace safety under high-heat conditions:
* **Plain Language:** Complex meteorological terminology (e.g., *"wet-bulb globe temperature deviation matrix"*) is translated into operational directives: *"High Risk: 30 minutes rest per hour required under shade."*
* **Predictable Layouts:** Action cards appear in the exact same screen location across all worksites.
* **Progressive Disclosure:** Essential instructions are presented above the fold; advanced telemetry and audit trails remain accessible behind clear expansion toggles.
* **No Panic Inducers:** The UI avoids continuous pulsing borders, strobe animations, or harsh alarm tones, maintaining calm, disciplined focus.

> **"The user should not need to interpret the interface before understanding what requires attention."**

---

## 21. Language, Localization & Controlled Terminology

While the MVP is provided in English, the platform is architected for multilingual regional deployment (Hindi, Kannada, Tamil, Telugu, Marathi):
* **Controlled Terminology Repository:** Safety-critical terms (`CRITICAL RISK`, `MANDATORY BREAK`, `ESCALATED`) are mapped to fixed, standardized regional translations rather than raw runtime AI translation.
* **AI Translation Boundary:**
  ```text
  AUTHORITATIVE SAFETY EVENT
             │
             ▼
  DETERMINISTIC ACTION TEMPLATE
             │
             ▼
  CONTROLLED VOCABULARY TRANSLATION
             │
             ▼
  ACCESSIBLE USER DISPLAY
  ```
  AI language models may assist with explanatory phrasing, but authoritative safety statuses are never dynamically invented by LLMs.

---

## 22. Motion, Animation & Vestibular Safety

* **`prefers-reduced-motion` Compliance:** When the operating system setting `prefers-reduced-motion: reduce` is detected, all decorative transitions, sliding drawer animations, and fade-ins are disabled immediately.
* **Safety State Visibility:** Essential state changes (e.g., card border color transitions) snap instantly without relying on animations for comprehension.
* **Flashing Prohibitions:** No component flashes more than 3 times in any 1-second period, eliminating seizure hazards (WCAG 2.3.1).

---

## 23. Accessible Data Visualizations & Charts

Weather forecasts and risk trend charts (such as hourly heat index projections) must be accessible to non-sighted or low-vision users:
* **Textual Alternative Summary:** Every chart is accompanied by a concise screen-reader summary paragraph:
  *"Heat index projection chart for Today: Risk begins at MODERATE (36°C) at 09:00, peaks at HIGH (43°C) between 12:00 and 15:00, and returns to MODERATE by 17:00."*
* **Data Table Fallback:** Users can toggle from the graphical chart to a semantic HTML `<table>` showing hourly figures.
* **High-Contrast Data Lines:** Chart series lines utilize distinct dash patterns (solid vs. dashed vs. dotted) in addition to color.

---

## 24. Accessible Error States

When system or network errors occur, the UI provides actionable, respectful guidance:
```text
┌────────────────────────────────────────────────────────────────┐
│ ⚠ Environmental Refresh Disrupted                              │
│                                                                │
│ Telemetry feed from Regional Station AWS-04 timed out.         │
│ Last successful assessment confirmed: 14:10 IST (35 mins ago). │
│                                                                │
│ Operational Impact:                                            │
│ Current HIGH risk precautions remain in force.                 │
│ Do not relax workplace safeguards.                             │
│                                                                │
│ [ Retry Connection ]       [ Report Manual Observation ]       │
└────────────────────────────────────────────────────────────────┘
```
The system **never** downgrades an unresolved error to a false `LOW RISK` state.

---

## 25. Accessible Offline Status

In accordance with `54_MOBILE_UI.md` and `59_PWA.md`, offline connectivity is communicated with absolute clarity:
* Visual indicator: Neutral badge `○ Offline (Last synced 14:15)`.
* Screen reader announcement: *"Application is offline. Displaying cached operational state from 14:15. Actions submitted while offline will be queued for synchronization."*
* Prohibited behavior: The UI must never announce an offline action as successfully saved to the server until network synchronization is confirmed.

---

## 26. Accessibility in Simulation Mode

When running training simulations:
* Visual banner: High-contrast purple indicator `SIMULATION MODE — SYNTHETIC DRILL`.
* Screen reader announcement: *"Simulation mode is active. Displayed risk and action items are synthetic test exercises. No live field operational actions are required."*
* Complete distinction from production live streams.

---

## 27. Accessibility Testing Strategy

Accessibility quality assurance is enforced through a rigorous three-tiered testing protocol:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                     ACCESSIBILITY TESTING MATRIX                       │
├─────────────────────┬──────────────────────────────────────────────────┤
│ TESTING METHOD      │ TOOLS & SCOPE                                    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 1. Automated CI/CD  │ • axe-core integrated into component tests       │
│    Testing          │ • Lighthouse accessibility audits ($>95$ target) │
│                     │ • ESLint `jsx-a11y` strict rules                 │
│                     │ • Automated color contrast token verification    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 2. Manual Keyboard  │ • Full workflow navigation without mouse         │
│    Verification     │ • Visible focus ring inspection on all controls  │
│                     │ • Modal focus trapping and restoration checks    │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 3. Screen Reader    │ • NVDA & JAWS testing on Windows desktop         │
│    Validation       │ • VoiceOver testing on iOS mobile Safari         │
│                     │ • TalkBack testing on Android Chrome             │
├─────────────────────┼──────────────────────────────────────────────────┤
│ 4. Outdoor & Touch  │ • Bright sunlight field testing on mobile        │
│    Usability        │ • One-handed gloved touch target operation       │
└─────────────────────┴──────────────────────────────────────────────────┘
```

---

## 28. Accessibility Definition of Done (DoD)

Before any frontend feature, component, or screen is marked complete, it must satisfy the following checklist:

- [ ] Valid semantic HTML elements utilized (no generic interactive divs).
- [ ] Non-skipping heading structure (`h1` through `h3`) logically mapped.
- [ ] 100% operable via keyboard alone with visible, high-contrast focus rings.
- [ ] Modal dialogs trap and return focus accurately.
- [ ] Color is not the sole indicator for any status, risk, or data-quality metric.
- [ ] Minimum $4.5:1$ text contrast achieved across all light-theme surfaces.
- [ ] Touch targets measure at least $48 \times 48\text{ px}$ with $>8\text{ px}$ spacing.
- [ ] Screen readers accurately announce all card titles, statuses, and metadata.
- [ ] ARIA live regions applied politely; no disruptive focus hijacking.
- [ ] Form inputs have associated labels and descriptive field-level error messages.
- [ ] Data charts provide equivalent textual and tabular representations.
- [ ] `prefers-reduced-motion` suppresses all non-essential animations.
- [ ] Offline and simulation states are clearly announced to assistive tech.
- [ ] Core workflow (`LOGIN -> RISK -> ACTION -> ACKNOWLEDGE -> VERIFY`) passes manual screen-reader and keyboard testing.

---

## 29. MVP vs. Future Horizons

```text
┌───────────────────────────────────┬───────────────────────────────────┐
│ MVP RELEASE CAPABILITIES          │ FUTURE ROADMAP CAPABILITIES       │
├───────────────────────────────────┼───────────────────────────────────┤
│ • Strict Semantic HTML structure  │ • Full multilingual speech-to-text│
│ • Keyboard navigation & focus     │   voice acknowledgment commands   │
│ • WCAG 2.1 AA contrast compliance │ • Full offline audio briefings    │
│ • Multi-channel color independence│ • Native high-contrast e-ink mode │
│ • 48px touch targets for mobile   │ • Dedicated screen-magnification  │
│ • Screen reader labels & badges   │   hardware integration            │
│ • Polite ARIA live notifications  │ • Field user testing panels with  │
│ • Reduced motion support          │   differently abled workers       │
└───────────────────────────────────┴───────────────────────────────────┘
```

---

## 30. Final Principle

> **Accessibility is part of the Heat Action Response Engine's safety UX. A critical risk, action, acknowledgment state, escalation, or data-quality condition must remain understandable and actionable regardless of whether the user is viewing the system on a desktop, mobile device, with a keyboard, through assistive technology, in bright sunlight, or under constrained connectivity.**
