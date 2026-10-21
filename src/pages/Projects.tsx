import { useState } from 'react';
import { Card } from '../components/Card';
import { Filter } from '../components/Filter';
import { SectionTitle } from '../components/SectionTitle';
import { matchesValue } from '../lib/filters';
import { useData, useUi } from '../lib/lang';
import type { Status } from '../lib/types';

/** Projects (T03 wireframe v2): title, featured project, status pills, grid of project cards. */
export function ProjectsPage() {
  const projects = useData('projects');
  const { status: statusFilter } = useData('site').filters;
  const ui = useUi();
  const [status, setStatus] = useState<Status | null>(null);

  const featured = projects.items.find((p) => p.featured);
  const shown = projects.items.filter((p) => p !== featured && matchesValue(p.status, status));

  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={projects.title} />
      <p className="mt-3 max-w-prose text-lg text-text-muted">{projects.intro}</p>

      {featured && (
        <section className="mt-8">
          <Card variant="project" project={featured} featured />
        </section>
      )}

      <section className="mt-8">
        <Filter<Status>
          variant="pills"
          label={statusFilter.label}
          options={statusFilter.options}
          value={status}
          onChange={setStatus}
        />
        <p className="sr-only" aria-live="polite">
          {ui.results(shown.length)}
        </p>
        {shown.length > 0 ? (
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((project) => (
              <li key={project.id}>
                <Card variant="project" project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-6 rounded-card border border-border bg-surface p-6">
            <p>{projects.emptyState}</p>
            <button
              type="button"
              onClick={() => setStatus(null)}
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
