/**
 * FILE GUIDE: Patient-to-doctor linking flow.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Btn, Field, inputCls } from '../../components/ui';
import { addNotice } from '../../lib/store';

// Function/component: the code below runs when this function is called.
export function LinkDoctor({ s, setS, say, onDone }) {
  const [code, setCode] = useState('');
  const [q, setQ] = useState('');
  const who = (s.me && s.me.name) || 'A patient';
  const setMyLink = (link, text) => setS(p => addNotice({ ...p, links: [...p.links.filter(l => l.patientId !== s.me.id), link] }, { type: 'link', text }));

  const byCode = e => {
    e.preventDefault();
    const d = (s.doctors || []).find(x => x.code === code.trim().toUpperCase());
    if (!d) return say('That code does not match a doctor. Check it with the clinic.');
    setMyLink({ doctorId: d.id, patientId: s.me.id, status: 'active', via: 'invite_code' }, `${who} linked to ${d.name} with a clinic code`);
    say(`You are now linked with ${d.name}.`);
    onDone && onDone();
  };
  const request = d => {
    setMyLink({ doctorId: d.id, patientId: s.me.id, status: 'pending', via: 'search' }, `${who} asked to link to ${d.name}`);
    say(`Request sent. ${d.name} will approve it from their dashboard.`);
    onDone && onDone();
  };
  const results = q.trim() ? (s.doctors || []).filter(d => (d.name + d.clinic).toLowerCase().includes(q.trim().toLowerCase())) : [];
  const invite = encodeURIComponent('Hello doctor, I am pregnant and would like to book my antenatal visits with you on Pregnant Care.');

  return (
    <div className="grid gap-6">
      <form onSubmit={byCode} className="grid gap-2">
        <Field label="Clinic invite code" id="code">
          <div className="flex gap-2">
            <input id="code" value={code} onChange={e => setCode(e.target.value)} placeholder="Code from your clinic" className={inputCls} />
            <Btn type="submit">Link</Btn>
          </div>
        </Field>
        <p className="text-xs text-muted">Your doctor can give you a code or QR at the clinic. It links you straight away.</p>
      </form>
      <div>
        <Field label="Or search by doctor or clinic name" id="dq">
          <input id="dq" value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. University of Ilorin Teaching Hospital" className={inputCls} />
        </Field>
        <div className="mt-3 grid gap-2">
          {results.map(d => (
            <div key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
              <div className="min-w-0"><p className="font-semibold truncate">{d.name}</p><p className="text-xs text-muted truncate">{d.clinic}, {d.area}</p></div>
              <Btn kind="ghost" onClick={() => request(d)} className="shrink-0">Send link request</Btn>
            </div>
          ))}
          {q.trim() && results.length === 0 && (
            <p className="text-sm text-muted">No doctor found. <a className="text-brand underline" target="_blank" rel="noreferrer" href={`https://wa.me/?text=${invite}`}>Invite your doctor on WhatsApp</a>. Once they are verified, you are linked automatically.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LinkDoctor;
