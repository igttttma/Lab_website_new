import '@google/model-viewer'
import { createElement, useEffect, useState } from 'react'
import { researchAsset } from './blimpmateData'

type BlimpModelProps = {
  scene?: 'lift' | 'listen' | 'glow'
  interactive?: boolean
  scrollRotation?: number
  className?: string
}

type ModelViewerElement = HTMLElement

const modelUrl = '/assets/blimpmate/balloon-robot.glb'
const fallbackImageUrl = researchAsset('hero-update.webp')
const sceneAngles = {
  lift: 0,
  listen: 20,
  glow: -24,
} as const

export function BlimpModel({ scene = 'glow', interactive = false, scrollRotation = 0, className = '' }: BlimpModelProps) {
  const [modelElement, setModelElement] = useState<ModelViewerElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const cameraOrbit = `${sceneAngles[scene] + scrollRotation}deg 72deg auto`

  useEffect(() => {
    const model = modelElement
    if (!model) return
    const handleLoad = () => setStatus('ready')
    const handleError = () => setStatus('error')
    model.addEventListener('load', handleLoad)
    model.addEventListener('error', handleError)
    return () => {
      model.removeEventListener('load', handleLoad)
      model.removeEventListener('error', handleError)
    }
  }, [modelElement])

  const viewer = createElement('model-viewer', {
    ref: setModelElement,
    className: 'blimp-model-viewer',
    src: modelUrl,
    alt: 'BlimpMate balloon robot with a smile display',
    'camera-orbit': cameraOrbit,
    'camera-target': 'auto auto auto',
    'camera-controls': interactive ? '' : undefined,
    'interaction-prompt': 'none',
    'disable-zoom': '',
    'disable-pan': '',
    'field-of-view': '28deg',
    'shadow-intensity': '1.1',
    'shadow-softness': '0.8',
    exposure: '1.08',
    'environment-image': 'neutral',
    reveal: 'auto',
    loading: 'eager',
    poster: fallbackImageUrl,
  })

  return (
    <div className={`blimp-model-motion blimp-model-motion--${scene}${interactive ? ' blimp-model-motion--interactive' : ''} ${className}`.trim()} data-model-status={status}>
      {status === 'error' ? <img className="blimp-model-fallback" src={fallbackImageUrl} alt="BlimpMate presenting a projected visual update beside a user." /> : viewer}
      <span className="blimp-model-status" aria-live="polite">
        {status === 'error' ? 'MODEL PREVIEW UNAVAILABLE' : 'LOADING BLIMPMATE MODEL'}
      </span>
    </div>
  )
}
