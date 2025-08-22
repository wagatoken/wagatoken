/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
  },
  // Configure for Netlify deployment
  webpack: (config, { isServer }) => {
    // Fix for potential module resolution issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
}

module.exports = nextConfig
