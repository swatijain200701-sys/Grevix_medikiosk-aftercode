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
    <div className="fixed inset-0 z-50 bg-[#08121B]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#122330] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#294350]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#294350] flex items-center justify-between bg-[#0C1924] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#50D6C5] text-[#062820] flex items-center justify-center font-bold text-lg shadow-sm">
              {snapshot.patient.preferredName ? snapshot.patient.preferredName.charAt(0) : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[#F1F6F8]">
                  {snapshot.patient.preferredName || "Anonymous Patient"}
                </h2>
                <span className="text-2xs px-2 py-0.5 rounded-md bg-[#18303D] text-[#50D6C5] border border-[#294350] font-mono font-semibold">
                  Rev {revision}
                </span>
                {acknowledged && (
                  <span className="text-2xs px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" /> Reviewed
                  </span>
                )}
              </div>
              <p className="text-2xs text-[#91A8B3] font-mono">Case ID: {caseRecord.caseId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-xs font-semibold text-[#F1F6F8] transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#50D6C5]" />
              <span>Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#91A8B3] hover:text-[#F1F6F8] hover:bg-[#18303D] transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body (includes printable class) */}
        <div id="printable-intake-area" className="printable-report p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-[#B6C7CF]">
          
          {/* Attention Red Flags: kept distinct from AI summary status */}
          {redFlags.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#2B1417] border border-[#991B1B] text-[#F87171] space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#F87171] text-sm">
                <ShieldAlert className="w-4 h-4 text-[#F87171]" />
                <span>Attention Flags Detected ({redFlags.length})</span>
              </div>
              {redFlags.map((rf) => (
                <div key={rf.id} className="text-xs space-y-0.5 border-t border-[#991B1B]/40 pt-2 first:border-0 first:pt-0">
                  <span className="font-bold text-[#F87171]">{rf.title}</span>
                  <p className="text-[#F1F6F8]">{rf.staffMessage}</p>
                  <p className="text-[#B6C7CF] font-mono text-3xs">Patient confirmation: &quot;{rf.supportingAnswer}&quot;</p>
                </div>
              ))}
              <p className="text-3xs text-[#91A8B3] italic pt-1">
                * Evaluated by deterministic clinical rules locally on the kiosk terminal. Not an AI diagnosis.
              </p>
            </div>
          )}

          {/* AI Clinical Summary Area */}
          <div className="p-5 rounded-2xl bg-[#18303D]/60 border border-[#294350] space-y-4">
            <div className="flex items-center justify-between border-b border-[#294350] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#50D6C5]" />
                <h3 className="font-extrabold text-sm text-[#F1F6F8]">
                  AI Structured Clinical Synthesis
                </h3>
              </div>
              <span className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full ${
                isLiveAi
                  ? "bg-[#50D6C5]/15 text-[#50D6C5] border border-[#50D6C5]/30"
                  : "bg-[#261B0E] text-[#FBBF24] border border-[#854D0E]"
              }`}>
                {isLiveAi ? "AI Verified (Live Provider)" : "Local Heuristic Pipeline (Fallback)"}
              </span>
            </div>

            {/* Provider and Model Provenance */}
            <div className="flex flex-wrap items-center gap-4 text-2xs text-[#B6C7CF] bg-[#122330] p-2.5 rounded-xl border border-[#294350]">
              <span><strong>Provider:</strong> {summary?.provider || "Local Heuristic"}</span>
              <span><strong>Status:</strong> {summary?.aiStatus || "Pending"}</span>
              <span><strong>Generated:</strong> {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleTimeString() : "Pending"}</span>
            </div>

            {/* Clinical Overview Paragraph */}
            <div className="bg-[#122330] p-4 rounded-xl border border-[#294350] space-y-1">
              <span className="font-bold text-[#F1F6F8] uppercase tracking-wide text-3xs">Clinical Overview / History of Present Concern</span>
              <p className="text-xs text-[#B6C7CF] leading-relaxed">
                {summary?.historyOfPresentConcern || snapshot.answers.mainConcern || "Intake received and queued. Synthesis pending or unconfigured."}
              </p>
            </div>

            {/* Key Clinical Elements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#122330] p-3.5 rounded-xl border border-[#294350] space-y-1">
                <span className="font-bold text-[#91A8B3] uppercase tracking-wide text-3xs">Reported Symptoms</span>
                <p className="font-semibold text-[#F1F6F8]">
                  {snapshot.answers.reportedSymptoms.join(", ") || "None"}
                </p>
              </div>

              <div className="bg-[#122330] p-3.5 rounded-xl border border-[#294350] space-y-1">
                <span className="font-bold text-[#91A8B3] uppercase tracking-wide text-3xs">Current Medicines</span>
                {summary?.medicines && summary.medicines.length > 0 ? (
                  <ul className="text-2xs space-y-0.5">
                    {summary.medicines.map((m, i) => (
                      <li key={i}>
                        <span className="font-medium text-[#F1F6F8]">{m.name}</span>
                        {m.dosage && <span className="text-[#91A8B3]"> ({m.dosage})</span>}
                        {m.uncertain && <span className="text-[#FBBF24] font-semibold ml-1">[Uncertain]</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#B6C7CF]">{snapshot.answers.currentMedicines.join(", ") || "None reported"}</p>
                )}
              </div>

              <div className="bg-[#122330] p-3.5 rounded-xl border border-[#294350] space-y-1">
                <span className="font-bold text-[#91A8B3] uppercase tracking-wide text-3xs">Allergies</span>
                <p className="font-semibold text-[#F1F6F8]">
                  {summary?.allergies.status === "none_reported" && "None reported"}
                  {summary?.allergies.status === "unknown" && "Unknown / Not sure"}
                  {summary?.allergies.status === "reported" && `Reported: ${summary.allergies.items?.join(", ") || snapshot.answers.allergies.details.join(", ") || "Yes"}`}
                </p>
              </div>
            </div>

            {/* Document Observations with source excerpts */}
            {summary?.relevantDocumentObservations && summary.relevantDocumentObservations.length > 0 && (
              <div className="bg-[#122330] p-3.5 rounded-xl border border-[#294350] text-xs space-y-1">
                <span className="font-bold text-[#91A8B3] uppercase tracking-wide text-3xs">Extracted Document Evidence</span>
                {summary.relevantDocumentObservations.map((obs, i) => (
                  <div key={i} className="text-[#B6C7CF]">
                    • {obs.observation} <span className="text-[#50D6C5] font-mono text-3xs">({obs.sourceExcerpt})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing or Conflicting Information Warnings */}
            {summary?.missingOrConflictingInfo && summary.missingOrConflictingInfo.length > 0 && (
              <div className="bg-[#261B0E] p-3.5 rounded-xl border border-[#854D0E] text-xs text-[#FBBF24] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#FBBF24]">Missing or Conflicting Information</span>
                {summary.missingOrConflictingInfo.map((info, i) => (
                  <div key={i} className="text-[#F1F6F8]">• {info}</div>
                ))}
              </div>
            )}

            {/* Unsupported / Contradictory Claims Flag Banner */}
            {summary?.unsupportedOrContradictoryFlags && summary.unsupportedOrContradictoryFlags.length > 0 && (
              <div className="bg-[#2B1417] p-3.5 rounded-xl border border-[#991B1B] text-xs text-[#F87171] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#F87171]">Unsupported Claims Flagged</span>
                {summary.unsupportedOrContradictoryFlags.map((flag, i) => (
                  <div key={i} className="text-[#F1F6F8]">• {flag}</div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Confirmed Patient Answers & Provenance */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#F1F6F8] text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#50D6C5]" />
              <span>Patient-Confirmed Intake Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#18303D]/40 p-4 rounded-2xl border border-[#294350]">
              <div>
                <span className="text-[#91A8B3] font-medium">Age / Gender:</span>
                <p className="font-semibold text-[#F1F6F8]">{snapshot.patient.age} Y / {snapshot.patient.gender}</p>
              </div>
              <div>
                <span className="text-[#91A8B3] font-medium">Entry Mode:</span>
                <p className="font-semibold text-[#F1F6F8]">
                  {snapshot.patient.assistedEntry.isAssisted
                    ? `Assisted by ${snapshot.patient.assistedEntry.enteredBy}`
                    : "Self intake"}
                </p>
              </div>
              <div>
                <span className="text-[#91A8B3] font-medium">Previous Medical Care:</span>
                <p className="text-[#B6C7CF]">{snapshot.answers.relevantPreviousCare}</p>
              </div>
              <div>
                <span className="text-[#91A8B3] font-medium">Questions for Clinician:</span>
                <p className="text-[#B6C7CF]">{snapshot.answers.questionsForClinician}</p>
              </div>
            </div>
          </div>

          {/* Staff Review, Triage Category & Notes */}
          <div className="p-5 rounded-2xl bg-[#18303D] border border-[#294350] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#F1F6F8] text-sm">
                <Edit3 className="w-4 h-4 text-[#50D6C5]" />
                <span>Staff Review & Triage Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#91A8B3]">Category:</label>
                <select
                  value={triage}
                  onChange={(e) => setTriage(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-[#294350] font-semibold text-[#F1F6F8] bg-[#122330] focus:border-[#50D6C5] outline-none"
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
              className="w-full text-xs p-3.5 rounded-xl border border-[#294350] text-[#F1F6F8] placeholder-[#91A8B3] bg-[#122330] focus:border-[#50D6C5] focus:ring-1 focus:ring-[#50D6C5]/20 outline-none transition"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                id="save-notes-btn"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-[#294350] bg-[#122330] hover:bg-[#18303D] text-xs font-semibold text-[#B6C7CF] hover:text-[#F1F6F8] transition min-h-[44px]"
              >
                Save Notes Only
              </button>
              <button
                type="button"
                id="acknowledge-summary-btn"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] text-xs font-bold transition shadow-sm min-h-[44px]"
              >
                <CheckCircle className="w-4 h-4 text-[#062820]" />
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
