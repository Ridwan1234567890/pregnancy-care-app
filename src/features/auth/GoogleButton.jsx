/**
 * FILE GUIDE: Google sign-in UI and identity-script handling.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useEffect, useRef } from 'react';
import { GOOGLE_CLIENT_ID } from '../../lib/config';

// Shows Google's own "Continue with Google" button once GOOGLE_CLIENT_ID is set.
// Function/component: the code below runs when this function is called.
export function GoogleButton({ onCredential, onError }) {
  const box = useRef(null);
  const cb = useRef(onCredential); cb.current = onCredential;
  const er = useRef(onError); er.current = onError;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let dead = false;
    const init = () => {
      if (dead || !window.google || !window.google.accounts || !box.current) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: r => cb.current(r.credential) });
      window.google.accounts.id.renderButton(box.current, { type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width: Math.min(400, box.current.offsetWidth || 320) });
    };
    if (window.google && window.google.accounts) init();
    else {
      let sc = document.getElementById('gsi-client');
      if (!sc) { sc = document.createElement('script'); sc.id = 'gsi-client'; sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; document.head.appendChild(sc); }
      sc.addEventListener('load', init);
      sc.addEventListener('error', () => er.current('Could not load Google sign-in. Check your connection and try again.'));
    }
    return () => { dead = true; };
  }, []);

  if (!GOOGLE_CLIENT_ID) return (
    <button type="button" onClick={() => er.current('Google sign-in is not set up yet. Add your Google Client ID to the .env file (see README).')}
      className="w-full flex items-center justify-center gap-3 rounded-full border border-line py-2.5 text-sm font-semibold hover:bg-soft">
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.2 5.6c4.3-3.9 7.1-9.7 7.1-17.1z"/><path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.2-5.6c-2 1.4-4.6 2.2-8.7 2.2-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>
      Continue with Google
    </button>
  );

  return <div ref={box} className="flex justify-center min-h-[44px]"></div>;
}

export default GoogleButton;
