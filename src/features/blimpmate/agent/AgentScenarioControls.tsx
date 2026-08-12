import { useId, useState } from 'react'
import { prepareImageForAgent } from './blimpmateAgentClient'
import type { PreparedAgentImage } from './blimpmateAgentClient'
import type { AgentActionResult, AgentCapability, AgentScenarioId } from './blimpmateAgentData'
import { getAgentScenario } from './blimpmateAgentData'

type AgentScenarioControlsProps = {
  scenarioId: AgentScenarioId
  running: boolean
  capability: AgentCapability
  result?: AgentActionResult | null
  error?: string
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

export function AgentScenarioControls({ scenarioId, running, capability, result, error, onRun }: AgentScenarioControlsProps) {
  const scenario = getAgentScenario(scenarioId)
  const [stepIndex, setStepIndex] = useState(1)
  const [transcript, setTranscript] = useState('Show me the next step.')
  const [selectedObjects, setSelectedObjects] = useState(['keys', 'access card'])
  const [reminderScene, setReminderScene] = useState('entryway')
  const [provider, setProvider] = useState('auto')
  const [safetyScene, setSafetyScene] = useState('laboratory bench with an uncapped container near the edge')
  const [remoteName, setRemoteName] = useState('Remote collaborator')
  const [callState, setCallState] = useState('incoming')
  const [bearing, setBearing] = useState(18)
  const [distance, setDistance] = useState(1.6)
  const [elevation, setElevation] = useState(0)
  const [image, setImage] = useState<PreparedAgentImage | null>(null)
  const [fileError, setFileError] = useState('')
  const [preparingImage, setPreparingImage] = useState(false)

  const toggleObject = (name: string) => {
    setSelectedObjects((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  const loadImage = async (file?: File) => {
    if (!file) return
    setPreparingImage(true)
    try {
      setImage(await prepareImageForAgent(file))
      setFileError('')
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'The image could not be read.')
    } finally {
      setPreparingImage(false)
    }
  }

  const clearImage = () => {
    setImage(null)
    setFileError('')
  }

  const capabilityMode = String(capability.provenance || capability.mode || 'unknown')
  const configuredProvider = String(capability.provider || 'none')
  const selectedProvider = provider === 'auto' ? configuredProvider : provider
  const realVisionReady = capabilityMode === 'real' && (provider === 'auto' || selectedProvider === configuredProvider)
  const uploadedImagePayload = image ? {
    image: image.dataUrl,
    input_name: image.name,
    input_mime: image.mimeType,
    input_size: image.sizeBytes,
    trigger: 'uploaded_image',
  } : {}

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
        return onRun('analyze', {
          ...(provider === 'auto' ? {} : { provider }),
          ...uploadedImagePayload,
          trigger: image ? 'uploaded_image' : 'demo_meal',
        })
      case 'safety':
        return onRun('scan', { scene_hint: safetyScene, ...uploadedImagePayload, trigger: image ? 'uploaded_image' : 'scene_hint' })
      case 'telepresence':
        return onRun(callState, { call_state: callState, remote_name: remoteName, trigger: 'web_card' })
      case 'positioning':
        return onRun('compute', { bearing_deg: bearing, distance_m: distance, elevation_deg: elevation, confidence: 0.95, dt: 0.1 })
    }
  }

  return (
    <section className="blimp-agent-controls" id="agent-controls" aria-labelledby="blimp-agent-controls-title">
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
          <div className="blimp-agent-vision-grid">
            <div className="blimp-agent-vision-settings">
              <label>Vision provider<select value={provider} onChange={(event) => setProvider(event.target.value)}><option value="auto">Auto · configured provider</option><option value="gemini">Gemini</option><option value="qwen">Qwen</option></select><small>The backend response must report <strong>real</strong> before an upload is treated as analyzed.</small></label>
              <div className="blimp-agent-provider-status" data-mode={realVisionReady ? 'real' : capabilityMode}>
                <span>VISION BACKEND</span>
                <strong>{realVisionReady ? `${configuredProvider} ready` : 'Provider setup needed'}</strong>
                <p>{realVisionReady ? `${String(capability.model || 'Configured multimodal model')} will process the uploaded image.` : 'Set GEMINI_API_KEY or QWEN_API_KEY in the Agent backend, restart it, then refresh this page.'}</p>
              </div>
            </div>
            <ImageControl image={image} error={fileError} preparing={preparingImage} onFile={loadImage} onClear={clearImage} label="Meal image" />
          </div>
        ) : null}

        {scenarioId === 'safety' ? (
          <div className="blimp-agent-vision-grid">
            <label>Scene description<textarea value={safetyScene} onChange={(event) => setSafetyScene(event.target.value)} rows={4} /></label>
            <ImageControl image={image} error={fileError} preparing={preparingImage} onFile={loadImage} onClear={clearImage} label="Workspace image" />
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
          <div>
            <p><strong>Public safety boundary.</strong> This action can inspect state, run perception/demo logic, or compute a setpoint. It cannot arm the robot or publish motor commands.</p>
            {result?.input ? <p className="blimp-agent-last-input" data-processed={result.input.processed}><strong>Last input:</strong> {result.input.name || result.input.source} · {result.input.processed ? 'processed by the real provider' : 'demo input'}</p> : null}
            {error ? <p className="blimp-agent-control-error" role="alert">{error}</p> : null}
          </div>
          <button type="button" className="blimp-agent-run" onClick={() => void runCurrent()} disabled={running || preparingImage}>{running ? 'Running agent…' : preparingImage ? 'Preparing image…' : scenarioId === 'nutrition' ? image ? 'Analyze uploaded meal' : 'Run disclosed demo meal' : scenario.actionLabel}</button>
        </div>
      </div>
    </section>
  )
}

function ImageControl({ image, error, preparing, label, onFile, onClear }: { image: PreparedAgentImage | null; error: string; preparing: boolean; label: string; onFile: (file?: File) => void; onClear: () => void }) {
  const inputId = useId()
  const formatBytes = (value: number) => `${(value / 1_000_000).toFixed(value >= 1_000_000 ? 1 : 2)} MB`
  const choosePrompt = label === 'Meal image' ? 'Choose a meal photo' : 'Choose a workspace photo'
  return (
    <div className="blimp-agent-upload-control">
      <div className="blimp-agent-upload-heading"><label htmlFor={inputId}>{label}</label>{image ? <button type="button" onClick={onClear}>Remove</button> : null}</div>
      <label className="blimp-agent-upload" htmlFor={inputId} data-has-image={Boolean(image)}>
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0]
            event.target.value = ''
            void onFile(file)
          }}
        />
        <span>
          {image ? <><img src={image.dataUrl} alt="Selected upload preview" /><span><strong>{image.name}</strong><small>{image.width} × {image.height} · {formatBytes(image.sizeBytes)}{image.resized ? ` · optimized from ${formatBytes(image.originalSizeBytes)}` : ''}</small><em>Choose another image</em></span></> : <><i aria-hidden="true">+</i><span><strong>{preparing ? 'Preparing image…' : choosePrompt}</strong><small>JPEG, PNG, or WebP · large photos are optimized before upload</small></span></>}
        </span>
      </label>
      {error ? <small className="is-error" role="alert">{error}</small> : <small>Without an upload, the backend runs a clearly labelled fixed demo fixture.</small>}
    </div>
  )
}

function RangeControl({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void }) {
  return (
    <label className="blimp-agent-range"><span>{label}<strong>{value.toFixed(step < 1 ? 1 : 0)}{unit}</strong></span><input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
  )
}
