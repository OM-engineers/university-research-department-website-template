import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ContactPage } from './Contact'
import { LangContext } from '../lib/lang'
import { getData, LANGS } from '../lib/data'

/**
 * T-117, part 2: validation of the contact form (T-58, Day 9).
 *
 * Rules tested (from the T-58 note in Contact.tsx and from contact.json):
 *  - required fields (name, email, message) show their `errorMessage` when they are empty;
 *  - the optional field (subject) never shows an error;
 *  - the email must look like an email address and uses the error text of the email field;
 *  - the error appears on blur and on submit, and goes away when the value is corrected;
 *  - a failed submit puts the focus on the first invalid field and shows no success text;
 *  - a valid submit shows form.success and no error;
 *  - everything is read from contact.json, so the Italian page shows Italian messages.
 */

afterEach(cleanup)

type FieldDef = { id: string; label: string; required: boolean; type: string; errorMessage: string }

describe.each(LANGS)('Contact form validation (%s)', (lang) => {
  const contact = getData(lang, 'contact')
  const fields = contact.form.fields as unknown as FieldDef[]
  const field = (id: string) => fields.find((f) => f.id === id)!

  function renderPage() {
    render(
      <LangContext.Provider value={{ lang, setLang: () => {} }}>
        <MemoryRouter>
          <ContactPage />
        </MemoryRouter>
      </LangContext.Provider>,
    )
    const form = screen.getByRole('form', { name: contact.form.title })
    return {
      form,
      input: (id: string) => within(form).getByLabelText(new RegExp(`^${field(id).label}`)) as HTMLInputElement,
    }
  }

  const type = (el: HTMLElement, value: string) => fireEvent.change(el, { target: { value } })
  const fillValid = (input: (id: string) => HTMLInputElement) => {
    type(input('name'), 'Ada Example')
    type(input('email'), 'ada@example.com')
    type(input('message'), 'Hello, this is a test message.')
  }
  const submit = (form: HTMLElement) => fireEvent.submit(form)

  it('has no error and no success text before the person does anything', () => {
    const { form, input } = renderPage()
    for (const f of fields) {
      expect(input(f.id).getAttribute('aria-invalid')).toBeNull()
      if (f.errorMessage) expect(within(form).queryByText(f.errorMessage)).toBeNull()
    }
    expect(screen.queryByText(contact.form.success)).toBeNull()
  })

  it.each(['name', 'email', 'message'])('shows the error of the required field "%s" on blur when it is empty', (id) => {
    const { form, input } = renderPage()
    fireEvent.blur(input(id))
    expect(within(form).getByText(field(id).errorMessage)).toBeTruthy()
    expect(input(id).getAttribute('aria-invalid')).toBe('true')
  })

  it('links the error message to its field (aria-describedby)', () => {
    const { form, input } = renderPage()
    fireEvent.blur(input('name'))
    const message = within(form).getByText(field('name').errorMessage)
    expect(input('name').getAttribute('aria-describedby')).toBe(message.id)
  })

  it('never shows an error for the optional field', () => {
    const { input } = renderPage()
    expect(field('subject').required).toBe(false)
    fireEvent.blur(input('subject'))
    expect(input('subject').getAttribute('aria-invalid')).toBeNull()
  })

  it('treats a value with only spaces as empty', () => {
    const { form, input } = renderPage()
    type(input('name'), '   ')
    fireEvent.blur(input('name'))
    expect(within(form).getByText(field('name').errorMessage)).toBeTruthy()
  })

  it.each(['plainaddress', 'name@', '@example.com', 'name@example', 'na me@example.com'])(
    'rejects the email "%s"',
    (value) => {
      const { form, input } = renderPage()
      type(input('email'), value)
      fireEvent.blur(input('email'))
      expect(within(form).getByText(field('email').errorMessage)).toBeTruthy()
      expect(input('email').getAttribute('aria-invalid')).toBe('true')
    },
  )

  it.each(['ada@example.com', 'ada.lovelace+test@mail.example.it'])('accepts the email "%s"', (value) => {
    const { form, input } = renderPage()
    type(input('email'), value)
    fireEvent.blur(input('email'))
    expect(within(form).queryByText(field('email').errorMessage)).toBeNull()
    expect(input('email').getAttribute('aria-invalid')).toBeNull()
  })

  it('removes the error when the value is corrected', () => {
    const { form, input } = renderPage()
    fireEvent.blur(input('email'))
    expect(within(form).getByText(field('email').errorMessage)).toBeTruthy()
    type(input('email'), 'ada@example.com')
    fireEvent.blur(input('email'))
    expect(within(form).queryByText(field('email').errorMessage)).toBeNull()
  })

  it('on submit, shows the error of every invalid field at once and not the success text', () => {
    const { form, input } = renderPage()
    submit(form)
    for (const id of ['name', 'email', 'message']) {
      expect(within(form).getByText(field(id).errorMessage)).toBeTruthy()
      expect(input(id).getAttribute('aria-invalid')).toBe('true')
    }
    expect(input('subject').getAttribute('aria-invalid')).toBeNull()
    expect(screen.queryByText(contact.form.success)).toBeNull()
  })

  it('on submit, puts the keyboard focus on the first invalid field', () => {
    const { form, input } = renderPage()
    submit(form)
    expect(document.activeElement).toBe(input('name'))
  })

  it('on submit, skips the valid fields and focuses the first one with an error', () => {
    const { form, input } = renderPage()
    type(input('name'), 'Ada Example')
    submit(form)
    expect(document.activeElement).toBe(input('email'))

    type(input('email'), 'ada@example.com')
    submit(form)
    expect(document.activeElement).toBe(input('message'))
  })

  it('on a valid submit, shows the success text and no error', () => {
    const { form, input } = renderPage()
    fillValid(input)
    submit(form)
    expect(screen.getByText(contact.form.success)).toBeTruthy()
    for (const f of fields) {
      if (f.errorMessage) expect(within(form).queryByText(f.errorMessage)).toBeNull()
    }
  })

  it('accepts the form without the optional subject', () => {
    const { form, input } = renderPage()
    fillValid(input)
    expect(input('subject').value).toBe('')
    submit(form)
    expect(screen.getByText(contact.form.success)).toBeTruthy()
  })

  it('does not submit natively: the page does not reload (the default action is stopped)', () => {
    const { form, input } = renderPage()
    expect(submit(form)).toBe(false)
    fillValid(input)
    expect(submit(form)).toBe(false)
  })
})
