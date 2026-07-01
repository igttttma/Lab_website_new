import type { LabContent, NewsItem, Person, Project, Publication, TeachingItem } from '../../content/types'
import type { ReactNode } from 'react'
import { CheckboxField, ImageUploadField, LinksField, MediaUploadField, SelectField, StringListField, TextAreaField, TextField } from './EditorControls'

export type AdminCategory = 'identity' | 'news' | 'projects' | 'people' | 'publications' | 'teaching' | 'join' | 'contact'

export type AdminSelection = {
  category: AdminCategory
  id: string
}

type ItemFormProps = {
  content: LabContent
  selection: AdminSelection
  onChange: (content: LabContent) => void
  onSave: () => void
  onDelete: (() => void) | null
  dirty: boolean
  status: string
}

const personRoleOptions = [
  'Postdoctoral Researcher',
  'PhD Student',
  'MPhil Student',
  'Research Assistant',
  'Undergraduate Intern',
  'Visiting Student',
  'Alumni',
]
const customPersonRoleOption = 'Other'

function FormShell({ title, eyebrow, children, onSave, onDelete, dirty, status }: {
  title: string
  eyebrow: string
  children: ReactNode
  onSave: () => void
  onDelete: (() => void) | null
  dirty: boolean
  status: string
}) {
  return (
    <div className="admin-form-shell">
      <header className="admin-form-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className={dirty ? 'dirty' : ''}>{status}</p>
        </div>
        <div className="admin-form-actions">
          {onDelete ? (
            <button className="danger-action" type="button" onClick={onDelete}>
              Delete
            </button>
          ) : null}
          <button className="primary-action" disabled={!dirty} type="button" onClick={onSave}>
            Save
          </button>
        </div>
      </header>
      <div className="cms-form">{children}</div>
    </div>
  )
}

