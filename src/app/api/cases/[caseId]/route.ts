import { NextRequest, NextResponse } from "next/server";
import { serverRepo } from "@/lib/db/server-db";
import { SAMPLE_CASES } from "@/lib/fixtures/sample-cases";
import { verifyStaffAuth } from "@/lib/security/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    // Public demonstration synthetic fixtures (read-only)
    if (caseId.startsWith("sample-case-")) {
      const sample = SAMPLE_CASES.find((c) => c.caseId === caseId);
      if (sample) return NextResponse.json(sample);
      return NextResponse.json({ error: "Sample case not found" }, { status: 404 });
    }

    // Verify genuine staff authentication for submitted patient records
    const auth = verifyStaffAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Staff session required to inspect patient intake record." },
        { status: 401 }
      );
    }

    const record = await serverRepo.getCase(caseId);
    if (!record) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
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

    if (caseId.startsWith("sample-case-")) {
      return NextResponse.json({
        success: true,
        message: "Sample staff review simulated locally.",
        staffReview: {
          caseId,
          staffNotes: body.staffNotes || "",
          triageCategory: body.triageCategory || "routine",
          reviewedBy: body.reviewedBy || "Sample Reviewer",
          acknowledgedAt: body.acknowledged ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    // Verify genuine staff authentication
    const auth = verifyStaffAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: "Unauthorized. Staff session required to update triage review." },
        { status: 401 }
      );
    }

    const updated = await serverRepo.saveStaffReview(caseId, {
      staffNotes: body.staffNotes,
      triageCategory: body.triageCategory,
      reviewedBy: body.reviewedBy || auth.user,
      acknowledgedAt: body.acknowledged ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({ success: true, staffReview: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}