import type { CSSProperties } from 'react'
import { BlimpModel } from '../BlimpModel'
import type { AgentActionResult, AgentDisplayItem, AgentDisplayState, AgentScenarioId, AgentSnapshot } from './blimpmateAgentData'
import { getAgentScenario } from './blimpmateAgentData'

type TwinVariables = CSSProperties & Record<`--${string}`, string | number>

type BlimpAgentTwinProps = {
  scenarioId: AgentScenarioId
  snapshot: AgentSnapshot
  result?: AgentActionResult | null
  compact?: boolean
}

function numberFrom(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function textFrom(value: unknown, fallback = '') {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : fallback
}

function itemLabel(item: AgentDisplayItem) {
  return textFrom(item.label || item.name || item.object_name || item.description, 'Agent output')
}

function itemValue(item: AgentDisplayItem) {
  if (item.value !== undefined) return Number.isFinite(Number(item.value)) ? Number(item.value).toFixed(2) : textFrom(item.value)
  if (item.state !== undefined) return textFrom(item.state)
  if (item.level !== undefined) return textFrom(item.level)
  if (item.calories !== undefined) return `${textFrom(item.calories)} kcal`
  if (item.location_hint !== undefined) return textFrom(item.location_hint)
  return ''
}

function modeLabel(snapshot: AgentSnapshot) {
  if (snapshot.connected && snapshot.mode === 'connected') return 'Backend connected'
  return 'Demo fallback'
}

function displayFor(scenarioId: AgentScenarioId, result?: AgentActionResult | null): AgentDisplayState {
  if (result?.scenario === scenarioId) return result.display
  return getAgentScenario(scenarioId).preview
}

export function BlimpAgentTwin({ scenarioId, snapshot, result, compact = false }: BlimpAgentTwinProps) {
  const scenario = getAgentScenario(scenarioId)
  const display = displayFor(scenarioId, result)
  const target = display.target || {}
  const command = display.command || {}
  const bearing = numberFrom(target.bearing_deg, scenarioId === 'positioning' ? 18 : 0)
  const distance = numberFrom(target.distance_m, 1.4)
  const markerX = Math.max(12, Math.min(88, 50 + bearing * 0.2))
  const markerY = Math.max(18, Math.min(84, 78 - distance * 14))
  const screenItems = (display.items || []).slice(0, compact ? 2 : 3)
  const metrics = Object.entries(display.metrics || {}).slice(0, compact ? 2 : 4)
  const provenance = result?.scenario === scenarioId ? result.provenance.mode : snapshot.capabilities.subsystems[scenario.capability]?.provenance || snapshot.capabilities.subsystems[scenario.capability]?.mode || 'unknown'
  const style = {
    '--agent-user-x': `${markerX}%`,
    '--agent-user-y': `${markerY}%`,
    '--agent-bearing': `${bearing}deg`,
  } as TwinVariables

  return (
    <section className={`blimp-agent-twin${compact ? ' blimp-agent-twin--compact' : ''}`} style={style} aria-label={`${scenario.label} digital twin`}>
      <header className="blimp-agent-twin-header">
        <div>
          <span className={`blimp-agent-status-dot${snapshot.connected ? ' is-connected' : ''}`} aria-hidden="true" />
          <strong>{modeLabel(snapshot)}</strong>
        </div>
        <span>{String(provenance).toUpperCase()}</span>
        <span>PHYSICAL CONTROL OFF</span>
      </header>

      <div className="blimp-agent-twin-stage">
        <div className="blimp-agent-room-grid" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <span className="blimp-agent-room-label blimp-agent-room-label--camera">NEAR-FIELD CAMERA</span>
        <span className="blimp-agent-room-label blimp-agent-room-label--backend">BACKEND / TOOLS</span>
        <div className="blimp-agent-user-marker" aria-label={`Simulated user at ${bearing.toFixed(0)} degrees and ${distance.toFixed(1)} metres`}>
          <i /><span>USER</span>
        </div>
        <div className="blimp-agent-sensing-line" aria-hidden="true" />
        <BlimpModel scene={display.emotion === 'alert' ? 'listen' : 'glow'} interactive={!compact} className="blimp-agent-twin-model" />
        <article className={`blimp-agent-projected-ui blimp-agent-projected-ui--${display.kind}`} aria-live="polite">
          <div className="blimp-agent-face" aria-hidden="true">
            <img src="/assets/blimpmate/smile.png" alt="" />
          </div>
          <p>{display.eyebrow || scenario.eyebrow}</p>
          <h3>{display.title}</h3>
          {display.body ? <div className="blimp-agent-projected-body">{display.body}</div> : null}
          {metrics.length ? (
            <div className="blimp-agent-metric-row">
              {metrics.map(([label, value]) => <span key={label}><strong>{textFrom(value)}</strong>{label.replace(/_/g, ' ')}</span>)}
            </div>
          ) : null}
          {screenItems.length ? (
            <div className="blimp-agent-output-list">
              {screenItems.map((item, index) => <div key={`${itemLabel(item)}-${index}`}><i data-state={textFrom(item.state || item.level || 'active')} /><span>{itemLabel(item)}</span><b>{itemValue(item)}</b></div>)}
            </div>
          ) : null}
        </article>
        <div className="blimp-agent-stage-caption"><span>DIGITAL TWIN</span><strong>{scenario.label}</strong></div>
      </div>

      <footer className="blimp-agent-twin-telemetry">
        <div><span>Yaw setpoint</span><strong>{numberFrom(command.yaw).toFixed(2)}</strong></div>
        <div><span>Forward setpoint</span><strong>{numberFrom(command.forward).toFixed(2)}</strong></div>
        <div><span>Control authority</span><strong>{textFrom(snapshot.control_authority?.mode, 'idle')}</strong></div>
        <div><span>Last latency</span><strong>{result?.scenario === scenarioId ? `${result.latency_ms.toFixed(0)} ms` : '—'}</strong></div>
      </footer>
    </section>
  )
}
