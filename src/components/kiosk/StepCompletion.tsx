"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Check, MessageSquare, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";

export type SubmissionStatusType =
  | "saved_locally_waiting"
  | "sending"
  | "received_by_server"
  | "could_not_send_retry";

interface StepCompletionProps {
  caseId: string;
  revision: number;
  isOnline: boolean;
  submissionStatus: SubmissionStatusType;
  aiSummaryStatus?: "pending" | "generated" | "unconfigured" | "consent_declined" | "failed";
  sessionCleared: boolean;
  onFinishAndReset: () => void;
  onRetrySend?: () => void;
  t: any;
}

const FEEDBACK_FORM_URL = "https://forms.gle/UM6smWDSmxzCiAwh6";

export const StepCompletion: React.FC<StepCompletionProps> = ({
  caseId,
  revision,
  isOnline,
  submissionStatus,
  aiSummaryStatus = "pending",
  sessionCleared,
  onFinishAndReset,
  onRetrySend,
  t,
}) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[#D8E5DC] border border-[#B8C9BD] text-[#356B62] flex items-center justify-center shadow-md">
        <CheckCircle2 className="w-10 h-10 text-[#356B62]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#293D36] tracking-tight">
          {t.finishTitle}
        </h2>
        <p className="text-[#53665D] max-w-md mx-auto text-sm leading-relaxed">
          {submissionStatus === "received_by_server"
            ? "Your intake has been safely received by the hospital server and queued for staff review."
            : "Saved on this device. Waiting to send. Your information is safely preserved in local terminal memory."}
        </p>
      </div>

      {/* Clinical Reference & Operational States Panel */}
      <div className="p-5 rounded-2xl bg-[#FAF7F0] border border-[#B8C9BD] text-xs text-[#293D36] max-w-md w-full text-left space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center pb-2.5 border-b border-[#B8C9BD]">
          <span className="text-[#53665D] font-bold">Case Reference:</span>
          <span id="completed-case-id" className="font-mono font-bold text-[#356B62] text-sm">
            {caseId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#53665D] font-bold">Device Storage:</span>
          <span className="font-bold text-[#356B62] flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#356B62] stroke-[3]" /> Saved on this device
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#53665D] font-bold">Server Transmission:</span>
          <span id="submission-sync-status" className="font-bold text-right">
            {submissionStatus === "received_by_server" && (
              <span className="text-[#356B62] flex items-center gap-1 justify-end">
                <Check className="w-3.5 h-3.5 text-[#356B62] stroke-[3]" /> Received by server
              </span>
            )}
            {submissionStatus === "sending" && (
              <span className="text-[#304652] flex items-center gap-1 justify-end">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#304652]" /> Sending to server...
              </span>
            )}
            {submissionStatus === "saved_locally_waiting" && (
              <span className="text-[#92400E]">
                Saved on this device. Waiting to send. (Queued Offline)
              </span>
            )}
            {submissionStatus === "could_not_send_retry" && (
              <span className="text-[#991B1B]">
                Could not send — retry available
              </span>
            )}
          </span>
        </div>

        {/* Separated AI Summary Status */}
        <div className="flex justify-between items-center">
          <span className="text-[#53665D] font-bold">Clinical Summary Queue:</span>
          <span className="font-medium text-[#53665D] text-right">
            {submissionStatus !== "received_by_server" ? (
              "Waiting for connection"
            ) : aiSummaryStatus === "generated" ? (
              <span className="text-[#356B62] font-semibold">Summary generated for staff</span>
            ) : aiSummaryStatus === "unconfigured" ? (
              "Standard intake queued (Live AI not configured)"
            ) : aiSummaryStatus === "consent_declined" ? (
              "Standard intake queued (AI opt-out)"
            ) : (
              "Queued for staff review"
            )}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-[#B8C9BD]">
          <span className="text-[#53665D] font-bold">Intake Revision:</span>
          <span className="font-mono font-bold text-[#293D36]">Rev {revision}</span>
        </div>

        {submissionStatus === "could_not_send_retry" && onRetrySend && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onRetrySend}
              className="w-full py-2.5 bg-[#D8E5DC] hover:bg-[#C9D8CE] border border-[#B8C9BD] text-[#293D36] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Transmission Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Visible Feedback Link Strip */}
      <div className="p-4 rounded-2xl bg-[#D8E5DC] border border-[#B8C9BD] max-w-md w-full space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#293D36] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#356B62]" />
            <span>Help shape MediKiosk</span>
          </span>
          <span className="text-3xs text-[#53665D] font-medium">Google Forms</span>
        </div>
        <p className="text-xs text-[#53665D]">
          Tell us what confused you during intake or what would make it more useful.
        </p>
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="completion-feedback-btn"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#B8C9BD] bg-[#FAF7F0] hover:bg-[#EAF0EB] text-[#356B62] font-bold text-xs transition"
        >
          <span>Open feedback form</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Privacy and Reset Action */}
      <div className="pt-1 space-y-3 w-full max-w-md">
        <button
          type="button"
          id="finish-session-btn"
          onClick={onFinishAndReset}
          className="w-full py-4 rounded-xl bg-[#356B62] hover:bg-[#2B574F] text-[#FFFDF7] font-bold text-sm transition shadow-sm min-h-[48px]"
        >
          {t.clearSessionButton}
        </button>
        <p className="text-2xs text-[#53665D] leading-snug">
          Next-patient privacy: Clears active session encryption keys and draft memory from this terminal while preserving background upload queue.
        </p>
      </div>

      {sessionCleared && (
        <div
          id="session-cleared-alert"
          className="p-3.5 bg-[#D8E5DC] border border-[#B8C9BD] rounded-xl text-[#356B62] text-xs font-bold flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[#356B62]" />
          <span>{t.sessionClearedNotice}</span>
        </div>
      )}
    </div>
  );
};

export default StepCompletion;