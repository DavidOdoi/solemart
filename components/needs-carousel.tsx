import { ImageCarousel } from '@/components/image-carousel'
import type { Category } from '@/data/categories'

type CategoryPreview = Pick<Category, 'title' | 'slug' | 'image' | 'imageAlt'>

const ribbonLabels: Record<string, string> = {
  'walking-shoes': 'SHOP WALKING',
  'running-shoes': 'SHOP RUNNING',
  'work-boots': 'SHOP WORK',
  sneakers: 'SHOP SNEAKERS',
  'shoes-for-standing-all-day': 'ALL-DAY COMFORT',
  'shoes-for-plantar-fasciitis': 'FIND YOUR SUPPORT',
}


export function NeedsCarousel({ categories }: { categories: CategoryPreview[] }) {
  return <ImageCarousel
    id="needs"
    title="Styles Just For You"
    eyebrow="SHOP BY NEED"
    browseLabel="Explore shoe categories"
    browseHref="#shoe-finder-heading"
    itemLabel="Shoe categories"
    items={categories.map((category) => ({
      title: `Shop ${category.title}`,
      href: `/${category.slug}`,
      image: category.image,
      imageAlt: category.imageAlt,
      ribbon: ribbonLabels[category.slug] || 'FIND YOUR PAIR',
    }))}
  />
}
