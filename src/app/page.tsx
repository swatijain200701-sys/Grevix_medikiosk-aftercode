"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wifi, WifiOff, Users, FileText, CheckCircle2, 
  Stethoscope, ShieldCheck, RefreshCw, ArrowRight,
  ClipboardList, Camera, HardDrive, Sparkles, MessageSquare,
  ExternalLink, UserCheck, AlertCircle
} from "lucide-react";
import LiquidMetalHero from "@/components/ui/liquid-metal-hero";
import { ScrollTimeline, Milestone } from "@/components/ui/scroll-timeline";

const FEEDBACK_FORM_URL = "https://forms.gle/UM6smWDSmxzCiAwh6";

const THREE_STEPS = [
  {
    step: "1",
    title: "Tell us about your health",
    description: "Answer guided questions on your primary concern, symptoms, duration, medicines, allergies, and prior documents in English or Hindi.",
  },
  {
    step: "2",
    title: "Review and confirm your answers",
    description: "Inspect everything before saving. Review extracted text from uploaded prescriptions and adjust anything inaccurate.",
  },
  {
    step: "3",
    title: "Share a structured summary with hospital staff",
    description: "Your responses are encrypted and delivered to the attending doctor's queue, so your consultation starts with clear context.",
  },
];

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

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Live Connection Monitor */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[#294350] text-[#B6C7CF]">
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

            {/* Direct Link to Google Forms */}
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="nav-feedback-link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#294350] bg-[#122330] hover:bg-[#18303D] text-xs font-semibold text-[#50D6C5] transition"
              title="Give feedback on Google Forms"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Give feedback</span>
              <ExternalLink className="w-3 h-3 text-[#91A8B3]" />
            </a>

            {/* Sample Staff View shortcut */}
            <Link
              href="/dashboard?sample=true"
              id="nav-sample-staff-link"
              className="px-3 py-1.5 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-xs font-semibold text-[#F1F6F8] transition"
            >
              Sample Staff View
            </Link>

            {/* Staff sign in */}
            <Link
              href="/login"
              id="staff-portal-link"
              className="hidden lg:inline-flex px-3.5 py-1.5 rounded-xl border border-[#294350] bg-[#122330] hover:bg-[#18303D] text-xs font-semibold text-[#B6C7CF] hover:text-[#F1F6F8] transition"
            >
              Staff Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: Adapted LiquidMetalHero with Clear Headline and 3 Actions */}
      <LiquidMetalHero
        badge="Patient intake for OPDs"
        title="Your health story, ready before your consultation."
        subtitle="MediKiosk helps you share symptoms, medicines, allergies, and previous reports through guided questions. Hospital staff can review the information before your consultation. Your intake progress stays saved during temporary internet interruptions."
        primaryCtaLabel="Start a sample intake"
        secondaryCtaLabel="Explore a sample staff view"
        onPrimaryCtaClick={() => router.push("/kiosk")}
        onSecondaryCtaClick={() => router.push("/dashboard?sample=true")}
        feedbackUrl={FEEDBACK_FORM_URL}
        features={["Voice and touch", "English and Hindi", "Offline intake"]}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        
        {/* Three Clear Steps */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
              Three simple steps to prepare your visit.
            </h2>
            <p className="text-xs sm:text-sm text-[#91A8B3]">
              Simple, accessible, and designed for shared touch terminals in busy hospital waiting halls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {THREE_STEPS.map((s) => (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-[#122330] border border-[#294350] space-y-3 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#18303D] text-[#50D6C5] flex items-center justify-center font-extrabold text-lg border border-[#294350]">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#F1F6F8] tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#B6C7CF] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Three Capability Panels: Guided intake, Document review, Offline continuity */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
              CORE CAPABILITIES
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
              Engineered for genuine hospital environments.
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
                Guaranteed resilience during network drops once loaded. Drafts are encrypted locally with AES-GCM 256. When connectivity returns, monotonic revisions sync without data loss or duplicate case creations.
              </p>
            </div>

          </div>
        </section>

        {/* FEEDBACK SECTION: Dedicated Form Strip */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0C1924] border border-[#50D6C5]/30 space-y-4 text-center relative overflow-hidden">
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(80,214,197,0.25),transparent)]" 
              aria-hidden="true" 
            />
            <div className="relative z-10 space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#50D6C5] block">
                PARTICIPANT FEEDBACK
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
                Help shape MediKiosk
              </h2>
              <p className="text-sm text-[#B6C7CF] leading-relaxed">
                Try the demo and tell us what confused you or what would make it more useful. Honest criticism is welcome.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                id="open-feedback-form-btn"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] shadow-sm transition min-h-[48px]"
              >
                <span>Open the feedback form</span>
                <ExternalLink className="w-4 h-4 text-[#062820]" />
              </a>
              <span className="text-3xs text-[#91A8B3] block">
                (Opens Google Forms in a new tab • No patient data sent)
              </span>
            </div>
          </div>
        </section>

        {/* Patient Journey Timeline in Dark Teal */}
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

          <ScrollTimeline milestones={CLINICAL_WORKFLOW_MILESTONES} />
        </section>

        {/* Final Action to Begin Intake */}
        <section className="max-w-4xl mx-auto w-full">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#122330] border border-[#294350] text-center space-y-6 relative overflow-hidden">
            <div className="relative z-10 max-w-xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
                Ready to explore the public demo?
              </h2>
              <p className="text-sm text-[#B6C7CF] leading-relaxed">
                Experience the patient intake flow with synthetic data or inspect the doctor&apos;s triage queue.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/kiosk"
                id="start-intake-final-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] shadow-sm transition min-h-[48px]"
              >
                <span>Start a sample intake</span>
                <ArrowRight className="w-5 h-5 text-[#062820]" />
              </Link>
              <Link
                href="/dashboard?sample=true"
                id="staff-dashboard-final-link"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-sm bg-[#18303D] hover:bg-[#203D4D] text-[#F1F6F8] border border-[#294350] transition min-h-[48px]"
              >
                <span>Explore sample staff view</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#294350] bg-[#0C1924] py-8 px-4 sm:px-6 text-center text-xs text-[#91A8B3] space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link href="/kiosk" className="hover:text-[#50D6C5] transition">Patient Kiosk</Link>
          <span className="text-[#294350]">•</span>
          <Link href="/dashboard?sample=true" className="hover:text-[#50D6C5] transition">Sample Staff View</Link>
          <span className="text-[#294350]">•</span>
          <Link href="/login" className="hover:text-[#50D6C5] transition">Staff Sign In</Link>
          <span className="text-[#294350]">•</span>
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#50D6C5] hover:underline inline-flex items-center gap-1"
          >
            <span>Feedback Form</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <p className="font-semibold text-[#F1F6F8]">
          MediKiosk &mdash; Accessible Outpatient Intake &amp; OPD Triage Organizer
        </p>
        <p className="text-3xs text-[#91A8B3] max-w-2xl mx-auto">
          Public demonstration prototype. Please use fictional data only. Not a certified medical diagnostic device. AI summaries assist clinician review and do not provide medical diagnosis or treatment.
        </p>
      </footer>
    </div>
  );
}
