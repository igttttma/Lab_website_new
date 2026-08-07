import { sendJson } from './http.mjs'
import { serverConfig } from './config.mjs'

const supportedScenarios = new Set([
  'guidance',
  'reminder',
  'nutrition',
  'safety',
  'telepresence',
  'positioning',
])

function isRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function cleanText(value, fallback = '', limit = 240) {
  const text = String(value ?? fallback).trim().replace(/\s+/g, ' ')
  return (text || String(fallback).trim().replace(/\s+/g, ' ')).slice(0, limit)
}

function sendAgentJson(response, status, data) {
  sendJson(response, status, data, {
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  })
}

async function readLimitedJson(request) {
  const chunks = []
  let total = 0

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > serverConfig.blimpmateAgentMaxRequestBytes) {
      const error = new Error(`Request body exceeds ${serverConfig.blimpmateAgentMaxRequestBytes} bytes`)
      error.status = 413
      throw error
    }
    chunks.push(buffer)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : null
}

const fallbackCapabilities = {
  display_stream: { mode: 'fallback', provenance: 'fallback', reason: 'Website-rendered digital twin display.' },
  scene_left_behind: { mode: 'fallback', provenance: 'fallback', reason: 'Deterministic object-memory demo while the host service is offline.' },
  vision_food: { mode: 'mock', provenance: 'mock', reason: 'Synthetic meal estimate while the host service is offline.' },
  scene_safety: { mode: 'mock', provenance: 'mock', reason: 'Scenario-aware safety example while the host service is offline.' },
  phone_call: { mode: 'manual', provenance: 'manual/Wizard-of-Oz', reason: 'Telepresence state is presented without a signaling peer.' },
  navigation: { mode: 'fallback', provenance: 'fallback', reason: 'Browser-only setpoint preview; no actuator is connected.' },
}

function nowSeconds() {
  return Date.now() / 1000
}

function modeSummary(subsystems) {
  const summary = { real: [], fallback: [], mock: [], manual: [], other: [] }
  for (const [key, value] of Object.entries(subsystems)) {
    const mode = value.mode === 'manual/Wizard-of-Oz' ? 'manual' : value.mode
    ;(summary[mode] || summary.other).push(key)
  }
  return {
    ...summary,
    total: Object.keys(subsystems).length,
    real_count: summary.real.length,
    fallback_count: summary.fallback.length,
    mock_count: summary.mock.length,
    manual_count: summary.manual.length,
  }
}

function fallbackSnapshot(reason) {
  return {
    success: true,
    schema: 'blimpmate.web-experience.v1',
    service: 'phoenix-lab-bff',
    connected: false,
    mode: 'demo',
    captured_at: nowSeconds(),
    upstream: { available: false, reason },
    interaction_boundary: {
      digital_twin: true,
      physical_flight_commands: false,
      note: 'The website demo renders agent state locally and never exposes flight-control writes.',
    },
    capabilities: {
      subsystems: fallbackCapabilities,
      summary: modeSummary(fallbackCapabilities),
    },
    flight: { available: false, armed: false, mode: 'offline-demo' },
    positioning: { available: false, engaged: false, simulation_only: true },
    users: { count: 0, present: [], addressed: false, shared_view: false, shared_view_mode: 'single', source: 'browser-demo' },
    webrtc: { available: false, transport: 'offline-demo', peers: [] },
    control_authority: { mode: 'idle', reason: 'Public digital-twin boundary' },
    telemetry: { events: 0, source: 'browser-session' },
    audit: { events: 0, source: 'browser-session' },
  }
}

function numeric(value, fallback, min, max) {
  const parsed = Number(value)
  const number = Number.isFinite(parsed) ? parsed : fallback
  return Math.max(min, Math.min(max, number))
}

