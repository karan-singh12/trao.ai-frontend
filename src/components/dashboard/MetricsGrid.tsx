'use client';

import React from 'react';

interface MetricsGridProps {
  upcomingCount?: number;
  nextCompany?: string;
  nextInDays?: number;
  totalQuestions?: number;
  readinessPercentage?: number;
  studyStreakDays?: number;
  todayMinutes?: number;
  targetMinutes?: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  upcomingCount = 0,
  nextCompany = 'None',
  nextInDays = 0,
  totalQuestions = 0,
  readinessPercentage = 0,
  studyStreakDays = 0,
  todayMinutes = 0,
  targetMinutes = 45,
}) => {
  // Compute circular progress stroke
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessPercentage / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Upcoming Interviews (Vibrant Bright Sky/Blue) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-100 via-sky-100/80 to-blue-50/90 dark:from-blue-950/60 dark:via-sky-950/40 dark:to-zinc-900 backdrop-blur-md border border-blue-200/90 dark:border-blue-700/60 shadow-xs hover:shadow-md hover:shadow-blue-500/20 transition-all group">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-extrabold text-blue-950 dark:text-blue-200">Upcoming Interviews</span>
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md shadow-blue-500/25">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-blue-950 dark:text-white tracking-tight">{upcomingCount}</span>
          <span className="text-xs text-blue-900/70 dark:text-blue-300/70 font-semibold">scheduled rounds</span>
        </div>

        {upcomingCount > 0 && nextCompany !== 'None' ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 text-[11px] font-bold border border-blue-200/80 dark:border-blue-800 shadow-xs">
            <span className="material-symbols-outlined text-[13px] text-rose-500">alarm</span>
            <span>Next: <strong className="text-blue-950 dark:text-white font-extrabold">{nextCompany}</strong> in {nextInDays} days</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/90 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 text-[11px] font-medium border border-blue-200/80 dark:border-blue-800 shadow-xs">
            <span>No upcoming rounds</span>
          </div>
        )}
      </div>

      {/* 2. Questions Prepared (Vibrant Bright Emerald/Mint) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100/80 to-emerald-50/90 dark:from-emerald-950/60 dark:via-teal-950/40 dark:to-zinc-900 backdrop-blur-md border border-emerald-200/90 dark:border-emerald-700/60 shadow-xs hover:shadow-md hover:shadow-emerald-500/20 transition-all group">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">Questions Prepared</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md shadow-emerald-500/25">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-emerald-950 dark:text-white tracking-tight">{totalQuestions}</span>
          {totalQuestions > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black font-code-metric shadow-xs">
              active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-900/80 dark:text-emerald-300 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          <span>4 core evaluation categories</span>
        </div>
      </div>

      {/* 3. Overall Readiness (Vibrant Bright Purple/Violet) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-100 via-purple-100/80 to-violet-50/90 dark:from-violet-950/60 dark:via-purple-950/40 dark:to-zinc-900 backdrop-blur-md border border-violet-200/90 dark:border-violet-700/60 shadow-xs hover:shadow-md hover:shadow-violet-500/20 transition-all group">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-extrabold text-violet-950 dark:text-violet-200">Overall Readiness</span>
          <div className="w-8 h-8 rounded-xl bg-violet-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md shadow-violet-500/25">
            <span className="material-symbols-outlined text-[18px]">auto_graph</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-violet-950 dark:text-white tracking-tight">{readinessPercentage}%</span>
          </div>

          {/* Radial progress ring */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-violet-200 dark:stroke-zinc-800"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="stroke-violet-600 dark:stroke-violet-400 transition-all duration-700"
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        <div className="text-[11px] text-violet-900/80 dark:text-violet-300 font-semibold">
          Weighted flashcard accuracy
        </div>
      </div>

      {/* 4. Study Streak (Vibrant Bright Amber/Orange) */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-100 via-orange-100/80 to-amber-50/90 dark:from-amber-950/60 dark:via-orange-950/40 dark:to-zinc-900 backdrop-blur-md border border-amber-200/90 dark:border-amber-700/60 shadow-xs hover:shadow-md hover:shadow-amber-500/20 transition-all group">
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200">Study Streak</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-md shadow-amber-500/25">
            <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-amber-950 dark:text-white tracking-tight">{studyStreakDays} Days</span>
          <span className="text-xs text-white font-extrabold bg-amber-500 px-2 py-0.5 rounded-md shadow-xs">
            on track
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-900/80 dark:text-amber-300 font-semibold">
          <span>Target: {targetMinutes}m/day</span>
          <span className="font-extrabold text-amber-950 dark:text-amber-100">Today: {todayMinutes}m</span>
        </div>
      </div>
    </div>
  );
};
