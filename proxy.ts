import { NextResponse, type NextRequest } from 'next/server'
import { sandboxAccess, sandboxRobots } from '@/lib/sandbox-auth'

export function proxy(request: NextRequest) {
  const access = sandboxAccess(request.headers.get('authorization'))
  const response = access === 'allowed' ? NextResponse.next() : new NextResponse(
    `<!doctype html><html lang="en"><head><meta name="robots" content="${sandboxRobots}"><title>${access === 'disabled' ? 'Not found' : 'Private sandbox'}</title></head><body>${access === 'disabled' ? 'Not found.' : 'Authentication required.'}</body></html>`,
    { status: access === 'disabled' ? 404 : 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  )
  if (access === 'denied') response.headers.set('WWW-Authenticate', 'Basic realm="SOLEMART sandbox", charset="UTF-8"')
  response.headers.set('X-Robots-Tag', sandboxRobots)
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  response.headers.set('CDN-Cache-Control', 'no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  return response
}

export const config = { matcher: ['/sandbox/:path*'] }
