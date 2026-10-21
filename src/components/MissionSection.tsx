import { Link } from 'react-router';
import { ArrowIcon } from './ArrowIcon';
import { SectionTitle } from './SectionTitle';
import type { HomeData } from '../lib/types';

/** Mission section of the Home page: image, title, three sentences and a link to About us. */
export function MissionSection({ mission }: { mission: HomeData['mission'] }) {
  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <img
        src={mission.image}
        alt={mission.imageAlt}
        loading="lazy"
        className="aspect-[2/1] w-full rounded-lg bg-surface object-cover"
      />
      <div>
        <SectionTitle title={mission.title} />
        <p className="mt-4">{mission.sentences.join(' ')}</p>
        <Link
          to={mission.readMore.link}
          className="group mt-4 inline-flex items-center gap-2 font-semibold hover:text-accent"
        >
          {mission.readMore.label}
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
