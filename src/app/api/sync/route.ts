import { NextRequest, NextResponse } from "next/server";
import { SyncPayloadSchema, SyncResponse, validateIntakeCompletion } from "@/lib/types/schema";
import { serverRepo } from "@/lib/db/server-db";
import { generateClinicalSummary } from "@/lib/ai/summarizer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = SyncPayloadSchema.parse(body);

    // Enforce consent server-side: do not persist health details without storage permission
    if (!payload.snapshot.consent?.localOfflineStorageConsent) {
      return NextResponse.json(
        {
          success: false,
          caseId: payload.caseId,
          acceptedRevision: payload.revision,
          serverTimestamp: new Date().toISOString(),
          duplicate: false,
          message: "Storage consent required before server persistence.",
          summaryStatus: "failed",
        },
        { status: 400 }
      );
    }

    // Incomplete intake protection: a name-only form cannot be persisted as a completed intake
    if (payload.snapshot.status === "completed_locally") {
      const validation = validateIntakeCompletion(payload.snapshot);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            caseId: payload.caseId,
            acceptedRevision: payload.revision,
            serverTimestamp: new Date().toISOString(),
            duplicate: false,
            message: `Incomplete intake cannot be marked as completed: ${validation.errors.join("; ")}`,
            summaryStatus: "failed",
          },
          { status: 422 }
        );
      }
    }

    // Persist case into SQLite repository with idempotency check
    const upsertResult = await serverRepo.upsertCase(payload.snapshot, payload.idempotencyKey);

    if (!upsertResult.success) {
      return NextResponse.json(
        {
          success: false,
          caseId: payload.caseId,
          acceptedRevision: payload.revision,
          serverTimestamp: new Date().toISOString(),
          duplicate: false,
          message: upsertResult.message,
          summaryStatus: "failed",
        },
        { status: 409 }
      );
    }

    let summary = await serverRepo.getSummaryForRevision(payload.caseId, payload.revision);
    let summaryStatus: "generated" | "pending" | "unconfigured" | "failed" = "pending";

    // Only process AI summary if patient consented to AI processing
    if (!summary) {
      if (payload.snapshot.consent?.aiProcessingConsent) {
        const summaryResult = await generateClinicalSummary(upsertResult.record);
        summary = summaryResult.summary;
        (summary as any).caseId = payload.caseId;
        await serverRepo.saveSummary(summary);
        summaryStatus = summary.aiStatus;
      } else {
        // Patient opted out of external AI: produce a non-AI template summary with unconfigured status
        summary = {
          mainConcern: payload.snapshot.answers.mainConcern,
          historyOfPresentConcern: payload.snapshot.answers.onsetDuration,
          reportedConditions: payload.snapshot.answers.existingConditions.map((c, i) => ({
            condition: c,
            sourceId: `c-${i}`,
            sourceExcerpt: c,
          })),
          medicines: payload.snapshot.answers.currentMedicines.map((m, i) => ({
            name: m,
            sourceId: `m-${i}`,
            sourceExcerpt: m,
            uncertain: false,
          })),
          allergies: {
            status: payload.snapshot.answers.allergies.status,
            items: payload.snapshot.answers.allergies.details,
            sourceId: "allergies-field",
          },
          relevantDocumentObservations: [],
          missingOrConflictingInfo: ["Patient declined external AI summarization; standard intake displayed."],
          sourceReferences: [
            { id: payload.caseId, category: "intake", field: "mainConcern", excerpt: payload.snapshot.answers.mainConcern },
          ],
          unsupportedOrContradictoryFlags: [],
          inputRevision: payload.revision,
          generatedAt: new Date().toISOString(),
          provider: "rules-only-patient-declined-ai",
          aiStatus: "unconfigured",
        };
        (summary as any).caseId = payload.caseId;
        await serverRepo.saveSummary(summary);
        summaryStatus = "unconfigured";
      }
    } else {
      summaryStatus = summary.aiStatus;
    }

    const response: SyncResponse = {
      success: true,
      caseId: payload.caseId,
      acceptedRevision: payload.revision,
      serverTimestamp: new Date().toISOString(),
      duplicate: upsertResult.duplicate,
      message: upsertResult.message,
      summaryStatus,
      summary: summary || undefined,
    };

    return NextResponse.json(response);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Sync processing failure",
        error: String(err),
      },
      { status: 400 }
    );
  }
}