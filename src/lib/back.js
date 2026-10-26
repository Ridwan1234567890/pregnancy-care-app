// A small "back" history for screens that switch with state instead of URLs.
// Every tracked change remembers the previous value; the Back button restores the most recent one.
import { useState, useRef, useSyncExternalStore } from 'react';

const stack = [];
const subs = new Set();
const emit = () => subs.forEach(f => f());
export const pushBack = fn => { stack.push(fn); emit(); };
export const clearBack = () => { if (stack.length) { stack.length = 0; emit(); } };
export const goBack = () => { const fn = stack.pop(); emit(); if (fn) { fn(); window.scrollTo(0, 0); } };
export const useCanGoBack = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => stack.length > 0);

const same = (a, b) => a === b || (a && b && typeof a === 'object' && typeof b === 'object' && Object.keys({ ...a, ...b }).every(k => a[k] === b[k]));

// Like useState, but each change can be undone with the Back button.
export function useTracked(initial) {
  const [v, setV] = useState(initial);
  const ref = useRef(v);
  const set = next => {
    const cur = ref.current;
    const nv = typeof next === 'function' ? next(cur) : next;
    if (same(cur, nv)) return;
    pushBack(() => { ref.current = cur; setV(cur); });
    ref.current = nv; setV(nv);
  };
  return [v, set];
}
