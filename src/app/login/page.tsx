"use client";

import { StaffLogin } from "@/components/ui/staff-login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-heading)] flex flex-col justify-between selection:bg-[var(--btn-main)]/20 selection:text-[var(--btn-main)]">
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-heading)] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to MediKiosk Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <StaffLogin />
      </main>

      <footer className="p-4 text-center text-xs text-[var(--text-muted)]">
        MediKiosk Staff Portal — Internal OPD Clinical Use Only
      </footer>
    </div>
  );
}