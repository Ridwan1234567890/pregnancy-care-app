/**
 * FILE GUIDE: Admin dashboard navigation and overview.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useTracked } from '../../lib/back';
import { Card, Btn, Pill, Tabs, statusPill, payPill } from '../../components/ui';
import { AdminDoctors } from './AdminDoctors';
import { AdminLog } from './AdminLog';
import { AdminPatients } from './AdminPatients';
import { allPatients, docName } from './shared';
import { fmtDate, fmtTime, apptStart, naira } from '../../lib/format';
import { nameOf } from '../../lib/lookups';

// noticeLabel: named value used by the code below.
export const noticeLabel = { booking: ['New booking', 'ok'], next: ['Next visit', 'soft'], cancel: ['Cancelled', 'accent'], link: ['Link request', 'warn'] };

// Function/component: the code below runs when this function is called.
export function AdminApp({ s, setS, email }) {
  const [view, setView] = useTracked({ tab: 'overview', openId: null });
  const { tab, openId } = view;
  const setTab = t => setView(v => ({ ...v, tab: t }));
  const setOpenId = id => setView(v => ({ ...v, openId: id }));
  const notices = s.notices || [];
  const unread = notices.filter(n => !n.read).length;
  const markAll = () => setS(p => ({ ...p, notices: (p.notices || []).map(n => ({ ...n, read: true })) }));
  const markOne = id => setS(p => ({ ...p, notices: (p.notices || []).map(n => (n.id === id ? { ...n, read: true } : n)) }));
  const when = t => new Date(t).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
  const active = s.appts.filter(a => ['requested', 'confirmed'].includes(a.status));
  const pts = allPatients(s);
  const known = new Set(pts.map(p => p.id));
  const goPatient = id => { setView({ tab: 'patients', openId: id }); window.scrollTo(0, 0); };
  const stats = [['Unread notices', unread], ['Open appointments', active.length], ['Awaiting doctor', s.appts.filter(a => a.status === 'requested').length], ['Patients', pts.length, () => setView({ tab: 'patients', openId: null })], ['Paid online', naira(s.appts.reduce((n, a) => n + (a.payment && a.status !== 'cancelled' ? a.payment.amount : 0), 0))]];
  const all = [...s.appts].sort((a, b) => apptStart(b) - apptStart(a));

  return (
    <div className="max-w-5xl mx-auto py-6 grid gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display font-extrabold text-3xl">Admin</h1>
        {unread > 0 && <Pill tone="warn">{unread} new</Pill>}
      </div>
      <Tabs tabs={[['overview', 'Overview'], ['patients', `Patients (${pts.length})`], ['doctors', `Doctors (${(s.doctors || []).length})`], ['log', 'Access log']]} value={tab} onChange={t => setView({ tab: t, openId: null })} />

      {tab === 'patients' ? <AdminPatients s={s} setS={setS} email={email} openId={openId} setOpenId={setOpenId} /> : tab === 'doctors' ? <AdminDoctors s={s} setS={setS} goPatient={goPatient} /> : tab === 'log' ? <AdminLog s={s} /> : (<>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map(([l, v, go]) => go ? (
          <button key={l} onClick={go} className="glass rounded-3xl p-4 text-left hover:border-brand transition"><p className="text-xs text-muted">{l}</p><p className="font-display font-extrabold text-3xl tabular-nums">{v}</p><p className="text-xs font-semibold text-brand mt-1">View all</p></button>
        ) : (
          <Card key={l} className="p-4"><p className="text-xs text-muted">{l}</p><p className="font-display font-extrabold text-3xl tabular-nums">{v}</p></Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display font-bold text-xl">Notices</h2>
          <Btn kind="ghost" onClick={markAll} disabled={!unread} className="py-1.5">Mark all read</Btn>
        </div>
        {!notices.length && <p className="text-muted">Nothing yet. When a mother books an appointment or a next visit, it shows up here.</p>}
        <div className="grid gap-2.5">
          {notices.map(n => {
            const [label, tone] = noticeLabel[n.type] || ['Update', 'soft'];
            return (
              <div key={n.id} className={`flex items-start justify-between gap-3 rounded-xl p-3.5 ${n.read ? 'border border-line' : 'bg-soft'}`}>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap"><Pill tone={tone}>{label}</Pill><span className="text-xs text-muted">{when(n.at)}</span></div>
                  <p className={n.read ? 'text-muted' : 'font-semibold'}>{n.text}</p>
                </div>
                {!n.read && <button onClick={() => markOne(n.id)} className="text-sm text-brand font-semibold shrink-0 underline">Mark read</button>}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display font-bold text-xl mb-4">All appointments</h2>
        {!all.length && <p className="text-muted">No appointments yet.</p>}
        {all.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead><tr className="text-left text-muted"><th className="pb-2 font-medium">Patient</th><th className="pb-2 font-medium">Doctor</th><th className="pb-2 font-medium">When</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Payment</th></tr></thead>
              <tbody>
                {all.map(a => (
                  <tr key={a.id} className="border-t border-line">
                    <td className="py-2.5 pr-3">{known.has(a.patientId) ? <button onClick={() => goPatient(a.patientId)} className="text-brand font-semibold underline text-left">{nameOf(s, a.patientId)}</button> : nameOf(s, a.patientId)}</td>
                    <td className="py-2.5 pr-3">{docName(s, a.doctorId)}</td>
                    <td className="py-2.5 pr-3 tabular-nums whitespace-nowrap">{fmtDate(a.date)}, {fmtTime(a.time)}</td>
                    <td className="py-2.5 pr-3">{statusPill(a.status)}</td>
                    <td className="py-2.5 text-xs">{a.payment ? <>{payPill(a)}<span className="block text-muted mt-1 tabular-nums">{naira(a.payment.amount)} · {a.payment.ref}</span></> : <span className="text-muted">At clinic</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="text-sm text-muted">Notices appear live if this page is open in a second tab of the same browser.</p>
      </>)}
    </div>
  );
}

export default AdminApp;
