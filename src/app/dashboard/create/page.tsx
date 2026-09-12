'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_JOB_DESCRIPTIONS, PrepKit } from '../../../data/sampleKit';
import { KitService, GenerateKitPayload } from '../../../services/kit.service';

interface PipelineStep {
  id: string;
  name: string;
  tag: string;
  defaultDesc: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'VALIDATE', name: 'Input & Safety Validation', tag: 'VALIDATE', defaultDesc: 'Sanitizing JD text and verifying safe public domain' },
  { id: 'EXTRACT', name: 'Role & Skill Extraction', tag: 'EXTRACT', defaultDesc: 'Parsing must-have & nice-to-have capabilities from JD' },
  { id: 'CRAWL', name: 'Company & Culture Crawl', tag: 'CRAWL', defaultDesc: 'Crawling careers page, interview guidelines & discussions' },
  { id: 'BRIEF', name: 'Company Brief Synthesis', tag: 'BRIEF', defaultDesc: 'Synthesizing verified business operations & engineering context' },
  { id: 'QUESTIONS', name: 'Interview Question Synthesis', tag: 'QUESTIONS', defaultDesc: 'Generating categorized technical & behavioural question bank' },
  { id: 'FLASHCARDS', name: 'Active-Recall Flashcards', tag: 'FLASHCARDS', defaultDesc: 'Distilling high-yield concept review cards' },
  { id: 'COVERAGE', name: 'Requirement Coverage Audit', tag: 'COVERAGE', defaultDesc: 'Auditing 100% must-have coverage via Pass 2 loop' },
  { id: 'SCHEDULE', name: 'Deterministic Schedule', tag: 'SCHEDULE', defaultDesc: 'Allocating questions across target interview days' },
];

