import type { KeyboardEvent } from 'react'
import type { Project } from '../../content/types'
import { AssetBriefDialog, BlimpCube, MediaPlaceholder } from './BlimpVisuals'
import {
  enduranceModes,
  futureDirections,
  paperMetadata,
  productionNeeds,
  researchAsset,
  researchContributions,
  specificationGroups,
  systemViews,
} from './blimpmateData'
import type { SystemView } from './blimpmateData'

function focusSiblingTab(event: KeyboardEvent<HTMLButtonElement>, direction: number) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [])
  const currentIndex = tabs.indexOf(event.currentTarget)
  if (currentIndex < 0 || tabs.length === 0) return
  tabs[(currentIndex + direction + tabs.length) % tabs.length]?.focus()
}

export function PerformanceEvidenceSection() {
  return (
    <section className="blimp-performance-evidence" aria-labelledby="blimp-performance-evidence-title">
      <div className="blimp-evidence-intro blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">MEASURED, NOT JUST IMAGINED</p>
        <h2 id="blimp-performance-evidence-title">Quiet. Visible. Long-running.</h2>
        <p>The integrated prototype was characterized across display performance, endurance, flight control, payload, and acoustic output.</p>
      </div>
      <div className="blimp-metric-grid">
        <article className="blimp-metric-card blimp-metric-card--hero blimp-reveal" data-reveal data-visible="false"><span>Routine hover</span><strong>47.1</strong><em>dB(A)</em><p>1.1 dB above the measured ambient background of 46.0 dB(A).</p></article>
        <article className="blimp-metric-card blimp-reveal" data-reveal data-visible="false"><span>Average screen luminance</span><strong>305.7</strong><em>cd/m²</em><p>Measured across a 3 × 3 grid under a full-white pattern.</p></article>
        <article className="blimp-metric-card blimp-reveal" data-reveal data-visible="false"><span>Hover + lightweight visuals</span><strong>73</strong><em>min</em><p>8.68 W average power in the matched endurance test.</p></article>
        <article className="blimp-metric-card blimp-reveal" data-reveal data-visible="false"><span>Hover + multimedia</span><strong>45</strong><em>min</em><p>14.75 W average power in the matched multimedia playback test.</p></article>
        <article className="blimp-metric-card blimp-reveal" data-reveal data-visible="false"><span>Resolved stripe width</span><strong>1.5</strong><em>mm</em><p>Effective spatial detail on the fully integrated screen.</p></article>
        <article className="blimp-metric-card blimp-reveal" data-reveal data-visible="false"><span>Yaw tracking correlation</span><strong>0.97</strong><em>r</em><p>Smooth commanded turning without obvious overshoot or oscillation.</p></article>
      </div>
      <div className="blimp-evidence-grid">
        <figure className="blimp-evidence-card blimp-reveal" data-reveal data-visible="false"><img src={researchAsset('display-performance.webp')} alt="Display luminance, viewing-angle, and spatial sharpness evaluation." /><figcaption><strong>Display performance</strong><span>Luminance distribution, wide-angle output, and spatial sharpness.</span></figcaption></figure>
        <figure className="blimp-evidence-card blimp-reveal" data-reveal data-visible="false"><img src={researchAsset('flight-control-evaluation.webp')} alt="Vertical and yaw flight-control response plots." /><figcaption><strong>Flight control</strong><span>Repeated ascent, hover, descent, turning, and heading-hold behavior.</span></figcaption></figure>
      </div>
      <div className="blimp-endurance-story blimp-reveal" data-reveal data-visible="false">
        <div className="blimp-endurance-copy"><p className="blimp-eyebrow">POWER AND ENDURANCE</p><h3>Content changes the energy story.</h3><p>Projection power depends on what is shown. Lightweight UI graphics and text draw less power than continuous animation, video, and audio.</p></div>
        <div className="blimp-endurance-modes">
          {enduranceModes.map((mode) => (
            <div data-pending={'pending' in mode && mode.pending ? 'true' : undefined} key={mode.label}><span>{mode.label}</span><i><b style={{ width: `${mode.bar}%` }} /></i><strong>{mode.runtime}</strong><em>{mode.power}</em></div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SystemSection({ activeView, onChange }: { activeView: SystemView; onChange: (view: SystemView) => void }) {
  const active = systemViews[activeView]
  return (
    <section className="blimp-system" id="system">
      <div className="blimp-system-copy blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">THE SYSTEM</p>
        <h2>Small geometry.<br />Large connected system.</h2>
        <p>A 64 cm cube-shaped helium envelope carries the display, propulsion, sensing, control, and compute stack within a tightly managed payload budget.</p>
        <a className="blimp-paper-link" href={researchAsset('blimpmate-paper.pdf')} target="_blank" rel="noreferrer">Open the UIST ’26 paper ↗</a>
      </div>
      <div className="blimp-system-viewer blimp-reveal" data-reveal data-visible="false">
        <figure className="blimp-system-viewer-stage"><img src={active.image} alt={active.alt} /><figcaption>Paper figure / integrated prototype evidence</figcaption></figure>
        <div className="blimp-system-tabs" role="tablist" aria-label="BlimpMate system views">
          {(Object.keys(systemViews) as SystemView[]).map((view) => (
            <button type="button" role="tab" aria-selected={activeView === view} onClick={() => onChange(view)} onKeyDown={(event) => focusSiblingTab(event, event.key === 'ArrowLeft' ? -1 : 1)} key={view}>{systemViews[view].title}</button>
          ))}
        </div>
        <div className="blimp-system-viewer-copy" role="tabpanel" aria-live="polite"><p className="blimp-eyebrow">{active.label}</p><h3>{active.title}</h3><p>{active.body}</p></div>
      </div>
      <div className="blimp-system-layer-grid blimp-reveal" data-reveal data-visible="false">
        <article><span>01</span><h3>Passive lift</h3><p>Helium supplies buoyant lift so the motors can focus on correction and movement.</p></article>
        <article><span>02</span><h3>Optical body</h3><p>The envelope is simultaneously an airframe, light barrier, optical window, and screen.</p></article>
        <article><span>03</span><h3>Low-level control</h3><p>Vertical velocity and yaw are actively regulated for predictable indoor operation.</p></article>
        <article><span>04</span><h3>Distributed software</h3><p>External resources handle higher-level perception and reasoning while the aircraft stays light.</p></article>
      </div>
    </section>
  )
}


export function ResearchContributionsSection() {
  return (
    <section className="blimp-contributions" aria-labelledby="blimp-contributions-title">
      <header className="blimp-section-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">WHY BLIMPMATE MATTERS</p><h2 id="blimp-contributions-title">Three contributions. One integrated argument.</h2></div>
        <p>The page separates product storytelling from research claims: each contribution below reflects the paper’s stated framing and evaluation scope.</p>
      </header>
      <div className="blimp-contribution-rail" tabIndex={0} aria-label="BlimpMate research contributions">
        {researchContributions.map((contribution) => (
          <article className="blimp-contribution-card blimp-reveal" data-reveal data-visible="false" key={contribution.index}>
            <span>{contribution.index}</span>
            <h3>{contribution.title}</h3>
            <p>{contribution.body}</p>
            <i aria-hidden="true">↗</i>
          </article>
        ))}
      </div>
    </section>
  )
}

export function ComparisonSection() {
  return (
    <section className="blimp-comparison" aria-labelledby="blimp-comparison-title">
      <header className="blimp-section-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">A DISTINCT DESIGN SPACE</p><h2 id="blimp-comparison-title">Between a fixed screen and a multirotor drone.</h2></div>
        <p>This is the paper’s design framing, not a controlled comparative user study. Exact acoustic conditions differ across cited systems.</p>
      </header>
      <div className="blimp-comparison-table blimp-reveal" data-reveal data-visible="false" role="table" aria-label="Interface design-space comparison">
        <div className="blimp-comparison-row blimp-comparison-row--head" role="row"><span role="columnheader">Characteristic</span><strong role="columnheader">Fixed / handheld screen</strong><strong role="columnheader">Small multirotor</strong><strong role="columnheader">BlimpMate</strong></div>
        <div className="blimp-comparison-row" role="row"><span role="rowheader">Position</span><p>Predetermined location or held by the user.</p><p>Mobile in three dimensions.</p><p>Mobile in three dimensions, intended to remain near the user or task.</p></div>
        <div className="blimp-comparison-row" role="row"><span role="rowheader">Attention</span><p>Often requires a shift toward the device.</p><p>Can bring output into the surrounding space.</p><p>Frames visual information as spatially situated and nearby.</p></div>
        <div className="blimp-comparison-row" role="row"><span role="rowheader">Acoustic profile</span><p>No flight propulsion.</p><p>The paper cites prior small-drone measurements around 70–95 dB(A) under normalized 1 m conditions.</p><p>47.1 dB(A) mean routine hover in the reported room test.</p></div>
        <div className="blimp-comparison-row" role="row"><span role="rowheader">Physical presence</span><p>Rigid or handheld object.</p><p>Exposed high-speed rotors are a close-proximity concern.</p><p>Buoyant, softer body with compact propulsion modules.</p></div>
        <div className="blimp-comparison-row" role="row"><span role="rowheader">Duration</span><p>Depends on mains power or device battery.</p><p>Typically constrained by continuous lift power.</p><p>Near-neutral buoyancy supports 73 min hover with lightweight visuals in the tested prototype.</p></div>
      </div>
    </section>
  )
}

export function SpecificationsSection() {
  return (
    <section className="blimp-specifications" id="tech-specs" aria-labelledby="blimp-specifications-title">
      <header className="blimp-section-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">TECHNICAL SPECIFICATIONS</p><h2 id="blimp-specifications-title">The prototype, by the numbers.</h2></div>
        <p>Measurements and component descriptions are drawn from the submitted UIST ’26 paper and refer to the current research prototype.</p>
      </header>
      <div className="blimp-specification-groups">
        {specificationGroups.map((group, index) => (
          <details className="blimp-specification-group blimp-reveal" data-reveal data-visible="false" open={index === 0} key={group.title}>
            <summary><span>{String(index + 1).padStart(2, '0')}</span><h3>{group.title}</h3><i aria-hidden="true">+</i></summary>
            <dl>{group.rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
          </details>
        ))}
      </div>
    </section>
  )
}


export function FutureDirectionsSection() {
  return (
    <section className="blimp-future" aria-labelledby="blimp-future-title">
      <header className="blimp-centered-head blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">WHAT COMES NEXT</p>
        <h2 id="blimp-future-title">The research roadmap is part of the product story.</h2>
        <p>The current prototype demonstrates feasibility. The following cards preserve the paper’s open questions and specify the visual evidence needed for a credible next version.</p>
      </header>
      <div className="blimp-future-grid">
        {futureDirections.map((item) => (
          <article className="blimp-future-card blimp-reveal" data-reveal data-visible="false" key={item.index}>
            <div className="blimp-future-placeholder">
              <div><span>{item.kind}</span><span>{item.ratio}</span></div>
              <strong>VISUAL PLACEHOLDER</strong>
              <p>{item.brief}</p>
              <i aria-hidden="true" />
            </div>
            <div className="blimp-future-copy"><span>{item.index}</span><h3>{item.title}</h3><p>{item.body}</p><AssetBriefDialog kind={item.kind} ratio={item.ratio} title={`${item.title} visual`} body={item.brief} note="Label this as a future-direction concept and keep the visual within the current paper’s stated scope." triggerLabel="Open visual brief" /></div>
          </article>
        ))}
      </div>
    </section>
  )
}

export function ProductionPlanSection() {
  return (
    <section className="blimp-media-plan" aria-labelledby="blimp-media-plan-title">
      <div className="blimp-media-plan-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">MEDIA PRODUCTION PLAN</p><h2 id="blimp-media-plan-title">The blank spaces are specified, not hidden.</h2></div>
        <p>Every missing image or video remains visible as an empty production card with its intended content, framing, ratio, and purpose.</p>
      </div>
      <div className="blimp-production-grid">
        {productionNeeds.map((item) => <MediaPlaceholder key={item.title} kind={item.kind} ratio={item.ratio} title={item.title} body={item.body} note={item.note} />)}
      </div>
    </section>
  )
}

export function ResearchSection() {
  return (
    <section className="blimp-research" id="research" aria-labelledby="blimp-research-title">
      <div className="blimp-research-head blimp-reveal" data-reveal data-visible="false">
        <div><p className="blimp-eyebrow">RESEARCH DETAILS</p><h2 id="blimp-research-title">Built as a system, evaluated as one.</h2></div>
        <p>The paper frames BlimpMate as an integrated research platform rather than a passive blimp carrying a screen.</p>
      </div>
      <div className="blimp-research-layout">
        <div className="blimp-research-accordions blimp-reveal" data-reveal data-visible="false">
          <details open><summary>Hardware and envelope <span>+</span></summary><p>The envelope uses a black OPA/Al/PE laminated barrier film, a matte PE projection-screen region, and a transparent PE optical window. Heavy modules are mounted low to reduce the center of mass.</p></details>
          <details><summary>Projection display <span>+</span></summary><p>The Ultimems HD309 MEMS-based LBS module weighs 24.9 g, supports 1280 × 720 at 60 Hz with 10-bit RGB laser output, and uses a custom 180° fisheye lens for short-throw rear projection.</p></details>
          <details><summary>Flight control <span>+</span></summary><p>Passive restoring behavior stabilizes roll and pitch. Active control concentrates on vertical motion and yaw through VStab and YawStab, using optical flow and onboard inertial sensing.</p></details>
          <details><summary>Current limitations <span>+</span></summary><p>The paper identifies opportunities to reduce platform size, improve battery-energy tradeoffs, increase display clarity and brightness, broaden viewing angle, and study practical legibility, privacy, safety, and multi-user interaction.</p></details>
        </div>
        <aside className="blimp-paper-card blimp-reveal" data-reveal data-visible="false">
          <p className="blimp-eyebrow">UIST ’26 PAPER</p>
          <h3>BlimpMate: A Quiet, Long-Endurance Flying Display for Hands-Free Intelligent Interaction</h3>
          <p>{paperMetadata.authors}.</p>
          <dl><div><dt>Venue</dt><dd>{paperMetadata.venue}</dd></div><div><dt>Pages</dt><dd>{paperMetadata.pages}</dd></div><div><dt>DOI</dt><dd><a className="doi-link" href={`https://doi.org/${paperMetadata.doi}`} target="_blank" rel="noreferrer">{paperMetadata.doi}</a></dd></div></dl>
          <a className="blimp-pill blimp-pill--light" href={researchAsset('blimpmate-paper.pdf')} target="_blank" rel="noreferrer">Open PDF</a>
        </aside>
      </div>
    </section>
  )
}

export function ProjectOutro({ project, mediaUrl, onNavigate }: { project?: Project; mediaUrl: string; onNavigate: (path: string) => void }) {
  return (
    <section className="blimp-project" id="project">
      <div className="blimp-project-media">{mediaUrl ? <img src={mediaUrl} alt="BlimpMate flying display" /> : <BlimpCube scene="glow" />}{!mediaUrl ? <p className="blimp-project-media-note">FINAL PRODUCT FILM / PHOTO PLACEHOLDER</p> : null}</div>
      <div className="blimp-project-copy blimp-reveal" data-reveal data-visible="false">
        <p className="blimp-eyebrow">PHOENIX LAB PROJECT</p>
        <h2>{project?.punchline ?? 'A quiet flying display for soft, situated interaction.'}</h2>
        <div className="blimp-project-tags">{(project?.tags ?? ['Flying Display', 'Robotics', 'HCI']).map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="blimp-project-actions"><a className="blimp-pill blimp-pill--light" href={researchAsset('blimpmate-paper.pdf')} target="_blank" rel="noreferrer">Read the paper</a><button type="button" className="blimp-back-button" onClick={() => onNavigate('/projects')}>Back to all projects <span aria-hidden="true">↗</span></button></div>
      </div>
    </section>
  )
}
