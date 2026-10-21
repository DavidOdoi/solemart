import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/data/blog'
import { getBlogPost } from '@/lib/content'
import { BlogPostPage } from '@/components/page-templates'
import { getWordPressPost } from '@/lib/wordpress'

export const revalidate = 60
export const dynamicParams = true

async function getPost(slug: string) {
  // A migrated WordPress article must match the content shown in the listing.
  return await getWordPressPost(slug) ?? getBlogPost(slug)
}

export function generateStaticParams() {
  return process.env.WORDPRESS_GRAPHQL_URL ? [] : blogPosts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  const url = `https://thesolemart.com/blog/${encodeURIComponent(post.slug)}`
  return {
    title: post.title,
    description: post.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'article', title: post.title, description: post.excerpt || undefined, url,
      publishedTime: post.publishedAt,
      modifiedTime: post.modifiedAt,
      authors: post.author ? [post.author] : undefined,
      images: post.featuredImage ? [{ url: post.featuredImage.src, alt: post.featuredImage.alt }] : undefined,
    },
    twitter: { card: post.featuredImage ? 'summary_large_image' : 'summary', title: post.title, description: post.excerpt || undefined },
  }
}

export default async function BlogPostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()
  return <BlogPostPage post={post} />
}
