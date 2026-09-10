'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_KITS, SAMPLE_STRIPE_KIT, ScheduleDay, Question, PrepKit } from '../../../data/sampleKit';

export default function SchedulePage() {
  const [kits, setKits] = useState<PrepKit[]>(SAMPLE_KITS);
  const [activeKit, setActiveKit] = useState<PrepKit>(SAMPLE_STRIPE_KIT);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const schedule = activeKit.schedule;
  const days: ScheduleDay[] = schedule?.days || [];
  const questionsMap = new Map<string, Question>();
  (activeKit.questions || []).forEach((q) => questionsMap.set(q.id, q));

  const currentDayData = days.find((d) => d.day === selectedDay) || days[0];

  const totalMinutes = days.reduce((sum, d) => sum + (d.minutes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Study Schedule</h1>
        </div>

        {/* Kit Selector */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Kit:</label>
          <select
            value={activeKit.id}
            onChange={(e) => {
              const found = kits.find((k) => k.id === e.target.value);
              if (found) {
                setActiveKit(found);
                setSelectedDay(1);
              }
            }}
            className="h-9 px-3 rounded-xl bg-white/90 dark:bg-zinc-900/90 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 focus:ring-2 focus:ring-indigo-500/40 focus:outline-none cursor-pointer"
          >
            {kits.map((k) => (
              <option key={k.id} value={k.id}>
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
          <span className="text-[11px] text-zinc-400">Strictly matches schedule duration</span>
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
            {activeKit.questions?.length || 0} Questions
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
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Assigned Questions ({currentDayData.question_ids?.length || 0})
            </h3>

            {currentDayData.question_ids?.map((qid, idx) => {
              const q = questionsMap.get(qid);
              return (
                <div
                  key={qid}
                  className="p-4 rounded-2xl glass-panel border border-white/80 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-code-metric text-[11px] font-bold text-primary">#{idx + 1} ({qid})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                        q?.category === 'technical' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700'
                      }`}>
                        {q?.category || 'Technical'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                        Difficulty: {q?.difficulty || 2}/3
                      </span>
                    </div>
                    <p className="text-sm font-bold text-on-surface leading-snug">
                      {q?.prompt || 'Question prompt placeholder'}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {q?.answer_outline || 'Answer outline'}
                    </p>
                  </div>

                  <Link
                    href="/dashboard/practice"
                    className="self-start px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold transition-colors whitespace-nowrap"
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
