# Data Schema

*Owner: Team C (structure), Team A (content). Checked against `src/lib/types.ts` and the JSON files.*

The content of the site is eight JSON files per language in `src/data/en` and `src/data/it`. The file names and the ids are the same in both folders. Text fields are translated; ids, links, dates and numbers are identical. All content is placeholder content (D-13).

The TypeScript types of every file are in `src/lib/types.ts`. They are the reference when this document and the code disagree.

## Rules for every file

- Ids are lowercase with a number: `proj-001`, `pers-001`, `news-001`, `part-001`, `schol-001`. Ids of projects, people and news are unique across the site.
- Dates are `YYYY-MM-DD`. A project's `year` is a whole number.
- Images are paths under `/images/` and the file must exist in `public/images/`. Every image shown with content has alt text (the title or name, or an `imageAlt` field); decorative images have empty alt text.
- Links are an internal route (`/projects`, `/about#background`), an external URL, or `#` as a placeholder.
- Sections that the menu links to have an `anchor` field: the id of the section in the page.
- Placeholder content must read like real content: realistic names and complete sentences, no template text (D-22).
- The three list files (`people`, `projects`, `news`) have the structure `{ title, intro, emptyState, items[] }` (D-24).

## Fixed value lists (D-18)

Wireframes, data files and tests use the same words. A different value fails `npm run test`.

| Field | Allowed values |
|---|---|
| Project `status` | `planned`, `active`, `completed`, `cancelled` |
| News `type` | `news`, `event` |
| News `language` | `en`, `it`, `both` (shown as EN, IT, EN + IT) |
| Person `group` | `board`, `committee`, `members` |

The filter lists in `site.json` (`filters.status`, `filters.type`, `filters.language`, `groups`) must contain exactly these values in this order. Only their labels are translated.

## Files

### `site.json`: shared texts and menu

| Field | Content |
|---|---|
| `logo` | `text`, `link` |
| `nav[]` | `id`, `label`, `link`, and either `children[]` (`id`, `label`, `link`; may be empty) or `dynamicChildren` (`source`: `projects` or `news`, `limit`, `viewAll`: `label`, `link`) |
| `search` | `label`, `placeholder`, `enabled` (`false`: the icon is shown disabled) |
| `languageSwitch` | `label`, `options[]` (`code`, `label`) |
| `footer` | `description`, `contact` (`title`, `address`, `email`, `phone`), `quickLinks` (`title`, `items[]`: `label`, `link`), `social[]` (`id`, `icon`, `label`, `link`), `university` (`label`, `link`), `copyright` |
| `filters` | `all`, `status`, `theme`, `type`, `language` (each: `label`, `options[]` with `value`, `label`), `year` (`label` only; the years are built from the news dates) |
| `groups[]` | `value`, `label` for the People page sections |
| `notFound` | `title`, `text`, `cta` (`label`, `link`) |

The themes are `theme-01` to `theme-05` in `filters.theme.options`.

### `home.json`: Home

`hero` (`title`, `mission`, `image`, `imageAlt`, `ctas[]`), `features[4]` (`id`, `icon`, `title`, `description`, `link`), `mission` (`image`, `imageAlt`, `title`, `sentences[3]`, `readMore`), `latest` (`title`, `seeAll`, `count`). The feature `icon` is a key the card maps to an icon: `projects`, `people`, `news` or `about`; an unknown key shows an empty tile. `latest.count` is how many of the newest news items the Home page shows.

### `about.json`: About us

`title`, `intro`, `image`, `imageAlt`, then:

- `missionVision`: `anchor`, `title`, `intro`, `items[]` (`id`, `title`, `text`, `points[]`). The item ids (`mission`, `vision`) are also element ids, so `/about#mission` scrolls to the first card.
- `background`: `anchor`, `title`, `paragraphs[]`.
- `regulations`: `anchor`, `title`, `description`, `file` (`label`, `path`, `type` = `pdf`, `size` in bytes), `downloadLabel`. The button text is built as "downloadLabel PDF (label, size)".
- `cta`: `title`, `text`, `label`, `link`.

### `people.json`: People

