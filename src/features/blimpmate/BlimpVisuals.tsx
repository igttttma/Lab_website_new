import { useEffect, useId, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { PerformanceVisual, Scene } from './blimpmateData'
import { sceneRotations } from './blimpmateData'

type CSSVariables = CSSProperties & Record<`--${string}`, string | number>

type BlimpCubeProps = {
  scene: Scene
  interactive?: boolean
  scrollRotation?: number
}

export function BlimpCube({ scene, interactive = false, scrollRotation = 0 }: BlimpCubeProps) {
  const [pointerRotation, setPointerRotation] = useState({ x: 0, y: 0 })
  const [reducedMotion, setReducedMotion] = useState(false)
  const baseRotation = sceneRotations[scene]
  const effectiveScrollRotation = reducedMotion ? 0 : scrollRotation
  const rotationStyle: CSSProperties | undefined = interactive || effectiveScrollRotation !== 0
    ? {
        transform: `rotateX(${baseRotation.x + pointerRotation.x}deg) rotateY(${baseRotation.y + pointerRotation.y + effectiveScrollRotation}deg) rotateZ(${baseRotation.z}deg)`,
      }
    : undefined

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches)
    syncMotionPreference()
    mediaQuery.addEventListener?.('change', syncMotionPreference)
    return () => mediaQuery.removeEventListener?.('change', syncMotionPreference)
  }, [])

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!interactive || reducedMotion) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2
    setPointerRotation({ x: -y * 18, y: x * 24 })
  }

  const resetPointerRotation = () => {
    if (interactive) setPointerRotation({ x: 0, y: 0 })
  }

  return (
    <div
      className={`blimp-cube-motion blimp-cube-motion--${scene}${interactive ? ' blimp-cube-motion--interactive' : ''}`}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? resetPointerRotation : undefined}
      onPointerCancel={interactive ? resetPointerRotation : undefined}
    >
      <div className="blimp-cube" role="img" aria-label="A three-dimensional BlimpMate cube" style={rotationStyle}>
        <div className="blimp-cube-face blimp-cube-face--front" aria-hidden="true"><span>Blimp</span><strong>Mate</strong></div>
        <div className="blimp-cube-face blimp-cube-face--back" aria-hidden="true"><span>PHOENIX</span><strong>LAB</strong></div>
        <div className="blimp-cube-face blimp-cube-face--right" aria-hidden="true"><span>SOFT</span><strong>AIR</strong></div>
        <div className="blimp-cube-face blimp-cube-face--left" aria-hidden="true"><span>HCI</span><strong>ROBOTICS</strong></div>
        <div className="blimp-cube-face blimp-cube-face--top" aria-hidden="true"><span>MOVE</span></div>
        <div className="blimp-cube-face blimp-cube-face--bottom" aria-hidden="true"><span>2026</span></div>
      </div>
    </div>
  )
}

export function BlimpWaveField({ progress, visual }: { progress: number; visual: PerformanceVisual }) {
  const safeProgress = Math.min(1, Math.max(0, progress))
  const style = {
    '--wave-amplitude': `${12 + safeProgress * 76}px`,
    '--wave-opacity': 0.28 + safeProgress * 0.68,
    '--wave-scale': 0.72 + safeProgress * 0.28,
    '--wave-rotation': `${-16 + safeProgress * 32}deg`,
  } as CSSVariables

  return (
    <div className={`blimp-wave-field blimp-wave-field--${visual}`} style={style} aria-hidden="true">
      <div className="blimp-wave-rings">
        {[0, 1, 2, 3].map((ring) => <span key={ring} style={{ '--wave-delay': `${ring * 0.09}s` } as CSSVariables} />)}
      </div>
      <div className="blimp-wave-beam"><span /><span /><span /></div>
      <div className="blimp-wave-bars">
        {[0.36, 0.58, 0.8, 0.52, 0.92, 0.68, 0.44, 0.76, 1, 0.62, 0.84, 0.48, 0.72, 0.54, 0.9, 0.64, 0.4].map((height, index) => (
          <span key={index} style={{ '--bar-height': `${(18 + safeProgress * 90) * height}px` } as CSSVariables} />
        ))}
      </div>
    </div>
  )
}

type AssetBriefDialogProps = {
  kind: string
  ratio: string
  title: string
  body: string
  note?: string
  triggerLabel?: string
}

export function AssetBriefDialog({ kind, ratio, title, body, note, triggerLabel = 'View production brief' }: AssetBriefDialogProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const titleId = useId()

  const closeDialog = () => dialogRef.current?.close()

  return (
    <>
      <button className="blimp-asset-brief-open" type="button" onClick={() => dialogRef.current?.showModal()}>
        <span>{triggerLabel}</span><i aria-hidden="true">+</i>
      </button>
      <dialog
        className="blimp-asset-brief-dialog"
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) closeDialog() }}
      >
        <article>
          <div className="blimp-asset-brief-visual" aria-hidden="true">
            <span>{kind}</span><span>{ratio}</span>
            <div><i /><i /><i /></div>
            <strong>ASSET PLACEHOLDER</strong>
          </div>
          <div className="blimp-asset-brief-copy">
            <button className="blimp-asset-brief-close" type="button" onClick={closeDialog} aria-label={`Close ${title} production brief`}>×</button>
            <p className="blimp-eyebrow">PRODUCTION BRIEF</p>
            <h3 id={titleId}>{title}</h3>
            <p>{body}</p>
            {note ? <div><span>Capture constraints</span><strong>{note}</strong></div> : null}
          </div>
        </article>
      </dialog>
    </>
  )
}

type MediaPlaceholderProps = {
  kind: string
  ratio: string
  title: string
  body: string
  note?: string
  compact?: boolean
  children?: ReactNode
}

export function MediaPlaceholder({ kind, ratio, title, body, note, compact = false, children }: MediaPlaceholderProps) {
  return (
    <article className={`blimp-production-placeholder${compact ? ' blimp-production-placeholder--compact' : ''}`}>
      <div className="blimp-production-placeholder-frame" aria-label={`Placeholder for ${title}`}>
        <span className="blimp-production-placeholder-type">{kind}</span>
        <span className="blimp-production-placeholder-ratio">{ratio}</span>
        <div className="blimp-production-placeholder-mark" aria-hidden="true"><i /><i /><i /></div>
        {children}
      </div>
      <div className="blimp-production-placeholder-copy">
        <h3>{title}</h3>
        <p>{body}</p>
        {note ? <span>{note}</span> : null}
        <AssetBriefDialog kind={kind} ratio={ratio} title={title} body={body} note={note} />
      </div>
    </article>
  )
}
