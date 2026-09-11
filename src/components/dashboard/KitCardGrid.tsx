'use client';

import React from 'react';
import Link from 'next/link';
import { PrepKit } from '../../data/sampleKit';

interface KitCardGridProps {
  kit: PrepKit;
  onInspectPipeline?: (kit: PrepKit) => void;
  onOpenNotes?: (kit: PrepKit) => void;
}

export const KitCardGrid: React.FC<KitCardGridProps> = ({
  kit,
  onInspectPipeline,
  onOpenNotes,
}) => {
  const company = kit.source?.company || 'Company';
  const roleTitle = kit.role?.title || 'Engineer';
  const initial = company.charAt(0).toUpperCase();

  const domain = kit.source?.company_url
    ? kit.source.company_url.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0]
    : '';
  const logoSrc = kit.source?.logo_url || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null);

  const isGenerating = kit.status === 'generating' || (kit.statusBadge && kit.statusBadge.toLowerCase().includes('generating'));
  const isNeedsReview = kit.status === 'review' || (kit.statusBadge && kit.statusBadge.toLowerCase().includes('review'));

  const badgeStyles = isGenerating
    ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800'
    : isNeedsReview
    ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

  const totalCards = Math.max(1, kit.totalCards || kit.flashcards?.length || 5);
  const mastered = Math.min(totalCards, kit.masteredCount !== undefined ? kit.masteredCount : Math.min(totalCards, 29));
  const rawPct = kit.masteryPercentage !== undefined ? kit.masteryPercentage : Math.round((mastered / totalCards) * 100);
  const masteryPct = Math.min(100, Math.max(0, rawPct > 100 ? Math.round(rawPct / 100) : rawPct));

  return (
    <div className="p-5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center font-black text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform overflow-hidden p-1 relative">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt={`${company} logo`}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              )}
              <div
                className={`logo-fallback w-full h-full rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-center font-black text-sm ${logoSrc ? 'hidden' : 'flex'}`}
              >
                {initial}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-extrabold text-base text-zinc-950 dark:text-white leading-tight truncate" title={company}>
                {company}
              </h3>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate" title={roleTitle}>
                {roleTitle}
              </p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider shrink-0 max-w-[140px] truncate text-center ${badgeStyles}`}
            title={kit.statusBadge || 'Ready'}
          >
            {kit.statusBadge || 'Ready'}
          </span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {kit.tags && kit.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-semibold truncate max-w-[130px]"
            >
              {tag}
            </span>
          ))}
          {kit.levelBadge && (
            <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-code-metric text-[10px] font-bold">
              {kit.levelBadge}
            </span>
          )}
        </div>
      </div>

      {/* Card Body: Mastery & Cadence */}
      <div className="space-y-3 pt-2 pb-2 border-t border-b border-zinc-100 dark:border-zinc-800/60">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">Flashcard Mastery</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-code-metric">{masteryPct}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500"
              style={{ width: `${masteryPct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 font-medium">
            <svg className="w-3.5 h-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>{kit.questions?.length || 5} Questions</span>
          </span>

          {(() => {
            const daysNum = kit.interviewInDays || 5;
            let dateText = kit.interviewDateStr;
            if (!dateText || dateText.includes('+') || dateText.startsWith('Day')) {
              const d = new Date();
              d.setDate(d.getDate() + daysNum);
              dateText = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return (
              <span className="font-bold text-rose-600 dark:text-rose-400" title={`Target interview: ${dateText}`}>
                In {daysNum}d ({dateText})
              </span>
            );
          })()}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/dashboard/schedule?kitId=${kit._id || kit.id}`}
            onClick={() => {
              try {
                localStorage.setItem('active_kit', JSON.stringify(kit));
              } catch (e) {}
            }}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="View Schedule"
          >
            <span className="material-symbols-outlined text-[17px]">calendar_today</span>
          </Link>
          <Link
            href={`/dashboard/archive?kitId=${kit._id || kit.id}`}
            onClick={() => {
              try {
                localStorage.setItem('active_kit', JSON.stringify(kit));
              } catch (e) {}
            }}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Question Archive"
          >
            <span className="material-symbols-outlined text-[17px]">bookmark</span>
          </Link>
          {onInspectPipeline && (
            <button
              type="button"
              onClick={() => onInspectPipeline(kit)}
              className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 transition-colors"
              title="Inspect Pipeline"
            >
              <span className="material-symbols-outlined text-[17px]">tune</span>
            </button>
          )}
        </div>

        <Link
          href={`/dashboard/practice?kitId=${kit._id || kit.id}`}
          onClick={() => {
            try {
              localStorage.setItem('active_kit', JSON.stringify(kit));
            } catch (e) {}
          }}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white text-xs font-bold shadow-xs hover:shadow-indigo-600/30 transition-all flex items-center gap-1 hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-[15px]">play_arrow</span>
          <span>Practice</span>
        </Link>
      </div>
    </div>
  );
};
