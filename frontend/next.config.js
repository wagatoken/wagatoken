/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3001", "*.vercel.app"]
    }
  },
  images: {
    domains: ['violet-rainy-toad-577.mypinata.cloud'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.mypinata.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  }
}

module.exports = nextConfig


module.exports = nextConfig
