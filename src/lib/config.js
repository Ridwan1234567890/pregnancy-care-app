/**
 * FILE GUIDE: Environment configuration and demo admin-email settings.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// Admin emails: must match the list in firestore.rules, which is what actually enforces admin access (and requires Google sign-in).
// ADMIN_EMAILS: named value used by the code below.
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'aremuridwanullah@gmail.com').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

// Paystack public key (starts with pk_test_ or pk_live_). While it is empty, online payment is hidden and visits are paid at the clinic.
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
