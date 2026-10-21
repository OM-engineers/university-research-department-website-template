import { useParams } from 'react-router'
import { BackLink } from '../components/BackLink'
import { DetailsPanel } from '../components/DetailsPanel'
import { SectionTitle } from '../components/SectionTitle'
import { optionLabel } from '../lib/format'
import { useData, useUi } from '../lib/lang'
import { NotFoundPage } from './NotFound'

/** S-07: one project of projects.json, found by the :id of the route. Unknown ids show the 404 page. */
export function ProjectDetailPage() {
  const { id } = useParams()
  const ui = useUi()
  const { filters } = useData('site')
  const people = useData('people').items
  const project = useData('projects').items.find((p) => p.id === id)

  if (!project) return <NotFoundPage />

  const team = project.people.flatMap((personId) => people.find((p) => p.id === personId) ?? [])

  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <BackLink to="/projects">{ui.backToProjects}</BackLink>

      <article className="mt-6">
        <SectionTitle as="h1" title={project.title} />

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <img
              src={project.image}
              alt={project.title}
              className="aspect-video w-full rounded-card bg-surface object-cover"
            />
            <p className="mt-6 max-w-prose text-lg leading-normal">{project.summary}</p>
          </div>

          <DetailsPanel
            id="project-details"
            title={ui.details}
            items={[
              { label: filters.status.label, value: optionLabel(filters.status.options, project.status) },
              { label: filters.theme.label, value: optionLabel(filters.theme.options, project.theme) },
              { label: filters.year.label, value: project.year },
            ]}
          />
        </div>

        {team.length > 0 && (
          <section aria-labelledby="project-team" className="mt-8">
            <h2 id="project-team" className="text-xl leading-[1.2] font-semibold">
              {ui.team}
            </h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((person) => (
                <li key={person.id} className="rounded-card border border-border bg-white p-4">
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm leading-normal text-text-muted">{person.role}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  )
}
