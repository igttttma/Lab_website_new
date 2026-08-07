# BlimpMate Agent Lab implementation

## Product-page integration

The current BlimpMate product page retains the long-form product-story rhythm derived from the supplied MacBook Neo archive: a compact local navigation bar, centered product framing, large editorial transitions, horizontally browsable cards, rounded evidence panels, scroll-driven chapters, and explicit production briefs for unavailable media. No Apple images, video, copy, fonts, or implementation code are included in this patch.

A new `Agent` chapter is inserted after the networked-intelligence section. The hero and local navigation link to a standalone Agent Lab with six isolated routes:

- `/projects/blimpmate/agent-lab/guidance`
- `/projects/blimpmate/agent-lab/reminder`
- `/projects/blimpmate/agent-lab/nutrition`
- `/projects/blimpmate/agent-lab/safety`
- `/projects/blimpmate/agent-lab/telepresence`
- `/projects/blimpmate/agent-lab/positioning`

Each route combines editable inputs, a projected-interface digital twin, backend capability provenance, latency, a browser-session event trace, and a visible physical-control boundary. The paper-backed images already present under `public/assets/blimpmate/research/` are reused; unavailable synchronized footage remains a blank production card with a capture brief.

## Browser and backend contract

The frontend normally calls the same-origin Node bridge:

```text
GET  /api/blimpmate-agent/snapshot
POST /api/blimpmate-agent/action
```

The bridge forwards to the BlimpMate host service:

```text
GET  /experience/snapshot
POST /experience/action
```

The response model contains a redacted snapshot or scenario display state, a bounded tool trace, latency, public control-authority state, and canonical provenance: `real`, `fallback`, `mock`, or `manual/Wizard-of-Oz`.

The Node bridge uses a bounded JSON reader, `no-store` response headers, a finite upstream timeout, stable validation errors, and a deterministic demo only for unavailable or 5xx upstream states. Upstream 4xx validation errors remain errors; the React client does not silently convert them into a successful demo result.

## Safety, privacy, and claim boundary

The public contract is side-effect limited. It can inspect redacted state, exercise presentation/perception/demo logic, and compute an unconnected user-relative setpoint. It cannot arm or disarm the vehicle, publish motor or raw-RC commands, enter manual flight mode, or start an autonomous navigation loop.

Public snapshots omit user identities, signaling peer IDs, raw flight-control values, free-form control reasons, and detailed telemetry/audit records. Reminder memory and positioning-controller state are isolated per request. Browser payloads cannot enable audit recording. Image and complete-request sizes are bounded by the backend and the Node bridge.

The paper’s application material is represented as proof-of-concept interaction paths, not as evidence of evaluated end-to-end autonomous behavior.

## Main files

- `src/features/blimpmate/agent/blimpmateAgentData.ts`
- `src/features/blimpmate/agent/blimpmateAgentClient.ts`
- `src/features/blimpmate/agent/useBlimpAgent.ts`
- `src/features/blimpmate/agent/BlimpAgentTwin.tsx`
- `src/features/blimpmate/agent/AgentScenarioControls.tsx`
- `src/features/blimpmate/agent/AgentExperienceSection.tsx`
- `src/features/blimpmate/agent/BlimpAgentLabPage.tsx`
- `server/blimpmateAgent.mjs`
- `server/api.mjs`
- `server/config.mjs`
- `src/styles/global.css`

## Missing-media briefs

Two explicit blank-card patterns remain:

1. An end-to-end agent-loop film on the main product page showing perceive → reason/tools → projected response → safe positioning preview.
2. A synchronized physical-prototype and browser-twin film for each Agent Lab scene.

The final footage should keep provenance, privacy/control state, latency, and any manual/Wizard-of-Oz intervention visible.

## Static review

From the project root:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/blimpmate-agent-lab-preview.html`. The static artifact attempts the same-origin API and falls back to deterministic local scene output. It expects the original project’s `public/assets/` directory to remain in place.
