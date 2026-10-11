# MediKiosk: 30-Second Disconnection Demonstration Script

This demo script demonstrates the core user journey and proves the **30-second offline network disconnection tolerance** required by **Real Challenge Card 1**.

---

## Prerequisites
1. Clone / open the `medikiosk-aftercode` project directory.
2. Run `npm run build` and `npm run start` (or `npm run dev`).
3. Open Google Chrome or Microsoft Edge at `http://localhost:3000`.

---

## Demonstration Sequence

### Step 1: Open the Patient Kiosk (Online)
1. On the landing page, click **"Start Patient Intake"** or navigate to `http://localhost:3000/kiosk`.
2. Notice the top status badge reads **"Online"** in restrained teal.
3. Language toggle: Click **"हिंदी में बदलें"** to show instant bilingual UI adaptation, then toggle back to English if preferred.

### Step 2: Patient Registration & Consent
1. In Step 1, enter:
   - **Name:** `Ramesh Patel`
   - **Age:** `54`
2. Optional: Click **"Assisted by caregiver or hospital staff"** to indicate entry was helped by a volunteer.
3. Click **Next** to proceed to Step 2 (Plain-Language Consent).
4. Review the three plain-language consent items (Local Storage, AI Summarization, Voice Recording).
5. Click **Next**.

### Step 3: Enter Primary Concern & Trigger 30-Second Network Cut
1. In Step 3 (Main Concern), type:
   `"Severe chest tightness and shortness of breath since yesterday evening."`
2. Enter Onset: `"1 day ago"`.
3. **NOW SIMULATE THE 30-SECOND NETWORK DISCONNECTION:**
   - Open Chrome DevTools (`F12` or `Ctrl+Shift+I`).
   - Navigate to the **Network** tab.
   - Change the throttling dropdown from *No throttling* to **Offline** (or turn off Wi-Fi).
4. **Observe Immediate Resilience:**
   - The top banner instantly transitions to an amber pulsing pill:  
     `"Offline — you can continue"`.
   - Technical terms like *IndexedDB* or *ServiceWorker* are hidden from the patient.

### Step 4: Continue Answering Intake Entirely Offline
1. Click **Next** to proceed to Step 4 (Reported Symptoms).
2. Click the touch chips for **"Chest Pain / Pressure"** and **"Shortness of Breath"**.
3. **Observe Local Red Flag Detection:**
   - An amber attention banner appears:  
     `"Notice: You reported chest pain or shortness of breath. Please notify the hospital desk immediately."`
   - This evaluation runs completely in browser memory without sending data to any external server.
4. Click **Next** to proceed to Step 5 (Conditions & Medicines).
5. Enter Medicines: `"Metformin 500mg, Amlodipine 5mg"`.
6. Click **Next** to proceed to Step 6 (Allergies).
7. Select **"Yes, I have allergies"** and type `"Penicillin"`.
8. Click **Next** through Step 7 (Documents) to Step 8 (Review).
9. Ensure at least 30 seconds have passed while disconnected.
10. Click **"Submit Intake"** while STILL in offline mode!
11. Observe the submission screen:
    - Status reads: **"Queued Offline for Sync"**.
    - Notice: Case reference and revision number (Rev 1) are securely persisted in local encrypted storage.

### Step 5: Restore Network Connectivity & Automatic Sync
1. In DevTools Network tab, switch back from **Offline** to **No throttling** (or turn Wi-Fi back on).
2. **Observe Automatic Reconnect:**
   - Within 3 to 5 seconds, SyncManager detects server reachability via `/api/health`.
   - It drains the queue using the idempotency key `kiosk-xxx-rev-1`.
   - Status updates seamlessly to **"Delivered to Hospital Queue"**.

### Step 6: Safe Shared-Kiosk Session Reset
1. On the completion screen, click **"Finish & Prepare for Next Patient"**.
2. The session encryption keys and draft caches are wiped immediately.
3. The kiosk returns to a clean registration screen, preventing walk-up privacy leaks.

### Step 7: Verify Staff Dashboard
1. Open a new tab at `http://localhost:3000/dashboard`.
2. Notice patient **Ramesh Patel** appears in the queue with:
   - Status: **AI Summary Ready**
   - Flags: **1 Flag** (cardiovascular attention trigger)
   - Revision: **Rev 1**
   - Exact duplicate count: **1** (zero duplicate records).
3. Click on the patient row to open the clinical case view:
   - Review the structured AI summary with source references.
   - Review patient-confirmed medicines and allergies.
   - Enter triage notes (e.g., *"Assigned to Priority Room 2"*).
   - Click **"Acknowledge Summary"** and click **"Print / Export"** to see the clean printable report.