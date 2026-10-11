import { NextRequest, NextResponse } from "next/server";

// Registered staff credentials for OPD triage & review
const AUTHORIZED_STAFF: Record<string, string> = {
  opd_staff: "clinical2026",
  dr_sharma: "opd@medikiosk",
  nurse_triage: "triage2026",
  admin: "hospital123",
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both staff username and password." },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim().toLowerCase();
    const expectedPassword = AUTHORIZED_STAFF[cleanUsername];

    if (!expectedPassword || expectedPassword !== password) {
      return NextResponse.json(
        { success: false, error: "Invalid staff username or password. Check credentials with clinical admin." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Staff authentication successful.",
      user: {
        username: cleanUsername,
        role: "clinical_staff",
        station: "OPD Consultation Station",
      },
    });

    // Set secure session cookie
    response.cookies.set("medikiosk_staff_session", `auth_${cleanUsername}_${Date.now()}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8-hour shift
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to process staff authentication request." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const session = req.cookies.get("medikiosk_staff_session");
  if (session && session.value) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete("medikiosk_staff_session");
  return response;
}
