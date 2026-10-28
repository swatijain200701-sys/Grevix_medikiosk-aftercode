"use client";

import React from "react";
import { Mic, MicOff, Clock, Info } from "lucide-react";

interface StepMainConcernProps {
  mainConcern: string;
  setMainConcern: (val: string | ((prev: string) => string)) => void;
  onsetDuration: string;
  setOnsetDuration: (val: string) => void;
  recordingConsent: boolean;
  isListening: boolean;
  toggleVoice: () => void;
  unconfirmedTranscript: string | null;
  confirmTranscript: () => void;
  discardTranscript: () => void;
  lang: "en" | "hi";
  t: any;
}

export const StepMainConcern: React.FC<StepMainConcernProps> = ({
  mainConcern,
  setMainConcern,
  onsetDuration,
  setOnsetDuration,
  recordingConsent,
  isListening,
  toggleVoice,
  unconfirmedTranscript,
  confirmTranscript,
  discardTranscript,
  lang,
  t,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-heading)] tracking-tight">{t.mainConcernTitle}</h2>
        <p className="text-[var(--text-muted)] text-sm mt-1">{t.mainConcernSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="main-concern-input" className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-wide mb-1.5">
            Primary Concern / मुख्य समस्या <span className="text-red-600">*</span>
          </label>
          <textarea
            id="main-concern-input"
            rows={4}
            value={mainConcern}
            onChange={(e) => setMainConcern(e.target.value)}
            placeholder={
              lang === "hi"
                ? "उदा. कल से छाती में भारीपन और साँस लेने में तकलीफ़..."
                : "e.g. Chest tightness and shortness of breath since yesterday, feeling unwell..."
            }
            className="w-full text-base p-4 rounded-xl border border-[var(--border-color)] focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D]"
          />
        </div>

        {recordingConsent ? (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              id="voice-dictation-btn"
              onClick={toggleVoice}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition min-h-[48px] ${
                isListening
                  ? "bg-[#991B1B] text-[var(--btn-main-text)] animate-pulse"
                  : "bg-[var(--btn-main)] text-[var(--btn-main-text)] hover:bg-[var(--btn-main-hover)]"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-[var(--btn-main-text)]" />
                  <span>{t.voiceStop}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[var(--btn-main-text)]" />
                  <span>{t.voiceButton}</span>
                </>
              )}
            </button>
            <span aria-live="polite" className="text-xs text-[var(--text-muted)]">
              {isListening ? "Listening... Speak clearly." : "Speech is transcribed locally and requires your review before saving."}
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-xs text-[var(--text-muted)] flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
            <span>Voice dictation is optional and disabled (touch typing active).</span>
          </div>
        )}

        {unconfirmedTranscript && (
          <div id="unconfirmed-transcript-box" className="p-4 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#92400E]" />
              <span>{t.voiceConfirmPrompt}</span>
            </div>
            <p className="text-base font-semibold bg-[var(--bg-card)] p-3 rounded-lg border border-[#F59E0B] text-[var(--text-heading)]">
              &ldquo;{unconfirmedTranscript}&rdquo;
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                id="confirm-transcript-btn"
                onClick={confirmTranscript}
                className="px-4 py-2.5 bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] text-xs font-bold rounded-lg transition min-h-[44px]"
              >
                {t.confirmTranscript}
              </button>
              <button
                type="button"
                onClick={discardTranscript}
                className="px-4 py-2.5 bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-[var(--text-heading)] text-xs font-semibold rounded-lg border border-[var(--border-color)] transition min-h-[44px]"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label htmlFor="onset-duration-input" className="block text-xs font-bold text-[var(--text-heading)] uppercase tracking-wide mb-1.5">
            {t.onsetTitle} <span className="text-red-600">*</span>
          </label>
          <input
            id="onset-duration-input"
            type="text"
            value={onsetDuration}
            onChange={(e) => setOnsetDuration(e.target.value)}
            placeholder={lang === "hi" ? "उदा. 3 दिन पहले / 1 सप्ताह से" : "e.g. 3 days ago, or 2 weeks gradually"}
            className="w-full text-base min-h-[48px] p-3.5 rounded-xl border border-[var(--border-color)] focus:border-[#356B62] focus:ring-2 focus:ring-[#356B62]/20 outline-none transition bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D]"
          />
          <div className="flex flex-wrap gap-2 pt-2.5">
            {["Today", "2-3 days", "1 week", "2-4 weeks", "More than 1 month", "Unknown"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setOnsetDuration(d)}
                className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-panel)] text-xs font-semibold text-[var(--text-heading)] transition min-h-[38px]"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepMainConcern;