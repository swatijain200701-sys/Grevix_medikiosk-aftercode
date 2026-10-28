# MediKiosk: 3-Minute Hackathon Demo Script & Judge Q&A

---

## 3-Minute Demo Script (Based Only on Verified Behavior)

### Minute 1: The Outpatient Intake Problem & Walk-up Kiosk (0:00 – 1:00)
1. **Show Landing Page (`/`):**
   - Point out the headline: *"Better conversations begin before the consultation."*
   - Scroll past the waiting room crowd visual (`WaitingRoomCanvas`) illustrating the chaotic OPD reality.
   - Click the primary CTA **"Start patient intake"** (routes directly to `/kiosk`).
2. **Kiosk Registration & Consent (Steps 1–2):**
   - Select **Hindi** or **English** via the top toggle.
   - Enter name (`Ramesh Kumar`) and age (`54`). Point to the *"Assisted by caregiver"* toggle.
   - Show Step 2 (Consent): Note that all checkboxes start **completely unchecked** (ethical consent compliance).
   - Check local storage consent (required for kiosk operation) and proceed.

### Minute 2: Clinical Input, Red-Flag Detection & Offline Resilience (1:00 – 2:00)
1. **Main Concern & Safety Rules (Step 3):**
   - Enter chief concern: *"Chest pain and shortness of breath for 3 days."*
   - Immediate staff-attention alert triggers locally: *"Important Clinical Notice: You reported severe chest discomfort or shortness of breath. Please notify the hospital desk immediately."*
   - Note to judges: This rule runs **locally in browser memory** with negation and historical safeguards; it is a staff prompt, not a diagnosis.
2. **Offline Network Disconnection Demonstration:**
   - Turn off Wi-Fi or toggle DevTools to **Offline**.
   - Notice the top header badge updates to **"Offline — saving locally"**.
   - Advance through Symptoms (Step 4), Medicines (Step 5), and Allergies (Step 6 with honest tri-state selector).
   - In Step 7 (Documents), show document upload & OCR extraction with patient text verification.
   - In Step 8 (Review), click **Submit** while completely offline!
   - StepCompletion displays: **"Saved on this device. Waiting to send. (Queued Offline)"**.

### Minute 3: Reconnect, Automatic Sync & Staff Review (2:00 – 3:00)
1. **Restore Connectivity:**
   - Turn network back on.
   - Within seconds, `syncManager` detects the server and drains the queue via `/api/sync`.
   - UI seamlessly switches to **"Received by server"**.
2. **Session Privacy Reset:**
   - Click **"Finish & Prepare for Next Patient"**.
   - Wipes active `sessionStorage` encryption keys and resets the kiosk to a clean state for the next walk-up patient.
3. **Staff Triage Station (`/dashboard?sample=true` or authenticated `/dashboard`):**
   - Show incoming queue row with attention badges.
   - Open case modal: inspect structured summary with **provenance chips** (Patient-Entered, OCR Confirmed, Local Rule Prompt, Template/AI).
   - Note the honesty badge: *"Structured Template Intake"* (deterministic) vs *"AI Verified"*.

---

## 5 Likely Judge Questions & Technically Honest Answers

### 1. How does database persistence work on Vercel serverless?
> **Answer:** "In a standard Vercel serverless environment, local files written by `better-sqlite3` are ephemeral and do not persist across multiple cold lambdas or scale-out instances. To address this honestly, MediKiosk includes a dual database driver: for local development, tests, and Docker/Render deployments with a mounted volume, it uses `better-sqlite3`. For serverless cloud deployments on Vercel, MediKiosk includes a `@libsql/client` (Turso) cloud adapter configured via `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`. If those credentials are not provisioned in the cloud environment, we provide `/dashboard?sample=true` which runs entirely in-memory with verified synthetic clinical fixtures without calling the database."

### 2. What does the AI actually do versus the template fallback?
> **Answer:** "When an external LLM key (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `GROQ_API_KEY`) is configured, MediKiosk calls modern foundation models (Gemini 2.0 Flash / GPT-4o-mini) with a strict zero-shot extraction prompt that structures patient-confirmed data and generates exact source citations. Crucially, **the AI is never permitted to diagnose, suggest medications, or hallucinate missing data**. When no API key is provided, the summarizer falls back to a deterministic, reliable template pipeline that formats confirmed fields directly into structured categories. Both modes display an explicit provenance badge in the clinician interface so staff always know whether they are viewing a template summary or an AI-generated synthesis."

### 3. What are the cryptographic limits of the offline queue encryption?
> **Answer:** "MediKiosk uses the browser Web Crypto API to generate AES-GCM 256-bit keys. We employ a dual-key architecture: an active session key in `sessionStorage` (which is permanently wiped when the session finishes) and a persistent queue key in `localStorage` for background synchronization. This guarantees that a walk-up patient cannot read the previous patient's draft from IndexedDB. However, because the encryption keys reside in client browser storage, this architecture protects against casual inspection on a shared kiosk, **not against an attacker with root operating-system privileges or memory debuggers**. In production, this must be paired with OS-level kiosk sandboxing."

### 4. Why does MediKiosk strictly refuse to output clinical diagnoses?
> **Answer:** "In real healthcare workflows, walk-up kiosks that output diagnostic predictions introduce severe clinical risk, patient panic, and legal liability. MediKiosk is purposefully designed as an outpatient clinical intake assistant, not a diagnostic engine. It gathers patient-confirmed history, flags immediate red-flag symptoms (like chest tightness or airway swelling) to prompt on-duty nursing attention, and organizes records into a clean, clinician-readable format. The physician remains the sole clinical decision-maker."

### 5. What is the status of ABHA (Ayushman Bharat Digital Mission) integration?
> **Answer:** "The ABHA preview in Step 1 is an illustrative sandbox mock designed to demonstrate how a patient's ABHA address and health profile would seamlessly pre-populate intake fields under the ABDM M1/M2 milestones. We do not claim official ABDM or HIPAA certification in this hackathon version; it is visibly labeled as a sandbox prototype."