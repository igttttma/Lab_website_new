import type { AgentActionResult, AgentScenarioId, AgentSnapshot } from './blimpmateAgentData'
import { createDemoResult, createDemoSnapshot } from './blimpmateAgentData'

const directBase = String(import.meta.env.VITE_BLIMPMATE_AGENT_DIRECT_URL || '').replace(/\/$/, '')
const configuredTimeout = Number(import.meta.env.VITE_BLIMPMATE_AGENT_TIMEOUT_MS || 30000)
const timeoutMs = Number.isFinite(configuredTimeout) ? Math.max(250, Math.min(30000, configuredTimeout)) : 30000

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
    const hasUploadedImage = typeof payload.image === 'string' && payload.image.startsWith('data:image/')
    if (hasUploadedImage) throw error
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

export type PreparedAgentImage = {
  dataUrl: string
  name: string
  mimeType: string
  sizeBytes: number
  originalSizeBytes: number
  width: number
  height: number
  resized: boolean
}

const supportedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp'])
const maxSourceImageBytes = 20_000_000
const targetImageBytes = 4_500_000
const maxImageSide = 1920

export async function prepareImageForAgent(file: File): Promise<PreparedAgentImage> {
  if (!supportedImageTypes.has(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.')
  if (file.size > maxSourceImageBytes) throw new Error('Choose an image below 20 MB.')

  const bitmap = await createImageBitmap(file)
  try {
    const scale = Math.min(1, maxImageSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const shouldResize = scale < 1 || file.size > targetImageBytes
    if (!shouldResize) {
      return {
        dataUrl: await readImageAsDataUrl(file),
        name: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        originalSizeBytes: file.size,
        width,
        height,
        resized: false,
      }
    }

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('This browser cannot prepare the image.')
    context.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.86))
    if (!blob || blob.size > 6_000_000) throw new Error('The prepared image is still too large. Choose a smaller image.')
    const prepared = new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' })
    return {
      dataUrl: await readImageAsDataUrl(prepared),
      name: prepared.name,
      mimeType: prepared.type,
      sizeBytes: prepared.size,
      originalSizeBytes: file.size,
      width,
      height,
      resized: true,
    }
  } finally {
    bitmap.close()
  }
}
