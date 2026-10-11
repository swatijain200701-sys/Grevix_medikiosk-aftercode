"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const sampleParam = searchParams.get("sample");
  
  const [isSampleMode, setIsSampleMode] = useState<boolean>(sampleParam === "true");
  const [cases, setCases] = useState<CaseQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(false);
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
      setNeedsAuth(false);
      return;
    }

    try {
      const res = await fetch("/api/cases");
      if (res.status === 401) {
        setNeedsAuth(true);
        setIsAuthenticatedStaff(false);
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error("Failed to load clinical intake queue from hospital server");
      const data = await res.json();
      setCases(data.cases || []);
      setIsAuthenticatedStaff(true);
      setNeedsAuth(false);
    } catch (err: any) {
      console.warn("Queue load warning:", err);
      setLoadError(err.message || "Unable to reach hospital database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sampleParam === "true") {
      setIsSampleMode(true);
      setNeedsAuth(false);
    } else {
      setIsSampleMode(false);
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
      if (!isSampleMode && !needsAuth) fetchCases();
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
      if (!res.ok) {
        if (res.status === 401) {
          alert("Staff session expired. Please sign in again.");
          router.push("/login");
          return;
        }
        throw new Error("Unable to load case detail from server");
      }
      const record = await res.json();
      setSelectedCase(record);
    } catch (err) {
      console.error("Open case error:", err);
    }
  };

  const handleSaveReview = async (caseId: string, notes: string, triage: string, ack: boolean) => {
    if (caseId.startsWith("sample-case-") || isSampleMode) {
      // Simulate local update on sample fixture
      setCases((prev) =>
        prev.map((c) =>
          c.caseId === caseId
            ? { ...c, acknowledgedAt: ack ? new Date().toISOString() : c.acknowledgedAt, triageCategory: triage as any }
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
      const res = await fetch(`/api/cases/${caseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffNotes: notes,
          triageCategory: triage,
          acknowledged: ack,
        }),
      });
      if (!res.ok) throw new Error("Failed to save staff review");
      await fetchCases();
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
    } catch (err) {
      console.error("Save review error:", err);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-heading)] flex flex-col font-sans selection:bg-[var(--btn-main)]/20 selection:text-[var(--btn-main)]">
      {/* Header */}
      <header className="border-b border-[var(--border-color)] bg-[var(--header-bg)] text-[var(--btn-main-text)] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4FD1C5] text-[#0B1B25] flex items-center justify-center font-bold text-base shadow-sm">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base leading-tight tracking-tight text-[var(--header-text)]">
                  MediKiosk Clinical Dashboard
                </h1>
                {isSampleMode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-mono font-bold bg-[var(--slate-accent)] text-[#4FD1C5] border border-[var(--border-color)]">
                    SYNTHETIC EXAMPLE VIEW
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-3xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                    LIVE OPD QUEUE
                  </span>
                )}
              </div>
              <p className="text-3xs text-[var(--header-text-muted)] font-medium">OPD Intake & Triage Review Station</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <a
              href={FEEDBACK_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="dashboard-feedback-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-color)] bg-[#122330] hover:bg-[#18303D] text-[#4FD1C5] text-xs font-semibold transition"
              title="Give Feedback"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Give feedback</span>
              <ExternalLink className="w-3 h-3 text-[var(--header-text-muted)]" />
            </a>

            {!isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF3C7] border border-[#F59E0B] text-[#92400E]">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline Mode</span>
              </span>
            ) : isSampleMode ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#122330] border border-[var(--border-color)] text-[var(--header-text)]">
                <Eye className="w-3.5 h-3.5 text-[#4FD1C5]" />
                <span className="hidden sm:inline">Synthetic Fixtures</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#4FD1C5]/20 border border-[#4FD1C5]/40 text-[#4FD1C5]">
                <Wifi className="w-3.5 h-3.5 text-[#4FD1C5]" />
                <span className="hidden sm:inline">Live Connected</span>
              </span>
            )}

            <button
              onClick={fetchCases}
              disabled={isLoading}
              className="p-2 rounded-xl border border-[var(--border-color)] bg-[#122330] hover:bg-[#18303D] text-[var(--header-text)] transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#4FD1C5]" : ""}`} />
            </button>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] text-xs font-bold transition shadow-sm"
            >
              <span>Patient Kiosk</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            {isAuthenticatedStaff && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl border border-[var(--border-color)] bg-[#122330] hover:bg-[#18303D] text-[var(--header-text-muted)] hover:text-[var(--header-text)] transition"
                title="Log out of Staff Session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Sample Mode Banner */}
        {isSampleMode && (
          <div className="p-4 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-color)] text-[var(--text-heading)] flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5 text-xs">
              <Eye className="w-4 h-4 text-[var(--btn-main)] shrink-0" />
              <span>
                <strong>Synthetic Demonstration Mode:</strong> This view presents fixed synthetic examples and never exposes real visitor or patient submissions. Real hospital records require staff sign in.
              </span>
            </div>
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-xl bg-[var(--btn-main)] text-[var(--btn-main-text)] text-xs font-bold hover:bg-[var(--btn-main-hover)] transition shadow-sm"
            >
              Staff Sign In
            </Link>
          </div>
        )}

        {/* Auth Required Barrier (when visiting /dashboard directly without credentials) */}
        {needsAuth && !isSampleMode ? (
          <div className="p-10 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-color)] text-center max-w-xl mx-auto space-y-5 shadow-lg my-12">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-panel)] text-[var(--btn-main)] flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[var(--text-heading)]">Staff Session Required</h2>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                The live clinical triage queue is restricted to authorized hospital personnel. To view synthetic fixtures without credentials, you can explore the public demonstration.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--btn-main)] text-[var(--btn-main-text)] text-sm font-bold hover:bg-[var(--btn-main-hover)] transition shadow-sm min-h-[48px] flex items-center justify-center"
              >
                Sign In to Staff Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSampleMode(true);
                  setNeedsAuth(false);
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-panel)] text-[var(--text-heading)] text-sm font-bold transition min-h-[48px]"
              >
                See Synthetic Example
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Queue Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1 shadow-sm">
                <span className="text-2xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Total Cases</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">{totalCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1 shadow-sm">
                <span className="text-2xs font-bold uppercase tracking-wider text-[#991B1B]">Attention Flags</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#991B1B]">{flaggedCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1 shadow-sm">
                <span className="text-2xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Pending Review</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--btn-main)]">{pendingReviewCount}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-1 shadow-sm">
                <span className="text-2xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Reviewed</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-heading)]">{reviewedCount}</p>
              </div>
            </div>

            {/* Filter and Search Controls */}
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: "all", label: "All Cases" },
                  { id: "flagged", label: "Flagged Only" },
                  { id: "ready", label: "Ready to Review" },
                  { id: "reviewed", label: "Reviewed" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition min-h-[38px] ${
                      filter === f.id
                        ? "bg-[var(--btn-main)] text-[var(--btn-main-text)] shadow-sm"
                        : "bg-[var(--bg-panel)] text-[var(--text-heading)] border border-[var(--border-color)] hover:bg-[#c9d8ce]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or case ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-heading)] placeholder-[#53665D] focus:border-[#356B62] outline-none min-h-[38px]"
                />
              </div>
            </div>

            {/* Patient Queue List */}
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[var(--border-color)] bg-[var(--bg-panel)] flex items-center justify-between">
                <h2 className="text-sm font-bold text-[var(--text-heading)]">
                  Patient Intake Records ({filteredCases.length})
                </h2>
                <span className="text-2xs text-[var(--text-muted)]">Sorted by arrival time</span>
              </div>

              {filteredCases.length === 0 ? (
                <div className="p-12 text-center text-[var(--text-muted)] space-y-2">
                  <p className="text-sm font-semibold">No intake cases match your filter criteria.</p>
                  <p className="text-2xs">Patients submitting from the kiosk terminal will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {filteredCases.map((c) => {
                    const hasFlags = c.redFlagCount > 0;
                    const isReviewed = !!c.acknowledgedAt;

                    return (
                      <div
                        key={c.caseId}
                        onClick={() => openCaseDetail(c.caseId)}
                        className="p-4 sm:p-5 hover:bg-[var(--bg-panel)]/50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--text-heading)]">
                              {c.patientName}
                            </span>
                            <span className="text-2xs font-mono text-[var(--text-muted)]">
                              #{c.caseId}
                            </span>
                            <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[var(--border-color)]">
                              Rev {c.revision}
                            </span>
                          </div>

                          <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                            {`Category: ${c.triageCategory.toUpperCase()} • Status: ${c.status}`}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {hasFlags && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B]">
                                <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                                {c.redFlagCount} Attention Flag{c.redFlagCount > 1 ? "s" : ""}
                              </span>
                            )}

                            {isReviewed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-[var(--bg-panel)] text-[var(--btn-main)] border border-[#356B62]/40">
                                <CheckCircle2 className="w-3 h-3" /> Reviewed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-bold bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]">
                                Awaiting Staff
                              </span>
                            )}

                            <span className="text-3xs text-[var(--text-muted)]">
                              {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[var(--btn-main)] hover:bg-[var(--btn-main-hover)] text-[var(--btn-main-text)] font-bold text-xs transition shadow-sm min-h-[38px]"
                          >
                            <span>Inspect Case</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading MediKiosk dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}