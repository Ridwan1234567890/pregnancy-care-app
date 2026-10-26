/**
 * FILE GUIDE: Doctor's appointment schedule and management UI.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Card, Btn, statusPill, payPill } from '../../components/ui';
import { NoteForm } from './NoteForm';
import { Booking } from '../patient/Booking';
import { fmtDate, fmtTime, apptStart } from '../../lib/format';
import { nameOf, lmpOf } from '../../lib/lookups';
import { pregnancy } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function DoctorSchedule({ s, setS, say, doctorId }) {
  const [noting, setNoting] = useState(null);
  const mine = s.appts.filter(a => a.doctorId === doctorId);
  const requests = mine.filter(a => a.status === 'requested');
  const confirmed = mine.filter(a => a.status === 'confirmed').sort((a, b) => apptStart(a) - apptStart(b));
  const done = mine.filter(a => ['completed', 'no_show', 'declined', 'cancelled'].includes(a.status)).sort((a, b) => apptStart(b) - apptStart(a)).slice(0, 5);
  const setStatus = (id, status, note) => setS(p => ({ ...p, appts: p.appts.map(a => (a.id === id ? { ...a, status, note: note || a.note } : a)) }));

  const Row = ({ a, children }) => {
    const lmp = lmpOf(s, a.patientId);
    return (
      <div className="rounded-xl bg-soft p-3.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="font-semibold">{nameOf(s, a.patientId)} <span className="font-normal text-muted">· {lmp ? `week ${pregnancy(lmp).weeks}` : ''}</span></p>
            <p className="text-sm text-muted">{fmtDate(a.date)}, {fmtTime(a.time)}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">{payPill(a)}{children}</div>
        </div>
        {noting === a.id && <NoteForm onCancel={() => setNoting(null)} onSave={n => { setStatus(a.id, 'completed', n); setNoting(null); say('Visit saved to the patient’s record.'); }} />}
      </div>
    );
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5 items-start">
      <Card className="p-6">
        <h3 className="font-display font-bold text-xl mb-3">Booking requests</h3>
        {!requests.length && <p className="text-muted">No requests waiting.</p>}
        <div className="grid gap-3">
          {requests.map(a => (
            <Row key={a.id} a={a}>
              <Btn onClick={() => { setStatus(a.id, 'confirmed'); say('Appointment confirmed. The patient has been notified.'); }} className="py-1.5">Confirm</Btn>
              <Btn kind="danger" onClick={() => setStatus(a.id, 'declined')} className="py-1.5">Decline</Btn>
            </Row>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="font-display font-bold text-xl mb-3">Upcoming visits</h3>
        {!confirmed.length && <p className="text-muted">No confirmed visits.</p>}
        <div className="grid gap-3">
          {confirmed.map(a => (
            <Row key={a.id} a={a}>
              <Btn kind="ghost" onClick={() => setNoting(a.id)} className="py-1.5">Log visit</Btn>
              <Btn kind="danger" onClick={() => setStatus(a.id, 'no_show')} className="py-1.5">No-show</Btn>
            </Row>
          ))}
        </div>
      </Card>
      <Card className="p-6 lg:col-span-2">
        <h3 className="font-display font-bold text-xl mb-3">Recent</h3>
        {!done.length && <p className="text-muted">Nothing yet.</p>}
        <div className="grid md:grid-cols-2 gap-3">
          {done.map(a => (
            <div key={a.id} className="rounded-xl border border-line p-3.5 text-sm">
              <div className="flex justify-between gap-3"><b>{nameOf(s, a.patientId)}</b>{statusPill(a.status)}</div>
              <p className="text-muted">{fmtDate(a.date)}, {fmtTime(a.time)}</p>
              {a.note && <p className="mt-2"><span className="text-muted">Findings:</span> {a.note.findings}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default DoctorSchedule;
