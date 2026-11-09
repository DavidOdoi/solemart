import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { bestGuideDrafts, getBestGuideDraft } from '@/data/best-guide-drafts'
import { ReviewGuideTemplate } from '@/components/review-guide-template'

export const dynamicParams = false

export function generateStaticParams() {
  return bestGuideDrafts.map(draft => ({ slug: draft.guide.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const draft = getBestGuideDraft(slug)
  if (!draft) notFound()
  return {
    title: `${draft.guide.seoTitle || draft.guide.title} — draft review`,
    description: draft.guide.metaDescription,
    alternates: { canonical: `https://thesolemart.com/template-preview/best-guides/${draft.guide.slug}` },
  }
}

export default async function BestGuideDraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const draft = getBestGuideDraft(slug)
  if (!draft) notFound()
  return <>
    <nav aria-label="Buying-guide draft navigation" className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
      <Link href="/template-preview/best-guides" className="inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">← All three buying-guide drafts</Link>
    </nav>
    <ReviewGuideTemplate guide={draft.guide} products={draft.products} preview />
    <aside aria-labelledby="best-guide-review-heading" className="mx-auto mb-12 max-w-6xl rounded-2xl border border-[#e5e4df] bg-[#faf9f6] p-5 sm:p-8">
      <h2 id="best-guide-review-heading" className="text-2xl font-bold">Editorial checks before publication</h2>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-[#4f4e49]">{draft.reviewNotes.map(note => <li key={note}>{note}</li>)}</ul>
      <h3 className="mt-7 text-lg font-bold">Exact variants and source records</h3>
      <ul className="mt-4 space-y-4 text-base leading-7 text-[#4f4e49]">{draft.sourceRecords.map(source => <li key={source.productSlug} className="rounded-xl border border-[#e5e4df] bg-white p-4">
        <p className="font-bold">Tecovas {source.model} — {source.variant}</p>
        <p><a href={source.manufacturerUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Manufacturer variant reference</a> · Supplied report dated {draft.reportDate}; independent check pending.</p>
        <p className="mt-1 text-sm">Original image asset and reuse permission unconfirmed · Amazon match pending</p>
      </li>)}</ul>
      <p className="mt-5 text-sm leading-6 text-[#68675f]">No numeric SKU, ASIN, photo URL or reuse grant has been invented. These preview URLs are not replacements for an existing public guide and remain outside the public sitemap.</p>
    </aside>
  </>
}
