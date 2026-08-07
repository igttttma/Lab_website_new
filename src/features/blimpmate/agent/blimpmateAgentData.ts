import { researchAsset } from '../blimpmateData'

export type AgentScenarioId = 'guidance' | 'reminder' | 'nutrition' | 'safety' | 'telepresence' | 'positioning'
export type AgentProvenanceMode = 'real' | 'fallback' | 'mock' | 'manual/Wizard-of-Oz' | 'unknown'

export type AgentCapability = {
  mode?: string
  provenance?: string
  reason?: string
  [key: string]: unknown
}

export type AgentDisplayItem = Record<string, unknown>

export type AgentDisplayState = {
  kind: string
  eyebrow?: string
  title: string
  body?: string
  emotion?: string
  items?: AgentDisplayItem[]
  metrics?: Record<string, unknown>
  target?: Record<string, unknown>
  command?: Record<string, unknown>
  [key: string]: unknown
}

export type AgentSnapshot = {
  success: boolean
  schema: string
  service: string
  connected: boolean
  mode: string
  captured_at: number
  upstream?: { available?: boolean; reason?: string }
  interaction_boundary: {
    digital_twin: boolean
    physical_flight_commands: boolean
    note: string
  }
  capabilities: {
    subsystems: Record<string, AgentCapability>
    summary: Record<string, unknown>
  }
  flight?: Record<string, unknown>
  positioning?: Record<string, unknown>
  users?: Record<string, unknown>
  webrtc?: Record<string, unknown>
  control_authority?: Record<string, unknown>
  telemetry?: Record<string, unknown>
  audit?: Record<string, unknown>
}

export type AgentActionResult = {
  success: boolean
  schema: string
  scenario: AgentScenarioId
  action: string
  mode: string
  digital_twin: boolean
  physical_control: boolean
  latency_ms: number
  provenance: {
    subsystem: string
    mode: AgentProvenanceMode
    reason: string
  }
  display: AgentDisplayState
  tools: Array<Record<string, unknown>>
  summary: string
  audit_recorded: boolean
  control_authority?: Record<string, unknown>
  interaction_boundary: string
  captured_at: number
  upstream?: { available?: boolean; reason?: string }
}

export type AgentScenario = {
  id: AgentScenarioId
  index: string
  label: string
  eyebrow: string
  title: string
  summary: string
  source: string
  image: string
  alt: string
  route: string
  action: string
  actionLabel: string
  capability: string
  defaultPayload: Record<string, unknown>
  preview: AgentDisplayState
}

