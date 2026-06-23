import { defaultContent } from '../content/defaultContent'
import type { LabContent } from '../content/types'

export function loadContent(): LabContent {
  return defaultContent
}

export async function fetchContent(): Promise<LabContent> {
  const response = await fetch('/api/content', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('Failed to load content')
  }

  return response.json() as Promise<LabContent>
}
