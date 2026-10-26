/**
 * FILE GUIDE: Detailed patient profile, appointments, milestones, and record-access UI.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useEffect } from 'react';
import { WeekRing } from '../../components/WeekRing';
import { Card, Btn, Pill, Field, inputCls, statusPill } from '../../components/ui';
import { longDate, Info, allPatients, docName, logAccess } from './shared';
import { parse, fmtDate, fmtTime, apptStart } from '../../lib/format';
import { pregnancy, MILESTONES } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function AdminPatientDetail({ s, setS, email, id, onBack }) {
  const p = allPatients(s).find(x => x.id === id);
  const [unlocked, setUnlocked] = useState(false);
  const [asking, setAsking] = useState(false);
  const [why, setWhy] = useState('');
  useEffect(() => { if (p) logAccess(setS, email, p, 'profile_view'); }, [id]);
  if (!p) return <div><button onClick={onBack} className="text-sm text-muted underline">Back to patients</button><p className="mt-4 text-muted">Patient not found.</p></div>;
  const g = pregnancy(p.lmp);
  const appts = s.appts.filter(a => a.patientId === id).sort((a, b) => apptStart(b) - apptStart(a));
  const links = s.links.filter(l => l.patientId === id);
  const upcoming = appts.filter(a => ['confirmed', 'requested'].includes(a.status) && apptStart(a) >= new Date()).sort((a, b) => apptStart(a) - apptStart(b));
  const visits = appts.filter(a => a.status === 'completed' && a.note);

  return (
    <div className="grid gap-5">
      <button onClick={onBack} className="text-sm text-muted underline justify-self-start">Back to all patients</button>
      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-5 items-start">
        <Card className="p-6 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display font-extrabold text-2xl self-start text-left">{p.name}</h2>
          <WeekRing weeks={g.weeks} pct={g.pct} />
          <p className="text-sm text-muted">{g.weeks} weeks, {g.days} {g.days === 1 ? 'day' : 'days'} · {g.trimester} trimester</p>
          <p className="font-semibold">Due {longDate(g.due)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-4">Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Info k="Full name" v={p.name} />
            <Info k="Email" v={p.email} />
            <Info k="Location" v={p.location} />
            <Info k="Account" v="Registered mother" />
            <Info k="First day of last period" v={longDate(parse(p.lmp))} />
            <Info k="Estimated due date" v={longDate(g.due)} />
            <Info k="Pregnancy progress" v={`${Math.round(g.pct)}% · week ${g.weeks} of 40`} />
            <Info k="Visits completed" v={String(appts.filter(a => a.status === 'completed').length)} />
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 items-start">
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Doctor</h3>
          {!links.length && <p className="text-muted">No doctor linked yet.</p>}
          <div className="grid gap-2.5">
            {links.map((l, i) => {
              const d = (s.doctors || []).find(x => x.id === l.doctorId);
              return (
                <div key={i} className="rounded-xl bg-soft p-3.5 flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0"><p className="font-semibold">{docName(s, l.doctorId)}</p><p className="text-sm text-muted">{d ? `${d.title} · ${d.clinic}, ${d.area}` : ''} · linked by {l.via === 'invite_code' ? 'clinic code' : 'search'}</p></div>
                  {l.status === 'active' ? <Pill tone="ok">Active</Pill> : <Pill tone="warn">Pending approval</Pill>}
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Upcoming appointments</h3>
          {!upcoming.length && <p className="text-muted">Nothing booked.</p>}
          <div className="grid gap-2.5">
            {upcoming.map(a => (
              <div key={a.id} className="rounded-xl bg-soft p-3.5 flex items-center justify-between gap-3 flex-wrap">
                <div><p className="font-semibold">{fmtDate(a.date)}, {fmtTime(a.time)}</p><p className="text-sm text-muted">{docName(s, a.doctorId)}</p></div>
                {statusPill(a.status)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="font-display font-bold text-xl">Clinical records</h3>
          {unlocked ? <Pill tone="warn">Access logged</Pill> : <Pill>Restricted</Pill>}
        </div>
        {!unlocked ? (
          <div className="grid gap-3">
            <p className="text-sm text-muted">Findings, vitals and visit notes stay between the patient and her doctor. {visits.length} {visits.length === 1 ? 'visit record is' : 'visit records are'} on file. Open them only for a complaint or safety issue. Your reason is saved in the access log.</p>
            {!asking ? <Btn kind="ghost" onClick={() => setAsking(true)} disabled={!visits.length} className="justify-self-start">Request clinical access</Btn> : (
              <form onSubmit={e => { e.preventDefault(); logAccess(setS, email, p, 'clinical_access', why.trim()); setUnlocked(true); }} className="grid gap-3">
                <Field label="Reason for opening these records" id="why"><textarea id="why" rows="2" value={why} onChange={e => setWhy(e.target.value)} placeholder="e.g. Complaint about a missed visit" className={inputCls} /></Field>
                <div className="flex gap-2"><Btn type="submit" disabled={why.trim().length < 10}>Open records</Btn><Btn kind="ghost" type="button" onClick={() => { setAsking(false); setWhy(''); }}>Cancel</Btn></div>
              </form>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {visits.map(a => (
              <div key={a.id} className="rounded-xl border border-line p-4 text-sm grid gap-1.5">
                <div className="flex justify-between gap-3"><b>{fmtDate(a.date)}, {fmtTime(a.time)}</b><span className="text-muted">{docName(s, a.doctorId)}</span></div>
                <p className="text-muted tabular-nums">BP {a.note.bp} · Weight {a.note.weight} kg · Fundal height {a.note.fundal || '—'} cm</p>
                <p><span className="text-muted">Clinical findings:</span> {a.note.findings}</p>
                <p><span className="text-muted">Told to patient:</span> {a.note.summary}</p>
                {a.note.next && <p><span className="text-muted">Next visit:</span> {fmtDate(a.note.next)}</p>}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-xl mb-3">Full appointment history</h3>
        {!appts.length && <p className="text-muted">No appointments.</p>}
        {appts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead><tr className="text-left text-muted"><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Doctor</th><th className="pb-2 font-medium">Status</th></tr></thead>
              <tbody>{appts.map(a => (
                <tr key={a.id} className="border-t border-line"><td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">{fmtDate(a.date)}, {fmtTime(a.time)}</td><td className="py-2.5 pr-3">{docName(s, a.doctorId)}</td><td className="py-2.5">{statusPill(a.status)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="font-display font-bold text-xl mb-3">Milestones</h3>
        <ul className="grid gap-2.5">
          {MILESTONES.map(m => {
            const st = g.weeks > m.b ? 'done' : g.weeks >= m.a ? 'now' : 'soon';
            return (
              <li key={m.label} className="flex items-center justify-between gap-3">
                <span>{m.label} <span className="text-muted tabular-nums">(wk {m.a === m.b ? m.a : `${m.a}–${m.b}`})</span></span>
                {st === 'done' ? <Pill tone="ok">Past</Pill> : st === 'now' ? <Pill tone="warn">Window open</Pill> : <Pill>Coming up</Pill>}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

export default AdminPatientDetail;
