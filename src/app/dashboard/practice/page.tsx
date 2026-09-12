'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Flashcard, PrepKit } from '../../../data/sampleKit';
import { KitService } from '../../../services/kit.service';

function PracticeContent() {
  const searchParams = useSearchParams();
  const kitIdParam = searchParams.get('kitId');

  const [kits, setKits] = useState<PrepKit[]>([]);
  const [activeKit, setActiveKit] = useState<PrepKit | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Practice state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardConfidence, setCardConfidence] = useState<Record<string, 'none' | 'somewhat' | 'confident'>>({});
  const [sortMode, setSortMode] = useState<'all' | 'least-confident' | 'unmastered'>('least-confident');

  // Load kits from backend API on mount or when kitIdParam changes
  useEffect(() => {
    async function loadKits() {
      setIsLoading(true);
      try {
        let loadedKits: PrepKit[] = [];

        // 1. Fetch user kits from MongoDB via KitService
        try {
          const backendKits = await KitService.getKits();
          if (backendKits && Array.isArray(backendKits)) {
            loadedKits = backendKits;
          }
        } catch (err) {
          console.warn('Could not load kits from backend API:', err);
        }

        if (loadedKits.length === 0) {
          setKits([]);
          setActiveKit(null);
          return;
        }

        setKits(loadedKits);

        // 4. Resolve the targeted kit
        let target: PrepKit | undefined;

        // A) If kitId param was passed in the URL
        if (kitIdParam) {
          target = loadedKits.find(
            (k) =>
              (k._id && String(k._id) === String(kitIdParam)) ||
              (k.id && String(k.id) === String(kitIdParam))
          );

          // If not in the list, attempt direct fetch by ID
          if (!target) {
            try {
              const directKit = await KitService.getKitById(kitIdParam);
              if (directKit) {
                target = directKit;
                loadedKits = [directKit, ...loadedKits.filter((k) => String(k._id || k.id) !== String(kitIdParam))];
                setKits(loadedKits);
              }
            } catch (e) {
              console.warn('Direct fetch kit by id failed:', e);
            }
          }
        }

        // B) If no param or not found, check localStorage
        let localKit: PrepKit | null = null;
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('active_kit') : null;
          if (stored) {
            localKit = JSON.parse(stored);
          }
        } catch (e) {}

        if (!target && localKit) {
          target = loadedKits.find(
            (k) =>
              (k._id && String(k._id) === String(localKit?._id || localKit?.id)) ||
              (k.id && String(k.id) === String(localKit?._id || localKit?.id))
          );
        }

        // C) Default to the first available kit
        if (!target) {
          target = loadedKits[0];
        }

        if (target) {
          setActiveKit(target);
          setCardIndex(0);
          setIsFlipped(false);
          try {
            localStorage.setItem('active_kit', JSON.stringify(target));
          } catch (e) {}
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadKits();
  }, [kitIdParam]);

  // Extract flashcards from activeKit (with fallback to questions if flashcards array is empty)
  const allCards: Flashcard[] = useMemo(() => {
    if (!activeKit) return [];

    if (activeKit.flashcards && activeKit.flashcards.length > 0) {
      return activeKit.flashcards;
    }

    // Dynamic generation from questions if flashcards array is not explicitly populated
    if (activeKit.questions && activeKit.questions.length > 0) {
      return activeKit.questions.map((q: any, idx: number) => ({
        id: q.id || `q_card_${idx + 1}`,
        front: q.prompt,
        back:
          q.answer_outline ||
          (q.rubric?.must_include && Array.isArray(q.rubric.must_include)
            ? `Key Concepts to Cover:\n• ${q.rubric.must_include.join('\n• ')}`
            : 'Key concepts: analyze trade-offs, architecture, and edge cases.'),
        requirement_ids: q.requirement_ids || [],
      }));
    }

    return [];
  }, [activeKit]);

  // Load confidence for activeKit whenever activeKit changes
  useEffect(() => {
    if (!activeKit) return;
    const kitId = activeKit._id || activeKit.id;
    const initialConfidence: Record<string, 'none' | 'somewhat' | 'confident'> = {};

    // 1. From flashcards on the kit
    if (activeKit.flashcards && Array.isArray(activeKit.flashcards)) {
      activeKit.flashcards.forEach((f) => {
        if (f.confidence && f.confidence !== 'none') {
          initialConfidence[f.id] = f.confidence;
        }
      });
    }

    // 2. From localStorage
    if (kitId) {
      try {
        const saved = localStorage.getItem(`confidence_${kitId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          Object.assign(initialConfidence, parsed);
        }
      } catch (e) {}
    }

    setCardConfidence(initialConfidence);
  }, [activeKit?._id, activeKit?.id]);

  // Spaced Repetition sorting logic (Least Confident First)
  const cards = useMemo(() => {
    const raw = [...allCards];
    const weight = (id: string): number => {
      const c = cardConfidence[id];
      if (c === 'none') return 1;
      if (c === 'somewhat') return 2;
      if (!c) return 3; // unrated
      return 4; // 'confident'
    };

    if (sortMode === 'least-confident') {
      return [...raw].sort((a, b) => weight(a.id) - weight(b.id));
    }
    if (sortMode === 'unmastered') {
      const unmastered = raw.filter((c) => cardConfidence[c.id] !== 'confident');
      return unmastered.length > 0 ? unmastered : raw;
    }
    return raw;
  }, [allCards, sortMode]);

  const currentCard = cards[cardIndex] || cards[0];

  const handleRate = (conf: 'none' | 'somewhat' | 'confident') => {
    if (!currentCard || !activeKit) return;
    const cardId = currentCard.id;
    const kitId = activeKit._id || activeKit.id;

    setCardConfidence((prev) => {
      const next = { ...prev, [cardId]: conf };
      if (kitId) {
        try {
          localStorage.setItem(`confidence_${kitId}`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });

    setIsFlipped(false);

    if (kitId) {
      KitService.recordConfidence(kitId, cardId, conf).catch(() => {});
    }

    if (cardIndex < cards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const handleSelectKit = (selectedId: string) => {
    const found = kits.find((k) => (k._id || k.id) === selectedId);
    if (found) {
      setActiveKit(found);
      setCardIndex(0);
      setIsFlipped(false);
      try {
        localStorage.setItem('active_kit', JSON.stringify(found));
      } catch (e) {}

      // Update URL search param cleanly
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('kitId', selectedId);
        window.history.pushState({}, '', url.toString());
      }
    }
  };

  // Keyboard Shortcuts (Space to flip, 1/2/3 to rate, Left/Right arrow)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === '1') {
        handleRate('none');
      } else if (e.key === '2') {
        handleRate('somewhat');
      } else if (e.key === '3') {
        handleRate('confident');
      } else if (e.key === 'ArrowRight') {
        if (cardIndex < cards.length - 1) {
          setCardIndex((i) => i + 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowLeft') {
        if (cardIndex > 0) {
          setCardIndex((i) => i - 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cardIndex, cards.length, currentCard, activeKit]);

  // Total and progress calculation based on all cards in kit
  const totalCardsCount = allCards.length;
  const confidentCount = allCards.filter((c) => cardConfidence[c.id] === 'confident').length;
  const progressPercent = totalCardsCount > 0 ? Math.min(100, Math.round((confidentCount / totalCardsCount) * 100)) : 0;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
          Loading preparation kit flashcards...
        </p>
      </div>
    );
  }

  if (!activeKit || kits.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-12 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[32px]">style</span>
          </div>
          <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white">No Flashcards Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            You don't have any flashcards yet. Generate an interview preparation kit to begin active recall practice.
          </p>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Prep Kit</span>
          </Link>
        </div>
      </div>
    );
  }

  const companyName = activeKit?.source?.company || 'Target Company';
  const roleTitle = activeKit?.role?.title || 'Target Role';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb / Back Link */}
      <div className="mb-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
              Practice Flashcards
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              {companyName}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            Active kit: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{companyName}</span> · {roleTitle}
          </p>
        </div>

        {/* Kit Selector Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">Switch Kit:</label>
          <select
            value={activeKit?._id || activeKit?.id || ''}
            onChange={(e) => handleSelectKit(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none cursor-pointer shadow-xs max-w-[240px] truncate"
          >
            {kits.map((k) => (
              <option key={k._id || k.id} value={k._id || k.id}>
                {k.source?.company || 'Company'} · {k.role?.title || 'Role'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress Stats */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Mastery:</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-code-metric">
              {progressPercent}%
            </span>
          </div>
          <div className="w-36 sm:w-48 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden shadow-inner relative">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${progressPercent}%`, minWidth: progressPercent > 0 ? '8px' : '0px' }}
            />
          </div>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
            {confidentCount} of {totalCardsCount} mastered
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSortMode('least-confident');
              setCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
              sortMode === 'least-confident'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-zinc-200/80 dark:border-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">tune</span>
            <span>Least Confident First</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSortMode('all');
              setCardIndex(0);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
              sortMode === 'all'
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-zinc-200/80 dark:border-zinc-800'
            }`}
          >
            <span>All Cards</span>
          </button>
        </div>
      </div>

      {/* 3D Flashcard Container */}
      {currentCard ? (
        <div className="flex flex-col items-center">
          {/* Card Counter */}
          <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2 font-code-metric">
            CARD {cardIndex + 1} OF {cards.length} · {companyName}
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-2xl min-h-[340px] p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between select-none relative group cursor-pointer"
          >
            {/* Flip Indicator Header */}
            <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <span className="font-bold uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">
                  {isFlipped ? 'verified' : 'psychology'}
                </span>
                <span>{isFlipped ? 'Answer Key & Concept Architecture' : 'Recall Challenge Question'}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Click card or Press Space to flip</span>
              </span>
            </div>

            {/* Card Content */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                /* Front Side: Question */
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight leading-snug">
                    {currentCard.front}
                  </h2>
                </div>
              ) : (
                /* Back Side: Answer Outline */
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-2xl">verified</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Model Answer Outline
                    </span>
                  </div>
                  <div className="text-sm sm:text-base text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line font-medium">
                    {currentCard.back}
                  </div>
                  {currentCard.requirement_ids && currentCard.requirement_ids.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-3 flex-wrap">
                      <span className="text-[10px] text-zinc-400 font-semibold">Mapped Requirements:</span>
                      {currentCard.requirement_ids.map((rid) => (
                        <span
                          key={rid}
                          className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-code-metric text-zinc-600 dark:text-zinc-300 font-bold border border-zinc-200/60 dark:border-zinc-700/60"
                        >
                          {rid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Status / Confidence Tag */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
              <span className="text-zinc-400 text-[11px]">
                Confidence:{' '}
                <strong className="capitalize text-zinc-900 dark:text-zinc-100 font-bold">
                  {cardConfidence[currentCard.id] || 'Unrated'}
                </strong>
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">
                Space to flip · 1 (Hard) / 2 (Good) / 3 (Easy)
              </span>
            </div>
          </div>

          {/* Self-Rating Response Actions */}
          <div className="flex items-center gap-3 mt-6 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => handleRate('none')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                cardConfidence[currentCard.id] === 'none'
                  ? 'bg-rose-600 text-white border-rose-600 ring-2 ring-rose-400/40'
                  : 'bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 text-rose-700 dark:text-rose-300 hover:text-white border-rose-300 dark:border-rose-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sentiment_dissatisfied</span>
              <span>1. Hard (Repeat Soon)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('somewhat')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                cardConfidence[currentCard.id] === 'somewhat'
                  ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-400/40'
                  : 'bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border-amber-300 dark:border-amber-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sentiment_neutral</span>
              <span>2. Good (Need Review)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('confident')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs border transition-all active:scale-95 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                cardConfidence[currentCard.id] === 'confident'
                  ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400/40 shadow-emerald-600/30'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-600 text-emerald-700 dark:text-emerald-300 hover:text-white border-emerald-300 dark:border-emerald-800'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sentiment_very_satisfied</span>
              <span>3. Easy (Mastered)</span>
            </button>
          </div>

          {/* Navigation Skip Buttons */}
          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              disabled={cardIndex === 0}
              onClick={() => {
                setCardIndex((prev) => Math.max(0, prev - 1));
                setIsFlipped(false);
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
            >
              ← Previous Card
            </button>
            <button
              type="button"
              disabled={cardIndex >= cards.length - 1}
              onClick={() => {
                setCardIndex((prev) => Math.min(cards.length - 1, prev + 1));
                setIsFlipped(false);
              }}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 cursor-pointer"
            >
              Skip to Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[26px]">style</span>
          </div>
          <div>
            <h3 className="font-extrabold text-base text-zinc-950 dark:text-white">
              No Flashcards Found for {companyName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              This kit does not have active cards. Generate a new prep kit or inspect questions in your dashboard.
            </p>
          </div>
          <Link
            href="/dashboard/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Generate New Kit</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PracticeModePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-500 mt-3">Loading Practice Studio...</p>
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}
