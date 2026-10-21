# Tech Spec

Oct 6, 2026 · Team C · Version: v3 · Saved as: 2026-10-06_C_TechSpec_v3.docx · Also in the repository: docs/TECH_SPEC.md

## Overview

A client-side single-page app built with React and styled with Tailwind CSS, written in TypeScript and bundled with Vite.

## Options considered

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| A. React + Vite + Tailwind + TypeScript | Type safety, utility classes, fast build; the team knows React | Four tools to learn in week 1 for 9 people; Tailwind needs the tokens of T04 | Chosen (D-01) |
| B. React + Vite + plain CSS + JavaScript | Fewer tools, quicker for Team B | No type checking; CSS discipline needed | Fallback: decide on Day 6 if TypeScript blocks Team B |
| C. Static HTML, CSS and JavaScript | Zero tooling; closest to Google Sites | No components or routing; duplicated code | Rejected |
| D. Next.js or Astro | Content and routing features | Server concepts; overkill for a prototype | Rejected |

## Stack

Pin majors in `package.json`; versions are the latest stable on the npm registry as of 6 Oct 2026.

| Layer | Choice | Version |
|---|---|---|
| UI library | React | 19.3 |
| Styling | Tailwind CSS (CSS-first config, `@tailwindcss/vite`) | 4.3 |
| Language | TypeScript | 7.0 |
| Build / dev server | Vite | 8.3 |
| Routing | React Router | 8.4 |
| Unit / component tests | Vitest and React Testing Library | Vitest 5.0 / Testing Library 16.3 |
| Runtime | Node.js LTS, the same version for everyone until the end of the internship (do not move to 26) | 24 |

## Tooling & conventions

oxlint (D-19, config in .oxlintrc.json) Prettier 3 with `prettier-plugin-tailwindcss` for class ordering.

Package manager: npm, lockfile committed. Before every pull request, run `npm run check` locally. This check should cover linting, type checking, tests for data, utility functions, components and pages, and the production build. The GitHub Actions workflow also runs the configured checks for pull requests.

Structure: `src/components` (shared UI, names as in the Component_Inventory), `src/pages` (one file per route), `src/data` (`en` and `it` folders with JSON), `src/networking` (networking-related functionality), `src/index.css` (global styles and `@theme` design tokens), `src/lib` (utilities), and `public` (images, icons, fonts). This structure should match `docs/ARCHITECTURE.md` and the Architecture sketch.

Styling: utility classes in JSX; design tokens (colors, spacing, fonts) as `@theme` variables in `src/index.css`. Do not create a separate `src/styles` directory or duplicate global styling locations.

Components: function components only, named exports, one component per file, co-located `*.test.tsx` files where applicable.

## Targets

| Area | Target |
|---|---|
| Browsers | Last 2 versions of Chrome, Edge, Firefox, Safari (Tailwind 4 needs Safari 16.4+) |
| Accessibility | WCAG 2.2 AA; keyboard-navigable, visible focus states |
| Responsive | Mobile-first, Tailwind default breakpoints (`sm` 640 px to `2xl` 1536 px) |
| Deployment | Static build (`dist/`). A zipped build can be shared at each milestone. Hosted previews are optional. |

## Data schema (from the Architecture sketch)

| Entity | Fields | Notes |
|---|---|---|
| News (`news.json`) | `id`, `type` (`news` or `event`), `title`, `date` (`YYYY-MM-DD`), `location`, `summary`, `image` (path), `link` | One file per language with the same ids |
| People (`people.json`) | `id`, `name`, `role`, `department`, `topics[]`, `photo` (path), `email`, `profilelink` | Groups: `board`, `committee`, `members` (`group` field to be added) |
| Projects (`projects.json`) | `id`, `title`, `summary`, `theme`, `status`, `year`, `people[]`, `image` (path), `link` | Use one list of themes for projects and people topics |

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

English by default with an IT | EN switch in the header. The selected language is saved in the browser. Texts of the pages live in `src/data/en` and `src/data/it` (same file names, same ids); interface labels live in one dictionary per language. If an Italian text is missing, the English text is shown.

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| TypeScript is new for part of the team | Medium | High | Keep types simple; Team C supports; decide on Day 6 whether to fall back to JavaScript (option B) |
| Tailwind tokens not frozen before Day 5 | Medium | Medium | Tokens come from T04; one file (`src/index.css`); Team B owns the values |
| Different Node versions on laptops | Medium | High | One Node LTS for all; README tested on a clean machine on Day 6 |
| Merge conflicts | Medium | Medium | Small branches, one owner per file, merge to main every day |
| Missing content or photos | High | Medium | Representative content labelled as such; alt text from the start |
| Google Sites handoff gap | Medium | Medium | Write notes from day one in `docs/HANDOFF_NOTES.md` |

## How to run

1. Install Node.js LTS (the version in the Stack table) and Git.
2. Clone the repository and open the folder.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open the address shown in the terminal (usually `http://localhost:5173`).

5. Build and preview the production version:

   ```bash
   npm run build
   npm run preview
   ```

   Use the address shown by `npm run preview` to check the production build. Do not open `dist/index.html` by double-clicking it.

6. Before every pull request, run:

   ```bash
   npm run check
   ```

   The check should pass locally, and the GitHub Actions workflow should pass for the pull request.
