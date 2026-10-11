"use client";

import React from "react";
import { Shield, Info } from "lucide-react";

interface StepConsentProps {
  storageConsent: boolean;
  setStorageConsent: (val: boolean) => void;
  aiConsent: boolean;
  setAiConsent: (val: boolean) => void;
  recordingConsent: boolean;
  setRecordingConsent: (val: boolean) => void;
  t: any;
}

export const StepConsent: React.FC<StepConsentProps> = ({
  storageConsent,
  setStorageConsent,
  aiConsent,
  setAiConsent,
  recordingConsent,
  setRecordingConsent,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">{t.consentTitle}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.consentSubtitle}</p>
      </div>

      <div className="space-y-3.5">
        {/* Required Storage Consent */}
        <div
          className={`p-4 rounded-xl border transition space-y-2 ${
            storageConsent
              ? "border-[#356B62] bg-[var(--bg-panel)]/50 shadow-sm"
              : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--btn-main)]/50"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-storage-checkbox"
              checked={storageConsent}
              onChange={(e) => setStorageConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#356B62] rounded-md cursor-pointer"
            />
            <div className="text-sm">
              <span className="font-bold text-[var(--text-heading)]">
                Local Offline Storage <span className="text-xs font-semibold text-[var(--btn-main)]">(Required for Kiosk Flow)</span>
              </span>
              <p className="text-[var(--text-muted)] text-xs mt-1 leading-relaxed">{t.consentStorage}</p>
            </div>
          </label>
        </div>

        {/* Staff-assisted alternative notice when storage consent is not yet checked */}
        {!storageConsent && (
          <div className="p-3.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[var(--btn-main)] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">Staff-assisted alternative available:</strong> If you prefer not to store your medical details on this digital terminal, you do not have to use this kiosk. Please speak with the outpatient registration counter for assisted intake directly on hospital forms.
            </div>
          </div>
        )}

        {/* Optional AI Summarization Consent */}
        <div
          className={`p-4 rounded-xl border transition space-y-2 ${
            aiConsent
              ? "border-[#356B62] bg-[var(--bg-panel)]/50 shadow-sm"
              : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--btn-main)]/50"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-ai-checkbox"
              checked={aiConsent}
              onChange={(e) => setAiConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#356B62] rounded-md cursor-pointer"
            />
            <div className="text-sm">
              <span className="font-bold text-[var(--text-heading)]">
                AI Structured Summarization <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span>
              </span>
              <p className="text-[var(--text-muted)] text-xs mt-1 leading-relaxed">{t.consentAi}</p>
            </div>
          </label>
        </div>

        {/* Optional Voice Dictation Consent */}
        <div
          className={`p-4 rounded-xl border transition space-y-2 ${
            recordingConsent
              ? "border-[#356B62] bg-[var(--bg-panel)]/50 shadow-sm"
              : "border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--btn-main)]/50"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-voice-checkbox"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#356B62] rounded-md cursor-pointer"
            />
            <div className="text-sm">
              <span className="font-bold text-[var(--text-heading)]">
                Voice Dictation <span className="text-xs font-normal text-[var(--text-muted)]">(Optional)</span>
              </span>
              <p className="text-[var(--text-muted)] text-xs mt-1 leading-relaxed">{t.consentRecording}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-3.5 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl text-xs text-[var(--text-heading)] flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
        <span>Your privacy is protected. Session drafts are encrypted locally and wiped when the session finishes.</span>
      </div>
    </div>
  );
};

export default StepConsent;