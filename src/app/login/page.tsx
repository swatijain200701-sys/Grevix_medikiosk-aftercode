"use client";

import { StaffLogin } from "@/components/ui/staff-login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08121B] text-[#B6C7CF] flex flex-col justify-between selection:bg-[#50D6C5]/20 selection:text-[#50D6C5]">
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#91A8B3] hover:text-[#50D6C5] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to MediKiosk Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <StaffLogin />
      </main>

      <footer className="p-4 text-center text-3xs text-[#91A8B3]">
        MediKiosk Staff Portal   Internal OPD Clinical Use Only
      </footer>
    </div>
  );
}
