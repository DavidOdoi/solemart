import type { Metadata } from 'next'
import { ComparisonTemplate } from '@/components/comparison-template'
import { comparisonPreview } from '@/data/comparison-template-preview'

export const metadata: Metadata = {
  title: 'Sneakers vs Walking Shoes — comparison template preview',
  description: 'Review the SOLEMART comparison design: quick answer, side-by-side differences, use cases and a practical buying decision.',
  alternates: { canonical: 'https://thesolemart.com/template-preview/comparison' },
  robots: { index: false, follow: false },
}

export default function ComparisonTemplatePreview() {
  return <>
    <aside aria-label="Template preview" className="border-b border-[#e5e4df] bg-[#f3f2ee] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
      <p className="mx-auto max-w-7xl"><strong className="text-[#161616]">Comparison template preview</strong> — Sample article for design review. This is not a published comparison or a report of product testing.</p>
    </aside>
    <ComparisonTemplate content={comparisonPreview} preview />
  </>
}
