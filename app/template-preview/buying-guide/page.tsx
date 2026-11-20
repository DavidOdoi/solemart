import type { Metadata } from 'next'
import { BlogPostPage } from '@/components/page-templates'
import { nikeBestGuidePreview } from '@/data/nike-best-guide-preview'

export const metadata: Metadata = {
  title: 'Buying guide template preview',
  description: 'SoleMart’s editable WordPress buying-guide layout, demonstrated with seven Nike picks.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/buying-guide' },
  robots: { index: false, follow: false },
}

export default function BuyingGuideTemplatePreview() {
  return (
    <>
      <aside id="template-preview-note" aria-label="Template preview" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><p><strong className="text-[#161616]">New buying-guide template</strong> · Supplied draft adapted for layout review. Photos are placeholders; model details need verification.</p><a className="font-bold text-[#a74520] underline underline-offset-4" href="/downloads/solemart-best-guide-pattern.json" download>Download WordPress layout ↓</a></div>
      </aside>
      <BlogPostPage post={nikeBestGuidePreview} preview />
    </>
  )
}
