export type BlogPost = {
  title: string
  slug: string
  category: string
  date: string
  excerpt: string
  paragraphs: string[]
}

export const blogPosts: BlogPost[] = [
  {
    title: 'How to Choose the Right Walking Shoes',
    slug: 'how-to-choose-walking-shoes',
    category: 'BUYING ADVICE',
    date: 'October 4, 2026',
    excerpt: 'A simple checklist for comparing fit, support, and cushioning before your next pair.',
    paragraphs: [
      'Start by thinking about where and how far you walk. Daily errands, travel, and longer walks may call for different features.',
      'Try shoes on with the socks you plan to wear. Check for a secure heel, comfortable width, and enough room for your toes to move.',
      'If you have persistent foot pain or a medical concern, ask a qualified healthcare professional for individual advice.',
    ],
  },
  {
    title: 'How Often Should You Replace Running Shoes?',
    slug: 'when-to-replace-running-shoes',
    category: 'RUNNING',
    date: 'September 28, 2026',
    excerpt: 'Mileage can help, but visible wear and changes in comfort are useful things to check too.',
    paragraphs: [
      'There is no single replacement schedule that fits every runner or shoe. Training surface, body mechanics, and shoe construction all affect wear.',
      'Inspect the outsole and upper regularly, and notice whether the shoe still feels comfortable and stable during your usual runs.',
      'For new or worsening pain, consider pausing activity and speaking with a qualified healthcare professional.',
    ],
  },
  {
    title: 'Are Expensive Shoes Worth It?',
    slug: 'are-expensive-shoes-worth-it',
    category: 'EXPLAINER',
    date: 'September 19, 2026',
    excerpt: 'A practical way to weigh price, fit, features, and how you plan to use a pair.',
    paragraphs: [
      'Price alone does not tell you whether a shoe is right for you. Fit, construction, intended use, and comfort are all worth comparing.',
      'Make a shortlist within your budget and check current retailer details, including return policies and availability.',
      'If two pairs meet your needs, the less expensive option may be the better choice for your budget.',
    ],
  },
]
