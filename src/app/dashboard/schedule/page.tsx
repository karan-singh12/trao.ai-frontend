'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ScheduleDay, Question, PrepKit } from '../../../data/sampleKit';
import { KitService } from '../../../services/kit.service';

function ScheduleContent() {
  const searchParams = useSearchParams();
  const kitIdParam = searchParams.get('kitId');

  const [kits, setKits] = useState<PrepKit[]>([]);
  const [activeKit, setActiveKit] = useState<PrepKit | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadKits() {
      setIsLoading(true);
      try {
        let loadedKits: PrepKit[] = [];

        try {
          const backendKits = await KitService.getKits();
          if (backendKits && Array.isArray(backendKits)) {
            loadedKits = backendKits;
          }
        } catch (e) {
          console.warn('Could not load kits from backend:', e);
        }

        if (loadedKits.length === 0) {
          setKits([]);
          setActiveKit(null);
          return;
        }

        setKits(loadedKits);

        let target: PrepKit | undefined;
        if (kitIdParam) {
          target = loadedKits.find((k) => (k._id || k.id) === kitIdParam);
          if (!target) {
            try {
              const fetchedSingle = await KitService.getKitById(kitIdParam);
              if (fetchedSingle) {
                target = fetchedSingle;
                loadedKits = [fetchedSingle, ...loadedKits.filter((k) => (k._id || k.id) !== kitIdParam)];
                setKits(loadedKits);
              }
            } catch (e) {}
          }
        }

        let localKit: PrepKit | null = null;
        try {
          const stored = typeof window !== 'undefined' ? localStorage.getItem('active_kit') : null;
          if (stored) {
            localKit = JSON.parse(stored);
          }
        } catch (e) {}

        if (!target && localKit) {
          target = loadedKits.find((k) => (k._id || k.id) === (localKit?._id || localKit?.id));
        }

        if (!target) {
          target = loadedKits[0];
        }

        if (target) {
          setActiveKit(target);
          setSelectedDay(1);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadKits();
  }, [kitIdParam]);

  const schedule = activeKit?.schedule;
  const days: ScheduleDay[] = schedule?.days || [];
  const questionsMap = useMemo(() => {
    const map = new Map<string, Question>();
    (activeKit?.questions || []).forEach((q) => map.set(q.id, q));
    return map;
  }, [activeKit]);

  const currentDayData = days.find((d) => d.day === selectedDay) || days[0];
  const totalMinutes = days.reduce((sum, d) => sum + (d.minutes || 0), 0);

  const handleSelectKit = (newKitId: string) => {
    const found = kits.find((k) => (k._id || k.id) === newKitId);
    if (found) {
      setActiveKit(found);
      setSelectedDay(1);
      try {
        localStorage.setItem('active_kit', JSON.stringify(found));
      } catch (e) {}
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('kitId', newKitId);
        window.history.pushState({}, '', url.toString());
      }
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-zinc-500">Loading study schedule...</p>
      </div>
    );
  }

  if (!activeKit || kits.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-12 rounded-3xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <span className="material-symbols-outlined text-[32px]">calendar_month</span>
          </div>
          <h3 className="font-extrabold text-lg text-zinc-950 dark:text-white">No Schedules Found</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            You have not created any interview preparation kits yet. Create a kit to see your day-by-day study roadmap.
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

  const companyName = activeKit?.source?.company || 'Company';
  const roleTitle = activeKit?.role?.title || 'Engineer';
  const kitIdentifier = activeKit?._id || activeKit?.id || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Study Schedule</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800">
              {companyName}
            </span>
          </div>
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
            Target: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{companyName}</span> · {roleTitle}
          </p>
        </div>

        {/* Kit Selector */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">Switch Kit:</label>
          <select
            value={kitIdentifier}
            onChange={(e) => handleSelectKit(e.target.value)}
            className="h-9 px-3 rounded-xl bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none cursor-pointer shadow-xs max-w-[240px] truncate"
          >
            {kits.map((k) => (
              <option key={k._id || k.id} value={k._id || k.id}>
                {k.source?.company || 'Company'} · {k.role?.title || 'Engineer'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Days Available
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {schedule?.days_available || days.length} Days
          </div>
          <span className="text-[11px] text-zinc-400">Paced study duration</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Total Study Commitment
          </span>
          <div className="text-2xl font-black text-zinc-950 dark:text-white mt-1">
            {totalMinutes} Minutes
          </div>
          <span className="text-[11px] text-zinc-400">~{Math.round(totalMinutes / (days.length || 1))} min / day average</span>
        </div>

        <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs">
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Total Questions Mapped
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeKit?.questions?.length || 0} Questions
          </div>
          <span className="text-[11px] text-zinc-400">Categorized &amp; verified</span>
        </div>
      </div>

      {/* Day Selector Tabs (Responsive) */}
      <div className="p-2 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 mb-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {days.map((d) => (
          <button
            key={d.day}
            type="button"
            onClick={() => setSelectedDay(d.day)}
            className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all text-center border cursor-pointer ${
              selectedDay === d.day
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-zinc-200/80 dark:border-zinc-800'
            }`}
          >
            <div>Day {d.day}</div>
            <div className="text-[10px] opacity-80 font-normal mt-0.5">{d.minutes} mins</div>
          </button>
        ))}
      </div>

      {/* Selected Day Detailed View */}
      {currentDayData && (
        <div className="p-5 sm:p-6 rounded-3xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 gap-2">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                Day {currentDayData.day} Syllabus
              </span>
              <h2 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white tracking-tight mt-1">
                {currentDayData.focus}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-[20px]">timer</span>
              <span className="text-xs sm:text-sm font-extrabold text-zinc-950 dark:text-white">{currentDayData.minutes} Minutes Assigned</span>
            </div>
          </div>

          {/* Assigned Questions for this day */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Assigned Questions ({currentDayData.question_ids?.length || 0})
            </h3>

            {currentDayData.question_ids?.map((qid, idx) => {
              const q = questionsMap.get(qid);
              return (
                <div
                  key={qid}
                  className="p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-code-metric text-[11px] font-bold text-indigo-600 dark:text-indigo-400">#{idx + 1} ({qid})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        q?.category === 'technical' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {q?.category || 'Technical'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                        Difficulty: {q?.difficulty || 2}/3
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-950 dark:text-white leading-snug">
                      {q?.prompt || 'Question prompt placeholder'}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {q?.answer_outline || 'Answer outline'}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/practice?kitId=${kitIdentifier}`}
                    className="self-start px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
                  >
                    Practice Now →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-zinc-500 mt-3">Loading Study Schedule...</p>
        </div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
