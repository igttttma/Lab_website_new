import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, relative, resolve } from 'node:path'
import { paths } from './config.mjs'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

function safeResolveStatic(pathname) {
  const cleanPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const filePath = resolve(paths.dist, cleanPath.slice(1))
  const rel = relative(paths.dist, filePath)

  if (rel.startsWith('..') || rel === '') {
    return join(paths.dist, 'index.html')
  }

  return filePath
}

function safeResolveUpload(pathname) {
  const cleanPath = normalize(decodeURIComponent(pathname.replace(/^\/uploads\//, ''))).replace(/^(\.\.[/\\])+/, '')
  const filePath = resolve(paths.uploads, cleanPath)
  const rel = relative(paths.uploads, filePath)

  if (rel.startsWith('..') || rel === '') {
    return null
  }

  return filePath
}

export async function serveStatic(request, response, url) {
  const isUpload = url.pathname.startsWith('/uploads/')
  let filePath = isUpload ? safeResolveUpload(url.pathname) : safeResolveStatic(url.pathname)

  if (!filePath) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Not found')
    return
  }

  try {
    const info = await stat(filePath)

    if (info.isDirectory()) {
      filePath = join(filePath, 'index.html')
    }
  } catch {
    if (isUpload) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end('Not found')
      return
    }

    filePath = join(paths.dist, 'index.html')
  }

  const type = mimeTypes[extname(filePath)] || 'application/octet-stream'
  response.writeHead(200, { 'Content-Type': type })
  createReadStream(filePath).pipe(response)
}
