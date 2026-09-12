'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { API_ROUTES } from '../constants/apiRoutes';
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
  FileText,
  Activity,
  Server
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

  // Backend Health Check State (Pings Render backend on landing page render)
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'waking_up'>('checking');
  const [healthInfo, setHealthInfo] = useState<{ database?: string; latency?: number; service?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkBackendHealth = async () => {
      try {
        const startTime = performance.now();
        console.log('[LandingPage] Hitting backend health check API on mount...');
        const response = await apiClient<{ status: string; service: string; database: string }>(
          API_ROUTES.HEALTH
        );
        const latency = Math.round(performance.now() - startTime);
        console.log('[LandingPage] Backend health check response:', response, `Latency: ${latency}ms`);

        if (isMounted) {
          if (response?.data?.status === 'ok') {
            setHealthStatus('healthy');
            setHealthInfo({
              database: response.data.database,
              service: response.data.service,
              latency,
            });
          } else {
            setHealthStatus('waking_up');
          }
        }
      } catch (error) {
        console.warn('[LandingPage] Health check ping (server warming up or error):', error);
        if (isMounted) {
          setHealthStatus('waking_up');
        }
      }
    };

    checkBackendHealth();

    return () => {
      isMounted = false;
    };
  }, []);

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
    <div className="relative min-h-screen flex flex-col justify-between bg-slate-50/90 dark:bg-zinc-950 font-body-md text-on-surface selection:bg-indigo-600 selection:text-white transition-colors">
      {/* Modern Executive Subtle Dot Grid Background matching Dashboard */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-40"
        aria-hidden="true"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="w-[650px] h-[650px] bg-gradient-to-tr from-indigo-500/10 via-violet-500/10 to-sky-400/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>AI-Powered Interview Studio</span>
            </div>

            {/* Live Backend Connection Indicator (Render) */}
            <div
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border shadow-xs transition-all ${
                healthStatus === 'healthy'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/70 border-emerald-300/80 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                  : healthStatus === 'checking'
                  ? 'bg-amber-50/90 dark:bg-amber-950/70 border-amber-300/80 dark:border-amber-800/80 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-50/90 dark:bg-rose-950/70 border-rose-300/80 dark:border-rose-800/80 text-rose-800 dark:text-rose-300'
              }`}
              title={
                healthInfo
                  ? `Backend: Render (trao-ai-backend.onrender.com)\nDatabase: ${healthInfo.database}\nLatency: ${healthInfo.latency}ms`
                  : 'Pinging backend health check...'
              }
            >
              <span className="relative flex h-2 w-2">
                {healthStatus === 'healthy' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                {healthStatus === 'checking' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    healthStatus === 'healthy'
                      ? 'bg-emerald-500'
                      : healthStatus === 'checking'
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                ></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Server className="w-3 h-3 opacity-70" />
                <span>
                  {healthStatus === 'healthy'
                    ? `Render Backend Connected (${healthInfo?.latency || 0}ms)`
                    : healthStatus === 'checking'
                    ? 'Connecting to Render Backend...'
                    : 'Backend Waking Up...'}
                </span>
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            The AI Interview{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 bg-clip-text text-transparent">
              Prep Kit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Turn any job description and company website into a bespoke interview preparation kit. Deep company research, categorized question banks, flashcards, and a day-by-day study schedule.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/dashboard"
              prefetch={true}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-slate-900 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Open Prep Kit Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAuthenticated && (
              <Link
                href="/signup"
                prefetch={true}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-zinc-900/90 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700 font-bold text-sm shadow-xs transition-all cursor-pointer"
              >
                <span>Create Free Account</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Generator Preview Playground */}
      <section id="playground" className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 scroll-mt-24">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-xl overflow-hidden">
          {/* Playground Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/40">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 font-mono text-xs text-zinc-500 font-medium">kit-generator-v1.0</span>
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">|</span>
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    healthStatus === 'healthy'
                      ? 'bg-emerald-500 animate-pulse'
                      : healthStatus === 'checking'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-rose-400'
                  }`}
                />
                API:{' '}
                {healthStatus === 'healthy'
                  ? `Render Online (${healthInfo?.latency || 0}ms)`
                  : healthStatus === 'checking'
                  ? 'Connecting...'
                  : 'Waking Up...'}
              </span>
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
                <span className="text-xs text-zinc-400 font-mono">Pipeline Engine</span>
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
      <section id="features" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 space-y-12 scroll-mt-24">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            Built for Modern Tech Hiring
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Everything you need to crack high-bar engineering and leadership interviews with precision.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-100/80 via-sky-100/50 to-white dark:from-blue-950/40 dark:via-sky-950/20 dark:to-zinc-900 border border-blue-200/90 dark:border-blue-800/60 shadow-xs hover:shadow-md hover:shadow-blue-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-blue-950 dark:text-white">
              The Deliberate Research Loop
            </h3>
            <p className="text-sm text-blue-950/80 dark:text-blue-200/80 leading-relaxed">
              Crawls the company site, ranks internal links, extracts interview discussion, and executes Pass 2 gap-checking so no must-have requirement is left uncovered.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-100/80 via-purple-100/50 to-white dark:from-violet-950/40 dark:via-purple-950/20 dark:to-zinc-900 border border-violet-200/90 dark:border-violet-800/60 shadow-xs hover:shadow-md hover:shadow-violet-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md shadow-violet-500/25 group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-violet-950 dark:text-white">
              The Reshapeable Builder
            </h3>
            <p className="text-sm text-violet-950/80 dark:text-violet-200/80 leading-relaxed">
              Edit any question inline, reorder items, add custom flashcards, and regenerate individual sections without clobbering pinned or manually edited content.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-100/80 via-teal-100/50 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-zinc-900 border border-emerald-200/90 dark:border-emerald-800/60 shadow-xs hover:shadow-md hover:shadow-emerald-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-emerald-950 dark:text-white">
              Interactive Practice Mode
            </h3>
            <p className="text-sm text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
              Flip through flashcards, rate confidence (Need Practice, Getting There, Confident), and review according to confidence-weighted spacing.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-100/80 via-orange-100/50 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-zinc-900 border border-amber-200/90 dark:border-amber-800/60 shadow-xs hover:shadow-md hover:shadow-amber-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-amber-950 dark:text-white">
              Deterministic Day-by-Day Schedule
            </h3>
            <p className="text-sm text-amber-950/80 dark:text-amber-200/80 leading-relaxed">
              Pure arithmetic topic allocation across requested days (1–60 days). Distributes harder priorities first with integer minute durations.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-100/80 via-blue-100/50 to-white dark:from-indigo-950/40 dark:via-blue-950/20 dark:to-zinc-900 border border-indigo-200/90 dark:border-indigo-800/60 shadow-xs hover:shadow-md hover:shadow-indigo-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-indigo-950 dark:text-white">
              Standardized Schema Accuracy
            </h3>
            <p className="text-sm text-indigo-950/80 dark:text-indigo-200/80 leading-relaxed">
              Kits strictly conform to verified schemas with stable question keys, integer minute durations, and validated coverage.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-100/80 via-pink-100/50 to-white dark:from-rose-950/40 dark:via-pink-950/20 dark:to-zinc-900 border border-rose-200/90 dark:border-rose-800/60 shadow-xs hover:shadow-md hover:shadow-rose-500/15 transition-all space-y-3 group">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-rose-950 dark:text-white">
              Batch Multi-Role Evaluation
            </h3>
            <p className="text-sm text-rose-950/80 dark:text-rose-200/80 leading-relaxed">
              Designed for high-throughput batch evaluation: <code>npm run evaluate -- --input cases.json --output kits.json</code> with graceful failure tolerance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200/80 dark:border-zinc-800 py-6 text-center text-xs text-zinc-500 font-medium">
        PrepKit.ai © {new Date().getFullYear()} — Full-Stack AI Interview Prep Kit
      </footer>
    </div>
  );
}
