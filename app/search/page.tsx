import type { Metadata } from 'next'
import Link from 'next/link'
import { searchContent } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Search Shoe Guides & Reviews',
  description: 'Search SOLEMART shoe categories, buying guides, reviews, comparisons, and advice.',
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q: query = '' } = await searchParams
  const q = Array.isArray(query) ? query[0] ?? '' : query
  const results = searchContent(q)
  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#77766f]"><Link href="/" className="hover:text-[#e86d35]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span aria-current="page" className="text-[#161616]">Search</span></nav>
        <h1 className="font-serif text-5xl tracking-tight">Search SOLEMART</h1>
        <form action="/search" role="search" className="mt-6 flex gap-2">
          <input name="q" defaultValue={q} aria-label="Search shoe content" placeholder="Search best shoes for standing all day" className="min-w-0 flex-1 rounded-full border border-[#d9d8d2] bg-white px-5 py-3 text-sm outline-none focus:border-[#e86d35]" />
          <button className="rounded-full bg-[#161616] px-5 py-3 text-sm font-bold text-white hover:bg-[#e86d35]">Search</button>
        </form>
        <h2 className="mt-10 font-serif text-2xl">{q ? `Results for Ã¢â‚¬Å“${q}Ã¢â‚¬Â` : 'Enter a shoe, category, or question'}</h2>
        {q && results.length === 0 && <p className="mt-4 text-sm text-[#68675f]">No matching content found. Try a category such as walking shoes or a topic such as standing all day.</p>}
        <ul className="mt-5 divide-y divide-[#e5e4df] border-y border-[#e5e4df]">
          {results.map((result) => <li key={`${result.kind}-${result.href}`} className="py-5"><p className="text-sm font-bold tracking-[0.14em] text-[#e86d35]">{result.kind}</p><h3 className="mt-1 font-serif text-2xl"><Link href={result.href} className="hover:text-[#e86d35]">{result.title}</Link></h3><p className="mt-2 text-sm leading-6 text-[#68675f]">{result.description}</p></li>)}
        </ul>
      </div>
    </main>
  )
}
