import { Button } from './Button';
import type { HomeData } from '../lib/types';

/**
 * K-05: hero of the Home page. Title (the only H1 of the page), one-line mission and
 * the CTAs on an image with a dark overlay. The first CTA is the primary one.
 */
export function HeroBanner({ hero }: { hero: HomeData['hero'] }) {
  return (
    <section className="relative isolate flex min-h-[330px] items-center bg-text md:min-h-[420px]">
      {/* Decorative image: empty alt text (T03 Home, accessibility notes). */}
      <img src={hero.image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-text/60" />

      <div className="mx-auto w-full max-w-300 px-4 py-12 sm:px-6 lg:px-10">
        <h1 className="max-w-3xl text-h2 leading-[1.1] font-bold text-white md:text-h1">
          {hero.title}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white">{hero.mission}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {hero.ctas.map((cta, index) => (
            <Button key={cta.link} to={cta.link} variant={index === 0 ? 'primary' : 'outline'}>
              {cta.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
