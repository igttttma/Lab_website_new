import { createElement, useEffect, useState } from 'react'
import { researchAsset } from './blimpmateData'

type BlimpModelProps = {
  scene?: 'lift' | 'listen' | 'glow'
  interactive?: boolean
  scrollRotation?: number
  className?: string
}

type ModelViewerElement = HTMLElement & { loaded?: boolean }

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
    let disposed = false

    const handleLoad = () => { if (!disposed) setStatus('ready') }
    const handleError = () => { if (!disposed) setStatus('error') }
    const timeout = window.setTimeout(handleError, 9000)

    model.addEventListener('load', handleLoad)
    model.addEventListener('error', handleError)
    if (model.loaded) handleLoad()

    if ('customElements' in window) {
      void window.customElements.whenDefined('model-viewer').then(() => {
        if (!disposed && model.loaded) handleLoad()
      }).catch(handleError)
    } else {
      handleError()
    }

    return () => {
      disposed = true
      window.clearTimeout(timeout)
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
      <img className="blimp-model-poster" src={fallbackImageUrl} alt="" aria-hidden="true" />
      {status === 'error'
        ? <img className="blimp-model-fallback" src={fallbackImageUrl} alt="BlimpMate presenting a projected visual update beside a user." />
        : viewer}
      <span className="blimp-model-status" aria-live="polite">
        {status === 'error' ? 'RESEARCH IMAGE · 3D FALLBACK' : 'LOADING BLIMPMATE MODEL'}
      </span>
    </div>
  )
}
