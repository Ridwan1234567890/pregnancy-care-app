/**
 * FILE GUIDE: Audit/access log display and filtering.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Card, Pill } from '../../components/ui';

// Function/component: the code below runs when this function is called.
export function AdminLog({ s }) {
  const [onlyClin, setOnlyClin] = useState(false);
  const rows = (s.auditLog || []).filter(r => !onlyClin || r.type === 'clinical_access');
  const when = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <h2 className="font-display font-bold text-xl">Access log</h2>
        <button onClick={() => setOnlyClin(!onlyClin)} aria-pressed={onlyClin} className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${onlyClin ? 'btn-grad text-brandink border-brand' : 'border-line text-muted'}`}>Clinical access only</button>
      </div>
      {!rows.length && <p className="text-muted">Nothing logged yet. Each time an admin opens a patient record it is recorded here.</p>}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead><tr className="text-left text-muted"><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Admin</th><th className="pb-2 font-medium">Patient</th><th className="pb-2 font-medium">Action</th><th className="pb-2 font-medium">Reason</th></tr></thead>
            <tbody>{rows.map(r => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="py-2.5 pr-3 whitespace-nowrap tabular-nums">{when(r.at)}</td><td className="py-2.5 pr-3 break-all">{r.admin}</td><td className="py-2.5 pr-3">{r.patientName}</td>
                <td className="py-2.5 pr-3">{r.type === 'clinical_access' ? <Pill tone="warn">Opened clinical records</Pill> : <Pill>Viewed profile</Pill>}</td><td className="py-2.5">{r.reason || '—'}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export default AdminLog;
