"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WaitingRoomCanvas } from "@/components/landing/WaitingRoomCanvas";
import { HeroFlowVisual } from "@/components/landing/HeroFlowVisual";
import { EightStepJourney } from "@/components/landing/EightStepJourney";
import { OfflineSimulator } from "@/components/landing/OfflineSimulator";
import { ClinicalPreparationPreview } from "@/components/landing/ClinicalPreparationPreview";
import { MagneticText } from "@/components/ui/morphing-cursor";
import { 
  Wifi, WifiOff, FileText, CheckCircle2, 
  Stethoscope, ArrowRight, ClipboardList, Camera, HardDrive,
  MessageSquare, ExternalLink, UserCheck, AlertCircle, Check,
  Activity, ShieldCheck, Users, HelpCircle, HeartPulse, Eye,
  Lock, Languages, Sparkles
} from "lucide-react";

const FEEDBACK_FORM_URL = "https://forms.gle/UM6smWDSmxzCiAwh6";

export default function Home() {
  const [isServiceOnline, setIsServiceOnline] = useState<boolean>(true);

  // Real lightweight health probe to /api/health
  useEffect(() => {
    let mounted = true;
    const probe = async () => {
      try {
        const res = await fetch("/api/health");
        if (mounted) {
          setIsServiceOnline(res.ok && navigator.onLine);
        }
      } catch {
        if (mounted) {
          setIsServiceOnline(false);
        }
      }
    };

    probe();
    const handleOnline = () => probe();
    const handleOffline = () => setIsServiceOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      mounted = false;
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-body)] flex flex-col font-sans selection:bg-[var(--btn-main)]/20 selection:text-[var(--btn-main)]">
      
      {/* ═════════════════════════════════════════════════════════════════════════
          HEADER: Navy #0B1B25
          ═════════════════════════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--border-color)] bg-[var(--header-bg)] text-[var(--header-text)] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm transition-transform group-hover:scale-105">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[var(--header-text)] block leading-tight">
                MediKiosk
              </span>
              <span className="text-xs text-[var(--header-text-muted)] font-medium block">
                Outpatient Intake &amp; Clinical Preparation
              </span>
            </div>
          </Link>

          {/* Navigation Anchors (Preserved) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[var(--header-text)]/90">
            <a href="#the-problem" className="hover:text-[#4FD1C5] transition">The Problem</a>
            <a href="#how-it-works" className="hover:text-[#4FD1C5] transition">How it works</a>
            <a href="#clinical-prep" className="hover:text-[#4FD1C5] transition">Clinical Preparation</a>
            <a href="#offline-resilience" className="hover:text-[#4FD1C5] transition">Offline Tech</a>
            <a href="#for-patients" className="hover:text-[#4FD1C5] transition">For patients</a>
            <a href="#for-staff" className="hover:text-[#4FD1C5] transition">For staff</a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Live Service Availability Probe */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[var(--border-color)] text-[var(--header-text)]">
              {isServiceOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#4FD1C5] animate-pulse" />
                  <span className="text-3xs text-[var(--header-text-muted)]">Service available</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-3xs text-amber-300">Offline terminal mode</span>
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

      <main id="main-content" className="flex-1">
        {/* ═════════════════════════════════════════════════════════════════════════
            SECTION A: HERO (P0)
            ═════════════════════════════════════════════════════════════════════════ */}
      <section className="border-b py-12 sm:py-20" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Transparent Public Testing Notice */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] flex items-center justify-between gap-3 shadow-xs max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
              <span>
                <strong>Public testing version:</strong> Please use fictional test entries. MediKiosk prepares intake summaries for human doctors and <strong>never provides medical diagnosis or prescription advice</strong>.
              </span>
            </div>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-[var(--btn-main)] hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              <span>Feedback</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] font-mono">
                  Outpatient Intake &amp; Clinical Preparation
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text-heading)] leading-tight tracking-tight">
                  Better conversations begin before the consultation.
                </h1>
                <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-2xl font-normal">
                  A walk-up outpatient intake assistant that helps patients organize symptoms, medicines, allergies, and prescriptions in English or Hindi—ready for clinical review even through internet drops.
                </p>
              </div>

              {/* Core Feature Bullets */}
              <ul className="space-y-2.5 text-sm sm:text-base text-[var(--text-heading)] font-medium pt-1">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Voice &amp; touch in dual languages</strong> with mandatory transcript review.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Encrypted offline continuity</strong> so intermittent hospital Wi-Fi never loses data.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span><strong>Structured clinician handoff</strong> with verifiable citations and attention prompts.</span>
                </li>
              </ul>

              {/* Primary Direct CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <Link
                  href="/kiosk"
                  id="hero-start-intake-btn"
                  className="px-7 py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-sm shadow-sm transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>Start patient intake</span>
                  <ArrowRight className="w-4 h-4 text-[var(--btn-main-text)]" />
                </Link>
                <a
                  href="#how-it-works"
                  id="hero-see-how-btn"
                  className="px-6 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-panel)] text-[var(--text-heading)] font-bold text-sm shadow-xs transition inline-flex items-center gap-2 min-h-[48px]"
                >
                  <span>See how it works</span>
                </a>
                <Link
                  href="/login"
                  id="hero-staff-signin-btn"
                  className="px-5 py-4 rounded-xl text-[var(--btn-main)] hover:underline font-bold text-sm transition inline-flex items-center gap-1.5 min-h-[48px]"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Staff sign in</span>
                </Link>
              </div>
            </div>

            {/* Hero Right Column: Animated Data Transformation Visual */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <HeroFlowVisual />
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION B: THE INVISIBLE PROBLEM & WAITING ROOM CANVAS (P0)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section id="the-problem" className="py-14 sm:py-20 border-b overflow-hidden relative" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
              The Outpatient Reality
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
              The invisible friction in crowded waiting rooms
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              In busy outpatient departments, patients wait for hours only to spend their brief consultation repeating basic history, untangling disorganized prescription slips, and struggling with language barriers.
            </p>
          </div>

          {/* Hardened WaitingRoomCanvas Crowd Sprite Visual */}
          <div className="max-w-4xl mx-auto rounded-3xl bg-[var(--bg-panel)]/40 border border-[var(--border-color)] overflow-hidden shadow-inner p-2">
            <WaitingRoomCanvas />
          </div>

          {/* Problem Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl bg-[var(--bg-panel)]/50 border border-[var(--border-color)] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] text-[var(--btn-main)] flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">Forgotten History &amp; Dosages</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Anxiety in the consultation room often causes patients to omit crucial current medicines, prior allergies, or symptom onset dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-panel)]/50 border border-[var(--border-color)] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] text-[var(--btn-main)] flex items-center justify-center font-bold">
                <Languages className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">Language &amp; Literacy Barriers</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Patients who cannot comfortably write medical terms in English face friction without native Hindi voice guidance or assisted caregiver flags.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-panel)]/50 border border-[var(--border-color)] space-y-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--bg-card)] text-[var(--btn-main)] flex items-center justify-center font-bold">
                <WifiOff className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[var(--text-heading)]">Fragile Hospital Connectivity</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Cloud-dependent intake web forms lose progress when hospital Wi-Fi drops. MediKiosk guarantees encrypted offline continuity at the terminal level.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          EDITORIAL TRANSITION: Dignified Clinical Intake (MagneticText)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 border-b text-center" style={{ backgroundColor: 'var(--bg-panel)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)]">
            Dignified Clinical Intake
          </span>
          <div className="flex justify-center py-2">
            <MagneticText
              text="Every patient has a story."
              hoverText="Every detail matters."
            />
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            Move your cursor or focus over the words to reveal how structured preparation respects patient time and clinician focus.
          </p>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION C: 8-STEP PATIENT JOURNEY (P0)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-14 sm:py-20 border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <EightStepJourney />
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION D: TWO EXPERIENCES (P1)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
              Two Tailored Experiences
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Designed for walk-up patients and clinical teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Card 1: For Patients */}
            <div
              id="for-patients"
              className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-panel)]/40 border-2 border-[var(--border-color)] shadow-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    FOR PATIENTS &amp; CAREGIVERS
                  </span>
                  <Users className="w-6 h-6 text-[var(--btn-main)]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[var(--text-heading)]">
                  Walk-up Kiosk Terminal
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Calm, unhurried questions with high-contrast text, touch buttons (&ge;48px), dual-language toggle, optional voice dictation, and zero preselected checkboxes.
                </p>
                <ul className="space-y-2.5 text-xs text-[var(--text-heading)] font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Voice input with transcript review before saving</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Prescription camera scan with patient verification</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Automatic session wipe for privacy when finished</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)]">
                <Link
                  href="/kiosk"
                  id="card-start-kiosk-btn"
                  className="w-full py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <span>Start Patient Intake</span>
                  <ArrowRight className="w-4 h-4 text-[var(--btn-main-text)]" />
                </Link>
              </div>
            </div>

            {/* Card 2: For Staff */}
            <div
              id="for-staff"
              className="p-8 sm:p-10 rounded-3xl bg-[var(--bg-panel)]/40 border-2 border-[var(--border-color)] shadow-md flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--slate-accent)] bg-[var(--bg-card)] px-3 py-1 rounded-full border border-[var(--border-color)]">
                    FOR CLINICAL &amp; OPD STAFF
                  </span>
                  <Stethoscope className="w-6 h-6 text-[var(--btn-main)]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[var(--text-heading)]">
                  Staff Review &amp; Triage Station
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Physicians and triage nurses inspect incoming patient intakes, review highlighted red-flag attention prompts, and inspect source citations before consultation.
                </p>
                <ul className="space-y-2.5 text-xs text-[var(--text-heading)] font-semibold">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Real-time incoming case queue with attention flags</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Verifiable provenance chips for every data point</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--btn-main)]" /> Triage categories and printable case reports</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[var(--border-color)] space-y-2">
                <Link
                  href="/login"
                  id="card-staff-login-btn"
                  className="w-full py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-panel)] text-[var(--text-heading)] font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 min-h-[48px]"
                >
                  <Lock className="w-4 h-4 text-[var(--btn-main)]" />
                  <span>Staff Portal Sign In</span>
                </Link>
                <div className="text-center">
                  <Link
                    href="/dashboard?sample=true"
                    className="text-xs font-bold text-[var(--btn-main)] hover:underline inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Explore sample staff dashboard (synthetic data)</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION E: OFFLINE RESILIENCE SIMULATOR (P1)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section id="offline-resilience" className="py-14 sm:py-20 border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <OfflineSimulator />
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION F: CLINICAL PREPARATION & PROVENANCE (P1)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section id="clinical-prep" className="py-14 sm:py-20 border-b" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <ClinicalPreparationPreview />
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION G: ACCESSIBILITY & CLINICAL INTEGRITY (P1)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 border-b" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
              Verified In Practice
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Accessibility verified with real testers (n=16)
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Tested across age groups 20 to 65+ with caregivers and OPD staff. We claim only what we tested and state remaining gaps honestly.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5">
              <span className="font-bold text-[var(--btn-main)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> High-Contrast Dual Typography
              </span>
              <p className="text-3xs text-[var(--text-muted)]">
                Plus Jakarta Sans paired with native Noto Sans Devanagari ensures crisp readability for Hindi and English without font layout shifts.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5">
              <span className="font-bold text-[var(--btn-main)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> &ge;48px Touch Targets in Kiosk
              </span>
              <p className="text-3xs text-[var(--text-muted)]">
                Every interactive option, language toggle, and navigation button is sized for easy finger-tapping on kiosk touch screens.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5">
              <span className="font-bold text-[var(--btn-main)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Plain-Language &amp; Zero Preselection
              </span>
              <p className="text-3xs text-[var(--text-muted)]">
                Informed consent statements explain plain data handling. No boxes are pre-checked, and missing allergies are never assumed as negative.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1.5">
              <span className="font-bold text-[var(--btn-main)] flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> prefers-reduced-motion Support
              </span>
              <p className="text-3xs text-[var(--text-muted)]">
                When users request reduced motion in their OS or browser, all animations freeze into clean, static layout views without functionality loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════════════════
          SECTION I: FINAL CTA & HONEST FOOTER (P0)
          ═════════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
              Ready to Explore
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
              Experience the walk-up outpatient intake assistant
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              Try the patient intake kiosk with fictitious details or explore the clinical review queue with pre-loaded synthetic cases.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/kiosk"
              id="final-cta-kiosk-btn"
              className="px-8 py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-sm shadow-md transition inline-flex items-center gap-2 min-h-[48px]"
            >
              <span>Start patient intake</span>
              <ArrowRight className="w-4 h-4 text-[var(--btn-main-text)]" />
            </Link>
            <Link
              href="/dashboard?sample=true"
              id="final-cta-sample-btn"
              className="px-6 py-4 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] hover:bg-[var(--bg-card)] text-[var(--text-heading)] font-bold text-sm shadow-xs transition inline-flex items-center gap-2 min-h-[48px]"
            >
              <Eye className="w-4 h-4 text-[var(--btn-main)]" />
              <span>View example staff dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--header-bg)] py-12 px-4 sm:px-6 text-xs text-[var(--header-text-muted)] space-y-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6 border-b border-[var(--border-color)]/60 pb-8 text-xs text-[var(--header-text)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[var(--header-text)]">
              MediKiosk
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/kiosk" className="hover:text-[#4FD1C5] transition">Patient Intake</Link>
            <Link href="/dashboard?sample=true" className="hover:text-[#4FD1C5] transition">Sample Dashboard</Link>
            <Link href="/login" className="hover:text-[#4FD1C5] transition">Staff Sign In</Link>
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4FD1C5] hover:underline inline-flex items-center gap-1"
            >
              <span>Feedback Form</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-3xs">
          <p className="text-[var(--header-text-muted)]">
            MediKiosk is an outpatient intake preparation tool. <strong>Not a diagnostic system.</strong> Does not certify ABDM/HIPAA compliance or emergency triage.
          </p>
          <p className="text-[var(--header-text-muted)]">
            Visual credits: Open Peeps (Pablo Stanley, CC0) • Skiper UI (@gurvinder-singh02) • CodePen (Szenia Zadvornykh) • GSAP Standard License.
          </p>
        </div>
      </footer>

    </div>
  );
}