/**
 * FILE GUIDE: Admin patient search/filtering and selection.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Pill, inputCls } from '../../components/ui';
import { AdminPatientDetail } from './AdminPatientDetail';
import { longDate, allPatients, docName } from './shared';
import { fmtDate, fmtTime, apptStart } from '../../lib/format';
import { pregnancy } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function AdminPatients({ s, setS, email, openId, setOpenId }) {
  const [q, setQ] = useState('');
  const [tri, setTri] = useState('All');
  if (openId) return <AdminPatientDetail s={s} setS={setS} email={email} id={openId} onBack={() => setOpenId(null)} />;
  const rows = allPatients(s).map(p => {
    const mine = s.appts.filter(a => a.patientId === p.id);
    const up = mine.filter(a => ['confirmed', 'requested'].includes(a.status) && apptStart(a) >= new Date()).sort((a, b) => apptStart(a) - apptStart(b))[0];
    const link = s.links.find(l => l.patientId === p.id);
    return { p, g: pregnancy(p.lmp), up, link, visits: mine.filter(a => a.status === 'completed').length };
  }).filter(r => (tri === 'All' || r.g.trimester === tri) && [r.p.name, r.p.email, r.p.location].join(' ').toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.g.due - b.g.due);

  return (
    <div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
        <input aria-label="Search patients" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, email or location" className={inputCls} />
        <p className="text-sm text-muted self-center">{rows.length} {rows.length === 1 ? 'patient' : 'patients'}, soonest due date first</p>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {['All', 'First', 'Second', 'Third'].map(x => (
          <button key={x} onClick={() => setTri(x)} aria-pressed={tri === x}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${tri === x ? 'btn-grad text-brandink border-brand' : 'border-line text-muted'}`}>{x === 'All' ? 'All trimesters' : `${x} trimester`}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {rows.map(r => (
          <button key={r.p.id} onClick={() => { setOpenId(r.p.id); window.scrollTo(0, 0); }} aria-label={`Open ${r.p.name}'s record`}
            className="glass rounded-3xl p-5 text-left w-full hover:border-brand transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-display font-bold text-lg truncate">{r.p.name}</p>
                <p className="text-sm text-muted truncate">{r.p.email} · {r.p.location || 'No location'}</p>
              </div>
              <Pill>{r.g.trimester} trimester</Pill>
            </div>
            <div className="mt-3 text-sm grid gap-1">
              <p><span className="text-muted">Pregnancy:</span> week {r.g.weeks} · due {longDate(r.g.due)}</p>
              <p><span className="text-muted">Doctor:</span> {r.link ? `${docName(r.link.doctorId)}${r.link.status === 'pending' ? ' (pending)' : ''}` : 'None linked'}</p>
              <p><span className="text-muted">Next:</span> {r.up ? `${fmtDate(r.up.date)}, ${fmtTime(r.up.time)}` : 'nothing booked'}</p>
              <p className="text-muted">{r.visits} {r.visits === 1 ? 'visit' : 'visits'} completed</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand">View full record</p>
          </button>
        ))}
        {!rows.length && <p className="text-muted">No patients yet.</p>}
      </div>
    </div>
  );
}

export default AdminPatients;
