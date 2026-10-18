import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  Menu,
  Search,
  ShieldCheck,
} from 'lucide-react'
import type { Category } from '@/data/categories'
import type { Guide } from '@/data/guides'
import type { Product } from '@/data/products'
import type { Comparison } from '@/data/comparisons'
import { categories } from '@/data/categories'
import { guides } from '@/data/guides'
import { affiliateUrl } from '@/lib/content'

export function SearchBar({ className = '' }: { className?: string }) {
  return (
    <form action="/search" role="search" className={`flex h-12 items-center gap-3 rounded-lg border border-[#c9c8c4] bg-white px-4 ${className}`}>
      <Search aria-hidden="true" className="size-4 shrink-0 text-[#77766f]" />
      <input
        name="q"
        aria-label="Search shoe guides and recommendations"
        placeholder="Search shoes, brands, and guides"
        className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-[#898880] sm:text-base"
      />
      <button type="submit" className="shrink-0 border-l border-[#deddd8] pl-3 text-xs font-black tracking-wide text-[#161616] transition hover:text-[#e86d35]">SEARCH</button>
    </form>
  )
}

export function SiteHeader() {
  const navItems = [
    { label: 'Walking Shoes', href: '/walking-shoes' },
    { label: 'Running Shoes', href: '/running-shoes' },
    { label: 'Work Boots', href: '/work-boots' },
    { label: 'Sneakers', href: '/sneakers' },
    { label: 'Reviews', href: '/reviews/brooks-ghost-15' },
    { label: 'Deals', href: '/deals' },
  ]

  return (
    <>
      <div className="announcement-marquee bg-[#161616] py-3 text-xs font-extrabold tracking-[0.16em] text-white sm:text-sm">
        <div className="announcement-marquee__track">
          <p className="announcement-marquee__group">
            FREE TO EXPLORE <span className="text-[#e86d35]">/</span> INDEPENDENT SHOE GUIDES FOR EVERY DAY
          </p>
          <p aria-hidden="true" className="announcement-marquee__group">
            FREE TO EXPLORE <span className="text-[#e86d35]">/</span> INDEPENDENT SHOE GUIDES FOR EVERY DAY
          </p>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[#e8e7e2] bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[74px] max-w-[1380px] items-center gap-4 px-4 py-3 sm:px-6 lg:gap-8 lg:px-10">
          <details className="group relative lg:hidden">
            <summary aria-label="Open navigation" className="list-none cursor-pointer rounded-full border border-[#deddd8] p-2.5 [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" className="size-5" />
            </summary>
            <nav aria-label="Main navigation" className="absolute left-0 top-12 z-50 flex w-64 flex-col gap-4 rounded-xl border border-[#e8e7e2] bg-white p-5 shadow-xl">
              {navItems.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-[#4f4e49] hover:text-[#e86d35]">{item.label}</Link>)}
              <Link href="/blog" className="text-sm font-semibold text-[#4f4e49] hover:text-[#e86d35]">Shoe Advice</Link>
            </nav>
          </details>
          <Link href="/" className="shrink-0 text-[20px] font-black tracking-[0.2em] sm:text-2xl">
            SOLEMART<span className="text-[#e86d35]">.</span>
          </Link>
          <SearchBar className="ml-auto hidden w-full max-w-[610px] md:flex" />
          <Link href="/contact" className="hidden shrink-0 text-sm font-semibold text-[#373630] transition hover:text-[#e86d35] sm:inline-flex">Help &amp; Support</Link>
          <Link href="/shoes-for-standing-all-day" className="hidden shrink-0 items-center rounded-md bg-[#161616] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e86d35] lg:inline-flex">
            Find your fit <ArrowRight aria-hidden="true" className="ml-2 size-3.5" />
          </Link>
        </div>
        <nav aria-label="Shop shoe categories" className="mx-auto hidden max-w-[1380px] items-center gap-8 px-10 pb-3 lg:flex">
          {navItems.map((item) => <Link key={item.href} href={item.href} className={`whitespace-nowrap text-sm font-bold transition hover:text-[#e86d35] ${item.label === 'Deals' ? 'text-[#d94331]' : 'text-[#242424]'}`}>{item.label}</Link>)}
          <Link href="/blog" className="whitespace-nowrap text-sm font-bold text-[#242424] transition hover:text-[#e86d35]">Shoe Advice</Link>
        </nav>
        <div className="px-4 pb-3 sm:px-6 md:hidden">
          <SearchBar />
        </div>
      </header>
    </>
  )
}
export function SiteFooter() {
  return (
    <footer className="border-t border-[#303030] bg-black text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="About SOLEMART" className="flex flex-col items-start gap-3 text-base text-[#d1d1d1]">
            <Link href="/" className="mb-1 text-xl font-black tracking-[0.22em]">SOLEMART<span className="text-[#e86d35]">.</span></Link>
            <p className="mb-2 max-w-xs text-sm leading-6 text-[#d1d1d1]">Better shoes start with better research. Find a pair that fits your life and your budget.</p>
            <h2 className="mb-1 text-lg font-bold text-white">About SOLEMART</h2>
            <Link href="/about" className="hover:text-[#e86d35]">Who we are</Link>
            <Link href="/blog" className="hover:text-[#e86d35]">Our shoe advice</Link>
            <Link href="/contact" className="hover:text-[#e86d35]">Contact</Link>
          </nav>
          <nav aria-label="Research your next pair" className="flex flex-col items-start gap-3 text-base text-[#d1d1d1]">
            <h2 className="mb-1 text-lg font-bold text-white">Research your next pair</h2>
            <Link href="/best-shoes/best-shoes-for-standing-all-day" className="hover:text-[#e86d35]">Buying guides</Link>
            <Link href="/comparisons/on-cloud-5-vs-brooks-ghost-15" className="hover:text-[#e86d35]">Shoe comparisons</Link>
            <Link href="/reviews/brooks-ghost-15" className="hover:text-[#e86d35]">Shoe reviews</Link>
          </nav>
          <nav aria-label="Explore shoe categories" className="flex flex-col items-start gap-3 text-base text-[#d1d1d1]">
            <h2 className="mb-1 text-lg font-bold text-white">Explore shoes</h2>
            <Link href="/walking-shoes" className="hover:text-[#e86d35]">Walking shoes</Link>
            <Link href="/running-shoes" className="hover:text-[#e86d35]">Running shoes</Link>
            <Link href="/work-boots" className="hover:text-[#e86d35]">Work boots</Link>
            <Link href="/deals" className="hover:text-[#e86d35]">Price checks</Link>
          </nav>
          <nav aria-label="Trust and company policies" className="flex flex-col items-start gap-3 text-base text-[#d1d1d1]">
            <h2 className="mb-1 text-lg font-bold text-white">Trust & policies</h2>
            <Link href="/how-we-review" className="hover:text-[#e86d35]">How we review shoes</Link>
            <Link href="/editorial-policy" className="hover:text-[#e86d35]">Editorial policy</Link>
            <Link href="/affiliate-disclosure" className="hover:text-[#e86d35]">Affiliate disclosure</Link>
            <Link href="/terms-of-service" className="hover:text-[#e86d35]">Terms of Service</Link>
            <Link href="/privacy-policy" className="hover:text-[#e86d35]">Privacy Policy</Link>
          </nav>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-[#404040] pt-6 text-sm text-[#d1d1d1] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Solemart. All rights reserved.</p>
          <nav aria-label="Legal links" className="flex flex-wrap gap-x-3 gap-y-2">
            <Link href="/terms-of-service" className="hover:text-[#e86d35]">Terms of Service</Link>
            <span aria-hidden="true">/</span>
            <Link href="/privacy-policy" className="hover:text-[#e86d35]">Privacy Policy</Link>
            <span aria-hidden="true">/</span>
            <Link href="/affiliate-disclosure" className="hover:text-[#e86d35]">Affiliate disclosure</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
export function SectionHeading({ eyebrow, title, href, linkLabel }: { eyebrow: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#e86d35]">{eyebrow}</p>
        <h2 className="font-serif text-3xl tracking-tight text-[#161616] sm:text-4xl">{title}</h2>
      </div>
      {href && linkLabel && <Link href={href} className="hidden items-center gap-1 text-sm font-semibold text-[#161616] transition hover:text-[#e86d35] sm:flex">{linkLabel}<ArrowRight aria-hidden="true" className="size-4" /></Link>}
    </div>
  )
}

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link href={`/${category.slug}`} className="group rounded-2xl border border-[#e5e4df] bg-white p-3 transition hover:-translate-y-1 hover:border-[#c5c3bb] hover:shadow-lg hover:shadow-black/5">
      <div className="mb-3 overflow-hidden rounded-xl bg-[#eeece6]">
        <Image src={category.image} alt={category.imageAlt} width={900} height={900} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 28vw, 16vw" className="aspect-square w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />
      </div>
      <h3 className="text-sm font-bold leading-tight">{category.title}</h3>
      <p className="mt-1.5 text-sm leading-5 text-[#68675f]">{category.description}</p>
      <ChevronRight aria-hidden="true" className="mt-3 size-4 text-[#e86d35]" />
    </Link>
  )
}

export function GuideCard({ guide }: { guide: Guide }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white">
      <Link href={`/best-shoes/${guide.slug}`} className="block overflow-hidden">
        <Image src={guide.image} alt={guide.imageAlt} width={1200} height={800} sizes="(max-width: 1024px) 100vw, 33vw" className="h-48 w-full object-cover grayscale-[15%] transition duration-500 hover:scale-105" />
      </Link>
      <div className="p-6">
        <p className="text-xs font-bold tracking-[0.12em] text-[#e86d35]">{guide.category}</p>
        <h3 className="mt-3 font-serif text-2xl leading-tight"><Link href={`/best-shoes/${guide.slug}`} className="hover:text-[#e86d35]">{guide.title}</Link></h3>
        <p className="mt-3 text-sm leading-6 text-[#77766f]">{guide.excerpt}</p>
        <Link href={`/best-shoes/${guide.slug}`} className="mt-6 inline-flex items-center gap-1 text-sm font-bold underline decoration-[#e86d35] underline-offset-4">Read Guide <ArrowRight aria-hidden="true" className="size-4" /></Link>
      </div>
    </article>
  )
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group min-w-0 rounded-2xl border border-[#e5e4df] bg-white p-3 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
      <Link href={`/reviews/${product.slug}`} className="relative block overflow-hidden rounded-xl bg-[#f0eee9]">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-bold">SAMPLE PROFILE</span>
        <Image src={product.image} alt={product.imageAlt} width={900} height={900} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw" className="aspect-square w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="p-2 pt-4">
        <h3 className="break-words font-bold"><Link href={`/reviews/${product.slug}`} className="hover:text-[#e86d35]">{product.name}</Link></h3>
        <p className="mt-1 text-sm text-[#b64c1e]">{product.bestFor}</p>
        <ul className="mt-4 flex flex-col gap-2 text-sm leading-6 text-[#4f4e49]">
          {product.pros.slice(0, 3).map((pro) => <li key={pro} className="flex items-start gap-2"><Check aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-[#46705e]" />{pro}</li>)}
        </ul>
        <div className="mt-5 flex flex-col gap-2">
          <a href={affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#e86d35] px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-[#d95d28]">Check Price on Amazon <ArrowRight aria-hidden="true" className="size-4 shrink-0" /></a>
          <Link href={`/reviews/${product.slug}`} className="text-center text-sm font-semibold text-[#4f4e49] hover:text-[#e86d35]">Read Full Review</Link>
        </div>
      </div>
    </article>
  )
}

export function ComparisonCard({ comparison, index }: { comparison: Comparison; index: number }) {
  return (
    <Link href={`/comparisons/${comparison.slug}`} className="group flex min-w-0 items-center justify-between gap-4 rounded-2xl bg-[#f3f2ee] p-6 transition hover:bg-[#e9e7e0]">
      <div>
        <span className="text-xs font-bold text-[#e86d35]">{String(index + 1).padStart(2, '0')}</span>
        <h3 className="mt-8 max-w-[190px] font-serif text-2xl leading-tight">{comparison.title}</h3>
        <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold">Read comparison <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" /></span>
      </div>
      <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-[#d5d3ca] bg-white"><ArrowRight aria-hidden="true" className="size-5" /></span>
    </Link>
  )
}

export function TrustBar() {
  const items = [
    { icon: ShieldCheck, title: 'Independent recommendations', description: 'Research to inform your choice.' },
    { icon: BookOpen, title: 'Helpful buying guides', description: 'Clear advice, less noise.' },
    { icon: Check, title: 'Retailer price checks', description: 'Check current listing details.' },
  ]
  return (
    <section aria-label="Our approach" className="border-y border-[#e8e7e2] bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-7 sm:grid-cols-3 lg:px-8">
        {items.map(({ icon: Icon, title, description }) => <div key={title} className="flex items-center gap-3"><Icon aria-hidden="true" className="size-5 text-[#46705e]" /><div><p className="text-sm font-bold">{title}</p><p className="mt-0.5 text-sm text-[#5f5e57]">{description}</p></div></div>)}
      </div>
    </section>
  )
}

export function AffiliateDisclosure({ id = 'affiliate-disclosure' }: { id?: string }) {
  return (
    <section id={id} className="border-t border-[#e8e7e2] bg-[#f3f2ee]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-sm leading-6 text-[#5f5e57] sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <p className="max-w-3xl"><strong className="text-[#161616]">Affiliate disclosure:</strong> As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.</p>
        <Link href="/#top" className="whitespace-nowrap font-bold text-[#161616]">Back to top Ã¢â€ â€˜</Link>
      </div>
    </section>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[#68675f]">
      <ol className="flex flex-wrap items-center gap-2">
        <li><Link href="/" className="hover:text-[#e86d35]">Home</Link></li>
        {items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2"><span aria-hidden="true">/</span>{item.href && index < items.length - 1 ? <Link href={item.href} className="hover:text-[#e86d35]">{item.label}</Link> : <span aria-current="page" className="text-[#161616]">{item.label}</span>}</li>)}
      </ol>
    </nav>
  )
}

export function FAQSection({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (faqs.length === 0) return null
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  }
  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl">Frequently asked questions</h2>
      <div className="mt-6 divide-y divide-[#e5e4df] border-y border-[#e5e4df]">
        {faqs.map(({ question, answer }) => <details key={question} className="py-5"><summary className="cursor-pointer text-base font-semibold">{question}</summary><p className="mt-3 max-w-3xl text-base leading-7 text-[#4f4e49]">{answer}</p></details>)}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </section>
  )
}

export function RelatedGuides({ slugs }: { slugs: string[] }) {
  const related = slugs.map((slug) => guides.find((guide) => guide.slug === slug)).filter((guide): guide is Guide => Boolean(guide))
  if (related.length === 0) return null
  return (
    <section className="mt-16">
      <h2 className="font-serif text-3xl">Related buying guides</h2>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {related.map((guide) => <li key={guide.slug}><Link href={`/best-shoes/${guide.slug}`} className="flex h-full items-center justify-between gap-3 rounded-xl border border-[#e5e4df] bg-white p-4 font-semibold hover:border-[#e86d35]"><span>{guide.title}</span><ArrowRight aria-hidden="true" className="size-4 shrink-0 text-[#e86d35]" /></Link></li>)}
      </ul>
    </section>
  )
}

export function CategoryLinks({ items = categories }: { items?: Category[] }) {
  return <div className="mt-4 flex flex-wrap gap-2">{items.map((category) => <Link key={category.slug} href={`/${category.slug}`} className="rounded-full border border-[#deddd8] bg-white px-3 py-2 text-sm font-semibold hover:border-[#e86d35]">{category.title}</Link>)}</div>
}
