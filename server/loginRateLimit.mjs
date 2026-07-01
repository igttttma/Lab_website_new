import { serverConfig } from './config.mjs'

const attemptsBySource = new Map()

function getRequestIp(request) {
  if (serverConfig.trustProxy) {
    const forwardedFor = request.headers['x-forwarded-for']
    const firstForwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor

    if (firstForwardedIp) {
      return firstForwardedIp.split(',')[0].trim()
    }
  }

  return request.socket.remoteAddress || 'unknown'
}

function getAttempt(source) {
  const now = Date.now()
  const attempt = attemptsBySource.get(source)

  if (!attempt) {
    return { failures: 0, firstFailureAt: now, lockedUntil: 0 }
  }

  if (attempt.lockedUntil > now) {
    return attempt
  }

  if (now - attempt.firstFailureAt > serverConfig.loginFailureWindowMs) {
    attemptsBySource.delete(source)
    return { failures: 0, firstFailureAt: now, lockedUntil: 0 }
  }

  return attempt
}

export function getLoginSource(request) {
  return getRequestIp(request)
}

export function getLoginLockout(source) {
  const attempt = getAttempt(source)
  const now = Date.now()

  if (attempt.lockedUntil <= now) {
    return null
  }

  return {
    retryAfterSeconds: Math.ceil((attempt.lockedUntil - now) / 1000),
  }
}

export function recordFailedLogin(source) {
  const now = Date.now()
  const attempt = getAttempt(source)
  const failures = attempt.failures + 1
  const lockedUntil = failures >= serverConfig.loginMaxFailures ? now + serverConfig.loginLockoutMs : 0

  attemptsBySource.set(source, {
    failures,
    firstFailureAt: attempt.failures === 0 ? now : attempt.firstFailureAt,
    lockedUntil,
  })

  return getLoginLockout(source)
}

export function clearLoginFailures(source) {
  attemptsBySource.delete(source)
}
