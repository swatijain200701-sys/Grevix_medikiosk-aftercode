"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScrollTimeline } from "@/components/ui/scroll-timeline";
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
    <div className="min-h-screen text-[var(--text-body)] flex flex-col font-sans selection:bg-[var(--btn-main)]/20 selection:text-[var(--btn-main)]">
      
      {/* 1. Header: Navy #0B1B25 */}
      <header className="border-b border-[var(--border-color)] bg-[var(--header-bg)] text-[var(--header-text)] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo tile: turquoise #4FD1C5 */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[var(--header-text)] block leading-tight">
                MediKiosk
              </span>
              <span className="text-xs text-[var(--header-text-muted)] font-medium block">
                Patient history. Prepared for your consultation.
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--header-text)]/90">
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
              <ExternalLink className="w-3 h-3 text-[var(--header-text-muted)]" />
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Service Availability Probe (No static OPD connected badge) */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[var(--border-color)] text-[var(--header-text)]">
              {isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5]" />
                  <span className="text-3xs text-[var(--header-text-muted)]">Service available</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-3xs text-amber-300">Offline mode active</span>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle compact />

            {/* Staff Sign In Primary Nav Link */}
            <Link
              href="/login"
              id="header-staff-signin-link"
              className="px-4 py-2 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] text-xs font-bold transition shadow-sm"
            >
              Staff sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b py-12 sm:py-16" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Small readable notice near intake entry and before collection */}
          <div className="mb-8 p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] flex items-center justify-between gap-3 shadow-xs max-w-4xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
              <span>
                <strong>Public testing version</strong> — please use fictional information. AI summaries assist clinician review and do not provide diagnosis.
              </span>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[var(--btn-main)] hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Feedback form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)]">
                  Outpatient Intake & Clinical Preparation
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-heading)] leading-tight tracking-tight">
                  Your health history. Ready for your doctor.
                </h1>
                <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl font-normal">
                  Share your symptoms, medicines, allergies, and previous reports through guided questions. Review your answers before sending them for staff review.
                </p>
              </div>

              {/* Three short bullets */}
              <ul className="space-y-2.5 text-sm sm:text-base text-[var(--text-heading)] font-medium pt-1">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Explain your concern in your own words.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Keep your health information organised in one intake record.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Help staff prepare for your consultation.</span>
                </li>
              </ul>

              {/* Quick Jump Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#for-patients"
                  className="px-6 py-3.5 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-sm shadow-sm transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>Start patient intake</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#for-staff"
                  className="px-6 py-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-panel)] text-[var(--text-heading)] font-bold text-sm shadow-xs transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>Staff sign in</span>
                </a>
              </div>

            </div>

            {/* Hero Right Column: Patient Intake Overview Preview */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md p-6 space-y-4">
                
                {/* Header: Patient intake overview */}
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-panel)] text-[var(--btn-main)] flex items-center justify-center font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider block">
                        Patient intake overview
                      </span>
                      <span className="text-3xs text-[var(--text-muted)]">
                        Organised information for your consultation
                      </span>
                    </div>
                  </div>
                  <span className="text-3xs font-semibold px-2.5 py-1 rounded-full bg-[var(--bg-panel)] text-[var(--text-heading)] border border-[var(--border-color)]">
                    History • Reports • Staff review
                  </span>
                </div>

                {/* Generic Information Categories Overview */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-panel)]/60 border border-[var(--border-color)] space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <span className="text-3xs font-bold text-[var(--btn-main)] uppercase tracking-wider block">Category</span>
                      <span className="font-semibold text-[var(--text-heading)] text-xs block mt-0.5">Symptoms</span>
                      <span className="text-3xs text-[var(--text-muted)] block mt-0.5">Primary concern and timeline</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <span className="text-3xs font-bold text-[var(--btn-main)] uppercase tracking-wider block">Category</span>
                      <span className="font-semibold text-[var(--text-heading)] text-xs block mt-0.5">Medicines</span>
                      <span className="text-3xs text-[var(--text-muted)] block mt-0.5">Current prescriptions &amp; doses</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <span className="text-3xs font-bold text-[var(--btn-main)] uppercase tracking-wider block">Category</span>
                      <span className="font-semibold text-[var(--text-heading)] text-xs block mt-0.5">Allergies</span>
                      <span className="text-3xs text-[var(--text-muted)] block mt-0.5">Known reactions confirmed</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)]">
                      <span className="text-3xs font-bold text-[var(--btn-main)] uppercase tracking-wider block">Category</span>
                      <span className="font-semibold text-[var(--text-heading)] text-xs block mt-0.5">Previous reports</span>
                      <span className="text-3xs text-[var(--text-muted)] block mt-0.5">Uploaded &amp; verified text</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-3xs text-[var(--text-muted)]">
                    <span>Input formats: Touch, Voice, Document upload</span>
                    <span className="font-medium text-[var(--btn-main)]">English &amp; Hindi</span>
                  </div>
                </div>

                {/* Bottom line */}
                <div className="text-center pt-1 border-t border-[var(--border-color)]">
                  <p className="text-xs font-medium text-[var(--text-muted)]">
                    Patient-confirmed history, prepared for staff review.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Clearly Separate Patient and Staff Entry Cards near the top */}
      <section className="py-12 sm:py-16 bg-[var(--bg-main)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Choose your path
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Clear, separate entry points for patients preparing for their consultation and hospital staff reviewing intake.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* CARD 1: PATIENTS & CAREGIVERS */}
            <div
              id="for-patients"
              className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-[var(--btn-main)]/60 shadow-md flex flex-col justify-between space-y-6 transition"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    PATIENTS &amp; CAREGIVERS
                  </span>
                  <Users className="w-6 h-6 text-[var(--btn-main)]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[var(--text-heading)] tracking-tight">
                    Prepare for your consultation
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Take your time to enter your health history calmly before meeting the physician.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-[var(--text-heading)] font-medium pt-1">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Answer guided health questions.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Add previous reports if available.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Check and confirm your information.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                <Link
                  href="/kiosk"
                  id="patient-start-intake-btn"
                  className="w-full py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-base shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Start patient intake</span>
                  <ArrowRight className="w-4 h-4 text-[var(--btn-main-text)]" />
                </Link>
                <p className="text-xs text-[var(--text-muted)] text-center font-medium">
                  A caregiver or staff member can help you.
                </p>
              </div>
            </div>

            {/* CARD 2: HOSPITAL STAFF */}
            <div
              id="for-staff"
              className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] hover:border-[var(--btn-main)]/60 shadow-md flex flex-col justify-between space-y-6 transition"
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--slate-accent)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    HOSPITAL STAFF
                  </span>
                  <Stethoscope className="w-6 h-6 text-[var(--btn-main)]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-extrabold text-[var(--text-heading)] tracking-tight">
                    Review patient intake
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Clinical dashboard for physicians and OPD triage nurses to inspect incoming histories.
                  </p>
                </div>

                <ul className="space-y-3 text-sm text-[var(--text-heading)] font-medium pt-1">
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Access submitted histories.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Review available summaries and source information.</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span>Record notes and review status.</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border-color)]">
                <Link
                  href="/login"
                  id="staff-signin-card-btn"
                  className="w-full py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-base shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Staff sign in</span>
                  <ArrowRight className="w-4 h-4 text-[var(--btn-main-text)]" />
                </Link>
                <div className="text-center">
                  <Link
                    href="/dashboard?sample=true"
                    id="sample-dashboard-secondary-link"
                    className="text-xs font-bold text-[var(--btn-main)] hover:underline"
                  >
                    See an example
                  </Link>
                  <span className="text-3xs text-[var(--text-muted)] block mt-0.5">
                    (Public view with synthetic data only)
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Patient Journey Timeline */}
      <section id="how-it-works" className="py-12 sm:py-16 border-t border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: 'var(--btn-main)' }}>PATIENT JOURNEY</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-heading)' }}>How MediKiosk works in five steps</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>This illustrates the intake process. It does not show real patient data or server-sync status.</p>
            </div>
            <ScrollTimeline milestones={[
              { id: "step-1", stepNumber: "1", title: "Register and choose your language", description: "Enter your preferred name and age. Select English or Hindi guidance throughout your intake session." },
              { id: "step-2", stepNumber: "2", title: "Share your health history", description: "Answer guided questions about your main concern, onset, symptoms, medicines, allergies, and relevant past history." },
              { id: "step-3", stepNumber: "3", title: "Add and confirm document information", description: "Upload previous prescriptions or reports if available. Review any text extracted from your documents before proceeding." },
              { id: "step-4", stepNumber: "4", title: "Review and submit; sync when connected", description: "Read back all your answers. Submit when ready. Your information saves locally and syncs when the connection allows." },
              { id: "step-5", stepNumber: "5", title: "Staff review the submitted information and available summary", description: "Clinical staff access your structured intake record through the triage dashboard before your consultation begins." },
            ]} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>What problem does MediKiosk address?</h3>
              <ul className="space-y-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Patients may forget medicines or parts of their medical history.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Previous prescriptions and reports can be difficult to organise.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Staff often need to collect the same basic information repeatedly.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Internet interruptions can disrupt digital intake.</span></li>
              </ul></div>
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>What can you do with MediKiosk?</h3>
              <ul className="space-y-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Enter symptoms, medicines, allergies, and relevant history.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Use supported voice or touch input.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Upload supported documents and confirm extracted text.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Review your answers before submitting.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Continue intake through a temporary connection interruption.</span></li>
              </ul></div>
            <div className="p-6 rounded-2xl border space-y-4" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-lg font-bold tracking-tight" style={{ color: 'var(--text-heading)' }}>What makes the approach useful?</h3>
              <ul className="space-y-2.5 text-xs leading-relaxed" style={{ color: 'var(--text-body)' }}>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Guided English and Hindi intake, where supported.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Assisted entry for patients who need help.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Saved progress during connection interruptions.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Patient-reviewed answers and document text.</span></li>
                <li className="flex items-start gap-2"><span style={{ color: 'var(--btn-main)' }}>&#8250;</span><span>Structured summaries with references for staff review.</span></li>
              </ul></div>
          </div>
        </div>
      </section>

      {/* Visible Feedback Callout Strip */}
      <section className="py-10" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--btn-main)] uppercase tracking-wider block">
                User Testing &amp; Feedback
              </span>
              <h3 className="text-lg font-bold text-[var(--text-heading)]">
                Have feedback on language clarity or touch friction?
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Share your experience directly through our Google Feedback form.
              </p>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="cta-feedback-form-link"
              className="px-6 py-3 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-xs inline-flex items-center gap-1.5 transition whitespace-nowrap min-h-[44px]"
            >
              <span>Give feedback</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer: Navy #0B1B25 */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--header-bg)] py-10 px-4 sm:px-6 text-center text-xs text-[var(--header-text-muted)] space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--header-text)]">
          <Link href="/kiosk" className="hover:text-[#4FD1C5] transition">Patient Intake Kiosk</Link>
          <span className="text-[var(--slate-accent)]">|</span>
          <Link href="/dashboard?sample=true" className="hover:text-[#4FD1C5] transition">See an example dashboard</Link>
          <span className="text-[var(--slate-accent)]">|</span>
          <Link href="/login" className="hover:text-[#4FD1C5] transition">Staff Sign In</Link>
          <span className="text-[var(--slate-accent)]">|</span>
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
          <p className="font-bold text-[var(--header-text)]">
            MediKiosk — Patient history. Prepared for your consultation.
          </p>
          <p className="text-3xs text-[var(--header-text-muted)] leading-relaxed">
            Public testing version — please use fictional information. AI summaries assist clinician review and do not provide medical diagnosis or treatment.
          </p>
        </div>
      </footer>

    </div>
  );
}