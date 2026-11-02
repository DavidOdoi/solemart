import type { Metadata } from 'next'
import Link from 'next/link'
import briefs from '@/data/ingestion/article-briefs.json'

export const metadata: Metadata = {
  title: 'Selected article briefs — draft preview',
  description: 'Review the nine selected SoleMart buying-guide briefs before the full articles are written.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/articles' },
}

export default function ArticleBriefIndex() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65325]">Editorial review</p>
    <h1 className="mt-3 font-sans text-4xl font-black tracking-tight sm:text-5xl">Selected buying-guide briefs</h1>
    <p className="mt-5 max-w-2xl text-lg leading-8 text-[#4f4e49]">Nine approved topics, including hiking shoes for kids. Each full guide will target 1,700 words and four researched recommendations.</p>
    <ol className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{briefs.map((brief, index) => <li key={brief.slug} className="flex flex-col rounded-2xl border border-[#e5e4df] bg-white p-6">
      <span className="text-sm font-bold text-[#77766f]">{String(index + 1).padStart(2, '0')} · Brief</span>
      <h2 className="mt-3 text-xl font-bold leading-7"><Link href={`/template-preview/articles/${brief.slug}`} className="hover:text-[#c65325] hover:underline">{brief.title}</Link></h2>
      <p className="mt-3 text-sm leading-6 text-[#68675f]">1,700-word target · Product research pending</p>
      <Link href={`/template-preview/articles/${brief.slug}`} className="mt-auto pt-5 text-sm font-bold underline decoration-[#c9c7bf] underline-offset-4">Read this brief <span aria-hidden="true">→</span></Link>
    </li>)}</ol>
  </main>
}