export default function CreateKitPage() {
  const router = useRouter();

  // Form State
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [formCompany, setFormCompany] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDays, setFormDays] = useState(5);
  const [formJd, setFormJd] = useState('');

  // Pipeline execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(-1);
  const [currentLiveMessage, setCurrentLiveMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Batch upload state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchJson, setBatchJson] = useState('');

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const preset = SAMPLE_JOB_DESCRIPTIONS[idx];
    setFormCompany(preset.company);
    setFormUrl(preset.url);
    setFormDays(preset.days);
    setFormJd(preset.jd);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJd.trim()) {
      setStatusMessage('Please provide a Job Description.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(8);
    setCurrentStageIndex(0);
    setCurrentLiveMessage('Validating inputs and normalizing company URL...');

    try {
      const payload: GenerateKitPayload = {
        jd: formJd,
        company_url: formUrl,
        days: Number(formDays) || 5,
        company_name: formCompany.trim() || undefined
      };

      const stageMap: Record<string, { idx: number; progress: number }> = {
        VALIDATE: { idx: 0, progress: 12 },
        EXTRACT: { idx: 1, progress: 24 },
        CRAWL: { idx: 2, progress: 38 },
        BRIEF: { idx: 3, progress: 52 },
        QUESTIONS: { idx: 4, progress: 66 },
        FLASHCARDS: { idx: 5, progress: 78 },
        COVERAGE: { idx: 6, progress: 88 },
        SCHEDULE: { idx: 7, progress: 95 },
        VALIDATE_KIT: { idx: 7, progress: 98 },
      };

      const generated = await KitService.generateKitStream(payload, (stage, message) => {
        const s = (stage || '').toUpperCase();
        for (const [key, mapping] of Object.entries(stageMap)) {
          if (s.includes(key)) {
            setCurrentStageIndex(mapping.idx);
            setGenerationProgress(mapping.progress);
            break;
          }
        }
        if (message) {
          setCurrentLiveMessage(message);
        }
      });

      setGenerationProgress(100);
      setCurrentStageIndex(PIPELINE_STEPS.length);
      setCurrentLiveMessage('Prep kit compiled & verified! Redirecting to dashboard...');

      // Store generated kit in localStorage so practice / dashboard picks it up
      try {
        localStorage.setItem('active_kit', JSON.stringify(generated));
      } catch (e) {}

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setIsGenerating(false);
      setCurrentStageIndex(-1);
      setCurrentLiveMessage('');
      setStatusMessage(err.message || 'Generation failed. Please try again.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1800);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white tracking-tight">Create New Kit</h1>
        </div>

        <button
          type="button"
          onClick={() => setIsBatchMode(!isBatchMode)}
          className="px-4 py-2 rounded-xl glass-card text-xs font-semibold hover:bg-white text-on-surface border border-white/80 transition-all flex items-center gap-2 self-start"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isBatchMode ? 'edit_document' : 'upload_file'}
          </span>
          <span>{isBatchMode ? 'Switch to Single Kit' : 'Batch Multi-Role Upload (JSON)'}</span>
        </button>
      </div>

      {isBatchMode ? (
        /* Batch Multi-Role Mode */
        <div className="glass-card p-6 rounded-2xl border border-white/80 space-y-4">
          <h2 className="text-base font-bold text-on-surface">Batch Multi-Role Upload</h2>
          <p className="text-xs text-on-surface-variant">
            Paste a JSON array of role objects containing <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">description</code> and <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">company</code> pairs to prepare for multiple interviews simultaneously.
          </p>
          <textarea
            rows={10}
            value={batchJson}
            onChange={(e) => setBatchJson(e.target.value)}
            placeholder={`[\n  {\n    "company": "Stripe",\n    "url": "https://stripe.com",\n    "days": 5,\n    "jd": "Senior Full-Stack Engineer with React & Node..."\n  }\n]`}
            className="w-full font-code-metric text-xs p-4 rounded-xl glass-panel border border-white/80 focus:ring-2 focus:ring-primary/40 focus:outline-none"
          />
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(batchJson);
                if (Array.isArray(parsed)) {
                  setStatusMessage(`Batch verified: ${parsed.length} roles found. Generating kits...`);
                  setTimeout(() => router.push('/dashboard'), 1500);
                }
              } catch (e: any) {
                setStatusMessage(`Invalid JSON: ${e.message}`);
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-md shadow-primary/25 hover:opacity-95 transition-all"
          >
            Process Batch Roles
          </button>
          {statusMessage && <p className="text-xs text-primary font-medium">{statusMessage}</p>}
        </div>
      ) : (
        /* Single Kit Creation Form */
        <form onSubmit={handleGenerate} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Presets Row */}
            <div className="glass-card p-4 rounded-2xl border border-white/80">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-2">
                Quick Start Presets
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedPreset === idx
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white/70 text-on-surface-variant hover:bg-white border-white/80'
                    }`}
                  >
                    {preset.company} · {preset.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Details */}
            <div className="glass-card p-6 rounded-2xl border border-white/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => {
                      setFormCompany(e.target.value);
                      setSelectedPreset(null);
                    }}
                    placeholder="e.g. Stripe, OpenAI, Airbnb"
                    className="w-full h-10 px-3.5 rounded-xl glass-panel text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1.5">
                    Company Website (Crawler URL)
                  </label>
                  <input
                    type="url"
                    required
                    value={formUrl}
                    onChange={(e) => {
                      setFormUrl(e.target.value);
                      setSelectedPreset(null);
                    }}
                    placeholder="https://company.com"
                    className="w-full h-10 px-3.5 rounded-xl glass-panel text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">
                  Interview Preparation Timeline (Days Available)
                </label>
                <div className="flex items-center gap-3">
                  {[3, 5, 7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormDays(d)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        formDays === d
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white/70 text-on-surface-variant hover:bg-white border-white/80'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={formDays}
                    onChange={(e) => setFormDays(Number(e.target.value))}
                    className="w-20 h-8 px-2 rounded-xl glass-panel text-xs text-center border border-white/80"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1.5">
                  Job Description Text
                </label>
                <textarea
                  rows={9}
                  required
                  value={formJd}
                  onChange={(e) => {
                    setFormJd(e.target.value);
                    setSelectedPreset(null);
                  }}
                  placeholder="Paste complete raw job description text here..."
                  className="w-full p-3.5 rounded-xl glass-panel text-xs font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 border border-white/80 leading-relaxed"
                />
                <span className="text-[11px] text-on-surface-variant font-code-metric mt-1 block">
                  {formJd.length} characters
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-white/60 transition-all"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-500/30 hover:opacity-95 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">
                  {isGenerating ? 'progress_activity' : 'bolt'}
                </span>
                <span>
                  {isGenerating
                    ? currentStageIndex >= 0 && currentStageIndex < PIPELINE_STEPS.length
                      ? `${PIPELINE_STEPS[currentStageIndex].name}...`
                      : 'Compiling Kit...'
                    : 'Generate Prep Kit'}
                </span>
              </button>
            </div>
          </div>

          {/* Right Col: 8-Stage Synthesis Protocol Reference */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-white/80 flex flex-col h-full">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-1">
                8-Stage Synthesis Protocol
              </span>
              <div className="mb-3 text-[11px] text-on-surface-variant leading-relaxed">
                Your kit is synthesized through an 8-stage grounded protocol verifying role requirements, crawling verified web sources, and computing arithmetic schedules.
              </div>

              {/* Steps List */}
              <div className="space-y-2 flex-1">
                {PIPELINE_STEPS.map((step, idx) => (
                  <div
                    key={step.id}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl text-xs glass-panel border border-white/60 opacity-80"
                  >
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-on-surface truncate">
                          {idx + 1}. {step.name}
                        </span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          [{step.tag}]
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5 leading-snug text-on-surface-variant">
                        {step.defaultDesc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* FULL-PAGE BLURRED CENTERED MODAL LOADER (ACTIVE UNTIL DONE) */}
      {/* ========================================================================= */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 dark:border-zinc-800 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -left-24 w-52 h-52 bg-primary/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Centered Animated Ring */}
            <div className="relative w-20 h-20 mb-5 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping opacity-60" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent animate-spin duration-1000" />
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white z-10">
                <span className="material-symbols-outlined text-[28px] animate-pulse">
                  {generationProgress >= 100 ? 'check' : 'auto_awesome'}
                </span>
              </div>
            </div>

            {/* Title & Context */}
            <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
              {generationProgress >= 100 ? 'Your Prep Kit is Ready!' : 'Synthesizing Your Prep Kit'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm">
              {formCompany
                ? `Personalizing interview roadmap for ${formCompany}`
                : 'Tailoring role questions & verified company insights'}
            </p>

            {/* Overall Progress Bar & Percentage */}
            <div className="w-full mt-6 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold px-1">
                <span className="text-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>
                    {currentStageIndex >= 0 && currentStageIndex < PIPELINE_STEPS.length
                      ? `Stage ${currentStageIndex + 1} of ${PIPELINE_STEPS.length}`
                      : 'Finalizing Kit...'}
                  </span>
                </span>
                <span className="font-mono text-primary font-black text-sm">{generationProgress}%</span>
              </div>

              <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
                <div
                  className="h-full bg-gradient-to-r from-primary via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
            </div>

            {/* Active Stage Card */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700/80 text-left transition-all shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
                    progress_activity
                  </span>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">
                    {currentStageIndex >= 0 && currentStageIndex < PIPELINE_STEPS.length
                      ? PIPELINE_STEPS[currentStageIndex].name
                      : 'Assembly & Validation'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/15 border border-primary/20">
                  {generationProgress >= 100 ? 'Completed' : 'In Progress'}
                </span>
              </div>

              <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed font-medium">
                {currentLiveMessage ||
                  (currentStageIndex >= 0 && currentStageIndex < PIPELINE_STEPS.length
                    ? PIPELINE_STEPS[currentStageIndex].defaultDesc
                    : 'Validating assembled kit against Appendix A schema...')}
              </p>
            </div>

            {/* 8-Stage Progress Track Indicators */}
            <div className="w-full mt-5">
              <div className="grid grid-cols-8 gap-1.5">
                {PIPELINE_STEPS.map((step, idx) => {
                  const isDone = currentStageIndex > idx || generationProgress >= 100;
                  const isCurrent = currentStageIndex === idx && generationProgress < 100;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                          isDone
                            ? 'bg-emerald-500'
                            : isCurrent
                            ? 'bg-primary ring-2 ring-primary/30 animate-pulse'
                            : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                      <span
                        className={`text-[9px] font-mono transition-colors ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isDone
                            ? 'text-emerald-500 font-medium'
                            : 'text-zinc-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reassurance Footer */}
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              <span className="material-symbols-outlined text-[14px]">hourglass_top</span>
              <span>Autonomous research in progress · Usually takes 15–20 seconds</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
