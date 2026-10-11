'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, UserCheck } from 'lucide-react';
import { PatientCaseSnapshot, DocumentRecord, RedFlagAlert } from '@/lib/types/schema';
import { I18N } from '@/lib/i18n/translations';
import { saveLocalCase, getLocalCase, getActiveCaseId, enqueueSync, clearActiveSession } from '@/lib/db/client-db';
import { syncManager, SyncStats } from '@/lib/sync/sync-manager';
import { evaluateRedFlags } from '@/lib/rules/red-flags';
import { voiceAdapter } from '@/lib/voice/voice-adapter';
import { processDocumentImage } from '@/lib/ocr/ocr-adapter';

import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { StepRegistration } from '@/components/kiosk/StepRegistration';
import { StepConsent } from '@/components/kiosk/StepConsent';
import { StepMainConcern } from '@/components/kiosk/StepMainConcern';
import { StepSymptoms } from '@/components/kiosk/StepSymptoms';
import { StepConditionsMeds } from '@/components/kiosk/StepConditionsMeds';
import { StepAllergies } from '@/components/kiosk/StepAllergies';
import { StepDocuments } from '@/components/kiosk/StepDocuments';
import { StepReview } from '@/components/kiosk/StepReview';
import { StepCompletion } from '@/components/kiosk/StepCompletion';

const TOTAL_STEPS = 8;

