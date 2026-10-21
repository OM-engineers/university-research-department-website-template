import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '../components/Button'
import { FormField } from '../components/FormField'
import { SectionTitle } from '../components/SectionTitle'
import { useData } from '../lib/lang'
import type { FormField as Field } from '../lib/types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(field: Field, value: string) {
  const text = value.trim()
  if (field.required && text === '') return field.errorMessage
  if (field.type === 'email' && text !== '' && !EMAIL_PATTERN.test(text)) return field.errorMessage
  return ''
}

export function ContactPage() {
  const contact = useData('contact')
  const { details, map, form, joinUs } = contact
  const container = 'mx-auto mt-12 max-w-300 px-4 sm:px-6 lg:px-10'
  const fieldId = (field: Field) => `${form.id}-${field.id}`

  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle')

  function handleChange(field: Field, value: string) {
    setValues((v) => ({ ...v, [field.id]: value }))
    if (errors[field.id]) setErrors((e) => ({ ...e, [field.id]: validate(field, value) }))
    if (status === 'success') setStatus('idle')
  }

  function handleBlur(field: Field) {
    setErrors((e) => ({ ...e, [field.id]: validate(field, values[field.id] ?? '') }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = Object.fromEntries(form.fields.map((f) => [f.id, validate(f, values[f.id] ?? '')]))
    setErrors(next)
    const firstInvalid = form.fields.find((f) => next[f.id])
    if (firstInvalid) {
      setStatus('error')
      document.getElementById(fieldId(firstInvalid))?.focus()
    } else {
      setStatus('success')
      setValues({})
    }
  }


  return (
    <main className="pb-12">
      <section className={container}>
        <SectionTitle as="h1" title={contact.title} />
        <p className="mt-3 max-w-prose text-lg text-text-muted">{contact.intro}</p>
      </section>


      <section className={`${container} grid gap-8 lg:grid-cols-2`}>
        <div>
          <h2 className="text-h3 leading-[1.2] font-bold">{details.title}</h2>
          <address className="mt-4 flex flex-col gap-2 not-italic">
            <span>{details.address}</span>
            <a href={`mailto:${details.email}`} className="font-semibold hover:text-accent hover:underline">
              {details.email}
            </a>
            <a
              href={`tel:${details.phone.replace(/\s/g, '')}`}
              className="font-semibold hover:text-accent hover:underline"
            >
              {details.phone}
            </a>
          </address>
          <div
            role="img"
            aria-label={map.title}
            className="mt-6 flex aspect-video items-center justify-center rounded-card border border-border bg-surface text-text-muted"
          >
            {map.placeholder}
          </div>
        </div>


        <form
          id={form.id}
          aria-labelledby={`${form.id}-title`}
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <h2 id={`${form.id}-title`} className="text-h3 leading-[1.2] font-bold">
            {form.title}
          </h2>
          {form.fields.map((field) => (
            <FormField
              key={field.id}
              id={fieldId(field)}
              name={field.id}
              type={field.type}
              label={field.label}
              placeholder={field.placeholder}
              required={field.required}
              value={values[field.id] ?? ''}
              error={errors[field.id] || undefined}
              onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(field, event.target.value)}
              onBlur={() => handleBlur(field)}
            />
          ))}
          <p role="alert" className="font-semibold text-error empty:hidden">
            {status === 'error' ? form.error : ''}
          </p>
          <p role="status" className="font-semibold text-success empty:hidden">
            {status === 'success' ? form.success : ''}
          </p>
          <Button type="submit" className="self-start">
            {form.submit}
          </Button>
        </form>
      </section>


      <section id={joinUs.anchor} className={container} aria-labelledby={`${joinUs.anchor}-title`}>
        <SectionTitle id={`${joinUs.anchor}-title`} title={joinUs.title} />
        <p className="mt-3 max-w-prose text-lg text-text-muted">{joinUs.intro}</p>
        <ol className="mt-6 grid gap-6 md:grid-cols-3">
          {joinUs.steps.map((step, index) => (
            <li key={step.id} className="rounded-card border border-border bg-white p-4">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-3 text-xl leading-[1.2] font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-normal text-text-muted">{step.description}</p>
            </li>
          ))}
        </ol>
        <Button
          type="button"
          variant="primary"
          className="mt-6"
          onClick={() => document.getElementById(form.id)?.scrollIntoView?.({ behavior: 'smooth' })}
        >
          {joinUs.cta.label}
        </Button>
      </section>
    </main>
  )
}
