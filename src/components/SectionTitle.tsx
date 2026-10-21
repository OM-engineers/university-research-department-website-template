import { Link } from 'react-router';
import { ArrowIcon } from './ArrowIcon';

interface SectionTitleProps {
  title: string;
  as?: 'h1' | 'h2';
  /** Id of the heading, for a section with aria-labelledby. */
  id?: string;
  linkText?: string;
  linkTo?: string;
  className?: string;
}

/** Page title (h1) and section title (h2) with the T04 type tokens. */
export function SectionTitle({
  title,
  as: Component = 'h2',
  id,
  linkText,
  linkTo,
  className = ''
}: SectionTitleProps) {
  return (
    <div className={`flex items-end justify-between ${className}`.trim()}>
      <Component
        id={id}
        className={Component === 'h1' ? 'text-h1 leading-[1.1] font-bold' : 'text-h2 leading-[1.15] font-bold'}
      >
        {title}
      </Component>
      {linkText && linkTo && (
        <Link to={linkTo} className="group inline-flex items-center gap-2 font-semibold hover:text-accent">
          {linkText}
          <ArrowIcon className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
