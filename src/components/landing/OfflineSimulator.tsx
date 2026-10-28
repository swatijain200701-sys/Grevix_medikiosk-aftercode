"use client";

import React, { useState } from "react";
import { 
  Wifi, WifiOff, Check, RefreshCw, AlertTriangle, 
  HardDrive, Server, ShieldCheck, ArrowRight, Play 
} from "lucide-react";

type SimState = "saved_locally" | "waiting" | "sending" | "received" | "retry_needed";

interface StateStep {
  id: SimState;
  label: string;
  badgeText: string;
  description: string;
  technicalNote: string;
}

const SIM_STEPS: StateStep[] = [
  {
    id: "saved_locally",
    label: "Terminal Saved",
    badgeText: "Saved on this device",
    description: "Patient answers and OCR results are immediately stored in AES-GCM encrypted local client memory.",
    technicalNote: "IndexedDB active draft with sessionStorage AES-256-GCM key. Survives accidental refresh or kiosk reload.",
  },
  {
    id: "waiting",
    label: "Queued Offline",
    badgeText: "Saved on this device. Waiting to send. (Queued Offline)",
    description: "When internet drops, the intake is preserved in the persistent background sync queue with dedicated device queue encryption.",
    technicalNote: "Separated from active session key. Next walk-up patient cannot read this intake, but device syncs automatically upon reconnect.",
  },
  {
    id: "sending",
    label: "Transmitting",
    badgeText: "Sending to server...",
    description: "Terminal detects hospital network connection and attempts idempotent HTTP sync via /api/sync.",
    technicalNote: "UUIDv4 case reference + monotonic revision counter ensures zero duplicates even if network drops during transmission.",
  },
  {
    id: "received",
    label: "Server Confirmed",
    badgeText: "Received by server",
    description: "Hospital backend commits the case to durable storage. Terminal receives confirmation and updates UI in real time.",
    technicalNote: "Marked as server-confirmed in local sync log. Clinical OPD dashboard receives immediate websocket/polling notification.",
  },
  {
    id: "retry_needed",
    label: "Retry Safe",
    badgeText: "Could not send — retry available",
    description: "If the server is temporarily unreachable or times out, the local record is preserved with full retry capability.",
    technicalNote: "Exponential backoff retry with manual retry button. Never drops patient intake data.",
  },
];

export function OfflineSimulator() {
  const [activeStep, setActiveStep] = useState<SimState>("saved_locally");

  const currentStepData = SIM_STEPS.find((s) => s.id === activeStep) || SIM_STEPS[0];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md p-6 sm:p-8 space-y-6 text-[var(--text-heading)]">
      {/* Header and Honest Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[var(--btn-main)]" />
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-heading)]">
              Interactive Offline Lifecycle Explainer
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            How MediKiosk protects outpatient data through unpredictable clinic network drops.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-3xs font-mono font-bold uppercase bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[var(--border-color)]">
          Illustrative Simulation • Isolated State
        </span>
      </div>

      {/* State Machine Step Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {SIM_STEPS.map((step) => {
          const isSelected = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStep(step.id)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex flex-col justify-between gap-2 min-h-[56px] ${
                isSelected
                  ? "bg-[var(--btn-main)] text-[var(--btn-main-text)] border-[var(--btn-main)] shadow-sm"
                  : "bg-[var(--bg-panel)]/50 hover:bg-[var(--bg-panel)] text-[var(--text-heading)] border-[var(--border-color)]"
              }`}
            >
              <span className="text-3xs uppercase font-mono tracking-wider opacity-80">
                {step.id === "saved_locally" && "1. Capture"}
                {step.id === "waiting" && "2. Queue"}
                {step.id === "sending" && "3. Sync"}
                {step.id === "received" && "4. Confirmed"}
                {step.id === "retry_needed" && "Edge Case"}
              </span>
              <span className="text-xs font-extrabold leading-tight">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active State Demonstration Preview Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-panel)]/60 border border-[var(--border-color)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Terminal Display State:
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--btn-main)] shadow-2xs font-mono">
            {activeStep === "saved_locally" && <Check className="w-3.5 h-3.5 text-[var(--btn-main)] stroke-[3]" />}
            {activeStep === "waiting" && <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
            {activeStep === "sending" && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--btn-main)]" />}
            {activeStep === "received" && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
            {activeStep === "retry_needed" && <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
            <span>{currentStepData.badgeText}</span>
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--text-heading)] leading-relaxed">
            {currentStepData.description}
          </p>
          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-2xs text-[var(--text-muted)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--btn-main)] shrink-0 mt-0.5" />
            <span>
              <strong>Technical Implementation:</strong> {currentStepData.technicalNote}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-muted)]">
        <span>Click tabs above to simulate lifecycle transitions</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const sequence: SimState[] = ["saved_locally", "waiting", "sending", "received"];
              let idx = 0;
              const timer = setInterval(() => {
                idx++;
                if (idx < sequence.length) {
                  setActiveStep(sequence[idx]);
                } else {
                  clearInterval(timer);
                }
              }, 1200);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] border border-[var(--border-color)] font-bold text-[var(--btn-main)] transition flex items-center gap-1.5 shadow-2xs"
          >
            <Play className="w-3 h-3" />
            <span>Auto-Play Normal Sequence</span>
          </button>
        </div>
      </div>
    </div>
  );
}
