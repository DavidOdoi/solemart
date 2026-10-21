import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { blogPosts } from '@/data/blog'
import { getWordPressPosts, isWordPressCursor } from '@/lib/wordpress'

export const revalidate = 60

type BlogSearchParams = Promise<{ after?: string | string[] }>

async function getCursor(searchParams: BlogSearchParams) {
  const { after } = await searchParams
  if (after === undefined || after === '') return undefined
  if (!isWordPressCursor(after)) notFound()
  return after
}

export async function generateMetadata({ searchParams }: { searchParams: BlogSearchParams }): Promise<Metadata> {
  const after = await getCursor(searchParams)
  const url = `https://thesolemart.com/blog${after ? `?${new URLSearchParams({ after })}` : ''}`
  const title = after ? 'More Shoe Guides & Footwear Advice' : 'Shoe Guides & Footwear Advice'
  const description = 'Practical shoe advice, fit tips, and footwear explainers from SOLEMART.'
  return {
    title, description,
    alternates: { canonical: url },
    openGraph: { type: 'website', title, description, url },
    twitter: { card: 'summary', title, description },
  }
}

export default async function BlogPage({ searchParams }: { searchParams: BlogSearchParams }) {
  const after = await getCursor(searchParams)
  const listing = await getWordPressPosts(after)
  if (after && !listing?.posts.length) notFound()
  const posts = listing?.posts ?? blogPosts
  const olderHref = listing?.hasNextPage && listing.endCursor
    ? `/blog?${new URLSearchParams({ after: listing.endCursor })}`
    : undefined

  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-14 text-[#161616] sm:py-20">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#77766f]"><Link href="/" className="hover:text-[#e86d35]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span aria-current="page" className="text-[#161616]">Shoe Advice</span></nav>
        <p className="text-sm font-bold tracking-[0.18em] text-[#e86d35]">SOLEMART JOURNAL</p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">Shoe guides & footwear advice.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#68675f]">Straightforward advice to help you understand fit, compare options, and make a more informed shoe choice.</p>
        {posts.length > 0 ? <div className="mt-12 grid gap-5 md:grid-cols-2">
          {posts.map((post) => <article key={post.slug} className="flex min-w-0 flex-col rounded-2xl border border-[#e5e4df] bg-white p-6">
            {post.featuredImage && <Link href={`/blog/${encodeURIComponent(post.slug)}`} aria-label={`Read ${post.title}`} className="-mx-6 -mt-6 mb-6 block overflow-hidden rounded-t-2xl">
              <Image src={post.featuredImage.src} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} sizes="(max-width: 768px) 100vw, 448px" className="aspect-[16/10] w-full object-cover" />
            </Link>}
            <div className="flex flex-wrap justify-between gap-3 text-sm font-bold tracking-[0.14em] text-[#a74520]"><span>{post.category}</span>{post.date && <time dateTime={post.publishedAt || new Date(post.date).toISOString()}>{post.date}</time>}</div>
            <h2 className="mt-4 font-serif text-3xl"><Link href={`/blog/${encodeURIComponent(post.slug)}`} className="hover:text-[#e86d35]">{post.title}</Link></h2>
            {post.author && <p className="mt-2 text-sm text-[#68675f]">By {post.author}</p>}
            {post.excerpt && <p className="mt-3 break-words leading-7 text-[#68675f]">{post.excerpt}</p>}
            <div className="mt-auto pt-5"><Link href={`/blog/${encodeURIComponent(post.slug)}`} className="inline-flex min-h-11 items-center gap-1 text-sm font-bold">Read article <ArrowRight aria-hidden="true" className="size-4 text-[#c65325]" /></Link></div>
          </article>)}
        </div> : <section className="mt-12 rounded-2xl border border-[#e5e4df] bg-white p-6 sm:p-8">
          <h2 className="font-serif text-2xl">New articles are on the way</h2>
          <p className="mt-3 leading-7 text-[#68675f]">Check back soon for shoe guides and footwear advice.</p>
        </section>}
        {(after || olderHref) && <nav aria-label="Shoe advice pagination" className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#e5e4df] pt-6">
          {after ? <Link href="/blog" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-[#a74520]"><ArrowLeft aria-hidden="true" className="size-4" />Latest articles</Link> : <span />}
          {olderHref && <Link href={olderHref} rel="next" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-[#a74520]">Older articles<ArrowRight aria-hidden="true" className="size-4" /></Link>}
        </nav>}
      </div>
    </main>
  )
}
