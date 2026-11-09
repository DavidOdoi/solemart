import 'server-only'

import { parseDocument, DomUtils } from 'htmlparser2'
import { escapeAttribute } from 'entities'
import { comparisonDrafts } from '../data/comparison-drafts.ts'
import { comparisonBlogPost } from './comparison-article.ts'
import { editorialPlainText, sanitizeCmsArticleHtml } from './cms-rich-text.ts'
import { getContentSource } from './content-source.ts'

const cmsOrigin = 'https://cms.thesolemart.com'
const restPath = '/wp-json/wp/v2/'
const postStatuses = 'publish,future,draft,pending,private'
const placeholder = 'https://thesolemart.com/placeholder.svg'
type Row = Record<string, unknown>
type Config = { apiUrl: string; username: string; applicationPassword: string }
type Node = ReturnType<typeof parseDocument>['children'][number]
type Draft = { slug: string; title: string; excerpt: string; content: string; status: 'draft' }
export type ComparisonImportPlan = {
  slug: string; action: 'CREATE_DRAFT' | 'EXISTING' | 'CONFLICT'
  existing: { id: number; slug: string; status: string; editorUrl: string }[]
}
type Options = { config?: Config; fetcher?: typeof fetch; onProgress?: (step: { slug: string; id: number; editorUrl: string; action: string }) => void | Promise<void> }
function row(value: unknown): Row { return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {} }

function block(name: string, html: string, attributes?: Row) {
  const json = attributes ? ` ${JSON.stringify(attributes).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}` : ''
  return `<!-- wp:${name}${json} -->\n${html}\n<!-- /wp:${name} -->`
}

/** Native Gutenberg text/image blocks; existing complex HTML stays editable in a Classic block. */
export function comparisonGutenbergContent(html: string) {
  const document = parseDocument(sanitizeCmsArticleHtml(html))
  function serialize(node: Node): string {
    if (!('attribs' in node)) return DomUtils.textContent(node).trim() ? block('freeform', DomUtils.getOuterHTML(node)) : ''
    const inner = DomUtils.getInnerHTML(node)
    if (node.name === 'p') return block('paragraph', `<p>${inner}</p>`)
    if (/^h[2-6]$/.test(node.name)) {
      const level = Number(node.name.slice(1))
      return block('heading', `<${node.name} class="wp-block-heading">${inner}</${node.name}>`, { level })
    }
    const image = node.name === 'img' ? node : node.name === 'figure' ? node.children.find(child => 'name' in child && child.name === 'img') : undefined
    if (image && 'attribs' in image) {
      const src = image.attribs.src === '/placeholder.svg' ? placeholder : image.attribs.src
      if (!src) return ''
      const caption = node.name === 'figure' ? node.children.find(child => 'name' in child && child.name === 'figcaption') : undefined
      return block('image', `<figure class="wp-block-image size-full"><img src="${escapeAttribute(src)}" alt="${escapeAttribute(image.attribs.alt || '')}"/>${caption ? `<figcaption class="wp-element-caption">${DomUtils.getInnerHTML(caption)}</figcaption>` : ''}</figure>`, { sizeSlug: 'full', linkDestination: 'none' })
    }
    // Classic blocks preserve accessible table cells, captions, lists and links
    // without depending on a particular version of the core Table/List schema.
    return block('freeform', DomUtils.getOuterHTML(node))
  }
  return document.children.map(serialize).filter(Boolean).join('\n\n')
}

export function getComparisonWordPressDrafts(): Draft[] {
  return comparisonDrafts.map(({ content }) => {
    const post = comparisonBlogPost(content, { imagePlaceholders: true })
    return {
      slug: post.slug, title: post.title,
      excerpt: editorialPlainText(post.metaDescription || post.excerpt),
      content: comparisonGutenbergContent(post.contentHtml || ''), status: 'draft',
    }
  })
}

export function getWordPressPostImportConfig(): Config | null {
  if (getContentSource() === 'local') return null
  const username = process.env.WORDPRESS_USERNAME || ''
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD || ''
  return username && applicationPassword ? {
    apiUrl: process.env.WORDPRESS_API_URL || `${cmsOrigin}${restPath}`, username, applicationPassword,
  } : null
}

function client(options: Options) {
  if (getContentSource() === 'local') throw new Error('WordPress post import is disabled in explicit local mode. Select hybrid before importing.')
  const config = options.config ?? getWordPressPostImportConfig()
  if (!config) throw new Error('WordPress writing credentials are missing. Set WORDPRESS_USERNAME and WORDPRESS_APPLICATION_PASSWORD in secure environment settings; no request was sent.')
  let base: URL
  try { base = new URL(config.apiUrl.endsWith('/') ? config.apiUrl : `${config.apiUrl}/`) }
  catch { throw new Error('Invalid WordPress REST configuration; no request was sent.') }
  if (base.origin !== cmsOrigin || base.pathname !== restPath || base.username || base.password || base.search || base.hash
    || !config.username || !config.applicationPassword || /[:\r\n]/.test(config.username) || /[\r\n]/.test(config.applicationPassword)) {
    throw new Error('WordPress import credentials may only be sent to https://cms.thesolemart.com/wp-json/wp/v2/.')
  }
  const fetcher = options.fetcher ?? fetch
  const authorization = `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`
  return async (path: string, body?: Row) => {
    let response: Response
    try {
      response = await fetcher(new URL(path, base), {
        method: body ? 'POST' : 'GET',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authorization },
        ...(body ? { body: JSON.stringify(body) } : {}),
        cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10_000),
      })
    } catch { throw new Error('WordPress could not be reached. No automatic retry was attempted; inspect the import journal before running again.') }
    if (!response.ok) throw new Error([401, 403].includes(response.status)
      ? 'WordPress authentication or permission check failed. No automatic retry was attempted.'
      : `WordPress returned HTTP ${response.status}. No automatic retry was attempted.`)
    let value: unknown
    try { value = await response.json() }
    catch { throw new Error('WordPress returned an invalid JSON response. Inspect the import journal before running again.') }
    return { value, headers: response.headers }
  }
}

