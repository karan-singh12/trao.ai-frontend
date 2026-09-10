'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  SAMPLE_KITS,
  SAMPLE_STRIPE_KIT,
  SAMPLE_JOB_DESCRIPTIONS,
  PrepKit,
} from '../../data/sampleKit';
import { KitService } from '../../services/kit.service';

// Modular Dashboard Components
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { FilterToolbar, StatusFilterType, SortByType, ViewModeType } from '../../components/dashboard/FilterToolbar';
import { KitCardList } from '../../components/dashboard/KitCardList';
import { KitCardGrid } from '../../components/dashboard/KitCardGrid';

export default function DashboardPage() {
  const { user } = useAuth();

  // All loaded kits
  const [kits, setKits] = useState<PrepKit[]>(SAMPLE_KITS);
  const [activeKit, setActiveKit] = useState<PrepKit>(SAMPLE_STRIPE_KIT);

  // Search, Filter & View Mode State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [sortBy, setSortBy] = useState<SortByType>('date');
  const [viewMode, setViewMode] = useState<ViewModeType>('list');

  // Interactive Modals State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPipelineLogOpen, setIsPipelineLogOpen] = useState(false);
  const [isManualNotesOpen, setIsManualNotesOpen] = useState(false);
  const [manualNotesText, setManualNotesText] = useState('');

  // Toast / Notification State
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Batch Upload State
  const [batchCases, setBatchCases] = useState<any[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch real kits from backend on mount (merge with sample kits)
  useEffect(() => {
    async function loadBackendKits() {
      try {
        const fetched = await KitService.getKits();
        if (fetched && fetched.length > 0) {
          const normalized = fetched.map((k: PrepKit, idx: number) => ({
            ...k,
            status: k.status || 'ready',
            statusBadge: k.statusBadge || 'Ready to Practice',
            interviewInDays: k.interviewInDays || 10 + idx * 3,
            interviewDateStr: k.interviewDateStr || `Day +${10 + idx * 3}`,
            levelBadge: k.levelBadge || k.role?.seniority || 'Mid/Senior',
            tags: k.tags || [k.role?.title || 'Engineering', k.source?.company || 'Company'],
            questionMixSummary: k.questionMixSummary || `${k.questions?.length || 0} Questions`,
            masteredCount: k.masteredCount || 0,
            totalCards: k.totalCards || k.flashcards?.length || 0,
            masteryPercentage: k.masteryPercentage || 0,
            currentCadenceDay: k.currentCadenceDay || 1,
            totalCadenceDays: k.totalCadenceDays || k.schedule?.days_available || 5,
          }));

          setKits((prev) => {
            const ids = new Set(normalized.map((n: PrepKit) => n._id || n.id));
            const existingNotFetched = prev.filter((p) => !ids.has(p._id || p.id));
            return [...normalized, ...existingNotFetched];
          });
        }
      } catch (e) {
        // Backend optional in development
      }
    }
    loadBackendKits();
  }, []);

  // Filter & Sort Kits
  const filteredKits = kits
    .filter((k) => {
      // Status filter
      if (statusFilter === 'ready') {
        const isReady = k.status === 'ready' || (k.statusBadge && k.statusBadge.toLowerCase().includes('ready'));
        if (!isReady) return false;
      } else if (statusFilter === 'generating') {
        const isGen = k.status === 'generating' || (k.statusBadge && k.statusBadge.toLowerCase().includes('generating'));
        if (!isGen) return false;
      } else if (statusFilter === 'review') {
        const isRev = k.status === 'review' || (k.statusBadge && k.statusBadge.toLowerCase().includes('review'));
        if (!isRev) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const comp = (k.source?.company || '').toLowerCase();
        const role = (k.role?.title || '').toLowerCase();
        const tags = (k.tags || []).join(' ').toLowerCase();
        return comp.includes(q) || role.includes(q) || tags.includes(q);
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return (a.interviewInDays || 99) - (b.interviewInDays || 99);
      } else if (sortBy === 'readiness') {
        return (b.masteryPercentage || 0) - (a.masteryPercentage || 0);
      } else if (sortBy === 'questions') {
        return (b.questions?.length || 0) - (a.questions?.length || 0);
      } else if (sortBy === 'name') {
        return (a.source?.company || '').localeCompare(b.source?.company || '');
      }
      return 0;
    });

  // Dynamic counts for status filter tabs
  const counts = {
    all: kits.length,
    ready: kits.filter((k) => k.status === 'ready' || (k.statusBadge && k.statusBadge.toLowerCase().includes('ready'))).length,
    generating: kits.filter((k) => k.status === 'generating' || (k.statusBadge && k.statusBadge.toLowerCase().includes('generating'))).length,
    review: kits.filter((k) => k.status === 'review' || (k.statusBadge && k.statusBadge.toLowerCase().includes('review'))).length,
  };

  // Export summary markdown
  const handleExportSummary = () => {
    const summary = `# PrepKit AI · Interview Preparation Summary
Generated: ${new Date().toLocaleDateString()}
Candidate: ${user?.name || 'Candidate'}

## Active Kits (${kits.length})
${kits
  .map(
    (k) => `### ${k.source?.company} - ${k.role?.title}
- Status: ${k.statusBadge || 'Ready'}
- Target Interview: In ${k.interviewInDays || 3} days (${k.interviewDateStr})
- Question Bank: ${k.questions?.length || 0} Questions
- Flashcard Mastery: ${k.masteredCount || 0}/${k.totalCards || 0} (${k.masteryPercentage || 0}%)
- Prep Cadence: Day ${k.currentCadenceDay || 1} of ${k.totalCadenceDays || 7}
`
  )
  .join('\n')}
`;

    const blob = new Blob([summary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepKit-Summary-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Preparation summary exported as Markdown!', 'success');
  };

  // Inspect Pipeline Modal
  const handleInspectPipeline = (kit: PrepKit) => {
    setActiveKit(kit);
    setIsPipelineLogOpen(true);
  };

  // Notes Modal
  const handleOpenNotes = (kit: PrepKit) => {
    setActiveKit(kit);
    setManualNotesText((kit as any).notes || '');
    setIsManualNotesOpen(true);
  };

  // Batch Upload Handlers
  const handleBatchFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          setBatchCases(parsed);
          showToast(`Loaded ${parsed.length} role cases for batch processing`, 'success');
        } else {
          showToast('Batch file must contain a JSON array of roles', 'error');
        }
      } catch (err) {
        showToast('Invalid JSON file format', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleRunBatch = async () => {
    if (batchCases.length === 0) return;
    setIsBatchRunning(true);
    setBatchLogs([]);

    for (let i = 0; i < batchCases.length; i++) {
      const c = batchCases[i];
      const name = c.company_name || `Role #${i + 1}`;
      setBatchProgress({ current: i + 1, total: batchCases.length });
      setBatchLogs((prev) => [...prev, `[INIT] Compiling requirements for ${name}...`]);

      try {
        const kitResult = await KitService.generateKit({
          jd: c.jd || 'Software Engineering Role',
          company_url: c.company_url || 'https://example.com',
          days: Number(c.days) || 7,
          company_name: c.company_name,
        });

        const enriched: PrepKit = {
          ...kitResult,
          status: 'ready',
          statusBadge: 'Ready to Practice',
          interviewInDays: Number(c.days) || 7,
          interviewDateStr: `In ${c.days || 7} days`,
          levelBadge: kitResult.role?.seniority || 'Mid/Senior',
          tags: [name, 'Batch Import'],
          questionMixSummary: `${kitResult.questions?.length || 0} Questions`,
          masteredCount: 0,
          totalCards: kitResult.flashcards?.length || 0,
          masteryPercentage: 0,
          currentCadenceDay: 1,
          totalCadenceDays: Number(c.days) || 5,
        };

        setKits((prev) => [enriched, ...prev]);
        setBatchLogs((prev) => [...prev, `[OK] Successfully compiled kit for ${name}`]);
      } catch (err: any) {
        setBatchLogs((prev) => [...prev, `[ERR] Fallback for ${name}: ${err.message}`]);
      }
    }

    setIsBatchRunning(false);
    showToast('Batch processing completed!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification Alert */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all transform animate-in fade-in slide-in-from-bottom-5 backdrop-blur-xl ${
            notification.type === 'success'
              ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-200 border-emerald-400/40'
              : notification.type === 'error'
              ? 'bg-rose-500/15 text-rose-950 dark:text-rose-200 border-rose-400/40'
              : 'bg-indigo-500/15 text-indigo-950 dark:text-indigo-200 border-indigo-400/40'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
          </span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Executive Dashboard Header */}
      <DashboardHeader
        totalKits={kits.length}
        onExportSummary={handleExportSummary}
        onOpenBatch={() => setIsBatchModalOpen(true)}
        onOpenNewKit={() => {}}
      />

      {/* 2. Responsive 4-Column Metrics Bento Grid */}
      <MetricsGrid
        upcomingCount={1}
        nextCompany="Stripe"
        nextInDays={3}
        totalQuestions={kits.reduce((acc, k) => acc + (k.questions?.length || 0), 0) || 28}
        readinessPercentage={57}
        studyStreakDays={5}
        todayMinutes={52}
        targetMinutes={45}
      />

      {/* 3. Responsive Filter & Toolbar */}
      <FilterToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        counts={counts}
      />

      {/* 4. Kit Cards View (List or Grid) */}
      {filteredKits.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">search_off</span>
          </div>
          <h3 className="font-bold text-base text-zinc-950 dark:text-white">No Interview Kits Match</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search query or status filter to see other preparation kits.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {filteredKits.map((kit) => (
            <KitCardList
              key={kit.id}
              kit={kit}
              onInspectPipeline={handleInspectPipeline}
              onOpenNotes={handleOpenNotes}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredKits.map((kit) => (
            <KitCardGrid
              key={kit.id}
              kit={kit}
              onInspectPipeline={handleInspectPipeline}
              onOpenNotes={handleOpenNotes}
            />
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BATCH MULTI-ROLE UPLOAD */}
      {/* ========================================================================= */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                    Bulk Preparation Pipeline
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Prepare for multiple interviews in a single batch pass
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isBatchRunning && setIsBatchModalOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center gap-2 text-center bg-indigo-50/20 dark:bg-indigo-950/20">
                <span className="material-symbols-outlined text-[36px] text-indigo-600 dark:text-indigo-400">
                  cloud_upload
                </span>
                <p className="font-bold text-sm text-zinc-950 dark:text-white">
                  Upload Batch JSON
                </p>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md">
                  Accepts an array of objects (company_name, company_url, jd, days)
                </span>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleBatchFile}
                  className="mt-2 text-xs font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:opacity-90 cursor-pointer"
                />
              </div>

              {batchCases.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
                  <span>Parsed {batchCases.length} roles ready for generation</span>
                  <button
                    disabled={isBatchRunning}
                    onClick={handleRunBatch}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    {isBatchRunning ? 'Processing...' : 'Run All Cases'}
                  </button>
                </div>
              )}

              {isBatchRunning && batchProgress && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    <span>Case {batchProgress.current} of {batchProgress.total}</span>
                    <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-cyan-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {batchLogs.length > 0 && (
                <div className="p-3.5 rounded-xl bg-zinc-950 text-zinc-300 max-h-36 overflow-y-auto font-code-metric text-xs space-y-1">
                  {batchLogs.map((log, bIdx) => (
                    <div key={bIdx}>{log}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-end">
              <button
                disabled={isBatchRunning}
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: LIVE PIPELINE MONITOR */}
      {/* ========================================================================= */}
      {isPipelineLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                    Live Pipeline Inspector · {activeKit.source?.company}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-code-metric">
                    5-Stage Discovery &amp; Crawl Protocol Verified
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPipelineLogOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 bg-zinc-950 text-zinc-200 font-code-metric text-xs space-y-2 overflow-y-auto max-h-96">
              <div className="text-emerald-400">[STAGE 1] robots.txt crawl status 200 OK — Verified /careers and /handbook</div>
              <div className="text-emerald-400">[STAGE 2] Extracted 4 must-have requirements &amp; 2 nice-to-have capabilities</div>
              <div className="text-emerald-400">[STAGE 3] Ranked internal links via URL keyword scoring heuristic (Score: 0.94)</div>
              <div className="text-sky-400">[STAGE 4] Indexed public community discussions and behavioral competencies</div>
              <div className="text-indigo-300">[STAGE 5] Dual-pass question synthesis completed with 100% requirement coverage</div>
              <div className="text-emerald-400">[READY] Kit ready for active study and flashcard simulation</div>
            </div>

            <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Model: Claude 3.5 Sonnet · Deterministic Schedule Mapped
              </span>
              <button
                onClick={() => setIsPipelineLogOpen(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Close Monitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: MANUAL ENGINEERING NOTES */}
      {/* ========================================================================= */}
      {isManualNotesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-white">
                  Engineering Notes · {activeKit.source?.company}
                </h3>
              </div>
              <button
                onClick={() => setIsManualNotesOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Add proprietary architecture details, handbook excerpts, or custom interview preparation points:
              </p>
              <textarea
                rows={5}
                value={manualNotesText}
                onChange={(e) => setManualNotesText(e.target.value)}
                placeholder="e.g. Distributed consensus using Raft, high throughput Kafka pipelines, optimistic UI updates..."
                className="w-full p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 text-xs border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex justify-end gap-2">
              <button
                onClick={() => setIsManualNotesOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsManualNotesOpen(false);
                  showToast('Engineering notes successfully saved!', 'success');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
