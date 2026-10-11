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
    <header className="sticky top-0 z-40 bg-[#0B1B25] border-b border-[#304652] px-4 py-3 shadow-md text-[#FFFDF7]">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-lg shadow-sm">
            <Stethoscope className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-[#FAF7F0]">
              MediKiosk
            </h1>
            <p className="text-3xs text-[#91A8B3] font-medium">
              {lang === "hi" ? "मरीज़ का इतिहास। आपके परामर्श की तैयारी।" : "Patient history. Prepared for your consultation."}
            </p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span
              id="offline-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E]"
            >
              <WifiOff className="w-3.5 h-3.5 text-[#92400E]" />
              <span>Offline — saving locally</span>
            </span>
          ) : (
            <span
              id="online-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4FD1C5]/20 border border-[#4FD1C5]/40 text-[#4FD1C5]"
            >
              <Wifi className="w-3.5 h-3.5 text-[#4FD1C5]" />
              <span>Service available</span>
            </span>
          )}

          {/* Waiting to synchronise badge */}
          {isWaitingToSync && (
            <span
              id="waiting-sync-badge"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E]"
            >
              <Clock className="w-3 h-3 text-[#92400E]" />
              <span>Waiting to sync</span>
            </span>
          )}

          {/* Saved on this device badge */}
          {savedLocally && (
            <span
              id="saved-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4FD1C5]/20 border border-[#4FD1C5]/40 text-[#4FD1C5] transition-all"
            >
              <Check className="w-3 h-3 text-[#4FD1C5]" />
              <span>Saved on this device</span>
            </span>
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#304652] bg-[#122330] hover:bg-[#18303D] text-xs font-semibold text-[#FAF7F0] transition"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-[#4FD1C5]" />
            <span>{langText}</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#304652] bg-[#122330] hover:bg-[#18303D] text-xs font-medium text-[#FAF7F0] hover:text-[#4FD1C5] transition"
          >
            Staff Sign In
          </Link>
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;