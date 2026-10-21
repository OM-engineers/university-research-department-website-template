import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Button } from '../components/Button';
import { SectionTitle } from '../components/SectionTitle';
import { formatFileSize } from '../lib/format';
import { useData, useLang } from '../lib/lang';

/**
 * S-05 About us (T03 About wireframe v2): page title, mission and vision cards (#mission, #vision),
 * background with image, regulations download (#regulations) and the closing call to action.
 * All texts come from about.json. T-59: the dropdown links scroll to their section.
 */
export function AboutPage() {
  const about = useData('about');
  const { lang } = useLang();
  const { missionVision, background, regulations, cta } = about;
  const { hash, key } = useLocation();

  // The router does not scroll to #anchors on in-app navigation, so the page does it
  // (key changes on every click, so choosing the same dropdown item again scrolls again).
  useEffect(() => {
    if (hash)
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView?.({ behavior: 'smooth' });
  }, [hash, key]);

  // Download button text, as in the wireframe: "Download PDF (name, 120 KB)".
  const { file } = regulations;
  const downloadText = `${regulations.downloadLabel} ${file.type.toUpperCase()} (${file.label}, ${formatFileSize(file.size, lang)})`;

  return (
    <main className="mx-auto max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={about.title} />
      <p className="mt-3 text-lg text-text-muted">{about.intro}</p>

      {/* Two columns on desktop (1024 px and up), one column on tablet and phone, mission first. */}
      <section
        id={missionVision.anchor}
        aria-labelledby={`${missionVision.anchor}-title`}
        className="mt-8 scroll-mt-24"
      >
        <h2 id={`${missionVision.anchor}-title`} className="sr-only">
          {missionVision.title}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {missionVision.items.map((item) => (
            <div
              key={item.id}
              id={item.id}
              className="scroll-mt-24 rounded-card border border-border p-4"
            >
              <h3 className="text-2xl leading-[1.2] font-semibold">{item.title}</h3>
              <p className="mt-1 text-text-muted">{item.text}</p>
              <ul className="mt-3 list-disc pl-10 text-text-muted">
                {item.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section
        id={background.anchor}
        className="mt-12 grid scroll-mt-24 items-center gap-6 lg:grid-cols-2"
      >
        <img
          src={about.image}
          alt={about.imageAlt}
          loading="lazy"
          className="aspect-video w-full rounded-card bg-surface object-cover"
        />
        <div>
          <SectionTitle title={background.title} />
          {background.paragraphs.map((paragraph, index) => (
            <p key={index} className="mt-4">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <section id={regulations.anchor} className="mt-12 scroll-mt-24">
        <SectionTitle title={regulations.title} />
        <p className="mt-3 text-text-muted">{regulations.description}</p>
        <div className="mt-3">
          <Button href={file.path}>{downloadText}</Button>
        </div>
      </section>

      <section className="mt-12 rounded-card bg-surface-warm p-8 text-center">
        <SectionTitle title={cta.title} className="justify-center!" />
        <p className="mx-auto mt-3 max-w-2xl">{cta.text}</p>
        <div className="mt-3">
          <Button to={cta.link}>{cta.label}</Button>
        </div>
      </section>
    </main>
  );
}
