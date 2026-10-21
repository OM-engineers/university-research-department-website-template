import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ContactPage } from './Contact'
import { LangContext } from '../lib/lang'
import { getData, LANGS } from '../lib/data'


afterEach(cleanup)


describe.each(LANGS)('Contact (%s)', (lang) => {
  const contact = getData(lang, 'contact')


  function renderPage() {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    return within(screen.getByRole('main'))
  }


  it('has one H1 with the page title and shows the intro', () => {
    const view = renderPage()
    const h1 = view.getAllByRole('heading', { level: 1 })
    expect(h1).toHaveLength(1)
    expect(h1[0].textContent).toBe(contact.title)
    // The intro placeholder text is reused elsewhere on the page, so look for it next to the H1.
    expect(within(h1[0].closest('section')!).getByText(contact.intro)).toBeTruthy()
  })


  it('shows address, email and phone as links, and the map placeholder', () => {
    const view = renderPage()
    expect(view.getByText(contact.details.address)).toBeTruthy()
    expect(view.getByRole('link', { name: contact.details.email }).getAttribute('href')).toBe(
      `mailto:${contact.details.email}`,
    )
    expect(view.getByRole('link', { name: contact.details.phone }).getAttribute('href')).toMatch(/^tel:\+?\d+$/)
    expect(view.getByRole('img', { name: contact.map.title }).textContent).toBe(contact.map.placeholder)
  })


  it('builds the form from contact.json, each field with its own label', () => {
    const view = renderPage()
    const form = view.getByRole('form', { name: contact.form.title })
    expect(form.getAttribute('id')).toBe(contact.form.id)
    for (const field of contact.form.fields) {
      const input = within(form).getByLabelText(new RegExp(`^${field.label}`))
      expect(input.tagName).toBe(field.type === 'textarea' ? 'TEXTAREA' : 'INPUT')
      expect(input.hasAttribute('required')).toBe(field.required)
    }
    expect(within(form).getByRole('button', { name: contact.form.submit })).toBeTruthy()
  })


  it('does not send anything: the submit is stopped (prototype)', () => {
    const view = renderPage()
    const form = view.getByRole('form', { name: contact.form.title })
    // fireEvent returns false when the handler called preventDefault.
    expect(fireEvent.submit(form)).toBe(false)
  })


  describe('validation', () => {
    const required = contact.form.fields.filter((f) => f.required)
    const email = contact.form.fields.find((f) => f.type === 'email')!
    const field = (view: ReturnType<typeof renderPage>, id: string) =>
      view.getByLabelText(new RegExp(`^${contact.form.fields.find((f) => f.id === id)!.label}`)) as HTMLInputElement

    it('shows the error of a required field on blur, linked with aria-describedby', () => {
      const view = renderPage()
      const input = field(view, required[0].id)
      fireEvent.blur(input)
      const message = view.getByText(required[0].errorMessage)
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe(message.id)
    })

    it('rejects an invalid email and clears the error once it is fixed', () => {
      const view = renderPage()
      const input = field(view, email.id)
      fireEvent.change(input, { target: { value: 'not-an-email' } })
      fireEvent.blur(input)
      expect(view.getByText(email.errorMessage)).toBeTruthy()
      fireEvent.change(input, { target: { value: 'jane@example.com' } })
      expect(view.queryByText(email.errorMessage)).toBeNull()
      expect(input.hasAttribute('aria-invalid')).toBe(false)
    })

    it('on submit shows every error and the form message, and focuses the first invalid field', () => {
      const view = renderPage()
      fireEvent.submit(view.getByRole('form', { name: contact.form.title }))
      for (const f of required) expect(view.getByText(f.errorMessage)).toBeTruthy()
      expect(view.getByRole('alert').textContent).toBe(contact.form.error)
      expect(document.activeElement).toBe(field(view, required[0].id))
      expect(view.queryByText(contact.form.success)).toBeNull()
    })

    it('a valid form shows the success text and is cleared', () => {
      const view = renderPage()
      for (const f of contact.form.fields) {
        fireEvent.change(field(view, f.id), { target: { value: f.type === 'email' ? 'jane@example.com' : 'Text' } })
      }
      fireEvent.submit(view.getByRole('form', { name: contact.form.title }))
      expect(view.getByRole('status').textContent).toBe(contact.form.success)
      expect(view.getByRole('alert').textContent).toBe('')
      for (const f of contact.form.fields) expect(field(view, f.id).value).toBe('')
    })
  })


  it('shows the three Join us steps in order, in the section with the anchor', () => {
    const view = renderPage()
    const section = view.getByRole('region', { name: contact.joinUs.title })
    expect(section.getAttribute('id')).toBe(contact.joinUs.anchor)
    const steps = within(section).getAllByRole('listitem')
    expect(steps).toHaveLength(3)
    contact.joinUs.steps.forEach((step, i) => {
      expect(within(steps[i]).getByRole('heading', { level: 3 }).textContent).toBe(step.title)
      expect(within(steps[i]).getByText(step.description)).toBeTruthy()
    })
    expect(within(section).getByRole('button', { name: contact.joinUs.cta.label })).toBeTruthy()
  })
})
