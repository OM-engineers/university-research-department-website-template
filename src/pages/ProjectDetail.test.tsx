import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ProjectDetailPage } from './ProjectDetail'
import { ProjectsPage } from './Projects'
import { LangContext } from '../lib/lang'
import { getData, LANGS, type Lang } from '../lib/data'
import { optionLabel } from '../lib/format'
import { ui } from '../lib/ui'

afterEach(cleanup)

function renderAt(path: string, lang: Lang) {
  return render(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </LangContext.Provider>,
  )
}

describe.each(LANGS)('Project detail page, S-07 (T-151, %s)', (lang) => {
  const projects = getData(lang, 'projects')
  const people = getData(lang, 'people')
  const { filters, notFound } = getData(lang, 'site')

  it.each(projects.items.map((project) => [project.id, project] as const))(
    '%s shows its title, summary, image, status, theme and year',
    (id, project) => {
      renderAt(`/projects/${id}`, lang)
      const view = within(screen.getByRole('main'))
      expect(view.getByRole('heading', { level: 1 }).textContent).toBe(project.title)
      expect(view.getByText(project.summary)).toBeTruthy()
      expect(view.getByRole('img', { name: project.title }).getAttribute('src')).toBe(project.image)
      expect(view.getByText(optionLabel(filters.status.options, project.status))).toBeTruthy()
      expect(view.getByText(optionLabel(filters.theme.options, project.theme))).toBeTruthy()
      expect(view.getByText(String(project.year))).toBeTruthy()
    },
  )

  it.each(projects.items.map((project) => [project.id, project] as const))(
    '%s lists the name and role of each of its people',
    (id, project) => {
      renderAt(`/projects/${id}`, lang)
      const team = within(screen.getByRole('region', { name: ui[lang].team }))
      const members = project.people.map((personId) => people.items.find((p) => p.id === personId)!)
      expect(team.getAllByRole('listitem')).toHaveLength(members.length)
      for (const person of members) {
        expect(team.getByText(person.name)).toBeTruthy()
        expect(team.getAllByText(person.role).length).toBeGreaterThan(0)
      }
    },
  )

  it('links back to the Projects page', () => {
    renderAt(`/projects/${projects.items[0].id}`, lang)
    expect(screen.getByRole('link', { name: ui[lang].backToProjects }).getAttribute('href')).toBe('/projects')
  })

  it('shows the 404 page for an unknown id', () => {
    renderAt('/projects/proj-999', lang)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(notFound.title)
  })
})

describe('From the Projects list to the detail page (BUG-17)', () => {
  it.each(LANGS)('%s: the card link of every project opens its detail page', (lang) => {
    renderAt('/projects', lang)
    const { items } = getData(lang, 'projects')
    // The Projects page shows only the first featured project as the wide card.
    const featured = items.find((p) => p.featured)
    for (const project of items) {
      const label = `${project === featured ? ui[lang].viewProject : ui[lang].readMore}: ${project.title}`
      expect(screen.getByRole('link', { name: label }).getAttribute('href')).toBe(`/projects/${project.id}`)
    }
  })
})
