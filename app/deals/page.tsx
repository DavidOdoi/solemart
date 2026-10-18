import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { products } from '@/data/products'
import { affiliateUrl } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Shoe Deals & Current Prices',
  description: 'Browse shoe recommendations and check current prices and availability with retailers.',
}

export default function DealsPage() {
  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#77766f]"><a href="/" className="hover:text-[#e86d35]">Home</a><span aria-hidden="true" className="mx-2">/</span><span aria-current="page" className="text-[#161616]">Deals</span></nav>
        <p className="text-sm font-bold tracking-[0.18em] text-[#e86d35]">SHOE DEALS</p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">Check current shoe prices</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#68675f]">Prices and availability change. Visit the retailer for current pricing, sizes, shipping, and return details.</p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => <article key={product.slug} className="rounded-2xl border border-[#e5e4df] bg-white p-5">
            <h2 className="font-serif text-2xl">{product.name}</h2>
            <p className="mt-2 text-sm text-[#68675f]">{product.bestFor}</p>
            <a href={affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#e86d35] px-4 py-3 text-sm font-bold text-white hover:bg-[#d95d28]">See Latest Price <ArrowRight aria-hidden="true" className="size-3.5" /></a>
          </article>)}
        </div>
      </div>
    </main>
  )
}
