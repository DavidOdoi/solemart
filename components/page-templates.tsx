import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock3 } from 'lucide-react'
import type { BlogPost } from '@/data/blog'
import type { Category } from '@/data/categories'
import type { Comparison } from '@/data/comparisons'
import type { Guide } from '@/data/guides'
import type { Product } from '@/data/products'
import { Breadcrumbs, CategoryLinks, ComparisonCard, FAQSection, GuideCard, ProductCard, RelatedGuides, SectionHeading } from '@/components/affiliate-site'
import { comparisons as allComparisons } from '@/data/comparisons'
import { guides as allGuides } from '@/data/guides'
import { products as allProducts } from '@/data/products'
import { affiliateUrl } from '@/lib/content'
import { ArticleAuthor } from '@/components/article-author'
import { ArticleContents } from '@/components/article-contents'
import { getArticleContents, getReadingMinutes } from '@/lib/article-details'
import { ReviewGuideTemplate, SpecsTable } from '@/components/review-guide-template'

const pageClass = 'mx-auto max-w-7xl px-5 py-12 sm:py-16 lg:px-8'

export function CategoryPage({ category }: { category: Category }) {
  const relatedGuides = category.guideSlugs.map((slug) => allGuides.find((guide) => guide.slug === slug)).filter((guide): guide is Guide => Boolean(guide))
  const editorPicks = category.productSlugs.map((slug) => allProducts.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product))
  const relatedComparisons = category.comparisonSlugs.map((slug) => allComparisons.find((comparison) => comparison.slug === slug)).filter((comparison): comparison is Comparison => Boolean(comparison))
  return (
    <main id="top" className={pageClass}>
      <Breadcrumbs items={[{ label: category.title }]} />
      <header className="max-w-3xl">
        <p className="text-xs font-bold tracking-[0.18em] text-[#e86d35]">SOLEMART SHOE GUIDES</p>
        <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">{category.title}: Guides, Reviews & Comparisons</h1>
        <p className="mt-5 text-lg leading-8 text-[#68675f]">{category.intro}</p>
      </header>
      <section className="mt-16">
        <SectionHeading eyebrow="START YOUR RESEARCH" title="Popular buying guides" />
        <div className="grid gap-5 lg:grid-cols-3">{relatedGuides.map((guide) => <GuideCard key={guide.slug} guide={guide} />)}</div>
      </section>
      <section className="mt-16">
        <SectionHeading eyebrow="EDITOR PICKS" title="Shoes to compare" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{editorPicks.map((product) => <ProductCard key={product.slug} product={product} />)}</div>
      </section>
      <section className="mt-16">
        <SectionHeading eyebrow="MAKE A COMPARISON" title="Compare your options" />
        <div className="grid gap-4 md:grid-cols-2">{relatedComparisons.map((comparison, index) => <ComparisonCard key={comparison.slug} comparison={comparison} index={index} />)}</div>
      </section>
      <section className="mt-16"><h2 className="font-serif text-3xl">Explore shoe categories</h2><CategoryLinks /></section>
      <FAQSection faqs={category.faqs} />
    </main>
  )
}

export function GuidePage({ guide }: { guide: Guide }) {
  const recommended = guide.productSlugs.map((slug) => allProducts.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product))
  return <ReviewGuideTemplate guide={guide} products={recommended} />
}

