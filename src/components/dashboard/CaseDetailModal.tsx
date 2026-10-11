'use client';
import React, { useState } from 'react';
import { 
  X, Printer, CheckCircle, AlertTriangle, FileText, User, 
  Clock, ShieldAlert, Sparkles, Check, Edit3 
} from 'lucide-react';
import { FullCaseRecord } from '@/lib/db/server-db';

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
  const [notes, setNotes] = useState<string>(staffReview.staffNotes || '');
  const [triage, setTriage] = useState<string>(staffReview.triageCategory || 'routine');
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg">
              {snapshot.patient.preferredName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-[#0B1D3A]">{snapshot.patient.preferredName}</h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-mono">
                  Rev {revision}
                </span>
                {acknowledged && (
                  <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Reviewed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono">ID: {caseRecord.caseId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Export
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div id="printable-intake-area" className="p-5 overflow-y-auto space-y-6 text-sm text-slate-800">
          {/* Attention Red Flags */}
          {redFlags.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Attention Flags Detected ({redFlags.length})
              </div>
              {redFlags.map(rf => (
                <div key={rf.id} className="text-xs space-y-0.5 border-t border-amber-200/70 pt-1.5 first:border-0 first:pt-0">
                  <span className="font-bold text-amber-900">{rf.title}</span>
                  <p className="text-amber-800">{rf.staffMessage}</p>
                  <p className="text-amber-700 font-mono text-3xs">Patient quote: &quot;{rf.supportingAnswer}&quot;</p>
                </div>
              ))}
              <p className="text-3xs text-amber-700 italic pt-1">
                * Demonstration-only attention trigger. Requires clinical triage evaluation.
              </p>
            </div>
          )}

          {/* Structured AI Clinical Summary */}
          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-700" />
                <h3 className="font-bold text-teal-950 text-base">Structured Clinical Intake Summary</h3>
              </div>
              <span className={`text-2xs font-bold px-2 py-0.5 rounded-md ${
                summary?.aiStatus === 'generated'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {summary?.aiStatus === 'generated' ? `AI Verified (${summary.provider})` : 'AI Summary Pending / Structured Template'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-3xs">Main Concern</span>
                <p className="font-semibold text-slate-900 text-sm">{summary?.mainConcern || snapshot.answers.mainConcern}</p>
                <p className="text-slate-600">{summary?.historyOfPresentConcern}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-3xs">Reported Conditions</span>
                {summary?.reportedConditions && summary.reportedConditions.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                    {summary.reportedConditions.map((c, i) => (
                      <li key={i}>
                        <span className="font-medium">{c.condition}</span>
                        <span className="text-slate-400 text-3xs ml-1">(ref: {c.sourceExcerpt})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">None reported</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-3xs">Current Medicines</span>
                {summary?.medicines && summary.medicines.length > 0 ? (
                  <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                    {summary.medicines.map((m, i) => (
                      <li key={i}>
                        <span className="font-medium">{m.name}</span>
                        {m.dosage && <span className="text-slate-600"> ({m.dosage})</span>}
                        {m.uncertain && <span className="text-amber-700 font-semibold ml-1">[Uncertain]</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">{snapshot.answers.currentMedicines.join(', ') || 'None reported'}</p>
                )}
              </div>

              <div className="bg-white p-3 rounded-xl border border-teal-100 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-3xs">Allergies</span>
                <p className="font-semibold text-slate-900">
                  {summary?.allergies.status === 'none_reported' && 'None reported'}
                  {summary?.allergies.status === 'unknown' && 'Unknown / Not sure'}
                  {summary?.allergies.status === 'reported' && `Reported: ${summary.allergies.items?.join(', ') || 'Yes'}`}
                </p>
              </div>
            </div>

            {/* Document Observations */}
            {summary?.relevantDocumentObservations && summary.relevantDocumentObservations.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-teal-100 text-xs space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wide text-3xs">Relevant Document Observations</span>
                {summary.relevantDocumentObservations.map((obs, i) => (
                  <div key={i} className="text-slate-800">
                    • {obs.observation} <span className="text-slate-400">({obs.sourceExcerpt})</span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing or Conflicting Information */}
            {summary?.missingOrConflictingInfo && summary.missingOrConflictingInfo.length > 0 && (
              <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-amber-900">Missing or Conflicting Information</span>
                {summary.missingOrConflictingInfo.map((info, i) => (
                  <div key={i}>• {info}</div>
                ))}
              </div>
            )}

            {/* Hallucination / Unsupported Claims Flag Banner */}
            {summary?.unsupportedOrContradictoryFlags && summary.unsupportedOrContradictoryFlags.length > 0 && (
              <div className="bg-red-50 p-3 rounded-xl border border-red-300 text-xs text-red-900 space-y-1">
                <span className="font-bold uppercase tracking-wide text-3xs text-red-800">Unsupported AI Extrapolations Flagged</span>
                {summary.unsupportedOrContradictoryFlags.map((flag, i) => (
                  <div key={i}>⚠️ {flag}</div>
                ))}
              </div>
            )}
          </div>

          {/* Raw Confirmed Answers & Provenance */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              Patient-Confirmed Intake Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium">Age / Gender:</span>
                <p className="font-semibold text-slate-900">{snapshot.patient.age} / {snapshot.patient.gender}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Entry Mode:</span>
                <p className="font-semibold text-slate-900">
                  {snapshot.patient.assistedEntry.isAssisted ? `Assisted by ${snapshot.patient.assistedEntry.enteredBy}` : 'Self intake'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Previous Care:</span>
                <p className="text-slate-900">{snapshot.answers.relevantPreviousCare}</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Questions for Clinician:</span>
                <p className="text-slate-900">{snapshot.answers.questionsForClinician}</p>
              </div>
            </div>
          </div>

          {/* Staff Review, Triage Category & Notes */}
          <div className="p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Edit3 className="w-4 h-4 text-teal-600" />
                Staff Review & Triage Notes
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Category:</label>
                <select
                  value={triage}
                  onChange={e => setTriage(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-slate-300 font-semibold"
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
              onChange={e => setNotes(e.target.value)}
              placeholder="Add doctor or triage nursing notes here..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-teal-600 focus:outline-hidden"
            />

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                id="save-notes-btn"
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              >
                Save Notes Only
              </button>
              <button
                type="button"
                id="acknowledge-summary-btn"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
              >
                <CheckCircle className="w-4 h-4" />
                {acknowledged ? 'Update & Re-Acknowledge' : 'Acknowledge Summary'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};