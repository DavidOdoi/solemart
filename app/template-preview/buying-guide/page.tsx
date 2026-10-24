import type { Metadata } from 'next'
import { ReviewGuideTemplate } from '@/components/review-guide-template'
import { previewGuide, previewProducts } from '@/data/guide-template-preview'

export const metadata: Metadata = {
  title: 'Buying guide template preview',
  description: 'The complete SOLEMART buying-guide design, populated with sample content for UX and UI review.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/buying-guide' },
  robots: { index: false, follow: false },
}

export default function BuyingGuideTemplatePreview() {
  return (
    <>
      <aside id="template-preview-note" aria-label="Template preview" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
        <p className="mx-auto max-w-7xl"><strong className="text-[#161616]">Template preview</strong> — All sections are filled with sample content for design review. Images are illustrative and retailer buttons are disabled.</p>
      </aside>
      <ReviewGuideTemplate guide={previewGuide} products={previewProducts} preview />
    </>
  )
}
