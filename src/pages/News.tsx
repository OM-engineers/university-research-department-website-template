import { useState } from 'react';
import { Card } from '../components/Card';
import { Filter } from '../components/Filter';
import { SectionTitle } from '../components/SectionTitle';
import { getNewestNews, getNewsYears } from '../lib/data';
import {
  languageFilterOptions,
  matchesLanguage,
  matchesValue,
  matchesYear,
  yearOptions,
} from '../lib/filters';
import { useData, useLang, useUi } from '../lib/lang';
import type { NewsLanguage, NewsType } from '../lib/types';

export function NewsPage() {
  const { lang } = useLang();
  const news = useData('news');
  const filters = useData('site').filters;
  const ui = useUi();
  const [type, setType] = useState<NewsType | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [language, setLanguage] = useState<NewsLanguage | null>(null);

  const shown = getNewestNews(lang, news.items.length).filter(
    (item) =>
      matchesValue(item.type, type) &&
      matchesYear(item.date, year) &&
      matchesLanguage(item.language, language),
  );

  function resetFilters() {
    setType(null);
    setYear(null);
    setLanguage(null);
  }

  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={news.title} />
      <p className="mt-3 max-w-prose text-lg text-text-muted">{news.intro}</p>

      <section className="mt-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Filter<NewsType>
            variant="dropdown"
            label={filters.type.label}
            options={filters.type.options}
            value={type}
            onChange={setType}
          />
          <Filter
            variant="dropdown"
            label={filters.year.label}
            options={yearOptions(getNewsYears(lang))}
            value={year}
            onChange={setYear}
          />
          <Filter<NewsLanguage>
            variant="dropdown"
            label={filters.language.label}
            options={languageFilterOptions(filters.language.options)}
            value={language}
            onChange={setLanguage}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {ui.results(shown.length)}
        </p>
        {shown.length > 0 ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <li key={item.id}>
                <Card variant="news-event" item={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-card border border-border bg-surface p-6">
            <p>{ui.noResults}</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 font-semibold text-accent hover:text-accent-hover"
            >
              {ui.resetFilters}
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
