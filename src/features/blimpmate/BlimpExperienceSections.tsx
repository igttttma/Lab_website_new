import type { KeyboardEvent, RefObject } from 'react'
import { BlimpModel } from './BlimpModel'
import { MediaPlaceholder } from './BlimpVisuals'
import {
  highlightSlides,
  productHotspots,
  presentationStates,
  researchAsset,
  scenarioTabs,
} from './blimpmateData'
import type { HotspotId, PresentationStateId, ScenarioId } from './blimpmateData'

function focusSiblingTab(event: KeyboardEvent<HTMLButtonElement>, direction: number) {
  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
  event.preventDefault()
  const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
  const currentIndex = tabs.indexOf(event.currentTarget)
  if (currentIndex < 0 || tabs.length === 0) return
  tabs[(currentIndex + direction + tabs.length) % tabs.length]?.focus()
}

export function HighlightsSection({
  activeIndex,
  paused,
  railRef,
  onSelect,
  onMove,
  onTogglePause,
}: {
  activeIndex: number
  paused: boolean
  railRef: RefObject<HTMLDivElement | null>
  onSelect: (index: number) => void
  onMove: (direction: number) => void
  onTogglePause: () => void
}) {
  return (
    <section className="blimp-highlights" aria-labelledby="blimp-highlights-title">
      <div className="blimp-highlights-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">GET THE HIGHLIGHTS</p><h2 id="blimp-highlights-title">The story, at a glance.</h2></div>
        <div className="blimp-highlights-controls" aria-label="Highlights controls">
          <button type="button" onClick={() => onMove(-1)} aria-label="Previous highlight">←</button>
          <button type="button" onClick={() => onMove(1)} aria-label="Next highlight">→</button>
        </div>
      </div>
      <div className="blimp-highlights-rail" ref={railRef} tabIndex={0}>
        {highlightSlides.map((slide, index) => (
          <article
            className={`blimp-highlight-card blimp-highlight-card--${slide.kind}${slide.kind === 'metric' ? ` blimp-highlight-card--${slide.theme}` : ''} blimp-reveal`}
            data-reveal
            data-visible="false"
            data-highlight-index={index}
            data-active={index === activeIndex}
            key={slide.id}
          >
            {slide.kind === 'image' ? (
              <><img src={slide.image} alt={slide.alt} /><div><p>{slide.eyebrow}</p><h3>{slide.title}</h3><span>{slide.body}</span></div></>
            ) : (
              <><p className="blimp-eyebrow">{slide.eyebrow}</p><strong>{slide.metric}</strong><h3>{slide.title}</h3><span>{slide.body}</span></>
            )}
          </article>
        ))}
      </div>
      <div className="blimp-highlights-pagination" aria-label="Select a highlight">
        <div>
          {highlightSlides.map((slide, index) => (
            <button type="button" aria-label={`Show highlight ${index + 1}: ${slide.title}`} aria-current={index === activeIndex} onClick={() => onSelect(index)} key={slide.id} />
          ))}
        </div>
        <button className="blimp-highlights-pause" type="button" onClick={onTogglePause} aria-label={paused ? 'Resume automatic highlights' : 'Pause automatic highlights'}>
          {paused ? 'Play' : 'Pause'}
        </button>
      </div>
    </section>
  )
}

export function DesignStorySection() {
  return (
    <section className="blimp-design-story" id="story">
      <header className="blimp-centered-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">DESIGNED FOR SHARED SPACE</p>
        <h2>It does not wait on a desk.<br />It comes to the moment.</h2>
        <p>BlimpMate frames the aerial robot as a mobile visual interface: quiet enough to remain nearby, light enough to stay airborne, and expressive enough to make an answer visible.</p>
      </header>
      <figure className="blimp-design-story-image blimp-reveal" data-reveal data-visible="false">
        <img src={researchAsset('hero-dialogue.webp')} alt="BlimpMate conversation and live update sequence from the paper." />
        <figcaption>Paper Figure 1 · spoken request and nearby visual update</figcaption>
      </figure>
      <MediaPlaceholder
        kind="VIDEO"
        ratio="21:9 · 4K"
        title="Cinematic interaction sequence"
        body="A single continuous shot: BlimpMate approaches, stabilizes near the user, receives a spoken request, changes the projected interface, reorients, and leaves the frame."
        note="Needed to replace the static paper sequence in the hero narrative"
      />
    </section>
  )
}

