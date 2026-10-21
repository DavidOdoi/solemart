import Image from 'next/image'
import Link from 'next/link'
import type { BlogPost } from '@/data/blog'
import { Breadcrumbs } from '@/components/affiliate-site'

export function WordPressBuyingGuide({ guide }: { guide: BlogPost }) {
  const url = `https://thesolemart.com/best-shoes/${encodeURIComponent(guide.slug)}`
  const schema = [
    { '@context': 'https://schema.org', '@type': 'Article', headline: guide.title,
      description: guide.excerpt || undefined, datePublished: guide.publishedAt,
      dateModified: guide.modifiedAt, image: guide.featuredImage?.src,
      mainEntityOfPage: url, publisher: { '@type': 'Organization', name: 'SOLEMART' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thesolemart.com/' },
      { '@type': 'ListItem', position: 2, name: 'Buying Guides', item: 'https://thesolemart.com/#guides' },
      { '@type': 'ListItem', position: 3, name: guide.title, item: url },
    ] },
  ]
  return (
    <main id="top" className="mx-auto max-w-7xl px-5 py-10 sm:py-14 lg:px-8">
      <Breadcrumbs items={[{ label: 'Buying Guides', href: '/#guides' }, { label: guide.title }]} />
      <article className="mx-auto max-w-4xl">
        <header>
          <p className="text-xs font-bold tracking-[0.18em] text-[#c65325]">BUYING GUIDE</p>
          <h1 className="mt-3 font-sans text-4xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl">{guide.title}</h1>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#68675f]">
            {guide.publishedAt && <time dateTime={guide.publishedAt}>{guide.date}</time>}
            {guide.modifiedAt && guide.modifiedAt !== guide.publishedAt && <time dateTime={guide.modifiedAt}>Updated {new Date(guide.modifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</time>}
          </div>
          <p className="mt-5 border-l-2 border-[#d9d8d2] pl-4 text-sm leading-6 text-[#68675f]">SOLEMART may earn a commission from qualifying purchases through links on this page. <Link href="/affiliate-disclosure" className="underline underline-offset-4">Read our affiliate disclosure</Link>.</p>
          {guide.featuredImage && <Image src={guide.featuredImage.src} alt={guide.featuredImage.alt} width={guide.featuredImage.width} height={guide.featuredImage.height} priority sizes="(max-width: 896px) 100vw, 896px" className="mt-8 h-auto w-full rounded-xl" />}
        </header>
        <div className="wordpress-content mt-10 text-lg leading-8 text-[#4f4e49]" dangerouslySetInnerHTML={{ __html: guide.contentHtml || '' }} />
      </article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    </main>
  )
}
