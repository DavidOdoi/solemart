import 'server-only'

import { cache } from 'react'
import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'
import type { BlogPost } from '@/data/blog'
import { sanitizeCmsArticleHtml as articleHtml } from './cms-rich-text.ts'

type WordPressPost = {
  title: string | null
  slug: string | null
  status: string | null
  content: string | null
  excerpt: string | null
  dateGmt: string | null
  modifiedGmt: string | null
  author: { node: { name: string | null; databaseId?: number | null } | null } | null
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
      author { node { name databaseId } }
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

function guideBodySummary(html: string | null | undefined) {
  return plainText((html || '').replace(/<\/(?:h[1-6]|p|li|div|blockquote|tr|figcaption)>|<br\s*\/?>/gi, '$& '))
}

function utcDate(value: string | null) {
  if (!value) return undefined
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
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

class MissingGuideFieldsError extends Error {
  readonly field: 'solemartGuideData' | 'solemartBuyingGuideFields'
  constructor(field: 'solemartGuideData' | 'solemartBuyingGuideFields') {
    super(`WordPress does not expose ${field}.`)
    this.field = field
  }
}

class MissingGuideExcerptError extends Error {}

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
    // GraphQL validation failures can use HTTP 400. Read their JSON before
    // deciding whether an optional migration field is genuinely absent.
    if (!response.ok && response.status !== 400) throw new Error(`WordPress returned HTTP ${response.status}`)
  } catch (error) {
    // Infrastructure failures must not be mistaken for a missing article.
    throw new Error('WordPress articles are temporarily unavailable.', { cause: error })
  }

  const result = await response.json() as { data?: T; errors?: { message?: string }[] }
  const missingExcerpt = 'Cannot query field "excerpt" on type "BuyingGuide".'
  if (result.errors?.some(error => error.message?.startsWith(missingExcerpt))
    && result.errors.every(error => [missingExcerpt, 'Cannot query field "solemartGuideData" on type "BuyingGuide".', 'Cannot query field "solemartBuyingGuideFields" on type "BuyingGuide".'].some(prefix => error.message?.startsWith(prefix)))) {
    throw new MissingGuideExcerptError('WordPress Buying Guides do not support excerpts.')
  }
  for (const field of ['solemartGuideData', 'solemartBuyingGuideFields'] as const) {
    if (result.errors?.length && result.errors.every(error => error.message?.startsWith(`Cannot query field "${field}" on type "BuyingGuide".`))) {
      throw new MissingGuideFieldsError(field)
    }
  }
  if (result.errors?.length || !result.data) {
    throw new Error('WordPress could not return the requested article.', {
      cause: new Error(result.errors?.map(error => error.message || 'Unknown GraphQL error').join('; ') || 'Missing GraphQL data'),
    })
  }
  if (!response.ok) throw new Error('WordPress articles are temporarily unavailable.', { cause: new Error(`WordPress returned HTTP ${response.status}`) })
  return result.data
}

/** CPT UI can omit Excerpt support; retry once without that optional selection. */
async function queryBuyingGuide<T>(query: string, variables: Record<string, string | null>, tags: string[]): Promise<T> {
  try {
    return await queryWordPress<T>(query, variables, tags)
  } catch (error) {
    if (!(error instanceof MissingGuideExcerptError) || !/\bexcerpt\b/.test(query)) throw error
    return queryWordPress<T>(query.replace(/\bexcerpt\b/g, ''), variables, tags)
  }
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
    authorProfile: post.author?.node?.databaseId ? await getWordPressAuthorProfile(post.author.node.databaseId) : undefined,
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

/** Buying guides are separate from ordinary posts and never inherit sample picks. */
export const getWordPressBuyingGuide = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!process.env.WORDPRESS_GRAPHQL_URL || !/^[^\s/?#\u0000-\u001f]{1,200}$/u.test(slug)) return null
  const query = `
    query PublishedBuyingGuide($slug: ID!) {
      buyingGuide(id: $slug, idType: SLUG) {
        title slug status content excerpt dateGmt modifiedGmt
        featuredImage { node { sourceUrl altText mediaDetails { width height } } }
      }
    }
  `
  const data = await queryBuyingGuide<{ buyingGuide?: Omit<WordPressPost, 'author'> | null }>(
    query, { slug }, ['wordpress:buying-guides', `wordpress:buying-guide:${slug}`],
  )
  if (!Object.hasOwn(data, 'buyingGuide')) throw new Error('WordPress could not return the requested buying guide.')
  const guide = data.buyingGuide
  if (!guide || guide.status !== 'publish') return null
  if (guide.slug !== slug || !plainText(guide.title)) throw new Error('WordPress returned an incomplete buying guide.')
  return {
    ...postPreview({ ...guide, excerpt: plainText(guide.excerpt) || guideBodySummary(guide.content), author: null }),
    category: 'BUYING GUIDE',
    modifiedAt: utcDate(guide.modifiedGmt),
    paragraphs: [],
    contentHtml: articleHtml(guide.content || ''),
  }
})

