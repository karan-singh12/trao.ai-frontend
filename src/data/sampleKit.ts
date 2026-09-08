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
  };
  company_brief: {
    summary: string;
    what_they_do: string;
    sources: string[];
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
}

export const SAMPLE_PREP_KIT: PrepKit = {
  source: {
    company: "Stripe",
    company_url: "https://stripe.com",
    role: "Senior Full-Stack Engineer",
    location: "Remote / San Francisco, CA",
    jd_chars: 2840,
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
    title: "Senior Full-Stack Engineer",
    seniority: "Senior",
    responsibilities: [
      "Architect robust API surfaces and UI workflows for high-volume financial transactions",
      "Design and scale resilient distributed systems handling thousands of TPS with five-nines availability",
      "Mentor mid-level and junior engineers and participate in architecture design reviews",
      "Collaborate directly with product managers, designers, and security engineers"
    ],
    requirements: [
      { id: "r1", text: "5+ years of production experience with TypeScript and React", kind: "technical", priority: "must" },
      { id: "r2", text: "Deep understanding of RESTful API design, idempotent workflows, and microservices", kind: "technical", priority: "must" },
      { id: "r3", text: "Distributed systems, database transaction isolation, and caching strategies", kind: "technical", priority: "must" },
      { id: "r4", text: "Experience leading cross-functional projects and mentoring junior engineers", kind: "behavioural", priority: "must" },
      { id: "r5", text: "Background in fintech, payments protocols, or PCI-DSS compliance", kind: "domain", priority: "nice" },
      { id: "r6", text: "Experience with Next.js App Router, Tailwind CSS, and edge runtimes", kind: "technical", priority: "nice" }
    ]
  },
  questions: [
    {
      id: "q1",
      requirement_ids: ["r1"],
      category: "technical",
      prompt: "How do you manage complex async state and optimistic UI updates in React while guaranteeing consistency with backend mutation failures?",
      answer_outline: "Explain cache invalidation, rollback states via React Query/SWR or custom reducers, idempotency keys, and reconciliation.",
      difficulty: 2
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
      requirement_ids: ["r5"],
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
      requirement_ids: ["r3"]
    },
    {
      id: "f3",
      front: "How do Server-Sent Events (SSE) differ from WebSockets for live interview/streaming updates?",
      back: "SSE is unidirectional (server-to-client) over standard HTTP/2 with built-in reconnection, whereas WebSockets are full-duplex, bidirectional, and require custom protocol framing.",
      requirement_ids: ["r1"]
    },
    {
      id: "f4",
      front: "What is the primary difference between pessimistic and optimistic concurrency control?",
      back: "Pessimistic locks the record preventing others from reading/writing; Optimistic checks a version/timestamp at commit time and rolls back if another transaction modified the entity.",
      requirement_ids: ["r3"]
    },
    {
      id: "f5",
      front: "How do you structure answers to behavioral questions for senior engineering roles?",
      back: "Use STAR: Situation (context/problem), Task (your specific goal), Action (decisions and influence you demonstrated), Result (quantifiable metric or learned outcome).",
      requirement_ids: ["r4"]
    }
  ],
  schedule: {
    days_available: 5,
    days: [
      { day: 1, focus: "Architecture Foundations & Idempotent API Design", question_ids: ["q2"], minutes: 75 },
      { day: 2, focus: "Distributed Systems & Webhook Delivery Pipelines", question_ids: ["q3"], minutes: 90 },
      { day: 3, focus: "React State Management & Async Consistency", question_ids: ["q1"], minutes: 60 },
      { day: 4, focus: "Engineering Leadership & Behavioral STAR Stories", question_ids: ["q4"], minutes: 45 },
      { day: 5, focus: "Company Operating Principles & Final Practice Mock", question_ids: ["q5"], minutes: 40 }
    ]
  },
  coverage: {
    uncovered_requirement_ids: [],
    passes: 2
  }
};

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: "Senior Full-Stack Engineer at Stripe",
    company: "Stripe",
    url: "https://stripe.com",
    days: 5,
    jd: `We are looking for a Senior Full-Stack Engineer to join our Payments Experience team.
Requirements:
- 5+ years of experience with TypeScript, React, and Node.js.
- Strong fundamentals in RESTful API design, idempotency, and distributed systems.
- Demonstrated experience mentoring engineers and driving cross-functional architectural reviews.
- Nice to have: Experience with payments, PCI-DSS compliance, or high-scale financial ledgers.`
  },
  {
    title: "AI Systems Engineer at Trao.ai",
    company: "Trao.ai",
    url: "https://trao.ai",
    days: 4,
    jd: `Trao.ai is building next-generation AI telemetry and inference intelligence.
Requirements:
- 3+ years building production applications with Next.js, Node.js, and MongoDB.
- Experience integrating LLM providers (Anthropic, OpenAI, Gemini) with fallback pipelines and rate-limit backoff.
- Solid understanding of web scraping, HTML sanitization, and automated document evaluation.
- Passion for developer tools and observability.`
  }
];
