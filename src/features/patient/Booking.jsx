/**
 * FILE GUIDE: Patient appointment booking: date/time selection and booking creation.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Card, Btn, Pill } from '../../components/ui';
import { ymd, parse, addDays, today0, fmtDate, fmtTime, naira } from '../../lib/format';
import { slotsFor } from '../../lib/slots';
import { addNotice } from '../../lib/store';
import { paymentsEnabled, payWithPaystack } from '../../lib/payments';

// Function/component: the code below runs when this function is called.
export function Booking({ doc, s, setS, say, linked, onBack, onDone }) {
  const days = Array.from({ length: 14 }, (_, i) => addDays(today0(), i));
  const first = days.find(d => slotsFor(doc, d, s.appts).some(x => !x.taken));
  const [date, setDate] = useState(first ? ymd(first) : '');
  const [time, setTime] = useState('');
  const [mode, setMode] = useState(paymentsEnabled ? 'online' : 'clinic');
  const [paying, setPaying] = useState(false);
  const slots = date ? slotsFor(doc, parse(date), s.appts) : [];

  const book = payment => {
    // Re-check right before saving. A real backend does this inside one database transaction.
    const live = slotsFor(doc, parse(date), s.appts).find(x => x.t === time);
    if (!live || live.taken) { setTime(''); return say('Sorry, that slot was just taken. Please pick another time.'); }
    const status = linked ? 'confirmed' : 'requested';
    const returning = s.appts.some(a => a.patientId === s.me.id && a.doctorId === doc.id && ['confirmed', 'completed', 'requested'].includes(a.status));
    const who = (s.me && s.me.name) || 'A patient';
    setS(p => addNotice({ ...p, appts: [...p.appts, { id: 'a' + Date.now(), doctorId: doc.id, patientId: s.me.id, date, time, status, ...(payment ? { payment } : {}) }] },
      { type: returning ? 'next' : 'booking', text: `${who} booked ${returning ? 'a next visit' : 'a new appointment'} with ${doc.name} for ${fmtDate(date)}, ${fmtTime(time)}${payment ? ` (paid ${naira(payment.amount)} online, ref ${payment.ref})` : ''}` }));
    say(linked ? 'Booked. We will remind you 24 hours and 1 hour before.' : `Request sent. ${doc.name} will confirm shortly.`);
    onDone();
  };

  const confirm = async () => {
    if (mode !== 'online') return book(null);
    // Check the slot before taking money, then book as soon as Paystack confirms.
    const live = slotsFor(doc, parse(date), s.appts).find(x => x.t === time);
    if (!live || live.taken) { setTime(''); return say('Sorry, that slot was just taken. Please pick another time.'); }
    setPaying(true);
    try {
      await payWithPaystack({
        email: s.session.email, amountNaira: doc.fee,
        onSuccess: ref => { setPaying(false); book({ ref, amount: doc.fee, at: Date.now(), provider: 'paystack' }); },
        onClose: () => { setPaying(false); say('Payment cancelled. Your slot is not booked yet.'); }
      });
    } catch (ex) { setPaying(false); say(ex.message); }
  };

  return (
    <div className="max-w-2xl">
      <button onClick={onBack} className="text-sm text-muted underline mb-4">Back to doctors</button>
      <Card className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display font-extrabold text-2xl">{doc.name}</h2>
            <p className="text-muted">{doc.title} · {doc.clinic}, {doc.area}</p>
          </div>
          <Pill tone="ok">Verified</Pill>
        </div>
        <p className="mt-3 text-sm">{doc.bio}</p>
        <p className="mt-2 text-sm"><b>{naira(doc.fee)}</b> <span className="text-muted">per visit</span></p>

        <h3 className="font-semibold mt-6 mb-2">Pick a day</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map(d => {
            const open = slotsFor(doc, d, s.appts).filter(x => !x.taken).length;
            const on = ymd(d) === date;
            return (
              <button key={ymd(d)} disabled={!open} onClick={() => { setDate(ymd(d)); setTime(''); }} aria-pressed={on}
                className={`shrink-0 w-16 rounded-xl border py-2 text-center ${on ? 'btn-grad text-brandink border-brand' : 'border-line'} disabled:opacity-35`}>
                <span className="block text-xs">{d.toLocaleDateString('en-GB', { weekday: 'short' })}</span>
                <span className="block font-bold text-lg tabular-nums">{d.getDate()}</span>
                <span className="block text-[10px]">{open ? `${open} free` : 'none'}</span>
              </button>
            );
          })}
        </div>

        <h3 className="font-semibold mt-5 mb-2">Pick a time</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map(x => (
            <button key={x.t} disabled={x.taken} onClick={() => setTime(x.t)} aria-pressed={time === x.t}
              className={`rounded-xl border py-2 text-sm tabular-nums ${time === x.t ? 'btn-grad text-brandink border-brand' : 'border-line'} ${x.taken ? 'line-through opacity-35' : ''}`}>{fmtTime(x.t)}</button>
          ))}
        </div>

        {paymentsEnabled && (
          <>
            <h3 className="font-semibold mt-5 mb-2">How would you like to pay?</h3>
            <div className="grid sm:grid-cols-2 gap-2" role="group" aria-label="Payment method">
              {[['online', `Pay ${naira(doc.fee)} now`, 'Card, bank transfer or USSD through Paystack'], ['clinic', 'Pay at the clinic', 'Pay the doctor when you arrive']].map(([k, t, d]) => (
                <button key={k} type="button" onClick={() => setMode(k)} aria-pressed={mode === k}
                  className={`rounded-xl border p-3 text-left ${mode === k ? 'btn-grad text-brandink border-brand' : 'border-line'}`}>
                  <span className="block font-semibold text-sm">{t}</span><span className="block text-xs opacity-80">{d}</span>
                </button>
              ))}
            </div>
          </>
        )}
        {!paymentsEnabled && <p className="mt-4 text-xs text-muted">Pay the visit fee at the clinic.</p>}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Btn disabled={!time || paying} onClick={confirm}>{paying ? 'Waiting for payment…' : mode === 'online' ? `Pay ${naira(doc.fee)} and ${linked ? 'book' : 'request'}` : linked ? 'Confirm booking' : 'Request booking'}</Btn>
          <p className="text-sm text-muted">{linked ? 'Your own doctor confirms automatically.' : 'New patients need the doctor’s approval.'}</p>
        </div>
      </Card>
    </div>
  );
}

export default Booking;
