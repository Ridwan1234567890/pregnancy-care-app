/**
 * FILE GUIDE: Collects initial patient profile information.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Btn, Field, inputCls } from '../../components/ui';
import { ymd, addDays, today0 } from '../../lib/format';

// Function/component: the code below runs when this function is called.
// Onboarding is now a single step: collect the profile, then go straight to the Find a doctor tab.
// (A brand-new user cannot have a doctor yet; linking a clinic code is still available on the home tab.)
export function Onboarding({ s, setS, say, goFind }) {
  const email = s.session.email;
  const [form, setForm] = useState(
    s.me
      ? { name: s.me.name, lmp: s.me.lmp, location: s.me.location }
      : { name: s.acctName || '', lmp: ymd(addDays(today0(), -18 * 7)), location: 'Ilorin, Kwara' }
  );
  const set = k => e => setForm({ ...form, [k]: e.target.value });

  const saveProfile = e => {
    e.preventDefault();
    if (!form.name.trim()) return say('Please enter your name.');
    setS(p => {
      const mine = (p.users || {})[email] || {};
      return { ...p, users: { ...(p.users || {}), [email]: { ...mine, me: { id: email, ...form, name: form.name.trim() }, onboarded: true } } };
    });
    goFind();
  };

  return (
    <div className="max-w-lg mx-auto py-10 rise">
      <form onSubmit={saveProfile} className="grid gap-5">
        <h1 className="font-display font-extrabold text-3xl">Tell us about you</h1>
        <Field label="Your name" id="name"><input id="name" value={form.name} onChange={set('name')} placeholder="e.g. Amara Obi" className={inputCls} /></Field>
        <Field label="First day of your last period" id="lmp"><input id="lmp" type="date" value={form.lmp} onChange={set('lmp')} max={ymd(today0())} className={inputCls} /></Field>
        <p className="-mt-3 text-xs text-muted">We use this to work out your pregnancy week and due date. Change the date to your own.</p>
        <Field label="Where are you based?" id="loc"><input id="loc" value={form.location} onChange={set('location')} className={inputCls} /></Field>
        <Btn type="submit">Find a doctor</Btn>
      </form>
    </div>
  );
}

export default Onboarding;
