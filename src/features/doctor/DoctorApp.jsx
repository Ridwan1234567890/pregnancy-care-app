/**
 * FILE GUIDE: Doctor-area navigation and screen selection.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useTracked } from '../../lib/back';
import { Pill, Tabs } from '../../components/ui';
import { DoctorPatients } from './DoctorPatients';
import { DoctorSchedule } from './DoctorSchedule';

// Function/component: the code below runs when this function is called.
export function DoctorApp({ s, setS, say, doctorId }) {
  const [tab, setTab] = useTracked('schedule');
  const d = (s.doctors || []).find(x => x.id === doctorId);
  if (!d) return <p className="max-w-5xl mx-auto py-10 text-muted">This account is not linked to a doctor profile. Please sign up again with your clinic code.</p>;
  const waiting = s.appts.filter(a => a.doctorId === d.id && a.status === 'requested').length + s.links.filter(l => l.doctorId === d.id && l.status === 'pending').length;
  return (
    <div className="max-w-5xl mx-auto py-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div><h1 className="font-display font-extrabold text-3xl">{d.name}</h1><p className="text-muted">{d.clinic} · clinic code <b className="text-ink tabular-nums">{d.code}</b></p></div>
        <div className="flex items-center gap-2"><Pill tone="ok">Verified</Pill>{waiting > 0 && <Pill tone="warn">{waiting} waiting</Pill>}</div>
      </div>
      <Tabs tabs={[['schedule', 'Schedule'], ['patients', 'Patients']]} value={tab} onChange={setTab} />
      {tab === 'schedule' ? <DoctorSchedule s={s} setS={setS} say={say} doctorId={d.id} /> : <DoctorPatients s={s} setS={setS} say={say} doctorId={d.id} />}
    </div>
  );
}

export default DoctorApp;