List file. Item: `id`, `name`, `role`, `department`, `topics[]` (theme ids), `photo`, `email`, `group`, and the optional `profilelink` (external URL, opens in a new tab; without it the card has no Profile button). The `board` and `committee` groups are shown as person cards; `members` are shown as small cards with name and department.

### `networking.json`: Networking

`title`, `intro`, then:

- `partners`: `anchor`, `title`, `items[]` (`id`, `name`, `text`, `logo`, `tags[]`, `link`).
- `scholars`: `anchor`, `title`, `items[]` (`id`, `name`, `role`, `institution`, `period`, `photo`, `link`), `apply` (`title`, `text`, `label`, `link`).

A partner or scholar card is a plain card while its `link` is `#`, and a link over the whole card otherwise.

### `projects.json`: Projects

List file. Item: `id`, `title`, `summary`, `theme`, `status`, `year`, `people[]` (ids of `people.json`), `image`, `link`, `featured`.

### `news.json`: News and events

List file. Item: `id`, `type`, `title`, `date`, `location`, `summary`, `image`, `link`, `language`.

### `contact.json`: Contact and join us

`title`, `intro`, `details` (`title`, `address`, `email`, `phone`), `map` (`title`, `placeholder`, `link`), `form`, `joinUs`.

- `form`: `id`, `title`, `fields[]`, `submit`, `success`, `error`. A field has `id`, `type` (`text`, `email` or `textarea`), `label`, `placeholder`, `required`, `errorMessage`. The error message is shown when a required field is empty or an email is not valid, so optional fields keep it empty.
- `joinUs`: `anchor`, `title`, `intro`, `steps[3]` (`id`, `title`, `description`), `cta` (`label`, `link`).

## Relations

- `projects.people[]` contains ids of `people.json`. An unknown id fails the data test; the project page would skip it.
- `projects.theme` and `people.topics[]` use the same list of themes (`site.json > filters.theme`).
- The Projects and News dropdowns show the newest items of `projects.json` (by `year`) and `news.json` (by `date`), as set in `nav[].dynamicChildren`. The Home page shows the newest `latest.count` news items.
- The year filter of News and events is built from the `date` values.
- A news item with `language: both` appears under both the English and the Italian filter. The language filter has the options All, English and Italian; `both` is only a card label.

## Behaviour to know about

- **Italian fallback.** Where an Italian value is missing, `null` or an empty string, the site shows the English value. The English file decides which fields and list items exist; list items are matched by `id` (or by position if they have no id). An item that exists only in Italian is ignored. See [ARCHITECTURE.md](ARCHITECTURE.md#data-flow).
- **Featured project.** Only the first project with `featured: true` is shown as the wide card at the top of the Projects page. The flag on other projects has no effect. At the moment three projects have `featured: true` in both languages.
- **Fields not used by the UI yet.** `projects.items[].link`, `news.items[].link`, `contact.map.link` and `contact.joinUs.cta.link` are present in the data and types but no page displays them (all are `#` or replaced by other behaviour). They are reserved for the real site.

## How to change content

1. Edit the file in `src/data/en` and make the same change in `src/data/it` (same ids, same structure).
2. New item: use the next id of that file (`news-007`), copy an existing item, and use only the fixed values above. Put new images in `public/images/` and start the path with `/images/`.
3. New theme: add the option to `filters.theme.options` in both `site.json` files with the next `theme-NN` value.
4. Run `npm run test`. The messages name the file and the field that is wrong.

## Checks (automatic)

`npm run test` covers the data with these tests (all in `src/lib`):

| Test file | What it checks |
|---|---|
| `data.test.ts` | Every file exists in English and Italian; Italian has the same structure as English; ids of projects, people and news match; the menu has the five entries of the sitemap; references are valid (project people and themes, person topics, statuses); the fixed list sizes (4 features, 3 mission sentences, 3 join-us steps); the English fallback and the newest-first helpers work. |
| `data-integrity.test.ts` | The same ids in both languages and no duplicate ids; the fixed value lists; ISO dates and integer years; every image exists in `public/`; no template text (lorem ipsum, "Name Surname", zeroed phone numbers and similar). |
| `internal-links.test.ts` | Every internal link in the data reaches a real route, and every `#anchor` exists in the data of the target page, in both languages. |
