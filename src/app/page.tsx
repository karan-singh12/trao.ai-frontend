'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { SAMPLE_JOB_DESCRIPTIONS, SAMPLE_PREP_KIT } from '../data/sampleKit';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Database,
  CheckCircle2,
  Calendar,
  BookOpen,
  Code2,
  Terminal,
  Cpu,
  Search,
  RotateCcw,
  Check,
  ChevronRight,
  ExternalLink,
  Sliders,
  FileText
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Generator Playground State
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [jdText, setJdText] = useState(SAMPLE_JOB_DESCRIPTIONS[0].jd);
  const [companyUrl, setCompanyUrl] = useState(SAMPLE_JOB_DESCRIPTIONS[0].url);
  const [days, setDays] = useState(SAMPLE_JOB_DESCRIPTIONS[0].days);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [generationComplete, setGenerationComplete] = useState(false);

  const steps = [
    { title: "Requirement Extraction", desc: "Extracting must-haves and nice-to-haves from text" },
    { title: "Company Crawl", desc: "Ranking internal links, discovering /careers & handbook" },
    { title: "Interview Discussion", desc: "Searching public discussions of company interview process" },
    { title: "Synthesis", desc: "Generating categorized technical & behavioural questions" },
    { title: "Pass 2 Coverage Loop", desc: "Auditing questions vs requirements & building schedule" },
  ];

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setJdText(SAMPLE_JOB_DESCRIPTIONS[index].jd);
    setCompanyUrl(SAMPLE_JOB_DESCRIPTIONS[index].url);
    setDays(SAMPLE_JOB_DESCRIPTIONS[index].days);
    setGenerationComplete(false);
    setCurrentStep(0);
  };

  const handleSimulateGeneration = () => {
    setIsGenerating(true);
    setGenerationComplete(false);
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          setIsGenerating(false);
          setGenerationComplete(true);
          return prev;
        }
      });
    }, 700);
  };

  return (
    <div className="flex-1 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[650px] h-[650px] bg-gradient-to-tr from-indigo-500/15 via-violet-500/15 to-sky-400/15 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Full-Stack Engineering Assessment · FS-AI-INTERVIEW-01</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            The AI Interview{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              Prep Kit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            Turn any job description and company website into a bespoke interview preparation kit. Deep company research, categorized question banks, flashcards, and a day-by-day study schedule.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Open Prep Kit Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                href="/signup"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 font-semibold text-sm shadow-sm transition-all"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Generator Preview Playground */}
      <section className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
          {/* Playground Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-xs text-zinc-500 font-medium">kit-generator-v1.0</span>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 hidden sm:inline">Try preset:</span>
              {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetChange(idx)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedPreset === idx
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                  }`}
                >
                  {preset.company}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-zinc-200 dark:divide-zinc-800">
            {/* Input Column */}
            <div className="lg:col-span-6 p-6 sm:p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Job Description Text
                </label>
                <textarea
                  rows={6}
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the full job posting text here..."
                  className="w-full p-3.5 text-xs font-mono rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-indigo-500" />
                    Company Website
                  </label>
                  <input
                    type="url"
                    value={companyUrl}
                    onChange={(e) => setCompanyUrl(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      Prep Window
                    </label>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                      {days} {days === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full accent-indigo-600 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleSimulateGeneration}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing Deliberate Research Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Pipeline & Generate Kit</span>
                  </>
                )}
              </button>
            </div>

            {/* Pipeline Stage & Output Column */}
            <div className="lg:col-span-6 p-6 sm:p-8 bg-zinc-50/50 dark:bg-zinc-950/30 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Deliberate Multi-Stage Pipeline
                </h3>
                <span className="text-xs text-zinc-400 font-mono">Section 3 & 4</span>
              </div>

              {/* Step Progress Checklist */}
              <div className="space-y-3">
                {steps.map((step, idx) => {
                  const isActive = isGenerating && currentStep === idx;
                  const isDone = (!isGenerating && generationComplete) || (isGenerating && currentStep > idx);

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-2.5 rounded-xl border transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                          : isDone
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-300'
                          : 'border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0 ${
                          isDone
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-indigo-600 text-white animate-pulse'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                      </div>
                      <div className="text-xs space-y-0.5">
                        <div className="font-semibold">{step.title}</div>
                        <div className="text-zinc-500 dark:text-zinc-400">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Generation Result Teaser */}
              {generationComplete && (
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-500/30 space-y-3 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Kit Ready (Pass 2 Completed)
                    </span>
                    <span className="font-mono text-zinc-500">100% Coverage</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">
                    6 requirements mapped, 5 categorized questions, 5 flashcards, and a {days}-day schedule generated.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <span>Inspect and practice in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Specification Pillars Grid */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Engineered According to Trao Specs
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Every section of the assessment is implemented with high engineering rigor and clear separation of concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              The Deliberate Research Loop
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Crawls the company site, ranks internal links, extracts interview discussion, and executes Pass 2 gap-checking so no must-have requirement is left uncovered.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              The Reshapeable Builder
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Edit any question inline, reorder items, add custom flashcards, and regenerate individual sections without clobbering pinned or manually edited content.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Interactive Practice Mode
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Flip through flashcards, rate confidence (Need Practice, Getting There, Confident), and review according to confidence-weighted spacing.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Deterministic Day-by-Day Schedule
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Pure arithmetic topic allocation across requested days (1–60 days). Distributes harder priorities first with integer minute durations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Appendix A Structure Strictness
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Kits strictly conform to the spec JSON schema with stable IDs (<code>r1</code>, <code>q1</code>, <code>f1</code>), integer minutes, and verified requirement mappings.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Batch CLI Pipeline Support
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Designed for Section 9 batch evaluation: <code>npm run evaluate -- --input cases.json --output kits.json</code> with graceful failure tolerance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500">
        Trao.ai © {new Date().getFullYear()} — Full-Stack AI Interview Prep Kit
      </footer>
    </div>
  );
}
