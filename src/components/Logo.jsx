/**
 * FILE GUIDE: Reusable logo component.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

// Logo: reusable function/value declared for use in this module.
export const Logo = () => (
  <span className="flex items-center gap-2.5 font-display font-extrabold text-lg">
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="11" fill="none" stroke="var(--brand)" strokeWidth="3" />
      <circle className="logo-dot" cx="13" cy="13" r="4.5" fill="var(--accent)" />
    </svg>
    Pregnant Care
  </span>
);

export default Logo;
