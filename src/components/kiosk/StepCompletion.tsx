"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Check } from "lucide-react";

interface StepCompletionProps {
  caseId: string;
  revision: number;
  isOnline: boolean;
  sessionCleared: boolean;
  onFinishAndReset: () => void;
  t: any;
}

export const StepCompletion: React.FC<StepCompletionProps> = ({
  caseId,
  revision,
  isOnline,
  sessionCleared,
  onFinishAndReset,
  t,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#50D6C5]/15 border border-[#50D6C5]/30 text-[#50D6C5] flex items-center justify-center shadow-md">
        <CheckCircle2 className="w-10 h-10 text-[#50D6C5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F1F6F8] tracking-tight">
          {t.finishTitle}
        </h2>
        <p className="text-[#B6C7CF] max-w-md mx-auto text-sm leading-relaxed">
          {t.finishSubtitle}
        </p>
      </div>

      {/* Clinical Reference & Operational States Panel */}
      <div className="p-5 rounded-2xl bg-[#18303D] border border-[#294350] text-xs text-[#B6C7CF] max-w-md w-full text-left space-y-3 shadow-lg">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#294350]">
          <span className="text-[#91A8B3] font-medium">Case Reference:</span>
          <span id="completed-case-id" className="font-mono font-bold text-[#50D6C5] text-sm">
            {caseId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#91A8B3] font-medium">Storage & Persistence:</span>
          <span className="font-semibold text-[#50D6C5] flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#50D6C5]" /> Saved on this device
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#91A8B3] font-medium">Network Status:</span>
          <span id="submission-sync-status" className="font-semibold text-[#50D6C5]">
            {!isOnline ? "Queued Offline — Offline — you can continue" : "Received by the server"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#91A8B3] font-medium">Clinical Triage Queue:</span>
          <span className="font-semibold text-[#B6C7CF]">
            {!isOnline ? "AI summary pending (Waiting to synchronise)" : "Ready for staff review"}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-[#294350]">
          <span className="text-[#91A8B3] font-medium">Intake Monotonic Revision:</span>
          <span className="font-semibold font-mono text-[#F1F6F8]">Rev {revision}</span>
        </div>
      </div>

      {/* Privacy and Reset Action */}
      <div className="pt-2 space-y-3 w-full max-w-md">
        <button
          type="button"
          id="finish-session-btn"
          onClick={onFinishAndReset}
          className="w-full py-4 rounded-xl bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] font-bold text-sm transition shadow-sm min-h-[48px]"
        >
          {t.clearSessionButton}
        </button>
        <p className="text-2xs text-[#91A8B3] leading-snug">
          Next-patient privacy: Clears active session encryption keys and draft memory from this terminal.
        </p>
      </div>

      {sessionCleared && (
        <div
          id="session-cleared-alert"
          className="p-3.5 bg-[#122330] border border-[#50D6C5]/30 rounded-xl text-[#50D6C5] text-xs font-semibold flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#50D6C5]" />
          <span>{t.sessionClearedNotice}</span>
        </div>
      )}
    </div>
  );
};

export default StepCompletion;
