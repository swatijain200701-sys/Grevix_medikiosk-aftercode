"use client";

import React, { useState } from "react";
import { 
  UserCheck, ShieldCheck, HeartPulse, ListChecks, Pill, 
  AlertCircle, Camera, CheckCircle2, ArrowRight, ShieldAlert,
  Languages, Lock, FileText, Check 
} from "lucide-react";

export interface JourneyStep {
  stepNumber: number;
  title: string;
  badge: string;
  description: string;
  keyFeature: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const EIGHT_STEPS: JourneyStep[] = [
  {
    stepNumber: 1,
    title: "Registration & Language Choice",
    badge: "Step 1 of 8",
    description: "Enter your preferred name and age range. Seamlessly toggle between English and Hindi guidance at any moment. Choose self-intake or flag caregiver/staff assistance.",
    keyFeature: "Assisted-intake tagging • Optional ABHA sandbox mock",
    icon: Languages,
  },
  {
    stepNumber: 2,
    title: "Plain-Language Consent",
    badge: "Step 2 of 8",
    description: "Review clear, plain-language consent statements before any data is collected. Checkboxes begin completely unchecked—patient autonomy is strictly respected.",
    keyFeature: "Unpreselected opt-ins • Local storage consent required for kiosk flow",
    icon: ShieldCheck,
  },
  {
    stepNumber: 3,
    title: "Main Concern & Attention Prompts",
    badge: "Step 3 of 8",
    description: "Describe your chief concern and onset timeline in your own words via touch or voice dictation. Voice transcripts require patient confirmation before saving.",
    keyFeature: "Local red-flag rules engine for urgent chest/respiratory symptoms",
    icon: HeartPulse,
  },
  {
    stepNumber: 4,
    title: "Reported Symptoms",
    badge: "Step 4 of 8",
    description: "Select from common presenting symptoms tailored to outpatient triage or type in specific concerns. All selections are clearly displayed for verification.",
    keyFeature: "Custom symptom addition • Multi-select touch targets (≥48px)",
    icon: ListChecks,
  },
  {
    stepNumber: 5,
    title: "Existing Conditions & Medicines",
    badge: "Step 5 of 8",
    description: "Share known chronic conditions (diabetes, hypertension) and regular medications, including prescription tablets, injections, or AYUSH remedies.",
    keyFeature: "Differentiates 'None / Unknown' from unasked fields",
    icon: Pill,
  },
  {
    stepNumber: 6,
    title: "Known Allergies & Doctor Questions",
    badge: "Step 6 of 8",
    description: "State any known drug or food allergies using an honest tri-state selector: 'No known allergies', 'I do not know', or 'I have an allergy'. Add specific questions for the physician.",
    keyFeature: "Zero assumptions: missing data is never logged as 'no allergies'",
    icon: AlertCircle,
  },
  {
    stepNumber: 7,
    title: "Document Upload & OCR Verification",
    badge: "Step 7 of 8",
    description: "Capture or upload previous doctor prescriptions or lab reports. Client-side OCR extracts text locally, which the patient verifies and edits before submission.",
    keyFeature: "Mandatory text review • Eliminates unverified OCR hallucination",
    icon: Camera,
  },
  {
    stepNumber: 8,
    title: "Review, Encrypted Queue & Staff Handoff",
    badge: "Step 8 of 8",
    description: "Inspect a comprehensive read-back of all your responses. Once confirmed, intake is encrypted with AES-GCM 256-bit at rest, queued offline if needed, and synced idempotently.",
    keyFeature: "One-click session wipe resets kiosk to clean state & light theme",
    icon: CheckCircle2,
  },
];

export function EightStepJourney() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const current = EIGHT_STEPS.find((s) => s.stepNumber === activeStep) || EIGHT_STEPS[0];
  const CurrentIcon = current.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--btn-main)] bg-[var(--bg-panel)] px-3 py-1 rounded-full border border-[var(--border-color)]">
          Real Outpatient Journey
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          How MediKiosk works in eight structured steps
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
          Reflecting the exact clinical flow verified in code—from registration and informed consent to encrypted transmission and staff handoff.
        </p>
      </div>

      {/* Interactive 8-Step Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 8 Step Milestone Buttons */}
        <div className="lg:col-span-5 space-y-2">
          {EIGHT_STEPS.map((s) => {
            const isSelected = activeStep === s.stepNumber;
            const StepIcon = s.icon;
            return (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => setActiveStep(s.stepNumber)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 min-h-[56px] ${
                  isSelected
                    ? "bg-[var(--btn-main)] text-[var(--btn-main-text)] border-[var(--btn-main)] shadow-sm"
                    : "bg-[var(--bg-card)] hover:bg-[var(--bg-panel)]/60 text-[var(--text-heading)] border-[var(--border-color)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[var(--bg-panel)] text-[var(--btn-main)]"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <span
                      className={`text-3xs font-mono font-bold uppercase tracking-wider block ${
                        isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {s.badge}
                    </span>
                    <span className="text-xs sm:text-sm font-extrabold leading-tight block">
                      {s.title}
                    </span>
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? "translate-x-1 text-white" : "text-[var(--text-muted)] opacity-40"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Step Deep Dive Card */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-color)] shadow-lg space-y-6 text-[var(--text-heading)]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-panel)] text-[var(--btn-main)] flex items-center justify-center shadow-xs">
                  <CurrentIcon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-[var(--btn-main)] tracking-wider block">
                    Intake Step {current.stepNumber} of 8
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--text-heading)] tracking-tight">
                    {current.title}
                  </h3>
                </div>
              </div>
              <span className="hidden sm:inline-block text-3xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[var(--border-color)]">
                Kiosk Terminal Verified
              </span>
            </div>

            <div className="space-y-4">
              <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                {current.description}
              </p>

              {/* Safeguard callout */}
              <div className="p-4 rounded-2xl bg-[var(--bg-panel)]/70 border border-[var(--border-color)] space-y-2">
                <span className="text-3xs font-bold uppercase tracking-wider text-[var(--btn-main)] block">
                  Built-In Safety &amp; Integrity Guardrail:
                </span>
                <p className="text-xs font-semibold text-[var(--text-heading)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
                  <span>{current.keyFeature}</span>
                </p>
              </div>

              {/* Step context breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-2 text-2xs text-[var(--text-muted)]">
                <div className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1">
                  <span className="font-bold text-[var(--text-heading)] block">Supported Inputs:</span>
                  <span>Touch screen, Large buttons, High contrast</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-main)]/50 border border-[var(--border-color)] space-y-1">
                  <span className="font-bold text-[var(--text-heading)] block">Resilience:</span>
                  <span>Local terminal persistence; zero cloud dependency</span>
                </div>
              </div>
            </div>

            {/* Quick jump to start intake */}
            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Ready to experience the 8-step intake flow?
              </span>
              <a
                href="/kiosk"
                className="px-4 py-2.5 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-xs shadow-sm transition inline-flex items-center gap-1.5"
              >
                <span>Launch Kiosk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
