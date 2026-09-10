'use client';

import React from 'react';
import Link from 'next/link';
import { PrepKit } from '../../data/sampleKit';

interface KitCardListProps {
  kit: PrepKit;
  onInspectPipeline?: (kit: PrepKit) => void;
  onOpenNotes?: (kit: PrepKit) => void;
}

export const KitCardList: React.FC<KitCardListProps> = ({
  kit,
  onInspectPipeline,
  onOpenNotes,
}) => {
  const company = kit.source?.company || 'Company';
  const roleTitle = kit.role?.title || 'Engineer';
  const initial = company.charAt(0).toUpperCase();

  // Status badge coloring
  const isGenerating = kit.status === 'generating' || (kit.statusBadge && kit.statusBadge.toLowerCase().includes('generating'));
  const isNeedsReview = kit.status === 'review' || (kit.statusBadge && kit.statusBadge.toLowerCase().includes('review'));

  const badgeStyles = isGenerating
    ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    : isNeedsReview
    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  // Questions breakdown
  const totalQuestions = kit.questions?.length || 5;
  const techCount = kit.questions?.filter((q) => q.category === 'technical').length || 2;
  const behCount = kit.questions?.filter((q) => q.category === 'behavioural').length || 2;

  // Flashcards mastery
  const totalCards = Math.max(1, kit.totalCards || kit.flashcards?.length || 5);
  const mastered = Math.min(totalCards, kit.masteredCount !== undefined ? kit.masteredCount : Math.min(totalCards, 29));
  const rawPct = kit.masteryPercentage !== undefined ? kit.masteryPercentage : Math.round((mastered / totalCards) * 100);
  const masteryPct = Math.min(100, Math.max(0, rawPct > 100 ? Math.round(rawPct / 100) : rawPct));

  // Cadence
  const cadenceDay = kit.currentCadenceDay || 4;
  const totalDays = kit.totalCadenceDays || kit.schedule?.days_available || 7;

  return (
    <div className="p-5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all space-y-4">
      {/* Top Row: Company, Role, Badges, & Deadline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Company Avatar Box */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
            {initial}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-base text-zinc-950 dark:text-white tracking-tight">
                {company}
              </span>
              <span className="text-zinc-400">·</span>
              <span className="font-bold text-sm text-zinc-700 dark:text-zinc-300 truncate">
                {roleTitle}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${badgeStyles}`}>
                {kit.statusBadge || 'Ready to Practice'}
              </span>
            </div>

            {/* Sub-tags */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 flex-wrap">
              {kit.tags && kit.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                  <span>{tag}</span>
                </span>
              ))}
              {kit.levelBadge && (
                <span className="px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 font-code-metric text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                  {kit.levelBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Interview Deadline Warning Pill */}
        {kit.interviewDateStr && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200/80 dark:border-rose-900/80 shrink-0 self-start sm:self-center">
            <span className="material-symbols-outlined text-[15px]">event</span>
            <span>Interview in {kit.interviewInDays || 3} Days ({kit.interviewDateStr})</span>
          </div>
        )}
      </div>

      {/* Middle Grid: 3 Metric Pills */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 pb-1 border-t border-b border-zinc-100 dark:border-zinc-800/60">
        {/* Metric 1: Question Mix */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold mb-1">Question Mix</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-zinc-950 dark:text-white">{totalQuestions} Questions</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            <span>{techCount} Tech</span>
            <span>·</span>
            <span>{behCount} Behavioural</span>
          </div>
        </div>

        {/* Metric 2: Flashcard Mastery */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Flashcard Mastery</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-code-metric">
              {mastered} / {totalCards} ({masteryPct}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden mt-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Study Cadence */}
        <div className="p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-zinc-500 dark:text-zinc-400 font-semibold">Study Cadence</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Day {cadenceDay} of {totalDays}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {Array.from({ length: totalDays }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < cadenceDay ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {onOpenNotes && (
            <button
              type="button"
              onClick={() => onOpenNotes(kit)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">edit_note</span>
              <span>Notes</span>
            </button>
          )}

          {onInspectPipeline && (
            <button
              type="button"
              onClick={() => onInspectPipeline(kit)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">tune</span>
              <span>Pipeline Logs</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/dashboard/archive"
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">bookmark</span>
            <span>Archive</span>
          </Link>

          <Link
            href="/dashboard/schedule"
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            <span>Schedule</span>
          </Link>

          <Link
            href="/dashboard/practice"
            className="px-4 py-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-[15px]">play_arrow</span>
            <span>Practice Cards</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
