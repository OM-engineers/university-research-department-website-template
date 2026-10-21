import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowIcon } from './ArrowIcon';
import { Label } from './Label';
import { formatDate, LANGUAGE_LABEL } from '../lib/format';
import { useData, useLang, useUi } from '../lib/lang';
import type { Feature, NewsItem, Partner, Person, Project, Scholar } from '../lib/types';

export type CardProps =
  | { variant: 'feature'; feature: Feature }
  | { variant: 'news-event'; item: NewsItem }
  | { variant: 'project'; project: Project; featured?: boolean }
  | { variant: 'person'; person: Person }
  | { variant: 'member'; person: Person }
  | { variant: 'partner'; partner: Partner }
  | { variant: 'scholar'; scholar: Scholar };

/**
 * K-04: card, as
 * a feature card (icon, title, one line, red arrow),
 * a news-event card (image, type, date and language labels, title, summary),
 * a project card (image, status, title, summary; `featured` = wide card of the Projects page),
 * a person card (photo, name, role, email, profile)
 * a small member card (name and department),
 * a partner card (logo, tags, name, one line)
 * or a scholar card (photo, name, role, institution, period).
 *
 * The whole card is one link, except the person card (email and profile are two links).
 * Partner and scholar cards are plain cards while their link is the placeholder "#".
 * Example usage: <Card variant="feature" feature={feature} />
 */

export function Card(props: CardProps) {
  switch (props.variant) {
    case 'feature':
      return <FeatureCard feature={props.feature} />;
    case 'news-event':
      return <NewsEventCard item={props.item} />;
    case 'project':
      return <ProjectCard project={props.project} featured={props.featured ?? false} />;
    case 'person':
      return <PersonCard person={props.person} />;
    case 'member':
      return <MemberCard person={props.person} />;
    case 'partner':
      return <PartnerCard partner={props.partner} />;
    case 'scholar':
      return <ScholarCard scholar={props.scholar} />;
  }
}

const cardClass =
  'group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-white transition-shadow hover:shadow-hover focus-within:shadow-hover';

/** The link covers the whole card, so the card is one click target. */
const stretchedLink = 'after:absolute after:inset-0 after:rounded-card';

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className={`${cardClass} p-4`}>
      <span className="flex h-12 w-12 items-center justify-center rounded bg-surface text-text-muted">
        <FeatureIcon name={feature.icon} />
      </span>
      <h2 className="mt-4 text-xl leading-[1.2] font-semibold">
        <Link to={feature.link} className={`${stretchedLink} group-hover:text-accent`}>
          {feature.title}
        </Link>
      </h2>
      <p className="mt-1 mb-4 text-sm leading-normal text-text-muted">{feature.description}</p>
      <ArrowIcon className="mt-auto transition-transform group-hover:translate-x-1" />
    </article>
  );
}

