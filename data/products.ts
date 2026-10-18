export type Product = {
  id?: string
  badge?: string
  seoTitle?: string
  metaDescription?: string
  author?: string
  reviewedBy?: string
  updatedAt?: string
  disclosure?: string
  name: string
  slug: string
  bestFor: string
  image: string
  imageAlt: string
  description: string
  pros: string[]
  cons: string[]
  specs: { label: string; value: string }[]
  review: string[]
  shortReason?: string
  priceLabel?: string
  affiliateUrl?: string
}

const imageBase = 'https://images.unsplash.com/'

export const products: Product[] = [
  {
    name: 'Fresh Foam 1080v13',
    slug: 'new-balance-fresh-foam-1080v13',
    id: 'new-balance-fresh-foam-1080v13',
    badge: 'Best for Cushioning',
    shortReason: 'A cushioned neutral-running option to compare for long days on your feet.',
    priceLabel: 'Check latest price',
    bestFor: 'A cushioned everyday option to compare',
    image: `${imageBase}photo-1552674605-db6ffd4facb5?w=900&q=85`,
    imageAlt: 'Running shoe shown in a product-style photograph',
    description: 'A sample product profile for the Fresh Foam 1080v13. Confirm current model details and availability with the retailer.',
    pros: ['Neutral running-shoe category', 'A cushioned profile to compare', 'One option to assess for your routine'],
    cons: ['Fit varies by wearer', 'Current model availability may vary', 'Confirm exact specifications with the retailer'],
    specs: [{ label: 'Category', value: 'Neutral running shoe' }, { label: 'Fit', value: 'Check current brand sizing' }, { label: 'Availability', value: 'Varies by retailer' }],
    review: ['Consider how the cushioning and fit feel for your intended use.', 'Compare sizing options and the current product details before ordering.'],
  },
  {
    name: 'Cloud 5 Everyday',
    slug: 'on-cloud-5',
    id: 'on-cloud-5',
    badge: 'Best Everyday Sneaker',
    shortReason: 'A lightweight everyday style for readers who want a casual option in the mix.',
    priceLabel: 'Check latest price',
    bestFor: 'A lightweight everyday sneaker to compare',
    image: `${imageBase}photo-1525966222134-fcfa99b8ae77?w=900&q=85`,
    imageAlt: 'Light-colored everyday sneaker',
    description: 'A sample product profile for the Cloud 5. Confirm the current model, sizing, and product details with the retailer.',
    pros: ['Everyday sneaker category', 'A style to compare for casual wear', 'Check current color and size availability'],
    cons: ['Fit varies by wearer', 'Current model availability may vary', 'Confirm exact specifications with the retailer'],
    specs: [{ label: 'Category', value: 'Everyday sneaker' }, { label: 'Fit', value: 'Check current brand sizing' }, { label: 'Availability', value: 'Varies by retailer' }],
    review: ['Try the shoe on and consider whether the shape suits your foot.', 'Check the retailer listing for the latest specifications and care instructions.'],
  },
  {
    name: 'Ghost 15 Neutral',
    slug: 'brooks-ghost-15',
    id: 'brooks-ghost-15',
    badge: 'Best for Walking',
    shortReason: 'A neutral running-shoe profile to compare for walking and daily routines.',
    priceLabel: 'Check latest price',
    bestFor: 'A neutral running shoe to compare',
    image: `${imageBase}photo-1542291026-7eec264c27ff?w=900&q=85`,
    imageAlt: 'Running shoe on a simple background',
    description: 'A sample product profile for the Ghost 15. Confirm current model details and availability with the retailer.',
    pros: ['Neutral running-shoe category', 'A running profile to compare', 'Check current size availability'],
    cons: ['Fit varies by wearer', 'Current model availability may vary', 'Confirm exact specifications with the retailer'],
    specs: [{ label: 'Category', value: 'Neutral running shoe' }, { label: 'Fit', value: 'Check current brand sizing' }, { label: 'Availability', value: 'Varies by retailer' }],
    review: ['Fit and running preferences are personal; use a try-on to compare comfort.', 'Check the product listing to confirm model year, features, and current price.'],
  },
  {
    name: 'Bradley Canvas',
    slug: 'bradley-canvas',
    id: 'bradley-canvas',
    badge: 'Casual Pick',
    shortReason: 'A simple canvas sneaker profile for casual wear and lighter daily use.',
    priceLabel: 'Check latest price',
    bestFor: 'A casual canvas sneaker to compare',
    image: `${imageBase}photo-1495555961986-6d4c1ecb7be3?w=900&q=85`,
    imageAlt: 'Casual canvas sneakers',
    description: 'A sample product profile for the Bradley Canvas. Confirm current model details and availability with the retailer.',
    pros: ['Casual sneaker category', 'Compare materials and care needs', 'Check current size availability'],
    cons: ['Fit varies by wearer', 'Current model availability may vary', 'Confirm exact specifications with the retailer'],
    specs: [{ label: 'Category', value: 'Casual sneaker' }, { label: 'Material', value: 'Check current product listing' }, { label: 'Availability', value: 'Varies by retailer' }],
    review: ['Consider where and how often you plan to wear a canvas sneaker.', 'Review sizing, material, and care details on the current retailer listing.'],
  },
]
