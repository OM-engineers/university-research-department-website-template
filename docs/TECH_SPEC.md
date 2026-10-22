# Tech Spec

Oct 6, 2026 · Team C · Version: v3 · Saved as: 2026-10-06_C_TechSpec_v3.docx · Also in the repository: docs/TECH_SPEC.md

Final review: the stack, structure, conventions and schema below were checked against the code. Changes from v3 are listed at the end of this document.

## Overview

A client-side single-page app built with React and styled with Tailwind CSS, written in TypeScript and bundled with Vite. There is no backend: content is JSON bundled at build time (see [ARCHITECTURE.md](ARCHITECTURE.md)).

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. React + Vite + Tailwind + TypeScript | Type safety, utility classes, fast build; the team knows React | Four tools to learn in week 1 for 9 people; Tailwind needs the tokens of T04 | Chosen (D-01). In use at the final review; the JavaScript fallback (option B) was not needed. |
| B. React + Vite + plain CSS + JavaScript | Fewer tools, quicker for Team B | No type checking; CSS discipline needed | Not used. Was the fallback if TypeScript blocked Team B (decision on Day 6). |
| C. Static HTML, CSS and JavaScript | Zero tooling; closest to Google Sites | No components or routing; duplicated code | Rejected |
| D. Next.js or Astro | Content and routing features | Server concepts; overkill for a prototype | Rejected |

## Stack

Versions are the latest stable on the npm registry as of 6 Oct 2026. `package.json` allows minor and patch updates (`^`); `package-lock.json` is committed and fixes the exact versions.

| Layer | Choice | Version |
|---|---|---|
| UI library | React | 19.3 |
| Styling | Tailwind CSS (CSS-first config, `@tailwindcss/vite`) | 4.3 |
| Language | TypeScript | 7.0 |
| Build / dev server | Vite | 8.3 |
| Routing | React Router | 8.4 |
| Unit / component tests | Vitest and React Testing Library (jsdom) | Vitest 5.0 / Testing Library 16.3 |
| Linting | oxlint (D-19) | 1.87 |
| Formatting | Prettier | 3.9 |
| Font | Inter through `@fontsource/inter` (see open item 1) | 5.3 |
| Runtime | Node.js LTS, the same version for everyone until the end of the internship (do not move to 26) | 24 |

## Tooling & conventions

**Linting and formatting.** oxlint (config in `.oxlintrc.json`: React, TypeScript and oxc plugins, `rules-of-hooks` as error, `only-export-components` as warning). Prettier 3 (config in `.prettierrc`: single quotes, semicolons, trailing commas, 100 columns). Prettier is **not** part of `npm run check` and `prettier-plugin-tailwindcss` is installed but not enabled in `.prettierrc` (see open item 4).

**TypeScript.** `tsc -b` with `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` and `verbatimModuleSyntax`. Use `import type` for types.

**Package manager.** npm, lockfile committed. CI installs with `npm ci`.

**Quality gate.** Before every pull request run `npm run check`: lint, typecheck, tests (data, utility functions, components, pages) and the production build, in this order. The **Check** GitHub Actions workflow runs the same command for every pull request and every push to `main` (D-23). A second workflow checks the pull request description.

**Structure.** `src/components` (shared UI, names as in the Component_Inventory), `src/pages` (one file per route), `src/data` (`en` and `it` folders with JSON), `src/lib` (data loading, language, filters, formatting, types, interface strings), `src/index.css` (global styles and `@theme` design tokens), `public` (images, PDF, favicon). This matches [ARCHITECTURE.md](ARCHITECTURE.md). Do not create a separate `src/styles` directory or duplicate global styling locations.

**Styling.** Utility classes in JSX. Design tokens (colours, spacing, fonts, radius, focus ring) are `@theme static` variables in `src/index.css`. A test fails if a component uses a hand-written colour.

**Components.** Function components, one exported component per file (small private helper components may share its file), co-located `*.test.tsx` files where applicable. `App` is the only default export.

## Targets

| Area | Target |
|---|---|
| Browsers | Last 2 versions of Chrome, Edge, Firefox, Safari (Tailwind 4 needs Safari 16.4+) |
| Accessibility | WCAG 2.2 AA; keyboard-navigable, visible focus states |
| Responsive | Mobile-first, Tailwind default breakpoints (`sm` 640 px to `2xl` 1536 px) |
| Deployment | Static build (`dist/`). Published on GitHub Pages with the workflow `.github/workflows/pages.yml` (see `docs/ARCHITECTURE.md`, Publishing on GitHub Pages). Any other host must serve `index.html` for unknown paths and, if the site is not at the domain root, the base folder must be set with `VITE_BASE`. |

## Data schema

The content files, fields, fixed value lists and relations are documented in [DATA_SCHEMA.md](DATA_SCHEMA.md), which replaces the short table of v3 (it listed fields of three files only and described the people `group` field as "to be added"; it exists and is required).

## Routes

| Route | Page | Sitemap ID | Priority |
|---|---|---|---|
| `/` | Home | S-01 | Must |
| `/projects` | Research & Projects | S-02 | Must |
| `/projects/:id` | Project detail | S-07 | Should |
| `/people` | People | S-03 | Must |
| `/news` | News & Events | S-04 | Must |
| `/news/:id` | News / event detail | S-08 | Should |
| `/about` | About | S-05 | Must |
| `/contact` | Contact | S-06 | Must |
| `/networking` | Networking | S-09 | Must |
| `*` | Not found (404) | - | Must |

