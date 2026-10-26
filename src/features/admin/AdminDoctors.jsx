/**
 * FILE GUIDE: Admin doctor directory and workload overview.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { useTracked } from '../../lib/back';
import { Card, Pill } from '../../components/ui';
import { Info, allPatients } from './shared';
import { AddDoctor } from './AddDoctor';
import { pad, fmtTime, naira } from '../../lib/format';
import { patientOf } from '../../lib/lookups';
import { pregnancy } from '../../lib/pregnancy';

// DAYN: named value used by the code below.
export const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Function/component: the code below runs when this function is called.
export function docStats(s, d) {
  const ap = s.appts.filter(a => a.doctorId === d.id), lk = s.links.filter(l => l.doctorId === d.id);
  const n = st => ap.filter(a => a.status === st).length;
  const completed = n('completed'), noShow = n('no_show');
  return { lk, active: lk.filter(l => l.status === 'active').length, pending: lk.filter(l => l.status === 'pending').length, requested: n('requested'), confirmed: n('confirmed'), completed, noShow, cancelled: n('cancelled'), noShowRate: completed + noShow ? Math.round((noShow / (completed + noShow)) * 100) : 0 };
}

// Function/component: the code below runs when this function is called.
export function AdminDoctors({ s, setS, goPatient }) {
  const [openId, setOpenId] = useTracked(null);
  const [adding, setAdding] = useState(false);
  const [fresh, setFresh] = useState(null);
  const d = (s.doctors || []).find(x => x.id === openId);
  if (d) {
    const st = docStats(s, d);
    const hours = `${fmtTime(pad(d.start) + ':00')} to ${fmtTime(pad(d.end) + ':00')}`;
    const known = new Set(allPatients(s).map(p => p.id));
    const hasAccount = Object.values(s.accounts || {}).some(a => a.doctorId === d.id);
    return (
      <div className="grid gap-5">
        <button onClick={() => setOpenId(null)} className="text-sm text-muted underline justify-self-start">Back to all doctors</button>
        <Card className="p-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div><h2 className="font-display font-extrabold text-2xl">{d.name}</h2><p className="text-muted">{d.title} · {d.clinic}</p></div>
            <div className="flex gap-2"><Pill tone="ok">Verified</Pill>{hasAccount ? <Pill>Account active</Pill> : <Pill tone="warn">No account yet</Pill>}</div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Info k="Clinic area" v={d.area} /><Info k="Visit fee" v={naira(d.fee)} /><Info k="Clinic code (give to the doctor)" v={d.code} />
            <Info k="Working days" v={d.days.map(x => DAYN[x]).join(', ')} /><Info k="Hours" v={hours} /><Info k="Slot length" v={`${d.dur} minutes`} />
          </div>
          <p className="text-sm mt-4"><span className="text-muted">About:</span> {d.bio}</p>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-4">Workload</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Info k="Active patients" v={String(st.active)} /><Info k="Link requests waiting" v={String(st.pending)} />
            <Info k="Bookings awaiting reply" v={String(st.requested)} /><Info k="Confirmed upcoming" v={String(st.confirmed)} />
            <Info k="Visits completed" v={String(st.completed)} /><Info k="No-shows" v={`${st.noShow} (${st.noShowRate}%)`} />
            <Info k="Cancelled" v={String(st.cancelled)} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display font-bold text-xl mb-3">Patients linked to this doctor</h3>
          {!st.lk.length && <p className="text-muted">No patients linked yet.</p>}
          <div className="grid md:grid-cols-2 gap-2.5">
            {st.lk.map((l, i) => {
              const p = patientOf(s, l.patientId);
              return (
                <div key={i} className="rounded-xl bg-soft p-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">{known.has(l.patientId) ? <button onClick={() => goPatient(l.patientId)} className="font-semibold text-brand underline text-left">{p.name}</button> : <p className="font-semibold">{p.name || l.patientId}</p>}
                    <p className="text-xs text-muted">{p.lmp ? `Week ${pregnancy(p.lmp).weeks}` : ''}</p></div>
                  {l.status === 'active' ? <Pill tone="ok">Active</Pill> : <Pill tone="warn">Pending</Pill>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {fresh ? <p className="text-sm">Added <b>{fresh.name}</b>. Clinic code: <b className="tabular-nums">{fresh.code}</b>. Give this code to the doctor so they can sign up.</p> : <span />}
        <button onClick={() => { setAdding(!adding); setFresh(null); }} className="text-sm font-semibold text-brand underline">{adding ? 'Close form' : 'Add a doctor'}</button>
      </div>
      {adding && <AddDoctor s={s} setS={setS} onDone={d => { setFresh(d); setAdding(false); }} />}
      {!(s.doctors || []).length && !adding && <p className="text-muted">No doctors yet. Use “Add a doctor” to create the first profile.</p>}
    <div className="grid md:grid-cols-2 gap-3">
      {(s.doctors || []).map(x => {
        const st = docStats(s, x);
        return (
          <button key={x.id} onClick={() => { setOpenId(x.id); window.scrollTo(0, 0); }} aria-label={`Open ${x.name}`} className="glass rounded-3xl p-5 text-left w-full hover:border-brand transition">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-display font-bold text-lg truncate">{x.name}</p><p className="text-sm text-muted truncate">{x.title} · {x.clinic}, {x.area}</p></div>
              <Pill tone="ok">Verified</Pill>
            </div>
            <div className="mt-3 text-sm grid gap-1">
              <p><span className="text-muted">Rating:</span> {x.rating ? `${x.rating} (${x.reviews})` : 'New'} · <span className="text-muted">Fee:</span> {naira(x.fee)}</p>
              <p><span className="text-muted">Works:</span> {x.days.map(y => DAYN[y]).join(', ')}</p>
              <p><span className="text-muted">Patients:</span> {st.active} active{st.pending ? `, ${st.pending} pending` : ''} · {st.confirmed + st.requested} open bookings</p>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand">View details</p>
          </button>
        );
      })}
    </div>
    </div>
  );
}
