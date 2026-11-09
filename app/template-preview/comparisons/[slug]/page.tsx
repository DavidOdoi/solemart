import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { comparisonDrafts, getComparisonDraft } from '@/data/comparison-drafts'
import { ComparisonTemplate } from '@/components/comparison-template'

export const dynamicParams = false

export function generateStaticParams() {
  return comparisonDrafts.map(({ content }) => ({ slug: content.post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const draft = getComparisonDraft(slug)
  if (!draft) notFound()
  const { post } = draft.content
  return {
    title: `${post.seoTitle || post.title} — draft review`,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `https://thesolemart.com/template-preview/comparisons/${post.slug}` },
  }
}

export default async function ComparisonDraftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const draft = getComparisonDraft(slug)
  if (!draft) notFound()
  return <>
    <nav aria-label="Comparison draft navigation" className="mx-auto max-w-7xl px-5 pt-6 lg:px-8">
      <Link href="/template-preview/comparisons" className="inline-flex min-h-11 items-center text-sm font-bold underline underline-offset-4">← All five comparison drafts</Link>
    </nav>
    <ComparisonTemplate content={draft.content} preview />
    <aside aria-labelledby="draft-review-heading" className="mx-auto mb-12 max-w-6xl rounded-2xl border border-[#e5e4df] bg-[#faf9f6] p-5 sm:p-8">
      <h2 id="draft-review-heading" className="text-2xl font-bold">Editorial checks before publication</h2>
      <h3 className="mt-5 text-lg font-bold">Sources and existing content</h3>
      <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-7 text-[#4f4e49]">{draft.reviewNotes.map(note => <li key={note}>{note}</li>)}</ul>
      <h3 className="mt-6 text-lg font-bold">Exact photographs needed</h3>
      <ul className="mt-3 list-disc space-y-3 pl-5 text-base leading-7 text-[#4f4e49]">{draft.imageNeeds.map(need => <li key={need}>{need}</li>)}</ul>
      <p className="mt-4 text-sm leading-6 text-[#68675f]">No image candidates from the research brief have confirmed reuse permission. No generated or substitute product photographs have been added.</p>
    </aside>
  </>
}
