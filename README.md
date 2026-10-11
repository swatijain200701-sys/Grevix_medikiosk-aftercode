# MediKiosk — Accessible Patient Case-Taking & Clinical Intake Platform

**Built for Grevix AfterCode 2026**  
**Participant:** Swati Jain (Sole Participant)

---

## 1. Problem & Context

In outpatient departments (OPDs), government health centers, and AYUSH clinics, consultations are frequently delayed because patients arrive with fragmented histories, scattered paper prescriptions, and unorganized symptom chronologies. Overburdened doctors spend significant consultation time taking down basic notes rather than conducting examinations, while elderly, rural, and low-literacy patients struggle with smartphone-only apps.

**MediKiosk** provides an accessible, shared physical kiosk experience:
1. **Patient Registration & Assisted Mode:** Self-intake or caregiver/staff-assisted badge.
2. **Plain-Language Consent:** Transparent disclosure of storage, voice dictation, and AI summarization.
3. **Voice & Touch Intake:** Step-by-step bilingual (English / Hindi) questionnaire.
4. **Prescription & Report OCR:** Concrete Tesseract.js client OCR with mandatory patient verification.
5. **Patient Review & Local Encryption:** Full confirmation screen; drafts encrypted via Web Crypto (AES-GCM 256).
6. **Structured Clinical Summary:** Multi-provider AI adapter (Gemini / OpenAI / Groq) with source excerpt cross-checks.
7. **Staff OPD Dashboard:** Queue management, triage categorization, red-flag alert review, and clean printable summaries.

> **Clinical Safety Boundary:** MediKiosk organizes patient-provided information for clinicians. It does not diagnose, recommend medical treatments, prescribe medicines, or replace clinical triage.

---

## 2. Real Challenge Card 1: Status & Verification Matrix

> *"Demonstrate that the offline data caching mechanism can handle a simulated 30-second network disconnection during the intake process, and that the AI summary is still generated accurately and in a timely manner when the connection is re-established."*

### Verification Status: **PARTIALLY VERIFIED**
- **Offline Data Caching (Browser-Tested & Unit-Tested):** **VERIFIED.** Handled a genuine 31-second network disconnection mid-intake (`context.setOffline(true)`). 100% of facts retained.
- **Duplicate Prevention & Idempotency (Browser-Tested & Unit-Tested):** **VERIFIED.** Monotonic revisions with idempotency keys. SQLite asserts `recordCount: 1` and `duplicateCount: 0`.
- **Reconnect-to-Sync Latency (Browser-Tested):** **VERIFIED.** 3.01 seconds (beating target of < 5s).
- **Shared-Kiosk Privacy (Browser-Tested):** **VERIFIED.** Reset clears active draft and session encryption key, ensuring zero data leakage to subsequent patients.
- **Live External AI Summary Generation:** **PENDING EXTERNAL CREDENTIALS.** Structured adapter and validation implemented and unit-tested; live external LLM latency and quality awaiting user-supplied `GEMINI_API_KEY` or `OPENAI_API_KEY`. Operates in honest unconfigured template fallback mode without fabricating responses.

Full test details in [`docs/OFFLINE_TEST_REPORT.md`](docs/OFFLINE_TEST_REPORT.md) and [`docs/CHALLENGES.md`](docs/CHALLENGES.md).

---

## 3. Tech Stack & Concrete Engines

- **Framework:** Next.js 16 (App Router, strict TypeScript)
- **Styling:** Tailwind CSS (calm warm-white surfaces, navy typography, restrained teal accents)
- **Client Storage:** Dexie (IndexedDB) + Web Crypto (AES-GCM 256)
- **Server Store:** SQLite (`better-sqlite3`) behind an `ICaseRepository` interface with WAL mode
- **OCR Engine:** Tesseract.js (Client WebAssembly engine) with mandatory patient correction
- **Voice Engine:** Web Speech API (`SpeechRecognition`) with offline `MediaRecorder` audio capture
- **Testing:** Vitest (13 unit & integration tests) and Playwright (E2E 31s disconnection test)

---

## 4. Setup & Running Locally

### Installation
```bash
cd medikiosk-aftercode
npm install --legacy-peer-deps
```

### Environment Configuration (To Enable Live External AI)
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```
Add your API key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key
# OR
OPENAI_API_KEY=your_actual_openai_api_key
```

### Running the App
```bash
# Build production bundle
npm run build

# Start server
npm run start
```

### Access Links
- **Home Portal:** [http://localhost:3000](http://localhost:3000)
- **Patient Intake Kiosk:** [http://localhost:3000/kiosk](http://localhost:3000/kiosk)
- **Staff Review Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 5. Running Tests

```bash
# Run unit and integration tests (Vitest)
npm test

# Run the 30-second network disconnection challenge test (Playwright)
npm run test:e2e
```

---

## 6. Documentation Index

- [`docs/CHALLENGES.md`](docs/CHALLENGES.md): Real Challenge Card 1 verbatim, response, and verified audit status.
- [`docs/OFFLINE_TEST_REPORT.md`](docs/OFFLINE_TEST_REPORT.md): Measured 31s test execution log with `recordCount: 1` and `duplicateCount: 0`.
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md): Trace of Swati Jain decisions vs AI proposals.
- [`docs/SUBMISSION.md`](docs/SUBMISSION.md): Submission statement and pivot narrative.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md): Step-by-step judge demonstration script.
- [`docs/THIRD_PARTY.md`](docs/THIRD_PARTY.md): Dependencies and open-source attribution.