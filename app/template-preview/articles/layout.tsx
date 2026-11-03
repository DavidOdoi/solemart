import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { GUIDE_WORD_TARGET } from '@/lib/guide-editorial-settings'

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
}

export default function ArticleBriefLayout({ children }: { children: ReactNode }) {
  return <>
    <aside aria-label="Editorial draft notice" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
      <p className="mx-auto max-w-6xl"><strong className="text-[#161616]">Draft briefs for review.</strong> These are article plans. The complete {GUIDE_WORD_TARGET.toLocaleString('en-US')}-word guides and product recommendations still need writing and verification.</p>
    </aside>
    {children}
  </>
}
