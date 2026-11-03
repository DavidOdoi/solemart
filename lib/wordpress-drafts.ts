import 'server-only'

import { createHash } from 'node:crypto'
import { editorialPlainText } from './cms-rich-text.ts'
import { articleFingerprint, sanitizeIngestionArticle, validateBuyingGuide, type IngestionArticle, type IngestionReport } from './guide-ingestion.ts'
import { publicHttpsUrl, type IngestionProduct } from './affiliate-products.ts'
import { isWordPressEnabled } from './content-source.ts'
import { GUIDE_WORD_TARGET } from './guide-editorial-settings.ts'

export type WordPressWriteConfig = { apiUrl: string; username: string; applicationPassword: string }
type Row = Record<string, unknown>
type DraftOptions = { config?: WordPressWriteConfig; fetcher?: typeof fetch; allowIncomplete?: boolean; existingArticles?: { slug: string; title: string; text: string }[]; onProgress?: (value: { kind: string; id: number; slug: string }) => void }
function object(value: unknown): Row { return value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {} }

export function getWordPressWriteConfig(): WordPressWriteConfig | null {
  if (!isWordPressEnabled()) return null
  const apiUrl = process.env.WORDPRESS_API_URL || 'https://cms.thesolemart.com/wp-json/wp/v2/'
  const username = process.env.WORDPRESS_USERNAME || ''
  const applicationPassword = process.env.WORDPRESS_APPLICATION_PASSWORD || ''
  return username && applicationPassword ? { apiUrl, username, applicationPassword } : null
}

/** Shared with the WordPress guard: only stable editorial material, never offers. */
export function productMaterialHash(product: IngestionProduct) {
  const values = [editorialPlainText(product.productName), product.brand, product.model, product.asin, product.manufacturerUrl,
    editorialPlainText(product.shortDescription), product.specifications.map(row => `${row.label} | ${row.value}`).join('\n'), product.pros.join('\n'), product.cons.join('\n'),
    product.sizingInformation, product.availableWidths, product.availableColors, product.variant,
  ]
  return createHash('sha256').update(values.map(value => value.replace(/\r\n/g, '\n').trim()).join('\0')).digest('hex')
}

function evidenceJson(product: IngestionProduct) {
  // Do not persist Amazon Product Advertising Content (images, prices or titles)
  // inside evidence exports. Keep the ASIN and a timestamped identity-check note.
  return JSON.stringify(product.evidenceSources.map(row => row.sourceType === 'AMAZON_API'
    ? { key: row.key, sourceType: row.sourceType, sourceUrl: `https://affiliate-program.amazon.com/creatorsapi`, verdict: row.verdict, checkedAt: row.checkedAt, reviewedBy: row.reviewedBy, claim: 'ASIN identity checked through the official API.' }
    : row))
}

