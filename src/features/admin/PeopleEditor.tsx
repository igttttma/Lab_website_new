import type { LabContent, Person, PersonGroup } from '../../content/types'

type PeopleEditorProps = {
  content: LabContent
  commit: (content: LabContent) => void
  makeId: (prefix: string) => string
}

const personGroups: PersonGroup[] = [
  'Professor',
  'Postdoc',
  'PhD',
  'MPhil',
  'Research Assistant',
  'Intern',
  'Visiting Student',
  'Alumni',
]

export function PeopleEditor({ content, commit, makeId }: PeopleEditorProps) {
  const updatePerson = (id: string, patch: Partial<Person>) => {
    commit({
      ...content,
      people: content.people.map((person) => (person.id === id ? { ...person, ...patch } : person)),
    })
  }

  const uploadPersonPhoto = (id: string, file: File | undefined) => {
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => updatePerson(id, { photoUrl: String(reader.result) })
    reader.readAsDataURL(file)
  }

  return (
    <div className="editor-stack">
      <button
        type="button"
        onClick={() =>
          commit({
            ...content,
            people: [
              ...content.people,
              {
                id: makeId('person'),
                name: 'New Member',
                role: 'PhD Student',
                affiliation: 'PHOENIX Lab',
                bio: 'Profile coming soon.',
                email: '',
                website: '',
                photoUrl: '',
                group: 'PhD',
              },
            ],
          })
        }
      >
        Add Person
      </button>
      {content.people.map((person) => (
        <article className="editor-card person-editor" key={person.id}>
          <div className="photo-upload">
            <div className="person-photo admin-photo">
              {person.photoUrl ? <img src={person.photoUrl} alt={person.name} /> : <span>{person.name.slice(0, 1)}</span>}
            </div>
            <label>
              Photo
              <input accept="image/*" type="file" onChange={(event) => uploadPersonPhoto(person.id, event.target.files?.[0])} />
            </label>
          </div>
          <label>
            Group
            <select value={person.group} onChange={(event) => updatePerson(person.id, { group: event.target.value as PersonGroup })}>
              {personGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
          <label>
            Name
            <input value={person.name} onChange={(event) => updatePerson(person.id, { name: event.target.value })} />
          </label>
          <label>
            Role
            <input value={person.role} onChange={(event) => updatePerson(person.id, { role: event.target.value })} />
          </label>
          <label>
            Affiliation
            <input value={person.affiliation} onChange={(event) => updatePerson(person.id, { affiliation: event.target.value })} />
          </label>
          <label>
            Bio
            <textarea value={person.bio} onChange={(event) => updatePerson(person.id, { bio: event.target.value })} />
          </label>
          <label>
            Email
            <input value={person.email ?? ''} onChange={(event) => updatePerson(person.id, { email: event.target.value })} />
          </label>
          <label>
            Website
            <input value={person.website ?? ''} onChange={(event) => updatePerson(person.id, { website: event.target.value })} />
          </label>
          <button type="button" onClick={() => commit({ ...content, people: content.people.filter((item) => item.id !== person.id) })}>
            Delete
          </button>
        </article>
      ))}
    </div>
  )
}