## Internationalisation (D-04)

English by default with an IT | EN switch in the header. The selected language is saved in the browser (`localStorage`, key `lang`) and set on `<html lang>`. Texts of the pages live in `src/data/en` and `src/data/it` (same file names, same ids); interface labels that are not content live in `src/lib/ui.ts`, one dictionary per language. If an Italian text is missing or empty, the English text is shown. Dates and file sizes are formatted for the current language (`Intl`). How the fallback works is described in [ARCHITECTURE.md](ARCHITECTURE.md#data-flow).

## Risks

Recorded during planning.

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TypeScript is new for part of the team | Medium | High | Keep types simple; Team C supports; decide on Day 6 whether to fall back to JavaScript (option B) |
| Tailwind tokens not frozen before Day 5 | Medium | Medium | Tokens come from T04; one file (`src/index.css`); Team B owns the values |
| Different Node versions on laptops | Medium | High | One Node LTS for all; README tested on a clean machine on Day 6 |
| Merge conflicts | Medium | Medium | Small branches, one owner per file, merge to main every day |
| Missing content or photos | High | Medium | Representative content labelled as such; alt text from the start |
| Google Sites handoff gap | Medium | Medium | Write notes from day one in `docs/HANDOFF_NOTES.md` |

## How to run

The full guide is in the [README](../README.md). In short: install Node.js 24 and Git, clone the repository, then

```bash
npm install
npm run dev        # development server, usually http://localhost:5173
npm run build && npm run preview   # production build; do not open dist/index.html directly
npm run check      # before every pull request
```

## Known limitations and open items

Found while checking the documentation against the code in the final review. None of them stops `npm run check`. Items 1 to 3 are quick fixes in the code; the others need a team decision or a separate pull request.

| # | Finding | Proposed fix |
|---|---|---|
| 1 | **Inter is not loaded.** `--font-sans` starts with "Inter" and `@fontsource/inter` is a dependency, but no file imports it and the build output has no `@font-face`. Browsers use `system-ui` unless Inter is installed on the computer. | In `src/main.tsx` add `import '@fontsource/inter/400.css'`, `.../600.css` and `.../700.css` (the weights of the tokens). |
| 2 | **Page title.** Done in the template: `index.html` has the title "University Research Department". | Change it to your site name. |
| 3 | **No skip link.** `ui.skipToContent` exists in both languages but no component renders it, while the target is WCAG 2.2 AA (bypass blocks). `ui.openMap` and `ui.errorTitle` are also unused, and there is no error boundary. | Render the skip link first in `HeaderNav`, pointing to the page's `<main>`; remove or use the other strings. |
| 4 | **Prettier is not enforced.** The Tailwind class-sorting plugin is not in `.prettierrc`, `format` is not in `check`, and 69 files currently differ from the configured style (for example quote style). `npm run format` rewrites the whole repository, including documentation and JSON. | Decide whether to enforce it. If yes: add `"plugins": ["prettier-plugin-tailwindcss"]`, run `npm run format` once in a pull request with no other changes, then add `prettier --check .` to `check`. |
| 5 | **Test gaps.** The `News.tsx` page has no test of its own (`lib/news-filters.test.tsx` tests the filters with a copy of the wiring). `src/anchors.test.tsx` and `src/lib/anchors.test.tsx` cover the same anchors. | Add a News page test; merge the two anchor tests. |
| 6 | **Three featured projects.** `proj-001`, `proj-003` and `proj-006` have `featured: true`; the Projects page shows only the first as the wide card. | Keep one featured project in the data, or decide that the page shows several. |
| 7 | **Hosting.** Solved in the template: the workflow `pages.yml` publishes the site on GitHub Pages and the code handles the base folder. Another host needs its own configuration (fallback to `index.html`, base folder). | Only if you do not use GitHub Pages. |
| 8 | **Placeholders left in the UI.** Footer social links show line icons (Facebook, Instagram, LinkedIn) but link to `#`. `public/icons.svg` is a leftover of the Vite template and is not used. The map is a text box. `link` fields of projects, news, map and the join-us button are not used. | Replace with real icons, links and a map when the real content exists. Remove `public/icons.svg` if it is not needed. |
| 9 | **Contact form does not submit.** It validates and shows the success message only. | Connect it to a form service or backend in the real site. For the Google Sites rebuild see `HANDOFF_NOTES.md` (embedded Google Form). |

## Changes from v3

- Structure: removed `src/networking`, `public/icons` and `public/fonts`, which do not exist. Added `src/lib`, `.github`, `public/files` and `public/images/placeholders`.
- Tooling: described what the Prettier and oxlint configuration actually does; the Tailwind class-sorting plugin is installed but not enabled.
- Data schema: replaced the outdated table with a pointer to `DATA_SCHEMA.md`.
- i18n: documented the `ui.ts` dictionaries, the language storage key and the exact fallback rule.
- Verdict of option A/B updated: TypeScript is in use.
- "How to run" shortened to the essentials and pointed to the README, so that there is one full copy instead of three.
- Added: quality gate and CI, deployment requirements, known limitations and open items.
