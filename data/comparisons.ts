export type Comparison = {
  title: string
  slug: string
  excerpt: string
  shortAnswer: string
  left: { name: string; chooseIf: string; strengths: string[] }
  right: { name: string; chooseIf: string; strengths: string[] }
  productSlugs: string[]
  relatedGuideSlugs: string[]
}

export const comparisons: Comparison[] = [
  {
    title: 'On Cloud 5 vs Brooks Ghost 15',
    slug: 'on-cloud-5-vs-brooks-ghost-15',
    excerpt: 'Compare an everyday sneaker and a neutral running shoe by intended use, fit, and current model details.',
    shortAnswer: 'These shoes are designed for different uses. Compare their fit and current specifications against the way you plan to wear them.',
    left: { name: 'On Cloud 5', chooseIf: 'you are comparing an everyday sneaker for casual wear.', strengths: ['Everyday sneaker category', 'Check current fit and model details'] },
    right: { name: 'Brooks Ghost 15', chooseIf: 'you are comparing a neutral running shoe for running use.', strengths: ['Neutral running-shoe category', 'Check current fit and model details'] },
    productSlugs: ['on-cloud-5', 'brooks-ghost-15'],
    relatedGuideSlugs: ['best-walking-shoes-for-men', 'best-budget-sneakers'],
  },
  {
    title: 'Walking Shoes vs Running Shoes',
    slug: 'walking-shoes-vs-running-shoes',
    excerpt: 'Understand how intended activity can shape your choice of walking or running shoes.',
    shortAnswer: 'Choose based on your main activity and personal fit. Walking and running models are designed with different intended uses, but comfort varies by shoe and wearer.',
    left: { name: 'Walking shoes', chooseIf: 'most of your miles are walks, errands, or travel.', strengths: ['Designed with walking in mind', 'Compare sole feel and everyday comfort'] },
    right: { name: 'Running shoes', chooseIf: 'you plan to run and want a model designed for that activity.', strengths: ['Designed for running use', 'Compare cushioning and fit by model'] },
    productSlugs: ['new-balance-fresh-foam-1080v13', 'brooks-ghost-15'],
    relatedGuideSlugs: ['best-walking-shoes-for-men', 'best-shoes-for-standing-all-day'],
  },
]
