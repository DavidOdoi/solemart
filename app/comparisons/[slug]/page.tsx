import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { comparisons } from '@/data/comparisons'
import { getComparison } from '@/lib/content'
import { ComparisonPage } from '@/components/page-templates'

export function generateStaticParams() {
  return comparisons.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const comparison = getComparison(slug)
  if (!comparison) return {}
  return { title: comparison.title, description: comparison.excerpt }
}

export default async function ComparisonRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const comparison = getComparison(slug)
  if (!comparison) notFound()
  return <ComparisonPage comparison={comparison} />
}