const editorUrl = (id: number) => `${cmsOrigin}/wp-admin/post.php?post=${id}&action=edit`
const normalized = (value: string) => editorialPlainText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

async function preflight(options: Options) {
  const api = client(options)
  const me = row((await api('users/me?context=edit')).value)
  if (!Number.isSafeInteger(me.id) || Number(me.id) < 1 || row(me.capabilities).edit_posts !== true) throw new Error('The WordPress account must be able to edit ordinary Posts.')
  const inventory: Row[] = []
  let pages = 1
  for (let page = 1; page <= pages; page++) {
    const params = new URLSearchParams({ context: 'edit', status: postStatuses, per_page: '100', page: String(page), _fields: 'id,slug,status,title' })
    const response = await api(`posts?${params}`)
    const total = response.headers.get('x-wp-totalpages')
    if (!total || !/^\d+$/.test(total) || Number(total) > 10_000 || !Array.isArray(response.value)) throw new Error('WordPress did not provide a complete paginated post inventory. No articles were created.')
    pages = Number(total)
    for (const value of response.value) {
      const post = row(value)
      if (!Number.isSafeInteger(post.id) || Number(post.id) < 1 || typeof post.slug !== 'string' || typeof post.status !== 'string' || typeof row(post.title).raw !== 'string') {
        throw new Error('WordPress returned an incomplete post record. No articles were created.')
      }
      inventory.push(post)
    }
    if (page < pages && !response.value.length) throw new Error('WordPress pagination ended unexpectedly. No articles were created.')
  }
  const drafts = getComparisonWordPressDrafts()
  const plan: ComparisonImportPlan[] = drafts.map(draft => {
    const topic = normalized(draft.slug)
    const matching = inventory.filter(post => post.slug === draft.slug || String(post.slug).startsWith(`${draft.slug}-`)
      || normalized(String(row(post.title).raw)).startsWith(`${topic} `) || normalized(String(row(post.title).raw)) === topic)
    return {
      slug: draft.slug, action: matching.length > 1 ? 'CONFLICT' : matching.length ? 'EXISTING' : 'CREATE_DRAFT',
      existing: matching.map(post => ({ id: Number(post.id), slug: String(post.slug), status: String(post.status), editorUrl: editorUrl(Number(post.id)) })),
    }
  })
  return { api, drafts, plan }
}

/** Read-only connection, permission and duplicate checks; no POST requests. */
export async function checkWordPressComparisonImport(options: Options = {}) {
  return (await preflight(options)).plan
}

/** Creates native Post drafts only. Existing posts and manual edits are never overwritten. */
export async function importWordPressComparisonDrafts(options: Options = {}) {
  const { api, drafts, plan } = await preflight(options)
  if (plan.some(item => item.action === 'CONFLICT')) throw new Error('Multiple existing posts match a comparison topic. Resolve the duplicates in WordPress; no articles were created.')
  const results: { slug: string; id: number; editorUrl: string; action: string; published: boolean }[] = []
  for (const item of plan) {
    if (item.action === 'EXISTING') {
      const existing = item.existing[0]
      results.push({ ...existing, action: 'EXISTING_UNCHANGED', published: existing.status === 'publish' })
      continue
    }
    // Refresh the public/draft slug lookup immediately before creation.
    const query = new URLSearchParams({ context: 'edit', status: postStatuses, slug: item.slug, per_page: '2', _fields: 'id,slug,status,title' })
    const found = (await api(`posts?${query}`)).value
    if (!Array.isArray(found) || found.length) throw new Error('A comparison slug changed during import. Stop and inspect WordPress; existing posts were not overwritten.')
    const draft = drafts.find(value => value.slug === item.slug)!
    const created = row((await api('posts', draft)).value)
    const validId = Number.isSafeInteger(created.id) && Number(created.id) > 0
    if (validId) await options.onProgress?.({ slug: draft.slug, id: Number(created.id), editorUrl: editorUrl(Number(created.id)), action: created.status === 'draft' && created.slug === draft.slug ? 'DRAFT_CREATED' : 'UNCONFIRMED_RESULT' })
    if (!Number.isSafeInteger(created.id) || Number(created.id) < 1 || created.status !== 'draft' || created.slug !== draft.slug) {
      throw new Error('WordPress did not confirm the expected draft and slug. Inspect WordPress before continuing; no retry was attempted.')
    }
    const step = { slug: draft.slug, id: Number(created.id), editorUrl: editorUrl(Number(created.id)), action: 'DRAFT_CREATED', published: false as const }
    results.push(step)
  }
  return results
}
