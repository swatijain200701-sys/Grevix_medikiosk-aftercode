"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wifi, WifiOff, Users, FileText, CheckCircle2, 
  Stethoscope, ShieldCheck, RefreshCw, ArrowRight 
} from "lucide-react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import { ScrollTimeline, Milestone } from "@/components/ui/scroll-timeline";

const CLINICAL_WORKFLOW_MILESTONES: Milestone[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Register and consent",
    description: "Choose your language and tell us who is entering the information.",
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Share your health history",
    description: "Answer guided questions using touch or supported voice input.",
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Add previous documents",
    description: "Upload prescriptions or reports and review the extracted text.",
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Continue through disconnection",
    description: "Your confirmed answers stay on this device and synchronise when the connection returns.",
  },
  {
    id: "step-5",
    stepNumber: "05",
    title: "Staff review",
    description: "Staff review the structured history and available AI summary before consultation.",
  },
];

export default function Home() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#334155] flex flex-col font-sans selection:bg-[#E8F3EF]">
      {/* Top Clinical Header */}
      <header className="border-b border-[#DCE7E4] bg-white/90 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#17343A]">
                MediKiosk
              </span>
              <span className="text-2xs text-[#52656B] block">
                Accessible OPD Case-Taking & Clinical Intake
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline ? (
              <span
                id="portal-offline-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-amber-300 text-[#92400E]"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                Offline Mode Active
              </span>
            ) : (
              <span
                id="portal-online-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3EF] border border-[#0F766E]/20 text-[#0F766E]"
              >
                <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
                Connected
              </span>
            )}

            <Link
              href="/login"
              id="staff-portal-link"
              className="px-3.5 py-1.5 rounded-xl border border-[#DCE7E4] hover:bg-[#E8F3EF] hover:border-[#0F766E]/30 text-xs font-semibold text-[#17343A] transition shadow-2xs"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Adapted LiquidMetalHero */}
      <LiquidMetalHero
        badge="Patient intake for OPDs"
        title="Your health story, ready for your doctor."
        subtitle="Share your symptoms, medicines, and previous reports through a guided voice or touch experience—even when the connection drops."
        primaryCtaLabel="Start patient intake"
        secondaryCtaLabel="Staff sign in"
        onPrimaryCtaClick={() => router.push("/kiosk")}
        onSecondaryCtaClick={() => router.push("/login")}
        features={["Voice and touch", "English and Hindi", "Offline intake"]}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Core Entry Portals */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17343A] tracking-tight">
              Tell your health story before your consultation.
            </h2>
            <p className="text-sm text-[#52656B]">
              Designed for walk-up patient accessibility, privacy on shared hospital kiosks, and rapid doctor preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
            {/* Patient Kiosk Card */}
            <Link
              href="/kiosk"
              id="start-kiosk-btn"
              className="group p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE7E4] hover:border-[#0F766E] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#17343A] tracking-tight group-hover:text-[#0F766E] transition">
                    Patient Intake Kiosk
                  </h3>
                  <p className="text-[#52656B] text-xs sm:text-sm mt-2 leading-relaxed">
                    Step-by-step touch and voice interface with English/Hindi support, offline persistence, document scan, and privacy protection on shared terminals.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-2 text-[#0F766E] font-bold text-sm">
                <span>Start Patient Intake</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>

            {/* Doctor / Staff Dashboard Card */}
            <Link
              href="/dashboard"
              id="open-dashboard-btn"
              className="group p-6 sm:p-8 rounded-3xl bg-white border-2 border-[#DCE7E4] hover:border-[#17343A] shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-[#17343A] text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 transition">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#17343A] tracking-tight transition">
                    Clinical Intake Dashboard
                  </h3>
                  <p className="text-[#52656B] text-xs sm:text-sm mt-2 leading-relaxed">
                    Real-time queue of intake cases, structured AI clinical summaries with source verification, red-flag alert review, and triage note management.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex items-center gap-2 text-[#17343A] font-bold text-sm">
                <span>Open Clinical Queue</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          </div>
        </section>

        {/* Workflow Section: Adapted ScrollTimeline */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0F766E] block">
              CLINICAL INTAKE PATHWAY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17343A] tracking-tight">
              From arrival to consultation.
            </h2>
            <p className="text-xs sm:text-sm text-[#52656B]">
              How patient intake flows from walk-up check-in through clinical OPD triage—operating smoothly through intermittent network interruptions.
            </p>
          </div>

          {/* Adapted ScrollTimeline Component */}
          <ScrollTimeline milestones={CLINICAL_WORKFLOW_MILESTONES} />
        </section>

        {/* Architectural Resilience & Verification Statement */}
        <section className="p-6 rounded-2xl bg-white border border-[#DCE7E4] max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#17343A] block">30s Offline Disconnection Tolerance</span>
              <p className="text-[#52656B] mt-0.5 leading-snug">
                Verified with browser network cuts mid-intake; zero data loss or form interruption.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#17343A] block">Monotonic Revisions & Idempotency</span>
              <p className="text-[#52656B] mt-0.5 leading-snug">
                Zero duplicate queue entries during reconnection bursts (recordCount: 1, duplicateCount: 0).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#17343A] block">Dual-Layer Web Crypto Privacy</span>
              <p className="text-[#52656B] mt-0.5 leading-snug">
                AES-GCM 256 draft storage; clean session key reset between walk-up patients.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#DCE7E4] bg-white py-6 px-4 sm:px-6 text-center text-xs text-[#52656B] space-y-1">
        <p className="font-medium text-[#17343A]">
          MediKiosk   Built for Grevix AfterCode 2026 by Swati Jain (Sole Participant).
        </p>
        <p className="text-3xs text-[#52656B]">
          Clinical intake organizer for OPD preparation. Prototype status   does not claim regulatory medical device certification.
        </p>
      </footer>
    </div>
  );
}
