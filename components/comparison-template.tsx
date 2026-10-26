import Image from 'next/image'
import Link from 'next/link'
import { ArrowDown, ArrowRight, Check, Clock3 } from 'lucide-react'
import type { ComparisonTemplateContent } from '@/data/comparison-template'
import { Breadcrumbs } from '@/components/affiliate-site'
import { ArticleAuthor } from '@/components/article-author'
import { EditorialRichText } from '@/components/editorial-rich-text'
import { getReadingMinutes } from '@/lib/article-details'
import { comparisonArticle, comparisonGuideHref } from '@/lib/comparison-article'
import { editorialPlainText } from '@/lib/cms-rich-text'

const bodyType = 'font-serif text-[17px] leading-8 text-[#4f4e49] sm:text-[19px]'
const dateLabel = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export function ComparisonTemplate({ content, preview = false }: { content: ComparisonTemplateContent; preview?: boolean }) {
  const { post, fields } = content
  const article = comparisonArticle(post.contentHtml || '')
  const readingMinutes = getReadingMinutes([post.excerpt, fields.quickAnswer, fields.leftChooseIf, fields.rightChooseIf, post.contentHtml || '', fields.finalVerdict].join(' '))
  const url = preview ? 'https://thesolemart.com/template-preview/comparison' : `https://thesolemart.com/comparisons/${encodeURIComponent(post.slug)}`
  const options = [
    { name: fields.leftName, reason: fields.leftChooseIf, href: comparisonGuideHref(fields.leftGuideUrl), id: 'comparison-option-a' },
    { name: fields.rightName, reason: fields.rightChooseIf, href: comparisonGuideHref(fields.rightGuideUrl), id: 'comparison-option-b' },
  ]
  const contents = [
    { label: 'The quick answer', id: 'comparison-answer' },
    ...article.headings.filter(heading => heading.level === 2),
    ...(fields.finalVerdict ? [{ label: 'Which should you buy?', id: 'comparison-verdict' }] : []),
  ]
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: post.title,
    description: post.excerpt, mainEntityOfPage: url,
    datePublished: post.publishedAt, dateModified: post.modifiedAt,
    author: post.author ? { '@type': 'Person', name: post.author, url: `${url}#about-author` } : undefined,
    image: post.featuredImage?.src,
    publisher: { '@type': 'Organization', name: 'SOLEMART' },
    articleBody: editorialPlainText([fields.quickAnswer, post.contentHtml, fields.finalVerdict].join('\n')),
  }
  return (
    <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <Breadcrumbs items={[{ label: 'Comparisons', href: '/#comparisons' }, { label: post.title }]} showCurrentPage={false} />
      <article className="mx-auto max-w-6xl">
        <header className="mx-auto max-w-4xl">
          <h1 className="font-sans text-4xl font-black leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-6xl lg:text-7xl">{post.title}</h1>
          {post.excerpt && <p className={`mt-5 max-w-3xl ${bodyType}`}>{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm leading-6 text-[#68675f]">
            {post.author && <span>By <a href="#about-author" rel="author" className="font-bold text-[#161616] underline decoration-[#c4bfb5] underline-offset-4">{post.author}</a></span>}
            <span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4" />{readingMinutes} min read</span>
            {post.publishedAt && <span>Published <time dateTime={post.publishedAt}>{dateLabel(post.publishedAt)}</time></span>}
            {post.modifiedAt && post.modifiedAt !== post.publishedAt && <span>Updated <time dateTime={post.modifiedAt}>{dateLabel(post.modifiedAt)}</time></span>}
          </div>
          {post.featuredImage && <div className="relative mx-auto mt-8 aspect-video w-full max-w-[800px] overflow-hidden rounded-xl bg-[#f3f2ee]">
            <Image src={post.featuredImage.src} alt={post.featuredImage.alt} fill priority sizes="(max-width: 840px) calc(100vw - 40px), 800px" className="object-cover" />
          </div>}
        </header>

        <section id="comparison-answer" aria-labelledby="comparison-answer-heading" className="mx-auto mt-9 max-w-4xl scroll-mt-48 overflow-hidden rounded-2xl border border-[#e5e0d5] bg-[#f6f3ec]">
          <div className="border-t-4 border-[#e86d35] p-5 sm:p-8">
            <h2 id="comparison-answer-heading" className="font-sans text-2xl font-black tracking-tight sm:text-3xl">The quick answer</h2>
            <EditorialRichText value={fields.quickAnswer} className={`mt-4 ${bodyType}`} />
            {fields.finalVerdict && <a href="#comparison-verdict" className="mt-5 inline-flex min-h-11 items-center gap-2 text-base font-bold text-[#a74520] underline decoration-[#dcb69f] underline-offset-4">Help me choose <ArrowDown aria-hidden="true" className="size-4" /></a>}
          </div>
        </section>

        <section aria-label="Choose by your main use" className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
          {options.map((option, index) => <section key={option.id} id={option.id} aria-labelledby={`${option.id}-heading`} className={`flex min-w-0 scroll-mt-48 flex-col rounded-2xl border p-5 sm:p-7 ${index === 0 ? 'border-[#e4d3c5] bg-[#fcf7f2]' : 'border-[#d5dfd6] bg-[#f4f7f3]'}`}>
            <h2 id={`${option.id}-heading`} className="font-sans text-2xl font-black tracking-tight sm:text-3xl">{option.name}</h2>
            <div className={`mt-4 flex gap-3 ${bodyType}`}><Check aria-hidden="true" className="mt-2 size-5 shrink-0 text-[#46705e]" /><p>{option.reason}</p></div>
            {option.href && <div className="mt-auto pt-6"><Link href={option.href} className="inline-flex min-h-12 w-full items-center justify-between gap-3 rounded-lg bg-[#161616] px-4 py-3 text-base font-bold text-white hover:bg-[#a74520]">Explore {option.name.toLowerCase()} <ArrowRight aria-hidden="true" className="size-5 shrink-0" /></Link></div>}
          </section>)}
        </section>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_248px] xl:gap-14">
          <div className="min-w-0">
            <details open className="mb-9 rounded-xl border border-[#e5e4df] bg-[#faf9f6] p-5 lg:hidden">
              <summary className="cursor-pointer text-base font-bold">On this page</summary>
              <nav aria-label="Comparison contents" className="mt-4"><ul className="space-y-3">{contents.map(item => <li key={item.id}><a href={`#${item.id}`} className="text-base leading-6 underline decoration-[#c9c7bf] underline-offset-4 hover:text-[#a74520]">{item.label}</a></li>)}</ul></nav>
            </details>
            {article.html && <div className={`wordpress-content comparison-article ${bodyType}`} dangerouslySetInnerHTML={{ __html: article.html }} />}
            {fields.finalVerdict && <section id="comparison-verdict" aria-labelledby="comparison-verdict-heading" className="mt-10 scroll-mt-48 rounded-2xl border border-[#e4ddd0] bg-[#f3f2ee] p-5 sm:p-8">
              <h2 id="comparison-verdict-heading" className="font-sans text-3xl font-black tracking-tight sm:text-4xl">Which should you buy?</h2>
              <EditorialRichText value={fields.finalVerdict} className={`mt-4 ${bodyType}`} />
              {options.some(option => option.href) && <div className="mt-6 flex flex-wrap gap-3">{options.filter(option => option.href).map(option => <Link key={option.id} href={option.href!} className="inline-flex min-h-12 items-center gap-3 rounded-lg border border-[#161616] bg-white px-4 py-3 text-base font-bold text-[#161616] hover:bg-[#161616] hover:text-white">Explore {option.name.toLowerCase()} <ArrowRight aria-hidden="true" className="size-4" /></Link>)}</div>}
            </section>}
            {post.author && <div className="mt-10 border-t border-[#e5e4df] pt-7"><ArticleAuthor post={post} url={url} /></div>}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-40 rounded-xl border border-[#e5e4df] p-5">
              <p className="text-lg font-bold">On this page</p>
              <nav aria-label="Comparison contents" className="mt-4"><ul className="space-y-3">{contents.map(item => <li key={item.id}><a href={`#${item.id}`} className="block text-base leading-6 text-[#4f4e49] hover:text-[#a74520]">{item.label}</a></li>)}</ul></nav>
              <Link href="/how-we-review" className="mt-5 inline-flex items-center gap-2 border-t border-[#e5e4df] pt-4 text-sm font-semibold underline decoration-[#c9c7bf] underline-offset-4">How we review <ArrowRight aria-hidden="true" className="size-4" /></Link>
            </div>
          </aside>
        </div>
      </article>
      {!preview && <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thesolemart.com/' },
          { '@type': 'ListItem', position: 2, name: 'Comparisons', item: 'https://thesolemart.com/#comparisons' },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ] }).replace(/</g, '\\u003c') }} />
      </>}
    </main>
  )
}
