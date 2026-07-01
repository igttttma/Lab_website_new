import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { JoinSection, LabContent, NewsItem, Person, Project, Publication, TeachingItem } from '../../content/types'
import { defaultContent } from '../../content/defaultContent'
import { getSession, loadAdminContent, login, logout, saveAdminContent } from './adminApi'
import { AdminItemForm, type AdminCategory, type AdminSelection } from './AdminItemForm'

type AdminPageProps = {
  onNavigate: (path: string) => void
}

type PendingAction = {
  label: string
  run: () => void
}

const categories: Array<{ id: AdminCategory; label: string; description: string }> = [
  { id: 'identity', label: 'Identity', description: 'Homepage identity.' },
  { id: 'news', label: 'News', description: 'Homepage updates.' },
  { id: 'projects', label: 'Projects', description: 'Project cards and links.' },
  { id: 'people', label: 'People', description: 'Lab member profiles.' },
  { id: 'publications', label: 'Publications', description: 'Papers and abstracts.' },
  { id: 'teaching', label: 'Teaching', description: 'Classes taught by the lab lead.' },
  { id: 'join', label: 'Join Us', description: 'Recruiting information.' },
  { id: 'contact', label: 'Contact', description: 'Address and contact info.' },
]

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}`
}

function cloneContent(content: LabContent): LabContent {
  return JSON.parse(JSON.stringify(content)) as LabContent
}

function getDefaultSelection(content: LabContent, category: AdminCategory): AdminSelection {
  if (category === 'identity') return { category, id: '__identity' }
  if (category === 'contact') return { category, id: '__contact' }
  if (category === 'join') return { category, id: '__overview' }
  return { category, id: getItems(content, category)[0]?.id || '' }
}

function getItems(content: LabContent, category: AdminCategory): Array<{ id: string; label: string; meta?: string }> {
  switch (category) {
    case 'identity':
      return [{ id: '__identity', label: 'Homepage Identity', meta: content.identity.title }]
    case 'contact':
      return [{ id: '__contact', label: 'Contact Details', meta: content.contact.email }]
    case 'news':
      return content.news.map((item) => ({ id: item.id, label: item.date, meta: item.text }))
    case 'projects':
      return content.projects.map((item) => ({ id: item.id, label: item.title, meta: item.featured ? 'Featured' : item.punchline }))
    case 'people':
      return content.people.map((item) => ({ id: item.id, label: item.name, meta: item.role }))
    case 'publications':
      return content.publications.map((item) => ({ id: item.id, label: item.title, meta: `${item.venue} ${item.year}` }))
    case 'teaching':
      return content.teaching.map((item) => ({ id: item.id, label: item.title, meta: item.description }))
    case 'join':
      return [
        { id: '__overview', label: 'Join page overview', meta: content.join.applyEmail },
        ...content.join.sections.map((item) => ({ id: item.id, label: item.title, meta: item.id === 'how-to-apply' ? 'Application instructions' : 'Open position' })),
      ]
  }
}

function addItem(content: LabContent, category: AdminCategory): { content: LabContent; selection: AdminSelection } | null {
  if (category === 'identity' || category === 'contact') return null

  if (category === 'news') {
    const item: NewsItem = { id: makeId('news'), date: '2026.06', text: 'New update' }
    return { content: { ...content, news: [...content.news, item] }, selection: { category, id: item.id } }
  }

  if (category === 'projects') {
    const item: Project = {
      id: makeId('project'),
      title: 'New Project',
      punchline: 'Project punchline.',
      description: 'Project description.',
      tags: [],
      links: [],
      featured: false,
      mediaKind: 'placeholder',
      mediaUrl: '',
      gifUrl: '',
    }
    return { content: { ...content, projects: [...content.projects, item] }, selection: { category, id: item.id } }
  }

  if (category === 'people') {
    const item: Person = {
      id: makeId('person'),
      name: 'New Member',
      major: '',
      role: 'PhD Student',
      affiliation: '',
      photoUrl: '',
      profileUrl: '',
    }
    return { content: { ...content, people: [...content.people, item] }, selection: { category, id: item.id } }
  }

  if (category === 'publications') {
    const item: Publication = { id: makeId('publication'), title: 'New Publication', venue: 'Venue', year: '2026', abstract: 'Abstract.', doiHref: '', links: [] }
    return { content: { ...content, publications: [...content.publications, item] }, selection: { category, id: item.id } }
  }

  if (category === 'teaching') {
    const item: TeachingItem = { id: makeId('teaching'), title: 'New Teaching Item', description: 'Description.', mediaKind: 'placeholder', mediaUrl: '', links: [] }
    return { content: { ...content, teaching: [...content.teaching, item] }, selection: { category, id: item.id } }
  }

  const item: JoinSection = { id: makeId('join'), title: 'New Section', body: 'Section text.' }
  return { content: { ...content, join: { ...content.join, sections: [...content.join.sections, item] } }, selection: { category, id: item.id } }
}

function deleteSelected(content: LabContent, selection: AdminSelection): LabContent {
  switch (selection.category) {
    case 'news':
      return { ...content, news: content.news.filter((item) => item.id !== selection.id) }
    case 'projects':
      return { ...content, projects: content.projects.filter((item) => item.id !== selection.id) }
    case 'people':
      return { ...content, people: content.people.filter((item) => item.id !== selection.id) }
    case 'publications':
      return { ...content, publications: content.publications.filter((item) => item.id !== selection.id) }
    case 'teaching':
      return { ...content, teaching: content.teaching.filter((item) => item.id !== selection.id) }
    case 'join':
      return selection.id === '__overview' ? content : { ...content, join: { ...content.join, sections: content.join.sections.filter((item) => item.id !== selection.id) } }
    default:
      return content
  }
}

function LoginPanel({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      await login(password)
      onLogin()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login-shell">
      <form className="admin-login" onSubmit={submit}>
        <img src="/assets/brand/icon_with_char.svg" alt="PHOENIX Lab" />
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Sign In</h1>
          <p>Enter the site admin password to edit PHOENIX Lab content.</p>
        </div>
        <label className="cms-field">
          <span>Password</span>
          <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {error ? <p className="admin-error">{error}</p> : null}
        <button className="primary-action" disabled={busy} type="submit">
          {busy ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  )
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [savedContent, setSavedContent] = useState<LabContent>(defaultContent)
  const [draftContent, setDraftContent] = useState<LabContent>(defaultContent)
  const [selection, setSelection] = useState<AdminSelection>({ category: 'identity', id: '__identity' })
  const [status, setStatus] = useState('Saved')
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const dirty = JSON.stringify(savedContent) !== JSON.stringify(draftContent)
  const activeCategory = categories.find((category) => category.id === selection.category) ?? categories[0]
  const items = useMemo(() => getItems(draftContent, selection.category), [draftContent, selection.category])

  const loadContent = async () => {
    const nextContent = await loadAdminContent()
    setSavedContent(nextContent)
    setDraftContent(cloneContent(nextContent))
    setStatus('Saved')
  }

  useEffect(() => {
    getSession()
      .then(async (session) => {
        setAuthenticated(session.authenticated)
        if (session.authenticated) await loadContent()
      })
      .catch(() => setAuthenticated(false))
      .finally(() => setCheckingSession(false))
  }, [])

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const saveDraft = async () => {
    setStatus('Saving...')
    const result = await saveAdminContent(draftContent)
    setSavedContent(result.content)
    setDraftContent(cloneContent(result.content))
    setStatus('Saved')
    window.dispatchEvent(new Event('phoenix-content-updated'))
  }

  const requestTransition = (action: PendingAction) => {
    if (dirty) {
      setPendingAction(action)
      return
    }

    action.run()
  }

  const confirmSaveAndRun = async () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    await saveDraft()
    action.run()
  }

  const confirmDiscardAndRun = () => {
    if (!pendingAction) return
    const action = pendingAction
    setPendingAction(null)
    setDraftContent(cloneContent(savedContent))
    setStatus('Saved')
    action.run()
  }

  const chooseCategory = (category: AdminCategory) => {
    requestTransition({
      label: `Switch to ${categories.find((item) => item.id === category)?.label}`,
      run: () => setSelection(getDefaultSelection(draftContent, category)),
    })
  }

  const chooseItem = (nextSelection: AdminSelection) => {
    const label = getItems(draftContent, nextSelection.category).find((item) => item.id === nextSelection.id)?.label || 'item'
    requestTransition({
      label: `Open ${label}`,
      run: () => setSelection(nextSelection),
    })
  }

  const createItem = () => {
    const result = addItem(draftContent, selection.category)
    if (!result) return
    setDraftContent(result.content)
    setSelection(result.selection)
    setStatus('Unsaved new item')
  }

  const removeItem = () => {
    const nextContent = deleteSelected(draftContent, selection)
    const nextSelection = getDefaultSelection(nextContent, selection.category)
    setDraftContent(nextContent)
    setSelection(nextSelection)
    setStatus('Unsaved deletion')
  }

  const viewSite = () => requestTransition({ label: 'View Site', run: () => onNavigate('/') })

  const signOut = () => {
    requestTransition({
      label: 'Sign Out',
      run: async () => {
        await logout()
        setAuthenticated(false)
      },
    })
  }

  if (checkingSession) {
    return (
      <main className="admin-login-shell">
        <p>Checking session...</p>
      </main>
    )
  }

  if (!authenticated) {
    return <LoginPanel onLogin={async () => { setAuthenticated(true); await loadContent() }} />
  }

  return (
    <main className="admin-app three-column">
      <aside className="admin-nav">
        <img src="/assets/brand/icon_with_char.svg" alt="PHOENIX Lab" />
        <nav aria-label="Content sections">
          {categories.map((category) => (
            <button className={selection.category === category.id ? 'active' : ''} key={category.id} type="button" onClick={() => chooseCategory(category.id)}>
              <strong>{category.label}</strong>
              <span>{category.description}</span>
            </button>
          ))}
        </nav>
        <div className="admin-nav-actions">
          <button type="button" onClick={viewSite}>View Site</button>
          <button type="button" onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      <aside className="admin-item-list">
        <header>
          <p className="eyebrow">{activeCategory.label}</p>
          <h2>{activeCategory.label}</h2>
          <p>{activeCategory.description}</p>
          {!['identity', 'contact'].includes(selection.category) ? (
            <button className="primary-action" type="button" onClick={createItem}>
              Add Item
            </button>
          ) : null}
        </header>
        <nav aria-label={`${activeCategory.label} items`}>
          {items.map((item) => (
            <button className={item.id === selection.id ? 'active' : ''} key={item.id} type="button" onClick={() => chooseItem({ category: selection.category, id: item.id })}>
              <strong>{item.label}</strong>
              {item.meta ? <span>{item.meta}</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <section className="admin-panel">
        <AdminItemForm
          content={draftContent}
          dirty={dirty}
          onChange={(nextContent) => {
            setDraftContent(nextContent)
            setStatus('Unsaved changes')
          }}
          onDelete={!['identity', 'contact'].includes(selection.category) && selection.id !== '__overview' ? removeItem : null}
          onSave={saveDraft}
          selection={selection}
          status={status}
        />
      </section>

      {pendingAction ? (
        <div className="admin-modal-backdrop" role="presentation">
          <div aria-modal="true" className="admin-modal" role="dialog">
            <h2>Unsaved Changes</h2>
            <p>You have unsaved changes. Save before continuing to {pendingAction.label}, or discard the edits?</p>
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setPendingAction(null)}>Keep Editing</button>
              <button type="button" onClick={confirmDiscardAndRun}>Discard and Continue</button>
              <button className="primary-action" type="button" onClick={confirmSaveAndRun}>Save and Continue</button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
