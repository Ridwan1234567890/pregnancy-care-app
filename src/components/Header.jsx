/**
 * FILE GUIDE: Shared header/navigation component.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { Pill } from './ui';

// Function/component: the code below runs when this function is called.
export function Header({ session, page, onNav, onLogout }) {
  const roleName = { patient: 'Mother', doctor: 'Doctor', admin: 'Admin' };
  return (
    <header className="hdr gutter border-b border-line">
      <div className="max-w-5xl mx-auto py-3 flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2 min-w-0">
          {session ? (
            <>
              <span className="hidden sm:block text-sm text-muted truncate max-w-[220px]">{session.email}</span>
              <Pill>{roleName[session.role]}</Pill>
              <button onClick={onLogout} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:bg-soft">Log out</button>
            </>
          ) : (
            <>
              <button onClick={() => onNav('login')} aria-current={page === 'login'} className={`rounded-full px-4 py-2 text-sm font-semibold ${page === 'login' ? 'bg-soft text-brand' : 'border border-line hover:bg-soft'}`}>Log in</button>
              <button onClick={() => onNav('signup')} aria-current={page === 'signup'} className="rounded-full btn-grad text-brandink px-4 py-2 text-sm font-semibold hover:opacity-90">Sign up</button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default Header;
