# Data Schema


Eight JSON files per language in `src/data/en` and `src/data/it`. Same file names, same ids. Text fields are translated; ids, links, dates and numbers are identical. All content is placeholder (D-13).


## Rules for every file

- ids are lowercase with a number: `proj-001`, `pers-001`, `news-001`, `part-001`, `schol-001`.
- Dates are `YYYY-MM-DD`. Images are paths under `/images/`. Every image has alt text where it is shown.
- `language` of a news item: `en`, `it` or `both` (shown as EN, IT, EN + IT).
- Sections reached from the menu have an `anchor` field (the id of the section in the page).


## Files

| File | Content | Main fields |
|---|---|---|
| site.json | Logo, menu (with dropdowns), search, language switch, footer, filter labels, 404 text | nav[]: id, label, link, children[] or dynamicChildren {source, limit, viewAll} |
| home.json | Home page | hero {title, mission, image, ctas[]}, features[4], mission {sentences[3], readMore}, latest {title, seeAll, count} |
| about.json | About us | mission and vision {anchor, title, intro, items[]: id, title, text, points[3]}, background {anchor, title, paragraphs[]} (image and imageAlt at the top of the file), regulations {anchor, file {label, path, type, size in bytes}, downloadLabel}, cta |
| people.json | People (list) | id, name, role, department, topics[], photo, email, profilelink (optional, external URL), group (board, committee, members) |
| networking.json | Networking | partners {anchor, items[]: id, name, text, logo, tags[], link}, scholars {anchor, items[]: id, name, role, institution, period, photo, link; apply {title, text, label, link}} |
| projects.json | Projects (list) | id, title, summary, theme, status (planned, active, completed, cancelled), year, people[] (ids), image, link, featured |
| news.json | News and events (list) | id, type (news, event), title, date, location, summary, image, link, language |
| contact.json | Contact and join us | details {address, email, phone}, map, form {id, fields[], submit, success, error}, joinUs {anchor, steps[3], cta} |


## Relations

- `projects.people[]` contains ids of `people.json`.
- `projects.theme` and `people.topics[]` use the same list of themes (`site.json > filters.theme`).
- The Projects and News dropdowns read the 3 newest items of `projects.json` and `news.json` (`dynamicChildren`).
- The year filter of News and events is built from the `date` values.


## Checks (automatic)

`src/lib/data.test.ts` checks that every file exists in both languages, that the ids of projects, people and news are the same in English and Italian, and that the menu has the five entries of the sitemap. Run with `npm run test`.
