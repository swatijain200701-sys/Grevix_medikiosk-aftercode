import path from 'path';
import fs from 'fs';
import { PatientCaseSnapshot, StructuredAiSummary, StaffReview, RedFlagAlert } from '@/lib/types/schema';
import { LibSqlCaseRepository } from './libsql-db';

/**
 * MediKiosk Server Repository Implementation (SQLite)
 *
 * NOTE ON HOSTING ENVIRONMENT:
 * SQLite requires a persistent filesystem (e.g. stateful container, VM, or mounted EBS/volume).
 * It is not suitable for ephemeral serverless lambdas without mounted persistent storage.
 */

let _db: any = null;

export function getDatabase(): any {
  if (!_db) {
    try {
      const DB_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
      if (!fs.existsSync(/*turbopackIgnore: true*/ DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const DB_PATH = path.join(DB_DIR, 'medikiosk.sqlite');
      const DatabaseConstructor = require('better-sqlite3');
      _db = new DatabaseConstructor(DB_PATH);
      _db.pragma('journal_mode = WAL');
      _db.pragma('foreign_keys = ON');
      initSchema(_db);
    } catch (err) {
      console.warn('better-sqlite3 load warning (expected in serverless):', err);
    }
  }
  return _db;
}

function initSchema(db: any): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cases (
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

    CREATE TABLE IF NOT EXISTS case_revisions (
      case_id TEXT NOT NULL,
      revision INTEGER NOT NULL,
      idempotency_key TEXT NOT NULL,
      snapshot_json TEXT NOT NULL,
      received_at TEXT NOT NULL,
      PRIMARY KEY (case_id, revision)
    );

    CREATE TABLE IF NOT EXISTS summaries (
      case_id TEXT NOT NULL,
      revision INTEGER NOT NULL,
      summary_json TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      PRIMARY KEY (case_id, revision)
    );

    CREATE TABLE IF NOT EXISTS staff_reviews (
      case_id TEXT PRIMARY KEY,
      triage_category TEXT NOT NULL DEFAULT 'routine',
      staff_notes TEXT NOT NULL DEFAULT '',
      reviewed_by TEXT,
      acknowledged_at TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS red_flags (
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

    CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
    CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at);
  `);
}

export interface CaseQueueItem {
  caseId: string;
  revision: number;
  patientName: string;
  age: string;
  language: string;
  status: string;
  summaryStatus: string;
  triageCategory: string;
  redFlagCount: number;
  createdAt: string;
  serverReceivedAt: string;
  acknowledgedAt: string | null;
}

export interface FullCaseRecord {
  caseId: string;
  revision: number;
  snapshot: PatientCaseSnapshot;
  summary?: StructuredAiSummary;
  staffReview: StaffReview;
  redFlags: RedFlagAlert[];
}

export interface ICaseRepository {
  upsertCase(snapshot: PatientCaseSnapshot, idempotencyKey: string): { success: boolean; duplicate: boolean; message: string; record: PatientCaseSnapshot };
  getCase(caseId: string): FullCaseRecord | null;
  listCases(filter?: { status?: string; triage?: string }): CaseQueueItem[];
  saveSummary(summary: StructuredAiSummary): void;
  saveStaffReview(caseId: string, review: Partial<StaffReview>): StaffReview;
  getSummaryForRevision(caseId: string, revision: number): StructuredAiSummary | null;
}

export class SqliteCaseRepository implements ICaseRepository {
  private db: any;

  constructor(dbInstance?: any) {
    this.db = dbInstance || getDatabase();
  }

  upsertCase(snapshot: PatientCaseSnapshot, idempotencyKey: string): { success: boolean; duplicate: boolean; message: string; record: PatientCaseSnapshot } {
    const now = new Date().toISOString();

    // Check duplicate idempotency key
    const existingByIdempotency = this.db.prepare('SELECT * FROM cases WHERE idempotency_key = ?').get(idempotencyKey) as any;
    if (existingByIdempotency) {
      return {
        success: true,
        duplicate: true,
        message: 'Idempotent submission: already received and processed this exact revision.',
        record: JSON.parse(existingByIdempotency.snapshot_json),
      };
    }

    // Check existing case by ID
    const existingCase = this.db.prepare('SELECT current_revision, snapshot_json FROM cases WHERE case_id = ?').get(snapshot.caseId) as any;

    if (existingCase) {
      if (snapshot.revision < existingCase.current_revision) {
        return {
          success: false,
          duplicate: false,
          message: `Stale revision: incoming revision ${snapshot.revision} is older than current revision ${existingCase.current_revision}.`,
          record: JSON.parse(existingCase.snapshot_json),
        };
      }
    }

    const serverReceivedAt = now;
    const updatedSnapshot: PatientCaseSnapshot = {
      ...snapshot,
      serverReceivedAt,
      syncedAt: now,
      status: 'ready_for_review',
    };

    const snapshotJson = JSON.stringify(updatedSnapshot);

    const transaction = this.db.transaction(() => {
      // Upsert main cases table
      this.db.prepare(`
        INSERT INTO cases (case_id, current_revision, patient_name, age, language, status, snapshot_json, idempotency_key, created_at, updated_at, server_received_at)
        VALUES (@caseId, @revision, @patientName, @age, @language, @status, @snapshotJson, @idempotencyKey, @createdAt, @updatedAt, @serverReceivedAt)
        ON CONFLICT(case_id) DO UPDATE SET
          current_revision = excluded.current_revision,
          patient_name = excluded.patient_name,
          age = excluded.age,
          language = excluded.language,
          status = excluded.status,
          snapshot_json = excluded.snapshot_json,
          idempotency_key = excluded.idempotency_key,
          updated_at = excluded.updated_at
      `).run({
        caseId: updatedSnapshot.caseId,
        revision: updatedSnapshot.revision,
        patientName: updatedSnapshot.patient.preferredName,
        age: updatedSnapshot.patient.age,
        language: updatedSnapshot.patient.language,
        status: updatedSnapshot.status,
        snapshotJson,
        idempotencyKey,
        createdAt: updatedSnapshot.createdAt,
        updatedAt: now,
        serverReceivedAt,
      });

      // Insert revision record
      this.db.prepare(`
        INSERT OR REPLACE INTO case_revisions (case_id, revision, idempotency_key, snapshot_json, received_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(updatedSnapshot.caseId, updatedSnapshot.revision, idempotencyKey, snapshotJson, serverReceivedAt);

      // Insert red flags
      for (const rf of updatedSnapshot.redFlags) {
        this.db.prepare(`
          INSERT OR REPLACE INTO red_flags (id, case_id, revision, rule_id, severity, title, staff_message, supporting_answer, detected_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(rf.id, updatedSnapshot.caseId, updatedSnapshot.revision, rf.ruleId, rf.severity, rf.title, rf.staffMessage, rf.supportingAnswer, rf.detectedAt);
      }

      // Initialize staff review record if none exists
      const existingReview = this.db.prepare('SELECT case_id FROM staff_reviews WHERE case_id = ?').get(updatedSnapshot.caseId);
      if (!existingReview) {
        this.db.prepare(`
          INSERT INTO staff_reviews (case_id, triage_category, staff_notes, reviewed_by, acknowledged_at, updated_at)
          VALUES (?, 'routine', '', NULL, NULL, ?)
        `).run(updatedSnapshot.caseId, now);
      }
    });

    transaction();

    return {
      success: true,
      duplicate: false,
      message: 'Intake accepted and saved securely to server repository.',
      record: updatedSnapshot,
    };
  }

  getCase(caseId: string): FullCaseRecord | null {
    const row = this.db.prepare('SELECT * FROM cases WHERE case_id = ?').get(caseId) as any;
    if (!row) return null;

    const snapshot = JSON.parse(row.snapshot_json) as PatientCaseSnapshot;

    // Get summary for current revision
    const summaryRow = this.db.prepare('SELECT summary_json FROM summaries WHERE case_id = ? AND revision = ?').get(caseId, row.current_revision) as any;
    const summary = summaryRow ? (JSON.parse(summaryRow.summary_json) as StructuredAiSummary) : undefined;

    // Get staff review
    const staffReviewRow = this.db.prepare('SELECT * FROM staff_reviews WHERE case_id = ?').get(caseId) as any;
    const staffReview: StaffReview = staffReviewRow
      ? {
          caseId,
          triageCategory: staffReviewRow.triage_category,
          staffNotes: staffReviewRow.staff_notes,
          reviewedBy: staffReviewRow.reviewed_by,
          acknowledgedAt: staffReviewRow.acknowledged_at,
          updatedAt: staffReviewRow.updated_at,
        }
      : {
          caseId,
          triageCategory: 'routine',
          staffNotes: '',
          reviewedBy: null,
          acknowledgedAt: null,
          updatedAt: new Date().toISOString(),
        };

    // Get red flags
    const redFlagRows = this.db.prepare('SELECT * FROM red_flags WHERE case_id = ? AND revision = ?').all(caseId, row.current_revision) as any[];
    const redFlags: RedFlagAlert[] = redFlagRows.map(r => ({
      id: r.id,
      ruleId: r.rule_id,
      severity: r.severity,
      title: r.title,
      patientMessageEn: '',
      patientMessageHi: '',
      staffMessage: r.staff_message,
      supportingField: '',
      supportingAnswer: r.supporting_answer,
      detectedLocally: true,
      deliveredToStaff: true,
      detectedAt: r.detected_at,
    }));

    return {
      caseId,
      revision: row.current_revision,
      snapshot,
      summary,
      staffReview,
      redFlags,
    };
  }

  listCases(filter?: { status?: string; triage?: string }): CaseQueueItem[] {
    const query = `
      SELECT 
        c.case_id as caseId,
        c.current_revision as revision,
        c.patient_name as patientName,
        c.age,
        c.language,
        c.status,
        c.created_at as createdAt,
        c.server_received_at as serverReceivedAt,
        COALESCE(s.status, 'pending') as summaryStatus,
        COALESCE(sr.triage_category, 'routine') as triageCategory,
        COALESCE(sr.acknowledged_at, NULL) as acknowledgedAt,
        (SELECT COUNT(*) FROM red_flags rf WHERE rf.case_id = c.case_id AND rf.revision = c.current_revision) as redFlagCount
      FROM cases c
      LEFT JOIN summaries s ON s.case_id = c.case_id AND s.revision = c.current_revision
      LEFT JOIN staff_reviews sr ON sr.case_id = c.case_id
      ORDER BY c.created_at DESC
    `;

    const rows = this.db.prepare(query).all() as any[];

    return rows.filter(r => {
      if (filter?.status && r.status !== filter.status) return false;
      if (filter?.triage && r.triageCategory !== filter.triage) return false;
      return true;
    });
  }

  saveSummary(summary: StructuredAiSummary): void {
    const summaryJson = JSON.stringify(summary);
    this.db.prepare(`
      INSERT OR REPLACE INTO summaries (case_id, revision, summary_json, provider, status, generated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      (summary as any).caseId || summary.sourceReferences[0]?.id || 'unknown',
      summary.inputRevision,
      summaryJson,
      summary.provider,
      summary.aiStatus,
      summary.generatedAt
    );
  }

  saveStaffReview(caseId: string, review: Partial<StaffReview>): StaffReview {
    const now = new Date().toISOString();
    const existing = this.db.prepare('SELECT * FROM staff_reviews WHERE case_id = ?').get(caseId) as any;

    const triageCategory = review.triageCategory ?? (existing ? existing.triage_category : 'routine');
    const staffNotes = review.staffNotes ?? (existing ? existing.staff_notes : '');
    const reviewedBy = review.reviewedBy ?? (existing ? existing.reviewed_by : 'Staff');
    const acknowledgedAt = review.acknowledgedAt !== undefined ? review.acknowledgedAt : (existing ? existing.acknowledged_at : now);

    this.db.prepare(`
      INSERT OR REPLACE INTO staff_reviews (case_id, triage_category, staff_notes, reviewed_by, acknowledged_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(caseId, triageCategory, staffNotes, reviewedBy, acknowledgedAt, now);

    return {
      caseId,
      triageCategory,
      staffNotes,
      reviewedBy,
      acknowledgedAt,
      updatedAt: now,
    };
  }

  getSummaryForRevision(caseId: string, revision: number): StructuredAiSummary | null {
    const row = this.db.prepare('SELECT summary_json FROM summaries WHERE case_id = ? AND revision = ?').get(caseId, revision) as any;
    if (!row) return null;
    return JSON.parse(row.summary_json);
  }
}

const useLibsql = Boolean(process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || process.env.VERCEL);

export const serverRepo: any = useLibsql
  ? new LibSqlCaseRepository()
  : new SqliteCaseRepository();




