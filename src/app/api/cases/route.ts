import { NextRequest, NextResponse } from 'next/server';
import { serverRepo } from '@/lib/db/server-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const triage = searchParams.get('triage') || undefined;

    const cases = serverRepo.listCases({ status, triage });
    return NextResponse.json({ cases, count: cases.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}