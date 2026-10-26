/**
 * FILE GUIDE: Visual pregnancy-week progress ring and milestone markers.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { memo } from 'react';

// Progress ring to scale: 40 weeks round the circle, milestone windows marked as dots.
// WeekRing: reusable function/value declared for use in this module.
export const WeekRing = memo(function WeekRing({ weeks, pct }) {
  const r = 78, c = 2 * Math.PI * r;
  const pos = w => { const a = (w / 40) * 2 * Math.PI - Math.PI / 2; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; };
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[210px]" role="img" aria-label={`Week ${weeks} of 40`}>
      <circle cx="100" cy="100" r={r} fill="none" stroke="var(--line)" strokeWidth="10" />
      <defs><linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--brand)" /><stop offset="1" stopColor="var(--accent)" /></linearGradient></defs>
      <circle className="ring-arc" cx="100" cy="100" r={r} fill="none" stroke="url(#ringgrad)" strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${(c * pct) / 100} ${c}`} transform="rotate(-90 100 100)" />
      {[12, 20, 26, 36].map(w => { const [x, y] = pos(w); return <circle className="ring-dot" key={w} cx={x} cy={y} r="4.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.5" />; })}
      <text x="100" y="94" textAnchor="middle" fontSize="13" fill="var(--muted)">Week</text>
      <text className="ring-num" x="100" y="130" textAnchor="middle" fontSize="42" fontWeight="800" fill="var(--ink)" style={{ fontFamily: 'Montserrat, sans-serif' }}>{weeks}</text>
      <text x="100" y="148" textAnchor="middle" fontSize="11" fill="var(--muted)">of 40</text>
    </svg>
  );
});

export default WeekRing;