function demoDisplay(scenario, payload = {}) {
  switch (scenario) {
    case 'guidance': {
      const defaultSteps = ['Prepare the workspace', 'Place the target component', 'Tighten the two front fasteners', 'Confirm alignment and finish']
      const requestedSteps = Array.isArray(payload.steps)
        ? payload.steps.slice(0, 12).map((step) => cleanText(step, '', 240)).filter(Boolean)
        : []
      const steps = requestedSteps.length ? requestedSteps : defaultSteps
      const stepIndex = Math.round(numeric(payload.step_index, 1, 0, steps.length - 1))
      return {
        kind: 'steps',
        eyebrow: 'POINT-OF-ACTION GUIDANCE',
        title: `Step ${stepIndex + 1} of ${steps.length}`,
        body: steps[stepIndex],
        emotion: 'focus',
        items: steps.map((label, index) => ({ label, state: index === stepIndex ? 'active' : index < stepIndex ? 'done' : 'queued' })),
      }
    }
    case 'reminder': {
      const objects = Array.isArray(payload.objects) && payload.objects.length ? payload.objects : [{ name: 'keys', location_hint: 'entryway shelf' }]
      const item = typeof objects[0] === 'string' ? { name: objects[0] } : objects[0]
      const name = cleanText(item?.name, 'keys', 80)
      const location = cleanText(item?.location_hint || item?.location, 'entryway shelf', 120)
      return {
        kind: 'notification',
        eyebrow: 'LEFT-BEHIND REMINDER',
        title: `Take your ${name}`,
        body: `The object-memory demo last saw it near the ${location}.`,
        emotion: 'alert',
        items: [{ object_name: name, location_hint: location, importance: 0.9, reason: 'user_leaving' }],
      }
    }
    case 'nutrition':
      return {
        kind: 'nutrition',
        eyebrow: 'MEAL-TIME FEEDBACK',
        title: 'About 620 kcal',
        body: 'A lightweight synthetic estimate for the web demo. Values are approximate, not medical advice.',
        emotion: 'helpful',
        provider: 'website-demo',
        metrics: { calories: 620, protein_g: 31, carbs_g: 68, fat_g: 24 },
        items: [
          { name: 'rice bowl', calories: 360, protein_g: 9, carbs_g: 63, fat_g: 7 },
          { name: 'grilled protein', calories: 260, protein_g: 22, carbs_g: 5, fat_g: 17 },
        ],
      }
    case 'safety': {
      const scene = cleanText(payload.scene_hint, 'laboratory bench', 500)
      return {
        kind: 'safety',
        eyebrow: 'SITUATED SAFETY CHECK',
        title: 'Uncapped container near the active workspace',
        body: 'Move the container away from the edge and confirm the cap before continuing.',
        emotion: 'alert',
        scene_hint: scene,
        mock_mode: true,
        items: [{ level: 'warning', description: 'Uncapped container near the active workspace', suggested_action: 'Move it away from the edge and secure the cap.' }],
      }
    }
    case 'telepresence': {
      const callState = ['incoming', 'accepted', 'ended'].includes(payload.call_state) ? payload.call_state : 'incoming'
      const name = cleanText(payload.remote_name, 'Remote collaborator', 80)
      return {
        kind: 'telepresence',
        eyebrow: 'MOBILE TELEPRESENCE',
        title: callState === 'accepted' ? `Connected with ${name}` : callState === 'ended' ? 'Call ended' : `Incoming call from ${name}`,
        body: callState === 'accepted' ? 'The projected interface keeps remote-presence, privacy, and control indicators visible.' : 'This browser card presents the call state without opening a real peer connection.',
        emotion: callState === 'ended' ? 'idle' : 'social',
        call_state: callState,
        remote_name: name,
        transport: 'offline-demo',
        items: [],
      }
    }
    case 'positioning': {
      const bearing = numeric(payload.bearing_deg, 18, -180, 180)
      const distance = numeric(payload.distance_m, 1.6, 0.2, 8)
      const elevation = numeric(payload.elevation_deg, 0, -60, 60)
      const yaw = numeric(bearing / 45, 0, -1, 1)
      const facing = Math.max(0, 1 - Math.abs(bearing) / 60)
      const forward = numeric((distance - 1.4) * 0.6 * facing, 0, -1, 1)
      const vertical = numeric(elevation * 0.03, 0, -1, 1)
      return {
        kind: 'positioning',
        eyebrow: 'USER-RELATIVE POSITIONING',
        title: `Face ${Math.abs(bearing).toFixed(0)}° ${bearing >= 0 ? 'right' : 'left'}`,
        body: `Target distance ${distance.toFixed(1)} m. This preview computes a setpoint only; no actuator is connected.`,
        emotion: 'focus',
        simulation_only: true,
        target: { bearing_deg: bearing, distance_m: distance, elevation_deg: elevation, confidence: 0.95 },
        command: { yaw, forward, vertical, lateral: 0, engaged: true, reason: 'browser simulation' },
        items: [
          { label: 'Yaw command', value: yaw },
          { label: 'Forward command', value: forward },
          { label: 'Vertical command', value: vertical },
        ],
      }
    }
    default:
      return { kind: 'notification', eyebrow: 'DIGITAL TWIN', title: 'Scenario unavailable', body: 'Select another scenario.', items: [] }
  }
}