function NewsEventCard({ item }: { item: NewsItem }) {
  const { lang } = useLang();
  const ui = useUi();
  return (
    <article className={cardClass}>
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="aspect-video w-full bg-surface object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <ul className="flex flex-wrap gap-1.5">
          <Label>{ui.newsType[item.type]}</Label>
          <Label>
            <time dateTime={item.date}>{formatDate(item.date, lang, 'short')}</time>
          </Label>
          <Label>{LANGUAGE_LABEL[item.language]}</Label>
        </ul>
        <h3 className="mt-2 text-xl leading-[1.2] font-semibold">{item.title}</h3>
        <p className="mt-2 mb-4 line-clamp-2 text-sm leading-normal text-text-muted">
          {item.summary}
        </p>
        <Link
          to={`/news/${item.id}`}
          aria-label={`${ui.readMore}: ${item.title}`}
          className={`${stretchedLink} mt-auto inline-flex items-center gap-2 self-start font-semibold group-hover:text-accent`}
        >
          {ui.readMore}
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function ProjectCard({ project, featured }: { project: Project; featured: boolean }) {
  const ui = useUi();
  const status = useData('site').filters.status.options.find((o) => o.value === project.status);
  return (
    <article className={`${cardClass} ${featured ? 'md:grid md:grid-cols-2' : ''}`}>
      <img
        src={project.image}
        alt={project.title}
        loading={featured ? undefined : 'lazy'}
        className="aspect-video h-full w-full bg-surface object-cover"
      />
      <div className={`flex flex-1 flex-col ${featured ? 'p-4 md:p-7' : 'p-4'}`}>
        <ul className="flex flex-wrap gap-1.5">
          {featured && <Label accent>{ui.featured}</Label>}
          <Label accent={!featured}>{status?.label ?? project.status}</Label>
        </ul>
        {featured ? (
          <h2 className="mt-2 text-h2 leading-[1.2] font-semibold">{project.title}</h2>
        ) : (
          <h3 className="mt-2 text-xl leading-[1.2] font-semibold">{project.title}</h3>
        )}
        <p
          className={`mt-2 mb-4 text-sm leading-normal text-text-muted ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}
        >
          {project.summary}
        </p>
        <Link
          to={`/projects/${project.id}`}
          aria-label={`${featured ? ui.viewProject : ui.readMore}: ${project.title}`}
          className={`${stretchedLink} inline-flex items-center gap-2 self-start font-semibold group-hover:text-accent ${featured ? '' : 'mt-auto'}`}
        >
          {featured ? ui.viewProject : ui.readMore}
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function PersonCard({ person }: { person: Person }) {
  const ui = useUi();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-card border border-border bg-white">
      <img
        src={person.photo}
        alt={person.name}
        loading="lazy"
        className="aspect-4/5 w-full bg-surface object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl leading-[1.2] font-semibold">{person.name}</h3>
        <p className="mt-2 text-sm leading-normal text-text-muted">{person.role}</p>
        <a
          href={`mailto:${person.email}`}
          className="mb-4 self-start text-sm leading-normal break-all text-text-muted hover:text-accent"
        >
          {person.email}
        </a>
        {person.profilelink && (
          <a
            href={person.profilelink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${ui.profile}: ${person.name} (${ui.newTab})`}
            className="group mt-auto inline-flex items-center gap-2 self-start font-semibold hover:text-accent"
          >
            {ui.profile}
            <ArrowIcon className="transition-transform group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </article>
  );
}

function MemberCard({ person }: { person: Person }) {
  return (
    <article className="h-full rounded-card border border-border bg-white p-4">
      <h3 className="font-semibold">{person.name}</h3>
      <p className="mt-1 text-sm leading-normal text-text-muted">{person.department}</p>
    </article>
  );
}

/** Title of a partner or scholar card: a link over the whole card, unless the link is the placeholder "#". */
function CardTitle({ title, link }: { title: string; link: string }) {
  if (!link || link === '#') return <>{title}</>;
  const className = `${stretchedLink} group-hover:text-accent`;
  return /^https?:/.test(link) ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className={className}>
      {title}
    </a>
  ) : (
    <Link to={link} className={className}>
      {title}
    </Link>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <article className={cardClass}>
      <img
        src={partner.logo}
        alt=""
        loading="lazy"
        className="aspect-video w-full bg-surface object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <ul className="flex flex-wrap gap-1.5">
          {partner.tags.map((tag) => (
            <Label key={tag}>{tag}</Label>
          ))}
        </ul>
        <h3 className="mt-2 text-xl leading-[1.2] font-semibold">
          <CardTitle title={partner.name} link={partner.link} />
        </h3>
        <p className="mt-2 text-sm leading-normal text-text-muted">{partner.text}</p>
      </div>
    </article>
  );
}

function ScholarCard({ scholar }: { scholar: Scholar }) {
  return (
    <article className={cardClass}>
      <img
        src={scholar.photo}
        alt={scholar.name}
        loading="lazy"
        className="aspect-4/5 w-full bg-surface object-cover"
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-xl leading-[1.2] font-semibold">
          <CardTitle title={scholar.name} link={scholar.link} />
        </h3>
        <p className="mt-2 text-sm leading-normal text-text-muted">{scholar.role}</p>
        <p className="text-sm leading-normal text-text-muted">{scholar.institution}</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          <Label>{scholar.period}</Label>
        </ul>
      </div>
    </article>
  );
}

/** Icon for the `icon` key of home.json > features. Unknown keys show the empty tile. */
const FEATURE_ICONS: Record<string, ReactNode> = {
  projects: (
    <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h4l2 2.5h9A1.5 1.5 0 0 1 21 10v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z" />
  ),
  people: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3 19c0-3 2.7-5 6-5s6 2 6 5M16 5.8a3 3 0 0 1 0 5.4M17.5 14.3c2 .6 3.5 2.3 3.5 4.7" />
    </>
  ),
  news: (
    <>
      <rect x="3.5" y="5.5" width="17" height="14" rx="1.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.7v.1" />
    </>
  ),
};

function FeatureIcon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {FEATURE_ICONS[name]}
    </svg>
  );
}
