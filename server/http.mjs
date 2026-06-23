import { serverConfig } from './config.mjs'

export function sendJson(response, status, data, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  })
  response.end(JSON.stringify(data))
}

export async function readJson(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : null
}

export function parseCookies(request) {
  const header = request.headers.cookie || ''
  return Object.fromEntries(
    header
      .split(';')
      .map((cookie) => cookie.trim())
      .filter(Boolean)
      .map((cookie) => {
        const index = cookie.indexOf('=')
        return [cookie.slice(0, index), decodeURIComponent(cookie.slice(index + 1))]
      }),
  )
}

export function getSessionToken(request) {
  return parseCookies(request)[serverConfig.sessionCookie] || ''
}
