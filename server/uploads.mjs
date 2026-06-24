import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, relative, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { paths } from './config.mjs'

const maxImageBytes = 8 * 1024 * 1024

const imageTypes = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
  'image/gif': '.gif',
}

function parseContentDisposition(value = '') {
  return Object.fromEntries(
    value
      .split(';')
      .slice(1)
      .map((item) => item.trim())
      .map((item) => {
        const index = item.indexOf('=')
        const key = item.slice(0, index)
        const raw = item.slice(index + 1).replace(/^"|"$/g, '')
        return [key, raw]
      }),
  )
}

async function readBody(request) {
  const chunks = []
  let total = 0

  for await (const chunk of request) {
    total += chunk.length

    if (total > maxImageBytes + 1024 * 1024) {
      throw new Error('Image is too large')
    }

    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

function parseMultipartImage(request, body) {
  const type = request.headers['content-type'] || ''
  const boundary = type.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] || type.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2]

  if (!boundary) {
    throw new Error('Missing upload boundary')
  }

  const delimiter = Buffer.from(`--${boundary}`)
  const parts = []
  let cursor = 0

  while (cursor < body.length) {
    const start = body.indexOf(delimiter, cursor)

    if (start === -1) break

    const partStart = start + delimiter.length
    const next = body.indexOf(delimiter, partStart)

    if (next === -1) break

    parts.push(body.subarray(partStart, next))
    cursor = next
  }

  for (const rawPart of parts) {
    let part = rawPart

    if (part.subarray(0, 2).toString() === '--') {
      continue
    }

    if (part.subarray(0, 2).toString() === '\r\n') {
      part = part.subarray(2)
    }

    if (part.subarray(-2).toString() === '\r\n') {
      part = part.subarray(0, -2)
    }

    const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'))

    if (headerEnd === -1) {
      continue
    }

    const rawHeaders = part.subarray(0, headerEnd).toString('utf8')
    const content = part.subarray(headerEnd + 4)
    const headers = Object.fromEntries(
      rawHeaders.split('\r\n').map((line) => {
        const index = line.indexOf(':')
        return [line.slice(0, index).toLowerCase(), line.slice(index + 1).trim()]
      }),
    )
    const disposition = parseContentDisposition(headers['content-disposition'])

    if (disposition.name !== 'image' || !disposition.filename) {
      continue
    }

    return {
      content,
      filename: disposition.filename,
      contentType: headers['content-type'] || '',
    }
  }

  throw new Error('Missing image file')
}

export async function saveUploadedImage(request) {
  const body = await readBody(request)
  const image = parseMultipartImage(request, body)
  const fallbackExt = extname(image.filename).toLowerCase()
  const ext = imageTypes[image.contentType] || (Object.values(imageTypes).includes(fallbackExt) ? fallbackExt : '')

  if (!ext) {
    throw new Error('Unsupported image type')
  }

  if (image.content.length > maxImageBytes) {
    throw new Error('Image is too large')
  }

  await mkdir(paths.uploads, { recursive: true })

  const filename = `image-${Date.now()}-${randomBytes(8).toString('hex')}${ext}`
  const filePath = resolve(paths.uploads, filename)

  await writeFile(filePath, image.content)

  return {
    url: `/uploads/${filename}`,
    filename,
    contentType: image.contentType,
    size: image.content.length,
  }
}

export function isLocalUploadUrl(value) {
  return typeof value === 'string' && /^\/uploads\/[^/\\]+$/.test(value)
}

export function uploadUrlToPath(value) {
  if (!isLocalUploadUrl(value)) {
    return null
  }

  const filePath = resolve(paths.uploads, basename(value))
  const rel = relative(paths.uploads, filePath)

  if (rel.startsWith('..') || rel === '') {
    return null
  }

  return filePath
}

export async function deleteUploadByUrl(value) {
  const filePath = uploadUrlToPath(value)

  if (!filePath) {
    return
  }

  await rm(filePath, { force: true })
}
