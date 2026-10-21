import { Button } from '../components/Button'
import { SectionTitle } from '../components/SectionTitle'
import { useData } from '../lib/lang'

/** 404: text and link back to Home come from site.json > notFound. */
export function NotFoundPage() {
  const { notFound } = useData('site')
  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <SectionTitle as="h1" title={notFound.title} />
      <p className="mt-3 max-w-prose text-lg text-text-muted">{notFound.text}</p>
      <Button to={notFound.cta.link} className="mt-6">
        {notFound.cta.label}
      </Button>
    </main>
  )
}
