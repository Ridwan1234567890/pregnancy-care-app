/**
 * FILE GUIDE: Signup form, password checks, and initial account/profile creation.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Btn, Field, inputCls } from '../../components/ui';
import { PasswordField } from './AuthParts';
import { AuthShell } from './AuthShell';
import { ADMIN_EMAILS } from '../../lib/config';

// Function/component: the code below runs when this function is called.
export function SignupPage({ auth, go }) {
  const [f, setF] = useState({ name: '', email: '', pw: '', pw2: '', role: 'patient', code: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const isAdmin = ADMIN_EMAILS.includes(f.email.trim().toLowerCase());

  const submit = async e => {
    e.preventDefault(); setErr('');
    if (f.pw !== f.pw2) return setErr('The two passwords do not match.');
    setBusy(true);
    try { await auth.signup(f); } catch (ex) { setErr(ex.message); }
    setBusy(false);
  };

  return (
    <AuthShell eyebrow="Antenatal care, from the first scan to delivery" title="Keep the same doctor for all 40 weeks." blurb="Create a free account to book verified doctors and keep every visit and scan in one timeline.">
      <h2 className="font-display font-bold text-2xl mb-4">Create your account</h2>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        {!isAdmin && (
          <div>
            <p className="text-sm font-medium mb-1.5">I am a</p>
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Account type">
              {[['patient', 'Mother'], ['doctor', 'Doctor']].map(([k, l]) => (
                <button type="button" key={k} onClick={() => setF({ ...f, role: k })} aria-pressed={f.role === k}
                  className={`rounded-xl border py-2.5 text-sm font-semibold ${f.role === k ? 'btn-grad text-brandink border-transparent' : 'border-line'}`}>{l}</button>
              ))}
            </div>
          </div>
        )}
        {f.role === 'doctor' && !isAdmin && (
          <Field label="Clinic code" id="su-code">
            <input id="su-code" value={f.code} onChange={set('code')} placeholder="The code your clinic gave you" className={inputCls} autoCapitalize="characters" />
          </Field>
        )}
        <Field label="Full name" id="su-name"><input id="su-name" autoComplete="name" value={f.name} onChange={set('name')} placeholder="e.g. Amara Obi" className={inputCls} /></Field>
        <Field label="Email address" id="su-email"><input id="su-email" type="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder="you@example.com" className={inputCls} /></Field>
        <PasswordField id="su-pw" label="Password" value={f.pw} onChange={set('pw')} autoComplete="new-password" hint="At least 8 characters, with a letter and a number." />
        <PasswordField id="su-pw2" label="Confirm password" value={f.pw2} onChange={set('pw2')} autoComplete="new-password" />
        {err && <p role="alert" className="text-sm text-accent">{err}</p>}
        <Btn type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</Btn>
        <p className="text-sm text-muted text-center">Already have an account? <button type="button" onClick={() => go('login')} className="text-brand font-semibold underline">Log in</button></p>
      </form>
    </AuthShell>
  );
}

export default SignupPage;
