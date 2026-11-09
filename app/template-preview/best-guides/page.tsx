import type { Metadata } from 'next'
import Link from 'next/link'
import { bestGuideDrafts } from '@/data/best-guide-drafts'

export const metadata: Metadata = {
  title: 'Three buying-guide articles — draft review',
  description: 'Review the cowhide, exotic leather and cowboy boot drafts in the original SoleMart buying-guide layout.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/best-guides' },
}

export default function BestGuideDraftIndex() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65325]">Editorial review · Three guides</p>
    <h1 className="mt-3 font-sans text-4xl font-black tracking-tight sm:text-5xl">Boot buying-guide drafts</h1>
    <p className="mt-5 max-w-3xl font-serif text-lg leading-8 text-[#4f4e49]">Three complete text drafts, each with four model-specific profiles in our original buying-guide template. The supplied evidence covers Tecovas men’s Western dress/lifestyle boots. Wider-market claims and public publication still need review.</p>
    <ol className="mt-9 grid gap-5 lg:grid-cols-3">{bestGuideDrafts.map((draft, index) => <li key={draft.guide.slug} className="flex flex-col rounded-2xl border border-[#e5e4df] bg-white p-6">
      <span className="text-sm font-bold text-[#77766f]">{String(index + 1).padStart(2, '0')} · Text draft · Photos pending</span>
      <h2 className="mt-3 text-xl font-bold leading-7"><Link href={`/template-preview/best-guides/${draft.guide.slug}`} className="hover:text-[#c65325] hover:underline">{draft.guide.title}</Link></h2>
      <p className="mt-3 text-sm leading-6 text-[#68675f]">{draft.targetWords.toLocaleString('en-US')} editorial words · Four profiles · Source and duplicate review pending</p>
      <Link href={`/template-preview/best-guides/${draft.guide.slug}`} className="mt-auto pt-5 text-sm font-bold underline decoration-[#c9c7bf] underline-offset-4">Read guide and review notes <span aria-hidden="true">→</span></Link>
    </li>)}</ol>
    <p className="mt-8 text-sm leading-6 text-[#68675f]">The cowhide and cowboy drafts share models but compare different aspects. Their search-intent overlap must be resolved before either is published as a broad buying guide.</p>
  </main>
}
