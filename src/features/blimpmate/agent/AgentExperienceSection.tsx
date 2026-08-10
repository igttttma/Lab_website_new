import { useState } from 'react'
import { MediaPlaceholder } from '../BlimpVisuals'
import { BlimpAgentTwin } from './BlimpAgentTwin'
import { agentScenarios, getAgentScenario } from './blimpmateAgentData'
import type { AgentScenarioId } from './blimpmateAgentData'
import { useBlimpAgent } from './useBlimpAgent'

type AgentExperienceSectionProps = {
  onNavigate: (path: string) => void
}

const inputLabels: Record<AgentScenarioId, string> = {
  guidance: 'spoken intent + step state',
  reminder: 'departure cue + object memory',
  nutrition: 'meal image or disclosed fixture',
  safety: 'workspace image or scene hint',
  telepresence: 'visitor-selected call state',
  positioning: 'bearing + distance + elevation',
}

export function AgentExperienceSection({ onNavigate }: AgentExperienceSectionProps) {
  const [activeId, setActiveId] = useState<AgentScenarioId>('reminder')
  const { snapshot, lastResult, running, error, run } = useBlimpAgent()
  const active = getAgentScenario(activeId)
  const activeResult = lastResult?.scenario === activeId ? lastResult : null
  const capability = snapshot.capabilities.subsystems[active.capability] || {}
  const provenance = activeResult?.provenance.mode || String(capability.provenance || capability.mode || 'unknown')

  const openRoute = (path: string) => {
    onNavigate(path)
  }

  const runPreview = () => {
    void run(active.id, active.action, active.defaultPayload)
  }

  return (
    <section className="blimp-agent-experience" id="agent" aria-labelledby="blimp-agent-experience-title">
      <header className="blimp-agent-experience-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">TRY THE NETWORKED AGENT</p>
        <h2 id="blimp-agent-experience-title">From research scenario<br />to explorable digital twin.</h2>
        <p>The website mirrors the paper’s cloud, backend, onboard, and presentation loop in a browser-safe experience. Each card declares whether its result is real, fallback, mock, or Wizard-of-Oz.</p>
      </header>

      <div className="blimp-agent-loop-map blimp-reveal" data-reveal data-visible="false" aria-label="Current public agent loop">
        <article><span>01 / INPUT</span><strong>{inputLabels[activeId]}</strong><small>visitor-provided or disclosed demo input</small></article>
        <i aria-hidden="true">→</i>
        <article><span>02 / REASON + TOOLS</span><strong>{active.capability}</strong><small>{provenance} provenance remains visible</small></article>
        <i aria-hidden="true">→</i>
        <article><span>03 / PRESENT</span><strong>{activeResult?.display.title || active.preview.title}</strong><small>unified projected display state</small></article>
        <i aria-hidden="true">→</i>
        <article><span>04 / MOVE PREVIEW</span><strong>unconnected setpoint</strong><small>arming and actuator writes are absent</small></article>
      </div>

      <div className="blimp-agent-live-shell blimp-reveal" data-reveal data-visible="false">
        <BlimpAgentTwin scenarioId={activeId} snapshot={snapshot} result={activeResult} compact />
        <aside className="blimp-agent-live-copy">
          <div className="blimp-agent-live-status" aria-live="polite">
            <span data-connected={snapshot.connected}>{snapshot.connected ? 'LIVE-SAFE BACKEND' : 'DEMO FALLBACK'}</span>
            <span>{String(provenance).toUpperCase()}</span>
            <span>NO PHYSICAL CONTROL</span>
          </div>
          <p className="blimp-eyebrow">{active.eyebrow}</p>
          <h3>{active.title}</h3>
          <p>{active.summary}</p>
          <div className="blimp-agent-live-actions">
            <button type="button" className="blimp-agent-run" onClick={runPreview} disabled={running}>{running ? 'Running agent…' : active.actionLabel}</button>
            <button type="button" className="blimp-agent-open" onClick={() => openRoute(active.route)}>Open full scene <span aria-hidden="true">↗</span></button>
          </div>
          {activeResult ? <p className="blimp-agent-result-note" aria-live="polite"><strong>{activeResult.provenance.mode}</strong>{activeResult.summary}</p> : null}
          {error ? <p className="blimp-agent-result-note is-error" role="alert">{error}</p> : null}
        </aside>
      </div>

      <div className="blimp-agent-scenario-rail" aria-label="Agent experience scenarios">
        {agentScenarios.map((scenario) => (
          <article className="blimp-agent-scenario-card blimp-reveal" data-reveal data-visible="false" data-active={activeId === scenario.id} key={scenario.id}>
            <button type="button" className="blimp-agent-scenario-select" onClick={() => setActiveId(scenario.id)} aria-pressed={activeId === scenario.id}>
              <figure><img src={scenario.image} alt={scenario.alt} /><figcaption>{scenario.source}</figcaption></figure>
              <div><span>{scenario.index}</span><p className="blimp-eyebrow">{scenario.eyebrow}</p><h3>{scenario.title}</h3><p>{scenario.summary}</p></div>
            </button>
            <button type="button" className="blimp-agent-card-link" onClick={() => openRoute(scenario.route)}>Experience this scene <span aria-hidden="true">↗</span></button>
          </article>
        ))}
      </div>

      <div className="blimp-agent-production-brief blimp-reveal" data-reveal data-visible="false">
        <MediaPlaceholder
          kind="END-TO-END VIDEO"
          ratio="16:9"
          title="Agent loop: perceive → reason → present → reposition"
          body="A single continuous film should show the user cue, camera or speech input, backend tool trace, projected response, visible provenance, and a safe user-relative repositioning preview. Capture both the physical scene and synchronized browser twin."
          note="Required production asset · do not present the current proof-of-concept scenarios as fully autonomous behavior"
        />
        <article><p className="blimp-eyebrow">WHY THIS LAYER EXISTS</p><h3>A product page should let people test the interaction claim.</h3><p>The digital twin turns static scenario photography into isolated, replayable agent states without exposing vehicle actuation. It is an interaction demonstrator and integration surface, not a remote-control console.</p><button type="button" className="blimp-agent-open" onClick={() => openRoute('/projects/blimpmate/agent-lab/reminder')}>Enter Agent Lab <span aria-hidden="true">↗</span></button></article>
      </div>
    </section>
  )
}
