import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { SqliteCaseRepository } from '../src/lib/db/server-db';
import { PatientCaseSnapshot, StructuredAiSummary } from '../src/lib/types/schema';

describe('SqliteCaseRepository & Idempotency Engine', () => {
  let repo: SqliteCaseRepository;
  let inMemoryDb: Database.Database;

  const sampleSnapshot: PatientCaseSnapshot = {
    caseId: 'test-case-100',
    revision: 1,
    idempotencyKey: 'test-case-100-rev-1',
    schemaVersion: 1,
    status: 'completed_locally',
    patient: {
      preferredName: 'Synthetic Patient A',
      age: '45',
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
      mainConcern: 'Persistent dry cough',
      onsetDuration: '5 days',
      reportedSymptoms: ['cough', 'fever'],
      existingConditions: ['Asthma'],
      currentMedicines: ['Inhaler as needed'],
      allergies: { status: 'none_reported', details: [] },
      relevantPreviousCare: 'Clinic visit last year',
      questionsForClinician: 'None',
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

  beforeEach(() => {
    inMemoryDb = new Database(':memory:');
    inMemoryDb.exec(`
      CREATE TABLE cases (
        case_id TEXT PRIMARY KEY,
        current_revision INTEGER NOT NULL,
        patient_name TEXT NOT NULL,
        age TEXT NOT NULL,
        language TEXT NOT NULL,
        status TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        idempotency_key TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        server_received_at TEXT NOT NULL
      );
      CREATE TABLE case_revisions (
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        received_at TEXT NOT NULL,
        PRIMARY KEY (case_id, revision)
      );
      CREATE TABLE summaries (
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        summary_json TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        PRIMARY KEY (case_id, revision)
      );
      CREATE TABLE staff_reviews (
        case_id TEXT PRIMARY KEY,
        triage_category TEXT NOT NULL DEFAULT 'routine',
        staff_notes TEXT NOT NULL DEFAULT '',
        reviewed_by TEXT,
        acknowledged_at TEXT,
        updated_at TEXT NOT NULL
      );
      CREATE TABLE red_flags (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        rule_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        staff_message TEXT NOT NULL,
        supporting_answer TEXT NOT NULL,
        detected_at TEXT NOT NULL
      );
    `);
    repo = new SqliteCaseRepository(inMemoryDb);
  });

  it('successfully saves new patient case snapshot', () => {
    const res = repo.upsertCase(sampleSnapshot, sampleSnapshot.idempotencyKey);
    expect(res.success).toBe(true);
    expect(res.duplicate).toBe(false);

    const retrieved = repo.getCase('test-case-100');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.snapshot.patient.preferredName).toBe('Synthetic Patient A');
    expect(retrieved?.revision).toBe(1);
  });

  it('handles lost acknowledgments: retransmission of identical idempotency key returns saved case without duplication', () => {
    // Initial transmission accepted by server, but client loses acknowledgment
    const res1 = repo.upsertCase(sampleSnapshot, sampleSnapshot.idempotencyKey);
    expect(res1.success).toBe(true);

    // Retransmission after reconnect with exact same key
    const res2 = repo.upsertCase(sampleSnapshot, sampleSnapshot.idempotencyKey);
    expect(res2.success).toBe(true);
    expect(res2.duplicate).toBe(true);

    const cases = repo.listCases();
    const matchingCases = cases.filter(c => c.caseId === 'test-case-100');
    expect(matchingCases.length).toBe(1); // recordCount = 1

    const duplicateCount = cases.length - 1;
    expect(duplicateCount).toBe(0); // duplicateCount = 0
  });

  it('rejects stale older revision submissions', () => {
    const rev2: PatientCaseSnapshot = {
      ...sampleSnapshot,
      revision: 2,
      idempotencyKey: 'test-case-100-rev-2',
    };
    repo.upsertCase(rev2, rev2.idempotencyKey);

    const staleAttempt = repo.upsertCase(sampleSnapshot, 'test-case-100-rev-1');
    expect(staleAttempt.success).toBe(false);
    expect(staleAttempt.message).toContain('Stale revision');
  });

  it('never overwrites a newer case intake revision with an older summary', () => {
    // Rev 1 arrives
    repo.upsertCase(sampleSnapshot, sampleSnapshot.idempotencyKey);

    // Rev 2 arrives with updated concern
    const rev2: PatientCaseSnapshot = {
      ...sampleSnapshot,
      revision: 2,
      idempotencyKey: 'test-case-100-rev-2',
      answers: { ...sampleSnapshot.answers, mainConcern: 'Cough resolved, now severe wheezing' },
    };
    repo.upsertCase(rev2, rev2.idempotencyKey);

    // Summary arrives for Rev 1 (e.g. delayed async worker)
    const rev1Summary: StructuredAiSummary = {
      mainConcern: 'Persistent dry cough',
      historyOfPresentConcern: '5 days dry cough',
      reportedConditions: [],
      medicines: [],
      allergies: { status: 'none_reported', items: [], sourceId: 'a1' },
      relevantDocumentObservations: [],
      missingOrConflictingInfo: [],
      sourceReferences: [],
      unsupportedOrContradictoryFlags: [],
      inputRevision: 1,
      generatedAt: new Date().toISOString(),
      provider: 'TestProvider',
      aiStatus: 'generated',
    };
    (rev1Summary as any).caseId = 'test-case-100';
    repo.saveSummary(rev1Summary);

    // Verify latest case retrieval for dashboard returns Rev 2, NOT Rev 1 summary
    const currentCase = repo.getCase('test-case-100');
    expect(currentCase?.revision).toBe(2);
    expect(currentCase?.snapshot.answers.mainConcern).toBe('Cough resolved, now severe wheezing');
    // Summary for current revision (2) is undefined because Rev 1 summary does not match Rev 2
    expect(currentCase?.summary).toBeUndefined();
  });

  it('preserves staff review notes across revisions', () => {
    repo.upsertCase(sampleSnapshot, sampleSnapshot.idempotencyKey);
    repo.saveStaffReview('test-case-100', {
      staffNotes: 'Patient advised to hydrate. Prioritize asthma check.',
      triageCategory: 'priority',
    });

    const rev2: PatientCaseSnapshot = {
      ...sampleSnapshot,
      revision: 2,
      idempotencyKey: 'test-case-100-rev-2',
      answers: { ...sampleSnapshot.answers, mainConcern: 'Persistent dry cough worsening at night' },
    };
    repo.upsertCase(rev2, rev2.idempotencyKey);

    const updated = repo.getCase('test-case-100');
    expect(updated?.revision).toBe(2);
    expect(updated?.staffReview.staffNotes).toBe('Patient advised to hydrate. Prioritize asthma check.');
    expect(updated?.staffReview.triageCategory).toBe('priority');
  });
});