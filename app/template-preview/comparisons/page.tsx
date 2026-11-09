import type { Metadata } from 'next'
import Link from 'next/link'
import { comparisonDrafts } from '@/data/comparison-drafts'

export const metadata: Metadata = {
  title: 'Five comparison articles — editorial draft review',
  description: 'Read the first five SoleMart comparison drafts and review the remaining source and image requirements.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/comparisons' },
}

export default function ComparisonDraftIndex() {
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:px-8">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c65325]">Editorial review · Batch one</p>
    <h1 className="mt-3 font-sans text-4xl font-black tracking-tight sm:text-5xl">Five comparison articles</h1>
    <p className="mt-5 max-w-3xl font-serif text-lg leading-8 text-[#4f4e49]">Read the complete drafts in our existing blog article layout. Each includes a featured-image placeholder, a Quick Answer with an image placeholder, differences table, buying guidance, four FAQs, source links and a final verdict. Final photographs can be added in WordPress.</p>
    <section aria-labelledby="wordpress-import-heading" className="mt-8 rounded-2xl border border-[#e5e4df] bg-[#faf9f6] p-6">
      <h2 id="wordpress-import-heading" className="text-xl font-bold">Edit these articles in WordPress</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-[#4f4e49]">Upload and activate the package under Plugins → Add New → Upload Plugin. Then open Tools → SoleMart Comparison Import and choose Create missing drafts. Existing matching articles are preserved. You can replace the images and edit the text using your normal WordPress login.</p>
      <a href="/template-preview/wordpress-import/solemart-comparisons.zip" download className="mt-5 inline-flex min-h-12 items-center rounded-lg bg-[#161616] px-5 py-3 font-bold text-white hover:bg-[#a74520]">Download WordPress draft importer</a>
    </section>
    <ol className="mt-9 grid gap-5 md:grid-cols-2">{comparisonDrafts.map(({ content, reviewNotes }, index) => <li key={content.post.slug} className="flex flex-col rounded-2xl border border-[#e5e4df] bg-white p-6">
      <span className="text-sm font-bold text-[#77766f]">{String(index + 1).padStart(2, '0')} · Draft with image placeholders</span>
      <h2 className="mt-3 text-xl font-bold leading-7"><Link href={`/template-preview/comparisons/${content.post.slug}`} className="hover:text-[#c65325] hover:underline">{content.post.title}</Link></h2>
      <p className="mt-3 text-sm leading-6 text-[#68675f]">{reviewNotes[0]}</p>
      <Link href={`/template-preview/comparisons/${content.post.slug}`} className="mt-auto pt-5 text-sm font-bold underline decoration-[#c9c7bf] underline-offset-4">Read article and review notes <span aria-hidden="true">→</span></Link>
    </li>)}</ol>
  </main>
}