export const agentScenarios: AgentScenario[] = [
  {
    id: 'guidance',
    index: '01',
    label: 'Guidance',
    eyebrow: 'POINT-OF-ACTION GUIDANCE',
    title: 'Move the next step into the workspace.',
    summary: 'Step state, spoken intent, and a projected task view are combined into a hands-free procedural loop.',
    source: 'Paper Figure 8 · task guidance',
    image: researchAsset('scenario-guidance-2.webp'),
    alt: 'BlimpMate showing a spatially relevant furniture assembly step.',
    route: '/projects/blimpmate/agent-lab/guidance',
    action: 'show_step',
    actionLabel: 'Show the next step',
    capability: 'display_stream',
    defaultPayload: { step_index: 1 },
    preview: {
      kind: 'steps', eyebrow: 'POINT-OF-ACTION GUIDANCE', title: 'Step 2 of 4',
      body: 'Place the target component', emotion: 'focus',
      items: [
        { label: 'Prepare the workspace', state: 'done' },
        { label: 'Place the target component', state: 'active' },
        { label: 'Tighten the two front fasteners', state: 'queued' },
      ],
    },
  },
  {
    id: 'reminder',
    index: '02',
    label: 'Reminder',
    eyebrow: 'CONTEXT-AWARE ASSISTANCE',
    title: 'Notice what matters before the user leaves.',
    summary: 'A small object memory and left-behind rule engine turn a departure cue into a nearby visual reminder.',
    source: 'Paper Figure 9b · left-behind reminder',
    image: researchAsset('scenario-context-2.webp'),
    alt: 'BlimpMate presenting a reminder for an important item left behind.',
    route: '/projects/blimpmate/agent-lab/reminder',
    action: 'scan',
    actionLabel: 'Simulate “I’m leaving”',
    capability: 'scene_left_behind',
    defaultPayload: { trigger: 'user_leaving', scene_hint: 'entryway', objects: [{ name: 'keys', location_hint: 'entryway shelf', importance_score: 0.95 }] },
    preview: {
      kind: 'notification', eyebrow: 'LEFT-BEHIND REMINDER', title: 'Take your keys',
      body: 'They were last seen near the entryway shelf.', emotion: 'alert',
      items: [{ object_name: 'keys', location_hint: 'entryway shelf', importance: 0.95 }],
    },
  },
  {
    id: 'nutrition',
    index: '03',
    label: 'Nutrition',
    eyebrow: 'MULTIMODAL MEAL FEEDBACK',
    title: 'Turn a visible meal into lightweight feedback.',
    summary: 'The card sends an optional image to the configured vision provider and renders explicit real/mock provenance.',
    source: 'Paper Figure 9a · meal-time feedback',
    image: researchAsset('scenario-context-1.webp'),
    alt: 'BlimpMate displaying approximate nutritional feedback beside a meal.',
    route: '/projects/blimpmate/agent-lab/nutrition',
    action: 'analyze',
    actionLabel: 'Analyze the demo meal',
    capability: 'vision_food',
    defaultPayload: { provider: 'gemini' },
    preview: {
      kind: 'nutrition', eyebrow: 'MEAL-TIME FEEDBACK', title: 'About 620 kcal',
      body: 'Approximate values for the visible meal; not medical advice.', emotion: 'helpful',
      metrics: { calories: 620, protein_g: 31, carbs_g: 68, fat_g: 24 },
      items: [{ name: 'rice bowl', calories: 360 }, { name: 'grilled protein', calories: 260 }],
    },
  },
  {
    id: 'safety',
    index: '04',
    label: 'Safety',
    eyebrow: 'SITUATED SAFETY CHECK',
    title: 'Bring a warning to the exact place it is useful.',
    summary: 'A scene hint or uploaded image drives a safety card while the interface exposes whether detection is real or simulated.',
    source: 'Paper Figure 9c · laboratory safety',
    image: researchAsset('scenario-context-3.webp'),
    alt: 'BlimpMate presenting a laboratory safety alert.',
    route: '/projects/blimpmate/agent-lab/safety',
    action: 'scan',
    actionLabel: 'Run a safety check',
    capability: 'scene_safety',
    defaultPayload: { scene_hint: 'laboratory bench with an uncapped container near the edge' },
    preview: {
      kind: 'safety', eyebrow: 'SITUATED SAFETY CHECK', title: 'Secure the open container',
      body: 'Move it away from the edge and confirm the cap before continuing.', emotion: 'alert',
      items: [{ level: 'warning', description: 'Open container near active workspace' }],
    },
  },
  {
    id: 'telepresence',
    index: '05',
    label: 'Telepresence',
    eyebrow: 'MOBILE SOCIAL PRESENCE',
    title: 'Keep a remote person present in the room.',
    summary: 'The web twin exposes incoming, connected, and ended states, plus any signaling peers reported by the backend.',
    source: 'Paper Figure 10 · mobile telepresence',
    image: researchAsset('telepresence-strip.webp'),
    alt: 'BlimpMate supporting hands-free and VR-mediated telepresence.',
    route: '/projects/blimpmate/agent-lab/telepresence',
    action: 'incoming',
    actionLabel: 'Simulate an incoming call',
    capability: 'phone_call',
    defaultPayload: { call_state: 'incoming', remote_name: 'Remote collaborator' },
    preview: {
      kind: 'telepresence', eyebrow: 'MOBILE TELEPRESENCE', title: 'Incoming call',
      body: 'Remote presence, camera, microphone, and control state remain visible.', emotion: 'social',
      items: [],
    },
  },
  {
    id: 'positioning',
    index: '06',
    label: 'Positioning',
    eyebrow: 'USER-RELATIVE POSITIONING',
    title: 'Compute where the interface should face.',
    summary: 'Bearing, distance, and elevation are mapped into a simulated setpoint. The public endpoint cannot engage flight control.',
    source: 'Paper Figure 5 · interaction architecture',
    image: researchAsset('networked-architecture.webp'),
    alt: 'BlimpMate networked architecture supporting distributed perception and control.',
    route: '/projects/blimpmate/agent-lab/positioning',
    action: 'compute',
    actionLabel: 'Compute a safe setpoint',
    capability: 'navigation',
    defaultPayload: { bearing_deg: 18, distance_m: 1.6, elevation_deg: 0, confidence: 0.95 },
    preview: {
      kind: 'positioning', eyebrow: 'USER-RELATIVE POSITIONING', title: 'Face 18° right',
      body: 'Target distance 1.6 m. Setpoint preview only; no actuator is connected.', emotion: 'focus',
      target: { bearing_deg: 18, distance_m: 1.6, elevation_deg: 0 },
      command: { yaw: 0.4, forward: 0.07, vertical: 0 },
      items: [{ label: 'Yaw', value: 0.4 }, { label: 'Forward', value: 0.07 }, { label: 'Vertical', value: 0 }],
    },
  },
]

