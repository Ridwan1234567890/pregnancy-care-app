import { useState } from 'react';
import { Btn, Card, Field, inputCls } from '../../components/ui';

const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const blank = { name: '', title: 'OB/GYN', clinic: '', area: '', fee: '', days: [1, 2, 3, 4, 5], start: 9, end: 13, dur: 30, bio: '' };

// Admin form that adds a doctor to the directory. The clinic code is generated and shown once saved.
export function AddDoctor({ s, setS, onDone }) {
  const [f, setF] = useState(blank);
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const toggleDay = d => setF({ ...f, days: f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d].sort() });

  const save = e => {
    e.preventDefault();
    const fee = Number(f.fee), start = Number(f.start), end = Number(f.end), dur = Number(f.dur);
    if (!f.name.trim() || !f.clinic.trim() || !f.area.trim()) return setErr('Enter the doctor’s name, clinic and area.');
    if (!(fee > 0)) return setErr('Enter a visit fee greater than zero.');
    if (!f.days.length) return setErr('Pick at least one working day.');
    if (!(end > start)) return setErr('Closing hour must be after the opening hour.');
    const taken = new Set((s.doctors || []).map(d => d.code));
    const base = (f.name.replace(/^(dr|hajia|mr|mrs)\.?\s+/i, '').split(/\s+/).pop() || 'DOC').replace(/[^a-z]/gi, '').toUpperCase().slice(0, 8) || 'DOC';
    let code; do { code = base + Math.floor(10 + Math.random() * 90); } while (taken.has(code));
    const doc = { id: 'd' + Date.now(), name: f.name.trim(), title: f.title, clinic: f.clinic.trim(), area: f.area.trim(), km: null, fee, rating: null, reviews: 0, code, days: f.days, start, end, dur, bio: f.bio.trim() || 'Antenatal care.' };
    setS(p => ({ ...p, doctors: [...(p.doctors || []), doc] }));
    setF(blank); setErr(''); onDone && onDone(doc);
  };

  return (
    <Card className="p-6">
      <h3 className="font-display font-bold text-xl mb-4">Add a doctor</h3>
      <form onSubmit={save} className="grid gap-4" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" id="ad-name"><input id="ad-name" value={f.name} onChange={set('name')} placeholder="e.g. Dr. Jane Doe" className={inputCls} /></Field>
          <Field label="Role" id="ad-title"><select id="ad-title" value={f.title} onChange={set('title')} className={inputCls}><option>OB/GYN</option><option>Midwife</option><option>Sonographer</option></select></Field>
          <Field label="Clinic or hospital" id="ad-clinic"><input id="ad-clinic" value={f.clinic} onChange={set('clinic')} className={inputCls} /></Field>
          <Field label="Area" id="ad-area"><input id="ad-area" value={f.area} onChange={set('area')} placeholder="e.g. Ilorin, Kwara" className={inputCls} /></Field>
          <Field label="Visit fee (₦)" id="ad-fee"><input id="ad-fee" type="number" min="1" value={f.fee} onChange={set('fee')} className={inputCls} /></Field>
          <Field label="Slot length (minutes)" id="ad-dur"><select id="ad-dur" value={f.dur} onChange={set('dur')} className={inputCls}><option>15</option><option>20</option><option>30</option><option>45</option><option>60</option></select></Field>
          <Field label="Opens (hour, 0 to 23)" id="ad-start"><input id="ad-start" type="number" min="0" max="23" value={f.start} onChange={set('start')} className={inputCls} /></Field>
          <Field label="Closes (hour, 1 to 24)" id="ad-end"><input id="ad-end" type="number" min="1" max="24" value={f.end} onChange={set('end')} className={inputCls} /></Field>
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">Working days</p>
          <div className="flex gap-2 flex-wrap">{DAYN.map((n, i) => (
            <button type="button" key={n} onClick={() => toggleDay(i)} aria-pressed={f.days.includes(i)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border ${f.days.includes(i) ? 'btn-grad text-brandink border-brand' : 'border-line text-muted'}`}>{n}</button>
          ))}</div>
        </div>
        <Field label="About (optional)" id="ad-bio"><textarea id="ad-bio" rows="2" value={f.bio} onChange={set('bio')} className={inputCls} /></Field>
        {err && <p role="alert" className="text-sm text-accent">{err}</p>}
        <div><Btn type="submit">Add doctor</Btn></div>
      </form>
    </Card>
  );
}

export default AddDoctor;
