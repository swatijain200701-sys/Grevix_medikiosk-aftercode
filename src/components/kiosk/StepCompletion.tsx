'use client';
import React from 'react';
import { CheckCircle } from 'lucide-react';

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
      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
        <CheckCircle className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-extrabold text-[#0B1D3A] tracking-tight">{t.finishTitle}</h2>
        <p className="text-slate-600 max-w-md mx-auto text-sm">{t.finishSubtitle}</p>
      </div>

      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-sm w-full text-left space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Case Reference:</span>
          <span id="completed-case-id" className="font-mono font-semibold text-slate-900">{caseId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Status:</span>
          <span id="submission-sync-status" className="font-semibold text-teal-700">
            {!isOnline ? 'Queued Offline for Sync' : 'Delivered to Hospital Queue'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Revision:</span>
          <span className="font-semibold text-slate-900">Rev {revision}</span>
        </div>
      </div>

      <div className="pt-4 space-y-3 w-full max-w-md">
        <button
          type="button"
          id="finish-session-btn"
          onClick={onFinishAndReset}
          className="w-full py-4 rounded-xl bg-[#0B1D3A] hover:bg-slate-900 text-white font-bold text-base transition shadow-sm"
        >
          {t.clearSessionButton}
        </button>
        <p className="text-xs text-slate-500">
          Safe shared-kiosk policy: Clears your session encryption keys and draft data so the next patient cannot see your history.
        </p>
      </div>

      {sessionCleared && (
        <div id="session-cleared-alert" className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-semibold">
          {t.sessionClearedNotice}
        </div>
      )}
    </div>
  );
};