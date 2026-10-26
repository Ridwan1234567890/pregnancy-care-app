/**
 * FILE GUIDE: Form for recording visit details and follow-up notes.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Btn, Field, inputCls } from '../../components/ui';
import { ymd, addDays, today0 } from '../../lib/format';

// Function/component: the code below runs when this function is called.
export function NoteForm({ onSave, onCancel }) {
  const [n, setN] = useState({ bp: '', weight: '', fundal: '', findings: '', summary: '', next: ymd(addDays(today0(), 28)) });
  const set = k => e => setN({ ...n, [k]: e.target.value });
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(n); }} className="mt-3 grid gap-3 rounded-xl border border-line p-4">
      <div className="grid grid-cols-3 gap-3">
        <Field label="BP" id="bp"><input id="bp" value={n.bp} onChange={set('bp')} placeholder="120/80" className={inputCls} required /></Field>
        <Field label="Weight (kg)" id="wt"><input id="wt" value={n.weight} onChange={set('weight')} className={inputCls} required /></Field>
        <Field label="Fundal height (cm)" id="fh"><input id="fh" value={n.fundal} onChange={set('fundal')} className={inputCls} /></Field>
      </div>
      <Field label="Clinical findings (only you see this)" id="fd"><textarea id="fd" rows="2" value={n.findings} onChange={set('findings')} className={inputCls} required /></Field>
      <Field label="Summary for the patient, in plain language" id="sm"><textarea id="sm" rows="2" value={n.summary} onChange={set('summary')} className={inputCls} required /></Field>
      <Field label="Recommended next visit" id="nx"><input id="nx" type="date" value={n.next} onChange={set('next')} className={inputCls} /></Field>
      <div className="flex gap-2"><Btn type="submit">Save and complete</Btn><Btn kind="ghost" type="button" onClick={onCancel}>Cancel</Btn></div>
    </form>
  );
}

export default NoteForm;