export function ProductViewerSection({ activeId, onChange }: { activeId: HotspotId; onChange: (id: HotspotId) => void }) {
  const activeIndex = productHotspots.findIndex((item) => item.id === activeId)
  const active = productHotspots[activeIndex] ?? productHotspots[0]

  return (
    <section className="blimp-closer" aria-labelledby="blimp-closer-title">
      <header className="blimp-section-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">TAKE A CLOSER LOOK</p><h2 id="blimp-closer-title">One body. Several tightly coupled systems.</h2></div>
        <p>Select a subsystem to rotate the product view and reveal the design tradeoff behind it.</p>
      </header>
      <div className="blimp-closer-layout">
        <div className="blimp-hotspot-tabs blimp-reveal" role="tablist" aria-label="BlimpMate product subsystems" data-reveal data-visible="false">
          {productHotspots.map((item) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeId === item.id}
              onClick={() => onChange(item.id)}
              onKeyDown={(event) => focusSiblingTab(event, event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1)}
              key={item.id}
            ><span>{item.index}</span>{item.label}</button>
          ))}
        </div>
        <div className="blimp-closer-stage blimp-reveal" data-reveal data-visible="false">
          <div className="blimp-closer-model"><BlimpModel scene="glow" interactive scrollRotation={active.rotation} /></div>
          <div className="blimp-closer-readout" role="tabpanel" aria-live="polite">
            <p className="blimp-eyebrow">{active.index} / {active.label}</p>
            <h3>{active.title}</h3>
            <p>{active.body}</p>
            <strong>{active.metric}</strong><span>{active.detail}</span>
          </div>
          <span className="blimp-closer-index" aria-hidden="true">{String(activeIndex + 1).padStart(2, '0')}</span>
        </div>
      </div>
      <figure className="blimp-closer-diagram blimp-reveal" data-reveal data-visible="false">
        <img src={researchAsset('hardware-platform.webp')} alt="Annotated BlimpMate hardware platform and electronics layout." />
        <figcaption>Annotated prototype platform · Paper Figure 2</figcaption>
      </figure>
    </section>
  )
}

export function DisplayStoriesSection() {
  return (
    <section className="blimp-display-stories" id="display" aria-labelledby="blimp-display-title">
      <header className="blimp-centered-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">DISPLAY, SENSING, AND SOUND</p>
        <h2 id="blimp-display-title">A flying interface still has to be readable.</h2>
        <p>The paper evaluates the integrated optical system, not just the projector module in isolation.</p>
      </header>
      <div className="blimp-display-grid">
        <article className="blimp-display-card blimp-display-card--wide blimp-reveal" data-reveal data-visible="false">
          <div><p className="blimp-eyebrow">REAR PROJECTION</p><h3>Screen and airframe become the same surface.</h3><p>A transparent window passes the beam; a matte region diffuses it; the black body contains stray light.</p></div>
          <img src={researchAsset('projection-subsystem.webp')} alt="BlimpMate projection display architecture and MEMS scanning principle." />
        </article>
        <article className="blimp-display-card blimp-display-card--metric blimp-reveal" data-reveal data-visible="false"><p className="blimp-eyebrow">AVERAGE LUMINANCE</p><strong>305.7</strong><em>cd/m²</em><h3>Measured across nine screen locations.</h3><p>The sampled values ranged from 268.7 to 399.2 cd/m² under the static full-white test.</p></article>
        <article className="blimp-display-card blimp-display-card--metric blimp-reveal" data-reveal data-visible="false"><p className="blimp-eyebrow">SPATIAL DETAIL</p><strong>1.5</strong><em>mm</em><h3>Smallest clearly resolved stripe.</h3><p>Approximately 0.33 line pairs per millimeter on the fully integrated projection surface.</p></article>
        <article className="blimp-display-card blimp-display-card--wide blimp-reveal" data-reveal data-visible="false">
          <div><p className="blimp-eyebrow">INTEGRATED EVALUATION</p><h3>Brightness, angle, and sharpness — in one figure.</h3><p>Front-facing output was strongest, but measurable illuminance remained across a broad angular range at a 50 cm observation distance.</p></div>
          <img src={researchAsset('display-performance.webp')} alt="BlimpMate luminance, viewing-angle, and spatial sharpness evaluation." />
        </article>
        <MediaPlaceholder compact kind="VIDEO" ratio="16:9" title="In-flight readability study" body="Record text and UI legibility while the platform hovers at different distances, angles, and ambient-light levels." note="The paper identifies this as future evaluation; no footage is supplied." />
        <MediaPlaceholder compact kind="PHOTO / VIDEO" ratio="4:5" title="Camera, microphone, and speaker close-up" body="A clean macro view showing the sensing and audio components in relation to the display and lower frame." note="Use labels only where the hardware is clearly visible." />
      </div>
    </section>
  )
}

