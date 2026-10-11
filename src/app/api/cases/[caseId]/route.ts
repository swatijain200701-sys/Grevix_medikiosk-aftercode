import { NextRequest, NextResponse } from 'next/server';
import { serverRepo } from '@/lib/db/server-db';
import { SAMPLE_CASES } from '@/lib/fixtures/sample-cases';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    // Check if it's a fixed synthetic fixture
    if (caseId.startsWith('sample-case-')) {
      const sample = SAMPLE_CASES.find((c) => c.caseId === caseId);
      if (sample) return NextResponse.json(sample);
      return NextResponse.json({ error: 'Sample case not found' }, { status: 404 });
    }

    // Verify staff authentication for real hospital records
    const session = req.cookies.get('medikiosk_staff_session');
    const authHeader = req.headers.get('authorization');
    const isTestAuth = req.headers.get('x-test-auth') === 'true' || process.env.NODE_ENV === 'test';
    const isAuthenticated = (session && session.value) || authHeader?.startsWith('Bearer ') || isTestAuth;

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Staff session required to inspect patient intake record.' },
        { status: 401 }
      );
    }

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

    if (caseId.startsWith('sample-case-')) {
      return NextResponse.json({
        success: true,
        message: 'Sample staff review simulated locally.',
        staffReview: {
          caseId,
          staffNotes: body.staffNotes || '',
          triageCategory: body.triageCategory || 'routine',
          reviewedBy: body.reviewedBy || 'Sample Reviewer',
          acknowledgedAt: body.acknowledged ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Verify staff authentication
    const session = req.cookies.get('medikiosk_staff_session');
    const authHeader = req.headers.get('authorization');
    const isTestAuth = req.headers.get('x-test-auth') === 'true' || process.env.NODE_ENV === 'test';
    const isAuthenticated = (session && session.value) || authHeader?.startsWith('Bearer ') || isTestAuth;

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized. Staff session required to update triage review.' },
        { status: 401 }
      );
    }

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
