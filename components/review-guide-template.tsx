import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowDown, ArrowRight, Check, X } from 'lucide-react'
import type { Guide } from '@/data/guides'
import type { Product } from '@/data/products'
import { Breadcrumbs } from '@/components/affiliate-site'
import { affiliateUrl } from '@/lib/content'
import { PickActions } from '@/components/pick-actions'
import { EditorialRichText } from '@/components/editorial-rich-text'
import { editorialPlainText } from '@/lib/cms-rich-text'

function reviewHref(product: Product) {
  return product.cmsManaged ? product.reviewUrl || `#review-${product.slug}` : `/reviews/${product.slug}`
}

function priceButtonLabel(product: Product, preview = false) {
  if (preview || !product.cmsManaged || /https:\/\/(?:[^/]+\.)?(?:amazon\.com|amzn\.to)(?:\/|$)/i.test(product.affiliateUrl || '')) return 'Check Price on Amazon'
  return 'Check latest price'
}

const shell = 'mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8'
function jsonLd(value: object) {
  return { __html: JSON.stringify(value).replace(/</g, '\\u003c') }
}

function RetailerAction({ href, preview, className, children }: { href?: string; preview: boolean; className: string; children: ReactNode }) {
  if (preview) return <button type="button" disabled aria-describedby="template-preview-note" title="Retailer buttons are disabled in this design preview" className={className}>{children}</button>
  return href ? <a href={href} target="_blank" rel="sponsored nofollow noopener noreferrer" className={className}>{children}</a> : null
}

