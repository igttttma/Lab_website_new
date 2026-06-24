# PHOENIX Lab Website

This repository contains the PHOENIX Lab public website and a self-hosted password-protected admin backend.

The production model is intentionally simple and university-friendly:

- Public visitors browse the website normally.
- Admin users visit `/admin`, enter the site password, edit content, and save.
- The server writes content to `content/lab.json`.
- Uploaded images are stored under `content/uploads` and served from `/uploads/...`.
- The public site reads content from `/api/content`, so edits are visible immediately after save.
- No third-party login, hosted CMS, Git gateway, or external permission service is required.

## Architecture Rules For AI Agents

Read this file before every implementation pass.

- Keep responsibilities separated. Do not place large feature logic, content data, styling, and storage code in one file.
- Public-facing website code belongs in `src/app` and reusable visual pieces in `src/components`.
- Editable lab content belongs in `content/lab.json`. Content types must be declared in `src/content/types.ts`.
- Admin UI features belong in `src/features/admin`.
- Server API, session handling, and content persistence belong in `server`.
- Global theme tokens and layout styles belong in `src/styles`.
- Brand assets must be served from `public/assets/brand`. Do not reference the temporary root `svg` directory from application code.
- Bundled font assets belong in `public/assets/fonts`.
- Keep files focused. If a file grows past roughly 300 lines, split it by responsibility before adding more features.
- Preserve the PHOENIX brand colors:
  - Navy: `#082255`
  - Orange: `#FC5508`
- The site should remain visually white, spacious, and editorial, using the brand colors as accents.

## Project Structure

```text
content/lab.json           Editable lab content
content/uploads/           Admin-uploaded images
server/                    Self-hosted Node API, auth, and static server
public/assets/brand/       Official copied SVG brand assets
public/assets/fonts/       Bundled site and brand fonts
src/app/                   Page composition and app routing
src/components/            Shared presentational components
src/content/               Content models and typed content export
src/features/admin/        Password-protected admin UI
src/services/              Frontend content access services
src/styles/                Global styles and design tokens
```

## Local Development

Create a local environment file:

```bash
cp .env.example .env
```

Set a strong `ADMIN_PASSWORD`.

Install and run:

```bash
npm install
npm run dev
```

Open:

- Public site: `http://localhost:5173/`
- Admin UI: `http://localhost:5173/admin`

`npm run dev` starts:

- Vite frontend server on port `5173`
- Local API server on port `4174`
- Vite proxies `/api/*` to the API server

For a front-end-only dev server without API:

```bash
npm run dev:site
```

## Production Build And Run

Build the static frontend:

```bash
npm run build
```

Run the self-hosted production server:

```bash
ADMIN_PASSWORD="replace-with-a-strong-password" npm run server
```

Default production URL:

```text
http://127.0.0.1:4173
```

You can override:

- `HOST`
- `PORT`
- `ADMIN_PASSWORD`
- `SECURE_COOKIES`

The server serves:

- Static frontend from `dist`
- Uploaded images from `/uploads/*`
- Public content API at `/api/content`
- Admin login/content APIs under `/api/admin/*`
- Browser app routes such as `/admin`, `/people`, `/contact`

## Deployment Notes For `.edu`

This project does not require third-party CMS authentication. For a university domain deployment:

1. Build with `npm run build`.
2. Run `npm run server` behind the university web server or reverse proxy.
3. Set `ADMIN_PASSWORD` as a server-side environment variable.
4. Ensure `content/lab.json` and `content/uploads` are writable by the Node process.
5. Back up `content/lab.json` and `content/uploads` regularly.
6. Serve the site over HTTPS so the admin password and session cookie are protected in transit.
7. Keep `SECURE_COOKIES` enabled in production. Only set `SECURE_COOKIES=false` for local non-HTTPS development.

For example:

```text
https://phoenix.example.edu/       public site
https://phoenix.example.edu/admin  admin UI
```

## Content Persistence

Content is stored in `content/lab.json`. Admin saves write the whole validated content object back to that file using an atomic temporary-file rename.

Session data is stored in `data/sessions.json`, which is ignored by Git.

Create a manual content backup:

```bash
npm run backup:content
```
