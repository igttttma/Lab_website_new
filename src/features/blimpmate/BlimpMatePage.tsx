import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Project } from '../../content/types'
import { BlimpModel } from './BlimpModel'
import { BlimpWaveField } from './BlimpVisuals'
import {
  DesignStorySection,
  DisplayStoriesSection,
  HighlightsSection,
  HumanCompatibilitySection,
  IntelligenceSection,
  PresentationStatesSection,
  ProductViewerSection,
  ScenariosSection,
} from './BlimpExperienceSections'
import {
  ComparisonSection,
  FutureDirectionsSection,
  PerformanceEvidenceSection,
  ProductionPlanSection,
  ProjectOutro,
  ResearchContributionsSection,
  ResearchSection,
  SpecificationsSection,
  SystemSection,
} from './BlimpTechnicalSections'
import {
  highlightSlides,
  performanceChapters,
  researchAsset,
} from './blimpmateData'
import type { HotspotId, PresentationStateId, ScenarioId, SystemView } from './blimpmateData'

export { BlimpCube } from './BlimpVisuals'

type BlimpMatePageProps = {
  project?: Project
  onNavigate: (path: string) => void
}

type CSSVariables = CSSProperties & Record<`--${string}`, string | number>


const pageNavItems = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
  { id: 'display', label: 'Display' },
  { id: 'scenarios', label: 'Applications' },
  { id: 'system', label: 'System' },
  { id: 'tech-specs', label: 'Tech Specs' },
] as const