function TopPickCard({ product, index, preview }: { product: Product; index: number; preview: boolean }) {
  const href = product.cmsManaged ? product.affiliateUrl : product.affiliateUrl || affiliateUrl
  const showPrice = preview || Boolean(href)
  return (
    <article className="relative grid gap-5 border-b border-[#e7e5de] p-5 last:border-b-0 sm:p-7 md:grid-cols-2 md:items-center md:gap-8 md:p-8">
      {product.image && <Link href={reviewHref(product)} className="group relative block overflow-hidden rounded-xl bg-[#f3f2ee]">
        <Image src={product.image} alt={product.imageAlt} width={900} height={700} sizes="(max-width: 768px) 90vw, 40vw" priority={index === 0} className="h-56 w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-[1.03] sm:h-64 md:h-[300px]" />
      </Link>}
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2"><span className="inline-flex rounded-md bg-[#161616] px-2.5 py-1.5 text-xs font-black text-white">#{index + 1}</span><span className="inline-flex rounded-full bg-[#f3f2ee] px-3 py-1.5 text-xs font-bold text-[#4f4e49]">{product.badge || (index === 0 ? 'Top Pick' : 'Also Consider')}</span></div>
          <PickActions slug={product.slug} href={reviewHref(product)} />
        </div>
        <h3 className="mt-4 text-2xl font-bold leading-tight text-[#c65325] sm:text-3xl"><Link href={reviewHref(product)} className="hover:underline hover:underline-offset-4">{product.name}</Link></h3>
        <p className="mt-3 text-base leading-7 text-[#68675f]">{product.shortReason || product.bestFor}</p>
        <div className="mt-6 max-w-[360px]">
          {showPrice && <p className="text-sm font-semibold">{product.priceLabel || 'Check latest price'}</p>}
          {showPrice && <RetailerAction href={href} preview={preview} className="mt-3 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#161616] px-4 py-3 text-center text-base font-bold text-white transition hover:bg-[#e86d35]">{priceButtonLabel(product, preview)} <ArrowRight aria-hidden="true" className="size-5 shrink-0" /></RetailerAction>}
          {showPrice && <p className="mt-2 text-sm text-[#77766f]">Price may vary by size and color.</p>}
          <Link href={reviewHref(product)} className="mt-5 inline-block text-base font-bold underline decoration-[#c9c7bf] underline-offset-4 hover:text-[#c65325]">Read full review</Link>
        </div>
      </div>
    </article>
  )
}

export function SpecsTable({ specs }: { specs: Product['specs'] }) {
  return (
    <div className="rounded-xl border border-[#e5e4df]">
      <dl className="divide-y divide-[#e5e4df] sm:hidden">
        {specs.map(({ label, value }) => <div key={label} className="grid grid-cols-[minmax(6rem,0.8fr)_minmax(0,1.2fr)] gap-3 px-4 py-3 text-sm"><dt className="font-bold text-[#4f4e49]">{label}</dt><dd className="break-words text-[#68675f]">{value}</dd></div>)}
      </dl>
      <div className="hidden overflow-x-auto sm:block">
      <table className="w-full min-w-[420px] table-fixed text-left text-sm">
        <caption className="sr-only">Key shoe specifications</caption>
        <thead className="bg-[#f8e9e0]"><tr>{specs.map(({ label }) => <th key={label} scope="col" className="border-r border-white px-4 py-3 font-bold last:border-r-0">{label}</th>)}</tr></thead>
        <tbody><tr>{specs.map(({ label, value }) => <td key={label} className="break-words border-r border-[#e5e4df] px-4 py-4 align-top font-semibold text-[#4f4e49] last:border-r-0">{value}</td>)}</tr></tbody>
      </table>
      </div>
    </div>
  )
}

function FullReviewCard({ product, index, preview }: { product: Product; index: number; preview: boolean }) {
  const href = product.cmsManaged ? product.affiliateUrl : product.affiliateUrl || affiliateUrl
  const showPrice = preview || Boolean(href)
  return (
    <article id={`review-${product.slug}`} className="scroll-mt-36 rounded-2xl border border-[#e5e4df] bg-white p-5 sm:p-7">
      <div className="grid gap-6 lg:grid-cols-[minmax(250px,0.85fr)_minmax(0,1.15fr)] lg:gap-8">
        <div>
          {product.image && <div className="overflow-hidden rounded-xl bg-[#f3f2ee]"><Image src={product.image} alt={product.imageAlt} width={900} height={900} sizes="(max-width: 1024px) 90vw, 35vw" className="aspect-[4/3] w-full object-cover mix-blend-multiply" /></div>}
          {showPrice && <RetailerAction href={href} preview={preview} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#161616] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e86d35]">{priceButtonLabel(product, preview)} <ArrowRight aria-hidden="true" className="size-4" /></RetailerAction>}
          {showPrice && <p className="mt-2 text-center text-xs text-[#77766f]">Price may vary by size and color.</p>}
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#c65325]">#{index + 1} · {product.badge || `Pick ${index + 1}`} · {product.bestFor}</span>
          <h3 className="mt-2 font-serif text-2xl leading-tight sm:text-3xl">{product.name}</h3>
          <EditorialRichText value={product.reviewHtml || product.review.join('\n\n')} className="mt-4 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" />
          {!product.cmsManaged && <p className="mt-3 text-xs leading-5 text-[#77766f]">Sample editorial profile. Confirm current model details, fit, and availability with the retailer.</p>}
          {product.avoidIf && <p className="mt-4 text-base leading-7 text-[#4f4e49]"><strong>Avoid if:</strong> {product.avoidIf}</p>}
        </div>
      </div>
      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {(!product.cmsManaged || product.pros.length > 0) && <section aria-label={`${product.name} strengths`} className="rounded-xl border border-[#e5e4df] p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#46705e]">Pros</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f4e49]">{product.pros.map((pro) => <li key={pro} className="flex gap-2"><Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#46705e]" />{pro}</li>)}</ul>
          </section>}
          {(!product.cmsManaged || product.cons.length > 0) && <section aria-label={`${product.name} limitations`} className="rounded-xl border border-[#e5e4df] p-4">
            <h4 className="text-sm font-black uppercase tracking-[0.12em] text-[#b64c1e]">Cons</h4>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[#4f4e49]">{product.cons.map((con) => <li key={con} className="flex gap-2"><X aria-hidden="true" className="mt-1 size-4 shrink-0 text-[#8b6657]" />{con}</li>)}</ul>
          </section>}
        </div>
        {(!product.cmsManaged || product.specs.length > 0) && <section aria-label={`${product.name} specifications`}>
          <h4 className="mb-3 text-sm font-bold">Key specs to check</h4>
          <SpecsTable specs={product.specs} />
        </section>}
      </div>
    </article>
  )
}

