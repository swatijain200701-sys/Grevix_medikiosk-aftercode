# Grevix AfterCode 2026: Challenge Cards

## Real Challenge Card 1 (Verbatim)

> **Challenge Card 1:**
> "Implement a robust offline data caching mechanism that allows patients to complete the intake process even without an internet connection. However, this must be balanced against the need to ensure that the cached data is not too old, and that the AI summary is still generated in a timely manner when the connection is re-established. You must demonstrate that the system can handle disconnections and reconnects seamlessly, without compromising the quality of the AI summary.
>
> Standard normal operations, such as patient registration and doctor/staff dashboard functionality, must remain unaffected by this redesign.
>
> The goal: Demonstrate that the offline data caching mechanism can handle a simulated 30-second network disconnection during the intake process, and that the AI summary is still generated accurately and in a timely manner when the connection is re-established."

---

## Status: PARTIALLY VERIFIED (Audit & Integrity Status)

| Dimension | Verification Level | Status & Evidence |
| :--- | :--- | :--- |
| **Offline Data Caching** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Dexie IndexedDB + Service Worker precache. Patient continued intake for 31 continuous seconds without internet (`context.setOffline(true)`). |
| **Data Freshness & Expiry** | **Unit-Tested** | **VERIFIED:** 30-min reconfirmation window and 24-hr cache expiry policies verified in `tests/freshness.test.ts`. |
| **Duplicate Prevention & Idempotency** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Monotonic revisions with idempotency keys. Server SQLite asserts `recordCount: 1` and `duplicateCount: 0` on reconnects and lost acknowledgments. |
| **Local Red Flag Trigger** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Chest pain & dyspnea triggers evaluated in browser memory without internet (`tests/rules.test.ts`). |
| **Shared-Kiosk Privacy & Recovery** | **Browser-Tested & Implemented** | **VERIFIED:** Web Crypto (AES-GCM 256) per-session draft encryption; session reset wipes active draft while leaving background queue intact. |
| **Live External AI Summary Generation** | **Implemented & Unit-Tested** | **PENDING EXTERNAL CREDENTIALS:** Multi-provider adapter implemented with strict Zod validation and source excerpt cross-checks. Currently operating in honest unconfigured template fallback mode until user supplies `GEMINI_API_KEY` or `OPENAI_API_KEY`. |
| **Live External Reconnect-to-Summary Latency** | **Implemented & Unit-Tested** | **PENDING EXTERNAL CREDENTIALS:** Local structured intake pipeline ready in 3.5s; live external LLM latency pending external provider credentials. |

---

## Measured Browser Disconnection Evidence

Playwright automated browser context disconnection test (`tests/e2e/disconnection.spec.ts`) executed on 2026-10-11:

| Metric | Target | Measured Result | Audit Status |
| :--- | :--- | :--- | :--- |
| **Simulated Disconnection Duration** | >= 30 seconds | **31.0 seconds** | **EXCEEDED TARGET** |
| **Intake Progression While Offline** | Full form completion | **Completed steps 4 through 8 offline** | **VERIFIED** |
| **Queue Record Count** | Exactly 1 record | **recordCount: 1** | **VERIFIED** |
| **Duplicate Count** | Exactly 0 duplicates | **duplicateCount: 0** | **VERIFIED (0 duplicates)** |
| **Data Completeness** | 100% of facts | **100%** (All symptoms, meds, allergies retained) | **VERIFIED** |
| **Reconnect-to-Sync Acknowledgment Latency** | < 5 seconds | **3.01 seconds** | **PASSED (< 3.5s)** |
| **Local Red-Flag Trigger** | Operates without network | **Detected chest pain alert in browser memory** | **VERIFIED** |
| **Shared-Kiosk Privacy Reset** | Zero data leak to next patient | **Wipes active session key & draft** | **VERIFIED** |

---

## Live AI Provider Verification Setup Instructions

To transition the AI summary from *Pending API Key* to *Live AI Verified*:
1. Create `.env.local` in the project root:
   ```bash
   cp .env.example .env.local
   ```
2. Add your provider API key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key
   # OR
   OPENAI_API_KEY=your_actual_openai_api_key
   ```
3. Restart server: `npm run dev` or `npm run start`.
4. MediKiosk automatically detects the provider, queries the live model with strict bounded 15s timeout, and validates generated JSON against the patient-submitted excerpts.