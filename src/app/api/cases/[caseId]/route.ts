import { NextRequest, NextResponse } from 'next/server';
import { serverRepo } from '@/lib/db/server-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const record = serverRepo.getCase(caseId);

    if (!record) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(record);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const body = await req.json();

    const updated = serverRepo.saveStaffReview(caseId, {
      staffNotes: body.staffNotes,
      triageCategory: body.triageCategory,
      reviewedBy: body.reviewedBy,
      acknowledgedAt: body.acknowledged ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({ success: true, staffReview: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}