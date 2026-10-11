"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wifi, WifiOff, Users, FileText, CheckCircle2, 
  Stethoscope, ShieldCheck, RefreshCw, ArrowRight,
  ClipboardList, Camera, HardDrive, Sparkles
} from "lucide-react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import { ScrollTimeline, Milestone } from "@/components/ui/scroll-timeline";

const CLINICAL_WORKFLOW_MILESTONES: Milestone[] = [
  {
    id: "step-1",
    stepNumber: "01",
    title: "Register and consent",
    description: "Choose English or Hindi and identify if entering self-guided or with caregiver assistance.",
  },
  {
    id: "step-2",
    stepNumber: "02",
    title: "Share your health history",
    description: "Answer focused questions on symptoms, duration, medicines, and known allergies.",
  },
  {
    id: "step-3",
    stepNumber: "03",
    title: "Add previous documents",
    description: "Capture prescriptions or discharge summaries with OCR text verification before filing.",
  },
  {
    id: "step-4",
    stepNumber: "04",
    title: "Continue through disconnection",
    description: "Confirmed records save locally to encrypted device storage and resume automatically when the network recovers.",
  },
  {
    id: "step-5",
    stepNumber: "05",
    title: "Doctor consultation review",
    description: "Physicians inspect structured intake, red-flag indicators, and verified summary points prior to consultation.",
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
    <div className="min-h-screen bg-[#08121B] text-[#B6C7CF] flex flex-col font-sans selection:bg-[#50D6C5]/20 selection:text-[#50D6C5]">
      
      {/* Top Header Navigation */}
      <header className="border-b border-[#294350] bg-[#0C1924]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#50D6C5] text-[#062820] flex items-center justify-center font-bold text-lg shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#F1F6F8] block">
                MediKiosk
              </span>
              <span className="text-3xs text-[#91A8B3] font-medium block">
                Outpatient Intake & Clinical Preparation
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Connection Monitor */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[#294350] text-[#B6C7CF]">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#50D6C5]" />
                  <span className="text-xs">OPD Network Connected</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-400 text-xs">Offline Mode Active</span>
                </>
              )}
            </div>

            <Link
              href="/login"
              id="staff-portal-link"
              className="px-4 py-2 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-xs font-semibold text-[#F1F6F8] transition"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Adapted LiquidMetalHero with Dark Healthcare Design */}
      <LiquidMetalHero
        badge="Patient intake for OPDs"
        title="Your health story, ready for your doctor."
        subtitle="Share symptoms, medicines, and previous reports through guided voice or touch intake. Continue even when the connection drops."
        primaryCtaLabel="Start patient intake"
        secondaryCtaLabel="Staff sign in"
        onPrimaryCtaClick={() => router.push("/kiosk")}
        onSecondaryCtaClick={() => router.push("/login")}
        features={["Voice and touch", "English and Hindi", "Offline intake"]}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Explanation of the Problem */}
        <section className="max-w-4xl mx-auto space-y-4 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
            THE CLINICAL CHALLENGE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
            Consultation time is precious. Patient history shouldn’t be rushed.
          </h2>
          <p className="text-sm sm:text-base text-[#B6C7CF] leading-relaxed max-w-3xl mx-auto">
            High OPD patient volumes leave clinicians with mere minutes to reconstruct timelines, decipher crumpled prescriptions, and clarify unstated symptoms. MediKiosk gives patients a calm, private touch terminal in the waiting area to systematically organize their chief complaint, current medicines, and prior documents before entering the doctor&apos;s chamber.
          </p>
        </section>

        {/* Three Capability Panels: Guided intake, Document review, Offline continuity */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
              CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
              Built for real-world hospital waiting halls.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Panel 1: Guided intake */}
            <div className="p-7 rounded-2xl bg-[#122330] border border-[#294350] space-y-4 hover:border-[#50D6C5]/40 transition duration-150">
              <div className="w-12 h-12 rounded-xl bg-[#18303D] text-[#50D6C5] flex items-center justify-center font-bold border border-[#294350]">
                <ClipboardList className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F1F6F8] tracking-tight">
                Guided Intake
              </h3>
              <p className="text-xs sm:text-sm text-[#B6C7CF] leading-relaxed">
                Step-by-step questioning with one main concern at a time. Supports dual English and Hindi, generous 48px touch targets, and optional voice dictation with mandatory patient review before saving.
              </p>
            </div>

            {/* Panel 2: Document review */}
            <div className="p-7 rounded-2xl bg-[#122330] border border-[#294350] space-y-4 hover:border-[#50D6C5]/40 transition duration-150">
              <div className="w-12 h-12 rounded-xl bg-[#18303D] text-[#50D6C5] flex items-center justify-center font-bold border border-[#294350]">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F1F6F8] tracking-tight">
                Document Review
              </h3>
              <p className="text-xs sm:text-sm text-[#B6C7CF] leading-relaxed">
                Photograph or upload previous physical prescriptions and diagnostic lab summaries. Transparent OCR text extraction is presented to the patient for verification before inclusion into the case summary.
              </p>
            </div>

            {/* Panel 3: Offline continuity */}
            <div className="p-7 rounded-2xl bg-[#122330] border border-[#294350] space-y-4 hover:border-[#50D6C5]/40 transition duration-150">
              <div className="w-12 h-12 rounded-xl bg-[#18303D] text-[#50D6C5] flex items-center justify-center font-bold border border-[#294350]">
                <HardDrive className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F1F6F8] tracking-tight">
                Offline Continuity
              </h3>
              <p className="text-xs sm:text-sm text-[#B6C7CF] leading-relaxed">
                Guaranteed resilience during network drops. Drafts are encrypted locally with AES-GCM 256. When connectivity returns, monotonic revisions sync without data loss or duplicate case creations.
              </p>
            </div>

          </div>
        </section>

        {/* Workflow Section: Adapted ScrollTimeline in Dark Teal */}
        <section className="space-y-8 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
              PATIENT JOURNEY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
              From arrival to physician review.
            </h2>
            <p className="text-xs sm:text-sm text-[#91A8B3]">
              A predictable, dignified path that patients navigate with touch, voice, or caregiver assistance.
            </p>
          </div>

          {/* Adapted ScrollTimeline Component */}
          <ScrollTimeline milestones={CLINICAL_WORKFLOW_MILESTONES} />
        </section>

        {/* Clear Final Action to Begin Intake */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#0C1924] border border-[#294350] text-center space-y-6 relative overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(80,214,197,0.2),transparent)]" 
              aria-hidden="true" 
            />
            <div className="relative z-10 max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
                Ready to prepare your consultation record?
              </h2>
              <p className="text-sm text-[#B6C7CF] leading-relaxed">
                Takes approximately 3 minutes. Your responses are encrypted on this device and transferred directly to the attending physician&apos;s triage queue.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/kiosk"
                id="start-intake-final-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] shadow-sm transition min-h-[48px]"
              >
                <span>Start Patient Intake</span>
                <ArrowRight className="w-5 h-5 text-[#062820]" />
              </Link>
              <Link
                href="/dashboard"
                id="staff-dashboard-final-link"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm bg-[#18303D] hover:bg-[#203D4D] text-[#F1F6F8] border border-[#294350] transition min-h-[48px]"
              >
                <span>Clinical Staff Dashboard</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#294350] bg-[#0C1924] py-8 px-4 sm:px-6 text-center text-xs text-[#91A8B3] space-y-2">
        <p className="font-semibold text-[#F1F6F8]">
          MediKiosk &mdash; Digital Patient Intake &amp; OPD Clinical Triage Organizer
        </p>
        <p className="text-3xs text-[#91A8B3] max-w-2xl mx-auto">
          Operational software prototype developed for hospital OPD triage workflows. All demonstration data shown is synthetic. Not a certified medical diagnostic device.
        </p>
      </footer>
    </div>
  );
}
