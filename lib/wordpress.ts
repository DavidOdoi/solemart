import 'server-only'

import { cache } from 'react'
import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'
import type { BlogPost } from '@/data/blog'

type WordPressPost = {
  title: string | null
  slug: string | null
  status: string | null
  content: string | null
  excerpt: string | null
  dateGmt: string | null
  modifiedGmt: string | null
  author: { node: { name: string | null } | null } | null
  featuredImage: { node: {
    sourceUrl: string | null
    altText: string | null
    mediaDetails: { width: number | null; height: number | null } | null
  } | null } | null
}

const postQuery = `
  query PublishedBlogPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      slug
      status
      content
      excerpt
      dateGmt
      modifiedGmt
      author { node { name } }
      featuredImage {
        node { sourceUrl altText mediaDetails { width height } }
      }
    }
  }
`

const postsQuery = `
  query PublishedBlogPosts($after: String) {
    posts(first: 12, after: $after, where: { status: PUBLISH, orderby: [{ field: DATE, order: DESC }] }) {
      nodes {
        title
        slug
        status
        excerpt
        dateGmt
        author { node { name } }
        featuredImage { node { sourceUrl altText mediaDetails { width height } } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

type WordPressPreview = Omit<WordPressPost, 'content' | 'modifiedGmt'>
export type BlogPostPreview = Pick<BlogPost, 'title' | 'slug' | 'category' | 'date' | 'publishedAt' | 'author' | 'excerpt' | 'featuredImage'>

export function isWordPressCursor(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 512 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(value)
}

function plainText(html: string | null | undefined) {
  return decodeHTML(sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ').trim()
}

function utcDate(value: string | null) {
  if (!value) return undefined
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function articleHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 's', 'del', 'u', 'blockquote', 'pre', 'code', 'br', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'img', 'sup', 'sub', 'dl', 'dt', 'dd', 'span', 'div'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      ol: ['start', 'reversed'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (tagName, attributes) => ({
        tagName,
        attribs: attributes.target === '_blank'
          ? { ...attributes, rel: `${attributes.rel || ''} noopener noreferrer`.trim() }
          : attributes,
      }),
      img: (tagName, attributes) => ({ tagName, attribs: { ...attributes, loading: 'lazy', decoding: 'async' } }),
    },
  })
}

function featuredImage(image: NonNullable<WordPressPost['featuredImage']>['node']): BlogPost['featuredImage'] {
  if (!image?.sourceUrl) return undefined
  try {
    const url = new URL(image.sourceUrl)
    const permitted = url.protocol === 'https:' && (
      (url.hostname === 'cms.thesolemart.com' && url.pathname.startsWith('/wp-content/uploads/')) ||
      url.hostname === 'images.unsplash.com'
    )
    if (!permitted) return undefined
    return {
      src: url.href,
      alt: plainText(image.altText),
      width: image.mediaDetails?.width && image.mediaDetails.width > 0 ? image.mediaDetails.width : 1200,
      height: image.mediaDetails?.height && image.mediaDetails.height > 0 ? image.mediaDetails.height : 800,
    }
  } catch {
    return undefined
  }
}

async function queryWordPress<T>(query: string, variables: Record<string, string | null>, tags: string[]): Promise<T> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL

  let response: Response
  try {
    const url = new URL(endpoint || '')
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Invalid WordPress endpoint configuration')
    }
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(10_000),
      cache: 'force-cache',
      next: { revalidate: 60, tags },
    })
    if (!response.ok) throw new Error(`WordPress returned HTTP ${response.status}`)
  } catch (error) {
    // Infrastructure failures must not be mistaken for a missing article.
    throw new Error('WordPress articles are temporarily unavailable.', { cause: error })
  }

  const result = await response.json() as { data?: T; errors?: unknown[] }
  if (result.errors?.length || !result.data) {
    throw new Error('WordPress could not return the requested article.')
  }
  return result.data
}

function postPreview(post: WordPressPreview): BlogPostPreview {
  const publishedAt = utcDate(post.dateGmt)
  return {
    title: plainText(post.title),
    slug: post.slug!,
    category: 'SHOE ADVICE',
    date: publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '',
    publishedAt,
    author: plainText(post.author?.node?.name) || undefined,
    excerpt: plainText(post.excerpt).slice(0, 200),
    featuredImage: featuredImage(post.featuredImage?.node ?? null),
  }
}

/** Published public posts only. React cache shares the metadata/page request. */
export const getWordPressPost = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!process.env.WORDPRESS_GRAPHQL_URL || !/^[^\s/?#\u0000-\u001f]{1,200}$/u.test(slug)) return null
  const data = await queryWordPress<{ post?: WordPressPost | null }>(postQuery, { slug }, ['wordpress:posts', `wordpress:post:${slug}`])
  if (!Object.hasOwn(data, 'post')) throw new Error('WordPress could not return the requested article.')
  const post = data.post
  if (!post || post.status !== 'publish') return null
  if (!post.slug || !plainText(post.title)) throw new Error('WordPress returned an incomplete article.')

  return {
    ...postPreview(post),
    modifiedAt: utcDate(post.modifiedGmt),
    paragraphs: [],
    contentHtml: articleHtml(post.content || ''),
  }
})

export const getWordPressPosts = cache(async (after?: string): Promise<{
  posts: BlogPostPreview[]
  hasNextPage: boolean
  endCursor: string | null
} | null> => {
  if (after !== undefined && !isWordPressCursor(after)) throw new RangeError('Invalid article cursor')
  if (!process.env.WORDPRESS_GRAPHQL_URL) return null
  const data = await queryWordPress<{
    posts?: { nodes?: (WordPressPreview | null)[]; pageInfo?: { hasNextPage: boolean; endCursor: string | null } }
  }>(postsQuery, { after: after || null }, ['wordpress:posts', 'wordpress:archive'])
  const connection = data.posts
  if (!Array.isArray(connection?.nodes) || typeof connection.pageInfo?.hasNextPage !== 'boolean') {
    throw new Error('WordPress could not return the article listing.')
  }
  if (connection.pageInfo.hasNextPage && !isWordPressCursor(connection.pageInfo.endCursor)) {
    throw new Error('WordPress returned incomplete article pagination.')
  }
  return {
    posts: connection.nodes
      .filter((post): post is WordPressPreview => Boolean(post?.status === 'publish' && post.slug && plainText(post.title)))
      .map(postPreview),
    hasNextPage: connection.pageInfo.hasNextPage,
    endCursor: typeof connection.pageInfo.endCursor === 'string' ? connection.pageInfo.endCursor : null,
  }
})
