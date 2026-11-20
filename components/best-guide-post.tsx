import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock3 } from 'lucide-react'
import type { BlogPost } from '@/data/blog'
import type { getBestGuideArticle } from '@/lib/best-guide-article'
import { getReadingMinutes } from '@/lib/article-details'

type GuideArticle = NonNullable<ReturnType<typeof getBestGuideArticle>>

/** The preview and published Gutenberg Posts share this exact renderer. */
export function BestGuidePostPage({ post, article, preview = false }: {
  post: BlogPost
  article: GuideArticle
  preview?: boolean
}) {
  const headings = article.headings.filter(heading => heading.level === 2)
  const publishedAt = post.publishedAt || undefined
  const date = (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
  const contents = <ol>{headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.label}</a></li>)}</ol>
  const schema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: post.title,
    description: post.metaDescription || post.excerpt || undefined,
    datePublished: publishedAt, dateModified: post.modifiedAt,
    author: post.author ? { '@type': post.authorType || 'Person', name: post.author } : undefined,
    image: post.featuredImage ? new URL(post.featuredImage.src, 'https://thesolemart.com').href : undefined,
    mainEntityOfPage: `https://thesolemart.com/blog/${encodeURIComponent(post.slug)}`,
    publisher: { '@type': 'Organization', name: 'SOLEMART' },
  }
  return <main id="top" className="best-guide-page">
    <nav className="sm-guide-breadcrumb" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><Link href="/blog">Shoe guides</Link></nav>
    <article>
      <header className="sm-guide-header">
        <p className="sm-guide-kicker"><span aria-hidden="true" />The SoleMart shortlist</p>
        <h1>{post.title}</h1>
        <div className="sm-guide-byline">
          {post.author && <span>By <strong>{post.author}</strong></span>}
          <span><Clock3 size={14} aria-hidden="true" />{getReadingMinutes(post.contentHtml || '')} min read</span>
          {publishedAt && <time dateTime={publishedAt}>Published {date(publishedAt)}</time>}
          {post.modifiedAt && post.modifiedAt !== publishedAt && <time dateTime={post.modifiedAt}>Updated {date(post.modifiedAt)}</time>}
        </div>
        {post.featuredImage && <figure className="sm-guide-featured"><Image src={post.featuredImage.src} alt={post.featuredImage.alt} width={post.featuredImage.width} height={post.featuredImage.height} priority sizes="(max-width: 900px) 100vw, 900px" />{post.featuredImage.caption && <figcaption>{post.featuredImage.caption}</figcaption>}</figure>}
      </header>
      <div className="sm-guide-layout">
        {headings.length > 0 && <>
          <aside className="sm-guide-sidebar"><nav aria-label="Guide contents"><p id="best-guide-contents">In this guide</p>{contents}<a href="#top" className="sm-back-top">Back to top ↑</a></nav></aside>
          <details className="sm-guide-mobile-contents"><summary>On this page <span aria-hidden="true">＋</span></summary><nav aria-label="Guide contents">{contents}</nav></details>
        </>}
        <div className="sm-guide-main">
          <div className="sm-guide-content" dangerouslySetInnerHTML={{ __html: article.html }} />
          <Link className="sm-more-guides" href="/blog">Explore more shoe guides <ArrowRight size={17} aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
    {!preview && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />}
  </main>
}
