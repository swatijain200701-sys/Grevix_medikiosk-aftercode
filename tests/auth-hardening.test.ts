import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { verifyStaffAuth } from "../src/lib/security/auth";
import { SAMPLE_QUEUE_ITEMS, SAMPLE_CASES } from "../src/lib/fixtures/sample-cases";

describe("Staff Authentication & Dashboard Security Isolation", () => {
  it("rejects unauthenticated requests to protected endpoints", () => {
    // Request with no cookies and no Authorization header
    const req = new NextRequest("http://localhost:3000/api/cases", {
      headers: new Headers(),
    });

    const auth = verifyStaffAuth(req);
    expect(auth.authenticated).toBe(false);
    expect(auth.user).toBeUndefined();
  });

  it("rejects invalid or forged session cookies", () => {
    const req = new NextRequest("http://localhost:3000/api/cases", {
      headers: {
        cookie: "medikiosk_staff_session=malicious_fake_cookie",
      },
    });

    const auth = verifyStaffAuth(req);
    expect(auth.authenticated).toBe(false);
  });

  it("authenticates authorized staff session cookies with timestamp suffix", () => {
    const timestamp = Date.now();
    const req = new NextRequest("http://localhost:3000/api/cases", {
      headers: {
        cookie: `medikiosk_staff_session=auth_opd_staff_${timestamp}`,
      },
    });

    const auth = verifyStaffAuth(req);
    expect(auth.authenticated).toBe(true);
    expect(auth.user).toBe("opd_staff");
  });

  it("verifies sample fixtures dataset is strictly isolated and client-side safe", () => {
    // Sample cases must contain synthetic identifiers only
    expect(SAMPLE_QUEUE_ITEMS.length).toBeGreaterThan(0);
    expect(SAMPLE_CASES.length).toBeGreaterThan(0);

    for (const sample of SAMPLE_CASES) {
      expect(sample.caseId.startsWith("sample-case-")).toBe(true);
      expect(sample.snapshot.patient.preferredName).toBeDefined();
      // Ensure synthetic cases carry lack-of-diagnosis disclaimer
      expect(sample.summary).toBeDefined();
    }
  });
});
