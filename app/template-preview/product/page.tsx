import type { Metadata } from 'next'
import { ProductPreviewTemplate } from '@/components/product-preview-template'
import { productTemplatePreview } from '@/data/product-template-preview'

export const metadata: Metadata = {
  title: 'Product template design preview',
  description: 'A populated SOLEMART product layout for design review, using illustrative content and disabled retailer controls.',
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: 'https://thesolemart.com/template-preview/product' },
  referrer: 'no-referrer',
}

export default function ProductDesignPreview() {
  return <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
    <aside id="product-preview-note" aria-label="Product design preview" className="rounded-xl border border-[#e4ddd0] bg-[#f6f3ec] px-5 py-4 text-base leading-7 text-[#4f4e49]">
      <strong className="text-[#161616]">Product design preview</strong> — Sample content and an illustrative photo. Retailer buttons are disabled.
    </aside>
    <ProductPreviewTemplate product={productTemplatePreview} preview />
  </main>
}
