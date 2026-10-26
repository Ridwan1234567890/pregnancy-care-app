/**
 * FILE GUIDE: Date, time, and currency formatting helpers.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// pad: reusable function/value declared for use in this module.
export const pad = n => String(n).padStart(2, '0');

// ymd: reusable function/value declared for use in this module.
export const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// parse: reusable function/value declared for use in this module.
export const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

// addDays: reusable function/value declared for use in this module.
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// today0: reusable function/value declared for use in this module.
export const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

// fmtDate: reusable function/value declared for use in this module.
export const fmtDate = s => parse(s).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

// fmtTime: reusable function/value declared for use in this module.
export const fmtTime = t => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`; };

// naira: reusable function/value declared for use in this module.
export const naira = n => '₦' + n.toLocaleString('en-NG');

// apptStart: reusable function/value declared for use in this module.
export const apptStart = a => { const [h, m] = a.time.split(':').map(Number); const d = parse(a.date); d.setHours(h, m); return d; };
