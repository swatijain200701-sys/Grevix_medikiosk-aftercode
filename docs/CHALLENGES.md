# Grevix AfterCode 2026: Challenge Cards

## Real Challenge Card 1 (Verbatim)

> **Challenge Card 1:**
> "Implement a robust offline data caching mechanism that allows patients to complete the intake process even without an internet connection. However, this must be balanced against the need to ensure that the cached data is not too old, and that the AI summary is still generated in a timely manner when the connection is re-established. You must demonstrate that the system can handle disconnections and reconnects seamlessly, without compromising the quality of the AI summary.
>
> Standard normal operations, such as patient registration and doctor/staff dashboard functionality, must remain unaffected by this redesign.
>
> The goal: Demonstrate that the offline data caching mechanism can handle a simulated 30-second network disconnection during the intake process, and that the AI summary is still generated accurately and in a timely manner when the connection is re-established."

---

## Status: PARTIALLY VERIFIED (Strict Audit & Evidence Standard)

| Requirement | Verification Level | Audit Evidence & Outcome |
| :--- | :--- | :--- |
| **Offline Data Caching** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Dexie IndexedDB + Service Worker precache. Handled a genuine 31.0s network cut mid-intake (`context.setOffline(true)`). |
| **Encryption at Rest** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Dual-layer Web Crypto (AES-GCM 256). Active drafts encrypted via `SessionKey`; `pendingSyncQueue` and `mediaBlobs` encrypted via `DeviceQueueKey`. Zero plaintext at rest. |
| **Offline Reload Recovery** | **Browser-Tested** | **VERIFIED:** Proved via `tests/e2e/reload-recovery.spec.ts`. Genuinely reloaded browser (`page.reload()`) offline, tearing down JavaScript memory; recovered draft from ciphertext via `sessionStorage` session key re-import. |
| **Next-Patient Privacy** | **Browser-Tested** | **VERIFIED:** Reset wipes active `SessionKey` and draft from UI. Background encrypted queue remains intact and drains cleanly upon reconnect. |
| **Idempotency & Zero Duplicates** | **Browser-Tested & Unit-Tested** | **VERIFIED:** Monotonic revisions with idempotency keys. SQLite asserts `recordCount: 1` and `duplicateCount: 0`. |
| **Data Freshness & Retention** | **Unit-Tested** | **VERIFIED:** 30-min reconfirmation window and 24-hr cache expiry policies verified in `tests/freshness.test.ts`. |
| **Voice & OCR Honesty** | **Code & Adapter Audited** | **VERIFIED:** Tesseract.js WebAssembly engine; low confidence indicates unclear extraction, not proof of handwriting detection. Voice offline recording works; deferred post-reconnect transcription is labeled pending backend STT configuration. |
| **Live External AI Summary Generation** | **Implemented & Unit-Tested** | **PENDING EXTERNAL CREDENTIALS:** Multi-provider adapter implemented with strict Zod validation and source excerpt cross-checks. Currently operating in honest unconfigured template fallback mode until user supplies `GEMINI_API_KEY` or `OPENAI_API_KEY`. |
| **Reconnect Latency (Disaggregated)** | **Browser-Tested** | **VERIFIED:** `reconnectToSyncAcknowledgmentMs: 3006 ms`. `reconnectToStructuredIntakeReadyMs: 3506 ms`. Live external AI cloud latency pending API credentials. |

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
| **Reconnect-to-Sync Latency** | < 5 seconds | **3.01 seconds** | **PASSED (< 3.5s)** |
| **Reconnect-to-Structured-Intake-Ready** | < 30 seconds | **3.51 seconds** (local structured pipeline) | **MEASURED** (renamed from live latency) |
| **Latest Confirmed Revision Used** | Monotonic integer | **Rev 1** | **VERIFIED** |
| **Factual Retention** | Zero omissions/hallucinations | Expected facts retained, 0 contradictions, 0 unsupported claims | **VERIFIED** |
| **Local Red-Flag Trigger** | Operates without network | **Detected chest pain alert in browser memory** | **VERIFIED** |
| **Shared-Kiosk Privacy Reset** | Zero data leak to next patient | **Wipes active session key & draft** | **VERIFIED** |

---

## Exact Credential-Configuration Steps for Live AI

To transition the AI summary from *Pending API Key* to *Live AI Verified*:
1. In `C:\Users\Swati\medikiosk-aftercode`, create `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Add your provider API key and optional model preference:
   ```env
   # Google Gemini (Recommended)
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-2.0-flash # or gemini-1.5-flash

   # OR OpenAI
   # OPENAI_API_KEY=your_actual_openai_api_key_here
   # OPENAI_MODEL=gpt-4o-mini
   ```
3. Restart server: `npm run build && npm run start`.
4. Run `npm run test:e2e`: the test will detect the active provider, query the live model with strict bounded 15s timeout, measure `reconnectToRealAiSummaryReadyMs`, and cross-validate generated facts against the patient-submitted excerpts.