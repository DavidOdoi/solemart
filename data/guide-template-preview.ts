import { guides, type Guide } from '@/data/guides'
import { products, type Product } from '@/data/products'

// Design fixtures only. Published guides continue to use the WordPress adapter.
const originalGuide = guides.find(guide => guide.slug === 'best-walking-shoes-for-men')!
const originalAdvice = guides.find(guide => guide.slug === 'best-shoes-for-standing-all-day')!
const productOrder = [...new Set([...originalGuide.productSlugs, ...products.map(product => product.slug)])].slice(0, 4)

export const previewProducts: Product[] = productOrder.map(slug => {
  const product = products.find(item => item.slug === slug)!
  return {
    ...product,
    cmsManaged: true,
    id: `preview-${product.slug}`,
    slug: `preview-${product.slug}`,
    imageAlt: 'Illustrative footwear or activity photograph for the template preview',
    affiliateUrl: undefined,
    reviewUrl: undefined,
    avoidIf: 'You need a different fit or features than this model offers. Confirm the current model details before choosing.',
  }
})

export const previewGuide: Guide = {
  ...originalGuide,
  cmsManaged: true,
  publishedAt: '2026-10-09T12:00:00Z',
  disclosure: 'This is a design preview with sample copy and illustrative images. Published guides display the relevant affiliate disclosure in this position.',
  productSlugs: previewProducts.map(product => product.slug),
  topPicks: previewProducts.map((product, index) => ({
    productSlug: product.slug,
    cushioning: originalGuide.topPicks?.[index]?.cushioning || 'Compare the current cushioning profile',
    widthOptions: originalGuide.topPicks?.[index]?.widthOptions || 'Check current size and width availability',
    mainStrength: product.shortReason || product.bestFor,
  })),
  howWeChose: [
    'Compare fit, cushioning, outsole construction and intended use when building the shortlist.',
    'Document the sources behind product details and separate desk research from hands-on testing.',
    'This preview uses sample profiles to demonstrate the page layout; it does not report product testing.',
  ],
  contentHtml: '<h3>Start with your daily routine</h3><p>Think about how far you walk, the surfaces you use and the fit that feels comfortable to you. These considerations help explain how a longer article body sits within the existing buying-guide layout.</p><p>Check the manufacturer’s current fit guidance and the retailer’s return terms before choosing a pair. This paragraph demonstrates an inline <a href="/how-we-review">methodology link</a> inside the article body.</p>',
  buyingGuideSections: [
    { heading: 'Fit and toe room', paragraphs: ['Look for a secure heel and enough room to move your toes. Compare width options and toe-box shape as well as shoe length.', 'Try shoes with the socks you normally wear and assess comfort while walking, rather than relying on the size label alone.'] },
    { heading: 'Match your walking routine', paragraphs: ['Consider the surfaces and distances you walk most often. Compare cushioning, outsole construction and care requirements with that routine.'] },
  ],
  whoItsFor: ['Readers comparing shoes for daily walks, travel and errands.', 'People who want to compare fit, cushioning and available widths before choosing a pair.'],
  mistakesToAvoid: originalAdvice.mistakesToAvoid,
  faqs: [
    ...originalGuide.faqs,
    { question: 'How should I check the fit before keeping a pair?', answer: 'Follow the brand’s guidance, try the shoes with your usual socks and check toe room, heel security and comfort. Confirm the retailer’s current return terms.' },
  ],
  finalVerdict: 'Start with a comfortable fit and a shoe suited to the surfaces and distances you walk. Use the comparison and detailed profiles to narrow the options, then confirm current model details, sizing and retailer terms before buying.',
}
