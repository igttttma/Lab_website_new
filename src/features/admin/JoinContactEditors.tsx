import type { JoinSection, LabContent } from '../../content/types'

type EditorProps = {
  content: LabContent
  commit: (content: LabContent) => void
  makeId: (prefix: string) => string
}

export function JoinEditor({ content, commit, makeId }: EditorProps) {
  const updateSection = (id: string, patch: Partial<JoinSection>) => {
    commit({
      ...content,
      join: {
        ...content.join,
        sections: content.join.sections.map((section) => (section.id === id ? { ...section, ...patch } : section)),
      },
    })
  }

  return (
    <div className="editor-stack">
      <label>
        Page title
        <input value={content.join.title} onChange={(event) => commit({ ...content, join: { ...content.join, title: event.target.value } })} />
      </label>
      <label>
        Intro
        <textarea value={content.join.intro} onChange={(event) => commit({ ...content, join: { ...content.join, intro: event.target.value } })} />
      </label>
      <label>
        Apply email
        <input
          value={content.join.applyEmail}
          onChange={(event) => commit({ ...content, join: { ...content.join, applyEmail: event.target.value } })}
        />
      </label>
      <button
        type="button"
        onClick={() =>
          commit({
            ...content,
            join: {
              ...content.join,
              sections: [...content.join.sections, { id: makeId('join'), title: 'New Section', body: 'Section text.' }],
            },
          })
        }
      >
        Add Section
      </button>
      {content.join.sections.map((section) => (
        <article className="editor-card" key={section.id}>
          <label>
            Section title
            <input value={section.title} onChange={(event) => updateSection(section.id, { title: event.target.value })} />
          </label>
          <label>
            Body
            <textarea value={section.body} onChange={(event) => updateSection(section.id, { body: event.target.value })} />
          </label>
          <button
            type="button"
            onClick={() =>
              commit({
                ...content,
                join: { ...content.join, sections: content.join.sections.filter((item) => item.id !== section.id) },
              })
            }
          >
            Delete
          </button>
        </article>
      ))}
    </div>
  )
}

export function ContactEditor({ content, commit }: EditorProps) {
  return (
    <div className="editor-stack">
      <label>
        Lab name
        <input
          value={content.contact.labName}
          onChange={(event) => commit({ ...content, contact: { ...content.contact, labName: event.target.value } })}
        />
      </label>
      <label>
        Address lines
        <textarea
          value={content.contact.addressLines.join('\n')}
          onChange={(event) =>
            commit({
              ...content,
              contact: { ...content.contact, addressLines: event.target.value.split('\n').map((line) => line.trim()).filter(Boolean) },
            })
          }
        />
      </label>
      <label>
        Contact name
        <input
          value={content.contact.contactName}
          onChange={(event) => commit({ ...content, contact: { ...content.contact, contactName: event.target.value } })}
        />
      </label>
      <label>
        Email
        <input value={content.contact.email} onChange={(event) => commit({ ...content, contact: { ...content.contact, email: event.target.value } })} />
      </label>
      <label>
        Note
        <textarea value={content.contact.note} onChange={(event) => commit({ ...content, contact: { ...content.contact, note: event.target.value } })} />
      </label>
    </div>
  )
}
