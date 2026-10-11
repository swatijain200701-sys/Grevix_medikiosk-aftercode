"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, Check, MessageSquare, ExternalLink, RefreshCw, AlertCircle } from "lucide-react";
import { resetKioskTheme } from "@/lib/theme/ThemeProvider";

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
  onFinishAndReset: _onFinishAndReset,
  onRetrySend,
  t,
}) => {
  const onFinishAndReset = () => {
    resetKioskTheme();
    _onFinishAndReset();
  };
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--btn-main)] flex items-center justify-center shadow-md">
        <CheckCircle2 className="w-10 h-10 text-[var(--btn-main)]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)] tracking-tight">
          {t.finishTitle}
        </h2>
        <p className="text-[var(--text-muted)] max-w-md mx-auto text-sm leading-relaxed">
          {submissionStatus === "received_by_server"
            ? "Your intake has been safely received by the hospital server and queued for staff review."
            : "Saved on this device. Waiting to send. Your information is safely preserved in local terminal memory."}
        </p>
      </div>

      {/* Clinical Reference & Operational States Panel */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] max-w-md w-full text-left space-y-3.5 shadow-sm">
        <div className="flex justify-between items-center pb-2.5 border-b border-[var(--border-color)]">
          <span className="text-[var(--text-muted)] font-bold">Case Reference:</span>
          <span id="completed-case-id" className="font-mono font-bold text-[var(--btn-main)] text-sm">
            {caseId}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] font-bold">Device Storage:</span>
          <span className="font-bold text-[var(--btn-main)] flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[var(--btn-main)] stroke-[3]" /> Saved on this device
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[var(--text-muted)] font-bold">Server Transmission:</span>
          <span id="submission-sync-status" className="font-bold text-right">
            {submissionStatus === "received_by_server" && (
              <span className="text-[var(--btn-main)] flex items-center gap-1 justify-end">
                <Check className="w-3.5 h-3.5 text-[var(--btn-main)] stroke-[3]" /> Received by server
              </span>
            )}
            {submissionStatus === "sending" && (
              <span className="text-[var(--slate-accent)] flex items-center gap-1 justify-end">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--slate-accent)]" /> Sending to server...
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
          <span className="text-[var(--text-muted)] font-bold">Clinical Summary Queue:</span>
          <span className="font-medium text-[var(--text-muted)] text-right">
            {submissionStatus !== "received_by_server" ? (
              "Waiting for connection"
            ) : aiSummaryStatus === "generated" ? (
              <span className="text-[var(--btn-main)] font-semibold">Summary generated for staff</span>
            ) : aiSummaryStatus === "unconfigured" ? (
              "Standard intake queued (Live AI not configured)"
            ) : aiSummaryStatus === "consent_declined" ? (
              "Standard intake queued (AI opt-out)"
            ) : (
              "Queued for staff review"
            )}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2.5 border-t border-[var(--border-color)]">
          <span className="text-[var(--text-muted)] font-bold">Intake Revision:</span>
          <span className="font-mono font-bold text-[var(--text-heading)]">Rev {revision}</span>
        </div>

        {submissionStatus === "could_not_send_retry" && onRetrySend && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onRetrySend}
              className="w-full py-2.5 bg-[var(--bg-panel)] hover:bg-[#C9D8CE] border border-[var(--border-color)] text-[var(--text-heading)] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Transmission Now</span>
            </button>
          </div>
        )}
      </div>

      {/* Visible Feedback Link Strip */}
      <div className="p-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] max-w-md w-full space-y-2 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--text-heading)] flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[var(--btn-main)]" />
            <span>Help shape MediKiosk</span>
          </span>
          <span className="text-3xs text-[var(--text-muted)] font-medium">Google Forms</span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Tell us what confused you during intake or what would make it more useful.
        </p>
        <a
          href={FEEDBACK_FORM_URL}
          target="_blank"
          rel="noopener noreferrer"
          id="completion-feedback-btn"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-main)] text-[var(--btn-main)] font-bold text-xs transition"
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
          className="w-full py-4 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-sm transition shadow-sm min-h-[48px]"
        >
          {t.clearSessionButton}
        </button>
        <p className="text-2xs text-[var(--text-muted)] leading-snug">
          Next-patient privacy: Clears active session encryption keys and draft memory from this terminal while preserving background upload queue.
        </p>
      </div>

      {sessionCleared && (
        <div
          id="session-cleared-alert"
          className="p-3.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-[var(--btn-main)] text-xs font-bold flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4 text-[var(--btn-main)]" />
          <span>{t.sessionClearedNotice}</span>
        </div>
      )}
    </div>
  );
};

export default StepCompletion;