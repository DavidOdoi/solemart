import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/data/blog'
import { BlogPostPage } from '@/components/page-templates'
import { getPublicBlogPost } from '@/lib/blog-content'
import { getWordPressBlogGraphqlUrl } from '@/lib/content-source'

export const revalidate = 60
export const dynamicParams = true

export function generateStaticParams() {
  // CMS content loads on request; an unavailable CMS must not block a build.
  return getWordPressBlogGraphqlUrl() ? [] : blogPosts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublicBlogPost(slug)
  if (!post) notFound()
  const url = `https://thesolemart.com/blog/${encodeURIComponent(post.slug)}`
  const title = post.seoTitle || post.title
  const description = post.metaDescription || post.excerpt || undefined
  const imageUrl = post.featuredImage ? new URL(post.featuredImage.src, 'https://thesolemart.com').href : undefined
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', title: post.title, description, url,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: post.author ? [post.author] : undefined,
      images: post.featuredImage && imageUrl ? [{ url: imageUrl, alt: post.featuredImage.alt, width: post.featuredImage.width, height: post.featuredImage.height }] : undefined,
    },
    twitter: { card: post.featuredImage ? 'summary_large_image' : 'summary', title, description },
  }
}

export default async function BlogPostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublicBlogPost(slug)
  if (!post) notFound()
  return <BlogPostPage post={post} />
}
