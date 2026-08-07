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

## BlimpMate Agent Lab

The BlimpMate product page now includes an explorable digital twin at `/projects/blimpmate/agent-lab`. Six isolated scenes are available: guidance, left-behind reminder, nutrition feedback, safety check, telepresence state, and user-relative positioning.

The browser calls the same-origin Node bridge:

```text
GET  /api/blimpmate-agent/snapshot
POST /api/blimpmate-agent/action
```

The bridge forwards only to the BlimpMate host service's side-effect-limited `/experience/*` contract. It does not expose flight arming, raw motor or RC writes, manual flight mode, or an autonomous navigation run loop. When the host service is unavailable, the website returns a deterministic demo response with explicit `fallback`, `mock`, or `manual/Wizard-of-Oz` provenance so the product page remains reviewable without misrepresenting backend state.

Configure the bridge with:

```text
BLIMPMATE_AGENT_URL=http://127.0.0.1:5050
BLIMPMATE_AGENT_TIMEOUT_MS=3500
BLIMPMATE_AGENT_MAX_REQUEST_BYTES=8500000
BLIMPMATE_AGENT_DEMO_FALLBACK=true
```

For an integrated local run, start the Python host service from `/Users/suwen/Documents/blimpmate/BlimpMate_agent/host-service`; its macOS `run.sh` default is port 5050, which avoids the ControlCenter service commonly occupying port 5000. Then run `npm run dev`. The Node API remains the recommended browser boundary. The bridge applies an 8.5 MB bounded JSON reader, forwards upstream 4xx validation errors instead of masking them with a demo, and uses the deterministic fallback only for unavailable/5xx upstream states. The React client preserves the same distinction: validation errors remain visible, while network/5xx failures may use the labelled local preview. Public backend snapshots expose redacted state and aggregate metrics only. `VITE_BLIMPMATE_AGENT_DIRECT_URL` is only for environments that deliberately configure CORS and direct browser access; `VITE_BLIMPMATE_AGENT_TIMEOUT_MS` can optionally bound direct requests.
