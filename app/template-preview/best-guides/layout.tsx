import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  robots: { index: false, follow: false, noarchive: true },
}

export default function BestGuideDraftLayout({ children }: { children: ReactNode }) {
  return <>
    <aside id="template-preview-note" aria-label="Buying-guide draft notice" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
      <p className="mx-auto max-w-7xl"><strong className="text-[#161616]">Buying-guide drafts for review.</strong> These articles use the supplied product research in our existing template. Independent source checks, live duplicate checks, exact photo permissions and retailer matches remain pending. Photos are omitted and retailer buttons are disabled.</p>
    </aside>
    {children}
  </>
}
