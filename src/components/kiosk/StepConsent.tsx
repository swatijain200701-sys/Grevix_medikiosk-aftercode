'use client';
import React from 'react';
import { Shield } from 'lucide-react';

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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.consentTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.consentSubtitle}</p>
      </div>

      <div className="space-y-3">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-storage-checkbox"
              checked={storageConsent}
              onChange={e => setStorageConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-900">Local Offline Storage</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.consentStorage}</p>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-ai-checkbox"
              checked={aiConsent}
              onChange={e => setAiConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-900">AI Structured Summarization</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.consentAi}</p>
            </div>
          </label>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="consent-voice-checkbox"
              checked={recordingConsent}
              onChange={e => setRecordingConsent(e.target.checked)}
              className="mt-1 w-5 h-5 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
            />
            <div className="text-sm">
              <span className="font-semibold text-slate-900">Voice Dictation (Optional)</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.consentRecording}</p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center gap-2">
        <Shield className="w-4 h-4 text-teal-700 shrink-0" />
        <span>Your privacy is protected. Data is encrypted locally and wiped after your session.</span>
      </div>
    </div>
  );
};