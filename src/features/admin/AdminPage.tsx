import { useState } from 'react'
import type { LabContent, NewsItem, Project } from '../../content/types'
import { defaultContent } from '../../content/defaultContent'
import { loadContent, resetContent, saveContent } from '../../services/contentRepository'
import { ContactEditor, JoinEditor } from './JoinContactEditors'
import { PeopleEditor } from './PeopleEditor'

type AdminPageProps = {
  onNavigate: (path: string) => void
}

type AdminTab = 'identity' | 'news' | 'projects' | 'people' | 'join' | 'contact'

const tabs: AdminTab[] = ['identity', 'news', 'projects', 'people', 'join', 'contact']

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [content, setContent] = useState<LabContent>(() => loadContent())
  const [activeTab, setActiveTab] = useState<AdminTab>('identity')
  const [status, setStatus] = useState('Ready')

  const commit = (nextContent: LabContent) => {
    setContent(nextContent)
    saveContent(nextContent)
    setStatus('Saved')
  }

  const updateIdentity = (key: keyof LabContent['identity'], value: string) => {
    commit({ ...content, identity: { ...content.identity, [key]: value } })
  }

  const updateNews = (id: string, patch: Partial<NewsItem>) => {
    commit({ ...content, news: content.news.map((item) => (item.id === id ? { ...item, ...patch } : item)) })
  }

  const updateProject = (id: string, patch: Partial<Project>) => {
    commit({
      ...content,
      projects: content.projects.map((project) => (project.id === id ? { ...project, ...patch } : project)),
    })
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <img src="/assets/brand/icon_with_char.svg" alt="PHOENIX Lab" />
        <button type="button" onClick={() => onNavigate('/')}>
          View Site
        </button>
        <button
          type="button"
          onClick={() => {
            resetContent()
            setContent(defaultContent)
            setStatus('Reset to defaults')
          }}
        >
          Reset
        </button>
        <nav>
          {tabs.map((tab) => (
            <button className={activeTab === tab ? 'active' : ''} key={tab} type="button" onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <p>{status}</p>
      </aside>

      <section className="admin-workspace">
        <div className="admin-heading">
          <span>Content Management</span>
          <h1>{activeTab}</h1>
        </div>

        {activeTab === 'identity' ? (
          <div className="editor-grid">
            <label>
              Lab title
              <input value={content.identity.title} onChange={(event) => updateIdentity('title', event.target.value)} />
            </label>
            <label>
              Short name
              <input value={content.identity.shortName} onChange={(event) => updateIdentity('shortName', event.target.value)} />
            </label>
            <label>
              Tagline
              <input value={content.identity.tagline} onChange={(event) => updateIdentity('tagline', event.target.value)} />
            </label>
            <label>
              Introduction
              <textarea value={content.identity.introduction} onChange={(event) => updateIdentity('introduction', event.target.value)} />
            </label>
            <label>
              Leader line
              <input value={content.identity.leaderLine} onChange={(event) => updateIdentity('leaderLine', event.target.value)} />
            </label>
          </div>
        ) : null}

        {activeTab === 'news' ? (
          <div className="editor-stack">
            <button
              type="button"
              onClick={() =>
                commit({
                  ...content,
                  news: [...content.news, { id: makeId('news'), date: '2026.06', text: 'New update' }],
                })
              }
            >
              Add News
            </button>
            {content.news.map((item) => (
              <article className="editor-card" key={item.id}>
                <input value={item.date} onChange={(event) => updateNews(item.id, { date: event.target.value })} />
                <textarea value={item.text} onChange={(event) => updateNews(item.id, { text: event.target.value })} />
                <button type="button" onClick={() => commit({ ...content, news: content.news.filter((news) => news.id !== item.id) })}>
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {activeTab === 'projects' ? (
          <div className="editor-stack">
            <button
              type="button"
              onClick={() =>
                commit({
                  ...content,
                  projects: [
                    ...content.projects,
                    {
                      id: makeId('project'),
                      title: 'New Project',
                      punchline: 'A concise project hook.',
                      description: 'Project description.',
                      tags: ['HCI'],
                      links: [{ label: 'Project', href: '#' }],
                      featured: false,
                      mediaKind: 'placeholder',
                      mediaUrl: '',
                    },
                  ],
                })
              }
            >
              Add Project
            </button>
            {content.projects.map((project) => (
              <article className="editor-card" key={project.id}>
                <input value={project.title} onChange={(event) => updateProject(project.id, { title: event.target.value })} />
                <input value={project.punchline} onChange={(event) => updateProject(project.id, { punchline: event.target.value })} />
                <textarea value={project.description} onChange={(event) => updateProject(project.id, { description: event.target.value })} />
                <input
                  value={project.tags.join(' / ')}
                  onChange={(event) => updateProject(project.id, { tags: event.target.value.split('/').map((tag) => tag.trim()).filter(Boolean) })}
                />
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) => updateProject(project.id, { featured: event.target.checked })}
                  />
                  Featured
                </label>
                <button
                  type="button"
                  onClick={() => commit({ ...content, projects: content.projects.filter((item) => item.id !== project.id) })}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : null}

        {activeTab === 'people' ? (
          <PeopleEditor commit={commit} content={content} makeId={makeId} />
        ) : null}

        {activeTab === 'join' ? <JoinEditor commit={commit} content={content} makeId={makeId} /> : null}

        {activeTab === 'contact' ? <ContactEditor commit={commit} content={content} makeId={makeId} /> : null}
      </section>
    </main>
  )
}
