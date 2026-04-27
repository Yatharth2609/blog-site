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
    date: '2025-04-20',
    summary:
      'How I re-architected a monolithic LangGraph agent into a supervisor-worker pattern on GCP Cloud Run and cut end-to-end latency from 12s to 1.8s.',
    tldr:
      'I split a monolithic LangGraph agent into specialized workers controlled by a lightweight supervisor, deploying each on Cloud Run with sub-100ms cold starts. This cut latency from 12s to 1.8s through intelligent task routing and parallel execution.',
    tags: ['LangGraph', 'GCP', 'Agents', 'Performance'],
    type: 'Engineering',
    readingTime: 8,
    slug: 'building-multi-agent-supervisor',
    featured: true,
    body: '',
  },
  {
    title: 'LangGraph Observability Stack: Tracing Production AI Agents',
    date: '2025-03-15',
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
    date: '2025-02-28',
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
    date: '2025-01-20',
    summary:
      'Notebooks are great for exploration but catastrophic for production. Here is the migration path I use to move from experimental Jupyter notebooks to a FastAPI service that actually works at scale.',
    tags: ['Python', 'FastAPI', 'MLOps', 'Engineering'],
    type: 'Opinion',
    readingTime: 6,
    slug: 'stop-using-notebooks-for-production-ml',
    body: '',
  },
  {
    title: 'Building a RAG Pipeline That Actually Works in Production',
    date: '2024-12-10',
    summary:
      'Most RAG tutorials stop at the happy path. This is about the failure modes — chunking strategies, embedding drift, retrieval quality degradation — and how to handle them systematically.',
    tags: ['RAG', 'LangChain', 'Production', 'AI'],
    type: 'Case Study',
    readingTime: 14,
    slug: 'rag-pipeline-production',
    body: '',
  },
  {
    title: 'From Intern to AI Engineer: What I Actually Learned',
    date: '2024-11-05',
    summary:
      'Two years of building production AI systems taught me more about software engineering than about AI. Here is what I would tell myself at the start.',
    tags: ['Career', 'AI', 'Engineering'],
    type: 'Career',
    readingTime: 7,
    slug: 'intern-to-ai-engineer',
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
