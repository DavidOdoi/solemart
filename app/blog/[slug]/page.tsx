import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { blogPosts } from '@/data/blog'
import { getBlogPost } from '@/lib/content'
import { BlogPostPage } from '@/components/page-templates'

export function generateStaticParams() {
  return blogPosts.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return { title: post.title, description: post.excerpt }
}

export default async function BlogPostRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()
  return <BlogPostPage post={post} />
}
