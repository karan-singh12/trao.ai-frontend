export interface Requirement {
  id: string;
  text: string;
  kind: 'technical' | 'behavioural' | 'domain';
  priority: 'must' | 'nice';
}

export interface Question {
  id: string;
  requirement_ids: string[];
  category: 'technical' | 'behavioural' | 'system-design' | 'company-fit';
  prompt: string;
  answer_outline: string;
  difficulty: 1 | 2 | 3;
  rubric?: {
    must_include?: string[];
    good_to_include?: string[];
  };
  isEdited?: boolean;
  isPinned?: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  requirement_ids: string[];
  confidence?: 'none' | 'somewhat' | 'confident';
}

export interface ScheduleDay {
  day: number;
  focus: string;
  question_ids: string[];
  minutes: number;
}

export interface PrepKit {
  source: {
    company: string;
    company_url: string;
    role: string;
    location: string;
    jd_chars: number;
    researched_at: string;
    pages_used: string[];
    logo_url?: string;
  };
  company_brief: {
    summary: string;
    what_they_do: string;
    sources: string[];
    logo_url?: string;
  };
  role: {
    title: string;
    seniority: string;
    responsibilities: string[];
    requirements: Requirement[];
  };
  questions: Question[];
  flashcards: Flashcard[];
  schedule: {
    days_available: number;
    days: ScheduleDay[];
  };
  coverage: {
    uncovered_requirement_ids: string[];
    passes: number;
  };
  _id?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;

  // UI / Status Metadata for Executive Dashboard Cards
  status?: 'ready' | 'generating' | 'review';
  statusBadge?: string;
  urgencyBadge?: string;
  interviewInDays?: number;
  interviewDateStr?: string;
  levelBadge?: string;
  tags?: string[];
  questionMixSummary?: string;
  masteredCount?: number;
  totalCards?: number;
  masteryPercentage?: number;
  currentCadenceDay?: number;
  totalCadenceDays?: number;
  cadenceNote?: string;
  lastPracticedNote?: string;
  pipelineProgress?: number;
  pipelineStep?: string;
  pipelineDetail?: string;
  fallbackNotice?: string;
}