export function IntelligenceSection() {
  return (
    <section className="blimp-intelligence" aria-labelledby="blimp-intelligence-title">
      <header className="blimp-section-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">NETWORKED INTELLIGENCE</p><h2 id="blimp-intelligence-title">Keep the aircraft light. Put heavier reasoning elsewhere.</h2></div>
        <p>The prototype distributes functions instead of forcing every model, service, and interface onto the airborne payload.</p>
      </header>
      <figure className="blimp-intelligence-figure blimp-reveal" data-reveal data-visible="false">
        <img src={researchAsset('networked-architecture.webp')} alt="BlimpMate cloud, backend, onboard, mobile, and perception architecture." />
        <figcaption>Prototype networked interaction architecture · Paper Figure 5</figcaption>
      </figure>
      <div className="blimp-intelligence-layers">
        <article><span>01</span><h3>Cloud</h3><p>Large multimodal models and online media services.</p></article>
        <article><span>02</span><h3>Backend</h3><p>Dialogue, control services, interaction logic, memory, avatar rendering, and tool invocation.</p></article>
        <article><span>03</span><h3>Onboard</h3><p>Audio I/O, projected presentation, near-field sensing, communication, and stabilization.</p></article>
        <article><span>04</span><h3>Mobile</h3><p>High-level motion commands and low-latency video monitoring from a phone or VR device.</p></article>
      </div>
    </section>
  )
}


