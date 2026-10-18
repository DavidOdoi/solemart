import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { categories } from '@/data/categories'
import { getCategory } from '@/lib/content'
import { CategoryPage } from '@/components/page-templates'

export function generateStaticParams() {
  return categories.map(({ slug }) => ({ category: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const category = getCategory(slug)
  if (!category) return {}
  return {
    title: `${category.title} Buying Guides & Reviews`,
    description: `${category.intro} Browse SOLEMART buying guides, shoe profiles, and comparisons.`,
  }
}

export default async function CategoryRoute({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const category = getCategory(slug)
  if (!category) notFound()
  return <CategoryPage category={category} />
}
