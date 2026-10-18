import { blogPosts, type BlogPost } from '@/data/blog'
import { categories, type Category } from '@/data/categories'
import { comparisons, type Comparison } from '@/data/comparisons'
import { guides, type Guide } from '@/data/guides'
import { products, type Product } from '@/data/products'

export const affiliateUrl = 'https://amazon.com/dp/example?tag=solemart-20'

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug)
}

export function getGuide(slug: string): Guide | undefined {
  return guides.find((guide) => guide.slug === slug)
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug)
}

export function getComparison(slug: string): Comparison | undefined {
  return comparisons.find((comparison) => comparison.slug === slug)
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export type SearchResult = { title: string; href: string; description: string; kind: string }

export function searchContent(query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()
  if (!normalizedQuery) return []

  const results: SearchResult[] = [
    ...categories.map((item) => ({ title: item.title, href: `/${item.slug}`, description: item.description, kind: 'Category' })),
    ...guides.map((item) => ({ title: item.title, href: `/best-shoes/${item.slug}`, description: item.excerpt, kind: 'Buying guide' })),
    ...products.map((item) => ({ title: item.name, href: `/reviews/${item.slug}`, description: item.description, kind: 'Review' })),
    ...comparisons.map((item) => ({ title: item.title, href: `/comparisons/${item.slug}`, description: item.excerpt, kind: 'Comparison' })),
    ...blogPosts.map((item) => ({ title: item.title, href: `/blog/${item.slug}`, description: item.excerpt, kind: 'Shoe advice' })),
  ]

  return results.filter(({ title, description, kind }) =>
    `${title} ${description} ${kind}`.toLocaleLowerCase().includes(normalizedQuery),
  )
}