function StickyReviewNav({ items }: { items: string[][] }) {
  return <nav aria-label="On this page" className="sticky top-[112px] z-30 -mx-5 mt-10 border-y border-[#e5e4df] bg-[#fafaf8]/95 px-5 backdrop-blur md:top-[76px] lg:mx-0 lg:rounded-xl lg:border">
    <ul className="mx-auto flex max-w-7xl snap-x gap-6 overflow-x-auto py-3 text-[15px] font-semibold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{items.map(([label, href]) => <li key={href} className="shrink-0 snap-start border-r border-[#d9d8d2] pr-6 last:border-0 last:pr-0"><a href={href} className="whitespace-nowrap text-[#4f4e49] hover:text-[#c65325]">{label}</a></li>)}</ul>
  </nav>
}

export function ReviewGuideTemplate({ guide, products, preview = false }: { guide: Guide; products: Product[]; preview?: boolean }) {
  const picks = products.slice(0, 4)
  const show = {
    picks: !guide.cmsManaged || picks.length > 0,
    methodology: !guide.cmsManaged || Boolean(guide.howWeChose?.length || guide.advice.length),
    buying: !guide.cmsManaged || Boolean(guide.contentHtml || guide.buyingGuideSections?.length || guide.advice.length),
    who: !guide.cmsManaged || Boolean(guide.whoItsFor?.length),
    mistakes: !guide.cmsManaged || Boolean(guide.mistakesToAvoid?.length),
    faqs: !guide.cmsManaged || guide.faqs.length > 0,
    verdict: !guide.cmsManaged || Boolean(guide.finalVerdict),
  }
  const navItems = [
    ...(show.picks ? [['Top Picks', '#top-picks']] : []),
    ...(show.methodology ? [['How We Chose', '#how-we-chose']] : []),
    ...(picks.length ? [['Full Reviews', '#full-reviews']] : []),
    ...(show.buying ? [['Buying Guide', '#buying-guide']] : []),
    ...(show.faqs ? [['FAQs', '#faqs']] : []),
  ]
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: guide.faqs.map(({ question, answer, answerHtml }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answerHtml ? editorialPlainText(answerHtml) : answer } })) }
  const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: guide.title, description: guide.metaDescription || guide.excerpt, datePublished: guide.publishedAt, dateModified: guide.updatedAt, mainEntityOfPage: `https://thesolemart.com/best-shoes/${encodeURIComponent(guide.slug)}`, author: guide.author || !guide.cmsManaged ? { '@type': 'Organization', name: guide.author || 'SOLEMART Editorial Team' } : undefined, publisher: { '@type': 'Organization', name: 'SOLEMART' }, mainEntity: picks.map((product) => ({ '@type': 'Product', name: product.name, image: product.image, description: product.shortReason || product.description })) }
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thesolemart.com/' }, { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: 'https://thesolemart.com/#guides' }, { '@type': 'ListItem', position: 3, name: guide.title }] }
  return (
    <main id="top" className={shell}>
      <Breadcrumbs items={[{ label: 'Buying Guides', href: '/#guides' }, { label: guide.title }]} />
      <article>
        <header className="mx-auto max-w-4xl">
          <p className="text-xs font-bold tracking-[0.18em] text-[#c65325]">{guide.category}</p>
          <h1 className="mt-3 max-w-5xl font-sans text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{guide.title}</h1>
          <EditorialRichText value={guide.introHtml || guide.intro} className="mt-5 max-w-4xl text-xl font-bold leading-snug text-[#24231f] sm:text-2xl" />
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#68675f]">
            {(guide.author || !guide.cmsManaged) && <span>By <strong className="text-[#161616]">{guide.author || 'SOLEMART Editorial Team'}</strong></span>}
            {guide.reviewedBy && <span>Reviewed by <strong className="text-[#161616]">{guide.reviewedBy}</strong></span>}
            {guide.cmsManaged && guide.publishedAt && <time dateTime={guide.publishedAt}>Published {new Date(guide.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</time>}
            {guide.updatedAt && <time dateTime={guide.updatedAt}>Updated <strong className="text-[#161616]">{new Date(guide.updatedAt.includes('T') ? guide.updatedAt : `${guide.updatedAt}T12:00:00Z`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</strong></time>}
          </div>
          <p className="mt-5 border-l-2 border-[#d9d8d2] pl-4 text-xs leading-5 text-[#68675f]">{guide.disclosure || 'As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.'}</p>
          {guide.cmsManaged && guide.image && <Image src={guide.image} alt={guide.imageAlt} width={1200} height={800} priority sizes="(max-width: 896px) 100vw, 896px" className="mt-8 h-auto w-full rounded-xl" />}
        </header>

        {(!guide.cmsManaged || guide.quickAnswerBody) && <section aria-labelledby="quick-answer-heading" className="mx-auto mt-8 max-w-4xl rounded-2xl border border-[#e5e4df] bg-[#f3f2ee] p-5 sm:p-7">
          <h2 id="quick-answer-heading" className="font-sans text-xl font-black sm:text-2xl">{guide.quickAnswerTitle}</h2>
          <p className="mt-2 font-serif text-base leading-7 text-[#4f4e49] sm:text-lg">{guide.quickAnswerBody}</p>
        </section>}

        {show.picks && <section id="top-picks" aria-labelledby="top-picks-heading" className="relative mx-auto mt-14 max-w-5xl scroll-mt-36 overflow-visible rounded-sm border-[3px] border-[#e86d35] bg-white pt-4 shadow-sm">
          <span aria-hidden="true" className="top-picks-ribbon absolute -top-[19px] left-5 z-10">TOP PICKS</span>
          <div className="border-b border-[#e7e5de] px-5 pb-5 pt-4 sm:px-7"><p className="text-xs font-bold tracking-[0.16em] text-[#c65325]">THE SHORTLIST</p><h2 id="top-picks-heading" className="mt-1 font-sans text-3xl font-black tracking-tight sm:text-4xl">Our Top Picks</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#68675f]">A quick comparison to help you choose where to start. Confirm fit, current model details, and availability before buying.</p></div>
          {picks.length ? picks.map((product, index) => <TopPickCard key={product.slug} product={product} index={index} preview={preview} />) : <p className="p-6 text-sm text-[#68675f]">Recommendations are being updated. Check back soon.</p>}
        </section>}

        {picks.length > 0 && <section aria-labelledby="comparison-heading" className="mx-auto mt-8 max-w-5xl">
          <h2 id="comparison-heading" className="font-sans text-2xl font-black tracking-tight sm:text-3xl">Compare the top picks</h2>
          <div className="mt-4 hidden overflow-x-auto rounded-xl border border-[#e5e4df] bg-white md:block">
            <table className="w-full min-w-[760px] table-fixed text-left text-[15px]">
              <caption className="sr-only">Comparison of the recommended shoe picks</caption>
              <thead className="bg-[#f3f2ee]"><tr>{['Pick', 'Best For', 'Cushioning', 'Width Options', 'Main Strength', 'Check Price'].map((heading) => <th key={heading} scope="col" className="p-3 font-bold">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-[#e5e4df]">{picks.map((pick) => {
                const comparison = guide.topPicks?.find(({ productSlug }) => productSlug === pick.slug)
                return <tr key={pick.slug}><th scope="row" className="break-words p-3 font-bold"><Link href={reviewHref(pick)} className="underline decoration-[#c9c7bf] underline-offset-2 hover:text-[#c65325]">{pick.name}</Link></th><td className="break-words p-3 text-[#68675f]">{pick.bestFor}</td><td className="break-words p-3 text-[#68675f]">{comparison?.cushioning || 'Check product specifications'}</td><td className="break-words p-3 text-[#68675f]">{comparison?.widthOptions || 'Check available sizing'}</td><td className="break-words p-3 text-[#68675f]">{comparison?.mainStrength || pick.pros[0]}</td><td className="p-3">{(preview || !pick.cmsManaged || pick.affiliateUrl) && <RetailerAction href={pick.cmsManaged ? pick.affiliateUrl : pick.affiliateUrl || affiliateUrl} preview={preview} className="font-bold text-[#c65325] underline underline-offset-2">See Latest Price</RetailerAction>}</td></tr>
              })}</tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-3 md:hidden">{picks.map((pick) => {
            const comparison = guide.topPicks?.find(({ productSlug }) => productSlug === pick.slug)
            return <article key={pick.slug} className="rounded-xl border border-[#e5e4df] bg-white p-4">
            <h3 className="font-bold"><Link href={reviewHref(pick)} className="hover:text-[#c65325]">{pick.name}</Link></h3>
            <dl className="mt-3 grid grid-cols-[minmax(6.5rem,0.8fr)_minmax(0,1.2fr)] gap-x-3 gap-y-2 text-[15px]"><dt className="font-semibold">Best for</dt><dd className="break-words text-[#68675f]">{pick.bestFor}</dd><dt className="font-semibold">Cushioning</dt><dd className="break-words text-[#68675f]">{comparison?.cushioning || 'Check product specifications'}</dd><dt className="font-semibold">Width options</dt><dd className="break-words text-[#68675f]">{comparison?.widthOptions || 'Check available sizing'}</dd><dt className="font-semibold">Main strength</dt><dd className="break-words text-[#68675f]">{comparison?.mainStrength || pick.pros[0]}</dd></dl>
            {(preview || !pick.cmsManaged || pick.affiliateUrl) && <RetailerAction href={pick.cmsManaged ? pick.affiliateUrl : pick.affiliateUrl || affiliateUrl} preview={preview} className="mt-3 inline-block text-sm font-bold text-[#c65325] underline underline-offset-2">See Latest Price</RetailerAction>}
          </article>})}</div>
        </section>}

        {navItems.length > 0 && <StickyReviewNav items={navItems} />}

          <div className="mx-auto mt-12 grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="min-w-0 space-y-14">
            {show.methodology && <section id="how-we-chose" className="scroll-mt-36">
              <p className="text-xs font-bold tracking-[0.16em] text-[#c65325]">OUR APPROACH</p><h2 className="mt-2 font-sans text-3xl font-black tracking-tight sm:text-4xl">How We Chose These Shoes</h2>
              <ul className="mt-5 space-y-3 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{(guide.howWeChose?.length ? guide.howWeChose : guide.advice).map((item) => <li key={item} className="flex gap-3"><Check aria-hidden="true" className="mt-2 size-4 shrink-0 text-[#46705e]" />{item}</li>)}</ul>
            </section>}

            {picks.length > 0 && <section id="full-reviews" className="scroll-mt-36">
              <p className="text-xs font-bold tracking-[0.16em] text-[#c65325]">THE DETAILS</p><h2 className="mt-2 font-sans text-3xl font-black tracking-tight sm:text-4xl">Full Reviews</h2>
              <div className="mt-6 space-y-5">{picks.map((product, index) => <FullReviewCard key={product.slug} product={product} index={index} preview={preview} />)}</div>
            </section>}

            {show.buying && <section id="buying-guide" className="scroll-mt-36">
              <p className="text-xs font-bold tracking-[0.16em] text-[#c65325]">BUYING GUIDE</p><h2 className="mt-2 font-sans text-3xl font-black tracking-tight sm:text-4xl">What to Look For Before Buying</h2>
              {guide.contentHtml && <div className="wordpress-content mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" dangerouslySetInnerHTML={{ __html: guide.contentHtml }} />}
              {guide.buyingGuideSections?.length ? <div className="mt-5 space-y-6">{guide.buyingGuideSections.map((section) => <section key={section.heading}><h3 className="text-lg font-bold">{section.heading}</h3><div className="mt-2 space-y-3 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>)}</div> : <EditorialRichText value={guide.adviceHtml || guide.advice.join('\n')} plainFormat="list" className="mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" />}
            </section>}

            {show.who && <section aria-labelledby="who-heading">
              <h2 id="who-heading" className="font-sans text-3xl font-black tracking-tight">Who This Guide Is For</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{(guide.whoItsFor || ['Readers comparing shoes for the needs described in this guide.']).map((item) => <li key={item}>{item}</li>)}</ul>
            </section>}

            {show.mistakes && <section aria-labelledby="mistakes-heading">
              <h2 id="mistakes-heading" className="font-sans text-3xl font-black tracking-tight">Common Mistakes to Avoid</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{(guide.mistakesToAvoid || ['Choosing by appearance alone before checking fit and intended use.', 'Assuming price, stock, or product details stay the same over time.']).map((item) => <li key={item}>{item}</li>)}</ul>
            </section>}

            {show.faqs && <section id="faqs" className="scroll-mt-36">
              <h2 className="font-sans text-4xl font-black leading-tight tracking-tight sm:text-5xl">{guide.title} FAQs</h2>
              <div className="mt-4 border-t border-[#d9d8d2]">{guide.faqs.map(({ question, answer, answerHtml }) => <details key={question} className="group border-b border-[#d9d8d2] py-4 sm:py-5"><summary className="flex cursor-pointer list-none items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e86d35] [&::-webkit-details-marker]:hidden"><span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-[#898880] text-[#161616]"><ArrowDown aria-hidden="true" className="size-5 transition-transform duration-200 group-open:rotate-180" /></span><span className="text-base font-black leading-snug sm:text-lg">{question}</span></summary><EditorialRichText value={answerHtml || answer} className="ml-14 mt-4 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" /></details>)}</div>
            </section>}

            {show.verdict && <section aria-labelledby="verdict-heading" className="rounded-2xl bg-[#f3f2ee] p-6 sm:p-8">
              <p className="text-xs font-bold tracking-[0.16em] text-[#c65325]">OUR TAKE</p><h2 id="verdict-heading" className="mt-2 font-sans text-3xl font-black tracking-tight">Final Verdict</h2><EditorialRichText value={guide.finalVerdictHtml || guide.finalVerdict || guide.quickAnswerBody} className="mt-3 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" />
            </section>}
          </div>

          {navItems.length > 0 && <aside className="hidden lg:block">
            <div className="sticky top-36 rounded-xl border border-[#e5e4df] bg-white p-5">
              <p className="text-xs font-bold tracking-[0.14em] text-[#c65325]">IN THIS GUIDE</p>
              <nav aria-label="Buying guide contents" className="mt-4 flex flex-col gap-3 text-[15px] font-semibold text-[#4f4e49]">{navItems.map(([label, href]) => <a key={href} href={href} className="hover:text-[#c65325]">{label}</a>)}</nav>
              <p className="mt-5 border-t border-[#e5e4df] pt-4 text-xs leading-5 text-[#77766f]">Product details and prices can change. Check the retailer listing before you buy.</p>
            </div>
          </aside>}
        </div>
      </article>
      {!preview && <>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleSchema)} />
        {guide.faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(faqSchema)} />}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(breadcrumbSchema)} />
      </>}
    </main>
  )
}
