"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wifi, WifiOff, RefreshCw, Search, ChevronRight, AlertTriangle, 
  CheckCircle2, Clock, FileText, Stethoscope, ArrowUpRight, LogOut 
} from "lucide-react";
import { CaseDetailModal } from "@/components/dashboard/CaseDetailModal";
import { FullCaseRecord } from "@/lib/db/server-db";

export default function StaffDashboardPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<FullCaseRecord | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const fetchCases = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/cases");
      if (!res.ok) throw new Error("Failed to load clinical intake queue from hospital server");
      const data = await res.json();
      setCases(data.cases || []);
    } catch (err: any) {
      console.warn("Queue load warning:", err);
      setLoadError("Unable to reach hospital database. Showing locally cached records if available.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    fetchCases();
    const interval = setInterval(fetchCases, 10000);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      clearInterval(interval);
    };
  }, []);

  const openCaseDetail = async (caseId: string) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data);
      }
    } catch (err) {
      console.error("Open case error:", err);
    }
  };

  const handleSaveReview = async (caseId: string, notes: string, triage: string, ack: boolean) => {
    try {
      await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffNotes: notes,
          triageCategory: triage,
          acknowledged: ack,
        }),
      });
      await fetchCases();
    } catch (err) {
      console.error("Save review error:", err);
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filter === "flagged" && c.redFlagCount === 0) return false;
    if (filter === "ready" && (c.summaryStatus !== "generated" || c.acknowledgedAt)) return false;
    if (filter === "awaiting_summary" && c.summaryStatus === "generated") return false;
    if (filter === "reviewed" && !c.acknowledgedAt) return false;

    if (search.trim()) {
      const s = search.toLowerCase();
      const matchName = c.patientName.toLowerCase().includes(s);
      const matchId = c.caseId.toLowerCase().includes(s);
      return matchName || matchId;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F7FAF9] text-[#334155] flex flex-col font-sans selection:bg-[#E8F3EF]">
      {/* Compact Clinical Navigation Bar */}
      <header className="border-b border-[#DCE7E4] bg-white px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-base leading-tight tracking-tight text-[#17343A]">
                MediKiosk Clinical Dashboard
              </h1>
              <p className="text-2xs text-[#52656B] font-medium">OPD Intake & Triage Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-amber-300 text-[#92400E]">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline — Data Freshness Limited</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3EF] border border-[#0F766E]/20 text-[#0F766E]">
                <Wifi className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Live Server Connected</span>
              </span>
            )}

            <button
              onClick={fetchCases}
              disabled={isLoading}
              className="p-2 rounded-lg border border-[#DCE7E4] bg-white hover:bg-[#E8F3EF] text-[#52656B] transition shadow-2xs"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#0F766E]" : ""}`} />
            </button>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold transition shadow-2xs"
            >
              <span>Open Patient Kiosk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/login"
              className="p-2 rounded-lg border border-[#DCE7E4] bg-white hover:bg-[#FEE2E2] hover:text-[#991B1B] text-[#52656B] transition shadow-2xs"
              title="Staff Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Clinical Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Offline & Freshness Caution Banner */}
        {!isOnline && (
          <div className="p-4 rounded-xl bg-[#FEF3C7] border border-amber-300 text-[#92400E] text-xs flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Limited Data Freshness Warning:</strong>
              <span>
                Terminal is operating offline. You are reviewing local queue snapshots. Cases submitted from remote kiosks will appear automatically once server synchronisation is restored.
              </span>
            </div>
          </div>
        )}

        {/* Load Error State Banner */}
        {loadError && (
          <div className="p-4 rounded-xl bg-[#FEE2E2] border border-red-300 text-[#991B1B] text-xs flex items-center justify-between shadow-2xs">
            <span>{loadError}</span>
            <button onClick={fetchCases} className="underline font-bold text-xs">Retry Connection</button>
          </div>
        )}

        {/* Search & Real Status Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All Records (${cases.length})` },
              { id: "flagged", label: `Attention Flagged (${cases.filter((c) => c.redFlagCount > 0).length})` },
              { id: "ready", label: "Ready for Review" },
              { id: "awaiting_summary", label: "Awaiting Summary" },
              { id: "reviewed", label: "Reviewed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === tab.id
                    ? "bg-[#17343A] text-white shadow-2xs"
                    : "bg-white border border-[#DCE7E4] text-[#52656B] hover:bg-[#E8F3EF]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#52656B] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, case ID..."
              className="w-full text-xs pl-9 pr-3.5 py-2 rounded-xl border border-[#DCE7E4] bg-white text-[#17343A] placeholder-[#52656B]/60 focus:border-[#0F766E] focus:outline-none shadow-2xs transition"
            />
          </div>
        </div>

        {/* Queue Table: Clear Structured Table without decorative fluff */}
        <div className="bg-white rounded-2xl border border-[#DCE7E4] shadow-xs overflow-hidden">
          {isLoading && cases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#17343A]">Loading patient cases...</p>
              <p className="text-xs text-[#52656B]">Connecting to clinical database</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#52656B]/40 mx-auto" />
              <p className="text-sm font-bold text-[#17343A]">No intake records found for this filter.</p>
              <p className="text-xs text-[#52656B]">
                New submissions from the patient kiosk will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FAF9] border-b border-[#DCE7E4] text-[#52656B] uppercase font-semibold text-3xs tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Patient & Reference</th>
                    <th className="py-3 px-4">Age / Lang</th>
                    <th className="py-3 px-4">Received Time</th>
                    <th className="py-3 px-4">Attention Flags</th>
                    <th className="py-3 px-4">AI Processing</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE7E4]">
                  {filteredCases.map((c) => (
                    <tr
                      key={c.caseId}
                      onClick={() => openCaseDetail(c.caseId)}
                      className="hover:bg-[#F7FAF9] transition cursor-pointer group"
                    >
                      {/* Patient & Reference */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E8F3EF] text-[#0F766E] flex items-center justify-center font-bold text-xs shrink-0">
                            {c.patientName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#17343A] group-hover:text-[#0F766E] transition block">
                              {c.patientName}
                            </span>
                            <span className="font-mono text-3xs text-[#52656B]">
                              {c.caseId} • Rev {c.revision}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Age / Lang */}
                      <td className="py-3.5 px-4 text-[#334155]">
                        <span className="font-medium">{c.age} Y</span>
                      </td>

                      {/* Timestamps */}
                      <td className="py-3.5 px-4 text-[#52656B] text-2xs font-mono">
                        {new Date(c.serverReceivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>

                      {/* Attention Flags (Kept Separate from AI Summary Status) */}
                      <td className="py-3.5 px-4">
                        {c.redFlagCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#FEE2E2] border border-[#EF4444]/30 text-[#991B1B] text-2xs font-bold">
                            <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                            <span>{c.redFlagCount} Flag{c.redFlagCount > 1 ? "s" : ""}</span>
                          </span>
                        ) : (
                          <span className="text-[#52656B] text-2xs font-medium">None detected</span>
                        )}
                      </td>

                      {/* AI Summary Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-2xs font-semibold px-2.5 py-1 rounded-full inline-block ${
                            c.summaryStatus === "generated"
                              ? "bg-[#E8F3EF] text-[#0F766E] border border-[#0F766E]/20"
                              : "bg-[#F7FAF9] text-[#52656B] border border-[#DCE7E4]"
                          }`}
                        >
                          {c.summaryStatus === "generated" ? "Ready for review" : "AI summary pending"}
                        </span>
                      </td>

                      {/* Staff Review Status */}
                      <td className="py-3.5 px-4">
                        {c.acknowledgedAt ? (
                          <span className="inline-flex items-center gap-1 text-2xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="text-2xs text-[#52656B] font-medium">Pending physician</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-[#52656B] group-hover:text-[#0F766E] group-hover:translate-x-0.5 transition inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Case Detail Modal */}
      {selectedCase && (
        <CaseDetailModal
          caseRecord={selectedCase}
          onClose={() => setSelectedCase(null)}
          onSaveReview={handleSaveReview}
        />
      )}
    </div>
  );
}
