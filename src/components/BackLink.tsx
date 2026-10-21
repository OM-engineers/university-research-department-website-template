import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowIcon } from './ArrowIcon';

/** Link with a left arrow at the top of the detail pages, e.g. "Back to projects". */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2 font-semibold hover:text-accent">
      <ArrowIcon className="rotate-180 transition-transform group-hover:-translate-x-1" />
      {children}
    </Link>
  );
}
