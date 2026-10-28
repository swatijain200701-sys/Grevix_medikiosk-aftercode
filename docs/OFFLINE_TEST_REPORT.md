# Real Challenge Card 1: 30-Second Disconnection Test Report

**Execution Timestamp:** 2026-10-28T09:04:33.564Z  
**Status:** **PASSED (Browser Integration & Offline Resiliency)**  
**Challenge Card 1 Status:** **Partially Verified** (Awaiting user-supplied external LLM API key for live external model latency measurement)

---

## 1. Measured Performance & Latency Metrics

| Metric | Target | Measured Result | Audit Status |
| :--- | :--- | :--- | :--- |
| **Simulated Offline Duration** | >= 30 seconds | **31 seconds** | **EXCEEDED TARGET** |
| **Data Completeness** | 100% of facts | **100%** (All symptoms, meds, allergies retained) | **VERIFIED** |
| **Queue Record Count** | Exactly 1 record | **recordCount: 1** | **VERIFIED** |
| **Duplicate Count** | Exactly 0 duplicates | **duplicateCount: 0** | **VERIFIED (0 duplicates)** |
| **Reconnect-to-Sync Acknowledgment Latency** | < 5 seconds | **3.01 seconds** | **PASSED (< 3.5s)** |
| **Reconnect-to-Structured-Intake-Ready Latency** | < 30 seconds | **3.51 seconds** (local template pipeline) | **MEASURED** (renamed from live latency) |
| **Latest Confirmed Revision Used** | Monotonic integer | **Rev 1** | **VERIFIED** |
| **Factual Retention** | Zero omissions/hallucinations | Expected facts retained, 0 contradictions, 0 unsupported claims | **VERIFIED** |
| **Local Red Flag Detection** | Operates without network | Detected chest pain alert in browser memory | **VERIFIED** |
| **Shared-Kiosk Privacy Reset** | Zero data leak to next patient | Wipes active session key & draft; preserves background queue | **VERIFIED** |

---

## 2. Test Execution Trace

1. **Online Provisioning:** Loaded `/kiosk` with active connection.
2. **Initial Registration:** Registered patient `Ramesh Patel (Synthetic Demo 5253)`, age 54. Accepted plain-language consent.
3. **Mid-Intake Network Disconnection:** Invoked Playwright `context.setOffline(true)` at `2026-10-28T09:04:37.095Z`.
4. **Offline Resilience & Data Capture:**
   - Displayed *'Offline — you can continue'* banner.
   - Patient answered Symptoms, Conditions, Medicines, and Allergies.
   - Evaluated local red-flag attention triggers in browser memory without internet.
   - Encrypted local draft with Web Crypto (AES-GCM 256) into IndexedDB.
5. **Offline Submission:** Submitted intake while still disconnected after 31s. Marked *'Queued Offline for Sync'*.
6. **Network Restoration:** Restored connection at `2026-10-28T09:05:08.165Z`.
7. **Idempotent Queue Drain:** SyncManager detected reachability, sent payload with idempotency key `kiosk-mvrw1o5g-4me0k-rev-1`.
8. **Server Persistence & Verification:** SQLite accepted revision 1, prevented duplicates (`duplicateCount: 0`), generated structured clinical intake summary, and populated the staff OPD dashboard.
9. **Shared-Kiosk Privacy Wipe:** Invoked session finish, confirming that subsequent walk-up patients receive a clean blank form.
