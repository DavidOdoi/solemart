import type { Metadata } from 'next'
import { ProductDirectoryTemplate } from '@/components/product-directory-template'
import { EditorialArticleBody } from '@/components/editorial-article-body'
import { getEditorialArticle } from '@/lib/editorial-article'
import { directoryDesignProducts, directoryBuyingGuideHtml } from '@/data/product-directory-preview'

export const metadata: Metadata = {
  title: 'Sea turtle boots — frontend directory preview',
  description: 'Frontend-only product directory and review layout with illustrative designs, a comparison matrix and expandable FAQs.',
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: 'https://thesolemart.com/template-preview/product' },
  referrer: 'no-referrer',
}

export default function ProductDirectoryPreview() {
  return <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
    <aside id="product-preview-note" aria-label="Frontend design preview" className="rounded-xl border border-[#e4ddd0] bg-[#f6f3ec] px-5 py-4 text-sm leading-6 text-[#4f4e49]">
      <strong className="text-[#161616]">Frontend preview</strong> — Illustrative boot designs and example review copy. No live inventory or verified product claims. Retailer buttons are disabled.
    </aside>
    <header className="mt-9 max-w-4xl"><h1 className="font-sans text-4xl font-black leading-tight tracking-tight sm:text-6xl">Sea Turtle Boots: Styles, Details &amp; Reviews</h1><p className="mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">Browse the boot profiles, compare their details and read the review-style breakdowns below.</p></header>
    <nav aria-label="Product page sections" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-base font-semibold"><a href="#products" className="min-h-11 py-2 underline decoration-[#c9c7bf] underline-offset-4">Browse styles</a><a href="#directory-comparison-heading" className="min-h-11 py-2 underline decoration-[#c9c7bf] underline-offset-4">Compare details</a><a href="#directory-reviews-heading" className="min-h-11 py-2 underline decoration-[#c9c7bf] underline-offset-4">Read reviews</a><a href="#directory-advice-heading" className="min-h-11 py-2 underline decoration-[#c9c7bf] underline-offset-4">Buying guide &amp; FAQs</a></nav>
    <ProductDirectoryTemplate products={directoryDesignProducts} preview imageSheet />
    <section aria-labelledby="directory-advice-heading" className="mx-auto mt-16 max-w-4xl border-t border-[#d9d8d2] pt-10"><h2 id="directory-advice-heading" className="mb-8 scroll-mt-44 text-3xl font-black">Buying guide &amp; FAQs</h2><EditorialArticleBody parts={getEditorialArticle(directoryBuyingGuideHtml).parts} /></section>
  </main>
}
