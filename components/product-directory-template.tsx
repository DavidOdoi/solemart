import Image from 'next/image'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import type { ProductPreview } from '@/lib/product-preview'
import { EditorialRichText } from '@/components/editorial-rich-text'
import { EditorialArticleBody } from '@/components/editorial-article-body'
import { getEditorialArticle, type ArticlePart } from '@/lib/editorial-article'

/** Different product reviews may all contain headings such as Fit or FAQs. */
function scopedReview(html: string, prefix: string): ArticlePart[] {
  const article = getEditorialArticle(html, { quickAnswer: true })
  const ids = new Set(article.headings.map(heading => heading.id))
  const scoped = (value: string) => value.replace(/\bid="([^"]+)"/g, (_, id: string) => `id="${prefix}-${id}"`)
    .replace(/href="#([^"]+)"/g, (original, id: string) => ids.has(id) ? `href="#${prefix}-${id}"` : original)
  return article.parts.map(part => {
    if (part.kind === 'html') return { ...part, html: scoped(part.html) }
    const heading = { ...part.heading, id: `${prefix}-${part.heading.id}` }
    if (part.kind === 'quick-answer') return { ...part, heading, html: scoped(part.html) }
    return { ...part, heading, introductionHtml: scoped(part.introductionHtml), faqs: part.faqs.map(faq => ({ ...faq, id: `${prefix}-${faq.id}`, answerHtml: scoped(faq.answerHtml) })) }
  })
}

