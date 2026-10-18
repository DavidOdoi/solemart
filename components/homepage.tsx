import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { blogPosts } from '@/data/blog'
import { categories } from '@/data/categories'
import { comparisons } from '@/data/comparisons'
import { guides } from '@/data/guides'
import { products } from '@/data/products'
import { affiliateUrl } from '@/lib/content'
import { CategoryCard, ComparisonCard, GuideCard, SectionHeading, TrustBar } from '@/components/affiliate-site'

const imageBase = 'https://images.unsplash.com/'

export default function SolemartHome() {
  return (
    <main id="top" className="min-h-screen bg-[#fafaf8] text-[#161616]">
      <section className="px-3 pt-3 sm:px-5">
        <div className="home-hero relative isolate min-h-[590px] overflow-hidden rounded-[1.75rem] bg-[#080808] sm:min-h-[650px] lg:min-h-[700px]">
          <Image src={`${imageBase}photo-1542291026-7eec264c27ff?w=2200&q=90`} alt="Red Nike running shoe against a dark studio backdrop" fill priority sizes="100vw" className="home-hero__image -z-20 object-cover object-[68%_54%]" />
          <div aria-hidden="true" className="home-hero__shade absolute inset-0 -z-10" />
          <div aria-hidden="true" className="home-hero__orbit absolute -right-20 top-12 -z-10 size-80 rounded-full border border-white/10 sm:right-[12%] sm:top-20 sm:size-[34rem]" />
          <div className="relative flex min-h-[590px] max-w-[1380px] flex-col items-start justify-center px-6 py-14 sm:min-h-[650px] sm:px-10 lg:min-h-[700px] lg:px-16">
            <div className="home-hero__copy max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-[11px] font-bold tracking-[0.18em] text-white/90 backdrop-blur-md"><span className="size-2 rounded-full bg-[#f36e35]" /> THE SHOE EDIT / MADE FOR YOUR NEXT MOVE</span>
              <h1 className="mt-7 max-w-[780px] font-sans text-5xl font-black leading-[0.96] tracking-[-0.055em] text-white sm:text-7xl lg:text-[6.25rem]">Find your next <span className="text-[#f47a45]">favorite</span>.</h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/75 sm:text-lg sm:leading-8">Good shoes make a difference. Find your fit with independent reviews, practical guides, and picks worth a closer look.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shoes-for-standing-all-day" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 text-sm font-bold text-[#111] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f47a45] hover:text-white">Find your shoes <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" /></Link>
                <Link href="/best-shoes/best-shoes-for-standing-all-day" className="inline-flex min-h-14 items-center rounded-full border border-white/35 bg-black/20 px-7 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10">Explore buying guides</Link>
              </div>
              <div className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/20 pt-5 text-[11px] font-bold tracking-[0.16em] text-white/70 sm:text-xs"><span>WALKING</span><span aria-hidden="true" className="size-1.5 rounded-full bg-[#f47a45]" /><span>RUNNING</span><span aria-hidden="true" className="size-1.5 rounded-full bg-[#f47a45]" /><span>EVERYDAY</span></div>
            </div>
            <div className="home-hero__note absolute bottom-7 right-7 hidden items-center gap-3 rounded-full border border-white/15 bg-black/45 px-4 py-3 text-xs font-semibold text-white/90 backdrop-blur-md sm:flex lg:bottom-9 lg:right-10"><span className="flex size-8 items-center justify-center rounded-full bg-[#f47a45] text-sm font-black">01</span> Find a pair that fits your day</div>
          </div>
        </div>
      </section>
      <TrustBar />

      <section aria-label="Featured shoe brands" className="overflow-hidden border-b border-[#e8e7e2] bg-[#f3f2ee] py-8 sm:py-10">
        <p className="mb-5 text-center text-[10px] font-bold tracking-[0.22em] text-[#77766f] sm:text-xs">SHOES FROM BRANDS YOU KNOW</p>
        <div className="brand-marquee">
          <div className="brand-marquee__track">
            {[0, 1].map((copy) => (
              <div key={copy} className="brand-marquee__group" aria-hidden={copy === 1}>
                {[
                  { name: 'Nike', slug: 'nike' },
                  { name: 'Adidas', slug: 'adidas' },
                  { name: 'New Balance', slug: 'newbalance' },
                  { name: 'Puma', slug: 'puma' },
                  { name: 'Reebok', slug: 'reebok' },
                  { name: 'Under Armour', slug: 'underarmour' },
                ].map((brand) => (
                  <img
                    key={brand.slug}
                    src={`https://cdn.simpleicons.org/${brand.slug}/77766f?viewbox=auto`}
                    alt={copy === 0 ? `${brand.name} logo` : ''}
                    aria-hidden={copy === 1}
                    loading="lazy"
                    className="brand-logo"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Latest shoe advice and price checks" className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[0.9fr_1.4fr_0.9fr] lg:px-8">
          <div>
            <h2 className="border-t-2 border-[#161616] pt-3 font-serif text-2xl">The latest</h2>
            <ul className="mt-5 space-y-5">
              {blogPosts.slice(0, 3).map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="font-bold leading-snug hover:text-[#e86d35]">{post.title}</Link>
                  <time dateTime={new Date(post.date).toISOString()} className="mt-1 block text-sm text-[#77766f]">{post.date}</time>
                </li>
              ))}
            </ul>
            <Link href="/blog" className="mt-5 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">See all advice <ArrowRight aria-hidden="true" className="size-4 text-[#e86d35]" /></Link>
          </div>

          <article className="min-w-0">
            <h2 className="border-t-2 border-[#161616] pt-3 font-serif text-2xl">Featured buying guide</h2>
            <Link href={`/best-shoes/${guides[0].slug}`} className="group mt-5 block">
              <div className="overflow-hidden rounded-xl bg-[#efeee9]">
                <Image src={guides[0].image} alt={guides[0].imageAlt} width={1200} height={800} sizes="(max-width: 1024px) 100vw, 45vw" className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.02] sm:h-56" />
              </div>
              <p className="mt-4 text-xs font-bold tracking-[0.15em] text-[#e86d35]">{guides[0].category}</p>
              <h3 className="mt-2 font-serif text-2xl leading-tight group-hover:text-[#e86d35]">{guides[0].title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#77766f]">{guides[0].excerpt}</p>
            </Link>
          </article>

          <div>
            <h2 className="border-t-2 border-[#161616] pt-3 font-serif text-2xl">Price checks</h2>
            <p className="mt-3 text-sm leading-6 text-[#77766f]">See current pricing and availability at the retailer. Prices can change.</p>
            <ul className="mt-5 divide-y divide-[#e5e4df]">
              {products.slice(0, 3).map((product) => (
                <li key={product.slug} className="py-4">
                  <Link href={`/reviews/${product.slug}`} className="font-bold leading-snug hover:text-[#e86d35]">{product.name}</Link>
                  <p className="mt-1 text-sm text-[#77766f]">{product.bestFor}</p>
                  <a href={affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-bold underline underline-offset-4">See Latest Price <ArrowRight aria-hidden="true" className="size-3.5 text-[#e86d35]" /></a>
                </li>
              ))}
            </ul>
            <Link href="/deals" className="mt-3 inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4">All price checks <ArrowRight aria-hidden="true" className="size-4 text-[#e86d35]" /></Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="shoe-finder-heading" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="border-t border-[#161616] pt-8 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#e86d35]">START WITH YOUR NEED</p>
            <h2 id="shoe-finder-heading" className="mt-3 font-serif text-3xl sm:text-4xl">What are you looking for?</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#77766f]">Choose a starting point. WeÃ¢â‚¬â„¢ll take you to the guides and comparisons for that kind of shoe.</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0">
            {categories.map((category) => (
              <Link key={category.slug} href={`/${category.slug}`} className="rounded-full border border-[#deddd8] bg-white px-4 py-3 text-sm font-semibold transition hover:border-[#e86d35] hover:text-[#e86d35]">{category.title}</Link>
            ))}
          </div>
        </div>
      </section>

      <section id="needs" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="SHOP BY NEED" title="Start with your shoe need" href="/walking-shoes" linkLabel="View all categories" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{categories.map((category) => <CategoryCard key={category.slug} category={category} />)}</div>
      </section>

      <section id="guides" className="bg-[#efeee9]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="FROM THE EDITORS" title="Popular shoe buying guides" href="/best-shoes/best-shoes-for-standing-all-day" linkLabel="See all guides" />
          <div className="grid gap-5 lg:grid-cols-3">{guides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div>
        </div>
      </section>

      <section className="border-y border-[#e8e7e2] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <SectionHeading eyebrow="KNOW YOUR OPTIONS" title="Compare before you buy" href={`/comparisons/${comparisons[0].slug}`} linkLabel="View comparisons" />
          <div className="grid gap-4 md:grid-cols-2">{comparisons.map((comparison, index) => <ComparisonCard key={comparison.slug} comparison={comparison} index={index} />)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="FROM THE BLOG" title="Latest shoe advice" href="/blog" linkLabel="Visit the blog" />
        <div className="grid gap-5 md:grid-cols-3">
          {blogPosts.map((post) => <article key={post.slug} className="border-t-2 border-[#161616] pt-5">
            <div className="flex justify-between gap-3 text-xs font-bold tracking-[0.14em] text-[#e86d35]"><span>{post.category}</span><time dateTime={new Date(post.date).toISOString()}>{post.date}</time></div>
            <h3 className="mt-5 font-serif text-2xl leading-tight"><Link href={`/blog/${post.slug}`} className="hover:text-[#e86d35]">{post.title}</Link></h3>
            <p className="mt-3 text-sm leading-6 text-[#77766f]">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex items-center gap-1 text-sm font-bold">Read more <ArrowRight aria-hidden="true" className="size-4 text-[#e86d35]" /></Link>
          </article>)}
        </div>
      </section>

      <section className="bg-[#f3f2ee]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div><h2 className="font-serif text-2xl">A little more confidence in your next pair.</h2><p className="mt-2 text-sm text-[#68675f]">Start with the guide that fits your day.</p></div>
          <Link href="/shoes-for-standing-all-day" className="inline-flex items-center gap-2 self-start rounded-full bg-[#161616] px-5 py-3 text-sm font-bold text-white hover:bg-[#e86d35] sm:self-auto">Find the right shoe <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </div>
      </section>
    </main>
  )
}
