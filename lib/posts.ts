/**
 * lib/posts.ts
 *
 * Data access layer for blog posts.
 *
 * Phase 3: MDX content lives in content/posts/*.mdx.
 *          Posts metadata comes from the mock list below — slugs are matched to MDX files
 *          which are dynamically imported in app/blog/[slug]/page.tsx.
 *          Velite will generate .velite/ at build time and replace this layer in Phase 3b.
 *
 * NOTE: Turbopack (next dev) statically analyzes all require() calls, so dynamic
 *       require('../.velite') cannot be wrapped in try/catch. We use a static mock
 *       data list that matches the MDX files in content/posts/.
 */

export type PostType = 'Engineering' | 'Career' | 'Case Study' | 'Opinion' | 'Random'

export interface Post {
  title: string
  date: string           // ISO: "2025-04-20"
  summary: string
  tldr?: string
  tags: string[]
  type: PostType
  readingTime: number
  slug: string
  body: string           // MDX content rendered via dynamic import in page.tsx
  featured?: boolean
  embeddings?: number[]  // Phase 4
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Convert ISO date to dot notation: "2025-04-20" → "2025.04.20" */
export function formatDate(iso: string): string {
  return iso.replace(/-/g, '.')
}

// ─── Static Post Registry (matched to MDX files in content/posts/) ──────────

const MOCK_POSTS: Post[] = [
  {
    title: 'Cutting Agent Latency by 85% with the Multi-Agent Supervisor Pattern',
    date: '2026-04-18',
    summary:
      'How I re-architected a monolithic LangGraph agent into a supervisor-worker pattern on GCP Cloud Run and cut end-to-end latency from 12s to 1.8s.',
    tldr:
      'I split a monolithic LangGraph agent into specialized workers controlled by a lightweight supervisor, deploying each on Cloud Run with sub-100ms cold starts. This cut latency from 12s to 1.8s through intelligent task routing and parallel execution.',
    tags: ['LangGraph', 'GCP', 'Agents', 'Performance'],
    type: 'Engineering',
    readingTime: 8,
    slug: 'building-multi-agent-supervisor',
    body: '',
  },
  {
    title: 'LangGraph Observability Stack: Tracing Production AI Agents',
    date: '2026-04-26',
    summary:
      'Building a full observability stack for LangGraph agents in production — tracing every node execution, tracking token budgets, and surfacing anomalies in real time.',
    tldr:
      'I instrumented our LangGraph agents with OpenTelemetry spans at the node level and built a Grafana dashboard that surfaces token budget violations, slow nodes, and routing anomalies within seconds of occurrence.',
    tags: ['LangGraph', 'Observability', 'OpenTelemetry', 'GCP'],
    type: 'Engineering',
    readingTime: 11,
    slug: 'langgraph-observability-stack',
    body: '',
  },
  {
    title: 'GCP Cloud Run Patterns for AI Workloads',
    date: '2026-05-03',
    summary:
      'A practical guide to deploying AI inference workloads on GCP Cloud Run — covering cold start optimization, GPU instances, request concurrency, and cost modeling.',
    tldr:
      'Cloud Run is underrated for AI workloads. With min-instances, GPU preview, and concurrency tuning, you can achieve sub-200ms cold starts and near-serverless economics for LLM inference.',
    tags: ['GCP', 'Cloud Run', 'Infrastructure', 'AI'],
    type: 'Engineering',
    readingTime: 9,
    slug: 'gcp-cloud-run-patterns',
    body: '',
  },
  {
    title: 'Why I Stopped Using Notebooks for Production ML',
    date: '2026-05-16',
    summary:
      'Notebooks are great for exploration but catastrophic for production. Here is the migration path I use to move from experimental Jupyter notebooks to a FastAPI service that actually works at scale.',
    tldr:
      'Jupyter notebooks accumulate hidden state, non-linear execution, and zero dependency discipline — all compounding liabilities the moment you serve a model in production. I now use a strict notebook → script → service pipeline with explicit gate criteria at each phase.',
    tags: ['Python', 'FastAPI', 'MLOps', 'Engineering'],
    type: 'Opinion',
    readingTime: 6,
    slug: 'stop-using-notebooks-for-production-ml',
    body: '',
  },
  {
    title: 'Building a RAG Pipeline That Actually Works in Production',
    date: '2026-05-16',
    summary:
      'Most RAG tutorials stop at the happy path. This is about the failure modes — chunking strategies, embedding drift, retrieval quality degradation — and how to handle them systematically.',
    tldr:
      'I built a RAG pipeline over a customer support knowledge base using Gemini Embeddings and Vertex AI Vector Search. The system failed twice before it worked: catastrophic chunking that destroyed answer context, and retrieval recall collapse where top-k always returned the same stale docs. Structure-aware chunking and Maximum Marginal Relevance retrieval fixed both.',
    tags: ['RAG', 'LangGraph', 'Production', 'AI'],
    type: 'Case Study',
    readingTime: 14,
    slug: 'rag-pipeline-production',
    body: '',
  },
  {
    title: 'From Intern to AI Engineer: What I Actually Learned',
    date: '2026-05-24',
    summary:
      'A year of building production AI systems taught me more about software engineering than about AI. Here is what I would tell myself at the start.',
    tldr:
      'The skills that made me effective as an AI engineer were not the ML theory I expected — they were debugging discipline, clear technical writing, knowing when not to use AI, and understanding that systems thinking matters more than model knowledge.',
    tags: ['Career', 'AI', 'Engineering'],
    type: 'Career',
    readingTime: 7,
    slug: 'intern-to-ai-engineer',
    body: '',
  },
  {
    title: 'LangSmith vs Langfuse: Choosing the Right Observability Stack for Your AI Pipeline',
    date: '2026-05-30',
    summary:
      'A practical comparison of LangSmith and Langfuse for production LLM observability — covering tracing depth, self-hosting, cost structure, and the exact scenarios where each one wins.',
    tldr:
      'LangSmith wins on zero-config LangGraph integration and dataset-driven evals. Langfuse wins on self-hosting economics, vendor neutrality, and cost at scale. Neither is universally better — the right answer depends entirely on your stack and your data residency constraints.',
    tags: ['Observability', 'LangSmith', 'Langfuse', 'LLMOps'],
    type: 'Engineering',
    readingTime: 10,
    slug: 'langsmith-vs-langfuse',
    body: '',
  },
  {
    title: 'MCP and A2A: The Two Protocols Quietly Reshaping How AI Agents Work Together',
    date: '2026-05-30',
    summary:
      'MCP and A2A solve different problems in the agentic stack — one connects agents to tools, the other connects agents to agents. Understanding the boundary between them is what makes production multi-agent systems actually composable.',
    tldr:
      'Model Context Protocol (MCP) standardizes how an agent connects to external tools and data sources. Agent2Agent (A2A) standardizes how agents delegate tasks to each other across organizational boundaries. They operate at different layers and are most powerful when used together.',
    tags: ['Agents', 'MCP', 'A2A', 'Architecture'],
    type: 'Engineering',
    readingTime: 12,
    slug: 'mcp-and-a2a-protocols',
    body: '',
  },
  {
    title: 'SDLC is Broken. Here\'s What\'s Replacing It.',
    date: '2026-06-06',
    summary:
      'Traditional SDLC was designed for humans writing code line by line. AI changes the unit of work from lines to features — and the whole process breaks. Here is what AI-native development methodologies like Spec-Driven Development, AI-SDLC, and BMaD are doing instead.',
    tldr:
      'Traditional SDLC assumes humans are the bottleneck. Vibe coding assumes prompts are enough. Both fail in the AI era. The methodologies that actually work — Spec-Driven Development, AI-SDLC, and BMaD — treat the specification as the primary artifact, not the code.',
    tags: ['AI Engineering', 'Engineering', 'BMaD', 'SDLC'],
    type: 'Opinion',
    readingTime: 11,
    slug: 'ai-sdlc-spec-driven-bmad',
    featured: true,
    body: '',
  },
]

// ─── Query functions ──────────────────────────────────────────────────────────

export function getAllPosts(): Post[] {
  return [...MOCK_POSTS].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getFeaturedPost(): Post | undefined {
  return MOCK_POSTS.find((p) => p.featured)
}

export function getRecentPosts(n: number = 5): Post[] {
  return getAllPosts().slice(0, n)
}

export function getPostBySlug(slug: string): Post | undefined {
  return MOCK_POSTS.find((p) => p.slug === slug)
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  MOCK_POSTS.forEach((p) => p.tags.forEach((t) => tags.add(t)))
  return Array.from(tags).sort()
}

export function getAllTypes(): PostType[] {
  const types = new Set<PostType>()
  MOCK_POSTS.forEach((p) => types.add(p.type))
  return Array.from(types).sort()
}

export function getAdjacentPosts(slug: string): {
  prev: Post | undefined
  next: Post | undefined
} {
  const all = getAllPosts()
  const index = all.findIndex((p) => p.slug === slug)
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
  }
}
