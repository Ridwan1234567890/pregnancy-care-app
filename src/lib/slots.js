/**
 * FILE GUIDE: Appointment-slot availability and next-slot calculations.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { pad, ymd, addDays, today0 } from './format';

// Function/component: the code below runs when this function is called.
export function slotsFor(doc, date, appts) {
  if (!doc.days.includes(date.getDay())) return [];
  const out = [];
  for (let m = doc.start * 60; m + doc.dur <= doc.end * 60; m += doc.dur) {
    const t = `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    const s = new Date(date); s.setHours(Math.floor(m / 60), m % 60);
    if (s.getTime() <= Date.now() + 36e5) continue; // needs at least 1 hour of lead time
    const taken = appts.some(a => a.doctorId === doc.id && a.date === ymd(date) && a.time === t && !['cancelled', 'declined'].includes(a.status));
    out.push({ t, taken });
  }
  return out;
}

// Function/component: the code below runs when this function is called.
export function nextSlot(doc, appts) {
  for (let i = 0; i < 21; i++) {
    const d = addDays(today0(), i);
    const free = slotsFor(doc, d, appts).find(x => !x.taken);
    if (free) return { date: ymd(d), t: free.t };
  }
  return null;
}
