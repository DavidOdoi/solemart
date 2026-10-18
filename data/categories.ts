export type Category = {
  title: string
  slug: string
  description: string
  image: string
  imageAlt: string
  intro: string
  guideSlugs: string[]
  productSlugs: string[]
  comparisonSlugs: string[]
  faqs: { question: string; answer: string }[]
}

const imageBase = 'https://images.unsplash.com/'

export const categories: Category[] = [
  {
    title: 'Walking Shoes',
    slug: 'walking-shoes',
    description: 'Comfort-first pairs for daily miles and travel.',
    image: `${imageBase}photo-1542291026-7eec264c27ff?w=900&q=85`,
    imageAlt: 'Walking shoes on a neutral background',
    intro: 'Compare walking shoes by fit, comfort, intended use, and the surfaces you walk on most.',
    guideSlugs: ['best-walking-shoes-for-men', 'best-shoes-for-standing-all-day'],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'brooks-ghost-15'],
    comparisonSlugs: ['walking-shoes-vs-running-shoes'],
    faqs: [{ question: 'How should walking shoes fit?', answer: 'Look for a secure heel, comfortable width, and enough space for your toes to move. Fit varies between brands and styles.' }],
  },
  {
    title: 'Running Shoes',
    slug: 'running-shoes',
    description: 'Explore shoes for your pace, distance, and routine.',
    image: `${imageBase}photo-1552674605-db6ffd4facb5?w=900&q=85`,
    imageAlt: 'Running shoes ready for a workout',
    intro: 'Explore running shoes by fit and intended use, then compare model-specific features that suit your routine.',
    guideSlugs: ['best-walking-shoes-for-men', 'best-shoes-for-standing-all-day'],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'brooks-ghost-15'],
    comparisonSlugs: ['walking-shoes-vs-running-shoes'],
    faqs: [{ question: 'Can I use the same running shoes for every run?', answer: 'That depends on your training and preferences. Consider fit, surface, and the kind of running you do.' }],
  },
  {
    title: 'Work Boots',
    slug: 'work-boots',
    description: 'Practical footwear for demanding workdays.',
    image: `${imageBase}photo-1605812860427-4024433a70fd?w=900&q=85`,
    imageAlt: 'Durable work footwear',
    intro: 'Work footwear needs depend on your job. Compare comfort and construction, and check whether your workplace requires specific safety features.',
    guideSlugs: ['best-shoes-for-standing-all-day', 'best-budget-sneakers'],
    productSlugs: ['bradley-canvas'],
    comparisonSlugs: ['walking-shoes-vs-running-shoes'],
    faqs: [{ question: 'Do work boots need safety features?', answer: 'Some jobs require protective footwear. Check your employer’s rules and the safety standards required for your workplace.' }],
  },
  {
    title: 'Sneakers',
    slug: 'sneakers',
    description: 'Everyday style and comfort for your rotation.',
    image: `${imageBase}photo-1525966222134-fcfa99b8ae77?w=900&q=85`,
    imageAlt: 'Classic everyday sneakers',
    intro: 'Find everyday sneakers by comparing fit, materials, care instructions, and how you plan to wear them.',
    guideSlugs: ['best-budget-sneakers', 'best-walking-shoes-for-men'],
    productSlugs: ['on-cloud-5', 'bradley-canvas'],
    comparisonSlugs: ['on-cloud-5-vs-brooks-ghost-15'],
    faqs: [{ question: 'What makes a sneaker comfortable for everyday wear?', answer: 'Comfort is personal. Start with a secure fit, room for your toes, and a style suited to your routine.' }],
  },
  {
    title: 'Shoes for Standing All Day',
    slug: 'shoes-for-standing-all-day',
    description: 'A starting point for long shifts and busy days.',
    image: `${imageBase}photo-1543508282-6319a3e2621f?w=900&q=85`,
    imageAlt: 'Comfortable shoes for a long day on your feet',
    intro: 'Compare shoes for long shifts by considering fit, cushioning, flooring, and any requirements for your work environment.',
    guideSlugs: ['best-shoes-for-standing-all-day', 'best-walking-shoes-for-men'],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'on-cloud-5'],
    comparisonSlugs: ['walking-shoes-vs-running-shoes'],
    faqs: [{ question: 'What features matter for standing all day?', answer: 'Fit, personal comfort, cushioning, and a sole suited to your workplace are useful things to compare.' }],
  },
  {
    title: 'Shoes for Plantar Fasciitis',
    slug: 'shoes-for-plantar-fasciitis',
    description: 'Learn what to look for when choosing supportive shoes.',
    image: `${imageBase}photo-1460353581641-37baddab0fa2?w=900&q=85`,
    imageAlt: 'Supportive shoes viewed from the side',
    intro: 'Footwear comfort varies from person to person. Compare fit and support options, and seek qualified advice for persistent foot pain.',
    guideSlugs: ['best-shoes-for-standing-all-day', 'best-walking-shoes-for-men'],
    productSlugs: ['new-balance-fresh-foam-1080v13', 'brooks-ghost-15'],
    comparisonSlugs: ['walking-shoes-vs-running-shoes'],
    faqs: [{ question: 'Can shoes treat plantar fasciitis?', answer: 'Shoes do not replace medical care. If you have foot pain or a health concern, consult a qualified healthcare professional for advice.' }],
  },
]
