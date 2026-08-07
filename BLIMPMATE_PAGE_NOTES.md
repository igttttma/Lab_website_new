# BlimpMate product-page refinement

## Design reference and page structure

The BlimpMate page now follows the presentation rhythm and interaction patterns observed in the supplied MacBook Neo archive, while retaining BlimpMate-specific content and visual identity. The page uses:

- a compact sticky product navigation with section state and reading progress;
- a centered product marquee with a restrained research-prototype label;
- a horizontal “Get the highlights” gallery with arrows, pagination, pause/play, swipe/trackpad synchronization, and an active slide count;
- a large editorial statement followed by a specified hero-film placeholder;
- a “Take a closer look” product viewer with subsystem tabs and 3D rotation;
- a long sticky, scroll-scrubbed performance narrative;
- large rounded evidence cards, tabbed presentation-state and scenario galleries, and expandable specifications;
- Apple-style “plus” actions that open production-brief dialogs for every missing image or video.

No Apple product images, videos, copy, or page code are included. The reference is used only for information hierarchy, pacing, card behavior, and interaction grammar.

## Paper-grounded changes in this revision

- The bundled `public/assets/blimpmate/research/blimpmate-paper.pdf` is byte-identical to the supplied `uist26-53.pdf` source (13 pages; SHA-256 `3ad86f9849d4f35f96a67fc3e6edff9e803b6a3a7f940dec73c7ee20eba62547`).
- Restored the supplied paper’s acoustic table: ambient background 46.0 dB(A), routine hovering 47.1 dB(A), active vertical repositioning 50.5 dB(A), active yaw rotation 48.3 dB(A), and active horizontal repositioning 49.7 dB(A), with the reported trial-maximum values shown separately.
- Restored the supplied paper’s hover-plus-multimedia result: 45 min at 14.75 W. The page no longer labels this measured condition as pending.
- Corrected application-source labels to match the supplied paper: task guidance is Figure 8, context-aware assistance is Figure 9, and telepresence is Figure 10.
- Restored the supplied paper metadata: named authors, UIST ’26 in Detroit, 13 pages, and DOI `10.1145/3830398.3830527`.
- Replaced the non-source acoustic image card with a rendered Table 3 evidence card; the supplied paper’s Figure 8 is the task-guidance scenario figure.
- Added an image fallback when the 3D model cannot be rendered.

## Blank media-card convention

Missing media remains visible as a designed production card rather than being replaced with fabricated imagery. Each card states the asset type, target ratio, intended content, and capture/evaluation constraints. Selecting “View production brief” opens a larger modal with the same specification.

The convention is used for the hero interaction film, in-flight readability study, sensing close-up, presentation-state UI studies, user-study evidence, future-direction concepts, and the complete media production plan.

## Main source files

- `src/features/blimpmate/BlimpMatePage.tsx` — page composition, scroll state, local navigation, reading progress, and highlight synchronization
- `src/features/blimpmate/BlimpExperienceSections.tsx` — highlights, design story, product viewer, display, intelligence, presentation states, scenarios, and human compatibility
- `src/features/blimpmate/BlimpTechnicalSections.tsx` — measured evidence, system, contributions, comparison, specifications, roadmap, production plan, and paper details
- `src/features/blimpmate/BlimpVisuals.tsx` — reusable visual components, placeholders, and production-brief dialog
- `src/features/blimpmate/BlimpModel.tsx` — model viewer and image fallback
- `src/features/blimpmate/blimpmateData.ts` — source-grounded metrics, labels, state definitions, and production briefs
- `src/styles/global.css` — page layout, modal, evidence, pending-data, and responsive states
- `blimpmate-extended-preview.html` — no-build static review version with equivalent interactions

## Run locally

```bash
npm install
npm run dev
```

Open `/projects/blimpmate`. The static review version can be served from the project directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/blimpmate-extended-preview.html`.

## Verification in this revision environment

The modified TS/TSX files passed TypeScript syntax transpilation and an isolated type check with local React stubs. The static preview’s inline JavaScript passed `node --check`. Browser checks covered desktop and 390 px mobile layouts, no horizontal overflow, the acoustic figure, highlight synchronization, production-brief opening/closing, and the model-image fallback.

A full Vite production build was not run in this container because project dependencies could not be installed from the configured package registry. Run a clean `npm install` or `npm ci`, followed by `npm run build` and `npm run lint`, on the target development machine.
