import Image from 'next/image'
import { ArrowUpRight, Check, X } from 'lucide-react'
import { EditorialRichText } from '@/components/editorial-rich-text'
import { EditorialArticleBody } from '@/components/editorial-article-body'
import { getEditorialArticle } from '@/lib/editorial-article'
import type { ProductPreview } from '@/lib/product-preview'

export function ProductPreviewTemplate({ product, preview = false }: { product: ProductPreview; preview?: boolean }) {
  const review = product.reviewBodyHtml || product.commentaryHtml
  return <article className="mt-9">
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:gap-12">
      <div className="relative aspect-square min-w-0 overflow-hidden rounded-2xl border border-[#e5e4df] bg-[#f6f5f1]">
        {product.image ? <Image src={product.image.src} alt={product.image.alt} fill priority sizes="(max-width: 1023px) min(800px, calc(100vw - 40px)), 580px" className="object-contain p-5" /> : <p className="flex h-full items-center justify-center p-6 text-center text-[#68675f]">Product image not added.</p>}
      </div>
      <div className="min-w-0">
        {product.brand && <p className="text-sm font-bold uppercase tracking-[.12em] text-[#a74520]">{product.brand}</p>}
        <h1 className="mt-3 break-words font-sans text-4xl font-black leading-tight tracking-tight sm:text-5xl">{product.name}</h1>
        {product.descriptionHtml && <EditorialRichText value={product.descriptionHtml} className="mt-5 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]" />}
        <section aria-labelledby="retailers-heading" className="mt-7 rounded-2xl border border-[#e4ddd0] bg-[#f6f3ec] p-5 sm:p-6">
          <h2 id="retailers-heading" className="text-2xl font-black tracking-tight">Where to buy</h2>
          <p className="mt-2 text-base leading-7 text-[#68675f]">Check current prices, sizes and availability with each retailer.</p>
          <div className="mt-5 space-y-3">{product.retailers.map((retailer, index) => {
            const className = `flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-base font-bold transition ${index === 0 ? 'border-[#161616] bg-[#161616] text-white hover:bg-[#a74520]' : 'border-[#c7c3b8] bg-white text-[#161616] hover:border-[#a74520] hover:text-[#a74520]'}`
            const label = <><span className="min-w-0 break-words">{retailer.name === 'Amazon' ? 'Check Price on Amazon' : `Check price at ${retailer.name}`}</span><ArrowUpRight aria-hidden="true" className="size-5 shrink-0" /></>
            return preview ? <button key={index} type="button" disabled aria-describedby="product-preview-note" className={className}>{label}</button> : <a key={retailer.url} href={retailer.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className={className}>{label}</a>
          })}</div>
          {!product.retailers.length && <p className="mt-4 text-base text-[#68675f]">No retailer links have been added for this shoe.</p>}
          <p className="mt-4 text-sm leading-6 text-[#68675f]">Links may be affiliate links. Prices, shipping and returns depend on the retailer and your location.</p>
        </section>
      </div>
    </div>

    <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
      <section aria-labelledby="specifications-heading" className="min-w-0">
        <h2 id="specifications-heading" className="text-3xl font-black tracking-tight">Specifications</h2>
        {product.specs.length ? <div className="mt-5 overflow-hidden rounded-xl border border-[#e5e4df]">
          <table className="w-full table-fixed text-left text-[17px] leading-7 sm:text-[19px]">
            <caption className="sr-only">{product.name} specifications</caption>
            <colgroup><col className="w-[38%]" /><col /></colgroup>
            <thead className="bg-[#f3f2ee]"><tr><th scope="col" className="p-4 font-bold">Specification</th><th scope="col" className="p-4 font-bold">Details</th></tr></thead>
            <tbody className="divide-y divide-[#e5e4df]">{product.specs.map(spec => <tr key={spec.label}><th scope="row" className="break-words px-4 py-4 align-top font-semibold text-[#33322e]">{spec.label}</th><td className="break-words px-4 py-4 align-top font-serif text-[#4f4e49]">{spec.value}</td></tr>)}</tbody>
          </table>
        </div> : <p className="mt-4 text-base text-[#68675f]">Specifications have not been added yet.</p>}
      </section>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
        {[{ title: 'Pros', values: product.pros, Icon: Check, color: 'text-[#46705e]' }, { title: 'Cons', values: product.cons, Icon: X, color: 'text-[#a74520]' }].filter(group => group.values.length).map(({ title, values, Icon, color }) => <section key={title} aria-label={title} className="min-w-0 rounded-xl border border-[#e5e4df] p-5">
          <h2 className={`text-[19px] font-black uppercase tracking-[.1em] ${color}`}>{title}</h2>
          <ul className="mt-4 space-y-3 font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]">{values.map((value, index) => <li key={index} className="flex gap-3"><Icon aria-hidden="true" className={`mt-2 size-4 shrink-0 ${color}`} /><span className="min-w-0 break-words">{value}</span></li>)}</ul>
        </section>)}
      </div>
    </div>
    {review && <section aria-labelledby="product-notes-heading" className="mt-12 max-w-3xl">
      <h2 id="product-notes-heading" className="mb-6 text-3xl font-black tracking-tight">Product review</h2>
      <EditorialArticleBody parts={getEditorialArticle(review, { quickAnswer: true }).parts} />
    </section>}
  </article>
}
