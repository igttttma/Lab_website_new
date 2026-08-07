import type { AgentActionResult, AgentScenarioId, AgentSnapshot } from './blimpmateAgentData'
import { createDemoResult, createDemoSnapshot } from './blimpmateAgentData'

const directBase = String(import.meta.env.VITE_BLIMPMATE_AGENT_DIRECT_URL || '').replace(/\/$/, '')
const configuredTimeout = Number(import.meta.env.VITE_BLIMPMATE_AGENT_TIMEOUT_MS || 5000)
const timeoutMs = Number.isFinite(configuredTimeout) ? Math.max(250, Math.min(30000, configuredTimeout)) : 5000

class AgentRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AgentRequestError'
    this.status = status
  }
}

function endpoint(kind: 'snapshot' | 'action') {
  if (directBase) return `${directBase}/experience/${kind}`
  return `/api/blimpmate-agent/${kind}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      ...options,
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options?.headers || {}) },
      signal: controller.signal,
    })
    const raw = await response.text()
    let data: unknown = {}
    if (raw) {
      try {
        data = JSON.parse(raw)
      } catch {
        throw new AgentRequestError('Agent service returned invalid JSON', 502)
      }
    }
    if (!isRecord(data)) throw new AgentRequestError('Agent service returned a non-object response', 502)
    if (!response.ok) {
      const message = typeof data.error === 'string' && data.error.trim()
        ? data.error.trim()
        : `Agent request failed with ${response.status}`
      throw new AgentRequestError(message, response.status)
    }
    return data as T
  } finally {
    window.clearTimeout(timer)
  }
}

function reasonFromError(error: unknown) {
  if (error instanceof DOMException && error.name === 'AbortError') return `Agent request timed out after ${timeoutMs} ms`
  return error instanceof Error ? error.message : 'Agent service unavailable'
}

function shouldUseLocalDemo(error: unknown) {
  return !(error instanceof AgentRequestError) || error.status >= 500
}

export async function fetchAgentSnapshot(): Promise<AgentSnapshot> {
  try {
    return await requestJson<AgentSnapshot>(endpoint('snapshot'))
  } catch (error) {
    if (shouldUseLocalDemo(error)) return createDemoSnapshot(reasonFromError(error))
    throw error
  }
}

export async function executeAgentAction(
  scenario: AgentScenarioId,
  action: string,
  payload: Record<string, unknown>,
): Promise<AgentActionResult> {
  try {
    return await requestJson<AgentActionResult>(endpoint('action'), {
      method: 'POST',
      body: JSON.stringify({ scenario, action, payload }),
    })
  } catch (error) {
    if (shouldUseLocalDemo(error)) return createDemoResult(scenario, action, reasonFromError(error))
    throw error
  }
}

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result || '')))
    reader.addEventListener('error', () => reject(reader.error || new Error('Image could not be read')))
    reader.readAsDataURL(file)
  })
}
