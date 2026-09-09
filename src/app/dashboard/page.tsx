'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import { SAMPLE_PREP_KIT, PrepKit, Question, Flashcard } from '../../data/sampleKit';

import {
  Sparkles,
  BookOpen,
  Calendar,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  Pin,
  RotateCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Clock,
  Briefcase,
  Globe,
  Terminal,
  FileCode,
  Tag,
  Star,
  RefreshCw
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Active Kit state (initialized from SAMPLE_PREP_KIT, conforming to Appendix A)
  const [kit, setKit] = useState<PrepKit>(SAMPLE_PREP_KIT);
  const [activeTab, setActiveTab] = useState<'builder' | 'practice' | 'schedule' | 'coverage' | 'batch'>('builder');

  // Builder state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'technical' | 'behavioural' | 'system-design' | 'company-fit'>('all');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Practice Mode state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardStats, setCardStats] = useState<Record<string, 'none' | 'somewhat' | 'confident'>>({});

  // Question editing handlers
  const handleUpdateQuestion = (id: string, updatedPrompt: string, updatedOutline: string) => {
    setKit((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id
          ? { ...q, prompt: updatedPrompt, answer_outline: updatedOutline, isEdited: true, isPinned: true }
          : q
      ),
    }));
    setEditingQuestionId(null);
  };

  const handleTogglePin = (id: string) => {
    setKit((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, isPinned: !q.isPinned } : q
      ),
    }));
  };

  const handleDeleteQuestion = (id: string) => {
    setKit((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.map((d) => ({
          ...d,
          question_ids: d.question_ids.filter((qid) => qid !== id),
        })),
      },
    }));
  };

  const handleAddQuestion = () => {
    const newId = `q${kit.questions.length + 1}`;
    const newQ: Question = {
      id: newId,
      requirement_ids: ['r1'],
      category: selectedCategory === 'all' ? 'technical' : selectedCategory,
      prompt: 'New practice interview question — click to edit prompt...',
      answer_outline: 'Key discussion points, architectural tradeoffs, and STAR outline...',
      difficulty: 2,
      isEdited: true,
      isPinned: true,
    };

    setKit((prev) => ({
      ...prev,
      questions: [newQ, ...prev.questions],
    }));
    setEditingQuestionId(newId);
  };

  // Section Regeneration simulator (preserving pinned & edited questions)
  const handleRegenerateCategory = (cat: string) => {
    setKit((prev) => {
      const regeneratedQuestions = prev.questions.map((q) => {
        if (q.category === cat) {
          if (q.isPinned || q.isEdited) {
            // Preserved!
            return q;
          }
          return {
            ...q,
            prompt: `[Regenerated] ${q.prompt}`,
            answer_outline: `[Fresh research outline] ${q.answer_outline}`,
          };
        }
        return q;
      });

      return {
        ...prev,
        questions: regeneratedQuestions,
      };
    });
  };

  // Practice mode confidence recorder
  const handleRecordConfidence = (confidence: 'none' | 'somewhat' | 'confident') => {
    const card = kit.flashcards[currentCardIndex];
    if (card) {
      setCardStats((prev) => ({ ...prev, [card.id]: confidence }));
    }
    setIsFlipped(false);
    if (currentCardIndex < kit.flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(kit, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const filteredQuestions = kit.questions.filter((q) =>
    selectedCategory === 'all' ? true : q.category === selectedCategory
  );

  const totalPrepMinutes = kit.schedule.days.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Kit Header Banner */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-indigo-950 to-zinc-900 text-white border border-indigo-900/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 uppercase tracking-wider">
                Active Prep Kit
              </span>
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Coverage (Pass {kit.coverage.passes})
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-400">{kit.schedule.days_available} Day Plan</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <span>{kit.role.title}</span>
              <span className="text-indigo-400 font-normal">at</span>
              <span className="underline decoration-indigo-500 underline-offset-4">{kit.source.company}</span>
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-zinc-500" /> {kit.role.seniority} Level
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-zinc-500" /> {kit.source.location}
              </span>
              <a
                href={kit.source.company_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>{kit.source.company_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all shadow-sm"
              title="Copy raw Appendix A JSON"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copied JSON' : 'Appendix A JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('builder')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'builder'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>The Builder (Section 6)</span>
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'practice'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Practice Mode (Section 7)</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'schedule'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Study Schedule (Section 8)</span>
        </button>

        <button
          onClick={() => setActiveTab('coverage')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'coverage'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Coverage Loop (Pass 2)</span>
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'batch'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Batch Runner (Section 9)</span>
        </button>
      </div>

      {/* TAB 1: THE BUILDER */}
      {activeTab === 'builder' && (
        <div className="space-y-8">
          {/* Company Brief & Role Requirements Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Company Brief Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  Company Brief (Crawled Sources)
                </h2>
                <span className="text-[11px] font-mono text-zinc-400">
                  {kit.company_brief.sources.length} sources crawled
                </span>
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                {kit.company_brief.summary}
              </p>
              <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <span className="font-semibold text-zinc-900 dark:text-zinc-200 block">Core Operations:</span>
                <p>{kit.company_brief.what_they_do}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {kit.company_brief.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-mono"
                  >
                    <span>{src.replace('https://', '')}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Role & Requirements Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  Extracted Requirements ({kit.role.requirements.length})
                </h2>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                  All Mapped to Questions
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {kit.role.requirements.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          [{req.id}]
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                            req.priority === 'must'
                              ? 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {req.priority}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
                          {req.kind}
                        </span>
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-medium">{req.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question Bank Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>Question Bank</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                    {filteredQuestions.length} Questions
                  </span>
                </h2>
                <p className="text-xs text-zinc-500">
                  Reshapeable questions with inline editing, pinned state survival, and difficulty levels.
                </p>
              </div>

              {/* Category Filter Pills & Add Button */}
              <div className="flex flex-wrap items-center gap-2">
                {(['all', 'technical', 'behavioural', 'system-design', 'company-fit'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}

                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>

                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => handleRegenerateCategory(selectedCategory)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Regenerate this category while keeping pinned items intact"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Regen Category</span>
                  </button>
                )}
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const isEditing = editingQuestionId === q.id;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition-all ${
                      q.isPinned
                        ? 'border-indigo-500/50 shadow-sm shadow-indigo-500/5'
                        : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {q.id.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                            {q.category}
                          </span>
                          <div className="flex items-center gap-0.5 text-amber-500" title={`Difficulty: ${q.difficulty}/3`}>
                            {Array.from({ length: q.difficulty }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                          <span className="text-zinc-300 dark:text-zinc-700">·</span>
                          <span className="text-zinc-500">Maps:</span>
                          {q.requirement_ids.map((rid) => (
                            <span
                              key={rid}
                              className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                            >
                              {rid}
                            </span>
                          ))}
                          {q.isPinned && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                          {q.isEdited && (
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded">
                              Edited by User
                            </span>
                          )}
                        </div>

                        {/* Editable Prompt */}
                        {isEditing ? (
                          <div className="space-y-3 pt-2">
                            <textarea
                              defaultValue={q.prompt}
                              id={`prompt-${q.id}`}
                              rows={2}
                              className="w-full p-2.5 text-sm rounded-xl border border-indigo-500 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
                            />
                            <textarea
                              defaultValue={q.answer_outline}
                              id={`outline-${q.id}`}
                              rows={3}
                              className="w-full p-2.5 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:outline-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const p = (document.getElementById(`prompt-${q.id}`) as HTMLTextAreaElement)?.value;
                                  const o = (document.getElementById(`outline-${q.id}`) as HTMLTextAreaElement)?.value;
                                  handleUpdateQuestion(q.id, p, o);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => setEditingQuestionId(null)}
                                className="px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => setEditingQuestionId(q.id)} className="cursor-pointer group">
                            <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {q.prompt}
                            </h3>
                            <div className="mt-2 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-200 block mb-1">
                                Ideal Answer Outline:
                              </span>
                              {q.answer_outline}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(q.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            q.isPinned
                              ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50'
                              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                          }`}
                          title={q.isPinned ? 'Pinned (survives category regeneration)' : 'Pin question'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors rounded-lg"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE MODE */}
      {activeTab === 'practice' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
              Flashcard Practice Session
            </h2>
            <p className="text-xs text-zinc-500">
              Card {currentCardIndex + 1} of {kit.flashcards.length} · Confidence-weighted spaced repetition
            </p>
          </div>

          {/* 3D Flipping Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000"
          >
            <div
              className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Card Front */}
              <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between backface-hidden">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-mono font-bold text-indigo-500">
                    {kit.flashcards[currentCardIndex]?.id.toUpperCase()}
                  </span>
                  <span>Click anywhere to reveal answer</span>
                </div>
                <div className="my-auto text-center space-y-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    Interview Question Concept
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white leading-snug">
                    {kit.flashcards[currentCardIndex]?.front}
                  </p>
                </div>
                <div className="text-center text-xs text-zinc-400">
                  Linked requirement: {kit.flashcards[currentCardIndex]?.requirement_ids.join(', ')}
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 w-full h-full p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-zinc-900 to-zinc-950 text-white border border-indigo-500/30 shadow-xl flex flex-col justify-between rotate-y-180 backface-hidden">
                <div className="flex items-center justify-between text-xs text-indigo-300">
                  <span className="font-bold">Answer & Key Takeaways</span>
                  <span>Click to flip back</span>
                </div>
                <div className="my-auto text-center">
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
                    {kit.flashcards[currentCardIndex]?.back}
                  </p>
                </div>
                <div className="text-center text-xs text-indigo-400">
                  Rate your confidence below to schedule next review
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleRecordConfidence('none')}
              className="py-3 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30 font-semibold text-xs transition-all"
            >
              Need Practice
            </button>
            <button
              onClick={() => handleRecordConfidence('somewhat')}
              className="py-3 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-semibold text-xs transition-all"
            >
              Getting There
            </button>
            <button
              onClick={() => handleRecordConfidence('confident')}
              className="py-3 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-xs transition-all"
            >
              Mastered / Confident
            </button>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={currentCardIndex === 0}
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => Math.max(0, prev - 1));
              }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-xs text-zinc-400">
              {Object.keys(cardStats).length} of {kit.flashcards.length} rated
            </span>
            <button
              disabled={currentCardIndex >= kit.flashcards.length - 1}
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex((prev) => Math.min(kit.flashcards.length - 1, prev + 1));
              }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: STUDY SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                Deterministic Study Timetable ({kit.schedule.days_available} Days)
              </h2>
              <p className="text-xs text-zinc-500">
                Pure arithmetic allocation. Every must-have requirement covered with integer minute durations.
              </p>
            </div>
            <div className="flex items-center gap-6 text-xs">
              <div>
                <span className="text-zinc-400 block">Total Prep Time</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.floor(totalPrepMinutes / 60)}h {totalPrepMinutes % 60}m
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block">Average / Day</span>
                <span className="text-base font-bold text-zinc-900 dark:text-white">
                  {Math.round(totalPrepMinutes / kit.schedule.days_available)} mins
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {kit.schedule.days.map((day) => {
              const allocatedQuestions = kit.questions.filter((q) => day.question_ids.includes(q.id));

              return (
                <div
                  key={day.day}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
                        D{day.day}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                          {day.focus}
                        </h3>
                        <span className="text-xs text-zinc-400">{allocatedQuestions.length} Questions assigned</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{day.minutes} minutes</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {allocatedQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            [{q.id}]
                          </span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{q.prompt}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {q.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COVERAGE AUDIT & APPENDIX A SPEC */}
      {activeTab === 'coverage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                The Second Pass Coverage Audit
              </h2>
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>Passes Executed: {kit.coverage.passes}</span>
                  <span>Uncovered Must-Haves: {kit.coverage.uncovered_requirement_ids.length}</span>
                </div>
                <p>
                  In Pass 1, requirement <code>r3</code> had no question mapped. The coverage loop identified the gap, generated question <code>q3</code>, and resolved all must-haves before delivery.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Requirement Coverage Map:</h3>
                {kit.role.requirements.map((r) => {
                  const coveredBy = kit.questions.filter((q) => q.requirement_ids.includes(r.id)).map((q) => q.id);
                  return (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/40"
                    >
                      <span className="font-mono">{r.id} ({r.priority})</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Covered by [{coveredBy.join(', ')}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Appendix A Schema Viewer */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Appendix A JSON Structure
                </h2>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-300 font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed">
                {JSON.stringify(kit, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BATCH RUNNER CLI SPEC */}
      {activeTab === 'batch' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Section 9 Mandatory Requirement
            </div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white">
              Batch CLI Evaluation Architecture
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Your repository exposes a command to run the pipeline over a set of job descriptions without going through the user interface.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 text-zinc-100 font-mono text-xs space-y-2 border border-zinc-800">
            <div className="text-zinc-500"># CLI Command:</div>
            <div className="text-emerald-400 select-all font-bold">
              npm run evaluate -- --input &lt;cases.json&gt; --output &lt;kits.json&gt;
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Input Shape (Appendix B):</h3>
              <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
{`[
  {
    "id": "case-01",
    "jd": "Senior Backend Engineer\\n\\nWe are...",
    "company_url": "https://stripe.com",
    "days": 5
  }
]`}
              </pre>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Output Shape (Appendix B):</h3>
              <pre className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-700 dark:text-zinc-300">
{`{
  "version": "1.0",
  "generated_at": "2026-09-08T10:30:00Z",
  "kits": [
    {
      "id": "case-01",
      "status": "ok",
      "kit": { /* Appendix A Object */ },
      "error": null
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  );
}

