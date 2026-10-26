/**
 * FILE GUIDE: Patient dashboard: pregnancy progress, linked doctor, upcoming appointments, and reminders.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { WeekRing } from '../../components/WeekRing';
import { Card, Btn, Pill, statusPill, payPill } from '../../components/ui';
import { LinkDoctor } from './LinkDoctor';
import { fmtDate, fmtTime, apptStart } from '../../lib/format';
import { pregnancy, MILESTONES } from '../../lib/pregnancy';
import { addNotice } from '../../lib/store';

// Function/component: the code below runs when this function is called.
export function PatientHome({ s, setS, say, primaryId, pendingLink, goFind }) {
  const me = s.me, p = pregnancy(me.lmp);
  const doc = (s.doctors || []).find(d => d.id === primaryId);
  const upcoming = s.appts.filter(a => a.patientId === me.id && ['confirmed', 'requested'].includes(a.status) && apptStart(a) >= new Date()).sort((a, b) => apptStart(a) - apptStart(b));

  const cancel = a => {
    if (apptStart(a) - new Date() < 12 * 36e5) return say('Cancellations need 12 hours’ notice. Please call the clinic.');
    setS(x => addNotice({ ...x, appts: x.appts.map(y => (y.id === a.id ? { ...y, status: 'cancelled' } : y)) },
      { type: 'cancel', text: `${me.name} cancelled the visit with ${(s.doctors || []).find(d => d.id === a.doctorId).name} on ${fmtDate(a.date)}, ${fmtTime(a.time)}${a.payment ? ` (paid online, ref ${a.payment.ref}: refund needed)` : ''}` }));
    say(a.payment ? 'Appointment cancelled. The clinic will arrange your refund.' : 'Appointment cancelled.');
  };

  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
      <Card className="p-6 flex flex-col items-center gap-3 text-center">
        <h2 className="font-display font-extrabold text-2xl self-start">Hello, {me.name.split(' ')[0]}</h2>
        <WeekRing weeks={p.weeks} pct={p.pct} />
        <p className="text-sm text-muted">{p.weeks} weeks, {p.days} {p.days === 1 ? 'day' : 'days'} · {p.trimester} trimester</p>
        <p className="font-semibold">Due {p.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </Card>

      <div className="grid gap-5 content-start min-w-0">
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Your doctor</h3>
          {doc ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div><p className="font-semibold">{doc.name}</p><p className="text-sm text-muted">{doc.clinic}, {doc.area}</p></div>
              <Btn onClick={() => goFind(doc.id)}>Book next visit</Btn>
            </div>
          ) : pendingLink ? (
            <p className="text-muted">Waiting for {(s.doctors || []).find(d => d.id === pendingLink.doctorId).name} to approve your link request. You can still book from the Find a doctor tab.</p>
          ) : (
            <div className="grid gap-4">
              <p className="text-muted">Link your own doctor so every visit stays in one place.</p>
              <LinkDoctor s={s} setS={setS} say={say} />
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Upcoming appointments</h3>
          {upcoming.length === 0 && <p className="text-muted">Nothing booked yet.</p>}
          <div className="grid gap-3">
            {upcoming.map(a => {
              const d = (s.doctors || []).find(x => x.id === a.doctorId);
              return (
                <div key={a.id} className="flex items-center justify-between gap-3 flex-wrap rounded-xl bg-soft p-3.5">
                  <div className="min-w-0">
                    <p className="font-semibold">{fmtDate(a.date)}, {fmtTime(a.time)}</p>
                    <p className="text-sm text-muted">{d.name} · {d.clinic}</p>
                  </div>
                  <div className="flex items-center gap-2">{payPill(a)}{statusPill(a.status)}<Btn kind="danger" onClick={() => cancel(a)} className="py-1.5">Cancel</Btn></div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-1">Milestone reminders</h3>
          <p className="text-xs text-muted mb-3">Scheduling reminders only. Your doctor decides what you need.</p>
          <ul className="grid gap-2.5">
            {MILESTONES.map(m => {
              const state = p.weeks > m.b ? 'done' : p.weeks >= m.a ? 'now' : 'soon';
              return (
                <li key={m.label} className="flex items-center justify-between gap-3">
                  <span>{m.label} <span className="text-muted tabular-nums">(wk {m.a === m.b ? m.a : `${m.a}–${m.b}`})</span></span>
                  {state === 'done' ? <Pill tone="ok">Past</Pill> : state === 'now' ? <Pill tone="warn">Book now</Pill> : <Pill>Coming up</Pill>}
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}

export default PatientHome;
