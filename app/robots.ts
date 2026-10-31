import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/admin/',
        '/wp-admin/',
        '/wp-login.php',
        '/wp-json/',
        '/graphql',
        '/private/',
        '/sandbox/',
        '/template-preview/',
        '/search',
        '/*?s=',
        '/*?*&s=',
        '/*?preview=',
        '/*?*&preview=',
      ],
    },
    sitemap: 'https://thesolemart.com/sitemap.xml',
  }
}
