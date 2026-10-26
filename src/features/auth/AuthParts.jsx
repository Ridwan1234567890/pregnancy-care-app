/**
 * FILE GUIDE: Reusable authentication UI pieces, including password visibility and dividers.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { useState } from 'react';
import { Field, inputCls } from '../../components/ui';

// OrDivider: reusable function/value declared for use in this module.
export const OrDivider = () => (
  <div className="flex items-center gap-3 text-xs text-muted" role="separator"><span className="h-px flex-1 bg-line"></span>or<span className="h-px flex-1 bg-line"></span></div>
);

// Function/component: the code below runs when this function is called.
export function PasswordField({ id, label, value, onChange, autoComplete, hint }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} id={id}>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} autoComplete={autoComplete} value={value} onChange={onChange} className={inputCls + ' pr-16'} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted hover:text-ink px-2 py-1">{show ? 'Hide' : 'Show'}</button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </Field>
  );
}
