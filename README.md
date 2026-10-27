# Pregnant Care

## Run it
```
npm install
npm run dev
```
Open the address Vite prints (usually http://localhost:5173).

## Firebase (accounts and all data)
Sign-in and every record (profiles, links, bookings, notices, the access log) live in Firebase, so all devices see the same data.

1. Copy `.env.example` to `.env` and fill in the `VITE_FIREBASE_*` values (Firebase Console > Project settings > Your apps > Web app). On Vercel, add the same variables and redeploy.
2. Firebase Console > Authentication > Sign-in method: turn on **Email/Password** and **Google**.
3. Authentication > Settings > Authorized domains: add your Vercel domain (localhost is already there).
4. Build > Firestore Database: create the database.
5. Publish the security rules: `npx firebase-tools deploy --only firestore:rules` (or paste `firestore.rules` into Firestore > Rules > Publish). Without this nobody can read or write anything.
6. Sign in once with the admin Google account. That copies the starter doctors into Firestore so their clinic codes work for doctor sign-up.

Admins must use Continue with Google. Keep `VITE_ADMIN_EMAILS` and the `adminEmails()` list in `firestore.rules` the same, because the rules are what really enforce admin access.

## Turn on online payment (Paystack)
1. Create an account at https://paystack.com and copy your **public** key (Settings > API Keys). Use `pk_test_...` while testing.
2. Put it in `.env` as `VITE_PAYSTACK_PUBLIC_KEY=` and restart `npm run dev`.
3. Mothers now see "Pay ₦X now" or "Pay at the clinic" when booking. Paid visits show a "Paid online" tag for the mother, doctor and admin, and the admin overview totals what was paid.
Without a key, the pay-online option is hidden.

Important: this version has no server, so payments are not verified server-side. Before taking real money, add a small backend that calls Paystack's verify endpoint with your **secret** key, and never put the secret key in this project.

## Admin and doctors
Set `VITE_ADMIN_EMAILS` in `.env` (comma-separated) and the same list in `firestore.rules`. Those emails become Admin when they sign up with Google.
The app starts with the 5 original doctors (see `src/lib/doctors.js`, with their clinic codes). More can be added from Admin > Doctors > Add a doctor. A clinic code is generated; give it to the doctor so they can sign up on the Doctor option.

## Data
Accounts, bookings and notices start empty and are stored in Cloud Firestore (collections: accounts, doctors, doctorAccounts, users, links, appts, busy, notices, auditLog).

## Project layout
```
src/
  main.jsx, App.jsx          app shell, lazy-loads each screen
  lib/                       config, dates, pregnancy maths, slots, security, storage, lookups
  components/                shared UI: Card, Btn, Pill, Tabs, WeekRing, Logo, Header, ThemeToggle
  features/auth/             LoginPage, SignupPage, EcgMonitor, GoogleButton, AuthShell
  features/patient/          PatientApp, Onboarding, Discover, Booking, PatientHome, ...
  features/doctor/           DoctorApp, DoctorSchedule, DoctorPatients, NoteForm
  features/admin/            AdminApp, AdminPatients, AdminPatientDetail, AdminDoctors, AdminLog
```

## Speed
- Each screen is its own chunk (React.lazy). A visitor downloads only the login screen first, then the chunk for their role (mother, doctor or admin) after logging in. The sign-up screen is fetched while the browser is idle.
- React is split into its own cached vendor file.
- Tailwind is compiled at build time (no runtime CDN script), and Babel is gone.
- Fonts load without blocking first paint.
- Saving to localStorage is batched, and the doctor list is memoised.

Check it yourself on a production build:
```
npm run build
npm run preview
```
Then open Chrome DevTools > Lighthouse (or the Network tab with "Fast 4G" throttling) and look at Largest Contentful Paint. It should be well under 3.5 s.
