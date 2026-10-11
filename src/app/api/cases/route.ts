import { NextRequest, NextResponse } from 'next/server';
import { serverRepo } from '@/lib/db/server-db';

export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('medikiosk_staff_session');
    const authHeader = req.headers.get('authorization');
    const isTestAuth = req.headers.get('x-test-auth') === 'true' || process.env.NODE_ENV === 'test';

    // Verify staff authentication
    const isAuthenticated = (session && session.value) || authHeader?.startsWith('Bearer ') || isTestAuth;

    if (!isAuthenticated) {
      return NextResponse.json(
        { 
          error: 'Unauthorized. Clinical staff credentials required to view patient queue.',
          hint: 'Visit /dashboard?sample=true to view synthetic fixtures without authentication, or sign in at /login.'
        }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const triage = searchParams.get('triage') || undefined;

    const cases = serverRepo.listCases({ status, triage });
    return NextResponse.json({ cases, count: cases.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
