import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { brands } from '@/data/brands'
import { Breadcrumbs } from '@/components/affiliate-site'

export function generateStaticParams() {
  return brands.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brand = brands.find((item) => item.slug === slug)
  if (!brand) return {}
  return {
    title: `${brand.name} Shoes, Reviews & Buying Guides`,
    description: `Explore ${brand.name} footwear on SOLEMART. Check back for shoe profiles, comparisons, and buying guides.`,
    // Empty brand templates should not be indexed before editorial content is added.
    robots: { index: false, follow: true },
  }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = brands.find((item) => item.slug === slug)
  if (!brand) notFound()
  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-12 text-[#161616] sm:py-16">
      <div className="mx-auto max-w-7xl">
        <Breadcrumbs items={[{ label: 'Brands', href: '/brands' }, { label: brand.name }]} />
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c65325]">Brand spotlight</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">{brand.name} Shoes</h1>
        <div className="mt-8 max-w-2xl rounded-2xl border border-[#e5e4df] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl">More on {brand.name} is coming soon</h2>
          <p className="mt-3 text-base leading-7 text-[#68675f]">We’re preparing shoe profiles and buying guides for this brand. In the meantime, explore our shoe categories or browse other brands.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/#needs" className="rounded-full bg-[#161616] px-5 py-3 text-sm font-bold text-white hover:bg-[#c65325]">Explore shoe categories</Link>
            <Link href="/brands" className="rounded-full border border-[#d9d8d2] px-5 py-3 text-sm font-bold hover:border-[#c65325] hover:text-[#c65325]">Browse all brands</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
