export const brandGroups = [
  {
    title: 'Popular Brands',
    brands: [
      { name: 'Nike', slug: 'nike' },
      { name: 'Adidas', slug: 'adidas' },
      { name: 'New Balance', slug: 'new-balance' },
      { name: 'Puma', slug: 'puma' },
      { name: 'Reebok', slug: 'reebok' },
      { name: 'Skechers', slug: 'skechers' },
    ],
  },
  {
    title: 'Running & Performance',
    brands: [
      { name: 'Brooks', slug: 'brooks' },
      { name: 'HOKA', slug: 'hoka' },
      { name: 'ASICS', slug: 'asics' },
      { name: 'On', slug: 'on' },
      { name: 'Saucony', slug: 'saucony' },
      { name: 'Under Armour', slug: 'under-armour' },
    ],
  },
  {
    title: 'Everyday Favourites',
    brands: [
      { name: 'Converse', slug: 'converse' },
      { name: 'Vans', slug: 'vans' },
      { name: 'Jordan', slug: 'jordan' },
      { name: 'Crocs', slug: 'crocs' },
      { name: 'Birkenstock', slug: 'birkenstock' },
      { name: 'UGG', slug: 'ugg' },
    ],
  },
]

export const brands = brandGroups.flatMap((group) => group.brands)
  .sort((a, b) => a.name.localeCompare(b.name))
