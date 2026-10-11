'use client';
import React from 'react';
import { Mic, MicOff, Clock } from 'lucide-react';

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
  lang: 'en' | 'hi';
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
        <h2 className="text-2xl font-bold text-[#0B1D3A] tracking-tight">{t.mainConcernTitle}</h2>
        <p className="text-slate-600 text-sm mt-1">{t.mainConcernSubtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            Primary Concern / मुख्य समस्या
          </label>
          <textarea
            id="main-concern-input"
            rows={4}
            value={mainConcern}
            onChange={e => setMainConcern(e.target.value)}
            placeholder={lang === 'hi' ? 'उदा. मुझे 3 दिन से तेज बुखार और खांसी है...' : 'e.g. Severe chest tightness and shortness of breath since yesterday...'}
            className="w-full text-base p-4 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-hidden transition bg-white"
          />
        </div>

        {recordingConsent && (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              id="voice-dictation-btn"
              onClick={toggleVoice}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition shadow-xs ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-teal-50 text-teal-800 border border-teal-300 hover:bg-teal-100'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 text-white" />
                  {t.voiceStop}
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-teal-700" />
                  {t.voiceButton}
                </>
              )}
            </button>
            <span className="text-xs text-slate-500">
              {isListening ? 'Listening... Speak clearly.' : 'Speech is transcribed and requires your confirmation.'}
            </span>
          </div>
        )}

        {unconfirmedTranscript && (
          <div id="unconfirmed-transcript-box" className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5" />
              {t.voiceConfirmPrompt}
            </div>
            <p className="text-base font-semibold bg-white p-3 rounded-lg border border-amber-200">
              &quot;{unconfirmedTranscript}&quot;
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                id="confirm-transcript-btn"
                onClick={confirmTranscript}
                className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg transition"
              >
                {t.confirmTranscript}
              </button>
              <button
                type="button"
                onClick={discardTranscript}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            {t.onsetTitle}
          </label>
          <input
            id="onset-duration-input"
            type="text"
            value={onsetDuration}
            onChange={e => setOnsetDuration(e.target.value)}
            placeholder={lang === 'hi' ? 'उदा. 3 दिन से / 1 सप्ताह से' : 'e.g. 3 days ago, or 2 weeks gradually'}
            className="w-full text-base p-3.5 rounded-xl border-2 border-slate-200 focus:border-teal-600 focus:outline-hidden transition bg-white"
          />
          <div className="flex flex-wrap gap-2 pt-2">
            {['Today', '2-3 days', '1 week', '2-4 weeks', 'More than 1 month'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setOnsetDuration(d)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-teal-50 text-xs font-semibold text-slate-700 transition"
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