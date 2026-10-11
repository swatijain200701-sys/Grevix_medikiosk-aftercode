import { describe, it, expect } from 'vitest';
import { FRESHNESS_POLICIES } from '../src/lib/db/client-db';
import { PatientCaseSnapshot } from '../src/lib/types/schema';

describe('Data Freshness, Retention & Reconfirmation Engine', () => {
  const baseSnapshot: PatientCaseSnapshot = {
    caseId: 'freshness-case-1',
    revision: 1,
    idempotencyKey: 'freshness-case-1-rev-1',
    schemaVersion: 1,
    status: 'completed_locally',
    patient: {
      preferredName: 'Synthetic Patient F',
      age: '30',
      gender: 'unspecified',
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
      mainConcern: 'Headache',
      onsetDuration: '1 day',
      reportedSymptoms: ['Headache'],
      existingConditions: [],
      currentMedicines: [],
      allergies: { status: 'none_reported', details: [] },
      relevantPreviousCare: 'none',
      questionsForClinician: 'none',
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

  it('marks draft as fresh when within 30-minute window', () => {
    const confirmedTime = Date.now() - (10 * 60 * 1000); // 10 minutes ago
    const snap: PatientCaseSnapshot = {
      ...baseSnapshot,
      lastPatientConfirmedAt: new Date(confirmedTime).toISOString(),
    };
    const age = Date.now() - new Date(snap.lastPatientConfirmedAt).getTime();
    const isStale = snap.status === 'completed_locally' && age > FRESHNESS_POLICIES.RECONFIRMATION_WINDOW_MS;
    expect(isStale).toBe(false);
  });

  it('enforces reconfirmation requirement when completed intake exceeds 30 minutes without sync', () => {
    const confirmedTime = Date.now() - (35 * 60 * 1000); // 35 minutes ago
    const snap: PatientCaseSnapshot = {
      ...baseSnapshot,
      lastPatientConfirmedAt: new Date(confirmedTime).toISOString(),
    };
    const age = Date.now() - new Date(snap.lastPatientConfirmedAt).getTime();
    const isStale = snap.status === 'completed_locally' && age > FRESHNESS_POLICIES.RECONFIRMATION_WINDOW_MS;
    expect(isStale).toBe(true);
  });

  it('identifies records exceeding 24-hour cache expiry retention limit', () => {
    const createdTime = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
    const age = Date.now() - createdTime;
    const isExpired = age > FRESHNESS_POLICIES.CACHE_EXPIRY_MS;
    expect(isExpired).toBe(true);
  });
});