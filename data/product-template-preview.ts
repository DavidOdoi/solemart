import type { ProductPreview } from '@/lib/product-preview'

// Isolated design fixture. Never used as a fallback for WordPress product data.
export const productTemplatePreview: ProductPreview = {
  slug: 'design-example-shoe',
  name: 'Everyday Walking Shoe',
  brand: 'Example footwear',
  descriptionHtml: '<p>A complete product-page example for reviewing the layout, specifications and retailer buttons. All details on this preview are illustrative.</p>',
  image: {
    src: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=1200&q=85',
    alt: 'Illustrative sneaker photograph for the product layout preview',
  },
  specs: [
    { label: 'Category', value: 'Everyday walking — example' },
    { label: 'Weight', value: '260 g — illustrative specification' },
    { label: 'Heel-to-toe drop', value: '8 mm — illustrative specification' },
    { label: 'Width options', value: 'Standard / wide — example' },
    { label: 'Cushioning', value: 'Balanced — example' },
    { label: 'Upper', value: 'Breathable textile — example' },
    { label: 'Outsole', value: 'Rubber — example' },
    { label: 'Intended use', value: 'Daily walks, errands and travel — example' },
  ],
  pros: ['Space for clear fit and comfort highlights.', 'Reusable specifications in one readable matrix.', 'Retailer choices grouped in one place.'],
  cons: ['Fit and comfort vary by model and wearer.', 'Actual model specifications must be checked before publishing.'],
  commentaryHtml: '<p>This space displays the shoe’s reusable product notes. A published page can explain fit, intended use and practical trade-offs, with links to relevant guides.</p><p>This design example does not report hands-on testing or recommend a real product.</p>',
  // Empty destinations intentionally become disabled controls in preview mode.
  retailers: [{ name: 'Amazon', url: '' }, { name: 'Retailer two', url: '' }, { name: 'Brand store', url: '' }],
  retailerFieldsAvailable: true,
}
