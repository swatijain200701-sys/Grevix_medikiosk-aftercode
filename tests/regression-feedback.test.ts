import { describe, it, expect } from "vitest";
import { evaluateRedFlags } from "../src/lib/rules/red-flags";
import { IntakeAnswers, validateIntakeCompletion, PatientCaseSnapshot } from "../src/lib/types/schema";
import { verifyStaffAuth } from "../src/lib/security/auth";
import { generateClinicalSummary } from "../src/lib/ai/summarizer";
import { NextRequest } from "next/server";

describe("Feedback Regression Suite — Critical Reported Failures", () => {
  const baseAnswers: IntakeAnswers = {
    mainConcern: "Routine consultation for seasonal checkup",
    onsetDuration: "3 days",
    reportedSymptoms: ["cough"],
    existingConditions: ["None reported"],
    currentMedicines: [],
    allergies: { status: "none_reported", details: [] },
    relevantPreviousCare: "None",
    questionsForClinician: "None",
    documents: [],
    audioRecordings: [],
  };

  const createSnapshot = (overrides?: Partial<PatientCaseSnapshot>): PatientCaseSnapshot => ({
    caseId: "kiosk-test-01",
    revision: 1,
    idempotencyKey: "kiosk-test-01-rev-1",
    schemaVersion: 1,
    status: "completed_locally",
    patient: {
      preferredName: "Test Patient",
      age: "45",
      gender: "unspecified",
      language: "en",
      assistedEntry: { isAssisted: false, enteredBy: "self" },
    },
    consent: {
      recordingConsent: false,
      localOfflineStorageConsent: true,
      aiProcessingConsent: false,
      consentedAt: new Date().toISOString(),
    },
    answers: { ...baseAnswers },
    redFlags: [],
    createdAt: new Date().toISOString(),
    lastLocalEditAt: new Date().toISOString(),
    lastPatientConfirmedAt: new Date().toISOString(),
    syncedAt: null,
    serverReceivedAt: null,
    summaryGeneratedAt: null,
    requiresReconfirmation: false,
    ...overrides,
  });

  describe("1. Attention-Trigger Mismatch & Safeguards (Issue 6.E)", () => {
    it("triggers urgent attention prompt on 'Shortness of Breath' symptom alone", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "Feeling tired and breathless",
        reportedSymptoms: ["Shortness of Breath"],
      };
      const alerts = evaluateRedFlags(answers);
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts.some((a) => a.ruleId === "rf-chest-pain-dyspnea")).toBe(true);
      expect(alerts[0].severity).toBe("urgent");
    });

    it("triggers urgent attention prompt on 'short of breath and feel faint' text", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "short of breath and feel faint since this morning",
        reportedSymptoms: [],
      };
      const alerts = evaluateRedFlags(answers);
      expect(alerts.some((a) => a.ruleId === "rf-chest-pain-dyspnea")).toBe(true);
    });

    it("triggers urgent attention prompt on standard chest-pain complaint", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "Severe chest tightness and persistent dry cough",
        reportedSymptoms: ["Chest Pain / Pressure"],
      };
      const alerts = evaluateRedFlags(answers);
      expect(alerts.some((a) => a.ruleId === "rf-chest-pain-dyspnea")).toBe(true);
    });

    it("does NOT trigger on negated chest pain ('no chest pain, only mild fever')", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "Has high fever but no chest pain",
        reportedSymptoms: ["fever"],
      };
      const alerts = evaluateRedFlags(answers);
      const chestAlerts = alerts.filter((a) => a.ruleId === "rf-chest-pain-dyspnea");
      expect(chestAlerts.length).toBe(0);
    });

    it("does NOT trigger on negated dyspnea ('without shortness of breath')", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "Dry cough without shortness of breath",
        reportedSymptoms: ["cough"],
      };
      const alerts = evaluateRedFlags(answers);
      const chestAlerts = alerts.filter((a) => a.ruleId === "rf-chest-pain-dyspnea");
      expect(chestAlerts.length).toBe(0);
    });

    it("does NOT trigger on historical chest pain from years ago", () => {
      const answers: IntakeAnswers = {
        ...baseAnswers,
        mainConcern: "Mild runny nose, had chest pain 5 years ago resolved",
        reportedSymptoms: ["cough"],
      };
      const alerts = evaluateRedFlags(answers);
      const chestAlerts = alerts.filter((a) => a.ruleId === "rf-chest-pain-dyspnea");
      expect(chestAlerts.length).toBe(0);
    });
  });

  describe("2. Incomplete Intake Rejection & Shared Validation (Issue 6.D)", () => {
    it("rejects name-only form from becoming a completed intake", () => {
      const nameOnlySnapshot = createSnapshot({
        patient: {
          preferredName: "Ramesh Kumar",
          age: "",
          gender: "unspecified",
          language: "en",
          assistedEntry: { isAssisted: false, enteredBy: "self" },
        },
        answers: {
          ...baseAnswers,
          mainConcern: "",
          onsetDuration: "",
          allergies: { status: "unanswered", details: [] },
        },
      });

      const result = validateIntakeCompletion(nameOnlySnapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.includes("Main health concern"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Allergy"))).toBe(true);
    });

    it("rejects completion when storage consent was not given", () => {
      const noConsentSnapshot = createSnapshot({
        consent: {
          recordingConsent: false,
          localOfflineStorageConsent: false,
          aiProcessingConsent: false,
          consentedAt: new Date().toISOString(),
        },
      });
      const result = validateIntakeCompletion(noConsentSnapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("storage"))).toBe(true);
    });

    it("accepts valid completed intake meeting minimal clinical fields", () => {
      const validSnapshot = createSnapshot();
      const result = validateIntakeCompletion(validSnapshot);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe("3. Allergy Choice Distinctions (Issue 6.C)", () => {
    it("distinguishes unanswered allergy from 'no known allergies'", () => {
      const unansweredSnapshot = createSnapshot({
        answers: {
          ...baseAnswers,
          allergies: { status: "unanswered", details: [] },
        },
      });
      const result = validateIntakeCompletion(unansweredSnapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Allergy history must be answered"))).toBe(true);
    });

    it("requires allergen details when status is 'reported'", () => {
      const emptyReportedSnapshot = createSnapshot({
        answers: {
          ...baseAnswers,
          allergies: { status: "reported", details: [] },
        },
      });
      const result = validateIntakeCompletion(emptyReportedSnapshot);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("allergen details"))).toBe(true);
    });

    it("accepts explicit 'unknown' as truthful answer without forcing 'none_reported'", () => {
      const unknownSnapshot = createSnapshot({
        answers: {
          ...baseAnswers,
          allergies: { status: "unknown", details: [] },
        },
      });
      const result = validateIntakeCompletion(unknownSnapshot);
      expect(result.valid).toBe(true);
      expect(unknownSnapshot.answers.allergies.status).toBe("unknown");
    });
  });

  describe("4. Staff Access & Authorization Boundary (Issue 6.A)", () => {
    it("fails closed when staff session cookie is missing", () => {
      const req = new NextRequest("http://localhost:3000/api/cases");
      const auth = verifyStaffAuth(req);
      expect(auth.authenticated).toBe(false);
    });

    it("rejects forged or unauthorized session username", () => {
      const req = new NextRequest("http://localhost:3000/api/cases", {
        headers: { cookie: "medikiosk_staff_session=auth_malicioushacker_12345" },
      });
      const auth = verifyStaffAuth(req);
      expect(auth.authenticated).toBe(false);
    });

    it("does NOT trust client-supplied 'x-test-auth' header to bypass authentication", () => {
      const req = new NextRequest("http://localhost:3000/api/cases", {
        headers: { "x-test-auth": "true" },
      });
      const auth = verifyStaffAuth(req);
      expect(auth.authenticated).toBe(false);
    });

    it("authorizes valid staff session with recognized clinical role", () => {
      const req = new NextRequest("http://localhost:3000/api/cases", {
        headers: { cookie: "medikiosk_staff_session=auth_opd_staff_1728600000" },
      });
      const auth = verifyStaffAuth(req);
      expect(auth.authenticated).toBe(true);
      expect(auth.user).toBe("opd_staff");
    });
  });

  describe("5. Truthful AI Configuration (Section 7)", () => {
    it("honestly marks aiStatus as 'unconfigured' when no API keys are set", async () => {
      const snapshot = createSnapshot();
      // Ensure no live LLM key in environment for deterministic offline test
      const prevGemini = process.env.GEMINI_API_KEY;
      const prevOpenAi = process.env.OPENAI_API_KEY;
      const prevGroq = process.env.GROQ_API_KEY;
      delete process.env.GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.GROQ_API_KEY;

      const res = await generateClinicalSummary(snapshot);
      expect(res.isRealAi).toBe(false);
      expect(res.summary.aiStatus).toBe("unconfigured");

      // Restore environment
      if (prevGemini) process.env.GEMINI_API_KEY = prevGemini;
      if (prevOpenAi) process.env.OPENAI_API_KEY = prevOpenAi;
      if (prevGroq) process.env.GROQ_API_KEY = prevGroq;
    });
  });
});