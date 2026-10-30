import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { ProductPreviewTemplate } from '@/components/product-preview-template'
import { getProductPreview, isProductPreviewSlug } from '@/lib/product-preview'
import { sandboxAccess } from '@/lib/sandbox-auth'

// Request-time SSR only. This route never generates one public page per product.
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProductPreviewPage({ searchParams }: { searchParams: Promise<{ slug?: string | string[] }> }) {
  if (sandboxAccess((await headers()).get('authorization')) !== 'allowed') notFound()
  const { slug } = await searchParams
  if (slug !== undefined && slug !== '' && !isProductPreviewSlug(slug)) notFound()
  const product = slug ? await getProductPreview(slug as string) : null
  if (slug && !product) notFound()
  return <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
    <div className="rounded-xl border border-[#e4ddd0] bg-[#f6f3ec] px-5 py-4">
      <p className="text-sm font-bold uppercase tracking-[.12em] text-[#a74520]">Private product sandbox</p>
      <p className="mt-2 text-base leading-7 text-[#4f4e49]">Live WordPress data. This preview is protected, uncached and excluded from search indexing.</p>
    </div>
    <form action="/sandbox/product-preview" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1"><label htmlFor="product-slug" className="block text-base font-semibold">Published Shoe slug</label><input id="product-slug" name="slug" defaultValue={typeof slug === 'string' ? slug : ''} required maxLength={200} placeholder="your-shoe-slug" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="mt-2 min-h-12 w-full rounded-lg border border-[#c7c3b8] bg-white px-4 py-3 text-base focus-visible:outline-2 focus-visible:outline-[#c65325]" /></div>
      <button type="submit" className="min-h-12 shrink-0 rounded-lg bg-[#161616] px-6 py-3 text-base font-bold text-white hover:bg-[#a74520]">Load product</button>
    </form>
    {product && !product.retailerFieldsAvailable && <p className="mt-4 rounded-lg border border-[#e4ddd0] bg-[#faf9f6] p-4 text-sm leading-6 text-[#68675f]">The additional retailer slots are not configured in WordPress yet. This preview is using the existing retailer link.</p>}
    {product ? <ProductPreviewTemplate product={product} /> : <section className="mt-10 rounded-xl border border-[#e5e4df] p-6"><h1 className="text-3xl font-black tracking-tight">Preview a Shoe record</h1><p className="mt-4 text-base leading-7 text-[#68675f]">Enter its saved WordPress slug to test the product layout, specifications and retailer links.</p></section>}
  </main>
}
