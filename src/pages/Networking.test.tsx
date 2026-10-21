import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NetworkingPage } from './Networking'
import en from '../data/en/networking.json'

afterEach(cleanup)

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/networking#visiting-scholars']}>
      <NetworkingPage />
    </MemoryRouter>,
  )
}

describe('Networking page (T-121)', () => {
  it('has the anchors #partnerships and #visiting-scholars', () => {
    const { container } = renderPage()
    expect(container.querySelector('section#partnerships')).toBeTruthy()
    expect(container.querySelector('section#visiting-scholars')).toBeTruthy()
  })

  it('shows one K-04 card per partner and per scholar', () => {
    renderPage()
    for (const p of en.partners.items) expect(screen.getByRole('heading', { name: p.name })).toBeTruthy()
    for (const s of en.scholars.items) expect(screen.getByRole('heading', { name: s.name })).toBeTruthy()
  })

  it('placeholder "#" links do not render as card links', () => {
    renderPage()
    expect(screen.queryByRole('link', { name: en.partners.items[0].name })).toBeNull()
    expect(screen.getByRole('link', { name: en.scholars.apply.label }).getAttribute('href')).toBe(
      en.scholars.apply.link,
    )
  })
})
