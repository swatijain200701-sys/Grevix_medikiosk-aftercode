"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Wifi, WifiOff, FileText, CheckCircle2, 
  Stethoscope, ArrowRight, ClipboardList, Camera, HardDrive,
  MessageSquare, ExternalLink, UserCheck, AlertCircle, Check,
  Activity, ShieldCheck, Users, HelpCircle
} from "lucide-react";

const FEEDBACK_FORM_URL = "https://forms.gle/UM6smWDSmxzCiAwh6";

const FOUR_STEPS = [
  {
    step: "1",
    title: "Enter your details",
    description: "Provide your preferred name and age. A family member or staff member can assist you if needed.",
  },
  {
    step: "2",
    title: "Share your health history",
    description: "Answer guided questions about your symptoms, medicines, allergies, and prior reports in English or Hindi.",
  },
  {
    step: "3",
    title: "Review and confirm",
    description: "Inspect all your responses and extracted document text before anything is sent.",
  },
  {
    step: "4",
    title: "Submit for staff review",
    description: "Your structured information is queued for the clinical team before your consultation begins.",
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
    <div className="min-h-screen bg-[#EAF0EB] text-[#293D36] flex flex-col font-sans selection:bg-[#356B62]/20 selection:text-[#356B62]">
      
      {/* 1. Header: Navy #0B1B25 */}
      <header className="border-b border-[#304652] bg-[#0B1B25] text-[#FAF7F0] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo tile: turquoise #4FD1C5 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#FAF7F0] block leading-tight">
                MediKiosk
              </span>
              <span className="text-xs text-[#91A8B3] font-medium block">
                Patient history. Prepared for your consultation.
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#FAF7F0]/90">
            <a href="#how-it-works" className="hover:text-[#4FD1C5] transition">How it works</a>
            <a href="#for-patients" className="hover:text-[#4FD1C5] transition">For patients</a>
            <a href="#for-staff" className="hover:text-[#4FD1C5] transition">For hospital staff</a>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#4FD1C5] transition inline-flex items-center gap-1"
            >
              <span>Give feedback</span>
              <ExternalLink className="w-3 h-3 text-[#91A8B3]" />
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Service Availability Probe (No static OPD connected badge) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[#304652] text-[#FAF7F0]">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5]" />
                  <span className="text-3xs text-[#91A8B3]">Service available</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-3xs text-amber-300">Offline mode active</span>
                </>
              )}
            </div>

            {/* Staff Sign In Primary Nav Link */}
            <Link
              href="/login"
              id="header-staff-signin-link"
              className="px-4 py-2 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] text-xs font-bold transition shadow-sm"
            >
              Staff sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-[#B8C9BD] bg-[#EAF0EB] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Small readable notice near intake entry and before collection */}
          <div className="mb-8 p-3.5 rounded-xl bg-[#D8E5DC] border border-[#B8C9BD] text-xs text-[#293D36] flex items-center justify-between gap-3 shadow-xs max-w-4xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#356B62] shrink-0" />
              <span>
                <strong>Public testing version</strong> — please use fictional information. AI summaries assist clinician review and do not provide diagnosis.
              </span>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[#356B62] hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Feedback form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62]">
                  Outpatient Intake & Clinical Preparation
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#293D36] leading-tight tracking-tight">
                  Help your doctor understand your health history before you meet.
                </h1>
                <p className="text-base sm:text-lg text-[#53665D] leading-relaxed max-w-2xl font-normal">
                  Share your symptoms, medicines, allergies, and previous reports through guided questions. Review your answers before sending them for staff review.
                </p>
              </div>

              {/* Three short bullets */}
              <ul className="space-y-2.5 text-sm sm:text-base text-[#293D36] font-medium pt-1">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Explain your concern in your own words.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Keep your health information organised in one intake record.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Help staff prepare for your consultation.</span>
                </li>
              </ul>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#for-patients"
                  className="px-6 py-3.5 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-sm shadow-sm transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>Start patient intake</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#for-staff"
                  className="px-6 py-3.5 rounded-xl bg-[#FAF7F0] border border-[#B8C9BD] hover:bg-[#D8E5DC] text-[#293D36] font-bold text-sm shadow-xs transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>Staff sign in</span>
                </a>
              </div>

            </div>

            {/* Hero Right Column: Example Intake Record Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-[#FAF7F0] border border-[#B8C9BD] shadow-md p-6 space-y-4">
                
                {/* Header: Must say Example intake record */}
                <div className="flex items-center justify-between border-b border-[#B8C9BD] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D8E5DC] text-[#356B62] flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#293D36] uppercase tracking-wider block">
                        Example intake record
                      </span>
                      <span className="text-3xs font-mono text-[#53665D]">Sample Record #EX-782</span>
                    </div>
                  </div>
                  <span className="text-3xs font-bold px-2.5 py-0.5 rounded-full bg-[#304652]/10 text-[#304652] border border-[#304652]/30">
                    Synthetic Example
                  </span>
                </div>

                {/* Patient Summary Card */}
                <div className="p-3.5 rounded-xl bg-[#D8E5DC]/60 border border-[#B8C9BD] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-3xs text-[#53665D]">
                    <span className="font-bold text-[#293D36]">Patient: Ramesh Kumar, 54 Y</span>
                    <span className="font-mono text-[#356B62]">Saved draft</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#293D36] block text-xs">Main Health Concern:</span>
                    <p className="text-[#53665D] text-xs leading-relaxed mt-0.5">
                      Chest heaviness after walking, cough with mild fever for 4 days.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1 text-3xs">
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#B8C9BD] text-[#293D36]">Hindi / Touch Input</span>
                    <span className="px-2 py-0.5 rounded bg-[#FAF7F0] border border-[#B8C9BD] text-[#293D36]">Prescription Document Added</span>
                  </div>
                </div>

                {/* Plain-Language Badges (Slate #304652 accents, no jargon) */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#B8C9BD]">
                    <span className="flex items-center gap-2 text-[#293D36]">
                      <ShieldCheck className="w-4 h-4 text-[#356B62]" />
                      Encrypted local storage on this terminal
                    </span>
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-[#304652]/10 text-[#304652]">
                      Device Secured
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F0] border border-[#B8C9BD]">
                    <span className="flex items-center gap-2 text-[#293D36]">
                      <Activity className="w-4 h-4 text-[#356B62]" />
                      Checks high-concern symptoms for staff attention
                    </span>
                    <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-[#304652]/10 text-[#304652]">
                      Clinical Prompt
                    </span>
                  </div>
                </div>

                <div className="text-center pt-1 border-t border-[#B8C9BD]">
                  <span className="text-3xs text-[#53665D] uppercase tracking-wider font-mono">
                    Synthetic test data — Illustrative preview only
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Clearly Separate Patient and Staff Entry Cards near the top */}
      <section className="py-12 sm:py-16 bg-[#EAF0EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#293D36] tracking-tight">
              Choose your path
            </h2>
            <p className="text-sm text-[#53665D]">
              Clear, separate entry points for patients preparing for their consultation and hospital staff reviewing intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* CARD 1: PATIENTS & CAREGIVERS */}
            <div
              id="for-patients"
              className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F0] border-2 border-[#B8C9BD] hover:border-[#356B62]/60 shadow-md flex flex-col justify-between space-y-6 transition"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#356B62] bg-[#D8E5DC] px-3 py-1 rounded-full border border-[#B8C9BD]">
                    PATIENTS &amp; CAREGIVERS
                  </span>
                  <Users className="w-6 h-6 text-[#356B62]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#293D36] tracking-tight">
                    Prepare for your consultation
                  </h3>
                  <p className="text-sm text-[#53665D] leading-relaxed">
                    Take your time to enter your health history calmly before meeting the physician.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-[#293D36] font-medium pt-1">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Answer guided health questions.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Add previous reports if available.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Check and confirm your information.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#B8C9BD]">
                <Link
                  href="/kiosk"
                  id="patient-start-intake-btn"
                  className="w-full py-4 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-base shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Start patient intake</span>
                  <ArrowRight className="w-4 h-4 text-[#FFFDF7]" />
                </Link>
                <p className="text-xs text-[#53665D] text-center font-medium">
                  A caregiver or staff member can help you.
                </p>
              </div>
            </div>

            {/* CARD 2: HOSPITAL STAFF */}
            <div
              id="for-staff"
              className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F0] border-2 border-[#B8C9BD] hover:border-[#356B62]/60 shadow-md flex flex-col justify-between space-y-6 transition"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#304652] bg-[#D8E5DC] px-3 py-1 rounded-full border border-[#B8C9BD]">
                    HOSPITAL STAFF
                  </span>
                  <Stethoscope className="w-6 h-6 text-[#356B62]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[#293D36] tracking-tight">
                    Review patient intake
                  </h3>
                  <p className="text-sm text-[#53665D] leading-relaxed">
                    Clinical dashboard for physicians and OPD triage nurses to inspect incoming histories.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-[#293D36] font-medium pt-1">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Access submitted histories.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Review available summaries and source information.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Record notes and review status.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#B8C9BD]">
                <Link
                  href="/login"
                  id="staff-signin-card-btn"
                  className="w-full py-4 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-base shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Staff sign in</span>
                  <ArrowRight className="w-4 h-4 text-[#FFFDF7]" />
                </Link>
                <div className="text-center">
                  <Link
                    href="/dashboard?sample=true"
                    id="sample-dashboard-secondary-link"
                    className="text-xs font-bold text-[#356B62] hover:underline"
                  >
                    See an example
                  </Link>
                  <span className="text-3xs text-[#53665D] block mt-0.5">
                    (Public view with synthetic data only)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Four-Step Explanation & Feature Lists */}
      <section id="how-it-works" className="py-12 sm:py-16 bg-[#FAF7F0] border-t border-b border-[#B8C9BD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Four-Step Process */}
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#356B62]">
                PROCESS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#293D36] tracking-tight">
                How MediKiosk works in four steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {FOUR_STEPS.map((s) => (
                <div
                  key={s.step}
                  className="p-6 rounded-2xl bg-[#FAF7F0] border border-[#B8C9BD] space-y-3 flex flex-col justify-between shadow-xs hover:border-[#356B62]/60 transition"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#D8E5DC] text-[#356B62] flex items-center justify-center font-extrabold text-base border border-[#B8C9BD]">
                      {s.step}
                    </div>
                    <h3 className="text-base font-bold text-[#293D36] tracking-tight">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#53665D] leading-relaxed">
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Three Short Bullet Lists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-4 border-t border-[#B8C9BD]">
            
            {/* List 1 */}
            <div className="p-6 rounded-2xl bg-[#D8E5DC]/50 border border-[#B8C9BD] space-y-4">
              <h3 className="text-lg font-bold text-[#293D36] tracking-tight">
                What problem does MediKiosk address?
              </h3>
              <ul className="space-y-2.5 text-xs text-[#293D36] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Patients may forget medicines or parts of their medical history.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Previous prescriptions and reports can be difficult to organise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Staff often need to collect the same basic information repeatedly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Internet interruptions can disrupt digital intake.</span>
                </li>
              </ul>
            </div>

            {/* List 2 */}
            <div className="p-6 rounded-2xl bg-[#D8E5DC]/50 border border-[#B8C9BD] space-y-4">
              <h3 className="text-lg font-bold text-[#293D36] tracking-tight">
                What can you do with MediKiosk?
              </h3>
              <ul className="space-y-2.5 text-xs text-[#293D36] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Enter symptoms, medicines, allergies, and relevant history.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Use supported voice or touch input.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Upload supported documents and confirm extracted text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Review your answers before submitting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Continue intake through a temporary connection interruption.</span>
                </li>
              </ul>
            </div>

            {/* List 3 */}
            <div className="p-6 rounded-2xl bg-[#D8E5DC]/50 border border-[#B8C9BD] space-y-4">
              <h3 className="text-lg font-bold text-[#293D36] tracking-tight">
                What makes the approach useful?
              </h3>
              <ul className="space-y-2.5 text-xs text-[#293D36] leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Guided English and Hindi intake, where supported.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Assisted entry for patients who need help.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Saved progress during connection interruptions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Patient-reviewed answers and document text.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#356B62] font-bold">•</span>
                  <span>Structured summaries with references for staff review.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Visible Feedback Callout Strip */}
      <section className="py-10 bg-[#EAF0EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FAF7F0] border border-[#B8C9BD] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#356B62] uppercase tracking-wider block">
                User Testing &amp; Feedback
              </span>
              <h3 className="text-lg font-bold text-[#293D36]">
                Have feedback on language clarity or touch friction?
              </h3>
              <p className="text-xs text-[#53665D]">
                Share your experience directly through our Google Feedback form.
              </p>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="cta-feedback-form-link"
              className="px-6 py-3 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-xs inline-flex items-center gap-1.5 transition whitespace-nowrap min-h-[44px]"
            >
              <span>Give feedback</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer: Navy #0B1B25 */}
      <footer className="border-t border-[#304652] bg-[#0B1B25] py-10 px-4 sm:px-6 text-center text-xs text-[#91A8B3] space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#FAF7F0]">
          <Link href="/kiosk" className="hover:text-[#4FD1C5] transition">Patient Intake Kiosk</Link>
          <span className="text-[#304652]">|</span>
          <Link href="/dashboard?sample=true" className="hover:text-[#4FD1C5] transition">See an example dashboard</Link>
          <span className="text-[#304652]">|</span>
          <Link href="/login" className="hover:text-[#4FD1C5] transition">Staff Sign In</Link>
          <span className="text-[#304652]">|</span>
          <a
            href={FEEDBACK_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4FD1C5] hover:underline inline-flex items-center gap-1"
          >
            <span>Feedback form</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-1 max-w-2xl mx-auto">
          <p className="font-bold text-[#FAF7F0]">
            MediKiosk — Patient history. Prepared for your consultation.
          </p>
          <p className="text-3xs text-[#91A8B3] leading-relaxed">
            Public testing version — please use fictional information. AI summaries assist clinician review and do not provide medical diagnosis or treatment.
          </p>
        </div>
      </footer>

    </div>
  );
}