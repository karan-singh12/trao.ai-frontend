'use client';

import React from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
  totalKits: number;
  onExportSummary: () => void;
  onOpenBatch: () => void;
  onOpenNewKit: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalKits,
  onExportSummary,
  onOpenBatch,
  onOpenNewKit,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800/80">
      {/* Left: Clean Title & Count */}
      <div className="flex items-center gap-3 flex-wrap">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
          My Interview Kits
        </h1>
        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
          {totalKits} Active
        </span>
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-2.5 flex-wrap shrink-0">
        <button
          type="button"
          onClick={onExportSummary}
          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Summary</span>
        </button>

        <button
          type="button"
          onClick={onOpenBatch}
          className="px-3.5 py-2 rounded-xl bg-white/80 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">upload_file</span>
          <span>Batch Upload</span>
        </button>

        <Link
          href="/dashboard/create"
          className="px-4 py-2 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Create Kit</span>
        </Link>
      </div>
    </div>
  );
};
