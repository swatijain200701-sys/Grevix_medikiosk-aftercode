"use client";

import React from "react";
import { Mic, MicOff, Clock } from "lucide-react";

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
        <h2 className="text-2xl font-bold text-[#F1F6F8] tracking-tight">{t.mainConcernTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.mainConcernSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#B6C7CF] uppercase tracking-wide mb-1.5">
            Primary Concern / मुख्य समस्या
          </label>
          <textarea
            id="main-concern-input"
            rows={4}
            value={mainConcern}
            onChange={(e) => setMainConcern(e.target.value)}
            placeholder={
              lang === "hi"
                ? "उदा. मुझे 3 दिन से तेज बुखार और खांसी है..."
                : "e.g. Severe chest tightness and shortness of breath since yesterday..."
            }
            className="w-full text-base p-4 rounded-xl border border-[#294350] focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3]"
          />
        </div>

        {recordingConsent && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              id="voice-dictation-btn"
              onClick={toggleVoice}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition min-h-[48px] ${
                isListening
                  ? "bg-[#EF4444] text-[#F1F6F8] animate-pulse"
                  : "bg-[#18303D] text-[#50D6C5] border border-[#294350] hover:bg-[#203D4D]"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-[#F1F6F8]" />
                  <span>{t.voiceStop}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#50D6C5]" />
                  <span>{t.voiceButton}</span>
                </>
              )}
            </button>
            <span className="text-xs text-[#91A8B3]">
              {isListening ? "Listening... Speak clearly." : "Speech is transcribed and requires your confirmation."}
            </span>
          </div>
        )}

        {unconfirmedTranscript && (
          <div id="unconfirmed-transcript-box" className="p-4 rounded-xl bg-[#261B0E] border border-[#854D0E] text-[#FBBF24] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>{t.voiceConfirmPrompt}</span>
            </div>
            <p className="text-base font-semibold bg-[#18303D] p-3 rounded-lg border border-[#854D0E] text-[#F1F6F8]">
              &ldquo;{unconfirmedTranscript}&rdquo;
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                id="confirm-transcript-btn"
                onClick={confirmTranscript}
                className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#062820] text-xs font-bold rounded-lg transition min-h-[44px]"
              >
                {t.confirmTranscript}
              </button>
              <button
                type="button"
                onClick={discardTranscript}
                className="px-4 py-2.5 bg-[#18303D] hover:bg-[#203D4D] text-[#B6C7CF] text-xs font-medium rounded-lg border border-[#294350] transition min-h-[44px]"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label className="block text-xs font-bold text-[#B6C7CF] uppercase tracking-wide mb-1.5">
            {t.onsetTitle}
          </label>
          <input
            id="onset-duration-input"
            type="text"
            value={onsetDuration}
            onChange={(e) => setOnsetDuration(e.target.value)}
            placeholder={lang === "hi" ? "उदा. 3 दिन पहले / 1 सप्ताह से" : "e.g. 3 days ago, or 2 weeks gradually"}
            className="w-full text-base min-h-[48px] p-3.5 rounded-xl border border-[#294350] focus:border-[#50D6C5] focus:ring-2 focus:ring-[#7DD3FC]/20 outline-none transition bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3]"
          />
          <div className="flex flex-wrap gap-2 pt-2.5">
            {["Today", "2-3 days", "1 week", "2-4 weeks", "More than 1 month"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setOnsetDuration(d)}
                className="px-3.5 py-2 rounded-lg border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] hover:border-[#50D6C5]/40 text-xs font-semibold text-[#F1F6F8] transition min-h-[38px]"
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
