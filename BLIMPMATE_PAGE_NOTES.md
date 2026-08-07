# BlimpMate product-page expansion

## Design direction

The BlimpMate project page has been extended as a long-form product narrative using the pacing and interaction vocabulary of the current Apple MacBook Neo product page: a compact local product nav, a product-first marquee, a horizontal highlights rail, a “take a closer look” viewer, scroll-led performance chapters, large rounded editorial cards, tabbed/fade galleries, expandable specifications, and generous section transitions.

The implementation does not reuse Apple imagery, copy, or product assets. All claims, metrics, diagrams, scenarios, and future directions remain specific to the BlimpMate paper and prototype.

## Added in this revision

- Reworked the hero into a light, centered product marquee with the BlimpMate name, a large editorial tagline, interactive 3D model, research-prototype badge, and key actions.
- Added scroll-spy state and a reading-progress line to the sticky local product navigation.
- Added a five-state presentation gallery for avatar, notification, media, task, and communication views.
- Added a horizontal research-contribution rail based on the paper’s three stated contributions.
- Added a four-card future-directions chapter covering miniaturization, charging/endurance, display legibility, and multi-user/privacy/autonomy research.
- Expanded the explicit blank-card convention: missing media is shown as an asset brief with type, ratio, intended content, and capture constraints rather than represented by fabricated imagery.

The earlier product narrative remains in place, including:

- measurable product facts and an auto-advancing highlights carousel;
- the paper’s Figure 1 interaction sequence and a hero-film placeholder;
- a six-hotspot interactive product viewer;
- scroll-controlled performance storytelling for buoyancy, display, flight control, and endurance;
- display-performance, flight-control, power, acoustic, network, scenario, and system evidence;
- comparison framing, expandable technical specifications, paper details, and a production plan.

## Blank media-card convention

Every missing image or video is represented by a visible neutral card. Each card specifies:

- media type and aspect ratio;
- intended content, shot sequence, or UI states;
- capture and evaluation constraints;
- the reason the asset is required in the narrative.

Priority assets include the hero flight film, exploded product turntable, in-flight display-legibility study, acoustic comparison, mobile controller capture, telepresence split view, five presentation-state UI studies, and four future-direction visuals.

## Main source files

- `src/features/blimpmate/BlimpMatePage.tsx` — page composition, scroll state, local-nav scroll spy, and interactive state
- `src/features/blimpmate/BlimpExperienceSections.tsx` — highlights, design story, product viewer, display, intelligence, presentation-state, scenario, and human-compatibility chapters
- `src/features/blimpmate/BlimpTechnicalSections.tsx` — evidence, system, contributions, comparison, specifications, roadmap, production plan, and research sections
- `src/features/blimpmate/BlimpVisuals.tsx` — reusable 3D/product visuals and placeholder components
- `src/features/blimpmate/blimpmateData.ts` — paper-grounded copy, metrics, state definitions, and media briefs
- `src/styles/global.css` — responsive product-page layout, motion, card system, and interaction states

## Run locally

```bash
npm install
npm run dev
```

Open `/projects/blimpmate`.

The provided update ZIP does not contain `node_modules`; install dependencies on the target platform before rebuilding. The original implementation report was produced in a Linux environment where the optional Rolldown native binding was unavailable. The current macOS project was rebuilt after integration.

```bash
./node_modules/.bin/tsc -b
./node_modules/.bin/eslint src/features/blimpmate
```

Run a clean `npm install` on the deployment machine before `npm run build`; do not rely on the archived `node_modules` directory.

## Current integration verification

The update was integrated into the current `Lab_website_new` worktree and verified with:

```bash
npm run build
npm run lint
git diff --check
```

The browser checks covered the five presentation-state tabs, three contribution cards, four future-direction cards, section-aware local navigation, reading progress, highlights pause/resume, six product hotspots, seven scenarios, four system views, scroll-driven 198° model rotation, and model readiness. Desktop and 390 px mobile layouts had no horizontal overflow or broken images. The static preview also has its font URLs normalized to `public/assets/fonts/...` for the documented Python HTTP server workflow.

The production build still reports the existing single-chunk size advisory (>500 kB); it is non-blocking.
