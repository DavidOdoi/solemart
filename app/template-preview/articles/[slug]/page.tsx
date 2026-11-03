import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import briefs from '@/data/ingestion/article-briefs.json'

export const dynamicParams = false
export function generateStaticParams() { return briefs.map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brief = briefs.find(row => row.slug === slug)
  if (!brief) notFound()
  return {
    title: `${brief.title} — draft brief`,
    description: `Editorial brief for ${brief.title}. The full buying guide is pending research and writing.`,
    alternates: { canonical: `https://thesolemart.com/template-preview/articles/${brief.slug}` },
  }
}

export default async function ArticleBriefPreview({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brief = briefs.find(row => row.slug === slug)
  if (!brief) notFound()
  return <main className="mx-auto max-w-4xl px-5 py-12 sm:py-16 lg:px-8">
    <Link href="/template-preview/articles" className="text-sm font-semibold underline decoration-[#c9c7bf] underline-offset-4">← All nine briefs</Link>
    <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-[#c65325]">Draft article brief</p>
    <h1 className="mt-3 font-sans text-4xl font-black leading-tight tracking-tight sm:text-5xl">{brief.title}</h1>
    <dl className="mt-7 grid gap-4 rounded-2xl border border-[#e5e4df] bg-[#fafaf8] p-5 text-sm sm:grid-cols-3 sm:p-6">
      <div><dt className="font-semibold text-[#68675f]">Focus keyword</dt><dd className="mt-1 font-bold">{brief.keyword}</dd></div>
      <div><dt className="font-semibold text-[#68675f]">Article target</dt><dd className="mt-1 font-bold">{brief.targetWords.toLocaleString('en-US')} words</dd></div>
      <div><dt className="font-semibold text-[#68675f]">Current status</dt><dd className="mt-1 font-bold">Brief · Research pending</dd></div>
    </dl>
    <div className="mt-10 divide-y divide-[#e5e4df]">{brief.blocks.filter(block => block.label !== 'Slug').map(block => <section key={block.label} className="py-6 first:pt-0">
      <h2 className="font-sans text-xl font-bold">{block.label}</h2>
      <p className="mt-3 whitespace-pre-line break-words font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{block.text}</p>
    </section>)}</div>
    <p className="mt-8 border-t border-[#e5e4df] pt-6 text-sm leading-6 text-[#68675f]">Product names, specifications, ASINs and affiliate links will be added after source verification. No product testing is claimed in this brief.</p>
  </main>
}
