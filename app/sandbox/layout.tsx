import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { sandboxAccess } from '@/lib/sandbox-auth'

export const metadata: Metadata = {
  title: 'Private product sandbox',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer',
}

export default async function SandboxLayout({ children }: { children: React.ReactNode }) {
  // Keep access enforced at the render boundary as well as in Proxy.
  if (sandboxAccess((await headers()).get('authorization')) !== 'allowed') notFound()
  return children
}
