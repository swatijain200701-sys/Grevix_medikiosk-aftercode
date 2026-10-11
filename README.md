# MediKiosk - Accessible Clinical Outpatient Intake & OPD Triage Organizer

> **Hackathon Prototype Demonstration:** An accessible, dignified digital intake terminal and clinical triage assistant built for outpatient departments (OPDs), walk-up kiosk accessibility, and intermittent network resilience.

---

## 1. Executive Summary & Clinical Context

In overburdened outpatient waiting halls, consultation time is severely constrained. Patients frequently arrive with unstructured paper records, anxiety, and fragmented symptoms.

### Your Health Story, Ready Before Your Consultation
MediKiosk helps you share symptoms, medicines, allergies, and previous reports through guided questions. Hospital staff can review the information before your consultation. Your intake progress stays saved during temporary internet interruptions.

### The Three Steps
1. **Tell us about your health:** Step-by-step touch and voice intake in **English and Hindi** with large (48px+) controls, plain-language consent, and clear "Unknown" vs "None reported" options.
2. **Review and confirm your answers:** Inspect all captured symptoms, conditions, and prescription documents before submission.
3. **Share a structured summary with hospital staff:** Hospital clinicians review an organized clinical synopsis with deterministic red-flag alerts before consultation begins.

> **Important Clinical & Prototype Notice:**  
> All data presented in this public demonstration is synthetic and fictional. MediKiosk is an operational prototype designed to streamline intake workflows; AI-generated summaries assist clinician review and **do not** provide automated medical diagnosis or treatment plans.

---

## 2. Participant Feedback Integration (Challenge Card 2)

We actively invite judges, clinical staff, and patient advocates to test MediKiosk and critique the experience:

