/**
 * FILE GUIDE: Doctor's patient list and appointment summaries.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Card, Btn, Pill } from '../../components/ui';
import { parse, addDays, today0, fmtDate, fmtTime, apptStart } from '../../lib/format';
import { nameOf, lmpOf } from '../../lib/lookups';
import { pregnancy } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function DoctorPatients({ s, setS, say, doctorId }) {
  const [filter, setFilter] = useState('all');
  const ids = [...new Set([...s.links.filter(l => l.doctorId === doctorId).map(l => l.patientId), ...s.appts.filter(a => a.doctorId === doctorId).map(a => a.patientId)])];
  const pending = s.links.filter(l => l.doctorId === doctorId && l.status === 'pending');
  const t = today0();

  const info = id => {
    const mine = s.appts.filter(a => a.doctorId === doctorId && a.patientId === id);
    const up = mine.filter(a => ['confirmed', 'requested'].includes(a.status) && apptStart(a) >= new Date()).sort((a, b) => apptStart(a) - apptStart(b))[0];
    const last = mine.filter(a => a.status === 'completed').sort((a, b) => apptStart(b) - apptStart(a))[0];
    const rec = last && last.note && last.note.next;
    const overdue = !!rec && parse(rec) < t && !up;
    const dueWeek = (!!up && apptStart(up) <= addDays(t, 8)) || (!!rec && !overdue && parse(rec) <= addDays(t, 7));
    return { up, last, rec, overdue, dueWeek };
  };
  const rows = ids.filter(id => lmpOf(s, id)).map(id => ({ id, ...info(id) }))
    .filter(r => filter === 'all' || (filter === 'week' && r.dueWeek) || (filter === 'overdue' && r.overdue) || (filter === 'upcoming' && r.up));

  const approve = l => {
    setS(p => ({ ...p, links: p.links.map(x => (x.patientId === l.patientId && x.doctorId === l.doctorId ? { ...x, status: 'active' } : x)) }));
    say(`${nameOf(s, l.patientId)} is now linked to you.`);
  };

  return (
    <div className="grid gap-5">
      {pending.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Link requests</h3>
          <div className="grid gap-3">
            {pending.map(l => (
              <div key={l.patientId} className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-soft p-3.5">
                <div><p className="font-semibold">{nameOf(s, l.patientId)}</p><p className="text-sm text-muted">{lmpOf(s, l.patientId) ? `Week ${pregnancy(lmpOf(s, l.patientId)).weeks} · ` : ''}found you by search</p></div>
                <Btn onClick={() => approve(l)} className="py-1.5">Approve</Btn>
              </div>
            ))}
          </div>
        </Card>
      )}
      <div>
        <div className="flex gap-2 flex-wrap mb-4">
          {[['all', 'All patients'], ['week', 'Due this week'], ['overdue', 'Overdue'], ['upcoming', 'Has appointment']].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} aria-pressed={filter === k}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${filter === k ? 'btn-grad text-brandink border-brand' : 'border-line text-muted'}`}>{l}</button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {rows.map(r => {
            const p = pregnancy(lmpOf(s, r.id));
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="font-semibold">{nameOf(s, r.id)}</p><p className="text-sm text-muted">Week {p.weeks} · {p.trimester} trimester · due {p.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p></div>
                  <div className="flex flex-col items-end gap-1">{r.overdue && <Pill tone="warn">Overdue</Pill>}{r.dueWeek && <Pill tone="ok">Due this week</Pill>}</div>
                </div>
                <div className="mt-3 text-sm grid gap-1">
                  <p><span className="text-muted">Next:</span> {r.up ? `${fmtDate(r.up.date)}, ${fmtTime(r.up.time)}` : r.rec ? `recommended ${fmtDate(r.rec)}` : 'nothing planned'}</p>
                  {r.last && <p><span className="text-muted">Last visit:</span> {fmtDate(r.last.date)}</p>}
                  {r.last && r.last.note && <p className="text-muted tabular-nums">BP {r.last.note.bp} · {r.last.note.weight} kg · fundal {r.last.note.fundal} cm</p>}
                </div>
              </Card>
            );
          })}
          {!rows.length && <p className="text-muted">No patients in this view yet. Share your clinic code so mothers can link to you.</p>}
        </div>
      </div>
    </div>
  );
}

export default DoctorPatients;