export const agentScenarioIds = agentScenarios.map((scenario) => scenario.id)

export function getAgentScenario(id: AgentScenarioId) {
  return agentScenarios.find((scenario) => scenario.id === id) ?? agentScenarios[0]
}

export function scenarioFromPath(path: string): AgentScenarioId {
  const segment = path.split('/').filter(Boolean).at(-1)
  return agentScenarioIds.includes(segment as AgentScenarioId) ? segment as AgentScenarioId : 'reminder'
}

export function createDemoSnapshot(reason = 'Frontend-only preview'): AgentSnapshot {
  const subsystems = Object.fromEntries(agentScenarios.map((scenario) => [scenario.capability, {
    mode: scenario.id === 'nutrition' || scenario.id === 'safety' ? 'mock' : scenario.id === 'telepresence' ? 'manual' : 'fallback',
    provenance: scenario.id === 'nutrition' || scenario.id === 'safety' ? 'mock' : scenario.id === 'telepresence' ? 'manual/Wizard-of-Oz' : 'fallback',
    reason,
  }]))
  return {
    success: true,
    schema: 'blimpmate.web-experience.v1',
    service: 'browser-local-demo',
    connected: false,
    mode: 'demo',
    captured_at: Date.now() / 1000,
    upstream: { available: false, reason },
    interaction_boundary: {
      digital_twin: true,
      physical_flight_commands: false,
      note: 'The browser-local preview cannot arm or move the physical platform.',
    },
    capabilities: { subsystems, summary: { total: agentScenarios.length } },
    flight: { available: false, armed: false },
    control_authority: { mode: 'idle' },
  }
}

export function createDemoResult(scenarioId: AgentScenarioId, action = 'run', reason = 'Frontend-only preview'): AgentActionResult {
  const scenario = getAgentScenario(scenarioId)
  const capability = createDemoSnapshot(reason).capabilities.subsystems[scenario.capability]
  return {
    success: true,
    schema: 'blimpmate.web-experience.v1',
    scenario: scenarioId,
    action,
    mode: 'demo',
    digital_twin: true,
    physical_control: false,
    latency_ms: 0,
    provenance: {
      subsystem: scenario.capability,
      mode: (capability.provenance || 'unknown') as AgentProvenanceMode,
      reason: capability.reason || reason,
    },
    display: scenario.preview,
    tools: [{ tool: `browser.preview.${scenarioId}`, ok: true, actuator: false }],
    summary: 'Browser-local preview completed.',
    audit_recorded: false,
    control_authority: { mode: 'idle' },
    interaction_boundary: 'No physical-control operation is exposed by the public experience.',
    captured_at: Date.now() / 1000,
    upstream: { available: false, reason },
  }
}
