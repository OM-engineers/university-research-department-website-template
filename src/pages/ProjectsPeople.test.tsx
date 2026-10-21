import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import App from '../App'
import { LangContext } from '../lib/lang'
import { getData, getNewestProjects, LANGS } from '../lib/data'

afterEach(cleanup)

function renderAt(path: string, lang: 'en' | 'it' = 'en') {
  render(
    <LangContext.Provider value={{ lang, setLang: () => {} }}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </LangContext.Provider>,
  )
}
const h1 = () => within(screen.getByRole('main')).getByRole('heading', { level: 1 }).textContent

describe('Projects and People routes', () => {
  it.each([
    ['/projects', 'Projects'],
    ['/people', 'People'],
  ])('%s renders its page', (path, heading) => {
    renderAt(path)
    expect(h1()).toBe(heading)
  })

  it('has one <main> per page', () => {
    renderAt('/people')
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('an unknown path renders the NotFound page', () => {
    renderAt('/no-such-page')
    expect(h1()).toBe('Page not found')
  })
})

describe.each(LANGS)('links into Projects and People from the menu and footer (%s)', (lang) => {
  const href = (el: HTMLElement) => el.getAttribute('href')

  it('menu and footer have a People link that goes to /people', () => {
    renderAt('/', lang)
    const people = getData(lang, 'site').nav.find((n) => n.id === 'about')!.children!.find((c) => c.link === '/people')!
    for (const link of screen.getAllByRole('link', { name: people.label })) expect(href(link)).toBe('/people')
  })

  it('the Projects dropdown lists the same newest projects as getNewestProjects, then View all', () => {
    renderAt('/', lang)
    const projects = getData(lang, 'site').nav.find((n) => n.id === 'projects')!
    const nav = screen.getAllByRole('navigation')[0]
    fireEvent.click(within(nav).getByRole('link', { name: projects.label }).parentElement!.querySelector('button')!)
    const menu = within(nav).getAllByRole('link').map((a) => a.getAttribute('href')).filter((h) => h?.startsWith('/projects/'))
    const expected = getNewestProjects(lang, projects.dynamicChildren!.limit).map((p) => `/projects/${p.id}`)
    expect(menu).toEqual(expected)
    expect(within(nav).getAllByRole('link', { name: projects.dynamicChildren!.viewAll.label })[0].getAttribute('href')).toBe('/projects')
  })

  it('the Home features link to /projects and /people', () => {
    renderAt('/', lang)
    const links = within(screen.getByRole('main')).getAllByRole('link').map(href)
    expect(links).toEqual(expect.arrayContaining(['/projects', '/people']))
  })
})

describe('data used by the Projects and People pages', () => {
  it.each(LANGS)('%s: every person has the fields the Person type requires', (lang) => {
    // profilelink is optional: without it the card has no Profile button.
    const required = ['id', 'name', 'role', 'department', 'topics', 'photo', 'email', 'group']
    const raw = getData(lang, 'people').items as unknown as Record<string, unknown>[]
    const missing = raw.flatMap((p) => required.filter((k) => !p[k]).map((k) => `${p.id}.${k}`))
    expect(missing).toEqual([])
  })

  it.each(LANGS)('%s: every project theme and person topic is a known theme', (lang) => {
    const site = getData(lang, 'site')
    const themes = new Set(site.filters.theme.options.map((o) => o.value))
    for (const p of getData(lang, 'projects').items) expect(themes.has(p.theme), p.id).toBe(true)
    for (const p of getData(lang, 'people').items) expect(p.topics.every((t) => themes.has(t)), p.id).toBe(true)
  })

  it.each(LANGS)('%s: person emails look like emails', (lang) => {
    for (const p of getData(lang, 'people').items) expect(p.email, p.id).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)
  })
})