export function ProductDirectoryTemplate({ products }: { products: ProductPreview[] }) {
  if (!products.length) return <section className="mt-8 rounded-xl border border-[#e5e4df] p-7"><h2 className="text-2xl font-black">No matching products</h2><p className="mt-3 text-base leading-7 text-[#68675f]">There are no published Shoe records matching this search. No sample products have been substituted.</p></section>
  const compared = products.slice(0, 4)
  const labels = [...new Map(compared.flatMap(product => product.specs.map(spec => [spec.label.toLocaleLowerCase(), spec.label] as const))).values()].slice(0, 12)
  return <>
    <section id="products" aria-label="Product directory" className="mt-9 scroll-mt-44">
      <div className="grid gap-x-1 gap-y-9 sm:grid-cols-2 xl:grid-cols-4">{products.map((product, index) => <article key={product.slug} className="min-w-0">
        <a href={`#review-${index + 1}`} className="group relative block aspect-square overflow-hidden bg-[#f2f2f0] focus-visible:outline-2 focus-visible:outline-[#c65325]">
          {product.image ? <Image src={product.image.src} alt={product.image.alt} fill priority={index === 0} sizes="(max-width: 639px) calc(100vw - 40px), (max-width: 1279px) 46vw, 300px" className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none" /> : <span className="flex h-full items-center justify-center p-5 text-center text-sm text-[#68675f]">Product image not supplied</span>}
        </a>
        <div className="px-1 pt-4">
          {product.brand && <p className="text-sm text-[#68675f]">{product.brand}</p>}
          <h2 className="mt-1 text-lg font-semibold leading-7"><a href={`#review-${index + 1}`} className="hover:text-[#a74520]">{product.name}</a></h2>
          <a href={`#review-${index + 1}`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-base font-bold underline decoration-[#bbb6ab] underline-offset-4">{product.reviewBodyHtml || product.commentaryHtml ? 'Read product review' : 'View product details'} <ArrowDown aria-hidden="true" className="size-4" /></a>
          {product.retailers[0] && <a href={product.retailers[0].url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-1 flex min-h-11 items-center gap-2 text-base text-[#a74520] underline underline-offset-4">Check current price <ArrowUpRight aria-hidden="true" className="size-4" /></a>}
        </div>
      </article>)}</div>
    </section>

    {labels.length > 0 && <section aria-labelledby="directory-comparison-heading" className="mt-14">
      <h2 id="directory-comparison-heading" className="text-3xl font-black tracking-tight">Compare the product details</h2>
      {products.length > 4 && <p className="mt-3 text-base text-[#68675f]">This table compares the first four products displayed above.</p>}
      <div role="region" aria-label="Product comparison table" tabIndex={0} className="mt-5 overflow-x-auto rounded-xl border border-[#e5e4df] focus-visible:outline-2 focus-visible:outline-[#c65325]">
        <table className="w-full table-fixed text-left text-base leading-7" style={{ minWidth: 180 + compared.length * 220 }}>
          <caption className="sr-only">Specifications supplied in WordPress for the displayed products</caption>
          <colgroup><col style={{ width: 180 }} />{compared.map(product => <col key={product.slug} />)}</colgroup>
          <thead className="bg-[#f3f2ee]"><tr><th scope="col" className="p-4">Specification</th>{compared.map(product => <th key={product.slug} scope="col" className="p-4">{product.name}</th>)}</tr></thead>
          <tbody className="divide-y divide-[#e5e4df]">{labels.map(label => <tr key={label}><th scope="row" className="break-words p-4 align-top">{label}</th>{compared.map(product => <td key={product.slug} className="break-words p-4 align-top text-[#4f4e49]">{product.specs.find(spec => spec.label.toLocaleLowerCase() === label.toLocaleLowerCase())?.value || 'Not supplied'}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </section>}

    <section aria-labelledby="directory-reviews-heading" className="mt-16">
      <h2 id="directory-reviews-heading" className="font-sans text-4xl font-black tracking-tight sm:text-5xl">Product reviews</h2>
      <div className="mt-8 space-y-16">{products.map((product, index) => {
        const id = `review-${index + 1}`
        const review = product.reviewBodyHtml || product.commentaryHtml
        return <article key={product.slug} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-44 border-t border-[#d9d8d2] pt-7">
          <div className="flex flex-wrap items-center justify-between gap-4"><h3 id={`${id}-title`} className="font-sans text-3xl font-black tracking-tight sm:text-4xl">{product.name}</h3><a href="#products" className="text-sm underline underline-offset-4">Back to products</a></div>
          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              {review ? <EditorialArticleBody parts={scopedReview(review, id)} /> : <p className="rounded-lg border border-[#e4ddd0] bg-[#faf9f6] p-5 text-base leading-7 text-[#68675f]">A substantive review has not been supplied for this product. Add sourced analysis before publishing this page.</p>}
              {!product.reviewBodyHtml && product.descriptionHtml && !product.commentaryHtml && <EditorialRichText value={product.descriptionHtml} className="mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" />}
              {(product.pros.length > 0 || product.cons.length > 0) && <div className="mt-8 grid gap-4 sm:grid-cols-2">{[{title:'Pros',items:product.pros},{title:'Cons',items:product.cons}].filter(group=>group.items.length).map(group=><section key={group.title} className="rounded-xl border border-[#e5e4df] p-5"><h4 className="text-lg font-black">{group.title}</h4><ul className="mt-3 list-disc space-y-2 pl-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{group.items.map((item,i)=><li key={i}>{item}</li>)}</ul></section>)}</div>}
              {product.specs.length > 0 && <details aria-label={`${product.name} full specifications`} className="mt-7 overflow-hidden rounded-xl border border-[#e5e4df]"><summary className="cursor-pointer bg-[#f3f2ee] p-4 text-lg font-bold">Full specifications</summary><table className="w-full table-fixed text-left text-[17px] leading-7 sm:text-[19px]"><caption className="sr-only">{product.name} complete specifications</caption><tbody className="divide-y divide-[#e5e4df]">{product.specs.map(spec=><tr key={spec.label}><th scope="row" className="w-[38%] break-words p-4 align-top font-semibold">{spec.label}</th><td className="break-words p-4 align-top font-serif text-[#4f4e49]">{spec.value}</td></tr>)}</tbody></table></details>}
            </div>
            <aside aria-label={`${product.name} retailer options`} className="min-w-0 rounded-xl border border-[#e5e4df] bg-[#faf9f6] p-5 lg:sticky lg:top-40">
              <h4 className="text-xl font-black">Retailer options</h4>
              <div className="mt-4 space-y-3">{product.retailers.map(retailer=><a key={retailer.url} href={retailer.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-[#c7c3b8] bg-white p-3 text-base font-bold hover:border-[#a74520]"><span className="min-w-0 break-words">{retailer.name}</span><ArrowUpRight aria-hidden="true" className="size-4 shrink-0" /></a>)}</div>
              {!product.retailers.length && <p className="mt-3 text-base leading-7 text-[#68675f]">No retailer destination has been supplied.</p>}
              <p className="mt-4 text-sm leading-6 text-[#68675f]">Check current availability, delivery and return terms with the retailer. Links may be affiliate links.</p>
            </aside>
          </div>
        </article>
      })}</div>
    </section>
  </>
}
