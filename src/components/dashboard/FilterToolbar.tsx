'use client';

import React from 'react';

export type StatusFilterType = 'all' | 'ready' | 'generating' | 'review';
export type SortByType = 'date' | 'readiness' | 'questions' | 'name';
export type ViewModeType = 'list' | 'grid';

interface FilterToolbarProps {
  statusFilter: StatusFilterType;
  onStatusChange: (status: StatusFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortByType;
  onSortChange: (sort: SortByType) => void;
  viewMode: ViewModeType;
  onViewModeChange: (mode: ViewModeType) => void;
  counts: {
    all: number;
    ready: number;
    generating: number;
    review: number;
  };
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  counts,
}) => {
  const tabs: { key: StatusFilterType; label: string; count: number; badgeClass?: string }[] = [
    { key: 'all', label: 'All Kits', count: counts.all },
    { key: 'ready', label: 'Ready to Practice', count: counts.ready, badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950' },
    { key: 'generating', label: 'Generating', count: counts.generating, badgeClass: 'text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950' },
    { key: 'review', label: 'Needs Review', count: counts.review, badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950' },
  ];

  return (
    <div className="p-3 sm:p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
      {/* Left: Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                  isActive
                    ? 'bg-white/20 text-white dark:bg-zinc-900/20 dark:text-zinc-950'
                    : tab.badgeClass || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: Search, Sort & View Mode */}
      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Input */}
        <div className="relative flex-1 sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-zinc-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter company, role, tag..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortByType)}
            className="h-8.5 px-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
          >
            <option value="date">Sort: Interview Date</option>
            <option value="readiness">Sort: Readiness %</option>
            <option value="questions">Sort: Question Count</option>
            <option value="name">Sort: Company Name</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title="List View"
          >
            <span className="material-symbols-outlined text-[17px]">view_list</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
            title="Grid View"
          >
            <span className="material-symbols-outlined text-[17px]">grid_view</span>
          </button>
        </div>
      </div>
    </div>
  );
};
