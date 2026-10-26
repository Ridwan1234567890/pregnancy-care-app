/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', surface: 'var(--surface)', ink: 'var(--ink)', muted: 'var(--muted)',
        line: 'var(--line)', brand: 'var(--brand)', brandink: 'var(--brandink)', accent: 'var(--accent)',
        soft: 'var(--soft)', warn: 'var(--warn)', warnbg: 'var(--warnbg)', ok: 'var(--ok)', okbg: 'var(--okbg)'
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
