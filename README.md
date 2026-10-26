# Pregnant Care

## Run it
```
npm install
npm run dev
```
Open the address Vite prints (usually http://localhost:5173).

## Turn on Continue with Google
The button stays hidden until you add a Google Client ID. Google issues this ID to your own account, so it has to come from you:

1. Go to https://console.cloud.google.com and create or pick a project.
2. APIs & Services > OAuth consent screen: set it up (External, add your email).
3. APIs & Services > Credentials > Create credentials > OAuth client ID > Web application.
4. Under Authorized JavaScript origins add `http://localhost:5173` (and your real domain later).
5. Copy `.env.example` to `.env` and paste the Client ID after `VITE_GOOGLE_CLIENT_ID=`.
6. Stop and restart `npm run dev` (Vite only reads .env at start).

## Turn on online payment (Paystack)
1. Create an account at https://paystack.com and copy your **public** key (Settings > API Keys). Use `pk_test_...` while testing.
2. Put it in `.env` as `VITE_PAYSTACK_PUBLIC_KEY=` and restart `npm run dev`.
3. Mothers now see "Pay ₦X now" or "Pay at the clinic" when booking. Paid visits show a "Paid online" tag for the mother, doctor and admin, and the admin overview totals what was paid.
Without a key, the pay-online option is hidden.

Important: this version has no server, so payments are not verified server-side. Before taking real money, add a small backend that calls Paystack's verify endpoint with your **secret** key, and never put the secret key in this project.

## Admin and doctors
Set `VITE_ADMIN_EMAILS` in `.env` (comma-separated). Anyone who signs up with one of those emails becomes Admin.
The app starts with the 5 original doctors (see `src/lib/doctors.js`, with their clinic codes). More can be added from Admin > Doctors > Add a doctor. A clinic code is generated; give it to the doctor so they can sign up on the Doctor option.

## Data
Accounts, bookings and notices start empty. Everything is saved in the browser (localStorage key `pregnant-care-fresh-v1`), so each browser starts clean.

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
