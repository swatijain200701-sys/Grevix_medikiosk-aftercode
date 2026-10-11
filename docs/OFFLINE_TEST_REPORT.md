# Real Challenge Card 1: 30-Second Disconnection Test Report

**Execution Timestamp:** 2026-10-11T04:16:32.067Z  
**Status:** **PASSED**  
**Test Suite:** Playwright Browser Context Offline Mode (`setOffline(true)`)

---

## 1. Measured Performance & Latency

| Metric | Target | Measured Result | Status |
| :--- | :--- | :--- | :--- |
| **Offline Duration** | >= 30 seconds | **31 seconds** | **EXCEEDED TARGET** |
| **Data Completeness** | 100% of facts | **100%** (All answers retained) | **VERIFIED** |
| **Duplicate Queue Count** | Exactly 1 record | **1 record** (0 duplicates) | **PASSED** |
| **Reconnect-to-Sync Latency** | < 5 seconds | **3.19 seconds** | **PASSED (< 3.5s)** |
| **Local Red Flag Detection** | Operates offline | Detected chest pain flag locally during disconnect | **VERIFIED** |
| **Staff Dashboard Delivery** | Accurate upon reconnect | Rendered in hospital OPD queue | **VERIFIED** |

---

## 2. Test Sequence Execution Trace

1. **Online Provisioning:** Loaded `/kiosk` with active connection.
2. **Initial Registration:** Registered patient `Ramesh Patel (Synthetic Demo 2268)`, age 54. Accepted plain-language consent.
3. **Mid-Intake Network Cut:** Invoked Playwright `context.setOffline(true)` at `2026-10-11T04:16:34.315Z`.
4. **Offline Resilience:**
   - Displayed *'Offline — you can continue'* badge.
   - Patient continued through Symptoms, Conditions, Medicines, and Allergies.
   - Evaluated local red-flag attention triggers completely in browser memory without internet.
   - Encrypted local draft with Web Crypto (AES-GCM 256) into IndexedDB.
5. **Offline Submission:** Submitted intake while still disconnected after 31s. Marked *'Queued Offline for Sync'*.
6. **Network Restoration:** Restored connection at `2026-10-11T04:17:05.484Z`.
7. **Idempotent Queue Drain:** SyncManager detected reachability, sent payload with idempotency key `kiosk-mv3b9rek-pzih5-rev-1`.
8. **Server Persistence & Verification:** SQLite accepted revision 1, prevented duplicates, generated structured clinical intake summary, and populated the staff OPD dashboard.