export function ReviewPage({ product }: { product: Product }) {
  const author = product.author || 'SOLEMART Editorial Team'
  const reviewedBy = product.reviewedBy || 'Footwear Research Desk'
  const updatedAt = product.updatedAt || '2026-10-10'
  const disclosure = product.disclosure || 'As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.'
  return (
    <main id="top" className={pageClass}>
      <Breadcrumbs items={[{ label: 'Reviews', href: '/' }, { label: product.name }]} />
      <article className="mx-auto max-w-5xl">
        <header className="grid gap-8 md:grid-cols-2 md:items-center">
          <div><p className="text-xs font-bold tracking-[0.18em] text-[#e86d35]">SHOE REVIEW</p><h1 className="mt-4 font-sans text-4xl font-black leading-tight tracking-[-0.04em] sm:text-6xl">{product.name} Review</h1><p className="mt-5 font-serif text-lg leading-8 text-[#4f4e49]">{product.description}</p><p className="mt-4 text-sm font-semibold text-[#e86d35]">Best for: {product.bestFor}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#68675f]"><span>By <strong className="text-[#161616]">{author}</strong></span><span>Reviewed by <strong className="text-[#161616]">{reviewedBy}</strong></span><time dateTime={updatedAt}>Updated <strong className="text-[#161616]">{new Date(`${updatedAt}T12:00:00`).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</strong></time></div><a href={product.affiliateUrl || affiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#e86d35] px-5 py-3 text-sm font-bold text-white hover:bg-[#d95d28]">Check Price on Amazon <ArrowRight aria-hidden="true" className="size-4" /></a><p className="mt-3 max-w-lg border-l-2 border-[#d9d8d2] pl-3 text-xs leading-5 text-[#68675f]">{disclosure}</p></div>
          <div className="overflow-hidden rounded-3xl bg-[#f0eee9]"><Image src={product.image} alt={product.imageAlt} width={900} height={900} sizes="(max-width: 768px) 100vw, 50vw" className="aspect-square w-full object-cover mix-blend-multiply" /></div>
        </header>
        <nav aria-label="Review contents" className="sticky top-[112px] z-30 -mx-5 mt-10 overflow-x-auto border-y border-[#e5e4df] bg-[#fafaf8]/95 px-5 backdrop-blur md:top-[76px] lg:mx-0 lg:rounded-xl lg:border"><ul className="flex w-max gap-6 py-3 text-sm font-semibold"><li><a href="#review-notes" className="hover:text-[#e86d35]">Full Review</a></li><li><a href="#pros-cons" className="hover:text-[#e86d35]">Pros & Cons</a></li><li><a href="#specs" className="hover:text-[#e86d35]">Specs</a></li><li><a href="#related-guides" className="hover:text-[#e86d35]">Related Guides</a></li></ul></nav>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section id="pros-cons" className="scroll-mt-36 rounded-2xl border border-[#e5e4df] bg-white p-6"><h2 className="font-sans text-2xl font-black">Pros & cons</h2><p className="mt-2 text-sm leading-5 text-[#77766f]">Sample comparison points, not hands-on test results.</p><h3 className="mt-4 text-sm font-black uppercase tracking-[0.12em] text-[#46705e]">Pros</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#68675f]">{product.pros.map((pro) => <li key={pro}>{pro}</li>)}</ul><h3 className="mt-5 text-sm font-black uppercase tracking-[0.12em] text-[#b64c1e]">Cons</h3><ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-[#68675f]">{product.cons.map((con) => <li key={con}>{con}</li>)}</ul></section>
          <section id="specs" className="scroll-mt-36 rounded-2xl border border-[#e5e4df] bg-white p-6"><h2 className="mb-4 font-sans text-2xl font-black">Key specs</h2><SpecsTable specs={product.specs} /></section>
        </div>
        <section id="review-notes" className="mt-12 scroll-mt-36"><h2 className="font-serif text-3xl">Our review notes</h2><div className="mt-4 space-y-4 text-sm leading-7 text-[#68675f]">{product.review.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="mt-4 text-sm leading-5 text-[#77766f]">This is a sample review profile, not a report of hands-on testing. We do not publish product ratings or review counts without supporting data.</p></section>
        <div id="related-guides" className="scroll-mt-36"><RelatedGuides slugs={allGuides.filter((guide) => guide.productSlugs.includes(product.slug)).map((guide) => guide.slug)} /></div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: `${product.name} Review`, description: product.metaDescription || product.description, dateModified: updatedAt, author: { '@type': 'Organization', name: author }, publisher: { '@type': 'Organization', name: 'SOLEMART' } }).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: product.name, image: product.image, description: product.description, review: { '@type': 'Review', author: { '@type': 'Organization', name: author }, reviewBody: product.review.join(' ') } }).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://solemart.com/' }, { '@type': 'ListItem', position: 2, name: 'Reviews', item: 'https://solemart.com/reviews' }, { '@type': 'ListItem', position: 3, name: product.name }] }).replace(/</g, '\\u003c') }} />
    </main>
  )
}