export function PresentationStatesSection({ activeId, onChange }: { activeId: PresentationStateId; onChange: (id: PresentationStateId) => void }) {
  const activeIndex = presentationStates.findIndex((state) => state.id === activeId)
  const active = presentationStates[activeIndex] ?? presentationStates[0]

  return (
    <section className="blimp-presentation-states" id="interfaces" aria-labelledby="blimp-presentation-title">
      <header className="blimp-centered-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">ONE BODY, MULTIPLE PRESENTATION STATES</p>
        <h2 id="blimp-presentation-title">The interface changes with the reason it is there.</h2>
        <p>The prototype architecture maps outputs into avatar, notification, media, task-related, and communication views. The cards below intentionally remain production briefs where dedicated UI footage is not yet available.</p>
      </header>
      <div className="blimp-state-gallery blimp-reveal" data-reveal data-visible="false">
        <div className="blimp-state-tabs" role="tablist" aria-label="BlimpMate presentation states">
          {presentationStates.map((state) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeId === state.id}
              onClick={() => onChange(state.id)}
              onKeyDown={(event) => focusSiblingTab(event, event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1)}
              key={state.id}
            >
              <span>{String(presentationStates.indexOf(state) + 1).padStart(2, '0')}</span>
              {state.label}
            </button>
          ))}
        </div>
        <div className="blimp-state-stage" role="tabpanel" aria-live="polite">
          <div className="blimp-state-asset" aria-label={`Placeholder asset brief for ${active.title}`}>
            <div className="blimp-state-asset-toolbar">
              <span>{active.assetKind}</span>
              <span>{active.ratio}</span>
            </div>
            <div className="blimp-state-asset-center">
              <span>ASSET PLACEHOLDER</span>
              <strong>{active.assetBrief}</strong>
              <p>{active.note}</p>
            </div>
            <div className="blimp-state-asset-grid" aria-hidden="true"><i /><i /><i /><i /></div>
          </div>
          <div className="blimp-state-copy">
            <p className="blimp-eyebrow">{active.eyebrow}</p>
            <h3>{active.title}</h3>
            <p>{active.body}</p>
            <span>{String(activeIndex + 1).padStart(2, '0')} / {String(presentationStates.length).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ScenariosSection({ activeId, onChange }: { activeId: ScenarioId; onChange: (id: ScenarioId) => void }) {
  const active = scenarioTabs.find((scenario) => scenario.id === activeId) ?? scenarioTabs[0]
  return (
    <section className="blimp-scenarios" id="scenarios">
      <header className="blimp-scenarios-header blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">APPLICATION SCENARIOS</p><h2>Information with a reason to be there.</h2>
        <p>These proof-of-concept paths illustrate hands-free guidance, proactive assistance, and spatially mobile communication. They are not an end-to-end autonomy evaluation.</p>
      </header>
      <div className="blimp-scenario-shell blimp-reveal" data-reveal data-visible="false">
        <div className="blimp-scenario-tabs" role="tablist" aria-label="BlimpMate application scenarios">
          {scenarioTabs.map((scenario) => (
            <button type="button" role="tab" aria-selected={activeId === scenario.id} onClick={() => onChange(scenario.id)} onKeyDown={(event) => focusSiblingTab(event, event.key === 'ArrowLeft' ? -1 : 1)} key={scenario.id}>{scenario.label}</button>
          ))}
        </div>
        <div className="blimp-scenario-stage" role="tabpanel" aria-live="polite">
          <figure><img src={active.image} alt={active.alt} /><figcaption>{active.source}</figcaption></figure>
          <div className="blimp-scenario-stage-copy"><p className="blimp-eyebrow">{active.eyebrow}</p><h3>{active.title}</h3><p>{active.body}</p><span>Paper-led interaction concept / prototype scope</span></div>
        </div>
      </div>
    </section>
  )
}

export function HumanCompatibilitySection() {
  return (
    <section className="blimp-human" aria-labelledby="blimp-human-title">
      <header className="blimp-centered-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">NEAR PEOPLE BY DESIGN</p>
        <h2 id="blimp-human-title">Quiet is a performance metric.<br />Trust is a design requirement.</h2>
        <p>The prototype’s measured acoustic profile supports calm indoor use. Comfort, safety, privacy, and multi-user behavior still require dedicated user studies and explicit product controls.</p>
      </header>
      <div className="blimp-human-grid">
        <article className="blimp-human-noise blimp-reveal" data-reveal data-visible="false">
          <p className="blimp-eyebrow">A-WEIGHTED SOUND</p><h3>Routine hover stayed close to room background.</h3>
          <div className="blimp-human-bars" aria-label="Mean sound level comparison">
            <div><span>Ambient room</span><i style={{ '--bar': '46%' } as React.CSSProperties} /><strong>46.0</strong></div>
            <div><span>Routine hover</span><i style={{ '--bar': '47.1%' } as React.CSSProperties} /><strong>47.1</strong></div>
            <div><span>Vertical motion</span><i style={{ '--bar': '50.5%' } as React.CSSProperties} /><strong>50.5</strong></div>
            <div><span>Horizontal motion</span><i style={{ '--bar': '49.7%' } as React.CSSProperties} /><strong>49.7</strong></div>
          </div><p>Mean L<sub>Aeq,120 s</sub> in dB(A), measured at 1 m under the reported conditions.</p>
        </article>
        <article className="blimp-human-principles blimp-reveal" data-reveal data-visible="false">
          <p className="blimp-eyebrow">PRODUCT PRINCIPLES</p>
          <div><span>01</span><h3>Calm motion</h3><p>Prioritize stable, legible repositioning over speed or spectacle.</p></div>
          <div><span>02</span><h3>Visible state</h3><p>Make listening, recording, connection, control, and movement states understandable in the room.</p></div>
          <div><span>03</span><h3>Human control</h3><p>Provide clear manual boundaries, emergency stop behavior, and predictable recovery.</p></div>
        </article>
        <MediaPlaceholder kind="USER STUDY" ratio="16:9" title="Close-proximity comfort and privacy study" body="Compare BlimpMate with a fixed display, voice assistant, HMD, and multirotor across approachability, comfort, safety, social presence, camera and microphone privacy, and task effectiveness." note="Explicitly listed as future work in the paper" />
      </div>
    </section>
  )
}
