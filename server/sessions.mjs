import { randomBytes, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { paths, serverConfig } from './config.mjs'

async function readSessions() {
  try {
    const raw = await readFile(paths.sessions, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function writeSessions(sessions) {
  await mkdir(dirname(paths.sessions), { recursive: true })
  await writeFile(paths.sessions, `${JSON.stringify(sessions, null, 2)}\n`, 'utf8')
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function verifyPassword(password) {
  return Boolean(serverConfig.adminPassword) && safeEqual(password, serverConfig.adminPassword)
}

export async function createSession() {
  const token = randomBytes(32).toString('hex')
  const sessions = await readSessions()
  sessions[token] = { expiresAt: Date.now() + serverConfig.sessionTtlMs }
  await writeSessions(sessions)
  return token
}

export async function isValidSession(token) {
  if (!token) {
    return false
  }

  const sessions = await readSessions()
  const session = sessions[token]

  if (!session || session.expiresAt < Date.now()) {
    delete sessions[token]
    await writeSessions(sessions)
    return false
  }

  return true
}

export async function destroySession(token) {
  if (!token) {
    return
  }

  const sessions = await readSessions()
  delete sessions[token]
  await writeSessions(sessions)
}

export function buildSessionCookie(token) {
  const maxAge = Math.floor(serverConfig.sessionTtlMs / 1000)
  const secure = serverConfig.secureCookies ? '; Secure' : ''
  return `${serverConfig.sessionCookie}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`
}

export function clearSessionCookie() {
  const secure = serverConfig.secureCookies ? '; Secure' : ''
  return `${serverConfig.sessionCookie}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
}
