"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Clock, Server, Check } from "lucide-react";

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
      <div className="w-16 h-16 rounded-2xl bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17343A] tracking-tight">
          {t.finishTitle}
        </h2>
        <p className="text-[#52656B] max-w-md mx-auto text-sm leading-relaxed">
          {t.finishSubtitle}
        </p>
      </div>

      {/* Clinical Reference & Operational States Panel */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#F7FAF9] border border-[#DCE7E4] text-xs text-[#334155] max-w-md w-full text-left space-y-2.5 shadow-2xs">
        <div className="flex justify-between items-center pb-2 border-b border-[#DCE7E4]">
          <span className="text-[#52656B] font-medium">Case Reference:</span>
          <span id="completed-case-id" className="font-mono font-bold text-[#17343A] text-sm">
            {caseId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#52656B] font-medium">Storage & Persistence:</span>
          <span className="font-semibold text-[#0F766E] flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved on this device
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#52656B] font-medium">Network Status:</span>
          <span id="submission-sync-status" className="font-semibold text-[#0F766E]">
            {!isOnline ? "Queued Offline — Waiting to synchronise" : "Received by the server — Ready for staff review"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#52656B] font-medium">AI Triage Status:</span>
          <span className="font-semibold text-[#52656B]">
            {!isOnline ? "AI summary pending (connection required)" : "Ready for staff review"}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-[#DCE7E4]">
          <span className="text-[#52656B] font-medium">Intake Monotonic Revision:</span>
          <span className="font-semibold font-mono text-[#17343A]">Rev {revision}</span>
        </div>
      </div>

      {/* Privacy and Reset Action */}
      <div className="pt-2 space-y-3 w-full max-w-md">
        <button
          type="button"
          id="finish-session-btn"
          onClick={onFinishAndReset}
          className="w-full py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:bg-[#115E59] text-white font-bold text-sm transition shadow-sm"
        >
          {t.clearSessionButton}
        </button>
        <p className="text-2xs text-[#52656B] leading-snug">
          Next-patient privacy: Clears active session encryption keys and draft memory from this terminal.
        </p>
      </div>

      {sessionCleared && (
        <div
          id="session-cleared-alert"
          className="p-3 bg-[#E8F3EF] border border-[#0F766E]/30 rounded-xl text-[#0F766E] text-xs font-semibold flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{t.sessionClearedNotice}</span>
        </div>
      )}
    </div>
  );
};

export default StepCompletion;
