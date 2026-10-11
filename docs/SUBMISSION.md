# MediKiosk — Grevix AfterCode 2026 Submission

**Participant:** Swati Jain (Sole Participant)  
**Track / Event:** Grevix AfterCode 2026  
**Repository:** `medikiosk-aftercode`

---

## 1. Product Summary & Problem Statement

In outpatient departments (OPDs), government hospitals, and community health centers across India, clinical consultations are frequently hindered by:
- Incomplete patient histories and misplaced previous prescriptions.
- Overwhelmed medical staff spending valuable consultation minutes transcribing basic symptoms.
- Elderly, rural, and low-literacy patients struggling with complex smartphone applications.

**MediKiosk** provides an accessible, shared physical kiosk experience designed for OPD waiting areas:
`Patient Registration` → `Plain-Language Consent` → `Voice/Touch Intake` → `Document OCR Capture` → `Patient Confirmation` → `Structured AI Summary` → `Staff OPD Review`.

The system organizes patient-reported information for clinicians. It **does not diagnose, recommend treatments, prescribe medicines, or replace clinical triage**.

---

## 2. Product Evolution & Pivot Disclosure

During Grevix AfterCode 2026, participant Swati Jain made the deliberate decision to pivot from an initial scam prevention concept (ScamPause) to MediKiosk to tackle OPD intake bottlenecks. 

- ScamPause and its repository have been preserved intact without modification.
- MediKiosk was built entirely from scratch in a fresh sibling directory (`medikiosk-aftercode`).
- No code was imported from prior external hackathons or team projects.

---

## 3. Real Challenge Card 1: Implementation & Measured Proof

Challenge Card 1 mandated demonstrating a **simulated 30-second network disconnection during the intake process** while guaranteeing seamless intake completion, local persistence, duplicate-free sync, and accurate clinical summarization upon reconnection.

### Measured Playwright Automated Test Results:
- **Disconnection Duration:** 31.0 seconds simulated via browser context offline mode.
- **Offline Intake Continuation:** Patient successfully answered symptoms, medications, and allergies while offline.
- **Local Red Flag Engine:** Chest pain and breathlessness triggers evaluated in browser memory without network.
- **Data Completeness:** 100% of facts retained upon reconnect.
- **Duplicate Prevention:** Exactly 1 case record created (0 duplicates) via monotonic revision idempotency.
- **Reconnect-to-Sync Latency:** 3.18 seconds (under the 5-second target).

---

## 4. Architecture & Key Modules

- **Frontend & App Shell:** Next.js 16 (App Router), Tailwind CSS, Service Worker precache.
- **Client Offline Storage:** Dexie (IndexedDB) with Web Crypto (AES-GCM 256) per-session draft encryption.
- **Server Durable Store:** SQLite with WAL mode behind a clean repository interface (`ICaseRepository`).
- **AI Clinical Summarizer:** Multi-provider adapter (Google Gemini / OpenAI / Groq) with structured Zod output validation, source text excerpt references, and honest fallback when API keys are not configured.
- **Voice & OCR Adapters:** Web Speech API with offline local audio recording fallback; client-side image validation with patient review of extracted prescription text.

---

## 5. Honest Limitations & Future Work

- **Server Hosting Requirements:** SQLite is durable for containerized/VM deployments with persistent volumes, but requires cloud storage adapters (e.g. Turso, LibSQL, or PostgreSQL) for ephemeral serverless lambdas.
- **Voice Offline Limitations:** Browser speech recognition typically requires cloud connectivity; MediKiosk provides offline audio recording with deferred transcription.
- **Future Capabilities:** ABDM / ABHA health ID integration, FHIR R4 interoperability, and expansion to additional regional Indian languages.