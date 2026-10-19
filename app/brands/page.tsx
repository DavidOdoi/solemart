import type { Metadata } from 'next'
import Link from 'next/link'
import { brands } from '@/data/brands'
import { Breadcrumbs } from '@/components/affiliate-site'

export const metadata: Metadata = {
  title: 'Popular Shoe Brands',
  description: 'Browse popular athletic, casual, outdoor, and work shoe brands, including Nike, Adidas, New Balance, HOKA, and Brooks.',
}

export default function BrandsPage() {
  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-12 text-[#161616] sm:py-16">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: 'Brands' }]} />
        <h1 className="font-serif text-4xl tracking-tight sm:text-6xl">Explore shoe brands</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#68675f]">Find your favourite brands across running, walking, everyday style, outdoor adventures, and work.</p>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => <li key={brand.slug}><Link href={`/brands/${brand.slug}`} className="block rounded-xl border border-[#e5e4df] bg-white px-5 py-5 font-bold transition-colors hover:border-[#c65325] hover:text-[#c65325]">{brand.name}</Link></li>)}
        </ul>
      </div>
    </main>
  )
}
