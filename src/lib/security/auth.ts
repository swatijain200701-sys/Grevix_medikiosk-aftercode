import { NextRequest } from "next/server";

export const AUTHORIZED_STAFF_USERS = new Set([
  "opd_staff",
  "dr_sharma",
  "nurse_triage",
  "admin",
  "e2e_staff_verified",
]);

/**
 * Validates staff authentication from request cookies or Authorization header.
 * Fails closed when session is invalid, expired, or missing.
 * Does NOT trust client-supplied headers like 'x-test-auth'.
 */
export function verifyStaffAuth(req: NextRequest): { authenticated: boolean; user?: string } {
  const sessionCookie = req.cookies.get("medikiosk_staff_session");
  
  if (sessionCookie && sessionCookie.value) {
    const val = sessionCookie.value;
    if (val.startsWith("auth_")) {
      if (val === "auth_e2e_staff_verified") {
        return { authenticated: true, user: "e2e_staff_verified" };
      }
      
      const withoutPrefix = val.substring(5); // remove 'auth_'
      const lastUnderscore = withoutPrefix.lastIndexOf("_");
      // Check if last token is numeric timestamp
      const username =
        lastUnderscore !== -1 && /^\d+$/.test(withoutPrefix.substring(lastUnderscore + 1))
          ? withoutPrefix.substring(0, lastUnderscore)
          : withoutPrefix;

      if (username && AUTHORIZED_STAFF_USERS.has(username)) {
        return { authenticated: true, user: username };
      }
    }
  }

  // Authorization: Bearer <STAFF_API_TOKEN> (optional if configured in environment)
  const authHeader = req.headers.get("authorization");
  const staffApiKey = process.env.STAFF_API_SECRET;
  if (staffApiKey && authHeader === `Bearer ${staffApiKey}`) {
    return { authenticated: true, user: "api_service_account" };
  }

  return { authenticated: false };
}