import type { MetadataRoute } from 'next'
import { blogPosts } from '../data/blog.ts'
import { categories } from '../data/categories.ts'
import { comparisons } from '../data/comparisons.ts'
import { guides } from '../data/guides.ts'
import { products } from '../data/products.ts'
import { getWordPressSitemapArticles } from '../lib/wordpress.ts'

export const revalidate = 60

const origin = 'https://thesolemart.com'

// Only existing, indexable routes belong here. Brand detail pages and design
// previews are noindex; search results and archive query strings are excluded.
const staticPaths = [
  '/',
  '/about',
  '/affiliate-disclosure',
  '/blog',
  '/brands',
  '/contact',
  '/deals',
  '/editorial-policy',
  '/how-we-review',
  '/privacy-policy',
  '/terms-of-service',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getWordPressSitemapArticles()
  const paths = [
    ...staticPaths,
    ...categories.map(({ slug }) => `/${encodeURIComponent(slug)}`),
    ...products.map(({ slug }) => `/reviews/${encodeURIComponent(slug)}`),
    ...comparisons.map(({ slug }) => `/comparisons/${encodeURIComponent(slug)}`),
    // Blog routes retain their local fallback even with WordPress configured.
    ...blogPosts.map(({ slug }) => `/blog/${encodeURIComponent(slug)}`),
    // Buying-guide fallbacks only exist when WordPress is not configured.
    ...(articles === null ? guides.map(({ slug }) => `/best-shoes/${encodeURIComponent(slug)}`) : []),
  ]
  const entries: MetadataRoute.Sitemap = paths.map(path => ({ url: `${origin}${path === '/' ? '' : path}` }))
  for (const article of articles ?? []) {
    const prefix = article.type === 'post' ? '/blog' : '/best-shoes'
    entries.push({
      url: `${origin}${prefix}/${encodeURIComponent(article.slug)}`,
      ...(article.modifiedAt ? { lastModified: article.modifiedAt } : {}),
    })
  }

  // CMS entries replace local fallbacks with the same canonical URL and retain
  // their real modified date. Never manufacture lastmod from the request time.
  return [...new Map(entries.map(entry => [entry.url, entry])).values()]
}
