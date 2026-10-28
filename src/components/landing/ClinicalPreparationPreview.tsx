"use client";

import React, { useState } from "react";
import { 
  FileText, Sparkles, ShieldAlert, CheckCircle2, User, 
  Stethoscope, Clock, ShieldCheck, ArrowRight, Eye, AlertTriangle 
} from "lucide-react";

interface ProvenanceItem {
  id: string;
  field: string;
  value: string;
  provenance: "patient_entered" | "ocr_extracted" | "rule_flag" | "template_summary" | "clinician_note";
  provenanceLabel: string;
  provenanceColor: string;
  detail: string;
}

const SYNTHETIC_PROVENANCE_ITEMS: ProvenanceItem[] = [
  {
    id: "item-1",
    field: "Chief Complaint",
    value: "Shortness of breath on exertion and mild chest tightness when climbing stairs for 3 days.",
    provenance: "patient_entered",
    provenanceLabel: "Patient-Entered (Voice/Touch)",
    provenanceColor: "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
    detail: "Patient spoke in Hindi/English, inspected speech transcript, and explicitly clicked 'Confirm Transcript'.",
  },
  {
    id: "item-2",
    field: "Clinical Attention Prompt",
    value: "Shortness of breath + chest tightness reported (Category: Cardiovascular / Respiratory).",
    provenance: "rule_flag",
    provenanceLabel: "Local Rule-Based Prompt",
    provenanceColor: "bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/30",
    detail: "Evaluated locally by regex keyword safety rules on kiosk. Prompts triage staff attention; not a diagnostic claim.",
  },
  {
    id: "item-3",
    field: "Current Medications",
    value: "Amlodipine 5mg once daily; Metformin 500mg twice daily with meals.",
    provenance: "ocr_extracted",
    provenanceLabel: "OCR Extracted & Confirmed",
    provenanceColor: "bg-blue-500/10 text-blue-800 dark:text-blue-300 border-blue-500/30",
    detail: "Extracted via client-side Tesseract.js from uploaded prescription photo. Reviewed and verified by patient.",
  },
  {
    id: "item-4",
    field: "Known Allergies",
    value: "No known allergies reported (Patient explicitly answered: 'No known allergies').",
    provenance: "patient_entered",
    provenanceLabel: "Patient-Entered (Tri-State)",
    provenanceColor: "bg-teal-500/10 text-teal-800 dark:text-teal-300 border-teal-500/30",
    detail: "Tri-state selection prevents assuming 'missing data' means 'no allergy'.",
  },
  {
    id: "item-5",
    field: "Intake Organization",
    value: "Structured history synthesized from confirmed fields. Ready for OPD consultation.",
    provenance: "template_summary",
    provenanceLabel: "Structured Template Intake",
    provenanceColor: "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30",
    detail: "Deterministic template summarizer with verifiable field references. Live LLM summary activates only when API key is configured.",
  },
];

export function ClinicalPreparationPreview() {
  const [selectedId, setSelectedId] = useState<string>("item-1");

  const selectedItem = SYNTHETIC_PROVENANCE_ITEMS.find((i) => i.id === selectedId) || SYNTHETIC_PROVENANCE_ITEMS[0];

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-md p-6 sm:p-8 space-y-6 text-[var(--text-heading)]">
      {/* Header and Honest Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-[var(--btn-main)]" />
            <h3 className="font-extrabold text-base sm:text-lg text-[var(--text-heading)]">
              Clinical Preparation with Verifiable Provenance
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Every clinical field clearly labels where it came from so doctors never guess data origins.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-3xs font-mono font-bold uppercase bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[var(--border-color)]">
          Synthetic Example • Not a Diagnosis
        </span>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Interactive Field List */}
        <div className="md:col-span-7 space-y-2.5">
          {SYNTHETIC_PROVENANCE_ITEMS.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                  isSelected
                    ? "bg-[var(--bg-panel)] border-[var(--btn-main)] shadow-xs"
                    : "bg-[var(--bg-card)] hover:bg-[var(--bg-panel)]/50 border-[var(--border-color)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[var(--text-heading)]">{item.field}</span>
                  <span
                    className={`text-3xs font-mono font-bold px-2 py-0.5 rounded-full border ${item.provenanceColor}`}
                  >
                    {item.provenanceLabel}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {item.value}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Detailed Provenance Inspector */}
        <div className="md:col-span-5 rounded-2xl bg-[var(--bg-panel)]/60 border border-[var(--border-color)] p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
              <span className="text-3xs font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Field Inspection
              </span>
              <span
                className={`text-3xs font-mono font-bold px-2 py-0.5 rounded-full border ${selectedItem.provenanceColor}`}
              >
                {selectedItem.provenanceLabel}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-3xs font-bold uppercase tracking-wider text-[var(--btn-main)]">
                {selectedItem.field}
              </span>
              <p className="text-xs font-semibold text-[var(--text-heading)] bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)] leading-relaxed">
                {selectedItem.value}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-3xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Audit Trail &amp; Verification
              </span>
              <p className="text-2xs text-[var(--text-muted)] leading-relaxed">
                {selectedItem.detail}
              </p>
            </div>
          </div>

          {/* Safety disclaimer banner */}
          <div className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-3xs text-[var(--text-muted)] flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Clinical Guardrail:</strong> Summaries organize patient-confirmed facts for human clinical review. MediKiosk never provides diagnostic decisions or prescription suggestions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
