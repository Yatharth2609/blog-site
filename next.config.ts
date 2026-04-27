import type { NextConfig } from 'next'
import createMDX from '@next/mdx'

const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // Strip YAML frontmatter — prevents it being rendered as text in the post body
      'remark-frontmatter',
      // GitHub Flavored Markdown: tables, strikethrough, task lists
      'remark-gfm',
    ],
    rehypePlugins: [
      'rehype-slug',
    ],
  },
})

const nextConfig: NextConfig = {
  // Allow .mdx files as pages/routes
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  webpack(config) {
    // Velite integration — runs the Velite build on every webpack compile
    // This is the standard pattern from Velite docs
    config.plugins.push(
      new (class VeliteWebpackPlugin {
        static started = false
        apply(compiler: {
          options?: { mode?: string }
          hooks: { beforeCompile: { tapPromise: (name: string, callback: () => Promise<void>) => void } }
        }) {
          compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
            if (VeliteWebpackPlugin.started) return
            VeliteWebpackPlugin.started = true
            const dev = compiler.options?.mode === 'development'
            const { build } = await import('velite')
            await build({ watch: dev, clean: !dev })
          })
        }
      })()
    )
    return config
  },

  // next/image: allow common external hosts used in blog posts
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
    ],
  },
}

export default withMDX(nextConfig)
