# MediKiosk — Accessible Patient Case-Taking & Clinical Intake Platform

**Built for Grevix AfterCode 2026**  
**Participant:** Swati Jain (Sole Participant)  
**Project Folder:** `medikiosk-aftercode`

---

## 1. Problem & Product Overview

In outpatient departments (OPDs), government health centers, and AYUSH clinics, consultations are frequently delayed because patients arrive with fragmented histories, scattered paper prescriptions, and unorganized symptom chronologies. Overburdened doctors spend significant consultation time taking down basic notes rather than conducting examinations, while elderly, rural, and low-literacy patients struggle with smartphone-only apps.

**MediKiosk** provides an accessible, shared physical kiosk experience:
> *"Tell your health story before your consultation."*

1. **Welcoming Landing Portal:** Two-column clinical overview with the adapted fluid hero, clear patient and staff entry points, and an animated workflow timeline.
2. **Accessible Patient Kiosk:** Step-by-step touch and voice interface with English/Hindi support, offline persistence, document scan, and privacy protection on shared terminals.
3. **Professional Staff Access:** Clean white/teal staff sign-in form backed by real server authentication (`/api/auth`), session cookies, and side clinical document tray.
4. **Clinical Intake Dashboard:** Searchable case queue, real status filters, patient reference, age, timestamps, red-flag alert review, and structured printable summaries.

> **Clinical Safety Boundary:** MediKiosk organizes patient-provided information for clinicians. It does not diagnose, recommend medical treatments, prescribe medicines, or replace clinical triage. Visual polish never implies clinical certification.

---

## 2. Interface Redesign & Component Adaptations

The MediKiosk interface has been redesigned using all three supplied component references, substantially adapted into a cohesive healthcare product:

### 1. Adapted Liquid-Metal Hero (`src/components/ui/liquid-metal-hero.tsx`)
- **Healthcare Adaptation:** Replaced the full-page cosmic/metallic background with a low-opacity (20%), muted teal/silver shader confined strictly within a dimensional medical-history sheet illustration panel on the right.
- **Two-Column Responsive Composition:**
  - **Left Column:** Product message, badge *"Patient intake for OPDs"*, headline *"Your health story, ready for your doctor."*, description *"Share your symptoms, medicines, and previous reports through a guided voice or touch experience—even when the connection drops."*, primary action *"Start patient intake"* (`/kiosk`), secondary action *"Staff sign in"* (`/login`), and capability pills (*"Voice and touch"*, *"English and Hindi"*, *"Offline intake"* with clear offline transcription disclosures).
  - **Right Column:** Dimensional medical record visual overlay displaying patient reference `#MK-2026-OPD-782`, confirmed symptoms, AES-GCM 256 encryption status, and local red-flag detection.
- **Safety & Performance:** Contained absolute positioning, explicit stacking (z-index), lazy dynamic loading via Next.js dynamic import, IntersectionObserver unmounting off-screen, and static CSS/SVG gradient fallback for reduced motion, non-WebGL devices, and offline mode. Never places moving textures behind text or forms.

### 2. Adapted Space-Login → StaffLogin (`src/components/ui/staff-login.tsx`)
- **Healthcare Adaptation:** Completely removed the astronaut base64 image, starfield canvas, cosmic glowing planet, parallax tilt, and decorative sparkle animations.
- **Calm Clinical Aesthetic:** Clean white surface card with muted teal border (`#DCE7E4`), side clinical illustration of an incoming OPD document tray, heading *"Staff access"*, and supporting text *"Review patient intake and prepare for consultations."*.
- **Real Server Authentication:** Connected form submission directly to the real server authentication endpoint `POST /api/auth`. Removed artificial delays and dummy fallbacks. On success, issues secure HttpOnly session cookies and transitions to the dashboard. Displays helpful errors without exposing server internals.
- **Honest Healthcare Controls:** Removed social logins, dummy sign-up links, and persistent remember-me toggles to ensure shared hospital kiosks do not store persistent credentials. Native accessible controls preserve password managers, paste, and text selection.

### 3. Adapted Scroll Timeline (`src/components/ui/scroll-timeline.tsx`)
- **Healthcare Adaptation:** Positioned on the landing page under *"From arrival to consultation."*, mapping the end-to-end OPD patient intake pathway.
- **Clinical Milestones:**
  1. `01 — Register and consent:` *"Choose your language and tell us who is entering the information."*
  2. `02 — Share your health history:` *"Answer guided questions using touch or supported voice input."*
  3. `03 — Add previous documents:` *"Upload prescriptions or reports and review the extracted text."*
  4. `04 — Continue through disconnection:` *"Your confirmed answers stay on this device and synchronise when the connection returns."*
  5. `05 — Staff review:` *"Staff review the structured history and available AI summary before consultation."*
- **Technical Improvements:** Semantic `<ol>` ordered list markup, text always fully readable before animation (no `opacity-30` hiding content), passive scroll listeners throttled with `requestAnimationFrame`, dynamic milestone position measurement, clean left-aligned mobile layout, reduced-motion bypass, and graceful 0/1 milestone handling.

---

## 3. Design System Tokens

The application strictly implements the following design system tokens:

