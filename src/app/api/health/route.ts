import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'medikiosk-api',
    serverTimestamp: new Date().toISOString(),
  });
}