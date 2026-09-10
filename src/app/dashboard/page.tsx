'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import {
  SAMPLE_KITS,
  SAMPLE_STRIPE_KIT,
  SAMPLE_JOB_DESCRIPTIONS,
  PrepKit,
  Question,
  Flashcard,
  ScheduleDay
} from '../../data/sampleKit';
import { KitService, GenerateKitPayload } from '../../services/kit.service';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  // All loaded kits
  const [kits, setKits] = useState<PrepKit[]>(SAMPLE_KITS);
  const [activeKit, setActiveKit] = useState<PrepKit>(SAMPLE_STRIPE_KIT);

  // Responsive and hover-expandable sidebar state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(false);

  // Desktop effective sidebar expansion state
  const isSidebarExpanded = isSidebarPinned || isSidebarHovered;

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'generating' | 'review'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'readiness' | 'questions' | 'name'>('date');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Interactive Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPipelineLogOpen, setIsPipelineLogOpen] = useState(false);
  const [isManualNotesOpen, setIsManualNotesOpen] = useState(false);
  const [manualNotesText, setManualNotesText] = useState('');

  // Toast / Notification
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // New Kit Form State
  const [formJd, setFormJd] = useState(SAMPLE_JOB_DESCRIPTIONS[0].jd);
  const [formUrl, setFormUrl] = useState(SAMPLE_JOB_DESCRIPTIONS[0].url);
  const [formDays, setFormDays] = useState(SAMPLE_JOB_DESCRIPTIONS[0].days);
  const [formCompany, setFormCompany] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('READY');
  const [generationLogs, setGenerationLogs] = useState<{ stage: string; message: string; timestamp: string }[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Practice Mode (Flashcards) State
  const [cardIndex, setCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardConfidence, setCardConfidence] = useState<Record<string, 'none' | 'somewhat' | 'confident'>>({});
  const [practiceFilter, setPracticeFilter] = useState<'all' | 'unmastered' | 'unpracticed'>('all');

  // Builder State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'system-design' | 'behavioural' | 'company-fit'>('all');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editOutline, setEditOutline] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<1 | 2 | 3>(2);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newOutline, setNewOutline] = useState('');
  const [newCategory, setNewCategory] = useState<Question['category']>('technical');
  const [newDifficulty, setNewDifficulty] = useState<1 | 2 | 3>(2);

  // Batch Upload State
  const [batchCases, setBatchCases] = useState<any[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchLogs, setBatchLogs] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);

  // Datadog Live Simulation State
  const [datadogProgress, setDatadogProgress] = useState(75);

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
            cadenceNote: k.cadenceNote || 'Active prep schedule',
            lastPracticedNote: k.lastPracticedNote || 'Ready to review'
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

  // Keyboard shortcut listener ('N' for New Kit, 'Cmd/Ctrl+K' for search, Space/1/2/3 for Practice)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setIsGenerateModalOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('kits-global-search')?.focus();
      }

      if (isPracticeOpen) {
        if (e.code === 'Space' || e.key === 'Enter') {
          e.preventDefault();
          setIsCardFlipped((prev) => !prev);
        } else if (e.key === '1' || e.key === 'ArrowLeft') {
          e.preventDefault();
          handleRecordConfidence('none');
        } else if (e.key === '2' || e.key === 'ArrowDown') {
          e.preventDefault();
          handleRecordConfidence('somewhat');
        } else if (e.key === '3' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleRecordConfidence('confident');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPracticeOpen, cardIndex, activeKit]);

  // Filter & Search Logic
  const filteredKits = kits.filter((kit) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'ready' && kit.status !== 'ready') return false;
      if (statusFilter === 'generating' && kit.status !== 'generating') return false;
      if (statusFilter === 'review' && kit.status !== 'review') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCompany = kit.source?.company?.toLowerCase().includes(q);
      const matchRole = kit.role?.title?.toLowerCase().includes(q);
      const matchTags = kit.tags?.some((t) => t.toLowerCase().includes(q));
      const matchQuestions = kit.questions?.some((qu) => qu.prompt.toLowerCase().includes(q));
      if (!matchCompany && !matchRole && !matchTags && !matchQuestions) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'date') return (a.interviewInDays || 99) - (b.interviewInDays || 99);
    if (sortBy === 'readiness') return (b.masteryPercentage || 0) - (a.masteryPercentage || 0);
    if (sortBy === 'questions') return (b.questions?.length || 0) - (a.questions?.length || 0);
    if (sortBy === 'name') return (a.source?.company || '').localeCompare(b.source?.company || '');
    return 0;
  });

  // Calculate high-level summary metrics
  const upcomingCount = kits.filter((k) => (k.interviewInDays || 0) <= 7).length;
  const totalQuestionsPrepared = kits.reduce((acc, k) => acc + (k.questions?.length || 0), 0);
  const avgReadiness = Math.round(
    kits.reduce((acc, k) => acc + (k.masteryPercentage || 50), 0) / (kits.length || 1)
  );

  // --- Kit Actions ---
  const handleOpenBuilder = (kit: PrepKit) => {
    setActiveKit(kit);
    setIsBuilderOpen(true);
    setEditingQuestionId(null);
    setIsAddingQuestion(false);
  };

  const handleStartPractice = (kit: PrepKit) => {
    setActiveKit(kit);
    setCardIndex(0);
    setIsCardFlipped(false);
    setIsPracticeOpen(true);
  };

  const handleOpenSchedule = (kit: PrepKit) => {
    setActiveKit(kit);
    setIsScheduleOpen(true);
  };

  const handleExportSummary = () => {
    const summaryData = {
      exportedAt: new Date().toISOString(),
      totalKits: kits.length,
      kits: kits.map((k) => ({
        company: k.source?.company,
        role: k.role?.title,
        interviewInDays: k.interviewInDays,
        readiness: `${k.masteryPercentage || 0}%`,
        questionsCount: k.questions?.length || 0,
        flashcardsCount: k.flashcards?.length || 0
      }))
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PrepKit-Summary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Executive summary exported successfully', 'success');
  };

  // --- Real-Time Kit Generation Streaming ---
  const handleStartGeneration = async () => {
    if (!formJd.trim() || !formUrl.trim()) {
      showToast('Please provide both a Job Description and Company URL', 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationLogs([]);
    setGenerationProgress(10);
    setGenerationStage('EXTRACTION');

    const addLog = (stage: string, msg: string) => {
      setGenerationStage(stage);
      setGenerationLogs((prev) => [
        ...prev,
        { stage, message: msg, timestamp: new Date().toLocaleTimeString() }
      ]);
    };

    addLog('INIT', 'Connecting to real-time interview pipeline...');

    try {
      const payload: GenerateKitPayload = {
        jd: formJd,
        company_url: formUrl,
        days: Number(formDays) || 5,
        company_name: formCompany.trim() || undefined
      };

      setGenerationProgress(30);

      const generated = await KitService.generateKitStream(payload, (stage, message) => {
        addLog(stage, message);
        if (stage.includes('CRAWL')) setGenerationProgress(50);
        if (stage.includes('SYNTHESIS')) setGenerationProgress(75);
        if (stage.includes('COVERAGE')) setGenerationProgress(90);
      });

      setGenerationProgress(100);
      addLog('DONE', 'Kit compiled & validated against Appendix A!');

      const enhancedKit: PrepKit = {
        ...generated,
        status: 'ready',
        statusBadge: 'Ready to Practice',
        urgencyBadge: `Interview in ${formDays} Days`,
        interviewInDays: Number(formDays) || 7,
        interviewDateStr: `In ${formDays} days`,
        levelBadge: generated.role?.seniority || 'Mid/Senior',
        tags: [generated.source?.company || 'Company', 'AI Generated'],
        questionMixSummary: `${generated.questions?.length || 0} Questions Generated`,
        masteredCount: 0,
        totalCards: generated.flashcards?.length || 0,
        masteryPercentage: 0,
        currentCadenceDay: 1,
        totalCadenceDays: Number(formDays) || 5,
        cadenceNote: 'Kickoff syllabus initialized',
        lastPracticedNote: 'Just created'
      };

      setKits((prev) => [enhancedKit, ...prev]);
      setActiveKit(enhancedKit);
      showToast(`Prep kit created for ${generated.role?.title || 'Role'} at ${generated.source?.company || 'Company'}!`, 'success');
      setTimeout(() => {
        setIsGenerateModalOpen(false);
        setIsGenerating(false);
      }, 1200);
    } catch (err: any) {
      addLog('ERROR', err.message || 'Pipeline encountered a network or rate limit. Fallback ready.');
      showToast('Generation fallback applied', 'info');
      setIsGenerating(false);
    }
  };

  // --- Flashcard Confidence Recording ---
  const getFilteredFlashcards = (): Flashcard[] => {
    const cards = activeKit.flashcards || [];
    if (practiceFilter === 'unmastered') {
      return cards.filter((c) => cardConfidence[c.id] !== 'confident');
    }
    if (practiceFilter === 'unpracticed') {
      return cards.filter((c) => !cardConfidence[c.id]);
    }
    return cards;
  };

  const activeCards = getFilteredFlashcards();
  const currentCard = activeCards[cardIndex] || activeKit.flashcards?.[0];

  const handleRecordConfidence = (confidence: 'none' | 'somewhat' | 'confident') => {
    if (!currentCard) return;
    setCardConfidence((prev) => ({ ...prev, [currentCard.id]: confidence }));
    setIsCardFlipped(false);

    const kitId = activeKit._id || activeKit.id;
    if (kitId) {
      KitService.recordConfidence(kitId, currentCard.id, confidence).catch(() => {});
    }

    if (cardIndex < activeCards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      showToast('Completed current flashcard deck run!', 'success');
    }
  };

  // --- Builder Question Actions ---
  const handleSaveQuestion = (qId: string) => {
    setActiveKit((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? { ...q, prompt: editPrompt, answer_outline: editOutline, difficulty: editDifficulty, isEdited: true, isPinned: true }
          : q
      )
    }));
    setEditingQuestionId(null);
    showToast('Question updated and pinned', 'success');
  };

  const handleTogglePin = (qId: string) => {
    setActiveKit((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId ? { ...q, isPinned: !q.isPinned } : q
      )
    }));
  };

  const handleDeleteQuestion = (qId: string) => {
    setActiveKit((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId)
    }));
    showToast('Question removed from kit', 'info');
  };

  const handleCreateQuestion = () => {
    if (!newPrompt.trim()) return;
    const newQ: Question = {
      id: `q_user_${Date.now()}`,
      requirement_ids: [],
      category: newCategory,
      prompt: newPrompt,
      answer_outline: newOutline,
      difficulty: newDifficulty,
      isEdited: true,
      isPinned: true
    };

    setActiveKit((prev) => ({
      ...prev,
      questions: [newQ, ...prev.questions]
    }));
    setIsAddingQuestion(false);
    setNewPrompt('');
    setNewOutline('');
    showToast('Custom question added to kit', 'success');
  };

  // --- Batch Upload Handlers ---
  const handleBatchFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const cases = Array.isArray(parsed) ? parsed : [parsed];
        setBatchCases(cases);
        showToast(`Loaded ${cases.length} roles ready for batch processing`, 'info');
      } catch {
        showToast('Invalid JSON file format. Must be a JSON array of roles.', 'error');
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
      const name = c.company_name || c.company || `Role #${i + 1}`;
      setBatchProgress({ current: i + 1, total: batchCases.length });
      setBatchLogs((prev) => [...prev, `[${i + 1}/${batchCases.length}] Crawling & synthesizing ${name}...`]);

      try {
        const kitResult = await KitService.generateKit({
          jd: c.jd || c.jobDescription || '',
          company_url: c.company_url || c.url || '',
          days: Number(c.days) || 5,
          company_name: name
        });

        const enriched: PrepKit = {
          ...kitResult,
          status: 'ready',
          statusBadge: 'Ready to Practice',
          urgencyBadge: `Interview in ${c.days || 7} Days`,
          interviewInDays: Number(c.days) || 7,
          interviewDateStr: `In ${c.days || 7} days`,
          levelBadge: kitResult.role?.seniority || 'Mid/Senior',
          tags: [name, 'Batch Import'],
          questionMixSummary: `${kitResult.questions?.length || 0} Questions`,
          masteredCount: 0,
          totalCards: kitResult.flashcards?.length || 0,
          masteryPercentage: 0,
          currentCadenceDay: 1,
          totalCadenceDays: Number(c.days) || 5
        };

        setKits((prev) => [enriched, ...prev]);
        setBatchLogs((prev) => [...prev, `✔ Successfully compiled kit for ${name}`]);
      } catch (err: any) {
        setBatchLogs((prev) => [...prev, `✖ Fallback for ${name}: ${err.message}`]);
      }
    }

    setIsBatchRunning(false);
    showToast(`Batch processing completed!`, 'success');
  };

  return (
    <ProtectedRoute>
      <div className="bg-background font-body-md text-body-md text-on-surface min-h-screen relative flex flex-col selection:bg-primary-container selection:text-white">
        
        {/* Soft Ambient Mesh Background Glows for Glassmorphic Depth */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute top-[-10%] left-[12%] w-[650px] h-[650px] rounded-full bg-indigo-400/10 blur-[130px]" />
          <div className="absolute top-[30%] right-[-5%] w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[140px]" />
          <div className="absolute bottom-[0%] left-[25%] w-[700px] h-[700px] rounded-full bg-violet-400/10 blur-[150px]" />
          <div className="absolute top-[65%] right-[20%] w-[500px] h-[500px] rounded-full bg-emerald-400/8 blur-[120px]" />
        </div>

        {/* Toast Notification Alert */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-space-xs px-space-md py-space-sm rounded-xl shadow-xl border text-label-md font-semibold transition-all transform animate-in fade-in slide-in-from-bottom-5 glass-card ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-950 border-emerald-300'
                : notification.type === 'error'
                ? 'bg-rose-500/10 text-rose-950 border-rose-300'
                : 'bg-indigo-500/10 text-indigo-950 border-indigo-300'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {notification.type === 'success' ? 'check_circle' : notification.type === 'error' ? 'error' : 'info'}
            </span>
            <span>{notification.text}</span>
          </div>
        )}

        {/* Mobile Sidebar Overlay Backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            aria-hidden="true"
          />
        )}

        {/* ========================================================================= */}
        {/* HOVER-COLLAPSIBLE EXECUTIVE GLASSMORPHIC SIDEBAR */}
        {/* Desktop: compact icon rail (w-20) that expands to w-64 on hover (or lock pinned) */}
        {/* Mobile: slide-over drawer (w-64) */}
        {/* ========================================================================= */}
        <aside
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
          className={`fixed left-0 top-0 h-full z-50 flex flex-col justify-between glass-sidebar transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? 'translate-x-0 w-64'
              : '-translate-x-full lg:translate-x-0 ' + (isSidebarExpanded ? 'w-64 shadow-2xl shadow-indigo-950/10' : 'w-20')
          }`}
        >
          {/* Top Section */}
          <div className="flex flex-col">
            {/* Header / Brand with Professional Emblem */}
            <div className="h-header-height px-3 sm:px-4 flex items-center justify-between border-b border-white/60">
              <Link href="/" className="flex items-center gap-3 group min-w-0">
                {/* Professional Neural-Prism Geometric Logo */}
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/30 shrink-0 group-hover:scale-105 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3-8 4.5v9L12 21l8-4.5v-9L12 3Z" />
                    <path d="M12 12 4 7.5" />
                    <path d="m12 12 8-4.5" />
                    <path d="M12 12v9" />
                    <circle cx="12" cy="12" r="2.2" fill="#67f4b7" stroke="none" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
                </div>

                {/* Brand text (shown when expanded) */}
                <div
                  className={`flex flex-col min-w-0 transition-opacity duration-200 ${
                    isSidebarExpanded ? 'opacity-100' : 'opacity-0 hidden lg:hidden'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-black bg-gradient-to-r from-zinc-950 via-indigo-950 to-primary bg-clip-text text-transparent truncate">
                      PrepKit<span className="text-primary font-black ml-0.5">AI</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[10px] tracking-wider uppercase font-extrabold border border-primary/25">
                      PRO
                    </span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-code-metric truncate tracking-wide">
                    ENTERPRISE STUDIO
                  </span>
                </div>
              </Link>

              {/* Pin Sidebar Lock Button (desktop) or Close Button (mobile) */}
              <div className="flex items-center gap-1">
                {isSidebarExpanded && (
                  <button
                    onClick={() => setIsSidebarPinned(!isSidebarPinned)}
                    className={`hidden lg:flex p-1.5 rounded-lg transition-colors ${
                      isSidebarPinned
                        ? 'bg-primary-fixed text-primary'
                        : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
                    }`}
                    title={isSidebarPinned ? 'Unpin Sidebar (Auto-collapse on mouse leave)' : 'Pin Sidebar Open'}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {isSidebarPinned ? 'push_pin' : 'keep'}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden p-1 rounded-lg text-on-surface-variant hover:bg-white/60 transition-colors"
                  aria-label="Close sidebar"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Workspace Selector (Full when expanded, compact icon when minimized) */}
            <div className="px-2 sm:px-3 py-space-xs">
              {isSidebarExpanded ? (
                <div className="w-full p-2.5 glass-panel rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/90 transition-all">
                  <div className="flex flex-col min-w-0 pr-1">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      Personal Workspace
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
                      Free tier · {kits.length} of 5 kits
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] shrink-0">
                    unfold_more
                  </span>
                </div>
              ) : (
                <div
                  className="w-12 h-10 mx-auto glass-panel rounded-xl flex items-center justify-center cursor-pointer hover:bg-white/90 transition-all group relative"
                  title="Personal Workspace (4 of 5 kits)"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    workspaces
                  </span>
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Personal Workspace
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Menu Links with Tooltips in Minimized Mode */}
            <nav className="px-2 sm:px-3 pt-space-xs flex flex-col gap-1.5">
              {/* Item 1: Dashboard */}
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-xl font-label-md text-label-md transition-all text-left relative group ${
                  isSidebarExpanded
                    ? 'px-3 py-2.5 justify-between'
                    : 'w-12 h-11 mx-auto justify-center'
                } ${
                  statusFilter === 'all'
                    ? 'bg-primary text-on-primary font-semibold shadow-md shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-white/70 hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[21px] shrink-0">space_dashboard</span>
                  {isSidebarExpanded && <span className="truncate">Dashboard / My Kits</span>}
                </div>
                {isSidebarExpanded && (
                  <span
                    className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm text-[11px] ${
                      statusFilter === 'all'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed font-bold'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {kits.length} Active
                  </span>
                )}

                {/* Minimized Tooltip */}
                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Dashboard / My Kits ({kits.length})
                  </div>
                )}
              </button>

              {/* Item 2: Create New Kit */}
              <button
                onClick={() => {
                  setIsGenerateModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/70 hover:text-on-surface transition-all text-left relative group ${
                  isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-12 h-11 mx-auto justify-center'
                }`}
              >
                <span className="material-symbols-outlined text-[21px] text-primary shrink-0">add_circle</span>
                {isSidebarExpanded && <span className="truncate">Create New Kit</span>}

                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Create New Kit
                  </div>
                )}
              </button>

              {/* Item 3: Practice Mode */}
              <button
                onClick={() => {
                  handleStartPractice(activeKit);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/70 hover:text-on-surface transition-all text-left relative group ${
                  isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-12 h-11 mx-auto justify-center'
                }`}
              >
                <span className="material-symbols-outlined text-[21px] shrink-0">style</span>
                {isSidebarExpanded && <span className="truncate">Practice Mode</span>}

                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Practice Mode
                  </div>
                )}
              </button>

              {/* Item 4: Interview Schedules */}
              <button
                onClick={() => {
                  handleOpenSchedule(activeKit);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/70 hover:text-on-surface transition-all text-left relative group ${
                  isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-12 h-11 mx-auto justify-center'
                }`}
              >
                <span className="material-symbols-outlined text-[21px] shrink-0">calendar_today</span>
                {isSidebarExpanded && <span className="truncate">Interview Schedules</span>}

                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Interview Schedules
                  </div>
                )}
              </button>

              {/* Item 5: Question Archive */}
              <button
                onClick={() => {
                  handleOpenBuilder(activeKit);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/70 hover:text-on-surface transition-all text-left relative group ${
                  isSidebarExpanded ? 'px-3 py-2.5 gap-3' : 'w-12 h-11 mx-auto justify-center'
                }`}
              >
                <span className="material-symbols-outlined text-[21px] shrink-0">bookmark</span>
                {isSidebarExpanded && <span className="truncate">Question Archive</span>}

                {!isSidebarExpanded && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                    Question Archive
                  </div>
                )}
              </button>
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col p-2 sm:p-3 gap-2 border-t border-white/60">
            {/* Live Pipeline Running Indicator */}
            {isSidebarExpanded ? (
              <div
                onClick={() => setIsPipelineLogOpen(true)}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600/90 to-teal-700/90 text-white flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity shadow-sm"
                title="Click to view live generation logs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping shrink-0"></span>
                  <span className="font-label-sm text-label-sm text-white truncate font-medium">
                    1 pipeline running
                  </span>
                </div>
                <span className="material-symbols-outlined text-emerald-200 text-[16px] shrink-0 animate-spin">
                  autorenew
                </span>
              </div>
            ) : (
              <div
                onClick={() => setIsPipelineLogOpen(true)}
                className="w-12 h-10 mx-auto rounded-xl bg-emerald-600/90 text-white flex items-center justify-center cursor-pointer hover:opacity-95 transition-opacity relative group shadow-sm"
                title="1 pipeline running"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping"></span>
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                  1 pipeline running
                </div>
              </div>
            )}

            {/* Settings & Integrations */}
            <button
              onClick={() => showToast('Settings & Integrations are managed via workspace policies', 'info')}
              className={`flex items-center rounded-xl font-label-md text-label-md text-on-surface-variant hover:bg-white/70 hover:text-on-surface transition-all text-left relative group ${
                isSidebarExpanded ? 'px-3 py-2 gap-3' : 'w-12 h-10 mx-auto justify-center'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">tune</span>
              {isSidebarExpanded && <span className="truncate">Settings &amp; Integrations</span>}

              {!isSidebarExpanded && (
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                  Settings &amp; Integrations
                </div>
              )}
            </button>

            {/* User Profile Card */}
            {isSidebarExpanded ? (
              <div className="p-2 glass-panel rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shrink-0 shadow-xs">
                    {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AC'}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                      {user?.name || 'Alex Chen'}
                    </span>
                    <span className="font-label-sm text-[11px] text-on-surface-variant truncate">
                      {user?.email || 'alex.chen@example.com'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-on-surface-variant hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <div
                className="w-12 h-11 mx-auto flex items-center justify-center relative group cursor-pointer"
                onClick={logout}
                title="Logged in as Alex Chen"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-label-md text-label-md font-bold shadow-xs ring-2 ring-white">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AC'}
                </div>
                <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-zinc-900 text-white text-xs font-semibold whitespace-nowrap shadow-lg pointer-events-none z-50 transition-all opacity-0 scale-95 origin-left group-hover:opacity-100 group-hover:scale-100">
                  {user?.name || 'Alex Chen'} · Click to Logout
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Header & Body Wrapper (Adapts padding dynamically) */}
        <div
          className={`transition-all duration-300 ${
            isSidebarPinned ? 'lg:pl-64' : 'lg:pl-20'
          }`}
        >
          {/* Glassmorphic Sticky Header */}
          <header
            className={`fixed top-0 right-0 h-header-height glass-header z-40 px-4 sm:px-space-xl flex items-center justify-between transition-all duration-300 ${
              isSidebarPinned ? 'left-0 lg:left-64' : 'left-0 lg:left-20'
            }`}
          >
            {/* Left: Mobile Drawer Button & Glass Search Bar */}
            <div className="flex items-center gap-space-sm flex-1 max-w-xl">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-white/80 transition-colors shrink-0"
                aria-label="Open navigation menu"
              >
                <span className="material-symbols-outlined text-[22px]">menu</span>
              </button>

              <div className="relative flex items-center w-full">
                <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                  search
                </span>
                <input
                  id="kits-global-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-12 rounded-xl glass-panel text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                  placeholder="Search kits, companies, questions, or skills..."
                  type="text"
                />
                <span className="hidden sm:inline absolute right-2.5 px-2 py-0.5 rounded-lg bg-white/70 font-code-metric text-code-metric text-[11px] text-on-surface-variant border border-white">
                  ⌘K
                </span>
              </div>
            </div>

            {/* Right: Session badge, New Kit, Notifications, Avatar */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-on-surface-variant font-label-sm text-label-sm shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Logged in as {user?.name || 'Alex Chen'} · Session valid 3h 42m</span>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(true)}
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/25 active:scale-95"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span className="hidden sm:inline">New Kit</span>
              </button>

              <button
                onClick={() => showToast('All 5 candidate preparation pipelines operational', 'info')}
                className="relative p-2 rounded-xl glass-pill hover:bg-white text-on-surface-variant hover:text-on-surface transition-colors shadow-xs"
                type="button"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-on-primary font-bold text-xs shadow-xs ring-2 ring-white">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
            </div>
          </header>

          {/* Main Body Content */}
          <main className="w-full pt-header-height">
            <div className="max-w-container-max mx-auto px-4 sm:px-space-md md:px-space-xl py-space-xl">
              <div className="flex flex-col w-full">
                
                {/* Top Command & Header Zone */}
                <div className="flex flex-col gap-space-lg mb-space-xl">
                  {/* Breadcrumb & Header Title Area */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-2xs uppercase tracking-wider">
                        <span>Workspaces</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span className="text-primary font-bold">Personal</span>
                        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                        <span>Interview Kits</span>
                      </div>
                      <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                        My Interview Kits
                      </h1>
                      <p className="font-body-md text-body-md text-on-surface-variant mt-space-2xs max-w-2xl leading-relaxed">
                        Manage role-specific prep kits, track readiness milestones, and launch active study sessions.
                      </p>
                    </div>

                    {/* Quick Action Group */}
                    <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
                      <button
                        onClick={handleExportSummary}
                        className="h-9 px-space-md rounded-xl glass-card text-on-surface font-label-md text-label-md font-semibold hover:bg-white transition-all shadow-xs flex items-center gap-space-xs active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                          download
                        </span>
                        <span>Export Summary</span>
                      </button>

                      <button
                        onClick={() => setIsGenerateModalOpen(true)}
                        className="h-9 px-space-md rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 transition-all shadow-md shadow-indigo-500/25 flex items-center gap-space-xs active:scale-95"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        <span>Create New Kit</span>
                        <span className="ml-space-2xs px-1.5 py-0.5 rounded bg-white/20 font-code-metric text-code-metric text-[11px] leading-none">
                          N
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Glassmorphic Key Metric Summary Bento Cards (4-Grid) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                    {/* Card 1: Upcoming Interviews */}
                    <div className="glass-card glass-card-hover p-space-lg rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                          Upcoming Interviews
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[18px]">event</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                          {upcomingCount}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          scheduled rounds
                        </span>
                      </div>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs text-rose-700 font-label-sm text-label-sm bg-rose-50/80 px-space-xs py-1 rounded-lg border border-rose-200/60">
                        <span className="material-symbols-outlined text-[14px]">alarm</span>
                        <span className="font-medium">Next: Stripe in 3 days</span>
                      </div>
                    </div>

                    {/* Card 2: Questions Prepared */}
                    <div className="glass-card glass-card-hover p-space-lg rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                          Questions Prepared
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[18px]">quiz</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                          {totalQuestionsPrepared || 142}
                        </span>
                        <span className="font-label-sm text-label-sm text-emerald-700 font-bold">
                          +28 this wk
                        </span>
                      </div>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                        <span>4 core evaluation categories</span>
                      </div>
                    </div>

                    {/* Card 3: Overall Readiness */}
                    <div className="glass-card glass-card-hover p-space-lg rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                          Overall Readiness
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[18px]">insights</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                          {avgReadiness || 78}%
                        </span>
                        {/* Circular SVG Progress Ring */}
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-surface-container-high"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3.5"
                          ></path>
                          <path
                            className="text-primary"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="currentColor"
                            strokeDasharray="78, 100"
                            strokeLinecap="round"
                            strokeWidth="3.5"
                          ></path>
                        </svg>
                      </div>
                      <div className="mt-space-sm pt-space-xs flex items-center gap-space-2xs text-on-surface-variant font-label-sm text-label-sm">
                        <span>Weighted flashcard accuracy</span>
                      </div>
                    </div>

                    {/* Card 4: Study Streak */}
                    <div className="glass-card glass-card-hover p-space-lg rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-space-xs">
                        <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                          Study Streak
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
                          <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-space-xs">
                        <span className="font-display-lg text-display-lg text-on-surface font-bold tracking-tight">
                          5 Days
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                          on track
                        </span>
                      </div>
                      <div className="mt-space-sm pt-space-xs flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>Target: 45 min/day</span>
                        <span className="font-code-metric text-emerald-700 font-bold">Today: 52m</span>
                      </div>
                    </div>
                  </div>

                  {/* Filter, Search, and Tab Segment Toolbar (Glassmorphic capsule) */}
                  <div className="p-2 glass-panel rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-sm">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto p-0.5 no-scrollbar">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-xl font-label-md text-label-md font-semibold transition-all whitespace-nowrap ${
                          statusFilter === 'all'
                            ? 'bg-white text-on-surface shadow-xs border border-white'
                            : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
                        }`}
                        type="button"
                      >
                        All Kits{' '}
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px]">
                          {kits.length}
                        </span>
                      </button>

                      <button
                        onClick={() => setStatusFilter('ready')}
                        className={`px-3 py-1.5 rounded-xl font-label-md text-label-md transition-all whitespace-nowrap ${
                          statusFilter === 'ready'
                            ? 'bg-white text-on-surface font-semibold shadow-xs border border-white'
                            : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
                        }`}
                        type="button"
                      >
                        Ready to Practice{' '}
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                          {kits.filter((k) => k.status === 'ready').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setStatusFilter('generating')}
                        className={`px-3 py-1.5 rounded-xl font-label-md text-label-md transition-all whitespace-nowrap ${
                          statusFilter === 'generating'
                            ? 'bg-white text-on-surface font-semibold shadow-xs border border-white'
                            : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
                        }`}
                        type="button"
                      >
                        Generating{' '}
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                          {kits.filter((k) => k.status === 'generating').length}
                        </span>
                      </button>

                      <button
                        onClick={() => setStatusFilter('review')}
                        className={`px-3 py-1.5 rounded-xl font-label-md text-label-md transition-all whitespace-nowrap ${
                          statusFilter === 'review'
                            ? 'bg-white text-on-surface font-semibold shadow-xs border border-white'
                            : 'text-on-surface-variant hover:bg-white/60 hover:text-on-surface'
                        }`}
                        type="button"
                      >
                        Needs Review{' '}
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          {kits.filter((k) => k.status === 'review').length}
                        </span>
                      </button>
                    </div>

                    {/* Search & Sort Actions */}
                    <div className="flex items-center gap-space-xs shrink-0 flex-wrap">
                      <div className="relative flex items-center min-w-[220px] flex-1 sm:flex-initial">
                        <span className="material-symbols-outlined absolute left-2.5 text-on-surface-variant text-[16px]">
                          search
                        </span>
                        <input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full h-8 pl-8 pr-3 rounded-xl bg-white/70 text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:bg-white border border-white/80 transition-all"
                          placeholder="Filter by company, role, tag..."
                          type="text"
                        />
                      </div>

                      <div className="h-5 w-px bg-white/80 mx-1 hidden sm:block"></div>

                      {/* Sort Dropdown */}
                      <select
                        value={sortBy}
                        onChange={(e: any) => setSortBy(e.target.value)}
                        className="h-8 px-2.5 rounded-xl bg-white/70 text-on-surface font-label-md text-label-md flex items-center gap-space-2xs hover:bg-white transition-colors cursor-pointer outline-none border border-white/80"
                      >
                        <option value="date">Sort: Interview Date</option>
                        <option value="readiness">Sort: Readiness %</option>
                        <option value="questions">Sort: Question Count</option>
                        <option value="name">Sort: Company Name</option>
                      </select>

                      {/* View Mode Toggle */}
                      <button
                        onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                        className={`h-8 w-8 rounded-xl bg-white/70 flex items-center justify-center transition-all border border-white/80 ${
                          viewMode === 'grid' ? 'text-primary bg-white shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                        title={viewMode === 'list' ? 'Switch to Grid View' : 'Switch to List View'}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {viewMode === 'list' ? 'view_agenda' : 'grid_view'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Glassmorphic Kit Cards Stack */}
                <div className={`flex flex-col gap-space-md ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : ''}`}>
                  {filteredKits.length === 0 ? (
                    <div className="p-12 text-center glass-card rounded-2xl">
                      <span className="material-symbols-outlined text-[40px] text-outline mb-2">
                        search_off
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        No interview kits match your filter
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-1">
                        Try resetting your search query or status filter.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="mt-4 px-4 py-2 rounded-xl bg-white font-label-md text-label-md font-semibold text-on-surface border border-white/80 shadow-xs"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    filteredKits.map((kitItem) => {
                      const isStripe = kitItem.source?.company === 'Stripe';
                      const isDatadog = kitItem.source?.company === 'Datadog';
                      const isLinear = kitItem.source?.company === 'Linear';
                      const isAirbnb = kitItem.source?.company === 'Airbnb';
                      const isOpenAI = kitItem.source?.company === 'OpenAI';

                      return (
                        <div
                          key={kitItem.id || kitItem._id || kitItem.source?.company}
                          className="glass-card glass-card-hover p-space-lg rounded-2xl flex flex-col gap-space-md relative overflow-hidden"
                        >
                          {/* Accent Top Indicator Strip */}
                          {isStripe && (
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-indigo-500 to-cyan-400"></div>
                          )}

                          {/* Card Header */}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-sm">
                            <div className="flex items-start gap-space-md min-w-0">
                              {/* Avatar Initials Badge */}
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-headline-sm shrink-0 shadow-sm ${
                                  isStripe
                                    ? 'bg-gradient-to-tr from-primary to-indigo-600 text-white'
                                    : isAirbnb
                                    ? 'bg-gradient-to-tr from-rose-500 to-amber-500 text-white'
                                    : isDatadog
                                    ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                                    : isLinear
                                    ? 'bg-gradient-to-tr from-zinc-800 to-zinc-950 text-white'
                                    : 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white'
                                }`}
                              >
                                {kitItem.source?.company ? kitItem.source.company[0] : 'K'}
                              </div>

                              <div className="flex flex-col min-w-0">
                                <div className="flex flex-wrap items-center gap-space-xs mb-1">
                                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">
                                    {kitItem.source?.company || 'Company'}
                                  </span>
                                  <span className="text-outline text-[14px]">•</span>
                                  <span className="font-headline-sm text-headline-sm text-on-surface-variant truncate">
                                    {kitItem.role?.title || 'Role'}
                                  </span>

                                  {/* Status Pill */}
                                  {kitItem.status === 'ready' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-label-sm text-label-sm font-semibold flex items-center gap-1 border border-emerald-200/60 shadow-xs">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                      Ready to Practice
                                    </span>
                                  )}

                                  {kitItem.status === 'generating' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-label-sm text-label-sm font-semibold flex items-center gap-1.5 border border-indigo-200/60 shadow-xs">
                                      <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                                      <span>{kitItem.statusBadge || 'Generating Pipeline (Step 5 of 6)'}</span>
                                    </span>
                                  )}

                                  {kitItem.status === 'review' && (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-label-sm text-label-sm font-semibold flex items-center gap-1 border border-amber-200/60 shadow-xs">
                                      <span className="material-symbols-outlined text-[14px]">warning</span>
                                      Site Unreachable (Partial)
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
                                  {kitItem.tags && kitItem.tags.length > 0 ? (
                                    kitItem.tags.map((tag, tIdx) => (
                                      <React.Fragment key={tIdx}>
                                        {tIdx > 0 && <span>•</span>}
                                        <span className="flex items-center gap-1">
                                          {tIdx === 0 && <span className="material-symbols-outlined text-[14px]">apartment</span>}
                                          {tag}
                                        </span>
                                      </React.Fragment>
                                    ))
                                  ) : (
                                    <span>Engineering • System Architecture</span>
                                  )}
                                  {kitItem.levelBadge && (
                                    <>
                                      <span>•</span>
                                      <span className="px-2 py-0.5 rounded-md glass-pill font-code-metric text-code-metric text-[11px] font-semibold text-primary">
                                        {kitItem.levelBadge}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Urgency Badge */}
                            <div className="flex items-center gap-space-xs shrink-0 self-start">
                              <div
                                className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-xs ${
                                  (kitItem.interviewInDays || 99) <= 3
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : (kitItem.interviewInDays || 99) <= 8
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'glass-pill text-on-surface-variant'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {(kitItem.interviewInDays || 99) <= 3 ? 'priority_high' : 'calendar_today'}
                                </span>
                                <span>
                                  Interview in {kitItem.interviewInDays || 7} Days{' '}
                                  {kitItem.interviewDateStr ? `(${kitItem.interviewDateStr})` : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle Section: Active Monitor (Datadog) OR Fallback Notice (Linear) OR Metrics Section (Standard) */}
                          {isDatadog ? (
                            /* Active Processing Pipeline Monitor Bar */
                            <div className="p-space-md glass-panel rounded-2xl flex flex-col gap-space-xs">
                              <div className="flex items-center justify-between text-body-sm">
                                <div className="flex items-center gap-space-xs">
                                  <span className="material-symbols-outlined text-primary text-[18px] animate-spin">
                                    sync
                                  </span>
                                  <span className="font-semibold text-on-surface">
                                    Synthesizing category question banks...
                                  </span>
                                </div>
                                <span className="font-code-metric text-code-metric font-bold text-primary">
                                  {datadogProgress}%
                                </span>
                              </div>
                              <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-primary to-cyan-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${datadogProgress}%` }}
                                ></div>
                              </div>
                              <div className="flex flex-wrap items-center gap-space-md mt-1 text-on-surface-variant font-label-sm text-label-sm">
                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                  <span className="material-symbols-outlined text-[14px]">check</span> Company site crawled
                                </span>
                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                  <span className="material-symbols-outlined text-[14px]">check</span> Discussions indexed
                                </span>
                                <span className="flex items-center gap-1 text-primary font-semibold">
                                  <span className="material-symbols-outlined text-[14px]">dataset</span> 32 draft questions ready
                                </span>
                              </div>
                            </div>
                          ) : isLinear ? (
                            /* Warning & Degradation Notice Box */
                            <div className="p-space-md bg-amber-500/10 rounded-2xl border border-amber-200/70 flex items-start gap-space-sm">
                              <span className="material-symbols-outlined text-amber-600 text-[20px] shrink-0 mt-0.5">
                                info
                              </span>
                              <div className="flex flex-col gap-1 min-w-0 text-on-surface">
                                <span className="font-label-md text-label-md font-semibold text-amber-900">
                                  Needs Review • Generated from JD text fallback
                                </span>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                  linear.app/careers returned a 403 bot-check challenge during automated crawling.
                                  Pipeline completed using provided job description text only. You can supplement engineering notes to sharpen the kit.
                                </p>
                              </div>
                            </div>
                          ) : (
                            /* Metrics & Progress Section */
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md p-space-md glass-panel rounded-2xl">
                              <div className="flex flex-col gap-1">
                                <span className="font-label-sm text-label-sm text-on-surface-variant">
                                  Question Mix
                                </span>
                                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                  {kitItem.questions?.length || 42} Questions
                                </span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                                  {kitItem.questionMixSummary || '18 Tech • 12 Sys Design • 8 Behavioral • 4 Fit'}
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    Flashcard Mastery
                                  </span>
                                  <span className="font-code-metric text-code-metric text-emerald-700 font-bold">
                                    {kitItem.masteredCount || 29} / {kitItem.totalCards || kitItem.flashcards?.length || 42} ({kitItem.masteryPercentage || 69}%)
                                  </span>
                                </div>
                                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="bg-emerald-600 h-full rounded-full"
                                    style={{ width: `${kitItem.masteryPercentage || 69}%` }}
                                  ></div>
                                </div>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  High confidence ratings
                                </span>
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                                    Study Cadence
                                  </span>
                                  <span className="font-code-metric text-code-metric text-primary font-bold">
                                    Day {kitItem.currentCadenceDay || 1} of {kitItem.totalCadenceDays || kitItem.schedule?.days_available || 7}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  {Array.from({ length: kitItem.totalCadenceDays || 7 }).map((_, i) => (
                                    <span
                                      key={i}
                                      className={`h-2 flex-1 rounded-full ${
                                        i < (kitItem.currentCadenceDay || 1)
                                          ? 'bg-primary'
                                          : 'bg-surface-container-high'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {kitItem.cadenceNote || 'Active prep cadence'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Bottom Bar */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm pt-space-xs border-t border-white/60">
                            <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
                              {isDatadog ? (
                                <span>Est. completion in ~45 seconds • AI model: Claude 3.5 Sonnet</span>
                              ) : isLinear ? (
                                <span>24 base questions generated • 0 supplementary docs</span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px] text-emerald-600">
                                    check_circle
                                  </span>
                                  <span>{kitItem.lastPracticedNote || 'Last practiced recently'}</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-space-xs w-full sm:w-auto justify-end flex-wrap">
                              {isDatadog ? (
                                <>
                                  <button
                                    onClick={() => showToast('Generation cancellation requested', 'info')}
                                    className="h-9 px-space-md rounded-xl text-rose-700 font-label-md text-label-md font-semibold hover:bg-rose-50 transition-colors active:scale-95"
                                    type="button"
                                  >
                                    Cancel Generation
                                  </button>
                                  <button
                                    onClick={() => setIsPipelineLogOpen(true)}
                                    className="h-9 px-space-md rounded-xl glass-panel text-on-surface font-label-md text-label-md font-semibold hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                                    <span>View Live Generation Log</span>
                                  </button>
                                </>
                              ) : isLinear ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setActiveKit(kitItem);
                                      setIsManualNotesOpen(true);
                                    }}
                                    className="h-9 px-space-md rounded-xl glass-panel text-on-surface font-label-md text-label-md font-semibold hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">note_add</span>
                                    <span>Provide Manual Notes</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenBuilder(kitItem)}
                                    className="h-9 px-space-md rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 transition-colors shadow-md shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">build</span>
                                    <span>Review &amp; Refine</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleOpenBuilder(kitItem)}
                                    className="h-9 px-space-md rounded-xl glass-panel text-on-surface font-label-md text-label-md font-semibold hover:bg-white transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">tune</span>
                                    <span>Open Kit Builder</span>
                                  </button>

                                  <button
                                    onClick={() => handleStartPractice(kitItem)}
                                    className="h-9 px-space-md rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 transition-colors shadow-md shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95"
                                    type="button"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                    <span>{isAirbnb ? 'Continue Practice' : 'Start Flashcard Drill'}</span>
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleOpenSchedule(kitItem)}
                                className="h-9 w-9 rounded-xl glass-panel text-on-surface-variant hover:text-on-surface hover:bg-white flex items-center justify-center transition-colors active:scale-95 shadow-xs"
                                title="View Day-by-Day Schedule"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Glassmorphic Bulk Pipeline Ingestion Banner */}
                <div className="mt-space-xl p-space-lg rounded-2xl glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md border border-white/90">
                  <div className="flex items-center gap-space-md">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
                      <span className="material-symbols-outlined text-[24px]">layers</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Bulk Preparation Pipeline
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Need to prep for multiple companies at once? Try Batch Upload to parse multiple job specs simultaneously.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-space-xs shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setIsBatchModalOpen(true)}
                      className="h-9 px-space-md rounded-xl glass-panel text-on-surface font-label-md text-label-md font-semibold hover:bg-white transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[18px]">file_upload</span>
                      <span>Upload CSV / Batch JSON</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </main>
        </div>

        {/* ========================================================================= */}
        {/* MODAL 1: CREATE NEW KIT (AI Pipeline Stream) */}
        {/* ========================================================================= */}
        {isGenerateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-space-lg border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Create Bespoke Interview Kit
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Multi-pass crawler, discussion analyzer, and coverage engine
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isGenerating && setIsGenerateModalOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white/80 transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-space-lg space-y-4 overflow-y-auto">
                <div className="flex items-center gap-2 flex-wrap text-label-sm">
                  <span className="text-on-surface-variant font-semibold">Try sample preset:</span>
                  {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setFormJd(preset.jd);
                        setFormUrl(preset.url);
                        setFormDays(preset.days);
                        setFormCompany(preset.company);
                      }}
                      className="px-2.5 py-1 rounded-lg glass-panel text-on-surface hover:bg-white font-medium text-xs transition-colors"
                      type="button"
                    >
                      {preset.company}
                    </button>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Job Description (Pasted Text)
                  </label>
                  <textarea
                    rows={5}
                    value={formJd}
                    onChange={(e) => setFormJd(e.target.value)}
                    placeholder="Paste the full job posting text here..."
                    className="w-full p-3 rounded-xl glass-panel text-on-surface font-code-metric text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface font-semibold">
                      Company Website URL
                    </label>
                    <input
                      type="url"
                      value={formUrl}
                      onChange={(e) => setFormUrl(e.target.value)}
                      placeholder="https://company.com"
                      className="w-full h-9 px-3 rounded-xl glass-panel text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-md text-label-md text-on-surface font-semibold">
                      Days Until Interview (1-60)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formDays}
                      onChange={(e) => setFormDays(Number(e.target.value))}
                      className="w-full h-9 px-3 rounded-xl glass-panel text-on-surface font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80"
                    />
                  </div>
                </div>

                {isGenerating && (
                  <div className="p-4 rounded-xl glass-panel space-y-2 border border-primary/30">
                    <div className="flex items-center justify-between font-label-md text-label-md">
                      <span className="font-semibold text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                        <span>{generationStage}</span>
                      </span>
                      <span className="font-code-metric text-primary font-bold">{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-cyan-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                    <div className="max-h-28 overflow-y-auto space-y-1 pt-2 font-code-metric text-xs text-on-surface-variant">
                      {generationLogs.map((log, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-2">
                          <span className="text-outline shrink-0">{log.timestamp}</span>
                          <span className="font-semibold text-on-surface">[{log.stage}]</span>
                          <span>{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-space-md border-t border-white/60 bg-white/40 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Deterministic Pass 2 coverage loop will verify all must-have requirements
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={isGenerating}
                    onClick={() => setIsGenerateModalOpen(false)}
                    className="h-9 px-4 rounded-xl font-label-md text-label-md text-on-surface hover:bg-white transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isGenerating}
                    onClick={handleStartGeneration}
                    className="h-9 px-5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-label-md font-semibold hover:opacity-95 transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-indigo-500/25"
                  >
                    {isGenerating ? (
                      <>
                        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                        <span>Run Full Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: PRACTICE MODE (3D Flip Card Drill) */}
        {/* ========================================================================= */}
        {isPracticeOpen && currentCard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh]">
              {/* Top Header */}
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-on-tertiary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">style</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Practice Mode · {activeKit.source?.company || 'Company'}
                    </h3>
                    <span className="text-label-sm text-on-surface-variant font-code-metric">
                      Card {cardIndex + 1} of {activeCards.length} · Space to flip, 1/2/3 to rate
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={practiceFilter}
                    onChange={(e: any) => {
                      setPracticeFilter(e.target.value);
                      setCardIndex(0);
                      setIsCardFlipped(false);
                    }}
                    className="h-8 px-2 rounded-xl glass-panel text-xs font-semibold text-on-surface outline-none cursor-pointer"
                  >
                    <option value="all">All Cards</option>
                    <option value="unmastered">Unmastered Only</option>
                    <option value="unpracticed">Unpracticed Only</option>
                  </select>

                  <button
                    onClick={() => setIsPracticeOpen(false)}
                    className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* 3D Flip Card Body */}
              <div className="p-space-lg flex flex-col items-center justify-center min-h-[320px]">
                <div
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                  className="w-full max-w-lg h-72 cursor-pointer perspective-1000 group"
                >
                  <div
                    className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                      isCardFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* Front Face */}
                    <div className="absolute inset-0 backface-hidden p-6 rounded-2xl glass-card flex flex-col justify-between hover:border-primary transition-colors border border-white/90 shadow-lg">
                      <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-primary font-bold uppercase tracking-wider text-[10px]">
                          Prompt / Question
                        </span>
                        <span className="flex items-center gap-1 text-primary font-medium">
                          <span className="material-symbols-outlined text-[14px]">touch_app</span> Click or Space to reveal
                        </span>
                      </div>
                      <div className="font-headline-sm text-headline-sm text-on-surface text-center my-auto px-4 font-bold">
                        {currentCard.front}
                      </div>
                      <div className="flex items-center justify-between text-label-sm text-on-surface-variant">
                        <span>Tap to flip</span>
                        {cardConfidence[currentCard.id] && (
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[11px]">
                            Rated: {cardConfidence[currentCard.id]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Back Face */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 rounded-2xl glass-card flex flex-col justify-between border-2 border-primary/40 shadow-lg bg-white/90">
                      <div className="flex items-center justify-between text-label-sm text-primary">
                        <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold uppercase tracking-wider text-[10px]">
                          Answer Outline &amp; Invariants
                        </span>
                        <span className="text-on-surface-variant">Space to flip back</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-surface text-center my-auto px-4 leading-relaxed">
                        {currentCard.back}
                      </div>
                      <div className="text-center text-label-sm text-on-surface-variant">
                        Rate your confidence below
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice Controls */}
              <div className="p-space-md border-t border-white/60 bg-white/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    disabled={cardIndex === 0}
                    onClick={() => {
                      setCardIndex((prev) => Math.max(0, prev - 1));
                      setIsCardFlipped(false);
                    }}
                    className="p-1.5 rounded-xl glass-panel text-on-surface hover:bg-white disabled:opacity-40"
                    title="Previous Card"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="font-code-metric text-xs text-on-surface-variant font-semibold">
                    {cardIndex + 1} / {activeCards.length}
                  </span>
                  <button
                    disabled={cardIndex >= activeCards.length - 1}
                    onClick={() => {
                      setCardIndex((prev) => Math.min(activeCards.length - 1, prev + 1));
                      setIsCardFlipped(false);
                    }}
                    className="p-1.5 rounded-xl glass-panel text-on-surface hover:bg-white disabled:opacity-40"
                    title="Next Card"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRecordConfidence('none')}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>1. Need Review</span>
                  </button>
                  <button
                    onClick={() => handleRecordConfidence('somewhat')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>2. Somewhat</span>
                  </button>
                  <button
                    onClick={() => handleRecordConfidence('confident')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>3. Confident</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: THE BUILDER (Question Editor & Appendix A Contract) */}
        {/* ========================================================================= */}
        {isBuilderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-4xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Kit Builder &amp; Question Archive · {activeKit.source?.company || 'Company'}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Inline edit prompts, reorder questions, and pin custom adjustments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddingQuestion(true)}
                    className="h-8 px-3 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-xs font-semibold flex items-center gap-1 shadow-xs hover:opacity-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Add Question</span>
                  </button>

                  <button
                    onClick={() => setIsBuilderOpen(false)}
                    className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>

              {/* Category Filter */}
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/30 flex-wrap gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {(['all', 'technical', 'system-design', 'behavioural', 'company-fit'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all capitalize ${
                        selectedCategory === cat
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'glass-panel text-on-surface-variant hover:bg-white'
                      }`}
                    >
                      {cat.replace('-', ' ')}
                    </button>
                  ))}
                </div>

                <span className="font-code-metric text-xs text-on-surface-variant font-semibold">
                  {activeKit.questions?.filter((q) => selectedCategory === 'all' || q.category === selectedCategory).length} questions
                </span>
              </div>

              {/* Questions List */}
              <div className="p-space-lg overflow-y-auto space-y-3 flex-1">
                {isAddingQuestion && (
                  <div className="p-4 rounded-xl border border-primary/50 glass-card space-y-3 shadow-md">
                    <div className="flex items-center justify-between font-label-md font-bold text-primary">
                      <span>New Custom Question</span>
                      <button onClick={() => setIsAddingQuestion(false)} className="text-xs text-on-surface-variant">
                        Cancel
                      </button>
                    </div>
                    <input
                      value={newPrompt}
                      onChange={(e) => setNewPrompt(e.target.value)}
                      placeholder="Enter question prompt..."
                      className="w-full h-9 px-3 rounded-xl glass-panel text-xs font-medium"
                    />
                    <textarea
                      rows={2}
                      value={newOutline}
                      onChange={(e) => setNewOutline(e.target.value)}
                      placeholder="Expected answer key & outline..."
                      className="w-full p-2.5 rounded-xl glass-panel text-xs"
                    />
                    <div className="flex items-center justify-between">
                      <select
                        value={newCategory}
                        onChange={(e: any) => setNewCategory(e.target.value)}
                        className="h-8 px-2 rounded-xl glass-panel text-xs font-semibold"
                      >
                        <option value="technical">Technical</option>
                        <option value="system-design">System Design</option>
                        <option value="behavioural">Behavioural</option>
                        <option value="company-fit">Company Fit</option>
                      </select>

                      <button
                        onClick={handleCreateQuestion}
                        className="h-8 px-4 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary text-xs font-semibold shadow-xs"
                      >
                        Save New Question
                      </button>
                    </div>
                  </div>
                )}

                {activeKit.questions
                  ?.filter((q) => selectedCategory === 'all' || q.category === selectedCategory)
                  .map((q) => {
                    const isEditing = editingQuestionId === q.id;

                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-2xl glass-card border transition-all ${
                          q.isPinned
                            ? 'border-primary/40 shadow-sm'
                            : 'border-white/80'
                        }`}
                      >
                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              className="w-full h-9 px-3 rounded-xl glass-panel border border-primary font-medium text-xs text-on-surface"
                            />
                            <textarea
                              rows={3}
                              value={editOutline}
                              onChange={(e) => setEditOutline(e.target.value)}
                              className="w-full p-2.5 rounded-xl glass-panel text-xs text-on-surface"
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-on-surface-variant">Difficulty:</span>
                                {[1, 2, 3].map((d) => (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => setEditDifficulty(d as 1 | 2 | 3)}
                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                      editDifficulty === d
                                        ? 'bg-primary text-on-primary'
                                        : 'glass-panel text-on-surface-variant'
                                    }`}
                                  >
                                    Level {d}
                                  </button>
                                ))}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingQuestionId(null)}
                                  className="px-3 py-1.5 rounded-xl text-xs font-semibold hover:bg-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveQuestion(q.id)}
                                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary text-xs font-semibold shadow-xs"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-code-metric text-[11px] font-bold uppercase">
                                  {q.category}
                                </span>
                                <span className="px-2 py-0.5 rounded-full glass-pill font-code-metric text-[11px] text-on-surface-variant font-medium">
                                  Diff: {q.difficulty || 2}
                                </span>
                                {q.isPinned && (
                                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-[11px] font-bold flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[12px]">push_pin</span> Pinned
                                  </span>
                                )}
                              </div>
                              <h4 className="font-headline-sm text-sm font-bold text-on-surface mt-1">
                                {q.prompt}
                              </h4>
                              <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                                <span className="font-bold text-primary">Answer Key: </span>
                                {q.answer_outline}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleTogglePin(q.id)}
                                className={`p-1.5 rounded-xl hover:bg-white transition-colors ${
                                  q.isPinned ? 'text-primary' : 'text-on-surface-variant'
                                }`}
                                title={q.isPinned ? 'Unpin Question' : 'Pin Question'}
                              >
                                <span className="material-symbols-outlined text-[18px]">push_pin</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditingQuestionId(q.id);
                                  setEditPrompt(q.prompt);
                                  setEditOutline(q.answer_outline);
                                  setEditDifficulty(q.difficulty);
                                }}
                                className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white hover:text-on-surface"
                                title="Edit Question"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-1.5 rounded-xl text-on-surface-variant hover:bg-rose-50 hover:text-rose-600"
                                title="Delete Question"
                              >
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Footer */}
              <div className="p-space-md border-t border-white/60 bg-white/40 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Pinned items are preserved across multi-pass regenerations
                </span>
                <button
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-xs font-semibold shadow-xs"
                >
                  Done Editing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 4: INTERVIEW SCHEDULES (Deterministic Arithmetic Engine) */}
        {/* ========================================================================= */}
        {isScheduleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-3xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-space-xs">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Deterministic Study Schedule · {activeKit.source?.company}
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      {activeKit.schedule?.days?.length || 7} Days Allocated · Pure arithmetic integer minutes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-space-lg overflow-y-auto space-y-3">
                {activeKit.schedule?.days?.map((d) => (
                  <div
                    key={d.day}
                    className="p-4 rounded-2xl glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary font-bold font-code-metric flex items-center justify-center shrink-0 shadow-xs">
                        D{d.day}
                      </div>
                      <div>
                        <h4 className="font-headline-sm text-sm font-bold text-on-surface">
                          {d.focus}
                        </h4>
                        <span className="text-xs text-on-surface-variant font-code-metric">
                          {d.question_ids?.length || 1} question modules mapped
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="px-3 py-1 rounded-xl glass-pill font-code-metric text-xs font-bold text-primary">
                        {d.minutes || 60} mins
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-space-md border-t border-white/60 bg-white/40 flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Total prep time:{' '}
                  {activeKit.schedule?.days?.reduce((acc, cur) => acc + cur.minutes, 0) || 450} minutes
                </span>
                <button
                  onClick={() => setIsScheduleOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-xs font-semibold shadow-xs"
                >
                  Close Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 5: BATCH MULTI-ROLE UPLOAD */}
        {/* ========================================================================= */}
        {isBatchModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">layers</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Bulk Preparation Pipeline
                    </h3>
                    <p className="text-body-sm text-on-surface-variant">
                      Prepare for multiple interviews in a single batch pass
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => !isBatchRunning && setIsBatchModalOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-space-lg space-y-4 overflow-y-auto">
                <div className="p-6 rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center justify-center gap-2 text-center glass-panel">
                  <span className="material-symbols-outlined text-[36px] text-primary">upload_file</span>
                  <p className="font-headline-sm text-sm font-bold text-on-surface">
                    Upload Batch JSON of description-and-company pairs
                  </p>
                  <span className="text-xs text-on-surface-variant max-w-md">
                    Accepts an array of objects matching Section 9 contract (company_name, company_url, jd, days)
                  </span>
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleBatchFile}
                    className="mt-2 text-xs font-semibold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-on-primary hover:file:opacity-90 cursor-pointer"
                  />
                </div>

                {batchCases.length > 0 && (
                  <div className="p-3 rounded-xl glass-panel text-xs font-semibold text-on-surface flex items-center justify-between">
                    <span>Parsed {batchCases.length} roles ready for generation</span>
                    <button
                      disabled={isBatchRunning}
                      onClick={handleRunBatch}
                      className="px-3 py-1 rounded-xl bg-primary text-on-primary hover:opacity-90 disabled:opacity-50"
                    >
                      {isBatchRunning ? 'Processing...' : 'Run All Cases'}
                    </button>
                  </div>
                )}

                {isBatchRunning && batchProgress && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant">
                      <span>Case {batchProgress.current} of {batchProgress.total}</span>
                      <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary to-cyan-500 h-full rounded-full transition-all"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {batchLogs.length > 0 && (
                  <div className="p-3 rounded-xl glass-panel max-h-36 overflow-y-auto font-code-metric text-xs space-y-1 text-on-surface-variant">
                    {batchLogs.map((log, bIdx) => (
                      <div key={bIdx}>{log}</div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-space-md border-t border-white/60 bg-white/40 flex justify-end">
                <button
                  disabled={isBatchRunning}
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-1.5 rounded-xl glass-panel text-on-surface font-label-md text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 6: LIVE PIPELINE MONITOR (Datadog Live Stream) */}
        {/* ========================================================================= */}
        {isPipelineLogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 text-on-primary flex items-center justify-center font-bold shadow-xs">
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Live Generation Log · Datadog
                    </h3>
                    <p className="text-body-sm text-on-surface-variant font-code-metric">
                      Pipeline Step 5 of 6 · Synthesizing questions (75%)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPipelineLogOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-space-lg bg-zinc-950 text-zinc-200 font-code-metric text-xs space-y-2 overflow-y-auto max-h-96 rounded-b-2xl">
                <div className="text-emerald-400">✔ [Pass 1.1] Fetched robots.txt from docs.datadoghq.com (Status: 200 OK)</div>
                <div className="text-emerald-400">✔ [Pass 1.2] Discovered internal links: /careers, /blog/telemetry-engine, /handbook</div>
                <div className="text-emerald-400">✔ [Pass 1.3] Ranked links using URL keyword scoring heuristic (Score: 0.94)</div>
                <div className="text-emerald-400">✔ [Pass 2.1] Extracted 4 must-have requirements and 2 nice-to-haves from pasted JD</div>
                <div className="text-sky-400">⟳ [Pass 3.1] Generating 12 technical questions for time-series ingestion and Gorilla compression</div>
                <div className="text-sky-400">⟳ [Pass 3.2] Indexing Glassdoor &amp; Reddit public discussions for Principal Distributed Systems rounds</div>
                <div className="text-amber-400 animate-pulse">➤ [Active Step 5] Synthesizing question bank for Telemetry &amp; Log Processing...</div>
              </div>

              <div className="p-space-md border-t border-white/60 bg-white/40 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">
                  Est. completion in ~45 seconds · AI model: Claude 3.5 Sonnet
                </span>
                <button
                  onClick={() => setIsPipelineLogOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-xs font-semibold shadow-xs"
                >
                  Close Monitor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 7: MANUAL NOTES DIALOG (Linear Fallback) */}
        {/* ========================================================================= */}
        {isManualNotesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-lg glass-card rounded-2xl shadow-2xl border border-white/90 overflow-hidden flex flex-col">
              <div className="p-space-md border-b border-white/60 flex items-center justify-between bg-white/40">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">note_add</span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Provide Manual Engineering Notes · Linear
                  </h3>
                </div>
                <button
                  onClick={() => setIsManualNotesOpen(false)}
                  className="p-1.5 rounded-xl text-on-surface-variant hover:bg-white"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-space-lg space-y-3">
                <p className="text-body-sm text-on-surface-variant">
                  Because linear.app/careers returned a 403 challenge, you can paste company engineering principles, tech stack details, or handbook excerpts below:
                </p>
                <textarea
                  rows={6}
                  value={manualNotesText}
                  onChange={(e) => setManualNotesText(e.target.value)}
                  placeholder="e.g. Linear uses an optimistic client-first architecture with WebSockets, SQLite, and custom CRDTs..."
                  className="w-full p-3 rounded-xl glass-panel text-on-surface font-body-sm text-xs border border-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="p-space-md border-t border-white/60 bg-white/40 flex justify-end gap-2">
                <button
                  onClick={() => setIsManualNotesOpen(false)}
                  className="px-4 py-1.5 rounded-xl font-label-md text-xs text-on-surface glass-panel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setIsManualNotesOpen(false);
                    showToast('Supplementary engineering notes saved and integrated into Linear kit!', 'success');
                  }}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-on-primary font-label-md text-xs font-semibold shadow-xs"
                >
                  Save &amp; Refine Kit
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
