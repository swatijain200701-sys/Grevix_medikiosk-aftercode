'use client';
import React from 'react';
import Link from 'next/link';
import { Wifi, WifiOff, Check, Languages } from 'lucide-react';
import { SyncStats } from '@/lib/sync/sync-manager';

interface KioskHeaderProps {
  syncStats: SyncStats;
  savedLocally: boolean;
  lang: 'en' | 'hi';
  onToggleLang: () => void;
  savedText: string;
  langText: string;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({
  syncStats,
  savedLocally,
  lang,
  onToggleLang,
  savedText,
  langText,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-[#0B1D3A]">MediKiosk</h1>
            <p className="text-xs text-slate-500 font-medium">Accessible Clinical Intake</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!syncStats.isServerReachable || !syncStats.isOnline ? (
            <span id="offline-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800 animate-pulse">
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              Offline — you can continue
            </span>
          ) : (
            <span id="online-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800">
              <Wifi className="w-3.5 h-3.5 text-teal-600" />
              Online
            </span>
          )}

          {savedLocally && (
            <span id="saved-badge" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 transition-all">
              <Check className="w-3 h-3 text-emerald-600" />
              {savedText}
            </span>
          )}

          <button
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-teal-700" />
            {langText}
          </button>

          <Link
            href="/dashboard"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-600 transition"
          >
            Staff Dashboard
          </Link>
        </div>
      </div>
    </header>
  );
};