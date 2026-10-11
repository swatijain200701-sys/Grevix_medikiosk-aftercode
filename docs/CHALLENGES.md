# Grevix AfterCode 2026: Challenge Cards

## Real Challenge Card 1 (Verbatim)

> **Challenge Card 1:**
> "Implement a robust offline data caching mechanism that allows patients to complete the intake process even without an internet connection. However, this must be balanced against the need to ensure that the cached data is not too old, and that the AI summary is still generated in a timely manner when the connection is re-established. You must demonstrate that the system can handle disconnections and reconnects seamlessly, without compromising the quality of the AI summary.
>
> Standard normal operations, such as patient registration and doctor/staff dashboard functionality, must remain unaffected by this redesign.
>
> The goal: Demonstrate that the offline data caching mechanism can handle a simulated 30-second network disconnection during the intake process, and that the AI summary is still generated accurately and in a timely manner when the connection is re-established."

---

## MediKiosk Architecture & Implemented Solution

### 1. Dual-Layer Offline Data Caching Architecture
- **Client Storage Engine (IndexedDB via Dexie):**
  - Caches draft intake data, patient registration, consent metadata, confirmed answers, and captured document/audio blobs.
  - Encrypts client drafts using Web Crypto (AES-GCM 256) with ephemeral session keys cleared immediately upon session completion to prevent data leakage between walk-up patients on shared kiosks.
- **Application Shell Persistence (Service Worker):**
  - Caches static assets, HTML shell, and styles (`/`, `/kiosk`, `/dashboard`, `/manifest.json`).
  - Explicitly bypasses patient API endpoints (`/api/*`) from the standard HTTP cache to avoid serving stale patient data.

### 2. Monotonic Revisions & Idempotent Synchronization
- Client generates monotonic integer revisions (`rev: 1, 2, ...`) and derived idempotency keys (`${caseId}-rev-${revision}`).
- **SyncManager Mutex & Backoff:**
  - Manages reconnect triggers: browser `online` event, `/api/health` reachability polling (evaluating real server reachability rather than relying solely on `navigator.onLine`), window visibility/focus changes, and manual sync buttons.
  - A single-drain mutex (`isDraining` lock) guarantees no concurrent duplicate queue drains.
  - Server SQLite repository validates idempotency keys: duplicate submissions return existing saved records without re-processing or creating multiple queue rows.

### 3. Data Freshness & Expiry Policy (Prototype Baseline)
- **30-Minute Reconfirmation Window:** Completed but un-synchronized intake records older than 30 minutes require the patient to reconfirm that their symptoms and medicines have not changed before final submission.
- **24-Hour Cache Expiry:** Local patient caches expire and are automatically purged after 24 hours.
- Independent timestamps are tracked across the lifecycle: `createdAt`, `lastLocalEditAt`, `lastPatientConfirmedAt`, `serverReceivedAt`, `summaryGeneratedAt`.

---

## Measured Evidence & Test Outcomes

The capability was verified using Playwright automated browser context disconnection (`tests/e2e/disconnection.spec.ts`), cutting network for 31 continuous seconds mid-intake:

| Requirement / Metric | Target | Measured Result | Verification |
| :--- | :--- | :--- | :--- |
| **Simulated Disconnection Duration** | 30 seconds | **31 seconds** | Exceeded required duration |
| **Intake Progression While Offline** | Full form completion | **Completed steps 4 through 8 offline** | Verified |
| **Local Red-Flag Trigger** | Operates without internet | **Chest pain flag detected in browser memory** | Verified |
| **Data Completeness** | 100% of facts retained | **100%** (All symptoms, meds, allergies retained) | Verified |
| **Duplicate Queue Count** | Exactly 1 record | **1 record** (0 duplicates created) | Verified |
| **Reconnect-to-Sync Latency** | < 5 seconds | **3.18 seconds** | Target met |

---

## Challenge Card 2 Status

*Pending announcement.*