import type { BlogPost } from '../data/blog'
import type { Guide } from '../data/guides'
import type { Product } from '../data/products'

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
function text(value: unknown): string { return typeof value === 'string' ? value.trim().slice(0, 30000) : '' }
function rows(value: unknown): Record<string, unknown>[] { return Array.isArray(value) ? value.slice(0, 30).map(record) : [] }
function lines(value: unknown): string[] { return text(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean) }
function paragraphs(value: unknown): string[] { return text(value).split(/\r?\n\s*\r?\n/).map(item => item.trim()).filter(Boolean) }
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
    review: paragraphs(row.review),
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
      intro: text(fields.intro), author: text(fields.author), reviewedBy: text(fields.reviewedBy),
      updatedAt: post.modifiedAt, disclosure: text(fields.disclosure) || 'SOLEMART may earn a commission from qualifying purchases through links on this page.',
      quickAnswerTitle: text(fields.quickAnswerTitle) || 'Quick Answer', quickAnswerBody: text(fields.quickAnswerBody),
      advice: lines(fields.advice), howWeChose: lines(fields.howWeChose),
      whoItsFor: lines(fields.whoItsFor), mistakesToAvoid: lines(fields.mistakesToAvoid),
      finalVerdict: text(fields.finalVerdict), relatedGuideSlugs: [],
      productSlugs: products.map(product => product.slug),
      topPicks: productRows.map((row, index) => ({ productSlug: products[index].slug, cushioning: text(row.cushioning), widthOptions: text(row.widthOptions), mainStrength: text(row.mainStrength) })),
      buyingGuideSections: rows(fields.buyingGuideSections).map(row => ({ heading: text(row.heading), paragraphs: paragraphs(row.paragraphs) })).filter(row => row.heading && row.paragraphs.length),
      faqs: rows(fields.faqs).map(row => ({ question: text(row.question), answer: text(row.answer) })).filter(row => row.question && row.answer),
    },
  }
}
