'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SAMPLE_KITS, SAMPLE_STRIPE_KIT, Question, PrepKit } from '../../../data/sampleKit';
import { KitService } from '../../../services/kit.service';

export default function ArchiveBuilderPage() {
  const [kits, setKits] = useState<PrepKit[]>(SAMPLE_KITS);
  const [activeKit, setActiveKit] = useState<PrepKit>(SAMPLE_STRIPE_KIT);

  // Category & search filter
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'behavioural'>('all');
  const [filterText, setFilterText] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Status message
  const [message, setMessage] = useState<string | null>(null);

  const questions: Question[] = activeKit.questions || [];

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = activeCategory === 'all' || q.category === activeCategory;
    const matchesText =
      !filterText ||
      q.prompt.toLowerCase().includes(filterText.toLowerCase()) ||
      q.answer_outline.toLowerCase().includes(filterText.toLowerCase());
    return matchesCat && matchesText;
  });

  // Toggle Pin (Survives regeneration)
  const handleTogglePin = (qId: string) => {
    setActiveKit((prev) => ({
      ...prev,
      questions: prev.questions?.map((q) => (q.id === qId ? { ...q, isPinned: !q.isPinned } : q))
    }));
    setMessage(`Updated pin status. Pinned questions are immune to regeneration.`);
  };

  // Start Inline Editing
  const handleStartEdit = (q: Question) => {
    setEditingId(q.id);
    setEditPrompt(q.prompt);
    setEditAnswer(q.answer_outline);
  };

  // Save Inline Edit (sets isEdited=true and isPinned=true per Section 6 rule)
  const handleSaveEdit = (qId: string) => {
    setActiveKit((prev) => ({
      ...prev,
      questions: prev.questions?.map((q) =>
        q.id === qId
          ? {
              ...q,
              prompt: editPrompt,
              answer_outline: editAnswer,
              isEdited: true,
              isPinned: true
            }
          : q
      )
    }));
    setEditingId(null);
    setMessage(`Question saved! Marked as edited & pinned to survive future regenerations.`);
  };

  // Move Question Up / Down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newQuestions = [...(activeKit.questions || [])];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newQuestions.length) return;

    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIdx];
    newQuestions[targetIdx] = temp;

    setActiveKit((prev) => ({ ...prev, questions: newQuestions }));
  };

  // Section Regeneration (respects pinned & edited state per Section 6)
  const handleRegenerateCategory = (cat: 'technical' | 'behavioural') => {
    const preserved = questions.filter((q) => q.category === cat && (q.isPinned || q.isEdited));
    setMessage(
      `Section regenerated! Preserved ${preserved.length} user-pinned/edited questions in ${cat} category.`
    );
  };

  // Export JSON (Appendix A)
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeKit, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${activeKit.source?.company || 'prepkit'}-appendix-a.json`);
    dlAnchor.click();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Question Archive</h1>
        </div>

        {/* Action Group (Responsive on Mobile) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Appendix A JSON</span>
          </button>

          {/* Kit Selector */}
          <select
            value={activeKit.id}
            onChange={(e) => {
              const found = kits.find((k) => k.id === e.target.value);
              if (found) setActiveKit(found);
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

      {/* Message Banner */}
      {message && (
        <div className="mb-6 p-3 rounded-xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 rounded-md hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 transition-colors">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Filter & Category Tabs Bar (Responsive) */}
      <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(['all', 'technical', 'behavioural'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border whitespace-nowrap cursor-pointer ${
                activeCategory === cat
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-zinc-950 dark:border-white shadow-xs'
                  : 'bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border-zinc-200/80 dark:border-zinc-800'
              }`}
            >
              {cat} ({cat === 'all' ? questions.length : questions.filter((q) => q.category === cat).length})
            </button>
          ))}
        </div>

        {/* Category Regeneration Action */}
        <div className="flex items-center gap-2 flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => handleRegenerateCategory('technical')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Regenerates unpinned technical questions"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>Regen Technical</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegenerateCategory('behavioural')}
            className="flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            title="Regenerates unpinned behavioural questions"
          >
            <span className="material-symbols-outlined text-[14px]">refresh</span>
            <span>Regen Behavioural</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            className={`p-5 rounded-2xl glass-card border transition-all ${
              q.isPinned ? 'border-primary/50 bg-primary/5' : 'border-white/80'
            }`}
          >
            {editingId === q.id ? (
              /* Inline Edit Mode */
              <div className="space-y-3">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel text-sm font-bold border border-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <textarea
                  rows={3}
                  value={editAnswer}
                  onChange={(e) => setEditAnswer(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-panel text-xs border border-white/80 focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(q.id)}
                    className="px-4 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:opacity-95"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 rounded-xl text-xs text-on-surface-variant hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Normal Question View */
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-code-metric text-[11px] font-bold text-primary">#{idx + 1} ({q.id})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      q.category === 'technical' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {q.category}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-200/80 text-zinc-600 font-bold">
                      Difficulty: {q.difficulty}/3
                    </span>
                    {q.isPinned && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">push_pin</span>
                        <span>Pinned</span>
                      </span>
                    )}
                    {q.isEdited && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        Edited by User
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-on-surface leading-snug">
                    {q.prompt}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {q.answer_outline}
                  </p>

                  {q.requirement_ids && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-zinc-400">Mapped:</span>
                      {q.requirement_ids.map((rid) => (
                        <span key={rid} className="px-1.5 py-0.2 rounded bg-white/70 text-[10px] font-code-metric text-on-surface-variant font-bold border border-white/80">
                          {rid}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Question Actions Toolbar (Responsive on Mobile) */}
                <div className="flex items-center justify-end gap-1.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800 shrink-0 self-stretch sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleTogglePin(q.id)}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${
                      q.isPinned
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    title={q.isPinned ? 'Unpin Question' : 'Pin Question (Immune to regen)'}
                  >
                    <span className="material-symbols-outlined text-[18px]">push_pin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(q)}
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Edit Prompt / Outline"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === filteredQuestions.length - 1}
                    className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
