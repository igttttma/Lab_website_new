# BlimpMate product-page and Agent Lab notes

## Design reference

The BlimpMate experience uses the supplied MacBook Neo archive only as a reference for product-page hierarchy, pacing, and interaction grammar. The retained page structure includes a sticky local product navigation, centered hero, highlights rail, large editorial transitions, a product/system viewer, scroll-driven performance storytelling, rounded evidence cards, tabs, accordions, and “plus” actions that reveal production briefs.

No Apple product media, copy, fonts, or page code is included.

## Paper-grounded presentation

The product page uses the supplied BlimpMate paper and its figures for the research claim, hardware platform, projection subsystem, flight-control architecture, networked interaction architecture, measured display/power/noise evidence, task-guidance examples, context-aware assistance, and telepresence scenarios.

Important measured values represented by the current page include:

- 33-inch approximate usable projection diagonal;
- average screen luminance of 305.7 cd/m² under the reported static test;
- 73 minutes for hover plus lightweight visual content at 8.68 W;
- 45 minutes for hover plus multimedia playback at 14.75 W;
- 47.1 dB(A) mean routine-hover sound level under the reported setup;
- task guidance in Figure 8, context-aware assistance in Figure 9, and telepresence in Figure 10.

The page labels the system as a research prototype. Application scenes are presented as proof-of-concept demonstrations rather than an evaluated end-to-end autonomous agent.

## Agent Lab extension

The main product story now includes an `Agent` chapter and a dedicated digital-twin experience under `/projects/blimpmate/agent-lab/*`. Six cards/subpages expose one interaction loop at a time:

- procedural guidance;
- left-behind reminder;
- meal-time nutrition feedback;
- situated safety check;
- telepresence state;
- user-relative positioning preview.

Each scene shows the rendered display state, backend subsystem, provenance, latency, tool trace, browser-session history, and an explicit “physical control off” boundary. Positioning computes a request-local, unconnected setpoint and never engages the vehicle.

## Blank media-card convention

Unavailable images or video are not replaced with fabricated assets. The page renders a designed blank card containing the required media type, target ratio, intended content, and capture/evaluation constraints. Agent Lab adds briefs for an end-to-end agent-loop film and synchronized physical-prototype/browser-twin footage.

## Relevant source files

- `src/features/blimpmate/BlimpMatePage.tsx`
- `src/features/blimpmate/agent/`
- `src/app/PublicSite.tsx`
- `server/blimpmateAgent.mjs`
- `server/api.mjs`
- `server/config.mjs`
- `src/styles/global.css`
- `blimpmate-extended-preview.html`
- `blimpmate-agent-lab-preview.html`

## Verification in this environment

Completed checks include Node syntax validation, backend-bridge offline and connected smoke tests, request validation and size-limit checks, TypeScript syntax and isolated semantic checks, CSS/HTML parsing, static-preview inline-script syntax checks, and desktop/390 px responsive layout inspection without horizontal overflow. All referenced static assets were also verified to exist and return HTTP 200 from a local static server.

Direct Chromium navigation was blocked by the container’s browser policy, so responsive visual inspection used an in-memory page load. A full Vite production build and ESLint run were not completed because the configured package source returned a 404 while installing `zod-validation-error-4.0.2`. Run a clean dependency install followed by `npm run build` and `npm run lint` on the target development machine.
