"use client";

import React, { useState } from "react";
import { 
  X, Printer, CheckCircle, AlertTriangle, FileText, User, 
  Clock, ShieldAlert, Sparkles, Check, Edit3, ShieldCheck 
} from "lucide-react";
import { FullCaseRecord } from "@/lib/db/server-db";

interface CaseDetailModalProps {
  caseRecord: FullCaseRecord | null;
  onClose: () => void;
  onSaveReview: (caseId: string, notes: string, triage: string, ack: boolean) => Promise<void>;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  caseRecord,
  onClose,
  onSaveReview,
}) => {
  if (!caseRecord) return null;

  const { snapshot, summary, staffReview, redFlags, revision } = caseRecord;
  const [notes, setNotes] = useState<string>(staffReview.staffNotes || "");
  const [triage, setTriage] = useState<string>(staffReview.triageCategory || "routine");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<boolean>(!!staffReview.acknowledgedAt);

  const handleSave = async (markAck: boolean) => {
    setIsSaving(true);
    try {
      await onSaveReview(caseRecord.caseId, notes, triage, markAck);
      if (markAck) setAcknowledged(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isLiveAi = summary && summary.aiStatus === "generated" && !summary.provider.toLowerCase().includes("mock");

  return (
    <div className="fixed inset-0 z-50 bg-[#17343A]/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#DCE7E4]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE7E4] flex items-center justify-between bg-[#F7FAF9] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
              {snapshot.patient.preferredName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#17343A]">
                  {snapshot.patient.preferredName}
                </h2>
                <span className="text-2xs px-2 py-0.5 rounded-md bg-[#E8F3EF] text-[#0F766E] font-mono font-semibold">
                  Rev {revision}
                </span>
                {acknowledged && (
                  <span className="text-2xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600" /> Reviewed
                  </span>
                )}
              </div>
              <p className="text-2xs text-[#52656B] font-mono">Case ID: {caseRecord.caseId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DCE7E4] bg-white hover:bg-[#E8F3EF] text-xs font-semibold text-[#17343A] transition shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#52656B] hover:text-[#17343A] hover:bg-[#DCE7E4]/50 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div id="printable-intake-area" className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-[#334155]">
          
          {/* Attention Red Flags: kept distinct from AI summary status */}
          {redFlags.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FEF3C7] border border-amber-300 text-[#92400E] space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-[#92400E] text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Attention Flags Detected ({redFlags.length})</span>
              </div>
              {redFlags.map((rf) => (
                <div key={rf.id} className="text-xs space-y-0.5 border-t border-amber-200 pt-2 first:border-0 first:pt-0">
                  <span className="font-bold text-[#92400E]">{rf.title}</span>
                  <p className="text-[#92400E]">{rf.staffMessage}</p>
                  <p className="text-amber-800 font-mono text-3xs">Patient confirmation: &quot;{rf.supportingAnswer}&quot;</p>
                </div>
              ))}
              <p className="text-3xs text-amber-800 italic pt-1">
                * Evaluated by deterministic clinical rules locally on the kiosk terminal. Not an AI diagnosis.
              </p>
            </div>
          )}

          {/* AI Clinical Summary Area */}
          <div className="p-5 rounded-2xl bg-[#E8F3EF]/60 border border-[#0F766E]/20 space-y-4">
            <div className="flex items-center justify-between border-b border-[#0F766E]/15 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0F766E]" />
                <h3 className="font-extrabold text-sm text-[#17343A]">
                  AI Structured Clinical Synthesis
                </h3>
              </div>
              <span className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full ${
                isLiveAi
                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                  : "bg-amber-100 text-[#92400E] border border-amber-300"
              }`}>
                {isLiveAi ? "AI Verified (Live Provider)" : "Local Heuristic Pipeline (Fallback)"}
              </span>
            </div>

            {/* Provider and Model Provenance (Honest Prototype Status) */}
            <div className="flex flex-wrap items-center gap-4 text-2xs text-[#52656B] bg-white p-2.5 rounded-xl border border-[#DCE7E4]">
              <span><strong>Provider:</strong> {summary?.provider || "Local Heuristic"}</span>
              <span><strong>Status:</strong> {summary?.aiStatus || "Pending"}</span>
              <span><strong>Generated:</strong> {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleTimeString() : "Pending"}</span>
            </div>

            {/* Clinical Overview Paragraph */}
            <div className="bg-white p-3.5 rounded-xl border border-[#DCE7E4] space-y-1">
              <span className="font-bold text-[#17343A] uppercase tracking-wide text-3xs">Clinical Overview / History of Present Concern</span>
              <p className="text-xs text-[#334155] leading-relaxed">
                {summary?.historyOfPresentConcern || snapshot.answers.mainConcern || "Intake received and queued. Synthesis pending or unconfigured."}
              </p>
            </div>

            {/* Key Clinical Elements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-[#DCE7E4] space-y-1">
                <span className="font-bold text-[#52656B] uppercase tracking-wide text-3xs">Reported Symptoms</span>
                <p className="font-semibold text-[#17343A]">
                  {snapshot.answers.reportedSymptoms.join(", ") || "None"}
                </p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#DCE7E4] space-y-1">
                <span className="font-bold text-[#52656B] uppercase tracking-wide text-3xs">Current Medicines</span>
                {summary?.medicines && summary.medicines.length > 0 ? (
                  <ul className="text-2xs space-y-0.5">
                    {summary.medicines.map((m, i) => (
                      <li key={i}>
                        <span className="font-medium text-[#17343A]">{m.name}</span>
                        {m.dosage && <span className="text-[#52656B]"> ({m.dosage})</span>}
                        {m.uncertain && <span className="text-amber-800 font-semibold ml-1">[Uncertain]</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#52656B]">{snapshot.answers.currentMedicines.join(", ") || "None reported"}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#DCE7E4] space-y-1">
                <span className="font-bold text-[#52656B] uppercase tracking-wide text-3xs">Allergies</span>
                <p className="font-semibold text-[#17343A]">
                  {summary?.allergies.status === "none_reported" && "None reported"}
                  {summary?.allergies.status === "unknown" && "Unknown / Not sure"}
                  {summary?.allergies.status === "reported" && `Reported: ${summary.allergies.items?.join(", ") || snapshot.answers.allergies.details.join(", ") || "Yes"}`}
                </p>
              </div>
            </div>

            {/* Document Observations with source excerpts */}
            {summary?.relevantDocumentObservations && summary.relevantDocumentObservations.length > 0 && (
              <div className="bg-white p-3.5 rounded-xl border border-[#DCE7E4] text-xs space-y-1">
                <span className="font-bold text-[#52656B] uppercase tracking-wide text-3xs">Extracted Document Evidence</span>
                {summary.relevantDocumentObservations.map((obs, i) => (
                  <div key={i} className="text-[#334155]">
                    • {obs.observation} <span className="text-[#52656B] font-mono text-3xs">({obs.sourceExcerpt})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing or Conflicting Information Warnings */}
            {summary?.missingOrConflictingInfo && summary.missingOrConflictingInfo.length > 0 && (
              <div className="bg-[#FEF3C7] p-3.5 rounded-xl border border-amber-300 text-xs text-[#92400E] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#92400E]">Missing or Conflicting Information</span>
                {summary.missingOrConflictingInfo.map((info, i) => (
                  <div key={i}>• {info}</div>
                ))}
              </div>
            )}

            {/* Unsupported / Contradictory Claims Flag Banner */}
            {summary?.unsupportedOrContradictoryFlags && summary.unsupportedOrContradictoryFlags.length > 0 && (
              <div className="bg-[#FEE2E2] p-3.5 rounded-xl border border-red-300 text-xs text-[#991B1B] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#991B1B]">Unsupported Claims Flagged</span>
                {summary.unsupportedOrContradictoryFlags.map((flag, i) => (
                  <div key={i}>⚠️ {flag}</div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Confirmed Patient Answers & Provenance */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#17343A] text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0F766E]" />
              <span>Patient-Confirmed Intake Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F7FAF9] p-4 rounded-2xl border border-[#DCE7E4]">
              <div>
                <span className="text-[#52656B] font-medium">Age / Gender:</span>
                <p className="font-semibold text-[#17343A]">{snapshot.patient.age} Y / {snapshot.patient.gender}</p>
              </div>
              <div>
                <span className="text-[#52656B] font-medium">Entry Mode:</span>
                <p className="font-semibold text-[#17343A]">
                  {snapshot.patient.assistedEntry.isAssisted
                    ? `Assisted by ${snapshot.patient.assistedEntry.enteredBy}`
                    : "Self intake"}
                </p>
              </div>
              <div>
                <span className="text-[#52656B] font-medium">Previous Medical Care:</span>
                <p className="text-[#334155]">{snapshot.answers.relevantPreviousCare}</p>
              </div>
              <div>
                <span className="text-[#52656B] font-medium">Questions for Clinician:</span>
                <p className="text-[#334155]">{snapshot.answers.questionsForClinician}</p>
              </div>
            </div>
          </div>

          {/* Staff Review, Triage Category & Notes */}
          <div className="p-5 rounded-2xl bg-white border-2 border-[#DCE7E4] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#17343A] text-sm">
                <Edit3 className="w-4 h-4 text-[#0F766E]" />
                <span>Staff Review & Triage Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#52656B]">Category:</label>
                <select
                  value={triage}
                  onChange={(e) => setTriage(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-[#DCE7E4] font-semibold text-[#17343A] bg-white focus:border-[#0F766E] outline-none"
                >
                  <option value="routine">Routine</option>
                  <option value="priority">Priority</option>
                  <option value="attention_flagged">Attention Flagged</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              id="staff-notes-input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add doctor or triage nursing notes here..."
              className="w-full text-xs p-3 rounded-xl border border-[#DCE7E4] text-[#17343A] placeholder-[#52656B]/60 focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E]/20 outline-none transition"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                id="save-notes-btn"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-[#DCE7E4] hover:bg-[#F7FAF9] text-xs font-semibold text-[#52656B] transition"
              >
                Save Notes Only
              </button>
              <button
                type="button"
                id="acknowledge-summary-btn"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition shadow-2xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{acknowledged ? "Update & Re-Acknowledge" : "Acknowledge Summary"}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CaseDetailModal;