export function BlimpMatePage({ project, onNavigate }: BlimpMatePageProps) {
  const pageRef = useRef<HTMLElement | null>(null)
  const spinSectionRef = useRef<HTMLElement | null>(null)
  const highlightsRef = useRef<HTMLDivElement | null>(null)
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>('cooking')
  const [activePresentationId, setActivePresentationId] = useState<PresentationStateId>('avatar')
  const [activeSystemView, setActiveSystemView] = useState<SystemView>('hardware')
  const [activeHotspotId, setActiveHotspotId] = useState<HotspotId>('envelope')
  const [activeHighlightIndex, setActiveHighlightIndex] = useState(0)
  const [highlightsPaused, setHighlightsPaused] = useState(false)
  const [spinProgress, setSpinProgress] = useState(0)
  const [localNavCompact, setLocalNavCompact] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<(typeof pageNavItems)[number]['id']>('overview')
  const [pageProgress, setPageProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const description = project?.description ?? 'A quiet, long-endurance flying display for soft, situated, and embodied interaction.'
  const mediaUrl = project?.id === 'blimpmate' ? '' : project?.mediaUrl || project?.gifUrl || ''
  const activeChapterIndex = Math.min(performanceChapters.length - 1, Math.floor(spinProgress * performanceChapters.length))
  const activeChapter = performanceChapters[activeChapterIndex]
  const chapterProgress = Math.min(1, Math.max(0, spinProgress * performanceChapters.length - activeChapterIndex))
  const visualProgress = reducedMotion ? 0 : spinProgress

  const scrollHighlightCard = useCallback((index: number) => {
    const rail = highlightsRef.current
    const card = rail?.querySelector<HTMLElement>(`[data-highlight-index="${index}"]`)
    if (!rail || !card) return

    const railRect = rail.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    if (cardRect.left >= railRect.left && cardRect.right <= railRect.right) return

    rail.scrollTo({
      left: Math.max(0, card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2),
      behavior: reducedMotion ? 'auto' : 'smooth',
    })
  }, [reducedMotion])

  const selectHighlight = (index: number) => {
    const normalizedIndex = (index + highlightSlides.length) % highlightSlides.length
    setActiveHighlightIndex(normalizedIndex)
    scrollHighlightCard(normalizedIndex)
  }

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let frame = 0
    const updateNavState = () => {
      setLocalNavCompact(page.getBoundingClientRect().top <= 0)
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1)
      setPageProgress(Math.min(1, Math.max(0, window.scrollY / scrollable)))
    }
    const scheduleNavState = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateNavState()
      })
    }
    updateNavState()
    window.addEventListener('scroll', scheduleNavState, { passive: true })
    window.addEventListener('resize', scheduleNavState)
    return () => {
      window.removeEventListener('scroll', scheduleNavState)
      window.removeEventListener('resize', scheduleNavState)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const sections = pageNavItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section))
    if (!('IntersectionObserver' in window) || sections.length === 0) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveSectionId(visible.target.id as (typeof pageNavItems)[number]['id'])
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.01, 0.15, 0.35, 0.6] })
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionPreference = () => setReducedMotion(mediaQuery.matches)
    syncMotionPreference()
    mediaQuery.addEventListener?.('change', syncMotionPreference)
    return () => mediaQuery.removeEventListener?.('change', syncMotionPreference)
  }, [])

  useEffect(() => {
    if (highlightsPaused || reducedMotion) return
    const timer = window.setInterval(() => setActiveHighlightIndex((current) => {
      const next = (current + 1) % highlightSlides.length
      scrollHighlightCard(next)
      return next
    }), 5200)
    return () => window.clearInterval(timer)
  }, [highlightsPaused, reducedMotion, scrollHighlightCard])

  useEffect(() => {
    const section = spinSectionRef.current
    if (!section) return
    let frame = 0
    const updateProgress = () => {
      const distance = Math.max(section.offsetHeight - window.innerHeight, 1)
      setSpinProgress(Math.min(1, Math.max(0, -section.getBoundingClientRect().top / distance)))
    }
    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateProgress()
      })
    }
    updateProgress()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    const targets = Array.from(page.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => { target.dataset.visible = 'true' })
      return
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) (entry.target as HTMLElement).dataset.visible = 'true'
      })
    }, { threshold: 0.16, rootMargin: '0px 0px -4% 0px' })
    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  return (
    <main className="blimpmate-page" ref={pageRef}>
      <div className={`blimpmate-local-nav${localNavCompact ? ' blimpmate-local-nav--compact' : ''}`}>
        <div className="blimpmate-local-nav-inner">
          <a className="blimpmate-local-brand" href="#overview">BlimpMate <span>/ PHOENIX LAB</span></a>
          <nav aria-label="BlimpMate sections">
            {pageNavItems.map((item) => <a href={`#${item.id}`} aria-current={activeSectionId === item.id ? 'location' : undefined} key={item.id}>{item.label}</a>)}
          </nav>
          <a className="blimpmate-local-cta" href={researchAsset('blimpmate-paper.pdf')} target="_blank" rel="noreferrer">Open paper</a>
        </div>
        <span className="blimpmate-local-progress" aria-hidden="true"><i style={{ width: `${pageProgress * 100}%` }} /></span>
      </div>

      <section className="blimp-hero" id="overview">
        <div className="blimp-hero-copy blimp-reveal" data-reveal data-visible="true">
          <p className="blimp-hero-research-badge">UIST ’26 research prototype</p>
          <h1>BlimpMate</h1>
          <p className="blimp-hero-tagline">A display that comes to you.</p>
          <p className="blimp-hero-description">{description}</p>
          <div className="blimp-hero-actions"><a className="blimp-pill blimp-pill--dark" href="#story">Explore BlimpMate</a><a className="blimp-text-link" href={researchAsset('blimpmate-paper.pdf')} target="_blank" rel="noreferrer">Read the research <span aria-hidden="true">↗</span></a></div>
          <a className="blimp-scroll-cue" href="#story"><span aria-hidden="true" />Scroll to explore</a>
        </div>
        <div className="blimp-hero-art">
          <span className="blimp-hero-wordmark" aria-hidden="true">BLIMPMATE</span>
          <BlimpModel scene="lift" interactive />
          <div className="blimp-orbit blimp-orbit--one" /><div className="blimp-orbit blimp-orbit--two" />
          <p>quiet / long-endurance / hands-free</p>
        </div>
      </section>

      <section className="blimp-facts" aria-label="BlimpMate key facts">
        <div><strong>33″</strong><span>projected display</span></div>
        <div><strong>47.1 dB(A)</strong><span>routine hover</span></div>
        <div><strong>73 min</strong><span>hover + lightweight visuals</span></div>
        <div><strong>323.7 g</strong><span>integrated prototype mass</span></div>
      </section>

      <section className="blimp-intro-panel" data-reveal data-visible="false">
        <p className="blimp-eyebrow">LOVE AT FIRST FLIGHT</p>
        <h2>Not another screen.<br />A new place for information.</h2>
        <p>BlimpMate explores how a display can share the same physical world as the people and tasks it serves — without being fixed to furniture or held in the hand.</p>
      </section>

      <HighlightsSection activeIndex={activeHighlightIndex} paused={highlightsPaused} railRef={highlightsRef} onSelect={selectHighlight} onMove={(direction) => selectHighlight(activeHighlightIndex + direction)} onTogglePause={() => setHighlightsPaused((current) => !current)} />
      <DesignStorySection />
      <ProductViewerSection activeId={activeHotspotId} onChange={setActiveHotspotId} />

      <section className="blimp-performance" id="performance" ref={spinSectionRef}>
        <div className="blimp-performance-sticky" style={{ '--performance-progress': spinProgress } as CSSVariables}>
          <div className="blimp-performance-copy blimp-reveal" data-reveal data-visible="false">
            <p className="blimp-eyebrow">PERFORMANCE / SCROLL TO EXPLORE</p>
            <h2>The muscle<br /><span>for calm flight.</span></h2>
            <p>One continuous scroll timeline moves through buoyancy, projection, control, and endurance. Drag the model to inspect it from another angle.</p>
            <div className="blimp-performance-chapter-list" aria-live="polite">
              {performanceChapters.map((chapter, index) => (
                <article className="blimp-performance-chapter" data-active={index === activeChapterIndex} aria-hidden={index !== activeChapterIndex} key={chapter.id}><p className="blimp-eyebrow">{chapter.eyebrow}</p><h3>{chapter.title}</h3><p>{chapter.body}</p><span>{chapter.status}</span></article>
              ))}
            </div>
          </div>
          <div className={`blimp-performance-stage blimp-performance-stage--${activeChapter.visual}`} role="region" aria-label="Scroll-controlled BlimpMate product animation" style={{ '--chapter-progress': chapterProgress } as CSSVariables}>
            <BlimpWaveField progress={visualProgress} visual={activeChapter.visual} />
            <BlimpModel scene="glow" interactive scrollRotation={visualProgress * 360} />
            <p className="blimp-performance-stage-label">SCROLL-SCRUB MODEL / RESEARCH PROTOTYPE</p>
            <div className="blimp-degree-readout" aria-live="polite"><strong>{Math.round(visualProgress * 360)}°</strong><span>scroll rotation</span></div>
          </div>
          <div className="blimp-performance-progress" aria-hidden="true"><span style={{ width: `${spinProgress * 100}%` }} /></div>
        </div>
      </section>

      <PerformanceEvidenceSection />
      <DisplayStoriesSection />
      <IntelligenceSection />
      <PresentationStatesSection activeId={activePresentationId} onChange={setActivePresentationId} />
      <ScenariosSection activeId={activeScenarioId} onChange={setActiveScenarioId} />
      <HumanCompatibilitySection />
      <SystemSection activeView={activeSystemView} onChange={setActiveSystemView} />
      <ResearchContributionsSection />
      <ComparisonSection />
      <SpecificationsSection />
      <FutureDirectionsSection />
      <ProductionPlanSection />
      <ResearchSection />
      <ProjectOutro project={project} mediaUrl={mediaUrl} onNavigate={onNavigate} />
    </main>
  )
}
