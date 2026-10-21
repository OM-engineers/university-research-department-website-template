# University Research Department Website Template

Training prototype: study based on a real project for a University Research Department. Placeholder content only (D-13): no real data, names or logos.

Internship prototype (15 working days), the visual and functional blueprint for a later rebuild. It is not an official deliverable. Made by a team of 9 students during a 3-week training internship. Use it as a starting point, as a study case, or as a template for your own project.

**Repository:** <https://github.com/OM-engineers/university-research-department-website-template>

## Routes

| Route | Page | Priority |
|---|---|---|
| `/` | Home | Must |
| `/about` | About us | Must |
| `/people` | People (About us > Team) | Must |
| `/networking` | Networking | Must |
| `/projects` | Projects | Must |
| `/projects/:id` | Project detail | Should |
| `/news` | News and events | Must |
| `/news/:id` | News or event detail | Should |
| `/contact` | Contact and join us (About us > Contact and join us) | Must |
| `*` | Not found (404) | Must |

Menu: Home | About us ▾ | Networking ▾ | Projects ▾ | News and events ▾ (see `docs/ARCHITECTURE.md`).

## Requirements

- Node.js 24 (file `.nvmrc`) and Git

## How to run

```bash
git clone <repository-url>
cd university-research-department-website-template
npm install
npm run dev          # open the address shown, usually http://localhost:5173
npm run build && npm run preview
npm run check        # before every pull request: lint, typecheck, test, build
```

## Publish on GitHub Pages

1. Settings, Pages, Source: **GitHub Actions** (only once).
2. Actions, **Deploy to GitHub Pages**, Run workflow.
3. The address is shown at the end of the run: `https://<owner>.github.io/<repository-name>/`.

Details in `docs/ARCHITECTURE.md` (Publishing on GitHub Pages).

## Documentation

- `docs/TECH_SPEC.md`, `docs/ARCHITECTURE.md`, `docs/DATA_SCHEMA.md`
- `CONTRIBUTING.md`: branches, commits, pull requests

## Use this template

On GitHub press **Use this template**, then **Create a new repository**. Keep the repository name `university-research-department-website-template` if you want to publish it with GitHub Pages without changing the configuration.

## Credits

Built by 9 students (three teams: UX and content, frontend and UI, tech and QA) in a training internship. Placeholder content only: no real data, names, photos or logos.

- Code: MIT License (see `LICENSE`).
- Font: Inter, SIL Open Font License 1.1 (package `@fontsource/inter`).
- Images and icons: placeholders made for this project.