function fallbackAction(scenario, action, payload, reason) {
  const capabilityKey = {
    guidance: 'display_stream', reminder: 'scene_left_behind', nutrition: 'vision_food',
    safety: 'scene_safety', telepresence: 'phone_call', positioning: 'navigation',
  }[scenario]
  const provenance = fallbackCapabilities[capabilityKey]
  return {
    success: true,
    schema: 'blimpmate.web-experience.v1',
    scenario,
    action,
    mode: 'demo',
    digital_twin: true,
    physical_control: false,
    latency_ms: 0,
    provenance: { subsystem: capabilityKey, mode: provenance.provenance, reason: `${provenance.reason} Upstream status: ${reason}` },
    display: demoDisplay(scenario, payload),
    tools: [{ tool: `website.demo.${scenario}`, ok: true, mode: 'demo', actuator: false }],
    summary: 'Deterministic browser-safe fallback completed.',
    audit_recorded: false,
    records: null,
    control_authority: { mode: 'idle', reason: 'Public digital-twin boundary' },
    interaction_boundary: 'No arming, motor command, manual mode, or autonomous run loop is available through this endpoint.',
    captured_at: nowSeconds(),
    upstream: { available: false, reason },
  }
}

async function requestAgent(pathname, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), serverConfig.blimpmateAgentTimeoutMs)
  try {
    const response = await fetch(`${serverConfig.blimpmateAgentUrl}${pathname}`, {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    })
    const text = await response.text()
    let data = {}
    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        const error = new Error('Agent service returned invalid JSON')
        error.status = 502
        throw error
      }
    }
    if (!response.ok) {
      const error = new Error(cleanText(data?.error, `Agent service returned ${response.status}`, 300))
      error.status = response.status
      throw error
    }
    if (!isRecord(data)) {
      const error = new Error('Agent service returned a non-object response')
      error.status = 502
      throw error
    }
    return data
  } finally {
    clearTimeout(timeout)
  }
}

function errorReason(error) {
  if (error?.name === 'AbortError') return `timeout after ${serverConfig.blimpmateAgentTimeoutMs} ms`
  return cleanText(error?.message, 'agent service unavailable', 300)
}

function mayUseFallback(error) {
  const status = Number(error?.status || 0)
  return serverConfig.blimpmateAgentDemoFallback && (!status || status >= 500)
}

export async function handleBlimpMateAgent(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/blimpmate-agent/snapshot') {
    try {
      const data = await requestAgent('/experience/snapshot')
      sendAgentJson(response, 200, { ...data, upstream: { available: true } })
    } catch (error) {
      if (!mayUseFallback(error)) {
        sendAgentJson(response, error?.status || 503, {
          success: false,
          error: errorReason(error),
          upstream: { available: false, status: error?.status || 503 },
        })
      } else {
        sendAgentJson(response, 200, fallbackSnapshot(errorReason(error)))
      }
    }
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/blimpmate-agent/action') {
    const contentLength = Number(request.headers['content-length'] || 0)
    if (Number.isFinite(contentLength) && contentLength > serverConfig.blimpmateAgentMaxRequestBytes) {
      sendAgentJson(response, 413, {
        success: false,
        error: `Request body exceeds ${serverConfig.blimpmateAgentMaxRequestBytes} bytes`,
      })
      return true
    }

    let body
    try {
      body = await readLimitedJson(request)
    } catch (error) {
      sendAgentJson(response, error?.status === 413 ? 413 : 400, {
        success: false,
        error: error?.status === 413 ? errorReason(error) : 'Invalid JSON body',
      })
      return true
    }
    if (!isRecord(body)) {
      sendAgentJson(response, 400, { success: false, error: 'JSON object required' })
      return true
    }

    const scenario = cleanText(body.scenario, '', 40).toLowerCase()
    const action = cleanText(body.action, 'run', 64).toLowerCase() || 'run'
    const payload = body.payload == null ? {} : body.payload
    if (!isRecord(payload)) {
      sendAgentJson(response, 400, { success: false, error: 'payload must be a JSON object' })
      return true
    }
    if (!supportedScenarios.has(scenario)) {
      sendAgentJson(response, 400, { success: false, error: 'Unsupported scenario', supported: [...supportedScenarios] })
      return true
    }

    try {
      const data = await requestAgent('/experience/action', {
        method: 'POST',
        body: JSON.stringify({ scenario, action, payload }),
      })
      sendAgentJson(response, 200, { ...data, upstream: { available: true } })
    } catch (error) {
      if (!mayUseFallback(error)) {
        sendAgentJson(response, error?.status || 503, {
          success: false,
          error: errorReason(error),
          upstream: { available: false, status: error?.status || 503 },
        })
      } else {
        sendAgentJson(response, 200, fallbackAction(scenario, action, payload, errorReason(error)))
      }
    }
    return true
  }

  return false
}
