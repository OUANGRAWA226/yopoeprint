import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'blue-deep':  '#0E2347',
        'blue-mid':   '#1A3A6B',
        'blue-light': '#2A5298',
        'blue-pale':  '#E8EEF8',
        'gold':       '#C9A84C',
        'gold-light': '#E2C46E',
        'gold-pale':  '#FDF6E3',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans:    ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(14,35,71,0.06)',
      },
    },
  },
  plugins: [],
}

export default config
