import { readContent, writeContent } from './contentStore.mjs'
import { getSessionToken, readJson, sendJson } from './http.mjs'
import { deleteUploadByUrl, isLocalUploadUrl, saveUploadedImage, saveUploadedMedia } from './uploads.mjs'
import {
  buildSessionCookie,
  clearSessionCookie,
  createSession,
  destroySession,
  isValidSession,
  verifyPassword,
} from './sessions.mjs'

function isContentShape(value) {
  return Boolean(
    value &&
      typeof value === 'object' &&
      value.identity &&
      Array.isArray(value.navigation) &&
      Array.isArray(value.news) &&
      Array.isArray(value.projects) &&
      Array.isArray(value.people) &&
      Array.isArray(value.publications) &&
      Array.isArray(value.teaching) &&
      value.join &&
      value.contact,
  )
}

function collectUploadUrls(content) {
  const urls = new Set()

  if (isLocalUploadUrl(content.identity?.heroMediaUrl)) urls.add(content.identity.heroMediaUrl)

  for (const project of content.projects || []) {
    if (isLocalUploadUrl(project.mediaUrl)) urls.add(project.mediaUrl)
    if (isLocalUploadUrl(project.gifUrl)) urls.add(project.gifUrl)
  }

  for (const person of content.people || []) {
    if (isLocalUploadUrl(person.photoUrl)) urls.add(person.photoUrl)
  }

  for (const item of content.teaching || []) {
    if (isLocalUploadUrl(item.imageUrl)) urls.add(item.imageUrl)
    if (isLocalUploadUrl(item.mediaUrl)) urls.add(item.mediaUrl)
  }

  return urls
}

async function cleanupRemovedUploads(previousContent, nextContent) {
  const previousUrls = collectUploadUrls(previousContent)
  const nextUrls = collectUploadUrls(nextContent)
  const removedUrls = [...previousUrls].filter((url) => !nextUrls.has(url))

  await Promise.all(
    removedUrls.map(async (url) => {
      try {
        await deleteUploadByUrl(url)
      } catch (error) {
        console.warn(`Could not delete unused upload ${url}:`, error)
      }
    }),
  )
}

async function requireAdmin(request, response) {
  const token = getSessionToken(request)
  const valid = await isValidSession(token)

  if (!valid) {
    sendJson(response, 401, { error: 'Unauthorized' })
    return false
  }

  return true
}

export async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/content') {
    sendJson(response, 200, await readContent())
    return true
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/session') {
    sendJson(response, 200, { authenticated: await isValidSession(getSessionToken(request)) })
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/login') {
    const body = await readJson(request)

    if (!verifyPassword(body?.password || '')) {
      sendJson(response, 401, { error: 'Invalid password' })
      return true
    }

    const token = await createSession()
    sendJson(response, 200, { authenticated: true }, { 'Set-Cookie': buildSessionCookie(token) })
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/logout') {
    await destroySession(getSessionToken(request))
    sendJson(response, 200, { authenticated: false }, { 'Set-Cookie': clearSessionCookie() })
    return true
  }

  if (request.method === 'GET' && url.pathname === '/api/admin/content') {
    if (!(await requireAdmin(request, response))) {
      return true
    }

    sendJson(response, 200, await readContent())
    return true
  }

  if (request.method === 'PUT' && url.pathname === '/api/admin/content') {
    if (!(await requireAdmin(request, response))) {
      return true
    }

    const body = await readJson(request)

    if (!isContentShape(body)) {
      sendJson(response, 400, { error: 'Invalid content shape' })
      return true
    }

    const previousContent = await readContent()

    await writeContent(body)
    await cleanupRemovedUploads(previousContent, body)
    sendJson(response, 200, { saved: true, content: body })
    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/uploads/image') {
    if (!(await requireAdmin(request, response))) {
      return true
    }

    try {
      sendJson(response, 200, await saveUploadedImage(request))
    } catch (error) {
      sendJson(response, 400, { error: error.message || 'Upload failed' })
    }

    return true
  }

  if (request.method === 'POST' && url.pathname === '/api/admin/uploads/media') {
    if (!(await requireAdmin(request, response))) {
      return true
    }

    try {
      sendJson(response, 200, await saveUploadedMedia(request))
    } catch (error) {
      sendJson(response, 400, { error: error.message || 'Upload failed' })
    }

    return true
  }

  return false
}
