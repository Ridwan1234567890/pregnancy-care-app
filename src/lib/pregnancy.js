/**
 * FILE GUIDE: Pregnancy week/day, due-date, trimester, progress, and milestone calculations.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { parse, addDays, today0 } from './format';

// Pregnancy week, due date and trimester from the first day of the last period (LMP).
// Function/component: the code below runs when this function is called.
export function pregnancy(lmp) {
  const days = Math.floor((today0() - parse(lmp)) / 864e5);
  const weeks = Math.max(0, Math.floor(days / 7));
  return {
    weeks, days: days % 7, due: addDays(parse(lmp), 280),
    pct: Math.min(100, Math.max(0, (days / 280) * 100)),
    trimester: weeks < 14 ? 'First' : weeks < 28 ? 'Second' : 'Third'
  };
}

// Rules-based reminders. These are scheduling nudges, not medical advice.
// MILESTONES: named value used by the code below.
export const MILESTONES = [
  { a: 11, b: 14, label: 'Dating scan window' },
  { a: 18, b: 22, label: 'Anomaly scan window' },
  { a: 24, b: 28, label: 'Glucose test window' },
  { a: 36, b: 36, label: 'Birth plan review' }
];
