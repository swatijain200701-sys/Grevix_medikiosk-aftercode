import { describe, it, expect } from 'vitest';
import { generateClinicalSummary } from '../src/lib/ai/summarizer';
import { PatientCaseSnapshot } from '../src/lib/types/schema';

describe('AI Summarizer & Provenance Engine', () => {
  const sampleSnapshot: PatientCaseSnapshot = {
    caseId: 'test-case-ai-1',
    revision: 1,
    idempotencyKey: 'test-case-ai-1-rev-1',
    schemaVersion: 1,
    status: 'completed_locally',
    patient: {
      preferredName: 'Sunita Sharma',
      age: '48',
      gender: 'female',
      language: 'en',
      assistedEntry: { isAssisted: false, enteredBy: 'self' },
    },
    consent: {
      recordingConsent: true,
      localOfflineStorageConsent: true,
      aiProcessingConsent: true,
      consentedAt: new Date().toISOString(),
    },
    answers: {
      mainConcern: 'Throat pain and moderate fever',
      onsetDuration: '3 days',
      reportedSymptoms: ['fever', 'throat pain'],
      existingConditions: ['Hypothyroidism'],
      currentMedicines: ['Thyronorm 50mcg'],
      allergies: { status: 'none_reported', details: [] },
      relevantPreviousCare: 'none',
      questionsForClinician: 'Can I take paracetamol?',
      documents: [],
      audioRecordings: [],
    },
    redFlags: [],
    createdAt: new Date().toISOString(),
    lastLocalEditAt: new Date().toISOString(),
    lastPatientConfirmedAt: new Date().toISOString(),
    syncedAt: null,
    serverReceivedAt: null,
    summaryGeneratedAt: null,
    requiresReconfirmation: false,
  };

  it('honestly reports unconfigured provider when API keys are absent', async () => {
    // When no external LLM key is configured in env
    const result = await generateClinicalSummary(sampleSnapshot);
    expect(result.summary).toBeDefined();
    expect(result.summary.mainConcern).toBe('Throat pain and moderate fever');
    expect(result.summary.reportedConditions.some(c => c.condition === 'Hypothyroidism')).toBe(true);
    expect(result.summary.medicines.some(m => m.name === 'Thyronorm 50mcg')).toBe(true);
    expect(result.summary.aiStatus).toBe('unconfigured');
    expect(result.summary.missingOrConflictingInfo[0]).toContain('No external LLM API key configured');
  });
});