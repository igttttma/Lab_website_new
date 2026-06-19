import { defaultContent } from '../content/defaultContent'
import type { LabContent, PersonGroup } from '../content/types'

const STORAGE_KEY = 'phoenix-lab-content-v1'
const groupFallbacks: Record<string, PersonGroup> = {
  'Principal Investigator': 'Professor',
  'Current Members': 'Postdoc',
}

function normalizeContent(content: LabContent): LabContent {
  return {
    ...defaultContent,
    ...content,
    identity: { ...defaultContent.identity, ...content.identity },
    join: { ...defaultContent.join, ...content.join },
    contact: { ...defaultContent.contact, ...content.contact },
    people: content.people.map((person) => ({
      ...person,
      photoUrl: person.photoUrl ?? '',
      group: groupFallbacks[person.group] ?? person.group,
    })),
  }
}

export function loadContent(): LabContent {
  const raw = window.localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return defaultContent
  }

  try {
    return normalizeContent(JSON.parse(raw) as LabContent)
  } catch {
    return defaultContent
  }
}

export function saveContent(content: LabContent) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
}

export function resetContent() {
  window.localStorage.removeItem(STORAGE_KEY)
}
