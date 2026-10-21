import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { Card } from './Card'
import type { Person } from '../lib/types'

afterEach(cleanup)

const person: Person = {
  id: 'pers-test',
  name: 'Jane Doe',
  role: 'Role',
  department: 'Department',
  topics: [],
  photo: '/images/placeholders/photo-4x5.svg',
  email: 'jane.doe@example.com',
  group: 'board',
}

function renderPerson(p: Person) {
  render(
    <MemoryRouter>
      <Card variant="person" person={p} />
    </MemoryRouter>,
  )
}

describe('Card K-04, person variant', () => {
  it('with a profile link: shows the Profile button, opening in a new tab', () => {
    renderPerson({ ...person, profilelink: 'https://example.com' })
    const link = screen.getByRole('link', { name: /^Profile/ })
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('target')).toBe('_blank')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('without a profile link: no Profile button', () => {
    renderPerson(person)
    expect(screen.queryByRole('link', { name: /^Profile/ })).toBeNull()
    expect(screen.getByRole('link', { name: person.email })).toBeTruthy()
  })
})
