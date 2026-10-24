import type { BlogPost } from '../data/blog'
import type { Guide } from '../data/guides'
import type { Product } from '../data/products'
import { editorialPlainText, sanitizeEditorialHtml } from './cms-rich-text.ts'

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
function text(value: unknown): string { return typeof value === 'string' ? value.trim().slice(0, 30000) : '' }
function rows(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.slice(0, 30).map(record) : [] }
function lines(value: unknown): string[] { return text(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean) }
function paragraphs(value: unknown): string[] { return text(value).split(/\r?\n\s*\r?\n/).map(item => item.trim()).filter(Boolean) }
function richPlain(value: unknown): string { return editorialPlainText(text(value)) }
function richLines(value: unknown): string[] { return richPlain(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean) }
function richParagraphs(value: unknown): string[] { return richPlain(value).split(/\r?\n\s*\r?\n/).map(item => item.trim()).filter(Boolean) }
function safeUrl(value: unknown): string {
  try {
    const url = new URL(text(value))
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''
  } catch { return '' }
}
function imageUrl(value: unknown): string {
  const url = safeUrl(value)
  if (!url) return ''
  const parsed = new URL(url)
  return (parsed.hostname === 'cms.thesolemart.com' && parsed.pathname.startsWith('/wp-content/uploads/')) || parsed.hostname === 'images.unsplash.com' ? url : ''
}

/** The WordPress fields fill the original view models, without borrowing sample content. */
export function mapGuideFields(post: BlogPost, input: unknown): { guide: Guide; products: Product[] } {
  if (input !== null && input !== undefined && (typeof input !== 'object' || Array.isArray(input))) throw new Error('Invalid buying-guide template fields.')
  const fields = record(input)
  const productRows = rows(fields.products).filter(row => text(row.name)).slice(0, 4)
  const retailerUrls = productRows.map(row => safeUrl(row.affiliateUrl)).filter(Boolean)
  const products = productRows.map((row, index): Product => ({
    cmsManaged: true,
    name: text(row.name), slug: `${post.slug}-pick-${index + 1}`,
    badge: text(row.badge), image: imageUrl(row.image), imageAlt: text(row.imageAlt),
    affiliateUrl: safeUrl(row.affiliateUrl), reviewUrl: safeUrl(row.reviewUrl),
    shortReason: text(row.shortReason), bestFor: text(row.bestFor), avoidIf: text(row.avoidIf),
    description: text(row.description), pros: lines(row.pros), cons: lines(row.cons),
    specs: lines(row.specs).flatMap(line => {
      const separator = line.indexOf('|')
      return separator > 0 && line.slice(separator + 1).trim() ? [{ label: line.slice(0, separator).trim(), value: line.slice(separator + 1).trim() }] : []
    }),
    review: richParagraphs(row.review), reviewHtml: sanitizeEditorialHtml(text(row.review), 'paragraphs', retailerUrls),
  }))
  return {
    products,
    guide: {
      cmsManaged: true, contentHtml: post.contentHtml, publishedAt: post.publishedAt,
      title: post.title, slug: post.slug,
      seoTitle: text(fields.seoTitle) || post.title,
      metaDescription: text(fields.metaDescription) || post.excerpt,
      category: text(fields.category) || 'BUYING GUIDE', excerpt: post.excerpt,
      image: post.featuredImage?.src || '', imageAlt: post.featuredImage?.alt || '',
      intro: richPlain(fields.intro), introHtml: sanitizeEditorialHtml(text(fields.intro), 'paragraphs', retailerUrls),
      author: text(fields.author) || post.author || '', reviewedBy: text(fields.reviewedBy),
      updatedAt: post.modifiedAt, disclosure: text(fields.disclosure) || 'SOLEMART may earn a commission from qualifying purchases through links on this page.',
      quickAnswerTitle: text(fields.quickAnswerTitle) || 'Quick Answer', quickAnswerBody: text(fields.quickAnswerBody),
      advice: richLines(fields.advice), adviceHtml: sanitizeEditorialHtml(text(fields.advice), 'list', retailerUrls), howWeChose: lines(fields.howWeChose),
      whoItsFor: lines(fields.whoItsFor), mistakesToAvoid: lines(fields.mistakesToAvoid),
      finalVerdict: richPlain(fields.finalVerdict), finalVerdictHtml: sanitizeEditorialHtml(text(fields.finalVerdict), 'paragraphs', retailerUrls), relatedGuideSlugs: [],
      productSlugs: products.map(product => product.slug),
      topPicks: productRows.map((row, index) => ({ productSlug: products[index].slug, cushioning: text(row.cushioning), widthOptions: text(row.widthOptions), mainStrength: text(row.mainStrength) })),
      buyingGuideSections: rows(fields.buyingGuideSections).map(row => ({ heading: text(row.heading), paragraphs: paragraphs(row.paragraphs) })).filter(row => row.heading && row.paragraphs.length),
      faqs: rows(fields.faqs).map(row => ({ question: text(row.question), answer: richPlain(row.answer), answerHtml: sanitizeEditorialHtml(text(row.answer), 'paragraphs', retailerUrls) })).filter(row => row.question && row.answer),
    },
  }
}