export function AdminItemForm({ content, selection, onChange, onSave, onDelete, dirty, status }: ItemFormProps) {
  if (selection.category === 'identity') {
    const update = (key: keyof LabContent['identity'], value: string) => {
      onChange({ ...content, identity: { ...content.identity, [key]: value } })
    }
    const updateHeroMedia = (heroMediaUrl: string) => {
      const extension = heroMediaUrl.split('?')[0]?.split('.').pop()?.toLowerCase()
      const heroMediaKind = heroMediaUrl ? (['mp4', 'webm', 'ogv', 'ogg'].includes(extension || '') ? 'video' : extension === 'gif' ? 'gif' : 'image') : 'placeholder'

      onChange({ ...content, identity: { ...content.identity, heroMediaKind, heroMediaUrl } })
    }

    return (
      <FormShell dirty={dirty} eyebrow="Identity" onDelete={null} onSave={onSave} status={status} title="Homepage Identity">
        <TextField label="Title" value={content.identity.title} onChange={(value) => update('title', value)} />
        <TextField label="Short name" value={content.identity.shortName} onChange={(value) => update('shortName', value)} />
        <TextAreaField label="Introduction" value={content.identity.introduction} onChange={(value) => update('introduction', value)} />
        <TextField label="Leader line" value={content.identity.leaderLine} onChange={(value) => update('leaderLine', value)} />
        <MediaUploadField label="Hero media" value={content.identity.heroMediaUrl} onChange={updateHeroMedia} />
      </FormShell>
    )
  }

  if (selection.category === 'contact') {
    return (
      <FormShell dirty={dirty} eyebrow="Contact" onDelete={null} onSave={onSave} status={status} title="Contact Details">
        <TextField label="Lab name" value={content.contact.labName} onChange={(labName) => onChange({ ...content, contact: { ...content.contact, labName } })} />
        <StringListField label="Address lines" values={content.contact.addressLines} onChange={(addressLines) => onChange({ ...content, contact: { ...content.contact, addressLines } })} />
        <TextField label="Contact name" value={content.contact.contactName} onChange={(contactName) => onChange({ ...content, contact: { ...content.contact, contactName } })} />
        <TextField label="Email" value={content.contact.email} onChange={(email) => onChange({ ...content, contact: { ...content.contact, email } })} />
        <TextAreaField label="Note" value={content.contact.note} onChange={(note) => onChange({ ...content, contact: { ...content.contact, note } })} />
        <LinksField links={content.contact.links} onChange={(links) => onChange({ ...content, contact: { ...content.contact, links } })} />
      </FormShell>
    )
  }

  if (selection.category === 'news') {
    const item = content.news.find((news) => news.id === selection.id)
    if (!item) return null
    const update = (patch: Partial<NewsItem>) => onChange({ ...content, news: content.news.map((news) => (news.id === item.id ? { ...news, ...patch } : news)) })

    return (
      <FormShell dirty={dirty} eyebrow="News" onDelete={onDelete} onSave={onSave} status={status} title={item.date || 'News item'}>
        <TextField label="Date" value={item.date} onChange={(date) => update({ date })} />
        <TextAreaField label="Text" value={item.text} onChange={(text) => update({ text })} />
      </FormShell>
    )
  }

  if (selection.category === 'projects') {
    const item = content.projects.find((project) => project.id === selection.id)
    if (!item) return null
    const update = (patch: Partial<Project>) => onChange({ ...content, projects: content.projects.map((project) => (project.id === item.id ? { ...project, ...patch } : project)) })
    const updateVisualMedia = (patch: Partial<Project>) => {
      const nextMediaUrl = patch.mediaUrl ?? item.mediaUrl
      const nextGifUrl = patch.gifUrl ?? item.gifUrl ?? ''
      update({ ...patch, mediaKind: nextMediaUrl || nextGifUrl ? 'image' : 'placeholder' })
    }

    return (
      <FormShell dirty={dirty} eyebrow="Project" onDelete={onDelete} onSave={onSave} status={status} title={item.title || 'Project'}>
        <TextField label="Title" value={item.title} onChange={(title) => update({ title })} />
        <TextField label="Punchline" value={item.punchline} onChange={(punchline) => update({ punchline })} />
        <TextAreaField label="Description" value={item.description} onChange={(description) => update({ description })} />
        <StringListField label="Tags" values={item.tags} onChange={(tags) => update({ tags })} />
        <CheckboxField label="Featured on homepage" checked={item.featured} onChange={(featured) => update({ featured })} />
        <SelectField label="Media type" value={item.mediaKind} options={['placeholder', 'image']} onChange={(mediaKind) => update({ mediaKind })} />
        {item.mediaKind === 'image' ? (
          <>
            <ImageUploadField label="Static image" value={item.mediaUrl} onChange={(mediaUrl) => updateVisualMedia({ mediaUrl })} />
            <ImageUploadField
              label="Hover GIF"
              value={item.gifUrl ?? ''}
              accept="image/gif"
              fileType="GIF"
              onChange={(gifUrl) => updateVisualMedia({ gifUrl })}
            />
          </>
        ) : null}
        <LinksField links={item.links} onChange={(links) => update({ links })} />
      </FormShell>
    )
  }

  if (selection.category === 'people') {
    const item = content.people.find((person) => person.id === selection.id)
    if (!item) return null
    const update = (patch: Partial<Person>) => onChange({ ...content, people: content.people.map((person) => (person.id === item.id ? { ...person, ...patch } : person)) })
    const roleSelectValue = personRoleOptions.includes(item.role) ? item.role : customPersonRoleOption

    return (
      <FormShell dirty={dirty} eyebrow="Person" onDelete={onDelete} onSave={onSave} status={status} title={item.name || 'Person'}>
        <TextField label="Name" value={item.name} onChange={(name) => update({ name })} />
        <TextField label="Major" value={item.major} onChange={(major) => update({ major })} />
        <SelectField
          label="Role"
          value={roleSelectValue}
          options={[...personRoleOptions, customPersonRoleOption]}
          onChange={(role) => update({ role: role === customPersonRoleOption ? '' : role, affiliation: role === 'Alumni' ? item.affiliation : '' })}
        />
        {roleSelectValue === customPersonRoleOption ? (
          <TextField label="Custom role" value={item.role} onChange={(role) => update({ role })} />
        ) : null}
        {item.role === 'Alumni' ? (
          <TextField label="Destination" value={item.affiliation} onChange={(affiliation) => update({ affiliation })} />
        ) : null}
        <TextField label="Profile link" value={item.profileUrl} onChange={(profileUrl) => update({ profileUrl })} />
        <ImageUploadField label="Photo" value={item.photoUrl ?? ''} onChange={(photoUrl) => update({ photoUrl })} />
      </FormShell>
    )
  }

  if (selection.category === 'publications') {
    const item = content.publications.find((publication) => publication.id === selection.id)
    if (!item) return null
    const update = (patch: Partial<Publication>) => onChange({ ...content, publications: content.publications.map((publication) => (publication.id === item.id ? { ...publication, ...patch } : publication)) })

    return (
      <FormShell dirty={dirty} eyebrow="Publication" onDelete={onDelete} onSave={onSave} status={status} title={item.title || 'Publication'}>
        <TextField label="Title" value={item.title} onChange={(title) => update({ title })} />
        <TextField label="Venue" value={item.venue} onChange={(venue) => update({ venue })} />
        <TextField label="Year" value={item.year} onChange={(year) => update({ year })} />
        <TextAreaField label="Abstract" value={item.abstract} onChange={(abstract) => update({ abstract })} />
        <TextField label="DOI link" value={item.doiHref} onChange={(doiHref) => update({ doiHref })} />
        <LinksField links={item.links} onChange={(links) => update({ links })} />
      </FormShell>
    )
  }

  if (selection.category === 'teaching') {
    const item = content.teaching.find((teaching) => teaching.id === selection.id)
    if (!item) return null
    const update = (patch: Partial<TeachingItem>) => onChange({ ...content, teaching: content.teaching.map((teaching) => (teaching.id === item.id ? { ...teaching, ...patch } : teaching)) })
    const updateMedia = (mediaUrl: string) => {
      const extension = mediaUrl.split('?')[0]?.split('.').pop()?.toLowerCase()
      const mediaKind = mediaUrl ? (['mp4', 'webm', 'ogv', 'ogg'].includes(extension || '') ? 'video' : extension === 'gif' ? 'gif' : 'image') : 'placeholder'

      update({ mediaUrl, mediaKind })
    }

    return (
      <FormShell dirty={dirty} eyebrow="Teaching" onDelete={onDelete} onSave={onSave} status={status} title={item.title || 'Teaching item'}>
        <TextField label="Title" value={item.title} onChange={(title) => update({ title })} />
        <TextAreaField label="Description" value={item.description} onChange={(description) => update({ description })} />
        <MediaUploadField label="Media" value={item.mediaUrl} onChange={updateMedia} />
        <LinksField links={item.links} onChange={(links) => update({ links })} />
      </FormShell>
    )
  }

  if (selection.id === '__overview') {
    return (
      <FormShell dirty={dirty} eyebrow="Join Us" onDelete={null} onSave={onSave} status={status} title="Join page overview">
        <TextField label="Page title" value={content.join.title} onChange={(title) => onChange({ ...content, join: { ...content.join, title } })} />
        <TextAreaField label="Intro" value={content.join.intro} onChange={(intro) => onChange({ ...content, join: { ...content.join, intro } })} />
        <TextField label="Apply email" value={content.join.applyEmail} onChange={(applyEmail) => onChange({ ...content, join: { ...content.join, applyEmail } })} />
      </FormShell>
    )
  }

  const item = content.join.sections.find((section) => section.id === selection.id)
  if (!item) return null
  const update = (patch: Partial<(typeof content.join.sections)[number]>) => {
    onChange({ ...content, join: { ...content.join, sections: content.join.sections.map((section) => (section.id === item.id ? { ...section, ...patch } : section)) } })
  }

  return (
    <FormShell dirty={dirty} eyebrow="Join Us" onDelete={onDelete} onSave={onSave} status={status} title={item.title || 'Join section'}>
      <TextField label="Title" value={item.title} onChange={(title) => update({ title })} />
      <TextAreaField label="Body" value={item.body} onChange={(body) => update({ body })} />
    </FormShell>
  )
}
