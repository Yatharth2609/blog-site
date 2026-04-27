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
      summary: s.string(),
      tldr: s.string().optional(),
      tags: s.array(s.string()),
      type: s.enum(['Engineering', 'Career', 'Case Study', 'Opinion', 'Random']),
      readingTime: s.number().optional(),
      featured: s.boolean().optional(),
      // Auto-populated fields from Velite
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
