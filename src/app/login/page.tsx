"use client";

import { StaffLogin } from "@/components/ui/staff-login";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F7FAF9] flex flex-col justify-between">
      <div className="p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#52656B] hover:text-[#0F766E] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to MediKiosk Portal</span>
        </Link>
      </div>

      <main className="flex-1 flex items-center justify-center px-4">
        <StaffLogin />
      </main>

      <footer className="p-4 text-center text-3xs text-[#52656B]">
        MediKiosk Staff Portal   Internal OPD Clinical Use Only
      </footer>
    </div>
  );
}
