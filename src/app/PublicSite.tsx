import { useEffect, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { Section } from '../components/Section'
import type { LabContent, Project } from '../content/types'
import { fetchContent, loadContent } from '../services/contentRepository'

type PublicSiteProps = {
  currentPath: string
  onNavigate: (path: string) => void
}

function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  const hasImage = project.mediaKind === 'image' && Boolean(project.mediaUrl)
  const hasGif = project.mediaKind === 'image' && Boolean(project.gifUrl)

  return (
    <article className={compact ? 'project-card compact' : 'project-card'}>
      <div className={hasImage && hasGif ? 'project-media has-hover-gif' : 'project-media'} aria-hidden="true">
        {hasImage || hasGif ? (
          <>
            {hasImage ? <img className="project-still" src={project.mediaUrl} alt="" /> : null}
            {hasGif ? <img className="project-gif" src={project.gifUrl} alt="" /> : null}
          </>
        ) : (
          <>
            <div className="media-orbit">
              <span />
              <span />
            </div>
            <strong>{project.title.slice(0, 2).toUpperCase()}</strong>
          </>
        )}
      </div>
      <div className="project-copy">
        <h3>
          {project.title} <span>{project.punchline}</span>
        </h3>
        <p>{project.description}</p>
        <div className="tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="text-links">
          {project.links.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  )
}

function PersonCard({ person, alumni = false }: { person: LabContent['people'][number]; alumni?: boolean }) {
  return (
    <article className="person-card" key={person.id}>
      <div className="person-photo-wrap">
        <div className="person-photo-accent" />
        <div className="person-photo">
          {person.photoUrl ? <img src={person.photoUrl} alt={person.name} /> : <span>{person.name.slice(0, 1)}</span>}
        </div>
      </div>
      <div className="person-copy">
        <h4>
          {person.profileUrl ? <a href={person.profileUrl}>{person.name}</a> : person.name}
        </h4>
        {person.major ? <p className="major">{person.major}</p> : null}
        {alumni ? null : <p className="role">{person.role}</p>}
        {alumni && person.affiliation ? <p className="affiliation">{person.affiliation}</p> : null}
      </div>
    </article>
  )
}

function HomePage({ content, onNavigate }: { content: LabContent; onNavigate: (path: string) => void }) {
  const featuredProjects = content.projects.filter((project) => project.featured)

  return (
    <main>
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <p className="tagline">{content.identity.title}</p>
          <p>{content.identity.introduction}</p>
          <p className="leader-line">{content.identity.leaderLine}</p>
        </div>
        <div className="hero-panel" aria-label="PHOENIX Lab identity">
          {content.identity.heroMediaKind === 'video' && content.identity.heroMediaUrl ? (
            <video autoPlay loop muted playsInline src={content.identity.heroMediaUrl} />
          ) : content.identity.heroMediaUrl ? (
            <img src={content.identity.heroMediaUrl} alt="PHOENIX Lab" />
          ) : (
            <img src="/assets/brand/icon_with_char.svg" alt="PHOENIX Lab" />
          )}
        </div>
      </section>

      <Section id="latest-news" title="Latest News">
        <div className="news-grid">
          {content.news.map((item) => (
            <article className="news-item" key={item.id}>
              <time>{item.date}</time>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </Section>

      <Section
        id="featured-projects"
        title="Featured Projects"
        action={
          <a
            className="text-action"
            href="/projects"
            onClick={(event) => {
              event.preventDefault()
              onNavigate('/projects')
            }}
          >
            View All
          </a>
        }
      >
        <div className="featured-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Section>
    </main>
  )
}

function ProjectsPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="projects" title="Projects">
        <div className="project-list">
          {content.projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </Section>
    </main>
  )
}

function PeoplePage({ content }: { content: LabContent }) {
  const members = content.people.filter((person) => person.role !== 'Alumni')
  const alumni = content.people.filter((person) => person.role === 'Alumni')

  return (
    <main>
      <Section id="people" title="Lab Members">
        <div className="people-grid">
          {members.map((person) => <PersonCard key={person.id} person={person} />)}
        </div>
        {alumni.length > 0 ? (
          <section className="alumni-section">
            <h3>Alumni</h3>
            <div className="people-grid alumni-grid">
              {alumni.map((person) => <PersonCard alumni key={person.id} person={person} />)}
            </div>
          </section>
        ) : null}
      </Section>
    </main>
  )
}

function PublicationsPage({ content }: { content: LabContent }) {
  const publicationGroups = [...content.publications]
    .sort((a, b) => b.year.localeCompare(a.year))
    .reduce<Array<{ year: string; publications: typeof content.publications }>>((groups, publication) => {
      const group = groups.find((item) => item.year === publication.year)

      if (group) {
        group.publications.push(publication)
      } else {
        groups.push({ year: publication.year, publications: [publication] })
      }

      return groups
    }, [])

  return (
    <main>
      <Section id="publications" title="Publications">
        <div className="publication-list">
          {publicationGroups.map((group) => (
            <section className="publication-year-group" key={group.year}>
              <h3>{group.year}</h3>
              <div className="list-panel publication-items">
                {group.publications.map((publication) => (
                  <article className="publication-item" key={publication.id}>
                    <div className="publication-main-line">
                      <h4>{publication.title}</h4>
                      <span>{publication.venue}</span>
                      <time>{publication.year}</time>
                    </div>
                    <details className="publication-abstract">
                      <summary>
                        <span>Abstract</span>
                        {publication.doiHref || publication.links.length > 0 ? (
                          <span className="publication-actions">
                            {publication.doiHref ? (
                              <a className="doi-link" href={publication.doiHref}>
                                {publication.doiHref}
                              </a>
                            ) : null}
                            {publication.links.map((link) => (
                              <a href={link.href} key={link.label}>
                                {link.label}
                              </a>
                            ))}
                          </span>
                        ) : null}
                      </summary>
                      <p>{publication.abstract}</p>
                    </details>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </main>
  )
}

function TeachingPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="teaching" title="Classes">
        <div className="classes-grid">
          {content.teaching.map((item) => (
            <article className="teaching-card" key={item.id}>
              <div className="teaching-media" aria-hidden="true">
                {item.mediaKind === 'video' && item.mediaUrl ? (
                  <video autoPlay loop muted playsInline src={item.mediaUrl} />
                ) : item.mediaUrl ? (
                  <img src={item.mediaUrl} alt="" />
                ) : (
                  <span>{item.title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.links.length > 0 ? (
                  <div className="text-links">
                    {item.links.map((link) => (
                      <a href={link.href} key={link.label}>
                        {link.label}
                      </a>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </main>
  )
}

function JoinPage({ content }: { content: LabContent }) {
  const positionSections = content.join.sections.filter((section) => section.id !== 'how-to-apply')
  const howToApply = content.join.sections.find((section) => section.id === 'how-to-apply')

  return (
    <main>
      <Section id="join-us" title={content.join.title}>
        <div className="join-layout">
          <p className="join-intro">{content.join.intro}</p>
          <div className="join-sections">
            {positionSections.map((section) => (
              <article key={section.id}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
          {howToApply ? (
            <section className="apply-section">
              <h3>{howToApply.title}</h3>
              <p>{howToApply.body}</p>
              <p className="email-line">
                Email: <a href={`mailto:${content.join.applyEmail}`}>{content.join.applyEmail}</a>
              </p>
            </section>
          ) : (
            <p className="email-line">
              Email: <a href={`mailto:${content.join.applyEmail}`}>{content.join.applyEmail}</a>
            </p>
          )}
        </div>
      </Section>
    </main>
  )
}

function ContactPage({ content }: { content: LabContent }) {
  const visibleLinks = content.contact.links.filter((link) => !['Google Map', 'Campus Map'].includes(link.label))

  return (
    <main>
      <Section id="contact" title={content.contact.labName}>
        <div className="contact-grid">
          <address>
            {content.contact.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <div>
            <h3>{content.contact.contactName}</h3>
            <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
            <p>{content.contact.note}</p>
            {visibleLinks.length > 0 ? (
              <div className="text-links">
                {visibleLinks.map((link) => (
                  <a key={link.label} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
        <div className="map-embed">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3681.085926492482!2d114.2073560750936!3d22.687844979409768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3404769e8e03db83%3A0x72bee586ac015803!2z6aaZ5riv5Lit5paH5aSn5a2m77yI5rex5Zyz77yJ!5e0!3m2!1sen!2shk!4v1782220747490!5m2!1sen!2shk"
            title="PHOENIX Lab map"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>
    </main>
  )
}

function CurrentPage({ path, content, onNavigate }: { path: string; content: LabContent; onNavigate: (path: string) => void }) {
  switch (path) {
    case '/projects':
      return <ProjectsPage content={content} />
    case '/people':
      return <PeoplePage content={content} />
    case '/publications':
      return <PublicationsPage content={content} />
    case '/teaching':
      return <TeachingPage content={content} />
    case '/join-us':
      return <JoinPage content={content} />
    case '/contact':
      return <ContactPage content={content} />
    default:
      return <HomePage content={content} onNavigate={onNavigate} />
  }
}

export function PublicSite({ currentPath, onNavigate }: PublicSiteProps) {
  const [content, setContent] = useState<LabContent>(() => loadContent())

  useEffect(() => {
    const refreshContent = () => {
      fetchContent()
        .then(setContent)
        .catch(() => setContent(loadContent()))
    }

    refreshContent()
    window.addEventListener('focus', refreshContent)
    window.addEventListener('phoenix-content-updated', refreshContent)

    return () => {
      window.removeEventListener('focus', refreshContent)
      window.removeEventListener('phoenix-content-updated', refreshContent)
    }
  }, [])

  return (
    <>
      <BrandHeader
        currentPath={currentPath}
        navigation={content.navigation}
        onNavigate={onNavigate}
      />
      <CurrentPage content={content} onNavigate={onNavigate} path={currentPath} />
      <footer className="site-footer">
        <img src="/assets/brand/char_only.svg" alt="PHOENIX Lab" />
        <span className="footer-credit">
          <span>© 2026 PHOENIX Lab</span>
          <span>Built by Shan Lin</span>
        </span>
      </footer>
    </>
  )
}

