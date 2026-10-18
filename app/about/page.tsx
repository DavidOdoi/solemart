import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen, Check, Search, ShieldCheck } from 'lucide-react'
import { Breadcrumbs } from '@/components/affiliate-site'
import { categories } from '@/data/categories'

export const metadata: Metadata = {
  title: { absolute: 'About SOLEMART | Independent Shoe Reviews & Buying Guides' },
  description: 'Learn about SOLEMART, an independent shoe recommendation site helping shoppers compare footwear by comfort, durability, fit, style, and value.',
}

const principles = [
  { number: '01', icon: Search, title: 'Start with your needs', copy: 'A work shoe and a weekend sneaker solve different problems. We organize our guides around how people actually plan to wear a pair.' },
  { number: '02', icon: BookOpen, title: 'Make the details clearer', copy: 'We bring fit notes, comfort features, materials, durability signals, and price value into one easier comparison.' },
  { number: '03', icon: Check, title: 'Know what to check next', copy: 'We point out the questions worth asking and the details to confirm with the retailer before you decide.' },
]

const categoryCards = [
  { title: 'Running shoes', slug: 'running-shoes', imageIndex: 1, note: 'Fit, cushioning, and your routine' },
  { title: 'Work boots', slug: 'work-boots', imageIndex: 2, note: 'Construction and job requirements' },
  { title: 'Everyday sneakers', slug: 'sneakers', imageIndex: 3, note: 'Materials, care, and daily comfort' },
  { title: 'Walking shoes', slug: 'walking-shoes', imageIndex: 0, note: 'Daily miles, travel, and errands' },
]

