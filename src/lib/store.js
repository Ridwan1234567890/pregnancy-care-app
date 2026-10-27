/**
 * FILE GUIDE: Shared application data, backed by Firebase Auth and Cloud Firestore.
 * The screens still read `s` and call `setS(p => ...)`. setS works out which documents changed and writes only those,
 * and live Firestore listeners feed the result back into `s`, so every device sees the same data.
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where, writeBatch } from 'firebase/firestore';
import { auth, db } from './firebaseClient';
import { DOCTORS } from './doctors';
import { ADMIN_EMAILS } from './config';
import { validEmail, strongPw } from './security';

export const emptyState = () => ({ accounts: {}, doctors: [], users: {}, notices: [], links: [], appts: [], busy: [], auditLog: [] });

// Firestore rejects `undefined`, so every document goes through this first.
const clean = o => JSON.parse(JSON.stringify(o));
const arr = snap => snap.docs.map(d => d.data());
const byId = snap => Object.fromEntries(snap.docs.map(d => [d.id, d.data()]));
const newestFirst = list => [...list].sort((a, b) => (b.at || 0) - (a.at || 0));

const linkId = l => `${l.patientId}__${l.doctorId}`;
const slotId = a => `${a.doctorId}_${a.date}_${a.time}`;
const isMarker = a => String(a.id).startsWith('busy:');
const slotIsTaken = a => !['cancelled', 'declined'].includes(a.status);

// Writes only the documents that differ between the old and the new state.
async function push(cur, next) {
  const batch = writeBatch(db);
  let n = 0;
  const diff = (col, a, b, idOf, canDelete, prep = x => x) => {
    const A = new Map(a.map(x => [idOf(x), x]));
    const B = new Map(b.map(x => [idOf(x), x]));
    B.forEach((x, id) => { const o = A.get(id); if (!o || JSON.stringify(o) !== JSON.stringify(x)) { batch.set(doc(db, col, id), clean(prep(x))); n++; } });
    if (canDelete) A.forEach((x, id) => { if (!B.has(id)) { batch.delete(doc(db, col, id)); n++; } });
  };
  const own = list => (list || []).filter(a => !isMarker(a));
  const asList = o => Object.entries(o || {}).map(([id, v]) => ({ ...v, __id: id }));
  const stripId = x => { const { __id, ...rest } = x; return rest; };

  const curAppts = own(cur.appts), nextAppts = own(next.appts);
  diff('appts', curAppts, nextAppts, a => a.id, true);
  // A small public "slot is taken" marker lets other mothers see availability without seeing who booked.
  const before = new Map(curAppts.map(a => [a.id, a]));
  nextAppts.forEach(a => {
    const o = before.get(a.id);
    if (o && o.status === a.status && o.date === a.date && o.time === a.time) return;
    if (slotIsTaken(a)) batch.set(doc(db, 'busy', slotId(a)), { doctorId: a.doctorId, date: a.date, time: a.time });
    else batch.delete(doc(db, 'busy', slotId(a)));
    n++;
  });
  const after = new Set(nextAppts.map(a => a.id));
  curAppts.forEach(a => { if (!after.has(a.id)) { batch.delete(doc(db, 'busy', slotId(a))); n++; } });

  diff('links', cur.links || [], next.links || [], linkId, true);
  diff('notices', cur.notices || [], next.notices || [], x => x.id, false);
  diff('auditLog', cur.auditLog || [], next.auditLog || [], x => x.id, false);
  diff('doctors', cur.doctors || [], next.doctors || [], x => x.id, false);
  diff('users', asList(cur.users), asList(next.users), x => x.__id, false, stripId);

  if (n) await batch.commit();
}

const noAccount = () => Object.assign(new Error('No account found for this email. Please sign up first.'), { code: 'no_account' });

const authError = e => {
  const c = (e && e.code) || '';
  if (c === 'auth/email-already-in-use') return new Error('An account with this email already exists. Log in instead.');
  if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found', 'auth/invalid-login-credentials'].includes(c)) return new Error('Email or password is incorrect.');
  if (c === 'auth/too-many-requests') return new Error('Too many attempts. Wait a moment and try again.');
  if (c === 'auth/network-request-failed') return new Error('Network problem. Check your connection and try again.');
  if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return new Error('Google sign-in was cancelled.');
  if (c === 'auth/popup-blocked') return new Error('Your browser blocked the Google pop-up. Allow pop-ups and try again.');
  if (c === 'auth/unauthorized-domain') return new Error('This website address is not allowed for sign-in yet. Add it under Firebase > Authentication > Settings > Authorized domains.');
  if (c === 'auth/operation-not-allowed') return new Error('This sign-in method is not turned on in Firebase > Authentication > Sign-in method.');
  return e instanceof Error ? e : new Error('Something went wrong. Please try again.');
};

async function findDoctor(code) {
  const c = (code || '').trim().toUpperCase();
  if (!c) throw new Error('Enter the clinic code your clinic gave you.');
  const snap = await getDocs(query(collection(db, 'doctors'), where('code', '==', c)));
  if (snap.empty) throw new Error('That clinic code does not match a doctor. If the app was just set up, an admin must log in once first.');
  return snap.docs[0].data();
}

async function createAccount(email, { name, role, code, provider }) {
  const batch = writeBatch(db);
  let doctorId = null;
  if (role === 'doctor') {
    const d = await findDoctor(code);
    doctorId = d.id;
    batch.set(doc(db, 'doctorAccounts', d.id), { email, code: d.code });
  }
  batch.set(doc(db, 'accounts', email), clean({ email, name, role, doctorId, provider, created: Date.now() }));
  try { await batch.commit(); }
  catch (e) {
    if (role === 'doctor' && e && e.code === 'permission-denied') throw new Error('This doctor profile already has an account. Log in instead.');
    throw e;
  }
}

// Removes a half-created sign-in so a failed sign-up does not leave a stray login behind.
const discard = async user => { try { await user.delete(); } catch (e) { await signOut(auth).catch(() => {}); } };

const authApi = {
  async signup({ name, email, pw, role, code }) {
    email = email.trim().toLowerCase(); name = name.trim();
    if (!name) throw new Error('Enter your full name.');
    if (!validEmail(email)) throw new Error('Enter a valid email address.');
    if (!strongPw(pw)) throw new Error('Use at least 8 characters, with a letter and a number.');
    if (ADMIN_EMAILS.includes(email)) throw new Error('Admin accounts must sign in with Google. Use Continue with Google.');
    let cred;
    try { cred = await createUserWithEmailAndPassword(auth, email, pw); } catch (e) { throw authError(e); }
    try { await createAccount(email, { name, role, code, provider: 'password' }); }
    catch (e) { await discard(cred.user); throw authError(e); }
    window.scrollTo(0, 0);
  },
  async login(email, pw) {
    email = email.trim().toLowerCase();
    let cred;
    try { cred = await signInWithEmailAndPassword(auth, email, pw); } catch (e) { throw authError(e); }
    const a = await getDoc(doc(db, 'accounts', email));
    if (!a.exists()) { await signOut(auth); throw noAccount(); }
    window.scrollTo(0, 0);
  },
  async google(mode, role, code) {
    let cred;
    try { cred = await signInWithPopup(auth, new GoogleAuthProvider()); } catch (e) { throw authError(e); }
    const email = (cred.user.email || '').toLowerCase();
    const a = await getDoc(doc(db, 'accounts', email));
    if (a.exists()) { window.scrollTo(0, 0); return; }
    if (mode === 'login') { await discard(cred.user); throw noAccount(); }
    const r = ADMIN_EMAILS.includes(email) ? 'admin' : (role || 'patient');
    try { await createAccount(email, { name: cred.user.displayName || email.split('@')[0], role: r, code, provider: 'google' }); }
    catch (e) { await discard(cred.user); throw authError(e); }
    window.scrollTo(0, 0);
  },
  logout: () => signOut(auth)
};

export function useStore() {
  const [user, setUser] = useState(undefined); // undefined = still checking, null = signed out
  const [acct, setAcct] = useState(undefined); // undefined = still loading, null = no account yet
  const [data, setData] = useState(emptyState);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [error, setError] = useState('');
  const email = user ? (user.email || '').toLowerCase() : null;
  const fail = e => { console.error(e); setError(e && e.code === 'permission-denied' ? 'Firestore refused that. Check that the security rules are published.' : (e && e.message) || 'Could not reach the database.'); };

  useEffect(() => onAuthStateChanged(auth, u => setUser(u || null)), []);

  // The account document decides who the person is and which role they have.
  useEffect(() => {
    if (!email) { setAcct(user === undefined ? undefined : null); setData(emptyState()); setDocsLoaded(false); return; }
    setAcct(undefined);
    return onSnapshot(doc(db, 'accounts', email), snap => setAcct(snap.exists() ? snap.data() : null), e => { fail(e); setAcct(null); });
  }, [email, user === undefined]);

  // Each role only listens to the data it is allowed to read.
  const role = acct ? acct.role : null;
  const doctorId = acct ? acct.doctorId : null;
  useEffect(() => {
    if (!role) return;
    const put = (key, val) => setData(d => ({ ...d, [key]: val }));
    const subs = [];
    const watch = (ref, fn) => subs.push(onSnapshot(ref, fn, fail));
    watch(collection(db, 'doctors'), snap => { put('doctors', arr(snap)); setDocsLoaded(true); });
    if (role === 'patient') {
      watch(doc(db, 'users', email), snap => put('users', snap.exists() ? { [email]: snap.data() } : {}));
      watch(query(collection(db, 'links'), where('patientId', '==', email)), snap => put('links', arr(snap)));
      watch(query(collection(db, 'appts'), where('patientId', '==', email)), snap => put('appts', arr(snap)));
      watch(collection(db, 'busy'), snap => put('busy', snap.docs.map(d => ({ ...d.data(), id: d.id }))));
    } else if (role === 'doctor') {
      watch(query(collection(db, 'links'), where('doctorId', '==', doctorId)), snap => put('links', arr(snap)));
      watch(query(collection(db, 'appts'), where('doctorId', '==', doctorId)), snap => put('appts', arr(snap)));
    } else if (role === 'admin') {
      watch(collection(db, 'accounts'), snap => put('accounts', byId(snap)));
      watch(collection(db, 'users'), snap => put('users', byId(snap)));
      watch(collection(db, 'links'), snap => put('links', arr(snap)));
      watch(collection(db, 'appts'), snap => put('appts', arr(snap)));
      watch(collection(db, 'notices'), snap => put('notices', newestFirst(arr(snap))));
      watch(collection(db, 'auditLog'), snap => put('auditLog', newestFirst(arr(snap)).slice(0, 500)));
    }
    return () => subs.forEach(u => u());
  }, [role, doctorId, email]);

  // A doctor reads the profile (name, due date) of every mother linked to them or booked with them.
  const patientIds = useMemo(() => (role === 'doctor' ? [...new Set([...data.links.map(l => l.patientId), ...data.appts.map(a => a.patientId)])].sort().join('|') : ''), [role, data.links, data.appts]);
  useEffect(() => {
    if (!patientIds) return;
    const subs = patientIds.split('|').map(id => onSnapshot(doc(db, 'users', id), snap => { if (snap.exists()) setData(d => ({ ...d, users: { ...d.users, [id]: snap.data() } })); }, fail));
    return () => subs.forEach(u => u());
  }, [patientIds]);

  // First admin login copies the starter doctors into Firestore so their clinic codes work for sign-up.
  useEffect(() => {
    if (role !== 'admin' || !docsLoaded) return;
    const have = new Set(data.doctors.map(d => d.id));
    const missing = DOCTORS.filter(d => !have.has(d.id));
    if (!missing.length) return;
    const batch = writeBatch(db);
    missing.forEach(d => batch.set(doc(db, 'doctors', d.id), clean(d)));
    batch.commit().catch(fail);
  }, [role, docsLoaded, data.doctors]);

  const s = useMemo(() => {
    const known = new Set(data.doctors.map(d => d.id));
    const doctors = [...data.doctors, ...DOCTORS.filter(d => !known.has(d.id))];
    // Other mothers' bookings show up only as "slot taken" markers.
    const markers = role === 'patient' ? data.busy.map(b => ({ id: 'busy:' + b.id, doctorId: b.doctorId, date: b.date, time: b.time, status: 'confirmed' })) : [];
    return { ...data, doctors, appts: [...data.appts, ...markers] };
  }, [data, role]);
  const sRef = useRef(s); sRef.current = s;

  const setS = useCallback(fn => {
    const cur = sRef.current;
    const next = typeof fn === 'function' ? fn(cur) : fn;
    sRef.current = next;
    push(cur, next).catch(e => { console.error(e); setError('Could not save that. Check your connection and the Firestore rules.'); });
  }, []);

  const ready = user !== undefined && (user === null || acct !== undefined);
  return { s, setS, acct: acct || null, ready, error, clearError: () => setError(''), auth: authApi };
}

// Adds a notice for the admin. Used inside setS(p => ...).
export const addNotice = (st, n) => ({ ...st, notices: [{ id: 'n' + Date.now() + Math.random().toString(36).slice(2, 6), at: Date.now(), read: false, ...n }, ...(st.notices || [])] });
