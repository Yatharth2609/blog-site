import { defineConfig, defineCollection, s } from 'velite'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

const posts = defineCollection({
  name: 'Post',
  pattern: 'posts/**/*.mdx',
  schema: s
    .object({
      title: s.string(),
      date: s.isodate(),
      // TASK 6: `summary` kept as primary (used throughout codebase).
      // `description` is an alias accepted in frontmatter for SEO tooling compatibility.
      summary: s.string(),
      // TASK 6: Optional description override — falls back to summary if absent.
      description: s.string().optional(),
      tldr: s.string().optional(),
      tags: s.array(s.string()),
      type: s.enum(['Engineering', 'Career', 'Case Study', 'Opinion', 'Random']),
      // TASK 6: ISO 8601 date of last edit — used in og:modified_time and JSON-LD
      lastModified: s.isodate().optional(),
      // TASK 6: Explicit category field (mirrors `type` for external SEO tooling)
      category: s.string().optional(),
      readingTime: s.number().optional(),
      featured: s.boolean().optional(),
      // TASK 6: Explicit slug override (e.g. "building-multi-agent-supervisor")
      // If absent, Velite auto-derives slug from the file path (posts/my-post → my-post)
      slug: s.path(),
      body: s.mdx(),
      raw: s.raw(),
      // Embeddings stored separately (generated in Phase 4)
      embeddings: s.array(s.number()).optional(),
    })
    .transform(({ raw, ...data }) => ({
      ...data,
      // Strip the 'posts/' prefix from slug so URLs are /blog/my-post
      slug: data.slug.replace(/^posts\//, ''),
      // Auto-calculate reading time if not provided in frontmatter
      readingTime: data.readingTime ?? Math.max(1, Math.round(raw.split(/\s+/).length / 200)),
      // Resolve effective description: explicit `description` wins, else `summary`
      description: data.description ?? data.summary,
    })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { posts },
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap' }],
    ],
    remarkPlugins: [remarkGfm],
  },
})
