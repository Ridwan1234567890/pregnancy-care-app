/**
 * FILE GUIDE: Decorative ECG-style animation used in the authentication UI.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useEffect, memo } from 'react';

// One heartbeat (P wave, QRS spike, T wave), repeated across the width.
// ecgPath: reusable function/value declared for use in this module.
export const ecgPath = (beats, w = 400) => {
  const u = w / beats, k = u / 100;
  let d = '';
  for (let i = 0; i < beats; i++) {
    const x = i * u, p = v => +(x + v * k).toFixed(1);
    d += `${i ? 'L' : 'M'}${p(0)},60 H${p(18)} Q${p(25)},46 ${p(32)},60 H${p(40)} L${p(44)},66 L${p(50)},6 L${p(56)},84 L${p(60)},60 H${p(68)} Q${p(78)},40 ${p(88)},60 H${p(100)} `;
  }
  return d;
};

// Function/component: the code below runs when this function is called.
export function EcgRow({ beats, color, label, base }) {
  const [bpm, setBpm] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setBpm(base + Math.round(Math.random() * 4 - 2)), 1800);
    return () => clearInterval(t);
  }, []);
  const d = ecgPath(beats);
  return (
    <div className="flex items-center gap-3">
      <div className="w-[88px] shrink-0">
        <p className="text-xs" style={{ color: 'rgba(255,255,255,.7)' }}>{label}</p>
        <p className="flex items-center gap-1.5 font-display font-extrabold text-2xl tabular-nums" style={{ color }}>
          <svg className="beat-heart" style={{ '--bt': `${60 / base}s` }} width="16" height="16" viewBox="0 0 24 24" fill={color} aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          {bpm}
        </p>
      </div>
      <svg viewBox="0 0 400 100" className="flex-1 min-w-0 w-full" style={{ filter: `drop-shadow(0 0 4px ${color})` }} aria-hidden="true">
        <path d={d} pathLength="100" className="ecg-line ecg-ghost" stroke={color} />
        <path d={d} pathLength="100" className="ecg-line ecg-trace" stroke={color} />
        <path d={d} pathLength="100" className="ecg-line ecg-head" />
      </svg>
    </div>
  );
}

// EcgMonitor: reusable function/value declared for use in this module.
export const EcgMonitor = memo(function EcgMonitor() {
  return (
    <div className="monitor rounded-2xl p-4 mt-8 max-w-xl rise" style={{ '--d': '.35s' }} role="img" aria-label="Animated heart monitor showing a mother's and a baby's heartbeat">
      <div className="flex items-center justify-between mb-2 text-xs" style={{ color: 'rgba(255,255,255,.7)' }}>
        <span className="flex items-center gap-2"><span className="live-dot inline-block w-2 h-2 rounded-full" style={{ background: '#FF5A7A' }}></span>Live heartbeat</span>
        <span>bpm</span>
      </div>
      <div className="grid gap-1">
        <EcgRow beats={4} base={68} color="#7CF0B0" label="Mother" />
        <EcgRow beats={8} base={136} color="#FF8FB1" label="Baby" />
      </div>
    </div>
  );
});
