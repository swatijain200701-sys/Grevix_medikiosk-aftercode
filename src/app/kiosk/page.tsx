"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, UserCheck } from "lucide-react";
import { PatientCaseSnapshot, DocumentRecord, RedFlagAlert, validateIntakeCompletion } from "@/lib/types/schema";
import { I18N } from "@/lib/i18n/translations";
import { saveLocalCase, getLocalCase, getActiveCaseId, enqueueSync, clearActiveSession } from "@/lib/db/client-db";
import { syncManager, SyncStats } from "@/lib/sync/sync-manager";
import { evaluateRedFlags } from "@/lib/rules/red-flags";
import { voiceAdapter } from "@/lib/voice/voice-adapter";
import { processDocumentImage } from "@/lib/ocr/ocr-adapter";

import { KioskHeader } from "@/components/kiosk/KioskHeader";
import { StepRegistration } from "@/components/kiosk/StepRegistration";
import { StepConsent } from "@/components/kiosk/StepConsent";
import { StepMainConcern } from "@/components/kiosk/StepMainConcern";
import { StepSymptoms } from "@/components/kiosk/StepSymptoms";
import { StepConditionsMeds } from "@/components/kiosk/StepConditionsMeds";
import { StepAllergies } from "@/components/kiosk/StepAllergies";
import { StepDocuments } from "@/components/kiosk/StepDocuments";
import { StepReview } from "@/components/kiosk/StepReview";
import { StepCompletion, SubmissionStatusType } from "@/components/kiosk/StepCompletion";

const TOTAL_STEPS = 8;

