import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AboutPage } from './About'
import { LangContext } from '../lib/lang'
import { getData, LANGS } from '../lib/data'
import { formatFileSize } from '../lib/format'

afterEach(cleanup)

describe.each(LANGS)('About (%s)', (lang) => {
  const about = getData(lang, 'about')

  function renderAbout(path = '/about') {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter initialEntries={[path]}>
          <AboutPage />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    return within(screen.getByRole('main'))
  }

  it('has one H1, the page title', () => {
    const h1 = renderAbout().getAllByRole('heading', { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0].textContent).toBe(about.title)
  })

  it('has the #mission and #regulations anchors', () => {
    renderAbout()
    expect(document.getElementById('mission')).not.toBeNull()
    expect(document.getElementById(about.regulations.anchor)).toBe(
      screen.getByRole('heading', { name: about.regulations.title }).closest('section'),
    )
    expect(about.regulations.anchor).toBe('regulations')
  })

  it('links the regulations file and the contact CTA', () => {
    const view = renderAbout()
    expect(view.getByRole('link', { name: new RegExp(about.regulations.file.label) }).getAttribute('href')).toBe(
      about.regulations.file.path,
    )
    expect(view.getByRole('link', { name: about.cta.label }).getAttribute('href')).toBe(about.cta.link)
  })

  it('shows Mission and Vision as two cards, each with a sentence and a list of three points', () => {
    const view = renderAbout()
    for (const item of about.missionVision.items) {
      const card = document.getElementById(item.id) as HTMLElement
      expect(within(card).getByRole('heading', { level: 3, name: item.title })).not.toBeNull()
      expect(within(card).getByText(item.text)).not.toBeNull()
      expect(within(card).getAllByRole('listitem').map((li) => li.textContent)).toEqual(item.points)
    }
    expect(view.getAllByRole('list')).toHaveLength(about.missionVision.items.length)
  })

  it('has the Background image next to its text', () => {
    const view = renderAbout()
    expect(view.getByRole('img', { name: about.imageAlt })).not.toBeNull()
    expect(document.getElementById(about.background.anchor)?.textContent).toContain(about.background.paragraphs[0])
  })

  it('says in the download button that the file is a PDF and how big it is', () => {
    const { file, downloadLabel } = about.regulations
    const button = renderAbout().getByRole('link', { name: /PDF/ })
    expect(button.textContent).toBe(`${downloadLabel} PDF (${file.label}, ${formatFileSize(file.size, lang)})`)
  })

  it.each(['mission', 'vision', 'mission-vision', 'background', 'regulations'])(
    'scrolls to #%s when the page opens with that hash',
    (id) => {
      const scrollIntoView = vi.fn()
      Element.prototype.scrollIntoView = scrollIntoView
      renderAbout(`/about#${id}`)
      expect(scrollIntoView).toHaveBeenCalledTimes(1)
      expect(scrollIntoView.mock.contexts[0]).toBe(document.getElementById(id))
    },
  )
})
