"use client";

import React from "react";
import Link from "next/link";
import { Wifi, WifiOff, Check, Languages, Stethoscope, Clock } from "lucide-react";
import { SyncStats } from "@/lib/sync/sync-manager";

interface KioskHeaderProps {
  syncStats: SyncStats;
  savedLocally: boolean;
  lang: "en" | "hi";
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
  const isOffline = !syncStats.isServerReachable || !syncStats.isOnline;
  const isWaitingToSync = syncStats.pendingCount > 0;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DCE7E4] px-4 py-3 shadow-2xs">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-lg shadow-2xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-[#17343A]">
              MediKiosk
            </h1>
            <p className="text-2xs text-[#52656B] font-medium">Patient Intake Terminal</p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span
              id="offline-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-amber-300 text-[#92400E] animate-pulse"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline — you can continue</span>
            </span>
          ) : (
            <span
              id="online-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3EF] border border-[#0F766E]/20 text-[#0F766E]"
            >
              <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Received by the server</span>
            </span>
          )}

          {/* Waiting to synchronise badge */}
          {isWaitingToSync && (
            <span
              id="waiting-sync-badge"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-amber-200 text-[#92400E]"
            >
              <Clock className="w-3 h-3 text-amber-600" />
              <span>Waiting to synchronise</span>
            </span>
          )}

          {/* Saved on this device badge */}
          {savedLocally && (
            <span
              id="saved-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8F3EF] border border-[#0F766E]/30 text-[#0F766E] transition-all"
            >
              <Check className="w-3 h-3 text-[#0F766E]" />
              <span>Saved on this device</span>
            </span>
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCE7E4] bg-[#F7FAF9] hover:bg-[#E8F3EF] text-xs font-semibold text-[#17343A] transition shadow-2xs"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>{langText}</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#DCE7E4] bg-white hover:bg-[#E8F3EF] text-xs font-medium text-[#52656B] hover:text-[#17343A] transition shadow-2xs"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;
