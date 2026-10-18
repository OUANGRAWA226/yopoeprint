const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async redirects() {
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://yopoeprint-admin.vercel.app'
    return [
      {
        source: '/admin/:path*',
        destination: `${adminBase}/admin/:path*`,
        permanent: false,
      },
      {
        source: '/admin',
        destination: `${adminBase}/admin`,
        permanent: false,
      },
      {
        source: '/catalogue/cartes',
        destination: '/catalogue/cartes-de-visite',
        permanent: true,
      },
      {
        source: '/catalogue/baches',
        destination: '/catalogue/signaletique',
        permanent: true,
      },
    ]
  },
}

module.exports = withPWA(nextConfig)
