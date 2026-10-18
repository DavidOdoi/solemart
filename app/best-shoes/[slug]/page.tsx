import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { guides } from '@/data/guides'
import { getGuide } from '@/lib/content'
import { GuidePage } from '@/components/page-templates'

export function generateStaticParams() {
  return guides.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) return {}
  return { title: guide.seoTitle || guide.title, description: guide.metaDescription || guide.excerpt }
}

export default async function BuyingGuideRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guide = getGuide(slug)
  if (!guide) notFound()
  return <GuidePage guide={guide} />
}
