export type Guide = {
  title: string
  slug: string
  seoTitle?: string
  metaDescription?: string
  category: string
  excerpt: string
  image: string
  imageAlt: string
  intro: string
  quickAnswerBody: string
  quickAnswerTitle: string
  advice: string[]
  productSlugs: string[]
  topPicks?: {
    productSlug: string
    cushioning: string
    widthOptions: string
    mainStrength: string
  }[]
  relatedGuideSlugs: string[]
  faqs: { question: string; answer: string }[]
  author?: string
  reviewedBy?: string
  updatedAt?: string
  disclosure?: string
  howWeChose?: string[]
  whoItsFor?: string[]
  mistakesToAvoid?: string[]
  finalVerdict?: string
  buyingGuideSections?: { heading: string; paragraphs: string[] }[]
}

const imageBase = 'https://images.unsplash.com/'

export const guides: Guide[] = [
  {
    title: 'Best Shoes for Standing All Day',
    slug: 'best-shoes-for-standing-all-day',
    seoTitle: 'Best Shoes for Standing All Day: Comfortable Picks',
    metaDescription: 'Compare shoes for long shifts by fit, cushioning, and workplace needs, with practical tips for choosing your next pair.',
    category: 'COMFORT GUIDE',
    excerpt: 'A practical starting point for comparing shoes for nurses, teachers, retail workers, and other long days on your feet.',
    image: `${imageBase}photo-1551107696-a4b0c5a0d9a2?w=1200&q=85`,
    imageAlt: 'Everyday shoes arranged for a footwear buying guide',
    intro: 'The right pair depends on your work surface, fit, and personal comfort preferences. Use this guide to compare features before choosing.',
    quickAnswerBody: 'Start with a comfortable fit, cushioning that feels right to you, and a stable sole suited to the surfaces where you work.',
    quickAnswerTitle: 'Quick Answer',
    advice: [
      'Try shoes later in the day, when feet may be slightly larger, and leave enough room to move your toes.',
      'Consider the flooring and conditions you encounter at work, including whether slip resistance or a protective toe is needed.',
      'Compare cushioning and support in person when possible; comfort is individual and fit varies by brand.',
    ],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'on-cloud-5', 'brooks-ghost-15'],
    topPicks: [
      { productSlug: 'new-balance-fresh-foam-1080v13', cushioning: 'Check current product specifications', widthOptions: 'Check current sizing and widths', mainStrength: 'Neutral running-shoe category' },
      { productSlug: 'on-cloud-5', cushioning: 'Check current product specifications', widthOptions: 'Check current sizing and widths', mainStrength: 'Everyday sneaker category' },
      { productSlug: 'brooks-ghost-15', cushioning: 'Check current product specifications', widthOptions: 'Check current sizing and widths', mainStrength: 'Neutral running-shoe category' },
    ],
    relatedGuideSlugs: ['best-walking-shoes-for-men', 'best-budget-sneakers'],
    faqs: [
      { question: 'What should I look for in shoes for standing all day?', answer: 'Prioritize a secure, comfortable fit, appropriate cushioning, and a sole suited to your workplace. Individual needs and preferences vary.' },
      { question: 'Should work shoes feel snug at first?', answer: 'They should feel secure without pinching. Leave toe room and follow the brand’s fit guidance; do not rely on a painful break-in period.' },
      { question: 'Can one pair of shoes work for every job?', answer: 'Not always. Some workplaces require specific safety or slip-resistant footwear, so check your employer’s requirements.' },
    ],
    author: 'SOLEMART Editorial Team',
    reviewedBy: 'Footwear Research Desk',
    updatedAt: '2026-10-10',
    disclosure: 'As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.',
    howWeChose: [
      'We focused on fit, cushioning, outsole feel, and the demands of long hours on your feet.',
      'We compared product details and retailer listings as research references; availability and specifications can change.',
      'These sample profiles are starting points for comparison, not claims of hands-on testing.',
    ],
    whoItsFor: ['People who spend much of the day standing or walking at work.', 'Readers comparing everyday comfort shoes for long shifts.'],
    mistakesToAvoid: ['Choosing by cushioning alone without checking fit and stability.', 'Ignoring workplace requirements such as slip resistance or protective toes.', 'Assuming a listed size or model detail is current without checking the retailer.'],
    buyingGuideSections: [{ heading: 'Fit and toe room', paragraphs: ['A secure heel and room for the toes are useful starting points. Try shoes on later in the day if your feet tend to swell, and compare width options when available.'] }, { heading: 'Match the work surface', paragraphs: ['Consider the flooring and conditions you encounter. Some jobs call for slip-resistant soles or protective features, so check workplace requirements before choosing.'] }],
    finalVerdict: 'Start with a comfortable fit and the needs of your work environment. Compare the shortlist, then confirm current sizing, features, and price with the retailer.',
  },
  {
    title: 'Best Walking Shoes for Men',
    slug: 'best-walking-shoes-for-men',
    seoTitle: 'Best Walking Shoes for Men: What to Compare',
    metaDescription: 'Compare walking shoes for fit, cushioning, and daily use, with a practical shortlist and buying advice.',
    category: 'WALKING GUIDE',
    excerpt: 'Compare fit, cushioning, and everyday features for walking, travel, and daily errands.',
    image: `${imageBase}photo-1514989940723-e8e51635b782?w=1200&q=85`,
    imageAlt: 'Walking shoes photographed for a buying guide',
    intro: 'Walking shoes should feel comfortable from the first try-on and suit how far and where you walk. These considerations can help narrow your options.',
    quickAnswerBody: 'Look for a comfortable fit with enough toe room, a sole that feels stable, and cushioning suited to your typical walks.',
    quickAnswerTitle: 'Quick Answer',
    advice: [
      'Think about the surfaces and distances you walk most often.',
      'Compare shoe width and toe-box shape as well as length.',
      'Check care instructions and outsole construction if you expect frequent use.',
    ],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'brooks-ghost-15'],
    topPicks: [
      { productSlug: 'new-balance-fresh-foam-1080v13', cushioning: 'Cushioned neutral profile', widthOptions: 'Check current size and width availability', mainStrength: 'Cushioned neutral-shoe category' },
      { productSlug: 'brooks-ghost-15', cushioning: 'Check current product specifications', widthOptions: 'Check current size and width availability', mainStrength: 'Neutral running-shoe category' },
    ],
    relatedGuideSlugs: ['best-shoes-for-standing-all-day', 'best-budget-sneakers'],
    faqs: [
      { question: 'What makes a shoe good for walking?', answer: 'Look for a secure fit, enough toe room, cushioning and support that feel comfortable to you, and an outsole suited to the surfaces you walk on.' },
      { question: 'Can I use running shoes for walking?', answer: 'Often, yes. Running shoes can work for walking if the fit, cushioning, stability, and outsole feel right for your routine.' },
      { question: 'What should I look for if I have wide feet?', answer: 'Check for dedicated width options and a toe box that does not pinch. Sizing up in length may not solve a width issue.' },
    ],
    author: 'SOLEMART Editorial Team',
    reviewedBy: 'Footwear Research Desk',
    updatedAt: '2026-10-10',
    disclosure: 'As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.',
  },
  {
    title: 'Best Budget Sneakers on Amazon',
    slug: 'best-budget-sneakers',
    seoTitle: 'Best Budget Sneakers on Amazon: Buying Guide',
    metaDescription: 'Learn what to compare when choosing affordable everyday sneakers, including fit, materials, returns, and current listing details.',
    category: 'VALUE GUIDE',
    excerpt: 'What to compare when shopping for versatile sneakers at a lower price point.',
    image: `${imageBase}photo-1495555961986-6d4c1ecb7be3?w=1200&q=85`,
    imageAlt: 'Casual sneakers for an everyday footwear guide',
    intro: 'A lower price does not have to mean a poor fit. Compare construction, comfort, return terms, and the intended use before you decide.',
    quickAnswerBody: 'Set a budget, check the retailer’s current return policy, and prioritize fit and intended use over appearance alone.',
    quickAnswerTitle: 'Quick Answer',
    advice: [
      'Check the available size and width options before ordering.',
      'Compare materials and care requirements with how often you plan to wear the shoes.',
      'Confirm current pricing, shipping, and return terms with the retailer.',
    ],
    productSlugs: ['bradley-canvas'],
    topPicks: [
      { productSlug: 'bradley-canvas', cushioning: 'Check current product specifications', widthOptions: 'Check current sizing and widths', mainStrength: 'Casual sneaker category' },
    ],
    relatedGuideSlugs: ['best-walking-shoes-for-men', 'best-shoes-for-standing-all-day'],
    faqs: [
      { question: 'Are inexpensive sneakers suitable for daily wear?', answer: 'That depends on fit, construction, and how you use them. Check product details and retailer policies before buying.' },
      { question: 'Do Amazon shoe prices stay the same?', answer: 'Prices and availability can change. Check the retailer listing for the latest details.' },
      { question: 'How should I compare budget sneakers?', answer: 'Compare fit, construction, intended use, and current retailer return terms alongside price.' },
    ],
    author: 'SOLEMART Editorial Team',
    reviewedBy: 'Footwear Research Desk',
    updatedAt: '2026-10-10',
    disclosure: 'As an Amazon Associate, SOLEMART may earn from qualifying purchases. Our recommendations are independently researched.',
  },
]
