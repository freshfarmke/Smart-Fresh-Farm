import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /**
         * Semantic design tokens
         * Decoupled from branding - enables design system flexibility
         * Update these values to match your brand without touching component logic
         */
        primary: '#2563eb', // Blue - primary actions
        secondary: '#64748b', // Slate - secondary actions
        accent: '#0891b2', // Cyan - highlights
        muted: '#f1f5f9', // Light slate - backgrounds
        destructive: '#dc2626', // Red - dangerous actions
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
