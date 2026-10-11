import { NextRequest, NextResponse } from 'next/server';
import { SyncPayloadSchema, SyncResponse } from '@/lib/types/schema';
import { serverRepo } from '@/lib/db/server-db';
import { generateClinicalSummary } from '@/lib/ai/summarizer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = SyncPayloadSchema.parse(body);

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
          summaryStatus: 'failed',
        },
        { status: 409 }
      );
    }

    let summary = await serverRepo.getSummaryForRevision(payload.caseId, payload.revision);
    let summaryStatus: 'generated' | 'pending' | 'unconfigured' | 'failed' = 'pending';

    if (!summary) {
      // Generate structured clinical summary
      const summaryResult = await generateClinicalSummary(upsertResult.record);
      summary = summaryResult.summary;
      (summary as any).caseId = payload.caseId;
      await serverRepo.saveSummary(summary);
      summaryStatus = summary.aiStatus;
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
        message: err.message || 'Sync processing failure',
        error: String(err),
      },
      { status: 400 }
    );
  }
}
