import { chooseWalkingShoesHtml } from './articles/choose-walking-shoes.ts'
import { replaceRunningShoesHtml } from './articles/replace-running-shoes.ts'
import { expensiveShoesHtml } from './articles/expensive-shoes.ts'

export type BlogPost = {
  title: string
  slug: string
  category: string
  date: string
  excerpt: string
  seoTitle?: string
  metaDescription?: string
  paragraphs: string[]
  publishedAt?: string
  modifiedAt?: string
  author?: string
  authorType?: 'Person' | 'Organization'
  authorProfile?: { bio?: string; avatarUrl?: string }
  contentHtml?: string
  featuredImage?: { src: string; alt: string; width: number; height: number; caption?: string }
}

export const blogPosts: BlogPost[] = [
  {
    title: 'How to Choose the Right Walking Shoes',
    slug: 'how-to-choose-walking-shoes',
    category: 'BUYING ADVICE',
    date: 'October 4, 2026',
    excerpt: 'A simple checklist for comparing fit, support, and cushioning before your next pair.',
    seoTitle: 'How to Choose Walking Shoes: Fit, Support & Comfort',
    metaDescription: 'Learn how to choose walking shoes with practical checks for toe room, heel fit, cushioning, grip, and comfort. Use a simple try-on checklist before buying.',
    author: 'SOLEMART', authorType: 'Organization', modifiedAt: '2026-10-31',
    paragraphs: [], contentHtml: chooseWalkingShoesHtml,
    featuredImage: {
      src: '/articles/choose-walking-shoes.png', width: 1672, height: 941,
      alt: 'Gray walking shoes with rounded toe boxes on a wooden bench beside a leafy path',
      caption: 'Start with comfortable toe room, a secure heel, and a sole suited to your daily walks.',
    },
  },
  {
    title: 'How Often Should You Replace Running Shoes?',
    slug: 'when-to-replace-running-shoes',
    category: 'RUNNING',
    date: 'September 28, 2026',
    excerpt: 'Mileage can help, but visible wear and changes in comfort are useful things to check too.',
    seoTitle: 'How Often Should You Replace Running Shoes? A Guide',
    metaDescription: 'Find out when to replace running shoes using mileage, outsole wear, cushioning, and fit. Learn what to inspect and why there is no fixed expiry date.',
    author: 'SOLEMART', authorType: 'Organization', modifiedAt: '2026-10-31',
    paragraphs: [], contentHtml: replaceRunningShoesHtml,
    featuredImage: {
      src: '/articles/replace-running-shoes.png', width: 1672, height: 941,
      alt: 'Navy running shoes with one outsole facing forward to show the tread',
      caption: 'Check the tread, upper, and heel alongside changes in comfort as your mileage builds.',
    },
  },
  {
    title: 'Are Expensive Shoes Worth It?',
    slug: 'are-expensive-shoes-worth-it',
    category: 'EXPLAINER',
    date: 'September 19, 2026',
    excerpt: 'A practical way to weigh price, fit, features, and how you plan to use a pair.',
    seoTitle: 'Are Expensive Shoes Worth It? How to Judge Value',
    metaDescription: 'Are expensive shoes worth it? Compare fit, materials, useful features, cost per wear, and return terms to decide when paying more makes sense for you.',
    author: 'SOLEMART', authorType: 'Organization', modifiedAt: '2026-10-31',
    paragraphs: [], contentHtml: expensiveShoesHtml,
    featuredImage: {
      src: '/articles/expensive-shoes.png', width: 1672, height: 941,
      alt: 'Off-white and charcoal athletic shoes displayed side by side on a neutral background',
      caption: 'A useful purchase starts with the right fit and features you will actually use.',
    },
  },
]
