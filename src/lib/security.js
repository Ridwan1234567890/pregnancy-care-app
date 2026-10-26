/**
 * FILE GUIDE: Client-side validation/hash helpers and Google-token payload decoding.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// Passwords are salted and hashed with PBKDF2 before they are saved, so the plain password is never stored.
// This still lives in this browser only. A real build keeps accounts on a server.
// b64: reusable function/value declared for use in this module.
export const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));

// unb64: reusable function/value declared for use in this module.
export const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

export async function hashPw(pw, saltB64) {
  if (!(window.crypto && window.crypto.subtle)) throw new Error('This browser cannot hash passwords safely. Open the page over https.');
  const salt = saltB64 ? unb64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, key, 256);
  return { salt: b64(salt), hash: b64(bits) };
}

// Reads the profile out of the token Google returns. A real build verifies the token on the server.
// decodeJwt: reusable function/value declared for use in this module.
export const decodeJwt = t => {
  const p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p), c => c.charCodeAt(0))));
};

// validEmail: reusable function/value declared for use in this module.
export const validEmail = e => /^\S+@\S+\.\S+$/.test(e);

// strongPw: reusable function/value declared for use in this module.
export const strongPw = p => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
