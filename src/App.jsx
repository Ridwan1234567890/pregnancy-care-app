/**
 * FILE GUIDE: Main application shell: coordinates shared state, session/user role, and which major screen is displayed.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { ADMIN_EMAILS } from './lib/config';
import { hashPw, decodeJwt, validEmail, strongPw } from './lib/security';
import { useStore } from './lib/store';
import { useTracked, clearBack, goBack, useCanGoBack } from './lib/back';

// AdminApp: reusable function/value declared for use in this module.
const AdminApp = lazy(() => import('./features/admin/AdminApp'));
// LoginPage: reusable function/value declared for use in this module.
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
// SignupPage: reusable function/value declared for use in this module.
const SignupPage = lazy(() => import('./features/auth/SignupPage'));
// DoctorApp: reusable function/value declared for use in this module.
const DoctorApp = lazy(() => import('./features/doctor/DoctorApp'));
// PatientApp: reusable function/value declared for use in this module.
const PatientApp = lazy(() => import('./features/patient/PatientApp'));

// Function/component: the code below runs when this function is called.
export function PageLoader() {
  return (
    <div className="grid place-items-center py-24" role="status" aria-label="Loading">
      <svg className="beat-heart" style={{ '--bt': '.9s' }} width="34" height="34" viewBox="0 0 24 24" fill="var(--accent)" aria-hidden="true"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
    </div>
  );
}

// Function/component: the code below runs when this function is called.
function App() {
  const [s, setS] = useStore();
  const [page, setPage] = useTracked('login');
  const canBack = useCanGoBack();
  const [toast, setToast] = useState('');
  useEffect(() => {
    // After the first screen is up, quietly fetch the sign-up screen so switching to it is instant.
    const run = () => import('./features/auth/SignupPage');
    const id = window.requestIdleCallback ? window.requestIdleCallback(run) : setTimeout(run, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : clearTimeout(id));
  }, []);
  const say = m => { setToast(m); setTimeout(() => setToast(''), 4500); };

  const accounts = s.accounts || {};
  const acct = s.session ? accounts[s.session.email] : null;
  const session = acct ? { email: acct.email, role: acct.role } : null;

  const noAccount = () => Object.assign(new Error('No account found for this email. Please sign up first.'), { code: 'no_account' });
  const go = p => { setPage(p); window.scrollTo(0, 0); };
  const logout = () => { setS(p => ({ ...p, session: null })); setPage('login'); clearBack(); };
  // Each login or logout starts a fresh back history.
  useEffect(() => { clearBack(); }, [session ? session.email : '']);

  /* account actions */
  const roleFor = (email, role) => (ADMIN_EMAILS.includes(email) ? 'admin' : role);
  const doctorFromCode = code => {
    const d = (s.doctors || []).find(x => x.code === (code || '').trim().toUpperCase());
    if (!d) throw new Error('That clinic code does not match a doctor.');
    if (Object.values(accounts).some(a => a.doctorId === d.id)) throw new Error('This doctor profile already has an account. Log in instead.');
    return d;
  };
  const auth = {
    async signup({ name, email, pw, role, code }) {
      email = email.trim().toLowerCase(); name = name.trim();
      if (!name) throw new Error('Enter your full name.');
      if (!validEmail(email)) throw new Error('Enter a valid email address.');
      if (!strongPw(pw)) throw new Error('Use at least 8 characters, with a letter and a number.');
      if (accounts[email]) throw new Error('An account with this email already exists. Log in instead.');
      const r = roleFor(email, role);
      const d = r === 'doctor' ? doctorFromCode(code) : null;
      const { salt, hash } = await hashPw(pw);
      setS(p => ({ ...p, accounts: { ...(p.accounts || {}), [email]: { email, name, role: r, salt, hash, doctorId: d ? d.id : null, created: Date.now() } }, session: { email } }));
      window.scrollTo(0, 0);
    },
    async login(email, pw) {
      email = email.trim().toLowerCase();
      const a = accounts[email];
      if (!a) throw noAccount();
      if (!a.hash) throw new Error('This account uses Google. Use Continue with Google.');
      const { hash } = await hashPw(pw, a.salt);
      if (hash !== a.hash) throw new Error('Email or password is incorrect.');
      setS(p => ({ ...p, session: { email } }));
      window.scrollTo(0, 0);
    },
    async google(credential, mode, role, code) {
      let c;
      try { c = decodeJwt(credential); } catch (e) { throw new Error('Google sign-in failed. Please try again.'); }
      if (!c.email || c.email_verified === false) throw new Error('Google did not return a verified email address.');
      const email = c.email.toLowerCase();
      if (accounts[email]) { setS(p => ({ ...p, session: { email } })); window.scrollTo(0, 0); return; }
      if (mode === 'login') throw noAccount();
      const r = roleFor(email, role || 'patient');
      const d = r === 'doctor' ? doctorFromCode(code) : null;
      setS(p => ({ ...p, accounts: { ...(p.accounts || {}), [email]: { email, name: c.name || email.split('@')[0], role: r, provider: 'google', doctorId: d ? d.id : null, created: Date.now() } }, session: { email } }));
      window.scrollTo(0, 0);
    }
  };

  // Each account gets its own mother profile: due date, doctor links and bookings.
  const mine = acct ? ((s.users || {})[acct.email] || {}) : {};
  const view = { ...s, session, me: mine.me || null, onboarded: !!mine.onboarded, acctName: acct ? acct.name : '' };

  return (
    <div className="min-h-screen">
      <Header session={session} page={page} onNav={go} onLogout={logout} />
      <main className="gutter">
        {canBack && (
          <div className="max-w-5xl mx-auto pt-4">
            <button onClick={goBack} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-1.5 text-sm font-semibold hover:bg-soft">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>Back
            </button>
          </div>
        )}
        <Suspense fallback={<PageLoader />}>
        {!session && (page === 'signup' ? <SignupPage auth={auth} go={go} /> : <LoginPage auth={auth} go={go} />)}
        {session && session.role === 'patient' && <PatientApp s={view} setS={setS} say={say} />}
        {session && session.role === 'doctor' && <DoctorApp s={s} setS={setS} say={say} doctorId={acct.doctorId} />}
        {session && session.role === 'admin' && <AdminApp s={s} setS={setS} email={session.email} />}
      </Suspense>
      </main>
      {toast && (
        <div role="status" className="toast-in fixed left-1/2 -translate-x-1/2 bg-ink text-bg rounded-full px-5 py-3 text-sm font-semibold shadow-lg max-w-[90vw] z-40"
          style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>{toast}</div>
      )}
    </div>
  );
}

export default App;
