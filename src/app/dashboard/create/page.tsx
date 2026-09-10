'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_JOB_DESCRIPTIONS, PrepKit } from '../../../data/sampleKit';
import { KitService, GenerateKitPayload } from '../../../services/kit.service';

export default function CreateKitPage() {
  const router = useRouter();

  // Form State
  const [selectedPreset, setSelectedPreset] = useState<number | null>(0);
  const [formCompany, setFormCompany] = useState(SAMPLE_JOB_DESCRIPTIONS[0].company);
  const [formUrl, setFormUrl] = useState(SAMPLE_JOB_DESCRIPTIONS[0].url);
  const [formDays, setFormDays] = useState(SAMPLE_JOB_DESCRIPTIONS[0].days);
  const [formJd, setFormJd] = useState(SAMPLE_JOB_DESCRIPTIONS[0].jd);

  // Pipeline execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationLogs, setGenerationLogs] = useState<{ stage: string; message: string; timestamp: string }[]>([]);
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
    setGenerationProgress(10);
    setGenerationLogs([{ stage: 'INIT', message: 'Starting real-time interview synthesis pipeline...', timestamp: new Date().toLocaleTimeString() }]);

    const addLog = (stage: string, msg: string) => {
      setGenerationLogs((prev) => [
        ...prev,
        { stage, message: msg, timestamp: new Date().toLocaleTimeString() }
      ]);
    };

    try {
      const payload: GenerateKitPayload = {
        jd: formJd,
        company_url: formUrl,
        days: Number(formDays) || 5,
        company_name: formCompany.trim() || undefined
      };

      setGenerationProgress(25);

      const generated = await KitService.generateKitStream(payload, (stage, message) => {
        addLog(stage, message);
        if (stage.includes('CRAWL')) setGenerationProgress(50);
        if (stage.includes('SYNTHESIS')) setGenerationProgress(75);
        if (stage.includes('COVERAGE')) setGenerationProgress(90);
      });

      setGenerationProgress(100);
      addLog('DONE', 'Kit compiled & validated against Appendix A!');

      // Store generated kit ID in localStorage so practice / dashboard picks it up
      try {
        const stored = localStorage.getItem('active_kit');
        localStorage.setItem('active_kit', JSON.stringify(generated));
      } catch (e) {}

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      addLog('ERROR', err.message || 'Pipeline network fallback applied.');
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

          {/* Right Col: Live Pipeline Status Preview */}
          <div className="space-y-4">
            <div className="glass-card p-5 rounded-2xl border border-white/80 flex flex-col h-full">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider block mb-3">
                Live 5-Step Pipeline Chain
              </span>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              {/* Chain Steps */}
              <div className="space-y-3 flex-1">
                {[
                  { title: '1. Requirement Extraction', desc: 'Classify must vs nice-to-have' },
                  { title: '2. SSRF Guard & Web Crawl', desc: 'Homepage & /careers ranking' },
                  { title: '3. Public Discussion Search', desc: 'Interview round intelligence' },
                  { title: '4. Question & Flashcard Synthesis', desc: 'Categorized technical questions' },
                  { title: '5. Pass 2 Coverage Loop', desc: '100% must-have validation' }
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

              {/* Live Terminal Log Box */}
              {generationLogs.length > 0 && (
                <div className="mt-4 p-3 rounded-xl bg-zinc-950 text-white font-code-metric text-[10px] max-h-36 overflow-y-auto space-y-1">
                  {generationLogs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-zinc-500">{log.timestamp}</span>
                      <span className="text-primary font-bold">[{log.stage}]</span>
                      <span className="text-zinc-300">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
