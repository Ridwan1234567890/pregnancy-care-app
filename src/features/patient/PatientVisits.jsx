/**
 * FILE GUIDE: Patient appointment history and visit notes.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { Card, statusPill, payPill } from '../../components/ui';
import { fmtDate, fmtTime, apptStart } from '../../lib/format';

// Function/component: the code below runs when this function is called.
export function PatientVisits({ s }) {
  const mine = s.appts.filter(a => a.patientId === s.me.id).sort((a, b) => apptStart(b) - apptStart(a));
  if (!mine.length) return <p className="text-muted">Your visit history will appear here after your first appointment.</p>;
  return (
    <div className="grid gap-3 max-w-2xl">
      {mine.map(a => {
        const d = (s.doctors || []).find(x => x.id === a.doctorId);
        return (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-semibold">{fmtDate(a.date)}, {fmtTime(a.time)}</p><p className="text-sm text-muted">{d.name} · {d.clinic}</p></div>
              <div className="flex items-center gap-2">{payPill(a)}{statusPill(a.status)}</div>
            </div>
            {a.note && (
              <div className="mt-3 grid gap-2 text-sm">
                <p>{a.note.summary}</p>
                <p className="text-muted tabular-nums">BP {a.note.bp} · Weight {a.note.weight} kg · Fundal height {a.note.fundal} cm</p>
                {a.note.next && <p><b>Next visit:</b> {fmtDate(a.note.next)}</p>}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

export default PatientVisits;