/** Defaults alone must not replace an unmigrated guide's legacy recommendations. */
export function hasAcfGuideContent(input: unknown): boolean {
  const fields = record(input)
  if (['intro', 'quickAnswerBody', 'howWeChose', 'advice', 'whoItsFor', 'mistakesToAvoid', 'finalVerdict'].some(key => richPlain(fields[key]))) return true
  return [1, 2, 3, 4].some(index => text(record(record(fields[`pick${index}Shoe`]).node).id)
    || text(fields[`faq${index}Question`]) || richPlain(fields[`faq${index}Answer`]))
}

/** Combine four guide-specific slots with published, reusable Shoe records. */
export function mapAcfGuideFields(post: BlogPost, input: unknown, shoeInput: unknown[]): { guide: Guide; products: Product[] } {
  if (input !== null && input !== undefined && (typeof input !== 'object' || Array.isArray(input))) throw new Error('Invalid ACF buying-guide fields.')
  const fields = record(input)
  const shoes = new Map(shoeInput.map(value => {
    const shoe = record(value)
    return [text(shoe.id), shoe] as const
  }))
  const selected: Record<string, unknown>[] = []
  const products: Record<string, unknown>[] = []
  const seen = new Set<string>()
  for (const index of [1, 2, 3, 4]) {
    const reference = record(record(fields[`pick${index}Shoe`]).node)
    const id = text(reference.id)
    const shoe = shoes.get(id)
    if (reference.__typename !== 'Shoe' || !shoe || shoe.status !== 'publish' || !text(shoe.title) || !text(shoe.slug) || seen.has(id)) continue
    const values = record(shoe.solemartShoeFields)
    const image = record(record(shoe.featuredImage).node)
    seen.add(id)
    selected.push(shoe)
    products.push({
      name: text(shoe.title), image: image.sourceUrl, imageAlt: image.altText,
      affiliateUrl: values.affiliateUrl, reviewUrl: values.reviewUrl,
      description: values.description, pros: values.pros, cons: values.cons, specs: values.specs,
      cushioning: values.cushioning, widthOptions: values.widthOptions, mainStrength: values.mainStrength,
      badge: fields[`pick${index}Award`], shortReason: fields[`pick${index}Reason`],
      bestFor: fields[`pick${index}BestFor`], avoidIf: fields[`pick${index}AvoidIf`],
      review: richPlain(fields[`pick${index}Commentary`]) ? text(fields[`pick${index}Commentary`]) : text(values.commentary),
    })
  }
  const result = mapGuideFields(post, {
    ...fields, products,
    faqs: [1, 2, 3, 4].map(index => ({ question: fields[`faq${index}Question`], answer: fields[`faq${index}Answer`] })),
  })
  result.products.forEach((product, index) => {
    product.id = text(selected[index].id)
    product.slug = text(selected[index].slug)
    if (result.guide.topPicks?.[index]) result.guide.topPicks[index].productSlug = product.slug
  })
  result.guide.productSlugs = result.products.map(product => product.slug)
  return result
}
