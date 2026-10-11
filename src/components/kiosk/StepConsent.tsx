"use client";

import React from "react";
import { Shield } from "lucide-react";

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
        <h2 className="text-2xl font-bold text-[#F1F6F8] tracking-tight">{t.consentTitle}</h2>
        <p className="text-[#91A8B3] text-sm mt-1">{t.consentSubtitle}</p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-[#294350] bg-[#18303D] hover:border-[#50D6C5]/40 transition space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-storage-checkbox"
              checked={storageConsent}
              onChange={(e) => setStorageConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#50D6C5] rounded-md"
            />
            <div className="text-sm">
              <span className="font-semibold text-[#F1F6F8]">Local Offline Storage</span>
              <p className="text-[#B6C7CF] text-xs mt-0.5">{t.consentStorage}</p>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-[#294350] bg-[#18303D] hover:border-[#50D6C5]/40 transition space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-ai-checkbox"
              checked={aiConsent}
              onChange={(e) => setAiConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#50D6C5] rounded-md"
            />
            <div className="text-sm">
              <span className="font-semibold text-[#F1F6F8]">AI Structured Summarization</span>
              <p className="text-[#B6C7CF] text-xs mt-0.5">{t.consentAi}</p>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-[#294350] bg-[#18303D] hover:border-[#50D6C5]/40 transition space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-voice-checkbox"
              checked={recordingConsent}
              onChange={(e) => setRecordingConsent(e.target.checked)}
              className="mt-1 w-5 h-5 accent-[#50D6C5] rounded-md"
            />
            <div className="text-sm">
              <span className="font-semibold text-[#F1F6F8]">Voice Dictation (Optional)</span>
              <p className="text-[#B6C7CF] text-xs mt-0.5">{t.consentRecording}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-3.5 bg-[#122330] border border-[#294350] rounded-xl text-xs text-[#50D6C5] flex items-center gap-2.5">
        <Shield className="w-4 h-4 text-[#50D6C5] shrink-0" />
        <span>Your privacy is protected. Data is encrypted locally and wiped after your session.</span>
      </div>
    </div>
  );
};

export default StepConsent;
