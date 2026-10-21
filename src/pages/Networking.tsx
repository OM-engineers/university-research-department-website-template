import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SectionTitle } from '../components/SectionTitle';
import { useData } from '../lib/lang';

/** S-09: Networking, with the sections #partnerships and #visiting-scholars (D-11, D-15). */
export function NetworkingPage() {
  const { title, intro, partners, scholars } = useData('networking');
  const { hash, key } = useLocation();

  // The router does not scroll to a hash, so the dropdown items need this
  // (key changes on every click, so choosing the same item again scrolls again).
  useEffect(() => {
    if (hash)
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView?.({ behavior: 'smooth' });
  }, [hash, key]);

  return (
    <main className="mx-auto max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={title} />
      <p className="mt-3 text-lg text-text-muted">{intro}</p>

      <section id={partners.anchor} aria-labelledby={`${partners.anchor}-title`} className="mt-8 scroll-mt-24">
        <h2 id={`${partners.anchor}-title`} className="text-3xl font-bold">
          {partners.title}
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.items.map((partner) => (
            <li key={partner.id}>
              <Card variant="partner" partner={partner} />
            </li>
          ))}
        </ul>
      </section>

      <section id={scholars.anchor} aria-labelledby={`${scholars.anchor}-title`} className="mt-12 scroll-mt-24">
        <h2 id={`${scholars.anchor}-title`} className="text-3xl font-bold">
          {scholars.title}
        </h2>
        <ul className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {scholars.items.map((scholar) => (
            <li key={scholar.id}>
              <Card variant="scholar" scholar={scholar} />
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-start gap-4 rounded-card bg-surface p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold">{scholars.apply.title}</h3>
            <p className="mt-1 text-text-muted">{scholars.apply.text}</p>
          </div>
          <Button to={scholars.apply.link}>{scholars.apply.label}</Button>
        </div>
      </section>
    </main>
  );
}
