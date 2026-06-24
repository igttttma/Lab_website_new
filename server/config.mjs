import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const rootDir = resolve(fileURLToPath(new URL('..', import.meta.url)))

function loadEnvFile() {
  try {
    const raw = readFileSync(resolve(rootDir, '.env'), 'utf8')

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const index = trimmed.indexOf('=')

      if (index === -1) {
        continue
      }

      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
      process.env[key] ??= value
    }
  } catch {
    // .env is optional. Production deployments can provide real environment variables.
  }
}

loadEnvFile()

export const paths = {
  root: rootDir,
  content: resolve(rootDir, 'content/lab.json'),
  uploads: resolve(rootDir, 'content/uploads'),
  sessions: resolve(rootDir, 'data/sessions.json'),
  dist: resolve(rootDir, 'dist'),
}

export const serverConfig = {
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 4173),
  devApiPort: Number(process.env.API_PORT || 4174),
  sessionCookie: 'phoenix_admin_session',
  sessionTtlMs: 1000 * 60 * 60 * 12,
  adminPassword: process.env.ADMIN_PASSWORD || '',
  secureCookies: process.env.SECURE_COOKIES !== 'false',
}