export function ComparisonPage({ comparison }: { comparison: Comparison }) {
  const recommended = comparison.productSlugs.map((slug) => allProducts.find((product) => product.slug === slug)).filter((product): product is Product => Boolean(product))
  return (
    <main id="top" className={pageClass}>
      <Breadcrumbs items={[{ label: 'Comparisons', href: '/' }, { label: comparison.title }]} />
      <article className="mx-auto max-w-5xl">
        <header className="max-w-3xl"><p className="text-xs font-bold tracking-[0.18em] text-[#e86d35]">SHOE COMPARISON</p><h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-6xl">{comparison.title}</h1><p className="mt-5 text-lg leading-8 text-[#68675f]">{comparison.excerpt}</p></header>
        <section className="mt-8 rounded-2xl border border-[#e5e4df] bg-white p-6 sm:p-8"><h2 className="text-sm font-bold uppercase tracking-[0.14em] text-[#e86d35]">The short answer</h2><p className="mt-3 text-base leading-7">{comparison.shortAnswer}</p></section>
        <section className="mt-12"><h2 className="font-serif text-3xl">Compare the options</h2><div className="mt-5 overflow-x-auto rounded-xl border border-[#e5e4df] bg-white"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-[#f3f2ee]"><tr><th className="p-4">What to compare</th><th className="p-4">{comparison.left.name}</th><th className="p-4">{comparison.right.name}</th></tr></thead><tbody className="divide-y divide-[#e5e4df]"><tr><th scope="row" className="p-4">A good fit ifÃ¢â‚¬Â¦</th><td className="p-4 text-[#68675f]">{comparison.left.chooseIf}</td><td className="p-4 text-[#68675f]">{comparison.right.chooseIf}</td></tr><tr><th scope="row" className="p-4">Consider</th><td className="p-4 text-[#68675f]">{comparison.left.strengths.join('; ')}</td><td className="p-4 text-[#68675f]">{comparison.right.strengths.join('; ')}</td></tr></tbody></table></div></section>
        <section className="mt-12 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-[#f3f2ee] p-6"><h2 className="font-serif text-2xl">Choose {comparison.left.name} ifÃ¢â‚¬Â¦</h2><p className="mt-3 text-sm leading-6 text-[#68675f]">{comparison.left.chooseIf}</p></div><div className="rounded-2xl bg-[#f3f2ee] p-6"><h2 className="font-serif text-2xl">Choose {comparison.right.name} ifÃ¢â‚¬Â¦</h2><p className="mt-3 text-sm leading-6 text-[#68675f]">{comparison.right.chooseIf}</p></div></section>
        <section className="mt-12"><SectionHeading eyebrow="PRODUCTS TO COMPARE" title="Related shoe profiles" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recommended.map((product) => <ProductCard key={product.slug} product={product} />)}</div></section>
        <RelatedGuides slugs={comparison.relatedGuideSlugs} />
      </article>
    </main>
  )
}

export function BlogPostPage({ post }: { post: BlogPost }) {
  const publishedAt = post.publishedAt || (post.date ? new Date(post.date).toISOString() : undefined)
  const url = `https://thesolemart.com/blog/${encodeURIComponent(post.slug)}`
  const contents = getArticleContents(post.contentHtml || '')
  const readingMinutes = getReadingMinutes(post.contentHtml ?? [post.excerpt, ...post.paragraphs].join(' '))
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: publishedAt,
    dateModified: post.modifiedAt,
    author: post.author ? { '@type': 'Person', '@id': `${url}#about-author`, name: post.author, url: `${url}#about-author`, description: post.authorProfile?.bio, image: post.authorProfile?.avatarUrl } : undefined,
    image: post.featuredImage?.src,
    mainEntityOfPage: url,
    publisher: { '@type': 'Organization', name: 'SOLEMART' },
  }
  return (
    <main id="top" className={pageClass}>
      <Breadcrumbs variant="editorial" items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]} />
      <article className="mx-auto max-w-6xl">
        <header>
          <h1 className="font-serif text-4xl tracking-tight sm:text-6xl">{post.title}</h1>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-[#e9e3d9] bg-[#f6f2eb] px-5 py-4 text-base leading-7 text-[#4f4e49]">
            {post.author && <span>Author: <a href="#about-author" rel="author" className="font-semibold text-[#161616] underline decoration-[#aaa292] underline-offset-4 hover:text-[#c65325]">{post.author}</a></span>}
            <span className="inline-flex items-center gap-2" title="Estimated reading time"><Clock3 aria-hidden="true" className="size-4" />{readingMinutes} min read</span>
            {publishedAt && <span>Published <time dateTime={publishedAt}>{post.date}</time></span>}
            {post.modifiedAt && post.modifiedAt !== publishedAt && <span>Updated <time dateTime={post.modifiedAt}>{new Date(post.modifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time></span>}
          </div>
          {post.excerpt && post.contentHtml === undefined && <p className="mt-5 text-lg leading-8 text-[#68675f]">{post.excerpt}</p>}
        </header>
        <div className={`mt-10 grid items-start gap-10 ${post.author ? 'lg:grid-cols-[minmax(0,1fr)_280px] xl:gap-16' : 'max-w-3xl'}`}>
          <div className="min-w-0">
            {post.featuredImage && <div className="relative mb-8 aspect-video w-full max-w-[800px] overflow-hidden rounded-xl bg-[#f3f2ee]">
              <Image
                src={post.featuredImage.src} alt={post.featuredImage.alt} fill priority
                sizes={post.author ? '(max-width: 1023px) min(800px, calc(100vw - 40px)), (max-width: 1279px) calc(100vw - 384px), 800px' : '(max-width: 807px) calc(100vw - 40px), 768px'}
                className="object-cover object-center"
              />
            </div>}
            <ArticleContents headings={contents.headings} />
            {post.contentHtml !== undefined
              ? <div className="wordpress-content text-base leading-8 text-[#4f4e49] sm:text-lg [&_h2]:scroll-mt-48 [&_h3]:scroll-mt-48" dangerouslySetInnerHTML={{ __html: contents.html }} />
              : <div className="space-y-5 text-base leading-8 text-[#4f4e49]">{post.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>}
            <Link href="/blog" className="mt-10 inline-flex items-center gap-2 font-semibold hover:text-[#e86d35]">More shoe advice <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </div>
          <ArticleAuthor post={post} url={url} />
        </div>
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </main>
  )
}