export async function saveWordPressBuyingGuideDraft(input: IngestionArticle, options: DraftOptions = {}) {
  if (!isWordPressEnabled()) throw new Error('WordPress is paused in local-content mode. Re-enable SOLEMART_CONTENT_SOURCE=wordpress before saving CMS drafts.')
  const report = await validateBuyingGuide(input, { existingArticles: options.existingArticles })
  if (report.status !== 'PASS' && !options.allowIncomplete) throw new Error('Publication gate blocked this draft. Review the structured report or explicitly save an incomplete editorial draft.')
  if (!input || input.version !== 1 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)
    || !Array.isArray(input.products) || input.products.length !== 4 || !Array.isArray(input.faqs) || input.faqs.length !== 4) throw new Error('The draft payload is structurally incomplete.')
  if (report.criticalErrors.some(row => ['FORMAT', 'PRODUCT_SHAPE', 'REQUIRED', 'PRODUCT_REQUIRED', 'SPECS', 'PROS_CONS', 'TAXONOMY', 'TESTING_RECORD', 'STATIC_OFFER', 'UNPERFORMED_TESTING', 'MEDICAL_CLAIM'].includes(row.code))) throw new Error('Correct structural or unsafe editorial errors before saving a draft.')
  const config = options.config ?? getWordPressWriteConfig()
  if (!config) throw new Error('Configure the dedicated WordPress draft-writer username and application password in server environment settings.')
  let base: URL
  try { base = new URL(config.apiUrl.endsWith('/') ? config.apiUrl : `${config.apiUrl}/`) }
  catch { throw new Error('Invalid WordPress REST API configuration.') }
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash || base.pathname !== '/wp-json/wp/v2/'
    || /[:\r\n]/.test(config.username) || /[\r\n]/.test(config.applicationPassword)) throw new Error('WordPress draft writing requires a credential-free HTTPS /wp-json/wp/v2/ URL and valid application-password credentials.')
  const fetcher = options.fetcher ?? fetch
  const authorization = `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`
  async function api(path: string, body?: unknown, method?: string): Promise<unknown> {
    const response = await fetcher(new URL(path, base), {
      method: method || (body === undefined ? 'GET' : 'POST'),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: authorization },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error([401, 403].includes(response.status) ? 'WordPress draft-writer authentication or capability check failed.' : `WordPress draft operation failed (${response.status}). No automatic retry was made.`)
    return response.json()
  }
  const me = object(await api('users/me?context=edit'))
  if (!Number.isSafeInteger(me.id) || (me.id as number) < 1 || object(me.capabilities).solemart_ingest_guides !== true || Object.entries(object(me.capabilities)).some(([key, value]) => key.startsWith('publish_') && value === true)) throw new Error('Use the dedicated SoleMart Draft Writer role. It needs the ingestion capability and must not have publish capabilities.')
  if (input.authorId !== undefined && input.authorId !== me.id) throw new Error('The draft writer may only create its own drafts. A human editor can change the author in WordPress.')
  const types = object(await api('types?context=edit'))
  const restBase = (type: string) => {
    const value = object(types[type]).rest_base
    if (typeof value !== 'string' || !/^[a-z0-9_-]+$/.test(value)) throw new Error(`WordPress must expose ${type} in its REST API.`)
    return value
  }
  const shoesBase = restBase('shoe')
  const guidesBase = restBase('buying_guides')
  const schemas = await Promise.all([api(shoesBase, undefined, 'OPTIONS'), api(guidesBase, undefined, 'OPTIONS')])
  const schema = (value: unknown) => object(object(object(value).schema).properties)
  for (const value of schemas) {
    const props = schema(value)
    const meta = object(object(props.meta).properties)
    if (!props.acf || !meta._solemart_workflow_status || !meta._solemart_material_hash) throw new Error('Activate the supplied editorial bridge snippet and import the updated ACF groups before writing drafts.')
  }
  const guideSchema = schema(schemas[1])
  if (!object(object(guideSchema.meta).properties).rank_math_title) throw new Error('Approved Rank Math REST metadata is not registered. Activate the editorial bridge snippet.')
  async function matching(rest: string, slug: string) {
    const result = await api(`${rest}?context=edit&status=draft,pending,publish,private&slug=${encodeURIComponent(slug)}&per_page=2`)
    if (!Array.isArray(result)) throw new Error('WordPress returned an invalid draft listing.')
    return result.filter(row => object(row).slug === slug).map(object)
  }
  // Check before any mutation; a rerun cannot overwrite a published page or a
  // manually edited draft. Existing drafts are managed in WordPress.
  if ((await matching(guidesBase, input.slug)).length) throw new Error('This guide slug already exists. Open the existing WordPress draft; ingestion never overwrites it.')
  const article = sanitizeIngestionArticle(input)
  const verified = report.status === 'PASS'
  async function media(id: number, alt: string) {
    if (!Number.isSafeInteger(id) || id < 1) throw new Error('Invalid media attachment ID.')
    // Public attachment metadata does not require permission to edit another
    // author's media. Keep the draft writer's capabilities narrow.
    const value = object(await api(`media/${id}?context=view`))
    if (value.id !== id || value.media_type !== 'image' || !publicHttpsUrl(value.source_url) || new URL(String(value.source_url)).hostname !== base.hostname) throw new Error('Select a real image attachment hosted by this WordPress site.')
    if (!value.alt_text && alt.trim()) {
      if (value.author !== me.id) throw new Error('Add alt text to this existing image in WordPress, or use an image uploaded by the draft writer. Other authors\' media will not be edited.')
      await api(`media/${id}`, { alt_text: editorialPlainText(alt) })
    }
    return value
  }
  let featured: Row | null = null
  if (article.featuredMediaId) featured = await media(article.featuredMediaId, article.imageAltText)
  const ids: number[] = []
  for (const product of article.products) {
    const previous = await matching(shoesBase, product.slug)
    if (previous.length) {
      if (previous.length !== 1 || object(previous[0].title).raw !== product.productName || !Number.isSafeInteger(previous[0].id)) throw new Error('A different Shoe already uses this slug. Existing records are not overwritten.')
      const existing = object(previous[0].acf)
      if (existing.asin && existing.asin !== product.asin) throw new Error('The existing Shoe has a different ASIN; choose the correct record instead of overwriting it.')
      const existingValues = [object(previous[0].title).raw, existing.brand, existing.model, existing.asin, existing.manufacturer_url, existing.description, existing.specs, existing.pros, existing.cons, existing.sizing_information, existing.width_options, existing.available_colors, existing.variant]
      const currentHash = createHash('sha256').update(existingValues.map(value => String(value || '').replace(/\r\n/g, '\n').trim()).join('\0')).digest('hex')
      if (currentHash !== productMaterialHash(product)) throw new Error('The existing Shoe has different material details or manual edits. It was not overwritten.')
      ids.push(previous[0].id as number)
      options.onProgress?.({ kind: 'reused-shoe', id: previous[0].id as number, slug: product.slug })
      continue
    }
    const productMediaId = product.wordpressMediaId
    if (productMediaId) await media(productMediaId, product.imageAltText)
    const acf = {
      brand: product.brand, model: product.model, asin: product.asin, manufacturer_url: product.manufacturerUrl,
      product_category: product.category, description: editorialPlainText(product.shortDescription),
      affiliate_url: product.amazonAffiliateUrl, commentary: product.detailedVerdict,
      pros: product.pros.join('\n'), cons: product.cons.join('\n'), specs: product.specifications.map(row => `${row.label} | ${row.value}`).join('\n'),
      sizing_information: product.sizingInformation, width_options: product.availableWidths, available_colors: product.availableColors,
      variant: product.variant, main_strength: product.bestFor, evidence_sources: evidenceJson(product),
      verification_status: verified ? 'VERIFIED' : 'PENDING', verification_date: verified ? new Date().toISOString() : '',
      verification_notes: verified ? 'Passed evidence-record and current official API identity checks; human editorial review recorded.' : 'Incomplete editorial draft. Product verification and publication are blocked.',
    }
    const value = object(await api(shoesBase, {
      status: 'draft', title: editorialPlainText(product.productName), slug: product.slug, author: me.id,
      ...(productMediaId ? { featured_media: productMediaId } : {}), acf,
      meta: { _solemart_workflow_status: verified ? 'READY_FOR_REVIEW' : 'NEEDS_REVIEW', _solemart_material_hash: verified ? productMaterialHash(product) : '', _solemart_verification_report: JSON.stringify({ status: verified ? 'PASS' : 'FAIL', asin: product.asin, checkedAt: new Date().toISOString() }) },
    }))
    if (!Number.isSafeInteger(value.id) || value.status !== 'draft') throw new Error('WordPress did not confirm a Shoe draft. Stop and inspect the server; no publish action was requested.')
    ids.push(value.id as number)
    options.onProgress?.({ kind: 'created-shoe-draft', id: value.id as number, slug: product.slug })
  }
  const acf: Row = {
    intro: article.intro, category: article.category, author: '', reviewed_by: '', disclosure: article.disclosure,
    quick_answer_title: article.quickAnswerTitle, quick_answer_body: article.quickAnswerBody,
    how_we_chose: article.howWeChose.join('\n'), advice: article.advice, who_its_for: article.whoItsFor.join('\n'),
    mistakes_to_avoid: article.mistakesToAvoid.join('\n'), final_verdict: article.finalVerdict,
    seo_title: article.seoTitle, meta_description: article.metaDescription,
  }
  article.products.forEach((product, i) => Object.assign(acf, {
    [`pick_${i + 1}_shoe`]: ids[i], [`pick_${i + 1}_award`]: product.awardLabel, [`pick_${i + 1}_reason`]: product.shortDescription,
    [`pick_${i + 1}_best_for`]: product.bestFor, [`pick_${i + 1}_avoid_if`]: product.avoidIf, [`pick_${i + 1}_commentary`]: product.detailedVerdict,
  }))
  article.faqs.forEach((faq, i) => Object.assign(acf, { [`faq_${i + 1}_question`]: faq.question, [`faq_${i + 1}_answer`]: faq.answer }))
  const canonical = `https://thesolemart.com/best-shoes/${article.slug}`
  const value = object(await api(guidesBase, {
    status: 'draft', title: editorialPlainText(article.title), slug: article.slug, author: me.id,
    content: '', ...(guideSchema.excerpt ? { excerpt: article.excerpt } : {}), acf,
    ...(featured ? { featured_media: featured.id } : {}),
    ...(guideSchema.categories && article.categoryIds ? { categories: article.categoryIds } : {}),
    ...(guideSchema.tags && article.tagIds ? { tags: article.tagIds } : {}),
    meta: {
      _solemart_workflow_status: verified ? 'READY_FOR_REVIEW' : 'NEEDS_REVIEW',
      _solemart_material_hash: '', _solemart_ingestion_hash: articleFingerprint(article),
      _solemart_verification_report: JSON.stringify(report), _solemart_target_keyword: article.targetKeyword, _solemart_word_target: GUIDE_WORD_TARGET,
      rank_math_focus_keyword: article.targetKeyword, rank_math_title: article.seoTitle, rank_math_description: article.metaDescription,
      rank_math_canonical_url: canonical, rank_math_facebook_title: article.seoTitle, rank_math_facebook_description: article.metaDescription,
      ...(featured ? { rank_math_facebook_image: featured.source_url } : {}),
    },
  }))
  if (!Number.isSafeInteger(value.id) || value.status !== 'draft') throw new Error('WordPress did not confirm a Buying Guide draft. No publish action was requested.')
  options.onProgress?.({ kind: 'created-guide-draft', id: value.id as number, slug: article.slug })
  return { status: 'DRAFT_CREATED', id: value.id, shoeIds: ids, editorUrl: `${base.origin}/wp-admin/post.php?post=${value.id}&action=edit`, report, published: false }
}
