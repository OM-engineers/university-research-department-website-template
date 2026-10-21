import { useParams } from 'react-router'
import { BackLink } from '../components/BackLink'
import { DetailsPanel } from '../components/DetailsPanel'
import { Label } from '../components/Label'
import { formatDate, LANGUAGE_LABEL } from '../lib/format'
import { useData, useLang, useUi } from '../lib/lang'
import { NotFoundPage } from './NotFound'

/** S-08: one news item or event of news.json, found by the :id of the route. Unknown ids show the 404 page. */
export function NewsDetailPage() {
  const { id } = useParams()
  const { lang } = useLang()
  const ui = useUi()
  const item = useData('news').items.find((n) => n.id === id)

  if (!item) return <NotFoundPage />

  return (
    <main className="mx-auto w-full max-w-300 px-4 pt-12 pb-12 sm:px-6 lg:px-10">
      <BackLink to="/news">{ui.backToNews}</BackLink>

      <article className="mt-6">
        <ul className="flex flex-wrap gap-1.5">
          <Label>{ui.newsType[item.type]}</Label>
          <Label>{LANGUAGE_LABEL[item.language]}</Label>
        </ul>
        <h1 className="mt-3 max-w-[22ch] text-h1 leading-[1.1] font-bold">{item.title}</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <img
              src={item.image}
              alt={item.title}
              className="aspect-video w-full rounded-card bg-surface object-cover"
            />
            <p className="mt-6 max-w-prose text-lg leading-normal">{item.summary}</p>
          </div>

          <DetailsPanel
            id="news-details"
            title={ui.details}
            items={[
              { label: ui.date, value: <time dateTime={item.date}>{formatDate(item.date, lang)}</time> },
              { label: ui.location, value: item.location },
            ]}
          />
        </div>
      </article>
    </main>
  )
}
