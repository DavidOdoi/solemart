import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { products } from '@/data/products'
import { getProduct } from '@/lib/content'
import { ReviewPage } from '@/components/page-templates'

export function generateStaticParams() {
  return products.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return { title: product.seoTitle || `${product.name} Review`, description: product.metaDescription || product.description }
}

export default async function ReviewRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()
  return <ReviewPage product={product} />
}
