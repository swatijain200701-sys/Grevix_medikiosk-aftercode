'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, RefreshCw, Filter, Search, AlertTriangle, CheckCircle, 
  Clock, ArrowUpRight, Wifi, WifiOff, FileText, ChevronRight 
} from 'lucide-react';
import { CaseQueueItem, FullCaseRecord } from '@/lib/db/server-db';
import { CaseDetailModal } from '@/components/dashboard/CaseDetailModal';

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCase, setSelectedCase] = useState<FullCaseRecord | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const fetchCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data.cases || []);
      }
    } catch {
      // offline or error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
    setIsOnline(navigator.onLine);
    const handleOnline = () => { setIsOnline(true); fetchCases(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(fetchCases, 8000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const openCaseDetail = async (caseId: string) => {
    setIsDetailLoading(true);
    try {
      const res = await fetch(`/api/cases/${caseId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedCase(data);
      }
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleSaveReview = async (caseId: string, notes: string, triage: string, ack: boolean) => {
    const res = await fetch(`/api/cases/${caseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffNotes: notes, triageCategory: triage, acknowledged: ack }),
    });
    if (res.ok) {
      await fetchCases();
      // Update modal state
      if (selectedCase) {
        setSelectedCase(prev => prev ? {
          ...prev,
          staffReview: {
            ...prev.staffReview,
            staffNotes: notes,
            triageCategory: triage as any,
            acknowledgedAt: ack ? new Date().toISOString() : prev.staffReview.acknowledgedAt,
          }
        } : null);
      }
    }
  };

  const filteredCases = cases.filter(c => {
    if (filter === 'awaiting_summary' && c.summaryStatus !== 'pending' && c.summaryStatus !== 'unconfigured') return false;
    if (filter === 'ready' && (c.acknowledgedAt !== null || c.summaryStatus === 'pending')) return false;
    if (filter === 'reviewed' && c.acknowledgedAt === null) return false;
    if (filter === 'flagged' && c.redFlagCount === 0) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return c.patientName.toLowerCase().includes(q) || c.caseId.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B1D3A] flex flex-col font-sans">
      {/* Dashboard Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1D3A] text-white flex items-center justify-center font-bold text-lg">
              MD
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-[#0B1D3A]">
                MediKiosk Staff Dashboard
              </h1>
              <p className="text-xs text-slate-500 font-medium">OPD & Clinical Intake Queue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isOnline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-300 text-amber-800">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                Staff Browser Offline — Data Freshness Limited
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 border border-teal-200 text-teal-800">
                <Wifi className="w-3.5 h-3.5 text-teal-600" />
                Live Server Connected
              </span>
            )}

            <button
              onClick={fetchCases}
              disabled={isLoading}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            <Link
              href="/kiosk"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
            >
              Open Patient Kiosk
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Queue Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Offline Limitations Alert */}
        {!isOnline && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Note on offline limitations:</strong> The dashboard is currently offline. You are viewing locally available records. Newly submitted cases from other kiosks will appear once your internet connection is restored.
            </span>
          </div>
        )}

        {/* Controls: Search and Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: `All (${cases.length})` },
              { id: 'flagged', label: `Attention Flagged (${cases.filter(c => c.redFlagCount > 0).length})` },
              { id: 'ready', label: 'Ready for Review' },
              { id: 'awaiting_summary', label: 'Awaiting Summary' },
              { id: 'reviewed', label: 'Reviewed' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === tab.id
                    ? 'bg-[#0B1D3A] text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by patient name or ID..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Case Queue Table / Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {filteredCases.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-500 font-medium text-sm">No clinical intake records match this filter.</p>
              <p className="text-xs text-slate-400">Complete an intake on the patient kiosk to see it appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCases.map(c => (
                <div
                  key={c.caseId}
                  onClick={() => openCaseDetail(c.caseId)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-teal-50 text-slate-700 group-hover:text-teal-700 flex items-center justify-center font-bold text-sm transition">
                      {c.patientName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 transition">
                          {c.patientName}
                        </h3>
                        <span className="text-2xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          Rev {c.revision}
                        </span>
                        {c.redFlagCount > 0 && (
                          <span className="text-2xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {c.redFlagCount} Flag{c.redFlagCount > 1 ? 's' : ''}
                          </span>
                        )}
                        {c.acknowledgedAt && (
                          <span className="text-2xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Age: {c.age}</span>
                        <span>•</span>
                        <span className="font-mono text-3xs">ID: {c.caseId}</span>
                        <span>•</span>
                        <span>Recv: {new Date(c.serverReceivedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-2xs font-semibold px-2.5 py-1 rounded-full ${
                      c.summaryStatus === 'generated'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.summaryStatus === 'generated' ? 'AI Summary Ready' : 'Intake Synced (Summary Pending)'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition" />
                  </div>
                </div>
              ))}
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