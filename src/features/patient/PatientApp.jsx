/**
 * FILE GUIDE: Patient-area navigation and screen selection.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useTracked } from '../../lib/back';
import { Tabs } from '../../components/ui';
import { Booking } from './Booking';
import { Discover } from './Discover';
import { Onboarding } from './Onboarding';
import { PatientHome } from './PatientHome';
import { PatientVisits } from './PatientVisits';
import { pregnancy } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function PatientApp({ s, setS, say }) {
  const [view, setView] = useTracked({ tab: 'home', booking: null });
  const { tab, booking } = view;
  const setTab = t => setView(v => ({ ...v, tab: t }));
  const setBooking = b => setView(v => ({ ...v, booking: b }));
  const myId = s.me ? s.me.id : null;
  const primaryId = (s.links.find(l => l.patientId === myId && l.status === 'active') || {}).doctorId;
  const pendingLink = s.links.find(l => l.patientId === myId && l.status === 'pending');

  if (!s.me || !s.onboarded) return <Onboarding s={s} setS={setS} say={say} goFind={() => setTab('find')} />;

  const open = id => setView({ tab: 'find', booking: id });
  return (
    <div className="max-w-5xl mx-auto py-6">
      <Tabs tabs={[['home', 'My pregnancy'], ['find', 'Find a doctor'], ['visits', 'My visits']]} value={tab} onChange={t => setView({ tab: t, booking: null })} />
      {tab === 'home' && <PatientHome s={s} setS={setS} say={say} primaryId={primaryId} pendingLink={pendingLink} goFind={open} />}
      {tab === 'find' && (booking
        ? <Booking doc={s.doctors.find(d => d.id === booking)} s={s} setS={setS} say={say} linked={primaryId === booking} onBack={() => setBooking(null)} onDone={() => setView({ tab: 'home', booking: null })} />
        : <Discover s={s} primaryId={primaryId} onOpen={setBooking} />)}
      {tab === 'visits' && <PatientVisits s={s} />}
    </div>
  );
}

export default PatientApp;
