# MediKiosk — Accessible Patient Case-Taking & Clinical Intake Platform

**Built for Grevix AfterCode 2026**  
**Participant:** Swati Jain (Sole Participant)

---

## 1. Problem & Context

In outpatient departments (OPDs), community health centers, and AYUSH clinics, patients frequently arrive with fragmented histories, scattered paper prescriptions, and unorganized symptom chronologies. Overburdened doctors spend significant consultation time taking down basic notes rather than conducting examinations, while elderly, rural, and low-literacy patients often struggle with smartphone-only apps.

**MediKiosk** provides a shared physical kiosk experience designed for clinic waiting areas:
1. **Patient Registration & Assisted Mode:** Self-intake or caregiver/staff-assisted badge.
2. **Plain-Language Consent:** Transparent disclosure of storage, voice dictation, and AI summarization.
3. **Voice & Touch Intake:** Step-by-step bilingual (English / Hindi) questionnaire.
4. **Prescription & Report OCR:** Local image capture with mandatory patient verification of extracted medicine names.
5. **Patient Review & Local Encryption:** Full confirmation screen; drafts encrypted via Web Crypto (AES-GCM 256).
6. **Structured Clinical Summary:** Zero-hallucination AI adapter organizing findings with explicit source excerpts.
7. **Staff OPD Dashboard:** Queue management, triage categorization, red-flag alert review, and clean printable summaries.

> **Clinical Safety Boundary:** MediKiosk organizes patient-provided information for clinicians. It does not diagnose, recommend medical treatments, prescribe medicines, or replace clinical triage.

---

## 2. Real Challenge Card 1: 30-Second Disconnection Capability

> *"Demonstrate that the offline data caching mechanism can handle a simulated 30-second network disconnection during the intake process, and that the AI summary is still generated accurately and in a timely manner when the connection is re-established."*

### Architecture & Key Mechanisms
- **Offline Cache:** Uses **Dexie (IndexedDB)** for drafts, media blobs, and queued operations.
- **Service Worker:** Precaches application shell (`/sw.js`) and excludes dynamic patient API endpoints.
- **Revision Monotonicity & Idempotency:** Assigns monotonic revision numbers (`rev: 1, 2, ...`) and unique idempotency keys (`${caseId}-rev-${revision}`). The server SQLite repository deduplicates repeated transmissions.
- **Automated Verification:** Verified using Playwright browser context disconnection (`tests/e2e/disconnection.spec.ts`).
  - **Disconnection Duration:** **31.0 seconds** of continuous offline operation.
  - **Data Completeness:** **100%** of answers retained.
  - **Duplicate Count:** **1** (exactly 1 record, 0 duplicates).
  - **Reconnect Latency:** **3.18 seconds** to server acknowledgment.

Full test report available at [`docs/OFFLINE_TEST_REPORT.md`](docs/OFFLINE_TEST_REPORT.md).

---

## 3. Tech Stack

- **Framework:** Next.js 16 (App Router, strict TypeScript)
- **Styling:** Tailwind CSS (calm warm-white surfaces, navy typography, teal accents)
- **Client Storage:** Dexie (IndexedDB) + Web Crypto (AES-GCM 256)
- **Server Store:** SQLite (`better-sqlite3`) behind an `ICaseRepository` interface with WAL mode
- **Validation:** Zod schemas
- **Testing:** Vitest (unit & integration) and Playwright (E2E & offline network simulation)

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js 20+ (tested on Node v24)
- npm 10+

### Installation
```bash
# Navigate to project directory
cd medikiosk-aftercode

# Install dependencies
npm install --legacy-peer-deps
```

### Environment Configuration (Optional)
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```
*(If no API key is provided, MediKiosk honestly labels summaries as "AI Summary Pending / Structured Template", preserving full synchronization without ever faking live AI responses).*

### Running the App
```bash
# Build production bundle
npm run build

# Start production server
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Patient Kiosk:** [http://localhost:3000/kiosk](http://localhost:3000/kiosk)
- **Staff Dashboard:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

---

## 5. Running Tests

```bash
# Run unit and integration tests (Vitest)
npm test

# Run the 30-second network disconnection test (Playwright)
npm run test:e2e
```

---

## 6. Architecture & Data Flow

```text
[ Patient Kiosk Browser ]
       │
       ├── Step 1-3: Registration & Consent (Plain language)
       ├── Network Disconnect (30s) ──► Service Worker serves shell
       ├── Step 4-8: Touch & Voice Answers ──► Encrypted into Dexie IndexedDB
       ├── Local Red Flags Evaluated ──► In-memory clinical alerts
       ├── Step 8: Offline Submit ──► Queued with Idempotency Key
       │
       ▼ (Network Restored)
[ SyncManager ] ──► Pings /api/health ──► Drains queue (single-drain lock)
       │
       ▼
[ Server API (/api/sync) ] ──► SqliteCaseRepository (WAL Mode)
       │                      ├── Idempotency deduplication
       │                      └── Monotonic revision check
       │
       ▼
[ AI Clinical Summarizer ]
       ├── Real LLM Adapter (Gemini / OpenAI / Groq)
       ├── Cross-references factual excerpts against submitted snapshot
       └── Unconfigured fallback (honest pending label, zero hallucinations)
       │
       ▼
[ Staff Dashboard (/dashboard) ]
       ├── Queue with real processing status & attention badges
       ├── Case detail with source provenance
       └── Staff triage notes & acknowledgment
```

---

## 7. Limitations & Production Considerations

- **Server Hosting:** SQLite is durable for containerized deployments with persistent volumes (Docker, VM, EBS). For serverless deployments (AWS Lambda, Vercel Serverless), replace with Turso/LibSQL or PostgreSQL.
- **Voice Offline Limits:** Native browser speech recognition typically requires an active internet connection; when offline, MediKiosk records local audio for post-reconnect transcription.
- **Shared Kiosk Privacy:** Web Crypto protects in-browser drafts from casual adjacent inspection, and session data is wiped on completion. Physical kiosk hardware requires full OS lockdown (kiosk browser mode).

---

## 8. Documentation Index

- [`docs/CHALLENGES.md`](docs/CHALLENGES.md): Real Challenge Card 1 verbatim, solution, and proof.
- [`docs/OFFLINE_TEST_REPORT.md`](docs/OFFLINE_TEST_REPORT.md): Measured 31s test execution log.
- [`docs/BUILD_LOG.md`](docs/BUILD_LOG.md): Trace of Swati Jain decisions vs AI proposals.
- [`docs/SUBMISSION.md`](docs/SUBMISSION.md): Submission statement and pivot narrative.
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md): Step-by-step judge demonstration guide.
- [`docs/THIRD_PARTY.md`](docs/THIRD_PARTY.md): Dependencies and open-source attribution.