export default function KioskPage() {
  const [lang, setLang] = useState<"en" | "hi">("en");
  const t = I18N[lang];

  const [caseId, setCaseId] = useState<string>("");
  const [revision, setRevision] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [savedLocally, setSavedLocally] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [syncStats, setSyncStats] = useState<SyncStats>({
    lastSyncAttemptAt: null,
    lastSuccessfulSyncAt: null,
    isOnline: true,
    isServerReachable: true,
    pendingCount: 0,
    lastError: null,
    reconnectLatencyMs: null,
  });

  const [preferredName, setPreferredName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [isAssisted, setIsAssisted] = useState<boolean>(false);
  const [enteredBy, setEnteredBy] = useState<"self" | "caregiver" | "staff">("self");
  const [caregiverName, setCaregiverName] = useState<string>("");

  // Consent boxes begin UNCHECKED on fresh session
  const [storageConsent, setStorageConsent] = useState<boolean>(false);
  const [aiConsent, setAiConsent] = useState<boolean>(false);
  const [recordingConsent, setRecordingConsent] = useState<boolean>(false);

  const [mainConcern, setMainConcern] = useState<string>("");
  const [onsetDuration, setOnsetDuration] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [unconfirmedTranscript, setUnconfirmedTranscript] = useState<string | null>(null);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState<string>("");

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<string>("");

  // Allergies begin with NO answer selected
  const [allergyType, setAllergyType] = useState<"none_reported" | "unknown" | "reported" | "unanswered" | "">("");
  const [allergyDetails, setAllergyDetails] = useState<string>("");
  const [previousCare, setPreviousCare] = useState<string>("");
  const [questionsForDoctor, setQuestionsForDoctor] = useState<string>("");

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatusType>("saved_locally_waiting");
  const [aiSummaryStatus, setAiSummaryStatus] = useState<"pending" | "generated" | "unconfigured" | "consent_declined" | "failed">("pending");
  const [sessionCleared, setSessionCleared] = useState<boolean>(false);

  useEffect(() => {
    // Check if resuming active session from an offline reload
    const activeId = getActiveCaseId();
    if (activeId) {
      setCaseId(activeId);
      getLocalCase(activeId)
        .then((existing) => {
          if (existing && existing.status === "draft") {
            setPreferredName(existing.patient.preferredName || "");
            setAge(existing.patient.age || "");
            setIsAssisted(existing.patient.assistedEntry.isAssisted);
            setEnteredBy(existing.patient.assistedEntry.enteredBy);
            setStorageConsent(existing.consent.localOfflineStorageConsent);
            setAiConsent(existing.consent.aiProcessingConsent);
            setRecordingConsent(existing.consent.recordingConsent);
            setMainConcern(existing.answers.mainConcern || "");
            setOnsetDuration(existing.answers.onsetDuration || "");
            setSelectedSymptoms(existing.answers.reportedSymptoms || []);
            setSelectedConditions(existing.answers.existingConditions || []);
            setMedicines(existing.answers.currentMedicines?.join(", ") || "");
            setAllergyType(existing.answers.allergies.status);
            setAllergyDetails(existing.answers.allergies.details?.join(", ") || "");
            setDocuments(existing.answers.documents || []);
            setRevision(existing.revision);
          }
        })
        .catch(() => {});
    } else {
      const newId = `kiosk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      setCaseId(newId);
    }

    const unsub = syncManager.subscribe((_, stats) => {
      setSyncStats(stats);
      if (isSubmitted) {
        if (!stats.isServerReachable || !stats.isOnline) {
          setSubmissionStatus("saved_locally_waiting");
        }
      }
    });

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => unsub();
  }, [isSubmitted]);

  useEffect(() => {
    const flags = evaluateRedFlags({
      mainConcern,
      onsetDuration,
      reportedSymptoms: selectedSymptoms,
      existingConditions: selectedConditions,
      currentMedicines: medicines ? medicines.split(",").map((m) => m.trim()) : [],
      allergies: {
        status: (allergyType || "unanswered") as any,
        details: allergyDetails ? allergyDetails.split(",").map((a) => a.trim()) : [],
      },
      relevantPreviousCare: previousCare,
      questionsForClinician: questionsForDoctor,
      documents,
      audioRecordings: [],
    });
    setRedFlags(flags);
  }, [mainConcern, onsetDuration, selectedSymptoms, selectedConditions, medicines, allergyType, allergyDetails, previousCare, questionsForDoctor, documents]);

  const buildSnapshot = (status: PatientCaseSnapshot["status"] = "draft"): PatientCaseSnapshot => {
    const now = new Date().toISOString();
    return {
      caseId,
      revision,
      idempotencyKey: `${caseId}-rev-${revision}`,
      schemaVersion: 1,
      status,
      patient: {
        preferredName: preferredName || "Anonymous Patient",
        age: age || "Not specified",
        gender: "unspecified",
        language: lang,
        assistedEntry: { isAssisted, enteredBy, caregiverName: caregiverName || undefined },
      },
      consent: {
        recordingConsent,
        localOfflineStorageConsent: storageConsent,
        aiProcessingConsent: aiConsent,
        consentedAt: now,
      },
      answers: {
        mainConcern,
        onsetDuration,
        reportedSymptoms: selectedSymptoms,
        existingConditions: selectedConditions,
        currentMedicines: medicines ? medicines.split(",").map((m) => m.trim()).filter(Boolean) : [],
        allergies: {
          status: (allergyType || "unanswered") as any,
          details: allergyDetails ? allergyDetails.split(",").map((a) => a.trim()).filter(Boolean) : [],
        },
        relevantPreviousCare: previousCare || "None reported",
        questionsForClinician: questionsForDoctor || "None",
        documents,
        audioRecordings: [],
      },
      redFlags,
      createdAt: now,
      lastLocalEditAt: now,
      lastPatientConfirmedAt: now,
      syncedAt: null,
      serverReceivedAt: null,
      summaryGeneratedAt: null,
      requiresReconfirmation: false,
    };
  };

  const persistLocally = async (status: PatientCaseSnapshot["status"] = "draft") => {
    // Do not persist health details before storage consent is granted!
    if (!storageConsent) return;
    try {
      const snap = buildSnapshot(status);
      await saveLocalCase(snap);
      setSavedLocally(true);
      setTimeout(() => setSavedLocally(false), 2000);
    } catch (err) {
      console.warn("Local persist error:", err);
    }
  };

  const handleNext = async () => {
    setValidationError(null);

    // Step 1 Validation
    if (currentStep === 1) {
      if (!preferredName.trim()) {
        setValidationError("Please enter your name or preferred identification to continue.");
        return;
      }
      if (!age.trim()) {
        setValidationError("Please enter your age or age range.");
        return;
      }
    }

    // Step 2 Consent Progression Boundary
    if (currentStep === 2) {
      if (!storageConsent) {
        setValidationError(
          "Local storage permission is required for this self-service kiosk. If you prefer not to store data digitally, please request assisted paper intake at the registration counter."
        );
        return;
      }
    }

    // Step 3 Main Concern
    if (currentStep === 3) {
      if (!mainConcern.trim()) {
        setValidationError("Please share your primary concern or reason for visit today.");
        return;
      }
    }

    // Step 6 Allergy check
    if (currentStep === 6) {
      if (!allergyType) {
        setValidationError(
          "Please answer the allergy question (select No known allergies, I have an allergy, or I do not know)."
        );
        return;
      }
      if (allergyType === "reported" && !allergyDetails.trim()) {
        setValidationError("Please specify allergen details (e.g. medicine or food name).");
        return;
      }
    }

    await persistLocally("draft");
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleVoice = async () => {
    if (!recordingConsent) {
      setValidationError("Voice consent was not granted. Please use touch input or update consent on step 2.");
      return;
    }
    if (isListening) {
      voiceAdapter.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      await voiceAdapter.startListening(
        lang === "hi" ? "hi-IN" : "en-IN",
        (res) => {
          if (res.isFinal) {
            setUnconfirmedTranscript(res.transcript);
            setIsListening(false);
          }
        },
        () => setIsListening(false)
      );
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const ocr = await processDocumentImage(file);
      setDocuments((prev) => [
        ...prev,
        {
          id: `doc-${Date.now()}`,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          ocrStatus: "needs_confirmation",
          extractedText: ocr.extractedText,
          patientConfirmedText: ocr.extractedText,
          confidence: ocr.confidence,
          notes: ocr.notes,
          hasHandwritingOrAmbiguity: ocr.hasUncertainExtraction,
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || "File upload error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);
    const snap = buildSnapshot("completed_locally");

    // Enforce minimal completion requirements
    const validation = validateIntakeCompletion(snap);
    if (!validation.valid) {
      setValidationError(`Cannot submit incomplete intake: ${validation.errors.join(" ")}`);
      return;
    }

    // 1. Save locally with durable Web Crypto encryption
    await saveLocalCase(snap);
    await enqueueSync({
      caseId: snap.caseId,
      revision: snap.revision,
      idempotencyKey: snap.idempotencyKey,
      snapshot: snap,
      clientTimestamp: new Date().toISOString(),
    });

    setIsSubmitted(true);

    if (!syncStats.isOnline || !syncStats.isServerReachable) {
      setSubmissionStatus("saved_locally_waiting");
      setAiSummaryStatus("pending");
      return;
    }

    // 2. Transmit to server
    setSubmissionStatus("sending");
    try {
      const result = await syncManager.triggerSync("patient_submit");
      if (result.syncedCount > 0) {
        setSubmissionStatus("received_by_server");
        setAiSummaryStatus(aiConsent ? "generated" : "consent_declined");
      } else if (result.errors > 0) {
        setSubmissionStatus("could_not_send_retry");
      } else {
        setSubmissionStatus("saved_locally_waiting");
      }
    } catch {
      setSubmissionStatus("could_not_send_retry");
    }
  };

  const handleFinishAndReset = async () => {
    await clearActiveSession();
    setSessionCleared(true);
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="min-h-screen bg-[#EAF0EB] text-[#293D36] flex flex-col font-sans selection:bg-[#356B62]/20 selection:text-[#356B62]">
      <KioskHeader
        syncStats={syncStats}
        savedLocally={savedLocally}
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "en" ? "hi" : "en"))}
        savedText={t.savedLocally}
        langText={t.languageToggle}
      />

      {!isSubmitted && (
        <div className="w-full bg-[#D8E5DC] h-1.5">
          <div
            className="bg-[#356B62] h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-between">
        {!isSubmitted ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 text-xs font-bold uppercase tracking-wider text-[#53665D]">
              <span className="font-mono text-[#356B62]">
                {t.step} {currentStep} {t.of} {TOTAL_STEPS}
              </span>
              {isAssisted && (
                <span className="inline-flex items-center gap-1 text-[#356B62] bg-[#D8E5DC] border border-[#B8C9BD] px-2.5 py-0.5 rounded-md font-bold text-2xs">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t.assistedEntry}
                </span>
              )}
            </div>

            {/* Red Flag Attention Notice */}
            {redFlags.length > 0 && (
              <div
                id="red-flag-alert"
                className="mb-6 p-4 rounded-2xl bg-[#FEE2E2] border-2 border-[#EF4444] text-[#991B1B] flex items-start gap-3 shadow-md"
              >
                <AlertTriangle className="w-6 h-6 text-[#DC2626] shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <h4 className="font-bold text-[#991B1B] text-base mb-1">
                    {lang === "hi" ? "महत्वपूर्ण सूचना / Attention" : "Important Clinical Notice"}
                  </h4>
                  <p className="font-bold text-[#293D36]">
                    {lang === "hi" ? redFlags[0].patientMessageHi : redFlags[0].patientMessageEn}
                  </p>
                  <p className="text-2xs text-[#7F1D1D] mt-1 font-medium">
                    Staff-attention prompt only — not a clinical diagnosis or triage determination. Please speak with the triage nurse or OPD desk.
                  </p>
                </div>
              </div>
            )}

            {/* Inline Validation Error Banner */}
            {validationError && (
              <div
                role="alert"
                className="mb-6 p-4 rounded-xl bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] text-xs font-bold flex items-start gap-2.5 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#DC2626]" />
                <span className="leading-relaxed">{validationError}</span>
              </div>
            )}

            {/* Content Card (Warm Cream) */}
            <div className="bg-[#FAF7F0] p-6 sm:p-8 rounded-3xl border border-[#B8C9BD] shadow-md text-[#293D36]">
              {currentStep === 1 && (
                <StepRegistration
                  preferredName={preferredName}
                  setPreferredName={setPreferredName}
                  age={age}
                  setAge={setAge}
                  isAssisted={isAssisted}
                  setIsAssisted={setIsAssisted}
                  enteredBy={enteredBy}
                  setEnteredBy={setEnteredBy}
                  caregiverName={caregiverName}
                  setCaregiverName={setCaregiverName}
                  t={t}
                />
              )}

              {currentStep === 2 && (
                <StepConsent
                  storageConsent={storageConsent}
                  setStorageConsent={setStorageConsent}
                  aiConsent={aiConsent}
                  setAiConsent={setAiConsent}
                  recordingConsent={recordingConsent}
                  setRecordingConsent={setRecordingConsent}
                  t={t}
                />
              )}

              {currentStep === 3 && (
                <StepMainConcern
                  mainConcern={mainConcern}
                  setMainConcern={setMainConcern}
                  onsetDuration={onsetDuration}
                  setOnsetDuration={setOnsetDuration}
                  recordingConsent={recordingConsent}
                  isListening={isListening}
                  toggleVoice={toggleVoice}
                  unconfirmedTranscript={unconfirmedTranscript}
                  confirmTranscript={() => {
                    if (unconfirmedTranscript) {
                      setMainConcern((prev) => (prev ? `${prev} ${unconfirmedTranscript}` : unconfirmedTranscript));
                      setUnconfirmedTranscript(null);
                    }
                  }}
                  discardTranscript={() => setUnconfirmedTranscript(null)}
                  lang={lang}
                  t={t}
                />
              )}

              {currentStep === 4 && (
                <StepSymptoms
                  selectedSymptoms={selectedSymptoms}
                  toggleSymptom={(s) =>
                    setSelectedSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
                  }
                  customSymptom={customSymptom}
                  setCustomSymptom={setCustomSymptom}
                  addCustomSymptom={() => {
                    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
                      setSelectedSymptoms((prev) => [...prev, customSymptom.trim()]);
                      setCustomSymptom("");
                    }
                  }}
                  lang={lang}
                  t={t}
                />
              )}

              {currentStep === 5 && (
                <StepConditionsMeds
                  selectedConditions={selectedConditions}
                  setSelectedConditions={setSelectedConditions}
                  medicines={medicines}
                  setMedicines={setMedicines}
                  lang={lang}
                  t={t}
                />
              )}

              {currentStep === 6 && (
                <StepAllergies
                  allergyType={allergyType}
                  setAllergyType={setAllergyType}
                  allergyDetails={allergyDetails}
                  setAllergyDetails={setAllergyDetails}
                  previousCare={previousCare}
                  setPreviousCare={setPreviousCare}
                  questionsForDoctor={questionsForDoctor}
                  setQuestionsForDoctor={setQuestionsForDoctor}
                  t={t}
                />
              )}

              {currentStep === 7 && (
                <StepDocuments
                  documents={documents}
                  isUploading={isUploading}
                  uploadError={uploadError}
                  handleFileUpload={handleFileUpload}
                  confirmDocumentText={(id, txt) => {
                    setDocuments((prev) =>
                      prev.map((d) => (d.id === id ? { ...d, patientConfirmedText: txt, ocrStatus: "completed" } : d))
                    );
                  }}
                  t={t}
                />
              )}

              {currentStep === 8 && (
                <StepReview
                  preferredName={preferredName}
                  age={age}
                  mainConcern={mainConcern}
                  onsetDuration={onsetDuration}
                  selectedSymptoms={selectedSymptoms}
                  selectedConditions={selectedConditions}
                  medicines={medicines}
                  allergyType={allergyType}
                  allergyDetails={allergyDetails}
                  documents={documents}
                  t={t}
                />
              )}
            </div>

            {/* Back / Next Navigation */}
            <div className="pt-6 mt-auto flex items-center justify-between">
              <button
                type="button"
                id="kiosk-back-btn"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition min-h-[48px] ${
                  currentStep === 1
                    ? "opacity-40 cursor-not-allowed text-[#53665D] bg-[#D8E5DC] border border-[#B8C9BD]"
                    : "text-[#293D36] bg-[#FAF7F0] border border-[#B8C9BD] hover:bg-[#D8E5DC]"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.back}</span>
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  id="kiosk-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] shadow-sm transition min-h-[48px]"
                >
                  <span>{t.next}</span>
                  <ArrowRight className="w-4 h-4 text-[#FFFDF7]" />
                </button>
              ) : (
                <button
                  type="button"
                  id="kiosk-submit-btn"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-9 py-4 rounded-xl font-bold text-base bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] shadow-md transition min-h-[48px]"
                >
                  <CheckCircle className="w-5 h-5 text-[#FFFDF7]" />
                  <span>{t.submit}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <StepCompletion
            caseId={caseId}
            revision={revision}
            isOnline={syncStats.isServerReachable && syncStats.isOnline}
            submissionStatus={submissionStatus}
            aiSummaryStatus={aiSummaryStatus}
            sessionCleared={sessionCleared}
            onFinishAndReset={handleFinishAndReset}
            onRetrySend={handleSubmit}
            t={t}
          />
        )}
      </main>
    </div>
  );
}