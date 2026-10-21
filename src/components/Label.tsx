import type { ReactNode } from 'react';

/** Small rounded tag of cards and detail pages (type, date, language, status). Must be a child of a `<ul>`. */
export function Label({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <li
      className={`rounded-full px-2.5 py-0.5 text-xs leading-normal font-medium ${accent ? 'bg-accent text-white' : 'bg-surface'}`}
    >
      {children}
    </li>
  );
}
