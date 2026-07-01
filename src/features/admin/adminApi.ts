import type { LabContent } from '../../content/types'

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    ...init,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Request failed')
  }

  return response.json() as Promise<T>
}

export async function getSession() {
  return requestJson<{ authenticated: boolean }>('/api/admin/session')
}

export async function login(password: string) {
  return requestJson<{ authenticated: boolean }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function logout() {
  return requestJson<{ authenticated: boolean }>('/api/admin/logout', {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function loadAdminContent() {
  return requestJson<LabContent>('/api/admin/content')
}

export async function saveAdminContent(content: LabContent) {
  return requestJson<{ saved: true; content: LabContent }>('/api/admin/content', {
    method: 'PUT',
    body: JSON.stringify(content),
  })
}

export async function uploadAdminImage(file: File) {
  const body = new FormData()
  body.append('image', file)

  const response = await fetch('/api/admin/uploads/image', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    body,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Upload failed')
  }

  return response.json() as Promise<{ url: string; filename: string; contentType: string; size: number }>
}

export async function uploadAdminMedia(file: File) {
  const body = new FormData()
  body.append('media', file)

  const response = await fetch('/api/admin/uploads/media', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
    body,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'Upload failed')
  }

  return response.json() as Promise<{ url: string; filename: string; contentType: string; size: number }>
}
