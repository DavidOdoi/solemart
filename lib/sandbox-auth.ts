import 'server-only'
import { createHash, timingSafeEqual } from 'node:crypto'

export const sandboxRobots = 'noindex, nofollow, noarchive'

type SandboxEnvironment = { SANDBOX_PREVIEW_USERNAME?: string; SANDBOX_PREVIEW_PASSWORD?: string }

export function sandboxAccess(authorization: string | null, environment: SandboxEnvironment = {
  SANDBOX_PREVIEW_USERNAME: process.env.SANDBOX_PREVIEW_USERNAME,
  SANDBOX_PREVIEW_PASSWORD: process.env.SANDBOX_PREVIEW_PASSWORD,
}): 'disabled' | 'denied' | 'allowed' {
  const username = environment.SANDBOX_PREVIEW_USERNAME
  const password = environment.SANDBOX_PREVIEW_PASSWORD
  if (!username?.trim() || username.includes(':') || !password?.trim()) return 'disabled'
  if (!authorization || authorization.length > 4096 || !/^Basic [A-Za-z0-9+/]+={0,2}$/i.test(authorization)) return 'denied'
  const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
  const separator = decoded.indexOf(':')
  if (separator < 0) return 'denied'
  const hash = (value: string) => createHash('sha256').update(value).digest()
  const userMatches = timingSafeEqual(hash(decoded.slice(0, separator)), hash(username))
  const passwordMatches = timingSafeEqual(hash(decoded.slice(separator + 1)), hash(password))
  return userMatches && passwordMatches ? 'allowed' : 'denied'
}
