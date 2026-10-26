/**
 * FILE GUIDE: Shared admin helpers such as formatting, lookups, and audit-log operations.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */


// longDate: reusable function/value declared for use in this module.
export const longDate = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// Info: reusable function/value declared for use in this module.
export const Info = ({ k, v }) => <div className="min-w-0"><p className="text-xs text-muted">{k}</p><p className="font-semibold break-words">{v || '—'}</p></div>;

// Every mother who signed up and finished her profile.
// Function/component: the code below runs when this function is called.
export function allPatients(s) {
  return Object.entries(s.users || {}).filter(([, u]) => u.me && u.me.lmp).map(([email, u]) => ({ ...u.me, id: email, email }));
}

// docName: reusable function/value declared for use in this module.
export const docName = (s, id) => ((s.doctors || []).find(d => d.id === id) || { name: 'Unknown doctor' }).name;

// Every admin view of a patient is saved here, with the reason when clinical records are opened.
// logAccess: reusable function/value declared for use in this module.
export const logAccess = (setS, email, p, type, reason = '') => setS(st => ({ ...st, auditLog: [{ id: 'l' + Date.now() + Math.random().toString(36).slice(2, 6), at: Date.now(), admin: email, patientId: p.id, patientName: p.name, type, reason }, ...(st.auditLog || [])].slice(0, 500) }));
