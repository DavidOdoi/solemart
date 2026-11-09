import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
}

export default function ComparisonDraftLayout({ children }: { children: ReactNode }) {
  return <>
    <aside aria-label="Editorial draft notice" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
      <p className="mx-auto max-w-6xl"><strong className="text-[#161616]">Comparison drafts for review.</strong> Featured and Quick Answer images use temporary placeholders. Final photographs can be added in WordPress. Live source checks remain pending. These previews are excluded from public navigation and the sitemap.</p>
    </aside>
    {children}
  </>
}
