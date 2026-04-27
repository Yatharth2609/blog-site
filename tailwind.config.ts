import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#00FF87',
        background: '#0A0A0A',
        surface: '#111111',
        'border-subtle': '#1F1F1F',
        'text-muted': '#222223ff',
        'text-primary': '#FAFAFA',
        'text-terminal': '#FAFAFA'
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'Courier New', 'monospace'],
      },
      animation: {
        blink: 'blink 1s step-end infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