export default function KioskPage() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const t = I18N[lang];

  const [caseId, setCaseId] = useState<string>('');
  const [revision, setRevision] = useState<number>(1);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [savedLocally, setSavedLocally] = useState<boolean>(false);
  const [syncStats, setSyncStats] = useState<SyncStats>({
    lastSyncAttemptAt: null,
    lastSuccessfulSyncAt: null,
    isOnline: true,
    isServerReachable: true,
    pendingCount: 0,
    lastError: null,
    reconnectLatencyMs: null,
  });

  const [preferredName, setPreferredName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [isAssisted, setIsAssisted] = useState<boolean>(false);
  const [enteredBy, setEnteredBy] = useState<'self' | 'caregiver' | 'staff'>('self');
  const [caregiverName, setCaregiverName] = useState<string>('');

  const [storageConsent, setStorageConsent] = useState<boolean>(true);
  const [aiConsent, setAiConsent] = useState<boolean>(true);
  const [recordingConsent, setRecordingConsent] = useState<boolean>(true);

  const [mainConcern, setMainConcern] = useState<string>('');
  const [onsetDuration, setOnsetDuration] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [unconfirmedTranscript, setUnconfirmedTranscript] = useState<string | null>(null);

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState<string>('');

  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [medicines, setMedicines] = useState<string>('');

  const [allergyType, setAllergyType] = useState<'none_reported' | 'unknown' | 'reported'>('none_reported');
  const [allergyDetails, setAllergyDetails] = useState<string>('');
  const [previousCare, setPreviousCare] = useState<string>('');
  const [questionsForDoctor, setQuestionsForDoctor] = useState<string>('');

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [redFlags, setRedFlags] = useState<RedFlagAlert[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [sessionCleared, setSessionCleared] = useState<boolean>(false);

  useEffect(() => {
    // Check if resuming active session from an offline reload
    const activeId = getActiveCaseId();
    if (activeId) {
      setCaseId(activeId);
      getLocalCase(activeId).then((existing) => {
        if (existing && existing.status === 'draft') {
          setPreferredName(existing.patient.preferredName || '');
          setAge(existing.patient.age || '');
          setIsAssisted(existing.patient.assistedEntry.isAssisted);
          setEnteredBy(existing.patient.assistedEntry.enteredBy);
          setMainConcern(existing.answers.mainConcern || '');
          setOnsetDuration(existing.answers.onsetDuration || '');
          setSelectedSymptoms(existing.answers.reportedSymptoms || []);
          setSelectedConditions(existing.answers.existingConditions || []);
          setMedicines(existing.answers.currentMedicines?.join(', ') || '');
          setAllergyType(existing.answers.allergies.status);
          setAllergyDetails(existing.answers.allergies.details?.join(', ') || '');
          setDocuments(existing.answers.documents || []);
          setRevision(existing.revision);
        }
      }).catch(() => {});
    } else {
      const newId = `kiosk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
      setCaseId(newId);
    }

    const unsub = syncManager.subscribe((_, stats) => {
      setSyncStats(stats);
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    const flags = evaluateRedFlags({
      mainConcern,
      onsetDuration,
      reportedSymptoms: selectedSymptoms,
      existingConditions: selectedConditions,
      currentMedicines: medicines ? medicines.split(',').map(m => m.trim()) : [],
      allergies: {
        status: allergyType,
        details: allergyDetails ? allergyDetails.split(',').map(a => a.trim()) : [],
      },
      relevantPreviousCare: previousCare,
      questionsForClinician: questionsForDoctor,
      documents,
      audioRecordings: [],
    });
    setRedFlags(flags);
  }, [mainConcern, onsetDuration, selectedSymptoms, selectedConditions, medicines, allergyType, allergyDetails, previousCare, questionsForDoctor, documents]);

  const buildSnapshot = (status: PatientCaseSnapshot['status'] = 'draft'): PatientCaseSnapshot => {
    const now = new Date().toISOString();
    return {
      caseId,
      revision,
      idempotencyKey: `${caseId}-rev-${revision}`,
      schemaVersion: 1,
      status,
      patient: {
        preferredName: preferredName || 'Anonymous Patient',
        age: age || 'Not specified',
        gender: 'unspecified',
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
        currentMedicines: medicines ? medicines.split(',').map(m => m.trim()).filter(Boolean) : [],
        allergies: {
          status: allergyType,
          details: allergyDetails ? allergyDetails.split(',').map(a => a.trim()).filter(Boolean) : [],
        },
        relevantPreviousCare: previousCare || 'None reported',
        questionsForClinician: questionsForDoctor || 'None',
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

  const persistLocally = async (status: PatientCaseSnapshot['status'] = 'draft') => {
    try {
      const snap = buildSnapshot(status);
      await saveLocalCase(snap);
      setSavedLocally(true);
      setTimeout(() => setSavedLocally(false), 2000);
    } catch (err) {
      console.warn('Local persist error:', err);
    }
  };

  const handleNext = async () => {
    await persistLocally('draft');
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleVoice = async () => {
    if (isListening) {
      voiceAdapter.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      await voiceAdapter.startListening(
        lang === 'hi' ? 'hi-IN' : 'en-IN',
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
      setDocuments(prev => [
        ...prev,
        {
          id: `doc-${Date.now()}`,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
          ocrStatus: 'needs_confirmation',
          extractedText: ocr.extractedText,
          patientConfirmedText: ocr.extractedText,
          confidence: ocr.confidence,
          notes: ocr.notes,
          hasHandwritingOrAmbiguity: ocr.hasUncertainExtraction,
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || 'File upload error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    const snap = buildSnapshot('completed_locally');
    await saveLocalCase(snap);
    await enqueueSync({
      caseId: snap.caseId,
      revision: snap.revision,
      idempotencyKey: snap.idempotencyKey,
      snapshot: snap,
      clientTimestamp: new Date().toISOString(),
    });
    syncManager.triggerSync('patient_submit');
    setIsSubmitted(true);
  };

  const handleFinishAndReset = async () => {
    await clearActiveSession();
    setSessionCleared(true);
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B1D3A] flex flex-col font-sans">
      <KioskHeader
        syncStats={syncStats}
        savedLocally={savedLocally}
        lang={lang}
        onToggleLang={() => setLang(l => (l === 'en' ? 'hi' : 'en'))}
        savedText={t.savedLocally}
        langText={t.languageToggle}
      />

      {!isSubmitted && (
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-teal-600 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      )}

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col justify-between">
        {!isSubmitted ? (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>{t.step} {currentStep} {t.of} {TOTAL_STEPS}</span>
              {isAssisted && (
                <span className="inline-flex items-center gap-1 text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t.assistedEntry}
                </span>
              )}
            </div>

            {redFlags.length > 0 && (
              <div id="red-flag-alert" className="mb-6 p-4 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3 shadow-xs">
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <h4 className="font-bold text-amber-900 text-base mb-1">
                    {lang === 'hi' ? 'महत्वपूर्ण सूचना / Attention' : 'Important Clinical Notice'}
                  </h4>
                  <p className="font-medium">
                    {lang === 'hi' ? redFlags[0].patientMessageHi : redFlags[0].patientMessageEn}
                  </p>
                  <p className="text-xs text-amber-800/80 mt-1 italic">
                    Demonstration review flag detected locally. Please speak to the triage nurse or OPD counter.
                  </p>
                </div>
              </div>
            )}

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
                    setMainConcern(prev => prev ? `${prev} ${unconfirmedTranscript}` : unconfirmedTranscript);
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
                toggleSymptom={s => setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                customSymptom={customSymptom}
                setCustomSymptom={setCustomSymptom}
                addCustomSymptom={() => {
                  if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
                    setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
                    setCustomSymptom('');
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
                  setDocuments(prev => prev.map(d => d.id === id ? { ...d, patientConfirmedText: txt, ocrStatus: 'completed' } : d));
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

            <div className="pt-8 mt-auto flex items-center justify-between border-t border-slate-200">
              <button
                type="button"
                id="kiosk-back-btn"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition ${
                  currentStep === 1 ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100' : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                {t.back}
              </button>

              {currentStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  id="kiosk-next-btn"
                  onClick={handleNext}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                >
                  {t.next}
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  id="kiosk-submit-btn"
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  {t.submit}
                </button>
              )}
            </div>
          </div>
        ) : (
          <StepCompletion
            caseId={caseId}
            revision={revision}
            isOnline={syncStats.isServerReachable && syncStats.isOnline}
            sessionCleared={sessionCleared}
            onFinishAndReset={handleFinishAndReset}
            t={t}
          />
        )}
      </main>
    </div>
  );
}