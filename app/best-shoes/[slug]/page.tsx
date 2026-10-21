import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { guides } from '@/data/guides'
import { getGuide } from '@/lib/content'
import { GuidePage } from '@/components/page-templates'
import { WordPressBuyingGuide } from '@/components/wordpress-buying-guide'
import { getWordPressBuyingGuide } from '@/lib/wordpress'

export const revalidate = 60
export const dynamicParams = true

export function generateStaticParams() {
  return process.env.WORDPRESS_GRAPHQL_URL ? [] : guides.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const cmsGuide = await getWordPressBuyingGuide(slug)
  if (cmsGuide) {
    const url = `https://thesolemart.com/best-shoes/${encodeURIComponent(cmsGuide.slug)}`
    return {
      title: cmsGuide.title, description: cmsGuide.excerpt || undefined,
      alternates: { canonical: url },
      openGraph: { type: 'article', title: cmsGuide.title, url,
        description: cmsGuide.excerpt || undefined, publishedTime: cmsGuide.publishedAt,
        modifiedTime: cmsGuide.modifiedAt,
        images: cmsGuide.featuredImage ? [{ url: cmsGuide.featuredImage.src, alt: cmsGuide.featuredImage.alt }] : undefined },
      twitter: { card: cmsGuide.featuredImage ? 'summary_large_image' : 'summary', title: cmsGuide.title, description: cmsGuide.excerpt || undefined },
    }
  }
  const guide = getGuide(slug)
  if (!guide) notFound()
  return { title: guide.seoTitle || guide.title, description: guide.metaDescription || guide.excerpt }
}

export default async function BuyingGuideRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cmsGuide = await getWordPressBuyingGuide(slug)
  if (cmsGuide) return <WordPressBuyingGuide guide={cmsGuide} />
  const guide = getGuide(slug)
  if (!guide) notFound()
  return <GuidePage guide={guide} />
}
