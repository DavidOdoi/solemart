/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/template-preview/product', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }] }]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cms.thesolemart.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
}

export default nextConfig
