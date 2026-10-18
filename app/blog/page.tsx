import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { blogPosts } from '@/data/blog'

export const metadata = {
  title: 'Shoe Guides & Footwear Advice',
  description: 'Practical shoe advice, fit tips, and footwear explainers from SOLEMART.',
}

export default function BlogPage() {
  return (
    <main id="top" className="min-h-[60vh] bg-[#fafaf8] px-5 py-14 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#77766f]"><Link href="/" className="hover:text-[#e86d35]">Home</Link><span aria-hidden="true" className="mx-2">/</span><span aria-current="page" className="text-[#161616]">Shoe Advice</span></nav>
        <p className="text-sm font-bold tracking-[0.18em] text-[#e86d35]">SOLEMART JOURNAL</p>
        <h1 className="mt-4 font-serif text-5xl tracking-tight sm:text-6xl">Shoe guides & footwear advice.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#68675f]">Straightforward advice to help you understand fit, compare options, and make a more informed shoe choice.</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {blogPosts.map((post) => <article key={post.slug} className="rounded-2xl border border-[#e5e4df] bg-white p-6">
            <div className="flex flex-wrap justify-between gap-3 text-sm font-bold tracking-[0.14em] text-[#e86d35]"><span>{post.category}</span><time dateTime={new Date(post.date).toISOString()}>{post.date}</time></div>
            <h2 className="mt-4 font-serif text-3xl"><Link href={`/blog/${post.slug}`} className="hover:text-[#e86d35]">{post.title}</Link></h2>
            <p className="mt-3 leading-7 text-[#77766f]">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold">Read article <ArrowRight aria-hidden="true" className="size-4 text-[#e86d35]" /></Link>
          </article>)}
        </div>
      </div>
    </main>
  )
}
