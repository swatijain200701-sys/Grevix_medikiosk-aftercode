import { createClient, Client } from "@libsql/client";
import { PatientCaseSnapshot, StructuredAiSummary, StaffReview, RedFlagAlert } from "@/lib/types/schema";
import { CaseQueueItem, FullCaseRecord } from "./server-db";

let _libsqlClient: Client | null = null;
let _schemaInitialized = false;

export function getLibsqlClient(): Client {
  if (!_libsqlClient) {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || "file:data/medikiosk.sqlite";
    const authToken = process.env.TURSO_AUTH_TOKEN;
    _libsqlClient = createClient({
      url,
      authToken,
    });
  }
  return _libsqlClient;
}

export async function initLibsqlSchema(client: Client): Promise<void> {
  if (_schemaInitialized) return;
  try {
    await client.batch([
      `CREATE TABLE IF NOT EXISTS cases (
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
      )`,
      `CREATE TABLE IF NOT EXISTS case_revisions (
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        idempotency_key TEXT NOT NULL,
        snapshot_json TEXT NOT NULL,
        received_at TEXT NOT NULL,
        PRIMARY KEY (case_id, revision)
      )`,
      `CREATE TABLE IF NOT EXISTS summaries (
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        summary_json TEXT NOT NULL,
        provider TEXT NOT NULL,
        status TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        PRIMARY KEY (case_id, revision)
      )`,
      `CREATE TABLE IF NOT EXISTS staff_reviews (
        case_id TEXT PRIMARY KEY,
        triage_category TEXT NOT NULL DEFAULT 'routine',
        staff_notes TEXT NOT NULL DEFAULT '',
        reviewed_by TEXT,
        acknowledged_at TEXT,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS red_flags (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        revision INTEGER NOT NULL,
        rule_id TEXT NOT NULL,
        severity TEXT NOT NULL,
        title TEXT NOT NULL,
        staff_message TEXT NOT NULL,
        supporting_answer TEXT NOT NULL,
        detected_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status)`,
      `CREATE INDEX IF NOT EXISTS idx_cases_created ON cases(created_at)`,
    ]);
    _schemaInitialized = true;
  } catch (err) {
    console.warn("LibSQL schema init notice:", err);
  }
}

export class LibSqlCaseRepository {
  private client: Client;

  constructor(clientInstance?: Client) {
    this.client = clientInstance || getLibsqlClient();
  }

  private async ensureInit() {
    await initLibsqlSchema(this.client);
  }