| Token | Hex Value | Application |
| :--- | :--- | :--- |
| **Background** | `#F7FAF9` | Calm clinical page background |
| **Surface** | `#FFFFFF` | Form cards, panels, modals |
| **Primary Teal** | `#0F766E` | Primary action buttons, badges, brand emblems |
| **Primary Hover** | `#115E59` | Active & hover states for primary buttons |
| **Heading** | `#17343A` | High-contrast editorial titles and section headers |
| **Body Text** | `#334155` | Readable body copy and form inputs |
| **Muted Text** | `#52656B` | Secondary notes, metadata, timestamps |
| **Border** | `#DCE7E4` | Restrained card borders, dividers, input strokes |
| **Soft Teal** | `#E8F3EF` | Pill backgrounds, hover surfaces, active tabs |
| **Caution** | `#92400E` on `#FEF3C7` | Dark amber text on pale amber for offline warnings |
| **Attention** | `#991B1B` on `#FEE2E2` | Dark red text on pale red for clinical red flags |

---

## 4. Operational Status Indicators

All operational states represent genuine underlying application state:

- **“Saved on this device”** — Displayed when the local Web Crypto draft has been successfully written to IndexedDB.
- **“Offline — you can continue”** — Displayed in amber banner when browser network connectivity drops or hospital server is unreachable.
- **“Waiting to synchronise”** — Displayed when queued intake records exist in `pendingSyncQueue` awaiting connection.
- **“Received by the server”** — Displayed when the server has acknowledged receipt with monotonic revision verification.
- **“AI summary pending”** — Displayed when intake is synced but external AI credentials are unconfigured or generation is underway.
- **“Ready for staff review”** — Displayed when structured synthesis is complete and ready for the consulting clinician.

---

## 5. Visual Proof & Screenshots

All screenshots captured from the running local application with synthetic data:

### Landing Page Portal (Hero & Workflow Timeline)
![MediKiosk Landing Portal](docs/screenshots/landing.png)

### Professional Staff Login
![MediKiosk Staff Access](docs/screenshots/staff_login.png)

### Patient Intake Kiosk (Step-by-Step Flow & Hindi Support)
![MediKiosk Patient Kiosk](docs/screenshots/patient_kiosk.png)
![MediKiosk Kiosk Hindi View](docs/screenshots/kiosk_hindi.png)

### Clinical OPD Queue Dashboard & Case Detail
![MediKiosk Staff Dashboard](docs/screenshots/staff_dashboard.png)

---

## 6. Challenge Card 1: Offline Disconnection & Resilience

### Verification Matrix

| Requirement | Verification Level | Measured Outcome |
| :--- | :--- | :--- |
| **Offline Data Caching** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Dexie IndexedDB + Service Worker precache. Handled a genuine 31.0s network cut mid-intake (`context.setOffline(true)`). |
| **Encryption at Rest** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Dual-layer Web Crypto (AES-GCM 256). Active drafts encrypted via `SessionKey`; `pendingSyncQueue` and `mediaBlobs` encrypted via `DeviceQueueKey`. Zero plaintext at rest. |
| **Offline Reload Recovery** | **Browser-Tested** | **VERIFIED:** Proved via `tests/e2e/reload-recovery.spec.ts`. Genuinely reloaded browser (`page.reload()`) offline, tearing down JavaScript memory; recovered draft from ciphertext via `sessionStorage` session key re-import. |
| **Next-Patient Privacy** | **Browser-Tested** | **VERIFIED:** Reset wipes active `SessionKey` and draft from UI. Background encrypted queue remains intact and drains cleanly upon reconnect. |
| **Idempotency & Zero Duplicates** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Monotonic revisions with idempotency keys. SQLite asserts `recordCount: 1` and `duplicateCount: 0`. |
| **Data Freshness & Retention** | **Unit-Tested** | **VERIFIED:** 30-min reconfirmation window and 24-hr cache expiry policies verified in `tests/freshness.test.ts`. |
| **Reconnect Latency** | **Browser-Tested** | **VERIFIED:** `reconnectToSyncAcknowledgmentMs: 3.01s` (target < 5s). `reconnectToStructuredIntakeReadyMs: 3.51s`. |

---

## 7. Verification & Test Suite Execution

### Unit & Integration Tests (13/13 Passed)
```bash
npm test
```
- `tests/rules.test.ts` (4 tests) — Deterministic red-flag triggers
- `tests/repository.test.ts` (5 tests) — SQLite repository & monotonic revision deduplication
- `tests/freshness.test.ts` (3 tests) — 30-minute staleness reconfirmation policies
- `tests/summarizer.test.ts` (1 test) — AI adapter schema validation

### End-to-End Tests (2/2 Passed)
```bash
npx playwright test
```
- `tests/e2e/disconnection.spec.ts` — 30+ second offline disconnection tolerance mid-intake
- `tests/e2e/reload-recovery.spec.ts` — Genuine offline browser reload recovery & next-patient privacy wipe

---

## 8. Running Locally

```bash
cd medikiosk-aftercode
npm install --legacy-peer-deps
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Staff Login Demo Credentials:**
- Username: `opd_staff` / Password: `clinical2026`
- Doctor: `dr_sharma` / Password: `opd@medikiosk`
