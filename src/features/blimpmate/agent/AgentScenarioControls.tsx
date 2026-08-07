import { useState } from 'react'
import { readImageAsDataUrl } from './blimpmateAgentClient'
import type { AgentScenarioId } from './blimpmateAgentData'
import { getAgentScenario } from './blimpmateAgentData'

type AgentScenarioControlsProps = {
  scenarioId: AgentScenarioId
  running: boolean
  onRun: (action: string, payload: Record<string, unknown>) => Promise<unknown> | unknown
}

const guidanceSteps = [
  'Prepare the workspace',
  'Place the target component',
  'Tighten the two front fasteners',
  'Confirm alignment and finish',
]

const reminderObjects = [
  { name: 'keys', location_hint: 'entryway shelf', importance_score: 0.95 },
  { name: 'access card', location_hint: 'desk', importance_score: 0.9 },
  { name: 'phone', location_hint: 'kitchen counter', importance_score: 0.88 },
]

export function AgentScenarioControls({ scenarioId, running, onRun }: AgentScenarioControlsProps) {
  const scenario = getAgentScenario(scenarioId)
  const [stepIndex, setStepIndex] = useState(1)
  const [transcript, setTranscript] = useState('Show me the next step.')
  const [selectedObjects, setSelectedObjects] = useState(['keys', 'access card'])
  const [reminderScene, setReminderScene] = useState('entryway')
  const [provider, setProvider] = useState('gemini')
  const [safetyScene, setSafetyScene] = useState('laboratory bench with an uncapped container near the edge')
  const [remoteName, setRemoteName] = useState('Remote collaborator')
  const [callState, setCallState] = useState('incoming')
  const [bearing, setBearing] = useState(18)
  const [distance, setDistance] = useState(1.6)
  const [elevation, setElevation] = useState(0)
  const [image, setImage] = useState('')
  const [imageName, setImageName] = useState('')
  const [fileError, setFileError] = useState('')

  const toggleObject = (name: string) => {
    setSelectedObjects((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  const loadImage = async (file?: File) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFileError('Choose an image file.')
      return
    }
    if (file.size > 6_000_000) {
      setFileError('Keep the image below 6 MB.')
      return
    }
    try {
      setImage(await readImageAsDataUrl(file))
      setImageName(file.name)
      setFileError('')
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'The image could not be read.')
    }
  }

  const runCurrent = () => {
    switch (scenarioId) {
      case 'guidance':
        return onRun('show_step', { steps: guidanceSteps, step_index: stepIndex, transcript, trigger: 'voice' })
      case 'reminder':
        return onRun('scan', {
          trigger: 'user_leaving',
          scene_hint: reminderScene,
          objects: reminderObjects.filter((item) => selectedObjects.includes(item.name)),
          max_alerts: 3,
          transcript: 'I am leaving now.',
        })
      case 'nutrition':
        return onRun('analyze', { provider, image, trigger: image ? 'uploaded_image' : 'demo_meal' })
      case 'safety':
        return onRun('scan', { scene_hint: safetyScene, image, trigger: image ? 'uploaded_image' : 'scene_hint' })
      case 'telepresence':
        return onRun(callState, { call_state: callState, remote_name: remoteName, trigger: 'web_card' })
      case 'positioning':
        return onRun('compute', { bearing_deg: bearing, distance_m: distance, elevation_deg: elevation, confidence: 0.95, dt: 0.1 })
    }
  }

  return (
    <section className="blimp-agent-controls" aria-labelledby="blimp-agent-controls-title">
      <header>
        <div><p className="blimp-eyebrow">SCENARIO CONTROLS</p><h2 id="blimp-agent-controls-title">{scenario.title}</h2></div>
        <p>{scenario.summary}</p>
      </header>

      <div className="blimp-agent-control-panel">
        {scenarioId === 'guidance' ? (
          <div className="blimp-agent-guidance-control">
            <label>Spoken intent<textarea value={transcript} onChange={(event) => setTranscript(event.target.value)} rows={2} /></label>
            <div className="blimp-agent-stepper">
              <button type="button" onClick={() => setStepIndex((value) => Math.max(0, value - 1))} disabled={stepIndex === 0}>Previous</button>
              <div><span>Projected step</span><strong>{stepIndex + 1} / {guidanceSteps.length}</strong><p>{guidanceSteps[stepIndex]}</p></div>
              <button type="button" onClick={() => setStepIndex((value) => Math.min(guidanceSteps.length - 1, value + 1))} disabled={stepIndex === guidanceSteps.length - 1}>Next</button>
            </div>
          </div>
        ) : null}

        {scenarioId === 'reminder' ? (
          <div className="blimp-agent-form-grid">
            <fieldset><legend>Remember these objects</legend>{reminderObjects.map((item) => <label className="blimp-agent-check" key={item.name}><input type="checkbox" checked={selectedObjects.includes(item.name)} onChange={() => toggleObject(item.name)} /><span>{item.name}</span><small>{item.location_hint}</small></label>)}</fieldset>
            <label>Departure scene<select value={reminderScene} onChange={(event) => setReminderScene(event.target.value)}><option value="entryway">Entryway</option><option value="office exit">Office exit</option><option value="laboratory door">Laboratory door</option></select></label>
          </div>
        ) : null}

        {scenarioId === 'nutrition' ? (
          <div className="blimp-agent-form-grid">
            <label>Vision provider<select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="gemini">Gemini</option><option value="qwen">Qwen</option></select><small>The response will disclose real or mock provenance.</small></label>
            <ImageControl imageName={imageName} error={fileError} onFile={loadImage} label="Optional meal image" />
          </div>
        ) : null}

        {scenarioId === 'safety' ? (
          <div className="blimp-agent-form-grid">
            <label>Scene description<textarea value={safetyScene} onChange={(event) => setSafetyScene(event.target.value)} rows={4} /></label>
            <ImageControl imageName={imageName} error={fileError} onFile={loadImage} label="Optional workspace image" />
          </div>
        ) : null}

        {scenarioId === 'telepresence' ? (
          <div className="blimp-agent-form-grid">
            <label>Remote participant<input value={remoteName} onChange={(event) => setRemoteName(event.target.value)} /></label>
            <fieldset><legend>Call state</legend><div className="blimp-agent-segmented">{['incoming', 'accepted', 'ended'].map((state) => <button type="button" aria-pressed={callState === state} onClick={() => setCallState(state)} key={state}>{state}</button>)}</div></fieldset>
          </div>
        ) : null}

        {scenarioId === 'positioning' ? (
          <div className="blimp-agent-slider-grid">
            <RangeControl label="Bearing" value={bearing} min={-90} max={90} step={1} unit="°" onChange={setBearing} />
            <RangeControl label="Distance" value={distance} min={0.4} max={4} step={0.1} unit=" m" onChange={setDistance} />
            <RangeControl label="Elevation" value={elevation} min={-30} max={30} step={1} unit="°" onChange={setElevation} />
          </div>
        ) : null}

        <div className="blimp-agent-control-footer">
          <p><strong>Public safety boundary.</strong> This action can inspect state, run perception/demo logic, or compute a setpoint. It cannot arm the robot or publish motor commands.</p>
          <button type="button" className="blimp-agent-run" onClick={() => void runCurrent()} disabled={running}>{running ? 'Running agent…' : scenario.actionLabel}</button>
        </div>
      </div>
    </section>
  )
}

function ImageControl({ imageName, error, label, onFile }: { imageName: string; error: string; label: string; onFile: (file?: File) => void }) {
  return (
    <label className="blimp-agent-upload">{label}<input type="file" accept="image/*" onChange={(event) => void onFile(event.target.files?.[0])} /><span>{imageName || 'Choose an image up to 6 MB'}</span>{error ? <small className="is-error">{error}</small> : <small>Without an upload, the backend uses its documented demo path.</small>}</label>
  )
}

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="blimp-agent-range"><span>{label}<strong>{value.toFixed(step < 1 ? 1 : 0)}{unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
  )
}