export const SAMPLE_STRIPE_KIT: PrepKit = {
  id: "kit-stripe-01",
  status: "ready",
  statusBadge: "Ready to Practice",
  urgencyBadge: "Interview in 3 Days (Oct 24)",
  interviewInDays: 3,
  interviewDateStr: "Oct 24",
  levelBadge: "Level L6",
  tags: ["Platform & Reliability", "Distributed Systems"],
  questionMixSummary: "18 Tech • 12 Sys Design • 8 Behavioral • 4 Fit",
  masteredCount: 29,
  totalCards: 42,
  masteryPercentage: 69,
  currentCadenceDay: 4,
  totalCadenceDays: 7,
  cadenceNote: "Final mock exam in 48 hours",
  lastPracticedNote: "Last practiced 3 hours ago • 3 mock runs logged",
  source: {
    company: "Stripe",
    company_url: "https://stripe.com",
    role: "Senior Staff Infrastructure Engineer",
    location: "San Francisco, CA / Remote",
    jd_chars: 3120,
    researched_at: "2026-09-08T10:30:00Z",
    pages_used: [
      "https://stripe.com/about",
      "https://stripe.com/jobs/process",
      "https://stripe.com/blog/engineering"
    ]
  },
  company_brief: {
    summary: "Stripe builds economic infrastructure for the internet, powering payments, subscriptions, and financial automation for millions of businesses worldwide.",
    what_they_do: "Processes online payments, billing, treasury APIs, and fraud prevention through sophisticated distributed systems and developer-first APIs.",
    sources: [
      "https://stripe.com/about",
      "https://stripe.com/jobs/process"
    ]
  },
  role: {
    title: "Senior Staff Infrastructure Engineer",
    seniority: "Staff / Principal (L6)",
    responsibilities: [
      "Architect high-throughput ledger pipelines processing billions in transaction volume",
      "Lead distributed consistency reviews across payment authorization clusters",
      "Drive disaster recovery simulations and zero-downtime database failovers"
    ],
    requirements: [
      { id: "r1", text: "Distributed systems, database transaction isolation, and caching strategies", kind: "technical", priority: "must" },
      { id: "r2", text: "Deep understanding of RESTful API design, idempotent workflows, and microservices", kind: "technical", priority: "must" },
      { id: "r3", text: "Production experience with high-throughput Raft/Paxos consensus clusters", kind: "technical", priority: "must" },
      { id: "r4", text: "Mentoring staff engineers and driving cross-functional architectural reviews", kind: "behavioural", priority: "must" }
    ]
  },
  questions: [
    {
      id: "q1",
      requirement_ids: ["r1"],
      category: "system-design",
      prompt: "Design a globally distributed payment ledger with strict serializability and sub-50ms p99 write latency.",
      answer_outline: "Discuss 2PC vs Spanner TrueTime, multi-region Raft groups, pessimistic write locks, and read replicas with snapshot isolation.",
      difficulty: 3
    },
    {
      id: "q2",
      requirement_ids: ["r2"],
      category: "technical",
      prompt: "Explain how you would design an idempotent payments endpoint to prevent double charges on mobile network timeouts.",
      answer_outline: "Discuss client-generated UUID Idempotency-Key header, Redis/DB distributed locks, state machine transitions, and replay caches.",
      difficulty: 3
    },
    {
      id: "q3",
      requirement_ids: ["r3"],
      category: "system-design",
      prompt: "Design a high-throughput webhook delivery pipeline that delivers payment events to 100,000+ merchant endpoints with retry backoffs.",
      answer_outline: "Cover event publisher, message queues (Kafka/RabbitMQ), worker pools, exponential jitter backoff, dead letter queues, and rate-limiting outgoing traffic per domain.",
      difficulty: 3
    },
    {
      id: "q4",
      requirement_ids: ["r4"],
      category: "behavioural",
      prompt: "Describe a situation where you had to push back on a high-priority product deadline because of critical architectural debt. How did you align the team?",
      answer_outline: "Use STAR method: explain the business context, risk assessment metrics, proposed phased compromise, and the successful outcome.",
      difficulty: 2
    },
    {
      id: "q5",
      requirement_ids: ["r1"],
      category: "company-fit",
      prompt: "Why Stripe, and how does your experience in financial reliability map to our operating principle of 'Users First'?",
      answer_outline: "Connect personal craft and reliability standards with Stripe's obsession with developer experience, API precision, and global economic access.",
      difficulty: 1
    }
  ],
  flashcards: [
    {
      id: "f1",
      front: "What is an Idempotency Key and why is it essential in payment APIs?",
      back: "A unique identifier passed by the client ensuring that if a request is retried due to network disruption, the server executes the mutation exactly once and returns the cached result.",
      requirement_ids: ["r2"]
    },
    {
      id: "f2",
      front: "What are the 4 ACID properties in relational database transactions?",
      back: "Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent operations do not interfere), Durability (persisted across crashes).",
      requirement_ids: ["r1"]
    },
    {
      id: "f3",
      front: "How does Raft handle network partitions during leader election?",
      back: "The partitioned minority cannot achieve a quorum (N/2 + 1) so it cannot commit logs. Once reunited, the term numbers reconcile and uncommitted minority logs are rolled back.",
      requirement_ids: ["r3"]
    },
    {
      id: "f4",
      front: "What is the difference between pessimistic and optimistic concurrency control?",
      back: "Pessimistic locks the record preventing others from reading/writing; Optimistic checks a version/timestamp at commit time and rolls back if another transaction modified the entity.",
      requirement_ids: ["r1"]
    },
    {
      id: "f5",
      front: "How do you structure answers to behavioral questions for staff engineering roles?",
      back: "Use STAR: Situation (context/problem), Task (your specific goal), Action (decisions and influence you demonstrated), Result (quantifiable metric or learned outcome).",
      requirement_ids: ["r4"]
    }
  ],
  schedule: {
    days_available: 7,
    days: [
      { day: 1, focus: "Distributed Consensus & Raft Invariants", question_ids: ["q1"], minutes: 80 },
      { day: 2, focus: "Idempotent API Design & Isolation Guarantees", question_ids: ["q2"], minutes: 75 },
      { day: 3, focus: "High-Throughput Webhook & Event Fanout", question_ids: ["q3"], minutes: 90 },
      { day: 4, focus: "Staff Engineering Leadership & STAR Behavioral Scenarios", question_ids: ["q4"], minutes: 60 },
      { day: 5, focus: "Stripe Principles, Operating Cadence, & Cultural Fit", question_ids: ["q5"], minutes: 45 },
      { day: 6, focus: "System Design Deep Dive Mock & Whiteboarding", question_ids: ["q1", "q3"], minutes: 90 },
      { day: 7, focus: "Final Comprehensive Readiness Polish", question_ids: ["q2", "q4"], minutes: 45 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 2
  }
};

export const SAMPLE_AIRBNB_KIT: PrepKit = {
  id: "kit-airbnb-02",
  status: "ready",
  statusBadge: "Ready to Practice",
  urgencyBadge: "Interview in 8 Days (Oct 29)",
  interviewInDays: 8,
  interviewDateStr: "Oct 29",
  levelBadge: "Staff",
  tags: ["Design Systems & Performance", "Next.js & React Core"],
  questionMixSummary: "14 Frontend • 10 Arch • 8 Behavioral • 4 Culture",
  masteredCount: 31,
  totalCards: 36,
  masteryPercentage: 86,
  currentCadenceDay: 2,
  totalCadenceDays: 10,
  cadenceNote: "System design deep-dive scheduled",
  lastPracticedNote: "Last practiced yesterday • 12 flashcards left for daily goal",
  source: {
    company: "Airbnb",
    company_url: "https://airbnb.com",
    role: "Lead Frontend Architect",
    location: "San Francisco, CA / Remote",
    jd_chars: 2950,
    researched_at: "2026-09-07T14:20:00Z",
    pages_used: [
      "https://airbnb.com/careers",
      "https://medium.com/airbnb-engineering"
    ]
  },
  company_brief: {
    summary: "Airbnb operates an online marketplace for lodging, homestays, and vacation rentals with a strong focus on design craft, community, and performance.",
    what_they_do: "Connects millions of hosts and guests globally with world-class design systems, server-driven UI, and edge-rendered web experiences.",
    sources: [
      "https://airbnb.com/careers",
      "https://medium.com/airbnb-engineering"
    ]
  },
  role: {
    title: "Lead Frontend Architect",
    seniority: "Lead / Principal",
    responsibilities: [
      "Govern core web performance metrics (LCP, INP, CLS) across all search & booking funnels",
      "Scale Airbnb's design token ecosystem and component accessibility standards",
      "Lead modernization efforts across React Server Components and microfrontends"
    ],
    requirements: [
      { id: "r1", text: "Expertise in Next.js App Router, React Server Components, and SSR architectures", kind: "technical", priority: "must" },
      { id: "r2", text: "Web performance optimization, streaming hydration, and Core Web Vitals", kind: "technical", priority: "must" },
      { id: "r3", text: "Building design systems at scale with headless primitives and WCAG AAA compliance", kind: "technical", priority: "must" },
      { id: "r4", text: "Experience leading technical alignment across 50+ frontend engineers", kind: "behavioural", priority: "must" }
    ]
  },
  questions: [
    {
      id: "q_ab_1",
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "How would you architect React Server Components (RSC) to minimize client-side bundle size while preserving rich client-side interactivity?",
      answer_outline: "Explain the server-client component boundary, serializable props, component composition, streaming suspense boundaries, and server actions.",
      difficulty: 3
    },
    {
      id: "q_ab_2",
      requirement_ids: ["r2"],
      category: "system-design",
      prompt: "Design a Server-Driven UI (SDUI) framework for Airbnb's search listing cards that supports dynamic AB tests and zero app deploys.",
      answer_outline: "Discuss schema contracts, polymorphic layout renderers, client-side fallback registries, and performance caching at the edge.",
      difficulty: 3
    },
    {
      id: "q_ab_3",
      requirement_ids: ["r3"],
      category: "technical",
      prompt: "How do you optimize Interaction to Next Paint (INP) on a heavy interactive search map with 500+ markers and price sliders?",
      answer_outline: "Break down long tasks via requestIdleCallback/scheduler.yield, use CSS transforms for hover states, debounce spatial queries, and virtualize SVG markers.",
      difficulty: 2
    },
    {
      id: "q_ab_4",
      requirement_ids: ["r4"],
      category: "behavioural",
      prompt: "Tell me about a time you deprecated a widely used internal UI library across multiple engineering pods without breaking production.",
      answer_outline: "Use STAR: codemods, feature flag deprecation warnings, phased migration guide, paired office hours, and monitoring telemetry.",
      difficulty: 2
    }
  ],
  flashcards: [
    {
      id: "f_ab_1",
      front: "What is the primary difference between SSR and React Server Components (RSC)?",
      back: "SSR renders HTML on the server and still requires shipping JS to hydrate on the client. RSC executes exclusively on the server, never ships JS code to client bundles, and streams as JSON-like wire format.",
      requirement_ids: ["r1"]
    },
    {
      id: "f_ab_2",
      front: "What causes poor INP (Interaction to Next Paint) and how is it measured?",
      back: "INP measures latency from user input until visual frame presentation. Long JS tasks blocking the main thread during event handler execution or layout reflows cause high INP (>200ms).",
      requirement_ids: ["r2"]
    },
    {
      id: "f_ab_3",
      front: "What is Server-Driven UI (SDUI)?",
      back: "An architecture where the backend delivers both the layout structure and component definitions as JSON, allowing dynamic UI layout changes without native app or bundle redeploys.",
      requirement_ids: ["r2"]
    }
  ],
  schedule: {
    days_available: 10,
    days: [
      { day: 1, focus: "RSC Boundaries & Streaming Architecture", question_ids: ["q_ab_1"], minutes: 60 },
      { day: 2, focus: "Server-Driven UI & Edge Composition", question_ids: ["q_ab_2"], minutes: 75 },
      { day: 3, focus: "Core Web Vitals & INP Optimization", question_ids: ["q_ab_3"], minutes: 60 },
      { day: 4, focus: "Cross-Functional Deprecation & Leadership", question_ids: ["q_ab_4"], minutes: 45 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 2
  }
};

export const SAMPLE_DATADOG_KIT: PrepKit = {
  id: "kit-datadog-03",
  status: "generating",
  statusBadge: "Generating Pipeline (Step 5 of 6)",
  urgencyBadge: "Interview in 14 Days (Nov 4)",
  interviewInDays: 14,
  interviewDateStr: "Nov 4",
  levelBadge: "Principal",
  tags: ["Crawling docs.datadoghq.com", "Telemetry & Log Processing"],
  pipelineProgress: 75,
  pipelineStep: "Step 5 of 6",
  pipelineDetail: "Synthesizing category question banks...",
  lastPracticedNote: "Est. completion in ~45 seconds • AI model: Claude 3.5 Sonnet",
  source: {
    company: "Datadog",
    company_url: "https://docs.datadoghq.com",
    role: "Principal Distributed Systems Engineer",
    location: "New York, NY / Remote",
    jd_chars: 3400,
    researched_at: "2026-09-10T09:15:00Z",
    pages_used: [
      "https://docs.datadoghq.com",
      "https://www.datadoghq.com/careers"
    ]
  },
  company_brief: {
    summary: "Datadog is the essential monitoring and security platform for cloud applications, providing unified observability across infrastructure, APM, and logs.",
    what_they_do: "Ingests tens of trillions of metric points and logs per day using ultra-efficient distributed pipelines written in Go, C++, and Rust.",
    sources: ["https://www.datadoghq.com/about"]
  },
  role: {
    title: "Principal Distributed Systems Engineer",
    seniority: "Principal",
    responsibilities: [
      "Scale time-series ingestion engines to 50M+ metrics per second per cluster",
      "Design tiered hot/warm/cold storage engines with cost-optimized compression algorithms"
    ],
    requirements: [
      { id: "r1", text: "Time-series database internals (Gorilla compression, LSM-trees)", kind: "technical", priority: "must" },
      { id: "r2", text: "High-throughput stream processing with Kafka and RocksDB", kind: "technical", priority: "must" }
    ]
  },
  questions: [
    {
      id: "q_dd_1",
      requirement_ids: ["r1"],
      category: "system-design",
      prompt: "Design a distributed metrics ingestion pipeline handling 50 million metrics/second with p99 ingest delay under 2 seconds.",
      answer_outline: "Discuss UDP/gRPC agent aggregation, Gorilla delta-of-delta timestamp compression, XOR float compression, Kafka partitioning by metric hash, and in-memory ring buffers.",
      difficulty: 3
    }
  ],
  flashcards: [
    {
      id: "f_dd_1",
      front: "How does Facebook's Gorilla compression achieve 10x memory reduction for floating-point time-series?",
      back: "It uses delta-of-delta variable bit encoding for timestamps and XORs consecutive IEEE 754 float values, storing leading and trailing zero counts to only encode significant variable bits.",
      requirement_ids: ["r1"]
    }
  ],
  schedule: {
    days_available: 5,
    days: [
      { day: 1, focus: "Time-Series Ingestion & Gorilla Compression", question_ids: ["q_dd_1"], minutes: 90 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 1
  }
};

export const SAMPLE_LINEAR_KIT: PrepKit = {
  id: "kit-linear-04",
  status: "review",
  statusBadge: "Site Unreachable (Partial)",
  urgencyBadge: "Interview in 18 Days (Nov 8)",
  interviewInDays: 18,
  interviewDateStr: "Nov 8",
  levelBadge: "Senior",
  tags: ["Full-Stack Web", "Local-First Sync Architecture"],
  fallbackNotice: "linear.app/careers returned a 403 bot-check challenge during automated crawling. Pipeline completed using provided job description text only. You can supplement engineering notes to sharpen the kit.",
  lastPracticedNote: "24 base questions generated • 0 supplementary docs",
  source: {
    company: "Linear",
    company_url: "https://linear.app",
    role: "Senior Product Engineer",
    location: "San Francisco, CA / Remote",
    jd_chars: 2100,
    researched_at: "2026-09-06T18:00:00Z",
    pages_used: ["linear.app (text fallback)"]
  },
  company_brief: {
    summary: "Linear is a purpose-built tool for modern software development, known for high speed, keyboard-first workflows, and offline sync.",
    what_they_do: "Builds a synchronized project tracker using local-first architecture and CRDT-based client-server sync.",
    sources: ["User Provided JD"]
  },
  role: {
    title: "Senior Product Engineer",
    seniority: "Senior",
    responsibilities: [
      "Craft high-performance desktop and web UI with sub-50ms interaction latency",
      "Maintain offline sync engine and transactional local SQLite database"
    ],
    requirements: [
      { id: "r1", text: "Local-first sync engine and conflict resolution (CRDTs / Operational Transformation)", kind: "technical", priority: "must" },
      { id: "r2", text: "React, WebAssembly, and Canvas/WebGL rendering optimization", kind: "technical", priority: "must" }
    ]
  },
  questions: [
    {
      id: "q_lin_1",
      requirement_ids: ["r1"],
      category: "system-design",
      prompt: "How does a local-first sync architecture guarantee eventual consistency between disconnected clients?",
      answer_outline: "Explain State-based vs Operation-based CRDTs, Lamport timestamps, causal graphs, Tombstone deletion, and client-side SQLite replication.",
      difficulty: 3
    }
  ],
  flashcards: [
    {
      id: "f_lin_1",
      front: "What is the core promise of Local-First software?",
      back: "Data is stored locally on the user device first; all reads and writes happen instantaneously without waiting for a server roundtrip; synchronization happens opportunistically in the background.",
      requirement_ids: ["r1"]
    }
  ],
  schedule: {
    days_available: 5,
    days: [
      { day: 1, focus: "Local-First Principles & CRDT Synchronization", question_ids: ["q_lin_1"], minutes: 60 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 1
  }
};

export const SAMPLE_OPENAI_KIT: PrepKit = {
  id: "kit-openai-05",
  status: "ready",
  statusBadge: "Ready to Practice",
  urgencyBadge: "Interview in 24 Days (Nov 14)",
  interviewInDays: 24,
  interviewDateStr: "Nov 14",
  levelBadge: "Research / Systems",
  tags: ["CUDA & GPU Kernel Optimization", "vLLM / Triton / PagedAttention"],
  questionMixSummary: "22 GPU Kernels • 14 LLM Serving • 8 Research • 4 Fit",
  masteredCount: 15,
  totalCards: 48,
  masteryPercentage: 31,
  currentCadenceDay: 1,
  totalCadenceDays: 14,
  cadenceNote: "Kickoff syllabus initialized",
  lastPracticedNote: "Created 2 days ago • High difficulty benchmark",
  source: {
    company: "OpenAI",
    company_url: "https://openai.com",
    role: "Research Engineer (Inference Optimization)",
    location: "San Francisco, CA",
    jd_chars: 3800,
    researched_at: "2026-09-09T16:45:00Z",
    pages_used: [
      "https://openai.com/research",
      "https://openai.com/careers"
    ]
  },
  company_brief: {
    summary: "OpenAI is an AI research and deployment company whose mission is to ensure that artificial general intelligence benefits all of humanity.",
    what_they_do: "Develops frontier AI models including GPT-4, o1, and Sora, running massive inference clusters across tens of thousands of GPUs.",
    sources: ["https://openai.com/about"]
  },
  role: {
    title: "Research Engineer (Inference Optimization)",
    seniority: "Research Engineer",
    responsibilities: [
      "Write custom Triton and CUDA kernels to accelerate transformer attention mechanisms",
      "Optimize KV cache memory management, continuous batching, and speculative decoding"
    ],
    requirements: [
      { id: "r1", text: "Deep knowledge of GPU architectures (SRAM, HBM, Tensor Cores, warp scheduling)", kind: "technical", priority: "must" },
      { id: "r2", text: "Experience with PagedAttention, vLLM, TensorRT-LLM, and speculative decoding", kind: "technical", priority: "must" },
      { id: "r3", text: "CUDA C++ and OpenAI Triton programming", kind: "technical", priority: "must" }
    ]
  },
  questions: [
    {
      id: "q_oai_1",
      requirement_ids: ["r1", "r2"],
      category: "technical",
      prompt: "Explain PagedAttention and how it mitigates internal/external memory fragmentation in transformer KV caches during high-concurrency LLM serving.",
      answer_outline: "Compare traditional contiguous KV buffer allocation with virtual memory paging. Explain physical page tables, sharing KV pages across parallel beams, and copy-on-write mechanisms.",
      difficulty: 3
    },
    {
      id: "q_oai_2",
      requirement_ids: ["r1", "r3"],
      category: "system-design",
      prompt: "How would you design a Speculative Decoding pipeline with a draft model to improve token generation throughput without sacrificing output accuracy?",
      answer_outline: "Detail small draft model speculation (K tokens), parallel verification through target model in a single forward pass, modified rejection sampling criteria, and KV cache rollback.",
      difficulty: 3
    }
  ],
  flashcards: [
    {
      id: "f_oai_1",
      front: "Why is memory bandwidth (not FLOPs) typically the bottleneck in autoregressive LLM decoding?",
      back: "In autoregressive decoding, each token generation step requires loading all previous KV cache weights and model weights from HBM (High Bandwidth Memory) to SRAM for just one token, resulting in low arithmetic intensity.",
      requirement_ids: ["r1"]
    },
    {
      id: "f_oai_2",
      front: "What is FlashAttention and how does it avoid HBM read/write bottlenecks?",
      back: "It tiles the Q, K, V matrices and computes softmax incrementally using online softmax normalization, keeping intermediate attention matrices in fast on-chip SRAM without ever writing them out to slower HBM.",
      requirement_ids: ["r1", "r3"]
    }
  ],
  schedule: {
    days_available: 14,
    days: [
      { day: 1, focus: "GPU Memory Hierarchy & Arithmetic Intensity", question_ids: ["q_oai_1"], minutes: 90 },
      { day: 2, focus: "PagedAttention & KV Cache Memory Management", question_ids: ["q_oai_1"], minutes: 90 },
      { day: 3, focus: "FlashAttention & Online Softmax Math", question_ids: ["q_oai_1"], minutes: 90 },
      { day: 4, focus: "Speculative Decoding & Verification Kernels", question_ids: ["q_oai_2"], minutes: 80 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 2
  }
};

export const SAMPLE_KITS: PrepKit[] = [
  SAMPLE_STRIPE_KIT,
  SAMPLE_AIRBNB_KIT,
  SAMPLE_DATADOG_KIT,
  SAMPLE_LINEAR_KIT,
  SAMPLE_OPENAI_KIT
];

// Re-export SAMPLE_PREP_KIT as the first kit for full backward compatibility
export const SAMPLE_PREP_KIT: PrepKit = SAMPLE_STRIPE_KIT;

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: "Senior Staff Infrastructure Engineer at Stripe",
    company: "Stripe",
    url: "https://stripe.com",
    days: 7,
    jd: `We are looking for a Senior Staff Infrastructure Engineer to join our Payments Platform.
Requirements:
- 7+ years of experience with distributed systems, high availability, and Raft consensus.
- Deep expertise in idempotent payment workflows, transaction isolation, and high-throughput messaging.
- Track record of leading architecture across multi-region infrastructure.`
  },
  {
    title: "Lead Frontend Architect at Airbnb",
    company: "Airbnb",
    url: "https://airbnb.com",
    days: 10,
    jd: `Airbnb is hiring a Lead Frontend Architect to oversee our web performance and design systems.
Requirements:
- Expertise in React Server Components, Next.js App Router, and Server-Driven UI.
- Proven experience driving Core Web Vitals (LCP, INP) across high-traffic consumer web products.
- Deep commitment to accessibility and component API design.`
  },
  {
    title: "Principal Distributed Systems Engineer at Datadog",
    company: "Datadog",
    url: "https://datadoghq.com",
    days: 14,
    jd: `Datadog seeks a Principal Engineer for our core telemetry and metric ingestion engines.
Requirements:
- Experience processing millions of time-series data points per second.
- Low-level systems programming (Go/C++/Rust) and LSM-tree storage engines.`
  }
];
