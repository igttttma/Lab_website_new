# PHOENIX Lab Website

This repository contains the public website and local content management UI for PHOENIX Lab.

## Architecture Rules For AI Agents

Read this file before every implementation pass.

- Keep responsibilities separated. Do not place large feature logic, content data, styling, and storage code in one file.
- Public-facing website code belongs in `src/app` and reusable visual pieces in `src/components`.
- Editable lab content belongs in `src/content`. Content types must be declared in `src/content/types.ts`.
- Admin/editor features belong in `src/features/admin`.
- Persistence adapters belong in `src/services`. The current adapter uses browser `localStorage`; it should be replaceable by an API/database adapter without rewriting UI components.
- Global theme tokens and layout styles belong in `src/styles`.
- Brand assets must be served from `public/assets/brand`. Do not reference the temporary root `svg` directory from application code.
- Keep files focused. If a file grows past roughly 300 lines, split it by responsibility before adding more features.
- Preserve the PHOENIX brand colors:
  - Navy: `#082255`
  - Orange: `#FC5508`
- The site should remain visually white, spacious, and editorial, using the brand colors as accents.

## Project Structure

```text
public/assets/brand/      Official copied SVG brand assets
src/app/                  Page composition and app routing
src/components/           Shared presentational components
src/content/              Content models and default seed content
src/features/admin/       Admin/editor experience
src/services/             Persistence and content access services
src/styles/               Global styles and design tokens
```

## Local Development

```bash
npm install
npm run dev
```

Open:

- Public site: `http://localhost:5173/`
- Admin UI: `http://localhost:5173/admin`

The first admin version persists edits in the browser. This is intentional for the initial prototype and keeps the UI contract ready for a future backend.
