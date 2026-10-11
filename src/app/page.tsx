'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Heart, Shield, ArrowRight, Wifi, WifiOff, Users, 
  FileText, Activity, Lock, Languages, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function Home() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B1D3A] flex flex-col font-sans selection:bg-teal-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              M
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-[#0B1D3A]">MediKiosk</span>
              <span className="text-xs text-slate-500 block">Accessible Clinical Intake Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                Offline Mode Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800">
                <Wifi className="w-3.5 h-3.5 text-teal-600" />
                Connected
              </span>
            )}

            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 flex flex-col justify-center space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Grevix AfterCode 2026 • Real Challenge Card 1 Ready
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0B1D3A] tracking-tight leading-tight">
            Calm, Accessible Clinical Intake for Healthcare Facilities
          </h1>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            Eliminating clinical intake bottlenecks for OPDs and hospitals. Works seamlessly with touch, voice, document OCR, and guaranteed 30-second offline tolerance.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
          {/* Patient Kiosk Card */}
          <Link
            href="/kiosk"
            id="start-kiosk-btn"
            className="group p-8 rounded-3xl bg-white border-2 border-slate-200 hover:border-teal-600 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs group-hover:scale-105 transition">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0B1D3A] tracking-tight group-hover:text-teal-700 transition">
                  Patient Intake Kiosk
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Step-by-step touch and voice interface with English/Hindi support, offline persistence, document scan, and privacy protection on shared terminals.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-teal-700 font-bold text-sm">
              <span>Start Patient Intake</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          {/* Doctor / Staff Dashboard Card */}
          <Link
            href="/dashboard"
            id="open-dashboard-btn"
            className="group p-8 rounded-3xl bg-white border-2 border-slate-200 hover:border-slate-800 shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B1D3A] text-white flex items-center justify-center font-bold text-2xl shadow-xs group-hover:scale-105 transition">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#0B1D3A] tracking-tight group-hover:text-slate-800 transition">
                  Staff Review Dashboard
                </h3>
                <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                  Real-time queue of intake cases, structured AI clinical summaries with source verification, red-flag alert review, and triage note management.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center gap-2 text-[#0B1D3A] font-bold text-sm">
              <span>Open Staff Queue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        </div>

        {/* Challenge Card 1 Capability Highlights */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">30s Offline Disconnection Tolerance</span>
              <p className="text-slate-500 mt-0.5">Tested with Playwright browser network cut mid-intake.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Monotonic Revisions & Idempotency</span>
              <p className="text-slate-500 mt-0.5">Zero duplicate queue entries on reconnection bursts.</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800">Shared-Kiosk Privacy</span>
              <p className="text-slate-500 mt-0.5">Web Crypto client encryption & safe next-patient wipe.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-500">
        <p>MediKiosk • Built for Grevix AfterCode 2026 by Swati Jain (Sole Participant).</p>
        <p className="mt-1 text-slate-400">Clinical intake organizer — not a diagnostic or prescribing medical device.</p>
      </footer>
    </div>
  );
}