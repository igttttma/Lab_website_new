import { useEffect, useState } from 'react'
import { BrandHeader } from '../components/BrandHeader'
import { Section } from '../components/Section'
import type { LabContent, PersonGroup, Project } from '../content/types'
import { loadContent } from '../services/contentRepository'

type PublicSiteProps = {
  currentPath: string
  onNavigate: (path: string) => void
}

const peopleOrder: PersonGroup[] = [
  'Professor',
  'Postdoc',
  'PhD',
  'MPhil',
  'Research Assistant',
  'Intern',
  'Visiting Student',
  'Alumni',
]

function ProjectCard({ project, compact = false }: { project: Project; compact?: boolean }) {
  return (
    <article className={compact ? 'project-card compact' : 'project-card'}>
      <div className="project-media" aria-hidden="true">
        <div className="media-orbit">
          <span />
          <span />
        </div>
        <strong>{project.title.slice(0, 2).toUpperCase()}</strong>
      </div>
      <div className="project-copy">
        <p className="punchline">{project.punchline}</p>
        <h3>{project.title}</h3>
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

function HomePage({ content }: { content: LabContent }) {
  const featuredProjects = content.projects.filter((project) => project.featured)

  return (
    <main>
      <section className="hero-section" id="home">
        <div className="hero-copy">
          <p className="eyebrow">{content.identity.title}</p>
          <p className="tagline">{content.identity.tagline}</p>
          <p>{content.identity.introduction}</p>
          <p className="leader-line">{content.identity.leaderLine}</p>
        </div>
        <div className="hero-panel" aria-label="PHOENIX Lab identity">
          <img src="/assets/brand/icon_with_char.svg" alt="PHOENIX Lab" />
        </div>
      </section>

      <Section id="latest-news" eyebrow="Home" title="Latest News">
        <div className="news-grid">
          {content.news.map((item) => (
            <article className="news-item" key={item.id}>
              <time>{item.date}</time>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="featured-projects" eyebrow="Selected Work" title="Featured Projects">
        <div className="featured-grid">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} compact={project.id !== 'photo-chromeleon'} />
          ))}
        </div>
      </Section>
    </main>
  )
}

function ProjectsPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="projects" eyebrow="Projects" title="Projects">
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
  return (
    <main>
      <Section id="people" eyebrow="People" title="Lab Members">
        <div className="people-sections">
          {peopleOrder.map((group) => {
            const people = content.people.filter((person) => person.group === group)

            if (people.length === 0) {
              return null
            }

            return (
              <section className="people-group" key={group}>
                <h3>{group}</h3>
                <div className="people-grid">
                  {people.map((person) => (
                    <article className="person-card" key={person.id}>
                      <div className="person-photo">
                        {person.photoUrl ? <img src={person.photoUrl} alt={person.name} /> : <span>{person.name.slice(0, 1)}</span>}
                      </div>
                      <div>
                        <h4>{person.name}</h4>
                        <p className="role">{person.role}</p>
                        <p>{person.affiliation}</p>
                        <p>{person.bio}</p>
                        <div className="text-links">
                          {person.email ? <a href={`mailto:${person.email}`}>Email</a> : null}
                          {person.website ? <a href={person.website}>Personal Website</a> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </Section>
    </main>
  )
}

function PublicationsPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="publications" eyebrow="Research Output" title="Publications">
        <div className="list-panel">
          {content.publications.map((publication) => (
            <article key={publication.id}>
              <h3>{publication.title}</h3>
              <p>
                {publication.venue} · {publication.year}
              </p>
              <div className="text-links">
                {publication.links.map((link) => (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </main>
  )
}

function TeachingPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="teaching" eyebrow="Teaching" title="Courses & Materials">
        <div className="list-panel two-column">
          {content.teaching.map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="text-links">
                {item.links.map((link) => (
                  <a href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Section>
    </main>
  )
}

function JoinPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="join-us" eyebrow="Open Positions" title={content.join.title}>
        <div className="join-layout">
          <p className="join-intro">{content.join.intro}</p>
          <div className="join-sections">
            {content.join.sections.map((section) => (
              <article key={section.id}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </article>
            ))}
          </div>
          <a className="primary-action" href={`mailto:${content.join.applyEmail}`}>
            Apply by Email
          </a>
        </div>
      </Section>
    </main>
  )
}

function ContactPage({ content }: { content: LabContent }) {
  return (
    <main>
      <Section id="contact" eyebrow="Contact" title={content.contact.labName}>
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
            <div className="text-links">
              {content.contact.links.map((link) => (
                <a key={link.label} href={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}

function CurrentPage({ path, content }: { path: string; content: LabContent }) {
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
      return <HomePage content={content} />
  }
}

export function PublicSite({ currentPath, onNavigate }: PublicSiteProps) {
  const [content, setContent] = useState<LabContent>(() => loadContent())

  useEffect(() => {
    const onFocus = () => setContent(loadContent())
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [])

  return (
    <>
      <BrandHeader
        currentPath={currentPath}
        navigation={content.navigation}
        onNavigate={onNavigate}
      />
      <CurrentPage content={content} path={currentPath} />
      <footer className="site-footer">
        <img src="/assets/brand/char_only.svg" alt="PHOENIX Lab" />
        <span>© 2026 PHOENIX Lab</span>
      </footer>
    </>
  )
}
