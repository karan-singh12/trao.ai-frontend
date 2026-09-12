'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_JOB_DESCRIPTIONS, PrepKit } from '../../../data/sampleKit';
import { KitService, GenerateKitPayload } from '../../../services/kit.service';

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
  const [currentPhase, setCurrentPhase] = useState('');
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
    setGenerationProgress(15);
    setCurrentPhase('Analyzing role & requirements...');

    try {
      const payload: GenerateKitPayload = {
        jd: formJd,
        company_url: formUrl,
        days: Number(formDays) || 5,
        company_name: formCompany.trim() || undefined
      };

      const generated = await KitService.generateKitStream(payload, (stage) => {
        const s = stage.toUpperCase();
        if (s.includes('EXTRACT')) {
          setCurrentPhase('Analyzing key skills & qualifications...');
          setGenerationProgress(30);
        } else if (s.includes('CRAWL')) {
          setCurrentPhase('Gathering company culture & context...');
          setGenerationProgress(50);
        } else if (s.includes('SYNTHESIS') || s.includes('QUESTION') || s.includes('BRIEF')) {
          setCurrentPhase('Generating tailored questions & flashcards...');
          setGenerationProgress(75);
        } else if (s.includes('COVERAGE') || s.includes('SCHEDULE')) {
          setCurrentPhase('Structuring personalized study plan...');
          setGenerationProgress(90);
        }
      });

      setGenerationProgress(100);
      setCurrentPhase('Kit ready! Redirecting to dashboard...');

      // Store generated kit in localStorage so practice / dashboard picks it up
      try {
        localStorage.setItem('active_kit', JSON.stringify(generated));
      } catch (e) {}

      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setCurrentPhase('');
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
                <span className="material-symbols-outlined text-[18px]">
                  {isGenerating ? 'autorenew' : 'bolt'}
                </span>
                <span>{isGenerating ? 'Compiling Kit...' : 'Generate Prep Kit'}</span>
              </button>
            </div>
          </div>

          {/* Right Col: Preparation Framework Overview */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-white/80 flex flex-col h-full">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-3">
                {isGenerating ? 'Generating Your Prep Kit' : '5-Step Preparation Framework'}
              </span>

              {/* Progress Bar (Visible during generation) */}
              {isGenerating && (
                <div className="mb-4 space-y-2">
                  <div className="w-full h-2 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-indigo-600 transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    />
                  </div>
                  {currentPhase && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{currentPhase}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Chain Steps */}
              <div className="space-y-3 flex-1">
                {[
                  { title: '1. Role & Skill Analysis', desc: 'Identify core competencies & technical qualifications' },
                  { title: '2. Company Research', desc: 'Analyze company mission, values & engineering culture' },
                  { title: '3. Interview Intelligence', desc: 'Synthesize real-world interview formats & question patterns' },
                  { title: '4. Questions & Flashcards', desc: 'Curate targeted technical & behavioural prep cards' },
                  { title: '5. Personalized Study Schedule', desc: 'Distribute study sessions evenly across your target days' }
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl glass-panel text-xs border border-white/80">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div>
                      <div className="font-bold text-on-surface">{step.title}</div>
                      <div className="text-[11px] text-on-surface-variant">{step.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