  async upsertCase(snapshot: PatientCaseSnapshot, idempotencyKey: string): Promise<{ success: boolean; duplicate: boolean; message: string; record: PatientCaseSnapshot }> {
    await this.ensureInit();
    const now = new Date().toISOString();

    // Check duplicate idempotency key
    const existingByIdempotency = await this.client.execute({
      sql: "SELECT * FROM cases WHERE idempotency_key = ?",
      args: [idempotencyKey],
    });

    if (existingByIdempotency.rows.length > 0) {
      const row: any = existingByIdempotency.rows[0];
      return {
        success: true,
        duplicate: true,
        message: "Idempotent submission: already received and processed this exact revision.",
        record: JSON.parse(String(row.snapshot_json)),
      };
    }

    // Check existing case by ID
    const existingCase = await this.client.execute({
      sql: "SELECT current_revision, snapshot_json FROM cases WHERE case_id = ?",
      args: [snapshot.caseId],
    });

    if (existingCase.rows.length > 0) {
      const row: any = existingCase.rows[0];
      const curRev = Number(row.current_revision);
      if (snapshot.revision < curRev) {
        return {
          success: false,
          duplicate: false,
          message: `Stale revision: incoming revision ${snapshot.revision} is older than current revision ${curRev}.`,
          record: JSON.parse(String(row.snapshot_json)),
        };
      }
    }

    const serverReceivedAt = now;
    const updatedSnapshot: PatientCaseSnapshot = {
      ...snapshot,
      serverReceivedAt,
      syncedAt: now,
      status: "ready_for_review",
    };

    const snapshotJson = JSON.stringify(updatedSnapshot);

    const batchStatements: any[] = [
      {
        sql: `
          INSERT INTO cases (case_id, current_revision, patient_name, age, language, status, snapshot_json, idempotency_key, created_at, updated_at, server_received_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(case_id) DO UPDATE SET
            current_revision = excluded.current_revision,
            patient_name = excluded.patient_name,
            age = excluded.age,
            language = excluded.language,
            status = excluded.status,
            snapshot_json = excluded.snapshot_json,
            idempotency_key = excluded.idempotency_key,
            updated_at = excluded.updated_at
        `,
        args: [
          updatedSnapshot.caseId,
          updatedSnapshot.revision,
          updatedSnapshot.patient.preferredName,
          updatedSnapshot.patient.age,
          updatedSnapshot.patient.language,
          updatedSnapshot.status,
          snapshotJson,
          idempotencyKey,
          updatedSnapshot.createdAt,
          now,
          serverReceivedAt,
        ],
      },
      {
        sql: `
          INSERT OR REPLACE INTO case_revisions (case_id, revision, idempotency_key, snapshot_json, received_at)
          VALUES (?, ?, ?, ?, ?)
        `,
        args: [updatedSnapshot.caseId, updatedSnapshot.revision, idempotencyKey, snapshotJson, serverReceivedAt],
      },
    ];

    // Red flags
    for (const rf of updatedSnapshot.redFlags) {
      batchStatements.push({
        sql: `
          INSERT OR REPLACE INTO red_flags (id, case_id, revision, rule_id, severity, title, staff_message, supporting_answer, detected_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [rf.id, updatedSnapshot.caseId, updatedSnapshot.revision, rf.ruleId, rf.severity, rf.title, rf.staffMessage, rf.supportingAnswer, rf.detectedAt],
      });
    }

    await this.client.batch(batchStatements);

    // Ensure staff review placeholder
    const existingReview = await this.client.execute({
      sql: "SELECT case_id FROM staff_reviews WHERE case_id = ?",
      args: [updatedSnapshot.caseId],
    });

    if (existingReview.rows.length === 0) {
      await this.client.execute({
        sql: `
          INSERT INTO staff_reviews (case_id, triage_category, staff_notes, reviewed_by, acknowledged_at, updated_at)
          VALUES (?, 'routine', '', NULL, NULL, ?)
        `,
        args: [updatedSnapshot.caseId, now],
      });
    }

    return {
      success: true,
      duplicate: false,
      message: "Intake accepted and saved securely to external durable repository.",
      record: updatedSnapshot,
    };
  }

  async getCase(caseId: string): Promise<FullCaseRecord | null> {
    await this.ensureInit();
    const res = await this.client.execute({
      sql: "SELECT * FROM cases WHERE case_id = ?",
      args: [caseId],
    });

    if (res.rows.length === 0) return null;
    const row: any = res.rows[0];
    const snapshot = JSON.parse(String(row.snapshot_json)) as PatientCaseSnapshot;
    const revision = Number(row.current_revision);

    // Summary
    const summaryRes = await this.client.execute({
      sql: "SELECT summary_json FROM summaries WHERE case_id = ? AND revision = ?",
      args: [caseId, revision],
    });
    const summary = summaryRes.rows.length > 0 ? (JSON.parse(String((summaryRes.rows[0] as any).summary_json)) as StructuredAiSummary) : undefined;

    // Staff review
    const reviewRes = await this.client.execute({
      sql: "SELECT * FROM staff_reviews WHERE case_id = ?",
      args: [caseId],
    });
    const reviewRow: any = reviewRes.rows[0];
    const staffReview: StaffReview = reviewRow
      ? {
          caseId,
          triageCategory: reviewRow.triage_category,
          staffNotes: reviewRow.staff_notes,
          reviewedBy: reviewRow.reviewed_by,
          acknowledgedAt: reviewRow.acknowledged_at,
          updatedAt: reviewRow.updated_at,
        }
      : {
          caseId,
          triageCategory: "routine",
          staffNotes: "",
          reviewedBy: null,
          acknowledgedAt: null,
          updatedAt: new Date().toISOString(),
        };

    // Red flags
    const rfRes = await this.client.execute({
      sql: "SELECT * FROM red_flags WHERE case_id = ? AND revision = ?",
      args: [caseId, revision],
    });
    const redFlags: RedFlagAlert[] = rfRes.rows.map((r: any) => ({
      id: String(r.id),
      ruleId: String(r.rule_id),
      severity: r.severity,
      title: String(r.title),
      patientMessageEn: "",
      patientMessageHi: "",
      staffMessage: String(r.staff_message),
      supportingField: "",
      supportingAnswer: String(r.supporting_answer),
      detectedLocally: true,
      deliveredToStaff: true,
      detectedAt: String(r.detected_at),
    }));

    return {
      caseId,
      revision,
      snapshot,
      summary,
      staffReview,
      redFlags,
    };
  }

  async listCases(filter?: { status?: string; triage?: string }): Promise<CaseQueueItem[]> {
    await this.ensureInit();
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

    const res = await this.client.execute(query);
    const rows: any[] = res.rows.map((r: any) => ({
      caseId: String(r.caseId),
      revision: Number(r.revision),
      patientName: String(r.patientName),
      age: String(r.age),
      language: String(r.language),
      status: String(r.status),
      createdAt: String(r.createdAt),
      serverReceivedAt: String(r.serverReceivedAt || r.createdAt),
      summaryStatus: String(r.summaryStatus || "pending"),
      triageCategory: String(r.triageCategory || "routine"),
      acknowledgedAt: r.acknowledgedAt ? String(r.acknowledgedAt) : null,
      redFlagCount: Number(r.redFlagCount || 0),
    }));

    return rows.filter((r) => {
      if (filter?.status && r.status !== filter.status) return false;
      if (filter?.triage && r.triageCategory !== filter.triage) return false;
      return true;
    });
  }

  async saveSummary(summary: StructuredAiSummary): Promise<void> {
    await this.ensureInit();
    const summaryJson = JSON.stringify(summary);
    await this.client.execute({
      sql: `
        INSERT OR REPLACE INTO summaries (case_id, revision, summary_json, provider, status, generated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        (summary as any).caseId || summary.sourceReferences[0]?.id || "unknown",
        summary.inputRevision,
        summaryJson,
        summary.provider,
        summary.aiStatus,
        summary.generatedAt,
      ],
    });
  }

  async saveStaffReview(caseId: string, review: Partial<StaffReview>): Promise<StaffReview> {
    await this.ensureInit();
    const now = new Date().toISOString();
    const existingRes = await this.client.execute({
      sql: "SELECT * FROM staff_reviews WHERE case_id = ?",
      args: [caseId],
    });
    const existing: any = existingRes.rows[0];

    const triageCategory = review.triageCategory ?? (existing ? existing.triage_category : "routine");
    const staffNotes = review.staffNotes ?? (existing ? existing.staff_notes : "");
    const reviewedBy = review.reviewedBy ?? (existing ? existing.reviewed_by : "Staff");
    const acknowledgedAt = review.acknowledgedAt !== undefined ? review.acknowledgedAt : (existing ? existing.acknowledged_at : now);

    await this.client.execute({
      sql: `
        INSERT OR REPLACE INTO staff_reviews (case_id, triage_category, staff_notes, reviewed_by, acknowledged_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [caseId, triageCategory, staffNotes, reviewedBy, acknowledgedAt, now],
    });

    return {
      caseId,
      triageCategory,
      staffNotes,
      reviewedBy,
      acknowledgedAt,
      updatedAt: now,
    };
  }

  async getSummaryForRevision(caseId: string, revision: number): Promise<StructuredAiSummary | null> {
    await this.ensureInit();
    const res = await this.client.execute({
      sql: "SELECT summary_json FROM summaries WHERE case_id = ? AND revision = ?",
      args: [caseId, revision],
    });
    if (res.rows.length === 0) return null;
    return JSON.parse(String((res.rows[0] as any).summary_json));
  }
}
