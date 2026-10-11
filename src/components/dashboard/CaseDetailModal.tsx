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
  const [notes, setNotes] = useState<string>("");
  const [triage, setTriage] = useState<string>("routine");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);

  React.useEffect(() => {
    if (caseRecord) {
      setNotes(caseRecord.staffReview.staffNotes || "");
      setTriage(caseRecord.staffReview.triageCategory || "routine");
      setAcknowledged(!!caseRecord.staffReview.acknowledgedAt);
    }
  }, [caseRecord]);

  if (!caseRecord) return null;

  const { snapshot, summary, staffReview, redFlags, revision } = caseRecord;

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
    <div className="fixed inset-0 z-50 bg-[var(--header-bg)]/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[var(--bg-card)] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[var(--border-color)] text-[var(--text-heading)]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--header-bg)] text-[var(--btn-main-text)] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm">
              {snapshot.patient.preferredName ? snapshot.patient.preferredName.charAt(0) : "P"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-[var(--header-text)]">
                  {snapshot.patient.preferredName || "Anonymous Patient"}
                </h2>
                <span className="text-2xs px-2 py-0.5 rounded-md bg-[#122330] text-[#4FD1C5] border border-[var(--border-color)] font-mono font-semibold">
                  Rev {revision}
                </span>
                {acknowledged && (
                  <span className="text-2xs px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-300" /> Reviewed
                  </span>
                )}
              </div>
              <p className="text-2xs text-[var(--header-text-muted)] font-mono">Case ID: {caseRecord.caseId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border-color)] bg-[#122330] hover:bg-[#18303D] text-xs font-semibold text-[var(--header-text)] transition"
            >
              <Printer className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>Print / Export</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--header-text-muted)] hover:text-[var(--header-text)] hover:bg-[#122330] transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div id="printable-intake-area" className="printable-report p-5 sm:p-6 overflow-y-auto space-y-6 text-sm text-[var(--text-heading)]">
          
          {/* Attention Red Flags */}
          {redFlags.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FEE2E2] border-2 border-[#EF4444] text-[#991B1B] space-y-2.5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-[#991B1B] text-sm">
                <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
                <span>Attention Flags Detected ({redFlags.length})</span>
              </div>
              {redFlags.map((rf) => (
                <div key={rf.id} className="text-xs space-y-0.5 border-t border-[#EF4444]/40 pt-2 first:border-0 first:pt-0">
                  <span className="font-bold text-[#991B1B]">{rf.title}</span>
                  <p className="text-[var(--text-heading)] font-medium">{rf.staffMessage}</p>
                  <p className="text-[var(--text-muted)] font-mono text-3xs">Patient entry: &quot;{rf.supportingAnswer}&quot;</p>
                </div>
              ))}
              <p className="text-3xs text-[#7F1D1D] italic pt-1 font-medium">
                * Evaluated by clinical attention rules locally on the kiosk terminal. Prompts staff attention; not a clinical diagnosis or triage protocol.
              </p>
            </div>
          )}

          {/* Clinical Summary Area */}
          <div className="p-5 rounded-2xl bg-[var(--bg-panel)]/60 border border-[var(--border-color)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--btn-main)]" />
                <h3 className="font-extrabold text-sm text-[var(--text-heading)]">
                  Structured Clinical Intake Summary
                </h3>
              </div>
              <span className={`text-2xs font-bold px-2.5 py-0.5 rounded-full ${
                isLiveAi
                  ? "bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[#356B62]/40"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]"
              }`}>
                {isLiveAi ? "AI Verified (Live Provider)" : "Structured Template Intake"}
              </span>
            </div>

            {/* Provider and Model Provenance */}
            <div className="flex flex-wrap items-center gap-4 text-2xs text-[var(--text-muted)] bg-[var(--bg-card)] p-2.5 rounded-xl border border-[var(--border-color)]">
              <span><strong>Provider:</strong> {summary?.provider || "Structured Intake Pipeline"}</span>
              <span><strong>Status:</strong> {summary?.aiStatus || "Pending"}</span>
              <span><strong>Generated:</strong> {summary?.generatedAt ? new Date(summary.generatedAt).toLocaleTimeString() : "Pending"}</span>
            </div>

            {/* Clinical Overview Paragraph */}
            <div className="bg-[var(--bg-card)] p-4 rounded-xl border border-[var(--border-color)] space-y-1">
              <span className="font-bold text-[var(--text-muted)] uppercase tracking-wide text-3xs">Clinical Overview / History of Present Concern</span>
              <p className="text-xs text-[var(--text-heading)] leading-relaxed">
                {summary?.historyOfPresentConcern || snapshot.answers.mainConcern || "Intake received and queued."}
              </p>
            </div>

            {/* Key Clinical Elements Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-1">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wide text-3xs">Reported Symptoms</span>
                <p className="font-bold text-[var(--text-heading)]">
                  {snapshot.answers.reportedSymptoms.join(", ") || "None"}
                </p>
              </div>

              <div className="bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-1">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wide text-3xs">Current Medicines</span>
                {summary?.medicines && summary.medicines.length > 0 ? (
                  <ul className="text-2xs space-y-0.5">
                    {summary.medicines.map((m, i) => (
                      <li key={i}>
                        <span className="font-bold text-[var(--text-heading)]">{m.name}</span>
                        {m.dosage && <span className="text-[var(--text-muted)]"> ({m.dosage})</span>}
                        {m.uncertain && <span className="text-[#92400E] font-bold ml-1">[Uncertain]</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--text-heading)] font-medium">{snapshot.answers.currentMedicines.join(", ") || "None reported"}</p>
                )}
              </div>

              <div className="bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-color)] space-y-1">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wide text-3xs">Allergies</span>
                <p className="font-bold text-[var(--text-heading)]">
                  {summary?.allergies.status === "none_reported" && "No known allergies"}
                  {summary?.allergies.status === "unknown" && "Allergy history unknown / uncertain"}
                  {summary?.allergies.status === "reported" && `Reported: ${summary.allergies.items?.join(", ") || snapshot.answers.allergies.details.join(", ") || "Yes"}`}
                  {(!summary?.allergies.status || summary.allergies.status === "unanswered") && "Unanswered"}
                </p>
              </div>
            </div>

            {/* Document Observations with source excerpts */}
            {summary?.relevantDocumentObservations && summary.relevantDocumentObservations.length > 0 && (
              <div className="bg-[var(--bg-card)] p-3.5 rounded-xl border border-[var(--border-color)] text-xs space-y-1">
                <span className="font-bold text-[var(--text-muted)] uppercase tracking-wide text-3xs">Extracted Document Evidence</span>
                {summary.relevantDocumentObservations.map((obs, i) => (
                  <div key={i} className="text-[var(--text-heading)]">
                    {obs.observation} <span className="text-[var(--btn-main)] font-mono text-3xs">({obs.sourceExcerpt})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing or Conflicting Information Warnings */}
            {summary?.missingOrConflictingInfo && summary.missingOrConflictingInfo.length > 0 && (
              <div className="bg-[#FEF3C7] p-3.5 rounded-xl border border-[#F59E0B] text-xs text-[#92400E] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#92400E]">Noted Gaps / Observations</span>
                {summary.missingOrConflictingInfo.map((info, i) => (
                  <div key={i} className="text-[var(--text-heading)] font-medium">• {info}</div>
                ))}
              </div>
            )}

            {/* Unsupported / Contradictory Claims Flag Banner */}
            {summary?.unsupportedOrContradictoryFlags && summary.unsupportedOrContradictoryFlags.length > 0 && (
              <div className="bg-[#FEE2E2] p-3.5 rounded-xl border border-[#EF4444] text-xs text-[#991B1B] space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-[#991B1B]">Unsupported Claims Flagged</span>
                {summary.unsupportedOrContradictoryFlags.map((flag, i) => (
                  <div key={i} className="text-[var(--text-heading)] font-medium">• {flag}</div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Confirmed Patient Answers */}
          <div className="space-y-3">
            <h4 className="font-bold text-[var(--text-heading)] text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--btn-main)]" />
              <span>Patient-Confirmed Intake Details</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[var(--bg-panel)]/50 p-4 rounded-2xl border border-[var(--border-color)]">
              <div>
                <span className="text-[var(--text-muted)] font-bold">Age / Gender:</span>
                <p className="font-bold text-[var(--text-heading)]">{snapshot.patient.age} Y / {snapshot.patient.gender}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-bold">Entry Mode:</span>
                <p className="font-bold text-[var(--text-heading)]">
                  {snapshot.patient.assistedEntry.isAssisted
                    ? `Assisted by ${snapshot.patient.assistedEntry.enteredBy}`
                    : "Self intake"}
                </p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-bold">Previous Medical Care:</span>
                <p className="text-[var(--text-heading)]">{snapshot.answers.relevantPreviousCare}</p>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-bold">Questions for Clinician:</span>
                <p className="text-[var(--text-heading)]">{snapshot.answers.questionsForClinician}</p>
              </div>
            </div>
          </div>

          {/* Staff Review, Triage Category & Notes */}
          <div className="p-5 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[var(--text-heading)] text-sm">
                <Edit3 className="w-4 h-4 text-[var(--btn-main)]" />
                <span>Staff Review & Triage Notes</span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-[var(--text-heading)]">Category:</label>
                <select
                  value={triage}
                  onChange={(e) => setTriage(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-[var(--border-color)] font-bold text-[var(--text-heading)] bg-[var(--bg-card)] focus:border-[#356B62] outline-none"
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
              className="w-full text-xs p-3.5 rounded-xl border border-[var(--border-color)] text-[var(--text-heading)] placeholder-[#53665D] bg-[var(--bg-card)] focus:border-[#356B62] focus:ring-1 focus:ring-[#356B62]/20 outline-none transition"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                id="save-notes-btn"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-xs font-bold text-[var(--text-heading)] transition min-h-[44px]"
              >
                Save Notes Only
              </button>
              <button
                type="button"
                id="acknowledge-summary-btn"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] text-xs font-bold transition shadow-sm min-h-[44px]"
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