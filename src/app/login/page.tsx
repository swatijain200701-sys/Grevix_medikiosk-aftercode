"use client";

import { StaffLogin } from "@/components/ui/staff-login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EAF0EB] text-[#293D36] flex flex-col justify-between selection:bg-[#356B62]/20 selection:text-[#356B62]">
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#53665D] hover:text-[#293D36] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to MediKiosk Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <StaffLogin />
      </main>

      <footer className="p-4 text-center text-xs text-[#53665D]">
        MediKiosk Staff Portal — Internal OPD Clinical Use Only
      </footer>
    </div>
  );
}