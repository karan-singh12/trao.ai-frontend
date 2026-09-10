'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_KITS, SAMPLE_STRIPE_KIT, Flashcard, PrepKit } from '../../../data/sampleKit';
import { KitService } from '../../../services/kit.service';

export default function PracticeModePage() {
  const [kits, setKits] = useState<PrepKit[]>(SAMPLE_KITS);
  const [activeKit, setActiveKit] = useState<PrepKit>(SAMPLE_STRIPE_KIT);

  // Practice state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardConfidence, setCardConfidence] = useState<Record<string, 'none' | 'somewhat' | 'confident'>>({});
  const [sortMode, setSortMode] = useState<'all' | 'least-confident' | 'unmastered'>('least-confident');

  // Spaced Repetition sorting logic (Least Confident First)
  const getCards = (): Flashcard[] => {
    const raw = [...(activeKit.flashcards || [])];
    const weight = (id: string): number => {
      const c = cardConfidence[id];
      if (c === 'none') return 1;
      if (c === 'somewhat') return 2;
      if (!c) return 3;
      return 4; // 'confident'
    };

    if (sortMode === 'least-confident') {
      return raw.sort((a, b) => weight(a.id) - weight(b.id));
    }
    if (sortMode === 'unmastered') {
      return raw.filter((c) => cardConfidence[c.id] !== 'confident');
    }
    return raw;
  };

  const cards = getCards();
  const currentCard = cards[cardIndex] || activeKit.flashcards?.[0];

  const handleRate = (conf: 'none' | 'somewhat' | 'confident') => {
    if (!currentCard) return;
    setCardConfidence((prev) => ({ ...prev, [currentCard.id]: conf }));
    setIsFlipped(false);

    const kitId = activeKit._id || activeKit.id;
    if (kitId) {
      KitService.recordConfidence(kitId, currentCard.id, conf).catch(() => {});
    }

    if (cardIndex < cards.length - 1) {
      setCardIndex((prev) => prev + 1);
    } else {
      setCardIndex(0);
    }
  };

  const confidentCount = Object.values(cardConfidence).filter((v) => v === 'confident').length;
  const progressPercent = cards.length > 0 ? Math.round((confidentCount / cards.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Practice Flashcards</h1>
        </div>

        {/* Kit Selector Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-on-surface-variant font-medium">Kit:</label>
          <select
            value={activeKit.id}
            onChange={(e) => {
              const found = kits.find((k) => k.id === e.target.value);
              if (found) {
                setActiveKit(found);
                setCardIndex(0);
                setIsFlipped(false);
              }
            }}
            className="h-9 px-3 rounded-xl glass-panel text-xs font-bold text-on-surface border border-white/80 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          >
            {kits.map((k) => (
              <option key={k.id} value={k.id}>
                {k.source?.company || 'Role'} · {k.role?.title || 'Engineer'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress & Controls */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Progress Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Mastery:</span>
            <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 font-code-metric">{progressPercent}%</span>
          </div>
          <div className="w-32 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {confidentCount} of {cards.length} mastered
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
          <div className="text-xs font-bold text-on-surface-variant mb-2 font-code-metric">
            CARD {cardIndex + 1} OF {cards.length}
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-2xl min-h-[340px] p-8 rounded-3xl glass-card border border-white/90 shadow-xl cursor-pointer hover:shadow-2xl transition-all flex flex-col justify-between select-none relative group"
          >
            {/* Flip Indicator */}
            <div className="flex items-center justify-between text-xs text-on-surface-variant pb-3 border-b border-white/60">
              <span className="font-bold uppercase tracking-wider text-[11px] text-primary">
                {isFlipped ? 'Answer Key & Concept Architecture' : 'Recall Challenge Question'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[16px]">touch_app</span>
                <span>Click card to flip</span>
              </span>
            </div>

            {/* Card Content */}
            <div className="my-auto py-6">
              {!isFlipped ? (
                /* Front Side: Question */
                <div className="space-y-4 text-center">
                  <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
                  <h2 className="text-xl sm:text-2xl font-black text-on-surface tracking-tight leading-snug">
                    {currentCard.front}
                  </h2>
                </div>
              ) : (
                /* Back Side: Answer Outline */
                <div className="space-y-3">
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">verified</span>
                  <div className="text-sm sm:text-base text-on-surface leading-relaxed whitespace-pre-line font-medium">
                    {currentCard.back}
                  </div>
                  {currentCard.requirement_ids && (
                    <div className="flex items-center gap-1.5 pt-2">
                      <span className="text-[10px] text-zinc-400">Mapped Requirements:</span>
                      {currentCard.requirement_ids.map((rid) => (
                        <span key={rid} className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-code-metric text-on-surface-variant font-bold">
                          {rid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Status / Confidence Tag */}
            <div className="flex items-center justify-between pt-3 border-t border-white/60 text-xs">
              <span className="text-zinc-400 text-[11px]">
                Current Confidence: <strong className="capitalize text-on-surface">{cardConfidence[currentCard.id] || 'Unrated'}</strong>
              </span>
              <span className="text-[11px] text-zinc-400">Space to flip · 1/2/3 to rate</span>
            </div>
          </div>

          {/* Self-Rating Response Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => handleRate('none')}
              className="px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs border border-rose-300 dark:border-rose-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">sentiment_dissatisfied</span>
              <span>1. Hard (Repeat Soon)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('somewhat')}
              className="px-5 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-600 text-amber-700 hover:text-white font-bold text-xs border border-amber-300 dark:border-amber-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">sentiment_neutral</span>
              <span>2. Good (Need Review)</span>
            </button>

            <button
              type="button"
              onClick={() => handleRate('confident')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs border border-emerald-300 dark:border-emerald-800 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm"
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
              className="text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-40"
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
              className="text-xs text-on-surface-variant hover:text-on-surface disabled:opacity-40"
            >
              Skip to Next →
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 rounded-3xl text-center border border-white/80">
          <p className="text-on-surface-variant text-sm">No flashcards found for this kit.</p>
          <Link href="/dashboard/create" className="mt-4 inline-block text-primary text-xs font-bold underline">
            Generate a new kit
          </Link>
        </div>
      )}
    </div>
  );
}
