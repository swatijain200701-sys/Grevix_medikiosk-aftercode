import { NextRequest, NextResponse } from "next/server";
import { serverRepo } from "@/lib/db/server-db";
import { verifyStaffAuth } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = verifyStaffAuth(req);

    if (!auth.authenticated) {
      return NextResponse.json(
        {
          error: "Unauthorized. Clinical staff credentials required to view patient queue.",
          hint: "Visit /dashboard?sample=true to view synthetic fixtures without authentication, or sign in at /login.",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const triage = searchParams.get("triage") || undefined;

    const cases = await serverRepo.listCases({ status, triage });
    return NextResponse.json({ cases, count: cases.length, user: auth.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}