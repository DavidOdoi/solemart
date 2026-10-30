import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductDirectoryTemplate } from '@/components/product-directory-template'
import { EditorialArticleBody } from '@/components/editorial-article-body'
import { getEditorialArticle } from '@/lib/editorial-article'
import { getProductDirectory, isProductDirectoryCursor, isProductPreviewSlug } from '@/lib/product-preview'
import { getWordPressPost } from '@/lib/wordpress'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Product directory and reviews — preview',
  description: 'An unindexed preview of published WordPress products, specifications and review content.',
  robots: { index: false, follow: false, noarchive: true },
  alternates: { canonical: 'https://thesolemart.com/template-preview/product' },
  referrer: 'no-referrer',
}

export default async function ProductDirectoryPreview({ searchParams }: { searchParams: Promise<{ q?: string | string[]; after?: string | string[]; article?: string | string[] }> }) {
  const params = await searchParams
  if ((params.q !== undefined && (typeof params.q !== 'string' || params.q.length > 150 || /[\u0000-\u001f]/.test(params.q))) || (params.after !== undefined && !isProductDirectoryCursor(params.after)) || (params.article !== undefined && !isProductPreviewSlug(params.article))) notFound()
  const search = typeof params.q === 'string' ? params.q.trim() : ''
  const directory = await getProductDirectory(search, typeof params.after === 'string' ? params.after : null)
  const articleSlug = typeof params.article === 'string' ? params.article : undefined
  const article = articleSlug ? await getWordPressPost(articleSlug) : null
  if (articleSlug && !article) notFound()
  const next = new URLSearchParams()
  if (search) next.set('q', search)
  if (articleSlug) next.set('article', articleSlug)
  if (directory.endCursor) next.set('after', directory.endCursor)
  return <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
    <aside id="product-preview-note" aria-label="Product design preview" className="rounded-xl border border-[#e4ddd0] bg-[#f6f3ec] px-5 py-4 text-base leading-7 text-[#4f4e49]">
      <strong className="text-[#161616]">Product directory preview</strong> — Published WordPress records only. This page is unlinked and excluded from indexing; it is not a published category page.
    </aside>
    <header className="mt-9 max-w-4xl"><h1 className="font-sans text-4xl font-black leading-tight tracking-tight sm:text-6xl">{article?.title || (search ? `${search}: products and reviews` : 'Footwear products & reviews')}</h1>{article?.excerpt && <p className="mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{article.excerpt}</p>}</header>
    <form method="get" action="/template-preview/product" className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><label htmlFor="directory-search" className="block text-base font-semibold">Search footwear</label><input id="directory-search" name="q" defaultValue={search} maxLength={150} className="mt-2 min-h-12 w-full rounded-lg border border-[#c7c3b8] px-4 py-3 text-base" /></div>{articleSlug && <input type="hidden" name="article" value={articleSlug} />}<button className="min-h-12 rounded-lg bg-[#161616] px-6 py-3 text-base font-bold text-white">Search products</button></form>
    <p className="mt-5 text-sm text-[#68675f]">{directory.products.length} products on this page</p>
    <ProductDirectoryTemplate products={directory.products} />
    {directory.hasNextPage && <Link href={`/template-preview/product?${next.toString()}`} className="mt-10 inline-flex min-h-12 items-center rounded-lg border border-[#161616] px-6 py-3 font-bold">Next products</Link>}
    {article?.contentHtml && <section aria-labelledby="directory-advice-heading" className="mx-auto mt-16 max-w-4xl border-t border-[#d9d8d2] pt-10"><h2 id="directory-advice-heading" className="mb-8 text-3xl font-black">Buying advice and research</h2><EditorialArticleBody parts={getEditorialArticle(article.contentHtml, { quickAnswer: true }).parts} /></section>}
  </main>
}
