/**
 * FILE GUIDE: Shared visual layout for authentication pages.
 * Learning note: imports reuse code from other modules; exports make code available to other files.
 */

import { Card } from '../../components/ui';
import { EcgMonitor } from './EcgMonitor';

// Function/component: the code below runs when this function is called.
export function AuthShell({ eyebrow, title, blurb, children }) {
  return (
    <div className="relative max-w-5xl mx-auto py-10 md:py-16 grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
      <span className="blob" style={{ top: 0, left: 0 }} aria-hidden="true"></span>
      <span className="blob" style={{ bottom: 0, right: 0, animationDelay: '-7s' }} aria-hidden="true"></span>
      <div className="min-w-0 relative">
        <p className="rise text-sm font-semibold text-accent mb-4">{eyebrow}</p>
        <h1 className="rise font-display font-extrabold text-4xl md:text-5xl leading-[1.08] tracking-tight" style={{ textWrap: 'balance', '--d': '.1s' }}>{title}</h1>
        <p className="rise mt-5 text-lg text-muted max-w-xl" style={{ '--d': '.2s' }}>{blurb}</p>
        <EcgMonitor />
      </div>
      <Card className="p-6 relative" >{children}</Card>
    </div>
  );
}

export default AuthShell;
