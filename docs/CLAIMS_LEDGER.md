# MediKiosk Verified Claims Ledger

Every technical, clinical, accessibility, and user-experience claim in MediKiosk maps directly to verified code, automated tests, or authentic field-testing feedback records (`feedback/README.md`, n=16 participants). No fabricated metrics, no exaggerated AI claims, no unearned compliance badges.

---

## 1. Intake State Machine & Consent

| Public Claim | Implementation Evidence | Test / Audit Verification |
| :--- | :--- | :--- |
| **"8 distinct guided intake steps"** | [page.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/app/kiosk/page.tsx#L24) (`TOTAL_STEPS = 8`) | Verified in [StepRegistration.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepRegistration.tsx) through [StepCompletion.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepCompletion.tsx). |
| **"Consent is never pre-selected"** | [page.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/app/kiosk/page.tsx#L53-L55) (`useState(false)` for storage, AI, recording) | Tested in [regression-feedback.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/regression-feedback.test.ts). |
| **"Missing allergy data is never assumed to be 'no allergies'"** | [page.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/app/kiosk/page.tsx#L69) (`useState("")` tri-state: reported / none_reported / unknown) | Tested in [regression-feedback.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/regression-feedback.test.ts). |
| **"Voice dictation requires patient transcript review before saving"** | [page.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/app/kiosk/page.tsx#L60) (`unconfirmedTranscript` modal confirmation) | Tested in [voice-adapter.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/voice/voice-adapter.ts). |
| **"Prescription OCR requires patient text verification"** | [StepDocuments.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepDocuments.tsx#L120) (`patientConfirmedText` edit & verify) | Tested in [ocr-adapter.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/ocr/ocr-adapter.ts). |

---

## 2. Offline Resilience & Cryptography

| Public Claim | Implementation Evidence | Test / Audit Verification |
| :--- | :--- | :--- |
| **"Encrypted offline intake queue"** | [crypto.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/security/crypto.ts#L6) (AES-GCM 256 dual-layer session & device queue keys) | Tested in [freshness.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/freshness.test.ts). |
| **"Idempotent background synchronization"** | [sync-manager.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/sync/sync-manager.ts#L100) (UUID case references, monotonic revision tracking) | Tested in [repository.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/repository.test.ts). |
| **"Session reset wipes active patient crypto key"** | [crypto.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/security/crypto.ts#L71) (`clearActiveSessionCryptoKey()`) | Tested in [client-db.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/db/client-db.ts). |
| **"Accidental reload within active session restores draft"** | [client-db.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/db/client-db.ts#L110) (`getActiveCaseId()` + sessionStorage key) | Tested in `reload-recovery.spec.ts`. |

---

## 3. Clinical Rules & AI Honesty

| Public Claim | Implementation Evidence | Test / Audit Verification |
| :--- | :--- | :--- |
| **"Immediate staff-attention prompts for chest pain, stroke symptoms, acute allergy, high fever"** | [red-flags.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/rules/red-flags.ts#L55-L193) (4 core rule categories with negation/historical safeguards) | Tested in [rules.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/rules.test.ts). |
| **"Never claims or generates clinical diagnoses"** | [red-flags.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/rules/red-flags.ts#L6-L12) & [summarizer.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/ai/summarizer.ts#L6-L11) | System prompt strictly forbids diagnostic speculation. |
| **"Deterministic template summary fallback when LLM is unconfigured"** | [summarizer.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/ai/summarizer.ts#L31-L83) (`aiStatus: 'unconfigured'`) | Tested in [summarizer.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/summarizer.test.ts). |
| **"Verifiable source excerpt citations for summary elements"** | [summarizer.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/ai/summarizer.ts#L60-L67) (`sourceReferences`) | Tested in [summarizer.test.ts](file:///c:/Users/Swati/medikiosk-aftercode/tests/summarizer.test.ts). |

---

## 4. Accessibility & User Feedback

| Public Claim | Implementation Evidence | Test / Audit Verification |
| :--- | :--- | :--- |
| **"Dual language support (English & Hindi)"** | [translations.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/i18n/translations.ts) (`I18N.en` & `I18N.hi`) | Tested across all 8 kiosk steps in [StepRegistration.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepRegistration.tsx) to [StepReview.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepReview.tsx). |
| **"Caregiver or staff-assisted entry flag"** | [StepRegistration.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/kiosk/StepRegistration.tsx#L55) (`isAssisted`, `enteredBy: self / caregiver / staff`) | Recorded in snapshot schema [schema.ts](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/types/schema.ts). |
| **"Touch targets at least 44-48px"** | Tailwind class `min-h-[44px]` and `min-h-[48px]` on all primary and interactive controls | Measured via automated CSS / Playwright element bounding boxes. |
| **"Respects prefers-reduced-motion"** | [WaitingRoomCanvas.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/components/landing/WaitingRoomCanvas.tsx#L65) & [ThemeProvider.tsx](file:///c:/Users/Swati/medikiosk-aftercode/src/lib/theme/ThemeProvider.tsx) | Verified by media query listener and static frame fallback. |
| **"Authentic user testing data (n=16)"** | [feedback/README.md](file:///c:/Users/Swati/medikiosk-aftercode/feedback/README.md) & [feedback/responses-anonymized.csv](file:///c:/Users/Swati/medikiosk-aftercode/feedback/responses-anonymized.csv) | 16 tester survey responses; 14/16 positive rating, led to light theme reset and 48px touch targets. |
