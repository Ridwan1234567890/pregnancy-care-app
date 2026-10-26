/**
 * FILE GUIDE: Reusable UI components such as cards, buttons, badges, tabs, and form fields.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// Card: reusable function/value declared for use in this module.
export const Card = ({ className = '', children }) => <div className={`glass rounded-3xl ${className}`}>{children}</div>;

// Btn: reusable function/value declared for use in this module.
export const Btn = ({ kind = 'primary', className = '', ...p }) => {
  const k = { primary: 'btn-grad text-brandink hover:opacity-90', ghost: 'border border-line text-ink hover:bg-soft', danger: 'border border-line text-accent hover:bg-soft' }[kind];
  return <button {...p} className={`rounded-full px-5 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${k} ${className}`} />;
};

// Pill: reusable function/value declared for use in this module.
export const Pill = ({ tone = 'soft', children }) => {
  const t = { soft: 'bg-soft text-brand', warn: 'bg-warnbg text-warn', ok: 'bg-okbg text-ok', accent: 'bg-soft text-accent' }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${t} ${tone === 'warn' ? 'pulse-soft' : ''}`}>{children}</span>;
};

// Field: reusable function/value declared for use in this module.
export const Field = ({ label, id, children }) => (
  <div><label htmlFor={id} className="block text-sm font-medium mb-1.5">{label}</label>{children}</div>
);

// inputCls: named value used by the code below.
export const inputCls = 'w-full rounded-xl border border-line bg-bg px-3.5 py-2.5 text-sm';

// Tabs: reusable function/value declared for use in this module.
export const Tabs = ({ tabs, value, onChange }) => (
  <div className="flex gap-1 overflow-x-auto border-b border-line mb-6" role="tablist">
    {tabs.map(([k, label]) => (
      <button key={k} role="tab" aria-selected={value === k} onClick={() => onChange(k)}
        className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px ${value === k ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{label}</button>
    ))}
  </div>
);

// payPill: shows Paid when the visit fee was paid online.
export const payPill = a => (a.payment ? <Pill tone="ok">Paid online</Pill> : null);

// statusPill: reusable function/value declared for use in this module.
export const statusPill = s => ({
  requested: <Pill tone="warn">Awaiting doctor</Pill>, confirmed: <Pill tone="ok">Confirmed</Pill>,
  completed: <Pill>Completed</Pill>, cancelled: <Pill tone="accent">Cancelled</Pill>,
  declined: <Pill tone="accent">Declined</Pill>, no_show: <Pill tone="accent">No-show</Pill>
}[s]);