/** An absent companion plugin must not break the original template. Other failures remain errors. */
export const getWordPressGuideFields = cache(async (slug: string): Promise<unknown> => {
  if (!process.env.WORDPRESS_GRAPHQL_URL || !/^[^\s/?#\u0000-\u001f]{1,200}$/u.test(slug)) return null
  try {
    const data = await queryWordPress<{ buyingGuide?: { solemartGuideData?: string | null } | null }>(`
      query BuyingGuideTemplateFields($slug: ID!) {
        buyingGuide(id: $slug, idType: SLUG) { solemartGuideData }
      }
    `, { slug }, ['wordpress:buying-guides', `wordpress:buying-guide:${slug}`])
    if (!Object.hasOwn(data, 'buyingGuide')) throw new Error('WordPress returned incomplete template fields.')
    if (data.buyingGuide && !Object.hasOwn(data.buyingGuide, 'solemartGuideData')) throw new Error('WordPress returned incomplete template fields.')
    const raw = data.buyingGuide?.solemartGuideData
    if (raw == null) return null
    return JSON.parse(raw)
  } catch (error) {
    if (error instanceof MissingGuideFieldsError && error.field === 'solemartGuideData') return null
    throw error
  }
})

const acfGuideQuery = `
  query PublishedAcfBuyingGuide($slug: ID!) {
    buyingGuide(id: $slug, idType: SLUG) {
      id title slug status content excerpt dateGmt modifiedGmt
      featuredImage { node { sourceUrl altText mediaDetails { width height } } }
      solemartBuyingGuideFields {
        intro category author reviewedBy disclosure quickAnswerTitle quickAnswerBody
        howWeChose advice whoItsFor mistakesToAvoid finalVerdict seoTitle metaDescription
        ${[1, 2, 3, 4].map(index => `
          pick${index}Shoe { node { __typename id } }
          pick${index}Award pick${index}Reason pick${index}BestFor pick${index}AvoidIf pick${index}Commentary
          faq${index}Question faq${index}Answer
        `).join('\n')}
      }
    }
  }
`

type AcfShoeReference = { node?: { __typename?: string; id?: string } | null } | null
type AcfGuideFields = Record<string, unknown>
export type WordPressAcfShoe = {
  id: string
  title: string
  slug: string
  status: string
  featuredImage?: WordPressPost['featuredImage']
  solemartShoeFields?: Record<string, unknown> | null
}

/** A shared Shoe response is cached independently of guides that reference it. */
const getWordPressAcfShoe = cache(async (id: string): Promise<WordPressAcfShoe | null> => {
  const data = await queryWordPress<{ node?: WordPressAcfShoe | null }>(`
    query PublishedAcfShoe($id: ID!) {
      node(id: $id) {
        ... on Shoe {
          id title slug status
          featuredImage { node { sourceUrl altText mediaDetails { width height } } }
          solemartShoeFields {
            brand description affiliateUrl reviewUrl pros cons specs
            cushioning widthOptions mainStrength commentary
          }
        }
      }
    }
  `, { id }, ['wordpress:shoes', `wordpress:shoe:${id}`])
  if (!Object.hasOwn(data, 'node')) throw new Error('WordPress returned an incomplete Shoe response.')
  const shoe = data.node
  if (!shoe || shoe.status !== 'publish') return null
  if (shoe.id !== id || !shoe.slug || !plainText(shoe.title)) throw new Error('WordPress returned an incomplete Shoe.')
  return {
    ...shoe, title: plainText(shoe.title),
    featuredImage: shoe.featuredImage?.node ? {
      node: { ...shoe.featuredImage.node, altText: plainText(shoe.featuredImage.node.altText) },
    } : null,
  }
})

/** A missing optional native author must not make a published guide unavailable. */
const getWordPressGuideAuthor = cache(async (id: string): Promise<string | undefined> => {
  try {
    const data = await queryWordPress<{ node?: { author?: WordPressPost['author'] } | null }>(`
      query BuyingGuideAuthor($id: ID!) {
        node(id: $id) { ... on NodeWithAuthor { author { node { name } } } }
      }
    `, { id }, ['wordpress:authors'])
    return plainText(data.node?.author?.node?.name) || undefined
  } catch { return undefined }
})

/** undefined means the ACF schema is absent; null means no published guide. */
export const getWordPressAcfBuyingGuide = cache(async (slug: string): Promise<{
  post: BlogPost
  fields: AcfGuideFields
  shoes: WordPressAcfShoe[]
} | null | undefined> => {
  if (!process.env.WORDPRESS_GRAPHQL_URL || process.env.WORDPRESS_GUIDE_FIELDS_SOURCE === 'legacy') return undefined
  if (!/^[^\s/?#\u0000-\u001f]{1,200}$/u.test(slug)) return null
  let data: { buyingGuide?: (Omit<WordPressPost, 'author'> & { id: string; solemartBuyingGuideFields?: AcfGuideFields | null }) | null }
  try {
    data = await queryBuyingGuide(acfGuideQuery, { slug }, ['wordpress:buying-guides', `wordpress:buying-guide:${slug}`])
  } catch (error) {
    if (error instanceof MissingGuideFieldsError && error.field === 'solemartBuyingGuideFields') return undefined
    throw error
  }
  if (!Object.hasOwn(data, 'buyingGuide')) throw new Error('WordPress could not return the requested buying guide.')
  const guide = data.buyingGuide
  if (!guide || guide.status !== 'publish') return null
  if (guide.slug !== slug || !plainText(guide.title)) throw new Error('WordPress returned an incomplete buying guide.')
  if (!Object.hasOwn(guide, 'solemartBuyingGuideFields')) throw new Error('WordPress returned incomplete ACF guide fields.')
  const fields = guide.solemartBuyingGuideFields ?? {}
  if (typeof fields !== 'object' || Array.isArray(fields)) throw new Error('WordPress returned invalid ACF guide fields.')
  const ids = [...new Set([1, 2, 3, 4].flatMap(index => {
    const reference = fields[`pick${index}Shoe`] as AcfShoeReference
    const node = reference?.node
    return node?.__typename === 'Shoe' && typeof node.id === 'string' && node.id.length > 0 && node.id.length <= 200 ? [node.id] : []
  }))]
  const [shoes, author] = await Promise.all([
    Promise.all(ids.map(getWordPressAcfShoe)),
    !plainText(typeof fields.author === 'string' ? fields.author : '') && guide.id ? getWordPressGuideAuthor(guide.id) : undefined,
  ])
  return {
    post: {
      ...postPreview({
        ...guide,
        excerpt: plainText(guide.excerpt) || guideBodySummary(typeof fields.intro === 'string' ? fields.intro : '') || guideBodySummary(guide.content),
        author: author ? { node: { name: author } } : null,
      }),
      category: 'BUYING GUIDE', modifiedAt: utcDate(guide.modifiedGmt),
      paragraphs: [], contentHtml: articleHtml(guide.content || '', shoes.flatMap(shoe => typeof shoe?.solemartShoeFields?.affiliateUrl === 'string' ? [shoe.solemartShoeFields.affiliateUrl] : [])),
    },
    fields,
    shoes: shoes.filter((shoe): shoe is WordPressAcfShoe => shoe !== null),
  }
})

function avatarUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try {
    const url = new URL(value)
    const allowed = ['gravatar.com', 'secure.gravatar.com', 'www.gravatar.com'].includes(url.hostname)
      || (url.hostname === 'cms.thesolemart.com' && url.pathname.startsWith('/wp-content/uploads/'))
    return allowed && url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}

/** Public core WordPress profiles only. Optional profile failures must not hide an article. */
export const getWordPressAuthorProfile = cache(async (id: number): Promise<BlogPost['authorProfile'] | undefined> => {
  if (!Number.isSafeInteger(id) || id < 1) return undefined
  try {
    const restBase = process.env.WORDPRESS_API_URL
      || (process.env.WORDPRESS_GRAPHQL_URL ? new URL('/wp-json/wp/v2/', process.env.WORDPRESS_GRAPHQL_URL).href : '')
    const base = new URL(restBase.endsWith('/') ? restBase : `${restBase}/`)
    if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password) return undefined
    const url = new URL(`users/${id}`, base)
    url.searchParams.set('context', 'view')
    url.searchParams.set('_fields', 'id,description,avatar_urls')
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(3000),
      cache: 'force-cache',
      next: { revalidate: 60, tags: ['wordpress:authors', `wordpress:author:${id}`] },
    })
    if (!response.ok) return undefined
    const profile = await response.json() as { id?: number; description?: unknown; avatar_urls?: Record<string, unknown> }
    if (profile.id !== id) return undefined
    const bio = typeof profile.description === 'string'
      ? decodeHTML(sanitizeHtml(profile.description, { allowedTags: [], allowedAttributes: {} })).trim().slice(0, 2500)
      : undefined
    const avatar = avatarUrl(profile.avatar_urls?.['96'] ?? profile.avatar_urls?.['48'])
    return bio || avatar ? { bio: bio || undefined, avatarUrl: avatar } : undefined
  } catch { return undefined }
})
