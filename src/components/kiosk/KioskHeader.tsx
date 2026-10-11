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
    <header className="sticky top-0 z-40 bg-[#0C1924]/95 backdrop-blur-md border-b border-[#294350] px-4 py-3 shadow-md">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#50D6C5] text-[#062820] flex items-center justify-center font-bold text-lg shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg leading-tight tracking-tight text-[#F1F6F8]">
              MediKiosk
            </h1>
            <p className="text-3xs text-[#91A8B3] font-medium">Patient Intake Terminal</p>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-2">
          {isOffline ? (
            <span
              id="offline-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#261B0E] border border-[#854D0E] text-[#FBBF24]"
            >
              <WifiOff className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span>Offline — you can continue</span>
            </span>
          ) : (
            <span
              id="online-badge"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#50D6C5]/15 border border-[#50D6C5]/30 text-[#50D6C5]"
            >
              <Wifi className="w-3.5 h-3.5 text-[#50D6C5]" />
              <span>Received by the server</span>
            </span>
          )}

          {/* Waiting to synchronise badge */}
          {isWaitingToSync && (
            <span
              id="waiting-sync-badge"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#261B0E] border border-[#854D0E] text-[#FBBF24]"
            >
              <Clock className="w-3 h-3 text-[#FBBF24]" />
              <span>Waiting to synchronise</span>
            </span>
          )}

          {/* Saved on this device badge */}
          {savedLocally && (
            <span
              id="saved-badge"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#18303D] border border-[#294350] text-[#50D6C5] transition-all"
            >
              <Check className="w-3 h-3 text-[#50D6C5]" />
              <span>Saved on this device</span>
            </span>
          )}

          {/* Language Toggle */}
          <button
            type="button"
            onClick={onToggleLang}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-xs font-semibold text-[#F1F6F8] transition"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5 text-[#50D6C5]" />
            <span>{langText}</span>
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#294350] bg-[#122330] hover:bg-[#18303D] text-xs font-medium text-[#B6C7CF] hover:text-[#F1F6F8] transition"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;
