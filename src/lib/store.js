/**
 * FILE GUIDE: Shared application data and localStorage persistence.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useEffect, useRef } from 'react';
import { DOCTORS } from './doctors';

// emptyState: reusable function/value declared for use in this module.
export const emptyState = () => ({ accounts: {}, doctors: DOCTORS, users: {}, notices: [], links: [], appts: [], auditLog: [], session: null });

// KEY: named value used by the code below.
export const KEY = 'pregnant-care-fresh-v1';

// Function/component: the code below runs when this function is called.
export function useStore() {
  const [s, setS] = useState(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const o = { ...emptyState(), ...JSON.parse(raw) }; if (!o.doctors || !o.doctors.length) o.doctors = DOCTORS; return o; } } catch (e) {}
    return emptyState();
  });
  const latest = useRef(s); latest.current = s;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(latest.current)); } catch (e) {} };
  // Writes are batched (300 ms) so typing and clicking never wait on JSON.stringify + localStorage.
  useEffect(() => { const t = setTimeout(save, 300); return () => clearTimeout(t); }, [s]);
  useEffect(() => {
    const onStorage = e => { if (e.key === KEY && e.newValue) { try { setS({ ...emptyState(), ...JSON.parse(e.newValue) }); } catch (err) {} } };
    const flush = () => save();
    window.addEventListener('storage', onStorage);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', flush);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', flush); };
  }, []);
  return [s, setS];
}

// Adds a notice for the admin. Used inside setS(p => ...).
// addNotice: reusable function/value declared for use in this module.
export const addNotice = (st, n) => ({ ...st, notices: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), at: Date.now(), read: false, ...n }, ...(st.notices || [])] });