- **Official Google Feedback Form:** [https://forms.gle/UM6smWDSmxzCiAwh6](https://forms.gle/UM6smWDSmxzCiAwh6)  
- **Access Points in Application:**
  - Landing page top navigation (`Give feedback`)
  - Dedicated landing page feedback strip
  - Kiosk intake completion screen
  - Clinical dashboard navigation bar and sample view banner
- **Privacy & Data Security:** Links open directly in a new browser tab (`target="_blank" rel="noopener noreferrer"`). No patient demographics, medical answers, or session tokens are ever passed into the form URL.
- **Challenge Card 2 Status:** **Pending Genuine Feedback**. In strict adherence to hackathon integrity, Challenge Card 2 is logged in [`feedback/README.md`](feedback/README.md) and will only be marked complete once authentic user responses are collected from external testers and a verified code change is committed.

---

## 3. Honest Optional ABHA Integration Flow

MediKiosk implements an honest, transparent demographic pre-fill architecture aligned with the Ayushman Bharat Digital Mission (ABDM) standards:

- **Current Status:** `ABHA connection — not configured` (displayed clearly on registration).
- **Intended Purpose:** Reducing redundant demographic entry (name, age, gender) during registration. We make no unsubstantiated claims regarding measured queue reduction.
- **Zero-Obstruction Fallback:** Patients can always click **"Continue without ABHA"** to proceed immediately with standard registration, which functions completely offline.
- **Explicit Consent & Confirmation:** Imported demographic details are never automatically applied without patient review. Patients must confirm imported values before they become part of the case record.
- **Demonstration Preview:** A synthetic ABDM sandbox preview is provided using permitted synthetic test identities (`Ramesh Kumar, 54 Y, ABHA: 14-XXXX-XXXX-0012`), demonstrating the exact confirmation UI without collecting real citizen identity numbers.
- **Remaining Production Requirements:** Full live production integration requires:
  1. ABDM Sandbox Client ID and Client Secret from the National Health Authority (NHA).
  2. Health Facility Registry (HFR) and Health Professional Registry (HPR) onboarding.
  3. M1 (Milestone 1) ABDM compliance certification for demographic verification.
  4. Server-to-server HIP/HIU gateway integration with secure token rotation.

---

## 4. Dark Healthcare Design System

The application strictly implements a calm, high-contrast **Dark Healthcare Design System**:

| Token Name | Hex Value | Application & Usage |
| :--- | :--- | :--- |
| **Main Background** | `#08121B` | Primary page & terminal backdrop |
| **Section Background** | `#0C1924` | Hero section, header bar, navigation rails |
| **Card Surface** | `#122330` | Kiosk step container, dashboard queue table, review modal |
| **Elevated Surface** | `#18303D` | Form inputs, buttons, document tray cards, milestone markers |
| **Borders** | `#294350` | Thin, deliberate borders across inputs, cards, and tables |
| **Primary Text** | `#F1F6F8` | High-contrast headings, active labels, primary values |
| **Secondary Text** | `#B6C7CF` | Comfortable body text, card descriptions, table cells |
| **Muted Text** | `#91A8B3` | Timestamps, metadata labels, helper guidance |
| **Primary Teal** | `#50D6C5` | Interactive brand accent, timeline progress line, active badges |
| **Primary Button Text**| `#062820` | Deep contrast text on primary teal buttons |
| **Focus Indicator** | `#7DD3FC` | Accessible 2px outline for keyboard navigation (`:focus-visible`) |
| **Caution Amber** | `#FBBF24` on `#261B0E` | Amber border `#854D0E` for offline notices & unconfirmed voice |
| **Attention Coral/Red**| `#F87171` on `#2B1417` | Red border `#991B1B` for clinical triage red flags & errors |

### Accessibility & Interaction Standards
- **Large Touch Targets:** All interactive controls are at least **48px tall** (`min-h-[48px]`).
- **Devanagari / Hindi Support:** High-legibility typography rendered using `Noto Sans Devanagari` and `Mangal` fallbacks with full UTF-8 character integrity.
- **Distinguishable States:** Selected options are differentiated by border thickness, background tint, explicit checkmark icon, and font weight—not color alone.
- **Print Optimization:** Printable intake reports automatically render with a **pure white background and dark text** (`@media print`) so physical printing remains clear and ink-efficient.
- **Reduced Motion:** Interactive liquid metal shader is suspended under `prefers-reduced-motion` and paused when scrolled out of view.

---

## 5. Public Demo Protections & Tester Privacy

To protect visitor privacy while enabling public testing:
1. **Sample Staff View (`/dashboard?sample=true`):** Public testers explore the clinical review dashboard using fixed synthetic fixtures (`Ramesh Kumar`, `Sunita Devi`, `Ananya Sharma`). Visitors can test triage categories, add notes, and inspect modal summaries without seeing other testers' submissions.
2. **Server-Side API Authorization:** Live database endpoints (`/api/cases` and `/api/cases/[caseId]`) are protected server-side with cookie authentication (`medikiosk_staff_session`). Unauthenticated requests are rejected with HTTP 401 Unauthorized.
3. **Session Isolation:** Interactive demo submissions made in `/kiosk` are encrypted and session-isolated.
4. **Credential Boundary:** Registered staff credentials (`opd_staff` / `clinical2026`) allow authorized clinicians to access the live OPD queue.

---

## 6. Architecture & Deployment Setup

### Data Persistence Architecture
- **Adapter:** SQLite via `better-sqlite3` with Write-Ahead Logging (`WAL` mode) and transactional idempotency.
- **Persistent Storage:** Mounted persistent disk on `/var/data` configured via `render.yaml` with `DATA_DIR=/var/data`.
- **Durability Guarantee:** SQLite is never stored on ephemeral lambda filesystems or `/tmp`.
- **Render Service Blueprint:** Defined in [`render.yaml`](render.yaml) using Node.js web service on persistent starter plan ($7/mo + $0.25/GB disk). Note: In accordance with hackathon instructions, paid resources are not activated without explicit approval.

---

## 7. Challenge Card 1: Offline Disconnection & Resilience

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

## 8. Verification & Test Suite Execution

### Unit & Integration Tests (13/13 Passed)
```bash
npm test
```
- `tests/rules.test.ts` (4 tests) - Deterministic red-flag triggers
- `tests/repository.test.ts` (5 tests) - SQLite repository & monotonic revision deduplication
- `tests/freshness.test.ts` (3 tests) - 30-minute staleness reconfirmation policies
- `tests/summarizer.test.ts` (1 test) - AI adapter schema validation

### End-to-End Tests (2/2 Passed)
```bash
npm run test:e2e
```
- `tests/e2e/disconnection.spec.ts` - 30+ second offline disconnection tolerance mid-intake
- `tests/e2e/reload-recovery.spec.ts` - Genuine offline browser reload recovery & next-patient privacy wipe

### Type Check & Production Build
```bash
npx tsc --noEmit     # 0 errors
npm run build        # Production build successful with Turbopack
```

---

## 9. Visual Proof & Screenshots

All screenshots captured from the running local application with synthetic data:

### Landing Page Portal (Hero & Workflow)
![MediKiosk Landing Portal](docs/screenshots/landing.png)

### Professional Staff Login
![MediKiosk Staff Access](docs/screenshots/staff_login.png)

### Patient Intake Kiosk (Step-by-Step Flow & Hindi Support)
![MediKiosk Patient Kiosk](docs/screenshots/patient_kiosk.png)
![MediKiosk Kiosk Hindi View](docs/screenshots/kiosk_hindi.png)

### Clinical OPD Queue Dashboard & Case Detail
![MediKiosk Staff Dashboard](docs/screenshots/staff_dashboard.png)

---

## 10. AI Verification Status & Known Limitations

- **AI Verification Status:** AI provider integration supports real external LLM keys via `AI_PROVIDER` and `AI_API_KEY` environment variables. When unconfigured, the system honestly labels the summary as *"Local Heuristic Pipeline (Fallback)"* or *"AI summary pending"*. Report status: **Live AI verification not run — configuration missing**.
- **Voice Transcription:** Voice dictation requires an active internet connection for web speech transcription; offline audio recordings are preserved locally and queued for deferred server transcription.
- **ABHA Identity Verification:** Operational in synthetic preview mode; sandbox/production integration requires official NHA credentials.
