/**
 * FILE GUIDE: Login form, validation, and sign-in flow.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Btn, Field, inputCls } from '../../components/ui';
import { PasswordField } from './AuthParts';
import { AuthShell } from './AuthShell';
import { pregnancy } from '../../lib/pregnancy';

// Function/component: the code below runs when this function is called.
export function LoginPage({ auth, go }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [needSignup, setNeedSignup] = useState(false);
  const fail = ex => { setErr(ex.message); setNeedSignup(ex.code === 'no_account'); };

  const submit = async e => {
    e.preventDefault(); setErr(''); setNeedSignup(false);
    if (!email.trim() || !pw) return setErr('Enter your email and password.');
    setBusy(true);
    try { await auth.login(email, pw); } catch (ex) { fail(ex); }
    setBusy(false);
  };

  return (
    <AuthShell eyebrow="Welcome back" title="Pick up where your last visit left off." blurb="Log in to see your pregnancy week, upcoming appointments and visit notes.">
      <h2 className="font-display font-bold text-2xl mb-4">Log in</h2>
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <Field label="Email address" id="login-email"><input id="login-email" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} /></Field>
        <PasswordField id="login-pw" label="Password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="current-password" />
        {err && <p role="alert" className="text-sm text-accent">{err}{needSignup && <> <button type="button" onClick={() => go('signup')} className="font-semibold underline">Sign up now</button></>}</p>}
        <Btn type="submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</Btn>
        <p className="text-sm text-muted text-center">New here? <button type="button" onClick={() => go('signup')} className="text-brand font-semibold underline">Create an account</button></p>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
