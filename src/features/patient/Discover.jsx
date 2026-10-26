/**
 * FILE GUIDE: Doctor discovery, search/filtering, and doctor selection.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useMemo } from 'react';
import { Card, Btn, Pill, inputCls } from '../../components/ui';
import { fmtDate, fmtTime, naira } from '../../lib/format';
import { nextSlot } from '../../lib/slots';

// Function/component: the code below runs when this function is called.
export function Discover({ s, primaryId, onOpen }) {
  const [q, setQ] = useState('');
  const [spec, setSpec] = useState('All');
  const [sort, setSort] = useState('soonest');
  const withSlot = useMemo(() => (s.doctors || []).map(d => ({ ...d, next: nextSlot(d, s.appts) })), [s.appts, s.doctors]);
  let list = withSlot.filter(d => (spec === 'All' || d.title === spec) && (d.name + d.clinic + d.area).toLowerCase().includes(q.toLowerCase()));
  const key = { soonest: d => (d.next ? d.next.date + d.next.t : 'z'), distance: d => d.km ?? 9999, rating: d => -(d.rating || 0), fee: d => d.fee }[sort];
  list = [...list].sort((a, b) => (key(a) > key(b) ? 1 : -1));

  return (
    <div>
      <div className="grid sm:grid-cols-[1fr_auto] gap-3 mb-4">
        <input aria-label="Search doctors" value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name, clinic or area" className={inputCls} />
        <select aria-label="Sort doctors" value={sort} onChange={e => setSort(e.target.value)} className={inputCls}>
          <option value="soonest">Soonest available</option><option value="distance">Nearest</option>
          <option value="rating">Highest rated</option><option value="fee">Lowest fee</option>
        </select>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', 'OB/GYN', 'Midwife', 'Sonographer'].map(x => (
          <button key={x} onClick={() => setSpec(x)} aria-pressed={spec === x}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold border ${spec === x ? 'btn-grad text-brandink border-brand' : 'border-line text-muted'}`}>{x}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {list.map(d => (
          <Card key={d.id} className="p-5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-display font-bold text-xl">{d.name}</h3>
                <p className="text-sm text-muted">{d.title} · {d.clinic}</p>
                <p className="text-sm text-muted">{d.area}{d.km ? ` · ${d.km} km away` : ''}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Pill tone="ok">Verified</Pill>
                {primaryId === d.id && <Pill tone="accent">My doctor</Pill>}
              </div>
            </div>
            <p className="text-sm">{d.bio}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              <span>{d.rating ? <><b>{d.rating}</b> <span className="text-muted">({d.reviews} reviews)</span></> : <span className="text-muted">New on Pregnant Care</span>}</span>
              <span><b>{naira(d.fee)}</b> <span className="text-muted">per visit</span></span>
            </div>
            <div className="mt-auto flex items-center justify-between gap-3 pt-2">
              <p className="text-sm">{d.next ? <>Next free: <b>{fmtDate(d.next.date)}, {fmtTime(d.next.t)}</b></> : <span className="text-muted">No free slots soon</span>}</p>
              <Btn onClick={() => onOpen(d.id)} className="shrink-0">View and book</Btn>
            </div>
          </Card>
        ))}
        {list.length === 0 && <p className="text-muted">{(s.doctors || []).length ? 'No doctors match. Try a different search.' : 'No doctors have joined yet. Please check back soon.'}</p>}
      </div>
    </div>
  );
}

export default Discover;
