/**
 * FILE GUIDE: Light/dark theme toggle and persistence of the selected theme.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useEffect, memo } from 'react';

// ThemeToggle: reusable function/value declared for use in this module.
export const ThemeToggle = memo(function ThemeToggle() {
  const systemTheme = () => (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const [theme, setTheme] = useState(() => {
    try { const t = localStorage.getItem('pc-theme'); if (t === 'light' || t === 'dark') return t; } catch (e) {}
    return systemTheme();
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('pc-theme', theme); } catch (e) {}
  }, [theme]);
  const dark = theme === 'dark';
  return (
    <button onClick={() => setTheme(dark ? 'light' : 'dark')} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-10 h-10 shrink-0 rounded-full border border-line grid place-items-center text-ink hover:bg-soft">
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
});

export default ThemeToggle;
