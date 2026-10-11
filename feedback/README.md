# MediKiosk - User Testing & Feedback Evidence

> **Challenge Card Status**: **EVIDENCE IN PROGRESS (PENDING TESTER UPLOAD OF ORIGINAL COMMUNITY EVIDENCE)**  
> *In strict adherence to hackathon integrity rules, this challenge evidence pack is not marked complete while required external community submission evidence remains pending user upload. All genuine feedback items supplied by the evaluator have been documented, reproduced, fixed, and verified below.*

---

## 1. Official Feedback Channel

- **Google Feedback Form URL**: [https://forms.gle/UM6smWDSmxzCiAwh6](https://forms.gle/UM6smWDSmxzCiAwh6)
- **Destination**: Google Forms (opens in an external browser tab)
- **Privacy & Safety**: No patient demographic information, symptoms, or health data are transmitted to Google Forms. Testers provide feedback purely on their user experience, accessibility, language clarity, and interface friction.

---

## 2. Feedback Collection & Verification Process

1. **Demonstration Access**: Testers visit the deployed MediKiosk application and test both:
   - The bilingual patient intake flow (/kiosk) with synthetic/fictional data.
   - The sample clinical triage review (/dashboard?sample=true).
2. **Accessible Form Links**: Direct links to the Google Form are placed prominently in:
   - Landing page navigation header (Give feedback)
   - Dedicated landing page feedback strip
   - Patient intake completion screen
   - Sample staff review dashboard
3. **Receipt & Analysis**: Genuine responses from testers are reviewed for recurring friction points, color contrast, auth boundaries, clinical rule safety, and offline recovery.
4. **Iterative Improvement**: Concrete code improvements addressing specific tester critiques are implemented, committed, and documented below.

---

## 3. Where and When the Demo Was Shared

*(Pending entry of community distribution post)*

- **Date Shared**: [Pending user supply of community post timestamp]
- **Platform / Community**: [Pending user supply of community forum / channel]
- **Target Audience**: [Outpatient clinic staff, caregivers, and bilingual users]
- **Link to Public Post**: [Pending user supply of link]

---

## 4. Screenshot of the Actual Post or Group Message

*(Placeholders retained for original community feedback screenshots until user supplies them)*

`markdown
![Distribution Post Evidence](/feedback/evidence/post-share.png)
*(Pending: Redacted screenshot showing where MediKiosk was shared with real users - to be supplied by user)*
`

---

## 5. Summary of Feedback Supplied

The evaluator supplied eight concrete feedback areas along with positive confirmation of offline deduplication:

| # | Feedback Topic | Category | Status |
| :--- | :--- | :--- | :--- |
| 1 | Colour palette & visual hierarchy | Aesthetics & Accessibility | Fixed & Verified |
| 2 | Purpose explanation & entry points | Information Architecture | Fixed & Verified |
| 3 | Staff access-control server enforcement | Security & Privacy | Fixed & Verified |
| 4 | Consent checkboxes & progression gating | Privacy & Compliance | Fixed & Verified |
| 5 | Allergy explicit distinctions | Clinical Data Integrity | Fixed & Verified |
| 6 | Incomplete intake rejection | Data Validation | Fixed & Verified |
| 7 | Attention trigger mismatch & safeguards | Clinical Rules Safety | Fixed & Verified |
| 8 | Truthful saving & sync status transitions | Reliability & Honesty | Fixed & Verified |
| 9 | Offline submission without duplicates | Core Synchronization | Positive Report (Preserved) |

---

## 6. Feedback-Driven Changes: Problem → Change → Verification

### Item 1: Professional Color Palette & Visual Hierarchy
- **Reported**: Site looked like a generic prototype with stark dark/white contrast; requested warm cream cards (#FAF7F0), sage mist background (#EAF0EB), navy header/footer (#0B1B25), teal buttons (#356B62) with ivory text (#FFFDF7), and slate accents (#304652).
- **Reproduced**: Inspecting globals.css revealed dark zinc utility colors and default borders without a coherent clinic aesthetic.
- **Fixed**:
  - Replaced core CSS color tokens in src/app/globals.css.
  - Updated buttons, badges, navigation header, and cards across all pages.
- **Verified**:
  - Contrast ratios meet WCAG AA standards.
  - Screenshots captured in /feedback/evidence/landing-page.png.

### Item 2: Clear Purpose Explanation & Patient/Staff Separation
- **Reported**: Homepage lacked immediate clarity on what MediKiosk does and mixed staff actions with patient entry.
- **Reproduced**: Landing page had technical banners (Hackathon Build, AES-GCM 256) and no distinct dual entry cards.
- **Fixed**:
  - Removed Hackathon Build badge and prototype banner.
  - Added two distinct entry cards: PATIENTS & CAREGIVERS (Prepare for your consultation) and HOSPITAL STAFF (Review patient intake).
  - Added concise 4-step workflow and 3 problem/capability bullet lists.
  - Prominent testing disclaimer: *Public testing version — please use fictional information.*
- **Verified**:
  - Visual verification via Playwright screenshot (landing-page.png).
  - Unit tests verify route targets (/kiosk and /login).

### Item 3: Server-Enforced Staff Authentication & Isolation
- **Reported**: Staff routes trusted client-supplied flags; missing server-side authorization checks allowed unauthorized record lookups.
- **Reproduced**: Client could bypass auth checks if x-test-auth header was provided or could read case records by ID without cookie verification.
- **Fixed**:
  - Implemented erifyStaffAuth(req) in src/lib/security/auth.ts enforcing signed session tokens.
  - Enforced server-side in src/app/api/cases/route.ts and src/app/api/cases/[caseId]/route.ts. Fails closed (HTTP 401) when session is absent or invalid.
  - Separated public synthetic examples (sample-case-*) from genuine visitor submissions.
- **Verified**:
  - Vitest regression suite (	ests/regression-feedback.test.ts):
    - ejects case lookup without authentication -> PASS (401)
    - ejects fraudulent x-test-auth headers without valid session -> PASS (401)
    - llows authenticated staff to fetch cases -> PASS (200)

### Item 4: Explicit Consent & Progression Gating
- **Reported**: Consent checkboxes were pre-checked or allowed submitting health data without explicit storage consent.
- **Reproduced**: Fresh session initialized with active consent or lacked server-side storage consent validation.
- **Fixed**:
  - src/components/kiosk/StepConsent.tsx: Fresh sessions start with all consent checkboxes unchecked.
  - Storage consent is strictly required to proceed; plain-language staff-assisted alternative is displayed if declined.
  - Voice and AI consents are completely optional and separate.
  - src/app/api/sync/route.ts: Rejects records without storage consent with HTTP 400.
- **Verified**:
  - Vitest regression test: ejects synchronization if storage consent is false -> PASS (400)
  - Vitest regression test: does not call external AI if aiProcessing consent is false -> PASS (rules-based summary only)

### Item 5: Explicit Allergy Distinctions
- **Reported**: Unanswered allergy fields defaulted to No known allergies (
one_reported), creating dangerous clinical assumptions.
- **Reproduced**: Default state was 
one_reported even when patient had not answered the question.
- **Fixed**:
  - Updated AllergyInfoSchema in src/lib/types/schema.ts to include unanswered alongside 
one_reported, eported, and unknown.
  - src/components/kiosk/StepAllergies.tsx: Starts unselected with 3 explicit choices:
    1. No known allergies
    2. I have an allergy
    3. I do not know
  - Summary and review components preserve this distinction and never assume absence of allergies.
- **Verified**:
  - Vitest regression tests:
    - distinguishes between unanswered allergies and none_reported -> PASS
    - preserves unknown allergy status without converting to none_reported -> PASS

### Item 6: Incomplete Intake Rejection
- **Reported**: Submitting a name-only form was accepted as a completed intake.
- **Reproduced**: Sync endpoint accepted any partial snapshot marked with status: completed.
- **Fixed**:
  - Added shared alidateIntakeCompletion(snapshot) in src/lib/types/schema.ts requiring patient name, age, storage consent, main concern, onset, and answered allergies.
  - Enforced client-side before completion screen and server-side in src/app/api/sync/route.ts (returns HTTP 422 if marked complete but missing essentials).
- **Verified**:
  - Vitest regression tests:
    - ejects completed intake when only patient name is provided -> PASS (422)
    - ccepts properly completed intake with all required sections -> PASS

### Item 7: Attention-Trigger Mismatch & Negation Safeguards
- **Reported**:
  - Selecting Shortness of Breath alone failed to trigger red-flag attention due to a boolean logic error.
  - Entering short of breath and feel faint was not triggering clinical attention prompts.
- **Reproduced**:
  - In src/lib/rules/red-flags.ts, the boolean check was hasChestPain || (hasChestPain && hasDyspnea), which mathematically reduced to only hasChestPain, completely ignoring dyspnea alone.
- **Fixed**:
  - Refactored evaluateRedFlags to evaluate dyspnea independently (hasDyspnea or text matching short of breath, difficulty breathing).
  - Added detection for short of breath and feel faint.
  - Implemented negation safeguards: phrases like no chest pain or without shortness of breath are excluded from positive triggers.
  - Added historical safeguards: past history of chest pain 5 years ago does not trigger acute flags.
  - Disclaimed: Staff attention prompts only; not a diagnosis or clinical triage guarantee.
- **Verified**:
  - Vitest regression tests:
    - 	riggers red flag for Shortness of Breath alone -> PASS
    - 	riggers red flag for 'short of breath and feel faint' -> PASS
    - 	riggers red flag for chest pain case -> PASS
    - does not trigger red flag when symptoms are negated ('no chest pain') -> PASS
    - does not trigger red flag for historical symptom references -> PASS

### Item 8: Truthful Saving & Submission Status Transitions
- **Reported**: Offline completion falsely claimed records were received by staff; save state did not reflect real transitions.
- **Reproduced**: Completion screen showed static success message regardless of actual network persistence.
- **Fixed**:
  - Defined explicit state machine in src/components/kiosk/StepCompletion.tsx:
    - Unsaved changes
    - Saving on this device
    - Saved on this device
    - Waiting for connection
    - Sending to server
    - Received by server
    - Could not send — retry available
  - When offline, completion explicitly states: *Saved on this device. Waiting to send. (Queued Offline)* and clarifies staff have not yet received the record.
  - Separated submission status from AI summary status.
- **Verified**:
  - Vitest regression tests verify queued sync status and durable server receipt acknowledgment.

### Item 9: Positive Report: Offline Deduplication Preserved
- **Reported**: Offline submissions synced without duplicates when reconnected.
- **Status**: Verified and preserved. Dexie client queue + LibSQL/SQLite server revision checking prevents any duplicate insertion upon reconnection.

---

## 7. Evidence Artifacts Captured

| Screenshot Artifact | Description |
| :--- | :--- |
| eedback/evidence/landing-page.png | Updated landing page with navy/sage/cream palette, dual entry points, and clear workflow |
| eedback/evidence/patient-intake-consent.png | Kiosk entry showing fresh unchecked consent boxes and plain-language staff-assist notice |
| eedback/evidence/staff-login.png | Secure staff authentication portal with role description and fail-closed notice |
| eedback/evidence/staff-dashboard-sample.png | Sample staff review dashboard with prominent synthetic banner and allergy distinctions |
| eedback/evidence/post-share.png | *[Pending user upload of actual community distribution evidence]* |

---

## 8. Summary of Verification Test Suite

- **Vitest Unit & Regression Tests**: 30 tests passing across 5 test suites:
  - 	ests/regression-feedback.test.ts (17 tests)
  - 	ests/rules.test.ts (4 tests)
  - 	ests/freshness.test.ts (3 tests)
  - 	ests/summarizer.test.ts (1 test)
  - 	ests/repository.test.ts (5 tests)
- **ESLint**: 0 errors.
- **Production Build**: Next.js 16.4.0 Turbopack build succeeds with static prerendering in 1.1s.