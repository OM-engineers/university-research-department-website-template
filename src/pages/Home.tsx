import { Link } from 'react-router';
import { ArrowIcon } from '../components/ArrowIcon';
import { Card } from '../components/Card';
import { HeroBanner } from '../components/HeroBanner';
import { MissionSection } from '../components/MissionSection';
import { SectionTitle } from '../components/SectionTitle';
import { getNewestNews } from '../lib/data';
import { useData, useLang } from '../lib/lang';

/** Home (T03 wireframe v2): hero, feature grid, mission, latest news and events. */
export function HomePage() {
  const { lang } = useLang();
  const home = useData('home');
  const latest = getNewestNews(lang, home.latest.count);
  const container = 'mx-auto mt-12 max-w-300 px-4 sm:px-6 lg:px-10';

  return (
    <main className="pb-12">
      <HeroBanner hero={home.hero} />

      <section className={container}>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {home.features.map((feature) => (
            <li key={feature.id}>
              <Card variant="feature" feature={feature} />
            </li>
          ))}
        </ul>
      </section>

      <section className={container}>
        <MissionSection mission={home.mission} />
      </section>

      <section className={container}>
        <SectionTitle title={home.latest.title} />
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((item) => (
            <li key={item.id}>
              <Card variant="news-event" item={item} />
            </li>
          ))}
        </ul>
        <Link
          to={home.latest.seeAll.link}
          className="group mt-6 inline-flex items-center gap-2 font-semibold hover:text-accent"
        >
          {home.latest.seeAll.label}
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </main>
  );
}
