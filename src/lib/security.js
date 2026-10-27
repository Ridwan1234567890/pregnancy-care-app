/**
 * FILE GUIDE: Client-side validation helpers. Passwords are handled by Firebase Auth, never stored by this app.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// validEmail: reusable function/value declared for use in this module.
export const validEmail = e => /^\S+@\S+\.\S+$/.test(e);

// strongPw: reusable function/value declared for use in this module.
export const strongPw = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
