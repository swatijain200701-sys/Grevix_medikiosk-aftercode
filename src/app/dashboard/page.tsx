"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Wifi, WifiOff, RefreshCw, Search, ChevronRight, AlertTriangle, 
  CheckCircle2, Clock, FileText, Stethoscope, ArrowUpRight, LogOut,
  ShieldAlert, Activity, ClipboardCheck, Filter, ExternalLink, MessageSquare,
  Sparkles, Lock, UserCheck, Eye
} from "lucide-react";
import { CaseDetailModal } from "@/components/dashboard/CaseDetailModal";
import { FullCaseRecord, CaseQueueItem } from "@/lib/db/server-db";
import { SAMPLE_CASES, SAMPLE_QUEUE_ITEMS } from "@/lib/fixtures/sample-cases";

const FEEDBACK_FORM_URL = "https://forms.gle/UM6smWDSmxzCiAwh6";

function DashboardContent() {
  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("sample");
  
  const [isSampleMode, setIsSampleMode] = useState<boolean>(sampleParam === "true");
  const [cases, setCases] = useState<CaseQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<FullCaseRecord | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isAuthenticatedStaff, setIsAuthenticatedStaff] = useState<boolean>(false);

  const fetchCases = async () => {
    setIsLoading(true);
    setLoadError(null);

    // If explicit sample mode is selected, load fixed synthetic fixtures
    if (isSampleMode) {
      setCases(SAMPLE_QUEUE_ITEMS);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/cases");
      if (res.status === 401) {
        // Unauthenticated visitor -> gracefully default to sample mode
        setIsSampleMode(true);
        setCases(SAMPLE_QUEUE_ITEMS);
        setIsAuthenticatedStaff(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load clinical intake queue from hospital server");
      const data = await res.json();
      setCases(data.cases || []);
      setIsAuthenticatedStaff(true);
    } catch (err: any) {
      console.warn("Queue load warning:", err);
      // Fallback to sample fixtures if unable to reach live db
      setIsSampleMode(true);
      setCases(SAMPLE_QUEUE_ITEMS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sampleParam === "true") {
      setIsSampleMode(true);
    }
  }, [sampleParam]);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    fetchCases();
    const interval = setInterval(() => {
      if (!isSampleMode) fetchCases();
    }, 10000);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      clearInterval(interval);
    };
  }, [isSampleMode]);

  const openCaseDetail = async (caseId: string) => {
    // Check if it's a sample fixture
    if (caseId.startsWith("sample-case-") || isSampleMode) {
      const sample = SAMPLE_CASES.find((c) => c.caseId === caseId);
      if (sample) {
        setSelectedCase(sample);
        return;
      }
    }

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
    if (isSampleMode || caseId.startsWith("sample-case-")) {
      // Simulate review update locally in state for prototype demonstration
      setCases((prev) =>
        prev.map((c) =>
          c.caseId === caseId
            ? {
                ...c,
                triageCategory: triage,
                acknowledgedAt: ack ? new Date().toISOString() : c.acknowledgedAt,
              }
            : c
        )
      );
      if (selectedCase && selectedCase.caseId === caseId) {
        setSelectedCase({
          ...selectedCase,
          staffReview: {
            ...selectedCase.staffReview,
            staffNotes: notes,
            triageCategory: triage as any,
            acknowledgedAt: ack ? new Date().toISOString() : selectedCase.staffReview.acknowledgedAt,
          },
        });
      }
      return;
    }

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

  const totalCount = cases.length;
  const flaggedCount = cases.filter((c) => c.redFlagCount > 0).length;
  const pendingReviewCount = cases.filter((c) => !c.acknowledgedAt).length;
  const reviewedCount = cases.filter((c) => !!c.acknowledgedAt).length;

  return (
    <div className="min-h-screen bg-[#08121B] text-[#B6C7CF] flex flex-col font-sans selection:bg-[#50D6C5]/20 selection:text-[#50D6C5]">
      {/* Compact Clinical Navigation Bar */}
      <header className="border-b border-[#294350] bg-[#0C1924]/95 backdrop-blur-md px-4 sm:px-6 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#50D6C5] text-[#062820] flex items-center justify-center font-bold text-base shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base leading-tight tracking-tight text-[#F1F6F8]">
                  MediKiosk Clinical Dashboard
                </h1>
                {isSampleMode ? (
                  <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-[#18303D] text-[#50D6C5] border border-[#294350]">
                    SAMPLE DEMO VIEW
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-3xs font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    LIVE OPD QUEUE
                  </span>
                )}
              </div>
              <p className="text-3xs text-[#91A8B3] font-medium">OPD Intake & Triage Review Station</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Prominent Feedback Button */}
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="dashboard-feedback-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#50D6C5]/40 bg-[#122330] hover:bg-[#18303D] text-[#50D6C5] text-xs font-semibold transition"
              title="Give Feedback (opens Google Forms in new tab)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Give feedback</span>
              <ExternalLink className="w-3 h-3 text-[#91A8B3]" />
            </a>

            {!isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#261B0E] border border-[#854D0E] text-[#FBBF24]">
                <WifiOff className="w-3.5 h-3.5 text-[#FBBF24]" />
                <span className="hidden sm:inline">Offline - Freshness Limited</span>
              </span>
            ) : isSampleMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#18303D] border border-[#294350] text-[#B6C7CF]">
                <Eye className="w-3.5 h-3.5 text-[#50D6C5]" />
                <span className="hidden sm:inline">Synthetic Fixtures</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#50D6C5]/15 border border-[#50D6C5]/30 text-[#50D6C5]">
                <Wifi className="w-3.5 h-3.5 text-[#50D6C5]" />
                <span className="hidden sm:inline">Live Connected</span>
              </span>
            )}

            <button
              onClick={fetchCases}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-[#B6C7CF] transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#50D6C5]" : ""}`} />
            </button>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] text-xs font-bold transition shadow-sm"
            >
              <span>Patient Kiosk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {isAuthenticatedStaff ? (
              <Link
                href="/login"
                className="p-2 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#2B1417] hover:text-[#F87171] text-[#91A8B3] transition"
                title="Staff Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#294350] bg-[#18303D] hover:bg-[#203D4D] text-[#B6C7CF] text-xs font-medium transition"
                title="Clinical Staff Sign In"
              >
                <Lock className="w-3 h-3 text-[#50D6C5]" />
                <span>Staff Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Clinical Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Sample Mode Informational Banner */}
        {isSampleMode && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0C1924] border border-[#50D6C5]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm relative overflow-hidden">
            <div className="space-y-1 z-10 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-3xs uppercase font-mono font-bold text-[#50D6C5] tracking-wider">
                  PUBLIC PROTOTYPE DEMONSTRATION
                </span>
                <span className="text-2xs text-[#91A8B3]">• Session-Isolated</span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#F1F6F8]">
                Sample Clinical Staff Review View
              </h2>
              <p className="text-xs text-[#B6C7CF] leading-relaxed">
                Exploring fixed synthetic patient fixtures (Ramesh Kumar, Sunita Devi, Ananya Sharma). Other testers&apos; submissions are never exposed. Click any record to inspect clinical summaries, red flags, and doctor triage actions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 z-10 shrink-0">
              <a
                href={FEEDBACK_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#50D6C5] hover:bg-[#3ec4b3] text-[#062820] text-xs font-bold transition shadow-sm"
              >
                <span>Give feedback</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#062820]" />
              </a>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#18303D] hover:bg-[#203D4D] text-[#F1F6F8] text-xs font-semibold border border-[#294350] transition"
              >
                <Lock className="w-3.5 h-3.5 text-[#50D6C5]" />
                <span>Staff Sign In</span>
              </Link>
            </div>
          </div>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="p-4 rounded-xl bg-[#261B0E] border border-[#854D0E] text-[#FBBF24] text-xs flex items-start gap-2.5 shadow-sm">
            <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <strong className="block text-[#FBBF24]">Limited Data Freshness Warning:</strong>
              <span className="text-[#B6C7CF]">
                Operating offline. You are reviewing local queue snapshots. Cases submitted from kiosks will sync once server connection returns.
              </span>
            </div>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#122330] border border-[#294350] space-y-1">
            <span className="text-3xs uppercase tracking-wider font-semibold text-[#91A8B3] block">Total Intake Cases</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#F1F6F8]">{totalCount}</span>
              <FileText className="w-4 h-4 text-[#50D6C5]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#122330] border border-[#294350] space-y-1">
            <span className="text-3xs uppercase tracking-wider font-semibold text-[#F87171] block">Attention Flagged</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#F87171]">{flaggedCount}</span>
              <AlertTriangle className="w-4 h-4 text-[#F87171]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#122330] border border-[#294350] space-y-1">
            <span className="text-3xs uppercase tracking-wider font-semibold text-[#FBBF24] block">Pending Physician</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#FBBF24]">{pendingReviewCount}</span>
              <Clock className="w-4 h-4 text-[#FBBF24]" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#122330] border border-[#294350] space-y-1">
            <span className="text-3xs uppercase tracking-wider font-semibold text-[#50D6C5] block">Reviewed & Triage Signed</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#50D6C5]">{reviewedCount}</span>
              <CheckCircle2 className="w-4 h-4 text-[#50D6C5]" />
            </div>
          </div>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: `All Records (${totalCount})` },
              { id: "flagged", label: `Attention Flagged (${flaggedCount})` },
              { id: "ready", label: "Ready for Review" },
              { id: "awaiting_summary", label: "Awaiting Summary" },
              { id: "reviewed", label: "Reviewed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filter === tab.id
                    ? "bg-[#50D6C5] text-[#062820] shadow-sm font-bold"
                    : "bg-[#18303D] border border-[#294350] text-[#B6C7CF] hover:bg-[#203D4D] hover:text-[#F1F6F8]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#91A8B3] absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name, case ID..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-[#294350] bg-[#18303D] text-[#F1F6F8] placeholder-[#91A8B3] focus:border-[#50D6C5] focus:outline-none transition"
            />
          </div>
        </div>

        {/* Queue Table */}
        <div className="bg-[#122330] rounded-2xl border border-[#294350] shadow-xl overflow-hidden">
          {isLoading && cases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#50D6C5] animate-spin mx-auto" />
              <p className="text-sm font-semibold text-[#F1F6F8]">Loading patient cases...</p>
              <p className="text-xs text-[#91A8B3]">Connecting to clinical database</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-[#91A8B3]/40 mx-auto" />
              <p className="text-sm font-bold text-[#F1F6F8]">No intake records found for this filter.</p>
              <p className="text-xs text-[#91A8B3]">
                Try selecting "All Records" or clear your search query.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0C1924] border-b border-[#294350] text-[#91A8B3] uppercase font-semibold text-3xs tracking-wider">
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
                <tbody className="divide-y divide-[#294350]">
                  {filteredCases.map((c) => (
                    <tr
                      key={c.caseId}
                      onClick={() => openCaseDetail(c.caseId)}
                      className="hover:bg-[#18303D]/60 transition cursor-pointer group"
                    >
                      {/* Patient & Reference */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#18303D] text-[#50D6C5] border border-[#294350] flex items-center justify-center font-bold text-xs shrink-0">
                            {c.patientName ? c.patientName.charAt(0) : "P"}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-[#F1F6F8] group-hover:text-[#50D6C5] transition block">
                              {c.patientName}
                            </span>
                            <span className="font-mono text-3xs text-[#91A8B3]">
                              {c.caseId} • Rev {c.revision}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Age / Lang */}
                      <td className="py-3.5 px-4 text-[#B6C7CF]">
                        <span className="font-medium">{c.age} Y</span>
                        <span className="text-3xs uppercase font-mono ml-1.5 px-1 py-0.5 rounded bg-[#18303D] text-[#91A8B3]">
                          {c.language}
                        </span>
                      </td>

                      {/* Timestamps */}
                      <td className="py-3.5 px-4 text-[#91A8B3] text-2xs font-mono">
                        {c.serverReceivedAt
                          ? new Date(c.serverReceivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "Pending"}
                      </td>

                      {/* Attention Flags */}
                      <td className="py-3.5 px-4">
                        {c.redFlagCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#2B1417] border border-[#991B1B] text-[#F87171] text-2xs font-bold">
                            <AlertTriangle className="w-3 h-3 text-[#F87171]" />
                            <span>{c.redFlagCount} Flag{c.redFlagCount > 1 ? "s" : ""}</span>
                          </span>
                        ) : (
                          <span className="text-[#91A8B3] text-2xs font-medium">None detected</span>
                        )}
                      </td>

                      {/* AI Summary Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-2xs font-semibold px-2.5 py-1 rounded-full inline-block ${
                            c.summaryStatus === "generated"
                              ? "bg-[#50D6C5]/15 text-[#50D6C5] border border-[#50D6C5]/30"
                              : "bg-[#18303D] text-[#91A8B3] border border-[#294350]"
                          }`}
                        >
                          {c.summaryStatus === "generated" ? "Ready for review" : "AI summary pending"}
                        </span>
                      </td>

                      {/* Staff Review Status */}
                      <td className="py-3.5 px-4">
                        {c.acknowledgedAt ? (
                          <span className="inline-flex items-center gap-1 text-2xs px-2.5 py-0.5 rounded-md bg-emerald-950/60 text-emerald-400 border border-emerald-800 font-semibold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="text-2xs text-[#91A8B3] font-medium">Pending physician</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#50D6C5] group-hover:translate-x-0.5 transition">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
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

export default function StaffDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#08121B] flex items-center justify-center text-[#50D6C5]">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