export default function AboutPage() {
  const heroImage = categories[1]

  return (
    <main id="top" className="bg-[#fafaf8] text-[#161616]">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:pb-20 sm:pt-10 lg:px-8">
        <Breadcrumbs items={[{ label: 'About SOLEMART' }]} />

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-[#f0eee9]">
          <div aria-hidden="true" className="absolute -right-24 -top-28 size-80 rounded-full border-[48px] border-white/45" />
          <div className="relative grid lg:min-h-[540px] lg:grid-cols-[1fr_0.9fr]">
            <div className="flex flex-col items-start justify-center px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#dcd9d0] bg-white/80 px-3.5 py-2 text-[11px] font-black tracking-[0.16em] text-[#4f4e49]">
                <span className="size-2 rounded-full bg-[#e86d35]" /> INDEPENDENT FOOTWEAR GUIDES
              </span>
              <h1 className="mt-6 max-w-xl font-sans text-5xl font-black leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">Better shoe decisions start here.</h1>
              <p className="mt-6 max-w-xl font-serif text-lg leading-8 text-[#4f4e49] sm:text-xl">SOLEMART helps you compare footwear before you buy, with practical guides, reviews, and clear advice built around real buyer needs.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/how-we-review" className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#161616] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e86d35]">How we review <ArrowRight aria-hidden="true" className="size-4" /></Link>
                <Link href="/#guides" className="inline-flex min-h-12 items-center rounded-lg border border-[#c9c6bd] bg-white/80 px-5 py-3 text-sm font-bold transition hover:border-[#161616]">Explore buying guides</Link>
              </div>
            </div>

            <div className="relative min-h-[300px] p-4 sm:min-h-[390px] sm:p-6 lg:min-h-full lg:p-7">
              <div className="absolute inset-4 overflow-hidden rounded-[1.5rem] bg-[#d8d6cf] sm:inset-6 lg:inset-7">
                <Image src={heroImage.image} alt={heroImage.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                  <p className="text-xs font-bold tracking-[0.16em] text-white/80">A CLEARER WAY TO COMPARE</p>
                  <p className="mt-2 max-w-sm font-sans text-2xl font-black leading-tight text-white sm:text-3xl">Comfort. Fit. Use. Value.</p>
                </div>
              </div>
              <div className="absolute right-7 top-7 max-w-[190px] rounded-2xl border border-white/70 bg-white/95 p-4 shadow-xl sm:right-9 sm:top-9">
                <ShieldCheck aria-hidden="true" className="size-6 text-[#46705e]" />
                <p className="mt-3 text-sm font-bold">Independent recommendations</p>
                <p className="mt-1 text-xs leading-5 text-[#68675f]">Research to inform your choice.</p>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="who-we-are" className="mx-auto grid max-w-6xl gap-6 border-b border-[#e5e4df] py-14 sm:py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-black tracking-[0.16em] text-[#c65325]">WHO WE ARE</p>
            <h2 id="who-we-are" className="mt-3 font-sans text-3xl font-black leading-tight tracking-tight sm:text-4xl">A useful starting point for your next pair.</h2>
          </div>
          <div className="space-y-4 font-serif text-lg leading-8 text-[#4f4e49]">
            <p>We are an independent footwear recommendation platform. We publish buying guides, reviews, comparisons, and practical advice for people looking for their next pair.</p>
            <p>Shopping for shoes can mean weighing fit, comfort, durability, style, and price all at once. We make those tradeoffs easier to scan, so you can focus on what matters for your day.</p>
          </div>
        </section>

        <section aria-labelledby="our-approach" className="py-14 sm:py-16">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black tracking-[0.16em] text-[#c65325]">HOW WE HELP</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="our-approach" className="max-w-xl font-sans text-3xl font-black leading-tight tracking-tight sm:text-4xl">Less guesswork. More useful comparisons.</h2>
              <Link href="/how-we-review" className="inline-flex items-center gap-2 self-start text-sm font-bold underline decoration-[#c9c7bf] underline-offset-4 hover:text-[#c65325] sm:mb-1">See our review process <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {principles.map(({ number, icon: Icon, title, copy }) => <article key={number} className="rounded-2xl border border-[#e5e4df] bg-white p-6 sm:p-7">
                <div className="flex items-center justify-between"><span className="font-sans text-sm font-black tracking-[0.14em] text-[#c65325]">{number}</span><span className="flex size-11 items-center justify-center rounded-full bg-[#f3f2ee]"><Icon aria-hidden="true" className="size-5 text-[#46705e]" /></span></div>
                <h3 className="mt-6 font-sans text-xl font-black">{title}</h3>
                <p className="mt-3 font-serif leading-7 text-[#68675f]">{copy}</p>
              </article>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="what-we-cover" className="rounded-[2rem] bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-xs font-black tracking-[0.16em] text-[#c65325]">WHAT WE COVER</p>
            <div className="mt-3 grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div><h2 id="what-we-cover" className="font-sans text-3xl font-black leading-tight tracking-tight sm:text-4xl">Footwear for different days and different needs.</h2><p className="mt-4 font-serif leading-7 text-[#68675f]">Our guides span boots, running shoes, sneakers, sandals, loafers, work shoes, and comfort footwear.</p></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryCards.map((card) => {
                  const category = categories[card.imageIndex]
                  return <Link key={card.slug} href={`/${card.slug}`} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#e8e7e2] p-3 transition hover:border-[#c9c6bd] hover:bg-[#fafaf8]">
                    <div className="relative size-[68px] shrink-0 overflow-hidden rounded-lg bg-[#f0eee9]"><Image src={category.image} alt={category.imageAlt} fill sizes="68px" className="object-cover transition duration-300 group-hover:scale-105" /></div>
                    <div className="min-w-0"><h3 className="font-sans font-bold">{card.title}</h3><p className="mt-1 text-xs leading-5 text-[#77766f]">{card.note}</p></div>
                    <ArrowRight aria-hidden="true" className="ml-auto size-4 shrink-0 text-[#c65325] transition group-hover:translate-x-1" />
                  </Link>
                })}
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2" aria-label="Additional footwear topics">
              {['Sandals', 'Loafers', 'Work shoes', 'Comfort footwear'].map((label) => <span key={label} className="rounded-full bg-[#f3f2ee] px-3.5 py-2 text-xs font-bold text-[#4f4e49]">{label}</span>)}
            </div>
          </div>
        </section>

        <section aria-labelledby="affiliate-note" className="mx-auto my-14 grid max-w-6xl overflow-hidden rounded-2xl bg-[#161616] text-white sm:my-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="p-6 sm:p-9 lg:p-10">
            <p className="text-xs font-black tracking-[0.16em] text-[#f49a6e]">HOW WE MAKE MONEY</p>
            <h2 id="affiliate-note" className="mt-3 font-sans text-3xl font-black leading-tight sm:text-4xl">Affiliate links support our work.</h2>
            <p className="mt-4 font-serif leading-7 text-white/75">SOLEMART may earn a commission when you buy through an affiliate link. This does not determine which products we recommend or increase the price you pay.</p>
            <Link href="/affiliate-disclosure" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">Read our affiliate disclosure <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <div className="grid grid-cols-3 border-t border-white/15 bg-white/[0.04] lg:border-l lg:border-t-0">
            {[
              { title: 'Research', note: 'Product details and buyer needs' },
              { title: 'Compare', note: 'Useful options for your purpose' },
              { title: 'Choose', note: 'You decide what fits you' },
            ].map(({ title, note }, index) => <div key={title} className={`flex flex-col justify-center p-4 sm:p-6 ${index > 0 ? 'border-l border-white/15' : ''}`}>
              <span className="text-xs font-black tracking-[0.14em] text-[#f49a6e]">0{index + 1}</span><span className="mt-3 font-sans text-sm font-black sm:text-lg">{title}</span><span className="mt-2 text-xs leading-5 text-white/65 sm:text-sm">{note}</span>
            </div>)}
          </div>
        </section>

        <section aria-labelledby="our-promise" className="mx-auto flex max-w-6xl flex-col gap-6 rounded-2xl border border-[#e5e4df] bg-[#f3f2ee] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4"><span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white"><ShieldCheck aria-hidden="true" className="size-6 text-[#46705e]" /></span><div><p className="text-xs font-black tracking-[0.16em] text-[#c65325]">OUR PROMISE</p><h2 id="our-promise" className="mt-2 font-sans text-2xl font-black">Clear about what we know.</h2><p className="mt-2 max-w-2xl font-serif leading-7 text-[#68675f]">We aim to be useful and transparent, including when a profile is research-based or product details need to be confirmed.</p></div></div>
          <Link href="/editorial-policy" className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#c9c6bd] bg-white px-4 py-3 text-sm font-bold transition hover:border-[#161616] sm:self-auto">Our editorial policy <ArrowRight aria-hidden="true" className="size-4" /></Link>
        </section>
      </div>
    </main>
  )
}
