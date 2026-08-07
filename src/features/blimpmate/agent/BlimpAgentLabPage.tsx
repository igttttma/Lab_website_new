import { MediaPlaceholder } from '../BlimpVisuals'
import { researchAsset } from '../blimpmateData'
import { AgentScenarioControls } from './AgentScenarioControls'
import { BlimpAgentTwin } from './BlimpAgentTwin'
import { agentScenarios, getAgentScenario, scenarioFromPath } from './blimpmateAgentData'
import type { AgentActionResult } from './blimpmateAgentData'
import { useBlimpAgent } from './useBlimpAgent'

type BlimpAgentLabPageProps = {
  path: string
  onNavigate: (path: string) => void
}

function textFrom(value: unknown, fallback = '—') {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback
}

function eventTime(result: AgentActionResult) {
  return new Date(result.captured_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function BlimpAgentLabPage({ path, onNavigate }: BlimpAgentLabPageProps) {
  const scenarioId = scenarioFromPath(path)
  const scenario = getAgentScenario(scenarioId)
  const { snapshot, lastResult, history, loadingSnapshot, running, error, refresh, run } = useBlimpAgent()
  const capability = snapshot.capabilities.subsystems[scenario.capability] || {}
  const currentResult = lastResult?.scenario === scenarioId ? lastResult : null

  const selectScenario = (route: string) => onNavigate(route)
  const runScenario = (action: string, payload: Record<string, unknown>) => run(scenarioId, action, payload)

  return (
    <main className="blimpmate-page blimp-agent-lab-page">
      <div className="blimp-agent-lab-nav">
        <button type="button" onClick={() => onNavigate('/projects/blimpmate')}><span aria-hidden="true">←</span> BlimpMate</button>
        <nav aria-label="Agent Lab scenes">{agentScenarios.map((item) => <button type="button" aria-current={scenarioId === item.id ? 'page' : undefined} onClick={() => selectScenario(item.route)} key={item.id}>{item.label}</button>)}</nav>
        <div><span data-connected={snapshot.connected}>{snapshot.connected ? 'CONNECTED' : 'DEMO'}</span><button type="button" onClick={() => void refresh()} disabled={loadingSnapshot}>{loadingSnapshot ? 'Checking…' : 'Refresh'}</button></div>
      </div>

      <section className="blimp-agent-lab-hero">
        <div className="blimp-agent-lab-hero-copy">
          <p className="blimp-eyebrow">BLIMPMATE AGENT LAB / PUBLIC DIGITAL TWIN</p>
          <h1>Experience one agent loop at a time.</h1>
          <p>Select a paper-backed scene, change its inputs, inspect the returned tool and provenance state, and watch the projected interface update. Physical flight writes are deliberately absent.</p>
          <div className="blimp-agent-lab-hero-meta">
            <span><strong>{snapshot.connected ? 'Live' : 'Demo'}</strong>backend mode</span>
            <span><strong>{textFrom(capability.provenance || capability.mode, 'unknown')}</strong>active provenance</span>
            <span><strong>Off</strong>physical control</span>
          </div>
        </div>
        <figure className="blimp-agent-lab-source">
          <img src={scenario.image} alt={scenario.alt} />
          <figcaption><span>{scenario.source}</span><strong>Source scenario</strong></figcaption>
        </figure>
      </section>

      <section className="blimp-agent-tab-section" aria-label="Choose an agent scene">
        <div className="blimp-agent-tabs">
          {agentScenarios.map((item) => (
            <button type="button" data-active={scenarioId === item.id} onClick={() => selectScenario(item.route)} key={item.id}>
              <span>{item.index}</span><strong>{item.label}</strong><small>{item.eyebrow}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="blimp-agent-lab-stage">
        <BlimpAgentTwin scenarioId={scenarioId} snapshot={snapshot} result={currentResult} />
        <aside className="blimp-agent-inspector">
          <p className="blimp-eyebrow">RUN INSPECTOR</p>
          <h2>{currentResult?.display.title || scenario.preview.title}</h2>
          <p>{currentResult?.display.body || scenario.preview.body}</p>
          <dl>
            <div><dt>Scenario</dt><dd>{scenario.label}</dd></div>
            <div><dt>Subsystem</dt><dd>{currentResult?.provenance.subsystem || scenario.capability}</dd></div>
            <div><dt>Provenance</dt><dd>{currentResult?.provenance.mode || textFrom(capability.provenance || capability.mode, 'unknown')}</dd></div>
            <div><dt>Latency</dt><dd>{currentResult ? `${currentResult.latency_ms.toFixed(2)} ms` : 'Not run'}</dd></div>
            <div><dt>Physical control</dt><dd>{currentResult?.physical_control ? 'Enabled' : 'Disabled'}</dd></div>
          </dl>
          <div className="blimp-agent-inspector-reason"><span>WHY THIS MODE</span><p>{currentResult?.provenance.reason || textFrom(capability.reason, 'Capability detail is not available yet.')}</p></div>
          {error ? <p className="blimp-agent-inspector-error">{error}</p> : null}
        </aside>
      </section>

      <AgentScenarioControls key={scenarioId} scenarioId={scenarioId} running={running} onRun={runScenario} />

      <section className="blimp-agent-observability">
        <header><div><p className="blimp-eyebrow">OBSERVABILITY</p><h2>Every run leaves a visible trace.</h2></div><p>Tool names, provenance, latency, and output state are shown to the visitor instead of being hidden behind an “AI” label.</p></header>
        <div className="blimp-agent-observability-grid">
          <article className="blimp-agent-timeline">
            <div className="blimp-agent-panel-title"><span>SESSION EVENTS</span><strong>{history.length}</strong></div>
            {history.length ? history.map((event) => {
              const item = getAgentScenario(event.scenario)
              return <div className="blimp-agent-event" key={`${event.captured_at}-${event.scenario}`}><i data-mode={event.provenance.mode} /><time>{eventTime(event)}</time><div><strong>{item.label} · {event.action}</strong><span>{event.display.title}</span></div><em>{event.provenance.mode} / {event.latency_ms.toFixed(0)} ms</em></div>
            }) : <div className="blimp-agent-empty-event"><span>NO EVENTS YET</span><p>Run the scene above to create the first browser-session trace.</p></div>}
          </article>
          <article className="blimp-agent-capabilities">
            <div className="blimp-agent-panel-title"><span>BACKEND CAPABILITIES</span><strong>{textFrom(snapshot.capabilities.summary.total, Object.keys(snapshot.capabilities.subsystems).length.toString())}</strong></div>
            {agentScenarios.map((item) => {
              const itemCapability = snapshot.capabilities.subsystems[item.capability] || {}
              const mode = textFrom(itemCapability.provenance || itemCapability.mode, 'unknown')
              return <button type="button" onClick={() => selectScenario(item.route)} data-active={scenarioId === item.id} key={item.id}><i data-mode={mode} /><span><strong>{item.label}</strong><small>{item.capability}</small></span><em>{mode}</em></button>
            })}
          </article>
        </div>
      </section>

      <section className="blimp-agent-architecture">
        <header><p className="blimp-eyebrow">PAPER FIGURE 5 / IMPLEMENTATION MAP</p><h2>The web twin follows the same distributed architecture.</h2><p>Cloud services, backend orchestration, onboard presentation, and mobile control are represented as distinct layers. The public website connects only to the safe browser-facing orchestration contract.</p></header>
        <figure><img src={researchAsset('networked-architecture.webp')} alt="BlimpMate networked interaction architecture showing cloud, backend, onboard, mobile, and perception layers." /><figcaption>Prototype networked interaction architecture · source: paper Figure 5</figcaption></figure>
        <div className="blimp-agent-architecture-steps">
          <article><span>01</span><h3>Input</h3><p>Speech, scene hint, uploaded image, call state, or simulated target geometry.</p></article>
          <article><span>02</span><h3>Reason + tools</h3><p>Scenario orchestration calls the existing object memory, vision clients, safety detector, WebRTC state, or positioner.</p></article>
          <article><span>03</span><h3>Presentation</h3><p>A unified display state becomes guidance, notification, nutrition, safety, communication, or positioning UI.</p></article>
          <article><span>04</span><h3>Provenance</h3><p>The response reports real, fallback, mock, or Wizard-of-Oz status and keeps control authority visible.</p></article>
        </div>
      </section>

      <section className="blimp-agent-lab-media">
        <MediaPlaceholder kind="SYNCHRONIZED DEMO VIDEO" ratio="16:9" title={`${scenario.label}: browser twin + physical prototype`} body={`Record the ${scenario.label.toLowerCase()} scenario as a split view: user and physical BlimpMate on the left; synchronized input, tool trace, provenance, projected state, and latency on the right.`} note="Leave physical-control boundaries and any manual/Wizard-of-Oz steps visible in the final edit." />
        <article><p className="blimp-eyebrow">INTERACTION BOUNDARY</p><h2>Inspectable does not mean remotely controllable.</h2><p>{snapshot.interaction_boundary.note}</p><ul><li>No arming or disarming.</li><li>No raw motor, RC, or manual-flight commands.</li><li>No autonomous navigation run loop.</li><li>Positioning computes an unconnected setpoint only.</li></ul></article>
      </section>
    </main>
  )
}
