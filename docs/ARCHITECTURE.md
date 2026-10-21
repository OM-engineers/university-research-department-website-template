# Architecture

*Owner: Team C. Update whenever the structure changes.*

## Approved sitemap

| ID | Page | Route |
|---|---|---|
| S-01 | Home | `/` |
| S-02 | Research / Projects | `/projects` |
| S-03 | People | `/people` |
| S-04 | News / Events | `/news` |
| S-05 | About | `/about` |
| S-06 | Contact | `/contact` |
| S-07 | Project detail | `/projects/:id` |
| S-08 | News / event detail | `/news/:id` |
| S-09 | Networking | `/networking` |

## Project structure

This is the folder structure of the project. It should match the Architecture sketch and `docs/TECH_SPEC.md`.

```text
project-root/
├── src/
│   ├── components/ # Shared UI components (names match the Component_Inventory)
│   ├── pages/ # One file per route/page
│   ├── data/
│   │   ├── en/ # English JSON content
│   │   └── it/ # Italian JSON content
│   ├── networking/ # Networking-related functionality
│   ├── index.css # Global styles and @theme design tokens
│   └── lib/ # Shared utilities and helpers
├── public/
│   ├── images/ # Images
│   ├── icons/ # Icons
│   └── fonts/ # Fonts
└── docs/ # Project documentation
```

## Folders and responsibilities

| Folder | What lives here | Who mostly works here |
|---|---|---|
| `src/components` | Reusable/shared UI components. Component names must match the `Component_Inventory`. | B |
| `src/pages` | Route-level page components, one file per page. | B, with A for content |
| `src/data/en` | English JSON content. | A |
| `src/data/it` | Italian JSON content. | A |
| `src/networking` | Networking-related functionality. | B |
| `src/index.css` | Global styles and `@theme` design tokens. | B |
| `src/lib` | Shared utilities and helper functions. | B |
| `public/images` | Static images and visual assets. | B |
| `public/icons` | Static icons and icon assets. | B |
| `public/fonts` | Local font files. | B |
| `docs` | Project documentation. | C |

## Data flow

The application loads structured content from localized JSON files in `src/data/en` or `src/data/it`.

When a user opens a route, the router selects the corresponding page component from `src/pages`. The page component reads the required data and passes it to reusable UI components from `src/components`.

The components combine the content with global styles and design tokens defined in `src/index.css`. Networking-related functionality belongs in `src/networking`, while reusable utilities belong in `src/lib`.

The final result is rendered in the browser as the requested page.

## Routing

The application uses client-side routing to map URLs to page components in `src/pages`.

- `/` opens the Home page.
- `/projects` opens the Research & Projects page.
- `/projects/:id` opens the detail page for a specific project (S-07).
- `/people` opens the People page.
- `/news` opens the News & Events page.
- `/news/:id` opens the detail page for a specific news item or event (S-08).
- `/about` opens the About page.
- `/contact` opens the Contact page.
- `/networking` opens the Networking page (S-09).
- Any URL that does not match an existing route opens the Not Found (404) page.

### Routes

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

### Adding a page

To add a new page:

1. Add the page component to `src/pages`.
2. Add the corresponding route to the router.
3. Add the page to the sitemap and routes table.
4. Add or update the required localized content in `src/data/en` and/or `src/data/it`.
5. Add navigation links where appropriate.
6. Reuse existing components from `src/components` whenever possible.
7. Update this document and the Architecture sketch if the project structure or routes change.

## Build and run

### How to run

1. Install Node.js LTS (the version specified in the Stack table) and Git.
2. Clone the repository and open the project folder.

```bash
git clone <repository-url>
cd <project-folder>
```

3. Install the project dependencies.

```bash
npm install
```

4. Start the development server.

```bash
npm run dev
```

Open the address shown in the terminal, usually `http://localhost:5173`.

5. Build and preview the production version.

```bash
npm run build
npm run preview
```

Use the address shown by `npm run preview` to check the production build. Do not open `dist/index.html` by double-clicking it.

6. Before every pull request, run the project check command.

```bash
npm run check
```

This command should pass before the pull request is submitted. The GitHub Actions workflow should also run the project's configured checks.

### Publishing on GitHub Pages

The site is a static build, so it can be published on GitHub Pages. A project page lives in a sub-folder (`https://<owner>.github.io/<repository-name>/`), which has three consequences, all handled in the code:

- **Base folder.** `vite.config.ts` reads the variable `VITE_BASE` (default `/`). The workflow sets it to `/<repository-name>/`, and `main.tsx` gives the same folder to the router (`basename`).
- **Files of `public/`.** The data files keep plain paths such as `/images/placeholders/photo-4x5.svg`. `src/lib/base.ts` (`prefixAssets`, called in `getData`) adds the base folder in front of the paths that start with `/images/`, `/files/`, `/icons/` or `/fonts/`. Routes (`/projects`) are not changed, the router does that.
- **Reloading a page.** GitHub Pages shows `404.html` for an address it does not know. The workflow copies `index.html` to `404.html`, so a reload on `/projects/proj-001` opens the app.

To test it on your computer (PowerShell, one line at a time):

```bash
$env:VITE_BASE="/my-repo/"
npm run build
npm run preview
```

Open the address shown by `npm run preview` and add `/my-repo/`. The workflow `.github/workflows/pages.yml` is started by hand (Actions, Deploy to GitHub Pages, Run workflow) after Settings, Pages, Source: GitHub Actions. If you add a file to a data path, keep it in `public/images`, `public/files`, `public/icons` or `public/fonts`.

## Architecture rules

- Keep the folder structure consistent with the Architecture sketch.
- Keep shared UI in `src/components`.
- Keep route-level page components in `src/pages`.
- Keep localized content in `src/data/en` and `src/data/it`.
- Keep global design tokens and styles in `src/index.css` using `@theme`.
- Put networking-related functionality in `src/networking`.
- Put reusable utilities in `src/lib`.
- Keep static assets in the appropriate `public` subfolder.
- Do not create duplicate or parallel folder structures.
- Do not reference `src/styles`; shared styles and design tokens belong in `src/index.css`.
- Run `npm run check` before every pull request.
- When the structure or routes change, update this document and the Architecture sketch.
